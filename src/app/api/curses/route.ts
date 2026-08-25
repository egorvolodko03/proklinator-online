import { NextRequest, NextResponse } from 'next/server';
import { DecreeVerdict, KarmaFeedItem, KarmaRealm } from '@/types';
import { INITIAL_FEED } from '@/data/feed';

// Shared in-memory registry for short URLs: id -> DecreeVerdict
const decreeRegistry = new Map<string, DecreeVerdict>();

let globalCurses: KarmaFeedItem[] = [...INITIAL_FEED];

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
    totalCount: globalCurses.length,
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
    const { 
      id, 
      realm, 
      squadId,
      targetName, 
      telegramUsername, 
      category, 
      sin, 
      curseTitle, 
      severity, 
      verdictText, 
      clerkSignature, 
      isGoldenSeal 
    } = body;

    if (!targetName || !sin || !curseTitle) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const decreeId = id || Math.random().toString(36).substring(2, 10);
    const newVerdict: DecreeVerdict = {
      id: decreeId,
      realm: (realm || 'dark') as KarmaRealm,
      squadId,
      caseNumber: `№ КРМ-${decreeId.toUpperCase().slice(0, 4)}-Г`,
      targetName,
      telegramUsername: telegramUsername || undefined,
      category: category || 'other',
      actionText: sin,
      verdictText: verdictText || curseTitle,
      verdictTitle: curseTitle,
      tier: severity || 'medium',
      createdAt: 'Только что',
      clerkSignature: clerkSignature || (realm === 'light' ? 'Хранитель Благодати' : 'Архивариус Трибунала'),
      sealColor: realm === 'light' ? '#fbbf24' : '#ff4d28',
      isGoldenSeal: Boolean(isGoldenSeal),
    };

    // Store in registry for short link lookups
    decreeRegistry.set(decreeId, newVerdict);

    const newItem: KarmaFeedItem = {
      id: decreeId,
      realm: newVerdict.realm,
      squadId: newVerdict.squadId,
      targetName: newVerdict.targetName,
      telegramUsername: newVerdict.telegramUsername,
      category: newVerdict.category,
      sin: newVerdict.actionText,
      curseTitle: newVerdict.verdictTitle,
      severity: newVerdict.tier as any,
      timeAgo: 'Только что',
    };

    // Keep real chronological list
    globalCurses = [newItem, ...globalCurses.filter((c) => c.id !== decreeId).slice(0, 49)];

    return NextResponse.json({ success: true, verdict: newVerdict, id: decreeId });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
