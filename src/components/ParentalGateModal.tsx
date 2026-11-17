'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/audioEngine';
import { Lock, X, Check } from 'lucide-react';

interface ParentalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const HOLD_DURATION_MS = 3000;

export const ParentalGateModal: React.FC<ParentalGateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [holding1, setHolding1] = useState(false);
  const [holding2, setHolding2] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      sound.speak('Parents only. Hold both buttons for three seconds.');
    }
  }, [isOpen]);

  useEffect(() => {
    const bothHolding = holding1 && holding2;

    if (bothHolding) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      const tick = () => {
        if (!startTimeRef.current) return;
        const elapsed = Date.now() - startTimeRef.current;
        const currentProgress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
        setProgress(currentProgress);

        if (currentProgress >= 100) {
          sound.playChime(1.2);
          sound.speak('Parent area unlocked');
          onSuccess();
          onClose();
          return;
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      startTimeRef.current = null;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setProgress(0);
    }

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [holding1, holding2, onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cocoa/40 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-lg bg-cream rounded-4xl p-6 md:p-8 shadow-2xl border-4 border-white text-center"
        >
          {/* Close button */}
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="absolute top-4 right-4 w-14 h-14 rounded-full bg-white flex items-center justify-center text-cocoa shadow-md"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-bubble-peach flex items-center justify-center">
            <Lock className="w-10 h-10 text-cocoa" />
          </div>

          <h2 className="text-3xl font-black text-cocoa mb-2">Parental Gate</h2>
          <p className="text-lg text-cocoa/80 mb-6">
            Hold <span className="font-bold">both</span> buttons at the same time for 3 seconds to enter.
          </p>

          {/* Progress Bar */}
          <div className="w-full h-5 bg-cocoa/10 rounded-full overflow-hidden mb-8 border border-white">
            <motion.div
              className="h-full bg-bubble-mint rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* Two Hold Buttons */}
          <div className="flex items-center justify-center gap-6 md:gap-10">
            {/* Button 1 */}
            <button
              type="button"
              onPointerDown={() => setHolding1(true)}
              onPointerUp={() => setHolding1(false)}
              onPointerLeave={() => setHolding1(false)}
              onPointerCancel={() => setHolding1(false)}
              className={`min-w-touch min-h-touch w-28 h-28 rounded-4xl flex flex-col items-center justify-center text-3xl font-bold transition-all select-none shadow-toddler ${
                holding1 ? 'bg-bubble-mint scale-95' : 'bg-bubble-yellow active:scale-95'
              }`}
            >
              {holding1 ? <Check className="w-10 h-10 text-cocoa" /> : '✋'}
            </button>

            {/* Button 2 */}
            <button
              type="button"
              onPointerDown={() => setHolding2(true)}
              onPointerUp={() => setHolding2(false)}
              onPointerLeave={() => setHolding2(false)}
              onPointerCancel={() => setHolding2(false)}
              className={`min-w-touch min-h-touch w-28 h-28 rounded-4xl flex flex-col items-center justify-center text-3xl font-bold transition-all select-none shadow-toddler ${
                holding2 ? 'bg-bubble-mint scale-95' : 'bg-bubble-sky active:scale-95'
              }`}
            >
              {holding2 ? <Check className="w-10 h-10 text-cocoa" /> : '✋'}
            </button>
          </div>

          <p className="mt-6 text-sm text-cocoa/60 font-medium">
            Designed to protect children from accidental settings changes.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
