// Step 12 — Thiết kế bảng, khoá và ràng buộc
import { createStep } from "../createStep.js";

export default createStep(11, {
    fact: "PRIMARY KEY định danh hàng; UNIQUE, NOT NULL và CHECK bảo vệ các quy tắc ngay trong DB.",
    trap: "Chỉ cần kiểm tra dữ liệu ở giao diện là cơ sở dữ liệu không thể nhận dữ liệu sai.",
    scenario: "Mã quan sát phải duy nhất, điểm tập trung từ 0 đến 10.",
    apply: "Đặt khoá và CHECK constraint để DB từ chối bản ghi sai kể cả từ chương trình khác.",
    output: "INSERT hợp lệ được lưu; dữ liệu vi phạm constraint bị từ chối.",
    wrongOutput: "CHECK tự sửa giá trị sai thành giá trị gần nhất.",
    verify: "Thử chèn dữ liệu trùng và điểm 11 để xác nhận constraint hoạt động.",
    debug: "Đọc IntegrityError và đối chiếu tên constraint với bản ghi gây lỗi.",
    limit: "Constraint kiểm tra quy tắc kỹ thuật, không chứng minh giả thuyết nghiên cứu.",
    test: "Kiểm tra khoá trùng, giá trị thiếu và điểm ngoài miền.",
    demo1: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (code TEXT PRIMARY KEY, focus INTEGER CHECK(focus BETWEEN 0 AND 10))')\nprint(db.execute(\"SELECT name FROM sqlite_master WHERE type='table'\").fetchone())",
    demo2: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (code TEXT UNIQUE, focus INTEGER NOT NULL)')\ndb.execute(\"INSERT INTO obs VALUES ('S01', 8)\")\nprint(db.execute('SELECT COUNT(*) FROM obs').fetchone()[0])",
    practice: "Tạo bảng demo có cột code không rỗng và cột score trong miền 0–100.",
    solution: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE demo (code TEXT PRIMARY KEY, score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100))')\nprint('schema created')",
    source: "sqlite",
  });
