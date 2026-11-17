export type ScreenType = 
  | 'home' 
  | 'quiz' 
  | 'matching' 
  | 'bubbles' 
  | 'coloring' 
  | 'stickers' 
  | 'parent';

export interface ChildProfile {
  id: string;
  name: string;
  avatarEmoji: string;
  dailyLimitMinutes: number;
  bedtimeHour: number; // 0-23
  bedtimeMinute: number;
  unlockedStickerIds: string[];
  totalTimeMinutes: number;
}

export interface PictureWord {
  id: string;
  name: string;
  emoji: string;
  category: 'animals' | 'nature' | 'food' | 'vehicles';
  bgColor: string;
}

export interface ColoringRegion {
  id: string;
  name: string;
  d: string;
  defaultColor?: string;
}

export interface ColoringPage {
  id: string;
  name: string;
  emoji: string;
  viewBox: string;
  regions: ColoringRegion[];
}

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
}
