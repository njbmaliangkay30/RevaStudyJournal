import { useAppStore } from '../store/useAppStore';

const translations = {
  id: {
    hdr_eyebrow: "Perjalanan Belajar",
    prog_total_lbl: "Total Kemajuan",
    prog_done_lbl: "Selesai",
    prog_target_lbl: "Target",
  },
  en: {
    hdr_eyebrow: "Study Journey",
    prog_total_lbl: "Total Progress",
    prog_done_lbl: "Done",
    prog_target_lbl: "Target",
  }
};

export const useTranslation = () => {
  const lang = useAppStore((state) => state.lang);
  
  const t = (key: keyof typeof translations.id) => {
    return translations[lang][key] || key;
  };

  return { t, lang };
};
