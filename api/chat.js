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
       🧠 SALE KNOWLEDGE – NÃO TƯ VẤN CỐT LÕI
    ================================================= */
    const SALE_KNOWLEDGE = `
TOUR RỪNG DỪA BẢY MẪU – THÔNG TIN CỐT LÕI

- 1 thuyền chở tối đa 2 người lớn và 1 trẻ em
- Trẻ em có thể ngồi chung (tuỳ độ tuổi)
- Thời gian tham quan: 40–45 phút
- Ngày thường: từ 130.000đ / thuyền
- Cuối tuần / lễ: giá có thể thay đổi
- Có áo phao, người chèo thuyền địa phương
- Phù hợp gia đình, nhóm bạn, người lớn tuổi
- Các hoạt động như: xem trình diễn thuyền thúng, câu cua, xem quăng chài lưới, xem ca nhạc trên sông, chụp ảnh.

NGUYÊN TẮC LÀM VIỆC:
- Chatbot CHỈ tư vấn thông tin & chính sách
- KHÔNG nhận đặt tour
- KHÔNG huỷ tour
- Khi khách muốn đặt/huỷ → giải thích quy trình & hướng dẫn liên hệ
`;

    /* =================================================
       1️⃣ INTENT: HUỶ / ĐỔI TOUR (KHÔNG XỬ LÝ TRỰC TIẾP)
    ================================================= */
    const cancelWords = ["huỷ", "hủy", "cancel", "không đi", "bỏ tour", "đổi ngày"];
    if (cancelWords.some(w => text.includes(w))) {
      return res.json({
        reply:
          "📌 QUY TRÌNH HUỶ / ĐỔI LỊCH TOUR\n\n" +
          "• Thông báo trước ngày đi ít nhất 24h để được hỗ trợ tốt nhất.\n" +
          "• Trường hợp sát giờ có thể áp dụng phí theo chính sách.\n\n" +
          "• Nếu khách đặt lịch vào ngày mưa bão và không thể đi được thì có thể được hỗ trợ hoàn phí 100% cho khách hàng.\n\n" +
          "❗ Bên mình không xử lý huỷ/đổi qua chatbot.\n\n" +
          "👉 Anh/chị vui lòng liên hệ trực tiếp:\n" +
          "📞 Zalo: https://zalo.me/0774546748\n" +
          "📞 Phone: 077.4546.748
          "📘 Facebook: https://www.facebook.com/pm.trogn"
      });
    }

    /* =================================================
       2️⃣ INTENT: QUY TRÌNH ĐẶT TOUR (KHÔNG NHẬN ĐẶT)
    ================================================= */
    const bookingWords = ["đặt", "chốt", "ok", "xác nhận", "muốn đi"];
    if (bookingWords.some(w => text.includes(w))) {
      return res.json({
        reply:
          "📌 QUY TRÌNH ĐẶT TOUR RỪNG DỪA BẢY MẪU\n\n" +
          "Bước 1️⃣: Liên hệ Zalo hoặc Facebook\n" +
          "Bước 2️⃣: Cung cấp ngày đi & số lượng khách\n" +
          "Bước 3️⃣: Nhân viên xác nhận lịch trống & giá chính xác\n" +
          "Bước 4️⃣: Chốt tour trực tiếp với nhân viên\n\n" +
          "❗ Chatbot chỉ hỗ trợ tư vấn, không nhận đặt tour.\n\n" +
          "👉 Liên hệ: 077.4546.748\n" +
          "📞 Zalo: https://zalo.me/0774546748\n" +
          "📘 Facebook: https://www.facebook.com/pm.trogn"
      });
    }

    /* =================================================
       3️⃣ INTENT: TÍNH SỐ THUYỀN (SALE SUY LUẬN)
       Áp dụng cho: “10 người đi sao”, “nhóm 10 người”
    ================================================= */
    const boatIntentWords = [
      "bao nhiêu thuyền",
      "mấy thuyền",
      "đi thế nào",
      "sắp xếp sao",
      "tính sao",
      "chia như thế nào"
    ];

    if (
      (boatIntentWords.some(k => text.includes(k)) ||
        (text.includes("người") && text.match(/\d+/))) &&
      text.match(/\d+/)
    ) {
      const people = parseInt(text.match(/\d+/)[0]);
      const boats = Math.ceil(people / 2);

      return res.json({
        reply:
          `👥 Với ${people} người lớn, thông thường sẽ sắp xếp khoảng ${boats} thuyền ` +
          `(mỗi thuyền 2 người lớn và 1 trẻ em).\n\n` +
          "📌 Đây là cách tính tham khảo. Khi anh/chị liên hệ trực tiếp, " +
          "nhân viên sẽ hỗ trợ sắp xếp phù hợp nhất cho đoàn ạ."
      });
    }

    /* =================================================
       4️⃣ INTENT: GIÁ TOUR
    ================================================= */
    if (text.includes("giá") || text.includes("chi phí") || text.includes("bao nhiêu tiền")) {
      return res.json({
        reply:
          "💰 GIÁ TOUR RỪNG DỪA BẢY MẪU (THAM KHẢO)\n\n" +
          "• Ngày thường: từ 130.000đ/thuyền (2 người lớn + 1 trẻ em)\n" +
          "• Cuối tuần / lễ: giá có thể thay đổi\n\n" +
          "👉 Giá chính xác sẽ được nhân viên xác nhận khi anh/chị liên hệ trực tiếp."
      });
    }

    /* =================================================
       5️⃣ INTENT: CHÍNH SÁCH BẢO MẬT
    ================================================= */
    if (text.includes("bảo mật") || text.includes("thông tin")) {
      return res.json({
        reply:
          "🔐 CHÍNH SÁCH BẢO MẬT\n\n" +
          "• Thông tin khách hàng chỉ dùng để tư vấn & hỗ trợ dịch vụ.\n" +
          "• Không chia sẻ cho bên thứ ba khi chưa có sự đồng ý.\n" +
          "• Tuân thủ quy định bảo mật thông tin hiện hành."
      });
    }

    /* =================================================
       6️⃣ AI SALE – CHO CÂU HỎI LINH HOẠT
    ================================================= */
    const SYSTEM_PROMPT = `
Bạn là nhân viên tư vấn tour du lịch chuyên nghiệp.
Nhiệm vụ:
- Tư vấn rõ ràng, thân thiện, giống sale thật
- Hiểu ý định câu hỏi, không phụ thuộc từ ngữ
- Chủ động suy luận khi cần (số người, trải nghiệm)
- KHÔNG nhận đặt hoặc huỷ tour
- Khi khách muốn đặt/huỷ → giải thích quy trình & hướng dẫn liên hệ
- Không lặp câu giới thiệu
- Không nhắc đến AI hay hệ thống
`;

    const historyText = history
      .slice(-6)
      .map(h =>
        h.role === "user" ? `Khách: ${h.content}` : `Tư vấn: ${h.content}`
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
        input: `
${SYSTEM_PROMPT}

===== KIẾN THỨC =====
${SALE_KNOWLEDGE}

===== LỊCH SỬ =====
${historyText}

===== KHÁCH VỪA HỎI =====
${message}
        `,
      }),
    });

    const data = await response.json();
    const reply =
      data.output_text ||
      data.output?.[0]?.content?.[0]?.text ||
      "Anh/chị có thể hỏi thêm để mình hỗ trợ rõ hơn nhé.";

    return res.json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
