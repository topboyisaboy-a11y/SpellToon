'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MUSIC_INSTRUMENTS_DATA } from '@/lib/playgroundData';
import { sound } from '@/lib/audioEngine';

export const MusicSoundsActivity: React.FC = () => {
  const [selectedInst, setSelectedInst] = useState(MUSIC_INSTRUMENTS_DATA[0]);

  const handlePlayInstrument = (item: typeof MUSIC_INSTRUMENTS_DATA[0], index: number) => {
    // Play harmonic chime
    sound.playChime(1 + index * 0.15);
    sound.speak(item.soundName || item.title);
    setSelectedInst(item);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-3 md:p-6 pb-24">
      {/* Active Instrument Showcase */}
      <motion.div
        key={selectedInst.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-white rounded-4xl p-6 md:p-8 shadow-md border-4 border-white flex flex-col items-center text-center mb-8"
      >
        <span className="text-8xl md:text-9xl mb-3 drop-shadow animate-bounce">{selectedInst.emoji}</span>
        <h2 className="text-4xl font-black text-cocoa mb-2">{selectedInst.title}</h2>
        <p className="text-2xl font-bold text-cocoa/80">{selectedInst.soundName}</p>
      </motion.div>

      {/* Instruments Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 w-full">
        {MUSIC_INSTRUMENTS_DATA.map((item, index) => {
          const isSelected = selectedInst.id === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => handlePlayInstrument(item, index)}
              className={`min-h-[112px] rounded-3xl p-4 flex flex-col items-center justify-center shadow-toddler border-4 transition-all cursor-pointer ${
                item.color
              } ${isSelected ? 'border-cocoa scale-105 ring-4 ring-cocoa/20' : 'border-white hover:scale-102'}`}
            >
              <span className="text-5xl mb-2">{item.emoji}</span>
              <span className="text-lg font-black text-cocoa">{item.title}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
