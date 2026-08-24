export type SeverityLevel = 'light' | 'medium' | 'extreme';

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

export interface Sin {
  id: string;
  text: string;
  category: Category;
}

export interface CurseVerdict {
  id: string;
  caseNumber: string;
  targetName: string;
  category: Category;
  sin: string;
  curseText: string;
  curseTitle: string;
  severity: SeverityLevel;
  createdAt: string;
  clerkSignature: string;
  sealColor: string;
}

export interface KarmaFeedItem {
  id: string;
  targetName: string;
  category: Category;
  sin: string;
  curseTitle: string;
  severity: SeverityLevel;
  timeAgo: string;
}
