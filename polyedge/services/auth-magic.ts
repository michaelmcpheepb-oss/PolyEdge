import { supabase } from './supabase'

export async function sendMagicLink(email: string) {
  console.log('🔐 Sending magic link to:', email);
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'polyedge://auth/callback',
    },
  });
  
  if (error) {
    console.error('❌ Magic link error:', error);
    throw error;
  }
  
  console.log('✅ Magic link sent successfully');
}

export async function signOut() {
  console.log('🔐 Signing out');
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
  
  console.log('✅ Signed out successfully');
}

export async function getSession() {
  console.log('🔐 Getting session');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('❌ Get session error:', error);
    throw error;
  }
  
  console.log('✅ Session retrieved:', session ? 'yes' : 'no');
  return session;
}

export async function getUser() {
  console.log('🔐 Getting user');
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('❌ Get user error:', error);
    throw error;
  }
  
  console.log('✅ User retrieved:', user ? user.email : 'none');
  return user;
}

export async function refreshSubscriptionStatus(userId: string) {
  console.log('🔐 Refreshing subscription for user:', userId);
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan, trial_ends_at, period_end')
    .eq('user_id', userId)
    .single();
    
  if (error) {
    console.error('❌ Refresh subscription error:', error);
    throw error;
  }
  
  console.log('✅ Subscription status:', data?.plan || 'none');
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