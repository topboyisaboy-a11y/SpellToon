import { ChildProfile, ColoringPage, PictureWord, Sticker } from '@/types';

export const INITIAL_CHILD_PROFILE: ChildProfile = {
  id: 'child-1',
  name: 'Leo',
  avatarEmoji: '🦁',
  dailyLimitMinutes: 30,
  bedtimeHour: 19,
  bedtimeMinute: 30,
  unlockedStickerIds: ['sticker-sun', 'sticker-lion', 'sticker-cat'],
  totalTimeMinutes: 14,
};

export const PICTURE_WORDS: PictureWord[] = [
  { id: 'cat', name: 'Cat', emoji: '🐱', category: 'animals', bgColor: 'bg-bubble-peach' },
  { id: 'dog', name: 'Dog', emoji: '🐶', category: 'animals', bgColor: 'bg-bubble-yellow' },
  { id: 'lion', name: 'Lion', emoji: '🦁', category: 'animals', bgColor: 'bg-bubble-yellow' },
  { id: 'frog', name: 'Frog', emoji: '🐸', category: 'animals', bgColor: 'bg-bubble-mint' },
  { id: 'duck', name: 'Duck', emoji: '🦆', category: 'animals', bgColor: 'bg-bubble-mint' },
  { id: 'bunny', name: 'Bunny', emoji: '🐰', category: 'animals', bgColor: 'bg-bubble-pink' },
  { id: 'apple', name: 'Apple', emoji: '🍎', category: 'food', bgColor: 'bg-bubble-pink' },
  { id: 'banana', name: 'Banana', emoji: '🍌', category: 'food', bgColor: 'bg-bubble-yellow' },
  { id: 'cookie', name: 'Cookie', emoji: '🍪', category: 'food', bgColor: 'bg-bubble-peach' },
  { id: 'sun', name: 'Sun', emoji: '☀️', category: 'nature', bgColor: 'bg-bubble-yellow' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'nature', bgColor: 'bg-bubble-lavender' },
  { id: 'star', name: 'Star', emoji: '⭐', category: 'nature', bgColor: 'bg-bubble-yellow' },
  { id: 'flower', name: 'Flower', emoji: '🌸', category: 'nature', bgColor: 'bg-bubble-pink' },
  { id: 'car', name: 'Car', emoji: '🚗', category: 'vehicles', bgColor: 'bg-bubble-sky' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀', category: 'vehicles', bgColor: 'bg-bubble-lavender' },
  { id: 'train', name: 'Train', emoji: '🚂', category: 'vehicles', bgColor: 'bg-bubble-mint' },
];

export const COLORING_PAGES: ColoringPage[] = [
  {
    id: 'page-sun-cloud',
    name: 'Happy Sun & Cloud',
    emoji: '☀️',
    viewBox: '0 0 500 400',
    regions: [
      { id: 'sun-core', name: 'Sun', d: 'M 250,140 m -60,0 a 60,60 0 1,0 120,0 a 60,60 0 1,0 -120,0', defaultColor: '#FFFDF5' },
      { id: 'ray-1', name: 'Sun Ray', d: 'M 250,50 L 260,75 L 240,75 Z', defaultColor: '#FFFDF5' },
      { id: 'ray-2', name: 'Sun Ray', d: 'M 340,140 L 315,150 L 315,130 Z', defaultColor: '#FFFDF5' },
      { id: 'ray-3', name: 'Sun Ray', d: 'M 160,140 L 185,130 L 185,150 Z', defaultColor: '#FFFDF5' },
      { id: 'cloud-puff', name: 'Fluffy Cloud', d: 'M 120,290 C 110,240 180,210 220,240 C 260,190 350,210 360,260 C 410,260 410,320 370,330 C 360,350 200,350 150,330 C 110,330 100,300 120,290 Z', defaultColor: '#FFFDF5' },
      { id: 'grass-ground', name: 'Soft Grass', d: 'M 0,360 Q 250,340 500,360 L 500,400 L 0,400 Z', defaultColor: '#FFFDF5' },
    ],
  },
  {
    id: 'page-flower-pot',
    name: 'Friendly Flower',
    emoji: '🌸',
    viewBox: '0 0 500 400',
    regions: [
      { id: 'pot', name: 'Plant Pot', d: 'M 190,260 L 310,260 L 290,360 L 210,360 Z', defaultColor: '#FFFDF5' },
      { id: 'stem', name: 'Flower Stem', d: 'M 242,160 L 258,160 L 258,260 L 242,260 Z', defaultColor: '#FFFDF5' },
      { id: 'leaf-left', name: 'Leaf', d: 'M 242,210 Q 180,190 190,230 Q 220,240 242,220 Z', defaultColor: '#FFFDF5' },
      { id: 'leaf-right', name: 'Leaf', d: 'M 258,210 Q 320,190 310,230 Q 280,240 258,220 Z', defaultColor: '#FFFDF5' },
      { id: 'center', name: 'Flower Center', d: 'M 250,110 m -28,0 a 28,28 0 1,0 56,0 a 28,28 0 1,0 -56,0', defaultColor: '#FFFDF5' },
      { id: 'petal-top', name: 'Petal', d: 'M 250,82 C 230,40 270,40 250,82 Z', defaultColor: '#FFFDF5' },
      { id: 'petal-right', name: 'Petal', d: 'M 278,110 C 320,90 320,130 278,110 Z', defaultColor: '#FFFDF5' },
      { id: 'petal-bottom', name: 'Petal', d: 'M 250,138 C 270,180 230,180 250,138 Z', defaultColor: '#FFFDF5' },
      { id: 'petal-left', name: 'Petal', d: 'M 222,110 C 180,130 180,90 222,110 Z', defaultColor: '#FFFDF5' },
    ],
  },
];

export const ALL_STICKERS: Sticker[] = [
  { id: 'sticker-sun', name: 'Golden Sun', emoji: '☀️', category: 'Nature', description: 'Warm and bright' },
  { id: 'sticker-lion', name: 'Brave Lion', emoji: '🦁', category: 'Animals', description: 'Friendly king' },
  { id: 'sticker-cat', name: 'Playful Cat', emoji: '🐱', category: 'Animals', description: 'Purring pal' },
  { id: 'sticker-rainbow', name: 'Magic Rainbow', emoji: '🌈', category: 'Nature', description: 'So many colors' },
  { id: 'sticker-star', name: 'Twinkle Star', emoji: '⭐', category: 'Nature', description: 'Nighttime sparkle' },
  { id: 'sticker-rocket', name: 'Zooming Rocket', emoji: '🚀', category: 'Vehicles', description: 'To the moon' },
  { id: 'sticker-cookie', name: 'Sweet Cookie', emoji: '🍪', category: 'Treats', description: 'Yummy snack' },
  { id: 'sticker-frog', name: 'Hoppy Frog', emoji: '🐸', category: 'Animals', description: 'Ribbit ribbit' },
  { id: 'sticker-apple', name: 'Red Apple', emoji: '🍎', category: 'Treats', description: 'Crunchy fruit' },
  { id: 'sticker-car', name: 'Vroom Car', emoji: '🚗', category: 'Vehicles', description: 'Beep beep' },
  { id: 'sticker-duck', name: 'Yellow Duck', emoji: '🦆', category: 'Animals', description: 'Quack quack' },
  { id: 'sticker-flower', name: 'Gentle Blossom', emoji: '🌸', category: 'Nature', description: 'Sweet smelling' },
];

export const PALETTE_COLORS = [
  { name: 'Butter Yellow', hex: '#FEE388' },
  { name: 'Peach Blossom', hex: '#FFC4A4' },
  { name: 'Sage Mint', hex: '#BEE3DB' },
  { name: 'Sky Blue', hex: '#B5E2FA' },
  { name: 'Lavender Mist', hex: '#DEC0F1' },
  { name: 'Cotton Pink', hex: '#F7CAD0' },
  { name: 'Cocoa Brown', hex: '#A2705B' },
  { name: 'Fresh Grass', hex: '#87C38F' },
  { name: 'White Cloud', hex: '#FFFFFF' },
];
