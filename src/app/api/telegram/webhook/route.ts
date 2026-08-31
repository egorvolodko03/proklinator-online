import { NextRequest, NextResponse } from 'next/server';
import { verifySessionFromBot } from '@/lib/authSessionStore';
import { TelegramUserData, DecreeVerdict } from '@/types';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8633526756:AAG_RC5hwERAZ_fhX_Gq59Sz8iMpGa-0LcU';
const BASE_URL = 'https://proklinator-online.vercel.app';

/**
 * Telegram Webhook Handler
 * Supports: /start with deep links, inline queries (sendPhoto directly to any chat), and rich menus
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. HANDLE INLINE QUERIES (Allows sharing REAL native photo in any Telegram chat/group)
    if (update.inline_query) {
      const queryId = update.inline_query.id;
      const queryText = (update.inline_query.query || '').trim();

      let photoUrl = `${BASE_URL}/api/og?realm=dark&name=${encodeURIComponent('Коллега')}&sin=${encodeURIComponent('Подозрительная активность')}&curse=${encodeURIComponent('Печать астрала')}&title=${encodeURIComponent('Кармический Приговор')}`;
      let title = '⚖️ Грамота Проклятия или Благодати';
      let caption = `⚖️ <b>Официальная Грамота Канцелярии</b>\n\n<i>Заверено астральной печатью.</i>`;
      let webAppUrl = BASE_URL;

      if (queryText) {
        try {
          const res = await fetch(`${BASE_URL}/api/curses?id=${encodeURIComponent(queryText)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.verdict) {
              const v: DecreeVerdict = data.verdict;
              const isDark = v.realm === 'dark';
              photoUrl = `${BASE_URL}/api/og?realm=${v.realm}&name=${encodeURIComponent(v.targetName)}&sin=${encodeURIComponent(v.actionText)}&curse=${encodeURIComponent(v.verdictText)}&title=${encodeURIComponent(v.verdictTitle)}&case=${encodeURIComponent(v.caseNumber)}`;
              title = isDark ? `⚖️ Грамота Проклятия: ${v.targetName}` : `✨ Грамота Благодати: ${v.targetName}`;
              caption = isDark
                ? `⚖️ <b>ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ</b>\n📜 Официальный приговор: <b>${v.targetName}</b>\n\n⚡ Деяние: <i>«${v.actionText}»</i>\n🩸 Приговор: <b>${v.verdictTitle}</b>\n<i>«${v.verdictText}»</i>\n\n🏛️ <i>Печать: ${v.clerkSignature}</i>`
                : `✨ <b>НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ</b>\n📜 Грамота добра: <b>${v.targetName}</b>\n\n🌟 Подвиг: <i>«${v.actionText}»</i>\n🕊️ Благодать: <b>${v.verdictTitle}</b>\n<i>«${v.verdictText}»</i>\n\n🏛️ <i>Печать: ${v.clerkSignature}</i>`;
              webAppUrl = `${BASE_URL}/c/${v.id}`;
            }
          }
        } catch {
          // fallback
        }
      }

      const results = [
        {
          type: 'photo',
          id: queryId + '_photo',
          photo_url: photoUrl,
          thumb_url: photoUrl,
          title: title,
          description: 'Нажмите, чтобы отправить полноценное фото грамоты',
          caption: caption,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📜 Открыть в игре', web_app: { url: webAppUrl } },
                { text: '⚡ Наложить ответную кару', web_app: { url: BASE_URL } },
              ],
            ],
          },
        },
      ];

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerInlineQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inline_query_id: queryId,
          results: results,
          cache_time: 0,
        }),
      });

      return NextResponse.json({ ok: true });
    }

    // 2. HANDLE MESSAGES (/start, /help, deep links)
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

      // Check for /start with deep link payload (e.g. /start auth_abc123 or /start c_decreeId)
      const textParts = message.text.split(' ');
      const payload = textParts.length > 1 ? textParts[1].trim() : '';

      if (payload.startsWith('auth_') || payload.startsWith('web_auth')) {
        verifySessionFromBot(payload, userObj);
      }
      verifySessionFromBot('web_auth', userObj);

      // Handle specific decree deep-link (/start c_id123) -> send photo of decree directly!
      if (payload.startsWith('c_')) {
        const decreeId = payload.substring(2);
        try {
          const res = await fetch(`${BASE_URL}/api/curses?id=${encodeURIComponent(decreeId)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.verdict) {
              const v: DecreeVerdict = data.verdict;
              const isDark = v.realm === 'dark';
              const photoUrl = `${BASE_URL}/api/og?realm=${v.realm}&name=${encodeURIComponent(v.targetName)}&sin=${encodeURIComponent(v.actionText)}&curse=${encodeURIComponent(v.verdictText)}&title=${encodeURIComponent(v.verdictTitle)}&case=${encodeURIComponent(v.caseNumber)}`;

              const decreeCaption = isDark
                ? `⚖️ <b>ТЕМНАЯ КАНЦЕЛЯРИЯ КАРМЫ: ОФИЦИАЛЬНЫЙ ПРИГОВОР</b>\n\n` +
                  `👤 <b>Субъект:</b> ${v.targetName}\n` +
                  `📜 <b>Вменяемое деяние:</b> <i>«${v.actionText}»</i>\n\n` +
                  `🩸 <b>Приговор:</b> <b>${v.verdictTitle}</b>\n` +
                  `<i>«${v.verdictText}»</i>\n\n` +
                  `🏛️ <i>Заверено печатью: ${v.clerkSignature}</i>`
                : `✨ <b>НЕБЕСНАЯ КАНЦЕЛЯРИЯ БЛАГОДАТИ: ГРАМОТА ДОБРА</b>\n\n` +
                  `👤 <b>Адресат:</b> ${v.targetName}\n` +
                  `🌟 <b>Доброе деяние:</b> <i>«${v.actionText}»</i>\n\n` +
                  `🕊️ <b>Благословение:</b> <b>${v.verdictTitle}</b>\n` +
                  `<i>«${v.verdictText}»</i>\n\n` +
                  `🏛️ <i>Заверено печатью: ${v.clerkSignature}</i>`;

              await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  photo: photoUrl,
                  caption: decreeCaption,
                  parse_mode: 'HTML',
                  reply_markup: {
                    inline_keyboard: [
                      [
                        { text: '📜 Открыть Грамоту в игре', web_app: { url: `${BASE_URL}/c/${v.id}` } },
                      ],
                      [
                        { text: '🛡️ Отразить щитом', web_app: { url: `${BASE_URL}/?tab=shop` } },
                        { text: '👥 Офисные Сквады', web_app: { url: `${BASE_URL}/?tab=squads` } },
                      ],
                    ],
                  },
                }),
              });
              return NextResponse.json({ ok: true });
            }
          }
        } catch {
          // fallback to default welcome
        }
      }

      // Default Welcome Message
      if (message.text.startsWith('/start') || message.text.startsWith('/help')) {
        const welcomeText =
          `⚖️ <b>Добро пожаловать в Кармическую Канцелярию, ${firstName}!</b>\n\n` +
          `Здесь вершатся судьбы, накладываются шуточные микро-кары и ниспосылаются астральные благословения.\n\n` +
          `🛡️ <i>Ваш профиль ${username ? '@' + username : ''} успешно подключен к канцелярии.</i>\n\n` +
          `Нажмите кнопку ниже, чтобы запустить игру:`;

        const bannerUrl = `${BASE_URL}/api/og?realm=dark&name=${encodeURIComponent(firstName)}&sin=${encodeURIComponent('Подключение к канцелярии')}&curse=${encodeURIComponent('Вам начислен бесплатный зеркальный щит от сглаза')}&title=${encodeURIComponent('Доступ в астрал открыт')}`;

        const inlineKeyboard = [
          [
            {
              text: '⚡ Запустить Проклинатор & Благословитель',
              web_app: { url: BASE_URL },
            },
          ],
          [
            {
              text: '👥 Офисные Сквады',
              web_app: { url: `${BASE_URL}/?tab=squads` },
            },
            {
              text: '🛡️ Лавка & Алтарь',
              web_app: { url: `${BASE_URL}/?tab=altar` },
            },
          ],
        ];

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
