'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Dices, 
  Flame, 
  Sun, 
  User, 
  FileText, 
  Sparkles, 
  Check, 
  AlertCircle,
  Users,
  ChevronDown,
  AtSign,
  UserCheck,
  UserPlus,
  Crown,
  Edit3
} from 'lucide-react';
import { Category, Curse, Blessing, DecreeVerdict, KarmaRealm, SeverityLevel, BlessingLevel, Squad, SquadMember } from '@/types';
import { CATEGORY_LABELS, CLERKS, generateCaseNumber, formatDate } from '@/lib/utils';
import { getRandomCurse } from '@/data/curses';
import { getRandomBlessing } from '@/data/blessings';
import { getRandomSin } from '@/data/sins';
import { getRandomGoodDeed } from '@/data/goodDeeds';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';
import { karmaStore } from '@/lib/karmaStore';
import { squadStore } from '@/lib/squadStore';
import { AstralProcessing } from './AstralProcessing';
import { CurseCertificate } from './CurseCertificate';

interface RitualModalProps {
  isOpen: boolean;
  realm: KarmaRealm;
  preselectedMember?: SquadMember | null;
  preselectedSquad?: Squad | null;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onDecreeCreated: (verdict: DecreeVerdict) => void;
}

const CATEGORIES: Category[] = [
  'colleague',
  'boss',
  'ex',
  'neighbor',
  'courier',
  'driver',
  'friend',
  'relative',
  'other',
];

