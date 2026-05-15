import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../lib/i18n';
import { Sparkles, Play, Sun, Moon, Flower2, Gift, Flame, CalendarDays } from 'lucide-react';

const SakuraSVG = ({ animated = false }: { animated?: boolean }) => (
  <svg viewBox="0 0 100 100" className={`w-full h-full ${animated ? 'animate-[spin_6s_linear_infinite]' : 'animate-[spin_20s_linear_infinite]'}`} xmlns="http://www.w3.org/2000/svg">
    <g className="text-pink-300 drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] opacity-60" fill="currentColor">
      <path d="M50 50 C25 25 20 5 40 5 L50 15 L60 5 C80 5 75 25 50 50 Z" />
      <path d="M50 50 C25 25 20 5 40 5 L50 15 L60 5 C80 5 75 25 50 50 Z" transform="rotate(72 50 50)" />
      <path d="M50 50 C25 25 20 5 40 5 L50 15 L60 5 C80 5 75 25 50 50 Z" transform="rotate(144 50 50)" />
      <path d="M50 50 C25 25 20 5 40 5 L50 15 L60 5 C80 5 75 25 50 50 Z" transform="rotate(216 50 50)" />
      <path d="M50 50 C25 25 20 5 40 5 L50 15 L60 5 C80 5 75 25 50 50 Z" transform="rotate(288 50 50)" />
      <circle cx="50" cy="50" r="5" fill="#fbcfe8" />
    </g>
  </svg>
);

