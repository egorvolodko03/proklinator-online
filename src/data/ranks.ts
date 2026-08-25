import { ClerkRank } from '@/types';

export const CLERK_RANKS: ClerkRank[] = [
  {
    level: 1,
    title: 'Младший писарь бездны',
    minExp: 0,
    badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: '📜',
    perkDescription: 'Базовый доступ к обрядам и алтарю',
  },
  {
    level: 2,
    title: 'Архивариус кармического учета',
    minExp: 150,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: '🗂️',
    perkDescription: '+10% к выпадению редких наград в Рулетке',
  },
  {
    level: 3,
    title: 'Верховный судья микроволновок',
    minExp: 400,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '⚖️',
    perkDescription: 'Скидка 15% на Зеркальные Щиты в Лавке',
  },
  {
    level: 4,
    title: 'Астральный инквизитор',
    minExp: 900,
    badgeColor: 'bg-astral-500/20 text-astral-300 border-astral-500/40',
    icon: '👑',
    perkDescription: 'Доступ к редким золотым печатям благодати',
  },
  {
    level: 5,
    title: 'Владыка Вселенской Кармы',
    minExp: 2000,
    badgeColor: 'bg-gradient-to-r from-amber-500/30 via-rose-500/30 to-purple-500/30 text-amber-200 border-amber-400/60',
    icon: '🌌',
    perkDescription: 'Королевская аура и персональная рамка в Сквадах',
  },
];

export function getRankByExp(exp: number): ClerkRank {
  for (let i = CLERK_RANKS.length - 1; i >= 0; i--) {
    if (exp >= CLERK_RANKS[i].minExp) {
      return CLERK_RANKS[i];
    }
  }
  return CLERK_RANKS[0];
}

export function getNextRank(currentLevel: number): ClerkRank | null {
  return CLERK_RANKS.find((r) => r.level === currentLevel + 1) || null;
}
