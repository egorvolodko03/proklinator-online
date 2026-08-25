import { TelegramUserData } from '@/types';

interface AuthSession {
  token: string;
  status: 'pending' | 'authenticated';
  user?: TelegramUserData;
  createdAt: number;
}

// Global in-memory map for real-time auth exchange
const authSessions = new Map<string, AuthSession>();

export function cleanupOldSessions() {
  const now = Date.now();
  for (const [token, session] of authSessions.entries()) {
    if (now - session.createdAt > 10 * 60 * 1000) {
      authSessions.delete(token);
    }
  }
}

export function getSession(token: string): AuthSession | undefined {
  cleanupOldSessions();
  return authSessions.get(token);
}

export function createPendingSession(token: string): AuthSession {
  cleanupOldSessions();
  const session: AuthSession = {
    token,
    status: 'pending',
    createdAt: Date.now(),
  };
  authSessions.set(token, session);
  return session;
}

export function verifySessionFromBot(token: string, user: TelegramUserData) {
  cleanupOldSessions();
  authSessions.set(token, {
    token,
    status: 'authenticated',
    user,
    createdAt: Date.now(),
  });
}
