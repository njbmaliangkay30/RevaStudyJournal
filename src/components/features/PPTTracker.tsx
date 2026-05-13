import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export const PPTTracker: React.FC = () => {
  const { pptDots, togglePptDot, setDotTitle, addCoins, theme } = useAppStore();
  const [editingDotIndex, setEditingDotIndex] = useState<number | null>(null);
  const [dotTitleInput, setDotTitleInput] = useState('');

  useEffect(() => {
    if (editingDotIndex !== null) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [editingDotIndex]);

  const handleDotClick = (index: number, dot: any) => {
    if (!dot.done) {
      // Mark as done and prompt for title
      setEditingDotIndex(index);
      setDotTitleInput(dot.title || '');
    } else {
      // Already done, allow unchecking or editing? Un-checking for now.
      togglePptDot(index);
    }
  };

  const handleTitleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDotIndex !== null && dotTitleInput.trim() !== '') {
      setDotTitle(editingDotIndex, dotTitleInput.trim());
      await addCoins(5); // Magic reward
    }
    setEditingDotIndex(null);
  };

  return (
    <div className="p-6 glass-card mt-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-xl text-white">Kemajuan Slide</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
            Klik nomer slide untuk menyelesaikan
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-full p-2 text-white/30 cursor-help">
          <Info size={16} />
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-4">
        {pptDots.map((dot, index) => (
          <div key={dot.id} className="flex flex-col items-center gap-2 group">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDotClick(index, dot)}
              className={cn(
                "relative w-full aspect-square rounded-full border-2 transition-all flex items-center justify-center font-serif text-lg",
                dot.done 
                  ? "border-gold bg-gradient-to-br from-gold to-gold-deep text-green-deep shadow-[0_0_20px_rgba(245,200,66,0.6)]" 
                  : "border-white/10 text-white/20 hover:border-gold/30 hover:bg-gold/5"
              )}
            >
              <AnimatePresence>
                {dot.done ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                  >
                    <Check size={18} strokeWidth={4} />
                  </motion.div>
                ) : (
                  <span className="text-xs font-bold font-sans">{index + 1}</span>
                )}
              </AnimatePresence>
              
              {/* Visual glow ring for done dots */}
              {dot.done && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-gold blur-md -z-10"
                />
              )}
            </motion.button>

            {/* Title display on hover or below */}
            {dot.title && (
              <div className="text-[9px] text-center w-full truncate text-gold/80 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                {dot.title}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pop up title input */}
      {createPortal(
        <AnimatePresence>
          {editingDotIndex !== null && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setEditingDotIndex(null)}
              />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className={`relative w-full max-w-sm backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden p-6 border ${
                  theme === 'moon' 
                    ? 'bg-slate-900/50 border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(79,70,229,0.25)]' :
                  theme === 'sakura' 
                    ? 'bg-rose-950/50 border-rose-500/20 shadow-[0_0_50px_-12px_rgba(225,29,72,0.25)]' :
                  'bg-emerald-950/50 border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)]'
                }`}
              >
                {/* Decorative glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-white/5 blur-3xl rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 text-gold">
                    <FileText size={24} />
                    <h3 className="font-serif text-xl text-white">Slide {editingDotIndex + 1} Selesai!</h3>
                  </div>
                  
                  <form onSubmit={handleTitleSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] text-white/50 uppercase tracking-widest font-bold px-1">Judul / Materi Slide</label>
                      <input
                        autoFocus
                        type="text"
                        value={dotTitleInput}
                        onChange={(e) => setDotTitleInput(e.target.value)}
                        placeholder="Contoh: Anatomi Otak"
                        className="w-full mt-1.5 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold transition-colors text-sm"
                      />
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingDotIndex(null)}
                        className="flex-1 py-3 px-4 rounded-xl text-white/60 hover:bg-white/5 border border-transparent hover:border-white/10 font-bold text-sm transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={!dotTitleInput.trim()}
                        className="flex-1 py-3 px-4 bg-gold/90 hover:bg-gold rounded-xl text-black font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(245,200,66,0.3)]"
                      >
                        Simpan
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
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
