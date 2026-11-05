// Serverless Function: Proxy bảo mật Telegram Bot (Vercel Serverless)
// Giấu hoàn toàn Bot Token bí mật khỏi trình duyệt người dùng

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Chỉ chấp nhận phương thức POST' });
  }

  try {
    const { htmlContent, chatId, token } = req.body || {};

    // Ưu tiên Token từ biến môi trường của Vercel (bảo mật tuyệt đối), fallback nếu có từ request
    const botToken = process.env.TELEGRAM_BOT_TOKEN || token;
    const targetChatId = process.env.TELEGRAM_CHAT_ID || chatId;

    if (!botToken || !targetChatId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu Telegram Bot Token hoặc Chat ID (vui lòng cấu hình biến môi trường trên Vercel).'
      });
    }

    if (!htmlContent) {
      return res.status(400).json({ success: false, message: 'Thiếu nội dung tin nhắn htmlContent.' });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: htmlContent,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const result = await tgRes.json();
    if (result.ok) {
      return res.status(200).json({ success: true, result });
    } else {
      return res.status(tgRes.status || 400).json({
        success: false,
        message: result.description || 'Lỗi gửi tin nhắn từ Telegram API'
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Lỗi máy chủ proxy Telegram' });
  }
}
