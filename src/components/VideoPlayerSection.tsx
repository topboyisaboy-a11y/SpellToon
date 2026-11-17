'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARTOON_EPISODES } from '@/lib/playgroundData';
import { VideoEpisode } from '@/types';
import { sound } from '@/lib/audioEngine';
import { Play, Lock, CheckCircle2, Sparkles, Volume2, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoPlayerSectionProps {
  unlockedEpisodeIds: string[];
  onUnlockEpisode: (episodeId: string) => void;
}

export const VideoPlayerSection: React.FC<VideoPlayerSectionProps> = ({
  unlockedEpisodeIds,
  onUnlockEpisode,
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<VideoEpisode>(CARTOON_EPISODES[0]);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState(false);
  const [quizWordIndex, setQuizWordIndex] = useState(0);
  const [wigglingWord, setWigglingWord] = useState<string | null>(null);

  const isCurrentUnlocked = unlockedEpisodeIds.includes(selectedEpisode.id);

  // Find next episode on shelf
  const currentEpIndex = CARTOON_EPISODES.findIndex((ep) => ep.id === selectedEpisode.id);
  const nextEpisode = CARTOON_EPISODES[currentEpIndex + 1];
  const isNextUnlocked = nextEpisode ? unlockedEpisodeIds.includes(nextEpisode.id) : true;

  const handleSelectEpisode = (ep: VideoEpisode) => {
    sound.playTap();
    sound.speak(ep.title);
    setSelectedEpisode(ep);
    setIsPlayingQuiz(false);
    setQuizWordIndex(0);
  };

  const handleStartUnlockGame = () => {
    sound.playChime(1.1);
    sound.speak(`Word Game to unlock the next cartoon! Find the ${selectedEpisode.requiredWords[0].word}`);
    setIsPlayingQuiz(true);
    setQuizWordIndex(0);
  };

  const handleWordTap = (tappedWord: string) => {
    const currentTarget = selectedEpisode.requiredWords[quizWordIndex];

    if (tappedWord === currentTarget.word) {
      sound.playChime(1.15);
      sound.speak(`Yes! That is the ${currentTarget.word}!`);

      if (quizWordIndex + 1 < selectedEpisode.requiredWords.length) {
        // Move to next word in episode quiz
        setTimeout(() => {
          setQuizWordIndex((prev) => prev + 1);
          sound.speak(`Next! ${selectedEpisode.requiredWords[quizWordIndex + 1].prompt}`);
        }, 1200);
      } else {
        // All words matched! UNLOCK NEXT EPISODE!
        setTimeout(() => {
          sound.playChime(1.25);
          sound.speak('Hurray! You unlocked the next cartoon!');
          try {
            confetti({
              particleCount: 50,
              spread: 75,
              origin: { y: 0.6 },
              colors: ['#FEE388', '#FFC4A4', '#BEE3DB', '#B5E2FA', '#DEC0F1'],
              disableForReducedMotion: true,
            });
          } catch {}

          if (nextEpisode) {
            onUnlockEpisode(nextEpisode.id);
          }
          setIsPlayingQuiz(false);
        }, 1200);
      }
    } else {
      // Gentle mismatch: wiggle card and speak name
      setWigglingWord(tappedWord);
      sound.playSoftWiggle();
      sound.speak(`That is ${tappedWord}. Where is the ${currentTarget.word}?`);
      setTimeout(() => setWigglingWord(null), 500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center p-3 md:p-6 pb-24">
      {/* Title Shelf Banner */}
      <div className="w-full flex items-center justify-between bg-white rounded-3xl p-5 mb-6 shadow-sm border border-cocoa/10">
        <div className="flex items-center gap-3">
          <span className="text-4xl">📺</span>
          <div>
            <h1 className="text-2xl font-black text-cocoa">Kids Cartoon Theater</h1>
            <p className="text-sm text-cocoa/70">
              Watch cartoons, learn words, and unlock the next episode!
            </p>
          </div>
        </div>

        {/* Unlocked Counter */}
        <div className="flex items-center gap-2 bg-[#FAF5FF] border border-[#A855F7]/30 px-4 py-2 rounded-2xl text-[#581C87] font-bold text-sm">
          <KeyRound className="w-5 h-5 text-[#9333EA]" />
          <span>{unlockedEpisodeIds.length} of {CARTOON_EPISODES.length} Unlocked</span>
        </div>
      </div>

      {/* Main Video Screen */}
      <div className="w-full bg-white rounded-4xl p-4 md:p-6 shadow-md border-4 border-white mb-6">
        {isCurrentUnlocked ? (
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-inner">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedEpisode.youtubeId}?rel=0&modestbranding=1&autoplay=0`}
              title={selectedEpisode.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="w-full aspect-video rounded-3xl bg-[#FEFCE8] border-4 border-dashed border-[#F59E0B]/40 flex flex-col items-center justify-center p-6 text-center">
            <Lock className="w-16 h-16 text-[#F59E0B] mb-3 animate-bounce" />
            <h3 className="text-2xl font-black text-[#78350F] mb-1">Episode Locked</h3>
            <p className="text-md text-[#78350F]/70 max-w-sm mb-4">
              Play the word game in the previous episode or ask parents for an unlock code!
            </p>
          </div>
        )}

        {/* Subtitles & Spoken Words Bar */}
        <div className="mt-4 p-4 rounded-3xl bg-cream border border-cocoa/10">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-5 h-5 text-cocoa/60" />
            <span className="text-xs font-bold text-cocoa/60 uppercase tracking-wider">
              Episode Subtitles (Tap words to hear!)
            </span>
          </div>
          <p className="text-lg font-semibold text-cocoa leading-relaxed">
            {selectedEpisode.subtitleSnippet}
          </p>
        </div>

        {/* Word Game Unlock Key Action */}
        {nextEpisode && !isNextUnlocked && !isPlayingQuiz && (
          <div className="mt-6 p-5 rounded-3xl bg-gradient-to-r from-bubble-yellow/40 to-bubble-peach/40 border-2 border-bubble-yellow flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-pulse">🔑</span>
              <div>
                <h4 className="text-lg font-black text-cocoa">Unlock Next Episode: {nextEpisode.title}</h4>
                <p className="text-xs text-cocoa/70">Find 3 words from this cartoon to unlock the next show!</p>
              </div>
            </div>

            <button
              onClick={handleStartUnlockGame}
              className="min-w-touch min-h-touch px-6 py-3 rounded-2xl bg-bubble-yellow font-black text-lg text-cocoa shadow-toddler active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-6 h-6" />
              Play Word Game
            </button>
          </div>
        )}

        {/* Interactive Episode Unlock Word Quiz */}
        <AnimatePresence>
          {isPlayingQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6 p-6 rounded-4xl bg-white border-4 border-bubble-mint shadow-lg text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl">🧩</span>
                <h3 className="text-2xl font-black text-cocoa">
                  {selectedEpisode.requiredWords[quizWordIndex].prompt}
                </h3>
              </div>
              <p className="text-sm text-cocoa/60 mb-6">
                Word {quizWordIndex + 1} of {selectedEpisode.requiredWords.length}
              </p>

              {/* 3 Choice Cards */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                {selectedEpisode.requiredWords.map((item) => {
                  const isWiggling = wigglingWord === item.word;
                  return (
                    <motion.button
                      key={item.word}
                      type="button"
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleWordTap(item.word)}
                      className={`min-w-touch min-h-touch aspect-square rounded-3xl bg-cream border-4 flex flex-col items-center justify-center p-3 shadow-toddler cursor-pointer ${
                        isWiggling ? 'animate-wiggle border-bubble-peach bg-bubble-peach/20' : 'border-white'
                      }`}
                    >
                      <span className="text-5xl md:text-6xl mb-1">{item.emoji}</span>
                      <span className="text-md font-bold text-cocoa">{item.word}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cartoons on the Shelf (2-Column Grid) */}
      <h2 className="text-xl font-black text-cocoa w-full mb-4 pl-2">More Cartoons on the Shelf</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        {CARTOON_EPISODES.map((ep) => {
          const isUnlocked = unlockedEpisodeIds.includes(ep.id);
          const isSelected = selectedEpisode.id === ep.id;

          return (
            <motion.button
              key={ep.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelectEpisode(ep)}
              className={`p-4 rounded-3xl border-3 flex items-center justify-between text-left transition-all shadow-toddler cursor-pointer ${
                isSelected
                  ? 'bg-bubble-lavender/30 border-[#A855F7] ring-4 ring-[#A855F7]/20'
                  : 'bg-white border-cocoa/10 hover:border-bubble-lavender'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-5xl p-3 rounded-2xl bg-cream border border-cocoa/10">
                  {ep.thumbnailEmoji}
                </span>
                <div>
                  <h4 className="text-lg font-bold text-cocoa">{ep.title}</h4>
                  <p className="text-xs text-cocoa/60">{ep.channelName} • {ep.duration}</p>
                </div>
              </div>

              {isUnlocked ? (
                <CheckCircle2 className="w-8 h-8 text-[#4ADE80] flex-shrink-0" />
              ) : (
                <Lock className="w-8 h-8 text-cocoa/40 flex-shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
