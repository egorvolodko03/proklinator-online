'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Sun, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Radio, 
  TrendingUp, 
  Scale, 
  RefreshCw, 
  Heart,
  ScrollText,
  UserCheck
} from 'lucide-react';
import { KarmaFeedItem, DecreeVerdict } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';

interface KarmaDashboardProps {
  onSelectDecree?: (verdict: DecreeVerdict) => void;
}

export const KarmaDashboard: React.FC<KarmaDashboardProps> = ({ onSelectDecree }) => {
  const [curses, setCurses] = useState<KarmaFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Только что');

  const fetchLiveFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/curses');
      const data = await res.json();
      if (data.success && data.curses) {
        setCurses(data.curses);
        setLastUpdated(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Initial fetch and auto-polling every 6 seconds for dynamic live feed
  useEffect(() => {
    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 6000);
    return () => clearInterval(interval);
  }, [fetchLiveFeed]);

  const handleManualRefresh = async () => {
    sound.playClick();
    triggerHaptic('light');
    setIsLoading(true);
    await fetchLiveFeed();
    setIsLoading(false);
  };

  // Real calculated metrics from actual user data
  const totalCount = curses.length;
  const darkCount = curses.filter((c) => (c.realm || 'dark') === 'dark').length;
  const lightCount = curses.filter((c) => c.realm === 'light').length;
  const darkPercent = totalCount > 0 ? Math.round((darkCount / totalCount) * 100) : 50;
  const lightPercent = 100 - darkPercent;

  return (
    <section id="karma-dashboard" className="mx-auto max-w-6xl px-3 sm:px-6 py-10 sm:py-16 border-t border-void-800/80">
      {/* Live Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-karma-gold/30 bg-karma-gold/10 px-3.5 py-1 text-xs font-semibold text-karma-gold mb-3 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Живой поток Канцелярии (Live Stream)</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Единая Лента Активности
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl font-sans leading-relaxed">
            Хронологический поток всех реально вынесенных проклятий и ниспосланных благословений.
          </p>
        </div>

        {/* Live Refresh Status */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-[11px] text-zinc-500 font-mono">
            Обновлено: {lastUpdated}
          </span>

          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-void-700 bg-void-900/90 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-karma-gold hover:text-white active:scale-95 transition-all font-heading"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-karma-gold' : 'text-zinc-400'}`} />
            <span>{isLoading ? 'Обновление...' : 'Обновить ленту'}</span>
          </button>
        </div>
      </div>

      {/* Real Statistics & Karma Meter (Only shown when there are actual user decrees) */}
      {totalCount > 0 && (
        <div className="space-y-6 mb-8">
          {/* Global Balance Meter */}
          <div className="rounded-2xl border border-void-800 bg-void-950/80 p-4 sm:p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs font-semibold mb-2 font-mono">
              <span className="flex items-center gap-1.5 text-inferno-400">
                <Flame className="w-4 h-4" />
                <span>Тьма: {darkCount} ({darkPercent}%)</span>
              </span>
              <span className="flex items-center gap-1 text-zinc-400 font-heading text-[11px]">
                <Scale className="w-3.5 h-3.5 text-karma-gold" />
                <span>Баланс Сил</span>
              </span>
              <span className="flex items-center gap-1.5 text-amber-300">
                <Sun className="w-4 h-4" />
                <span>Свет: {lightCount} ({lightPercent}%)</span>
              </span>
            </div>

            <div className="h-2.5 w-full rounded-full bg-void-800 overflow-hidden flex shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-inferno-600 to-red-500 h-full shadow-[0_0_10px_rgba(255,77,40,0.5)]"
                initial={false}
                animate={{ width: `${darkPercent}%` }}
                transition={{ duration: 0.4 }}
              />
              <motion.div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                initial={false}
                animate={{ width: `${lightPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3.5 rounded-2xl border border-void-800 bg-void-950/80 p-4 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-karma-gold/15 text-karma-gold border border-karma-gold/30">
                <ScrollText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-heading font-black text-white">
                  {totalCount}
                </div>
                <div className="text-xs font-medium text-zinc-400 font-sans">Реальных деяний в реестре</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-void-800 bg-void-950/80 p-4 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-inferno-500/15 text-inferno-400 border border-inferno-500/30">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-heading font-black text-white">
                  {darkCount}
                </div>
                <div className="text-xs font-medium text-zinc-400 font-sans">Наложено кар и приговоров</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-void-800 bg-void-950/80 p-4 backdrop-blur-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-heading font-black text-white">
                  {lightCount}
                </div>
                <div className="text-xs font-medium text-zinc-400 font-sans">Ниспослано благословений</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE UNIFIED LIVE STREAM (NO CATEGORIES / NO SPLIT TABS) */}
      {curses.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {curses.map((item, idx) => {
              const category = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;
              const isDarkItem = (item.realm || 'dark') === 'dark';

              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => {
                    if (onSelectDecree) {
                      sound.playClick();
                      triggerHaptic('light');
                      onSelectDecree({
                        id: item.id,
                        realm: item.realm,
                        caseNumber: `№ КРМ-${item.id.toUpperCase().slice(0, 4)}-Г`,
                        targetName: item.targetName,
                        telegramUsername: item.telegramUsername,
                        category: item.category,
                        actionText: item.sin,
                        verdictText: item.curseTitle,
                        verdictTitle: item.curseTitle,
                        tier: item.severity as any,
                        createdAt: item.timeAgo || 'Только что',
                        clerkSignature: isDarkItem ? 'Архивариус Трибунала' : 'Хранитель Благодати',
                        sealColor: isDarkItem ? '#ff4d28' : '#fbbf24',
                      });
                    }
                  }}
                  className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 backdrop-blur-md transition-all hover:shadow-card-gothic group cursor-pointer ${
                    isDarkItem
                      ? 'border-void-800 bg-void-950/80 hover:border-inferno-500/50 hover:bg-void-900/90'
                      : 'border-amber-500/20 bg-void-950/80 hover:border-amber-400/50 hover:bg-slate-900/90'
                  }`}
                >
                  <div>
                    {/* Top Meta Bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-void-800/90 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 font-sans">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{item.timeAgo}</span>
                      </span>
                    </div>

                    {/* Target Name */}
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="font-heading text-base font-bold text-white group-hover:text-amber-200 transition-colors truncate">
                        {item.targetName}
                      </h4>
                      {item.telegramUsername && (
                        <span className="text-[10px] font-mono text-astral-400 bg-astral-500/10 px-1.5 py-0.5 rounded border border-astral-500/20 shrink-0 ml-2">
                          @{item.telegramUsername}
                        </span>
                      )}
                    </div>

                    {/* Action / Sin Reason */}
                    <p className="text-xs text-zinc-300 italic mb-4 line-clamp-3 leading-relaxed font-sans">
                      «{item.sin}»
                    </p>
                  </div>

                  {/* Verdict / Blessing Bottom Box */}
                  <div className={`rounded-xl border p-3 ${
                    isDarkItem
                      ? 'border-inferno-500/30 bg-gradient-to-r from-inferno-950/40 to-void-900'
                      : 'border-amber-500/30 bg-gradient-to-r from-amber-950/30 to-void-900'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider font-mono ${
                        isDarkItem ? 'text-inferno-400' : 'text-amber-300'
                      }`}>
                        {isDarkItem ? <ShieldAlert className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                        <span>{isDarkItem ? 'Приговор:' : 'Благодать:'}</span>
                      </span>
                      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-void-800 text-zinc-400">
                        {isDarkItem ? '🔥 Кара' : '✨ Свет'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white font-sans truncate">
                      {item.curseTitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Zero-State: Registry is clean and waiting for the first decree */
        <div className="py-16 text-center rounded-3xl border border-dashed border-void-800 bg-void-950/40 p-6 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-void-900 border border-void-800 text-karma-gold mx-auto mb-3">
            <Sparkles className="w-7 h-7 animate-pulse text-karma-gold" />
          </div>
          <h4 className="font-heading text-base sm:text-lg font-bold text-white mb-1">
            Астральный реестр чист
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-md mx-auto leading-relaxed">
            Вынесите первое проклятие или благословение выше, и оно мгновенно появится в едином живом потоке канцелярии!
          </p>
        </div>
      )}
    </section>
  );
};
