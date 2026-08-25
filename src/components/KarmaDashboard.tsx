'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Search, 
  Filter, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap,
  RefreshCw
} from 'lucide-react';
import { KarmaFeedItem, Category, SeverityLevel } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';
import { sound } from '@/lib/audio';

interface KarmaDashboardProps {
  curses: KarmaFeedItem[];
  totalCount: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

const CATEGORY_FILTERS: { id: Category | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'Все приговоры', icon: '⚡' },
  { id: 'colleague', label: 'Коллеги', icon: '💼' },
  { id: 'boss', label: 'Начальники', icon: '👑' },
  { id: 'neighbor', label: 'Соседи', icon: '🔨' },
  { id: 'ex', label: 'Бывшие', icon: '💔' },
  { id: 'driver', label: 'Автохамы', icon: '🚗' },
  { id: 'courier', label: 'Курьеры', icon: '🛵' },
  { id: 'friend', label: 'Друзья', icon: '🐍' },
];

export const KarmaDashboard: React.FC<KarmaDashboardProps> = ({
  curses,
  totalCount,
  onRefresh,
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered curses
  const filteredCurses = useMemo(() => {
    return curses.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSev = selectedSeverity === 'all' || item.severity === selectedSeverity;
      const matchQuery =
        searchQuery === '' ||
        item.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.curseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSev && matchQuery;
    });
  }, [curses, selectedCategory, selectedSeverity, searchQuery]);

  // Quick stats
  const extremeCount = curses.filter((c) => c.severity === 'extreme').length;
  const mediumCount = curses.filter((c) => c.severity === 'medium').length;

  return (
    <section id="karma-dashboard" className="mx-auto max-w-6xl px-4 py-16 border-t border-void-800">
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-inferno-500/30 bg-inferno-500/10 px-3.5 py-1 text-xs font-semibold text-inferno-400 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Единый Реестр Кармических Наказаний (Live)</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Дашборд Возмездия
          </h2>
          <p className="mt-2 text-sm text-zinc-400 max-w-xl leading-relaxed">
            Открытая база всех наложенных проклятий в реальном времени. Следите за приговорами со всего мира.
          </p>
        </div>

        {/* Live Status & Refresh Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onRefresh();
            }}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl border border-void-700 bg-void-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:border-astral-500 hover:text-white hover:shadow-glow-violet active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-astral-400' : ''}`} />
            <span>{isLoading ? 'Синхронизация...' : 'Обновить ленту'}</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {/* Metric 1 */}
        <div className="flex items-center gap-4 rounded-2xl border border-void-800 bg-void-950/80 p-5 backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-inferno-500/15 text-inferno-400 border border-inferno-500/30">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-white">
              {totalCount.toLocaleString('ru-RU')}
            </div>
            <div className="text-xs font-medium text-zinc-400">Всего приговоров в реестре</div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="flex items-center gap-4 rounded-2xl border border-void-800 bg-void-950/80 p-5 backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-karma-gold/15 text-karma-gold border border-karma-gold/30">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-white">
              Коллеги & Соседи
            </div>
            <div className="text-xs font-medium text-zinc-400">Топ категории по жалобам (68%)</div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="flex items-center gap-4 rounded-2xl border border-void-800 bg-void-950/80 p-5 backdrop-blur-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-astral-500/15 text-astral-400 border border-astral-500/30">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-white">
              {Math.round(((extremeCount + mediumCount) / (curses.length || 1)) * 100)}%
            </div>
            <div className="text-xs font-medium text-zinc-400">Строгие и адские кары</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Category Chips Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
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
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-inferno-500 bg-inferno-500/20 text-inferno-300 shadow-glow-crimson'
                    : 'border-void-800 bg-void-900/90 text-zinc-400 hover:border-void-700 hover:text-zinc-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или греху..."
            className="w-full rounded-xl border border-void-700 bg-void-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-inferno-500 focus:outline-none focus:ring-1 focus:ring-inferno-500/30 transition-all"
          />
        </div>
      </div>

      {/* Curses Cards Grid */}
      {filteredCurses.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredCurses.map((item, idx) => {
              const category = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;
              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="flex flex-col justify-between rounded-2xl border border-void-800 bg-void-950/80 p-5 backdrop-blur-md transition-all hover:border-inferno-500/40 hover:bg-void-900/90 hover:shadow-card-gothic group"
                >
                  <div>
                    {/* Card Top Meta */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-void-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-300">
                        <span>{category.icon}</span>
                        <span>{category.label}</span>
                      </span>

                      <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{item.timeAgo}</span>
                      </span>
                    </div>

                    {/* Target Name */}
                    <h4 className="font-heading text-base font-bold text-white mb-1.5 group-hover:text-inferno-300 transition-colors">
                      {item.targetName}
                    </h4>

                    {/* Sin Description */}
                    <p className="text-xs text-zinc-400 italic mb-4 line-clamp-3 leading-relaxed">
                      «{item.sin}»
                    </p>
                  </div>

                  {/* Verdict / Punishment Box */}
                  <div className="rounded-xl border border-inferno-500/20 bg-gradient-to-r from-inferno-950/30 to-void-900 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-inferno-400 font-mono">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Приговор:</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-void-800 text-zinc-400">
                        {item.severity === 'light' ? '🟢 Легкий' : item.severity === 'medium' ? '🟡 Офисный' : '🔴 Крах'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-zinc-100">
                      {item.curseTitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-void-800 bg-void-950/40">
          <ShieldAlert className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-300">Ничего не найдено по заданным фильтрам</p>
          <p className="text-xs text-zinc-500 mt-1">Попробуйте изменить запрос или выбрать другую категорию</p>
        </div>
      )}
    </section>
  );
};
