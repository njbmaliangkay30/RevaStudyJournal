import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n';
import { Sparkles, Play, Sun, Moon, Flower2, Gift, Flame, CalendarDays } from 'lucide-react';

const MAGIC_QUOTES = [
  "Belajar adalah cara kita menumbuhkan sayap untuk terbang.",
  "Semua keajaiban butuh sedikit waktu dan banyak usaha.",
  "Satu halaman lagi, satu kepakan sayap lebih tinggi.",
  "Jangan berhenti saat lelah, berhentilah saat selesai.",
  "Fokus hari ini adalah keajaiban esok hari."
];

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { name, coins, target, pptDots, theme, blockStart, blockEnd, lang } = useAppStore();
  const [quote, setQuote] = useState("");
  const [interactiveStreak, setInteractiveStreak] = useState(3);
  const [examDays, setExamDays] = useState(14);

  const handleStreakClick = () => {
    setInteractiveStreak(prev => (prev >= 30 ? 0 : prev + 1));
  };

  const handleExamClick = () => {
    setExamDays(prev => (prev > 0 ? prev - 1 : 14));
  };

  const streakConfig = useMemo(() => {
    if (interactiveStreak >= 14) return { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-100", shadow: "shadow-[0_0_20px_rgba(34,211,238,0.6)]", scale: 1.25, label: "LEGEND" };
    if (interactiveStreak >= 7) return { color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/40", text: "text-fuchsia-100", shadow: "shadow-[0_0_15px_rgba(232,121,249,0.5)]", scale: 1.15, label: "EPIC" };
    if (interactiveStreak >= 3) return { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-100", shadow: "shadow-[0_0_10px_rgba(251,146,60,0.4)]", scale: 1.05, label: "HOT" };
    return { color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10", text: "text-amber-200/70", shadow: "shadow-none", scale: 1, label: "ACTIVE" };
  }, [interactiveStreak]);

  useEffect(() => {
    setQuote(MAGIC_QUOTES[Math.floor(Math.random() * MAGIC_QUOTES.length)]);
  }, []);

  const doneCount = pptDots.filter(d => d.done).length;
  const progressPct = target > 0 ? Math.min(Math.round((doneCount / target) * 100), 100) : 0;
  const circ = 213.6;
  const strokeOffset = circ - (circ * progressPct) / 100;

  const lifestyleGreeting = useMemo(() => {
    const h = new Date().getHours();
    if (lang === 'id') {
      if (h < 5) return "Selamat istirahat, peri malam.";
      if (h < 11) return "Semangat mengawali harimu!";
      if (h < 15) return "Mari terus kepakkan sayapmu!";
      if (h < 18) return "Sore yang tenang untuk belajar.";
      return "Waktunya merapikan buku ajaibmu!";
    }
    if (h < 5) return "Rest well, night pixie.";
    if (h < 11) return "Have a magical morning!";
    if (h < 15) return "Keep flapping those wings!";
    if (h < 18) return "A peaceful evening to learn!";
    return "Time to rest your magic!";
  }, [lang]);

  let rankStr = progressPct >= 100 ? "👑 Ratu Pixie" : progressPct >= 75 ? "🌿 Peri Penjaga" : progressPct >= 50 ? "✨ Peri Cahaya" : "🌱 Peri Pemula";

  let blockLabel = "Belum Diatur";
  if (blockStart && blockEnd) {
    const s = new Date(blockStart).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    const e = new Date(blockEnd).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' });
    blockLabel = `${s} – ${e}`;
  }

  const getThemeBg = () => {
    switch (theme) {
      case 'moon': return 'linear-gradient(160deg, #04060f 0%, #080c1c 45%, #0c1228 100%)';
      case 'sakura': return 'linear-gradient(160deg, #1a050e 0%, #360a1c 45%, #48102a 100%)';
      default: return 'linear-gradient(160deg, #0d2705 0%, #1b380f 45%, #234f10 100%)'; 
    }
  };

  const glowColor = theme === 'moon' ? '#60a5fa' : theme === 'sakura' ? '#fb7185' : '#f5c842'; 

  return (
    <div className="header relative z-10 px-6 pt-8 pb-10 min-h-[340px]">
      {/* BACKGROUND DENGAN EFEK FADE-OUT KE BAWAH */}
      <div 
        className="absolute inset-0 z-[-1] pointer-events-none" 
        style={{ 
          background: getThemeBg(),
          maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
        }} 
      />
      
      {/* 🌟 NAFAS HUTAN */}
      <motion.div 
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute pointer-events-none mix-blend-screen z-0"
        style={{
          top: '-20%', left: '-10%', width: '140%', height: '140%',
          background: `radial-gradient(ellipse at center, ${glowColor}55 0%, transparent 70%)`,
          filter: 'blur(40px)'
        }}
      />

      {/* ☀️ SUNLIGHT BEAM from Top Right */}
      <motion.div 
        animate={{ opacity: [0.1, 0.3, 0.1], x: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] right-[-10%] w-[60%] h-[120%] rotate-[150deg] pointer-events-none z-0"
        style={{
          background: `linear-gradient(to right, transparent, ${glowColor}22, transparent)`,
          filter: 'blur(30px)'
        }}
      />

      {/* ✨ PIXIE DUST */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {Array.from({ length: 25 }).map((_, i) => {
          const size = Math.random() * 3 + 1; 
          const color = Math.random() > 0.5 ? '#fff' : glowColor;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0],
                y: [-20, -200],
                x: [0, (Math.random() - 0.5) * 50]
              }}
              transition={{ 
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
              className="absolute rounded-full"
              style={{
                bottom: `10%`,
                left: `${Math.random() * 100}%`,
                width: `${size}px`, height: `${size}px`,
                backgroundColor: color,
                boxShadow: `0 0 ${size * 3}px ${color}`,
              }}
            />
          );
        })}
      </div>

      {/* --- SCATTERED MAGIC LEAVES (FREE-FLYING LAYER) --- */}
      {/* Set to z-[1] to stay behind all text (z-10) but above primary background */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Leaf 1: Top Right near Quote (Animated) */}
        <div 
          className="absolute top-[15%] right-[15%] w-[30px] h-[50px] sm:w-[45px] sm:h-[75px]" 
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.15)',
            animation: 'flyLeafTopRight 14s infinite ease-in-out', 
            boxShadow: '0 0 16px 2px rgba(245,200,66,0.35), inset 0 0 8px 1px rgba(245,200,66,0.2)',
            background: 'rgba(130, 200, 110, 0.15)'
          }}
        />

        {/* Leaf 2: Mid Left empty area (Animated) */}
        <div 
          className="absolute top-[45%] left-[10%] w-[14px] h-[22px] sm:w-[20px] sm:h-[34px]" 
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.1)',
            animation: 'flyLeafMidLeft 16s infinite ease-in-out', animationDelay: '2s', 
            boxShadow: '0 0 12px 1px rgba(245,200,66,0.25), inset 0 0 6px 1px rgba(245,200,66,0.15)',
            background: 'rgba(140, 210, 120, 0.2)'
          }}
        />

        {/* Leaf 3: Bottom Right empty edge (Animated) */}
        <div 
          className="absolute bottom-[20%] right-[30%] w-[24px] h-[40px] sm:w-[35px] sm:h-[58px]" 
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.15)',
            animation: 'flyLeafBottomRight 18s infinite ease-in-out', animationDelay: '5s', 
            boxShadow: '0 0 14px 2px rgba(245,200,66,0.3), inset 0 0 8px 1px rgba(245,200,66,0.2)',
            background: 'rgba(125, 190, 95, 0.15)'
          }}
        />

        {/* Leaf 4: Top Left (Animated) */}
        <div 
          className="absolute top-[10%] left-[25%] w-[36px] h-[60px] sm:w-[55px] sm:h-[90px]" 
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.15)',
            animation: 'flyLeafTopLeft 15s infinite ease-in-out', animationDelay: '1s', 
            boxShadow: '0 0 18px 2px rgba(245,200,66,0.35), inset 0 0 10px 1px rgba(245,200,66,0.2)',
            background: 'rgba(110, 175, 80, 0.1)'
          }}
        />
        
        {/* Static accent leaf 1: Left side near progress background */}
        <div 
          className="absolute top-[70%] left-[20%] opacity-40 w-[12px] h-[20px] sm:w-[18px] sm:h-[30px]"
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.1)',
            transform: 'rotate(-45deg)',
            boxShadow: '0 0 10px 1px rgba(245,200,66,0.2), inset 0 0 4px 1px rgba(245,200,66,0.1)',
            background: 'rgba(140, 210, 120, 0.15)'
          }}
        />

        {/* Static accent leaf 2: Top left background */}
        <div 
          className="absolute top-[15%] left-[45%] opacity-30 w-[24px] h-[40px] sm:w-[38px] sm:h-[64px]"
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.1)',
            transform: 'rotate(50deg)',
            boxShadow: '0 0 8px 1px rgba(245,200,66,0.2), inset 0 0 4px 1px rgba(245,200,66,0.1)',
            background: 'rgba(130, 200, 110, 0.12)'
          }}
        />

        {/* Static accent leaf 3: Bottom center background */}
        <div 
          className="absolute bottom-[15%] left-[50%] opacity-30 w-[16px] h-[28px] sm:w-[24px] sm:h-[40px]"
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.1)',
            transform: 'rotate(15deg)',
            boxShadow: '0 0 12px 1px rgba(245,200,66,0.2), inset 0 0 6px 1px rgba(245,200,66,0.15)',
            background: 'rgba(125, 190, 95, 0.18)'
          }}
        />

        {/* Static accent leaf 4: Top right background */}
        <div 
          className="absolute top-[35%] right-[25%] opacity-25 w-[10px] h-[16px] sm:w-[14px] sm:h-[24px]"
          style={{ 
            borderRadius: '90% 0 90% 0',
            border: '1px solid rgba(245, 200, 66, 0.1)',
            transform: 'rotate(-70deg)',
            boxShadow: '0 0 8px 1px rgba(245,200,66,0.2), inset 0 0 4px 1px rgba(245,200,66,0.1)',
            background: 'rgba(140, 210, 120, 0.2)'
          }}
        />
      </div>

      {/* --- KONTEN TEKS --- */}
      <div className="flex justify-between items-start relative z-10 pb-4">
        <div className="text-[11px] tracking-[0.25em] uppercase text-white/50 font-bold" style={{ textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
          {t('hdr_eyebrow')}
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-gold/40 text-gold font-black text-xs cursor-pointer shadow-lg"
        >
          <Sparkles size={12} className="animate-pulse" />
          <span>{coins}</span>
        </motion.div>
      </div>

      <div className="relative z-10 mt-2 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center flex-wrap gap-4">
            <motion.h1 
              animate={{ 
                textShadow: [
                  '0 0 20px rgba(255,255,255,0.7)',
                  '0 0 35px rgba(255,255,255,0.9)',
                  '0 0 20px rgba(255,255,255,0.7)'
                ],
                filter: [
                  'drop-shadow(0 0 10px rgba(245,200,66,0.6))',
                  'drop-shadow(0 0 25px rgba(245,200,66,0.8))',
                  'drop-shadow(0 0 10px rgba(245,200,66,0.6))'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-4xl sm:text-[2.6rem] font-bold italic m-0 leading-none text-white font-serif tracking-tight"
            >
              {name},
            </motion.h1>
            
            <span className="inline-block px-3 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold font-bold text-[10px] tracking-widest uppercase backdrop-blur-md shadow-[0_0_20px_rgba(245,200,66,0.3)]">
              {rankStr}
            </span>
          </div>

          <div>
            <motion.div 
              animate={{ 
                textShadow: [
                  '0 0 15px rgba(255,235,153,0.5)',
                  '0 0 35px rgba(255,235,153,0.9)',
                  '0 0 15px rgba(255,235,153,0.5)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-2xl text-gold-light mt-1 font-medium leading-tight font-serif"
            >
              {lifestyleGreeting}
            </motion.div>
            <div className="text-[11px] text-white/40 mt-1 font-bold tracking-[0.1em] uppercase drop-shadow-md">
              {new Date().toLocaleDateString(lang === 'id' ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long" })}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 space-y-5">
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={quote}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              textShadow: [
                '0 0 25px rgba(255,255,255,0.5)',
                '0 0 45px rgba(255,255,255,0.8)',
                '0 0 25px rgba(255,255,255,0.5)'
              ],
              filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
            }}
            transition={{ duration: 0.8 }}
            className="relative pr-16"
          >
            <motion.div 
              className="text-xl text-white font-medium leading-relaxed max-w-[85%] italic relative z-10"
              style={{ fontFamily: '"Cormorant Garamond", serif' }}
            >
              <span className="text-gold text-2xl font-serif mr-1">“</span>
              {quote}
              <span className="text-gold text-2xl font-serif ml-1">”</span>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 mt-6 sm:mt-10 p-5 bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/10 relative z-10 shadow-2xl text-center sm:text-left">
        <motion.div 
          animate={{ 
            y: [-4, 4, -4],
            filter: [
              'drop-shadow(0 0 15px rgba(245,200,66,0.3))',
              'drop-shadow(0 0 25px rgba(245,200,66,0.5))',
              'drop-shadow(0 0 15px rgba(245,200,66,0.3))'
            ]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative w-28 h-28 shrink-0 flex items-center justify-center"
        >
          <svg width="112" height="112" viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
            <circle cx="40" cy="40" r="34" fill="none" stroke="url(#goldGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="213.6" strokeDashoffset={strokeOffset} className="transition-all duration-1000 ease-out" />
            
            {progressPct > 0 && (
              <g className="transition-all duration-1000 ease-out" style={{ transform: `rotate(${progressPct * 3.6}deg)`, transformOrigin: '40px 40px' }}>
                <circle cx="74" cy="40" r="7" fill="rgba(245, 200, 66, 0.15)" className="animate-pulse" filter="blur(2px)" />
                <circle cx="74" cy="40" r="4" fill="rgba(245, 200, 66, 0.3)" className="animate-pulse" filter="blur(1px)" />
                <circle cx="74" cy="40" r="2.5" fill="#ffffff" filter="drop-shadow(0px 0px 4px rgba(255,255,255,1))" />
              </g>
            )}

            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3ad" />
                <stop offset="50%" stopColor="#f5c842" />
                <stop offset="100%" stopColor="#b8900a" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
            <span className="text-[26px] font-black text-white drop-shadow-md leading-none">{progressPct}%</span>
            <span className="text-[9px] font-bold text-gold uppercase tracking-wider drop-shadow-[0_0_8px_rgba(245,200,66,0.8)] mt-0.5">Selesai</span>
          </div>
        </motion.div>
        
        <div className="flex-1 flex flex-col justify-center items-center sm:items-start gap-2 w-full">
          <div className="text-[10px] font-black text-white/40 tracking-[0.15em] uppercase">
            TARGET BELAJAR
          </div>
          
          <div className="flex items-baseline justify-center sm:justify-start gap-1.5 -mt-1">
            <span className="text-3xl font-serif font-black text-white drop-shadow-md">{doneCount}</span>
            <span className="text-lg font-medium text-white/50">/ {target}</span>
            <span className="text-xs font-bold text-gold tracking-wider uppercase ml-1">Slide</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 bg-black/30 w-fit px-3 py-1.5 rounded-full border border-white/5 shadow-inner">
              <Sparkles size={11} className="text-gold animate-pulse" />
              <span className="drop-shadow-sm">{blockLabel}</span>
            </div>
            
          </div>
        </div>

        <div className="w-full sm:w-auto sm:ml-auto flex shrink-0 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/10 mt-2 sm:mt-0">
          <div className="flex gap-3 justify-center w-full sm:w-[12rem]">
            
            {/* Ujian Widget */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExamClick}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-300 flex-1 aspect-[4/3] sm:aspect-square relative overflow-hidden group ${
                examDays === 0
                  ? 'border-rose-400 text-white shadow-[0_0_20px_rgba(243,24,100,0.6)]'
                  : examDays <= 3 
                    ? 'border-rose-500/50 text-rose-100 shadow-[0_0_15px_rgba(243,24,100,0.4)]' 
                    : examDays <= 7 
                      ? 'border-orange-500/40 text-orange-100 shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                      : 'border-emerald-500/30 text-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
              }`}
            >
              {/* Dynamic Background Effects */}
              {examDays > 7 && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none bg-emerald-500/10">
                  <motion.div animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }} className="absolute w-8 h-8 rounded-full border border-emerald-400/50" />
                  <motion.div animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.25, ease: "easeOut" }} className="absolute w-8 h-8 rounded-full border border-emerald-400/50" />
                </div>
              )}

              {examDays > 3 && examDays <= 7 && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-orange-500/10 backdrop-blur-md">
                  <motion.div animate={{ x: ['-200%', '200%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent skew-x-[-20deg]" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
                </div>
              )}

              {examDays <= 3 && examDays > 0 && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-rose-900/40 rounded-xl">
                  <motion.div 
                    animate={{ opacity: [0.3, 0.7, 0.3] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
                    className="absolute inset-0 shadow-[inset_0_0_20px_rgba(243,24,100,0.6)] bg-rose-500/20 rounded-xl" 
                  />
                  <motion.div 
                    animate={{ opacity: [0, 0.4, 0] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} 
                    className="absolute inset-0 bg-rose-500/10 rounded-xl" 
                  />
                </div>
              )}

              {examDays === 0 && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-rose-600/30 rounded-xl">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.8, 0.3] }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                    className="absolute inset-[20%] rounded-full mix-blend-screen bg-rose-400/50 blur-[20px]" 
                  />
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }} 
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} 
                    className="absolute inset-0 shadow-[inset_0_0_30px_rgba(255,50,100,0.9)] rounded-xl" 
                  />
                </div>
              )}

              {/* Hover Highlight Overlay */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity z-0 pointer-events-none" />

              <CalendarDays size={22} className={`relative z-10 filter drop-shadow-md ${examDays === 0 ? 'text-rose-300 animate-pulse' : examDays <= 3 ? 'text-rose-400 animate-pulse' : examDays <= 7 ? 'text-orange-400' : 'text-emerald-400'}`} />
              <div className="text-[10px] font-bold text-center leading-tight relative w-full z-10 mt-auto">
                <div className="uppercase opacity-80 text-[8px] tracking-wider mb-0.5">{examDays === 0 ? 'Hari H' : 'Ujian'}</div>
                <div className="flex items-baseline justify-center gap-0.5 h-6">
                  <AnimatePresence mode="popLayout">
                    {examDays === 0 ? (
                      <motion.div
                        key="theday"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [1, 1.05, 1], opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ 
                          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
                          opacity: { duration: 0.4 }
                        }}
                        className="text-[14px] font-black tracking-tighter text-rose-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] flex items-center"
                      >
                        THE DAY
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="days"
                        initial={{ opacity: 0, y: 5 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -5 }}
                        className="flex items-baseline gap-0.5"
                      >
                        <motion.span key={examDays} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-lg font-black tracking-tighter">
                          {examDays}
                        </motion.span>
                        <span className="text-[8px] font-medium opacity-80 uppercase tracking-widest ml-0.5">Hari</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>

            {/* Streak Widget */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStreakClick}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-500 flex-1 aspect-[4/3] sm:aspect-square relative group ${streakConfig.text} ${streakConfig.shadow}`}
            >
              {/* Widget Background & Static Border */}
              <div className={`absolute inset-0 rounded-xl border ${streakConfig.border} ${streakConfig.bg} backdrop-blur-md z-10 transition-all duration-500`} />

              {/* Fire Emitting Border */}
              {interactiveStreak >= 3 && (
                <div className="absolute inset-[-10px] pointer-events-none z-0">
                  {/* Glow Ring */}
                  <motion.div 
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity }} 
                    className={`absolute inset-[8px] rounded-xl blur-[12px] ${streakConfig.bg.replace('/10', '/80').replace('/5', '/80')}`} 
                  />
                  
                  {/* Animated Fire Border Outline */}
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute inset-[10px] rounded-xl border-2 blur-[1px] ${
                        interactiveStreak >= 14 ? 'border-cyan-400' :
                        interactiveStreak >= 7 ? 'border-fuchsia-400' :
                        'border-orange-500'
                    }`} 
                  />

                  {/* Burning Fire Base inside the box */}
                  <div className="absolute inset-[10px] overflow-hidden rounded-xl z-0 pointer-events-none">
                    {/* Fire Particles attached to bottom */}
                    <div className="absolute bottom-0 left-[-5%] right-[-5%] h-[40px]">
                      {Array.from({ length: Math.min(interactiveStreak * 4, 35) }).map((_, i) => {
                        const randomLeft = Math.random() * 100;
                        const randomDelay = Math.random() * 1.5;
                        const randomDuration = 0.5 + Math.random() * 0.7;
                        const randomHeight = 15 + Math.random() * 25; // height between 15px and 40px
                        const randomWidth = 8 + Math.random() * 14;
                        
                        return (
                          <motion.div
                            key={i}
                            animate={{ 
                                height: [randomHeight * 0.4, randomHeight, randomHeight * 0.4],
                                opacity: [0.4, 0.9, 0.4],
                            }}
                            transition={{ 
                              duration: randomDuration, 
                              repeat: Infinity, 
                              delay: randomDelay, 
                              ease: "easeInOut" 
                            }}
                            style={{ 
                                left: `${randomLeft}%`, 
                                width: `${randomWidth}px`,
                                originY: 1
                            }}
                            className={`absolute bottom-[-5px] rounded-t-[100%] blur-[3px] mix-blend-screen ${
                              interactiveStreak >= 14 ? 'bg-gradient-to-t from-cyan-400 to-transparent' :
                              interactiveStreak >= 7 ? 'bg-gradient-to-t from-fuchsia-500 to-transparent' :
                              'bg-gradient-to-t from-orange-500 to-transparent'
                            }`}
                          />
                        );
                      })}
                    </div>
                    {/* Base glow along the bottom edge */}
                    <div className={`absolute bottom-0 left-0 right-0 h-4 blur-[8px] opacity-60 ${
                      interactiveStreak >= 14 ? 'bg-cyan-500' :
                      interactiveStreak >= 7 ? 'bg-fuchsia-500' :
                      'bg-orange-500'
                    }`} />
                  </div>
                </div>
              )}
              
              <motion.div animate={{ scale: streakConfig.scale }} transition={{ type: "spring", bounce: 0.5 }} className="relative z-20 my-0.5">
                <Flame size={24} className={`${streakConfig.color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] ${interactiveStreak >= 3 ? 'animate-pulse' : ''}`} />
              </motion.div>
              
              <div className="text-[10px] font-bold text-center leading-tight relative w-full mt-auto z-20">
                <div className="flex items-baseline justify-center gap-0.5">
                  <AnimatePresence mode="popLayout">
                    <motion.span key={interactiveStreak} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-lg font-black tracking-tighter">
                      {interactiveStreak}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[9px] font-medium opacity-80 uppercase tracking-widest ml-0.5">Hari</span>
                </div>
                <div className="uppercase opacity-80 text-[7px] tracking-widest mt-0.5 whitespace-nowrap font-black">
                  {interactiveStreak >= 7 ? streakConfig.label + ' STREAK' : 'STREAK'}
                </div>
              </div>
            </motion.button>

          </div>
        </div>
      </div>
    </div>
  );
};
