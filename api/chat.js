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

    const text = message.toLowerCase();

    /* ===============================
       1️⃣ CHÍNH SÁCH BẢO MẬT
    =============================== */
    if (text.includes("bảo mật")) {
      return res.json({
        reply:
          "🔐 CHÍNH SÁCH BẢO MẬT THÔNG TIN\n\n" +
          "• Thông tin khách hàng chỉ dùng để tư vấn và hỗ trợ dịch vụ tour.\n" +
          "• Không chia sẻ cho bên thứ ba khi chưa có sự đồng ý.\n" +
          "• Dữ liệu được bảo mật theo quy định hiện hành.\n\n" +
          "Anh/chị có thể yên tâm khi liên hệ trực tiếp với bên mình ạ."
      });
    }

    /* ===============================
       2️⃣ QUY TRÌNH ĐẶT TOUR
    =============================== */
    if (text.includes("đặt")) {
      return res.json({
        reply:
          "📌 QUY TRÌNH ĐẶT TOUR RỪNG DỪA BẢY MẪU\n\n" +
          "Bước 1️⃣: Liên hệ Zalo hoặc Facebook của bên mình\n" +
          "Bước 2️⃣: Cung cấp ngày đi & số lượng khách\n" +
          "Bước 3️⃣: Nhân viên xác nhận giá & lịch trống\n" +
          "Bước 4️⃣: Chốt tour và xác nhận bằng tin nhắn\n\n" +
          "❗ Chatbot không có chức năng đặt tour.\n\n" +
          "👉 Liên hệ trực tiếp tại:\n" +
          "📞 Zalo: https://zalo.me/0774546748\n" +
          "📘 Facebook: https://www.facebook.com/pm.trogn"
      });
    }

    /* ===============================
       3️⃣ QUY TRÌNH HUỶ TOUR
    =============================== */
    if (text.includes("huỷ") || text.includes("hủy") || text.includes("cancel")) {
      return res.json({
        reply:
          "📌 QUY TRÌNH HUỶ / ĐỔI LỊCH TOUR\n\n" +
          "• Thông báo huỷ hoặc đổi lịch trước ngày đi ít nhất 24h.\n" +
          "• Một số trường hợp sát ngày sẽ áp dụng phí theo chính sách.\n" +
          "• Việc huỷ tour cần xác nhận trực tiếp với nhân viên.\n\n" +
          "❗ Chatbot không xử lý huỷ tour trực tiếp.\n\n" +
          "👉 Vui lòng liên hệ:\n" +
          "📞 Zalo: https://zalo.me/0774546748\n" +
          "📘 Facebook: https://www.facebook.com/pm.trogn"
      });
    }

    /* ===============================
       4️⃣ GIÁ TOUR THAM KHẢO
    =============================== */
    if (text.includes("giá")) {
      return res.json({
        reply:
          "💰 GIÁ TOUR RỪNG DỪA BẢY MẪU (THAM KHẢO)\n\n" +
          "• Ngày thường: từ 130.000đ/thuyền (2 người lớn)\n" +
          "• Cuối tuần / lễ: giá có thể thay đổi\n\n" +
          "👉 Giá chính xác sẽ được nhân viên xác nhận khi liên hệ trực tiếp."
      });
    }

    /* ===============================
       5️⃣ MẶC ĐỊNH – GIỚI THIỆU
    =============================== */
    return res.json({
      reply:
        "🤖 Mình là chatbot tư vấn tour Rừng Dừa Bảy Mẫu 🌴\n\n" +
        "Mình có thể hỗ trợ anh/chị:\n" +
        "• Thông tin tour\n" +
        "• Giá tham khảo\n" +
        "• Quy trình đặt & huỷ tour\n" +
        "• Chính sách bảo mật\n\n" +
        "❗ Chatbot không nhận đặt hoặc huỷ tour trực tiếp.\n" +
        "👉 Anh/chị có thể hỏi mình về quy trình hoặc chính sách nhé."
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
