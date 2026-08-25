'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Sun,
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Search, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw,
  Heart,
  Scale
} from 'lucide-react';
import { KarmaFeedItem, Category, KarmaRealm, DecreeVerdict } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { INITIAL_FEED } from '@/data/feed';
import { sound } from '@/lib/audio';
import { triggerHaptic } from '@/lib/telegram';

interface KarmaDashboardProps {
  curses?: KarmaFeedItem[];
  totalCount?: number;
  onRefresh?: () => void;
  isLoading?: boolean;
  onSelectDecree?: (verdict: DecreeVerdict) => void;
}

const CATEGORY_FILTERS: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Все записи', icon: '⚡' },
  { id: 'colleague', label: 'Коллеги', icon: '💼' },
  { id: 'boss', label: 'Начальники', icon: '👑' },
  { id: 'neighbor', label: 'Соседи', icon: '🔨' },
  { id: 'ex', label: 'Бывшие', icon: '💔' },
  { id: 'driver', label: 'Автохамы', icon: '🚗' },
  { id: 'courier', label: 'Курьеры', icon: '🛵' },
  { id: 'friend', label: 'Друзья', icon: '🐍' },
];

export const KarmaDashboard: React.FC<KarmaDashboardProps> = ({
  curses: initialCurses,
  totalCount: initialTotal,
  onRefresh: externalRefresh,
  isLoading: externalLoading = false,
  onSelectDecree,
}) => {
  const [curses, setCurses] = useState<KarmaFeedItem[]>(initialCurses || INITIAL_FEED);
  const [totalCount, setTotalCount] = useState<number>(initialTotal || 1287);
  const [isLoading, setIsLoading] = useState(externalLoading);

  const [activeTab, setActiveTab] = useState<KarmaRealm | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGlobalCurses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/curses');
      const data = await res.json();
      if (data.success && data.curses) {
        setCurses(data.curses);
        setTotalCount(data.totalCount || data.curses.length + 1280);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialCurses) {
      fetchGlobalCurses();
    }
  }, [initialCurses, fetchGlobalCurses]);

  const handleRefresh = () => {
    sound.playClick();
    triggerHaptic('light');
    if (externalRefresh) {
      externalRefresh();
    } else {
      fetchGlobalCurses();
    }
  };

  // Count dark vs light decrees
  const darkCount = curses.filter((c) => (c.realm || 'dark') === 'dark').length;
  const lightCount = curses.filter((c) => c.realm === 'light').length;
  const darkPercent = Math.round((darkCount / (curses.length || 1)) * 100);
  const lightPercent = 100 - darkPercent;

  // Filtered curses
  const filteredCurses = useMemo(() => {
    return curses.filter((item) => {
      const matchRealm = activeTab === 'all' || (item.realm || 'dark') === activeTab;
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchQuery =
        searchQuery === '' ||
        item.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.curseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRealm && matchCat && matchQuery;
    });
  }, [curses, activeTab, selectedCategory, searchQuery]);

  return (
    <section id="karma-dashboard" className="mx-auto max-w-6xl px-2 sm:px-4 py-8 sm:py-16 border-t border-void-800">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-karma-gold/30 bg-karma-gold/10 px-3.5 py-1 text-xs font-semibold text-karma-gold mb-2 sm:mb-3 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Единый Реестр Кармического Баланса (Live)</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Дашборд Вселенской Кармы
          </h2>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed font-sans">
            Открытый реестр всех вынесенных проклятий и ниспосланных благословений в реальном времени.
          </p>
        </div>

        {/* Live Refresh Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-void-700 bg-void-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:border-astral-500 hover:text-white active:scale-95 transition-all disabled:opacity-50 font-heading"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-astral-400' : ''}`} />
            <span>{isLoading ? 'Синхронизация...' : 'Обновить реестр'}</span>
          </button>
        </div>
      </div>

      {/* Global Balance Meter Bar */}
      <div className="mb-6 sm:mb-8 rounded-2xl border border-void-800 bg-void-950/90 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="flex items-center gap-1.5 text-inferno-400 font-heading">
            <Flame className="w-4 h-4" />
            <span>Тьма / Кары ({darkPercent}%)</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-400 font-mono">
            <Scale className="w-3.5 h-3.5 text-karma-gold" />
            <span>Баланс Сил</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300 font-heading">
            <Sun className="w-4 h-4" />
            <span>Свет / Благодать ({lightPercent}%)</span>
          </span>
        </div>

        {/* Progress Dual Bar */}
        <div className="h-3 w-full rounded-full bg-void-800 overflow-hidden flex">
          <motion.div
            className="bg-gradient-to-r from-inferno-600 to-inferno-500 h-full"
            initial={false}
            animate={{ width: `${darkPercent}%` }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full"
            initial={false}
            animate={{ width: `${lightPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3 mb-6 sm:mb-8">
        <div className="flex items-center gap-4 rounded-2xl border border-void-800 bg-void-950/80 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-inferno-500/15 text-inferno-400 border border-inferno-500/30">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-black text-white">
              {totalCount.toLocaleString('ru-RU')}
            </div>
            <div className="text-xs font-medium text-zinc-400 font-sans">Всего записей в канцелярии</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-void-800 bg-void-950/80 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-karma-gold/15 text-karma-gold border border-karma-gold/30">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-black text-white">
              Коллеги & Друзья
            </div>
            <div className="text-xs font-medium text-zinc-400 font-sans">Самые частые адресаты (71%)</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-void-800 bg-void-950/80 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-heading font-black text-white">
              100% Заверено
            </div>
            <div className="text-xs font-medium text-zinc-400 font-sans">Активные астральные печати</div>
          </div>
        </div>
      </div>

      {/* Realm Tabs: [ Все | 🔥 Только Наказания | ✨ Только Благословения ] */}
      <div className="flex items-center gap-2 border-b border-void-800 pb-3 mb-5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('all');
          }}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all font-heading shrink-0 ${
            activeTab === 'all'
              ? 'bg-void-700 text-white shadow-md'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-void-900'
          }`}
        >
          Все деяния ({curses.length})
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('dark');
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all font-heading shrink-0 ${
            activeTab === 'dark'
              ? 'bg-inferno-500/20 text-inferno-300 border border-inferno-500/40 shadow-glow-crimson'
              : 'text-zinc-400 hover:text-inferno-300 hover:bg-void-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-inferno-400" />
          <span>🔥 Кары ({darkCount})</span>
        </button>

        <button
          onClick={() => {
            sound.playCelestialChime();
            setActiveTab('light');
          }}
          className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all font-heading shrink-0 ${
            activeTab === 'light'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow-gold'
              : 'text-zinc-400 hover:text-amber-300 hover:bg-void-900'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-300" />
          <span>✨ Благословения ({lightCount})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
        {/* Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_FILTERS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-karma-gold bg-karma-gold/20 text-karma-gold shadow-glow-gold'
                    : 'border-void-800 bg-void-900 text-zinc-400 hover:border-void-700 hover:text-zinc-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или деянию..."
            className="w-full rounded-xl border border-void-700 bg-void-900 pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-karma-gold focus:outline-none transition-all font-sans"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCurses.length > 0 ? (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredCurses.map((item, idx) => {
              const category = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;
              const isDarkItem = (item.realm || 'dark') === 'dark';
              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.02 }}
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
                        createdAt: 'Недавно',
                        clerkSignature: isDarkItem ? 'Архивариус Трибунала' : 'Хранитель Благодати',
                        sealColor: isDarkItem ? '#ff4d28' : '#fbbf24',
                      });
                    }
                  }}
                  className={`flex flex-col justify-between rounded-2xl border p-4 backdrop-blur-md transition-all hover:shadow-card-gothic group cursor-pointer ${
                    isDarkItem
                      ? 'border-void-800 bg-void-950/80 hover:border-inferno-500/40 hover:bg-void-900/90'
                      : 'border-amber-500/20 bg-void-950/80 hover:border-amber-400/40 hover:bg-slate-900/90'
                  }`}
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-void-800 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-zinc-300 font-sans">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>

                      <span className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{item.timeAgo}</span>
                      </span>
                    </div>

                    {/* Target Name */}
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-heading text-sm sm:text-base font-bold text-white group-hover:text-amber-200 transition-colors">
                        {item.targetName}
                      </h4>
                      {item.telegramUsername && (
                        <span className="text-[9px] font-mono text-astral-400 bg-astral-500/10 px-1.5 py-0.5 rounded border border-astral-500/20">
                          @{item.telegramUsername}
                        </span>
                      )}
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-zinc-400 italic mb-3 line-clamp-3 leading-relaxed font-sans">
                      «{item.sin}»
                    </p>
                  </div>

                  {/* Verdict Box */}
                  <div className={`rounded-xl border p-2.5 ${
                    isDarkItem
                      ? 'border-inferno-500/20 bg-gradient-to-r from-inferno-950/30 to-void-900'
                      : 'border-amber-500/20 bg-gradient-to-r from-amber-950/20 to-void-900'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider font-mono ${
                        isDarkItem ? 'text-inferno-400' : 'text-amber-300'
                      }`}>
                        {isDarkItem ? <ShieldAlert className="w-3 h-3" /> : <Heart className="w-3 h-3" />}
                        <span>{isDarkItem ? 'Приговор:' : 'Благодать:'}</span>
                      </span>
                      <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-void-800 text-zinc-400">
                        {isDarkItem ? '🔥 Кара' : '✨ Свет'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-100 font-sans truncate">
                      {item.curseTitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-12 text-center rounded-2xl border border-dashed border-void-800 bg-void-950/40">
          <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-zinc-300 font-heading">Ничего не найдено</p>
          <p className="text-[11px] text-zinc-500 mt-0.5 font-sans">Попробуйте изменить поисковый запрос</p>
        </div>
      )}
    </section>
  );
};
