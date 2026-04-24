import { lazy, Suspense, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '../constants/Colors';
import * as Linking from 'expo-linking';
import { useUserStore } from '../stores/useUserStore';

// Heavy modules loaded only when first needed
const AuthSheet = lazy(() => import('../components/AuthSheet'));

const queryClient = new QueryClient();

export default function RootLayout() {
  const { setSession, setUser, isAuthSheetVisible, hideAuthSheet } = useUserStore();

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      if (event.url.includes('auth/callback')) {
        try {
          const { supabase } = await import('../lib/supabase');
          const { startTrial } = await import('../services/auth-magic');
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            if (data.session.user) {
              await startTrial(data.session.user.id);
            }
          }
        } catch (error) {
          console.error('Auth callback error:', error);
        }
      }
      const { handleStripeRedirect } = await import('../services/stripe');
      handleStripeRedirect(event.url, 'user_mock_id');
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, [setSession, setUser]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    import('../lib/supabase').then(({ supabase }) => {
      import('../services/auth-magic').then(({ startTrial }) => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (event === 'SIGNED_IN' && session?.user) {
              await startTrial(session.user.id);
            }
          }
        );
        unsubscribe = () => authListener?.subscription.unsubscribe();
      });
    });

    return () => unsubscribe?.();
  }, [setSession, setUser]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
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
              options={{ presentation: 'fullScreenModal', headerShown: false }}
            />
            <Stack.Screen
              name="login"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
          <Suspense fallback={null}>
            {isAuthSheetVisible && (
              <AuthSheet visible={isAuthSheetVisible} onClose={hideAuthSheet} />
            )}
          </Suspense>
        </>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
