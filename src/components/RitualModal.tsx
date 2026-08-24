'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Dices, 
  Flame, 
  User, 
  FileText, 
  Sparkles, 
  Check, 
  AlertCircle,
  Skull,
  Zap,
  HelpCircle
} from 'lucide-react';
import { Category, Curse, CurseVerdict, SeverityLevel } from '@/types';
import { CATEGORY_LABELS, CLERKS, generateCaseNumber, formatDate } from '@/lib/utils';
import { CURSES, getRandomCurse } from '@/data/curses';
import { getRandomSin } from '@/data/sins';
import { sound } from '@/lib/audio';
import { AstralProcessing } from './AstralProcessing';
import { CurseCertificate } from './CurseCertificate';

interface RitualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (text: string, type?: 'success' | 'info' | 'error') => void;
  onCurseCreated: (verdict: CurseVerdict) => void;
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

const SEVERITY_OPTIONS: {
  level: SeverityLevel;
  title: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  description: string;
  example: string;
}[] = [
  {
    level: 'light',
    title: 'Легкий дискомфорт',
    badge: '🟢 Уровень 1',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'hover:border-emerald-500/50 data-[selected=true]:border-emerald-500',
    description: 'Мелкие бытовые неурядицы, которые бесят до скрипа зубов.',
    example: '«Пусть USB-флешка входит только с 3-го раза»',
  },
  {
    level: 'medium',
    title: 'Офисный ад',
    badge: '🟡 Уровень 2',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'hover:border-amber-500/50 data-[selected=true]:border-amber-500',
    description: 'Корпоративные конфузы, провалы в зуме и битые таблицы.',
    example: '«Пусть микрофон включится, когда жуешь шаурму»',
  },
  {
    level: 'extreme',
    title: 'Кармический крах',
    badge: '🔴 Уровень 3',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'hover:border-rose-500/50 data-[selected=true]:border-rose-500',
    description: 'Максимальное возмездие. Полный экзистенциальный провал.',
    example: '«Пусть левый носок сползает под пятку через каждые 50 шагов»',
  },
];

