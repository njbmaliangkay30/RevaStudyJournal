import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { PPTDot } from '../../types';
import { Check, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

interface PPTTrackerProps {
  blockId?: string;
}

export const PPTTracker: React.FC<PPTTrackerProps> = ({ blockId }) => {
  const [dots, setDots] = useState<PPTDot[]>([]);
  const [loading, setLoading] = useState(false);
  const { addCoins } = useAppStore();

  useEffect(() => {
    if (blockId) fetchDots();
    else {
      // Mock data for demonstration if no blockId
      setDots(Array.from({ length: 40 }, (_, i) => ({
        id: `mock-${i}`,
        block_id: 'mock',
        index: i + 1,
        is_done: i < 5,
      })));
    }
  }, [blockId]);

  const fetchDots = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ppt_dots')
      .select('*')
      .eq('block_id', blockId)
      .order('index');
    if (data) setDots(data);
    setLoading(false);
  };

  const toggleDot = async (dot: PPTDot) => {
    const newStatus = !dot.is_done;
    
    // Optimistic Update
    setDots(prev => prev.map(d => d.id === dot.id ? { ...d, is_done: newStatus } : d));

    if (newStatus) {
      await addCoins(5); // Magical reward
    }

    if (!dot.id.startsWith('mock-')) {
      await supabase
        .from('ppt_dots')
        .update({ 
          is_done: newStatus,
          completed_at: newStatus ? new Date().toISOString() : null
        })
        .eq('id', dot.id);
    }
  };

  return (
    <div className="p-6 glass-card mt-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-xl text-white">Kemajuan Slide</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
            Klik peri untuk tandai kemajuan
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-full p-2 text-white/30 cursor-help">
          <Info size={16} />
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-8 gap-4">
        {dots.map((dot) => (
          <motion.button
            key={dot.id}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleDot(dot)}
            className={cn(
              "relative w-full aspect-square rounded-full border-2 transition-all flex items-center justify-center font-serif text-lg",
              dot.is_done 
                ? "border-gold bg-gradient-to-br from-gold to-gold-deep text-green-deep shadow-[0_0_20px_rgba(245,200,66,0.6)]" 
                : "border-white/10 text-white/20 hover:border-gold/30 hover:bg-gold/5"
            )}
          >
            <AnimatePresence>
              {dot.is_done ? (
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                >
                  <Check size={18} strokeWidth={4} />
                </motion.div>
              ) : (
                <span className="text-xs font-bold font-sans">{dot.index}</span>
              )}
            </AnimatePresence>
            
            {/* Visual glow ring for done dots */}
            {dot.is_done && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gold blur-md -z-10"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

const SparkleTiny = ({ size, className, style }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className} 
    style={style}
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);
