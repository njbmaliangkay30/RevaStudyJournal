import { create } from 'zustand';
import { Theme, Profile } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  profile: Profile | null;
  name: string;
  coins: number;
  theme: Theme;
  target: number;
  dailyReadSlides: number;
  pptDots: { id: string; done: boolean; title?: string }[];
  blockName: string | null;
  blockStart: string | null;
  blockEnd: string | null;
  examScore: number | null;
  lang: 'id' | 'en';
  isLoading: boolean;
  isFirstTimeSetup: boolean;
  needsExamScore: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  addCoins: (amount: number) => Promise<void>;
  updateDailyReadSlides: (amount: number) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  setupNewBlock: (name: string, target: number, start: string, end: string) => void;
  submitExamScore: (score: number) => void;
  checkExamDay: () => void;
  togglePptDot: (index: number) => void;
  setDotTitle: (index: number, title: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  name: "Peri Kecil",
  coins: 0,
  theme: 'light',
  target: 40,
  dailyReadSlides: 14,
  pptDots: Array.from({ length: 40 }, (_, i) => ({ id: `dot-${i}`, done: i < 5 })),
  blockName: null,
  blockStart: null,
  blockEnd: null,
  examScore: null,
  isFirstTimeSetup: true,
  needsExamScore: false,
  lang: 'id',
  isLoading: false,

  setupNewBlock: (name: string, target: number, start: string, end: string) => {
    set({
      blockName: name,
      target,
      blockStart: start,
      blockEnd: end,
      isFirstTimeSetup: false,
      needsExamScore: false,
      examScore: null,
      pptDots: Array.from({ length: target }, (_, i) => ({ id: `dot-${i}`, done: false })),
    });
  },

  submitExamScore: (score: number) => {
    // Optionally archive the block to db here.
    set({
      examScore: score,
      needsExamScore: false,
      // Then trigger the first setup for the next block
      isFirstTimeSetup: true,
      blockName: null,
    });
  },

  checkExamDay: () => {
    const state = get();
    if (!state.blockEnd || state.isFirstTimeSetup || state.needsExamScore) return;
    
    // Check if current date is at or past exam date
    const endDate = new Date(state.blockEnd);
    const now = new Date();
    
    // Normalize to date level without time
    endDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    
    // If today is exam day or past exam day
    if (now >= endDate) {
      set({ needsExamScore: true });
    }
  },

  updateDailyReadSlides: (amount) => {
    set({ dailyReadSlides: amount });
  },

  togglePptDot: (index: number) => {
    set((state) => ({
      pptDots: state.pptDots.map((dot, i) => 
        i === index ? { ...dot, done: !dot.done } : dot
      )
    }));
  },

  setDotTitle: (index: number, title: string) => {
    set((state) => ({
      pptDots: state.pptDots.map((dot, i) => 
        i === index ? { ...dot, title, done: true } : dot
      )
    }));
  },

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
