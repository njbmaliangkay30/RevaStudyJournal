import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../../store/useAppStore';
import { RefreshCw, Trophy, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['🌸', '✨', '🌙', '🍃', '🦋', '🍄', '🕯️', '💎'];

export const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const { addCoins, theme } = useAppStore();

  useEffect(() => {
    if (isWon) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
  }, [isWon]);


  const initGame = () => {
    const shuffled = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      
      if (newCards[firstId].symbol === newCards[secondId].symbol) {
        newCards[firstId].isMatched = true;
        newCards[secondId].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        
        if (newCards.every(c => c.isMatched)) {
          setIsWon(true);
          addCoins(25); // Big reward for winning
        }
      } else {
        setTimeout(() => {
          newCards[firstId].isFlipped = false;
          newCards[secondId].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-2xl text-white">Fragmen Memori</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Langkah: {moves}</p>
        </div>
        <button 
          onClick={initGame}
          className="bg-white/5 p-2 rounded-full text-white/40 hover:text-white transition-colors"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full">
        {cards.map((card) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(card.id)}
            className="perspective-1000 aspect-square relative cursor-pointer"
          >
            <motion.div
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full h-full preserve-3d"
            >
              {/* Front */}
              <div className={cn(
                "absolute inset-0 backface-hidden glass-card flex items-center justify-center border-2 border-white/5",
                (card.isFlipped || card.isMatched) && "pointer-events-none"
              )}>
                <Sparkles size={16} className="text-white/10" />
              </div>

              {/* Back */}
              <div 
                className={cn(
                  "absolute inset-0 backface-hidden glass-card flex items-center justify-center text-2xl bg-gold/10 border-2",
                  card.isMatched ? "border-gold shadow-[0_0_15px_rgba(245,200,66,0.2)]" : "border-white/20"
                )}
                style={{ transform: 'rotateY(180deg)' }}
              >
                {card.symbol}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <motion.div className={`relative p-12 text-center max-w-sm w-full backdrop-blur-2xl rounded-[2rem] shadow-2xl overflow-hidden border ${
              theme === 'moon' 
                ? 'bg-slate-900/50 border-gold/40 shadow-[0_0_50px_-12px_rgba(245,200,66,0.25)]' :
              theme === 'sakura' 
                ? 'bg-rose-950/50 border-gold/40 shadow-[0_0_50px_-12px_rgba(245,200,66,0.25)]' :
              'bg-emerald-950/50 border-gold/40 shadow-[0_0_50px_-12px_rgba(245,200,66,0.25)]'
            }`}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gold/10 blur-3xl rounded-full pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center text-gold mx-auto mb-6 shadow-[0_0_40px_rgba(245,200,66,0.4)]">
                  <Trophy size={40} />
                </div>
                <h2 className="font-serif text-3xl text-white">Magical Victory!</h2>
                <p className="text-white/60 mt-2 text-sm leading-relaxed">
                  Kamu telah menyusun fragmen memori yang hilang. Kamu mendapatkan <span className="text-gold font-bold">✨ 25 Coins</span>!
                </p>
                <button 
                  onClick={initGame}
                  className="mt-8 w-full bg-gold/90 hover:bg-gold text-green-deep font-bold py-4 rounded-2xl shadow-[0_10px_20px_rgba(245,200,66,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Main Lagi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
