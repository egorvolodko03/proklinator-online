import { ShopArtifact, UserKarmaProfile, GachaPrize, TelegramUserData } from '@/types';
import { getRankByExp } from '@/data/ranks';
import { getTelegramUser, isTelegramWebApp } from '@/lib/telegram';

const STORAGE_KEY = 'proklinator_karma_profile_v4_clean';
const COOKIE_NAME = 'proklinator_user_session';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, val: string, days: number = 365) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(val)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
}

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
          // Check cookie fallback if localStorage was cleared
          const cookieVal = getCookie(COOKIE_NAME);
          if (cookieVal) {
            const parsedUser = JSON.parse(cookieVal);
            if (parsedUser && parsedUser.id) {
              this.profile.isAuthorized = true;
              this.profile.telegramUser = parsedUser;
              this.save();
            }
          }
        }
      } catch {
        this.profile = DEFAULT_PROFILE;
      }

      // Check Telegram Mini App environment immediately and sync with cloud
      this.checkTelegramAutoAuth();
      if (this.profile.isAuthorized && this.profile.telegramUser) {
        this.syncWithCloud();
      }
    }
  }

  public static getInstance(): KarmaStore {
    if (!KarmaStore.instance) {
      KarmaStore.instance = new KarmaStore();
    }
    return KarmaStore.instance;
  }

  public checkTelegramAutoAuth() {
    if (typeof window === 'undefined') return;

    const performCheck = () => {
      const tgUser = getTelegramUser();
      if (tgUser) {
        if (!this.profile.isAuthorized || this.profile.telegramUser?.id !== tgUser.id) {
          this.authorizeWithTelegram(tgUser);
        }
      }
    };

    performCheck();
    [50, 150, 300, 700, 1500].forEach((delay) => {
      setTimeout(performCheck, delay);
    });
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
    setCookie(COOKIE_NAME, JSON.stringify(user), 365);
    this.notify();
    this.syncWithCloud();
  }

  public logout() {
    this.profile.isAuthorized = false;
    this.profile.telegramUser = null;
    this.save();
    deleteCookie(COOKIE_NAME);
    this.notify();
  }

  public giveGoldenSeal() {
    this.profile.hasGoldenSeal = true;
    this.profile.useGoldenSealForNext = true;
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

  public recordDailySpin() {
    this.profile.lastDailySpinDate = new Date().toDateString();
    this.save();
    this.notify();
  }

  public async syncWithCloud() {
    if (!this.profile.telegramUser) return;
    const userKey = this.profile.telegramUser.id.toString();

    try {
      const res = await fetch(`/api/profile?userId=${userKey}`);
      const data = await res.json();
      if (data.success && data.profile) {
        this.profile = {
          ...this.profile,
          ...data.profile,
          coins: Math.max(this.profile.coins, data.profile.coins ?? 0),
          experience: Math.max(this.profile.experience, data.profile.experience ?? 0),
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

  public async uploadToCloud() {
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

  public addExp(amount: number) {
    this.profile.experience += amount;
    this.recalculateRank();
    this.save();
    this.notify();
  }

  public buyArtifact(artifactOrId: string | ShopArtifact): { success: boolean; message: string } {
    const id = typeof artifactOrId === 'string' ? artifactOrId : artifactOrId.id;
    const artifact = typeof artifactOrId === 'object' ? artifactOrId : SHOP_ARTIFACTS.find((a) => a.id === id);
    if (!artifact) return { success: false, message: 'Артефакт не найден' };

    if (this.profile.coins < artifact.cost) {
      return { success: false, message: 'Недостаточно карма-коинов' };
    }

    this.profile.coins -= artifact.cost;

    switch (artifact.actionType) {
      case 'shield':
        this.profile.activeShields += 1;
        break;
      case 'golden_seal':
        this.profile.hasGoldenSeal = true;
        this.profile.useGoldenSealForNext = true;
        break;
      case 'absolution':
        this.profile.hasAbsolution = true;
        break;
      case 'eye':
        this.profile.hasDetectiveEye = true;
        break;
      case 'coffee':
        this.addExp(25);
        break;
    }

    this.addExp(artifact.cost);
    this.save();
    this.notify();
    return { success: true, message: `Вы приобрели «${artifact.title}»!` };
  }

  public applyGachaPrize(prize: GachaPrize) {
    switch (prize.prizeType) {
      case 'coins':
        this.profile.coins += prize.amount || 0;
        break;
      case 'shield':
        this.profile.activeShields += prize.amount || 1;
        break;
      case 'golden_seal':
        this.profile.hasGoldenSeal = true;
        this.profile.useGoldenSealForNext = true;
        break;
      case 'absolution':
        this.profile.hasAbsolution = true;
        break;
      case 'coffee':
        this.addExp(prize.amount || 30);
        break;
    }
    this.save();
    this.notify();
  }

  public recordDecreeSent(realm: 'dark' | 'light') {
    if (realm === 'dark') {
      this.profile.cursesSent += 1;
    } else {
      this.profile.blessingsSent += 1;
    }
    this.addCoins(15);
    this.addExp(30);
    this.save();
    this.notify();
  }

  public joinSquad(squadId: string) {
    if (!this.profile.squads.includes(squadId)) {
      this.profile.squads.push(squadId);
      this.profile.activeSquadId = squadId;
      this.save();
      this.notify();
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

  public leaveSquad(squadId: string) {
    this.profile.squads = this.profile.squads.filter((id) => id !== squadId);
    if (this.profile.activeSquadId === squadId) {
      this.profile.activeSquadId = this.profile.squads[0] || undefined;
    }
    this.save();
    this.notify();
  }

  public recalculateRank() {
    const rank = getRankByExp(this.profile.experience);
    this.profile.rankLevel = rank.level;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
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

  public save() {
    this.saveLocally();
    this.uploadToCloud();
  }
}

export const karmaStore = KarmaStore.getInstance();
