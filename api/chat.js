module.exports = async function handler(req, res) {
  /* ================= CORS ================= */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message, history = [] } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const text = message.toLowerCase().trim();

    /* =================================================
       1️⃣ HUỶ TOUR – ƯU TIÊN CAO NHẤT (KHÔNG GỌI AI)
    ================================================= */
    const cancelKeywords = [
      "huỷ",
      "hủy",
      "không đi",
      "không đi nữa",
      "bỏ tour",
      "cancel"
    ];

    if (cancelKeywords.some(k => text.includes(k))) {
      return res.status(200).json({
        reply:
          "Dạ mình đã ghi nhận yêu cầu huỷ tour của anh/chị ạ. 🙏\n\n" +
          "Vì trường hợp huỷ tour cần kiểm tra chính sách và thời điểm cụ thể, " +
          "anh/chị vui lòng liên hệ trực tiếp để bên mình hỗ trợ nhanh nhất nhé:\n\n" +
          "👉 Zalo: https://zalo.me/0774546748\n" +
          "👉 Facebook: https://www.facebook.com/pm.trogn\n\n" +
          "Bên mình sẽ hỗ trợ chi tiết cho anh/chị ngay khi nhận được thông tin ạ."
      });
    }

    /* =================================================
       2️⃣ LỜI CHÀO NGẮN (KHÔNG GỌI AI)
    ================================================= */
    const greetings = ["chào", "hi", "hello", "alo"];
    if (greetings.includes(text)) {
      return res.status(200).json({
        reply:
          "Chào anh/chị 👋\n" +
          "Anh/chị cho mình biết ngày đi và số người để mình tư vấn chính xác nhé."
      });
    }

    /* =================================================
       3️⃣ NHẬN DIỆN KHÁCH ĐÃ CÓ NGÀY + SỐ NGƯỜI
    ================================================= */
    const hasDate =
      /\d{1,2}[\/\-]\d{1,2}/.test(text) || text.includes("ngày");
    const hasPeople =
      /(\d+)\s*(người|khách)/.test(text);

    if (hasDate && hasPeople) {
      return res.status(200).json({
        reply:
          "Dạ mình đã nắm được thông tin rồi ạ 👍\n" +
          "Anh/chị cho mình xin số điện thoại để mình báo giá chi tiết và giữ chỗ giúp anh/chị nhé."
      });
    }

    /* =================================================
       4️⃣ KHÁCH NÓI ĐẶT / OK / XÁC NHẬN
    ================================================= */
    const bookingWords = ["đặt", "ok", "chốt", "xác nhận"];
    if (bookingWords.some(w => text.includes(w))) {
      return res.status(200).json({
        reply:
          "Dạ anh/chị cho mình xin số điện thoại để mình giữ chỗ và gửi thông tin chi tiết cho mình nhé."
      });
    }

    /* =================================================
       5️⃣ SYSTEM PROMPT – CHỈ DÙNG CHO TƯ VẤN
    ================================================= */
    const SYSTEM = `
Bạn là PHẠM TRỌNG – nhân viên tư vấn tour du lịch chuyên nghiệp.

NGUYÊN TẮC:
- KHÔNG hỏi lại thông tin khách đã cung cấp
- Nếu đã có NGÀY → không hỏi lại ngày
- Nếu đã có SỐ NGƯỜI → không hỏi lại số người
- Khi đủ thông tin → báo giá + gợi ý chốt tour
- Mỗi lượt chỉ hỏi 1 thông tin còn thiếu
- TUYỆT ĐỐI không nói "mình kiểm tra", "đợi mình xem"
- Không nhắc đến AI / hệ thống

PHONG CÁCH:
- Xưng: mình – anh/chị
- Ngắn gọn, lịch sự, giống sale thật
`;

    const KNOWLEDGE = process.env.KNOWLEDGE_TEXT || "";

    /* =================================================
       6️⃣ RÚT GỌN LỊCH SỬ
    ================================================= */
    const recentHistory = history.slice(-6);
    const historyText = recentHistory
      .map(h =>
        h.role === "user"
          ? `Khách: ${h.content}`
          : `Tư vấn: ${h.content}`
      )
      .join("\n");

    /* =================================================
       7️⃣ GỌI OPENAI (CHỈ KHI CẦN TƯ VẤN)
    ================================================= */
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

===== LỊCH SỬ =====
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
      "Anh/chị cho mình thêm một chút thông tin để mình tư vấn chính xác nhé.";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};