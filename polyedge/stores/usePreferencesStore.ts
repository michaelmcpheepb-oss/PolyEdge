import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PreferencesState {
  categories: string[];
  whaleThreshold: number;
  hasOnboarded: boolean;
  notificationFrequency: 'instant' | '5min' | '15min' | 'hourly';
  pushNotificationsEnabled: boolean;
  
  // Actions
  setCategories: (categories: string[]) => void;
  setWhaleThreshold: (threshold: number) => void;
  setHasOnboarded: (hasOnboarded: boolean) => void;
  setNotificationFrequency: (frequency: 'instant' | '5min' | '15min' | 'hourly') => void;
  setPushNotificationsEnabled: (enabled: boolean) => void;
  
  // Toggle helpers
  toggleCategory: (categoryId: string) => void;
  selectAllCategories: () => void;
  clearAllCategories: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      // Initial state
      categories: [],
      whaleThreshold: 10000,
      hasOnboarded: false,
      notificationFrequency: 'instant',
      pushNotificationsEnabled: true,
      
      // Actions
      setCategories: (categories) => set({ categories }),
      setWhaleThreshold: (whaleThreshold) => set({ whaleThreshold }),
      setHasOnboarded: (hasOnboarded) => set({ hasOnboarded }),
      setNotificationFrequency: (notificationFrequency) => set({ notificationFrequency }),
      setPushNotificationsEnabled: (pushNotificationsEnabled) => set({ pushNotificationsEnabled }),
      
      // Toggle helpers
      toggleCategory: (categoryId) => {
        const { categories } = get();
        if (categories.includes(categoryId)) {
          set({ categories: categories.filter(id => id !== categoryId) });
        } else {
          set({ categories: [...categories, categoryId] });
        }
      },
      
      selectAllCategories: () => {
        const allCategories = ['politics', 'crypto', 'sports', 'science', 'economics', 'world_events', 'tech', 'culture'];
        set({ categories: allCategories });
      },
      
      clearAllCategories: () => {
        set({ categories: [] });
      },
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook for checking if a category is selected
export const useIsCategorySelected = (categoryId: string) => {
  const categories = usePreferencesStore((state) => state.categories);
  return categories.includes(categoryId);
};

// Hook for getting selected categories count
export const useSelectedCategoriesCount = () => {
  const categories = usePreferencesStore((state) => state.categories);
  return categories.length;
};