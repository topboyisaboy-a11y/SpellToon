'use client';

import React from 'react';
import { ScreenType } from '@/types';
import { sound } from '@/lib/audioEngine';
import { Volume2, Shield, BookOpen } from 'lucide-react';

interface NavigationBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenParentGate: () => void;
  childName: string;
  avatarEmoji: string;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentScreen,
  onNavigate,
  onOpenParentGate,
  childName,
  avatarEmoji,
}) => {
  const isSelected = (screen: ScreenType) => currentScreen === screen;

  const handleNavClick = (screen: ScreenType, spoken: string) => {
    sound.playTap();
    sound.speak(spoken);
    onNavigate(screen);
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-[#FDF8EE]/95 backdrop-blur-xl border-b border-[#EFE7D6]">
      <div className="h-20 max-w-[1200px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo (Stitch Encanta style) */}
        <button
          type="button"
          onClick={() => handleNavClick('home', 'Home')}
          className="flex items-center gap-3 cursor-pointer text-left"
        >
          <div className="w-11 h-11 rounded-full bg-primary-container flex items-center justify-center shadow-[0_4px_0_#edc22e]">
            <span className="material-symbols-outlined text-on-primary-container text-2xl font-bold">
              auto_stories
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-[24px] font-bold text-primary tracking-tight leading-none">
              Encanta
            </span>
            <span className="font-body text-[11px] font-bold text-cocoa/50 uppercase tracking-widest">
              SpellToon
            </span>
          </div>
        </button>

        {/* Center Pill Navigation Bar (Stitch Pill Style) */}
        <nav className="flex items-center gap-1 sm:gap-2 bg-[#F4EBD9]/80 p-1.5 rounded-full overflow-x-auto">
          <button
            type="button"
            onClick={() => handleNavClick('home', 'Home')}
            className={`font-headline text-[14px] font-bold px-4 md:px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              isSelected('home')
                ? 'bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('library', 'Library')}
            className={`font-headline text-[14px] font-bold px-4 md:px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              isSelected('library')
                ? 'bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Library
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('theater', 'Reading Theater')}
            className={`font-headline text-[14px] font-bold px-4 md:px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              isSelected('theater')
                ? 'bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Theater
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('words', 'Word Collector')}
            className={`font-headline text-[14px] font-bold px-4 md:px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              isSelected('words')
                ? 'bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Words
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('playground', 'Playground Activities')}
            className={`font-headline text-[14px] font-bold px-4 md:px-5 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              isSelected('playground')
                ? 'bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Playground
          </button>

          <button
            type="button"
            onClick={() => onOpenParentGate()}
            className="font-headline text-[14px] font-bold px-4 md:px-5 py-2 text-on-surface-variant hover:text-on-surface rounded-full transition-all cursor-pointer whitespace-nowrap"
          >
            Parents
          </button>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Toggle sound and speak welcome"
            onClick={() => {
              sound.playChime(1.1);
              sound.speak(`Hello ${childName}! Welcome to Encanta SpellToon!`);
            }}
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-all cursor-pointer shadow-sm"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Child Profile Circle */}
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              sound.speak(`Player: ${childName}`);
            }}
            className="w-9 h-9 rounded-full bg-primary-fixed border-2 border-primary-fixed-dim flex items-center justify-center font-headline text-base font-bold text-primary shadow-xs"
          >
            {avatarEmoji}
          </button>
        </div>
      </div>
    </header>
  );
};
