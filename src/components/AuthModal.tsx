'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Lock, Send, Sparkles, Check, ArrowRight, UserCheck } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic, getTelegramUser, isTelegramWebApp } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { TelegramUserData } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [isTMA, setIsTMA] = useState(false);
  const [detectedUser, setDetectedUser] = useState<TelegramUserData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const inApp = isTelegramWebApp();
      setIsTMA(inApp);
      const user = getTelegramUser();
      if (user) {
        setDetectedUser(user);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuthorizeMiniApp = () => {
    if (!detectedUser) return;
    sound.playGoldenBell();
    triggerHaptic('success');
    karmaStore.authorizeWithTelegram(detectedUser);
    onShowToast(`🎉 Добро пожаловать, ${detectedUser.first_name}! Авторизация успешна.`, 'success');
    if (onSuccess) onSuccess();
    onClose();
  };

  const handleOpenBotAuth = () => {
    sound.playClick();
    triggerHaptic('medium');
    const botUrl = `https://t.me/karma_chancellery_bot?start=web_auth`;
    window.open(botUrl, '_blank');
    onShowToast('Перейдите в бота @karma_chancellery_bot и нажмите Запустить', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md rounded-3xl border border-karma-gold/50 bg-void-950 p-6 shadow-[0_0_60px_rgba(251,191,36,0.2)] my-auto text-center"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg border border-void-700 bg-void-900 text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock / Security Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400/20 via-karma-gold/20 to-emerald-400/20 border border-karma-gold/40 shadow-glow-gold mb-4">
          <ShieldCheck className="h-8 w-8 text-karma-gold animate-pulse" />
        </div>

        <h3 className="font-heading text-xl font-bold text-white tracking-tight">
          Авторизация через Telegram
        </h3>

        <p className="mt-2 text-xs text-zinc-400 font-sans leading-relaxed">
          Безопасный вход без паролей. Авторизация открывает доступ к созданию <strong>Сквадов</strong>,{' '}
          <strong>Рулетке Алтаря</strong>, покупке <strong>Щитов</strong> и сохранению прогресса.
        </p>

        {/* Guest Mode Notice */}
        <div className="mt-4 rounded-2xl border border-void-800 bg-void-900/60 p-3.5 text-left text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
            <Check className="w-3.5 h-3.5" />
            <span>Гостевой режим:</span>
          </div>
          <p className="text-[11px] text-zinc-400 font-sans">
            Создание и отправка разовых проклятий и благословений доступна всем без авторизации.
          </p>
        </div>

        {/* Auth CTA Actions */}
        <div className="mt-6 space-y-3">
          {detectedUser ? (
            <button
              onClick={handleAuthorizeMiniApp}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-karma-gold to-amber-500 text-void-950 font-heading text-sm font-bold shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Войти как {detectedUser.first_name}</span>
            </button>
          ) : (
            <button
              onClick={handleOpenBotAuth}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-heading text-sm font-bold shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Войти через Telegram-бота</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2.5 text-xs text-zinc-500 hover:text-zinc-300 font-sans"
          >
            Продолжить как Гость
          </button>
        </div>
      </motion.div>
    </div>
  );
};
