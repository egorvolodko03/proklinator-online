'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { KarmaFeedItem } from '@/types';
import { CATEGORY_LABELS } from '@/lib/utils';

interface KarmaFeedProps {
  feed: KarmaFeedItem[];
}

export const KarmaFeed: React.FC<KarmaFeedProps> = ({ feed }) => {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 border-t border-void-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-astral-500/30 bg-astral-500/10 px-3 py-0.5 text-xs font-semibold text-astral-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Хроника Возмездия
          </div>
          <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
            Лента свежих приговоров
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Обезличенная трансляция кармических постановлений прямо из архивов канцелярии.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feed.map((item, idx) => {
          const category = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;
          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex flex-col justify-between rounded-2xl border border-void-800 bg-void-950/70 p-4 backdrop-blur-sm transition-all hover:border-void-700 hover:bg-void-900 hover:shadow-card-gothic"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1 rounded bg-void-800 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </span>

                  <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{item.timeAgo}</span>
                  </span>
                </div>

                {/* Target Name */}
                <h4 className="font-serif text-sm font-bold text-zinc-100 mb-1">
                  {item.targetName}
                </h4>

                {/* Sin */}
                <p className="text-xs text-zinc-400 italic mb-3 line-clamp-2">
                  «{item.sin}»
                </p>
              </div>

              {/* Curse Verdict */}
              <div className="rounded-xl border border-void-800 bg-void-900/90 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-inferno-400 mb-0.5">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Кара:</span>
                </div>
                <p className="font-serif text-xs font-semibold text-zinc-200">
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
