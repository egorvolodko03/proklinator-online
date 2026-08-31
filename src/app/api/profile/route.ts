import { NextRequest, NextResponse } from 'next/server';
import { UserKarmaProfile } from '@/types';

// Global server mappings
export const userProfilesRegistry = new Map<string, UserKarmaProfile>();
export const usernameToChatIdMap = new Map<string, number>();

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

    if (userId) {
      const numId = typeof userId === 'number' ? userId : parseInt(userId, 10);
      if (!isNaN(numId)) {
        userProfilesRegistry.set(numId.toString(), profile);
        if (username) {
          const cleanUsername = username.replace(/^@/, '').toLowerCase().trim();
          usernameToChatIdMap.set(cleanUsername, numId);
          userProfilesRegistry.set(cleanUsername, profile);
        }
      }
    }

    if (username) {
      const cleanUsername = username.replace(/^@/, '').toLowerCase().trim();
      userProfilesRegistry.set(cleanUsername, profile);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
