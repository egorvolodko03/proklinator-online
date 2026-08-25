import { ShopArtifact, UserKarmaProfile, GachaPrize, TelegramUserData } from '@/types';
import { getRankByExp } from '@/data/ranks';
import { getTelegramUser, isTelegramWebApp } from '@/lib/telegram';

const STORAGE_KEY = 'proklinator_karma_profile_v3';

export const SHOP_ARTIFACTS: ShopArtifact[] = [
  {
    id: 'shield',
    icon: '🛡️',
    title: 'Зеркальный Щит Кармы',
    description: 'Автоматически отражает 1 следующее проклятие обратно на обидчика («Кармический рикошет»). Хранится в инвентаре.',
    cost: 50,
    badge: 'Авто-защита',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    actionType: 'shield',
  },
  {
    id: 'golden_seal',
    icon: '👑',
    title: 'Золотая Печать Клерка',
    description: 'Превращает следующее проклятие или благословение в ультра-редкую анимированную золотую грамоту. Активируется в инвентаре.',
    cost: 30,
    badge: 'Усилитель',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    actionType: 'golden_seal',
  },
  {
    id: 'absolution',
    icon: '🕯️',
    title: 'Астральная Индульгенция',
    description: 'Полностью аннулирует все полученные проклятия и очищает историю в реестре.',
    cost: 100,
    badge: 'Очищение',
    badgeColor: 'bg-karma-gold/20 text-karma-gold border-karma-gold/40',
    actionType: 'absolution',
  },
  {
    id: 'eye',
    icon: '🕵️',
    title: 'Око Истины (Детектор)',
    description: 'Приоткрывает подсказку об анонимном отправителе приговора.',
    cost: 40,
    badge: 'Детектив',
    badgeColor: 'bg-astral-500/20 text-astral-300 border-astral-500/40',
    actionType: 'eye',
  },
  {
    id: 'coffee',
    icon: '☕',
    title: 'Эспрессо Архивариусу',
    description: 'Пожертвование на кофе клеркам канцелярии без дна.',
    cost: 0,
    badge: 'Донат',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    actionType: 'coffee',
  },
];

export const DEFAULT_PROFILE: UserKarmaProfile = {
  isAuthorized: false,
  telegramUser: null,
  coins: 80,
  experience: 0,
  rankLevel: 1,
  activeShields: 0,
  hasAbsolution: false,
  hasGoldenSeal: false,
  useGoldenSealForNext: false,
  hasDetectiveEye: false,
  streakDays: 1,
  squads: [],
  activeSquadId: undefined,
  blessingsSent: 0,
  cursesSent: 0,
  receivedDecrees: [],
};

export class KarmaStore {
  private static instance: KarmaStore;
  private profile: UserKarmaProfile = DEFAULT_PROFILE;
  private listeners: (() => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.profile = { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
          this.recalculateRank();
        } else {
          this.save();
        }
      } catch {
        this.profile = DEFAULT_PROFILE;
      }

