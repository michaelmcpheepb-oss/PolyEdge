import { useQuery } from '@tanstack/react-query';
import { refreshSubscriptionStatus } from '../services/stripe-new';
import { useUserStore } from '../stores/useUserStore';

export function useSubscription() {
  const { user } = useUserStore();
  
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('No user ID');
      return refreshSubscriptionStatus(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000, // 5 minutes
  });
}

export function useIsPro(): boolean {
  const { data } = useSubscription();
  
  if (!data) return false;
  
  const trialActive = data.trial_ends_at
    ? new Date(data.trial_ends_at) > new Date()
    : false;
    
  return data.plan === 'pro' || trialActive;
}