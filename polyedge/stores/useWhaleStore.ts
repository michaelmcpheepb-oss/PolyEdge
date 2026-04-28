import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WhaleStore {
  threshold: number;
  setThreshold: (threshold: number) => void;
  showRecentOnly: boolean;
  setShowRecentOnly: (show: boolean) => void;
  timeframe: '24h' | '7d' | '30d';
  setTimeframe: (timeframe: '24h' | '7d' | '30d') => void;
}

export const useWhaleStore = create<WhaleStore>()(
  persist(
    (set) => ({
      threshold: 1000, // $1K default
      setThreshold: (threshold) => set({ threshold }),
      showRecentOnly: false,
      setShowRecentOnly: (showRecentOnly) => set({ showRecentOnly }),
      timeframe: '24h',
      setTimeframe: (timeframe) => set({ timeframe }),
    }),
    {
      name: 'whale-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);