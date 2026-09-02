'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Crown, 
  Star,
  Share2 
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic, openStarsPayment } from '@/lib/telegram';
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
  const [claimedDaily, setClaimedDaily] = useState(false);

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    setProfile(karmaStore.getProfile());
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuy = (artifact: ShopArtifact) => {
    const result = karmaStore.buyArtifact(artifact);
    if (result.success) {
      sound.playSealStamp();
      triggerHaptic('success');
      try {
        confetti({
          particleCount: 45,
          spread: 65,
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

  const handleToggleGoldenSeal = () => {
    sound.playClick();
    triggerHaptic('medium');
    karmaStore.toggleUseGoldenSeal();
    const updated = karmaStore.getProfile();
    onShowToast(
      updated.useGoldenSealForNext
        ? '👑 Золотая Печать активирована на следующую грамоту!'
        : 'Печать переведена в резерв инвентаря.',
      'info'
    );
  };

  const handleBuyWithStars = (itemId: string, itemName: string, amountToCredit: () => void) => {
    sound.playGoldenBell();
    triggerHaptic('medium');
    openStarsPayment(
      itemId,
      () => {
        amountToCredit();
        sound.playVerdictChime();
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#fbbf24', '#f59e0b', '#38bdf8'],
          });
        } catch {}
        onShowToast(`⭐️ Успешно приобретено: «${itemName}»!`, 'success');
      },
      (errMsg) => {
        onShowToast(errMsg, 'error');
      }
    );
  };

  const handleShareReferral = () => {
    sound.playClick();
    triggerHaptic('light');
    const myId = profile.telegramUser?.id || 'friend';
    const refUrl = `https://t.me/proklinator_bot?start=ref_${myId}`;
    const text = '⚖️ Наслать шуточное проклятие или подарить благословение в Проклинаторе Онлайн:';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    onShowToast('🔗 Ссылка-приглашение открыта в Telegram!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl rounded-3xl border border-karma-gold/40 bg-gradient-to-b from-void-900 to-void-950 p-5 sm:p-6 shadow-[0_0_60px_rgba(251,191,36,0.2)] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-karma-gold/15 text-karma-gold border border-karma-gold/40 shadow-glow-gold">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white tracking-wide">
                Кармическая Лавка & Откуп
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Покупайте зеркальные щиты, индульгенции и золотые печати
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

        {/* User Balance & Daily Bonus Bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-karma-gold/20 bg-void-900/90 p-4 shadow-inner">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl filter drop-shadow">🪙</span>
              <div>
                <div className="font-heading text-xl font-black text-karma-gold leading-tight">
                  {profile.coins} Кармоидов
                </div>
                <div className="text-[11px] text-zinc-400 font-sans">Ваш активный баланс</div>
              </div>
            </div>

            <div className="h-8 w-[1px] bg-void-800 hidden sm:block" />

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
              <Shield className="w-4 h-4" />
              <span>Щитов в запасе: <strong>{profile.activeShields}</strong></span>
            </div>

            {profile.hasGoldenSeal && (
              <button
                onClick={handleToggleGoldenSeal}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl border transition-all ${
                  profile.useGoldenSealForNext
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-glow-gold'
                    : 'border-void-700 bg-void-800 text-zinc-400'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Печать: {profile.useGoldenSealForNext ? 'ВКЛ' : 'ВЫКЛ'}</span>
              </button>
            )}
          </div>

          <button
            onClick={handleClaimDailyBonus}
            disabled={claimedDaily}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 font-heading ${
              claimedDaily
                ? 'border border-void-800 bg-void-850 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-karma-gold to-amber-500 text-void-950 shadow-glow-gold hover:brightness-110 hover:scale-105'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>{claimedDaily ? 'Дар получен ✓' : 'Забрать +15 🪙'}</span>
          </button>
        </div>

        {/* Telegram Stars VIP Offers Banner */}
        <div className="mt-4 rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-heading text-xs font-bold text-yellow-300 uppercase tracking-wider">
                VIP Наборы за Telegram Stars (⭐️)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Мгновенная доставка</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() =>
                handleBuyWithStars('coins_100', '100 Кармоидов 🪙', () => {
                  karmaStore.addCoins(100);
                })
              }
              className="flex items-center justify-between rounded-xl border border-void-800 bg-void-900/80 px-3 py-2 hover:border-amber-400/60 hover:bg-void-850 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <div>
                  <div className="font-heading text-xs font-bold text-white">+100 Кармоидов</div>
                  <div className="text-[10px] text-zinc-400">На спины и лавку</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 font-mono bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-400/40">
                15 ⭐️
              </span>
            </button>

            <button
              onClick={() =>
                handleBuyWithStars('golden_seal_pack', 'Набор Золотых Печатей (x5)', () => {
                  karmaStore.giveGoldenSeal();
                })
              }
              className="flex items-center justify-between rounded-xl border border-void-800 bg-void-900/80 px-3 py-2 hover:border-amber-400/60 hover:bg-void-850 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">👑</span>
                <div>
                  <div className="font-heading text-xs font-bold text-white">Золотая Печать</div>
                  <div className="text-[10px] text-zinc-400">VIP Сургуч на грамоты</div>
                </div>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 font-mono bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-400/40">
                25 ⭐️
              </span>
            </button>
          </div>
        </div>

        {/* Referral Viral Program Card */}
        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🤝</span>
            <div>
              <div className="font-heading text-xs font-bold text-emerald-300">
                Пригласи друга — получи +50 🪙
              </div>
              <div className="text-[10px] text-zinc-400 font-sans">
                За каждого приглашенного друга начисляются кармоиды и зеркальный щит
              </div>
            </div>
          </div>

          <button
            onClick={handleShareReferral}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-95 transition-all font-heading shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Пригласить</span>
          </button>
        </div>

        {/* Artifacts Grid */}
        <div className="mt-4 space-y-3 max-h-[48vh] overflow-y-auto pr-1">
          {SHOP_ARTIFACTS.map((artifact) => {
            const canAfford = profile.coins >= artifact.cost;
            return (
              <div
                key={artifact.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-void-800/90 bg-void-900/60 p-4 transition-all duration-200 hover:border-karma-gold/40 hover:bg-void-900 group"
              >
                <div className="flex items-start gap-3.5">
                  <span className="text-3xl shrink-0 p-2 rounded-2xl bg-void-850 border border-void-800 group-hover:scale-110 transition-transform">
                    {artifact.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                  className={`w-full sm:w-auto shrink-0 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 font-heading shadow-md ${
                    artifact.cost === 0
                      ? 'bg-void-800 text-zinc-200 hover:bg-void-700 border border-void-700'
                      : canAfford
                      ? 'bg-gradient-to-r from-amber-400 via-karma-gold to-amber-500 text-void-950 shadow-glow-gold hover:scale-105'
                      : 'bg-void-800/80 text-zinc-500 border border-void-700/80 cursor-not-allowed'
                  }`}
                >
                  {artifact.cost === 0 ? '☕ Подбросить' : `Купить за ${artifact.cost} 🪙`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="mt-4 border-t border-void-800/80 pt-3 text-center text-[11px] text-zinc-400 font-sans">
          💡 Кармоиды начисляются автоматически: +20 🪙 за благословение и +10 🪙 за проклятие.
        </div>
      </motion.div>
    </div>
  );
};