export const RitualModal: React.FC<RitualModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onCurseCreated,
}) => {
  // Wizard state: 1: Target, 2: Sin, 3: Curse, 4: Processing, 5: Certificate
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form state
  const [targetName, setTargetName] = useState('');
  const [category, setCategory] = useState<Category>('colleague');
  const [sin, setSin] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('medium');
  const [selectedCurse, setSelectedCurse] = useState<Curse>(() => getRandomCurse('medium'));
  const [isCustomCurse, setIsCustomCurse] = useState(false);
  const [customCurseText, setCustomCurseText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Generated verdict
  const [verdict, setVerdict] = useState<CurseVerdict | null>(null);

  if (!isOpen) return null;

  const handleNextFromStep1 = () => {
    if (!targetName.trim()) {
      setErrorMsg('Укажите имя или псевдоним субъекта!');
      sound.playClick();
      return;
    }
    setErrorMsg('');
    sound.playClick();
    if (!sin) {
      setSin(getRandomSin(category));
    }
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    if (!sin.trim()) {
      setErrorMsg('Опишите грех обидчика перед канцелярией!');
      sound.playClick();
      return;
    }
    setErrorMsg('');
    sound.playClick();
    setStep(3);
  };

  const handleRollRandomSin = () => {
    sound.playDiceRoll();
    const newSin = getRandomSin(category);
    setSin(newSin);
  };

  const handleSelectSeverity = (sev: SeverityLevel) => {
    sound.playClick();
    setSeverity(sev);
    const newCurse = getRandomCurse(sev);
    setSelectedCurse(newCurse);
    setIsCustomCurse(false);
  };

  const handleRollRandomCurse = () => {
    sound.playDiceRoll();
    const newCurse = getRandomCurse(severity);
    setSelectedCurse(newCurse);
    setIsCustomCurse(false);
  };

  const handleStartSummoning = () => {
    sound.playClick();
    const finalCurseText = isCustomCurse && customCurseText.trim() 
      ? customCurseText 
      : selectedCurse.description;
    const finalCurseTitle = isCustomCurse ? 'Персональное заклятие' : selectedCurse.title;

    const newVerdict: CurseVerdict = {
      id: Math.random().toString(36).substring(2, 10),
      caseNumber: generateCaseNumber(),
      targetName: targetName.trim(),
      category,
      sin: sin.trim(),
      curseText: finalCurseText,
      curseTitle: finalCurseTitle,
      severity,
      createdAt: formatDate(new Date()),
      clerkSignature: CLERKS[Math.floor(Math.random() * CLERKS.length)],
      sealColor: severity === 'extreme' ? '#f43f5e' : severity === 'medium' ? '#f59e0b' : '#10b981',
    };

    setVerdict(newVerdict);
    setStep(4);
  };

  const handleProcessingComplete = () => {
    if (verdict) {
      onCurseCreated(verdict);
    }
    setStep(5);
  };

  const handleReset = () => {
    setTargetName('');
    setSin('');
    setSeverity('medium');
    setSelectedCurse(getRandomCurse('medium'));
    setIsCustomCurse(false);
    setCustomCurseText('');
    setStep(1);
    setVerdict(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-void-700 bg-void-950 shadow-altar my-auto"
      >
        {/* Modal Top Header with Close */}
        <div className="flex items-center justify-between border-b border-void-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-inferno-400" />
            <span className="font-serif text-sm sm:text-base font-bold text-zinc-100">
              {step === 5 ? 'Официальный Приговор Канцелярии' : 'Обряд Наложения Проклятия'}
            </span>
          </div>

          {step !== 4 && (
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-void-700 bg-void-900 text-zinc-400 hover:text-white hover:border-void-600 active:scale-90"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stepper Progress Bar (for Steps 1-3) */}
        {step <= 3 && (
          <div className="border-b border-void-800 bg-void-900/40 px-6 py-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className={step >= 1 ? 'text-inferno-400' : 'text-zinc-500'}>
                1. Жертва
              </span>
              <span className="text-zinc-600">→</span>
              <span className={step >= 2 ? 'text-inferno-400' : 'text-zinc-500'}>
                2. Грех
              </span>
              <span className="text-zinc-600">→</span>
              <span className={step >= 3 ? 'text-inferno-400' : 'text-zinc-500'}>
                3. Кара
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-void-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-inferno-600 to-astral-500"
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
            {/* STEP 1: TARGET */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-inferno-400" />
                    Кого проклинаем?
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Укажите имя, должность или прозвище человека, который пошатнул ваше душевное равновесие.
                  </p>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Имя / Псевдоним субъекта:
                  </label>
                  <input
                    type="text"
                    value={targetName}
                    onChange={(e) => {
                      setTargetName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNextFromStep1()}
                    placeholder="Например: Марина из бухгалтерии, Сосед с дрелью, Бывший..."
                    maxLength={60}
                    autoFocus
                    className="w-full rounded-xl border border-void-700 bg-void-900 px-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:border-inferno-500 focus:outline-none focus:ring-2 focus:ring-inferno-500/20 transition-all"
                  />
                </div>

                {/* Quick Category Chips */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Категория нарушителя:
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
                          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                            isSelected
                              ? 'border-inferno-500 bg-inferno-500/15 text-inferno-300 shadow-glow-crimson'
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
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-inferno-600 to-inferno-500 px-6 py-3 text-sm font-bold text-white shadow-glow-crimson hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Далее: Зафиксировать грех</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SIN */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-inferno-400" />
                      Что он(а) сделал(а)?
                    </h3>
                    <p className="mt-1 text-xs text-zinc-400">
                      Сформулируйте суть деяния для протокола канцелярии.
                    </p>
                  </div>

                  {/* Random Sin Dice */}
                  <button
                    onClick={handleRollRandomSin}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-3 py-2 text-xs font-semibold text-astral-400 hover:border-astral-500 hover:bg-void-850 hover:shadow-glow-violet active:scale-95 transition-all"
                    title="Случайный грех"
                  >
                    <Dices className="w-4 h-4" />
                    <span>Случайный грех</span>
                  </button>
                </div>

                {/* Sin Textarea */}
                <div>
                  <textarea
                    value={sin}
                    onChange={(e) => {
                      setSin(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Например: Игнорит в почте 2 недели, а потом пишет 'актуально?'..."
                    rows={3}
                    maxLength={180}
                    className="w-full rounded-xl border border-void-700 bg-void-900 p-4 text-sm text-white placeholder-zinc-500 focus:border-inferno-500 focus:outline-none focus:ring-2 focus:ring-inferno-500/20 transition-all resize-none"
                  />
                  <div className="mt-1 text-right text-[11px] text-zinc-500">
                    {sin.length}/180 символов
                  </div>
                </div>

                {/* Popular Quick Sin Suggestions */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Популярные грехи из протоколов:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      'Игнорит в почте 2 недели и потом пишет "актуально?"',
                      'Записывает 7-минутные голосовые без темы и пауз',
                      'Сверлит несущую стену в воскресенье ровно в 8:00 утра',
                      'Ставит созвон на 18:30 в пятницу со словами "на 5 минут"',
                    ].map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          sound.playClick();
                          setSin(s);
                          setErrorMsg('');
                        }}
                        className="block w-full text-left rounded-lg border border-void-800 bg-void-900/60 px-3 py-2 text-xs text-zinc-300 hover:border-inferno-500/40 hover:bg-void-850 hover:text-white transition-all"
                      >
                        ⚡ «{s}»
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2 Actions */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setStep(1);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  <button
                    onClick={handleNextFromStep2}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-inferno-600 to-inferno-500 px-6 py-3 text-sm font-bold text-white shadow-glow-crimson hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>Далее: Выбрать кару</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: THE CURSE */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-karma-gold" />
                    Какую кару выберем?
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Выберите степень кармической строгости и определите приговор.
                  </p>
                </div>

                {/* 3 Severity Tiers */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {SEVERITY_OPTIONS.map((opt) => {
                    const isSelected = severity === opt.level;
                    return (
                      <div
                        key={opt.level}
                        data-selected={isSelected}
                        onClick={() => handleSelectSeverity(opt.level)}
                        className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all ${
                          isSelected
                            ? 'border-inferno-500 bg-inferno-500/10 shadow-glow-crimson'
                            : 'border-void-800 bg-void-900 hover:border-void-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${opt.badgeColor}`}>
                            {opt.badge}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-inferno-400" />}
                        </div>
                        <h4 className="font-serif text-xs font-bold text-white mb-1">
                          {opt.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Current Selected Curse Card */}
                <div className="rounded-2xl border border-void-700 bg-void-900 p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-inferno-400 flex items-center gap-1.5">
                      <span>{selectedCurse.icon}</span>
                      <span>{selectedCurse.title}</span>
                    </span>

                    {/* Random Roll Button */}
                    <button
                      onClick={handleRollRandomCurse}
                      className="flex items-center gap-1.5 rounded-lg border border-void-700 bg-void-850 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:border-astral-500 hover:text-white hover:shadow-glow-violet active:scale-95 transition-all"
                    >
                      <Dices className="w-3.5 h-3.5 text-astral-400" />
                      <span>🎲 Случайная кара</span>
                    </button>
                  </div>

                  {!isCustomCurse ? (
                    <p className="font-serif text-sm font-medium text-zinc-100 italic leading-relaxed">
                      «{selectedCurse.description}»
                    </p>
                  ) : (
                    <textarea
                      value={customCurseText}
                      onChange={(e) => setCustomCurseText(e.target.value)}
                      placeholder="Напишите собственную абсурдную кару..."
                      rows={2}
                      maxLength={140}
                      className="w-full rounded-lg border border-void-700 bg-void-950 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-inferno-500 focus:outline-none"
                    />
                  )}

                  {/* Toggle Custom Curse */}
                  <div className="mt-3 pt-2 border-t border-void-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setIsCustomCurse(!isCustomCurse);
                        if (!isCustomCurse && !customCurseText) {
                          setCustomCurseText(selectedCurse.description);
                        }
                      }}
                      className="text-[11px] text-zinc-400 hover:text-astral-400 underline transition-colors"
                    >
                      {isCustomCurse ? 'Вернуться к готовым вариантам' : 'Сформулировать свою кару вручную'}
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
                    className="flex items-center gap-1.5 rounded-xl border border-void-700 bg-void-900 px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  <button
                    onClick={handleStartSummoning}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-inferno-600 via-inferno-500 to-astral-600 px-7 py-3 text-sm font-bold text-white shadow-glow-crimson hover:scale-105 active:scale-95 transition-all"
                  >
                    <Flame className="w-4 h-4 text-yellow-300" />
                    <span>Наложить печать канцелярии</span>
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
