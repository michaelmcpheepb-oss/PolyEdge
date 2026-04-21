import { supabase } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFERENCES_STORAGE_KEY = 'user_preferences';

export interface UserPreferences {
  categories: string[];
  whale_threshold: number;
  updated_at: string;
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  categories: [],
  whale_threshold: 10000,
  updated_at: new Date().toISOString(),
};

// Get preferences from Supabase (with fallback to local storage)
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  try {
    // Try to get from Supabase first
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (!error && data) {
      // Save to local storage for offline access
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(data));
      return data as UserPreferences;
    }
    
    // Fallback to local storage
    const localData = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (localData) {
      return JSON.parse(localData) as UserPreferences;
    }
    
    // Return defaults
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    
    // Fallback to local storage
    try {
      const localData = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (localData) {
        return JSON.parse(localData) as UserPreferences;
      }
    } catch (localError) {
      console.error('Error reading local preferences:', localError);
    }
    
    return DEFAULT_PREFERENCES;
  }
}

// Save preferences to Supabase and local storage
export async function saveUserPreferences(
  userId: string, 
  preferences: Partial<UserPreferences>
): Promise<void> {
  const fullPreferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...preferences,
    updated_at: new Date().toISOString(),
  };
  
  try {
    // Save to Supabase
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...fullPreferences,
      }, { onConflict: 'user_id' });
    
    if (error) {
      console.error('Error saving preferences to Supabase:', error);
    }
    
    // Always save to local storage
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(fullPreferences));
    
    console.log('Preferences saved:', fullPreferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    
    // Still try to save locally
    try {
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(fullPreferences));
    } catch (localError) {
      console.error('Error saving to local storage:', localError);
    }
  }
}

// Update categories
export async function updateCategories(userId: string, categories: string[]): Promise<void> {
  await saveUserPreferences(userId, { categories });
}

// Update whale threshold
export async function updateWhaleThreshold(userId: string, threshold: number): Promise<void> {
  await saveUserPreferences(userId, { whale_threshold: threshold });
}

// Check if market matches user's category preferences
export function filterByCategories(market: any, userCategories: string[]): boolean {
  if (!userCategories || userCategories.length === 0) {
    return true; // Show all if no categories selected
  }
  
  // Map category names to match Polymarket categories
  const categoryMap: Record<string, string[]> = {
    sports: ['sports', 'football', 'basketball', 'baseball', 'soccer'],
    politics: ['politics', 'election', 'government'],
    crypto: ['crypto', 'bitcoin', 'ethereum', 'blockchain'],
    science: ['science', 'technology', 'space', 'climate'],
    world_events: ['world', 'international', 'conflict'],
    economics: ['economics', 'finance', 'stocks', 'economy'],
  };
  
  const marketCategory = market.category?.toLowerCase() || '';
  const marketQuestion = market.question?.toLowerCase() || '';
  
  // Check if market matches any selected category
  return userCategories.some(categoryId => {
    const mappedCategories = categoryMap[categoryId] || [categoryId];
    return mappedCategories.some(cat => 
      marketCategory.includes(cat) || marketQuestion.includes(cat)
    );
  });
}

// Hook for using preferences in components
import { useState, useEffect } from 'react';

export function useUserPreferences(userId: string) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadPreferences();
  }, [userId]);
  
  const loadPreferences = async () => {
    setIsLoading(true);
    const prefs = await getUserPreferences(userId);
    setPreferences(prefs);
    setIsLoading(false);
  };
  
  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    await saveUserPreferences(userId, newPreferences);
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    await loadPreferences(); // Reload to get updated timestamp
  };
  
  return {
    preferences,
    isLoading,
    updatePreferences,
    refresh: loadPreferences,
  };
}