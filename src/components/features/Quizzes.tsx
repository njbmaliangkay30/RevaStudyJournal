import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, AlertCircle, Trash2, CheckCircle2, RotateCw, PenTool, XCircle } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { Quiz } from '../../types';
import { supabase } from '../../lib/supabase';

export const Quizzes: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkTopic, setBulkTopic] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('Semua');
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceCards, setPracticeCards] = useState<Quiz[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isDeletingScope, setIsDeletingScope] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { theme, addCoins, profile } = useAppStore();

  const topics = Array.from(new Set(quizzes.map(c => c.topic || 'Umum'))).sort();
  const filteredQuizzes = selectedTopic === 'Semua' 
    ? quizzes 
    : quizzes.filter(c => (c.topic || 'Umum') === selectedTopic);

  useEffect(() => {
    if (profile) fetchQuizzes();
  }, [profile]);

  // Load from local storage as initially backup
  useEffect(() => {
    const localQuizzes = localStorage.getItem('revalina_quizzes');
    if (localQuizzes) {
      try {
        setQuizzes(JSON.parse(localQuizzes));
      } catch (e) {
        console.error('Failed to parse local quizzes');
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('revalina_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  const fetchQuizzes = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('FetchQuizzes: DB error', error);
        return;
      }
      if (data) setQuizzes(data as Quiz[]);
    } catch (err) {
      console.warn('Network error fetching quizzes');
    }
  };

  const startPractice = () => {
    if (filteredQuizzes.length === 0) return;
    setIsPracticing(true);
    setPracticeIndex(0);
    setSelectedOption(null);
    
    // Acak urutan kuis
    const shuffled = [...filteredQuizzes].sort(() => Math.random() - 0.5);
    setPracticeCards(shuffled);
  };

  const nextCard = () => {
    setSelectedOption(null);
    setPracticeIndex((prev) => (prev + 1) % practiceCards.length);
  };

  const handleOptionClick = (idx: number) => {
    if (selectedOption !== null) return; // sudah menjawab
    setSelectedOption(idx);
    
    // Jika benar, kasih koin
    const currentQuiz = practiceCards[practiceIndex];
    if (idx === currentQuiz.answerIndex) {
      addCoins(1);
    }
  };

  const aiPrompt = `Kamu adalah generator soal ujian akademis yang sangat teliti. Tugasmu adalah membuat TEPAT 15–20 soal pilihan ganda berkualitas tinggi dari materi yang diberikan.

---

## INSTRUKSI PEMROSESAN MATERI

Pertama, lakukan analisis mendalam terhadap materi:
1. Identifikasi konsep-konsep INTI (mekanisme, prinsip, hubungan sebab-akibat, klasifikasi, implikasi klinis/praktis)
2. Abaikan informasi trivial: nama penemu, tahun penemuan, etimologi istilah, fakta historis yang tidak berdampak pada pemahaman konsep
3. Prioritaskan: aplikasi klinis/praktis > mekanisme > klasifikasi > definisi

---

## DISTRIBUSI SOAL WAJIB

Buat soal dengan distribusi berikut:

**KONSEPTUAL (60% = ~9 soal):**
- Definisi operasional & karakteristik konsep (C2) – 3 soal
- Mekanisme & prinsip kerja: "mengapa/bagaimana X terjadi" (C3) – 3 soal  
- Perbandingan & klasifikasi: perbedaan antara X dan Y, pengelompokan (C4) – 3 soal

**CASE STUDY / APLIKASI (40% = ~6 soal):**
- Aplikasi langsung: skenario pendek → identifikasi konsep yang relevan (C3) – 3 soal
- Analisis kasus: skenario kompleks → evaluasi/kesimpulan (C4–C5) – 3 soal
---

## ATURAN MEMBUAT DISTRACTOR (PILIHAN SALAH)

Setiap distractor HARUS memenuhi salah satu kriteria ini:
- **Konsep bertetangga**: benar dalam konteks lain, salah dalam konteks soal ini
- **Kesalahan mekanisme yang umum terjadi**: misconception yang sering dialami pelajar
- **Perbedaan yang subtle**: mirip dengan jawaban benar tapi berbeda pada satu variabel kritis
- **Over-generalisasi**: prinsip yang benar secara parsial tapi tidak sepenuhnya berlaku

DILARANG membuat distractor yang:
- Jelas-jelas salah tanpa pengetahuan apapun
- Hanya berbeda secara leksikal/superfisial dari jawaban benar
- Tidak relevan dengan topik soal

---

## FORMAT OUTPUT

Output HANYA berupa array JSON valid. Tidak ada teks, markdown, atau komentar di luar JSON.

[
  {
    "topic": "Nama sub-topik spesifik (bukan nama mata kuliah)",
    "bloomLevel": "C2/C3/C4/C5",
    "question": "Pertanyaan lengkap. Untuk soal aplikasi, sertakan skenario kasus minimal 2 kalimat.",
    "options": [
      "A. ...",
      "B. ...",
      "C. ...",
      "D. ...",
      "E. ..."
    ],
    "answerIndex": 0,
    "explanation": "Jelaskan MENGAPA jawaban ini benar secara mekanistik. Lalu jelaskan MENGAPA 1–2 distractor paling mengecoh itu salah."
  }
]

---

## MATERI:

[TEMPEL TEKS / KONTEN FILE DI SINI]`;

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

      const newQuizzes: Quiz[] = jsonArr.map((item: any) => ({
        id: crypto.randomUUID(),
        user_id: profile?.id || 'guest',
        question: item.question,
        options: item.options,
        answerIndex: item.answerIndex,
        explanation: item.explanation || "",
        topic: bulkTopic.trim() || item.topic || "Umum",
        created_at: new Date().toISOString()
      }));

      // If user is logged in, sync to Supabase
      if (profile?.id) {
        const { data, error } = await supabase
          .from('quizzes')
          .insert(newQuizzes.map(({ id, ...q }) => ({ ...q, user_id: profile.id })))
          .select();
        
        if (data && !error) {
          setQuizzes(prev => [...data, ...prev]);
        } else {
          setQuizzes(prev => [...newQuizzes, ...prev]);
        }
      } else {
        setQuizzes(prev => [...newQuizzes, ...prev]);
      }

      setBulkText('');
      setBulkTopic('');
      setIsAdding(false);
      addCoins(newQuizzes.length * 2);
    } catch (err: any) {
      console.error('JSON Parse Error:', err);
      alert("Format JSON tidak valid. Pastikan AI menghasilkan array JSON yang murni, atau periksa kembali input Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeck = async () => {
    if (!isDeletingScope) return;
    const isDeletingAll = isDeletingScope === 'Semua';

    setIsLoading(true);
    try {
      if (!profile?.id) {
        // Guest Mode
        if (isDeletingAll) {
          setQuizzes([]);
        } else {
          setQuizzes(prev => prev.filter(c => (c.topic || 'Umum') !== isDeletingScope));
        }
      } else {
        // Find IDs to delete
        const idsToDelete = isDeletingAll 
          ? quizzes.map(q => q.id)
          : quizzes.filter(q => (q.topic || 'Umum') === isDeletingScope).map(q => q.id);

        if (idsToDelete.length > 0) {
          const { error } = await supabase
            .from('quizzes')
            .delete()
            .in('id', idsToDelete)
            .eq('user_id', profile.id);

          if (error) throw error;
        }

        // Update local state
        if (isDeletingAll) {
          setQuizzes([]);
        } else {
          setQuizzes(prev => prev.filter(q => (q.topic || 'Umum') !== isDeletingScope));
        }
      }
    } catch (err) {
      console.error('Network error deleting quizzes', err);
    } finally {
      setIsLoading(false);
      setSelectedTopic('Semua');
      setIsDeletingScope(null);
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!profile?.id) {
      setQuizzes(prev => prev.filter(q => q.id !== id));
      return;
    }
    const { error } = await supabase.from('quizzes').delete().eq('id', id).eq('user_id', profile.id);
    if (!error) setQuizzes(prev => prev.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-2xl text-white">Latihan Kuis</h2>
          <div className="flex gap-2">
            {filteredQuizzes.length > 0 && !isAdding && !isPracticing && (
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
                <RotateCw size={14} /> 
                {isLoading ? 'Memproses...' : `Latih ${selectedTopic}`}
              </button>
            )}
            {!isAdding && !isPracticing && filteredQuizzes.length > 0 && (
              <button 
                onClick={() => setIsDeletingScope(selectedTopic)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all font-bold text-[10px] uppercase tracking-widest",
                  selectedTopic === 'Semua' 
                    ? "bg-white/5 border-white/10 text-white/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                    : "bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border-rose-500/20"
                )}
              >
                <Trash2 size={14} /> {selectedTopic === 'Semua' ? 'Hapus Semua' : 'Hapus Topik'}
              </button>
            )}
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="bg-gold/20 hover:bg-gold/40 p-2 rounded-full text-gold transition-colors"
            >
              <PenTool size={20} />
            </button>
          </div>
        </div>

        {!isPracticing && !isAdding && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button 
              onClick={() => setSelectedTopic('Semua')}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all",
                selectedTopic === 'Semua' 
                  ? "bg-gold border-gold text-green-deep" 
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white"
              )}
            >
              Semua
            </button>
            {topics.map(topic => (
              <button 
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border transition-all",
                  selectedTopic === topic 
                    ? "bg-gold border-gold text-green-deep" 
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                )}
              >
                {topic}
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
                  {isDeletingScope === 'Semua' ? 'Hapus Semua Kuis?' : `Hapus Topik "${isDeletingScope}"?`}
                </h3>
                <p className="text-sm text-white/60">
                  Tindakan ini akan menghapus permanen kartu kuis Anda.
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
                    className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase shadow-lg shadow-rose-600/20"
                  >
                    Hapus
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
                Topik: {selectedTopic} ({practiceIndex + 1} / {practiceCards.length})
              </span>
              <button 
                onClick={() => setIsPracticing(false)}
                className="text-white/40 hover:text-white text-[10px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full"
              >
                Selesai Latihan
              </button>
            </div>

            <div className={cn(
              "w-full rounded-3xl p-6 md:p-8 backdrop-blur-xl border border-white/10 transition-all",
              theme === 'moon' ? "bg-slate-900/60" :
              theme === 'sakura' ? "bg-rose-950/60" :
              "bg-emerald-950/60"
            )}>
              <div className={cn(
                "inline-block text-[10px] uppercase tracking-[0.3em] font-black mb-6 px-4 py-1.5 rounded-full border",
                theme === 'moon' ? "text-indigo-300 border-indigo-500/20 bg-indigo-500/10" :
                theme === 'sakura' ? "text-rose-300 border-rose-500/20 bg-rose-500/10" :
                "text-emerald-300 border-emerald-500/20 bg-emerald-500/10"
              )}>
                {practiceCards[practiceIndex]?.topic || 'Umum'}
              </div>

              <h3 className="text-lg md:text-xl text-white font-medium mb-8 leading-snug">
                {practiceCards[practiceIndex]?.question}
              </h3>

              <div className="space-y-3">
                {practiceCards[practiceIndex]?.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = practiceCards[practiceIndex].answerIndex === idx;
                  const isWrongSelected = isSelected && !isCorrectAnswer;
                  const showCorrect = selectedOption !== null && isCorrectAnswer;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(idx)}
                      disabled={selectedOption !== null}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                        selectedOption === null 
                          ? "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/80 hover:text-white"
                          : showCorrect
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100"
                            : isWrongSelected
                              ? "bg-rose-500/20 border-rose-500/50 text-rose-100"
                              : "bg-white/5 border-white/5 text-white/30 opacity-50"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span className={cn(
                          "w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold border",
                          selectedOption === null 
                            ? "border-white/20 text-white/50 group-hover:bg-white/10" 
                            : showCorrect
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : isWrongSelected
                                ? "bg-rose-500 text-white border-rose-500"
                                : "border-white/10 text-white/20 bg-white/5"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm md:text-base pt-0.5">{opt}</span>
                      </div>
                      
                      {selectedOption !== null && showCorrect && <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />}
                      {selectedOption !== null && isWrongSelected && <XCircle className="text-rose-400 shrink-0" size={20} />}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-5 bg-gold/10 border border-gold/20 rounded-2xl"
                >
                  <p className="text-xs text-gold uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                    <Sparkles size={14} /> Penjelasan
                  </p>
                  <p className="text-sm text-green-100 leading-relaxed italic">
                    {practiceCards[practiceIndex]?.explanation || 'Tidak ada penjelasan tambahan.'}
                  </p>
                </motion.div>
              )}
            </div>

            {selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <button 
                  onClick={nextCard}
                  className="flex-1 bg-gold text-green-deep font-bold py-4 rounded-2xl shadow-[0_0_30px_rgba(245,200,66,0.3)] hover:scale-[1.02] active:scale-95 transition-all text-sm"
                >
                  Pertanyaan Selanjutnya ➔
                </button>
              </motion.div>
            )}
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
                    <div className="bg-gold/5 border border-gold/10 rounded-2xl p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold shrink-0">
                          <AlertCircle size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gold/80 uppercase tracking-wider mb-1">Generate Kuis dengan AI</p>
                          <p className="text-[10px] text-white/50 leading-relaxed">
                            Copy prompt ini ke Gemini atau ChatGPT, lampirkan materi PDF/teks kamu, lalu paste JSON hasilnya di kotak bawah.
                          </p>
                          <button 
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(aiPrompt);
                              alert("Prompt berhasil dicopy!");
                            }}
                            className="mt-3 text-[10px] bg-gold/20 hover:bg-gold/30 text-gold px-4 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
                          >
                            <BookOpen size={12} /> Copy AI Prompt ✨
                          </button>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleBulkAdd} className="space-y-4">
                      <input 
                        type="text"
                        placeholder="Nama Topik (Opsional, menimpa topik dari AI)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-gold outline-none transition-all"
                        value={bulkTopic}
                        onChange={e => setBulkTopic(e.target.value)}
                      />
                      <textarea 
                        placeholder="Paste JSON kuis dari AI di sini..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:border-gold outline-none transition-all h-64 font-mono text-xs leading-relaxed"
                        value={bulkText}
                        onChange={e => setBulkText(e.target.value)}
                      />
                      <button 
                        disabled={isLoading || !bulkText.trim()}
                        className="w-full bg-gold text-green-deep font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(245,200,66,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Sedang Memproses...' : <><Sparkles size={16} /> Simpan Kuis Baru</>}
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4">
              {filteredQuizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="glass-card p-5 group hover:bg-white/15 transition-all relative overflow-hidden"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 pr-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[9px] bg-gold/20 text-gold px-2.5 py-1 rounded-full font-bold uppercase tracking-widest border border-gold/10">
                          {quiz.topic || 'Umum'}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium leading-relaxed">{quiz.question}</p>
                      <div className="mt-4 space-y-1">
                        {quiz.options.map((opt, idx) => (
                          <p key={idx} className={cn(
                            "text-xs p-1.5 rounded-lg",
                            quiz.answerIndex === idx ? "bg-emerald-500/10 text-emerald-200 font-medium" : "text-white/40"
                          )}>
                            <span className="opacity-50 mr-2">{String.fromCharCode(65 + idx)}.</span> {opt}
                          </p>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteQuiz(quiz.id)}
                      className="absolute top-4 right-4 text-white/20 hover:text-rose-400 p-2 rounded-lg hover:bg-rose-400/10 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredQuizzes.length === 0 && (
              <div className="text-center py-16 text-white/20 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-base font-serif italic text-white/40 mb-2">Belum ada Kuis di Topik ini.</p>
                <p className="text-xs text-white/30">Gunakan tombol gembok (Prompt AI) untuk men-generate soal Pilihan Ganda berkualitas.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
