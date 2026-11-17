'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PICTURE_WORDS } from '@/lib/mockData';
import { PictureWord } from '@/types';
import { sound } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';
import { Volume2, Sparkles, RefreshCw } from 'lucide-react';

interface PictureQuizGameProps {
  onRewardSticker?: (stickerId: string) => void;
}

export const PictureQuizGame: React.FC<PictureQuizGameProps> = ({ onRewardSticker }) => {
  const [targetWord, setTargetWord] = useState<PictureWord>(PICTURE_WORDS[0]);
  const [options, setOptions] = useState<PictureWord[]>([]);
  const [wigglingId, setWigglingId] = useState<string | null>(null);
  const [matchedId, setMatchedId] = useState<string | null>(null);
  const [isShadowMode, setIsShadowMode] = useState(false);

  const startNewRound = () => {
    // Pick random target
    const randomTarget = PICTURE_WORDS[Math.floor(Math.random() * PICTURE_WORDS.length)];
    // Pick 2 other random options
    const others = PICTURE_WORDS.filter((w) => w.id !== randomTarget.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const shuffled = [randomTarget, ...others].sort(() => Math.random() - 0.5);

    setTargetWord(randomTarget);
    setOptions(shuffled);
    setWigglingId(null);
    setMatchedId(null);

    // Speak prompt aloud
    setTimeout(() => {
      sound.speak(`Find the ${randomTarget.name}`);
    }, 200);
  };

  useEffect(() => {
    startNewRound();
  }, [isShadowMode]);

  const handleCardTap = (word: PictureWord) => {
    if (matchedId) return; // Prevent double taps during celebration

    if (word.id === targetWord.id) {
      // Correct Match!
      setMatchedId(word.id);
      sound.playChime(1.1);
      sound.speak(`Great job! That is the ${word.name}!`);

      // Gentle pastel confetti
      try {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FEE388', '#FFC4A4', '#BEE3DB', '#B5E2FA', '#F7CAD0'],
          disableForReducedMotion: true,
        });
      } catch {}

      if (onRewardSticker) {
        onRewardSticker(`sticker-${word.id}`);
      }

      // Next round after short delay
      setTimeout(() => {
        startNewRound();
      }, 1600);
    } else {
      // Gentle mismatch: No buzzer! Speaks tapped name and wiggles gently
      setWigglingId(word.id);
      sound.playSoftWiggle();
      sound.speak(`That is the ${word.name}. Where is the ${targetWord.name}?`);

      setTimeout(() => {
        setWigglingId(null);
      }, 500);
    }
  };

  const repeatPrompt = () => {
    sound.playTap();
    sound.speak(`Find the ${targetWord.name}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4 md:p-6 pb-20">
      {/* Mode Switcher (Picture Tap vs Shadow Match) */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => {
            sound.playTap();
            sound.speak('Picture Game');
            setIsShadowMode(false);
          }}
          className={`min-w-touch min-h-touch px-6 py-3 rounded-3xl font-extrabold text-xl transition-all shadow-toddler ${
            !isShadowMode ? 'bg-bubble-yellow scale-105' : 'bg-white text-cocoa/60'
          }`}
        >
          🖼️ Picture Match
        </button>

        <button
          onClick={() => {
            sound.playTap();
            sound.speak('Shadow Game');
            setIsShadowMode(true);
          }}
          className={`min-w-touch min-h-touch px-6 py-3 rounded-3xl font-extrabold text-xl transition-all shadow-toddler ${
            isShadowMode ? 'bg-bubble-peach scale-105' : 'bg-white text-cocoa/60'
          }`}
        >
          👤 Shadow Match
        </button>
      </div>

      {/* Center Target Prompt Card */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={repeatPrompt}
        className="min-w-touch min-h-touch w-56 h-56 md:w-64 md:h-64 rounded-4xl bg-white shadow-xl border-4 border-white flex flex-col items-center justify-center p-4 mb-8 cursor-pointer relative"
      >
        <span
          className={`text-8xl md:text-9xl transition-all ${
            isShadowMode ? 'filter brightness-0 opacity-20' : ''
          }`}
        >
          {targetWord.emoji}
        </span>

        {/* Audio Replay Indicator */}
        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-bubble-yellow/80 flex items-center justify-center">
          <Volume2 className="w-7 h-7 text-cocoa" />
        </div>
      </motion.button>

      {/* 3 Large Choice Cards (Each >= 80px touch target) */}
      <div className="grid grid-cols-3 gap-4 md:gap-8 w-full max-w-2xl">
        {options.map((opt) => {
          const isWiggling = wigglingId === opt.id;
          const isMatched = matchedId === opt.id;

          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleCardTap(opt)}
              className={`min-w-touch min-h-touch aspect-square rounded-4xl flex items-center justify-center text-7xl md:text-8xl p-4 shadow-toddler border-4 transition-all cursor-pointer ${
                opt.bgColor
              } ${isWiggling ? 'animate-wiggle border-bubble-peach' : 'border-white'} ${
                isMatched ? 'scale-110 ring-8 ring-bubble-mint' : ''
              }`}
            >
              {opt.emoji}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
