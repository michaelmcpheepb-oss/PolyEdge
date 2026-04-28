/**
 * admob.web.ts — Web stub. AdMob is native-only.
 * Metro resolves this file instead of admob.ts on web platform.
 * All ad functions return immediately so analysis proceeds without ads.
 */
import { Platform } from 'react-native';

export const AD_UNITS = {
  interstitial: 'web-stub',
  rewarded:     'web-stub',
  banner:       'web-stub',
};

/** On web: skip interstitial, return true (allow analysis). */
export async function showInterstitialAd(): Promise<boolean> {
  return true;
}

/** On web: skip rewarded, return true (grant reward). */
export async function showRewardedAd(): Promise<boolean> {
  return true;
}

/** On web: BannerAd is a no-op View. */
export { Platform }; // re-export so import sites don't break
