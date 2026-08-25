'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Plus, 
  Key, 
  Copy, 
  Check, 
  Flame, 
  Sun, 
  Sparkles, 
  ShieldAlert, 
  Heart, 
  Share2, 
  Crown, 
  Send,
  Building,
  Laptop,
  Home,
  Pizza,
  Briefcase
} from 'lucide-react';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { squadStore, INITIAL_SQUADS } from '@/lib/squadStore';
import { karmaStore } from '@/lib/karmaStore';
import { Squad, SquadMember, UserKarmaProfile } from '@/types';

interface SquadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMemberForRitual: (member: SquadMember, squad: Squad) => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
}

const ICONS = ['🏢', '💻', '💼', '🏠', '🍕', '☕', '🚀', '🧙'];

export const SquadsModal: React.FC<SquadsModalProps> = ({
  isOpen,
  onClose,
  onSelectMemberForRitual,
  onShowToast,
}) => {
  const [squads, setSquads] = useState<Squad[]>(() => squadStore.getSquads());
  const [profile, setProfile] = useState<UserKarmaProfile>(() => karmaStore.getProfile());
  const [selectedSquadId, setSelectedSquadId] = useState<string>(
    profile.activeSquadId || squads[0]?.id || 'sq-yandex'
  );

  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'join'>('view');

  // Create form
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🏢');
  const [newDesc, setNewDesc] = useState('');

  // Join form
  const [joinCode, setJoinCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const unsub = squadStore.subscribe(() => {
      setSquads(squadStore.getSquads());
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const currentSquad = squads.find((s) => s.id === selectedSquadId) || squads[0];

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      onShowToast('Укажите название сквада!', 'error');
      return;
    }
    const created = squadStore.createSquad(newName, newIcon, newDesc, 'Вы');
    karmaStore.setActiveSquad(created.id);
    setSelectedSquadId(created.id);
    setActiveTab('view');
    sound.playSealStamp();
    triggerHaptic('success');
    onShowToast(`🏢 Сквад «${created.name}» успешно создан!`, 'success');
  };

  const handleJoinSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      onShowToast('Введите инвайт-код сквада!', 'error');
      return;
    }
    const res = squadStore.joinSquadByCode(joinCode, 'Вы', '🧙');
    if (res.success && res.squad) {
      karmaStore.setActiveSquad(res.squad.id);
      setSelectedSquadId(res.squad.id);
      setActiveTab('view');
      sound.playGoldenBell();
      triggerHaptic('success');
      onShowToast(res.message, 'success');
    } else {
      sound.playClick();
      triggerHaptic('error');
      onShowToast(res.message, 'error');
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
    onShowToast(`🔗 Ссылка для коллег сквада «${currentSquad.name}» скопирована!`, 'success');
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl rounded-3xl border border-karma-gold/50 bg-void-950 p-6 shadow-[0_0_60px_rgba(251,191,36,0.15)] my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-void-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-karma-gold/20 text-karma-gold border border-karma-gold/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-white">
                Офисные Сквады & Канцелярские Гильдии
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Анонимные проклятия и благословения только среди проверенных коллег и друзей
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-700 bg-void-900 text-zinc-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons: [ 👥 Мой Сквад | ➕ Создать Сквад | 🔑 Вступить по коду ] */}
        <div className="mt-4 flex items-center gap-2 border-b border-void-800 pb-3">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('view');
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all font-heading ${
              activeTab === 'view'
                ? 'bg-karma-gold text-void-950 shadow-glow-gold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-void-900'
            }`}
          >
            👥 Активный Сквад
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('create');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all font-heading ${
              activeTab === 'create'
                ? 'bg-karma-gold text-void-950 shadow-glow-gold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-void-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Создать Сквад</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('join');
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all font-heading ${
              activeTab === 'join'
                ? 'bg-karma-gold text-void-950 shadow-glow-gold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-void-900'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Вступить по коду</span>
          </button>
        </div>

        {/* Tab 1: VIEW SQUAD */}
        {activeTab === 'view' && currentSquad && (
          <div className="mt-4 space-y-5">
            {/* Squad Switcher Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {squads.map((sq) => {
                const isSelected = sq.id === selectedSquadId;
                return (
                  <button
                    key={sq.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedSquadId(sq.id);
                      karmaStore.setActiveSquad(sq.id);
                    }}
                    className={`flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-karma-gold bg-karma-gold/20 text-karma-gold shadow-glow-gold'
                        : 'border-void-800 bg-void-900 text-zinc-400 hover:border-void-700'
                    }`}
                  >
                    <span>{sq.icon}</span>
                    <span>{sq.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">({sq.membersCount})</span>
                  </button>
                );
              })}
            </div>

            {/* Squad Info Card */}
            <div className="rounded-2xl border border-void-800 bg-void-900/80 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-void-800 border border-void-700">
                    {currentSquad.icon}
                  </span>
                  <div>
                    <h4 className="font-heading text-base font-bold text-white">
                      {currentSquad.name}
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans mt-0.5 max-w-md">
                      {currentSquad.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyInvite}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-void-700 bg-void-850 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-karma-gold hover:text-white transition-all font-mono"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-karma-gold" />}
                  <span>{currentSquad.inviteCode}</span>
                </button>
              </div>

              {/* Squad Balance Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-void-800 pt-3 text-center">
                <div className="flex items-center justify-center gap-2 rounded-xl bg-inferno-500/10 border border-inferno-500/30 p-2 text-inferno-300 text-xs font-semibold font-heading">
                  <Flame className="w-4 h-4 text-inferno-400" />
                  <span>Кары отдела: {currentSquad.stats.darkCount}</span>
                </div>
                <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 p-2 text-amber-300 text-xs font-semibold font-heading">
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>Благодать отдела: {currentSquad.stats.lightCount}</span>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div>
              <h5 className="font-heading text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">
                Коллеги в скваде ({currentSquad.members.length}):
              </h5>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {currentSquad.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-xl border border-void-800 bg-void-900/60 p-3 hover:border-void-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{member.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading text-xs font-bold text-white">
                            {member.name}
                          </span>
                          {member.role === 'owner' && (
                            <span title="Создатель"><Crown className="w-3.5 h-3.5 text-karma-gold" /></span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                          {member.username && <span>@{member.username}</span>}
                          <span>• 🔥 {member.sinsCount} кар</span>
                          <span>• ✨ {member.blessingsCount} добр</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Target this member */}
                    <button
                      onClick={() => {
                        sound.playClick();
                        triggerHaptic('medium');
                        onSelectMemberForRitual(member, currentSquad);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-void-800 hover:bg-inferno-600 hover:text-white px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-all font-heading"
                    >
                      <Send className="w-3 h-3" />
                      <span>Наслать вердикт</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CREATE SQUAD */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSquad} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Название сквада / отдела:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Например: IT-отдел Яндекс, Бухгалтерия 4 этаж..."
                maxLength={45}
                required
                className="w-full rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-sm text-white focus:border-karma-gold focus:outline-none font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Иконка гильдии:
              </label>
              <div className="flex gap-2">
                {ICONS.map((ico) => (
                  <button
                    key={ico}
                    type="button"
                    onClick={() => setNewIcon(ico)}
                    className={`h-11 w-11 rounded-xl border text-xl flex items-center justify-center transition-all ${
                      newIcon === ico
                        ? 'border-karma-gold bg-karma-gold/20 scale-110 shadow-glow-gold'
                        : 'border-void-800 bg-void-900 hover:border-void-700'
                    }`}
                  >
                    {ico}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Описание / Правила сквада:
              </label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Например: Караем за грязные кружки и благословляем за пиццу..."
                rows={2}
                maxLength={120}
                className="w-full rounded-xl border border-void-700 bg-void-900 p-3 text-sm text-white focus:border-karma-gold focus:outline-none font-sans resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-karma-gold text-void-950 font-heading text-sm font-bold shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all"
            >
              Создать Офисный Сквад
            </button>
          </form>
        )}

        {/* Tab 3: JOIN SQUAD */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSquad} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                Введите Инвайт-код сквада:
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Например: YANDEX-IT-666 или BUH-DEPT-777"
                maxLength={30}
                required
                className="w-full rounded-xl border border-void-700 bg-void-900 px-4 py-3.5 text-sm text-white uppercase focus:border-karma-gold focus:outline-none font-mono tracking-wider"
              />
            </div>

            <p className="text-xs text-zinc-400 font-sans">
              Попросите инвайт-код у коллеги, создавшего сквад, или перейдите по ссылке-приглашению.
            </p>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-karma-gold text-void-950 font-heading text-sm font-bold shadow-glow-gold hover:scale-[1.02] active:scale-95 transition-all"
            >
              Вступить в Сквад
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