      // Check for Telegram WebApp environment
      setTimeout(() => {
        const tgUser = getTelegramUser();
        if (tgUser && !this.profile.isAuthorized) {
          this.authorizeWithTelegram(tgUser);
        }
      }, 300);
    }
  }

  public static getInstance(): KarmaStore {
    if (!KarmaStore.instance) {
      KarmaStore.instance = new KarmaStore();
    }
    return KarmaStore.instance;
  }

  public getProfile(): UserKarmaProfile {
    return { ...this.profile };
  }

  public isAuthorized(): boolean {
    return this.profile.isAuthorized;
  }

  public authorizeWithTelegram(user: TelegramUserData) {
    this.profile.isAuthorized = true;
    this.profile.telegramUser = user;
    this.save();
    this.notify();
    this.syncWithCloud();
  }

  public logout() {
    this.profile.isAuthorized = false;
    this.profile.telegramUser = null;
    this.save();
    this.notify();
  }

  public toggleUseGoldenSeal() {
    if (this.profile.hasGoldenSeal) {
      this.profile.useGoldenSealForNext = !this.profile.useGoldenSealForNext;
      this.save();
      this.notify();
    }
  }

  public consumeGoldenSeal() {
    if (this.profile.useGoldenSealForNext) {
      this.profile.hasGoldenSeal = false;
      this.profile.useGoldenSealForNext = false;
      this.save();
      this.notify();
    }
  }

  public useAbsolution(): boolean {
    if (this.profile.hasAbsolution) {
      this.profile.hasAbsolution = false;
      this.profile.receivedDecrees = [];
      this.save();
      this.notify();
      return true;
    }
    return false;
  }

  private async syncWithCloud() {
    if (!this.profile.telegramUser) return;
    const userKey = this.profile.telegramUser.id.toString();

    try {
      const res = await fetch(`/api/profile?userId=${userKey}`);
      const data = await res.json();
      if (data.success && data.profile) {
        this.profile = {
          ...this.profile,
          ...data.profile,
          isAuthorized: true,
          telegramUser: this.profile.telegramUser,
        };
        this.recalculateRank();
        this.saveLocally();
        this.notify();
      } else {
        this.uploadToCloud();
      }
    } catch {
      // ignore
    }
  }

  private async uploadToCloud() {
    if (!this.profile.telegramUser) return;
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.profile.telegramUser.id,
          username: this.profile.telegramUser.username,
          profile: this.profile,
        }),
      });
    } catch {
      // ignore
    }
  }

  public addCoins(amount: number) {
    this.profile.coins += amount;
    this.save();
    this.notify();
  }

  public addExperience(exp: number) {
    this.profile.experience += exp;
    this.recalculateRank();
    this.save();
    this.notify();
  }

  private recalculateRank() {
    const rank = getRankByExp(this.profile.experience);
    this.profile.rankLevel = rank.level;
  }

  public buyArtifact(artifact: ShopArtifact): { success: boolean; message: string } {
    let finalCost = artifact.cost;
    if (artifact.actionType === 'shield' && this.profile.rankLevel >= 3) {
      finalCost = Math.round(finalCost * 0.85);
    }

    if (finalCost > 0 && this.profile.coins < finalCost) {
      return { success: false, message: 'Недостаточно Кармоидов 🪙' };
    }

    if (finalCost > 0) {
      this.profile.coins -= finalCost;
    }

    switch (artifact.actionType) {
      case 'shield':
        this.profile.activeShields += 1;
        break;
      case 'absolution':
        this.profile.hasAbsolution = true;
        break;
      case 'eye':
        this.profile.hasDetectiveEye = true;
        break;
      case 'golden_seal':
        this.profile.hasGoldenSeal = true;
        this.profile.useGoldenSealForNext = true; // auto-activate
        break;
      case 'coffee':
        this.profile.coins += 20;
        break;
    }

    this.addExperience(15);
    this.save();
    this.notify();
    return { success: true, message: `Артефакт «${artifact.title}» приобретен и добавлен в инвентарь!` };
  }

  public applyGachaPrize(prize: GachaPrize) {
    switch (prize.prizeType) {
      case 'coins':
        this.profile.coins += prize.amount || 25;
        break;
      case 'shield':
        this.profile.activeShields += prize.amount || 1;
        break;
      case 'absolution':
        this.profile.hasAbsolution = true;
        break;
      case 'golden_seal':
        this.profile.hasGoldenSeal = true;
        this.profile.useGoldenSealForNext = true;
        break;
      case 'coffee':
        this.profile.coins += 20;
        break;
    }
    this.profile.lastDailySpinDate = new Date().toDateString();
    this.addExperience(25);
    this.save();
    this.notify();
  }

  public recordDecreeSent(realm: 'dark' | 'light') {
    if (realm === 'light') {
      this.profile.blessingsSent += 1;
      this.addCoins(20);
      this.addExperience(30);
    } else {
      this.profile.cursesSent += 1;
      this.addCoins(10);
      this.addExperience(15);
    }
  }

  public setActiveSquad(squadId: string) {
    this.profile.activeSquadId = squadId;
    if (!this.profile.squads.includes(squadId)) {
      this.profile.squads.push(squadId);
    }
    this.save();
    this.notify();
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  private save() {
    this.saveLocally();
    this.uploadToCloud();
  }

  private saveLocally() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      } catch {
        // ignore
      }
    }
  }
}

export const karmaStore = KarmaStore.getInstance();
