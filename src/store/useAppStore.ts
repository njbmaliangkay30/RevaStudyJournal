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
  pptDots: { id: string; done: boolean; title?: string; completed_at?: string }[];
  blockId: string | null;
  blockName: string | null;
  blockStart: string | null;
  blockEnd: string | null;
  examScore: number | null;
  lang: 'id' | 'en';
  isLoading: boolean;
  isInitializing: boolean;
  isFirstTimeSetup: boolean;
  isSpecialVerified: boolean;
  needsExamScore: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  addCoins: (amount: number) => Promise<void>;
  updateDailyReadSlides: (amount: number) => void;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  setupNewBlock: (name: string, target: number, start: string, end: string) => Promise<void>;
  submitExamScore: (score: number) => Promise<void>;
  checkExamDay: () => void;
  togglePptDot: (index: number) => Promise<void>;
  setDotTitle: (index: number, title: string) => Promise<void>;
  fetchActiveBlock: (userId: string) => Promise<void>;
  setSpecialVerified: (verified: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  profile: null,
  name: "Peri kecilku",
  coins: 0,
  theme: 'light',
  target: 40,
  dailyReadSlides: 14,
  pptDots: [],
  blockId: null,
  blockName: null,
  blockStart: null,
  blockEnd: null,
  examScore: null,
  isFirstTimeSetup: true,
  needsExamScore: false,
  lang: 'id',
  isLoading: false,
  isInitializing: true,
  isSpecialVerified: false,

  setupNewBlock: async (name: string, target: number, start: string, end: string) => {
    const profile = get().profile;
    if (!profile) {
      set({
        blockName: name,
        target,
        blockStart: start,
        blockEnd: end,
        isFirstTimeSetup: false,
        needsExamScore: false,
        examScore: null,
        pptDots: Array.from({ length: target }, (_, i) => ({ id: `local-${i}`, done: false })),
      });
      return;
    }

    set({ isLoading: true });
    try {
      await supabase.from('study_blocks').update({ is_active: false }).eq('user_id', profile.id);

      const { data: newBlock, error: blockError } = await supabase
        .from('study_blocks')
        .insert([{
          user_id: profile.id,
          name,
          start_date: start,
          exam_date: end,
          target_slides: target,
          is_active: true
        }])
        .select()
        .single();

      if (blockError) throw blockError;

      const dotsToInsert = Array.from({ length: target }, (_, i) => ({
        block_id: newBlock.id,
        index: i,
        is_done: false
      }));

      const { data: createdDots, error: dotsError } = await supabase
        .from('ppt_dots')
        .insert(dotsToInsert)
        .select();

      if (dotsError) throw dotsError;

      set({
        blockId: newBlock.id,
        blockName: newBlock.name,
        target: newBlock.target_slides,
        blockStart: newBlock.start_date,
        blockEnd: newBlock.exam_date,
        isFirstTimeSetup: false,
        needsExamScore: false,
        examScore: null,
        pptDots: createdDots.sort((a, b) => a.index - b.index).map(d => ({
          id: d.id,
          done: d.is_done,
          title: d.title || undefined,
          completed_at: d.completed_at
        }))
      });
    } catch (err) {
      console.error("Setup Block Error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  submitExamScore: async (score: number) => {
    const { profile, blockId } = get();
    if (profile && blockId) {
      await supabase
        .from('study_blocks')
        .update({ exam_score: score, is_active: false })
        .eq('id', blockId);
    }

    set({
      examScore: score,
      needsExamScore: false,
      isFirstTimeSetup: true,
      blockName: null,
      blockId: null
    });
  },

  fetchActiveBlock: async (userId: string) => {
    const { data: block, error: blockError } = await supabase
      .from('study_blocks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (block && !blockError) {
      const { data: dots, error: dotsError } = await supabase
        .from('ppt_dots')
        .select('*')
        .eq('block_id', block.id)
        .order('index', { ascending: true });

      if (dots && !dotsError) {
        set({
          blockId: block.id,
          blockName: block.name,
          blockStart: block.start_date,
          blockEnd: block.exam_date,
          target: block.target_slides,
          isFirstTimeSetup: false,
          examScore: block.exam_score,
          pptDots: dots.map(d => ({
            id: d.id,
            done: d.is_done,
            title: d.title || undefined,
            completed_at: d.completed_at
          }))
        });
      }
    }
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

  togglePptDot: async (index: number) => {
    const { profile, pptDots, blockId } = get();
    const dot = pptDots[index];
    if (!dot) return;

    const newDone = !dot.done;
    const newDots = pptDots.map((d, i) => i === index ? { ...d, done: newDone } : d);
    set({ pptDots: newDots });

    if (profile && blockId && !dot.id.startsWith('local-')) {
      await supabase
        .from('ppt_dots')
        .update({ is_done: newDone, completed_at: newDone ? new Date().toISOString() : null })
        .eq('id', dot.id);
    }
  },

  setDotTitle: async (index: number, title: string) => {
    const { profile, pptDots, blockId } = get();
    const dot = pptDots[index];
    if (!dot) return;

    const newDots = pptDots.map((d, i) => i === index ? { ...d, title, done: true } : d);
    set({ pptDots: newDots });

    if (profile && blockId && !dot.id.startsWith('local-')) {
      await supabase
        .from('ppt_dots')
        .update({ title, is_done: true, completed_at: new Date().toISOString() })
        .eq('id', dot.id);
    }
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
          name: (data.username === "Peri Kecil" || !data.username) ? "Peri kecilku" : data.username,
          coins: data.coins || 0, 
          theme: (data.theme as Theme) || 'light' 
        });
        document.documentElement.setAttribute('data-theme', data.theme || 'light');
        
        // Fetch active block and its progress
        await get().fetchActiveBlock(userId);
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: userId,
          username: "Peri kecilku",
          coins: 100, // Starting bonus
          theme: 'light',
          inventory: {},
          streak: 0,
          last_active: new Date().toISOString()
        };
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
        
        if (created && !createError) {
          set({
            profile: created,
            name: created.username,
            coins: created.coins,
            theme: created.theme as Theme
          });
        }
      }
    } finally {
      set({ isLoading: false, isInitializing: false });
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
  },

  setSpecialVerified: (verified: boolean) => set({ isSpecialVerified: verified })
}));
