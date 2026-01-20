module.exports = async function handler(req, res) {
  /* ===== CORS ===== */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const text = message.toLowerCase().trim();

    /* ===============================
       1️⃣ HUỶ TOUR – ƯU TIÊN CAO NHẤT
    =============================== */
    const cancelKeywords = ["huỷ", "hủy", "cancel", "không đi", "bỏ tour"];
    if (cancelKeywords.some(k => text.includes(k))) {
      return res.json({
        reply:
          "Dạ mình xin phép thông tin rõ ạ 🙏\n\n" +
          "🤖 Đây là **chatbot tư vấn tự động**, không xử lý huỷ tour trực tiếp.\n\n" +
          "👉 Để huỷ tour hoặc thay đổi lịch, anh/chị vui lòng liên hệ trực tiếp:\n" +
          "📞 Zalo: https://zalo.me/0774546748\n" +
          "📘 Facebook: https://www.facebook.com/pm.trogn\n\n" +
          "Bên mình sẽ hỗ trợ nhanh nhất cho anh/chị ạ."
      });
    }

    /* ===============================
       2️⃣ LỜI CHÀO
    =============================== */
    if (["chào", "hi", "hello", "alo"].includes(text)) {
      return res.json({
        reply:
          "Chào anh/chị 👋\n" +
          "Mình là chatbot tư vấn tour Rừng Dừa Bảy Mẫu.\n" +
          "Anh/chị cho mình biết **ngày đi và số người** để mình tư vấn chi tiết nhé."
      });
    }

    /* ===============================
       3️⃣ KHÁCH MUỐN ĐẶT TOUR
    =============================== */
    const bookingWords = ["đặt", "muốn đi", "chốt", "ok", "xác nhận"];
    if (bookingWords.some(w => text.includes(w))) {
      return res.json({
        reply:
          "Dạ mình xin thông tin rõ với anh/chị ạ 🙏\n\n" +
          "🤖 Đây là **chatbot tư vấn**, chỉ hỗ trợ:\n" +
          "• Thông tin tour\n• Giá tham khảo\n• Chính sách đặt & huỷ\n• Chính sách bảo mật\n\n" +
          "❗ Bot **KHÔNG có chức năng đặt tour hoặc giữ chỗ**.\n\n" +
          "👉 Để đặt tour chính thức, anh/chị vui lòng:\n" +
          "🔹 Điền form đăng ký trên website\n" +
          "🔹 Hoặc liên hệ trực tiếp:\n" +
          "📞 Zalo: https://zalo.me/0774546748\n" +
          "📘 Facebook: https://www.facebook.com/pm.trogn\n\n" +
          "Bên mình sẽ xác nhận và hỗ trợ nhanh nhất cho anh/chị 🌴"
      });
    }

    /* ===============================
       4️⃣ MẶC ĐỊNH – TƯ VẤN CHUNG
    =============================== */
    return res.json({
      reply:
        "Dạ mình là chatbot tư vấn tour Rừng Dừa Bảy Mẫu 🌴\n\n" +
        "Anh/chị có thể hỏi mình về:\n" +
        "• Giá tour\n• Lịch trình\n• Thời gian tham quan\n• Chính sách đặt & huỷ\n• Chính sách bảo mật\n\n" +
        "👉 Nếu cần đặt hoặc huỷ tour, vui lòng liên hệ trực tiếp qua Zalo hoặc Facebook để được hỗ trợ nhanh nhất ạ."
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
