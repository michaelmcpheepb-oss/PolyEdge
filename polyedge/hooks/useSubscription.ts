import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  
  // For now, hardcode to free
  // In production, this would fetch from Supabase
  useEffect(() => {
    const loadSubscription = async () => {
      if (!userId) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }
      
      try {
        // TODO: Fetch subscription from Supabase
        // const { data, error } = await supabase
        //   .from('subscriptions')
        //   .select('*')
        //   .eq('user_id', userId)
        //   .single();
        
        // For now, return free subscription
        setSubscription({
          user_id: userId,
          plan: 'free',
          updated_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error loading subscription:', error);
        setSubscription(null);
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
  
  return {
    subscription,
    isLoading,
    isPro,
    isTrial,
    daysLeftInTrial,
    plan: subscription?.plan || 'free',
  };
}