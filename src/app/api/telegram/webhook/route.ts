import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromBot } from '@/app/api/auth/session/route';
import { TelegramUserData } from '@/types';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8633526756:AAG_RC5hwERAZ_fhX_Gq59Sz8iMpGa-0LcU';

/**
 * Telegram Webhook Handler
 * Handles /start, /help, auth deep-links and rich navigation
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;

    if (message && message.text) {
      const chatId = message.chat.id;
      const firstName = message.from?.first_name || 'Смертный';
      const lastName = message.from?.last_name || '';
      const username = message.from?.username;
      const userId = message.from?.id || chatId;

      const userObj: TelegramUserData = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        username: username,
      };

      // Check for /start with deep link payload (e.g. /start auth_abc123 or /start web_auth)
      const textParts = message.text.split(' ');
      if (textParts[0] === '/start' && textParts.length > 1) {
        const payload = textParts[1].trim();
        if (payload.startsWith('auth_') || payload.startsWith('web_auth')) {
          verifySessionFromBot(payload, userObj);
        }
      }

      // Also verify generic web_auth session if started directly
      verifySessionFromBot('web_auth', userObj);

      if (message.text.startsWith('/start') || message.text.startsWith('/help')) {
        const welcomeText =
          `⚖️ <b>Добро пожаловать в Кармическую Канцелярию, ${firstName}!</b>\n\n` +
          `Здесь вершатся судьбы, накладываются шуточные микро-кары и ниспосылаются астральные благословения.\n\n` +
          `🛡️ <i>Ваш профиль ${username ? '@' + username : ''} успешно подключен к канцелярии. Теперь вы можете получать анонимные грамоты в виде полноценных фото, отражать их щитами и объединяться в офисные сквады!</i>\n\n` +
          `Нажмите кнопку ниже, чтобы запустить нужный раздел:`;

        const bannerUrl = `https://proklinator-online.vercel.app/api/og?realm=dark&name=${encodeURIComponent(firstName)}&sin=${encodeURIComponent('Подключение к канцелярии')}&curse=${encodeURIComponent('Вам начислен бесплатный зеркальный щит от сглаза')}&title=${encodeURIComponent('Доступ в астрал открыт')}`;

        const inlineKeyboard = [
          [
            {
              text: '⚡ Запустить Проклинатор & Благословитель',
              web_app: { url: 'https://proklinator-online.vercel.app' },
            },
          ],
          [
            {
              text: '👥 Офисные Сквады (Гильдии)',
              web_app: { url: 'https://proklinator-online.vercel.app/?tab=squads' },
            },
            {
              text: '🛡️ Лавка & Алтарь',
              web_app: { url: 'https://proklinator-online.vercel.app/?tab=altar' },
            },
          ],
        ];

        // Try sendPhoto first
        let photoSent = false;
        try {
          const photoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              photo: bannerUrl,
              caption: welcomeText,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: inlineKeyboard },
            }),
          });
          const pData = await photoRes.json();
          photoSent = pData.ok;
        } catch {
          photoSent = false;
        }

        // Guaranteed fallback to sendMessage if photo fails
        if (!photoSent) {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: welcomeText,
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: inlineKeyboard },
            }),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
