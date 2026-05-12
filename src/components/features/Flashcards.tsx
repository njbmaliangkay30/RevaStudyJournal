import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Flashcard as FlashcardType } from '../../types';
import { Plus, Trash2, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Flashcards: React.FC = () => {
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const { profile, addCoins } = useAppStore();

  useEffect(() => {
    if (profile) fetchCards();
  }, [profile]);

  const fetchCards = async () => {
    const { data } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false });
    if (data) setCards(data);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.question || !newCard.answer) return;

    const { data, error } = await supabase
      .from('flashcards')
      .insert([{
        user_id: profile?.id,
        question: newCard.question,
        answer: newCard.answer,
      }])
      .select()
      .single();

    if (data && !error) {
      setCards([data, ...cards]);
      setNewCard({ question: '', answer: '' });
      setIsAdding(false);
      addCoins(2); // Small reward for creation
    }
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (!error) setCards(cards.filter(c => c.id !== id));
  };

  const currentCard = cards.find(c => c.id === currentId) || cards[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-serif text-2xl text-white">Kartu Ajaib</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-gold/20 hover:bg-gold/40 p-2 rounded-full text-gold transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddCard} className="glass-card p-6 space-y-4 mb-6">
              <input 
                placeholder="Pertanyaan (contoh: Mitokondria adalah?)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold outline-none transition-all"
                value={newCard.question}
                onChange={e => setNewCard({...newCard, question: e.target.value})}
              />
              <textarea 
                placeholder="Jawaban (contoh: Pembangkit energi sel)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold outline-none transition-all h-24"
                value={newCard.answer}
                onChange={e => setNewCard({...newCard, answer: e.target.value})}
              />
              <button className="w-full bg-gold text-green-deep font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(245,200,66,0.3)]">
                Simpan Kartu Baru
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {cards.length > 0 ? (
        <div className="space-y-8">
          {/* Card Viewer */}
          <div 
            className="perspective-1000 relative w-full h-64 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full h-full preserve-3d"
            >
              {/* Front */}
              <div className={cn(
                "absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-8 text-center",
                isFlipped && "pointer-events-none"
              )}>
                <div className="text-[10px] text-gold/50 uppercase tracking-widest font-bold mb-4">Pertanyaan</div>
                <p className="text-xl text-white font-medium">{currentCard?.question}</p>
                <div className="mt-8 text-white/20 flex flex-col items-center">
                  <RotateCw size={16} className="animate-spin-slow mb-2" />
                  <span className="text-[9px] uppercase tracking-widest">Ketuk untuk melihat keajaiban</span>
                </div>
              </div>

              {/* Back */}
              <div 
                className={cn(
                  "absolute inset-0 backface-hidden glass-card flex flex-col items-center justify-center p-8 text-center bg-gold/5",
                  !isFlipped && "pointer-events-none"
                )}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="text-[10px] text-gold/50 uppercase tracking-widest font-bold mb-4">Jawaban</div>
                <p className="text-lg text-white/90 italic leading-relaxed">{currentCard?.answer}</p>
                <div className="mt-8 flex gap-4">
                  <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); deleteCard(currentCard.id); }} className="text-white/20 hover:text-red-400 p-2"><Trash2 size={18} /></button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* List for management */}
          <div className="space-y-3 pt-6">
            <h3 className="text-[11px] text-white/30 uppercase tracking-[0.2em] font-bold px-2">Your Collection ({cards.length})</h3>
            <div className="grid grid-cols-1 gap-3">
              {cards.map((card) => (
                <div key={card.id} className="glass-card p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                  <div className="flex-1 pr-4 truncate">
                    <p className="text-white/80 text-sm font-medium truncate">{card.question}</p>
                    <p className="text-white/30 text-[10px] mt-0.5 truncate">{card.answer}</p>
                  </div>
                  <button onClick={() => deleteCard(card.id)} className="text-white/20 hover:text-red-400 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center opacity-30 text-center">
          <AlertCircle size={48} className="mb-4" />
          <p>Belum ada kartu ajaib.</p>
          <p className="text-xs">Mulai buat kartu pertama kamu!</p>
        </div>
      )}
    </div>
  );
};

import { cn } from '../../lib/utils';
