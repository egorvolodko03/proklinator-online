import { ShopArtifact, UserKarmaProfile, GachaPrize } from '@/types';
import { getRankByExp } from '@/data/ranks';
import { getTelegramUser, TelegramUser } from '@/lib/telegram';

const STORAGE_KEY = 'proklinator_karma_profile_v3';

export const SHOP_ARTIFACTS: ShopArtifact[] = [
  {
    id: 'shield',
    icon: '🛡️',
    title: 'Зеркальный Щит Кармы',
    description: 'Автоматически отражает 1 следующее проклятие обратно на отправителя («Кармический рикошет»).',
    cost: 50,
    badge: '1 Защита',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    actionType: 'shield',
  },
  {
    id: 'absolution',
    icon: '🕯️',
    title: 'Астральная Индульгенция',
    description: 'Полностью аннулирует все полученные проклятия и очищает кармическую историю в реестре.',
    cost: 100,
    badge: 'Полный Сброс',
    badgeColor: 'bg-karma-gold/20 text-karma-gold border-karma-gold/40',
    actionType: 'absolution',
  },
  {
    id: 'eye',
    icon: '🕵️',
    title: 'Око Истины (Детектор)',
    description: 'Приоткрывает подсказку об анонимном отправителе (первую букву ника, категорию отношений).',
    cost: 40,
    badge: 'Раскрытие Тайн',
    badgeColor: 'bg-astral-500/20 text-astral-300 border-astral-500/40',
    actionType: 'eye',
  },
  {
    id: 'golden_seal',
    icon: '👑',
    title: 'Золотая Печать Клерка',
    description: 'Превращает любое созданное проклятие или благословение в ультра-редкую анимированную золотую грамоту.',
    cost: 30,
    badge: 'Премиум Статус',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    actionType: 'golden_seal',
  },
  {
    id: 'coffee',
    icon: '☕',
    title: 'Эспрессо Архивариусу',
    description: 'Пожертвование на кофе канцелярии без дна с занесением на доску почета.',
    cost: 0,
    badge: 'Донат Клерку',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    actionType: 'coffee',
  },
];

export const DEFAULT_PROFILE: UserKarmaProfile = {
  coins: 80,
  experience: 45,
  rankLevel: 1,
  activeShields: 1,
  hasAbsolution: false,
  hasGoldenSeal: false,
  hasDetectiveEye: false,
  streakDays: 1,
  squads: ['sq-yandex'],
  activeSquadId: 'sq-yandex',
  blessingsSent: 0,
  cursesSent: 0,
  receivedDecrees: [],
};

export class KarmaStore {
  private static instance: KarmaStore;
  private profile: UserKarmaProfile = DEFAULT_PROFILE;
  private currentTelegramUser: TelegramUser | null = null;
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

      // Auto-detect Telegram User
      setTimeout(() => {
        const tgUser = getTelegramUser();
        if (tgUser) {
          this.syncWithTelegramUser(tgUser);
        }
      }, 500);
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

  public getTelegramUser(): TelegramUser | null {
    return this.currentTelegramUser;
  }

  public async syncWithTelegramUser(user: TelegramUser) {
    this.currentTelegramUser = user;
    const userKey = user.id.toString();

    try {
      const res = await fetch(`/api/profile?userId=${userKey}`);
      const data = await res.json();
      if (data.success && data.profile) {
        this.profile = { ...DEFAULT_PROFILE, ...data.profile };
        this.recalculateRank();
        this.saveLocally();
        this.notify();
      } else {
        // Upload initial profile to cloud
        this.uploadToCloud();
      }
    } catch {
      // ignore
    }
  }

  public async loginWithUsername(username: string): Promise<{ success: boolean; message: string }> {
    const cleanUser = username.trim().replace(/^@/, '');
    if (!cleanUser) return { success: false, message: 'Укажите username' };

    try {
      const res = await fetch(`/api/profile?username=${encodeURIComponent(cleanUser)}`);
      const data = await res.json();
      if (data.success && data.profile) {
        this.profile = { ...DEFAULT_PROFILE, ...data.profile };
        this.currentTelegramUser = { id: 0, first_name: cleanUser, username: cleanUser };
        this.recalculateRank();
        this.saveLocally();
        this.notify();
        return { success: true, message: `Профиль @${cleanUser} синхронизирован! Кармоиды загружены.` };
      } else {
        // Associate current profile with this username
        this.currentTelegramUser = { id: 0, first_name: cleanUser, username: cleanUser };
        await this.uploadToCloud();
        return { success: true, message: `Профиль @${cleanUser} привязан к этому устройству!` };
      }
    } catch {
      return { success: false, message: 'Ошибка связи с сервером' };
    }
  }

  private async uploadToCloud() {
    const key = this.currentTelegramUser?.id?.toString() || this.currentTelegramUser?.username;
    if (!key) return;

    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.currentTelegramUser?.id,
          username: this.currentTelegramUser?.username,
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
        this.profile.receivedDecrees = [];
        break;
      case 'eye':
        this.profile.hasDetectiveEye = true;
        break;
      case 'golden_seal':
        this.profile.hasGoldenSeal = true;
        break;
      case 'coffee':
        this.profile.coins += 20;
        break;
    }

    this.addExperience(15);
    this.save();
    this.notify();
    return { success: true, message: `Артефакт «${artifact.title}» активирован!` };
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
        this.profile.receivedDecrees = [];
        break;
      case 'golden_seal':
        this.profile.hasGoldenSeal = true;
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
