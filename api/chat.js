const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports = async function handler(req, res) {
  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const SYSTEM = `
Bạn là nhân viên tư vấn tour du lịch chuyên nghiệp.

NGUYÊN TẮC BẮT BUỘC:
- Nếu khách đã cung cấp NGÀY ĐI → KHÔNG hỏi lại ngày đi.
- Nếu khách đã cung cấp SỐ NGƯỜI → KHÔNG hỏi lại số người.
- Chỉ hỏi thông tin CÒN THIẾU.
- Khi đã đủ ngày đi + số người → TƯ VẤN GIÁ và XÁC NHẬN ĐẶT TOUR.
- Tuyệt đối không hỏi lặp.
- Trả lời như nhân viên tư vấn thật, không máy móc.
- Nếu khách chỉ chào (chào, hello, hi):
  → Trả lời chào lại + hỏi tour + ngày đi + số người
- Nếu khách nói “tôi muốn đặt tour”:
  → Hỏi tour nào + ngày đi + số người
PHONG CÁCH:
- Ngắn gọn, rõ ràng, lịch sự.
- Ưu tiên chốt thông tin.
`;

    const KNOWLEDGE = process.env.KNOWLEDGE_TEXT || "";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "system", content: "KIẾN THỨC:\n" + KNOWLEDGE },
          ...messages,
        ],
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
      "Xin lỗi, mình chưa có phản hồi phù hợp.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};