'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Shield, Sparkles, Heart, Flame, Check, Coins, UserCheck, AtSign, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore, SHOP_ARTIFACTS } from '@/lib/karmaStore';
import { ShopArtifact, UserKarmaProfile } from '@/types';
import confetti from 'canvas-confetti';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const [selectedArtifact, setSelectedArtifact] = useState<ShopArtifact | null>(null);
  const [authUsername, setAuthUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleBuy = (artifact: ShopArtifact) => {
    sound.playClick();
    triggerHaptic('medium');
    const result = karmaStore.buyArtifact(artifact);

    if (result.success) {
      sound.playGoldenBell();
      triggerHaptic('success');
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#10b981'],
        });
      } catch {
        // ignore
      }
      onShowToast(result.message, 'success');
      setSelectedArtifact(artifact);
    } else {
      triggerHaptic('error');
      onShowToast(result.message, 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsername.trim()) return;

    setIsSyncing(true);
    sound.playClick();
    triggerHaptic('medium');

    const res = await karmaStore.loginWithUsername(authUsername);
    setIsSyncing(false);

    if (res.success) {
      sound.playGoldenBell();
      triggerHaptic('success');
      onShowToast(res.message, 'success');
    } else {
      triggerHaptic('error');
      onShowToast(res.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl rounded-3xl border border-karma-gold/50 bg-void-950 p-5 sm:p-6 shadow-[0_0_60px_rgba(251,191,36,0.15)] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-karma-gold/20 text-karma-gold border border-karma-gold/40">
              <Shield className="w-5 h-5 text-karma-gold" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                Кармическая Лавка & Защитные Артефакты
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Управляйте балансом Кармоидов 🪙 и защищайтесь зеркальными щитами
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

        {/* Telegram Profile Sync Bar */}
        <div className="mt-4 rounded-2xl border border-void-800 bg-void-900/80 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Баланс профиля: <strong className="text-karma-gold font-mono text-sm">{profile.coins} 🪙</strong> • 
              Щиты: <strong className="text-emerald-400 font-mono text-sm">{profile.activeShields}</strong>
            </span>
          </div>

          {/* Quick Telegram Username Login */}
          <form onSubmit={handleLogin} className="flex items-center gap-1.5">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-xs">@</span>
              <input
                type="text"
                value={authUsername}
                onChange={(e) => setAuthUsername(e.target.value)}
                placeholder="ваш_username"
                className="w-36 rounded-lg border border-void-700 bg-void-950 pl-6 pr-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isSyncing}
              className="rounded-lg bg-void-800 hover:bg-karma-gold hover:text-void-950 px-3 py-1.5 text-xs font-bold text-zinc-200 transition-all font-heading"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Войти'}
            </button>
          </form>
        </div>

        {/* Artifacts Catalog Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {SHOP_ARTIFACTS.map((artifact) => {
            const isFree = artifact.cost === 0;
            const canAfford = isFree || profile.coins >= artifact.cost;

            return (
              <div
                key={artifact.id}
                className="flex flex-col justify-between rounded-2xl border border-void-800 bg-void-900/60 p-3.5 hover:border-void-700 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-2xl">{artifact.icon}</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${artifact.badgeColor}`}>
                      {artifact.badge}
                    </span>
                  </div>

                  <h4 className="font-heading text-sm font-bold text-white mb-1">
                    {artifact.title}
                  </h4>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {artifact.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-void-800/80 pt-2.5">
                  <span className="font-mono text-xs font-bold text-karma-gold">
                    {isFree ? 'Бесплатно' : `${artifact.cost} 🪙`}
                  </span>

                  <button
                    onClick={() => handleBuy(artifact)}
                    disabled={!canAfford}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all font-heading ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-400 to-karma-gold text-void-950 shadow-glow-gold hover:scale-105 active:scale-95'
                        : 'bg-void-800 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    {isFree ? 'Пожертвовать' : 'Активировать'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
