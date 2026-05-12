import React from 'react';
import { motion } from 'motion/react';
import { Flame, Star, Trophy, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Dashboard: React.FC = () => {
  const { profile } = useAppStore();

  const stats = [
    { label: 'Siklus Belajar', value: profile?.streak || 0, icon: Flame, color: 'text-orange-400' },
    { label: 'Level Peri', value: 'Lv. 1', icon: Star, color: 'text-gold' },
    { label: 'Total Slide', value: 42, icon: Trophy, color: 'text-gold-light' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card p-6 bg-gradient-to-br from-gold/20 via-transparent to-transparent overflow-hidden relative group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Calendar size={100} />
        </div>
        <div className="relative z-10">
          <h2 className="font-serif text-3xl text-white">Kilau Harian</h2>
          <p className="text-white/40 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          
          <div className="mt-8 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-serif text-4xl text-gold shadow-[0_0_20px_rgba(245,200,66,0.1)]">
              {new Date().getDate()}
            </div>
            <div>
              <p className="text-gold/50 text-[10px] font-black uppercase tracking-widest">Kutipan Hari Ini</p>
              <p className="text-white/90 text-base mt-0.5 italic font-serif leading-tight">"Kecil demi kecil, lama-lama jadi peri sakti."</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-4 text-center flex flex-col items-center hover:bg-white/5 transition-colors border-white/5"
          >
            <stat.icon size={20} className={stat.color} />
            <motion.div 
              animate={{ 
                textShadow: [
                  `0 0 10px rgba(255,255,255,0.1)`,
                  `0 0 15px rgba(255,255,255,0.3)`,
                  `0 0 10px rgba(255,255,255,0.1)`
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
              className="font-serif text-2xl text-white mt-1.5"
            >
              {stat.value}
            </motion.div>
            <div className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-black mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Next Task */}
      <div className="glass-card p-6 bg-gradient-to-tr from-white/5 to-transparent">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl text-white">Ujian Mendatang</h3>
          <div className="text-[9px] bg-red-500/20 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/20 font-black tracking-wider uppercase">7 Hari Lagi</div>
        </div>
        <div className="bg-black/30 rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-10 -mt-10" />
          <p className="text-white/90 font-bold text-base relative z-10">UAS Anatomi & Fisiologi</p>
          <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden relative z-10 border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '35%' }}
              className="bg-gradient-to-r from-gold-deep to-gold h-full rounded-full shadow-[0_0_10px_rgba(245,200,66,0.3)]" 
            />
          </div>
          <p className="text-white/30 text-[10px] mt-3 font-bold uppercase tracking-wider relative z-10">14 dari 40 slide selesai</p>
        </div>
      </div>
    </div>
  );
};
