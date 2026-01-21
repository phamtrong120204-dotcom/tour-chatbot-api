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
       0️⃣ INTENT: CHÀO HỎI
    ================================================= */
    const greetingWords = ["chào", "hi", "hello", "alo", "xin chào"];
    if (greetingWords.some(w => text.includes(w))) {
      return res.json({
        reply:
          "Chào anh/chị 👋\n\n" +
          "Mình hỗ trợ tư vấn tour Rừng Dừa Bảy Mẫu, gồm:\n" +
          "• Giá tour & cách tính\n" +
          "• Số người – số thuyền\n" +
          "• Trải nghiệm & thời gian\n" +
          "• Quy trình đặt / huỷ tour\n" +
          "• Chính sách bảo mật\n\n" +
          "👉 Anh/chị cứ hỏi, mình hỗ trợ chi tiết nhé 😊"
      });
    }

    /* =================================================
       🧠 SALE KNOWLEDGE
    ================================================= */
    const SALE_KNOWLEDGE = `
TOUR RỪNG DỪA BẢY MẪU:

- 1 thuyền: 2 người lớn + 1 trẻ em
- Thời gian: 40–45 phút
- Giá ngày thường: từ 130.000đ/thuyền
- Có áo phao, người chèo thuyền địa phương
- Trải nghiệm: chèo thúng, xem biểu diễn, chụp ảnh
- Phù hợp gia đình, nhóm bạn, người lớn tuổi

NGUYÊN TẮC:
- Chatbot chỉ tư vấn
- Không nhận đặt hoặc huỷ tour
- Hướng dẫn liên hệ khi cần xử lý trực tiếp
`;

    /* =================================================
       1️⃣ HUỶ / ĐỔI TOUR
    ================================================= */
    if (["huỷ", "hủy", "cancel", "đổi ngày", "bỏ tour"].some(w => text.includes(w))) {
      return res.json({
        reply:
          "📌 **QUY TRÌNH HUỶ / ĐỔI TOUR**\n\n" +
          "• Báo trước ít nhất 24h để được hỗ trợ tốt nhất\n" +
          "• Trường hợp mưa bão có thể được hỗ trợ hoàn phí\n\n" +
          "👉 Liên hệ trực tiếp:\n" +
          "📞 077.4546.748\n" +
          "📘 https://www.facebook.com/pm.trogn"
      });
    }

    /* =================================================
       2️⃣ ĐẶT TOUR (CHỈ GIẢI THÍCH QUY TRÌNH)
    ================================================= */
    if (["đặt", "chốt", "ok", "xác nhận", "muốn đi"].some(w => text.includes(w))) {
      return res.json({
        reply:
          "📌 **QUY TRÌNH ĐẶT TOUR**\n\n" +
          "1️⃣ Liên hệ Zalo / Facebook\n" +
          "2️⃣ Cung cấp ngày đi & số lượng khách\n" +
          "3️⃣ Nhân viên xác nhận lịch & giá\n\n" +
          "❗ Chatbot không nhận đặt tour trực tiếp."
      });
    }

    /* =================================================
       3️⃣ TÍNH SỐ THUYỀN
    ================================================= */
    if (text.match(/\d+/) && text.includes("người")) {
      const people = parseInt(text.match(/\d+/)[0]);
      const boats = Math.ceil(people / 2);
      return res.json({
        reply:
          `👥 Với ${people} người, thông thường sẽ sắp xếp khoảng **${boats} thuyền**.\n\n` +
          "📌 Đây là cách tính tham khảo."
      });
    }

    /* =================================================
       4️⃣ GIÁ TOUR
    ================================================= */
    if (text.includes("giá") || text.includes("bao nhiêu tiền")) {
      return res.json({
        reply:
          "💰 **GIÁ TOUR (THAM KHẢO)**\n\n" +
          "• Ngày thường: từ 130.000đ/thuyền\n" +
          "• Cuối tuần / lễ: giá có thể thay đổi"
      });
    }

    /* =================================================
       5️⃣ AI SALE – FALLBACK
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
Bạn là nhân viên tư vấn tour du lịch.
Trả lời thân thiện, tự nhiên như người thật.
Không nhận đặt hoặc huỷ tour.

Kiến thức:
${SALE_KNOWLEDGE}

Khách hỏi:
${message}
        `,
      }),
    });

    const data = await response.json();
    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Anh/chị có thể hỏi thêm để mình hỗ trợ rõ hơn nhé 😊";

    return res.json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
