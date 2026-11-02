// Step 37 — Bảo vệ dữ liệu và API
import { createStep } from "../createStep.js";

export default createStep(36, {
    fact: "Allowlist trường được phép, placeholder SQL, giới hạn request và không log bí mật là lớp bảo vệ cơ bản.",
    trap: "Dữ liệu chỉ dùng trong lớp học nên không cần kiểm tra hay giới hạn đầu vào.",
    scenario: "Client gửi order_by tuỳ chọn tới endpoint observations.",
    apply: "Chọn cột sắp xếp từ allowlist và từ chối mọi giá trị khác.",
    output: "Đầu vào không thể biến tên cột thành đoạn SQL tuỳ ý.",
    wrongOutput: "CORS thay thế xác thực, phân quyền và kiểm tra dữ liệu.",
    verify: "Thử payload lạ, chuỗi dài và trường không được phép.",
    debug: "Thu nhỏ quyền, giới hạn kích thước và kiểm tra log có chứa bí mật không.",
    limit: "Một prototype học tập chưa được đánh giá bảo mật không nên chứa dữ liệu nhạy cảm thật.",
    test: "Thử order_by hợp lệ và chuỗi SQL lạ; chỉ allowlist được chấp nhận.",
    demo1: "allowed = {'created_at', 'focus_score'}\nrequested = 'focus_score'\nprint(requested in allowed)",
    demo2: "page_size = 100\nsafe_size = min(max(page_size, 1), 50)\nprint(safe_size)",
    practice: "Chấp nhận sort field trong allowlist và từ chối tên không xác định.",
    solution: "allowed = {'created_at', 'focus_score'}\ndef safe_sort(field):\n    if field not in allowed:\n        raise ValueError('unsupported sort field')\n    return field\nprint(safe_sort('focus_score'))",
    source: "fastapi",
  });
