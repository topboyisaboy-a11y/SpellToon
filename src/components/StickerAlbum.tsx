'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_STICKERS } from '@/lib/mockData';
import { Sticker } from '@/types';
import { sound } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';
import { Sparkles, Star } from 'lucide-react';

interface StickerAlbumProps {
  unlockedIds: string[];
}

export const StickerAlbum: React.FC<StickerAlbumProps> = ({ unlockedIds }) => {
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);

  const handleStickerTap = (sticker: Sticker) => {
    const isUnlocked = unlockedIds.includes(sticker.id);

    if (isUnlocked) {
      sound.playChime(1.15);
      sound.speak(sticker.name);
      setSelectedSticker(sticker);

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FEE388', '#FFC4A4', '#BEE3DB', '#B5E2FA', '#DEC0F1'],
          disableForReducedMotion: true,
        });
      } catch {}
    } else {
      sound.playSoftWiggle();
      sound.speak('Secret sticker! Play games to unlock!');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-4 md:p-6 pb-24">
      {/* Header Banner */}
      <div className="w-full flex items-center justify-between bg-white rounded-3xl p-5 mb-6 shadow-sm border border-cocoa/10">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🌟</span>
          <div>
            <h1 className="text-2xl font-black text-cocoa">My Sticker Book</h1>
            <p className="text-sm text-cocoa/70">
              {unlockedIds.length} of {ALL_STICKERS.length} Stickers Collected
            </p>
          </div>
        </div>

        {/* Visual Progress Stars */}
        <div className="flex items-center gap-1 bg-cream px-4 py-2 rounded-2xl border border-cocoa/10">
          <Star className="w-6 h-6 text-bubble-yellow fill-bubble-yellow" />
          <span className="text-lg font-black text-cocoa">{unlockedIds.length}</span>
        </div>
      </div>

      {/* Sticker Grid (Oversized touch targets >= 80px) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 w-full">
        {ALL_STICKERS.map((sticker) => {
          const isUnlocked = unlockedIds.includes(sticker.id);

          return (
            <motion.button
              key={sticker.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handleStickerTap(sticker)}
              className={`min-w-touch min-h-touch aspect-square rounded-3xl flex flex-col items-center justify-center p-2 shadow-toddler border-4 transition-all cursor-pointer ${
                isUnlocked
                  ? 'bg-white border-bubble-yellow/50 hover:scale-105'
                  : 'bg-cocoa/5 border-dashed border-cocoa/20 opacity-50'
              }`}
            >
              {isUnlocked ? (
                <span className="text-5xl md:text-6xl drop-shadow-sm">{sticker.emoji}</span>
              ) : (
                <span className="text-4xl text-cocoa/30 filter grayscale">❓</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Inspection Modal for Unlocked Sticker */}
      <AnimatePresence>
        {selectedSticker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa/40 backdrop-blur-xs"
            onClick={() => setSelectedSticker(null)}
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1.1, rotate: 0 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-4xl p-8 border-4 border-bubble-yellow shadow-2xl flex flex-col items-center text-center max-w-sm pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-9xl mb-4 drop-shadow-md animate-bounce">{selectedSticker.emoji}</span>
              <h2 className="text-3xl font-black text-cocoa mb-1">{selectedSticker.name}</h2>
              <p className="text-md text-cocoa/70 mb-6">{selectedSticker.description}</p>

              <button
                onClick={() => {
                  sound.playTap();
                  setSelectedSticker(null);
                }}
                className="min-w-touch min-h-touch px-8 py-3 rounded-3xl bg-bubble-mint font-extrabold text-xl text-cocoa shadow-toddler"
              >
                Yay! ✨
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
