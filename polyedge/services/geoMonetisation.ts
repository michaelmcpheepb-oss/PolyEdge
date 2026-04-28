import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Country tier definitions ──────────────────────
const TIER1_COUNTRIES = [
  'US','GB','CA','AU','DE','FR','NL','SE','NO','DK',
  'FI','CH','AT','BE','IE','NZ','SG','JP','KR','HK',
  'LU','IS','LI','MC','AE','QA','KW','BH',
];

const TIER2_COUNTRIES = [
  'PL','CZ','HU','RO','BG','HR','SK','SI','EE','LV',
  'LT','BR','MX','AR','CL','CO','PE','UY','CR','PA',
  'SA','IL','ZA','TH','MY','TR','GR','PT','ES','IT',
  'CN','TW','RU','UA','RS','BA','MK','AL','ME',
];

export type CountryTier = 1 | 2 | 3;

export interface MonetisationConfig {
  tier: CountryTier;
  countryCode: string;
  dailyLimit: number;       // max free analyses per day
  proPriceMonthly: string;  // e.g. '€9.99'
  showPaywall: boolean;     // false for tier 3
  proStripePriceId: string;
}

const TIER_CONFIG: Record<CountryTier, Omit<MonetisationConfig, 'tier' | 'countryCode'>> = {
  1: {
    dailyLimit: 3,
    proPriceMonthly: '€9.99',
    showPaywall: true,
    proStripePriceId: 'price_[MONTHLY_PRICE_ID]',
  },
  2: {
    dailyLimit: 5,
    proPriceMonthly: '€4.99',
    showPaywall: true,
    proStripePriceId: 'price_[TIER2_PRICE_ID]',
  },
  3: {
    dailyLimit: 999,
    proPriceMonthly: '€9.99',
    showPaywall: false,
    proStripePriceId: 'price_[MONTHLY_PRICE_ID]',
  },
};

// ── In-memory cache (cleared on app restart) ──────
let cachedConfig: MonetisationConfig | null = null;

export async function getMonetisationConfig(): Promise<MonetisationConfig> {
  if (cachedConfig) return cachedConfig;

  // Check AsyncStorage cache (valid 24h)
  try {
    const cached = await AsyncStorage.getItem('monetisation_config');
    if (cached) {
      const parsed = JSON.parse(cached);
      const age = Date.now() - parsed.cachedAt;
      if (age < 24 * 60 * 60 * 1000) {
        cachedConfig = parsed.config;
        return cachedConfig!;
      }
    }
  } catch {
    // ignore storage errors
  }

  try {
    const res = await fetch('https://ipapi.co/json/', {
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json();
    const code: string = data.country_code ?? 'US';

    let tier: CountryTier = 3;
    if (TIER1_COUNTRIES.includes(code)) tier = 1;
    else if (TIER2_COUNTRIES.includes(code)) tier = 2;

    const config: MonetisationConfig = {
      tier,
      countryCode: code,
      ...TIER_CONFIG[tier],
    };

    await AsyncStorage.setItem(
      'monetisation_config',
      JSON.stringify({ config, cachedAt: Date.now() }),
    );

    cachedConfig = config;
    return config;
  } catch {
    // Default to Tier 1 if detection fails
    const config: MonetisationConfig = {
      tier: 1,
      countryCode: 'US',
      ...TIER_CONFIG[1],
    };
    cachedConfig = config;
    return config;
  }
}

// ── Daily analysis counter ────────────────────────
const getDayKey = () => {
  const d = new Date();
  return `analyses_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
};

export async function getDailyAnalysisCount(): Promise<number> {
  try {
    const val = await AsyncStorage.getItem(getDayKey());
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export async function incrementDailyAnalysisCount(): Promise<number> {
  const key = getDayKey();
  const current = await getDailyAnalysisCount();
  const next = current + 1;
  try {
    await AsyncStorage.setItem(key, String(next));
  } catch {
    // ignore
  }
  return next;
}

export async function canRunFreeAnalysis(
  config: MonetisationConfig,
  isPro: boolean,
): Promise<'free' | 'rewarded' | 'paywall'> {
  if (isPro) return 'free';
  if (!config.showPaywall) return 'free'; // Tier 3 — unlimited

  const count = await getDailyAnalysisCount();
  if (count < config.dailyLimit) return 'free';
  if (count === config.dailyLimit) return 'rewarded';
  return 'paywall';
}
