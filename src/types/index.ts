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
  caseNumber: string;
  targetName: string;
  telegramUsername?: string;
  category: Category;
  actionText: string; // The Sin or The Good Deed
  verdictText: string; // The Curse or The Blessing
  verdictTitle: string;
  tier: string;
  createdAt: string;
  clerkSignature: string;
  sealColor: string;
  isGoldenSeal?: boolean;
}

// Backward compatibility alias
export type CurseVerdict = DecreeVerdict;

export interface KarmaFeedItem {
  id: string;
  realm: KarmaRealm;
  targetName: string;
  telegramUsername?: string;
  category: Category;
  sin: string; // or deed
  curseTitle: string; // or blessingTitle
  severity: SeverityLevel | BlessingLevel;
  timeAgo: string;
  isMirrored?: boolean;
}

export interface ShopArtifact {
  id: string;
  icon: string;
  title: string;
  description: string;
  cost: number; // in Karma Coins
  badge: string;
  badgeColor: string;
  actionType: 'shield' | 'absolution' | 'eye' | 'golden_seal' | 'coffee';
}

export interface UserKarmaProfile {
  coins: number;
  activeShields: number;
  hasAbsolution: boolean;
  hasGoldenSeal: boolean;
  hasDetectiveEye: boolean;
  blessingsSent: number;
  cursesSent: number;
  receivedDecrees: DecreeVerdict[];
}
