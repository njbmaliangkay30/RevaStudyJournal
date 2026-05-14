import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Crown, Star, Zap, Shield, Sparkles } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export const StreakShareModal: React.FC = () => {
  const { profile, showStreakPopup, setShowStreakPopup } = useAppStore();
  const realStreak = profile?.streak || 0;
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; duration: number; size: number }[]>([]);

  useEffect(() => {
    if (showStreakPopup) {
      // Generate particles when modal opens
      const newParticles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 120, // Spread across -60vw to 60vw
        y: (Math.random() - 0.5) * 120, // Spread across -60vh to 60vh
        duration: 2 + Math.random() * 4,
        size: 3 + Math.random() * 8,
      }));
      setParticles(newParticles);
    }
  }, [showStreakPopup]);

  let streakData = { color: "text-white", hex: "#ffffff", bg: "bg-white/10", border: "border-white/20", label: "0 DAYS", desc: "Mulai streak-mu!", iconColor: "text-white/50", ringCount: 1 };

  if (realStreak >= 30) streakData = { color: "text-rose-500", hex: "#f43f5e", bg: "bg-rose-500/20", border: "border-rose-500/50", label: "MYTHIC", desc: "Satu bulan penuh dedikasi!", iconColor: "text-rose-500", ringCount: 4 };
  else if (realStreak >= 14) streakData = { color: "text-cyan-400", hex: "#22d3ee", bg: "bg-cyan-500/20", border: "border-cyan-500/50", label: "LEGEND", desc: "Kamu tidak terhentikan!", iconColor: "text-cyan-400", ringCount: 3 };
  else if (realStreak >= 7) streakData = { color: "text-fuchsia-400", hex: "#e879f9", bg: "bg-fuchsia-500/20", border: "border-fuchsia-500/50", label: "EPIC", desc: "Satu minggu fokus penuh!", iconColor: "text-fuchsia-400", ringCount: 2 };
  else if (realStreak >= 3) streakData = { color: "text-orange-400", hex: "#fb923c", bg: "bg-orange-500/20", border: "border-orange-500/50", label: "HOT", desc: "Terus menyala!", iconColor: "text-orange-400", ringCount: 1 };
  else if (realStreak >= 1) streakData = { color: "text-amber-500", hex: "#f59e0b", bg: "bg-amber-500/20", border: "border-amber-500/50", label: "ACTIVE", desc: "Awal yang bagus!", iconColor: "text-amber-500", ringCount: 1 };

  if (!showStreakPopup) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md touch-none overflow-hidden"
        onClick={() => setShowStreakPopup(false)}
      >
        {/* Floating Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Big glowing orb in center */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] rounded-full blur-[100px]"
            style={{ backgroundColor: streakData.hex }}
          />

          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: "110vh", x: `${p.x}vw`, opacity: 0, scale: 0 }}
              animate={{ 
                y: "-10vh", 
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                rotate: 360
              }}
              transition={{ 
                duration: p.duration, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 2
              }}
              className="absolute mix-blend-screen rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: streakData.hex,
                boxShadow: `0 0 ${p.size * 2}px ${streakData.hex}`
              }}
            />
          ))}
        </div>

        <motion.div
           initial={{ opacity: 0, scale: 0.8, y: 30 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
           transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
           className="relative w-full max-w-lg flex flex-col items-center z-10"
        >
            {/* Glowing Icon */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.7, duration: 1, delay: 0.1 }}
              className="relative z-20 w-32 h-32 sm:w-40 sm:h-40 mb-10 rounded-full"
            >
              <div className={`absolute inset-0 rounded-full ${streakData.bg} border-[3px] ${streakData.border} flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.5)] z-20 backdrop-blur-xl`}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Flame size={72} className={streakData.iconColor} strokeWidth={1} />
                </motion.div>
              </div>

              {/* Dynamic Outer Pulses */}
              {Array.from({ length: streakData.ringCount }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.3 + (i * 0.2), 1.6 + (i * 0.3)], opacity: [0.8 - (i * 0.2), 0, 0] }}
                  transition={{ duration: 2 + (i * 0.5), repeat: Infinity, ease: "easeOut", delay: i * 0.2 }}
                  className={`absolute inset-[-15px] rounded-full border-[2px] ${streakData.border} z-10`}
                  style={{ willChange: 'transform, opacity' }}
                />
              ))}

              {/* Extra Sparkles for Mythic/Legend */}
              {streakData.ringCount > 1 && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-30px] rounded-full border border-dashed border-white/20 z-10"
                />
              )}
            </motion.div>

            {/* Text Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
              className="relative z-20 text-center space-y-4 mb-12 w-full"
            >
              <motion.div 
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
                className={`text-2xl sm:text-3xl font-black tracking-[0.4em] uppercase ${streakData.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]`}
              >
                {streakData.label}
              </motion.div>
              
              <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-baseline justify-center gap-3">
                  <motion.span 
                    initial={{ rotateX: 90, opacity: 0 }}
                    animate={{ rotateX: 0, opacity: 1 }}
                    transition={{ delay: 0.6, type: "spring", bounce: 0.7 }}
                    className="text-[6rem] sm:text-[8rem] font-mono font-black tracking-tighter text-white leading-none drop-shadow-2xl tabular-nums"
                  >
                    {realStreak}
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-2xl sm:text-4xl font-bold text-white/50 tracking-[0.2em] uppercase"
                  >
                    Hari
                  </motion.span>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm sm:text-base font-bold text-white/70 tracking-[0.3em] pt-6 uppercase"
              >
                {streakData.desc}
              </motion.div>
            </motion.div>

            {/* Tap to close hint */}
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.5 }}
               className="relative z-20 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/30 font-bold px-6 py-3 rounded-full mt-8 bg-white/5"
            >
               Ketuk untuk menutup
            </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
