import { NextRequest, NextResponse } from 'next/server';

/**
 * Serverless Telegram Bot Notifier
 * Sends an anonymous decree directly to the Telegram user via Bot API.
 */
export async function POST(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'TELEGRAM_BOT_TOKEN не настроен в переменных окружения. Уведомление сохранено в реестре.',
      });
    }

    const body = await req.json();
    const { chatId, username, realm, targetName, actionText, verdictTitle, verdictText, decreeId } = body;

    const isDark = realm === 'dark';
    const webAppUrl = `https://proklinator-online.vercel.app?c_id=${decreeId}&realm=${realm}&name=${encodeURIComponent(targetName)}&sin=${encodeURIComponent(actionText)}&curse=${encodeURIComponent(verdictText)}&title=${encodeURIComponent(verdictTitle)}`;

    const messageText = isDark
      ? `⚡ <b>ВНИМАНИЕ! ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ ВЫНЕСЛА ПРИГОВОР</b>\n\n` +
        `👤 <b>Субъект:</b> ${targetName}\n` +
        `📜 <b>Вменяемое деяние:</b> <i>«${actionText}»</i>\n\n` +
        `🩸 <b>Приговор:</b> <b>${verdictTitle}</b>\n` +
        `<i>«${verdictText}»</i>\n\n` +
        `⚖️ <i>Печать астрального трибунала активна. Нажмите кнопку ниже, чтобы открыть официальную Грамоту или активировать Зеркальный Щит.</i>`
      : `✨ <b>НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ НАПРАВИЛА ВАМ ЛУЧ ДОБРА</b>\n\n` +
        `👤 <b>Адресат:</b> ${targetName}\n` +
        `🌟 <b>Доброе деяние:</b> <i>«${actionText}»</i>\n\n` +
        `🕊️ <b>Благословение:</b> <b>${verdictTitle}</b>\n` +
        `<i>«${verdictText}»</i>\n\n` +
        `✦ <i>Вам начислено +20 Кармоидов. Нажмите кнопку ниже, чтобы открыть сияющую Грамоту.</i>`;

    // Send via Telegram Bot API
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId || `@${username}`,
        text: messageText,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: isDark ? '📜 Открыть Грамоту Проклятия' : '✨ Открыть Грамоту Благодати',
                web_app: { url: webAppUrl },
              },
            ],
            [
              {
                text: isDark ? '🛡️ Активировать Зеркальный Щит' : '🪙 Забрать Кармоиды в лавке',
                web_app: { url: 'https://proklinator-online.vercel.app' },
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
