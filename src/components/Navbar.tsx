'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Flame, Shield, Users, Gift, Coins, Sun, User, UserCheck, Lock } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { CLERK_RANKS, getRankByExp } from '@/data/ranks';
import { UserKarmaProfile, KarmaRealm } from '@/types';

interface NavbarProps {
  realm?: KarmaRealm;
  onOpenTipModal: () => void;
  onOpenSquadsModal: () => void;
  onOpenAltarModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  realm = 'dark',
  onOpenTipModal,
  onOpenSquadsModal,
  onOpenAltarModal,
  onOpenAuthModal,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());

  useEffect(() => {
    setIsMuted(sound.getIsMuted());
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  const currentRank = getRankByExp(profile.experience);
  const isDark = realm === 'dark';

  const toggleSound = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      sound.playClick();
      triggerHaptic('light');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-void-800 bg-void-950/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-2.5 sm:px-6 gap-1.5">
        {/* Brand */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ring-1 ring-white/10 ${
            isDark 
              ? 'bg-gradient-to-br from-inferno-600 to-astral-600 shadow-glow-crimson'
              : 'bg-gradient-to-br from-amber-400 to-emerald-400 shadow-glow-gold'
          }`}>
            {isDark ? (
              <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 animate-pulse" />
            ) : (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-void-950 animate-spin" style={{ animationDuration: '10s' }} />
            )}
          </div>
          
          <div className="truncate">
            <span className="font-heading text-xs sm:text-base font-black tracking-tight text-white uppercase truncate block">
              {isDark ? 'Проклинатор' : 'Благословитель'} <span className="text-karma-gold hidden xs:inline">онлайн</span>
            </span>
          </div>
        </div>

        {/* Action Controls Hub (Mobile Safe) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Auth Button or User Badge */}
          {profile.isAuthorized ? (
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('light');
                onOpenTipModal();
              }}
              className="flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-emerald-300 font-heading"
              title="Профиль авторизован"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline truncate max-w-[80px]">{profile.telegramUser?.first_name || 'Профиль'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                triggerHaptic('light');
                onOpenAuthModal();
              }}
              className="flex items-center gap-1 rounded-xl border border-sky-500/40 bg-sky-500/15 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-sky-300 font-heading hover:bg-sky-500/25 transition-all shadow-[0_0_15px_rgba(14,165,233,0.25)]"
              title="Войти через Telegram"
            >
              <User className="w-3.5 h-3.5" />
              <span>Войти</span>
            </button>
          )}

          {/* Squads Button */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenSquadsModal();
            }}
            className="flex items-center gap-1 rounded-xl border border-void-700 bg-void-900/90 px-2 sm:px-3 py-1.5 text-xs font-bold text-zinc-200 shadow-sm transition-all hover:border-karma-gold hover:text-white active:scale-95 font-heading"
            title="Офисные Сквады & Гильдии"
          >
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-karma-gold" />
            <span className="hidden sm:inline">Сквады</span>
          </button>

          {/* Altar / Roulette Button */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenAltarModal();
            }}
            className="flex items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-500/15 px-2 sm:px-3 py-1.5 text-xs font-bold text-amber-300 shadow-glow-gold transition-all hover:bg-amber-500/25 active:scale-95 font-heading"
            title="Рулетка Алтаря & Ежедневные Награды"
          >
            <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300 animate-bounce" />
            <span className="hidden sm:inline">Алтарь</span>
          </button>

          {/* Coins & Inventory Button */}
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              onOpenTipModal();
            }}
            className="flex items-center gap-1 rounded-xl border border-void-700 bg-void-900/90 px-2 sm:px-3 py-1.5 text-xs font-bold text-zinc-200 shadow-sm transition-all hover:border-astral-500 hover:text-white active:scale-95 font-heading"
            title="Инвентарь & Кармическая Лавка"
          >
            <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-karma-gold" />
            <span className="text-karma-gold font-mono text-xs sm:text-sm">{profile.coins}</span>
            {profile.activeShields > 0 && (
              <span className="hidden xs:flex items-center gap-0.5 text-[9px] sm:text-[10px] text-emerald-400 bg-emerald-500/20 px-1 py-0.2 rounded font-mono">
                <Shield className="w-2.5 h-2.5" /> {profile.activeShields}
              </span>
            )}
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-void-800 bg-void-900 text-zinc-400 transition-colors hover:border-void-700 hover:text-zinc-100 shrink-0"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-600" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
