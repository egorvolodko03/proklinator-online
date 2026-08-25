'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Send, RotateCcw, Flame, Sun, Check, ShieldAlert, Sparkles, Heart } from 'lucide-react';
import { DecreeVerdict } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { toPng } from 'html-to-image';

interface CurseCertificateProps {
  verdict: DecreeVerdict;
  onReset: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

export const CurseCertificate: React.FC<CurseCertificateProps> = ({
  verdict,
  onReset,
  onShowToast,
}) => {
  const certRef = useRef<HTMLDivElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isDark = verdict.realm === 'dark';
  const categoryInfo = CATEGORY_LABELS[verdict.category] || CATEGORY_LABELS.other;

  // Clean, short share URL with dynamic OG metadata
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const url = new URL(`${origin}/c/${verdict.id}`);
    url.searchParams.set('realm', verdict.realm);
    url.searchParams.set('name', verdict.targetName);
    if (verdict.telegramUsername) {
      url.searchParams.set('tg', verdict.telegramUsername);
    }
    url.searchParams.set('cat', verdict.category);
    url.searchParams.set('sin', verdict.actionText);
    url.searchParams.set('curse', verdict.verdictText);
    url.searchParams.set('title', verdict.verdictTitle);
    url.searchParams.set('sev', verdict.tier);
    return url.toString();
  };

