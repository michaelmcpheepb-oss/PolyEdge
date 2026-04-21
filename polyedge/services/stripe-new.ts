import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';

const STRIPE_PRICES = {
  weekly: 'price_1TOfxD2F8prHOW8KHwDF8vQB',   // €2.50/week
  monthly: 'price_1TOfvW2F8prHOW8KRP72v1Zu', // €9.99/month
};

export async function openStripeCheckout(
  plan: 'weekly' | 'monthly',
  userId: string
): Promise<void> {
  const priceId = STRIPE_PRICES[plan];
  const checkoutUrl =
    `https://buy.stripe.com/[PAYMENT_LINK_ID]` +
    `?client_reference_id=${userId}`;

  try {
    await WebBrowser.openBrowserAsync(checkoutUrl, {
      dismissButtonStyle: 'close',
      presentationStyle:
        WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
    });
    await refreshSubscriptionStatus(userId);
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
}

export async function refreshSubscriptionStatus(
  userId: string
) {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, trial_ends_at, period_end')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function startTrial(userId: string) {
  console.log('🔐 Starting trial for user:', userId);
  
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan: 'free',
      trial_ends_at: trialEnd.toISOString(),
    }, { onConflict: 'user_id' });
    
  if (error) {
    console.error('❌ Start trial error:', error);
    throw error;
  }
  
  console.log('✅ Trial started until:', trialEnd.toISOString());
}

// Handle Stripe redirect (for deep linking)
export async function handleStripeRedirect(url: string, userId: string) {
  console.log('🔗 Handling Stripe redirect:', url);
  
  if (url.includes('payment-success')) {
    // Update subscription status in Supabase
    try {
      await refreshSubscriptionStatus(userId);
      console.log('✅ Payment successful, subscription updated');
    } catch (error) {
      console.error('❌ Failed to update subscription:', error);
    }
  } else if (url.includes('payment-cancel')) {
    console.log('❌ Payment cancelled by user');
  }
}