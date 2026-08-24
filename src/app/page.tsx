'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { RitualModal } from '@/components/RitualModal';
import { TipModal } from '@/components/TipModal';
import { KarmaFeed } from '@/components/KarmaFeed';
import { CurseCertificate } from '@/components/CurseCertificate';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { INITIAL_FEED } from '@/data/feed';
import { CurseVerdict, KarmaFeedItem, SeverityLevel, Category } from '@/types';
import { sound } from '@/lib/audio';
import { Flame, Shield, Sparkles, Scale, ScrollText } from 'lucide-react';

function MainAppContent() {
  const searchParams = useSearchParams();

  // Modals state
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);

  // Direct shared verdict state (from URL params)
  const [directVerdict, setDirectVerdict] = useState<CurseVerdict | null>(null);

  // Live feed state
  const [feed, setFeed] = useState<KarmaFeedItem[]>(INITIAL_FEED);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check if opened via share link
  useEffect(() => {
    const cId = searchParams.get('c_id');
    const name = searchParams.get('name');
    const cat = (searchParams.get('cat') as Category) || 'other';
    const sin = searchParams.get('sin');
    const curse = searchParams.get('curse');
    const title = searchParams.get('title') || 'Официальная кара';
    const sev = (searchParams.get('sev') as SeverityLevel) || 'medium';

    if (cId && name && sin && curse) {
      setDirectVerdict({
        id: cId,
        caseNumber: `№ КРМ-${cId.toUpperCase()}-Г`,
        targetName: name,
        category: cat,
        sin: sin,
        curseText: curse,
        curseTitle: title,
        severity: sev,
        createdAt: new Date().toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        clerkSignature: 'Архивариус Астрального Суда',
        sealColor: '#ff4d28',
      });
      sound.playVerdictChime();
    }
  }, [searchParams]);

  const handleCurseCreated = (verdict: CurseVerdict) => {
    // Add to top of live feed
    const newItem: KarmaFeedItem = {
      id: verdict.id,
      targetName: verdict.targetName,
      category: verdict.category,
      sin: verdict.sin,
      curseTitle: verdict.curseTitle,
      severity: verdict.severity,
      timeAgo: 'Только что',
    };
    setFeed((prev) => [newItem, ...prev.slice(0, 8)]);
    addToast('📜 Печать Канцелярии успешно наложена!', 'success');
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      {/* Background Particle Canvas */}
      <ParticleBackground />

      {/* Navbar */}
      <Navbar onOpenTipModal={() => setIsTipModalOpen(true)} />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {directVerdict ? (
          /* Direct Victim Shared View */
          <div className="mx-auto max-w-4xl px-4 py-10 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-inferno-500/40 bg-inferno-500/10 px-4 py-1.5 text-xs font-semibold text-inferno-300 shadow-glow-crimson animate-pulse">
              <Scale className="w-4 h-4" />
              <span>Вам вручено официальное кармическое предписание</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white mb-2">
              Внимание: На вас наложено проклятие!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-8">
              Темная Канцелярия рассмотрела обращение потерпевшей стороны и вынесла окончательное постановление.
            </p>

            <CurseCertificate
              verdict={directVerdict}
              onReset={() => setDirectVerdict(null)}
              onShowToast={addToast}
            />
          </div>
        ) : (
          /* Main Landing Altar */
          <>
            <Hero
              onStartCurse={() => setIsRitualModalOpen(true)}
              onOpenTipModal={() => setIsTipModalOpen(true)}
            />

            <KarmaFeed feed={feed} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-void-800 bg-void-950/90 py-8 px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <Flame className="w-4 h-4 text-inferno-500" />
            <span className="font-serif text-xs uppercase tracking-widest text-zinc-300 font-bold">
              Отдел Кармического Контроля №666
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 max-w-xl mx-auto leading-relaxed">
            ТЕМНАЯ КАНЦЕЛЯРИЯ СЧИТАЕТ СЛЕДЫ. Используем кармические cookies и обезличенную статистику, чтобы ритуалы вершились быстрее. Сервис носит исключительно развлекательный и юмористический характер.
          </p>

          <div className="text-[10px] text-zinc-600 font-mono pt-2">
            © {new Date().getFullYear()} Проклинатор онлайн • Все астральные права защищены печатью бездны.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <RitualModal
        isOpen={isRitualModalOpen}
        onClose={() => setIsRitualModalOpen(false)}
        onShowToast={addToast}
        onCurseCreated={handleCurseCreated}
      />

      <TipModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        onShowToast={addToast}
      />

      {/* Toaster */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-void-950 text-zinc-400 font-serif">
          <div className="flex flex-col items-center gap-3">
            <Flame className="w-8 h-8 text-inferno-500 animate-pulse" />
            <p className="text-sm">Связь с Темной Канцелярией...</p>
          </div>
        </div>
      }
    >
      <MainAppContent />
    </Suspense>
  );
}
