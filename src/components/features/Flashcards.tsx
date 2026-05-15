import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import { Flashcard as FlashcardType } from '../../types';
import { Plus, Trash2, RotateCw, CheckCircle2, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export const Flashcards: React.FC = () => {
  const [cards, setCards] = useState<FlashcardType[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '', deck: '' });
  const [bulkText, setBulkText] = useState('');
  const [bulkTopic, setBulkTopic] = useState('');
  const [selectedDeck, setSelectedDeck] = useState<string>('Semua');
  const [isLoading, setIsLoading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceCards, setPracticeCards] = useState<FlashcardType[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isDeletingScope, setIsDeletingScope] = useState<string | null>(null);
  const { profile, addCoins, theme } = useAppStore();

  const decks = Array.from(new Set(cards.map(c => c.deck || 'Umum'))).sort();
  const filteredCards = selectedDeck === 'Semua' 
    ? cards 
    : cards.filter(c => (c.deck || 'Umum') === selectedDeck);

  useEffect(() => {
    if (profile) fetchCards();
  }, [profile]);

  // Load from local storage if DB is not available or as initial cache
  useEffect(() => {
    const localCards = localStorage.getItem('revalina_cards');
    if (localCards) {
      try {
        setCards(JSON.parse(localCards));
      } catch (e) {
        console.error('Failed to parse local cards');
      }
    }
  }, []);

  // Save to local storage whenever cards change
  useEffect(() => {
    localStorage.setItem('revalina_cards', JSON.stringify(cards));
  }, [cards]);

  const fetchCards = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('FetchCards: DB error', error);
        return;
      }
      
      if (data) {
        setCards(data);
      }
    } catch (err) {
      console.error('FetchCards: Unexpected error', err);
    }
  };

  const startPractice = () => {
    if (filteredCards.length === 0) return;
    setIsPracticing(true);
    setPracticeIndex(0);
    setIsFlipped(false);
    
    // Acak urutan kartu untuk mode latihan
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setPracticeCards(shuffled);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setPracticeIndex((prev) => (prev + 1) % practiceCards.length);
    }, 200);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.question || !newCard.answer) return;
    
    const currentQuestion = newCard.question;
    const currentAnswer = newCard.answer;
    const currentDeck = newCard.deck || 'Umum';

    setIsLoading(true);
    
    // Create local temporary card for immediate feedback
    const tempId = crypto.randomUUID();
    const tempCard: FlashcardType = {
      id: tempId,
      user_id: profile?.id || 'guest',
      question: currentQuestion,
      answer: currentAnswer,
      deck: currentDeck,
      is_difficult: false,
      created_at: new Date().toISOString()
    };

    try {
      if (profile?.id) {
        const { data, error } = await supabase
          .from('flashcards')
          .insert([{
            user_id: profile.id,
            question: currentQuestion,
            answer: currentAnswer,
            deck: currentDeck,
            is_difficult: false
          }])
          .select()
          .single();

        if (error) {
          console.error('DB Insert Error:', error);
          setCards(prev => [tempCard, ...prev]);
        } else if (data) {
          setCards(prev => [data, ...prev.filter(c => c.id !== tempId)]);
        } else {
          setCards(prev => [tempCard, ...prev]);
        }
      } else {
        setCards(prev => [tempCard, ...prev]);
      }
      
      setNewCard({ question: '', answer: '', deck: currentDeck });
      setIsAdding(false);
      addCoins(2);
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setCards(prev => [tempCard, ...prev]);
      setNewCard({ question: '', answer: '', deck: currentDeck });
      setIsAdding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    setIsLoading(true);
    try {
      let parsedText = bulkText;
      if (parsedText.includes('```json')) {
        parsedText = parsedText.split('```json')[1].split('```')[0];
      } else if (parsedText.includes('```')) {
        parsedText = parsedText.split('```')[1].split('```')[0];
      }
      
      const jsonArr = JSON.parse(parsedText.trim());
      
      if (!Array.isArray(jsonArr)) {
        throw new Error("Data bukan berupa array");
      }

      const newCards = jsonArr.map((item: any) => ({
        id: crypto.randomUUID(),
        user_id: profile?.id || 'guest',
        question: item.front,
        answer: item.back,
        deck: bulkTopic.trim() || item.topic || newCard.deck || 'Umum',
        is_difficult: false,
        created_at: new Date().toISOString()
      }));

      if (profile?.id) {
        const { data, error } = await supabase
          .from('flashcards')
          .insert(newCards.map(({ id, ...c }) => ({ ...c, user_id: profile.id })))
          .select();
        
        if (data && !error) {
          setCards(prev => [...data, ...prev]);
        } else {
          setCards(prev => [...newCards, ...prev]);
          if (error) console.error('Bulk Insert Error:', error);
        }
      } else {
        setCards(prev => [...newCards, ...prev]);
      }

      setBulkText('');
      setBulkTopic('');
      setIsAdding(false);
      addCoins(newCards.length * 2);
    } catch (err: any) {
      console.error('JSON Parse Error:', err);
      alert("Format JSON tidak valid. Pastikan AI menghasilkan array JSON yang murni, atau periksa kembali input Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const aiPrompt = `Kamu adalah generator flashcard akademis presisi tinggi untuk materi kedokteran/kesehatan.

---

## INSTRUKSI PEMROSESAN MATERI

Sebelum membuat flashcard, lakukan ekstraksi konten berikut:
1. Baca SELURUH materi secara menyeluruh, termasuk tabel, diagram, dan keterangan gambar
2. Identifikasi konsep ESENSIAL: mekanisme, kriteria diagnostik, klasifikasi, nilai ambang klinis, komplikasi, dan prinsip tatalaksana
3. ABAIKAN: judul slide, nama pengajar/institusi, referensi literatur, angka epidemiologi global yang tidak klinis, dan kalimat dekoratif tanpa konten konseptual

---

## STANDAR KUALITAS FLASHCARD

Setiap flashcard HARUS memenuhi minimal satu dari kriteria ini:
- Menguji nilai/angka klinis spesifik (threshold diagnostik, dosis, durasi)
- Menguji mekanisme: "Mengapa / Bagaimana X terjadi?"
- Menguji pembeda antara dua konsep yang sering dikacaukan
- Menguji implikasi klinis langsung dari suatu kondisi

DILARANG membuat flashcard yang:
- Hanya menguji nama istilah tanpa substansi (contoh: "Apa kepanjangan dari HELLP?" — tidak berguna)
- Jawabannya bisa ditebak tanpa membaca materi
- Menguji fakta yang tidak berdampak pada pemahaman klinis

---

## TARGET

Buat 20–30 flashcard, proporsional terhadap jumlah topik dalam materi.

---

## FORMAT OUTPUT

Output HANYA berupa array JSON valid. Tidak ada teks, komentar, atau markdown di luar JSON.

[
  {
    "front": "Pertanyaan atau stem yang menguji satu konsep spesifik",
    "back": "Jawaban ringkas, presisi, dan lengkap. Boleh berupa poin jika jawaban memiliki beberapa komponen.",
    "topic": "Nama sub-topik spesifik",
    "type": "definition / mechanism / comparison / threshold / complication / management"
  }
]

---

## MATERI:

[TEMPEL TEKS / KONTEN FILE DI SINI]`;

  const deleteCard = async (id: string) => {
    if (!profile?.id) {
      setCards(prev => prev.filter(c => c.id !== id));
      return;
    }
    const { error } = await supabase.from('flashcards').delete().eq('id', id);
    if (!error) setCards(prev => prev.filter(c => c.id !== id));
    else console.error('Delete failed:', error);
  };

  const handleDeleteDeck = async () => {
    if (!isDeletingScope) return;
    const isDeletingAll = isDeletingScope === 'Semua';

    setIsLoading(true);
    try {
      if (!profile?.id) {
        // Guest Mode
        if (isDeletingAll) {
          setCards([]);
        } else {
          setCards(prev => prev.filter(c => (c.deck || 'Umum') !== isDeletingScope));
        }
        setSelectedDeck('Semua');
        setIsDeletingScope(null);
        return;
      }

      // DB Mode
      const cardsInScope = isDeletingAll ? cards : cards.filter(c => (c.deck || 'Umum') === isDeletingScope);
      const idsToDelete = cardsInScope.map(c => c.id);

      if (idsToDelete.length > 0) {
        // Log for debugging
        console.log(`Deleting ${idsToDelete.length} cards from ${isDeletingScope}`);
        
        const { error } = await supabase
          .from('flashcards')
          .delete()
          .in('id', idsToDelete)
          .eq('user_id', profile.id);

        if (error) throw error;
      }

      // Update local state
      if (isDeletingAll) {
        setCards([]);
      } else {
        setCards(prev => prev.filter(c => (c.deck || 'Umum') !== isDeletingScope));
      }
      
      setSelectedDeck('Semua');
      setIsDeletingScope(null);
      
    } catch (error: any) {
      console.error('Delete Action Error:', error);
      alert(`Gagal menghapus: ${error.message || 'Masalah koneksi database'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl text-white">Kartu Ajaib</h2>
          <div className="flex gap-2">
            {filteredCards.length > 0 && !isAdding && !isPracticing && (
              <button 
                onClick={startPractice}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-widest disabled:opacity-50",
                  theme === 'moon' ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30" :
                  theme === 'sakura' ? "bg-rose-500/20 border-rose-500/30 text-rose-300 hover:bg-rose-500/30" :
                  "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30"
                )}
              >
                <RotateCw size={14} className={cn(isLoading && "animate-spin")} /> 
                {isLoading ? 'Memproses...' : `Latih ${selectedDeck}`}
              </button>
            )}
            {!isAdding && !isPracticing && filteredCards.length > 0 && (
              <button 
                onClick={() => setIsDeletingScope(selectedDeck)}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-widest disabled:opacity-50",
                  selectedDeck === 'Semua' 
                    ? "bg-white/5 border-white/10 text-white/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                    : "bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border-rose-500/20"
                )}
              >
                <Trash2 size={14} /> {selectedDeck === 'Semua' ? 'Hapus Semua' : 'Hapus Folder'}
              </button>
            )}
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-gold/20 hover:bg-gold/40 p-2 rounded-full text-gold transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {!isPracticing && !isAdding && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button 
              onClick={() => setSelectedDeck('Semua')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all",
                selectedDeck === 'Semua' 
                  ? "bg-gold border-gold text-green-deep" 
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              )}
            >
              Semua
            </button>
            {decks.map(deck => (
              <button 
                key={deck}
                onClick={() => setSelectedDeck(deck)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all",
                  selectedDeck === deck 
                    ? "bg-gold border-gold text-green-deep" 
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                )}
              >
                {deck}
              </button>
            ))}
          </div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isDeletingScope && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card max-w-sm w-full p-6 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-serif text-white">
                  {isDeletingScope === 'Semua' ? 'Hapus Semua Kartu?' : `Hapus Folder "${isDeletingScope}"?`}
                </h3>
                <p className="text-sm text-white/60">
                  Tindakan ini akan menghapus permanen kartu-kartu Anda. Anda tidak dapat mengembalikannya.
                </p>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsDeletingScope(null)}
                    className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleDeleteDeck}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase shadow-lg shadow-rose-600/20 disabled:opacity-50"
                  >
                    {isLoading ? 'Memproses...' : 'Ya, Hapus'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence mode="wait">
        {isPracticing ? (
          <motion.div 
            key="practice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                Latihan: {selectedDeck} ({practiceIndex + 1} / {practiceCards.length})
              </span>
              <button 
                onClick={() => setIsPracticing(false)}
                className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest"
              >
                Selesai
              </button>
            </div>

            <div 
              className="relative h-96 w-full cursor-pointer group perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div 
                className="w-full h-full relative transition-all duration-500 preserve-3d"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front (Question) */}
                <div 
                  className={cn(
                    "absolute inset-0 backface-hidden rounded-3xl p-8 flex flex-col items-center justify-center text-center backdrop-blur-xl border-2 transition-all duration-500",
                    theme === 'moon' ? "bg-slate-900/60 border-indigo-500/30 shadow-[0_0_40px_rgba(79,70,229,0.15)]" :
                    theme === 'sakura' ? "bg-rose-950/60 border-rose-500/30 shadow-[0_0_40px_rgba(225,29,72,0.15)]" :
                    "bg-emerald-950/60 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                  )}
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <div className="absolute top-4 right-4 opacity-10">
                    <HelpCircle size={60} className={cn(
                      theme === 'moon' ? "text-indigo-400" :
                      theme === 'sakura' ? "text-rose-400" :
                      "text-emerald-400"
                    )} />
                  </div>
                  
                  <div className={cn(
                    "text-[10px] uppercase tracking-[0.4em] font-black mb-6 px-4 py-1 rounded-full border",
                    theme === 'moon' ? "text-indigo-300 border-indigo-500/20 bg-indigo-500/5" :
                    theme === 'sakura' ? "text-rose-300 border-rose-500/20 bg-rose-500/5" :
                    "text-emerald-300 border-emerald-500/20 bg-emerald-500/5"
                  )}>
                    Pertanyaan
                  </div>

                  <p className="text-2xl text-white leading-relaxed font-serif px-4 relative z-10">
                    {practiceCards[practiceIndex]?.question}
                  </p>

                  <div className="mt-12 flex flex-col items-center gap-3">
                    <div className={cn(
                      "w-12 h-1 rounded-full",
                      theme === 'moon' ? "bg-indigo-500/20" :
                      theme === 'sakura' ? "bg-rose-500/20" :
                      "bg-emerald-500/20"
                    )} />
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest animate-pulse">Klik untuk membalik</p>
                  </div>
                </div>

                {/* Back (Answer) */}
                <div 
                  className="absolute inset-0 backface-hidden rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-gold/15 border-2 border-gold/40 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,200,66,0.2)]"
                  style={{ 
                    transform: 'rotateY(180deg)', 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden' 
                  }}
                >
                  <div className="absolute top-4 left-4 text-gold/30"><Sparkles size={24} /></div>
                  <div className="absolute bottom-4 right-4 text-gold/30"><Sparkles size={24} /></div>
                  
                  <div className="text-[10px] text-gold uppercase tracking-[0.3em] font-bold mb-6">Jawaban</div>
                  <p className="text-xl text-white leading-relaxed font-medium italic px-4">
                    {practiceCards[practiceIndex]?.answer}
                  </p>
                  
                  <div className="mt-10 px-4 py-1.5 bg-gold/20 rounded-full border border-gold/30">
                    <p className="text-[9px] text-gold font-bold uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={12} /> Pengetahuan Terbuka
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={nextCard}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 rounded-2xl transition-all text-sm"
              >
                Sudah Ingat ✨
              </button>
              <button 
                onClick={nextCard}
                className="flex-1 bg-gold text-green-deep font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(245,200,66,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-sm"
              >
                Berikutnya
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="main-view" className="space-y-6">
            <AnimatePresence>
              {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`glass-card p-6 mb-6 shadow-2xl border border-white/10 ${
              theme === 'moon' ? 'bg-slate-900/40' :
              theme === 'sakura' ? 'bg-rose-950/40' :
              'bg-emerald-950/40'
            }`}>
              <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-xl">
                <button 
                  onClick={() => setIsBulk(false)}
                  className={cn(
                    "flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all",
                    !isBulk ? "bg-gold text-black shadow-lg" : "text-white/40 hover:text-white"
                  )}
                >
                  Manual
                </button>
                <button 
                  onClick={() => setIsBulk(true)}
                  className={cn(
                    "flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-all",
                    isBulk ? "bg-gold text-black shadow-lg" : "text-white/40 hover:text-white"
                  )}
                >
                  Bulk Mode (AI Hub)
                </button>
              </div>

                    {!isBulk ? (
                      <form onSubmit={handleAddCard} className="space-y-4">
                        <input 
                          placeholder="Nama Folder/PPT (contoh: Biologi Sel)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold outline-none transition-all"
                          value={newCard.deck}
                          onChange={e => setNewCard({...newCard, deck: e.target.value})}
                        />
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
                        <button 
                          disabled={isLoading || !newCard.question || !newCard.answer}
                          className="w-full bg-gold text-green-deep font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(245,200,66,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isLoading ? 'Menyimpan...' : 'Simpan Kartu Baru'}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleBulkAdd} className="space-y-4">
                        <input 
                          type="text"
                          placeholder="Nama Topik (Opsional, menimpa topik dari AI)"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold outline-none transition-all"
                          value={bulkTopic}
                          onChange={e => setBulkTopic(e.target.value)}
                        />
                        <div className="bg-gold/5 border border-gold/10 rounded-2xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold shrink-0">
                        <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gold/80 uppercase tracking-wider mb-1">Tips AI Magic</p>
                        <p className="text-[10px] text-white/50 leading-relaxed">
                          Copy prompt ini ke Gemini/ChatGPT, lampirkan materi, lalu paste hasilnya (JSON) di bawah.
                        </p>
                        <button 
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(aiPrompt);
                            alert("Prompt berhasil dicopy!");
                          }}
                          className="mt-2 text-[10px] bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1 rounded-md font-bold transition-all"
                        >
                          Copy AI Prompt ✨
                        </button>
                      </div>
                    </div>
                  </div>

                  <textarea 
                    placeholder="Paste JSON flashcard dari AI di sini..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:border-gold outline-none transition-all h-48 font-mono text-xs leading-relaxed"
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                  />
                  <button 
                    disabled={isLoading || !bulkText.trim()}
                    className="w-full bg-gold text-green-deep font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(245,200,66,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isLoading ? 'Sedang Memproses...' : 'Tambah Semua Kartu ✨'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

            <div className="grid gap-4">
              {filteredCards.map((card) => (
                <div 
                  key={card.id} 
                  className="glass-card p-4 group hover:bg-white/15 transition-all"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[8px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                          {card.deck || 'Umum'}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium">{card.question}</p>
                      <p className="text-white/40 text-xs mt-1 line-clamp-1 italic">{card.answer}</p>
                    </div>
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="text-white/10 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-400/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCards.length === 0 && (
              <div className="text-center py-12 text-white/20">
                <AlertCircle size={40} className="mx-auto mb-4 opacity-10" />
                <p className="text-sm font-serif italic">Belum ada kartu di folder ini.</p>
                <p className="text-xs">Mulai buat kartu pertama kamu!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
