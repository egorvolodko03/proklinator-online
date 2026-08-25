export type KarmaRealm = 'dark' | 'light';

export type SeverityLevel = 'light' | 'medium' | 'extreme';
export type BlessingLevel = 'small' | 'zen' | 'supreme';

export type Category = 
  | 'colleague' 
  | 'ex' 
  | 'neighbor' 
  | 'boss' 
  | 'courier' 
  | 'driver' 
  | 'friend'
  | 'relative'
  | 'other';

export interface Curse {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  category: Category | 'all';
  icon: string;
}

export interface Blessing {
  id: string;
  title: string;
  description: string;
  level: BlessingLevel;
  category: Category | 'all';
  icon: string;
}

export interface Sin {
  id: string;
  text: string;
  category: Category;
}

export interface GoodDeed {
  id: string;
  text: string;
  category: Category;
}

export interface DecreeVerdict {
  id: string;
  realm: KarmaRealm;
  squadId?: string;
  caseNumber: string;
  targetName: string;
  telegramUsername?: string;
  category: Category;
  actionText: string;
  verdictText: string;
  verdictTitle: string;
  tier: string;
  createdAt: string;
  clerkSignature: string;
  sealColor: string;
  isGoldenSeal?: boolean;
}

export type CurseVerdict = DecreeVerdict;

export interface KarmaFeedItem {
  id: string;
  realm: KarmaRealm;
  squadId?: string;
  targetName: string;
  telegramUsername?: string;
  category: Category;
  sin: string;
  curseTitle: string;
  severity: SeverityLevel | BlessingLevel;
  timeAgo: string;
  isMirrored?: boolean;
}

export interface ShopArtifact {
  id: string;
  icon: string;
  title: string;
  description: string;
  cost: number;
  badge: string;
  badgeColor: string;
  actionType: 'shield' | 'absolution' | 'eye' | 'golden_seal' | 'coffee';
}

export interface ClerkRank {
  level: number;
  title: string;
  minExp: number;
  badgeColor: string;
  icon: string;
  perkDescription: string;
}

export interface GachaPrize {
  id: string;
  title: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  prizeType: 'coins' | 'shield' | 'absolution' | 'golden_seal' | 'coffee';
  amount?: number;
}

export interface SquadMember {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  role: 'owner' | 'clerk';
  sinsCount: number;
  blessingsCount: number;
  joinedAt: string;
}

export interface Squad {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  inviteCode: string;
  membersCount: number;
  stats: {
    darkCount: number;
    lightCount: number;
  };
  members: SquadMember[];
}

export interface UserKarmaProfile {
  coins: number;
  experience: number;
  rankLevel: number;
  activeShields: number;
  hasAbsolution: boolean;
  hasGoldenSeal: boolean;
  hasDetectiveEye: boolean;
  streakDays: number;
  lastDailyClaimDate?: string;
  lastDailySpinDate?: string;
  activeSquadId?: string;
  squads: string[]; // squad ids
  blessingsSent: number;
  cursesSent: number;
  receivedDecrees: DecreeVerdict[];
}
