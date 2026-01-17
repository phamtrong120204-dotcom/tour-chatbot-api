module.exports = async function handler(req, res) {
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
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing message" });
    }

    const SYSTEM = `
Bạn là chatbot tư vấn & chốt tour du lịch Rừng Dừa Bảy Mẫu – Hội An.
Bạn là chatbot tư vấn tour du lịch chuyên nghiệp.

QUY TẮC BẮT BUỘC:
- Nếu khách đã cung cấp ngày đi hoặc số người → KHÔNG hỏi lại thông tin đó.
- Chỉ hỏi thông tin CÒN THIẾU.
- Nếu đã có đủ ngày đi + số người → chuyển sang tư vấn giá và xác nhận đặt tour.
- Không hỏi lặp câu.
- Không hỏi chung chung.

MỤC TIÊU:
- Tư vấn đúng thông tin tour
- Giải thích rõ giá, dịch vụ, thời lượng
- Dẫn dắt khách để lại ngày đi, số người hoặc SĐT

QUY TẮC:
- CHỈ dùng thông tin trong phần KIẾN THỨC
- TUYỆT ĐỐI không bịa giá, không suy đoán
- Nếu khách hỏi giá → hỏi thêm ngày đi & số người
- Nếu khách còn phân vân → gợi ý ưu điểm tour
- Không dùng thuật ngữ phức tạp

PHONG CÁCH:
- Lịch sự, thân thiện
- Ngắn gọn, dễ hiểu, không dài dòng.
- Giống nhân viên tư vấn thật, không giống AI

KẾT THÚC:
- Luôn kết câu bằng câu nếu anh chị có bất cứ thắc mắc gì thêm 
thì hãy liên hệ trực tiếp cho chúng tôi để tiếp tục tư vấn hoặc xin khách để lại số điện thoại trong phần liên lạc để lien hệ
`;

    const KNOWLEDGE = process.env.KNOWLEDGE_TEXT || "";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input:
          SYSTEM +
          "\n\nKIẾN THỨC:\n" +
          KNOWLEDGE +
          "\n\nKHÁCH HỎI:\n" +
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
      "Không có phản hồi";

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
