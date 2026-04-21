import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '../constants/Colors';
import { StripeProviderWrapper } from '../services/stripe';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { handleStripeRedirect } from '../services/stripe';

const queryClient = new QueryClient();

export default function RootLayout() {
  // Handle deep links for Stripe checkout
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      
      // For now, use a mock userId - in production, get from auth
      const userId = 'user_mock_id';
      
      // Handle Stripe redirect
      handleStripeRedirect(event.url, userId);
    };
    
    // Get initial URL if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });
    
    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StripeProviderWrapper>
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
          <Stack.Screen 
            name="login" 
            options={{ 
              presentation: 'modal',
              headerShown: false,
            }} 
          />
        </Stack>
        </StripeProviderWrapper>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}