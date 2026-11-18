'use client';

import React, { useState } from 'react';
import { ScreenType } from '@/types';
import { sound } from '@/lib/audioEngine';

interface HomeScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onOpenParentGate: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenParentGate,
}) => {
  const [activePreviewWord, setActivePreviewWord] = useState<string>('creatures');

  // Handle "Tap to Listen" sentence narration
  const handleListenWelcome = () => {
    sound.playChime(1.1);
    sound.speak(
      'Welcome to Encanta! Barnaby steered his wooden airship past gentle cloud creatures under the shimmering starlight.'
    );
  };

  // Handle preview word click
  const handlePreviewWordClick = (word: string) => {
    sound.playTap();
    setActivePreviewWord(word);
    sound.speak(word);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-5 md:px-10 py-8 md:py-12 space-y-12">
      {/* Hero Spread */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Hero Copy & Actions */}
        <div className="lg:col-span-6 flex flex-col justify-center gap-6">
          <div className="text-sm font-headline font-bold text-primary tracking-wide uppercase">
            Tactile Reading Adventure · Ages 2–6
          </div>
          <h1 className="font-headline text-[34px] sm:text-[42px] md:text-[48px] font-bold text-on-surface leading-tight">
            Where Every Story Unlocks a Golden Key
          </h1>
          <p className="text-[17px] md:text-[18px] font-semibold text-on-surface-variant leading-relaxed">
            Step into cozy picture books with read-along narration, bouncy syllable clues, and friendly word challenges that turn early reading into playtime.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                sound.playChime(1.15);
                sound.speak('Opening Reading Theater');
                onNavigate('theater');
              }}
              className="h-14 px-8 rounded-full bg-primary-container text-on-primary-fixed font-headline text-[17px] font-bold shadow-[0_4px_0_#edc22e] flex items-center gap-2 cursor-pointer hover:bg-primary-fixed active:translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">play_circle</span>
              <span>Start Reading Now</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                sound.speak('Story Library');
                onNavigate('library');
              }}
              className="h-14 px-7 rounded-full bg-white border-2 border-[#EFE7D6] text-on-surface font-headline text-[16px] font-bold shadow-[0_4px_0_#d9dadc] flex items-center gap-2 cursor-pointer hover:bg-surface-container-low active:translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-tertiary text-2xl">menu_book</span>
              <span>Browse Library</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playTap();
                sound.speak('Playground Games and Videos');
                onNavigate('playground');
              }}
              className="h-14 px-7 rounded-full bg-tertiary-container text-on-tertiary-container font-headline text-[16px] font-bold shadow-[0_4px_0_#006961] flex items-center gap-2 cursor-pointer hover:bg-[#4edacb] active:translate-y-0.5 transition-all"
            >
              <span className="material-symbols-outlined text-2xl">sports_esports</span>
              <span>Playground Games</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#EFE7D6] text-sm font-bold text-on-surface-variant">
            <span>4 Illustrated Books</span>
            <span>·</span>
            <span>12 Golden Key Challenges</span>
            <span>·</span>
            <span>Tap-to-Hear Phonics</span>
          </div>
        </div>

        {/* Right Column: Featured Interactive Story Stage Card */}
        <div className="lg:col-span-6 bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 shadow-[0_8px_0_rgba(30,32,34,0.06)] flex flex-col justify-between gap-5">
          <div className="h-60 rounded-[20px] bg-gradient-to-br from-[#121c36] via-[#1e315c] to-[#1b4d5c] flex flex-col items-center justify-center text-white p-6 text-center relative overflow-hidden shadow-inner">
            <span className="material-symbols-outlined text-[64px] text-primary-container mb-2 animate-bounce">
              auto_stories
            </span>
            <span className="font-headline text-xl font-bold tracking-tight">Barnaby&apos;s Sky Deck</span>
            <span className="text-sm text-white/80 mt-1 font-semibold">Open Storybook Welcome Stage</span>
          </div>

          <div className="bg-[#FDF8EE] rounded-2xl border-2 border-[#F4EBD9] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-headline text-sm font-bold text-on-surface">Try a Tactile Story Word</span>
              <button
                type="button"
                id="homeListenBtn"
                onClick={handleListenWelcome}
                className="h-10 px-4 rounded-full bg-secondary-container text-white font-headline text-xs font-bold shadow-[0_3px_0_#920020] cursor-pointer hover:bg-[#ff4250] active:translate-y-0.5 transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">volume_up</span>
                <span>Tap to Listen</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { word: 'creatures', label: 'creatures' },
                { word: 'starlight', label: 'starlight' },
                { word: 'compass', label: 'compass' },
              ].map((item) => {
                const isSelected = activePreviewWord === item.word;
                return (
                  <button
                    key={item.word}
                    type="button"
                    data-word={item.word}
                    onClick={() => handlePreviewWordClick(item.word)}
                    className={`preview-word h-12 rounded-full font-headline text-sm font-bold cursor-pointer active:translate-y-0.5 transition-all flex items-center justify-center ${
                      isSelected
                        ? 'bg-tertiary-container text-on-tertiary-container shadow-[0_4px_0_#006961]'
                        : 'bg-white border-2 border-[#EFE7D6] text-on-surface shadow-[0_4px_0_#d9dadc] hover:bg-surface-container-low'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Adventure Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onNavigate('library');
          }}
          className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 shadow-[0_6px_0_rgba(30,32,34,0.05)] space-y-2 text-left cursor-pointer hover:shadow-[0_8px_0_rgba(30,32,34,0.09)] active:translate-y-0.5 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_4px_0_#edc22e]">
            <span className="material-symbols-outlined text-2xl font-bold">auto_stories</span>
          </div>
          <h2 className="font-headline text-lg font-bold text-on-surface">01. Pick a Picture Book</h2>
          <p className="text-sm text-on-surface-variant font-medium">
            Choose from cozy bedtime flights, enchanted forests, and yellow submarine science journals.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onNavigate('theater');
          }}
          className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 shadow-[0_6px_0_rgba(30,32,34,0.05)] space-y-2 text-left cursor-pointer hover:shadow-[0_8px_0_rgba(30,32,34,0.09)] active:translate-y-0.5 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center shadow-[0_4px_0_#006961]">
            <span className="material-symbols-outlined text-2xl font-bold">vpn_key</span>
          </div>
          <h2 className="font-headline text-lg font-bold text-on-surface">02. Unlock Golden Keys</h2>
          <p className="text-sm text-on-surface-variant font-medium">
            Fill missing story words using syllable dots and phonics clues inside the Reading Theater.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onNavigate('words');
          }}
          className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 shadow-[0_6px_0_rgba(30,32,34,0.05)] space-y-2 text-left cursor-pointer hover:shadow-[0_8px_0_rgba(30,32,34,0.09)] active:translate-y-0.5 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-secondary-container text-white flex items-center justify-center shadow-[0_4px_0_#920020]">
            <span className="material-symbols-outlined text-2xl font-bold">menu_book</span>
          </div>
          <h2 className="font-headline text-lg font-bold text-on-surface">03. Grow Your Word Chest</h2>
          <p className="text-sm text-on-surface-variant font-medium">
            Collect unlocked words into your Word Collector chest to tap, hear, and practice anytime.
          </p>
        </button>
      </section>

      {/* Children's Playground Quick Hub Preview */}
      <section className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-headline font-bold text-secondary uppercase tracking-wider">
              Games & Cartoons
            </span>
            <h2 className="font-headline text-2xl font-bold text-on-surface mt-0.5">
              Children&apos;s Playground Hub
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playTap();
              onNavigate('playground');
            }}
            className="h-11 px-5 rounded-full bg-primary-container text-on-primary-container shadow-[0_3px_0_#edc22e] font-headline text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-primary-fixed active:translate-y-0.5 transition-all self-start sm:self-auto"
          >
            <span>View All Playground Games</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'gemfall', name: 'Gemfall Dig', emoji: '💎', bg: 'bg-[#ffedd5]', shadow: 'shadow-[0_4px_0_#fb923c]' },
            { id: 'wordezy', name: 'Word Search', emoji: '🔍', bg: 'bg-[#d1fae5]', shadow: 'shadow-[0_4px_0_#34d399]' },
            { id: 'jetpack', name: 'Jetpack', emoji: '🚀', bg: 'bg-[#dbeafe]', shadow: 'shadow-[0_4px_0_#60a5fa]' },
            { id: 'colouring', name: 'Colouring', emoji: '🖌️', bg: 'bg-[#ffdad9]', shadow: 'shadow-[0_4px_0_#fca5a5]' },
            { id: 'videos', name: 'Videos', emoji: '▶️', bg: 'bg-[#DEC0F1]', shadow: 'shadow-[0_4px_0_#c084fc]' },
            { id: 'animals', name: 'Animals', emoji: '🐮', bg: 'bg-[#FEE388]', shadow: 'shadow-[0_4px_0_#fde047]' },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => {
                sound.playTap();
                sound.speak(act.name);
                onNavigate(act.id as ScreenType);
              }}
              className={`${act.bg} ${act.shadow} rounded-[20px] p-4 flex flex-col items-center text-center cursor-pointer hover:scale-105 active:scale-95 transition-all`}
            >
              <span className="text-3xl mb-1">{act.emoji}</span>
              <span className="font-headline text-xs font-bold text-on-surface">{act.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full pt-6 border-t border-[#EFE7D6]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="font-headline text-[22px] font-bold text-primary">Encanta</span>
            <span className="font-body text-[15px] text-on-surface-variant">
              • Tactile Reading Adventure
            </span>
          </div>
          <div className="font-headline text-[13px] text-on-surface-variant font-bold">
            © 2026 Encanta Learning Theater. Designed for curious minds.
          </div>
        </div>
      </footer>
    </div>
  );
};
