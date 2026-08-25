import { NextRequest, NextResponse } from 'next/server';
import { DecreeVerdict, KarmaFeedItem, KarmaRealm } from '@/types';
import { INITIAL_FEED } from '@/data/feed';

// Shared global registry map for short URLs: id -> DecreeVerdict
const decreeRegistry = new Map<string, DecreeVerdict>();

// Pre-fill initial feed
INITIAL_FEED.forEach((item) => {
  decreeRegistry.set(item.id, {
    id: item.id,
    realm: item.realm || 'dark',
    caseNumber: `№ КРМ-${item.id.toUpperCase()}-Г`,
    targetName: item.targetName,
    telegramUsername: item.telegramUsername,
    category: item.category,
    actionText: item.sin,
    verdictText: item.curseTitle,
    verdictTitle: item.curseTitle,
    tier: item.severity,
    createdAt: 'Недавно',
    clerkSignature: item.realm === 'light' ? 'Хранитель Благодати' : 'Архивариус Трибунала',
    sealColor: item.realm === 'light' ? '#fbbf24' : '#ff4d28',
  });
});

let globalCurses: KarmaFeedItem[] = Array.from(decreeRegistry.values()).map((v) => ({
  id: v.id,
  realm: v.realm,
  targetName: v.targetName,
  telegramUsername: v.telegramUsername,
  category: v.category,
  sin: v.actionText,
  curseTitle: v.verdictTitle,
  severity: v.tier as any,
  timeAgo: 'Недавно',
}));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const verdict = decreeRegistry.get(id);
    if (verdict) {
      return NextResponse.json({ success: true, verdict });
    }
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  let darkCount = 0;
  let lightCount = 0;

  globalCurses.forEach((c) => {
    if (c.realm === 'light') lightCount++;
    else darkCount++;
  });

  return NextResponse.json({
    success: true,
    totalCount: 1280 + globalCurses.length,
    realCount: globalCurses.length,
    stats: {
      dark: darkCount,
      light: lightCount,
    },
    curses: globalCurses,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, realm, targetName, telegramUsername, category, sin, curseTitle, severity, verdictText, clerkSignature } = body;

    if (!targetName || !sin || !curseTitle) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const decreeId = id || Math.random().toString(36).substring(2, 10);
    const newVerdict: DecreeVerdict = {
      id: decreeId,
      realm: (realm || 'dark') as KarmaRealm,
      caseNumber: `№ КРМ-${decreeId.toUpperCase()}-Г`,
      targetName,
      telegramUsername: telegramUsername || undefined,
      category: category || 'other',
      actionText: sin,
      verdictText: verdictText || curseTitle,
      verdictTitle: curseTitle,
      tier: severity || 'medium',
      createdAt: new Date().toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      clerkSignature: clerkSignature || (realm === 'light' ? 'Хранитель Благодати' : 'Архивариус Трибунала'),
      sealColor: realm === 'light' ? '#fbbf24' : '#ff4d28',
    };

    // Store in short link registry
    decreeRegistry.set(decreeId, newVerdict);

    const newItem: KarmaFeedItem = {
      id: decreeId,
      realm: newVerdict.realm,
      targetName: newVerdict.targetName,
      telegramUsername: newVerdict.telegramUsername,
      category: newVerdict.category,
      sin: newVerdict.actionText,
      curseTitle: newVerdict.verdictTitle,
      severity: newVerdict.tier as any,
      timeAgo: 'Только что',
    };

    globalCurses = [newItem, ...globalCurses.slice(0, 59)];

    return NextResponse.json({ success: true, verdict: newVerdict, id: decreeId });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
