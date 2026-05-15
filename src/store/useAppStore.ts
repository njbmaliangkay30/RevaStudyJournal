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
  
  // Timer State
  timerAccumulatedTime: number;
  timerLastStartTime: number;
  timerIsActive: boolean;
  timerNotifiedCycles: number;
  syncError: string | null;
  setSyncError: (error: string | null) => void;

  // Share Popups
  showStreakPopup: boolean;
  setShowStreakPopup: (show: boolean) => void;
  showTimerPopup: boolean;
  setShowTimerPopup: (show: boolean) => void;
  incrementStreakForTesting: () => Promise<void>;
  
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
  loginWithPermanentUid: () => Promise<void>;
  loginWithTestUid: () => Promise<void>;
  resetDevice: () => void;
  updateStreakIfNeeded: () => Promise<void>;
  
  // Timer Actions
  setTimerNotifiedCycles: (cycles: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  syncTimer: () => void;
}

// Throttle syncs globally
let lastSyncMap: Record<string, number> = {};

const syncDailyStats = async (userId: string, todayStr: string, newToday: number, blockId: string | null = null) => {
  try {
    const throttleKey = `daily_${userId}_${todayStr}_${blockId || 'null'}`;
    const now = Date.now();
    // Only send DB request every 15 seconds or if it's the first time
    if (lastSyncMap[throttleKey] && now - lastSyncMap[throttleKey] < 15000) {
      return;
    }
    lastSyncMap[throttleKey] = now;

    let query = supabase.from('daily_study_stats').select('id, time_spent').eq('user_id', userId).eq('date_str', todayStr);
    if (blockId) {
      query = query.eq('block_id', blockId);
    } else {
      query = query.is('block_id', null);
    }
    const { data: existingData, error: selectErr } = await query.maybeSingle();

    if (existingData) {
      if (newToday > (existingData.time_spent || 0)) {
        await supabase.from('daily_study_stats').update({ time_spent: newToday }).eq('id', existingData.id);
      }
    } else if (!selectErr || selectErr.code === 'PGRST116') {
      const payload: any = { user_id: userId, date_str: todayStr, time_spent: newToday };
      if (blockId) payload.block_id = blockId;
      await supabase.from('daily_study_stats').insert(payload);
    }
  } catch (e) {
    console.error("Daily stats sync error:", e);
  }
};

