'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Flame, Shield, Sparkles, Users, Gift, Coins } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { CLERK_RANKS, getRankByExp } from '@/data/ranks';
import { UserKarmaProfile } from '@/types';

interface NavbarProps {
  onOpenTipModal: () => void;
  onOpenSquadsModal: () => void;
  onOpenAltarModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenTipModal,
  onOpenSquadsModal,
  onOpenAltarModal,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());

  useEffect(() => {
    setIsMuted(sound.getMuted());
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  const currentRank = getRankByExp(profile.experience);

  const toggleSound = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      sound.playClick();
      triggerHaptic('light');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-void-800 bg-void-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-inferno-600 to-astral-600 shadow-glow-crimson ring-1 ring-white/10">
            <Flame className="h-5 w-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <span className="font-heading text-sm sm:text-base font-black tracking-tight text-white uppercase">
              Проклинатор <span className="text-karma-gold">онлайн</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono text-zinc-400 bg-void-800 px-1.5 py-0.5 rounded border border-void-700">
              v3.0 Сквады & Алтарь
            </span>
          </div>
        </div>

        {/* Action Buttons Hub */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Clerk Rank Level Badge */}
          <div
            className={`hidden md:flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-mono font-semibold ${currentRank.badgeColor}`}
            title={`Текущий ранг: ${currentRank.title} (${currentRank.perkDescription})`}
          >
            <span>{currentRank.icon}</span>
            <span className="font-heading text-[11px]">{currentRank.title}</span>
          </div>

          {/* Squads Button */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenSquadsModal();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900/90 px-3 py-1.5 text-xs font-bold text-zinc-200 shadow-sm transition-all hover:border-karma-gold hover:text-white active:scale-95 font-heading"
          >
            <Users className="h-4 w-4 text-karma-gold" />
            <span className="hidden sm:inline">Сквады</span>
          </button>

          {/* Altar / Roulette Button */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenAltarModal();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-glow-gold transition-all hover:bg-amber-500/20 hover:scale-105 active:scale-95 font-heading"
          >
            <Gift className="h-4 w-4 text-amber-300 animate-bounce" />
            <span>Алтарь</span>
          </button>

          {/* Shop / Shield & Coins Button */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenTipModal();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900/90 px-3 py-1.5 text-xs font-bold text-zinc-200 shadow-sm transition-all hover:border-astral-500 hover:text-white active:scale-95 font-heading"
          >
            <Coins className="h-4 w-4 text-karma-gold" />
            <span className="text-karma-gold font-mono">{profile.coins}</span>
            {profile.activeShields > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">
                <Shield className="w-2.5 h-2.5" /> {profile.activeShields}
              </span>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-void-800 bg-void-900 text-zinc-400 transition-colors hover:border-void-700 hover:text-zinc-100"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-zinc-600" /> : <Volume2 className="h-4 w-4 text-zinc-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
