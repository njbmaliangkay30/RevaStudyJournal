import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const SecretLoginModal = () => {
  const { profile, isSpecialVerified, setSpecialVerified, isFirstTimeSetup, loginWithPermanentUid, loginWithTestUid, theme } = useAppStore();
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  const PERMANENT_UID = 'c097b441-d5c6-4559-abd3-a8a36274054b';
  const SECRET_CODE = 'aku sayang kamu sedunia';
  const TEST_UID = 'a123b456-c789-0123-d456-e789f0123456';
  const TEST_CODE = 'test';

  // Show if not yet verified AND (is the special UID OR it's a first time setup on a new device)
  const isTargetUser = profile?.id === PERMANENT_UID || profile?.id === TEST_UID;
  const showModal = !isSpecialVerified && (isTargetUser || isFirstTimeSetup);

  useEffect(() => {
    if (showModal) {
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
  }, [showModal]);

  if (!showModal) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = answer.toLowerCase().trim();
    if (input === SECRET_CODE.toLowerCase()) {
      if (!isTargetUser || profile?.id !== PERMANENT_UID) {
        // Switch to the permanent account if this is a new device or currently on another account
        await loginWithPermanentUid();
      } else {
        setSpecialVerified(true);
      }
    } else if (input === TEST_CODE.toLowerCase()) {
      if (!isTargetUser || profile?.id !== TEST_UID) {
        await loginWithTestUid();
      } else {
        setSpecialVerified(true);
      }
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-md backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden border p-6 sm:p-8 text-center ${
            theme === 'moon' 
              ? 'bg-slate-900/50 border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(79,70,229,0.25)]' :
            theme === 'sakura' 
              ? 'bg-rose-950/50 border-rose-500/20 shadow-[0_0_50px_-12px_rgba(225,29,72,0.25)]' :
            'bg-emerald-950/50 border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)]'
          }`}
        >
          {/* Decorative background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-white/5 blur-3xl rounded-full" />
          
          <div className="flex justify-center mb-6 relative z-10">
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

          <p className="mt-8 text-[10px] text-white/20 uppercase tracking-[0.2em] relative z-10">
            Identity Verification Required
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
