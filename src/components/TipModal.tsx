'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Shield, Sparkles, Heart, Flame, Check } from 'lucide-react';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const SACRIFICES = [
  {
    id: 'candle',
    icon: '🕯️',
    title: 'Астральная свеча за 0₽',
    description: 'Очищает ауру от чужих проклятий на 24 часа. Бесплатно по полису кармического ОМС.',
    badge: 'Священный огонь',
    actionText: 'Зажечь свечу',
  },
  {
    id: 'coffee',
    icon: '☕',
    title: 'Тройной эспрессо Архивариусу',
    description: 'Чтобы клерк канцелярии быстрее подписывал ваши прошения и терял жалобы на вас.',
    badge: 'Энергетик бездны',
    actionText: 'Подбросить кофе',
  },
  {
    id: 'shield',
    icon: '🛡️',
    title: 'Зеркальный щит от сглаза',
    description: 'Все проклятия коллег и бывших автоматически рикошетят обратно отправителю.',
    badge: 'Кармическая броня',
    actionText: 'Активировать щит',
  },
];

export const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [selectedSacrifice, setSelectedSacrifice] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSacrifice = (title: string) => {
    sound.playSealStamp();
    setIsDone(true);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#8b5cf6'],
      });
    } catch {
      // ignore
    }

    onShowToast(`✨ Жертвоприношение "${title}" принято канцелярией!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg rounded-3xl border border-karma-gold/40 bg-void-950 p-6 shadow-glow-gold"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-800 pb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-karma-gold" />
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              Откуп от кармы & Поддержка клерков
            </h3>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
              setIsDone(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-700 bg-void-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {!isDone ? (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Кармическая канцелярия работает без перерывов на обед. Выберите форму подношения, чтобы задобрить духов бюрократии или очистить свою историю.
            </p>

            <div className="space-y-3">
              {SACRIFICES.map((sac) => (
                <div
                  key={sac.id}
                  onClick={() => setSelectedSacrifice(sac.id)}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all cursor-pointer ${
                    selectedSacrifice === sac.id
                      ? 'border-karma-gold bg-karma-gold/10 shadow-glow-gold'
                      : 'border-void-800 bg-void-900 hover:border-void-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{sac.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-xs sm:text-sm font-bold text-white">
                          {sac.title}
                        </h4>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-400 leading-snug font-sans">
                        {sac.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSacrifice(sac.title);
                    }}
                    className="w-full sm:w-auto shrink-0 rounded-xl bg-gradient-to-r from-karma-amber to-karma-gold px-3.5 py-2 text-xs font-bold text-void-950 hover:brightness-110 active:scale-95 transition-all font-heading"
                  >
                    {sac.actionText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-karma-gold/20 text-karma-gold border border-karma-gold/40">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-heading text-lg sm:text-xl font-bold text-white">
              Индульгенция активирована!
            </h4>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed font-sans">
              Ваша кармическая квота пополнена. Все негативные вибрации перенаправлены в отдел утилизации астрального мусора.
            </p>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
                setIsDone(false);
              }}
              className="mt-4 rounded-xl bg-void-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-void-700 transition-colors font-heading"
            >
              Вернуться к алтарю
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
