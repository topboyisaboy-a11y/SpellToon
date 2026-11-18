'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryBook } from '@/types';
import { sound } from '@/lib/audioEngine';
import { Volume2, X, Key, Check, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReadingTheaterProps {
  story: StoryBook;
  onClose: () => void;
  onEarnKey: () => void;
}

export const ReadingTheater: React.FC<ReadingTheaterProps> = ({
  story,
  onClose,
  onEarnKey,
}) => {
  const [selectedWord, setSelectedWord] = useState<string>(story.sentence.targetWord);
  const [hasClaimedKey, setHasClaimedKey] = useState<boolean>(false);
  const [wigglingWord, setWigglingWord] = useState<string | null>(null);

  const handleWordSelect = (choice: { word: string; isCorrect: boolean; syllables: string }) => {
    sound.playTap();
    sound.speak(choice.word);
    setSelectedWord(choice.word);

    if (!choice.isCorrect) {
      setWigglingWord(choice.word);
      sound.playSoftWiggle();
      setTimeout(() => setWigglingWord(null), 500);
    }
  };

  const handleReadAloud = () => {
    sound.playTap();
    const fullSentence = `${story.sentence.prefix} ${selectedWord} ${story.sentence.suffix}`;
    sound.speak(fullSentence);
  };

  const handleClaimKey = () => {
    if (selectedWord !== story.sentence.targetWord) {
      sound.playSoftWiggle();
      sound.speak(`Almost! Try choosing the word that matches the story: ${story.sentence.targetWord}`);
      return;
    }

    sound.playChime(1.25);
    sound.speak('Golden Key Unlocked! Fantastic reading!');
    setHasClaimedKey(true);
    onEarnKey();

    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffd23f', '#63ecdd', '#ff5964', '#38B6FF', '#edc22e'],
        disableForReducedMotion: true,
      });
    } catch {}
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-100px)] flex items-center justify-center py-6 px-4 select-none overflow-hidden">
      {/* Background Deep Gradient (Stitch theater aesthetic) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#121a2a] via-[#1c2c4a] to-[#0f2636]" />
      <div className="absolute -top-12 -left-12 w-96 h-96 rounded-full bg-primary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-96 h-96 rounded-full bg-tertiary-container/20 blur-3xl pointer-events-none" />

      {/* Main Reading Theater Container (Stitch Modal Box) */}
      <div className="relative w-full max-w-[940px] bg-[#fffdf9] rounded-[32px] p-6 lg:p-8 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.45),0_10px_0_#e8dac4] flex flex-col justify-between gap-6 z-10 border-2 border-white">
        {/* Top Bar: Gate Progress Pills & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-[#F4EBD9]">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full shadow-[0_2px_0_#d1c5ad]">
            <div className="flex items-center gap-1.5">
              {/* Gate 1 Done */}
              <div className="w-7 h-7 rounded-full bg-tertiary flex items-center justify-center shadow-[0_2px_0_#005049]">
                <Check className="w-4 h-4 text-white stroke-[3]" />
              </div>
              <div className="w-3 h-1 bg-tertiary rounded-full" />
              {/* Gate 2 Active */}
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shadow-[0_3px_0_#edc22e]">
                <Key className="w-4 h-4 text-on-primary-container" />
              </div>
              <div className="w-3 h-1 bg-surface-container-highest rounded-full" />
              {/* Gate 3 Next */}
              <div className="w-7 h-7 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center opacity-70">
                <span className="text-xs font-headline font-bold text-on-surface">3</span>
              </div>
            </div>

            <div className="h-4 w-[1px] bg-outline-variant mx-1" />

            <div className="flex items-center gap-1.5 font-headline text-sm font-bold">
              <span className="text-primary">Gate 2</span>
              <span className="text-outline-variant">·</span>
              <span className="text-on-surface">Golden Key Challenge</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReadAloud}
              className="h-11 px-4 rounded-full bg-secondary-container text-white flex items-center gap-2 font-headline text-sm font-bold shadow-[0_4px_0_#920020] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>Tap to Listen</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center shadow-[0_3px_0_#d1c5ad] hover:text-on-surface transition-all cursor-pointer"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Content: Story Scene Badge & Sentence Fill Slot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Visual Scene Badge */}
          <div className="md:col-span-4 relative">
            <div className={`w-full h-48 rounded-2xl overflow-hidden shadow-[0_6px_0_#e8dac4] bg-gradient-to-br ${story.gradient} flex flex-col items-center justify-center text-white relative p-4`}>
              <span className="material-symbols-outlined text-6xl text-primary-container mb-1 drop-shadow">
                {story.icon}
              </span>
              <span className="font-headline text-sm font-bold text-center">{story.title}</span>
              <div className="absolute bottom-2 left-2 bg-[#121a2a]/85 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-container" />
                <span className="text-white font-body text-[11px] font-semibold">{story.subtitle}</span>
              </div>
            </div>
          </div>

          {/* Missing Word Sentence Display */}
          <div className="md:col-span-8 bg-white p-6 rounded-2xl shadow-[0_6px_0_#f0e8d9] border border-[#F4EBD9]">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-secondary text-sm">format_quote</span>
              <span className="font-headline text-[13px] text-on-surface-variant font-bold">
                Fill in the missing word:
              </span>
            </div>

            <p className="font-body text-[22px] md:text-[24px] text-on-surface leading-relaxed flex flex-wrap items-center gap-x-2.5 gap-y-3 font-semibold">
              <span>{story.sentence.prefix}</span>
              <span className="inline-flex items-center justify-center min-w-[150px] h-12 px-5 rounded-full bg-primary-container/20 text-primary font-headline text-[20px] font-bold border-2 border-dashed border-primary shadow-xs">
                <span>{selectedWord}</span>
              </span>
              <span>{story.sentence.suffix}</span>
            </p>

            <div className="mt-4 flex items-center gap-2 text-on-surface-variant text-sm font-body">
              <span className="material-symbols-outlined text-tertiary text-base">spellcheck</span>
              <span>{story.sentence.phonicsClue}</span>
            </div>
          </div>
        </div>

        {/* Word Choice Buttons (Stitch layout) */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {story.sentence.wordChoices.map((choice) => {
              const isSelected = selectedWord === choice.word;
              const isWiggling = wigglingWord === choice.word;

              return (
                <button
                  key={choice.word}
                  type="button"
                  onClick={() => handleWordSelect(choice)}
                  className={`relative h-20 rounded-full font-headline text-[20px] font-bold flex flex-col items-center justify-center transition-all cursor-pointer ${
                    choice.isCorrect
                      ? 'bg-tertiary-container text-on-tertiary-container shadow-[0_5px_0_#006961] active:translate-y-1'
                      : 'bg-white text-on-surface shadow-[0_5px_0_#d9dadc] active:translate-y-1'
                  } ${isSelected ? 'ring-4 ring-primary-container' : ''} ${
                    isWiggling ? 'animate-wiggle' : ''
                  }`}
                >
                  {choice.hint && (
                    <span className="absolute -top-2.5 right-4 bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded-full font-headline text-[11px] shadow-[0_2px_0_#edc22e]">
                      {choice.hint}
                    </span>
                  )}
                  <span>{choice.word}</span>
                  <span className="font-body text-xs text-on-surface-variant/80 tracking-widest font-semibold">
                    {choice.syllables}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Bar: Instructions & Earn Key CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="font-headline text-sm text-on-surface-variant font-bold text-center sm:text-left">
              Tap the word that completes {story.title.split("'")[0]}'s sentence!
            </span>

            {hasClaimedKey ? (
              <div className="w-full sm:w-auto px-7 h-14 rounded-full bg-tertiary text-white font-headline text-[17px] font-bold shadow-[0_4px_0_#005049] flex items-center justify-center gap-2">
                <span>Key Unlocked!</span>
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaimKey}
                className="w-full sm:w-auto px-8 h-14 rounded-full bg-primary-container text-on-primary-container font-headline text-[17px] font-bold shadow-[0_4px_0_#edc22e] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Earn Golden Key</span>
                <Key className="w-5 h-5 text-on-primary-container" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
