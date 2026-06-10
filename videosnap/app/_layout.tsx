// VideoSnap Layout — Root
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0F' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="generate" />
        <Stack.Screen name="player" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="paywall" />
      </Stack>
    </>
  )
}
