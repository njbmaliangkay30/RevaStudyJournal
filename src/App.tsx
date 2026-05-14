/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { TabBar } from "./components/layout/TabBar";
import { Dashboard } from "./components/features/Dashboard";
import { PPTTracker } from "./components/features/PPTTracker";
import { PomodoroTimer } from "./components/features/PomodoroTimer";
import { Flashcards } from "./components/features/Flashcards";
import { MemoryGame } from "./components/features/MemoryGame";
import { FloatingTimer } from "./components/features/FloatingTimer";
import { SecretLoginModal } from "./components/modals/SecretLoginModal";
import { BlockSetupModal } from "./components/modals/BlockSetupModal";
import { ExamScoreModal } from "./components/modals/ExamScoreModal";
import { StreakShareModal } from "./components/modals/StreakShareModal";
import { TimerShareModal } from "./components/modals/TimerShareModal";
import { Fairylights } from "./components/ui/Fairylights";
import { motion, AnimatePresence } from "motion/react";
import { Star, Shield, Palette, Volume2, Sparkle } from "lucide-react";
import { useAppStore } from "./store/useAppStore";
import { cn } from "./lib/utils";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isFinishingLoading, setIsFinishingLoading] = useState(false);
  const {
    theme,
    setTheme,
    checkExamDay,
    isFirstTimeSetup,
    needsExamScore,
    fetchProfile,
    isInitializing,
  } = useAppStore();

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return "Selamat Pagi, Peri kecilku ☀️";
    if (hour >= 11 && hour < 15) return "Selamat Siang, Semangat Terus! 🌈";
    if (hour >= 15 && hour < 18) return "Selamat Sore, Waktunya Berproses 🌅";
    return "Selamat Malam, Mari Belajar Tenang ✨";
  };

  const [greeting] = useState(getTimeGreeting());

  useEffect(() => {
    const initAuth = async () => {
      const startTime = Date.now();
      try {
        let userId = localStorage.getItem("revalina_uid");
        if (!userId) {
          // Do not create a new profile immediately. Let the secret modal show up first.
          useAppStore.setState({
            isInitializing: false,
            isFirstTimeSetup: true,
          });
        } else {
          await fetchProfile(userId);
        }
      } catch (err) {
        console.error("Failed to init profile:", err);
      } finally {
        // Ensure magic time for smooth transition
        const elapsed = Date.now() - startTime;
        const minTime = 2500; // Slightly longer for better feel
        if (elapsed < minTime) {
          setTimeout(() => setIsFinishingLoading(true), minTime - elapsed);
        } else {
          setIsFinishingLoading(true);
        }
      }
    };
    initAuth();
  }, [fetchProfile]);

  useEffect(() => {
    checkExamDay();
    const interval = setInterval(() => {
      checkExamDay();
    }, 60000); // Check every minute just in case
    return () => clearInterval(interval);
  }, [checkExamDay]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "tracker":
        return (
          <div className="space-y-12">
            <PPTTracker />
            <Flashcards />
          </div>
        );
      case "timer":
        return <PomodoroTimer />;
      case "gacha":
        return (
          <div className="space-y-12">
            <MemoryGame />
            <div className="flex flex-col items-center justify-center p-12 text-center glass-card mt-6">
              <div className="w-32 h-32 bg-gold/10 rounded-full border border-gold/30 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(245,200,66,0.1)]">
                🔮
              </div>
              <h2 className="font-serif text-2xl text-white">
                Revalina Journal Gacha
              </h2>
              <p className="text-white/40 text-sm mt-2 mb-6">
                Gunakan 50 Sparkles untuk menarik hadiah langka!
              </p>
              <button className="bg-gold text-green-deep font-bold px-8 py-3 rounded-full shadow-[0_5px_15px_rgba(245,200,66,0.3)] hover:scale-105 active:scale-95 transition-all">
                Tarik Hadiah
              </button>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-white mb-6">
              Journal Settings
            </h2>

            <div className="space-y-3">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-2">
                Kustomisasi
              </p>
              <div className="glass-card overflow-hidden">
                <button
                  onClick={() =>
                    setTheme(
                      theme === "light"
                        ? "sakura"
                        : theme === "sakura"
                          ? "moon"
                          : "light",
                    )
                  }
                  className="w-full p-4 text-left text-white/70 hover:bg-white/5 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={18} className="text-gold" />
                    <span>
                      Tema Ajaib:{" "}
                      <span className="text-white capitalize">{theme}</span>
                    </span>
                  </div>
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="opacity-30 group-hover:opacity-100"
                  >
                    →
                  </motion.span>
                </button>
                <div className="h-[1px] bg-white/5 mx-4" />
                <button className="w-full p-4 text-left text-white/70 hover:bg-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} className="text-gold" />
                    <span>Suara Alam (Hujan/Hutan)</span>
                  </div>
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="opacity-30 group-hover:opacity-100"
                  >
                    →
                  </motion.span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-2">
                Keamanan & Layanan
              </p>
              <div className="glass-card overflow-hidden">
                <button className="w-full p-4 text-left text-white/70 hover:bg-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-gold" />
                    <span>Data Privacy</span>
                  </div>
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="opacity-30 group-hover:opacity-100"
                  >
                    →
                  </motion.span>
                </button>
                <div className="h-[1px] bg-white/5 mx-4" />
                <button
                  onClick={() => useAppStore.getState().resetDevice()}
                  className="w-full p-4 text-left text-red-400 hover:bg-white/5 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-red-400" />
                    <span>Logout Account</span>
                  </div>
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="opacity-30 group-hover:opacity-100"
                  >
                    →
                  </motion.span>
                </button>
              </div>
            </div>

            <div className="pt-12 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
                Revalina Study Journal v1.0
              </p>
              <p className="text-[9px] text-white/10 mt-1 uppercase tracking-widest italic">
                Built with magic and code
              </p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen selection:bg-gold/30 relative">
      <Fairylights />

      {/* Fixed background decorations - moved outside transition to stay fixed */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/2 -left-32 w-96 h-96 bg-green-900/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 -right-32 w-[30rem] h-[30rem] bg-gold/[0.03] blur-[150px] rounded-full" />
      </div>

      {/* App Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-1000 relative z-10",
          !isFinishingLoading || isInitializing
            ? "opacity-0 blur-2xl scale-105 pointer-events-none"
            : "opacity-100 blur-0 scale-100",
        )}
      >
        <div className="flex min-h-screen">
          <div className="hidden md:block w-[72px] shrink-0" />
          <div className="flex-1 flex flex-col items-center pb-32 md:pb-12 overflow-x-clip w-full">
            <div className="w-full relative z-10 transition-all duration-300">
              <Header />
            </div>

            <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl relative z-10 transition-all duration-300">
              <main className="px-4 md:px-6 lg:px-8 mt-4 lg:mt-8 relative z-10 pb-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
        </div>
      </div>

      {/* TabBar moved outside transition div to prevent scrolling issues caused by transforms */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals placed outside stacking contexts so they correctly cover TabBar */}
      <FloatingTimer activeTab={activeTab} onTabChange={setActiveTab} />
      <SecretLoginModal />
      <BlockSetupModal />
      <ExamScoreModal />
      <StreakShareModal />
      <TimerShareModal />

      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {(!isFinishingLoading || isInitializing) && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-transparent backdrop-blur-[60px] overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="w-28 h-28 mb-8 relative"
              >
                {/* Logo Glow Ring */}
                <motion.div
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="absolute inset-0 bg-gold/40 blur-3xl rounded-full"
                />

                {/* The Logo Box (matching TabBar style) */}
                <div className="w-full h-full glass-card rounded-[2.5rem] bg-gradient-to-br from-gold/40 to-gold/5 flex items-center justify-center shadow-[0_20px_50px_rgba(245,200,66,0.3)] border border-gold/40">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Sparkle className="text-gold" size={56} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Progress Dots */}
              <div className="flex gap-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: i * 0.2,
                    }}
                    className="w-2.5 h-2.5 bg-gold rounded-full shadow-[0_0_12px_#FFD700]"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
