// 🧪 TEST ENTRY POINT — Ultra-minimal root layout
// Run with: npx expo start --clear
// Then manually rename this to _layout.tsx to test

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function MinimalRootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
