export default async function handler(req, res) {
  // Cho phép gọi từ mọi website (GitHub Pages/WordPress)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Missing message" });

    const SYSTEM = `
Bạn là chatbot tư vấn tour du lịch trên website.
Chỉ trả lời dựa trên phần KNOWLEDGE bên dưới. Không bịa giá/khuyến mãi.
Nếu không có thông tin hoặc khách hỏi giá chưa rõ: xin ngày đi + số người hoặc xin SĐT để tư vấn viên liên hệ.
Giọng văn thân thiện, ngắn gọn, rõ ràng. Luôn kết bằng: "Anh/chị dự định đi ngày nào và bao nhiêu người ạ?"
`;

    // Bạn sẽ dán nội dung từ file DOC vào biến môi trường KNOWLEDGE_TEXT trên Vercel
    const KNOWLEDGE = process.env.KNOWLEDGE_TEXT || "";

    const payload = {
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM + "\n\nKNOWLEDGE:\n" + KNOWLEDGE },
        { role: "user", content: message }
      ],
      temperature: 0.2
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(500).json({ error: "Upstream error", detail: t });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Server error" });
  }
}
