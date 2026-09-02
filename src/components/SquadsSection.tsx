'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Copy, 
  Check, 
  Flame, 
  Sun, 
  Send, 
  Crown, 
  Sparkles,
  Heart
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { squadStore } from '@/lib/squadStore';
import { karmaStore } from '@/lib/karmaStore';
import { Squad, SquadMember, UserKarmaProfile } from '@/types';

interface SquadsSectionProps {
  onOpenSquadsModal: () => void;
  onTargetMember: (member: SquadMember, squad: Squad) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onRequireAuth?: () => void;
}

export const SquadsSection: React.FC<SquadsSectionProps> = ({
  onOpenSquadsModal,
  onTargetMember,
  onShowToast,
  onRequireAuth,
}) => {
  const [squads, setSquads] = useState<Squad[]>(() => squadStore.getSquads());
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const [selectedSquadId, setSelectedSquadId] = useState<string | undefined>(
    profile.activeSquadId || squads[0]?.id
  );
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const unsubSquads = squadStore.subscribe(() => {
      const all = squadStore.getSquads();
      setSquads(all);
      if (!selectedSquadId && all.length > 0) {
        setSelectedSquadId(all[0].id);
      }
    });
    const unsubKarma = karmaStore.subscribe(() => {
      setProfile(karmaStore.getProfile());
    });
    return () => {
      unsubSquads();
      unsubKarma();
    };
  }, [selectedSquadId]);

  const currentSquad = squads.find((s) => s.id === selectedSquadId) || squads[0];
  const isLight = profile.selectedRealm === 'light';

  const handleAction = () => {
    if (!profile.isAuthorized && onRequireAuth) {
      onRequireAuth();
    } else {
      onOpenSquadsModal();
    }
  };

  const handleCopyInvite = () => {
    if (!currentSquad) return;
    sound.playClick();
    triggerHaptic('light');
    const inviteLink = `https://proklinator-online.vercel.app/?join_squad=${currentSquad.inviteCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
    }
    setIsCopied(true);
    onShowToast(`🔗 Ссылка-инвайт в «${currentSquad.name}» скопирована!`, 'success');
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <section className="rounded-3xl border border-void-800 bg-void-900/60 p-4 sm:p-6 backdrop-blur-xl shadow-altar">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-void-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-karma-gold/20 text-karma-gold border border-karma-gold/40 shadow-glow-gold">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="font-heading text-base sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Офисные Сквады & Команды</span>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-karma-gold/20 text-karma-gold border border-karma-gold/30">
                Закрытые чаты
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-sans">
              Объединяйтесь с коллегами, соседями и друзьями для анонимного кармического суда и благословений
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              triggerHaptic('light');
              handleAction();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-850 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:border-karma-gold hover:text-white transition-all font-heading"
          >
            <Plus className="w-3.5 h-3.5 text-karma-gold" />
            <span>Управление сквадами</span>
          </button>
        </div>
      </div>

      {/* Squads Content or Clean Zero-State */}
      {squads.length > 0 ? (
        <div className="mt-4 space-y-4">
          {/* Squads Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {squads.map((sq) => {
              const isSelected = sq.id === selectedSquadId;
              return (
                <button
                  key={sq.id}
                  onClick={() => {
                    sound.playClick();
                    triggerHaptic('light');
                    setSelectedSquadId(sq.id);
                    karmaStore.setActiveSquad(sq.id);
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all font-heading ${
                    isSelected
                      ? 'border-karma-gold bg-karma-gold/20 text-karma-gold shadow-glow-gold'
                      : 'border-void-800 bg-void-900 text-zinc-400 hover:border-void-700 hover:text-zinc-200'
                  }`}
                >
                  <span>{sq.icon}</span>
                  <span>{sq.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({sq.membersCount})</span>
                </button>
              );
            })}
          </div>

          {/* Active Squad Details */}
          {currentSquad && (
            <div className="rounded-2xl border border-void-800 bg-void-950/80 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl p-2.5 rounded-2xl bg-void-900 border border-void-800">
                    {currentSquad.icon}
                  </span>
                  <div>
                    <h4 className="font-heading text-base font-bold text-white">
                      {currentSquad.name}
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-lg">
                      {currentSquad.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyInvite}
                  className="flex items-center justify-center gap-2 rounded-xl border border-karma-gold/40 bg-karma-gold/10 px-4 py-2.5 text-xs font-bold text-karma-gold hover:bg-karma-gold/20 transition-all font-mono"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-karma-gold" />}
                  <span>Инвайт: {currentSquad.inviteCode}</span>
                </button>
              </div>

              {/* Members */}
              <div className="mt-5 border-t border-void-800 pt-4">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 font-heading uppercase tracking-wider mb-3">
                  <span>Участники сквада ({currentSquad.members.length}):</span>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    {isLight ? 'Нажмите «Благословить» для награждения' : 'Нажмите «Покарать» для анонимной кары'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {currentSquad.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-xl border border-void-800 bg-void-900/70 p-3 hover:border-void-700 transition-all"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-2xl shrink-0">{member.avatar}</span>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-heading text-xs font-bold text-white truncate">
                              {member.name}
                            </span>
                            {member.role === 'owner' && (
                              <Crown className="w-3 h-3 text-karma-gold shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono">
                            🔥 {member.sinsCount} кар • ✨ {member.blessingsCount} добр
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          sound.playClick();
                          triggerHaptic('medium');
                          onTargetMember(member, currentSquad);
                        }}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all font-heading shrink-0 ml-2 shadow-sm ${
                          isLight
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-400 hover:text-void-950'
                            : 'bg-void-800 text-zinc-300 border border-void-700 hover:bg-inferno-600 hover:text-white hover:border-inferno-500'
                        }`}
                      >
                        {isLight ? <Sparkles className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                        <span>{isLight ? 'Благословить' : 'Покарать'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Clean Zero State */
        <div className="mt-4 py-8 text-center rounded-2xl border border-dashed border-void-800 bg-void-950/40 p-6">
          <Users className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h4 className="font-heading text-sm font-bold text-white mb-1">
            У вас пока нет активных сквадов
          </h4>
          <p className="text-xs text-zinc-400 font-sans max-w-md mx-auto mb-5 leading-relaxed">
            Создайте закрытый сквад для вашего офиса, семьи или соседей, либо вступите по инвайт-коду от коллеги.
          </p>

          <button
            onClick={handleAction}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-karma-gold to-amber-500 px-5 py-2.5 text-xs font-bold text-void-950 shadow-glow-gold hover:scale-105 active:scale-95 transition-all font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>Создать первый сквад</span>
          </button>
        </div>
      )}
    </section>
  );
};
