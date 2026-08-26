import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { TelegramUserData } from '@/types';
import { createSignedToken } from '@/lib/jwtAuth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8633526756:AAG_RC5hwERAZ_fhX_Gq59Sz8iMpGa-0LcU';

/**
 * Validates official Telegram Web Widget Auth Data (SHA256 HMAC of bot token)
 */
function verifyTelegramWebWidget(data: Record<string, any>, botToken: string): boolean {
  const { hash, ...dataToCheck } = data;
  if (!hash) return false;

  const dataCheckArr: string[] = [];
  Object.keys(dataToCheck)
    .sort()
    .forEach((key) => {
      if (dataToCheck[key] !== undefined && dataToCheck[key] !== null) {
        dataCheckArr.push(`${key}=${dataToCheck[key]}`);
      }
    });

  const dataCheckString = dataCheckArr.join('\n');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
}

/**
 * Validates Telegram Mini App initData (HMAC-SHA256 with "WebAppData" secret)
 */
function verifyTelegramMiniAppData(initData: string, botToken: string): { valid: boolean; user?: TelegramUserData } {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { valid: false };

    params.delete('hash');
    const dataCheckArr: string[] = [];
    Array.from(params.keys())
      .sort()
      .forEach((key) => {
        dataCheckArr.push(`${key}=${params.get(key)}`);
      });

    const dataCheckString = dataCheckArr.join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) return { valid: false };

    const userRaw = params.get('user');
    const user: TelegramUserData = userRaw ? JSON.parse(userRaw) : undefined;
    return { valid: true, user };
  } catch {
    return { valid: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Case 1: Mini App initData validation
    if (body.initData) {
      const { valid, user } = verifyTelegramMiniAppData(body.initData, BOT_TOKEN);
      if (!valid || !user) {
        return NextResponse.json({ success: false, error: 'Неверная подпись Telegram Mini App' }, { status: 401 });
      }
      const token = createSignedToken(user);
      return NextResponse.json({ success: true, user, token });
    }

    // Case 2: Web Login Widget validation
    if (body.authData) {
      const isValid = verifyTelegramWebWidget(body.authData, BOT_TOKEN);
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Неверная подпись виджета Telegram' }, { status: 401 });
      }

      // Check auth_date not expired (within 24 hours)
      const authDate = Number(body.authData.auth_date);
      const now = Math.floor(Date.now() / 1000);
      if (now - authDate > 86400) {
        return NextResponse.json({ success: false, error: 'Срок действия сессии Telegram истек' }, { status: 401 });
      }

      const user: TelegramUserData = {
        id: Number(body.authData.id),
        first_name: body.authData.first_name,
        last_name: body.authData.last_name,
        username: body.authData.username,
        photo_url: body.authData.photo_url,
      };

      const token = createSignedToken(user);
      return NextResponse.json({ success: true, user, token });
    }

    return NextResponse.json({ success: false, error: 'Отсутствуют данные авторизации' }, { status: 400 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