export const RitualModal: React.FC<RitualModalProps> = ({
  isOpen,
  realm,
  preselectedMember = null,
  preselectedSquad = null,
  onClose,
  onShowToast,
  onDecreeCreated,
}) => {
  const isDark = realm === 'dark';

  // Wizard step: 1: Target, 2: Reason, 3: Verdict, 4: Processing, 5: Certificate
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => karmaStore.isAuthorized());
  const [squads, setSquads] = useState<Squad[]>(() => squadStore.getSquads());
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(
    preselectedSquad || squads[0] || null
  );

  const [isSquadDropdownOpen, setIsSquadDropdownOpen] = useState(false);

  // Form state
  const [targetName, setTargetName] = useState(preselectedMember?.name || '');
  const [telegramUsername, setTelegramUsername] = useState(preselectedMember?.username || '');
  const [category, setCategory] = useState<Category>('colleague');
  const [reasonText, setReasonText] = useState('');
  
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [blessingLevel, setBlessingLevel] = useState<BlessingLevel>('zen');

  const [selectedCurse, setSelectedCurse] = useState<Curse>(() => getRandomCurse('medium'));
  const [selectedBlessing, setSelectedBlessing] = useState<Blessing>(() => getRandomBlessing('zen'));
  
  const [isCustom, setIsCustom] = useState(false);
  const [customText, setCustomText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hold-to-Stamp State
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const holdIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const startHolding = () => {
    setIsHolding(true);
    let current = 0;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);

    holdIntervalRef.current = setInterval(() => {
      current += 3;
      setHoldProgress(current);
      sound.playRampUpGlow(current / 100);

      if (current === 30) triggerHaptic('light');
      if (current === 60) triggerHaptic('medium');
      if (current === 90) triggerHaptic('heavy');

      if (current >= 100) {
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        handleStartRitual();
      }
    }, 30);
  };

  const stopHolding = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const [verdict, setVerdict] = useState<DecreeVerdict | null>(null);

  useEffect(() => {
    const unsubSquads = squadStore.subscribe(() => {
      const all = squadStore.getSquads();
      setSquads(all);
      if (!selectedSquad && all.length > 0) {
        setSelectedSquad(all[0]);
      }
    });
    const unsubKarma = karmaStore.subscribe(() => {
      setIsAuthorized(karmaStore.isAuthorized());
    });
    return () => {
      unsubSquads();
      unsubKarma();
    };
  }, [selectedSquad]);

  useEffect(() => {
    if (preselectedMember) {
      setTargetName(preselectedMember.name);
      setTelegramUsername(preselectedMember.username || '');
    }
  }, [preselectedMember]);

  if (!isOpen) return null;

  const handleSelectMember = (member: SquadMember) => {
    sound.playClick();
    triggerHaptic('light');
    setTargetName(member.name);
    setTelegramUsername(member.username || '');
    setIsSquadDropdownOpen(false);
    if (errorMsg) setErrorMsg('');
  };

  const handleNextFromStep1 = () => {
    if (!targetName.trim()) {
      setErrorMsg('Укажите имя получателя грамоты!');
      sound.playClick();
      triggerHaptic('error');
      return;
    }
    setErrorMsg('');
    sound.playClick();
    triggerHaptic('light');

    if (!reasonText) {
      if (isDark) {
        setReasonText(getRandomSin(category));
      } else {
        setReasonText(getRandomGoodDeed(category));
      }
    }
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!reasonText.trim()) {
      setErrorMsg(isDark ? 'Опишите деяние для протокола!' : 'Опишите добрый поступок!');
      sound.playClick();
      triggerHaptic('error');
      return;
    }
    setErrorMsg('');
    sound.playClick();
    triggerHaptic('light');
    setStep(3);
  };

  const handleRollRandomReason = () => {
    sound.playDiceRoll();
    triggerHaptic('medium');
    if (isDark) {
      setReasonText(getRandomSin(category));
    } else {
      setReasonText(getRandomGoodDeed(category));
    }
  };

  const handleRollRandomVerdict = () => {
    sound.playDiceRoll();
    triggerHaptic('medium');
    if (isDark) {
      setSelectedCurse(getRandomCurse(severity, category));
    } else {
      setSelectedBlessing(getRandomBlessing(blessingLevel, category));
    }
    setIsCustom(false);
  };

  const handleStartRitual = () => {
    if (isDark) sound.playClick();
    else sound.playCelestialChime();
    triggerHaptic('heavy');

    const profile = karmaStore.getProfile();
    const useGolden = profile.hasGoldenSeal && profile.useGoldenSealForNext;

    const finalTitle = isCustom
      ? isDark ? 'Персональное заклятие' : 'Персональное благословение'
      : isDark ? selectedCurse.title : selectedBlessing.title;

    const finalText = isCustom && customText.trim()
      ? customText
      : isDark ? selectedCurse.description : selectedBlessing.description;

    const newVerdict: DecreeVerdict = {
      id: Math.random().toString(36).substring(2, 10),
      realm,
      squadId: selectedSquad?.id,
      caseNumber: generateCaseNumber(),
      targetName: targetName.trim(),
      telegramUsername: telegramUsername.trim().replace(/^@/, '') || undefined,
      category,
      actionText: reasonText.trim(),
      verdictText: finalText,
      verdictTitle: finalTitle,
      tier: isDark ? severity : blessingLevel,
      createdAt: formatDate(new Date()),
      clerkSignature: isDark ? CLERKS[Math.floor(Math.random() * CLERKS.length)] : 'Хранитель Небесной Благодати',
      sealColor: useGolden ? '#fbbf24' : isDark ? (severity === 'extreme' ? '#f43f5e' : '#f59e0b') : '#fbbf24',
      isGoldenSeal: useGolden,
    };

    if (useGolden) {
      karmaStore.consumeGoldenSeal();
      onShowToast('✨ Золотая Печать Клерка применена к грамоте!', 'success');
    }

    setVerdict(newVerdict);
    setStep(4);

    // Save to global backend
    try {
      fetch('/api/curses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newVerdict.id,
          realm: newVerdict.realm,
          squadId: newVerdict.squadId,
          targetName: newVerdict.targetName,
          telegramUsername: newVerdict.telegramUsername,
          category: newVerdict.category,
          sin: newVerdict.actionText,
          curseTitle: newVerdict.verdictTitle,
          severity: newVerdict.tier,
          verdictText: newVerdict.verdictText,
          clerkSignature: newVerdict.clerkSignature,
          isGoldenSeal: newVerdict.isGoldenSeal,
        }),
      }).catch((e) => console.log('Save error:', e));
    } catch {
      // ignore
    }

    // Scenario A: If recipient is from squad or has Telegram username, send directly to recipient via Bot
    if (newVerdict.telegramUsername) {
      try {
        fetch('/api/telegram/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientUsername: newVerdict.telegramUsername,
            realm: newVerdict.realm,
            targetName: newVerdict.targetName,
            actionText: newVerdict.actionText,
            verdictTitle: newVerdict.verdictTitle,
            verdictText: newVerdict.verdictText,
            decreeId: newVerdict.id,
          }),
        }).catch(() => {});
      } catch {
        // ignore
      }
    }

    if (selectedSquad) {
      squadStore.recordSquadDecree(selectedSquad.id, targetName, realm);
    }

    karmaStore.recordDecreeSent(realm);
  };

  const handleProcessingComplete = () => {
    if (verdict) {
      onDecreeCreated(verdict);
    }
    setStep(5);
  };

  const handleReset = () => {
    setTargetName('');
    setTelegramUsername('');
    setReasonText('');
    setSelectedCurse(getRandomCurse('medium'));
    setSelectedBlessing(getRandomBlessing('zen'));
    setIsCustom(false);
    setCustomText('');
    setStep(1);
    setVerdict(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={
          isShaking
            ? {
                x: [-10, 10, -8, 8, -4, 4, 0],
                y: [-6, 6, -4, 4, -2, 2, 0],
                scale: [1, 1.03, 0.98, 1],
                transition: { duration: 0.45 },
              }
            : { opacity: 1, scale: 1, y: 0 }
        }
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border bg-void-950 my-auto transition-colors ${
          isDark ? 'border-void-700 shadow-altar' : 'border-amber-500/30 shadow-[0_0_50px_rgba(251,191,36,0.15)]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-void-800 px-5 sm:px-6 py-3.5 sm:py-4">
          <div className="flex items-center gap-2">
            {isDark ? <Flame className="w-5 h-5 text-inferno-400" /> : <Sun className="w-5 h-5 text-amber-300" />}
            <span className="font-heading text-sm sm:text-base font-bold text-zinc-100">
              {step === 5
                ? isDark ? 'Официальный Приговор Канцелярии' : 'Грамота Астральной Благодати'
                : isDark ? 'Обряд Наложения Проклятия' : 'Обряд Ниспослания Благодати'}
            </span>
          </div>

          {step !== 4 && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-700 bg-void-900 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stepper Progress */}
        {step <= 3 && (
          <div className="border-b border-void-800 bg-void-900/40 px-5 sm:px-6 py-2.5 sm:py-3">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold">
              <span className={step >= 1 ? (isDark ? 'text-inferno-400' : 'text-amber-300') : 'text-zinc-500'}>
                1. Адресат
              </span>
              <span className="text-zinc-600">→</span>
              <span className={step >= 2 ? (isDark ? 'text-inferno-400' : 'text-amber-300') : 'text-zinc-500'}>
                {isDark ? '2. Грех' : '2. Подвиг'}
              </span>
              <span className="text-zinc-600">→</span>
              <span className={step >= 3 ? (isDark ? 'text-inferno-400' : 'text-amber-300') : 'text-zinc-500'}>
                {isDark ? '3. Кара' : '3. Благодать'}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-void-800 overflow-hidden">
              <motion.div
                className={`h-full ${
                  isDark
                    ? 'bg-gradient-to-r from-inferno-600 to-astral-500'
                    : 'bg-gradient-to-r from-amber-500 via-emerald-400 to-sky-400'
                }`}
                initial={false}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="p-4 sm:p-6">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: TARGET SELECTION (GUEST VS AUTHORIZED) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* AUTHORIZED MODE WITH SQUAD: Show squad member dropdown */}
                {isAuthorized && selectedSquad && selectedSquad.members.length > 0 ? (
                  <div className="relative space-y-3">
                    <div className="relative">
                      <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-karma-gold" />
                          <span>Выбрать из сквада «{selectedSquad.name}»:</span>
                        </span>
                        <span className="text-[10px] text-karma-gold font-sans font-normal">🔒 Анонимно</span>
                      </label>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsSquadDropdownOpen(!isSquadDropdownOpen)}
                          className="w-full flex items-center justify-between rounded-xl border border-void-700 bg-void-900 px-3.5 py-3 text-xs sm:text-sm text-zinc-200 hover:border-karma-gold transition-all font-sans"
                        >
                          <span className="flex items-center gap-2 truncate">
                            {targetName ? (
                              <>
                                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="font-semibold text-white truncate">Выбран: {targetName}</span>
                                {telegramUsername && (
                                  <span className="text-zinc-500 font-mono text-xs">(@{telegramUsername})</span>
                                )}
                              </>
                            ) : (
                              <>
                                <Users className="w-4 h-4 text-zinc-400 shrink-0" />
                                <span className="text-zinc-400">Нажмите для выбора коллеги из сквада...</span>
                              </>
                            )}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isSquadDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {isSquadDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 z-30 mt-1.5 max-h-52 overflow-y-auto rounded-2xl border border-karma-gold/40 bg-void-900/95 p-2 shadow-2xl backdrop-blur-xl">
                            {selectedSquad.members.map((m) => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => handleSelectMember(m)}
                                className="w-full flex items-center justify-between rounded-xl p-2.5 hover:bg-karma-gold/15 hover:text-white transition-colors text-left"
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <span className="text-xl shrink-0">{m.avatar}</span>
                                  <div className="truncate">
                                    <div className="font-heading text-xs font-bold text-white truncate">{m.name}</div>
                                    {m.username && (
                                      <div className="text-[10px] text-zinc-400 font-mono">@{m.username}</div>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                                  🔥 {m.sinsCount} | ✨ {m.blessingsCount}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Manual Input Fallback */}
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Или введите имя стороннего человека вручную:</span>
                      </label>
                      <input
                        type="text"
                        value={targetName}
                        onChange={(e) => {
                          setTargetName(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleNextFromStep1()}
                        placeholder="Например: Курьер с пиццей, Сосед из 44 кв..."
                        maxLength={60}
                        className="w-full rounded-xl border border-void-700 bg-void-900 px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none transition-all font-sans"
                      />
                    </div>
                  </div>
                ) : (
                  /* GUEST MODE OR AUTHORIZED WITHOUT SQUADS: Clean Direct Manual Input ONLY */
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                      Кому вынести вердикт (имя или прозвище):
                    </label>
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => {
                        setTargetName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleNextFromStep1()}
                      placeholder="Например: Марина из бухгалтерии, Сосед с перфоратором, Артём..."
                      maxLength={60}
                      className="w-full rounded-xl border border-void-700 bg-void-900 px-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none transition-all font-sans"
                    />
                  </div>
                )}

                {/* Telegram Username (Optional for direct messaging) */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono flex items-center justify-between">
                    <span>Telegram @username (для отправки в личные сообщения):</span>
                    <span className="text-[10px] text-zinc-500 font-sans">опционально</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">@</span>
                    <input
                      type="text"
                      value={telegramUsername}
                      onChange={(e) => setTelegramUsername(e.target.value.replace(/^@/, ''))}
                      placeholder="username (без @)"
                      maxLength={32}
                      className="w-full rounded-xl border border-void-700 bg-void-900 pl-8 pr-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Category Chips */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    Категория отношений:
                  </label>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {CATEGORIES.map((cat) => {
                      const item = CATEGORY_LABELS[cat];
                      const isSelected = category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            setCategory(cat);
                          }}
                          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                            isSelected
                              ? isDark
                                ? 'border-inferno-500 bg-inferno-500/15 text-inferno-300 shadow-glow-crimson'
                                : 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-glow-gold'
                              : 'border-void-700 bg-void-900 text-zinc-400 hover:border-void-600 hover:text-zinc-200'
                          }`}
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 1 Next Button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextFromStep1}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all font-heading hover:scale-105 active:scale-95 ${
                      isDark
                        ? 'bg-gradient-to-r from-inferno-600 to-inferno-500 shadow-glow-crimson'
                        : 'bg-gradient-to-r from-amber-500 to-emerald-500 shadow-glow-gold text-void-950'
                    }`}
                  >
                    <span>Далее: {isDark ? 'Указать грех' : 'Указать доброе дело'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: REASON */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-inferno-400' : 'text-amber-300'}`} />
                      {isDark ? 'Что он(а) натворил(а)?' : 'За что благодарим?'}
                    </h3>
                  </div>

                  <button
                    onClick={handleRollRandomReason}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-2.5 py-1.5 text-xs font-semibold text-astral-400 hover:border-astral-500 hover:bg-void-850 active:scale-95 transition-all"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>Случайный вариант</span>
                  </button>
                </div>

                <div>
                  <textarea
                    value={reasonText}
                    onChange={(e) => {
                      setReasonText(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder={isDark ? 'Например: Греет минтай с луком в офисной микроволновке...' : 'Например: Прикрыл на созвоне перед генеральным...'}
                    rows={3}
                    maxLength={180}
                    className="w-full rounded-xl border border-void-700 bg-void-900 p-3.5 text-sm text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none transition-all resize-none font-sans"
                  />
                  <div className="mt-1 text-right text-[10px] text-zinc-500 font-mono">
                    {reasonText.length}/180 символов
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStep(1);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  <button
                    onClick={handleNextFromStep2}
                    className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all font-heading hover:scale-105 active:scale-95 ${
                      isDark
                        ? 'bg-gradient-to-r from-inferno-600 to-inferno-500 text-white shadow-glow-crimson'
                        : 'bg-gradient-to-r from-amber-500 to-emerald-500 text-void-950 shadow-glow-gold'
                    }`}
                  >
                    <span>Далее: {isDark ? 'Выбрать кару' : 'Выбрать благословение'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: VERDICT SELECTION */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-karma-gold' : 'text-amber-300'}`} />
                    {isDark ? 'Какую кару определим?' : 'Какое благословение ниспошлем?'}
                  </h3>
                </div>

                <div className="rounded-2xl border border-void-700 bg-void-900 p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-heading ${
                      isDark ? 'text-inferno-400' : 'text-amber-300'
                    }`}>
                      <span>{isDark ? selectedCurse.icon : selectedBlessing.icon}</span>
                      <span>{isDark ? selectedCurse.title : selectedBlessing.title}</span>
                    </span>

                    <button
                      onClick={handleRollRandomVerdict}
                      className="flex items-center gap-1.5 rounded-lg border border-void-700 bg-void-850 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-astral-500 hover:text-white transition-all"
                    >
                      <Dices className="w-3.5 h-3.5 text-astral-400" />
                      <span>Случайный выбор</span>
                    </button>
                  </div>

                  {!isCustom ? (
                    <p className="text-sm font-medium text-zinc-100 italic leading-relaxed font-sans">
                      «{isDark ? selectedCurse.description : selectedBlessing.description}»
                    </p>
                  ) : (
                    <textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Напишите собственный текст..."
                      rows={2}
                      maxLength={140}
                      className="w-full rounded-lg border border-void-700 bg-void-950 p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-sans"
                    />
                  )}

                  <div className="mt-3 pt-2 border-t border-void-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsCustom(!isCustom);
                        if (!isCustom && !customText) {
                          setCustomText(isDark ? selectedCurse.description : selectedBlessing.description);
                        }
                      }}
                      className="text-[11px] text-zinc-400 hover:text-astral-400 underline font-sans"
                    >
                      {isCustom ? 'Вернуться к готовым вариантам' : 'Сформулировать вручную'}
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStep(2);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  {/* Instant 1-Click Seal Button */}
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSealStamp();
                      triggerHaptic('heavy');
                      setIsShaking(true);
                      setTimeout(() => setIsShaking(false), 400);
                      handleStartRitual();
                    }}
                    className={`relative flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-bold transition-all font-heading hover:scale-105 active:scale-95 shadow-xl ${
                      isDark
                        ? 'bg-gradient-to-r from-inferno-700 via-inferno-600 to-amber-600 text-white shadow-glow-crimson'
                        : 'bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 text-void-950 shadow-glow-gold'
                    }`}
                  >
                    {isDark ? (
                      <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
                    ) : (
                      <Sun className="w-4 h-4 text-void-950 animate-pulse" />
                    )}
                    <span className="font-black tracking-wide">
                      {isDark ? '🔥 Утвердить печать' : '✨ Ниспослать благодать'}
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: ASTRAL PROCESSING */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AstralProcessing onComplete={handleProcessingComplete} />
              </motion.div>
            )}

            {/* STEP 5: CERTIFICATE */}
            {step === 5 && verdict && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <CurseCertificate
                  verdict={verdict}
                  onReset={handleReset}
                  onShowToast={onShowToast}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
