import { NextRequest, NextResponse } from 'next/server';
import { UserKarmaProfile } from '@/types';

// In-memory persistent registry for user profiles by telegramId or username
const userProfilesRegistry = new Map<string, UserKarmaProfile>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userKey = (searchParams.get('userId') || searchParams.get('username') || '').toLowerCase().trim();

  if (!userKey) {
    return NextResponse.json({ success: false, error: 'No userId provided' }, { status: 400 });
  }

  const profile = userProfilesRegistry.get(userKey);
  if (profile) {
    return NextResponse.json({ success: true, profile });
  }

  return NextResponse.json({ success: false, message: 'Profile not found' });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, profile } = body;

    const key = (userId || username || '').toString().toLowerCase().trim();
    if (!key || !profile) {
      return NextResponse.json({ success: false, error: 'Missing key or profile' }, { status: 400 });
    }

    userProfilesRegistry.set(key, profile);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
