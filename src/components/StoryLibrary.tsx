'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { STITCH_STORIES } from '@/lib/playgroundData';
import { StoryBook } from '@/types';
import { sound } from '@/lib/audioEngine';
import { PlayCircle, Key, Sparkles } from 'lucide-react';

interface StoryLibraryProps {
  onSelectStory: (story: StoryBook) => void;
  earnedKeysCount: number;
}

export const StoryLibrary: React.FC<StoryLibraryProps> = ({
  onSelectStory,
  earnedKeysCount,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const featuredStory = STITCH_STORIES[0];

  const filteredStories = STITCH_STORIES.filter(
    (story) => selectedGenre === 'all' || story.genre === selectedGenre
  );

  const handlePlayStory = (story: StoryBook) => {
    sound.playTap();
    sound.speak(`Opening ${story.title}`);
    onSelectStory(story);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-10">
      {/* Featured Story Hero Card (Stitch design) */}
      <section className="bg-white rounded-[28px] border-2 border-[#F4EBD9] p-6 md:p-8 shadow-[0_8px_0_rgba(30,32,34,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center">
          {/* Hero Visual Banner */}
          <div className="lg:col-span-5 h-64 rounded-[22px] bg-gradient-to-br from-[#121c36] via-[#1e315c] to-[#264b75] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden shadow-inner">
            <span className="material-symbols-outlined text-[72px] text-primary-container mb-2 drop-shadow">
              flight
            </span>
            <span className="font-headline text-2xl font-bold">{featuredStory.title}</span>
            <span className="text-sm text-white/80 font-body">{featuredStory.subtitle}</span>
          </div>

          {/* Hero Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-on-surface-variant font-body">
              <span className="text-primary font-headline font-bold">Featured Adventure</span>
              <span>·</span>
              <span>{featuredStory.genre}</span>
              <span>·</span>
              <span>{featuredStory.level}</span>
              <span>·</span>
              <span>{featuredStory.readTime}</span>
            </div>

            <h1 className="font-headline text-[32px] md:text-[40px] font-bold text-on-surface leading-tight">
              {featuredStory.title}
            </h1>

            <p className="text-[17px] font-semibold text-on-surface-variant leading-relaxed font-body">
              {featuredStory.description}
            </p>

            {/* Reading Progress Meter */}
            <div className="bg-[#FDF8EE] p-4 rounded-2xl border-2 border-[#F4EBD9] space-y-2">
              <div className="flex items-center justify-between text-sm font-headline font-bold">
                <span className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Airship Golden Keys
                </span>
                <span className="text-tertiary">{earnedKeysCount} of 3 keys earned</span>
              </div>
              <div className="h-4 rounded-full bg-[#EFE7D6] p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#38B6FF] to-[#2EC4B6] transition-all"
                  style={{ width: `${Math.min((earnedKeysCount / 3) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => handlePlayStory(featuredStory)}
                className="h-14 px-8 rounded-full bg-primary-container text-on-primary-fixed font-headline text-[17px] font-bold shadow-[0_4px_0_#edc22e] active:translate-y-1 active:shadow-none flex items-center gap-2 transition-all cursor-pointer"
              >
                <PlayCircle className="w-6 h-6" />
                <span>Continue Story</span>
              </button>

              <button
                type="button"
                onClick={() => handlePlayStory(featuredStory)}
                className="h-14 px-6 rounded-full bg-white border-2 border-[#EFE7D6] text-on-surface font-headline text-[15px] font-bold shadow-[0_4px_0_#d9dadc] active:translate-y-1 active:shadow-none flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Start from Gate 1</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Storybook Shelf Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-[28px] font-bold text-on-surface">Storybook Shelf</h2>
            <p className="text-on-surface-variant font-medium font-body">
              Pick a picture book and unlock all 3 Golden Keys
            </p>
          </div>

          {/* Genre Filters */}
          <div className="flex flex-wrap gap-2 bg-[#F4EBD9] p-1.5 rounded-full self-start md:self-auto">
            {['all', 'Adventure', 'Fantasy', 'Science'].map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => {
                  sound.playTap();
                  setSelectedGenre(genre);
                }}
                className={`px-4 py-2 rounded-full font-headline text-sm font-bold transition-all cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-white text-on-surface shadow-[0_3px_0_#d9dadc]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {genre === 'all' ? 'All Stories' : genre}
              </button>
            ))}
          </div>
        </div>

        {/* Story Grid (Stitch Card Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStories.map((story) => (
            <motion.article
              key={story.id}
              whileHover={{ y: -2 }}
              className="bg-white rounded-[24px] border-2 border-[#F4EBD9] p-5 shadow-[0_8px_0_rgba(30,32,34,0.06)] flex flex-col justify-between gap-4 transition-all"
            >
              <div className="space-y-3">
                <div
                  className={`h-44 rounded-[18px] bg-gradient-to-br ${story.gradient} flex items-center justify-center text-primary-container shadow-inner`}
                >
                  <span className="material-symbols-outlined text-6xl drop-shadow">
                    {story.icon}
                  </span>
                </div>
                <div className="text-xs font-semibold text-on-surface-variant font-body">
                  {story.genre} · {story.level} · {story.readTime}
                </div>
                <h3 className="font-headline text-[22px] font-bold text-on-surface">
                  {story.title}
                </h3>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">
                  {story.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F4EBD9] flex items-center justify-between">
                <span className="text-sm font-headline font-bold text-tertiary flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-primary" />
                  {story.keysEarned}/{story.totalKeys} Keys
                </span>
                <button
                  type="button"
                  onClick={() => handlePlayStory(story)}
                  className="h-11 px-6 rounded-full bg-primary-container text-on-primary-fixed font-headline text-sm font-bold shadow-[0_4px_0_#edc22e] active:translate-y-1 active:shadow-none flex items-center gap-1.5 cursor-pointer"
                >
                  Play Story
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};
