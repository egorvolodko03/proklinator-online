import { NextRequest, NextResponse } from 'next/server';
import { KarmaFeedItem, Category, SeverityLevel } from '@/types';
import { INITIAL_FEED } from '@/data/feed';

// In-memory store for global server runtime
let globalCurses: KarmaFeedItem[] = [...INITIAL_FEED];

export async function GET() {
  const categoryCounts: Record<string, number> = {};
  let lightCount = 0;
  let mediumCount = 0;
  let extremeCount = 0;

  globalCurses.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    if (c.severity === 'light') lightCount++;
    else if (c.severity === 'medium') mediumCount++;
    else if (c.severity === 'extreme') extremeCount++;
  });

  let topCategory: Category = 'colleague';
  let maxCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat as Category;
    }
  });

  return NextResponse.json({
    success: true,
    totalCount: 1180 + globalCurses.length,
    realCount: globalCurses.length,
    topCategory,
    stats: {
      light: lightCount,
      medium: mediumCount,
      extreme: extremeCount,
    },
    curses: globalCurses,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetName, category, sin, curseTitle, severity } = body;

    if (!targetName || !sin || !curseTitle) {
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
    }

    const newCurse: KarmaFeedItem = {
      id: Math.random().toString(36).substring(2, 10),
      targetName,
      category: category || 'other',
      sin,
      curseTitle,
      severity: (severity as SeverityLevel) || 'medium',
      timeAgo: 'Только что',
    };

    // Prepend to top
    globalCurses = [newCurse, ...globalCurses.slice(0, 49)];

    return NextResponse.json({ success: true, curse: newCurse, total: globalCurses.length });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
