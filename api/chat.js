module.exports = async function handler(req, res) {
  /* ================= CORS ================= */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const cleanMessage = message.trim();
    const lowerMessage = cleanMessage.toLowerCase();

    /* =====================================================
       ✅ CHẶN LỖI LỜI CHÀO NGAY TỪ SERVER (QUAN TRỌNG)
    ===================================================== */
    if (["chào", "hi", "hello", "alo"].includes(lowerMessage)) {
      return res.status(200).json({
        reply:
          "Chào anh/chị 👋 Anh/chị cho mình biết ngày đi và số người để mình tư vấn chính xác nhé."
      });
    }

    /* ================= SYSTEM PROMPT ================= */
    const SYSTEM = `
Bạn là PHẠM TRỌNG – nhân viên tư vấn tour du lịch chuyên nghiệp, nói chuyện như người thật.

================ NGUYÊN TẮC BẮT BUỘC ================
- KHÔNG hỏi lại thông tin khách đã cung cấp
- Nếu khách đã nói NGÀY → coi là ĐÃ CÓ NGÀY
- Nếu khách đã nói SỐ NGƯỜI → coi là ĐÃ CÓ SỐ NGƯỜI
- Nếu đã đủ NGÀY + SỐ NGƯỜI → PHẢI báo giá và gợi ý chốt tour
- Mỗi lượt CHỈ hỏi 1 thông tin còn thiếu
- Nếu khách nói ngắn ("giá", "ok", "đặt tour") → hiểu theo NGỮ CẢNH
- Gần chốt → xin SĐT nhẹ nhàng, lịch sự
- TUYỆT ĐỐI không nói "mình kiểm tra", "để mình xem"
- TUYỆT ĐỐI không nói mình là AI / hệ thống

================ PHONG CÁCH ================
- Xưng: mình – anh/chị
- Câu ngắn, dễ đọc trên điện thoại
- Giống sale tư vấn thật
`;

    const KNOWLEDGE = process.env.KNOWLEDGE_TEXT || "";

    /* ================= RÚT GỌN LỊCH SỬ ================= */
    const recentHistory = Array.isArray(history)
      ? history.slice(-8)
      : [];

    const historyText = recentHistory
      .map(h =>
        h.role === "user"
          ? `Khách: ${h.content}`
          : `Tư vấn: ${h.content}`
      )
      .join("\n");

    /* ================= CALL OPENAI ================= */
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: `
${SYSTEM}

===== THÔNG TIN TOUR =====
${KNOWLEDGE}

===== LỊCH SỬ HỘI THOẠI =====
${historyText}

===== KHÁCH VỪA NÓI =====
${cleanMessage}
        `,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const data = await response.json();

    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Anh/chị cho mình xin thêm thông tin để mình tư vấn chính xác nhé.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};