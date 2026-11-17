'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { sound } from '@/lib/audioEngine';

interface AudioButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  spokenLabel: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'yellow' | 'peach' | 'mint' | 'sky' | 'lavender' | 'pink' | 'white';
  className?: string;
}

const variantStyles = {
  yellow: 'bg-bubble-yellow text-cocoa shadow-toddler active:shadow-toddler-active',
  peach: 'bg-bubble-peach text-cocoa shadow-toddler active:shadow-toddler-active',
  mint: 'bg-bubble-mint text-cocoa shadow-toddler active:shadow-toddler-active',
  sky: 'bg-bubble-sky text-cocoa shadow-toddler active:shadow-toddler-active',
  lavender: 'bg-bubble-lavender text-cocoa shadow-toddler active:shadow-toddler-active',
  pink: 'bg-bubble-pink text-cocoa shadow-toddler active:shadow-toddler-active',
  white: 'bg-white text-cocoa shadow-toddler active:shadow-toddler-active',
};

export const AudioButton: React.FC<AudioButtonProps> = ({
  spokenLabel,
  onClick,
  children,
  variant = 'yellow',
  className = '',
  ...props
}) => {
  const handleClick = () => {
    sound.playTap();
    sound.speak(spokenLabel);
    if (onClick) onClick();
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={handleClick}
      aria-label={spokenLabel}
      className={`min-w-touch min-h-touch p-4 rounded-4xl flex flex-col items-center justify-center font-bold text-2xl transition-all cursor-pointer ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
