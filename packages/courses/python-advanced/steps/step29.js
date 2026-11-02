// Step 29 — Lọc và phân trang kết quả
import { createStep } from "../createStep.js";

export default createStep(28, {
    fact: "Lọc giới hạn tập kết quả; phân trang dùng page/limit hoặc cursor và phải có thứ tự ổn định.",
    trap: "Trả mọi hàng trong một response luôn đơn giản và an toàn hơn.",
    scenario: "API có hàng nghìn observations, client chỉ cần 20 hàng mỗi lần.",
    apply: "Giới hạn page_size, sắp xếp ổn định và trả thông tin trang tiếp.",
    output: "Mỗi response có số hàng bị giới hạn và có thể tiếp tục từ vị trí xác định.",
    wrongOutput: "OFFSET không cần ORDER BY vì database luôn trả cùng thứ tự.",
    verify: "Thử limit nhỏ/lớn, trang cuối và dữ liệu rỗng.",
    debug: "Đặt giới hạn trên để tránh truy vấn quá lớn và timeout.",
    limit: "Phân trang không bảo đảm snapshot nhất quán nếu dữ liệu đổi giữa các request.",
    test: "Không response nào vượt page_size tối đa đã công bố.",
    demo1: "rows = list(range(1, 51))\npage, size = 2, 10\nprint(rows[(page - 1) * size:page * size])",
    demo2: "def safe_limit(value):\n    return min(max(value, 1), 100)\n\nprint(safe_limit(500))",
    practice: "Lấy trang thứ hai gồm tối đa 5 phần tử từ danh sách mẫu.",
    solution: "rows = list(range(1, 16))\npage, size = 2, 5\nstart = (page - 1) * size\nprint(rows[start:start + size])",
    source: "fastapi",
  });
