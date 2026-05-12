import React from 'react';
import { motion } from 'motion/react';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
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
                    layoutId="activeTab"
                    className="absolute -top-1 w-10 h-1 bg-gold rounded-full shadow-[0_0_10px_rgba(245,200,66,0.8)]"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 bg-gold/10 rounded-2xl -z-10 blur-sm"
                  />
                )}
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300 relative",
                  isActive ? "text-gold scale-125 drop-shadow-[0_0_12px_rgba(245,200,66,0.8)]" : "text-white/30 hover:text-white/60"
                )}>
                  <Icon size={22} className={isActive ? "stroke-[3]" : "stroke-[2]"} />
                  {isActive && (
                    <motion.div 
                      layoutId="pixieDust"
                      className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
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
  );
};
