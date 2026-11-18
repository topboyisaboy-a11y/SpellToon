'use client';

import React, { useRef, useState, useEffect } from 'react';
import { sound } from '@/lib/audioEngine';
import confetti from 'canvas-confetti';

interface JetpackSurgeViewProps {
  onBack: () => void;
  onEarnKey?: () => void;
}

export const JetpackSurgeView: React.FC<JetpackSurgeViewProps> = ({
  onBack,
  onEarnKey,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasClaimedKey, setHasClaimedKey] = useState(false);

  useEffect(() => {
    sound.speak('Jetpack Surge! Tap and hold to fly up, let go to fall down, and grab the golden coins!');
  }, []);

  const handleClaimKey = () => {
    if (hasClaimedKey) return;
    setHasClaimedKey(true);
    sound.playChime(1.25);
    sound.speak('Sky hero! You earned a Golden Key!');
    if (onEarnKey) onEarnKey();

    try {
      confetti({
        particleCount: 55,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ffd23f', '#ff5964', '#ffffff'],
      });
    } catch {}
  };

  const handleReload = () => {
    sound.playTap();
    if (iframeRef.current) {
      iframeRef.current.src = '/games/jetpack-surge/index.html';
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
          <span className="text-3xl">🚀</span>
          <div>
            <h1 className="font-headline text-lg md:text-xl font-bold text-on-surface leading-tight">
              Jetpack Surge
            </h1>
            <p className="text-xs text-on-surface-variant font-medium hidden sm:block">
              Tap & hold to boost, collect coins & dodge obstacles
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
            aria-label="Restart Jetpack Surge"
            className="w-12 h-12 rounded-full bg-[#FDF8EE] border-2 border-[#EFE7D6] shadow-[0_3px_0_#d9dadc] flex items-center justify-center text-on-surface cursor-pointer hover:bg-surface-container-low active:translate-y-0.5 transition-all"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
        </div>
      </div>

      {/* Embedded Game Container */}
      <div className="w-full max-w-[850px] aspect-[16/9] min-h-[460px] md:min-h-[560px] bg-black rounded-[28px] overflow-hidden border-4 border-[#1e293b] shadow-[0_12px_24px_rgba(0,0,0,0.35)] relative">
        <iframe
          ref={iframeRef}
          src="/games/jetpack-surge/index.html"
          title="Jetpack Surge"
          className="w-full h-full border-0"
          allow="autoplay"
        />
      </div>

      <div className="mt-4 text-center text-xs font-bold text-on-surface-variant">
        💡 Tip: Tap and hold anywhere on the screen (or Space bar) to fire your jetpack thruster!
      </div>
    </div>
  );
};
