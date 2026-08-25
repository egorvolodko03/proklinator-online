import { NextRequest, NextResponse } from 'next/server';

/**
 * Telegram Webhook Handler
 * Responds to /start and launches the Mini App
 */
export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ ok: true, note: 'No token configured' });
    }

    const update = await req.json();
    const message = update.message;

    if (message && message.text) {
      const chatId = message.chat.id;
      const firstName = message.from?.first_name || 'Смертный';
      const username = message.from?.username;

      if (message.text.startsWith('/start')) {
        const welcomeText =
          `⚖️ <b>Добро пожаловать в Кармическую Канцелярию, ${firstName}!</b>\n\n` +
          `Здесь вершатся судьбы, накладываются шуточные микро-кары и ниспосылаются лучи астральной благодарности.\n\n` +
          `🛡️ <i>Ваш профиль ${username ? '@' + username : ''} успешно подключен к канцелярии. Теперь вы можете получать анонимные проклятия, отражать их зеркальными щитами и благословлять друзей!</i>\n\n` +
          `Нажмите кнопку ниже, чтобы запустить приложение:`;

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '⚡ Запустить Проклинатор & Благословитель',
                    web_app: { url: 'https://proklinator-online.vercel.app' },
                  },
                ],
                [
                  {
                    text: '🛡️ Кармическая Лавка (Щиты & Бонусы)',
                    web_app: { url: 'https://proklinator-online.vercel.app' },
                  },
                ],
              ],
            },
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: errorMsg }, { status: 500 });
  }
}
