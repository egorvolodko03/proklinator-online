'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sun, Sparkles } from 'lucide-react';
import { KarmaRealm } from '@/types';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';

interface RealmSelectorProps {
  activeRealm: KarmaRealm;
  onSelectRealm: (realm: KarmaRealm) => void;
}

export const RealmSelector: React.FC<RealmSelectorProps> = ({
  activeRealm,
  onSelectRealm,
}) => {
  const isDark = activeRealm === 'dark';

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex rounded-2xl border border-void-800 bg-void-900/90 p-1.5 shadow-2xl backdrop-blur-xl">
        {/* Dark Realm Button */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('medium');
            onSelectRealm('dark');
          }}
          className={`relative flex items-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition-all font-heading ${
            isDark
              ? 'text-white shadow-glow-crimson'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {isDark && (
            <motion.div
              layoutId="active-realm-indicator"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-inferno-600 via-inferno-500 to-red-600 shadow-glow-crimson"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Flame className={`w-4 h-4 ${isDark ? 'text-yellow-300' : 'text-zinc-500'}`} />
            <span>Темная Канцелярия</span>
          </span>
        </button>

        {/* Light Realm Button */}
        <button
          onClick={() => {
            sound.playCelestialChime();
            triggerHaptic('medium');
            onSelectRealm('light');
          }}
          className={`relative flex items-center gap-2 rounded-xl px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-bold transition-all font-heading ${
            !isDark
              ? 'text-void-950 shadow-glow-gold'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          {!isDark && (
            <motion.div
              layoutId="active-realm-indicator"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 shadow-glow-gold"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Sun className={`w-4 h-4 ${!isDark ? 'text-void-950 animate-spin' : 'text-zinc-500'}`} style={{ animationDuration: '8s' }} />
            <span>Небесная Благодать</span>
          </span>
        </button>
      </div>
    </div>
  );
};
