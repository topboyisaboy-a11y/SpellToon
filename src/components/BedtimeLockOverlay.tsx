'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { sound } from '@/lib/audioEngine';
import { Shield } from 'lucide-react';

interface BedtimeLockOverlayProps {
  childName: string;
  reason: 'bedtime' | 'limit';
  onOpenParentGate: () => void;
}

export const BedtimeLockOverlay: React.FC<BedtimeLockOverlayProps> = ({
  childName,
  reason,
  onOpenParentGate,
}) => {
  useEffect(() => {
    if (reason === 'bedtime') {
      sound.speak(`Time for sleep. Goodnight, ${childName}.`);
    } else {
      sound.speak(`Play time is all done for now. Great job today, ${childName}!`);
    }
  }, [childName, reason]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#2B2D42] to-[#1A1C2E] text-white text-center select-none">
      {/* Floating Stars */}
      <div className="absolute top-12 left-16 text-3xl opacity-40 animate-pulse">⭐</div>
      <div className="absolute top-28 right-24 text-4xl opacity-50 animate-pulse">✨</div>
      <div className="absolute bottom-24 left-20 text-3xl opacity-30 animate-pulse">⭐</div>

      {/* Sleeping Moon */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="text-9xl mb-6 filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
      >
        🌙
      </motion.div>

      <h1 className="text-4xl md:text-5xl font-black mb-3 text-bubble-yellow">
        {reason === 'bedtime' ? 'Sweet Dreams!' : 'Rest & Play Outside!'}
      </h1>

      <p className="text-xl text-white/80 max-w-md mb-8">
        {reason === 'bedtime'
          ? `It is bedtime for ${childName}. See you tomorrow morning!`
          : `Screen time is finished for today. You did wonderful exploring!`}
      </p>

      {/* Parent unlock button (uses 3-second hold gate) */}
      <button
        onClick={() => {
          sound.playTap();
          onOpenParentGate();
        }}
        className="min-w-touch min-h-touch px-6 py-4 rounded-3xl bg-white/10 border border-white/20 text-white/70 flex items-center gap-3 font-bold text-lg hover:bg-white/20 transition-all cursor-pointer"
      >
        <Shield className="w-6 h-6" />
        Parents Area
      </button>
    </div>
  );
};
