// Vercel Serverless Function: Secure Telegram Order Notification API
// Ushbu fayl server tomonida ishlaydi va Telegram Bot Tokenini brauzerda fosh qilmasdan xavfsiz jo'natadi.

export default async function handler(req: any, res: any) {
  // Faqat POST so'rovlarini qabul qilish
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || process.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ 
      error: 'Telegram Bot Token or Chat ID not configured on server.',
      hint: 'Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment variables.'
    });
  }

  const { order, messageText, inlineKeyboard } = req.body || {};

  let finalMessage = messageText;

  if (!finalMessage && order) {
    const itemsList = (order.items || [])
      .map((i: any) => `- ${i.name} (${i.quantity}x ${i.price?.toLocaleString()} so'm)`)
      .join('\n');

    finalMessage = `
🍗 <b>Yangi Buyurtma! #${order.id}</b>
👤 <b>Mijoz:</b> ${order.userName || 'Mehmon'}
📞 <b>Tel:</b> ${order.phone}
📍 <b>Manzil:</b> ${order.address}
💳 <b>To'lov:</b> ${order.paymentMethod}
${order.orderNote ? `📝 <b>Izoh:</b> ${order.orderNote}\n` : ''}
🛒 <b>Tarkibi:</b>
${itemsList}

💰 <b>Jami:</b> ${(order.total || 0).toLocaleString()} so'm
    `;
  }

  try {
    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload: any = {
      chat_id: chatId,
      text: finalMessage,
      parse_mode: 'HTML'
    };

    if (inlineKeyboard) {
      payload.reply_markup = { inline_keyboard: inlineKeyboard };
    }

    const response = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.ok) {
      return res.status(400).json({ error: 'Telegram API Error', details: result });
    }

    return res.status(200).json({ success: true, messageId: result.result?.message_id });
  } catch (error: any) {
    console.error('Serverless Telegram handler error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
