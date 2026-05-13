import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  BookOpen, 
  Timer, 
  Sparkle, 
  Settings 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Beranda' },
    { id: 'tracker', icon: BookOpen, label: 'Belajar' },
    { id: 'timer', icon: Timer, label: 'Fokus' },
    { id: 'gacha', icon: Sparkle, label: 'Ajaib' },
    { id: 'settings', icon: Settings, label: 'Menu' },
  ];

  return (
    <>
      {/* Mobile Bottom Bar (hidden on desktop) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none md:hidden">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-between px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="relative flex flex-col items-center justify-center min-w-[60px]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute -top-1 w-10 h-1 bg-gold rounded-full shadow-[0_0_10px_rgba(245,200,66,0.8)]"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBadgeMobile"
                      className="absolute inset-0 bg-gold/10 rounded-2xl -z-10 blur-sm"
                    />
                  )}
                  <div className={cn(
                    "p-2 rounded-2xl transition-all duration-300 relative",
                    isActive ? "text-gold scale-125 drop-shadow-[0_0_12px_rgba(245,200,66,0.8)]" : "text-white/30 hover:text-white/60"
                  )}>
                    <Icon size={22} className={isActive ? "stroke-[3]" : "stroke-[2]"} />
                  </div>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest mt-0.5",
                    isActive ? "text-gold" : "text-white/30"
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Desktop Left Sidebar (hidden on mobile) */}
      <nav className="hidden md:flex fixed top-0 bottom-0 left-0 z-50 flex-col group w-[72px] hover:w-[240px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/10 hover:bg-black/80 backdrop-blur-md hover:backdrop-blur-2xl border-r border-white/5 shadow-2xl py-10 px-3 overflow-hidden pointer-events-auto">
        
        {/* App Logo/Icon */}
        <div className="flex items-center gap-3 px-0 mb-12">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/20 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,200,66,0.15)] relative">
            <Sparkle className="text-gold" size={24} />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap">
            <div className="text-white font-serif text-xl leading-tight">Revalina</div>
            <div className="text-gold font-bold text-[10px] tracking-[0.2em] uppercase">Journal</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-3 flex-1 w-full relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "relative flex items-center gap-6 px-3 py-3.5 rounded-2xl w-full transition-all duration-500 z-10 group/item",
                  isActive 
                    ? "text-gold" 
                    : "text-white/20 group-hover:text-white/50 hover:!text-white/90 hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabDesktopBackground"
                    className="absolute inset-0 bg-gold/10 border border-gold/20 rounded-2xl -z-10 shadow-[0_0_25px_rgba(245,200,66,0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative shrink-0 flex items-center justify-center w-6">
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDesktopIndicator"
                      className="absolute -left-3 h-6 w-1 bg-gold rounded-r-sm shadow-[0_0_15px_rgba(245,200,66,1)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon 
                    size={24} 
                    className={cn(
                      "transition-all duration-300",
                      isActive 
                        ? "stroke-[2.5] drop-shadow-[0_0_8px_rgba(245,200,66,0.6)]" 
                        : "stroke-[2] scale-90 group-hover/item:scale-105"
                    )} 
                  />
                </div>
                
                <span className={cn(
                  "text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0",
                  isActive ? "text-gold" : ""
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </nav>
    </>
  );
};
