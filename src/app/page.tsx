'use client';

import React, { useState } from 'react';
import { ScreenType, ChildProfile } from '@/types';
import { INITIAL_CHILD_PROFILE } from '@/lib/mockData';
import { NavigationBar } from '@/components/NavigationBar';
import { ParentalGateModal } from '@/components/ParentalGateModal';
import { ParentDashboard } from '@/components/ParentDashboard';
import { PictureQuizGame } from '@/components/PictureQuizGame';
import { BubblePopGame } from '@/components/BubblePopGame';
import { ColoringCanvas } from '@/components/ColoringCanvas';
import { StickerAlbum } from '@/components/StickerAlbum';
import { BedtimeLockOverlay } from '@/components/BedtimeLockOverlay';
import { AudioButton } from '@/components/AudioButton';
import { sound } from '@/lib/audioEngine';
import { motion } from 'framer-motion';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);
  const [profile, setProfile] = useState<ChildProfile>(INITIAL_CHILD_PROFILE);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isLockedByBedtime, setIsLockedByBedtime] = useState(false);

  const navigateTo = (screen: ScreenType) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
  };

  const handleNavigateHome = () => {
    sound.speak('Home');
    setScreenHistory(['home']);
    setCurrentScreen('home');
  };

  const handleNavigateBack = () => {
    sound.speak('Back');
    if (screenHistory.length > 1) {
      const nextHistory = screenHistory.slice(0, -1);
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('home');
    }
  };

  const handleRewardSticker = (stickerId: string) => {
    if (!profile.unlockedStickerIds.includes(stickerId)) {
      setProfile((prev) => ({
        ...prev,
        unlockedStickerIds: [...prev.unlockedStickerIds, stickerId],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans select-none overflow-x-hidden">
      {/* Bedtime / Time Limit Curfew Lockout Overlay */}
      {isLockedByBedtime && (
        <BedtimeLockOverlay
          childName={profile.name}
          reason="bedtime"
          onOpenParentGate={() => setIsParentGateOpen(true)}
        />
      )}

      {/* Navigation Bar (Home, Back, Parents Gate icon) */}
      <NavigationBar
        currentScreen={currentScreen}
        onNavigateHome={handleNavigateHome}
        onNavigateBack={handleNavigateBack}
        onOpenParentGate={() => setIsParentGateOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {currentScreen === 'home' && (
          <div className="w-full max-w-2xl flex flex-col items-center">
            {/* Child Greeting Badge (Speaks aloud on tap) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                sound.playChime(1.1);
                sound.speak(`Hello ${profile.name}! Let's play and learn!`);
              }}
              className="flex items-center gap-4 bg-white/90 px-8 py-4 rounded-4xl shadow-sm border border-cocoa/10 mb-8 cursor-pointer"
            >
              <span className="text-5xl">{profile.avatarEmoji}</span>
              <span className="text-3xl font-black text-cocoa">Hi, {profile.name}!</span>
            </motion.button>

            {/* 4 Large Hub Activities (Oversized touch targets, speech on tap, warm colors) */}
            <div className="grid grid-cols-2 gap-5 md:gap-8 w-full">
              {/* 1. Picture Quiz */}
              <AudioButton
                spokenLabel="Picture Quiz"
                onClick={() => navigateTo('quiz')}
                variant="yellow"
                className="h-44 md:h-52"
              >
                <span className="text-6xl md:text-7xl mb-2 drop-shadow">🧩</span>
                <span className="text-xl md:text-2xl font-black">Pictures</span>
              </AudioButton>

              {/* 2. Coloring Book */}
              <AudioButton
                spokenLabel="Coloring Book"
                onClick={() => navigateTo('coloring')}
                variant="peach"
                className="h-44 md:h-52"
              >
                <span className="text-6xl md:text-7xl mb-2 drop-shadow">🎨</span>
                <span className="text-xl md:text-2xl font-black">Coloring</span>
              </AudioButton>

              {/* 3. Bubble Pop */}
              <AudioButton
                spokenLabel="Pop the Bubbles"
                onClick={() => navigateTo('bubbles')}
                variant="sky"
                className="h-44 md:h-52"
              >
                <span className="text-6xl md:text-7xl mb-2 drop-shadow">🫧</span>
                <span className="text-xl md:text-2xl font-black">Bubbles</span>
              </AudioButton>

              {/* 4. Sticker Book */}
              <AudioButton
                spokenLabel="My Stickers"
                onClick={() => navigateTo('stickers')}
                variant="mint"
                className="h-44 md:h-52"
              >
                <span className="text-6xl md:text-7xl mb-2 drop-shadow">🌟</span>
                <span className="text-xl md:text-2xl font-black">Stickers</span>
              </AudioButton>
            </div>
          </div>
        )}

        {/* Feature 1: Picture Quiz & Matching */}
        {currentScreen === 'quiz' && (
          <PictureQuizGame onRewardSticker={handleRewardSticker} />
        )}

        {/* Feature 1B: Bubble Pop Reflex Game */}
        {currentScreen === 'bubbles' && <BubblePopGame />}

        {/* Feature 2: Drawing & Colouring Canvas */}
        {currentScreen === 'coloring' && <ColoringCanvas />}

        {/* Feature 4: Sticker Album & Rewards */}
        {currentScreen === 'stickers' && (
          <StickerAlbum unlockedIds={profile.unlockedStickerIds} />
        )}

        {/* Feature 3: Parent Dashboard */}
        {currentScreen === 'parent' && (
          <ParentDashboard
            profile={profile}
            onUpdateProfile={setProfile}
            onClose={() => setCurrentScreen('home')}
          />
        )}
      </main>

      {/* Parental Gate Modal (3-Second Two-Button Hold) */}
      <ParentalGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSuccess={() => {
          setIsLockedByBedtime(false);
          setCurrentScreen('parent');
        }}
      />
    </div>
  );
}
