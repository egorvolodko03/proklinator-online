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
  Link,
  AtSign,
  ShieldCheck
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

  // Delivery mode: 'squad' (100% anonymous inside guild) or 'direct' (link with sender invitation)
  const [deliveryMode, setDeliveryMode] = useState<'squad' | 'direct'>(
    preselectedMember ? 'squad' : 'direct'
  );

  const [squads, setSquads] = useState<Squad[]>(() => squadStore.getSquads());
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(
    preselectedSquad || squads[0] || null
  );

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

  const [verdict, setVerdict] = useState<DecreeVerdict | null>(null);

  useEffect(() => {
    if (preselectedMember) {
      setTargetName(preselectedMember.name);
      setTelegramUsername(preselectedMember.username || '');
      setDeliveryMode('squad');
    }
  }, [preselectedMember]);

  if (!isOpen) return null;

  const handleNextFromStep1 = () => {
    if (!targetName.trim()) {
      setErrorMsg('Укажите имя или выберите коллегу из сквада!');
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
      setErrorMsg(isDark ? 'Опишите грех обидчика!' : 'Опишите доброе деяние человека!');
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

    const finalTitle = isCustom
      ? isDark ? 'Персональное заклятие' : 'Персональное благословение'
      : isDark ? selectedCurse.title : selectedBlessing.title;

    const finalText = isCustom && customText.trim()
      ? customText
      : isDark ? selectedCurse.description : selectedBlessing.description;

    const newVerdict: DecreeVerdict = {
      id: Math.random().toString(36).substring(2, 10),
      realm,
      squadId: deliveryMode === 'squad' ? selectedSquad?.id : undefined,
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
      sealColor: isDark ? (severity === 'extreme' ? '#f43f5e' : '#f59e0b') : '#fbbf24',
    };

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
        }),
      }).catch((e) => console.log('Background save error:', e));
    } catch {
      // ignore
    }

    // If squad delivery, record inside squad
    if (deliveryMode === 'squad' && selectedSquad) {
      squadStore.recordSquadDecree(selectedSquad.id, targetName, realm);
    }

    // Award user coins & experience
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border bg-void-950 my-auto ${
          isDark ? 'border-void-700 shadow-altar' : 'border-amber-500/30 shadow-[0_0_50px_rgba(251,191,36,0.15)]'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-void-800 px-6 py-4">
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
          <div className="border-b border-void-800 bg-void-900/40 px-6 py-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className={step >= 1 ? (isDark ? 'text-inferno-400' : 'text-amber-300') : 'text-zinc-500'}>
                1. Адресат & Канал
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
        <div className="p-6">
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
            {/* STEP 1: TARGET & 2-STAGE DELIVERY CHANNEL */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* 2-Stage Verification Channel Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                    Канал отправки вердикта:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setDeliveryMode('squad');
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                        deliveryMode === 'squad'
                          ? 'border-karma-gold bg-karma-gold/15 shadow-glow-gold'
                          : 'border-void-800 bg-void-900/80 text-zinc-400 hover:border-void-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-white mb-1">
                        <Users className="w-4 h-4 text-karma-gold" />
                        <span>Внутри Сквада</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-sans leading-tight">
                        100% Анонимно проверенному коллеге из офиса
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setDeliveryMode('direct');
                      }}
                      className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                        deliveryMode === 'direct'
                          ? 'border-karma-gold bg-karma-gold/15 shadow-glow-gold'
                          : 'border-void-800 bg-void-900/80 text-zinc-400 hover:border-void-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-heading text-xs font-bold text-white mb-1">
                        <Link className="w-4 h-4 text-sky-400" />
                        <span>Прямая ссылка другу</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-sans leading-tight">
                        Персональный шеринг в Telegram без спама
                      </span>
                    </button>
                  </div>
                </div>

                {/* If SQUAD mode: Member Selection from Squad */}
                {deliveryMode === 'squad' && selectedSquad && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                      <span>Выберите коллегу из «{selectedSquad.name}»:</span>
                      <span className="text-[10px] text-karma-gold font-sans font-normal">🔒 Анонимно</span>
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                      {selectedSquad.members.map((m) => {
                        const isSelected = targetName === m.name;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              sound.playClick();
                              setTargetName(m.name);
                              setTelegramUsername(m.username || '');
                              if (errorMsg) setErrorMsg('');
                            }}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                              isSelected
                                ? 'border-inferno-500 bg-inferno-500/20 text-white shadow-glow-crimson'
                                : 'border-void-800 bg-void-900 text-zinc-300 hover:border-void-700'
                            }`}
                          >
                            <span>{m.avatar}</span>
                            <span>{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* If DIRECT mode: Manual Name Input */}
                {deliveryMode === 'direct' && (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                      Имя / Псевдоним адресата:
                    </label>
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => {
                        setTargetName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleNextFromStep1()}
                      placeholder="Например: Марина из бухгалтерии, Сосед с 44-й кв., Друг..."
                      maxLength={60}
                      autoFocus
                      className="w-full rounded-xl border border-void-700 bg-void-900 px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none transition-all font-sans"
                    />
                  </div>
                )}

                {/* Category Chips */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">
                    Категория:
                  </label>
                  <div className="flex flex-wrap gap-2">
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
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
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

                {/* Step 1 Actions */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextFromStep1}
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition-all font-heading hover:scale-105 active:scale-95 ${
                      isDark
                        ? 'bg-gradient-to-r from-inferno-600 to-inferno-500 shadow-glow-crimson'
                        : 'bg-gradient-to-r from-amber-500 to-emerald-500 shadow-glow-gold text-void-950'
                    }`}
                  >
                    <span>Далее: {isDark ? 'Зафиксировать грех' : 'Указать доброе дело'}</span>
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
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                      <FileText className={`w-5 h-5 ${isDark ? 'text-inferno-400' : 'text-amber-300'}`} />
                      {isDark ? 'Что он(а) натворил(а)?' : 'За что благодарим?'}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400 font-sans">
                      {isDark ? 'Сформулируйте суть деяния для протокола.' : 'Опишите добрый поступок или приятный момент.'}
                    </p>
                  </div>

                  <button
                    onClick={handleRollRandomReason}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-3 py-2 text-xs font-semibold text-astral-400 hover:border-astral-500 hover:bg-void-850 active:scale-95 transition-all"
                  >
                    <Dices className="w-4 h-4" />
                    <span>Случайный вариант</span>
                  </button>
                </div>

                {/* Reason Textarea */}
                <div>
                  <textarea
                    value={reasonText}
                    onChange={(e) => {
                      setReasonText(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder={isDark ? 'Например: Игнорит в почте 2 недели...' : 'Например: Скинул правки без правок и угостил кофе...'}
                    rows={3}
                    maxLength={180}
                    className="w-full rounded-xl border border-void-700 bg-void-900 p-4 text-sm text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none transition-all resize-none font-sans"
                  />
                  <div className="mt-1 text-right text-[11px] text-zinc-500 font-mono">
                    {reasonText.length}/180 символов
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStep(1);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  <button
                    onClick={handleNextFromStep2}
                    className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all font-heading hover:scale-105 active:scale-95 ${
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
                className="space-y-5"
              >
                <div>
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className={`w-5 h-5 ${isDark ? 'text-karma-gold' : 'text-amber-300'}`} />
                    {isDark ? 'Какую кару определим?' : 'Какое благословение ниспошлем?'}
                  </h3>
                </div>

                {/* Selected Item Box */}
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

                {/* Step 3 Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStep(2);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  <button
                    onClick={handleStartRitual}
                    className={`flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold transition-all font-heading hover:scale-105 active:scale-95 ${
                      isDark
                        ? 'bg-gradient-to-r from-inferno-600 via-inferno-500 to-astral-600 text-white shadow-glow-crimson'
                        : 'bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 text-void-950 shadow-glow-gold'
                    }`}
                  >
                    {isDark ? <Flame className="w-4 h-4 text-yellow-300" /> : <Sun className="w-4 h-4" />}
                    <span>{isDark ? 'Наложить печать канцелярии' : 'Утвердить печать благодати'}</span>
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
