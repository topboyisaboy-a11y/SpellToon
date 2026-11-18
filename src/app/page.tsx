'use client';

import React, { useState } from 'react';
import { ScreenType, ChildProfile, StoryBook } from '@/types';
import { DEFAULT_CHILD_PROFILE, STITCH_STORIES } from '@/lib/playgroundData';
import { NavigationBar } from '@/components/NavigationBar';
import { StoryLibrary } from '@/components/StoryLibrary';
import { ReadingTheater } from '@/components/ReadingTheater';
import { WordCollector } from '@/components/WordCollector';
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
import { ParentalGateModal } from '@/components/ParentalGateModal';
import { ParentDashboard } from '@/components/ParentDashboard';
import { BedtimeLockOverlay } from '@/components/BedtimeLockOverlay';
import { sound } from '@/lib/audioEngine';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('library');
  const [profile, setProfile] = useState<ChildProfile>(DEFAULT_CHILD_PROFILE);
  const [activeStory, setActiveStory] = useState<StoryBook>(STITCH_STORIES[0]);
  const [isParentGateOpen, setIsParentGateOpen] = useState(false);
  const [isLockedByBedtime, setIsLockedByBedtime] = useState(false);

  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  // Open a specific storybook inside the Reading Theater
  const handleSelectStory = (story: StoryBook) => {
    setActiveStory(story);
    setCurrentScreen('theater');
  };

  // When Golden Key challenge is completed in the theater
  const handleEarnGoldenKey = () => {
    setProfile((prev) => ({
      ...prev,
      earnedKeysCount: Math.min(prev.earnedKeysCount + 1, 3),
      wordsLearnedCount: prev.wordsLearnedCount + 1,
    }));
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
    <div className="min-h-screen bg-[#FDF8EE] font-body flex flex-col text-on-surface select-none overflow-x-hidden">
      {/* Bedtime / Screen Time Curfew Lockout Overlay */}
      {isLockedByBedtime && (
        <BedtimeLockOverlay
          childName={profile.name}
          reason="bedtime"
          onOpenParentGate={() => setIsParentGateOpen(true)}
        />
      )}

      {/* Stitch Top Header Navigation Bar */}
      <NavigationBar
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        onOpenParentGate={() => setIsParentGateOpen(true)}
        childName={profile.name}
        avatarEmoji={profile.avatarEmoji}
      />

      {/* Main Content Areas (padded below fixed header) */}
      <main className="w-full pt-20 min-h-[calc(100vh-80px)] flex-1 flex flex-col items-center">
        {/* 1. Stitch Story Library */}
        {currentScreen === 'library' && (
          <StoryLibrary
            onSelectStory={handleSelectStory}
            earnedKeysCount={profile.earnedKeysCount}
          />
        )}

        {/* 2. Stitch Reading Theater & Golden Key Challenge */}
        {currentScreen === 'theater' && (
          <ReadingTheater
            story={activeStory}
            onClose={() => setCurrentScreen('library')}
            onEarnKey={handleEarnGoldenKey}
          />
        )}

        {/* 3. Stitch Word Collector & Phonics Chest */}
        {currentScreen === 'words' && <WordCollector />}

        {/* 4. 2-Column Playground Activity Grid */}
        {currentScreen === 'playground' && (
          <div className="w-full max-w-[1200px] px-4 md:px-8 py-6">
            <PlaygroundHub
              onNavigate={navigateTo}
              childName={profile.name}
              avatarEmoji={profile.avatarEmoji}
            />
          </div>
        )}

        {/* 5. YouTube Cartoon Theater & Word Game Unlock Loop */}
        {currentScreen === 'videos' && (
          <VideoPlayerSection
            unlockedEpisodeIds={profile.unlockedEpisodeIds}
            onUnlockEpisode={handleUnlockEpisode}
          />
        )}

        {/* 6. Colouring Book & Drawing Canvas */}
        {currentScreen === 'colouring' && <ColoringCanvas />}

        {/* 7. Animals Sound & Word Explorer */}
        {currentScreen === 'animals' && <AnimalsActivity />}

        {/* 8. Colours & Shapes Activity */}
        {currentScreen === 'colours-shapes' && <ColoursShapesActivity />}

        {/* 9. Numbers & Counting Activity */}
        {currentScreen === 'numbers' && <NumbersActivity />}

        {/* 10. ABC Letters & Phonics Activity */}
        {currentScreen === 'abc-letters' && <AbcLettersActivity />}

        {/* 11. Music & Sounds Lab */}
        {currentScreen === 'music-sounds' && <MusicSoundsActivity />}

        {/* 12. My Body Parts Explorer */}
        {currentScreen === 'my-body' && <MyBodyActivity />}

        {/* 13. Bubble Pop Sensory Game */}
        {currentScreen === 'bubbles' && <BubblePopGame />}

        {/* 14. Sticker Album */}
        {currentScreen === 'stickers' && (
          <StickerAlbum unlockedIds={profile.unlockedStickerIds} />
        )}

        {/* 15. Parent Dashboard & Safe Monetization */}
        {currentScreen === 'parent' && (
          <ParentDashboard
            profile={profile}
            onUpdateProfile={setProfile}
            onClose={() => setCurrentScreen('library')}
            onUnlockAllEpisodes={handleUnlockAllEpisodes}
          />
        )}
      </main>

      {/* Stitch Footer */}
      <footer className="w-full bg-surface-container-low py-8 border-t border-[#EFE7D6] mt-auto">
        <div className="max-w-[1200px] mx-auto px-5 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="font-headline text-[22px] font-bold text-primary">Encanta</span>
            <span className="font-body text-[15px] text-on-surface-variant font-semibold">
              • Tactile Reading Adventure & Playground
            </span>
          </div>
          <div className="font-headline text-[13px] text-on-surface-variant font-bold">
            © 2026 Encanta SpellToon. Designed for curious minds.
          </div>
        </div>
      </footer>

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
