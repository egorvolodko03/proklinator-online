'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Coins, Gift, Flame, Trophy, Check, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { GACHA_PRIZES, spinRoulette } from '@/data/gacha';
import { GachaPrize, UserKarmaProfile } from '@/types';
import confetti from 'canvas-confetti';

interface AltarRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const AltarRouletteModal: React.FC<AltarRouletteModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<GachaPrize | null>(null);
  const [highlightIdx, setHighlightIdx] = useState<number>(0);

  if (!isOpen) return null;

  const todayStr = new Date().toDateString();
  const isFreeDaily = profile.lastDailySpinDate !== todayStr;
  const spinCost = isFreeDaily ? 0 : 20;

  const handleSpin = () => {
    if (isSpinning) return;
    if (spinCost > 0 && profile.coins < spinCost) {
      sound.playClick();
      triggerHaptic('error');
      onShowToast('Недостаточно Кармоидов 🪙 для вращения алтаря!', 'error');
      return;
    }

    if (spinCost > 0) {
      karmaStore.addCoins(-spinCost);
    }

    setIsSpinning(true);
    setWonPrize(null);
    sound.playDiceRoll();
    triggerHaptic('medium');

    const selectedPrize = spinRoulette();

    // Visual cycling through prizes
    let current = 0;
    const interval = setInterval(() => {
      current = (current + 1) % GACHA_PRIZES.length;
      setHighlightIdx(current);
    }, 90);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      setWonPrize(selectedPrize);
      karmaStore.applyGachaPrize(selectedPrize);
      setProfile(karmaStore.getProfile());

      sound.playGoldenBell();
      triggerHaptic('success');

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e'],
        });
      } catch {
        // ignore
      }

      onShowToast(`🎉 Алтарь даровал: «${selectedPrize.title}»!`, 'success');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl rounded-3xl border border-karma-gold/50 bg-void-950 p-6 shadow-[0_0_60px_rgba(251,191,36,0.2)] my-auto text-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-800 pb-4 text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-karma-gold/20 text-karma-gold border border-karma-gold/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Алтарь Жертвоприношений & Рулетка
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Испытайте благосклонность духов: выбивайте щиты, индульгенции и джекпоты
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-700 bg-void-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prize Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GACHA_PRIZES.map((prize, idx) => {
            const isHighlighted = isSpinning && highlightIdx === idx;
            const isWinner = wonPrize?.id === prize.id;
            return (
              <div
                key={prize.id}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all ${
                  isWinner
                    ? 'border-karma-gold bg-karma-gold/20 shadow-glow-gold scale-105 ring-2 ring-karma-gold'
                    : isHighlighted
                    ? 'border-inferno-500 bg-inferno-500/20 scale-105 shadow-glow-crimson'
                    : 'border-void-800 bg-void-900/80 text-zinc-400'
                }`}
              >
                <span className="text-3xl mb-1.5">{prize.icon}</span>
                <span className="font-heading text-xs font-bold text-white leading-tight">
                  {prize.title}
                </span>
                <span className={`mt-1 text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                  prize.rarity === 'legendary'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                    : prize.rarity === 'epic'
                    ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                    : prize.rarity === 'rare'
                    ? 'border-sky-400 bg-sky-500/20 text-sky-300'
                    : 'border-void-700 bg-void-800 text-zinc-400'
                }`}>
                  {prize.rarity}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spin CTA Button */}
        <div className="mt-6">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-4 rounded-2xl font-heading text-base font-bold text-void-950 transition-all active:scale-95 flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-void-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-karma-gold to-amber-500 shadow-glow-gold hover:brightness-110 hover:scale-[1.02]'
            }`}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-void-950" />
                <span>Духи вращают алтарь...</span>
              </>
            ) : isFreeDaily ? (
              <>
                <Gift className="w-5 h-5 text-void-950" />
                <span>Бесплатное ежедневное вращение</span>
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 text-void-950" />
                <span>Вращать Алтарь за 20 🪙</span>
              </>
            )}
          </button>
        </div>

        {/* User Balance Hint */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 font-mono border-t border-void-800/80 pt-3">
          <span>Баланс: <strong className="text-karma-gold">{profile.coins} 🪙</strong></span>
          <span>Ранг: <strong className="text-amber-300">Ур. {profile.rankLevel}</strong></span>
        </div>
      </motion.div>
    </div>
  );
};
