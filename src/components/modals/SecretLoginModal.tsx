import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const SecretLoginModal = () => {
  const { profile, isSpecialVerified, setSpecialVerified } = useAppStore();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const PERMANENT_UID = 'c097b441-d5c6-4559-abd3-a8a36274054b';
  const SECRET_CODE = 'aku sayang kamu sedunia';

  // Only show for the specific UID and if not yet verified
  if (!profile || profile.id !== PERMANENT_UID || isSpecialVerified) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.toLowerCase().trim() === SECRET_CODE.toLowerCase()) {
      setSpecialVerified(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-green-deep/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-sm glass-card p-8 text-center relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
          
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center relative">
              <Heart className="text-gold fill-gold/20" size={40} />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="text-gold" size={24} />
              </motion.div>
            </div>
          </div>

          <h2 className="font-serif text-2xl text-white mb-2">Halo Sayang! ✨</h2>
          <p className="text-white/60 text-sm mb-8 italic">"Seberapa sayang sih kamu sama aku?"</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Tulis jawabanmu di sini..."
                className={`w-full bg-white/5 border ${error ? 'border-red-400' : 'border-white/20'} rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-gold/50 transition-all text-center`}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-2"
                >
                  Jawaban kurang tepat, coba lagi ya peri kecil.. 💖
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gold text-green-deep font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(245,200,66,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Kirim Sayang
            </button>
          </form>

          <p className="mt-8 text-[10px] text-white/20 uppercase tracking-[0.2em]">
            Identity Verification Required
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
