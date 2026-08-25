import { NextRequest, NextResponse } from 'next/server';
import { KarmaFeedItem, Category, KarmaRealm } from '@/types';
import { INITIAL_FEED } from '@/data/feed';

// In-memory store for global server runtime
let globalCurses: KarmaFeedItem[] = INITIAL_FEED.map((item) => ({
  ...item,
  realm: (item.realm || 'dark') as KarmaRealm,
}));

export async function GET() {
  const categoryCounts: Record<string, number> = {};
  let darkCount = 0;
  let lightCount = 0;

  globalCurses.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
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
    const { realm, targetName, telegramUsername, category, sin, curseTitle, severity } = body;

    if (!targetName || !sin || !curseTitle) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const newItem: KarmaFeedItem = {
      id: Math.random().toString(36).substring(2, 10),
      realm: (realm || 'dark') as KarmaRealm,
      targetName,
      telegramUsername: telegramUsername || undefined,
      category: category || 'other',
      sin,
      curseTitle,
      severity: severity || 'medium',
      timeAgo: 'Только что',
    };

    // Prepend to top
    globalCurses = [newItem, ...globalCurses.slice(0, 59)];

    return NextResponse.json({ success: true, curse: newItem, total: globalCurses.length });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
