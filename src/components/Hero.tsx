'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sun, Sparkles, Coffee, Scroll, ChevronRight, Skull, ShieldCheck, Heart, Zap, Coins } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { KarmaRealm } from '@/types';

interface HeroProps {
  realm: KarmaRealm;
  onStartRitual: () => void;
  onOpenShop: () => void;
}

export const Hero: React.FC<HeroProps> = ({ realm, onStartRitual, onOpenShop }) => {
  const [counter, setCounter] = useState(1284);
  const isDark = realm === 'dark';

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setCounter((prev) => prev + Math.floor(Math.random() * 2 + 1));
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 text-center overflow-hidden transition-all duration-700">
      {/* Background Altar Runic SVG Rings & Glyphs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10">
        {/* Outer Runic Circle */}
        <div className={`relative h-[480px] w-[480px] sm:h-[620px] sm:w-[620px] rounded-full border transition-all duration-700 animate-spin-slow ${
          isDark ? 'border-astral-500/15' : 'border-amber-400/20'
        }`}>
          <div className={`absolute inset-4 rounded-full border border-dashed transition-all duration-700 ${
            isDark ? 'border-inferno-500/20' : 'border-emerald-400/25'
          }`} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-zinc-500">
            {isDark ? 'ᛟ ᚱ ᛞ ᛟ ᛬ ᚲ ᚨ ᚱ ᛗ ᚨ' : '✦ ᛚ ᚢ ᛗ ᛖ ᚾ ᛬ ᚷ ᚱ ᚨ ᛏ ᛁ ᚨ ✦'}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-zinc-500">
            {isDark ? 'ᛉ ᛊ ᛏ ᚱ ᚨ ᛚ ᛬ ᛚ ᛖ ᚷ ᛁ ᛟ ᚾ' : '✦ ᛊ ᛟ ᛚ ᚨ ᚱ ᛬ ᛒ ᛚ ᛖ ᛊ ᛊ ᛁ ᚾ ᚷ ✦'}
          </div>
        </div>

        {/* Inner Glyphs */}
        <div className={`absolute h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] rounded-full border transition-all duration-700 animate-spin-reverse ${
          isDark ? 'border-inferno-500/20 opacity-70' : 'border-amber-400/30 opacity-80'
        }`}>
          <div className={`absolute inset-8 rounded-full border border-dotted ${
            isDark ? 'border-astral-400/30' : 'border-emerald-400/30'
          }`} />
        </div>

        {/* Ambient Glow */}
        <div className={`absolute h-[280px] w-[280px] sm:h-[380px] sm:w-[380px] rounded-full blur-[100px] transition-all duration-700 ${
          isDark 
            ? 'bg-gradient-to-tr from-inferno-600/25 via-astral-600/20 to-transparent' 
            : 'bg-gradient-to-tr from-amber-500/25 via-emerald-500/20 to-sky-500/20'
        }`} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Live Status Badge */}
        <motion.div
          key={realm}
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md transition-all ${
            isDark
              ? 'border-astral-500/30 bg-void-900/90 shadow-glow-violet'
              : 'border-amber-500/30 bg-slate-950/90 shadow-glow-gold'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              isDark ? 'bg-inferno-500' : 'bg-emerald-400'
            }`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${
              isDark ? 'bg-inferno-500' : 'bg-emerald-400'
            }`} />
          </span>
          <span className="font-mono text-karma-gold font-semibold">
            {counter.toLocaleString('ru-RU')}
          </span>
          <span className="text-zinc-400 font-sans">
            {isDark ? 'приговоров вынесено в астрале' : 'анонимных благословений ниспослано'}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          key={`title-${realm}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="font-heading text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
        >
          <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            {isDark ? 'Проклинатор' : 'Благословитель'}
          </span>{' '}
          <span className={`bg-clip-text text-transparent transition-all ${
            isDark
              ? 'bg-gradient-to-r from-inferno-500 via-inferno-400 to-astral-400 drop-shadow-[0_0_40px_rgba(255,77,40,0.6)]'
              : 'bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 drop-shadow-[0_0_40px_rgba(251,191,36,0.6)]'
          }`}>
            Онлайн
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          key={`sub-${realm}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-zinc-300 leading-relaxed font-normal font-sans"
        >
          {isDark ? (
            'Одно действие — и вы счастливы. Направьте безжалостную космическую бюрократию и абсурдные микро-кары на обидчика.'
          ) : (
            'Одно доброе действие — и мир стал светлее. Отправьте анонимный луч благодарности и астральное благословение хорошему человеку.'
          )}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Main Action Button */}
          <button
            onClick={() => {
              if (isDark) sound.playClick();
              else sound.playCelestialChime();
              triggerHaptic('medium');
              onStartRitual();
            }}
            className={`group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl px-9 py-4 font-heading text-base sm:text-lg font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 tracking-wide ${
              isDark
                ? 'bg-gradient-to-r from-inferno-600 via-inferno-500 to-astral-600 shadow-glow-crimson hover:shadow-[0_0_45px_rgba(255,77,40,0.75)]'
                : 'bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 shadow-glow-gold hover:shadow-[0_0_45px_rgba(251,191,36,0.75)]'
            }`}
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            {isDark ? (
              <Flame className="h-5 w-5 text-yellow-300 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-100 transition-transform group-hover:rotate-45 group-hover:scale-110" />
            )}
            <span>{isDark ? 'Призвать кару' : 'Ниспослать благодать'}</span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary Button: Shop */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenShop();
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-void-700 bg-void-900/80 px-6 py-4 text-sm font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-karma-gold/50 hover:bg-void-850 hover:text-white active:scale-95 font-sans"
          >
            <ShieldCheck className="h-4 w-4 text-karma-amber" />
            <span>Кармическая лавка & Щиты</span>
          </button>
        </motion.div>

        {/* 3 Pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-void-800 bg-void-950/60 p-4 backdrop-blur-sm">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isDark ? 'bg-inferno-500/10 text-inferno-400 border-inferno-500/20' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
            }`}>
              {isDark ? <Skull className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="font-heading text-xs font-bold text-zinc-100">
                {isDark ? '100% этичное возмездие' : 'Чистая светлая энергия'}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-400 font-sans">
                {isDark ? 'Никакого вреда здоровью — только бытовой дискомфорт.' : 'Приятные сюрпризы, которые поднимают настроение.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-void-800 bg-void-950/60 p-4 backdrop-blur-sm">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isDark ? 'bg-astral-500/10 text-astral-400 border-astral-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              <Scroll className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-xs font-bold text-zinc-100">
                {isDark ? 'Грамота с печатью' : 'Грамота Благодати'}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-400 font-sans">
                {isDark ? 'Печать темного трибунала и штрихкод.' : 'Золотой герб небес и сертификат доброго сердца.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-void-800 bg-void-950/60 p-4 backdrop-blur-sm">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
              isDark ? 'bg-karma-gold/10 text-karma-gold border-karma-gold/20' : 'bg-sky-500/10 text-sky-300 border-sky-500/20'
            }`}>
              <Coins className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-xs font-bold text-zinc-100">Награда +20 Кармоидов</h3>
              <p className="mt-0.5 text-xs text-zinc-400 font-sans">
                За каждое доброе дело начисляются монеты на зеркальные щиты.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
