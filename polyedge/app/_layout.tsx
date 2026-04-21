import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '../constants/Colors';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="market/[id]" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Market Details',
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.textPrimary,
            }} 
          />
          <Stack.Screen 
            name="trader/[wallet]" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Trader Profile',
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.textPrimary,
            }} 
          />
          <Stack.Screen 
            name="alerts/create" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Create Alert',
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.textPrimary,
            }} 
          />
          <Stack.Screen 
            name="pro" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Go Pro',
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.textPrimary,
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Settings',
              headerStyle: { backgroundColor: Colors.surface },
              headerTintColor: Colors.textPrimary,
            }} 
          />
          <Stack.Screen 
            name="onboarding" 
            options={{ 
              presentation: 'fullScreenModal',
              headerShown: false,
            }} 
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}