import { NextRequest, NextResponse } from 'next/server';
import { DecreeVerdict, KarmaFeedItem, KarmaRealm } from '@/types';
import { INITIAL_FEED } from '@/data/feed';
import fs from 'fs';
import path from 'path';

const TMP_FILE = path.join(process.platform === 'win32' ? process.cwd() : '/tmp', '.decrees_cache.json');

// In-memory registry with persistent file backup
const decreeRegistry = new Map<string, DecreeVerdict>();

function initDecrees() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const content = fs.readFileSync(TMP_FILE, 'utf8');
      const data = JSON.parse(content);
      Object.entries(data).forEach(([k, v]) => {
        decreeRegistry.set(k, v as DecreeVerdict);
      });
    }
  } catch {
    // ignore
  }
}

function persistDecrees() {
  try {
    // Keep last 150 decrees in cache file
    const entries = Array.from(decreeRegistry.entries()).slice(-150);
    const obj = Object.fromEntries(entries);
    fs.writeFileSync(TMP_FILE, JSON.stringify(obj), 'utf8');
  } catch {
    // ignore
  }
}

initDecrees();

let globalCurses: KarmaFeedItem[] = [...INITIAL_FEED];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    let verdict = decreeRegistry.get(id);

    // If not found in memory, try re-reading cache file
    if (!verdict) {
      initDecrees();
      verdict = decreeRegistry.get(id);
    }

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

    // Store in registry and persist to disk
    decreeRegistry.set(decreeId, newVerdict);
    persistDecrees();

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

    globalCurses = [newItem, ...globalCurses.filter((c) => c.id !== decreeId).slice(0, 49)];

    return NextResponse.json({ success: true, verdict: newVerdict, id: decreeId });
  } catch {
    return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
  }
}
