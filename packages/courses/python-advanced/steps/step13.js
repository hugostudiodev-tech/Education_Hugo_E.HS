// Step 13 — CRUD an toàn bằng truy vấn tham số
import { createStep } from "../createStep.js";

export default createStep(12, {
    fact: "DB-API dùng dấu ? làm placeholder cho SQLite; truyền giá trị riêng giúp tránh SQL injection.",
    trap: "Nối chuỗi đầu vào vào câu SQL là ổn nếu hiện tại người dùng chỉ nhập mã số.",
    scenario: "Tìm bản ghi theo mã do người dùng nhập.",
    apply: "Viết WHERE code = ? rồi truyền mã trong tuple tham số.",
    output: "DB so khớp giá trị như dữ liệu, không diễn giải nó thành cú pháp SQL.",
    wrongOutput: "Prepared query tự kiểm tra mọi quy tắc nghiệp vụ của cột.",
    verify: "Thử mã chứa dấu nháy và xác nhận nó không thể đổi cấu trúc truy vấn.",
    debug: "Đảm bảo số placeholder bằng số tham số và truyền tuple kể cả với một giá trị.",
    limit: "Tham số hoá giá trị; tên cột/order-by cần allowlist riêng.",
    test: "Lưu chuỗi có dấu nháy như một giá trị bình thường rồi truy vấn lại.",
    demo1: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (code TEXT)')\ndb.execute('INSERT INTO obs VALUES (?)', (\"S'01\",))\nprint(db.execute('SELECT code FROM obs').fetchone()[0])",
    demo2: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (focus INTEGER)')\ndb.execute('INSERT INTO obs VALUES (?)', (8,))\nprint(db.execute('SELECT focus FROM obs WHERE focus > ?', (5,)).fetchall())",
    practice: "Lưu một mã giả lập với dấu nháy bằng placeholder rồi đọc lại.",
    solution: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (code TEXT)')\ncode = \"S'02\"\ndb.execute('INSERT INTO obs VALUES (?)', (code,))\nprint(db.execute('SELECT code FROM obs WHERE code = ?', (code,)).fetchone())",
    source: "sqlite",
  });
