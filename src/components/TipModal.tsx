'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Shield, 
  Sparkles, 
  Check, 
  Coins, 
  UserCheck, 
  Crown, 
  Flame, 
  Lock, 
  ToggleLeft, 
  ToggleRight, 
  HelpCircle,
  Package,
  ShoppingBag,
  Zap
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore, SHOP_ARTIFACTS } from '@/lib/karmaStore';
import { ShopArtifact, UserKarmaProfile } from '@/types';
import confetti from 'canvas-confetti';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onRequireAuth?: () => void;
}

export const TipModal: React.FC<TipModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onRequireAuth,
}) => {
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const [activeTab, setActiveTab] = useState<'inventory' | 'shop'>('inventory');

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleBuy = (artifact: ShopArtifact) => {
    if (!profile.isAuthorized) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

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
      setActiveTab('inventory');
    } else {
      triggerHaptic('error');
      onShowToast(result.message, 'error');
    }
  };

  const handleToggleGoldenSeal = () => {
    sound.playClick();
    triggerHaptic('light');
    karmaStore.toggleUseGoldenSeal();
    onShowToast(
      profile.useGoldenSealForNext
        ? 'Золотая печать выключена'
        : '✨ Золотая печать активирована для следующей грамоты!',
      'success'
    );
  };

  const handleUseAbsolution = () => {
    sound.playClick();
    triggerHaptic('medium');
    const ok = karmaStore.useAbsolution();
    if (ok) {
      sound.playGoldenBell();
      onShowToast('🕯️ Индульгенция применена! Вся история в канцелярии очищена.', 'success');
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
              <Package className="w-5 h-5 text-karma-gold" />
            </div>
            <div>
              <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                Инвентарь Способностей & Лавка
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Управляйте вашими щитами, печатями и активируйте купленные артефакты
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

        {/* Tab Buttons: [ 🎒 Инвентарь | 🪙 Лавка ] */}
        <div className="mt-4 flex items-center justify-between border-b border-void-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('inventory');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all font-heading ${
                activeTab === 'inventory'
                  ? 'bg-karma-gold text-void-950 shadow-glow-gold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-void-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Мой Инвентарь</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('shop');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all font-heading ${
                activeTab === 'shop'
                  ? 'bg-karma-gold text-void-950 shadow-glow-gold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-void-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Кармическая Лавка</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs text-karma-gold bg-karma-gold/10 px-3 py-1.5 rounded-xl border border-karma-gold/30">
            <Coins className="w-3.5 h-3.5" />
            <span>Баланс: {profile.coins} 🪙</span>
          </div>
        </div>

        {/* TAB 1: INVENTORY & ABILITY USAGE */}
        {activeTab === 'inventory' && (
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
            {/* Ability 1: Mirror Shield */}
            <div className="flex items-center justify-between rounded-2xl border border-void-800 bg-void-900/70 p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 rounded-xl bg-void-800 border border-void-700">🛡️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-sm font-bold text-white">Зеркальный Щит Кармы</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      В наличии: {profile.activeShields}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-md">
                    <strong>Как работает:</strong> Срабатывает автоматически при входящем проклятии и обращает кару против обидчика.
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono text-emerald-400 font-semibold block">
                  {profile.activeShields > 0 ? '🟢 Авто-защита активна' : '⚪ Нет щитов'}
                </span>
              </div>
            </div>

            {/* Ability 2: Golden Seal */}
            <div className="flex items-center justify-between rounded-2xl border border-void-800 bg-void-900/70 p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 rounded-xl bg-void-800 border border-void-700">👑</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-sm font-bold text-white">Золотая Печать Клерка</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      profile.hasGoldenSeal 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-void-800 text-zinc-500 border-void-700'
                    }`}>
                      {profile.hasGoldenSeal ? 'В наличии: 1' : 'Не куплено'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-md">
                    <strong>Как работает:</strong> Накладывает сияющую золотую печать на создаваемую вами грамоту при следующем обряде.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {profile.hasGoldenSeal ? (
                  <button
                    onClick={handleToggleGoldenSeal}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold font-heading transition-all ${
                      profile.useGoldenSealForNext
                        ? 'bg-amber-400 text-void-950 shadow-glow-gold'
                        : 'border border-void-700 bg-void-800 text-zinc-400'
                    }`}
                  >
                    {profile.useGoldenSealForNext ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    <span>{profile.useGoldenSealForNext ? 'Активна' : 'Выключена'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="rounded-xl border border-karma-gold/40 bg-karma-gold/10 px-3 py-1.5 text-xs font-bold text-karma-gold hover:bg-karma-gold/20 font-heading"
                  >
                    Купить в лавке
                  </button>
                )}
              </div>
            </div>

            {/* Ability 3: Absolution */}
            <div className="flex items-center justify-between rounded-2xl border border-void-800 bg-void-900/70 p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 rounded-xl bg-void-800 border border-void-700">🕯️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-sm font-bold text-white">Астральная Индульгенция</h4>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      profile.hasAbsolution
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : 'bg-void-800 text-zinc-500 border-void-700'
                    }`}>
                      {profile.hasAbsolution ? 'Готова к применению' : 'Не куплено'}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-md">
                    <strong>Как работает:</strong> Мгновенно обнуляет полученные кары и очищает астральное досье.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {profile.hasAbsolution ? (
                  <button
                    onClick={handleUseAbsolution}
                    className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 font-heading"
                  >
                    Применить
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="rounded-xl border border-karma-gold/40 bg-karma-gold/10 px-3 py-1.5 text-xs font-bold text-karma-gold hover:bg-karma-gold/20 font-heading"
                  >
                    Купить в лавке
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHOP CATALOG */}
        {activeTab === 'shop' && (
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
                      {isFree ? 'Пожертвовать' : 'Купить'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};
