'use client';

import React, { useState } from 'react';
import { ScreenType, ChildProfile } from '@/types';
import { DEFAULT_CHILD_PROFILE } from '@/lib/playgroundData';
import { NavigationBar } from '@/components/NavigationBar';
import { ParentalGateModal } from '@/components/ParentalGateModal';
import { ParentDashboard } from '@/components/ParentDashboard';
import { PlaygroundHub } from '@/components/PlaygroundHub';
import { VideoPlayerSection } from '@/components/VideoPlayerSection';
import { ColoringCanvas } from '@/components/ColoringCanvas';
import { BubblePopGame } from '@/components/BubblePopGame';
import { StickerAlbum } from '@/components/StickerAlbum';
import { NumbersActivity } from '@/components/learning/NumbersActivity';
import { AbcLettersActivity } from '@/components/learning/AbcLettersActivity';
import { MyBodyActivity } from '@/components/learning/MyBodyActivity';
import { AnimalsActivity } from '@/components/learning/AnimalsActivity';
import { ColoursShapesActivity } from '@/components/learning/ColoursShapesActivity';
import { MusicSoundsActivity } from '@/components/learning/MusicSoundsActivity';
import { BedtimeLockOverlay } from '@/components/BedtimeLockOverlay';
import { sound } from '@/lib/audioEngine';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['home']);
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_CHILD_PROFILE);
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

  // Video episode unlocking logic
  const handleUnlockEpisode = (episodeId: string) => {
    if (!profile.unlockedEpisodeIds.includes(episodeId)) {
      setProfile((prev) => ({
        ...prev,
        unlockedEpisodeIds: [...prev.unlockedEpisodeIds, episodeId],
        wordsLearnedCount: prev.wordsLearnedCount + 3,
      }));
    }
  };

  // Unlock all episodes via parent code
  const handleUnlockAllEpisodes = () => {
    setProfile((prev) => ({
      ...prev,
      unlockedEpisodeIds: ['ep-1', 'ep-2', 'ep-3', 'ep-4'],
    }));
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col font-sans select-none overflow-x-hidden">
      {/* Bedtime / Screen Time Curfew Lockout Overlay */}
      {isLockedByBedtime && (
        <BedtimeLockOverlay
          childName={profile.name}
          reason="bedtime"
          onOpenParentGate={() => setIsParentGateOpen(true)}
        />
      )}

      {/* Navigation Bar (Strictly Home, Back, and Parent Gate icon) */}
      <NavigationBar
        currentScreen={currentScreen}
        onNavigateHome={handleNavigateHome}
        onNavigateBack={handleNavigateBack}
        onOpenParentGate={() => setIsParentGateOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 md:p-6">
        {/* 1. Main Playground Grid (Matches user uploaded image) */}
        {currentScreen === 'home' && (
          <PlaygroundHub
            onNavigate={navigateTo}
            childName={profile.name}
            avatarEmoji={profile.avatarEmoji}
          />
        )}

        {/* 2. YouTube Cartoon Theater & Word Game Unlock Loop */}
        {currentScreen === 'videos' && (
          <VideoPlayerSection
            unlockedEpisodeIds={profile.unlockedEpisodeIds}
            onUnlockEpisode={handleUnlockEpisode}
          />
        )}

        {/* 3. Colouring Book & Drawing Canvas */}
        {currentScreen === 'colouring' && <ColoringCanvas />}

        {/* 4. Animals Sound & Word Explorer */}
        {currentScreen === 'animals' && <AnimalsActivity />}

        {/* 5. Colours & Shapes Activity */}
        {currentScreen === 'colours-shapes' && <ColoursShapesActivity />}

        {/* 6. Numbers & Counting Activity */}
        {currentScreen === 'numbers' && <NumbersActivity />}

        {/* 7. ABC Letters & Phonics Activity */}
        {currentScreen === 'abc-letters' && <AbcLettersActivity />}

        {/* 8. Music & Sounds Lab */}
        {currentScreen === 'music-sounds' && <MusicSoundsActivity />}

        {/* 9. My Body Parts Explorer */}
        {currentScreen === 'my-body' && <MyBodyActivity />}

        {/* 10. Bubble Pop Sensory Game */}
        {currentScreen === 'bubbles' && <BubblePopGame />}

        {/* 11. Sticker Album */}
        {currentScreen === 'stickers' && (
          <StickerAlbum unlockedIds={profile.unlockedStickerIds} />
        )}

        {/* 12. Parent Dashboard & Monetization */}
        {currentScreen === 'parent' && (
          <ParentDashboard
            profile={profile}
            onUpdateProfile={setProfile}
            onClose={() => setCurrentScreen('home')}
            onUnlockAllEpisodes={handleUnlockAllEpisodes}
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
