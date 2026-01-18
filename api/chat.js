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

    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    /* ================= SYSTEM PROMPT ================= */
    const SYSTEM = `
Bạn là PHẠM TRỌNG – nhân viên tư vấn tour du lịch chuyên nghiệp.

================ NGUYÊN TẮC BẮT BUỘC ================
- KHÔNG hỏi lại thông tin khách đã cung cấp
- Nếu khách đã nói NGÀY → coi là ĐÃ CÓ NGÀY
- Nếu khách đã nói SỐ NGƯỜI → coi là ĐÃ CÓ SỐ NGƯỜI
- Nếu đã đủ NGÀY + SỐ NGƯỜI → PHẢI BÁO GIÁ + GỢI Ý CHỐT TOUR
- Mỗi lượt chỉ hỏi 1 thông tin còn thiếu
- Nếu khách nói ngắn ("giá", "ok", "đặt tour") → PHẢI hiểu theo NGỮ CẢNH
- Gần chốt thì xin SĐT nhẹ nhàng, lịch sự
- TUYỆT ĐỐI không nói mình là AI / hệ thống
- Khi đã đủ NGÀY + SỐ NGƯỜI → báo giá rõ ràng
- Sau khi báo giá → gợi ý đặt tour nhẹ nhàng
- Gần chốt → xin số điện thoại lịch sự

================ PHONG CÁCH ================
- Xưng: mình – anh/chị
- Câu ngắn, dễ đọc trên điện thoại
- Giống sale tư vấn thật
`;

    const KNOWLEDGE = process.env.KNOWLEDGE_TEXT || "";

    /* ================= RÚT GỌN LỊCH SỬ ================= */
    const recentHistory = history.slice(-8);

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
${message}
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
      "Mình đang kiểm tra thông tin cho anh/chị, chờ mình một chút nhé.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
