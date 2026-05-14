import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause } from "lucide-react";
import { formatTime } from "../../lib/utils";
import { useAppStore } from "../../store/useAppStore";

export const FloatingTimer: React.FC<{
  activeTab: string;
  onTabChange: (tab: string) => void;
}> = ({ activeTab, onTabChange }) => {
  const {
    timerAccumulatedTime: accumulatedTime,
    timerLastStartTime: lastStartTime,
    timerIsActive: isActive,
    toggleTimer,
  } = useAppStore();

  const [now, setNow] = useState(Date.now());

  // Local tick for the floating timer
  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const totalElapsed =
    isActive && lastStartTime > 0
      ? accumulatedTime + Math.max(0, Math.floor((now - lastStartTime) / 1000))
      : accumulatedTime;

  // Don't show if we are on the timer tab, or if the timer is completely reset/stopped at 0
  const shouldShow = activeTab !== "timer" && (isActive || totalElapsed > 0);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="hidden md:flex fixed md:bottom-8 md:right-8 z-50 items-center gap-3 p-2 pr-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl cursor-pointer hover:bg-black/80 transition-colors"
          onClick={() => onTabChange("timer")}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleTimer();
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isActive ? "bg-white/10 text-white" : "bg-gold text-green-deep"
            }`}
          >
            {isActive ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" stroke="none" />
            )}
          </button>

          <div className="flex flex-col">
            <span className="font-serif text-white font-medium text-lg leading-none">
              {formatTime(totalElapsed)}
            </span>
            <span className="text-[9px] text-gold uppercase tracking-widest font-bold">
              {isActive ? "Fokus" : "Jeda"}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
