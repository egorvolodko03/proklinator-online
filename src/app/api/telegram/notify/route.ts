import { NextRequest, NextResponse } from 'next/server';

/**
 * Serverless Telegram Bot Notifier using sendPhoto
 * Sends the actual Certificate image + caption directly to the Telegram user.
 */
export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'TELEGRAM_BOT_TOKEN не настроен в переменных окружения.',
      });
    }

    const body = await req.json();
    const { chatId, username, realm, targetName, actionText, verdictTitle, verdictText, decreeId } = body;

    const isDark = realm === 'dark';
    const baseUrl = 'https://proklinator-online.vercel.app';
    
    // Direct URL to generated dynamic Certificate image
    const photoUrl = `${baseUrl}/api/og?realm=${realm}&name=${encodeURIComponent(targetName)}&sin=${encodeURIComponent(actionText)}&curse=${encodeURIComponent(verdictText)}&title=${encodeURIComponent(verdictTitle)}&case=${encodeURIComponent('№ КРМ-' + (decreeId || '777').toUpperCase())}`;

    // Clean caption under the photo
    const caption = isDark
      ? `⚖️ <b>ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ: ОФИЦИАЛЬНЫЙ ПРИГОВОР</b>\n\n` +
        `👤 <b>Субъект:</b> ${targetName}\n` +
        `📜 <b>Вменяемое деяние:</b> <i>«${actionText}»</i>\n\n` +
        `🩸 <b>Приговор:</b> <b>${verdictTitle}</b>\n` +
        `<i>«${verdictText}»</i>\n\n` +
        `<i>Печать астрального трибунала активна.</i>`
      : `✨ <b>НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ: ГРАМОТА ДОБРА</b>\n\n` +
        `👤 <b>Адресат:</b> ${targetName}\n` +
        `🌟 <b>Доброе деяние:</b> <i>«${actionText}»</i>\n\n` +
        `🕊️ <b>Благословение:</b> <b>${verdictTitle}</b>\n` +
        `<i>«${verdictText}»</i>\n\n` +
        `<i>Вам начислено +20 Кармоидов.</i>`;

    const webAppUrl = `${baseUrl}/c/${decreeId || 'view'}`;

    // Send actual Photo via Telegram Bot API
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId || (username ? `@${username.replace(/^@/, '')}` : null),
        photo: photoUrl,
        caption: caption,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: isDark ? '📜 Открыть Грамоту в Mini App' : '✨ Открыть Грамоту в Mini App',
                web_app: { url: webAppUrl },
              },
            ],
            [
              {
                text: isDark ? '🛡️ Активировать Зеркальный Щит' : '🪙 Кармическая Лавка',
                web_app: { url: baseUrl },
              },
            ],
          ],
        },
      }),
    });

    const tgData = await tgRes.json();
    return NextResponse.json({ success: tgData.ok, data: tgData });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
