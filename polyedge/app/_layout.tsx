import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '../constants/Colors';
// Stripe is handled client-side via WebBrowser
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { handleStripeRedirect } from '../services/stripe';
import { supabase } from '../lib/supabase';
import { useUserStore } from '../stores/useUserStore';
import { startTrial } from '../services/auth-magic';
import AuthSheet from '../components/AuthSheet';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { setSession, setUser, isAuthSheetVisible, hideAuthSheet } = useUserStore();
  
  // Handle deep links for Stripe checkout and auth
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      console.log('🔗 Deep link received:', event.url);
      
      // Handle auth callback
      if (event.url.includes('auth/callback')) {
        try {
          // For magic link callback, we need to get the session
        const { data } = await supabase.auth.getSession();
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            
            // Start trial for new users
            if (data.session.user) {
              await startTrial(data.session.user.id);
            }
          }
        } catch (error) {
          console.error('Auth callback error:', error);
        }
      }
      
      // Handle Stripe redirect
      // For now, use a mock userId - in production, get from auth
      const userId = 'user_mock_id';
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
  }, [setSession, setUser]);
  
  // Listen to auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Start trial for new users
          await startTrial(session.user.id);
        }
      }
    );
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setSession, setUser]);
  
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* Stripe is handled client-side via WebBrowser */}
        <>
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
            
            <AuthSheet 
              visible={isAuthSheetVisible}
              onClose={hideAuthSheet}
            />
        </>
        {/* End Stripe wrapper */}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}