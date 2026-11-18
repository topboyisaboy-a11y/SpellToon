export type ScreenType = 
  | 'home'
  | 'library'
  | 'theater'
  | 'words'
  | 'playground'
  | 'videos'
  | 'colouring'
  | 'animals'
  | 'colours-shapes'
  | 'numbers'
  | 'abc-letters'
  | 'music-sounds'
  | 'my-body'
  | 'quiz' 
  | 'bubbles' 
  | 'stickers' 
  | 'gemfall'
  | 'wordezy'
  | 'jetpack'
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
  unlockedEpisodeIds: string[];
  wordsLearnedCount: number;
  accuracyScore: number;
  dayStreak: number;
  earnedKeysCount: number;
}

export interface StoryBook {
  id: string;
  title: string;
  subtitle: string;
  genre: 'Adventure' | 'Fantasy' | 'Science';
  level: string;
  readTime: string;
  description: string;
  icon: string;
  gradient: string;
  keysEarned: number;
  totalKeys: number;
  sentence: {
    prefix: string;
    targetWord: string;
    suffix: string;
    phonicsClue: string;
    wordChoices: {
      word: string;
      syllables: string;
      isCorrect: boolean;
      hint?: string;
    }[];
  };
}

export interface CollectorWord {
  id: string;
  word: string;
  syllables: string;
  phonics: string;
  sentence: string;
  storyTitle: string;
  theme: string;
  isCollected: boolean;
}

export interface VideoEpisode {
  id: string;
  title: string;
  channelName: string;
  youtubeId: string;
  thumbnailEmoji: string;
  duration: string;
  isUnlocked: boolean;
  requiredWords: {
    word: string;
    emoji: string;
    prompt: string;
  }[];
  subtitleSnippet: string;
}

export interface LearningItem {
  id: string;
  title: string;
  emoji: string;
  soundName?: string;
  detailText?: string;
  count?: number;
  color?: string;
}

export interface FlashcardItem {
  id: string;
  word: string;
  emoji: string;
  category: string;
  phonics: string;
}

export interface WorkbookItem {
  id: string;
  title: string;
  price: string;
  emoji: string;
  pages: number;
  description: string;
  isPurchased?: boolean;
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
