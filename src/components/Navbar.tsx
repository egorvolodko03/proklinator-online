'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Flame, Shield, Sparkles } from 'lucide-react';
import { sound } from '@/lib/audio';

interface NavbarProps {
  onOpenTipModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTipModal }) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sound.getIsMuted());
  }, []);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-void-700/60 bg-void-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-inferno-600 to-astral-700 p-0.5 shadow-glow-crimson transition-transform hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-void-950">
              <Flame className="h-5 w-5 text-inferno-400 animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-void-950 animate-ping" />
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-void-950" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-wider text-white">
                Проклинатор
              </span>
              <span className="rounded-full bg-inferno-500/10 px-2 py-0.5 text-[10px] font-semibold text-inferno-400 border border-inferno-500/30">
                Онлайн
              </span>
            </div>
            <p className="hidden text-[11px] text-zinc-400 sm:block">
              Темная Канцелярия Космической Кармы
            </p>
          </div>
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tip / Absolution trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTipModal();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-karma-gold/30 bg-karma-gold/10 px-3 py-1.5 text-xs font-medium text-karma-gold transition-all hover:bg-karma-gold/20 hover:border-karma-gold/60 hover:shadow-glow-gold active:scale-95"
            title="Откупиться от кармы или поддержать клерков"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Откуп от кармы</span>
            <span className="sm:hidden">Откуп</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-void-700 bg-void-850/80 text-zinc-300 transition-all hover:border-astral-500 hover:text-white hover:shadow-glow-violet active:scale-90"
            title={isMuted ? 'Включить звук астрала' : 'Отключить звук'}
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
