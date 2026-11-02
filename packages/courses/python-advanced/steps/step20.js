// Step 20 — Kiểm thử tính toàn vẹn của cơ sở dữ liệu
import { createStep } from "../createStep.js";

export default createStep(19, {
    fact: "Integrity check và ca test ràng buộc xác nhận DB giữ các quy tắc cấu trúc đã khai báo.",
    trap: "PRAGMA integrity_check xác nhận dữ liệu không có sai lệch khoa học.",
    scenario: "Sau khi nhập CSV, cần kiểm tra khoá ngoại và miền điểm.",
    apply: "Chạy integrity_check, bật foreign_keys và thử dữ liệu biên trong test.",
    output: "Kiểm tra cấu trúc báo trạng thái; test nghiệp vụ kiểm tra miền riêng.",
    wrongOutput: "Một thông báo 'ok' chứng minh mọi dữ liệu phù hợp câu hỏi nghiên cứu.",
    verify: "Thử khoá ngoại không tồn tại và giá trị ngoài miền trong DB tạm.",
    debug: "Bật PRAGMA foreign_keys trên mỗi connection SQLite.",
    limit: "Kiểm tra toàn vẹn không đánh giá độ chính xác của phép đo.",
    test: "DB tạm phải từ chối mã study không tồn tại và score ngoài miền.",
    demo1: "import sqlite3\ndb = sqlite3.connect(':memory:')\nprint(db.execute('PRAGMA integrity_check').fetchone()[0])",
    demo2: "checks = {'focus_min': 0, 'focus_max': 10}\nprint(checks['focus_min'] <= 8 <= checks['focus_max'])",
    practice: "Kiểm tra ba điểm 0, 8 và 11 theo miền từ 0 đến 10.",
    solution: "valid = lambda score: 0 <= score <= 10\nprint([valid(score) for score in (0, 8, 11)])",
    source: "sqlite",
  });
