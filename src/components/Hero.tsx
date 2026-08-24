'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Coffee, Scroll, ChevronRight, Skull, ShieldCheck } from 'lucide-react';
import { sound } from '@/lib/audio';

interface HeroProps {
  onStartCurse: () => void;
  onOpenTipModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartCurse, onOpenTipModal }) => {
  const [counter, setCounter] = useState(1184);

  // Live counter auto-pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setCounter((prev) => prev + Math.floor(Math.random() * 2 + 1));
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 text-center overflow-hidden">
      {/* Background Magical Altar Runic SVG Rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center -z-10">
        {/* Outer Runic Circle */}
        <div className="relative h-[480px] w-[480px] sm:h-[620px] sm:w-[620px] rounded-full border border-astral-500/15 animate-spin-slow">
          <div className="absolute inset-4 rounded-full border border-dashed border-inferno-500/20" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[10px] text-astral-400/40 font-mono tracking-widest">
            ᛟ ᚱ ᛞ ᛟ ᛬ ᚲ ᚨ ᚱ ᛗ ᚨ
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] text-inferno-400/40 font-mono tracking-widest">
            ᛉ ᛊ ᛏ ᚱ ᚨ ᛚ ᛬ ᛚ ᛖ ᚷ ᛁ ᛟ ᚾ
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] text-astral-400/40 font-mono">
            ᚢ
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-astral-400/40 font-mono">
            ᚦ
          </div>
        </div>

        {/* Counter-rotating Inner Glyphs */}
        <div className="absolute h-[320px] w-[320px] sm:h-[420px] sm:w-[420px] rounded-full border border-inferno-500/20 animate-spin-reverse opacity-70">
          <div className="absolute inset-8 rounded-full border border-dotted border-astral-400/30" />
        </div>

        {/* Central Ambient Glow */}
        <div className="absolute h-[250px] w-[250px] sm:h-[350px] sm:w-[350px] rounded-full bg-gradient-to-tr from-inferno-600/25 via-astral-600/20 to-transparent blur-[90px]" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-astral-500/30 bg-void-900/90 px-4 py-1.5 text-xs text-zinc-300 shadow-glow-violet backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-inferno-500 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-inferno-500"></span>
          </span>
          <span className="font-mono text-karma-gold font-semibold">
            {counter.toLocaleString('ru-RU')}
          </span>
          <span className="text-zinc-400">кармических приговоров исполнено</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl"
        >
          <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            Проклинатор
          </span>{' '}
          <span className="bg-gradient-to-r from-inferno-500 via-inferno-400 to-astral-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,77,40,0.6)]">
            Онлайн
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-base sm:text-xl text-zinc-300 leading-relaxed font-light"
        >
          Одно действие — и вы счастливы. Направьте безжалостную космическую бюрократию и абсурдные микро-кары на обидчика.
        </motion.p>

        {/* Primary & Secondary CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Main CTA: Big Glowing Button */}
          <button
            id="main-curse-cta"
            onClick={() => {
              sound.playClick();
              onStartCurse();
            }}
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-inferno-600 via-inferno-500 to-astral-600 px-9 py-4 font-serif text-xl font-bold text-white shadow-glow-crimson transition-all duration-300 hover:scale-105 hover:shadow-[0_0_45px_rgba(255,77,40,0.75)] active:scale-95 tracking-wide"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
            <Flame className="h-6 w-6 text-yellow-300 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span>Призвать кару</span>
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA: Support / Tip */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTipModal();
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl border border-void-700 bg-void-900/80 px-6 py-4 text-sm font-medium text-zinc-300 backdrop-blur-md transition-all hover:border-astral-500/50 hover:bg-void-850 hover:text-white active:scale-95"
          >
            <Coffee className="h-4 w-4 text-karma-amber" />
            <span>Подбросить энергии клерку</span>
          </button>
        </motion.div>

        {/* 3 Value Pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3 text-left"
        >
          <div className="flex items-start gap-3 rounded-xl border border-void-800 bg-void-950/60 p-4 backdrop-blur-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-inferno-500/10 text-inferno-400 border border-inferno-500/20">
              <Skull className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-zinc-100">100% этичное возмездие</h3>
              <p className="mt-0.5 text-[11px] text-zinc-400">Никакого вреда здоровью — только адские мелкие бытовые пакости.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-void-800 bg-void-950/60 p-4 backdrop-blur-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-astral-500/10 text-astral-400 border border-astral-500/20">
              <Scroll className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-zinc-100">Официальная грамота</h3>
              <p className="mt-0.5 text-[11px] text-zinc-400">Печать Канцелярии, баркод и персональная ссылка для жертвы.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-void-800 bg-void-950/60 p-4 backdrop-blur-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-karma-gold/10 text-karma-gold border border-karma-gold/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-zinc-100">Анонимность клерка</h3>
              <p className="mt-0.5 text-[11px] text-zinc-400">Ваше имя надежно скрыто за семью печатями астрального трибунала.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
