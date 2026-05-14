import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, RotateCcw, Bell, Share2 } from "lucide-react";
import { formatTime } from "../../lib/utils";
import { useAppStore } from "../../store/useAppStore";

export const PomodoroTimer: React.FC = () => {
  const { addCoins, blockName,
    timerAccumulatedTime: accumulatedTime,
    timerLastStartTime: lastStartTime,
    timerIsActive: isActive,
    timerNotifiedCycles: notifiedCycles,
    setTimerNotifiedCycles: setNotifiedCycles,
    toggleTimer,
    resetTimer,
    syncTimer,
    setShowTimerPopup
  } = useAppStore();
  
  const [dailyStats, setDailyStats] = useState({ today: 0, yesterday: 0, currentBlock: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const formatLocalStr = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, '0') + "-" + String(d.getDate()).padStart(2, '0');
      
      const todayStr = formatLocalStr(today);
      const yesterdayStr = formatLocalStr(yesterday);
      
      // Update from local storage basically gives us the most recent
      // since sync saves there too
      let bTime = 0;
      if (useAppStore.getState().blockId) {
        bTime = parseInt(localStorage.getItem(`study_time_block_${useAppStore.getState().blockId}`) || "0");
      }

      setDailyStats({ 
        today: parseInt(localStorage.getItem(`study_time_${todayStr}`) || "0"), 
        yesterday: parseInt(localStorage.getItem(`study_time_${yesterdayStr}`) || "0"),
        currentBlock: bTime
      });
      // In background fetch real from supabase if needed, but localstorage is right if used on same device
    };

    fetchData();
    // Re-run this check every interval if timer is active
    let interval: any = null;
    let syncInterval: any = null;
    if (isActive) {
      interval = setInterval(fetchData, 1000);
      syncInterval = setInterval(() => {
        useAppStore.getState().syncTimer();
      }, 30000); // sync to supabase and local storage every 30 seconds to be safe
    }
    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [isActive]);

  const [now, setNow] = useState(Date.now());
  const [showToast, setShowToast] = useState(false);

  const WORK_CYCLE = 45 * 60; // 45 minutes

  const totalElapsed =
    isActive && lastStartTime > 0
      ? accumulatedTime + Math.max(0, Math.floor((now - lastStartTime) / 1000))
      : accumulatedTime;
  
  const hRunning = isActive && lastStartTime > 0 ? Math.max(0, Math.floor((now - lastStartTime) / 1000)) : 0;
  const liveToday = dailyStats.today + hRunning;
  const liveYesterday = dailyStats.yesterday;
  const liveBlock = dailyStats.currentBlock + hRunning;

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    try {
      if ("speechSynthesis" in window) {
        const msg = new SpeechSynthesisUtterance("Waktunya istirahat!");
        msg.lang = "id-ID";
        window.speechSynthesis.speak(msg);
      }
    } catch (e) {}

    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      setTimeout(() => oscillator.stop(), 500);
    } catch (e) {}
  }, []);

  // Timer interval for UI
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 1000); // 1s interval (might be throttled in background, but `Date.now()` logic makes it resilient for elapsed calculation)
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Document Title update for background visibility
  useEffect(() => {
    if (isActive) {
      document.title = `${formatTime(totalElapsed)} - Timer Fokus`;
    } else {
      document.title = blockName ? `Rebahan AI - ${blockName}` : "Rebahan AI";
    }

    return () => {
      document.title = "Rebahan AI";
    };
  }, [isActive, totalElapsed, blockName]);

  // Check boundaries and dispatch notifications
  const currentCycle = Math.floor(totalElapsed / WORK_CYCLE);
  useEffect(() => {
    if (currentCycle > notifiedCycles && currentCycle > 0) {
      playNotificationSound();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
      addCoins(10); // Reward for 45 min focus

      // Native browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        const notification = new Notification("Waktunya istirahat!", {
          body: "Kerja bagus! Kamu sudah fokus 45 menit.",
          icon: "/logo.svg", // Placeholder if available
        });
        setTimeout(() => notification.close(), 10000); // close after 10s
      }

      setNotifiedCycles(currentCycle);
    }
  }, [currentCycle, notifiedCycles, playNotificationSound, addCoins]);

  const progress = (totalElapsed % WORK_CYCLE) / WORK_CYCLE;

  return (
    <div className="flex flex-col items-center gap-6 w-full relative">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 z-50 bg-gold text-green-deep px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-3"
          >
            <Bell size={18} />
            Kerja bagus! Waktunya istirahat 5 menit.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-8 glass-card flex flex-col items-center w-full max-w-xl mx-auto">
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
              key={totalElapsed}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="font-serif text-6xl text-white tracking-widest"
            >
              {formatTime(totalElapsed)}
            </motion.div>
            <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold mt-2">
              {isActive ? "Waktunya Fokus!" : "Siap Berangkat?"}
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
            {isActive ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" stroke="none" />
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowTimerPopup(true)}
            className="p-4 bg-white/5 rounded-full text-white/40 hover:text-gold hover:bg-gold/10 transition-colors"
          >
            <Share2 size={24} />
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-xl mx-auto">
        <div className="bg-white/10 rounded-xl p-3 flex flex-col items-center justify-center border border-white/20 shadow-sm backdrop-blur-md">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-white/80 mb-1 font-bold">Kemarin</span>
          <span className="font-mono text-base sm:text-lg font-bold text-white/95">{formatTime(liveYesterday)}</span>
        </div>
        <div className="bg-cyan-900/40 rounded-xl p-3 flex flex-col items-center justify-center border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)] backdrop-blur-md">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-cyan-300 mb-1 font-bold drop-shadow-sm">Hari Ini</span>
          <span className="font-mono text-base sm:text-lg font-bold text-cyan-50 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">{formatTime(liveToday)}</span>
        </div>
        <div className="bg-gold/20 rounded-xl p-3 flex flex-col items-center justify-center border border-gold/40 shadow-[0_0_15px_rgba(245,200,66,0.2)] backdrop-blur-md">
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-gold mb-1 font-bold break-words px-1 text-center w-full truncate drop-shadow-sm">Blok Ini</span>
          <span className="font-mono text-base sm:text-lg font-bold text-yellow-50 drop-shadow-[0_0_8px_rgba(245,200,66,0.8)]">{formatTime(liveBlock)}</span>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto glass-card overflow-hidden">
        <iframe
          data-testid="embed-iframe"
          style={{ borderRadius: "12px" }}
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
