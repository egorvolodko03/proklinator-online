import { NextRequest, NextResponse } from 'next/server';
import { getSession, createPendingSession, verifySessionFromBot } from '@/lib/authSessionStore';
import { createSignedToken, verifySignedToken } from '@/lib/jwtAuth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8633526756:AAG_RC5hwERAZ_fhX_Gq59Sz8iMpGa-0LcU';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  // Check if caller already has a valid signed cookie
  const cookieSession = req.cookies.get('proklinator_user_session')?.value;
  if (cookieSession) {
    const verified = verifySignedToken(cookieSession);
    if (verified.valid && verified.user) {
      return NextResponse.json({
        success: true,
        status: 'authenticated',
        user: verified.user,
        token: cookieSession,
      });
    }
  }

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
  }

  let session = getSession(token);
  if (!session) {
    session = createPendingSession(token);
    return NextResponse.json({ success: true, status: 'pending' });
  }

  if (session.status === 'authenticated' && session.user) {
    const signedToken = createSignedToken(session.user);

    const res = NextResponse.json({
      success: true,
      status: 'authenticated',
      user: session.user,
      token: signedToken,
    });

    // Set signed tamper-proof session cookie (1 year)
    res.cookies.set('proklinator_user_session', signedToken, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
      httpOnly: false,
    });

    return res;
  }

  return NextResponse.json({ success: true, status: 'pending' });
}

/**
 * Secured webhook verification endpoint - requires bot token authentication
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('x-bot-secret') || req.headers.get('authorization');
    if (!authHeader || (authHeader !== BOT_TOKEN && authHeader !== `Bearer ${BOT_TOKEN}`)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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
