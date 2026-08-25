import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8633526756:AAG_RC5hwERAZ_fhX_Gq59Sz8iMpGa-0LcU';

/**
 * Serverless Telegram Bot Notifier using sendPhoto with guaranteed fallback
 */
export async function POST(req: NextRequest) {
  try {
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

    const inlineKeyboard = [
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
    ];

    const targetChat = chatId || (username ? `@${username.replace(/^@/, '')}` : null);
    if (!targetChat) {
      return NextResponse.json({ success: false, error: 'No target chat specified' }, { status: 400 });
    }

    let sent = false;
    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          photo: photoUrl,
          caption: caption,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: inlineKeyboard },
        }),
      });
      const tgData = await tgRes.json();
      sent = tgData.ok;
    } catch {
      sent = false;
    }

    if (!sent) {
      const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text: caption,
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: inlineKeyboard },
        }),
      });
      const msgData = await msgRes.json();
      return NextResponse.json({ success: msgData.ok, data: msgData });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
