import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8647039088:AAFw4Zp84pM2x7F38aL89oYwN4c1jX2k4';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, userId } = body;

    let title = 'Пак Кармоидов 🪙';
    let description = '100 Кармоидов для Лавки и Алтаря';
    let starsAmount = 15; // 15 Telegram Stars
    let payload = `coins_100_${userId || 'anon'}`;

    if (itemId === 'spin_altar') {
      title = '🎰 Дополнительный Спин Алтаря';
      description = 'Мгновенное вращение Алтаря без ожидания 24 часов';
      starsAmount = 10;
      payload = `spin_altar_${userId || 'anon'}`;
    } else if (itemId === 'golden_seal_pack') {
      title = '👑 Набор Золотых Печатей (x5)';
      description = 'Эксклюзивные 3D сургучные золотые печати для приговоров';
      starsAmount = 25;
      payload = `golden_seal_5_${userId || 'anon'}`;
    } else if (itemId === 'indulgence') {
      title = '📜 Великая Индульгенция Канцелярии';
      description = 'Полное очищение кармы и иммунитет от проклятий на 3 дня';
      starsAmount = 50;
      payload = `indulgence_${userId || 'anon'}`;
    }

    // Call Telegram Bot API createInvoiceLink with XTR (Telegram Stars)
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        payload,
        currency: 'XTR', // Official Telegram Stars currency
        prices: [{ label: title, amount: starsAmount }],
      }),
    });

    const data = await tgRes.json();

    if (data.ok && data.result) {
      return NextResponse.json({
        success: true,
        invoiceLink: data.result,
        starsAmount,
        title,
      });
    }

    // Fallback if bot token hasn't enabled stars or running in mock
    return NextResponse.json({
      success: true,
      invoiceLink: `https://t.me/proklinator_bot?start=pay_${itemId}`,
      starsAmount,
      title,
      isMock: true,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
