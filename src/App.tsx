/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { TabBar } from './components/layout/TabBar';
import { Dashboard } from './components/features/Dashboard';
import { PPTTracker } from './components/features/PPTTracker';
import { PomodoroTimer } from './components/features/PomodoroTimer';
import { Flashcards } from './components/features/Flashcards';
import { MemoryGame } from './components/features/MemoryGame';
import { Fairylights } from './components/ui/Fairylights';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Shield, Palette, Volume2 } from 'lucide-react';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { theme, setTheme } = useAppStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tracker':
        return (
          <div className="space-y-12">
            <PPTTracker />
            <Flashcards />
          </div>
        );
      case 'timer':
        return <PomodoroTimer />;
      case 'gacha':
        return (
          <div className="space-y-12">
            <MemoryGame />
            <div className="flex flex-col items-center justify-center p-12 text-center glass-card mt-6">
              <div className="w-32 h-32 bg-gold/10 rounded-full border border-gold/30 flex items-center justify-center text-4xl mb-4 shadow-[0_0_30px_rgba(245,200,66,0.1)]">
                🔮
              </div>
              <h2 className="font-serif text-2xl text-white">Magical Gacha</h2>
              <p className="text-white/40 text-sm mt-2 mb-6">Gunakan 50 Sparkles untuk menarik hadiah langka!</p>
              <button className="bg-gold text-green-deep font-bold px-8 py-3 rounded-full shadow-[0_5px_15px_rgba(245,200,66,0.3)] hover:scale-105 active:scale-95 transition-all">
                Tarik Hadiah
              </button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-white mb-6">Peri Settings</h2>
            
            <div className="space-y-3">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-2">Kustomisasi</p>
              <div className="glass-card overflow-hidden">
                <button 
                  onClick={() => setTheme(theme === 'light' ? 'sakura' : theme === 'sakura' ? 'moon' : 'light')}
                  className="w-full p-4 text-left text-white/70 hover:bg-white/5 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={18} className="text-gold" />
                    <span>Tema Ajaib: <span className="text-white capitalize">{theme}</span></span>
                  </div>
                  <motion.span whileHover={{ x: 5 }} className="opacity-30 group-hover:opacity-100">→</motion.span>
                </button>
                <div className="h-[1px] bg-white/5 mx-4" />
                <button className="w-full p-4 text-left text-white/70 hover:bg-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <Volume2 size={18} className="text-gold" />
                    <span>Suara Alam (Hujan/Hutan)</span>
                  </div>
                  <motion.span whileHover={{ x: 5 }} className="opacity-30 group-hover:opacity-100">→</motion.span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold px-2">Keamanan & Layanan</p>
              <div className="glass-card overflow-hidden">
                <button className="w-full p-4 text-left text-white/70 hover:bg-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-gold" />
                    <span>Data Privacy</span>
                  </div>
                  <motion.span whileHover={{ x: 5 }} className="opacity-30 group-hover:opacity-100">→</motion.span>
                </button>
              </div>
            </div>

            <div className="pt-12 text-center">
              <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Revalina v2.0-ts</p>
              <p className="text-[9px] text-white/10 mt-1 uppercase tracking-widest italic">Built with magic and code</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-gold/30 relative">
      <Fairylights />
      <Header />
      
      <main className="max-w-md mx-auto px-6 mt-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.02, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Universal Magical Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-green-900/20 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-gold/5 blur-[100px] rounded-full" />
      </div>
    </div>
  );
}