const BackgroundParticle = ({ 
  className, theme, animation, moonAnimation, sakuraAnimation, animationDelay, 
  transform, size, opacity = ''
}: {
  className: string; theme: string; animation?: string; moonAnimation?: string; sakuraAnimation?: string; animationDelay?: string; 
  transform?: string; size: {sakura: string, moonStrk: string, moonStar: string, light: string}; opacity?: string;
}) => {
  let computedAnimation = theme === 'moon' && moonAnimation ? moonAnimation : theme === 'sakura' && sakuraAnimation ? sakuraAnimation : animation;
  if (computedAnimation && animationDelay) {
    computedAnimation = computedAnimation.replace('infinite', `${animationDelay} infinite`);
  }

  if (theme === 'sakura') {
    return (
      <div className={`absolute ${className}`} style={{ animation: computedAnimation, transform }}>
        <div className={`${size.sakura} ${opacity}`}>
           <SakuraSVG animated={!!animation} />
        </div>
      </div>
    );
  }

  if (theme === 'moon') {
    if (animation) {
      return (
        <div className={`absolute ${className}`} style={{ animation: computedAnimation }}>
          <div className={`${size.moonStrk} ${opacity} relative`}>
             <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-white shadow-[0_0_8px_rgba(255,255,255,0.8)] rounded-full" />
             <div className="absolute top-1/2 right-0 w-[4px] h-[4px] bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,1)] transform -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      );
    } else {
      return (
        <div className={`absolute ${className}`} style={{ transform }}>
          <div className={`${size.moonStar} ${opacity} rounded-full bg-blue-100 shadow-[0_0_12px_2px_rgba(147,197,253,0.8),inset_0_0_4px_rgba(255,255,255,1)]`} />
        </div>
      )
    }
  }

  return (
    <div className={`absolute ${className}`} style={{ animation: computedAnimation, transform }}>
      <div 
        className={`${size.light} ${opacity}`}
        style={{
          borderRadius: '90% 0 90% 0', border: '1px solid rgba(245, 200, 66, 0.15)', 
          boxShadow: '0 0 16px 2px rgba(245,200,66,0.35), inset 0 0 8px 1px rgba(245,200,66,0.2)', 
          background: 'rgba(130, 200, 110, 0.15)'
        }}
      />
    </div>
  );
};

const MAGIC_QUOTES = [
  "Belajar adalah cara kita menumbuhkan sayap untuk terbang.",
  "Semua keajaiban butuh sedikit waktu dan banyak usaha.",
  "Satu halaman lagi, satu kepakan sayap lebih tinggi.",
  "Jangan berhenti saat lelah, berhentilah saat selesai.",
  "Fokus hari ini adalah keajaiban esok hari."
];

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const { name, coins, target, pptDots, theme, blockStart, blockEnd, lang, profile, setShowStreakPopup } = useAppStore();
  const [quote, setQuote] = useState("");
  
  const realStreak = profile?.streak || 0;

  const examDays = useMemo(() => {
    if (!blockEnd) return 0;
    const end = new Date(blockEnd);
    end.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(diff));
  }, [blockEnd]);

  const streakConfig = useMemo(() => {
    if (realStreak >= 30) return { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/40", text: "text-rose-100", shadow: "shadow-[0_0_25px_rgba(244,63,94,0.6)]", scale: 1.35, label: "MYTHIC" };
    if (realStreak >= 14) return { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-100", shadow: "shadow-[0_0_20px_rgba(34,211,238,0.6)]", scale: 1.25, label: "LEGEND" };
    if (realStreak >= 7) return { color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/40", text: "text-fuchsia-100", shadow: "shadow-[0_0_15px_rgba(232,121,249,0.5)]", scale: 1.15, label: "EPIC" };
    if (realStreak >= 3) return { color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-100", shadow: "shadow-[0_0_10px_rgba(251,146,60,0.4)]", scale: 1.05, label: "HOT" };
    if (realStreak >= 1) return { color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10", text: "text-amber-200/70", shadow: "shadow-none", scale: 1, label: "ACTIVE" };
    return { color: "text-white/30", bg: "bg-white/5", border: "border-white/10", text: "text-white/40", shadow: "shadow-none", scale: 1, label: "0 DAYS" };
  }, [realStreak]);

  useEffect(() => {
    if (realStreak >= 3) {
      const lastCelebrated = parseInt(localStorage.getItem('last_celebrated_streak') || "0");
      const currentTier = realStreak >= 30 ? 30 : realStreak >= 14 ? 14 : realStreak >= 7 ? 7 : 3;
      if (lastCelebrated < currentTier) {
        setShowStreakPopup(true);
        localStorage.setItem('last_celebrated_streak', currentTier.toString());
      }
    }
  }, [realStreak, setShowStreakPopup]);

  useEffect(() => {
    setQuote(MAGIC_QUOTES[Math.floor(Math.random() * MAGIC_QUOTES.length)]);
  }, []);

  const doneCount = pptDots.filter(d => d.done).length;
  const progressPct = target > 0 ? Math.min(Math.round((doneCount / target) * 100), 100) : 0;

  const lifestyleGreeting = useMemo(() => {
    const h = new Date().getHours();
    if (lang === 'id') {
      if (h < 5) return "Selamat istirahat, Peri kecilku.";
      if (h < 11) return "Semangat mengawali harimu!";
      if (h < 15) return "Mari terus kepakkan sayapmu!";
      if (h < 18) return "Sore yang tenang untuk belajar.";
      return "Waktunya merapikan buku ajaibmu!";
    }
    if (h < 5) return "Rest well, my little fairy.";
    if (h < 11) return "Have a magical morning!";
    if (h < 15) return "Keep flapping those wings!";
    if (h < 18) return "A peaceful evening to learn!";
    return "Time to rest your magic!";
  }, [lang]);

  let rankStr = progressPct >= 100 ? "👑 Ratu Pixie" : progressPct >= 75 ? "🌿 Peri Penjaga" : progressPct >= 50 ? "✨ Peri Cahaya" : "🌱 Peri Pemula";

  const getThemeBg = () => {
    switch (theme) {
      case 'moon': return 'linear-gradient(160deg, #04060f 0%, #080c1c 45%, #0c1228 100%)';
      case 'sakura': return 'linear-gradient(160deg, #1a050e 0%, #360a1c 45%, #48102a 100%)';
      default: return 'linear-gradient(160deg, #0d2705 0%, #1b380f 45%, #234f10 100%)'; 
    }
  };

  const glowColor = theme === 'moon' ? '#60a5fa' : theme === 'sakura' ? '#fb7185' : '#f5c842'; 

  return (
    <div className="header relative z-10 pt-[calc(2rem+env(safe-area-inset-top))] pb-10 min-h-[340px]">
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

      {/* ✨ REVALINA GLOW */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
        {Array.from({ length: 25 }).map((_, i) => {
          const size = Math.random() * 3 + 1; 
          const color = Math.random() > 0.5 ? '#fff' : glowColor;
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.4, 0],
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
                boxShadow: `0 0 ${size * 2}px ${color}`,
              }}
            />
          );
        })}
      </div>

      {/* --- SCATTERED MAGIC PARTICLES (FREE-FLYING LAYER) --- */}
      {/* Set to z-[1] to stay behind all text (z-10) but above primary background */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {/* Animated Particles */}
        <BackgroundParticle theme={theme} className="top-[15%] right-[15%]" animation="flyLeafTopRight 14s infinite ease-in-out" moonAnimation="shootingStar1 6s infinite ease-in-out" sakuraAnimation="sakuraFall1 13s infinite linear"
          size={{ sakura: 'w-[28px] h-[28px] sm:w-[42px] sm:h-[42px]', moonStrk: 'w-[100px] h-[2px] sm:w-[150px]', moonStar: '', light: 'w-[30px] h-[50px] sm:w-[45px] sm:h-[75px]' }} />

        <BackgroundParticle theme={theme} className="top-[45%] left-[10%]" animation="flyLeafMidLeft 16s infinite ease-in-out" moonAnimation="shootingStar2 8s infinite ease-in-out" sakuraAnimation="sakuraFall2 16s infinite linear" animationDelay="2s"
          size={{ sakura: 'w-[18px] h-[18px] sm:w-[26px] sm:h-[26px]', moonStrk: 'w-[80px] h-[2px] sm:w-[120px]', moonStar: '', light: 'w-[14px] h-[22px] sm:w-[20px] sm:h-[34px]' }} />

        <BackgroundParticle theme={theme} className="bottom-[20%] right-[30%]" animation="flyLeafBottomRight 18s infinite ease-in-out" moonAnimation="shootingStar3 9s infinite ease-in-out" sakuraAnimation="sakuraFall3 14s infinite linear" animationDelay="5s"
          size={{ sakura: 'w-[24px] h-[24px] sm:w-[32px] sm:h-[32px]', moonStrk: 'w-[90px] h-[2px] sm:w-[130px]', moonStar: '', light: 'w-[24px] h-[40px] sm:w-[35px] sm:h-[58px]' }} />

        <BackgroundParticle theme={theme} className="top-[10%] left-[25%]" animation="flyLeafTopLeft 15s infinite ease-in-out" moonAnimation="shootingStar4 10s infinite ease-in-out" sakuraAnimation="sakuraFall4 17s infinite linear" animationDelay="1s"
          size={{ sakura: 'w-[32px] h-[32px] sm:w-[44px] sm:h-[44px]', moonStrk: 'w-[110px] h-[2px] sm:w-[160px]', moonStar: '', light: 'w-[36px] h-[60px] sm:w-[55px] sm:h-[90px]' }} />
        
        {/* Static acccent particles */}
        <BackgroundParticle theme={theme} className="top-[70%] left-[20%]" opacity="opacity-40" transform="rotate(-45deg)"
          size={{ sakura: 'w-[18px] h-[18px] sm:w-[26px] sm:h-[26px]', moonStrk: '', moonStar: 'w-[6px] h-[6px] sm:w-[8px] sm:h-[8px]', light: 'w-[12px] h-[20px] sm:w-[18px] sm:h-[30px]' }} />

        <BackgroundParticle theme={theme} className="top-[15%] left-[45%]" opacity="opacity-30" transform="rotate(50deg)"
          size={{ sakura: 'w-[24px] h-[24px] sm:w-[36px] sm:h-[36px]', moonStrk: '', moonStar: 'w-[10px] h-[10px] sm:w-[14px] sm:h-[14px]', light: 'w-[24px] h-[40px] sm:w-[38px] sm:h-[64px]' }} />

        <BackgroundParticle theme={theme} className="bottom-[15%] left-[50%]" opacity="opacity-30" transform="rotate(15deg)"
          size={{ sakura: 'w-[20px] h-[20px] sm:w-[30px] sm:h-[30px]', moonStrk: '', moonStar: 'w-[8px] h-[8px] sm:w-[12px] sm:h-[12px]', light: 'w-[16px] h-[28px] sm:w-[24px] sm:h-[40px]' }} />

        <BackgroundParticle theme={theme} className="top-[35%] right-[25%]" opacity="opacity-25" transform="rotate(-70deg)"
          size={{ sakura: 'w-[12px] h-[12px] sm:w-[18px] sm:h-[18px]', moonStrk: '', moonStar: 'w-[6px] h-[6px] sm:w-[8px] sm:h-[8px]', light: 'w-[10px] h-[16px] sm:w-[14px] sm:h-[24px]' }} />
      </div>

      {/* --- KONTEN TEKS --- */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto flex flex-col relative z-20 px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center relative z-10 pb-4">
          <div className="text-[9px] sm:text-[11px] tracking-[0.1em] sm:tracking-[0.25em] uppercase text-white/80 font-bold" style={{ textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
          {new Date().toLocaleDateString(lang === 'id' ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        
        <div className="flex flex-col gap-2 items-end">
          <motion.div 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-gold/40 text-gold font-black text-[10px] sm:text-xs cursor-pointer shadow-lg"
          >
            <Sparkles size={12} className="animate-pulse" />
            <span>{coins}</span>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mt-2 mb-2 sm:mb-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center flex-wrap gap-2 md:gap-4">
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
              className="text-3xl sm:text-4xl md:text-[2.6rem] font-bold italic m-0 leading-none text-white font-serif tracking-tight"
            >
              {name},
            </motion.h1>
            
            <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gold/20 border border-gold/40 text-gold font-bold text-[9px] sm:text-[10px] tracking-widest uppercase backdrop-blur-md shadow-[0_0_20px_rgba(245,200,66,0.3)] mt-1 sm:mt-0">
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
              className="text-xl sm:text-2xl text-gold-light mt-1 font-medium leading-tight font-serif"
            >
              {lifestyleGreeting}
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-between gap-4 sm:gap-6 mt-1 sm:mt-2 w-full">
        
        {/* QUOTE */}
        <div className="w-full">
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
              className="relative"
            >
              <motion.div 
                className="text-xl sm:text-2xl pt-2 sm:pt-0 text-white font-medium leading-relaxed w-full italic relative z-10 text-center"
                style={{ fontFamily: '"Cormorant Garamond", serif' }}
              >
                <span className="text-gold text-2xl font-serif mr-1">“</span>
                {quote}
                <span className="text-gold text-2xl font-serif ml-1">”</span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* WIDGETS UJIAN & STREAK */}
        <div className="flex shrink-0 justify-center w-full mt-2 md:mt-4">
          <div className="flex flex-row gap-4 justify-center w-full md:max-w-3xl">
            
            {/* Ujian Widget */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 p-3 md:py-3 md:px-5 rounded-xl border transition-all duration-300 flex-1 aspect-[4/3] md:aspect-auto relative overflow-hidden group ${
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
                  {/* Fixed Shine Effect: Wider range to ensure it covers the entire box */}
                  <motion.div 
                    animate={{ left: ['-100%', '200%'] }} 
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} 
                    className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent skew-x-[-20deg]" 
                  />
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

              <CalendarDays size={24} className={`relative z-10 shrink-0 filter drop-shadow-md ${examDays === 0 ? 'text-rose-300 animate-pulse' : examDays <= 3 ? 'text-rose-400' : examDays <= 7 ? 'text-orange-400' : 'text-emerald-400'}`} />
              
              <div className="text-[10px] md:text-xs font-bold text-center md:text-left leading-tight relative w-full md:w-auto z-10 mt-auto md:mt-0">
                <div className="uppercase opacity-80 text-[8px] md:text-[9px] tracking-wider mb-0.5">{examDays === 0 ? 'Hari H' : 'Ujian'}</div>
                <div className="flex items-baseline justify-center md:justify-start gap-0.5 h-6 md:h-auto">
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
                        className="text-[14px] md:text-base font-black tracking-tighter text-rose-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] flex items-center leading-none"
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
                        <motion.span key={examDays} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-lg md:text-2xl font-black tracking-tighter leading-none">
                          {examDays}
                        </motion.span>
                        <span className="text-[8px] md:text-[10px] font-medium opacity-80 uppercase tracking-widest ml-0.5">Hari</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.button>

            {/* Streak Widget Wrapper */}
            <div className={`flex flex-1 relative aspect-[4/3] md:aspect-auto`}>
              <motion.button
                onClick={() => setShowStreakPopup(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 p-3 md:py-3 md:px-5 rounded-xl border border-transparent transition-all duration-500 w-full h-full relative overflow-hidden group ${streakConfig.text} ${streakConfig.shadow}`}
              >
                {/* Widget Background & Static Border */}
                <div className={`absolute inset-0 rounded-xl border ${streakConfig.border} ${streakConfig.bg} backdrop-blur-md z-10 transition-all duration-500`} />

                {/* Fire Emitting Border */}
                {realStreak >= 3 && (
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
                          realStreak >= 30 ? 'border-rose-500' :
                          realStreak >= 14 ? 'border-cyan-400' :
                          realStreak >= 7 ? 'border-fuchsia-400' :
                          'border-orange-500'
                      }`} 
                    />

                    {/* Burning Fire Base inside the box */}
                    <div className="absolute inset-[10px] overflow-hidden rounded-xl z-0 pointer-events-none">
                      {/* Fire Particles attached to bottom */}
                      <div className="absolute bottom-0 left-[-5%] right-[-5%] h-[40px]">
                        {Array.from({ length: Math.min(realStreak * 4, 35) }).map((_, i) => {
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
                                realStreak >= 30 ? 'bg-gradient-to-t from-rose-500 to-transparent' :
                                realStreak >= 14 ? 'bg-gradient-to-t from-cyan-400 to-transparent' :
                                realStreak >= 7 ? 'bg-gradient-to-t from-fuchsia-500 to-transparent' :
                                'bg-gradient-to-t from-orange-500 to-transparent'
                              }`}
                            />
                          );
                        })}
                      </div>
                      {/* Base glow along the bottom edge */}
                      <div className={`absolute bottom-0 left-0 right-0 h-4 blur-[8px] opacity-60 ${
                        realStreak >= 30 ? 'bg-rose-500' :
                        realStreak >= 14 ? 'bg-cyan-500' :
                        realStreak >= 7 ? 'bg-fuchsia-500' :
                        'bg-orange-500'
                      }`} />
                    </div>
                  </div>
                )}
                
                <motion.div animate={{ scale: streakConfig.scale }} transition={{ type: "spring", bounce: 0.5 }} className="relative z-20 my-0.5 shrink-0">
                  <Flame size={24} className={`${streakConfig.color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] ${realStreak >= 3 ? 'animate-pulse' : ''}`} />
                </motion.div>
                
                <div className="text-[10px] md:text-xs font-bold text-center md:text-left leading-tight relative w-full md:w-auto mt-auto md:mt-0 z-20">
                  <div className="uppercase opacity-80 text-[8px] md:text-[9px] tracking-wider mb-0.5">
                    {realStreak >= 7 ? streakConfig.label : 'DAILY'}
                  </div>
                  <div className="flex items-baseline justify-center md:justify-start gap-0.5 h-6 md:h-auto">
                    <AnimatePresence mode="popLayout">
                      <motion.span key={realStreak} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-lg md:text-2xl font-black tracking-tighter leading-none">
                        {realStreak}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-[8px] md:text-[10px] font-medium opacity-80 uppercase tracking-widest ml-0.5">Hari</span>
                  </div>
                  <div className="uppercase opacity-80 text-[7px] md:text-[8px] tracking-widest mt-0.5 md:mt-1 whitespace-nowrap font-black">
                    STREAK
                  </div>
                </div>
              </motion.button>
            </div>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
