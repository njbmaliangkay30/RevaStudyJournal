import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Timer, Trophy, Quote, Play } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

const formatDurationHM = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

export const TimerShareModal: React.FC = () => {
  const {
    showTimerPopup,
    setShowTimerPopup,
    timerAccumulatedTime,
    timerLastStartTime,
    timerIsActive,
    blockName,
    blockId
  } = useAppStore();

  const [particles, setParticles] = useState<{ id: number; x: number; y: number; duration: number; size: number }[]>([]);
  const [todayStored, setTodayStored] = useState(0);
  const [blockStored, setBlockStored] = useState(0);

  useEffect(() => {
    if (showTimerPopup) {
      // Generate particles when modal opens
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 120,
        y: (Math.random() - 0.5) * 120,
        duration: 3 + Math.random() * 5,
        size: 2 + Math.random() * 6,
      }));
      setParticles(newParticles);
      
      const todayStr = new Date().toISOString().split('T')[0];
      setTodayStored(parseInt(localStorage.getItem(`study_time_${todayStr}`) || "0"));
      if (blockId) {
        setBlockStored(parseInt(localStorage.getItem(`study_time_block_${blockId}`) || "0"));
      }
    }
  }, [showTimerPopup, blockId]);

  const now = Date.now();
  const runningSessionTime =
    timerIsActive && timerLastStartTime > 0
      ? Math.max(0, Math.floor((now - timerLastStartTime) / 1000))
      : 0;
  
  const totalElapsedInSession = timerAccumulatedTime + runningSessionTime;
  const totalToday = todayStored + runningSessionTime;
  const totalBlock = blockStored + runningSessionTime;

  let tierData = { color: "text-gold", hex: "#f5c842", bg: "bg-gold/10", border: "border-gold/40", orbBg: "bg-gold/10", shadow: "shadow-[0_0_80px_rgba(245,200,66,0.2)]", ringCount: 1 };

  if (totalElapsedInSession >= 14400) tierData = { color: "text-purple-400", hex: "#c084fc", bg: "bg-purple-500/20", border: "border-purple-500/50", orbBg: "bg-purple-500/10", shadow: "shadow-[0_0_100px_rgba(192,132,252,0.3)]", ringCount: 3 }; // 4 hours: Amethyst/Mythic
  else if (totalElapsedInSession >= 7200) tierData = { color: "text-cyan-400", hex: "#22d3ee", bg: "bg-cyan-500/20", border: "border-cyan-500/50", orbBg: "bg-cyan-500/10", shadow: "shadow-[0_0_80px_rgba(34,211,238,0.3)]", ringCount: 2 }; // 2 hours: Diamond/Legend
  else if (totalElapsedInSession >= 3600) tierData = { color: "text-rose-400", hex: "#fb7185", bg: "bg-rose-500/20", border: "border-rose-500/50", orbBg: "bg-rose-500/10", shadow: "shadow-[0_0_80px_rgba(251,113,133,0.3)]", ringCount: 2 }; // 1 hour: Ruby/Epic

  if (!showTimerPopup) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-md touch-none overflow-hidden"
        onClick={() => setShowTimerPopup(false)}
      >
        {/* Floating Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          {/* Big glowing orb in center */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 360], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={`absolute w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] rounded-full blur-[100px]`}
            style={{ backgroundColor: tierData.hex }}
          />
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: "110vh", x: `${p.x}vw`, opacity: 0, scale: 0 }}
              animate={{ 
                y: "-10vh", 
                opacity: [0, 1, 0.2],
                scale: [0, 1, 0.5],
                rotate: 240
              }}
              transition={{ 
                duration: p.duration, 
                repeat: Infinity, 
                ease: "linear",
                delay: Math.random() * 2
              }}
              className="absolute rounded-full mix-blend-screen"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: tierData.hex,
                boxShadow: `0 0 ${p.size * 2}px ${tierData.hex}`
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
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.7, duration: 1, delay: 0.1 }}
              className={`relative z-20 w-32 h-32 mb-10 rounded-full bg-black/40 border-[3px] ${tierData.border} flex flex-col items-center justify-center ${tierData.shadow} backdrop-blur-xl`}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Timer size={60} className={tierData.color} strokeWidth={1} />
              </motion.div>

              {/* Dynamic Outer Pulses */}
              {Array.from({ length: tierData.ringCount }).map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ scale: [1, 1.3 + (i * 0.2), 1.6 + (i * 0.3)], opacity: [0.8 - (i * 0.2), 0, 0] }}
                  transition={{ duration: 2.5 + (i * 0.5), repeat: Infinity, ease: "easeOut", delay: i * 0.3 }}
                  className={`absolute inset-[-20px] rounded-full border-[2px] ${tierData.border} z-10`}
                />
              ))}

              {/* Extra Sparkles for High Tiers */}
              {tierData.ringCount > 1 && (
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-40px] rounded-full border border-dashed border-white/20 z-10"
                />
              )}
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
              className="relative z-20 text-center space-y-2 mb-12 w-full"
            >
              <div className={`text-sm sm:text-base font-bold tracking-[0.3em] uppercase ${tierData.color} mb-6 flex-wrap px-4 opacity-80`}>
                {blockName || "Deep Work Session"}
              </div>
              
              <div className="flex flex-col items-center justify-center gap-1">
                <motion.div 
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring", bounce: 0.6 }}
                  className="text-[5rem] sm:text-[6rem] font-mono font-black tracking-tighter text-white leading-none drop-shadow-[0_0_30px_rgba(245,200,66,0.3)] tabular-nums"
                >
                  {formatDurationHM(totalElapsedInSession)}
                </motion.div>
                <div className="text-sm sm:text-base font-bold text-white/50 tracking-[0.3em] uppercase mt-2">
                  Sesi Ini
                </div>
              </div>
            </motion.div>

            {/* Daily & Block Report */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="w-full flex gap-4 mt-2"
            >
              <div className="flex-1 flex flex-col items-center justify-center p-5 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gold/5 blur-xl group-hover:bg-gold/10 transition-colors" />
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums drop-shadow-lg z-10">
                  {formatDurationHM(totalToday)}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-white/40 tracking-widest uppercase mt-1 z-10">
                  Total Hari Ini
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-5 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-colors" />
                <div className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums drop-shadow-lg z-10">
                  {formatDurationHM(totalBlock)}
                </div>
                <div className="text-[10px] sm:text-xs font-bold text-white/40 tracking-widest uppercase mt-1 z-10 text-center">
                  Total Blok Ini
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="relative z-20 text-[10px] sm:text-xs uppercase tracking-[0.4em] text-white/30 font-bold px-6 py-3 rounded-full mt-12 bg-white/5"
            >
              Ketuk untuk menutup
            </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

