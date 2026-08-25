import { Squad, SquadMember } from '@/types';

const STORAGE_KEY = 'proklinator_squads_v3';

export const INITIAL_SQUADS: Squad[] = [
  {
    id: 'sq-yandex',
    name: 'Яндекс Маркет / IT-отдел',
    slug: 'yandex-it',
    icon: '💻',
    description: 'Разработчики, проджекты и аналитики. Шлем кары за ночные пуши в main и благословения за закрытые баги.',
    inviteCode: 'YANDEX-IT-666',
    membersCount: 8,
    stats: { darkCount: 14, lightCount: 22 },
    members: [
      { id: 'm1', name: 'Алексей (Тимлид)', username: 'alex_lead', avatar: '👨‍💻', role: 'owner', sinsCount: 2, blessingsCount: 7, joinedAt: '12 авг' },
      { id: 'm2', name: 'Марина (Бухгалтерия)', username: 'marina_buh', avatar: '👩‍💼', role: 'clerk', sinsCount: 5, blessingsCount: 1, joinedAt: '14 авг' },
      { id: 'm3', name: 'Игорь (Проджект)', username: 'igor_pm', avatar: '📱', role: 'clerk', sinsCount: 4, blessingsCount: 3, joinedAt: '15 авг' },
      { id: 'm4', name: 'Катя (Дизайнер)', username: 'katya_ui', avatar: '🎨', role: 'clerk', sinsCount: 1, blessingsCount: 8, joinedAt: '16 авг' },
      { id: 'm5', name: 'Денис (DevOps)', username: 'denis_ops', avatar: '🚀', role: 'clerk', sinsCount: 2, blessingsCount: 4, joinedAt: '18 авг' },
    ],
  },
  {
    id: 'sq-buh',
    name: 'Бухгалтерия и Финансы (3 этаж)',
    slug: 'buhgalteriya',
    icon: '💼',
    description: 'Официальный филиал инквизиции чеков и командировочных отчетов.',
    inviteCode: 'BUH-DEPT-777',
    membersCount: 5,
    stats: { darkCount: 18, lightCount: 9 },
    members: [
      { id: 'm2', name: 'Марина Сергеевна', username: 'marina_buh', avatar: '👩‍💼', role: 'owner', sinsCount: 6, blessingsCount: 2, joinedAt: '10 авг' },
      { id: 'm6', name: 'Ольга (Зарплатный отдел)', username: 'olga_fin', avatar: '📑', role: 'clerk', sinsCount: 3, blessingsCount: 5, joinedAt: '11 авг' },
    ],
  },
  {
    id: 'sq-house',
    name: 'Соседи ЖК Лазурный',
    slug: 'zhk-lazurny',
    icon: '🏠',
    description: 'Чат жильцов. Фиксируем перфораторы в 8:00 утра и благодарим тех, кто придерживает лифт.',
    inviteCode: 'LAZUR-HOUSE-1',
    membersCount: 12,
    stats: { darkCount: 31, lightCount: 15 },
    members: [
      { id: 'm7', name: 'Сосед с 44-й кв. (Перфоратор)', avatar: '🔨', role: 'clerk', sinsCount: 9, blessingsCount: 0, joinedAt: '5 авг' },
      { id: 'm8', name: 'Старший по подъезду', avatar: '🕵️', role: 'owner', sinsCount: 1, blessingsCount: 6, joinedAt: '1 авг' },
    ],
  },
];

export class SquadStore {
  private static instance: SquadStore;
  private squads: Squad[] = INITIAL_SQUADS;
  private listeners: (() => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.squads = JSON.parse(saved);
        } else {
          this.save();
        }
      } catch {
        this.squads = INITIAL_SQUADS;
      }
    }
  }

  public static getInstance(): SquadStore {
    if (!SquadStore.instance) {
      SquadStore.instance = new SquadStore();
    }
    return SquadStore.instance;
  }

  public getSquads(): Squad[] {
    return [...this.squads];
  }

  public getSquadById(id: string): Squad | undefined {
    return this.squads.find((s) => s.id === id || s.slug === id);
  }

  public createSquad(name: string, icon: string, description: string, creatorName: string): Squad {
    const slug = name.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-').slice(0, 25);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newSquad: Squad = {
      id: `sq-${Date.now()}`,
      name: name.trim(),
      slug,
      icon: icon || '🏢',
      description: description.trim() || 'Тайный кармический сквад',
      inviteCode: `SQUAD-${code}`,
      membersCount: 1,
      stats: { darkCount: 0, lightCount: 0 },
      members: [
        {
          id: `usr-${Date.now()}`,
          name: creatorName.trim() || 'Создатель Сквада',
          avatar: icon || '👑',
          role: 'owner',
          sinsCount: 0,
          blessingsCount: 0,
          joinedAt: 'Сегодня',
        },
      ],
    };

    this.squads.unshift(newSquad);
    this.save();
    this.notify();
    return newSquad;
  }

  public joinSquadByCode(code: string, userName: string, userAvatar: string): { success: boolean; squad?: Squad; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const squad = this.squads.find((s) => s.inviteCode.toUpperCase() === cleanCode || s.slug === code.trim().toLowerCase());
    if (!squad) {
      return { success: false, message: 'Сквад с таким инвайт-кодом не найден.' };
    }

    // Check if already in squad
    const exists = squad.members.some((m) => m.name.toLowerCase() === userName.toLowerCase());
    if (!exists) {
      squad.members.push({
        id: `usr-${Date.now()}`,
        name: userName,
        avatar: userAvatar || '🧙',
        role: 'clerk',
        sinsCount: 0,
        blessingsCount: 0,
        joinedAt: 'Сегодня',
      });
      squad.membersCount = squad.members.length;
      this.save();
      this.notify();
    }

    return { success: true, squad, message: `Вы успешно вступили в сквад «${squad.name}»!` };
  }

  public recordSquadDecree(squadId: string, memberName: string, realm: 'dark' | 'light') {
    const squad = this.squads.find((s) => s.id === squadId);
    if (!squad) return;

    if (realm === 'dark') {
      squad.stats.darkCount += 1;
    } else {
      squad.stats.lightCount += 1;
    }

    const member = squad.members.find((m) => m.name.toLowerCase() === memberName.toLowerCase());
    if (member) {
      if (realm === 'dark') {
        member.sinsCount += 1;
      } else {
        member.blessingsCount += 1;
      }
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.squads));
      } catch {
        // ignore
      }
    }
  }
}

export const squadStore = SquadStore.getInstance();
