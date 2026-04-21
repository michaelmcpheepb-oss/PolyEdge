import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { Alert, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const API_URL = 'http://localhost:3001/api'; // Backend API URL for Stripe

// Product and price IDs for PolyEdge Pro (TEST MODE)
const PRODUCT_IDS = {
  PRO_WEEKLY: 'price_1TOfxD2F8prHOW8KHwDF8vQB',   // €2.50/week
  PRO_MONTHLY: 'price_1TOfvW2F8prHOW8KRP72v1Zu', // €9.99/month
};

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  description: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'pro_weekly',
    name: 'PolyEdge Pro Weekly',
    price: 2.50,
    interval: 'week',
    stripePriceId: PRODUCT_IDS.PRO_WEEKLY,
    description: '€2.50 per week',
  },
  {
    id: 'pro_monthly',
    name: 'PolyEdge Pro Monthly',
    price: 9.99,
    interval: 'month',
    stripePriceId: PRODUCT_IDS.PRO_MONTHLY,
    description: '€9.99 per month',
  },
  // Optional: Add yearly plan later
  // {
  //   id: 'pro_yearly',
  //   name: 'PolyEdge Pro Yearly',
  //   price: 79.99,
  //   interval: 'year',
  //   stripePriceId: PRODUCT_IDS.PRO_YEARLY,
  //   description: '€79.99 per year (Save 33%)',
  // },
];

export async function createCheckoutSession(
  priceId: string,
  userId: string,
  customerEmail?: string
): Promise<string | null> {
  try {
    console.log('Creating checkout session for price:', priceId);
    
    const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId);
    
    if (!plan) {
      throw new Error('Invalid price ID');
    }
    
    // For test mode: Create direct Stripe checkout link
    // In production, you would call your backend API
    const checkoutParams = new URLSearchParams({
      'client_reference_id': userId,
      'prefilled_email': customerEmail || '',
      'success_url': 'polyedge://payment-success',
      'cancel_url': 'polyedge://payment-cancel',
    });
    
    // Create direct Stripe checkout URL
    const checkoutUrl = `https://checkout.stripe.com/c/pay/${priceId}?${checkoutParams.toString()}`;
    
    console.log('Generated Stripe checkout URL:', checkoutUrl);
    return checkoutUrl;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    Alert.alert('Error', 'Failed to create checkout session. Please try again.');
    return null;
  }
}

export async function openStripeCheckout(url: string) {
  try {
    console.log('Opening Stripe checkout:', url);
    
    const result = await WebBrowser.openBrowserAsync(url, {
      toolbarColor: '#0D0D1A',
      secondaryToolbarColor: '#1A1A2E',
      controlsColor: '#00D4AA',
      dismissButtonStyle: 'close',
      enableBarCollapsing: true,
    });
    
    console.log('WebBrowser result:', result);
    
    // Check if checkout was successful
    if (result.type === 'dismiss') {
      // User closed the browser
      return { success: false, message: 'Checkout cancelled' };
    }
    
    // In production, you would verify the payment with your backend
    return { success: true, message: 'Payment successful!' };
  } catch (error) {
    console.error('Error opening Stripe checkout:', error);
    Alert.alert('Error', 'Failed to open payment page. Please try again.');
    return { success: false, message: 'Failed to open payment page' };
  }
}

export async function handleStripeRedirect(url: string, userId: string) {
  // Handle deep linking from Stripe checkout
  console.log('Handling Stripe redirect:', url);
  
  if (url.includes('payment-success')) {
    // Payment successful - update subscription in Supabase
    console.log('✅ Payment successful, updating subscription for user:', userId);
    
    try {
      // Update user's subscription in Supabase
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: 'pro',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error('❌ Error updating subscription:', error);
        Alert.alert('Error', 'Payment successful but failed to update subscription. Please contact support.');
        return { success: false, error: 'Failed to update subscription' };
      }
      
      console.log('✅ Subscription updated in Supabase');
      Alert.alert('Success!', 'Your PolyEdge Pro subscription is now active.');
      return { success: true };
    } catch (error) {
      console.error('❌ Error handling successful payment:', error);
      Alert.alert('Error', 'Payment successful but something went wrong. Please contact support.');
      return { success: false, error: 'Failed to process payment' };
    }
  } else if (url.includes('payment-cancel')) {
    // Payment cancelled
    console.log('❌ Payment cancelled by user');
    Alert.alert('Cancelled', 'Your payment was cancelled.');
    return { success: false, cancelled: true };
  }
  
  console.log('⚠️ Unknown redirect URL:', url);
  return { success: false };
}

export async function getCustomerPortalUrl(userId: string): Promise<string | null> {
  try {
    // Get customer portal URL from your backend
    const response = await fetch(`${API_URL}/stripe/customer-portal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get customer portal URL');
    }
    
    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error getting customer portal:', error);
    return null;
  }
}

export async function checkSubscriptionStatus(userId: string): Promise<{
  isActive: boolean;
  plan: string | null;
  currentPeriodEnd: string | null;
}> {
  try {
    // Check subscription status in Supabase
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking subscription:', error);
      return { isActive: false, plan: null, currentPeriodEnd: null };
    }
    
    if (!subscription) {
      return { isActive: false, plan: null, currentPeriodEnd: null };
    }
    
    const isActive = subscription.plan === 'pro' && 
      (!subscription.period_end || new Date(subscription.period_end) > new Date());
    
    return {
      isActive,
      plan: subscription.plan,
      currentPeriodEnd: subscription.period_end,
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { isActive: false, plan: null, currentPeriodEnd: null };
  }
}

// Stripe Provider component wrapper
export function StripeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.polyedge"
      urlScheme="polyedge"
    >
      {children}
    </StripeProvider>
  );
}

// Hook for using Stripe
export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const initializePaymentSheet = async (amount: number, currency: string = 'eur') => {
    try {
      // Initialize payment sheet with your backend
      const response = await fetch(`${API_URL}/stripe/payment-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency }),
      });
      
      const { paymentIntent, ephemeralKey, customer } = await response.json();
      
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'PolyEdge',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: false,
        defaultBillingDetails: {
          name: 'Customer Name',
        },
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
      return false;
    }
  };
  
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();
    
    if (error) {
      console.error('Error presenting payment sheet:', error);
      return { success: false, error };
    }
    
    return { success: true };
  };
  
  return {
    initializePaymentSheet,
    openPaymentSheet,
  };
}