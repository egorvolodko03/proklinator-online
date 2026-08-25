'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sun, ChevronRight, Users, Gift, Sparkles } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { UserKarmaProfile, KarmaRealm } from '@/types';

interface HeroProps {
  realm: KarmaRealm;
  onStartRitual: () => void;
  onOpenSquadsModal: () => void;
  onOpenAltarModal: () => void;
  onRequireAuth?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  realm,
  onStartRitual,
  onOpenSquadsModal,
  onOpenAltarModal,
  onRequireAuth,
}) => {
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const isDark = realm === 'dark';

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  const handleOpenSquads = () => {
    if (!profile.isAuthorized && onRequireAuth) {
      onRequireAuth();
    } else {
      onOpenSquadsModal();
    }
  };

  const handleOpenAltar = () => {
    if (!profile.isAuthorized && onRequireAuth) {
      onRequireAuth();
    } else {
      onOpenAltarModal();
    }
  };

  return (
    <section className="relative overflow-hidden pt-4 sm:pt-8 pb-4 text-center">
      {/* Decorative Cosmic Nebula Glow */}
      <div className={`pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl transition-all duration-700 ${
        isDark
          ? 'bg-gradient-to-tr from-inferno-600/25 via-red-900/20 to-astral-600/20'
          : 'bg-gradient-to-tr from-amber-400/25 via-yellow-200/20 to-emerald-400/20'
      }`} />

      {/* Main Dynamic Heading */}
      <AnimatePresence mode="wait">
        <motion.div
          key={realm}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="mx-auto max-w-4xl font-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase drop-shadow-md">
            {isDark ? (
              <>
                Направьте космическую{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-inferno-400 via-amber-300 to-karma-gold">
                  бюрократию
                </span>{' '}
                на обидчика
              </>
            ) : (
              <>
                Ниспошлите луч{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-emerald-300">
                  небесной благодати
                </span>{' '}
                хорошему человеку
              </>
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-base md:text-lg text-zinc-300 font-sans leading-relaxed">
            {isDark ? (
              <>
                Шуточный трибунал кармы для коллег, бывших и шумных соседей. Создавайте заверенные
                грамоты с сургучной печатью и отправляйте в чаты.
              </>
            ) : (
              <>
                Одно доброе действие — и мир стал светлее. Отправьте сияющую грамоту признания,
                астральную благодарность и поднимите настроение близким.
              </>
            )}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Primary Dynamic Action Button (Only ONE single main button based on active realm!) */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {isDark ? (
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('medium');
              onStartRitual();
            }}
            className="group relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-inferno-600 via-inferno-500 to-red-600 px-7 sm:px-9 py-4 font-heading text-sm sm:text-base font-bold text-white shadow-glow-crimson transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          >
            <Flame className="h-5 w-5 text-yellow-300 transition-transform group-hover:rotate-12" />
            <span>Наслать проклятие</span>
            <ChevronRight className="h-4 w-4 text-white/80 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playCelestialChime();
              triggerHaptic('medium');
              onStartRitual();
            }}
            className="group relative flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-400 px-7 sm:px-9 py-4 font-heading text-sm sm:text-base font-bold text-void-950 shadow-glow-gold transition-all hover:scale-105 hover:brightness-110 active:scale-95"
          >
            <Sun className="h-5 w-5 text-void-950 transition-transform group-hover:rotate-45" />
            <span>Ниспослать благодать</span>
            <ChevronRight className="h-4 w-4 text-void-950/80 transition-transform group-hover:translate-x-1" />
          </button>
        )}

        {/* Squads Button */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('light');
            handleOpenSquads();
          }}
          className="flex items-center gap-2 rounded-2xl border border-void-700 bg-void-900/90 px-5 py-4 font-heading text-xs sm:text-sm font-bold text-zinc-200 shadow-md transition-all hover:border-karma-gold hover:text-white active:scale-95"
        >
          <Users className="h-4 w-4 text-karma-gold" />
          <span>Офисные Сквады</span>
        </button>

        {/* Altar Roulette Button */}
        <button
          onClick={() => {
            sound.playClick();
            triggerHaptic('light');
            handleOpenAltar();
          }}
          className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 font-heading text-xs sm:text-sm font-bold text-amber-300 shadow-glow-gold transition-all hover:bg-amber-500/20 active:scale-95"
        >
          <Gift className="h-4 w-4 text-amber-300 animate-bounce" />
          <span>Рулетка Алтаря</span>
        </button>
      </div>
    </section>
  );
};
