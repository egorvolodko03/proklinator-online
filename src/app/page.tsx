'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ParticleBackground } from '@/components/ParticleBackground';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { RealmSelector } from '@/components/RealmSelector';
import { RitualModal } from '@/components/RitualModal';
import { CurseCertificate } from '@/components/CurseCertificate';
import { KarmaDashboard } from '@/components/KarmaDashboard';
import { SquadsSection } from '@/components/SquadsSection';
import { TipModal } from '@/components/TipModal';
import { SquadsModal } from '@/components/SquadsModal';
import { AltarRouletteModal } from '@/components/AltarRouletteModal';
import { Toast, ToastMessage } from '@/components/Toast';
import { DecreeVerdict, KarmaRealm, Category, Squad, SquadMember } from '@/types';
import { sound } from '@/lib/audio';
import { initTelegramMiniApp } from '@/lib/telegram';
import { squadStore } from '@/lib/squadStore';

function AppContent() {
  const searchParams = useSearchParams();

  const [realm, setRealm] = useState<KarmaRealm>('dark');
  const [isRitualOpen, setIsRitualOpen] = useState(false);
  const [isTipOpen, setIsTipOpen] = useState(false);
  const [isSquadsOpen, setIsSquadsOpen] = useState(false);
  const [isAltarOpen, setIsAltarOpen] = useState(false);

  const [preselectedMember, setPreselectedMember] = useState<SquadMember | null>(null);
  const [preselectedSquad, setPreselectedSquad] = useState<Squad | null>(null);

  const [viewingVerdict, setViewingVerdict] = useState<DecreeVerdict | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initialize Telegram Mini App and handle incoming invite/decree URLs
  useEffect(() => {
    initTelegramMiniApp();

    // Check for join_squad in URL
    const joinSquadCode = searchParams.get('join_squad');
    if (joinSquadCode) {
      const res = squadStore.joinSquadByCode(joinSquadCode, 'Вы', '🧙');
      if (res.success) {
        addToast(res.message, 'success');
        setIsSquadsOpen(true);
      }
    }

    // Check for preloaded shared certificate in URL
    const cId = searchParams.get('c_id');
    const name = searchParams.get('name');
    const curse = searchParams.get('curse');
    const sin = searchParams.get('sin');
    const title = searchParams.get('title');
    const cat = (searchParams.get('cat') as Category) || 'other';
    const sharedRealm = (searchParams.get('realm') as KarmaRealm) || 'dark';

    if (cId && name && curse && sin) {
      setViewingVerdict({
        id: cId,
        realm: sharedRealm,
        caseNumber: `№ КРМ-${cId.toUpperCase().slice(0, 4)}-Г`,
        targetName: name,
        category: cat,
        actionText: sin,
        verdictText: curse,
        verdictTitle: title || (sharedRealm === 'dark' ? 'Официальный Приговор' : 'Астральная Грамота'),
        tier: 'medium',
        createdAt: 'Недавно',
        clerkSignature: sharedRealm === 'dark' ? 'Архивариус Трибунала' : 'Хранитель Благодати',
        sealColor: sharedRealm === 'dark' ? '#ff4d28' : '#fbbf24',
      });
    }
  }, [searchParams, addToast]);

  const handleStartRitual = (chosenRealm: KarmaRealm = realm) => {
    sound.playClick();
    setRealm(chosenRealm);
    setPreselectedMember(null);
    setPreselectedSquad(null);
    setIsRitualOpen(true);
  };

  const handleTargetSquadMember = (member: SquadMember, squad: Squad) => {
    setPreselectedMember(member);
    setPreselectedSquad(squad);
    setIsSquadsOpen(false);
    setIsRitualOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-void-950 text-neutral-100 selection:bg-karma-gold selection:text-void-950 overflow-x-hidden font-sans">
      {/* Dynamic Background */}
      <ParticleBackground realm={realm} />

      {/* Navbar */}
      <Navbar
        realm={realm}
        onOpenTipModal={() => setIsTipOpen(true)}
        onOpenSquadsModal={() => setIsSquadsOpen(true)}
        onOpenAltarModal={() => setIsAltarOpen(true)}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-2.5 sm:px-6 py-4 sm:py-8 space-y-8 sm:space-y-12">
        {/* Hero Section */}
        <Hero
          onStartRitual={() => handleStartRitual('dark')}
          onStartBlessing={() => handleStartRitual('light')}
          onOpenTipModal={() => setIsTipOpen(true)}
          onOpenSquadsModal={() => setIsSquadsOpen(true)}
          onOpenAltarModal={() => setIsAltarOpen(true)}
        />

        {/* Realm Mode Toggle */}
        <RealmSelector activeRealm={realm} onSelectRealm={setRealm} />

        {/* Squads & Guilds Hub Section */}
        <SquadsSection
          onOpenSquadsModal={() => setIsSquadsOpen(true)}
          onTargetMember={handleTargetSquadMember}
          onShowToast={addToast}
        />

        {/* Real-Time Karma Dashboard */}
        <KarmaDashboard onSelectDecree={setViewingVerdict} />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-void-800 bg-void-950/90 py-6 text-center text-xs text-zinc-500 font-mono px-4">
        <p>© 2026 Кармическая Канцелярия 3.0 • Все права защищены астральным трибуналом.</p>
        <p className="mt-1 text-[11px] text-zinc-600">
          Сайт создан исключительно в шуточных и развлекательных целях. Никакой реальной магии.
        </p>
      </footer>

      {/* Modals */}
      <RitualModal
        isOpen={isRitualOpen}
        realm={realm}
        preselectedMember={preselectedMember}
        preselectedSquad={preselectedSquad}
        onClose={() => setIsRitualOpen(false)}
        onShowToast={addToast}
        onDecreeCreated={(verdict) => {
          setViewingVerdict(verdict);
          setIsRitualOpen(false);
        }}
      />

      <TipModal
        isOpen={isTipOpen}
        onClose={() => setIsTipOpen(false)}
        onShowToast={addToast}
      />

      <SquadsModal
        isOpen={isSquadsOpen}
        onClose={() => setIsSquadsOpen(false)}
        onSelectMemberForRitual={handleTargetSquadMember}
        onShowToast={addToast}
      />

      <AltarRouletteModal
        isOpen={isAltarOpen}
        onClose={() => setIsAltarOpen(false)}
        onShowToast={addToast}
      />

      {/* Shared Verdict Viewer Modal */}
      {viewingVerdict && !isRitualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl">
            <button
              onClick={() => setViewingVerdict(null)}
              className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-void-800 text-white hover:bg-void-700 font-bold"
            >
              ✕
            </button>
            <CurseCertificate
              verdict={viewingVerdict}
              onReset={() => setViewingVerdict(null)}
              onShowToast={addToast}
            />
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void-950 flex items-center justify-center text-white font-mono">Загрузка Кармической Канцелярии...</div>}>
      <AppContent />
    </Suspense>
  );
}
