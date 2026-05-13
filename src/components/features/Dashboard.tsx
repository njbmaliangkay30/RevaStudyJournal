import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, BarChart3, CheckCircle2, Clock, Star, Target, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';

export const Dashboard: React.FC = () => {
    const { profile, target, pptDots, blockStart, blockEnd, lang } = useAppStore();
    const [leaderboardTab, setLeaderboardTab] = useState<'score' | 'recent'>('score');
    const [pastBlocks, setPastBlocks] = useState<any[]>([]);
    const [weeklyActivity, setWeeklyActivity] = useState<{day: string, slides: number}[]>([]);

    useEffect(() => {
      if (!profile) return;

      const fetchData = async () => {
        // Fetch past blocks
        const { data: blocks } = await supabase
          .from('study_blocks')
          .select('*')
          .eq('user_id', profile.id)
          .eq('is_active', false)
          .order('created_at', { ascending: false });
        
        if (blocks) {
          const formattedBlocks = blocks.map(b => ({
            id: b.id,
            name: b.name,
            slides: b.target_slides, // Past blocks are considered completed
            total: b.target_slides,
            score: b.exam_score || 0,
            lastActiveMs: new Date(b.created_at).getTime(),
            lastActive: new Date(b.created_at).toLocaleDateString(),
            efficiency: 100 
          }));
          setPastBlocks(formattedBlocks);
        }

        // Calculate weekly activity (simplified for now - checking ppt_dots completed_at)
        const days = lang === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const activity = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dayName = days[d.getDay()];
          
          // Count completed dots for this day
          const dateStr = d.toISOString().split('T')[0];
          const count = pptDots.filter(dot => dot.done && dot.completed_at && dot.completed_at.startsWith(dateStr)).length;
          
          return { day: dayName, slides: count };
        });
        setWeeklyActivity(activity);
      };

      fetchData();
    }, [profile, pptDots, lang]);

    const doneCount = pptDots ? pptDots.filter(d => d.done).length : 0;
    const safeTarget = typeof target === 'number' ? target : 0;
    const remaining = Math.max(0, safeTarget - doneCount);
    const progress = safeTarget > 0 ? Math.min(100, Math.round((doneCount / safeTarget) * 100)) : 0;
    
    const daysLeft = blockEnd ? Math.max(1, Math.ceil((new Date(blockEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 1;
    const idealDaily = Math.ceil(remaining / daysLeft);

    let blockLabel = "Belum Diatur";
    let subTitle = "";
    if (blockStart && blockEnd) {
      const s = new Date(blockStart).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      const e = new Date(blockEnd).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      subTitle = `${s} – ${e}`;
      blockLabel = useAppStore.getState().blockName || "Target Belajar";
    }

    const displayBlocks = leaderboardTab === 'score' 
      ? [...pastBlocks].sort((a, b) => b.score - a.score)
      : [...pastBlocks].sort((a, b) => b.lastActiveMs - a.lastActiveMs);

    const maxSlides = Math.max(1, ...weeklyActivity.map(d => d.slides));

    // Get recent completed slides from pptDots (ones that have a title and are done)
    const recentReadings = pptDots && pptDots.length > 0 
      ? pptDots
          .filter(dot => dot.done && dot.title)
          .map((dot) => {
            const timeStr = dot.completed_at 
              ? new Date(dot.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Baru saja';
            return {
              id: dot.id,
              title: dot.title,
              slides: 1,
              time: timeStr
            };
          })
          .slice(-3)
          .reverse()
      : [
          { id: '1', title: 'Belum ada progress', slides: 0, time: '-' }
        ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Target Belajar Progress */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-4 sm:p-6 bg-gradient-to-br from-gold/20 via-transparent to-transparent flex flex-col gap-4 sm:gap-6 relative group"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-3xl text-white">{blockLabel}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={10} className="text-gold" />
              <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-black">
                {subTitle}
              </p>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-[3px] border-white/5 flex items-center justify-center relative shadow-[inset_0_0_10px_rgba(245,200,66,0.1)]">
            <svg viewBox="0 0 36 36" className="w-16 h-16 absolute -inset-[3px] origin-center rotate-[-90deg]">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(245, 200, 66, 0.15)"
                strokeWidth="2"
              />
              <motion.path
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${progress}, 100` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f5c842"
                strokeWidth="2"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(245,200,66,0.6)]"
              />
            </svg>
            <span className="font-bold text-white text-base">{progress}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-2">
          {/* Progress */}
          <div className="bg-black/20 rounded-2xl p-4 border border-white/10 shadow-inner flex flex-col justify-center">
            <div className="text-[9px] sm:text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1 drop-shadow-sm flex items-center gap-1.5">
              <CheckCircle2 size={10} className="text-emerald-400" />
              Terselesaikan
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-serif font-black text-white drop-shadow-md">{doneCount}</span>
              <span className="text-[10px] sm:text-xs text-white/40 font-medium">/ <span className="text-white/60">{safeTarget}</span> slide</span>
            </div>
          </div>
          
          {/* Remaining */}
          <div className="bg-black/20 rounded-2xl p-4 border border-white/10 shadow-inner flex flex-col justify-center">
            <div className="text-[9px] sm:text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1 drop-shadow-sm flex items-center gap-1.5">
              <Target size={10} className="text-rose-400" />
              Sisa Target
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-serif font-black text-rose-100 drop-shadow-md">{remaining}</span>
              <span className="text-[10px] sm:text-xs text-white/40 font-medium">slide</span>
            </div>
          </div>

          {/* Ideal Daily */}
          <div className="col-span-2 md:col-span-1 bg-black/20 rounded-2xl p-4 border border-white/10 shadow-inner overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl group-hover:bg-gold/20 transition-all pointer-events-none" />
            <div className="text-[9px] sm:text-[10px] text-white/50 font-bold tracking-widest uppercase mb-1 drop-shadow-sm flex items-center gap-1.5 relative z-10">
              <Zap size={10} className="text-gold" />
              Ideal Harian
            </div>
            <div className="flex items-baseline gap-1.5 relative z-10">
              <span className="text-2xl sm:text-3xl font-serif font-black text-gold drop-shadow-md">{idealDaily}</span>
              <span className="text-[10px] sm:text-xs text-white/40 font-medium">slide <span className="opacity-60">/hr</span></span>
            </div>
          </div>
        </div>

        {/* Riwayat Bacaan Hari Ini */}
        <div className="mt-2 bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="text-[10px] text-white/60 font-bold uppercase tracking-widest flex justify-between items-center mb-1">
            <span>Riwayat Selesai Hari Ini</span>
            {doneCount >= safeTarget && safeTarget > 0 && <span className="text-emerald-400">Target Tercapai! 🎉</span>}
          </div>
          
          <div className="flex flex-col gap-2">
            {recentReadings.map((reading) => (
              <div key={reading.id} className="bg-black/30 flex items-center justify-between p-3 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-gold" />
                  </div>
                  <div>
                    <h4 className="text-white/90 font-bold text-xs sm:text-sm">{reading.title}</h4>
                    <p className="text-white/40 text-[9px] uppercase tracking-wider font-bold mt-0.5">{reading.slides} Slide</p>
                  </div>
                </div>
                <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{reading.time}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Weekly Activity Chart */}
      <div className="glass-card p-4 sm:p-6 bg-gradient-to-tr from-white/5 to-transparent">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl text-white">Aktivitas Minggu Ini</h3>
          <BarChart3 size={16} className="text-emerald-400" />
        </div>
        <div className="bg-black/30 rounded-2xl p-4 border border-white/5 h-40 flex items-end justify-between gap-2 overflow-hidden relative">
          {/* Chart Bars */}
          {weeklyActivity.map((day, idx) => {
            const heightPct = Math.max(5, (day.slides / maxSlides) * 100);
            return (
              <div key={day.day} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="w-full relative flex justify-center items-end h-24">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="w-full max-w-[24px] bg-gradient-to-t from-white/10 to-emerald-400/80 rounded-t-lg relative group-hover:to-emerald-400 transition-colors cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap transition-opacity pointer-events-none border border-white/10">
                      {day.slides} slide
                    </div>
                  </motion.div>
                </div>
                <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider group-hover:text-white/80 transition-colors">
                  {day.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Block Effectiveness Leaderboard */}
      <div className="glass-card p-4 sm:p-6 bg-gradient-to-tr from-white/5 to-transparent">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl text-white">Leaderboard Blok</h3>
            <Trophy size={16} className="text-gold" />
          </div>
          
          <div className="flex bg-black/40 rounded-xl p-1 border border-white/5 items-center max-w-[240px] w-full">
            <button
              onClick={() => setLeaderboardTab('score')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${leaderboardTab === 'score' ? 'bg-white/10 text-gold shadow-md' : 'text-white/40 hover:text-white/70'}`}
            >
              <Star size={12} /> Nilai
            </button>
            <button
              onClick={() => setLeaderboardTab('recent')}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${leaderboardTab === 'recent' ? 'bg-white/10 text-emerald-400 shadow-md' : 'text-white/40 hover:text-white/70'}`}
            >
              <Clock size={12} /> Terbaru
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {displayBlocks.map((block, idx) => (
              <motion.div 
                key={block.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-black/30 rounded-2xl p-4 border border-white/5 relative overflow-hidden flex items-center gap-4 group hover:bg-white/5 transition-colors"
              >
                {/* Rank/Recent Badge */}
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm border ${
                  leaderboardTab === 'score' && idx === 0 ? 'bg-gold/20 border-gold/40 text-gold shadow-[0_0_15px_rgba(245,200,66,0.2)]' :
                  leaderboardTab === 'score' && idx === 1 ? 'bg-slate-300/20 border-slate-300/40 text-slate-200' :
                  leaderboardTab === 'score' && idx === 2 ? 'bg-amber-700/20 border-amber-700/40 text-amber-500' :
                  'bg-white/5 border-white/10 text-white/50'
                }`}>
                  {leaderboardTab === 'score' ? idx + 1 : '-'}
                </div>

                {/* Block Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-white/90 font-bold text-sm tracking-wide truncate">{block.name}</p>
                    {leaderboardTab === 'recent' && (
                      <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-bold whitespace-nowrap bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 shrink-0 mt-0.5">
                        {block.lastActive}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${block.efficiency}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className={`h-full rounded-full ${
                          block.efficiency >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                          block.efficiency >= 70 ? 'bg-gradient-to-r from-orange-500 to-orange-400' :
                          'bg-gradient-to-r from-rose-500 to-rose-400'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-white/50 whitespace-nowrap shrink-0">
                      {block.slides}/{block.total} Selesai
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-end justify-center w-10 shrink-0">
                  <span className={`text-xl font-black font-serif leading-none ${
                    block.score >= 90 ? 'text-gold drop-shadow-[0_0_8px_rgba(245,200,66,0.3)]' :
                    block.score >= 70 ? 'text-zinc-200' :
                    'text-rose-400'
                  }`}>
                    {block.score}
                  </span>
                  <span className="text-[7px] uppercase tracking-widest font-black text-white/30 truncate w-full text-right mt-1">Nilai</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

