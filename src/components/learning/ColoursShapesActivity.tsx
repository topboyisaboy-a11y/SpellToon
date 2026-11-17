'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { COLOURS_SHAPES_DATA } from '@/lib/playgroundData';
import { sound } from '@/lib/audioEngine';

export const ColoursShapesActivity: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState(COLOURS_SHAPES_DATA[0]);

  const handleSelectItem = (item: typeof COLOURS_SHAPES_DATA[0]) => {
    sound.playTap();
    sound.speak(`${item.soundName}! ${item.detailText || ''}`);
    setSelectedItem(item);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-3 md:p-6 pb-24">
      {/* Active Showcase */}
      <motion.div
        key={selectedItem.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full bg-white rounded-4xl p-6 md:p-8 shadow-md border-4 border-white flex flex-col items-center text-center mb-8"
      >
        <span className="text-8xl md:text-9xl mb-3 drop-shadow">{selectedItem.emoji}</span>
        <h2 className="text-4xl font-black text-cocoa mb-2">{selectedItem.title}</h2>
        <p className="text-2xl font-bold text-cocoa/80">{selectedItem.detailText || selectedItem.soundName}</p>
      </motion.div>

      {/* Shapes & Colors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
        {COLOURS_SHAPES_DATA.map((item) => {
          const isSelected = selectedItem.id === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleSelectItem(item)}
              className={`min-h-[104px] rounded-3xl p-4 flex flex-col items-center justify-center shadow-toddler border-4 transition-all cursor-pointer ${
                item.color
              } ${isSelected ? 'border-cocoa scale-105 ring-4 ring-cocoa/20' : 'border-white hover:scale-102'}`}
            >
              <span className="text-5xl mb-2">{item.emoji}</span>
              <span className="text-xl font-black text-cocoa">{item.title}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
