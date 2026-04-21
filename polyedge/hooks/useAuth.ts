import { useState, useEffect, useCallback } from 'react';
import { 
  AuthState, 
  User, 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  getCurrentSession,
  loadAuthState,
  resetPassword,
  updateProfile,
  initialAuthState,
} from '../services/auth';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize auth
  useEffect(() => {
    initializeAuth();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    if (!authState.user) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          const user = await getCurrentUser();
          setAuthState({
            user,
            session,
            isLoading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
          });
        } else if (event === 'USER_UPDATED') {
          const user = await getCurrentUser();
          setAuthState(prev => ({
            ...prev,
            user,
          }));
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [authState.user]);

  const initializeAuth = async () => {
    try {
      setIsInitializing(true);
      
      // Load from local storage first (for quick UI)
      const storedState = await loadAuthState();
      setAuthState(storedState);
      
      // Then check current session
      const session = await getCurrentSession();
      const user = await getCurrentUser();
      
      if (user && session) {
        setAuthState({
          user,
          session,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('💥 Auth initialization failed:', error);
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSignUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await signUp(email, password, name);
      
      // Update state
      if (result.user) {
        const user = await getCurrentUser();
        setAuthState({
          user,
          session: result.session,
          isLoading: false,
        });
      }
      
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      const result = await signIn(email, password);
      
      // Update state
      if (result.user) {
        const user = await getCurrentUser();
        setAuthState({
          user,
          session: result.session,
          isLoading: false,
        });
      }
      
      return result;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await signOut();
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
      });
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const handleResetPassword = useCallback(async (email: string) => {
    try {
      return await resetPassword(email);
    } catch (error) {
      throw error;
    }
  }, []);

  const handleUpdateProfile = useCallback(async (updates: { name?: string; avatar_url?: string }) => {
    try {
      if (!authState.user) throw new Error('No user logged in');
      
      setAuthState(prev => ({ ...prev, isLoading: true }));
      await updateProfile(authState.user.id, updates);
      
      // Update local state
      const user = await getCurrentUser();
      setAuthState(prev => ({
        ...prev,
        user,
        isLoading: false,
      }));
      
      return true;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [authState.user]);

  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, []);

  return {
    // State
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading || isInitializing,
    isAuthenticated: !!authState.user,
    
    // Actions
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    refreshAuth,
    
    // Initialization
    isInitializing,
  };
}

// Hook for protected routes
export function useProtectedRoute(redirectToLogin = true) {
  const { isAuthenticated, isLoading } = useAuth();
  
  return {
    isAuthenticated,
    isLoading,
    shouldRedirect: !isLoading && !isAuthenticated && redirectToLogin,
  };
}