// Serverless Function: Proxy bảo mật Google Gemini API (Vercel Serverless)
// Giấu hoàn toàn API Key trả phí khỏi DevTools Network của trình duyệt

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
    const { userMessage, chatHistory, model = 'gemini-1.5-flash', systemPrompt, apiKey } = req.body || {};

    // Ưu tiên API Key từ biến môi trường Vercel (bảo mật 100%)
    const key = process.env.GEMINI_API_KEY || apiKey;
    if (!key) {
      return res.status(400).json({ success: false, message: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ.' });
    }

    const contents = [];
    if (Array.isArray(chatHistory)) {
      chatHistory.slice(-6).forEach(msg => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    if (userMessage) {
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });
    }

    const payload = {
      contents: contents,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 500
      }
    };

    if (systemPrompt) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt }]
      };
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const start = Date.now();
    const gRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const latency = Date.now() - start;

    if (!gRes.ok) {
      const errData = await gRes.json().catch(() => ({}));
      return res.status(gRes.status).json({
        success: false,
        message: errData.error?.message || `Lỗi HTTP ${gRes.status} từ Google Gemini`
      });
    }

    const data = await gRes.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return res.status(200).json({
      success: true,
      text: text,
      latency: latency
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || 'Lỗi máy chủ proxy Gemini' });
  }
}
