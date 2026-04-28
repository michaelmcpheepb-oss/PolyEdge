/**
 * admob.ts — Native implementation (iOS/Android only).
 * On web, Metro resolves admob.web.ts instead — this file is never bundled on web.
 *
 * All AdMob imports are inside function bodies (lazy require) so that even if
 * Metro accidentally includes this file, it won't crash at module-load time.
 */
import { Platform } from 'react-native';

const isDev = __DEV__;

export const AD_UNITS = {
  interstitial: isDev
    ? 'ca-app-pub-3940256099942544/1033173712' // Google test interstitial
    : 'ca-app-pub-3405935169217339/9207280523',
  rewarded: isDev
    ? 'ca-app-pub-3940256099942544/5224354917' // Google test rewarded
    : 'ca-app-pub-3405935169217339/9714321645',
  banner: isDev
    ? 'ca-app-pub-3940256099942544/6300978111'  // Google test banner
    : 'ca-app-pub-3405935169217339/8492964651',
};

// ── Interstitial Ad ───────────────────────────────────────────────────────────
export async function showInterstitialAd(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  return new Promise((resolve) => {
    const {
      InterstitialAd,
      AdEventType,
    } = require('react-native-google-mobile-ads');

    const interstitial = InterstitialAd.createForAdRequest(
      AD_UNITS.interstitial,
      {
        requestNonPersonalizedAdsOnly: false,
        keywords: ['prediction market', 'finance', 'cryptocurrency', 'sports betting'],
      },
    );

    const unsubClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => { unsubClosed(); unsubError(); resolve(true); },
    );
    const unsubError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      () => { unsubClosed(); unsubError(); resolve(true); }, // fail silently
    );
    interstitial.addAdEventListener(AdEventType.LOADED, () => {
      interstitial.show();
    });

    interstitial.load();
    setTimeout(() => resolve(true), 8000); // 8s timeout
  });
}

// ── Rewarded Ad ───────────────────────────────────────────────────────────────
export async function showRewardedAd(): Promise<boolean> {
  if (Platform.OS === 'web') return true;

  return new Promise((resolve) => {
    const {
      RewardedAd,
      RewardedAdEventType,
      AdEventType,
    } = require('react-native-google-mobile-ads');

    const rewarded = RewardedAd.createForAdRequest(
      AD_UNITS.rewarded,
      {
        requestNonPersonalizedAdsOnly: false,
        keywords: ['prediction market', 'finance', 'cryptocurrency'],
      },
    );

    let earned = false;

    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      resolve(earned);
    });
    rewarded.addAdEventListener(AdEventType.ERROR, () => {
      resolve(false);
    });
    rewarded.addAdEventListener(AdEventType.LOADED, () => {
      rewarded.show();
    });

    rewarded.load();
    setTimeout(() => resolve(false), 8000);
  });
}
