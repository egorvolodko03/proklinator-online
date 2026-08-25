'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Coffee, Scroll, ChevronRight, Skull, ShieldCheck, Users, Gift, Coins, Sun } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { UserKarmaProfile } from '@/types';

interface HeroProps {
  onStartRitual: () => void;
  onStartBlessing: () => void;
  onOpenTipModal: () => void;
  onOpenSquadsModal: () => void;
  onOpenAltarModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onStartRitual,
  onStartBlessing,
  onOpenTipModal,
  onOpenSquadsModal,
  onOpenAltarModal,
}) => {
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-10 pb-4 text-center">
      {/* Decorative Cosmic Glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-gradient-to-tr from-inferno-600/20 via-karma-gold/20 to-astral-600/20 blur-3xl" />

      {/* Top Banner Tag */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 rounded-full border border-karma-gold/40 bg-karma-gold/10 px-4 py-1.5 text-xs font-semibold text-karma-gold shadow-[0_0_25px_rgba(251,191,36,0.2)] font-heading mb-4"
      >
        <Sparkles className="h-3.5 w-3.5 animate-spin text-karma-gold" />
        <span>Официальная Астральная Канцелярия 3.0</span>
        <span className="rounded-full bg-karma-gold/30 px-2 py-0.5 text-[10px] text-amber-200 font-mono">
          Telegram Mini App
        </span>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mx-auto max-w-4xl font-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-md"
      >
        Направьте космическую{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-inferno-400 via-amber-300 to-karma-gold">
          бюрократию
        </span>{' '}
        на обидчика
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-auto mt-4 max-w-2xl text-sm sm:text-lg text-zinc-300 font-sans leading-relaxed"
      >
        Шуточный трибунал кармы для коллег, бывших и шумных соседей. Создавайте заверенные
        грамоты с сургучной печатью, объединяйтесь в <strong>офисные сквады</strong>, крутите{' '}
        <strong>рулетку алтаря</strong> и защищайтесь <strong>зеркальными щитами</strong>.
      </motion.p>

      {/* Primary CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
      >
        {/* Dark Ritual Button */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('medium');
            onStartRitual();
          }}
          className="group relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-inferno-600 via-inferno-500 to-red-600 px-6 sm:px-8 py-4 font-heading text-sm sm:text-base font-bold text-white shadow-glow-crimson transition-all hover:scale-105 hover:brightness-110 active:scale-95"
        >
          <Flame className="h-5 w-5 text-yellow-300 transition-transform group-hover:rotate-12" />
          <span>Наслать проклятие</span>
          <ChevronRight className="h-4 w-4 text-white/80 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Light Blessing Button */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('medium');
            onStartBlessing();
          }}
          className="group relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 px-6 sm:px-8 py-4 font-heading text-sm sm:text-base font-bold text-void-950 shadow-glow-gold transition-all hover:scale-105 hover:brightness-110 active:scale-95"
        >
          <Sun className="h-5 w-5 text-void-950 transition-transform group-hover:rotate-45" />
          <span>Ниспослать благодать</span>
          <ChevronRight className="h-4 w-4 text-void-950/80 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Squads Button */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('light');
            onOpenSquadsModal();
          }}
          className="flex items-center gap-2 rounded-2xl border border-karma-gold/40 bg-void-900/90 px-5 py-4 font-heading text-sm font-bold text-karma-gold shadow-md transition-all hover:bg-karma-gold/15 hover:border-karma-gold hover:scale-105 active:scale-95"
        >
          <Users className="h-4 w-4 text-karma-gold" />
          <span>Офисные Сквады</span>
        </button>

        {/* Altar Roulette Button */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('light');
            onOpenAltarModal();
          }}
          className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 font-heading text-sm font-bold text-amber-300 shadow-glow-gold transition-all hover:bg-amber-500/20 hover:scale-105 active:scale-95"
        >
          <Gift className="h-4 w-4 text-amber-300 animate-bounce" />
          <span>Рулетка Алтаря</span>
        </button>
      </motion.div>
    </section>
  );
};
