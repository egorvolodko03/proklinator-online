import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateCaseNumber(): string {
  const letters = ['КРМ', 'АСТ', 'АДМ', 'СУД', 'ТЕМ', 'ГРЕХ'];
  const prefix = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(10000 + Math.random() * 90000);
  const suffix = ['А', 'Б', 'Х', 'Ω', 'Ψ'][Math.floor(Math.random() * 5)];
  return `№ ${prefix}-${num}-${suffix}`;
}

export function formatDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  colleague: { label: 'Коллега', icon: '💼' },
  boss: { label: 'Начальник', icon: '👑' },
  ex: { label: 'Бывший(-ая)', icon: '💔' },
  neighbor: { label: 'Сосед', icon: '🔨' },
  courier: { label: 'Курьер', icon: '🛵' },
  driver: { label: 'Автохам', icon: '🚗' },
  friend: { label: 'Подруга / Друг', icon: '🐍' },
  relative: { label: 'Родственник', icon: '🍵' },
  other: { label: 'Случайный грешник', icon: '👤' },
};

export const CLERKS = [
  'Архивариус Мортимер XIII',
  'Клерк Бездны Астарот фон Бюрократ',
  'Старший инспектор кармы Люциус',
  'Секретарь астрального трибунала Геката',
  'Судебный исполнитель Бафомет',
];