  const handleCopyLink = async () => {
    sound.playClick();
    triggerHaptic('light');
    const shareUrl = getShareUrl();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setIsCopied(true);
      onShowToast('🔗 Ссылка на грамоту скопирована!', 'success');
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      onShowToast('Не удалось скопировать ссылку', 'error');
    }
  };

  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    sound.playClick();
    triggerHaptic('medium');
    setIsDownloading(true);
    onShowToast('📜 Формируем грамоту в высоком разрешении...', 'info');

    try {
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#09090b',
      });

      const link = document.createElement('a');
      link.download = `${isDark ? 'Gramota-Karmy' : 'Gramota-Blagodati'}-${verdict.targetName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      sound.playVerdictChime();
      triggerHaptic('success');
      onShowToast('✨ Грамота успешно сохранена в PNG!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('Ошибка при сохранении грамоты', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Clean Telegram Share:
   * Uses short URL with dynamic OG card image preview
   */
  const handleShareTelegram = () => {
    sound.playClick();
    triggerHaptic('medium');
    const shareUrl = getShareUrl();

    let formattedText = '';
    if (isDark) {
      formattedText = 
        `⚖️ ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ\n` +
        `📜 Официальный приговор гражданину: «${verdict.targetName}»\n\n` +
        `⚡ Вменяемое деяние:\n` +
        `«${verdict.actionText}»\n\n` +
        `🩸 Приговор Канцелярии:\n` +
        `«${verdict.verdictText}»\n\n` +
        `🔗 Посмотреть заверенную грамоту:`;
    } else {
      formattedText = 
        `✨ НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ\n` +
        `📜 Астральная грамота признания: «${verdict.targetName}»\n\n` +
        `🌟 Доброе деяние:\n` +
        `«${verdict.actionText}»\n\n` +
        `🕊️ Благословение Канцелярии:\n` +
        `«${verdict.verdictText}»\n\n` +
        `🔗 Посмотреть сияющую грамоту:`;
    }

    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(formattedText)}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center py-4">
      {/* Certificate Frame */}
      <div className="w-full max-w-xl p-2 sm:p-4">
        <div
          ref={certRef}
          className={`relative overflow-hidden rounded-3xl border-2 p-6 sm:p-8 text-neutral-100 transition-all ${
            isDark
              ? 'border-karma-gold/50 bg-gradient-to-b from-void-900 via-void-950 to-void-900 shadow-[0_0_50px_rgba(251,191,36,0.15)]'
              : 'border-amber-400/60 bg-gradient-to-b from-slate-900 via-void-950 to-slate-900 shadow-[0_0_50px_rgba(251,191,36,0.25)]'
          }`}
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2.5 left-3 text-karma-gold/50 text-xs font-mono select-none">❖ ━━━━</div>
          <div className="absolute top-2.5 right-3 text-karma-gold/50 text-xs font-mono select-none">━━━━ ❖</div>
          <div className="absolute bottom-2.5 left-3 text-karma-gold/50 text-xs font-mono select-none">❖ ━━━━</div>
          <div className="absolute bottom-2.5 right-3 text-karma-gold/50 text-xs font-mono select-none">━━━━ ❖</div>

          {/* Background Watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
            {isDark ? (
              <svg viewBox="0 0 100 100" className="h-96 w-96 text-white">
                <polygon points="50,5 62,38 97,38 69,59 79,93 50,72 21,93 31,59 3,38 38,38" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 100 100" className="h-96 w-96 text-amber-200">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            )}
          </div>

          {/* Certificate Header */}
          <div className="text-center border-b border-karma-gold/20 pb-5">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[10px] font-semibold tracking-wider uppercase mb-2 font-mono ${
              isDark
                ? 'border-karma-gold/30 bg-karma-gold/10 text-karma-gold'
                : 'border-amber-400/40 bg-amber-400/15 text-amber-300'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{isDark ? 'Отдел Кармического Возмездия №666' : 'Отдел Небесной Благодати & Добра'}</span>
            </div>
            <h2 className={`font-heading text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text uppercase drop-shadow-sm ${
              isDark
                ? 'bg-gradient-to-r from-karma-gold via-amber-200 to-karma-gold'
                : 'bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300'
            }`}>
              {isDark ? 'Грамота Проклятия' : 'Грамота Благодати'}
            </h2>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              ДЕЛО {verdict.caseNumber} • ОТ {verdict.createdAt}
            </p>
          </div>

          {/* Certificate Body */}
          <div className="mt-6 space-y-4 text-sm">
            {/* Target Field */}
            <div className="rounded-xl border border-void-700 bg-void-850/70 p-3.5 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-zinc-400 font-mono text-[10px]">
                  {isDark ? 'Субъект кармы:' : 'Адресат благодати:'}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-void-700/80 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {verdict.targetName}
                </p>
                {verdict.telegramUsername && (
                  <span className="font-mono text-xs text-astral-400 bg-astral-500/10 border border-astral-500/20 px-2 py-0.5 rounded-lg">
                    @{verdict.telegramUsername}
                  </span>
                )}
              </div>
            </div>

            {/* Action/Reason Field */}
            <div className="rounded-xl border border-void-700 bg-void-850/70 p-3.5 backdrop-blur-sm">
              <span className={`block text-[10px] font-semibold uppercase tracking-wider mb-1 font-mono ${
                isDark ? 'text-inferno-400' : 'text-emerald-400'
              }`}>
                {isDark ? 'Вменяемое деяние (Грех):' : 'Зафиксированный подвиг (Добро):'}
              </span>
              <p className="text-sm sm:text-base text-zinc-200 italic leading-relaxed font-sans">
                «{verdict.actionText}»
              </p>
            </div>

            {/* Punishment / Blessing Box */}
            <div className={`rounded-xl border-2 p-4 relative ${
              isDark
                ? 'border-inferno-500/50 bg-gradient-to-br from-inferno-950/40 via-void-900 to-void-950 shadow-glow-crimson'
                : 'border-amber-400/50 bg-gradient-to-br from-amber-950/30 via-void-900 to-void-950 shadow-glow-gold'
            }`}>
              <div className="flex items-center gap-2 mb-1.5">
                {isDark ? <ShieldAlert className="w-4 h-4 text-inferno-400" /> : <Heart className="w-4 h-4 text-amber-300" />}
                <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-inferno-400' : 'text-amber-300'
                }`}>
                  {isDark ? 'Приговор Канцелярии:' : 'Благословение Небес:'}
                </span>
                <span className={`ml-auto text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                  isDark
                    ? 'bg-inferno-500/20 text-inferno-300 border-inferno-500/40'
                    : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                }`}>
                  {isDark ? '⚡ Исполнению подлежит' : '✨ Навечно закреплено'}
                </span>
              </div>
              <h4 className={`font-heading text-base sm:text-lg font-bold mb-1 ${
                isDark ? 'text-yellow-300' : 'text-amber-200'
              }`}>
                {verdict.verdictTitle}
              </h4>
              <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed font-sans">
                {verdict.verdictText}
              </p>
            </div>
          </div>

          {/* Footer with Seal */}
          <div className="mt-6 flex items-center justify-between border-t border-karma-gold/20 pt-4">
            <div className="text-left">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Секретарь канцелярии:</div>
              <div className="font-heading text-sm sm:text-base font-bold text-amber-200 leading-tight">
                {verdict.clerkSignature}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                  Печать активна в астрале
                </span>
              </div>
            </div>

            {/* Glowing Wax/Gold Seal */}
            <div className="relative flex items-center justify-center">
              <div className={`relative h-16 w-16 rounded-full p-1 ring-2 transform rotate-12 ${
                isDark
                  ? 'bg-gradient-to-br from-red-600 via-inferno-600 to-red-900 shadow-[0_0_20px_rgba(220,38,38,0.7)] ring-yellow-400/40'
                  : 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 shadow-glow-gold ring-amber-200/60'
              }`}>
                <div className={`flex h-full w-full items-center justify-center rounded-full border border-dashed text-center ${
                  isDark ? 'border-yellow-200/50 bg-red-800' : 'border-yellow-950/40 bg-amber-500'
                }`}>
                  <div className={`text-[9px] font-black uppercase tracking-tighter font-heading ${
                    isDark ? 'text-yellow-200' : 'text-yellow-950'
                  }`}>
                    <div>{isDark ? 'КАРМА' : 'ДОБРО'}</div>
                    {isDark ? <Flame className="w-3.5 h-3.5 mx-auto text-yellow-300" /> : <Sun className="w-3.5 h-3.5 mx-auto text-yellow-950" />}
                    <div>{isDark ? '666' : '777'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Barcode */}
          <div className="mt-4 flex items-center justify-between text-[9px] font-mono text-zinc-500 border-t border-void-800 pt-2">
            <span className="tracking-widest">||||| | |||| ||| |||||| |||| |</span>
            <span>CHANCELLERY-VERIFIED-HASH-{verdict.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 max-w-lg px-4">
        {/* Share to Telegram */}
        <button
          onClick={handleShareTelegram}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all hover:scale-105 active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>Отправить в Telegram</span>
        </button>

        {/* Download PNG Certificate */}
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
            isDark
              ? 'bg-gradient-to-r from-inferno-600 to-inferno-500 shadow-glow-crimson'
              : 'bg-gradient-to-r from-amber-500 to-emerald-500 shadow-glow-gold text-void-950'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Сохранение...' : 'Скачать грамоту'}</span>
        </button>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 rounded-xl border border-void-700 bg-void-850 px-4 py-3 text-sm font-semibold text-zinc-200 shadow-md transition-all hover:border-astral-500 hover:text-white active:scale-95"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-astral-400" />}
          <span>{isCopied ? 'Скопировано!' : 'Скопировать ссылку'}</span>
        </button>

        {/* Reset / Create another */}
        <button
          onClick={() => {
            sound.playClick();
            onReset();
          }}
          className="flex items-center gap-2 rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-void-600 hover:text-zinc-200 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isDark ? 'Проклясть еще одного' : 'Благословить еще одного'}</span>
        </button>
      </div>
    </div>
  );
};
