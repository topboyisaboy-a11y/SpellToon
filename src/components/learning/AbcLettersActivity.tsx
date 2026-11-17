'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ABC_LETTERS_DATA } from '@/lib/playgroundData';
import { sound } from '@/lib/audioEngine';

export const AbcLettersActivity: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState(ABC_LETTERS_DATA[0]);

  const handleSelectLetter = (item: typeof ABC_LETTERS_DATA[0]) => {
    sound.playTap();
    sound.speak(`${item.title}! ${item.soundName || ''}`);
    setSelectedLetter(item);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-3 md:p-6 pb-24">
      {/* Active Letter Showcase */}
      <motion.div
        key={selectedLetter.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-white rounded-4xl p-6 md:p-8 shadow-md border-4 border-white flex flex-col items-center text-center mb-8"
      >
        <span className="text-8xl md:text-9xl mb-3 drop-shadow">{selectedLetter.emoji}</span>
        <h2 className="text-4xl font-black text-cocoa mb-1">{selectedLetter.title}</h2>
        <p className="text-xl font-bold text-cocoa/70">{selectedLetter.soundName}</p>
      </motion.div>

      {/* ABC Letter Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
        {ABC_LETTERS_DATA.map((item) => {
          const isSelected = selectedLetter.id === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelectLetter(item)}
              className={`min-h-[96px] rounded-3xl p-4 flex flex-col items-center justify-center shadow-toddler border-4 transition-all cursor-pointer ${
                item.color
              } ${isSelected ? 'border-cocoa scale-105 ring-4 ring-cocoa/20' : 'border-white hover:scale-102'}`}
            >
              <span className="text-4xl md:text-5xl mb-1">{item.emoji}</span>
              <span className="text-lg font-black text-cocoa">{item.title.split(' ')[0]}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
