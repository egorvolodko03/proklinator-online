'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, ShieldAlert, Sparkles, Heart } from 'lucide-react';
import { KarmaFeedItem } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';

interface KarmaFeedProps {
  feed: KarmaFeedItem[];
}

export const KarmaFeed: React.FC<KarmaFeedProps> = ({ feed }) => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 border-t border-void-800/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-karma-gold/30 bg-karma-gold/10 px-3 py-1 text-xs font-semibold text-karma-gold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Хроника Вселенского Баланса</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl tracking-tight">
            Лента свежих постановлений
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-sans">
            Обезличенная трансляция кармических приговоров и небесных благословений из архива канцелярии.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feed.map((item, idx) => {
          const category = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;
          const isLight = item.realm === 'light';

          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className={`flex flex-col justify-between rounded-2xl border p-4.5 backdrop-blur-md transition-all duration-200 group ${
                isLight
                  ? 'border-amber-500/20 bg-gradient-to-b from-amber-950/15 via-void-950/80 to-void-950 hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(251,191,36,0.15)]'
                  : 'border-inferno-500/20 bg-gradient-to-b from-inferno-950/15 via-void-950/80 to-void-950 hover:border-inferno-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-void-850/90 border border-void-750 px-2.5 py-1 text-[11px] text-zinc-200 font-medium">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </span>

                  <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>{item.timeAgo}</span>
                  </span>
                </div>

                {/* Target Name */}
                <h4 className="font-heading text-sm font-bold text-white mb-1.5 group-hover:text-amber-200 transition-colors">
                  {item.targetName}
                </h4>

                {/* Sin or Good deed */}
                <p className="text-xs text-zinc-300 italic mb-4 line-clamp-2 leading-relaxed font-sans">
                  «{item.sin}»
                </p>
              </div>

              {/* Verdict Banner */}
              <div
                className={`rounded-xl border p-3 ${
                  isLight
                    ? 'border-amber-400/30 bg-amber-500/10'
                    : 'border-inferno-500/30 bg-inferno-500/10'
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1 font-mono ${
                    isLight ? 'text-amber-300' : 'text-inferno-400'
                  }`}
                >
                  {isLight ? <Heart className="w-3 h-3 text-amber-300" /> : <ShieldAlert className="w-3 h-3 text-inferno-400" />}
                  <span>{isLight ? 'Благословение:' : 'Приговор:'}</span>
                </div>
                <p className="font-heading text-xs font-bold text-zinc-100 line-clamp-2">
                  {item.curseTitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
