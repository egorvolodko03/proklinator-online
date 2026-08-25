import { Squad, SquadMember } from '@/types';

const STORAGE_KEY = 'proklinator_squads_v3';

export const INITIAL_SQUADS: Squad[] = [];

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
          this.squads = [];
          this.save();
        }
      } catch {
        this.squads = [];
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

  public createSquad(name: string, icon: string, description: string, creatorName: string, creatorUsername?: string): Squad {
    const slug = name.toLowerCase().replace(/[^a-zа-я0-9]+/g, '-').slice(0, 25);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newSquad: Squad = {
      id: `sq-${Date.now()}`,
      name: name.trim(),
      slug,
      icon: icon || '🏢',
      description: description.trim() || 'Кармический сквад',
      inviteCode: `SQUAD-${code}`,
      membersCount: 1,
      stats: { darkCount: 0, lightCount: 0 },
      members: [
        {
          id: `usr-${Date.now()}`,
          name: creatorName.trim() || 'Создатель',
          username: creatorUsername,
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

  public joinSquadByCode(code: string, userName: string, userAvatar: string, username?: string): { success: boolean; squad?: Squad; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const squad = this.squads.find((s) => s.inviteCode.toUpperCase() === cleanCode || s.slug === code.trim().toLowerCase());
    if (!squad) {
      return { success: false, message: 'Сквад с таким инвайт-кодом не найден.' };
    }

    // Check if already in squad
    const exists = squad.members.some((m) => m.name.toLowerCase() === userName.toLowerCase() || (username && m.username === username));
    if (!exists) {
      squad.members.push({
        id: `usr-${Date.now()}`,
        name: userName,
        username,
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
