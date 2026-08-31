'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Send, RotateCcw, Flame, Sun, Check, ShieldAlert, Sparkles, Heart, Share2, ImageIcon } from 'lucide-react';
import { DecreeVerdict } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { toPng, toBlob } from 'html-to-image';

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
  const [isSharingPhoto, setIsSharingPhoto] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isDark = verdict.realm === 'dark';
  const categoryInfo = CATEGORY_LABELS[verdict.category] || CATEGORY_LABELS.other;

  const getCleanShortUrl = () => {
    if (typeof window === 'undefined') return `https://proklinator-online.vercel.app/c/${verdict.id}`;
    return `${window.location.origin}/c/${verdict.id}`;
  };

  const getFormattedCaption = () => {
    return isDark
      ? `⚖️ ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ\n📜 Официальный приговор: «${verdict.targetName}»\n\n⚡ Вменяемое деяние: «${verdict.actionText}»\n🩸 Приговор: «${verdict.verdictText}»\n\n🏛️ Заверено печатью: ${verdict.clerkSignature}`
      : `✨ НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ\n📜 Грамота признания: «${verdict.targetName}»\n\n🌟 Добрый поступок: «${verdict.actionText}»\n🕊️ Благословение: «${verdict.verdictText}»\n\n🏛️ Заверено печатью: ${verdict.clerkSignature}`;
  };

  const handleCopyLink = async () => {
    sound.playClick();
    triggerHaptic('light');
    const shareUrl = getCleanShortUrl();
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
   * Sends the certificate as an actual high-resolution PHOTO (PNG image file) with caption
   */
  const handleSharePhotoDirectly = async () => {
    if (!certRef.current) return;
    sound.playGoldenBell();
    triggerHaptic('medium');
    setIsSharingPhoto(true);
    onShowToast('📸 Формируем фото грамоты для отправки...', 'info');

    try {
      const blob = await toBlob(certRef.current, {
        cacheBust: true,
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#09090b',
      });

      if (!blob) {
        throw new Error('Failed to generate image blob');
      }

      const fileName = `${isDark ? 'Gramota-Karmy' : 'Gramota-Blagodati'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const caption = getFormattedCaption();

      // Check if browser / Telegram WebView supports Native File Sharing
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: isDark ? 'Грамота Проклятия' : 'Грамота Благодати',
          text: caption,
        });
        sound.playVerdictChime();
        triggerHaptic('success');
        onShowToast('🚀 Грамота успешно отправлена!', 'success');
        return;
      }

      // Fallback: Copy image to clipboard and trigger Telegram link
      try {
        if (navigator.clipboard && (window as any).ClipboardItem) {
          const item = new (window as any).ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          onShowToast('📋 Фото скопировано в буфер обмена! Вставьте его в чат.', 'success');
        }
      } catch {
        // ignore
      }

      const shortUrl = getCleanShortUrl();
      const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(shortUrl)}&text=${encodeURIComponent(caption)}`;

      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
        (window as any).Telegram.WebApp.openTelegramLink(tgShareUrl);
      } else {
        window.open(tgShareUrl, '_blank');
      }
    } catch (err) {
      console.error('Share photo error:', err);
      onShowToast('Не удалось отправить фото напрямую', 'error');
    } finally {
      setIsSharingPhoto(false);
    }
  };

  return (
    <div className="flex flex-col items-center py-2 sm:py-4">
      {/* Certificate Frame */}
      <div className="w-full max-w-xl p-1.5 sm:p-4">
        <div
          ref={certRef}
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle at 50% 50%, rgba(9, 9, 11, 0.88), rgba(9, 9, 11, 0.96)), url(/assets/certificates/dark_parchment.jpg)'
              : 'radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.85), rgba(9, 9, 11, 0.94)), url(/assets/certificates/celestial_parchment.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className={`relative overflow-hidden rounded-3xl border-2 p-5 sm:p-8 text-neutral-100 transition-all ${
            isDark
              ? 'border-karma-gold/60 shadow-[0_0_60px_rgba(251,191,36,0.2)]'
              : 'border-amber-400/70 shadow-[0_0_60px_rgba(251,191,36,0.3)]'
          }`}
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2.5 left-3 text-karma-gold/50 text-[10px] font-mono select-none">❖ ━━━━</div>
          <div className="absolute top-2.5 right-3 text-karma-gold/50 text-[10px] font-mono select-none">━━━━ ❖</div>
          <div className="absolute bottom-2.5 left-3 text-karma-gold/50 text-[10px] font-mono select-none">❖ ━━━━</div>
          <div className="absolute bottom-2.5 right-3 text-karma-gold/50 text-[10px] font-mono select-none">━━━━ ❖</div>

          {/* Header */}
          <div className="text-center border-b border-karma-gold/20 pb-4">
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase mb-1.5 font-mono ${
              isDark
                ? 'border-karma-gold/30 bg-karma-gold/10 text-karma-gold'
                : 'border-amber-400/40 bg-amber-400/15 text-amber-300'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{isDark ? 'Отдел Кармического Возмездия №666' : 'Отдел Небесной Благодати & Добра'}</span>
            </div>
            <h2 className={`font-heading text-xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text uppercase drop-shadow-sm ${
              isDark
                ? 'bg-gradient-to-r from-karma-gold via-amber-200 to-karma-gold'
                : 'bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300'
            }`}>
              {isDark ? 'Грамота Проклятия' : 'Грамота Благодати'}
            </h2>
            <p className="mt-0.5 font-mono text-[10px] sm:text-xs text-zinc-400">
              ДЕЛО {verdict.caseNumber} • ОТ {verdict.createdAt}
            </p>
          </div>

          {/* Body */}
          <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4 text-sm">
            {/* Target Field */}
            <div className="rounded-xl border border-void-700 bg-void-850/70 p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="font-semibold uppercase tracking-wider text-zinc-400 font-mono text-[9px] sm:text-[10px]">
                  {isDark ? 'Субъект кармы:' : 'Адресат благодати:'}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-void-700/80 px-2 py-0.5 text-[10px] sm:text-[11px] text-zinc-300 font-medium">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-heading text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {verdict.targetName}
                </p>
                {verdict.telegramUsername && (
                  <span className="font-mono text-xs text-astral-400 bg-astral-500/10 border border-astral-500/20 px-2 py-0.5 rounded-lg">
                    @{verdict.telegramUsername}
                  </span>
                )}
              </div>
            </div>

            {/* Action / Sin Field */}
            <div className="rounded-xl border border-void-700 bg-void-850/70 p-3 backdrop-blur-sm">
              <span className={`block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider mb-1 font-mono ${
                isDark ? 'text-inferno-400' : 'text-emerald-400'
              }`}>
                {isDark ? 'Вменяемое деяние (Грех):' : 'Зафиксированный подвиг (Добро):'}
              </span>
              <p className="text-xs sm:text-base text-zinc-200 italic leading-relaxed font-sans">
                «{verdict.actionText}»
              </p>
            </div>

            {/* Punishment / Blessing Box */}
            <div className={`rounded-xl border-2 p-3.5 sm:p-4 relative ${
              isDark
                ? 'border-inferno-500/50 bg-gradient-to-br from-inferno-950/40 via-void-900 to-void-950 shadow-glow-crimson'
                : 'border-amber-400/50 bg-gradient-to-br from-amber-950/30 via-void-900 to-void-950 shadow-glow-gold'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {isDark ? <ShieldAlert className="w-3.5 h-3.5 text-inferno-400" /> : <Heart className="w-3.5 h-3.5 text-amber-300" />}
                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-inferno-400' : 'text-amber-300'
                }`}>
                  {isDark ? 'Приговор Канцелярии:' : 'Благословение Небес:'}
                </span>
                <span className={`ml-auto text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-inferno-500/20 text-inferno-300 border-inferno-500/40'
                    : 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                }`}>
                  {isDark ? '⚡ Исполнению подлежит' : '✨ Навечно закреплено'}
                </span>
              </div>
              <h4 className={`font-heading text-sm sm:text-lg font-bold mb-0.5 ${
                isDark ? 'text-yellow-300' : 'text-amber-200'
              }`}>
                {verdict.verdictTitle}
              </h4>
              <p className="text-xs sm:text-base text-zinc-100 font-medium leading-relaxed font-sans">
                {verdict.verdictText}
              </p>
            </div>
          </div>

          {/* Footer & Robust 3D Wax Seal */}
          <div className="mt-4 sm:mt-6 flex items-center justify-between border-t border-karma-gold/20 pt-3 sm:pt-4">
            <div className="text-left">
              <div className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase">Секретарь:</div>
              <div className="font-heading text-xs sm:text-base font-bold text-amber-200 leading-tight">
                {verdict.clerkSignature}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[8px] sm:text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                  Печать активна в астрале
                </span>
              </div>
            </div>

            {/* 3D Wax Seal Badge */}
            <div className="relative flex items-center justify-center shrink-0">
              <div
                className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center p-1.5 transform rotate-6 hover:rotate-12 transition-transform shadow-[0_0_25px_rgba(251,191,36,0.5)] border-2 ${
                  isDark
                    ? 'border-red-500/80 bg-gradient-to-br from-red-700 via-red-900 to-black text-amber-200 ring-2 ring-red-500/40'
                    : 'border-amber-400/90 bg-gradient-to-br from-amber-400 via-yellow-600 to-amber-900 text-void-950 ring-2 ring-amber-300/40'
                }`}
              >
                {/* 3D PNG Overlay */}
                <img
                  src={isDark ? '/assets/seals/tribunal_seal.png' : '/assets/seals/celestial_seal.png'}
                  alt="3D Wax Seal"
                  className="absolute inset-0 h-full w-full object-contain rounded-full opacity-90 filter drop-shadow-md z-10"
                />

                {/* Inner Runic Seal Core */}
                <div className="flex flex-col items-center justify-center text-center select-none z-0">
                  <div className="text-[8px] font-mono font-black uppercase tracking-tighter">
                    {isDark ? 'КАРМА' : 'ДОБРО'}
                  </div>
                  {isDark ? (
                    <Flame className="w-3.5 h-3.5 text-yellow-300 my-0.5" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-void-950 my-0.5" />
                  )}
                  <div className="text-[8px] font-mono font-black">
                    {isDark ? '666' : '777'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 w-full max-w-xl px-2 space-y-2.5">
        {/* Direct Send Photo to Telegram */}
        <button
          onClick={handleSharePhotoDirectly}
          disabled={isSharingPhoto}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-[0_0_30px_rgba(14,165,233,0.4)] hover:scale-[1.02] active:scale-95 transition-all font-heading disabled:opacity-75"
        >
          <Send className="w-5 h-5" />
          <span>{isSharingPhoto ? 'Подготовка фото...' : 'Отправить фото в Telegram'}</span>
        </button>

        {/* Secondary Actions Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 rounded-xl border border-void-700 bg-void-900/90 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-karma-gold hover:text-white transition-all font-heading"
          >
            <Download className="w-4 h-4 text-karma-gold" />
            <span>{isDownloading ? 'Сохранение...' : 'Скачать PNG'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 rounded-xl border border-void-700 bg-void-900/90 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-karma-gold hover:text-white transition-all font-heading"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
            <span>{isCopied ? 'Скопировано!' : 'Короткая ссылка'}</span>
          </button>
        </div>

        {/* Reset / New Decree Button */}
        <button
          onClick={() => {
            sound.playClick();
            onReset();
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-zinc-500 hover:text-zinc-300 font-sans"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Вынести новый приговор или благословение</span>
        </button>
      </div>
    </div>
  );
};
