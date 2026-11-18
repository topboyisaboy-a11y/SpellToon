'use client';

import React, { useRef, useState, useEffect } from 'react';
import { sound } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

interface WordezyGameViewProps {
  onBack: () => void;
  onEarnKey?: () => void;
}

export const WordezyGameView: React.FC<WordezyGameViewProps> = ({
  onBack,
  onEarnKey,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasClaimedKey, setHasClaimedKey] = useState(false);

  useEffect(() => {
    sound.speak('Word Search Puzzle! Drag or tap letters to find hidden words!');
  }, []);

  const handleClaimKey = () => {
    if (hasClaimedKey) return;
    setHasClaimedKey(true);
    sound.playChime(1.25);
    sound.speak('Brilliant word finder! You unlocked a Golden Key!');
    if (onEarnKey) onEarnKey();

    try {
      confetti({
        particleCount: 55,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#2f9e6e', '#c9922f', '#ffd23f', '#ffffff'],
      });
    } catch {}
  };

  const handleReload = () => {
    sound.playTap();
    if (iframeRef.current) {
      iframeRef.current.src = '/games/wordezy/index.html';
    }
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 py-4 flex flex-col items-center">
      {/* Top Controls Bar */}
      <div className="w-full bg-white rounded-[24px] border-2 border-[#F4EBD9] p-4 mb-4 shadow-[0_6px_0_rgba(30,32,34,0.05)] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            sound.playTap();
            onBack();
          }}
          className="h-12 px-6 rounded-full bg-primary-container text-on-primary-container shadow-[0_4px_0_#edc22e] font-headline text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-primary-fixed active:translate-y-0.5 transition-all"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          <span>Back to Playground</span>
        </button>

        <div className="flex items-center gap-2 text-center">
          <span className="text-3xl">🔍</span>
          <div>
            <h1 className="font-headline text-lg md:text-xl font-bold text-on-surface leading-tight">
              Word Search Puzzle
            </h1>
            <p className="text-xs text-on-surface-variant font-medium hidden sm:block">
              Swipe across letters to find hidden words
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasClaimedKey && (
            <button
              type="button"
              onClick={handleClaimKey}
              className="h-12 px-4 rounded-full bg-secondary-container text-white shadow-[0_4px_0_#b52234] font-headline text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#ff4250] active:translate-y-0.5 transition-all animate-bounce"
            >
              <span className="material-symbols-outlined text-base">vpn_key</span>
              <span className="hidden sm:inline">Claim Golden Key</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReload}
            aria-label="Restart Word Search"
            className="w-12 h-12 rounded-full bg-[#FDF8EE] border-2 border-[#EFE7D6] shadow-[0_3px_0_#d9dadc] flex items-center justify-center text-on-surface cursor-pointer hover:bg-surface-container-low active:translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
        </div>
      </div>

      {/* Embedded Game Container */}
      <div className="w-full max-w-[850px] h-[680px] md:h-[740px] bg-[#0b0a08] rounded-[28px] overflow-hidden border-4 border-[#2a271f] shadow-[0_12px_24px_rgba(0,0,0,0.35)] relative">
        <iframe
          ref={iframeRef}
          src="/games/wordezy/index.html"
          title="Word Search"
          className="w-full h-full border-0"
        />
      </div>

      <div className="mt-4 text-center text-xs font-bold text-on-surface-variant">
        💡 Tip: Look at the word list on the right and trace letters horizontally or vertically!
      </div>
    </div>
  );
};
