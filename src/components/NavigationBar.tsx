'use client';

import React from 'react';
import { AudioButton } from './AudioButton';
import { Home, ArrowLeft, Shield } from 'lucide-react';
import { ScreenType } from '@/types';

interface NavigationBarProps {
  currentScreen: ScreenType;
  onNavigateHome: () => void;
  onNavigateBack: () => void;
  onOpenParentGate: () => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentScreen,
  onNavigateHome,
  onNavigateBack,
  onOpenParentGate,
}) => {
  const isHome = currentScreen === 'home';

  return (
    <header className="w-full flex items-center justify-between p-4 md:p-6 bg-cream/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {!isHome ? (
          <>
            <AudioButton
              spokenLabel="Go Back"
              onClick={onNavigateBack}
              variant="white"
              className="w-20 h-20"
            >
              <ArrowLeft className="w-9 h-9 stroke-[2.5]" />
            </AudioButton>

            <AudioButton
              spokenLabel="Go Home"
              onClick={onNavigateHome}
              variant="mint"
              className="w-20 h-20"
            >
              <Home className="w-9 h-9 stroke-[2.5]" />
            </AudioButton>
          </>
        ) : (
          <div className="flex items-center gap-2 pl-2">
            <span className="text-4xl">✨</span>
            <span className="text-3xl font-extrabold tracking-wide text-cocoa">
              SpellToon
            </span>
          </div>
        )}
      </div>

      {/* Parental Gate access button (requires 3-second two-button hold modal) */}
      <AudioButton
        spokenLabel="Parents Area"
        onClick={onOpenParentGate}
        variant="white"
        className="w-20 h-20 border-2 border-dashed border-cocoa/20"
      >
        <Shield className="w-8 h-8 text-cocoa/70 stroke-[2.2]" />
      </AudioButton>
    </header>
  );
};
