'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Flame, Sun, Shield, Sparkles, ShoppingBag, Coins } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { KarmaRealm, UserKarmaProfile } from '@/types';
import { karmaStore } from '@/lib/karmaStore';

interface NavbarProps {
  realm: KarmaRealm;
  onToggleRealm: () => void;
  onOpenShop: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ realm, onToggleRealm, onOpenShop }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());

  useEffect(() => {
    setIsMuted(sound.getIsMuted());
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    triggerHaptic('light');
  };

  const isDark = realm === 'dark';

  return (
    <header className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-all duration-500 ${
      isDark 
        ? 'border-void-700/60 bg-void-950/85' 
        : 'border-amber-500/20 bg-slate-950/85'
    }`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl p-0.5 transition-all duration-500 hover:scale-105 ${
            isDark
              ? 'bg-gradient-to-br from-inferno-600 to-astral-700 shadow-glow-crimson'
              : 'bg-gradient-to-br from-amber-400 via-emerald-400 to-sky-400 shadow-glow-gold'
          }`}>
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-void-950">
              {isDark ? (
                <Flame className="h-5 w-5 text-inferno-400 animate-pulse" />
              ) : (
                <Sun className="h-5 w-5 text-amber-300 animate-spin-slow" />
              )}
            </div>
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-void-950 animate-ping" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-void-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-bold tracking-tight text-white">
                {isDark ? 'Проклинатор' : 'Благословитель'}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border transition-colors ${
                isDark
                  ? 'bg-inferno-500/10 text-inferno-400 border-inferno-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}>
                {isDark ? 'Тьма' : 'Свет'}
              </span>
            </div>
            <p className="hidden text-[11px] text-zinc-400 sm:block font-sans">
              {isDark ? 'Темная Канцелярия Карма-Контроля' : 'Небесная Канцелярия Благодати'}
            </p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dual Realm Switcher Button */}
          <button
            onClick={() => {
              if (isDark) {
                sound.playCelestialChime();
              } else {
                sound.playClick();
              }
              triggerHaptic('medium');
              onToggleRealm();
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 font-heading ${
              isDark
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400 hover:shadow-glow-gold'
                : 'border-inferno-500/40 bg-inferno-500/10 text-inferno-300 hover:bg-inferno-500/20 hover:border-inferno-400 hover:shadow-glow-crimson'
            }`}
            title="Переключить сторону силы (Тьма / Свет)"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Flame className="w-3.5 h-3.5 text-inferno-400" />}
            <span className="hidden md:inline">{isDark ? 'Перейти на Свет' : 'Перейти во Тьму'}</span>
          </button>

          {/* Karma Coins & Shield Badge (Shop Trigger) */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenShop();
            }}
            className="flex items-center gap-2 rounded-xl border border-karma-gold/30 bg-karma-gold/10 px-3 py-1.5 text-xs font-semibold text-karma-gold transition-all hover:bg-karma-gold/20 hover:border-karma-gold/60 hover:shadow-glow-gold active:scale-95 font-heading"
            title="Открыть Кармическую Лавку & Откуп"
          >
            <div className="flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-karma-gold" />
              <span>{profile.coins} 🪙</span>
            </div>

            {profile.activeShields > 0 && (
              <span className="hidden sm:inline-flex items-center gap-0.5 rounded-md bg-emerald-500/20 px-1.5 py-0.2 text-[10px] text-emerald-300 border border-emerald-500/30">
                🛡️ {profile.activeShields}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-700 bg-void-850/80 text-zinc-300 transition-all hover:border-astral-500 hover:text-white hover:shadow-glow-violet active:scale-90"
            title={isMuted ? 'Включить звук' : 'Отключить звук'}
            aria-label="Sound Toggle"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-zinc-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-astral-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
