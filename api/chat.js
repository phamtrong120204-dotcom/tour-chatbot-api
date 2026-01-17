module.exports = async function handler(req, res) {
  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader_drop = () => {};
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, history = [] } = req.body || {};
    if (!message)
      return res.status(400).json({ error: "Missing message" });

    const SYSTEM = `
Bạn là PHẠM TRỌNG – nhân viên tư vấn tour du lịch chuyên nghiệp, thân thiện, nói chuyện tự nhiên như người thật.

NGUYÊN TẮC:
- Không hỏi lặp thông tin khách đã cung cấp
- Nếu đã có NGÀY → không hỏi lại ngày
- Nếu đã có SỐ NGƯỜI → không hỏi lại số người
- Khi đủ thông tin → báo giá + gợi ý chốt tour
- Nếu khách nói ngắn ("giá", "ok", "đặt tour") → tự hiểu ngữ cảnh
- Mỗi lần chỉ hỏi 1 thông tin còn thiếu
- Gần chốt thì xin SĐT nhẹ nhàng

PHONG CÁCH:
- Xưng: mình – anh/chị
- Ngắn gọn, dễ hiểu
- Giống sale thật, không máy móc
`;

    const KNOWLEDGE = process.env.KNOWLEDGE_TEXT || "";

    // ===== TẠO LỊCH SỬ HỘI THOẠI =====
    const historyText = history
      .map(h =>
        h.role === "user"
          ? `Khách: ${h.content}`
          : `Tư vấn: ${h.content}`
      )
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input:
          SYSTEM +
          "\n\n=== THÔNG TIN TOUR ===\n" +
          KNOWLEDGE +
          "\n\n=== LỊCH SỬ HỘI THOẠI ===\n" +
          historyText +
          "\n\n=== KHÁCH NÓI TIẾP ===\n" +
          message,
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
      "Mình đang kiểm tra thông tin, anh/chị chờ mình một chút nhé.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};