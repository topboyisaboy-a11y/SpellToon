'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ScreenType } from '@/types';
import { sound } from '@/lib/audioEngine';
import {
  Paintbrush,
  Play,
  Palette,
  Hash,
  Type,
  Music,
  Heart,
  Sparkles,
  Smile,
} from 'lucide-react';

interface PlaygroundHubProps {
  onNavigate: (screen: ScreenType) => void;
  childName: string;
  avatarEmoji: string;
}

interface PlaygroundItem {
  id: ScreenType;
  title: string;
  spokenLabel: string;
  icon: React.ReactNode;
  bgClass: string;
  borderClass: string;
  textClass: string;
}

export const PlaygroundHub: React.FC<PlaygroundHubProps> = ({
  onNavigate,
  childName,
  avatarEmoji,
}) => {
  const items: PlaygroundItem[] = [
    // Row 1 (Matches user image)
    {
      id: 'colouring',
      title: 'Colouring',
      spokenLabel: 'Colouring Book',
      icon: <span className="text-4xl md:text-5xl">🖌️</span>,
      bgClass: 'bg-[#FDF2F8]',
      borderClass: 'border-[#F472B6]',
      textClass: 'text-[#831843]',
    },
    {
      id: 'videos',
      title: 'Videos',
      spokenLabel: 'Cartoon Videos',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#9333EA] flex items-center justify-center text-white shadow-sm">
          <Play className="w-7 h-7 fill-white translate-x-0.5" />
        </div>
      ),
      bgClass: 'bg-[#FAF5FF]',
      borderClass: 'border-[#A855F7]',
      textClass: 'text-[#581C87]',
    },

    // Row 2 (Matches user image)
    {
      id: 'animals',
      title: 'Animals',
      spokenLabel: 'Animals and Pets',
      icon: <span className="text-4xl md:text-5xl">🐮</span>,
      bgClass: 'bg-[#FEFCE8]',
      borderClass: 'border-[#F59E0B]',
      textClass: 'text-[#78350F]',
    },
    {
      id: 'colours-shapes',
      title: 'Colours & Shapes',
      spokenLabel: 'Colours and Shapes',
      icon: <span className="text-4xl md:text-5xl">🎨</span>,
      bgClass: 'bg-[#FFF1F2]',
      borderClass: 'border-[#FB7185]',
      textClass: 'text-[#881337]',
    },

    // Row 3 (Matches user image)
    {
      id: 'numbers',
      title: 'Numbers',
      spokenLabel: 'Numbers and Counting',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#60A5FA] flex flex-col items-center justify-center text-white font-black text-sm leading-tight shadow-sm">
          <span>12</span>
          <span>34</span>
        </div>
      ),
      bgClass: 'bg-[#F0F9FF]',
      borderClass: 'border-[#38BDF8]',
      textClass: 'text-[#0C4A6E]',
    },
    {
      id: 'abc-letters',
      title: 'ABC Letters',
      spokenLabel: 'ABC Alphabet Letters',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-[#4ADE80] flex items-center justify-center text-white font-black text-lg shadow-sm">
          abc
        </div>
      ),
      bgClass: 'bg-[#F0FDF4]',
      borderClass: 'border-[#4ADE80]',
      textClass: 'text-[#14532D]',
    },

    // Row 4 (Matches user image)
    {
      id: 'music-sounds',
      title: 'Music & Sounds',
      spokenLabel: 'Music and Sounds',
      icon: <span className="text-4xl md:text-5xl">🎵</span>,
      bgClass: 'bg-[#FAF5FF]',
      borderClass: 'border-[#C084FC]',
      textClass: 'text-[#581C87]',
    },
    {
      id: 'my-body',
      title: 'My Body',
      spokenLabel: 'My Body Parts',
      icon: <span className="text-4xl md:text-5xl">🫶</span>,
      bgClass: 'bg-[#FFF7ED]',
      borderClass: 'border-[#FB923C]',
      textClass: 'text-[#7C2D12]',
    },

    // Row 5 (Arcade & Word Games)
    {
      id: 'gemfall',
      title: 'Gemfall Dig',
      spokenLabel: 'Gemfall Cave Digging Adventure',
      icon: <span className="text-4xl md:text-5xl">💎</span>,
      bgClass: 'bg-[#FFF7ED]',
      borderClass: 'border-[#F97316]',
      textClass: 'text-[#9A3412]',
    },
    {
      id: 'wordezy',
      title: 'Word Search',
      spokenLabel: 'Word Search Puzzle',
      icon: <span className="text-4xl md:text-5xl">🔍</span>,
      bgClass: 'bg-[#ECFDF5]',
      borderClass: 'border-[#10B981]',
      textClass: 'text-[#065F46]',
    },

    // Row 6 (Action & Skill)
    {
      id: 'jetpack',
      title: 'Jetpack Surge',
      spokenLabel: 'Jetpack Flying Game',
      icon: <span className="text-4xl md:text-5xl">🚀</span>,
      bgClass: 'bg-[#EFF6FF]',
      borderClass: 'border-[#3B82F6]',
      textClass: 'text-[#1E40AF]',
    },
    {
      id: 'bubbles',
      title: 'Bubble Pop',
      spokenLabel: 'Pop the Bubbles Game',
      icon: <span className="text-4xl md:text-5xl">🫧</span>,
      bgClass: 'bg-[#F0F9FF]',
      borderClass: 'border-[#38BDF8]',
      textClass: 'text-[#0C4A6E]',
    },

    // Row 7 (Sticker Album)
    {
      id: 'stickers',
      title: 'My Stickers',
      spokenLabel: 'My Sticker Album',
      icon: <span className="text-4xl md:text-5xl">🌟</span>,
      bgClass: 'bg-[#FEFCE8]',
      borderClass: 'border-[#FBBF24]',
      textClass: 'text-[#78350F]',
    },
  ];

  const handleCardClick = (item: PlaygroundItem) => {
    sound.playTap();
    sound.speak(item.spokenLabel);
    onNavigate(item.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center pb-20">
      {/* Friendly Child Greeting Header */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          sound.playChime(1.1);
          sound.speak(`Hello ${childName}! Welcome to your playground!`);
        }}
        className="flex items-center gap-4 bg-white/95 px-8 py-4 rounded-4xl shadow-sm border-2 border-cocoa/10 mb-8 cursor-pointer hover:shadow-md transition-all"
      >
        <span className="text-5xl">{avatarEmoji}</span>
        <span className="text-3xl font-black text-cocoa">Playground for {childName}</span>
      </motion.button>

      {/* 2-Column Playground Card Grid (Matches uploaded screenshot layout & styles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 w-full px-2">
        {items.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => handleCardClick(item)}
            className={`min-h-[96px] md:min-h-[108px] rounded-[32px] md:rounded-[36px] border-[3.5px] p-5 flex items-center gap-5 shadow-toddler active:shadow-toddler-active transition-all cursor-pointer ${item.bgClass} ${item.borderClass} ${item.textClass}`}
            aria-label={item.spokenLabel}
          >
            {/* Left Icon */}
            <div className="flex-shrink-0 flex items-center justify-center">
              {item.icon}
            </div>

            {/* Title */}
            <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {item.title}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
