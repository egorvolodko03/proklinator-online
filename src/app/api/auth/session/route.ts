import { NextRequest, NextResponse } from 'next/server';
import { getSession, createPendingSession, verifySessionFromBot } from '@/lib/authSessionStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
  }

  let session = getSession(token);
  if (!session) {
    session = createPendingSession(token);
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
  try {
    const body = await req.json();
    const { token, user } = body;

    if (!token || !user) {
      return NextResponse.json({ success: false, error: 'Missing token or user' }, { status: 400 });
    }

    verifySessionFromBot(token, user);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
