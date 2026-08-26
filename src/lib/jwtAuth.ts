import crypto from 'crypto';
import { TelegramUserData } from '@/types';

const SECRET = process.env.TELEGRAM_BOT_TOKEN || '8633526756:AAG_RC5hwERAZ_fhX_Gq59Sz8iMpGa-0LcU';

interface AuthTokenPayload {
  user: TelegramUserData;
  iat: number;
  exp: number;
}

/**
 * Creates a cryptographically signed, stateless auth token (HMAC-SHA256)
 */
export function createSignedToken(user: TelegramUserData, expiresInSeconds = 86400 * 30): string {
  const payload: AuthTokenPayload = {
    user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed auth token statelessly
 */
export function verifySignedToken(token: string): { valid: boolean; user?: TelegramUserData; error?: string } {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, error: 'Malformed token' };
    }

    const [payloadB64, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    const payload: AuthTokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (now > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }

    return { valid: true, user: payload.user };
  } catch (e) {
    return { valid: false, error: 'Token verification failed' };
  }
}
