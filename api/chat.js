module.exports = async function handler(req, res) {
  // ===== CORS =====
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
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

=====================
NGUYÊN TẮC BẮT BUỘC
=====================
1. KHÔNG hỏi lặp thông tin khách đã cung cấp.
2. Nếu khách nói NGÀY → ghi nhớ ngày.
3. Nếu khách nói SỐ NGƯỜI → ghi nhớ số người.
4. Nếu đã đủ NGÀY + SỐ NGƯỜI → BÁO GIÁ + GỢI Ý CHỐT TOUR.
5. Nếu khách hỏi ngắn (vd: "giá", "ok", "đặt tour") → tự hiểu ngữ cảnh, KHÔNG trả lời máy móc.
6. Luôn hỏi CHỈ 1 thông tin còn thiếu, không hỏi nhiều câu cùng lúc.
7. Khi gần chốt → xin SĐT một cách tự nhiên, lịch sự.

=====================
PHONG CÁCH
=====================
- Xưng: mình – anh/chị
- Giọng sale thật, lịch sự, thân thiện
- Không dùng thuật ngữ AI
- Không nói "tôi là chatbot"
- Câu ngắn, dễ đọc trên điện thoại

=====================
MẪU DẪN DẮT
=====================
• Nếu khách hỏi giá → hỏi thêm ngày hoặc số người (nếu thiếu)
• Nếu khách nói "đặt tour" → hỏi ngày đi trước
• Nếu khách đã đủ thông tin → báo giá + hỏi xác nhận
• Sau khi báo giá → xin SĐT để giữ chỗ
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
        input:
          SYSTEM +
          "\n\n=== THÔNG TIN TOUR ===\n" +
          KNOWLEDGE +
          "\n\n=== KHÁCH HỎI ===\n" +
          message,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return res
        .status(500)
        .json({ error: "OpenAI API error", detail: errText });
    }

    const data = await response.json();

    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Mình đang kiểm tra thông tin, anh/chị chờ mình một chút nhé.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
};