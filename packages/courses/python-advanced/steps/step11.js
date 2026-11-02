// Step 11 — Kết nối Python với SQLite
import { createStep } from "../createStep.js";

export default createStep(10, {
    fact: "sqlite3.connect mở hoặc tạo một tệp SQLite; connection là điểm bắt đầu để thực hiện SQL.",
    trap: "Đóng connection trước khi commit đảm bảo mọi thay đổi luôn được lưu.",
    scenario: "LabLog cần lưu hồ sơ nghiên cứu vào lablog.db trên máy cá nhân.",
    apply: "Dùng context manager, thực hiện truy vấn, commit thay đổi và đóng kết nối.",
    output: "Cơ sở dữ liệu tệp có thể được mở lại sau khi chương trình chạy xong.",
    wrongOutput: "Một connection SQLite tự đồng bộ với máy chủ từ xa.",
    verify: "Mở lại tệp DB rồi truy vấn số hàng đã thêm.",
    debug: "Kiểm tra đường dẫn DB, quyền ghi và thông báo exception gốc.",
    limit: "SQLite phù hợp dự án nhỏ/local; không tự trở thành DB phân tán nhiều máy.",
    test: "Tạo tệp tạm, thêm một bản ghi, đóng rồi truy vấn lại.",
    demo1: "import sqlite3\nconnection = sqlite3.connect(':memory:')\nprint(connection.execute('SELECT 2 + 3').fetchone())\nconnection.close()",
    demo2: "import sqlite3\nwith sqlite3.connect(':memory:') as db:\n    print(db.execute('SELECT sqlite_version()').fetchone()[0])",
    practice: "Mở DB trong bộ nhớ và tính số lượng quan sát mẫu.",
    solution: "import sqlite3\nwith sqlite3.connect(':memory:') as db:\n    count = db.execute('SELECT 4').fetchone()[0]\n    print('observations:', count)",
    source: "sqlite",
  });
