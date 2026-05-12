import { create } from 'zustand';
import { Theme, Profile } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  profile: Profile | null;
  name: string;
  coins: number;
  theme: Theme;
  target: number;
  pptDots: { id: string; done: boolean }[];
  blockStart: string | null;
  blockEnd: string | null;
  lang: 'id' | 'en';
  isLoading: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  addCoins: (amount: number) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  name: "Peri Kecil",
  coins: 0,
  theme: 'light',
  target: 40,
  pptDots: Array.from({ length: 40 }, (_, i) => ({ id: `dot-${i}`, done: i < 5 })),
  blockStart: new Date().toISOString(),
  blockEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  lang: 'id',
  isLoading: false,

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
    
    // Persist to DB if user is logged in
    const profile = get().profile;
    if (profile) {
      supabase.from('profiles').update({ theme }).eq('id', profile.id).then();
    }
  },

  addCoins: async (amount) => {
    const { profile, coins } = get();
    const newCoins = coins + amount;
    set({ coins: newCoins });
    
    if (profile) {
      await supabase.from('profiles').update({ coins: newCoins }).eq('id', profile.id);
    }
  },

  fetchProfile: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (data && !error) {
        set({ 
          profile: data, 
          name: data.username || "Peri Kecil",
          coins: data.coins || 0, 
          theme: (data.theme as Theme) || 'light' 
        });
        document.documentElement.setAttribute('data-theme', data.theme || 'light');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const profile = get().profile;
    if (!profile) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id);

    if (!error) {
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
        name: updates.username || state.name
      }));
    }
  }
}));
