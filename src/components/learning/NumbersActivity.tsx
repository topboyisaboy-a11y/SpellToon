'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NUMBERS_DATA } from '@/lib/playgroundData';
import { sound } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

export const NumbersActivity: React.FC = () => {
  const [selectedNum, setSelectedNum] = useState(NUMBERS_DATA[0]);

  const handleSelectNumber = (item: typeof NUMBERS_DATA[0]) => {
    sound.playTap();
    sound.speak(`${item.title}! ${item.detailText}`);
    setSelectedNum(item);

    // If they reach 10, trigger high-five confetti
    if (item.count === 10) {
      sound.playChime(1.2);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FEE388', '#FFC4A4', '#BEE3DB', '#B5E2FA'],
        });
      } catch {}
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-3 md:p-6 pb-24">
      {/* Active Number Showcase */}
      <motion.div
        key={selectedNum.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-white rounded-4xl p-6 md:p-8 shadow-md border-4 border-white flex flex-col items-center text-center mb-8"
      >
        <span className="text-8xl md:text-9xl mb-3 drop-shadow">{selectedNum.emoji}</span>
        <h2 className="text-4xl font-black text-cocoa mb-2">{selectedNum.title}</h2>
        <p className="text-2xl font-bold text-cocoa/80">{selectedNum.detailText}</p>
      </motion.div>

      {/* 10 Number Cards Grid (All oversized >= 80px touch targets) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full">
        {NUMBERS_DATA.map((item) => {
          const isSelected = selectedNum.id === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelectNumber(item)}
              className={`min-h-[96px] rounded-3xl p-4 flex flex-col items-center justify-center shadow-toddler border-4 transition-all cursor-pointer ${
                item.color
              } ${isSelected ? 'border-cocoa scale-105 ring-4 ring-cocoa/20' : 'border-white hover:scale-102'}`}
            >
              <span className="text-4xl md:text-5xl mb-1">{item.emoji}</span>
              <span className="text-xl font-black text-cocoa">{item.title}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