const updateAppThemeColor = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const metaThemeColor = document.querySelector("meta[name=theme-color]");
  let color = "#102307";
  if (theme === 'sakura') color = "#2d0a1a";
  else if (theme === 'moon') color = "#0a0e1a";
  
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", color);
  }
};

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
  isSpecialVerified: localStorage.getItem('is_special_verified') === 'true',

  timerAccumulatedTime: 0,
  timerLastStartTime: 0,
  timerIsActive: false,
  timerNotifiedCycles: 0,
  syncError: null,
  setSyncError: (error) => set({ syncError: error }),

  showStreakPopup: false,
  setShowStreakPopup: (show) => set({ showStreakPopup: show }),
  showTimerPopup: false,
  setShowTimerPopup: (show) => set({ showTimerPopup: show }),
  incrementStreakForTesting: async () => {
    const { profile } = get();
    if (!profile) return;
    const newStreak = (profile.streak || 0) + 1;
    // Hapus history popup sebelumnya biar setiap testing bisa muncul tier popupnya
    localStorage.removeItem('last_celebrated_streak');
    
    set({ profile: { ...profile, streak: newStreak } });
    
    await supabase.from('users').update({ streak: newStreak }).eq('id', profile.id);
  },

  setTimerNotifiedCycles: (cycles: number) => set({ timerNotifiedCycles: cycles }),
  
  toggleTimer: () => {
    const { timerIsActive, timerLastStartTime, timerAccumulatedTime, blockId } = get();
    
    const addStudyTime = (seconds: number) => {
      if (seconds <= 0) return;
      
      const userId = get().profile?.id || 'guest';
      const d = new Date();
      const todayStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
      
      const todayKey = `study_time_${userId}_${todayStr}`;
      const currentToday = parseInt(localStorage.getItem(todayKey) || "0");
      const newToday = currentToday + seconds;
      localStorage.setItem(todayKey, newToday.toString());
      
      let newBlock = 0;
      if (blockId) {
        const blockKey = `study_time_block_${blockId}`;
        const currentBlock = parseInt(localStorage.getItem(blockKey) || "0");
        newBlock = currentBlock + seconds;
        localStorage.setItem(blockKey, newBlock.toString());
      }

      // Sync to supabase
      const currentProfileId = get().profile?.id;
      if (currentProfileId) {
        syncDailyStats(currentProfileId, todayStr, newToday, null);
        if (blockId) {
          const blockTodayKey = `study_time_block_today_${blockId}_${todayStr}`;
          const currentBlockToday = parseInt(localStorage.getItem(blockTodayKey) || "0");
          const newBlockToday = currentBlockToday + seconds;
          localStorage.setItem(blockTodayKey, newBlockToday.toString());
          syncDailyStats(currentProfileId, todayStr, newBlockToday, blockId);

          const blockThrottleKey = `block_${blockId}`; const bNow = Date.now(); if (!lastSyncMap[blockThrottleKey] || bNow - lastSyncMap[blockThrottleKey] >= 15000) { lastSyncMap[blockThrottleKey] = bNow; supabase.from('study_blocks').select('time_spent').eq('id', blockId).single().then(({ data }) => { if (!data || newBlock > (data.time_spent || 0)) supabase.from('study_blocks').update({ time_spent: newBlock }).eq('id', blockId).then(); }); }
        }
      }
    };

    if (timerIsActive) {
      const elapsed = Math.max(0, Math.floor((Date.now() - timerLastStartTime) / 1000));
      addStudyTime(elapsed);
      set({
        timerAccumulatedTime: timerAccumulatedTime + elapsed,
        timerIsActive: false
      });
    } else {
      if ('Notification' in window && Notification.permission === 'default') {
        void Notification.requestPermission();
      }
      set({ timerLastStartTime: Date.now(), timerIsActive: true });
    }
  },
  
  resetTimer: () => {
    const { timerIsActive, timerLastStartTime, blockId } = get();
    
    if (timerIsActive) {
      const elapsed = Math.max(0, Math.floor((Date.now() - timerLastStartTime) / 1000));
      if (elapsed > 0) {
        const userId = get().profile?.id || 'guest';
        const d = new Date();
        const todayStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
        const todayKey = `study_time_${userId}_${todayStr}`;
        const currentToday = parseInt(localStorage.getItem(todayKey) || "0");
        const newToday = currentToday + elapsed;
        localStorage.setItem(todayKey, newToday.toString());
        
        let newBlock = 0;
        if (blockId) {
          const blockKey = `study_time_block_${blockId}`;
          const currentBlock = parseInt(localStorage.getItem(blockKey) || "0");
          newBlock = currentBlock + elapsed;
          localStorage.setItem(blockKey, newBlock.toString());
        }

        const currentProfileId = get().profile?.id;
        if (currentProfileId) {
          syncDailyStats(currentProfileId, todayStr, newToday, null);
          if (blockId) {
            const blockTodayKey = `study_time_block_today_${blockId}_${todayStr}`;
            const currentBlockToday = parseInt(localStorage.getItem(blockTodayKey) || "0");
            const newBlockToday = currentBlockToday + elapsed;
            localStorage.setItem(blockTodayKey, newBlockToday.toString());
            syncDailyStats(currentProfileId, todayStr, newBlockToday, blockId);

            supabase.from('study_blocks').update({ time_spent: newBlock }).eq('id', blockId).then();
          }
        }
      }
    }

    set({
      timerIsActive: false,
      timerAccumulatedTime: 0,
      timerLastStartTime: 0,
      timerNotifiedCycles: 0
    });
  },

  syncTimer: () => {
    const { timerIsActive, timerLastStartTime, timerAccumulatedTime, blockId } = get();
    if (timerIsActive) {
      const elapsed = Math.max(0, Math.floor((Date.now() - timerLastStartTime) / 1000));
      if (elapsed > 0) {
        set({ timerLastStartTime: Date.now(), timerAccumulatedTime: timerAccumulatedTime + elapsed });
        const userId = get().profile?.id || 'guest';
        const d = new Date();
        const todayStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
        const todayKey = `study_time_${userId}_${todayStr}`;
        const currentToday = parseInt(localStorage.getItem(todayKey) || "0");
        const newToday = currentToday + elapsed;
        localStorage.setItem(todayKey, newToday.toString());
        
        let newBlock = 0;
        if (blockId) {
          const blockKey = `study_time_block_${blockId}`;
          const currentBlock = parseInt(localStorage.getItem(blockKey) || "0");
          newBlock = currentBlock + elapsed;
          localStorage.setItem(blockKey, newBlock.toString());
        }

        const currentProfileId = get().profile?.id;
        if (currentProfileId) {
          syncDailyStats(currentProfileId, todayStr, newToday, null);
          if (blockId) {
            const blockTodayKey = `study_time_block_today_${blockId}_${todayStr}`;
            const currentBlockToday = parseInt(localStorage.getItem(blockTodayKey) || "0");
            const newBlockToday = currentBlockToday + elapsed;
            localStorage.setItem(blockTodayKey, newBlockToday.toString());
            syncDailyStats(currentProfileId, todayStr, newBlockToday, blockId);

            supabase.from('study_blocks').update({ time_spent: newBlock }).eq('id', blockId).then();
          }
        }
        
        set({
          timerAccumulatedTime: timerAccumulatedTime + elapsed,
          timerLastStartTime: Date.now()
        });
      }
    }
  },

  loginWithPermanentUid: async () => {
    const PERMANENT_UID = 'c097b441-d5c6-4559-abd3-a8a36274054b';
    localStorage.setItem('revalina_uid', PERMANENT_UID);
    localStorage.setItem('is_special_verified', 'true');
    await get().fetchProfile(PERMANENT_UID);
    set({ isSpecialVerified: true });
  },

  loginWithTestUid: async () => {
    const TEST_UID = 'a123b456-c789-0123-d456-e789f0123456';
    localStorage.setItem('revalina_uid', TEST_UID);
    localStorage.setItem('is_special_verified', 'true');
    await get().fetchProfile(TEST_UID);
    set({ isSpecialVerified: true });
  },

  resetDevice: () => {
    localStorage.removeItem('revalina_uid');
    localStorage.removeItem('is_special_verified');
    set({ profile: null, isSpecialVerified: false, isFirstTimeSetup: true });
  },

  updateStreakIfNeeded: async () => {
    const { blockStart, blockEnd, target, pptDots, profile } = get();
    if (!profile || !blockStart || !blockEnd || target === 0) return;

    const startDate = new Date(blockStart);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(blockEnd);
    endDate.setHours(0, 0, 0, 0);
    
    // total days between start and end date (inclusive approximation)
    const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const idealDaily = Math.ceil(target / totalDays);

    const getLocalDateStr = (d: Date) => {
       return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    const completionsByDate: Record<string, number> = {};
    pptDots.forEach(dot => {
       if (dot.done && dot.completed_at) {
          const dateStr = getLocalDateStr(new Date(dot.completed_at));
          completionsByDate[dateStr] = (completionsByDate[dateStr] || 0) + 1;
       }
    });

    let currentStreak = 0;
    let checkDate = new Date();
    
    const todayStr = getLocalDateStr(checkDate);
    const readToday = completionsByDate[todayStr] || 0;
    
    if (readToday >= idealDaily) {
      currentStreak++;
    }

    checkDate.setDate(checkDate.getDate() - 1);

    while (checkDate >= startDate) {
       const dateStr = getLocalDateStr(checkDate);
       const readCount = completionsByDate[dateStr] || 0;
       
       if (readCount >= idealDaily) {
           currentStreak++;
           checkDate.setDate(checkDate.getDate() - 1);
       } else {
           break;
       }
    }

    if (profile.streak !== currentStreak) {
      const updatedProfile = { ...profile, streak: currentStreak };
      set({ profile: updatedProfile });
      if (!profile.id.startsWith('local-')) {
        await supabase
          .from('profiles')
          .update({ streak: currentStreak })
          .eq('id', profile.id);
      }
    }
  },

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
        if (block.time_spent != null) {
          const localBlock = parseInt(localStorage.getItem(`study_time_block_${block.id}`) || "0");
          localStorage.setItem(`study_time_block_${block.id}`, Math.max(localBlock, block.time_spent).toString());
        }

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
        await get().updateStreakIfNeeded();
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
    const completedAt = newDone ? new Date().toISOString() : undefined;
    const newDots = pptDots.map((d, i) => i === index ? { ...d, done: newDone, completed_at: completedAt } : d);
    set({ pptDots: newDots });
    await get().updateStreakIfNeeded();

    if (profile && blockId && !dot.id.startsWith('local-')) {
      await supabase
        .from('ppt_dots')
        .update({ is_done: newDone, completed_at: completedAt || null })
        .eq('id', dot.id);
    }
  },

  setDotTitle: async (index: number, title: string) => {
    const { profile, pptDots, blockId } = get();
    const dot = pptDots[index];
    if (!dot) return;

    const completedAt = new Date().toISOString();
    const newDots = pptDots.map((d, i) => i === index ? { ...d, title, done: true, completed_at: completedAt } : d);
    set({ pptDots: newDots });
    await get().updateStreakIfNeeded();

    if (profile && blockId && !dot.id.startsWith('local-')) {
      await supabase
        .from('ppt_dots')
        .update({ title, is_done: true, completed_at: completedAt })
        .eq('id', dot.id);
    }
  },

  setTheme: (theme) => {
    updateAppThemeColor(theme);
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
        updateAppThemeColor(data.theme || 'light');
        
        // Fetch active block and its progress
        await get().fetchActiveBlock(userId);

        // Fetch daily stats and sync to localStorage
        const d = new Date();
        const todayStr = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
        const y = new Date(d);
        y.setDate(y.getDate() - 1);
        const yesterdayStr = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, '0') + "-" + String(y.getDate()).padStart(2, '0');

        const { data: statsData, error: statsError } = await supabase
          .from('daily_study_stats')
          .select('date_str, time_spent')
          .eq('user_id', userId)
          .in('date_str', [todayStr, yesterdayStr]);

        if (statsData) {
          let todayDb = parseInt(localStorage.getItem(`study_time_${userId}_${todayStr}`) || "0");
          let yesterdayDb = parseInt(localStorage.getItem(`study_time_${userId}_${yesterdayStr}`) || "0");
          statsData.forEach(s => {
            if (s.date_str === todayStr) todayDb = Math.max(todayDb, s.time_spent || 0);
            if (s.date_str === yesterdayStr) yesterdayDb = Math.max(yesterdayDb, s.time_spent || 0);
          });
          localStorage.setItem(`study_time_${userId}_${todayStr}`, todayDb.toString());
          localStorage.setItem(`study_time_${userId}_${yesterdayStr}`, yesterdayDb.toString());
        }
      } else if (error && error.code === 'PGRST116') {
        const PERMANENT_UID = 'c097b441-d5c6-4559-abd3-a8a36274054b';
        const TEST_UID = 'a123b456-c789-0123-d456-e789f0123456';
        if (userId !== PERMANENT_UID && userId !== TEST_UID) {
          // If the cached userId is not the permanent UID and it doesn't exist, don't create it.
          // Clear it out to force the secret login popup.
          localStorage.removeItem('revalina_uid');
          set({ isFirstTimeSetup: true, isInitializing: false, isLoading: false });
          return;
        }

        // Profile doesn't exist, create it ONLY if it's the intended permanent user
        const newProfile = {
          id: userId,
          username: userId === TEST_UID ? "Test User" : "Peri kecilku",
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

  setSpecialVerified: (verified: boolean) => {
    localStorage.setItem('is_special_verified', verified ? 'true' : 'false');
    set({ isSpecialVerified: verified });
  }
}));
