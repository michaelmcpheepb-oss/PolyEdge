import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { checkSubscriptionStatus, SUBSCRIPTION_PLANS } from '../services/stripe';

export interface Subscription {
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: 'free' | 'pro';
  trial_ends_at?: string;
  period_end?: string;
  updated_at: string;
}

export function useSubscription(userId?: string) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadSubscription = async () => {
      if (!userId) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }
      
      try {
        // Check subscription status from Stripe/Supabase
        const status = await checkSubscriptionStatus(userId);
        
        if (status.isActive) {
          setSubscription({
            user_id: userId,
            plan: 'pro',
            period_end: status.currentPeriodEnd || undefined,
            updated_at: new Date().toISOString(),
          });
        } else {
          setSubscription({
            user_id: userId,
            plan: 'free',
            updated_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
        setSubscription({
          user_id: userId,
          plan: 'free',
          updated_at: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscription();
  }, [userId]);
  
  const isPro = subscription?.plan === 'pro';
  const isTrial = subscription?.trial_ends_at 
    ? new Date(subscription.trial_ends_at) > new Date()
    : false;
  
  const daysLeftInTrial = isTrial && subscription?.trial_ends_at
    ? Math.ceil((new Date(subscription.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  // Get subscription plans
  const getPlanById = (planId: string) => {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  };
  
  const getPlanByStripePriceId = (priceId: string) => {
    return SUBSCRIPTION_PLANS.find(plan => plan.stripePriceId === priceId);
  };
  
  return {
    subscription,
    isLoading,
    isPro,
    isTrial,
    daysLeftInTrial,
    plan: subscription?.plan || 'free',
    plans: SUBSCRIPTION_PLANS,
    getPlanById,
    getPlanByStripePriceId,
  };
}