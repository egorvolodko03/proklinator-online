import { NextRequest, NextResponse } from 'next/server';
import { TelegramUserData } from '@/types';

// In-memory active auth sessions map: token -> { status: 'pending' | 'authenticated', user?: TelegramUserData, createdAt: number }
interface AuthSession {
  token: string;
  status: 'pending' | 'authenticated';
  user?: TelegramUserData;
  createdAt: number;
}

const authSessions = new Map<string, AuthSession>();

// Cleanup expired sessions older than 10 minutes
function cleanupOldSessions() {
  const now = Date.now();
  for (const [token, session] of authSessions.entries()) {
    if (now - session.createdAt > 10 * 60 * 1000) {
      authSessions.delete(token);
    }
  }
}

export async function GET(req: NextRequest) {
  cleanupOldSessions();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
  }

  const session = authSessions.get(token);
  if (!session) {
    // Create new pending session if queried first time
    authSessions.set(token, {
      token,
      status: 'pending',
      createdAt: Date.now(),
    });
    return NextResponse.json({ success: true, status: 'pending' });
  }

  if (session.status === 'authenticated' && session.user) {
    return NextResponse.json({
      success: true,
      status: 'authenticated',
      user: session.user,
    });
  }

  return NextResponse.json({ success: true, status: 'pending' });
}

export async function POST(req: NextRequest) {
  cleanupOldSessions();
  try {
    const body = await req.json();
    const { token, user } = body;

    if (!token || !user) {
      return NextResponse.json({ success: false, error: 'Missing token or user' }, { status: 400 });
    }

    authSessions.set(token, {
      token,
      status: 'authenticated',
      user,
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

// Export helper for direct usage in webhook handler
export function verifySessionFromBot(token: string, user: TelegramUserData) {
  authSessions.set(token, {
    token,
    status: 'authenticated',
    user,
    createdAt: Date.now(),
  });
}
