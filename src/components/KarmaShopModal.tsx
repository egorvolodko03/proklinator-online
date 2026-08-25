'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Sparkles, 
  Coins, 
  Check, 
  Flame, 
  Sun, 
  Coffee, 
  Gift, 
  Zap,
  ShoppingBag,
  Eye,
  Crown
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore, SHOP_ARTIFACTS } from '@/lib/karmaStore';
import { ShopArtifact, UserKarmaProfile } from '@/types';
import confetti from 'canvas-confetti';

interface KarmaShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const KarmaShopModal: React.FC<KarmaShopModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const [activeTab, setActiveTab] = useState<'shop' | 'inventory'>('shop');
  const [claimedDaily, setClaimedDaily] = useState(false);

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleBuy = (artifact: ShopArtifact) => {
    const result = karmaStore.buyArtifact(artifact);
    if (result.success) {
      sound.playSealStamp();
      triggerHaptic('success');
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#8b5cf6', '#10b981'],
        });
      } catch {
        // ignore
      }
      onShowToast(result.message, 'success');
    } else {
      sound.playClick();
      triggerHaptic('error');
      onShowToast(result.message, 'error');
    }
  };

  const handleClaimDailyBonus = () => {
    if (claimedDaily) return;
    sound.playGoldenBell();
    triggerHaptic('success');
    karmaStore.addCoins(15);
    setClaimedDaily(true);
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b'],
      });
    } catch {
      // ignore
    }
    onShowToast('🎁 Ежедневный дар канцелярии (+15 🪙) получен!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl rounded-3xl border border-karma-gold/40 bg-void-950 p-6 shadow-[0_0_50px_rgba(251,191,36,0.15)] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-karma-gold/15 text-karma-gold border border-karma-gold/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Кармическая Лавка & Откуп
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Покупайте зеркальные щиты, индульгенции и управляйте защитой ауры
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

        {/* User Balance & Daily Bonus Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-void-800 bg-void-900/90 p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div>
                <div className="font-heading text-xl font-black text-karma-gold leading-tight">
                  {profile.coins} Кармоидов
                </div>
                <div className="text-[11px] text-zinc-400 font-sans">Ваш баланс за добрые дела и визиты</div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-void-800 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Щитов: <strong>{profile.activeShields}</strong></span>
            </div>
          </div>

          <button
            onClick={handleClaimDailyBonus}
            disabled={claimedDaily}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 font-heading ${
              claimedDaily
                ? 'border border-void-800 bg-void-850 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-karma-amber to-karma-gold text-void-950 shadow-glow-gold hover:brightness-110'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{claimedDaily ? 'Дар получен ✓' : 'Забрать +15 🪙'}</span>
          </button>
        </div>

        {/* Artifacts Grid */}
        <div className="mt-5 space-y-3">
          {SHOP_ARTIFACTS.map((artifact) => {
            const canAfford = profile.coins >= artifact.cost;
            return (
              <div
                key={artifact.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-void-800 bg-void-900/60 p-4 transition-all hover:border-void-700 hover:bg-void-900 group"
              >
                <div className="flex items-start gap-3.5">
                  <span className="text-3xl shrink-0 p-1 rounded-xl bg-void-850 border border-void-800">
                    {artifact.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-heading text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
                        {artifact.title}
                      </h4>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${artifact.badgeColor}`}>
                        {artifact.badge}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-md">
                      {artifact.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleBuy(artifact)}
                  disabled={!canAfford && artifact.cost > 0}
                  className={`w-full sm:w-auto shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 font-heading ${
                    artifact.cost === 0
                      ? 'bg-void-800 text-zinc-200 hover:bg-void-700'
                      : canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-karma-gold text-void-950 shadow-glow-gold hover:scale-105'
                      : 'bg-void-800/80 text-zinc-500 border border-void-700 cursor-not-allowed'
                  }`}
                >
                  {artifact.cost === 0 ? '☕ Подбросить' : `Купить за ${artifact.cost} 🪙`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="mt-5 border-t border-void-800/80 pt-3 text-center text-[11px] text-zinc-500 font-sans">
          💡 Кармоиды начисляются автоматически: +20 🪙 за отправку благословения и +10 🪙 за проклятие.
        </div>
      </motion.div>
    </div>
  );
};
