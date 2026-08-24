'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Send, RotateCcw, Flame, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { CurseVerdict } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { sound } from '@/lib/audio';
import { toPng } from 'html-to-image';

interface CurseCertificateProps {
  verdict: CurseVerdict;
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

  const categoryInfo = CATEGORY_LABELS[verdict.category] || CATEGORY_LABELS.other;

  // Generate share URL
  const getShareUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.origin);
    url.searchParams.set('c_id', verdict.id);
    url.searchParams.set('name', verdict.targetName);
    url.searchParams.set('cat', verdict.category);
    url.searchParams.set('sin', verdict.sin);
    url.searchParams.set('curse', verdict.curseText);
    url.searchParams.set('title', verdict.curseTitle);
    url.searchParams.set('sev', verdict.severity);
    return url.toString();
  };

  const handleCopyLink = async () => {
    sound.playClick();
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
      onShowToast('🔗 Ссылка на приговор скопирована в буфер!', 'success');
      setTimeout(() => setIsCopied(false), 3000);
    } catch {
      onShowToast('Не удалось скопировать ссылку', 'error');
    }
  };

  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    sound.playClick();
    setIsDownloading(true);
    onShowToast('📜 Печатаем грамоту в высоком разрешении...', 'info');

    try {
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#09090b',
      });

      const link = document.createElement('a');
      link.download = `Gramota-Karmy-${verdict.targetName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      sound.playVerdictChime();
      onShowToast('✨ Грамота успешно сохранена в PNG!', 'success');
    } catch (err) {
      console.error('Download error:', err);
      onShowToast('Ошибка при скачивании грамоты', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareTelegram = () => {
    sound.playClick();
    const shareUrl = getShareUrl();
    const text = encodeURIComponent(
      `⚖️ ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ вынесла приговор гражданину "${verdict.targetName}"!\n\nДеяние: ${verdict.sin}\nКара: ${verdict.curseText}\n\nПосмотреть официальную грамоту:`
    );
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
    window.open(tgUrl, '_blank');
  };

  return (
    <div className="flex flex-col items-center py-4">
      {/* Certificate Frame (Export Target) */}
      <div className="w-full max-w-xl p-2 sm:p-4">
        <div
          ref={certRef}
          className="relative overflow-hidden rounded-3xl border-2 border-karma-gold/40 bg-gradient-to-b from-void-900 via-void-950 to-void-900 p-6 sm:p-8 text-neutral-100 shadow-[0_0_50px_rgba(251,191,36,0.15)]"
        >
          {/* Gothic Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-karma-gold/40 text-xs font-mono select-none">❖ ━━━━</div>
          <div className="absolute top-2 right-2 text-karma-gold/40 text-xs font-mono select-none">━━━━ ❖</div>
          <div className="absolute bottom-2 left-2 text-karma-gold/40 text-xs font-mono select-none">❖ ━━━━</div>
          <div className="absolute bottom-2 right-2 text-karma-gold/40 text-xs font-mono select-none">━━━━ ❖</div>

          {/* Background Watermark Pentagram */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5">
            <svg viewBox="0 0 100 100" className="h-96 w-96 text-white">
              <polygon points="50,5 62,38 97,38 69,59 79,93 50,72 21,93 31,59 3,38 38,38" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Certificate Header */}
          <div className="text-center border-b border-karma-gold/20 pb-5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-karma-gold/30 bg-karma-gold/10 px-3 py-0.5 text-[10px] font-semibold text-karma-gold tracking-wider uppercase mb-2 font-mono">
              <Sparkles className="w-3 h-3" /> Отдел Кармического Возмездия №666
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-karma-gold via-amber-200 to-karma-gold uppercase drop-shadow-sm">
              Грамота Проклятия
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
                <span className="font-semibold uppercase tracking-wider text-zinc-400 font-mono text-[10px]">Субъект кармы:</span>
                <span className="inline-flex items-center gap-1 rounded bg-void-700/80 px-2 py-0.5 text-[11px] text-zinc-300">
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
              </div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white tracking-wide">
                {verdict.targetName}
              </p>
            </div>

            {/* Sin Field */}
            <div className="rounded-xl border border-void-700 bg-void-850/70 p-3.5 backdrop-blur-sm">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-inferno-400 mb-1 font-mono">
                Вменяемое деяние (Грех):
              </span>
              <p className="font-serif text-base sm:text-lg text-zinc-200 italic leading-relaxed">
                «{verdict.sin}»
              </p>
            </div>

            {/* Punishment / Curse Sentence */}
            <div className="rounded-xl border-2 border-inferno-500/50 bg-gradient-to-br from-inferno-950/40 via-void-900 to-void-950 p-4 shadow-glow-crimson relative">
              <div className="flex items-center gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-inferno-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-inferno-400 font-mono">
                  Приговор Канцелярии:
                </span>
                <span className="ml-auto text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-inferno-500/20 text-inferno-300 border border-inferno-500/40">
                  {verdict.severity === 'light' ? '🟢 Легкий' : verdict.severity === 'medium' ? '🟡 Офисный' : '🔴 Крах'}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-yellow-300 mb-1">
                {verdict.curseTitle}
              </h4>
              <p className="font-serif text-base text-zinc-100 font-medium leading-relaxed">
                {verdict.curseText}
              </p>
            </div>
          </div>

          {/* Wax Seal & Verification Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-karma-gold/20 pt-4">
            {/* Clerk Signature */}
            <div className="text-left">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">Секретарь трибунала:</div>
              <div className="font-script text-xl text-amber-200 leading-tight">
                {verdict.clerkSignature}
              </div>
              <div className="mt-1 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">
                  Печать активна в астрале
                </span>
              </div>
            </div>

            {/* Glowing Gothic Wax Seal SVG */}
            <div className="relative flex items-center justify-center">
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-red-600 via-inferno-600 to-red-900 p-1 shadow-[0_0_20px_rgba(220,38,38,0.7)] ring-2 ring-yellow-400/40 transform rotate-12">
                <div className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-yellow-200/50 bg-red-800 text-center">
                  <div className="text-[9px] font-black uppercase tracking-tighter text-yellow-200 font-serif">
                    <div>КАРМА</div>
                    <Flame className="w-3.5 h-3.5 mx-auto text-yellow-300" />
                    <div>666</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fake Barcode Footer */}
          <div className="mt-4 flex items-center justify-between text-[9px] font-mono text-zinc-500 border-t border-void-800 pt-2">
            <span className="tracking-widest">||||| | |||| ||| |||||| |||| |</span>
            <span>PROKLINATOR-VERIFIED-HASH-{verdict.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 max-w-lg px-4">
        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 rounded-xl border border-void-700 bg-void-850 px-4 py-3 text-sm font-semibold text-zinc-200 shadow-md transition-all hover:border-astral-500 hover:text-white hover:shadow-glow-violet active:scale-95"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-astral-400" />}
          <span>{isCopied ? 'Скопировано!' : 'Скопировать ссылку для жертвы'}</span>
        </button>

        {/* Download PNG Certificate */}
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-inferno-600 to-inferno-500 px-5 py-3 text-sm font-bold text-white shadow-glow-crimson transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'Формирование PNG...' : 'Скачать грамоту'}</span>
        </button>

        {/* Share to Telegram */}
        <button
          onClick={handleShareTelegram}
          className="flex items-center gap-2 rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-400 shadow-md transition-all hover:bg-sky-500/20 hover:border-sky-400 hover:text-sky-300 active:scale-95"
        >
          <Send className="w-4 h-4" />
          <span>В Telegram</span>
        </button>

        {/* Reset / Curse Another */}
        <button
          onClick={() => {
            sound.playClick();
            onReset();
          }}
          className="flex items-center gap-2 rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-sm font-medium text-zinc-400 transition-all hover:border-void-600 hover:text-zinc-200 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Проклясть еще одного</span>
        </button>
      </div>
    </div>
  );
};
