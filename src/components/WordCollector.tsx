'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { COLLECTOR_WORDS_DATA } from '@/lib/playgroundData';
import { CollectorWord } from '@/types';
import { sound } from '@/lib/audioEngine';
import { Volume2, Sparkles, BookOpen } from 'lucide-react';

export const WordCollector: React.FC = () => {
  const words = COLLECTOR_WORDS_DATA;
  const collectedCount = words.filter((w) => w.isCollected).length;

  const handleWordTap = (item: CollectorWord) => {
    sound.playTap();
    sound.speak(`${item.word}. ${item.sentence}`);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Top Stats Banner (Stitch layout) */}
      <section className="bg-white rounded-[28px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <span className="font-headline text-sm font-bold text-tertiary">
            Word Collector & Phonics Chest
          </span>
          <h1 className="font-headline text-[32px] md:text-[38px] font-bold text-on-surface leading-tight">
            Tap Any Word to Hear It Aloud
          </h1>
          <p className="text-[17px] font-semibold text-on-surface-variant font-body leading-relaxed">
            Every Golden Key unlocks new storybook vocabulary. Break tricky words into cozy syllables!
          </p>
        </div>

        {/* 3 Stats Counters */}
        <div className="grid grid-cols-3 gap-4 shrink-0">
          <div className="bg-[#FDF8EE] border-2 border-[#F4EBD9] rounded-2xl px-5 py-3 text-center">
            <div className="font-headline text-2xl font-bold text-primary">{collectedCount}</div>
            <div className="text-xs font-bold text-on-surface-variant font-body">Collected</div>
          </div>

          <div className="bg-[#FDF8EE] border-2 border-[#F4EBD9] rounded-2xl px-5 py-3 text-center">
            <div className="font-headline text-2xl font-bold text-tertiary">{words.length}</div>
            <div className="text-xs font-bold text-on-surface-variant font-body">Total Words</div>
          </div>

          <div className="bg-[#FDF8EE] border-2 border-[#F4EBD9] rounded-2xl px-5 py-3 text-center">
            <div className="font-headline text-2xl font-bold text-secondary">3</div>
            <div className="text-xs font-bold text-on-surface-variant font-body">Themes</div>
          </div>
        </div>
      </section>

      {/* Word Cards Grid (Stitch 3-Column Card Layout) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {words.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => handleWordTap(item)}
            className={`text-left bg-white rounded-[24px] border-2 p-5 flex flex-col justify-between gap-4 cursor-pointer transition-all ${
              item.isCollected
                ? 'border-[#2EC4B6] shadow-[0_8px_0_#2EC4B6]'
                : 'border-[#F4EBD9] shadow-[0_6px_0_rgba(30,32,34,0.06)] opacity-70'
            }`}
          >
            <div className="space-y-2 w-full">
              {/* Category & Speaker icon */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant font-body">
                  {item.theme}
                </span>
                <span className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-fixed-variant flex items-center justify-center shadow-[0_3px_0_#006961]">
                  <Volume2 className="w-5 h-5" />
                </span>
              </div>

              {/* Word & Syllables */}
              <h2 className="font-headline text-[26px] font-bold text-on-surface">
                {item.word}
              </h2>

              <div className="text-sm font-bold text-tertiary font-body">
                {item.syllables} ·{' '}
                <span className="text-on-surface-variant font-semibold">{item.phonics}</span>
              </div>

              {/* Context Sentence */}
              <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                “{item.sentence}”
              </p>
            </div>

            {/* Bottom Card Footer */}
            <div className="text-xs font-headline font-bold text-primary pt-2 border-t border-[#F4EBD9] w-full flex justify-between items-center">
              <span>{item.storyTitle}</span>
              <span className="text-tertiary">Tap to hear 🔊</span>
            </div>
          </motion.button>
        ))}
      </section>
    </div>
  );
};
