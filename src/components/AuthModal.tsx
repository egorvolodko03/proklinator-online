'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck, Send, Check, UserCheck, RefreshCw, Lock } from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic, getTelegramUser, isTelegramWebApp } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { TelegramUserData } from '@/types';
import confetti from 'canvas-confetti';

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
  const [sessionToken, setSessionToken] = useState<string>('');
  const [isWaitingForBot, setIsWaitingForBot] = useState(false);
  const [isVerifyingWidget, setIsVerifyingWidget] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSuccessfulAuth = (user: TelegramUserData) => {
    sound.playGoldenBell();
    triggerHaptic('success');
    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#10b981'],
      });
    } catch {
      // ignore
    }
    karmaStore.authorizeWithTelegram(user);
    onShowToast(`🎉 Вы успешно авторизованы как ${user.first_name}!`, 'success');
    if (onSuccess) onSuccess();
    onClose();
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const inApp = isTelegramWebApp();
      setIsTMA(inApp);
      const user = getTelegramUser();
      if (user) {
        setDetectedUser(user);
        // Auto-authorize if opened inside Telegram
        handleSuccessfulAuth(user);
        return;
      }

      // Generate session token for browser auth
      const token = 'auth_' + Math.random().toString(36).substring(2, 10);
      setSessionToken(token);
      setIsWaitingForBot(false);

      // Start polling for bot confirmation
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/auth/session?token=${token}`);
          const data = await res.json();
          if (data.success && data.status === 'authenticated' && data.user) {
            clearInterval(interval);
            handleSuccessfulAuth(data.user);
          }
        } catch {
          // ignore
        }
      }, 1500);

      pollIntervalRef.current = interval;

      // Define global widget callback
      (window as any).onTelegramAuthCallback = async (authData: any) => {
        try {
          setIsVerifyingWidget(true);
          const res = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authData }),
          });
          const result = await res.json();
          if (result.success && result.user) {
            handleSuccessfulAuth(result.user);
          } else {
            onShowToast(result.error || 'Ошибка проверки Telegram виджета', 'error');
          }
        } catch {
          onShowToast('Ошибка связи с сервером авторизации', 'error');
        } finally {
          setIsVerifyingWidget(false);
        }
      };

      // Dynamically mount official Telegram Web Widget
      if (widgetContainerRef.current) {
        widgetContainerRef.current.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', 'karma_chancellery_bot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '12');
        script.setAttribute('data-onauth', 'onTelegramAuthCallback(user)');
        script.setAttribute('data-request-access', 'write');
        script.async = true;
        widgetContainerRef.current.appendChild(script);
      }

      return () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuthorizeMiniApp = () => {
    if (!detectedUser) return;
    handleSuccessfulAuth(detectedUser);
  };

  const handleOpenBotAuth = () => {
    sound.playClick();
    triggerHaptic('medium');
    setIsWaitingForBot(true);
    const botUrl = `https://t.me/karma_chancellery_bot?start=${sessionToken}`;
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
          Безопасный вход с криптографической верификацией подписи. Доступ к <strong>Сквадам</strong>,{' '}
          <strong>Рулетке Алтаря</strong>, покупке <strong>Щитов</strong> и сохранению прогресса.
        </p>

        {/* Live sync indicator when waiting for bot confirmation */}
        {isWaitingForBot && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
            <span>Ожидаем нажатия «Запустить» в боте...</span>
          </div>
        )}

        {isVerifyingWidget && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
            <span>Проверка криптографической подписи Telegram...</span>
          </div>
        )}

        {/* Auth CTA Actions */}
        <div className="mt-6 space-y-3.5">
          {detectedUser ? (
            <button
              onClick={handleAuthorizeMiniApp}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-karma-gold to-amber-500 text-void-950 font-heading text-sm font-bold shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all"
            >
              <UserCheck className="w-4 h-4" />
              <span>Войти как {detectedUser.first_name}</span>
            </button>
          ) : (
            <>
              {/* Method 1: Official Telegram Web Login Widget Button */}
              <div className="flex flex-col items-center justify-center min-h-[44px]">
                <div ref={widgetContainerRef} className="flex justify-center" />
              </div>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-void-800 w-full" />
                <span className="bg-void-950 px-2 text-[10px] uppercase font-mono text-zinc-500 shrink-0">
                  или через бота
                </span>
                <div className="border-t border-void-800 w-full" />
              </div>

              {/* Method 2: Direct Bot Auth with Live Sync */}
              <button
                onClick={handleOpenBotAuth}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-heading text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(14,165,233,0.35)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isWaitingForBot ? 'Открыть @karma_chancellery_bot снова' : 'Войти в 1 клик через бота'}</span>
              </button>
            </>
          )}

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-2 text-xs text-zinc-500 hover:text-zinc-300 font-sans"
          >
            Продолжить в гостевом режиме
          </button>
        </div>
      </motion.div>
    </div>
  );
};
