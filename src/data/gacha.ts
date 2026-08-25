import { GachaPrize } from '@/types';

export const GACHA_PRIZES: GachaPrize[] = [
  {
    id: 'p1',
    title: 'Зеркальный Щит',
    icon: '🛡️',
    rarity: 'rare',
    prizeType: 'shield',
    amount: 1,
  },
  {
    id: 'p2',
    title: '+25 Кармоидов',
    icon: '🪙',
    rarity: 'common',
    prizeType: 'coins',
    amount: 25,
  },
  {
    id: 'p3',
    title: '+50 Кармоидов',
    icon: '💰',
    rarity: 'rare',
    prizeType: 'coins',
    amount: 50,
  },
  {
    id: 'p4',
    title: 'Астральная Индульгенция',
    icon: '🕯️',
    rarity: 'epic',
    prizeType: 'absolution',
    amount: 1,
  },
  {
    id: 'p5',
    title: 'Золотая Печать Клерка',
    icon: '👑',
    rarity: 'legendary',
    prizeType: 'golden_seal',
    amount: 1,
  },
  {
    id: 'p6',
    title: '+10 Кармоидов',
    icon: '🪙',
    rarity: 'common',
    prizeType: 'coins',
    amount: 10,
  },
  {
    id: 'p7',
    title: 'Эспрессо Архивариусу',
    icon: '☕',
    rarity: 'common',
    prizeType: 'coffee',
    amount: 1,
  },
  {
    id: 'p8',
    title: 'ДЖЕКПОТ +100 🪙',
    icon: '💎',
    rarity: 'legendary',
    prizeType: 'coins',
    amount: 100,
  },
];

export function spinRoulette(): GachaPrize {
  // Weighted odds: common ~50%, rare ~30%, epic ~15%, legendary ~5%
  const roll = Math.random() * 100;
  if (roll < 5) {
    // legendary
    const legendaries = GACHA_PRIZES.filter((p) => p.rarity === 'legendary');
    return legendaries[Math.floor(Math.random() * legendaries.length)];
  } else if (roll < 20) {
    // epic
    const epics = GACHA_PRIZES.filter((p) => p.rarity === 'epic');
    return epics[Math.floor(Math.random() * epics.length)];
  } else if (roll < 50) {
    // rare
    const rares = GACHA_PRIZES.filter((p) => p.rarity === 'rare');
    return rares[Math.floor(Math.random() * rares.length)];
  } else {
    // common
    const commons = GACHA_PRIZES.filter((p) => p.rarity === 'common');
    return commons[Math.floor(Math.random() * commons.length)];
  }
}
