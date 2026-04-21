import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const AUTH_STORAGE_KEY = 'user_auth';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
}

// Initial state
export const initialAuthState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
};

// Sign up with email and password
export async function signUp(email: string, password: string, name?: string) {
  try {
    console.log('🔐 Signing up user:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0D0D1A&color=00D4AA`,
        },
      },
    });
    
    if (error) {
      console.error('❌ Sign up error:', error);
      Alert.alert('Sign Up Failed', error.message);
      throw error;
    }
    
    console.log('✅ Sign up successful:', data.user?.email);
    
    // Save to local storage
    if (data.user) {
      await saveAuthState({
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        },
        session: data.session,
        isLoading: false,
      });
    }
    
    return data;
  } catch (error) {
    console.error('💥 Sign up failed:', error);
    throw error;
  }
}

// Sign in with email and password
export async function signIn(email: string, password: string) {
  try {
    console.log('🔐 Signing in user:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      Alert.alert('Sign In Failed', error.message);
      throw error;
    }
    
    console.log('✅ Sign in successful:', data.user?.email);
    
    // Save to local storage
    if (data.user) {
      await saveAuthState({
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url,
          created_at: data.user.created_at,
        },
        session: data.session,
        isLoading: false,
      });
    }
    
    return data;
  } catch (error) {
    console.error('💥 Sign in failed:', error);
    throw error;
  }
}

// Sign out
export async function signOut() {
  try {
    console.log('🔐 Signing out');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
    
    // Clear local storage
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    
    console.log('✅ Sign out successful');
    return true;
  } catch (error) {
    console.error('💥 Sign out failed:', error);
    throw error;
  }
}

// Get current session
export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Get session error:', error);
      throw error;
    }
    
    return data.session;
  } catch (error) {
    console.error('💥 Get session failed:', error);
    return null;
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Get user error:', error);
      throw error;
    }
    
    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name,
        avatar_url: data.user.user_metadata?.avatar_url,
        created_at: data.user.created_at,
      };
    }
    
    return null;
  } catch (error) {
    console.error('💥 Get user failed:', error);
    return null;
  }
}

// Save auth state to local storage
async function saveAuthState(state: AuthState) {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
}

// Load auth state from local storage
export async function loadAuthState(): Promise<AuthState> {
  try {
    const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }
  
  return initialAuthState;
}

// Reset password
export async function resetPassword(email: string) {
  try {
    console.log('🔐 Resetting password for:', email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'polyedge://reset-password',
    });
    
    if (error) {
      console.error('❌ Reset password error:', error);
      Alert.alert('Reset Password Failed', error.message);
      throw error;
    }
    
    console.log('✅ Reset password email sent');
    Alert.alert('Check Your Email', 'Password reset instructions have been sent to your email.');
    return true;
  } catch (error) {
    console.error('💥 Reset password failed:', error);
    throw error;
  }
}

// Update user profile
export async function updateProfile(userId: string, updates: { name?: string; avatar_url?: string }) {
  try {
    console.log('🔐 Updating profile for:', userId);
    
    const { error } = await supabase.auth.updateUser({
      data: updates,
    });
    
    if (error) {
      console.error('❌ Update profile error:', error);
      throw error;
    }
    
    console.log('✅ Profile updated');
    
    // Update local storage
    const currentState = await loadAuthState();
    if (currentState.user) {
      await saveAuthState({
        ...currentState,
        user: {
          ...currentState.user,
          ...updates,
        },
      });
    }
    
    return true;
  } catch (error) {
    console.error('💥 Update profile failed:', error);
    throw error;
  }
}