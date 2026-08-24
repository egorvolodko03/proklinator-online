'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface AstralProcessingProps {
  onComplete: () => void;
}

const STAGES = [
  { text: '📡 Связь с астральным отделом...', rune: 'ᛟ' },
  { text: '📜 Согласование в канцелярии судеб...', rune: 'ᚲ' },
  { text: '🩸 Наложение сургучной печати...', rune: 'ᛉ' },
  { text: '✨ Кармический приговор вынесен!', rune: '⚡' },
];

export const AstralProcessing: React.FC<AstralProcessingProps> = ({ onComplete }) => {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    sound.playAstralSummon();

    const t1 = setTimeout(() => {
      setStageIndex(1);
    }, 600);

    const t2 = setTimeout(() => {
      setStageIndex(2);
      sound.playSealStamp();
    }, 1200);

    const t3 = setTimeout(() => {
      setStageIndex(3);
      sound.playVerdictChime();

      // Trigger dark mystical magic confetti burst
      try {
        confetti({
          particleCount: 55,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#ff4d28', '#f43f5e', '#8b5cf6', '#fbbf24', '#09090b'],
          ticks: 200,
          scalar: 1.1,
        });
      } catch {
        // ignore
      }
    }, 1800);

    const t4 = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
      {/* Mystical Pentagram / Magic Circle Animation */}
      <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
        {/* Outer Rune Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-inferno-500/40"
        />

        {/* Middle Ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-3 rounded-full border border-astral-500/50"
        />

        {/* Pentagram / Sacred Star SVG */}
        <motion.svg
          viewBox="0 0 100 100"
          className="h-28 w-28 text-inferno-500 drop-shadow-[0_0_20px_rgba(255,77,40,0.8)]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Outer circle */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Inscribed 5-point star */}
          <polygon
            points="50,5 62,38 97,38 69,59 79,93 50,72 21,93 31,59 3,38 38,38"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Center mystic eye / rune */}
          <circle cx="50" cy="50" r="8" fill="#8b5cf6" fillOpacity="0.5" stroke="#fbbf24" strokeWidth="1.5" />
        </motion.svg>

        {/* Central Pulsing Rune */}
        <div className="absolute text-xl font-bold text-yellow-300">
          {STAGES[stageIndex].rune}
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            className="font-serif text-lg font-semibold text-zinc-100 sm:text-xl"
          >
            {STAGES[stageIndex].text}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="mt-6 flex gap-2">
        {STAGES.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx <= stageIndex
                ? 'w-8 bg-gradient-to-r from-inferno-500 to-astral-500 shadow-glow-crimson'
                : 'w-2 bg-void-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
