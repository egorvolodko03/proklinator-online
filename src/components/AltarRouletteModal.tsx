'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Coins, Gift, Flame, Trophy, Check, RefreshCw, Lock, Clock, Award } from 'lucide-react';
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
  onRequireAuth?: () => void;
}

export const AltarRouletteModal: React.FC<AltarRouletteModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRequireAuth,
}) => {
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<GachaPrize | null>(null);
  const [highlightIdx, setHighlightIdx] = useState<number>(0);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    setProfile(karmaStore.getProfile());
    return () => {
      unsub();
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const todayStr = new Date().toDateString();
  const isFreeDaily = profile.lastDailySpinDate !== todayStr;
  const spinCost = isFreeDaily ? 0 : 20;

  const handleSpin = () => {
    if (!profile.isAuthorized) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (isSpinning) return;
    if (spinCost > 0 && profile.coins < spinCost) {
      sound.playClick();
      triggerHaptic('error');
      onShowToast('Недостаточно Кармоидов 🪙 для вращения алтаря!', 'error');
      return;
    }

    if (isFreeDaily) {
      karmaStore.recordDailySpin();
    } else {
      karmaStore.addCoins(-spinCost);
    }

    setIsSpinning(true);
    setWonPrize(null);
    sound.playDiceRoll();
    triggerHaptic('medium');

    const selectedPrize = spinRoulette();
    const winningIndex = GACHA_PRIZES.findIndex((p) => p.id === selectedPrize.id);

    // Realistic roulette deceleration algorithm
    const totalSteps = 24 + (winningIndex >= 0 ? winningIndex : 0);
    let currentStep = 0;
    let delay = 50;

    const runStep = () => {
      currentStep++;
      setHighlightIdx(currentStep % GACHA_PRIZES.length);
      sound.playClick();

      if (currentStep < totalSteps) {
        // Gradually increase delay as it approaches the end (deceleration)
        if (currentStep > totalSteps - 10) {
          delay += 35;
        } else if (currentStep > totalSteps - 5) {
          delay += 60;
        } else {
          delay = Math.min(delay + 3, 140);
        }
        animTimerRef.current = setTimeout(runStep, delay);
      } else {
        // Landed on winner
        setIsSpinning(false);
        setWonPrize(selectedPrize);
        karmaStore.applyGachaPrize(selectedPrize);
        setProfile(karmaStore.getProfile());

        sound.playGoldenBell();
        triggerHaptic('success');

        try {
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e'],
          });
        } catch {
          // ignore
        }

        onShowToast(`🎉 Алтарь даровал: «${selectedPrize.title}»!`, 'success');
      }
    };

    animTimerRef.current = setTimeout(runStep, delay);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-xl rounded-3xl border border-karma-gold/40 bg-gradient-to-b from-void-900 to-void-950 p-5 sm:p-6 shadow-[0_0_80px_rgba(251,191,36,0.25)] my-auto text-center"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-800/80 pb-4 text-left">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-karma-gold/30 to-amber-900/40 text-karma-gold border border-karma-gold/50 shadow-glow-gold">
              <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white tracking-wide">
                Алтарь Жертвоприношений & Рулетка
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Испытайте милость духов: выбивайте зеркальные щиты, печати и кармоиды
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-void-700 bg-void-900 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prize Grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {GACHA_PRIZES.map((prize, idx) => {
            const isHighlighted = isSpinning && highlightIdx === idx;
            const isWinner = !isSpinning && wonPrize?.id === prize.id;

            return (
              <div
                key={prize.id}
                className={`relative flex flex-col items-center justify-center rounded-2xl border p-3.5 transition-all duration-150 ${
                  isWinner
                    ? 'border-karma-gold bg-gradient-to-b from-karma-gold/30 to-void-900 shadow-[0_0_30px_rgba(251,191,36,0.6)] scale-105 ring-2 ring-karma-gold z-10'
                    : isHighlighted
                    ? 'border-inferno-500 bg-inferno-500/25 scale-105 shadow-[0_0_25px_rgba(239,68,68,0.5)] z-10'
                    : 'border-void-800/80 bg-void-900/60 text-zinc-400 hover:border-void-700'
                }`}
              >
                <span className="text-3xl sm:text-4xl mb-1.5 filter drop-shadow-md transform transition-transform hover:scale-110">
                  {prize.icon}
                </span>
                <span className="font-heading text-xs font-bold text-white leading-tight min-h-[30px] flex items-center justify-center">
                  {prize.title}
                </span>
                <span
                  className={`mt-1.5 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border tracking-wider font-semibold ${
                    prize.rarity === 'legendary'
                      ? 'border-amber-400/80 bg-amber-500/20 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      : prize.rarity === 'epic'
                      ? 'border-purple-400/80 bg-purple-500/20 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : prize.rarity === 'rare'
                      ? 'border-sky-400/80 bg-sky-500/20 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
                      : 'border-void-700 bg-void-800 text-zinc-400'
                  }`}
                >
                  {prize.rarity}
                </span>
              </div>
            );
          })}
        </div>

        {/* Won Prize Celebration Alert */}
        <AnimatePresence>
          {wonPrize && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-4 rounded-2xl border border-karma-gold/60 bg-gradient-to-r from-karma-gold/15 via-amber-500/10 to-karma-gold/15 p-3 flex items-center justify-center gap-2.5 shadow-glow-gold"
            >
              <Award className="w-5 h-5 text-karma-gold animate-bounce" />
              <div className="text-xs font-heading font-bold text-amber-200">
                Духи благословили вас: <strong className="text-white">«{wonPrize.title}»</strong>! Награда зачислена.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin CTA Button */}
        <div className="mt-5">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-heading text-sm sm:text-base font-bold text-void-950 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg ${
              isSpinning
                ? 'bg-void-800 text-zinc-500 cursor-not-allowed border border-void-700'
                : isFreeDaily
                ? 'bg-gradient-to-r from-emerald-400 via-karma-gold to-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:brightness-110 hover:scale-[1.01]'
                : 'bg-gradient-to-r from-amber-400 via-karma-gold to-amber-500 shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:brightness-110 hover:scale-[1.01]'
            }`}
          >
            {isSpinning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-void-950" />
                <span>Духи вращают алтарь...</span>
              </>
            ) : isFreeDaily ? (
              <>
                <Gift className="w-5 h-5 text-void-950 animate-bounce" />
                <span>Бесплатное ежедневное вращение (1/1)</span>
              </>
            ) : (
              <>
                <Coins className="w-5 h-5 text-void-950" />
                <span>Вращать Алтарь за 20 🪙 (Бесплатное завтра)</span>
              </>
            )}
          </button>

          {!isFreeDaily && (
            <div className="mt-2 text-[11px] text-zinc-400 font-sans flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-karma-gold" />
              <span>Бесплатное вращение обновится в 00:00 (МСК)</span>
            </div>
          )}
        </div>

        {/* User Balance Hint */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 font-mono border-t border-void-800/80 pt-3">
          <span>Баланс: <strong className="text-karma-gold font-bold">{profile.coins} 🪙</strong></span>
          <span>Ранг: <strong className="text-amber-300 font-bold">Ур. {profile.rankLevel}</strong></span>
        </div>
      </motion.div>
    </div>
  );
};
