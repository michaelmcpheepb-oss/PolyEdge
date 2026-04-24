import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';

interface UserStore {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthSheetVisible: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  showAuthSheet: () => void;
  hideAuthSheet: () => void;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      isAuthSheetVisible: false,
      
      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setIsLoading: (isLoading) => set({ isLoading }),
      showAuthSheet: () => set({ isAuthSheetVisible: true }),
      hideAuthSheet: () => set({ isAuthSheetVisible: false }),
      signOut: async () => {
        set({ isLoading: true });
        try {
          // Import here to avoid circular dependency
          const { signOut } = await import('../services/auth-magic');
          await signOut();
          set({ user: null, session: null, isAuthSheetVisible: false });
        } catch (error) {
          console.error('Sign out error:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Helper hooks
export const useIsAuthenticated = () => {
  const user = useUserStore((state) => state.user);
  return !!user;
};

export const useCurrentUser = () => {
  return useUserStore((state) => state.user);
};

export const useCurrentSession = () => {
  return useUserStore((state) => state.session);
};