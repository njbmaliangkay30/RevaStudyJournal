
export type Theme = 'light' | 'dark' | 'sakura' | 'moon';

export interface Profile {
  id: string;
  username: string;
  coins: number;
  theme: Theme;
  inventory: Record<string, number>;
  streak: number;
  last_active: string;
}

export interface Block {
  id: string;
  user_id: string;
  name: string;
  start_date: string;
  exam_date: string;
  target_slides: number;
  exam_score: number;
  is_active: boolean;
}

export interface PPTDot {
  id: string;
  block_id: string;
  index: number;
  title?: string;
  is_done: boolean;
  completed_at?: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  is_difficult: boolean;
  created_at: string;
}

export interface GachaItem {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'skin' | 'powerup' | 'decorative';
  image_url?: string;
}
