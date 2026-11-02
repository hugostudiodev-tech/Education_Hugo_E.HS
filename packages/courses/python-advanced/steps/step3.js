// Step 3 — Tách module và tổ chức package
import { createStep } from "../createStep.js";

export default createStep(2, {
    fact: "Module gom mã liên quan vào tệp; package gom module và tạo ranh giới có chủ đích.",
    trap: "Đặt mọi hàm vào một tệp khổng lồ giúp dự án dễ kiểm thử và bảo trì hơn.",
    scenario: "Tách hàm kiểm tra CSV khỏi API để có thể kiểm tra độc lập.",
    apply: "Đặt validate.py trong package lablog và import hàm theo tên package.",
    output: "Tên module được import và hàm gọi trả kết quả như định nghĩa.",
    wrongOutput: "Import tự chạy mọi chức năng của chương trình như một ứng dụng hoàn chỉnh.",
    verify: "Chạy python -m unittest từ thư mục gốc để kiểm tra đường import.",
    debug: "Kiểm tra tên package, thư mục làm việc và tránh đặt tên tệp trùng thư viện chuẩn.",
    limit: "Chia tệp không làm thuật toán đúng hơn nếu ranh giới module không rõ.",
    test: "Import một hàm từ module kiểm tra mà không khởi động máy chủ.",
    demo1: "def mean(values):\n    return sum(values) / len(values)\n\nprint(mean([6, 8]))",
    demo2: "def is_valid_score(value):\n    return 0 <= value <= 100\n\nprint(is_valid_score(82))",
    practice: "Tạo hàm kiểm tra mã quan sát bắt đầu bằng chữ S.",
    solution: "def valid_id(value):\n    return value.startswith('S')\n\nprint(valid_id('S014'))",
    source: "python",
  });
