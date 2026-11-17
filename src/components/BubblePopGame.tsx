'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/audioEngine';
import { PICTURE_WORDS } from '@/lib/mockData';
import confetti from 'canvas-confetti';

interface Bubble {
  id: number;
  x: number; // percentage across screen
  size: number;
  color: string;
  surpriseEmoji: string;
  surpriseName: string;
  speed: number;
}

const BUBBLE_COLORS = [
  'bg-bubble-yellow/70',
  'bg-bubble-peach/70',
  'bg-bubble-mint/70',
  'bg-bubble-sky/70',
  'bg-bubble-lavender/70',
  'bg-bubble-pink/70',
];

export const BubblePopGame: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [poppedSurprise, setPoppedSurprise] = useState<{ emoji: string; name: string } | null>(null);

  // Initialize and spawn bubbles
  useEffect(() => {
    sound.speak('Pop the bubbles!');

    const spawnBubble = () => {
      const randomWord = PICTURE_WORDS[Math.floor(Math.random() * PICTURE_WORDS.length)];
      const newBubble: Bubble = {
        id: Date.now() + Math.random(),
        x: Math.floor(Math.random() * 75) + 10, // 10% to 85%
        size: Math.floor(Math.random() * 30) + 95, // 95px to 125px (comfortably above 80px)
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        surpriseEmoji: randomWord.emoji,
        surpriseName: randomWord.name,
        speed: Math.random() * 4 + 7, // 7 to 11s float duration
      };

      setBubbles((prev) => [...prev.slice(-8), newBubble]);
    };

    // Initial batch
    for (let i = 0; i < 5; i++) {
      setTimeout(spawnBubble, i * 400);
    }

    const interval = setInterval(spawnBubble, 1400);
    return () => clearInterval(interval);
  }, []);

  const handlePop = (bubble: Bubble) => {
    sound.playPop();
    sound.speak(bubble.surpriseName);

    // Show surprise center badge briefly
    setPoppedSurprise({ emoji: bubble.surpriseEmoji, name: bubble.surpriseName });
    setTimeout(() => setPoppedSurprise(null), 1200);

    // Tiny star burst
    try {
      confetti({
        particleCount: 15,
        spread: 45,
        origin: { x: bubble.x / 100, y: 0.5 },
        colors: ['#FEE388', '#FFC4A4', '#BEE3DB', '#B5E2FA'],
        disableForReducedMotion: true,
      });
    } catch {}

    // Remove popped bubble
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));
  };

  return (
    <div className="relative w-full h-[78vh] overflow-hidden rounded-4xl bg-gradient-to-b from-bubble-sky/20 to-cream border-4 border-white shadow-inner flex flex-col items-center justify-center select-none">
      {/* Background clouds */}
      <div className="absolute top-8 left-10 text-6xl opacity-30 pointer-events-none">☁️</div>
      <div className="absolute top-20 right-14 text-7xl opacity-30 pointer-events-none">☁️</div>

      {/* Center Surprise Toast */}
      <AnimatePresence>
        {poppedSurprise && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1.1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute z-20 flex flex-col items-center justify-center p-6 rounded-4xl bg-white shadow-2xl border-4 border-bubble-yellow pointer-events-none"
          >
            <span className="text-8xl">{poppedSurprise.emoji}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bubbles */}
      {bubbles.map((b) => (
        <motion.button
          key={b.id}
          type="button"
          onClick={() => handlePop(b)}
          initial={{ y: 650, opacity: 0.9 }}
          animate={{ y: -150, opacity: 1 }}
          transition={{ duration: b.speed, ease: 'linear' }}
          onAnimationComplete={() => {
            // Remove bubble when it floats off top
            setBubbles((prev) => prev.filter((item) => item.id !== b.id));
          }}
          style={{
            left: `${b.x}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
          }}
          className={`absolute rounded-full border-4 border-white/80 shadow-lg backdrop-blur-xs flex items-center justify-center cursor-pointer transition-transform active:scale-90 ${b.color}`}
        >
          {/* Bubble reflection highlight */}
          <div className="w-4 h-4 rounded-full bg-white/70 absolute top-3 left-4" />
          <span className="text-5xl opacity-80 filter drop-shadow">🫧</span>
        </motion.button>
      ))}

      <div className="absolute bottom-6 bg-white/80 backdrop-blur-xs px-6 py-3 rounded-full shadow-sm text-cocoa font-bold text-lg pointer-events-none">
        Tap the floating bubbles! 🫧
      </div>
    </div>
  );
};
