import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react';
import { formatTime } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const { addCoins } = useAppStore();

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  }, [mode]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (mode === 'work') {
        addCoins(10); // Reward for finishing a deep work session
        // Notify user
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, addCoins]);

  const progress = timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="p-8 glass-card flex flex-col items-center w-full max-w-xl mx-auto">
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => { setMode('work'); resetTimer(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
              mode === 'work' ? 'bg-gold text-green-deep' : 'bg-white/5 text-white/40'
            }`}
          >
            <Zap size={14} /> Fokus
          </button>
          <button 
            onClick={() => { setMode('break'); resetTimer(); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all ${
              mode === 'break' ? 'bg-indigo-400 text-white' : 'bg-white/5 text-white/40'
            }`}
          >
            <Coffee size={14} /> Istirahat
          </button>
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Progress Circle Outer */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              className="stroke-white/5"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              className="stroke-gold"
              strokeWidth="8"
              fill="none"
              strokeDasharray="754"
              animate={{ strokeDashoffset: 754 * (1 - progress) }}
              transition={{ duration: 1, ease: "linear" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Inner Timer Content */}
          <div className="text-center z-10">
            <motion.div 
              key={timeLeft}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-serif text-6xl text-white tracking-widest"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mt-2">
              {isActive ? 'Waktunya Fokus!' : 'Siap Berangkat?'}
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="p-4 bg-white/5 rounded-full text-white/40 hover:text-white"
          >
            <RotateCcw size={24} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-gold text-green-deep flex items-center justify-center shadow-[0_0_25px_rgba(245,200,66,0.5)]"
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" stroke="none" />}
          </motion.button>

          <div className="p-4 w-12" /> {/* Spacer */}
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto glass-card overflow-hidden">
        <iframe 
          data-testid="embed-iframe"
          style={{ borderRadius: '12px' }} 
          src="https://open.spotify.com/embed/playlist/1e6YJipVpYh8ZQDUrFHBv6?utm_source=generator&theme=0" 
          width="100%" 
          height="352" 
          frameBorder={0} 
          allowFullScreen={false} 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};
