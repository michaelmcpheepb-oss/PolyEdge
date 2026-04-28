// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ── 1. Ensure web platform extensions are resolved first ──────────────────────
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// ── 2. Custom resolver: block native-only modules on web ─────────────────────
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Stub out Stripe (native-only) and its internal native modules
    if (
      moduleName.includes('@stripe/stripe-react-native') ||
      moduleName.includes('stripe-react-native') ||
      moduleName.includes('codegenNativeComponent') ||
      moduleName.includes('NativeStripeSdk')
    ) {
      return { type: 'empty' };
    }

    // react-native-svg was removed from components; block it here as safety net
    if (moduleName === 'react-native-svg') {
      return { type: 'empty' };
    }

    // AdMob — native-only, crashes on web
    if (moduleName === 'react-native-google-mobile-ads') {
      return { type: 'empty' };
    }
  }

  // Default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

// ── 3. Force CommonJS for zustand (ESM-only packages break Metro on web) ──────
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'require',
  'default',
  'react-native',
  'browser',
];

module.exports = config;
