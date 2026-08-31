import { NextRequest, NextResponse } from 'next/server';
import { usernameToChatIdMap } from '@/app/api/profile/route';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8633526756:AAG_RC5hwERAZ_fhX_Gq59Sz8iMpGa-0LcU';
const BASE_URL = 'https://proklinator-online.vercel.app';

/**
 * Serverless Telegram Bot Notifier using direct multipart photo delivery
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientId,
      recipientUsername,
      chatId,
      username,
      realm,
      targetName,
      actionText,
      verdictTitle,
      verdictText,
      decreeId,
    } = body;

    const isDark = realm === 'dark';
    
    // Resolve numeric targetChat
    let targetChat: number | string | null = null;

    if (recipientId && !isNaN(Number(recipientId))) {
      targetChat = Number(recipientId);
    } else if (chatId && !isNaN(Number(chatId))) {
      targetChat = Number(chatId);
    } else {
      const uName = (recipientUsername || username || '').replace(/^@/, '').toLowerCase().trim();
      if (uName && usernameToChatIdMap.has(uName)) {
        targetChat = usernameToChatIdMap.get(uName)!;
      }
    }

    // If user has not started the bot or numeric chat_id is unknown
    if (!targetChat) {
      return NextResponse.json({
        success: false,
        notStarted: true,
        message: 'Recipient has not started the bot yet or chat ID unknown',
      });
    }

    // Clean anonymous caption under the photo
    const caption = isDark
      ? `⚖️ <b>ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ: ОФИЦИАЛЬНЫЙ ПРИГОВОР</b>\n\n` +
        `👤 <b>Субъект:</b> ${targetName}\n` +
        `📜 <b>Вменяемое деяние:</b> <i>«${actionText}»</i>\n\n` +
        `🩸 <b>Приговор:</b> <b>${verdictTitle}</b>\n` +
        `<i>«${verdictText}»</i>\n\n` +
        `🏛️ <i>Печать астрального трибунала активна • Доставлено анонимно</i>`
      : `✨ <b>НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ: ГРАМОТА ДОБРА</b>\n\n` +
        `👤 <b>Адресат:</b> ${targetName}\n` +
        `🌟 <b>Доброе деяние:</b> <i>«${actionText}»</i>\n\n` +
        `🕊️ <b>Благословение:</b> <b>${verdictTitle}</b>\n` +
        `<i>«${verdictText}»</i>\n\n` +
        `🏛️ <i>Заверено небесной канцелярией • Доставлено анонимно</i>`;

    const ogImageUrl = `${BASE_URL}/api/og?realm=${realm}&name=${encodeURIComponent(targetName)}&sin=${encodeURIComponent(actionText)}&curse=${encodeURIComponent(verdictText)}&title=${encodeURIComponent(verdictTitle)}&case=${encodeURIComponent('№ КРМ-' + (decreeId || '777').toUpperCase().slice(0, 5))}`;

    let sent = false;

    // 1. Fetch image buffer from OG endpoint and send as genuine multipart/form-data photo
    try {
      const imgRes = await fetch(ogImageUrl);
      if (imgRes.ok) {
        const imgArrayBuffer = await imgRes.arrayBuffer();
        const imgBuffer = Buffer.from(imgArrayBuffer);

        const formData = new FormData();
        formData.append('chat_id', targetChat.toString());
        formData.append('caption', caption);
        formData.append('parse_mode', 'HTML');
        formData.append(
          'photo',
          new Blob([imgBuffer], { type: 'image/png' }),
          `${isDark ? 'curse' : 'blessing'}_decree.png`
        );

        const sendPhotoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: formData,
        });

        const data = await sendPhotoRes.json();
        sent = data.ok;
      }
    } catch {
      sent = false;
    }

    // 2. Fallback to direct static parchment photo if buffer fetch failed
    if (!sent) {
      const fallbackPhotoUrl = isDark
        ? `${BASE_URL}/assets/certificates/dark_parchment.jpg`
        : `${BASE_URL}/assets/certificates/celestial_parchment.jpg`;

      try {
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChat,
            photo: fallbackPhotoUrl,
            caption: caption,
            parse_mode: 'HTML',
          }),
        });
        const d = await res.json();
        sent = d.ok;
      } catch {
        sent = false;
      }
    }

    // 3. Text fallback
    if (!sent) {
      const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChat,
          text: caption,
          parse_mode: 'HTML',
        }),
      });
      const mData = await msgRes.json();
      return NextResponse.json({ success: mData.ok, data: mData });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
