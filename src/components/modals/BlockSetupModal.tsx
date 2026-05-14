import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { CalendarDays, Target, BookOpen, ChevronRight } from 'lucide-react';

export const BlockSetupModal: React.FC = () => {
  const { isFirstTimeSetup, setupNewBlock, theme, profile, isSpecialVerified } = useAppStore();
  
  const [name, setName] = useState('');
  const [target, setTarget] = useState<number | ''>('');
  
  const PERMANENT_UID = 'c097b441-d5c6-4559-abd3-a8a36274054b';
  const TEST_UID = 'a123b456-c789-0123-d456-e789f0123456';
  
  // Format today as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState('');

  useEffect(() => {
    if (isFirstTimeSetup) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isFirstTimeSetup]);

  // Handle special verification requirement
  const needsSpecialVerification = (profile?.id === PERMANENT_UID || profile?.id === TEST_UID) && !isSpecialVerified;

  if (!isFirstTimeSetup || needsSpecialVerification) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !start || !end) return;
    
    // Validate end is after or equal to start
    if (new Date(end) < new Date(start)) {
      alert("Tanggal ujian tidak boleh mendahului tanggal mulai!");
      return;
    }
    
    await setupNewBlock(name, Number(target), new Date(start).toISOString(), new Date(end).toISOString());
  };

  const handleShortcut = (days: number) => {
    const startDate = new Date(start || today);
    startDate.setDate(startDate.getDate() + days);
    setEnd(startDate.toISOString().split('T')[0]);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden border ${
            theme === 'moon' 
              ? 'bg-slate-900/50 border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(79,70,229,0.25)]' :
            theme === 'sakura' 
              ? 'bg-rose-950/50 border-rose-500/20 shadow-[0_0_50px_-12px_rgba(225,29,72,0.25)]' :
            'bg-emerald-950/50 border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)]'
          }`}
        >
          {/* Decorative glow behind the modal content */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-white/5 blur-3xl rounded-full" />
          
          <div className="p-6 sm:p-8 relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 flex items-center justify-center border border-gold/20 shadow-[0_0_30px_rgba(245,200,66,0.15)] relative">
                <BookOpen className="text-gold" size={28} />
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif text-white mb-2">Petualangan Baru</h2>
              <p className="text-sm text-white/50">Atur blok pembelajaranmu berikutnya dan capai target barumu!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest pl-1">Nama Blok / Materi</label>
                <div className="relative">
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Contoh: Fisiologi Sistem Saraf"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest pl-1">Target Slide PPT</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={target}
                    onChange={e => setTarget(Number(e.target.value))}
                    placeholder="Contoh: 40"
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest pl-1">Mulai</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input 
                      type="date" 
                      required
                      value={start}
                      onChange={e => setStart(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest pl-1">Ujian</label>
                  </div>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                    <input 
                      type="date" 
                      required
                      value={end}
                      min={start}
                      onChange={e => setEnd(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Shortcuts */}
              <div className="flex gap-2 justify-center pt-2">
                <button type="button" onClick={() => handleShortcut(7)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/70 transition-colors">1 Minggu</button>
                <button type="button" onClick={() => handleShortcut(14)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/70 transition-colors">2 Minggu</button>
                <button type="button" onClick={() => handleShortcut(30)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/70 transition-colors">1 Bulan</button>
              </div>

              <button 
                type="submit"
                disabled={!name || !target || !start || !end}
                className="w-full mt-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mulai Petualangan
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
