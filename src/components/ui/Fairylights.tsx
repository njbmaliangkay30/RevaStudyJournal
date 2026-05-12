import React from 'react';
import { motion } from 'motion/react';

export const Fairylights: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => {
        const size = Math.random() * 6 + 4;
        return (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: '110%',
              opacity: 0 
            }}
            animate={{
              y: '-10%',
              x: [
                Math.random() * 100 + '%', 
                (Math.random() * 100 + 20) + '%', 
                (Math.random() * 100 - 20) + '%'
              ],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "linear"
            }}
            className="absolute rounded-full bg-gold/30 blur-[2px]"
            style={{
              width: size,
              height: size,
              boxShadow: `0 0 ${size * 4}px rgba(245, 200, 66, 0.4)`,
            }}
          />
        );
      })}
    </div>
  );
};
