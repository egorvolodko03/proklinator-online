'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { RitualModal } from '@/components/RitualModal';
import { KarmaShopModal } from '@/components/KarmaShopModal';
import { KarmaDashboard } from '@/components/KarmaDashboard';
import { CurseCertificate } from '@/components/CurseCertificate';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { INITIAL_FEED } from '@/data/feed';
import { DecreeVerdict, KarmaFeedItem, KarmaRealm, Category } from '@/types';
import { sound } from '@/lib/audio';
import { initTelegramWebApp, triggerHaptic } from '@/lib/telegram';
import { Flame, Sun, Sparkles, Scale, Shield } from 'lucide-react';

function MainAppContent() {
  const searchParams = useSearchParams();

  // Duality Realm: 'dark' (Проклинатор) ↔ 'light' (Благословитель)
  const [realm, setRealm] = useState<KarmaRealm>('dark');

  // Modals state
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);

  // Direct shared verdict state (from URL params)
  const [directVerdict, setDirectVerdict] = useState<DecreeVerdict | null>(null);

  // Live dashboard state
  const [curses, setCurses] = useState<KarmaFeedItem[]>(() =>
    INITIAL_FEED.map((item) => ({ ...item, realm: (item.realm || 'dark') as KarmaRealm }))
  );
  const [totalCount, setTotalCount] = useState<number>(1286);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(false);

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

  // Initialize Telegram WebApp on mount
  useEffect(() => {
    initTelegramWebApp();
  }, []);

  // Fetch real curses from server API
  const fetchCurses = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const res = await fetch('/api/curses');
      if (res.ok) {
        const data = await res.json();
        if (data.curses && Array.isArray(data.curses)) {
          setCurses(data.curses);
          setTotalCount(data.totalCount || 1280 + data.curses.length);
        }
      }
    } catch {
      // fallback
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  useEffect(() => {
    fetchCurses();
  }, [fetchCurses]);

  // Check if opened via share link
  useEffect(() => {
    const cId = searchParams.get('c_id');
    const paramRealm = (searchParams.get('realm') as KarmaRealm) || 'dark';
    const name = searchParams.get('name');
    const tg = searchParams.get('tg') || undefined;
    const cat = (searchParams.get('cat') as Category) || 'other';
    const sin = searchParams.get('sin');
    const curse = searchParams.get('curse');
    const title = searchParams.get('title') || (paramRealm === 'dark' ? 'Официальная кара' : 'Небесная благодать');
    const sev = searchParams.get('sev') || 'medium';

    if (cId && name && sin && curse) {
      setRealm(paramRealm);
      setDirectVerdict({
        id: cId,
        realm: paramRealm,
        caseNumber: `№ КРМ-${cId.toUpperCase()}-Г`,
        targetName: name,
        telegramUsername: tg,
        category: cat,
        actionText: sin,
        verdictText: curse,
        verdictTitle: title,
        tier: sev,
        createdAt: new Date().toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        clerkSignature: paramRealm === 'dark' ? 'Архивариус Астрального Суда' : 'Хранитель Небесной Благодати',
        sealColor: paramRealm === 'dark' ? '#ff4d28' : '#fbbf24',
      });
      sound.playVerdictChime();
    }
  }, [searchParams]);

  const handleDecreeCreated = (verdict: DecreeVerdict) => {
    const newItem: KarmaFeedItem = {
      id: verdict.id,
      realm: verdict.realm,
      targetName: verdict.targetName,
      telegramUsername: verdict.telegramUsername,
      category: verdict.category,
      sin: verdict.actionText,
      curseTitle: verdict.verdictTitle,
      severity: verdict.tier as any,
      timeAgo: 'Только что',
    };
    setCurses((prev) => [newItem, ...prev.slice(0, 59)]);
    setTotalCount((prev) => prev + 1);
    
    if (verdict.realm === 'dark') {
      addToast('📜 Печать Канцелярии наложена! (+10 🪙)', 'success');
    } else {
      addToast('✨ Грамота Благодати ниспослана! (+20 🪙)', 'success');
    }
  };

  const toggleRealm = () => {
    setRealm((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`relative flex min-h-screen flex-col overflow-x-hidden font-sans transition-colors duration-700 ${
      realm === 'dark' ? 'bg-void-950 text-neutral-100' : 'bg-slate-950 text-neutral-100'
    }`}>
      {/* Background Particles Canvas */}
      <ParticleBackground realm={realm} />

      {/* Navbar with Realm Switcher & Coins */}
      <Navbar
        realm={realm}
        onToggleRealm={toggleRealm}
        onOpenShop={() => setIsShopModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {directVerdict ? (
          /* Direct Shared View */
          <div className="mx-auto max-w-4xl px-4 py-10 text-center">
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold font-mono animate-pulse ${
              directVerdict.realm === 'dark'
                ? 'border-inferno-500/40 bg-inferno-500/10 text-inferno-300 shadow-glow-crimson'
                : 'border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-glow-gold'
            }`}>
              <Scale className="w-4 h-4" />
              <span>
                {directVerdict.realm === 'dark'
                  ? 'Вам вручено официальное кармическое предписание'
                  : 'Вам направлена астральная грамота благодати'}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">
              {directVerdict.realm === 'dark'
                ? 'Внимание: На вас наложено проклятие!'
                : 'Внимание: Вам выражена астральная благодарность!'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto mb-8 font-sans">
              {directVerdict.realm === 'dark'
                ? 'Темная Канцелярия рассмотрела обращение потерпевшей стороны и вынесла окончательное постановление.'
                : 'Небесная Канцелярия зафиксировала ваш добрый поступок и дарует вечную благодать.'}
            </p>

            <CurseCertificate
              verdict={directVerdict}
              onReset={() => setDirectVerdict(null)}
              onShowToast={addToast}
            />
          </div>
        ) : (
          /* Main Dual Landing */
          <>
            <Hero
              realm={realm}
              onStartRitual={() => setIsRitualModalOpen(true)}
              onOpenShop={() => setIsShopModalOpen(true)}
            />

            {/* Real-Time Dual Karma Dashboard */}
            <KarmaDashboard
              curses={curses}
              totalCount={totalCount}
              onRefresh={fetchCurses}
              isLoading={isLoadingFeed}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-void-800 bg-void-950/90 py-8 px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="flex items-center justify-center gap-2 text-zinc-400">
            {realm === 'dark' ? <Flame className="w-4 h-4 text-inferno-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span className="font-heading text-xs uppercase tracking-widest text-zinc-300 font-bold">
              {realm === 'dark' ? 'Отдел Кармического Контроля №666' : 'Отдел Небесной Благодати & Добра №777'}
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 max-w-xl mx-auto leading-relaxed font-sans">
            КАРМИЧЕСКАЯ КАНЦЕЛЯРИЯ РАБОТАЕТ В РЕАЛЬНОМ ВРЕМЕНИ. Проект создан для доброго юмора и эмоциональной разгрузки. Никакой реальной магии — только веселье, щиты и анонимные грамоты.
          </p>

          <div className="text-[10px] text-zinc-600 font-mono pt-2">
            © {new Date().getFullYear()} Проклинатор & Благословитель онлайн • Все права защищены.
          </div>
        </div>
      </footer>

      {/* Dual Ritual Modal */}
      <RitualModal
        isOpen={isRitualModalOpen}
        realm={realm}
        onClose={() => setIsRitualModalOpen(false)}
        onShowToast={addToast}
        onDecreeCreated={handleDecreeCreated}
      />

      {/* Karma Shop Modal */}
      <KarmaShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        onShowToast={addToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-void-950 text-zinc-400 font-heading">
          <div className="flex flex-col items-center gap-3">
            <Flame className="w-8 h-8 text-inferno-500 animate-pulse" />
            <p className="text-sm font-semibold">Связь с Кармической Канцелярией...</p>
          </div>
        </div>
      }
    >
      <MainAppContent />
    </Suspense>
  );
}
