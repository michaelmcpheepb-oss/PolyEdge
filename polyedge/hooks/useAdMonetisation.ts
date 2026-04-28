import { useState, useEffect } from 'react';
import {
  getMonetisationConfig,
  getDailyAnalysisCount,
  incrementDailyAnalysisCount,
  canRunFreeAnalysis,
  type MonetisationConfig,
} from '../services/geoMonetisation';
import { showInterstitialAd, showRewardedAd } from '../services/admob';
import { useIsPro } from './useSubscription';

export type AnalysisGateResult =
  | 'proceed'   // show analysis
  | 'paywall'   // show paywall
  | 'ad_failed'; // rewarded ad failed

export function useAdMonetisation() {
  const isPro = useIsPro();
  const [config,     setConfig]     = useState<MonetisationConfig | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      getMonetisationConfig(),
      getDailyAnalysisCount(),
    ]).then(([cfg, count]) => {
      setConfig(cfg);
      setDailyCount(count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  /**
   * Call this when the user taps "Generate Analysis".
   * Handles the full monetisation gate:
   *  - Pro users: proceed immediately (no ads)
   *  - Tier 3: show interstitial, then proceed
   *  - Tier 1/2 within limit: show interstitial, then proceed
   *  - Tier 1/2 at limit: show rewarded ad; if earned → proceed, else paywall
   *  - Tier 1/2 over limit: paywall
   */
  const requestAnalysis = async (): Promise<AnalysisGateResult> => {
    if (!config) return 'proceed'; // config not loaded yet — allow

    const gate = await canRunFreeAnalysis(config, isPro);

    if (gate === 'paywall') return 'paywall';

    if (gate === 'rewarded') {
      const earned = await showRewardedAd();
      if (!earned) return 'paywall';
      await incrementDailyAnalysisCount();
      setDailyCount((c) => c + 1);
      return 'proceed';
    }

    // gate === 'free'
    if (!isPro) {
      // Show interstitial before every free analysis (all tiers)
      await showInterstitialAd();
    }

    await incrementDailyAnalysisCount();
    setDailyCount((c) => c + 1);
    return 'proceed';
  };

  const remainingFree = config
    ? Math.max(0, config.dailyLimit - dailyCount)
    : 0;

  return {
    config,
    loading,
    dailyCount,
    remainingFree,
    isPro,
    requestAnalysis,
  };
}
