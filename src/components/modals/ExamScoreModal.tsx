import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { Trophy, Star, ChevronRight } from 'lucide-react';

export const ExamScoreModal: React.FC = () => {
  const { needsExamScore, submitExamScore, blockName, theme, profile, isSpecialVerified } = useAppStore();
  const [score, setScore] = useState<number | ''>('');
  const PERMANENT_UID = 'c097b441-d5c6-4559-abd3-a8a36274054b';

  useEffect(() => {
    if (needsExamScore) {
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
  }, [needsExamScore]);

  // Handle special verification requirement
  const needsSpecialVerification = profile?.id === PERMANENT_UID && !isSpecialVerified;

  if (!needsExamScore || needsSpecialVerification) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === '' || Number(score) < 0 || Number(score) > 100) return;
    await submitExamScore(Number(score));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-sm backdrop-blur-2xl rounded-[2rem] shadow-[0_0_50px_rgba(245,200,66,0.25)] overflow-hidden border ${
            theme === 'moon' 
              ? 'bg-slate-900/50 border-gold/40' :
            theme === 'sakura' 
              ? 'bg-rose-950/50 border-gold/40' :
            'bg-emerald-950/50 border-gold/40'
          }`}
        >
          {/* Confetti / stars background effect */}
          <div className="absolute inset-0 pointer-events-none opacity-50 bg-gradient-to-b from-white/10 to-transparent">
            <div className="absolute top-10 left-10 text-gold animate-pulse"><Star size={12} /></div>
            <div className="absolute top-20 right-12 text-gold animate-pulse" style={{ animationDelay: '0.5s' }}><Star size={8} /></div>
            <div className="absolute bottom-20 left-16 text-gold animate-pulse" style={{ animationDelay: '1s' }}><Star size={10} /></div>
          </div>

          <div className="p-8 relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <motion.div 
                animate={{ 
                  y: [-5, 5, -5],
                  rotate: [-5, 5, -5]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-gold/40 to-gold/10 flex items-center justify-center border-2 border-gold shadow-[0_0_30px_rgba(245,200,66,0.3)] relative"
              >
                <Trophy className="text-gold" size={36} />
              </motion.div>
            </div>
            
            <h2 className="text-3xl font-serif text-white mb-2">Ujian Selesai!</h2>
            <p className="text-sm text-white/70 mb-6">Kamu telah menyelesaikan <span className="font-bold text-gold">{blockName}</span>. Bagaimana hasilmu hari ini?</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest">Skor Ujian (0-100)</label>
                <div className="relative flex justify-center">
                  <input 
                    type="number" 
                    required
                    min="0"
                    max="100"
                    value={score}
                    onChange={e => setScore(Number(e.target.value))}
                    className="w-32 bg-black/50 border-2 border-white/10 rounded-2xl py-4 text-center text-4xl font-black font-serif text-white focus:outline-none focus:border-gold transition-colors shadow-inner"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={score === '' || Number(score) < 0 || Number(score) > 100}
                className="w-full bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan & Lanjut
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
