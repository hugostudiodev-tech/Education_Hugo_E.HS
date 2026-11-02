// Step 14 — Giao dịch: commit và rollback
import { createStep } from "../createStep.js";

export default createStep(13, {
    fact: "Transaction gom các thao tác thành một đơn vị; commit xác nhận và rollback huỷ thay đổi chưa hoàn tất.",
    trap: "Nếu lệnh thứ hai thất bại, lệnh thứ nhất tự động được hoàn tác trong mọi tình huống.",
    scenario: "Nhập nhiều quan sát; nếu một hàng lỗi thì không muốn lưu nửa lô.",
    apply: "Bắt đầu transaction, ghi cả lô, commit khi tất cả hợp lệ và rollback khi lỗi.",
    output: "Hoặc toàn bộ nhóm thay đổi được lưu, hoặc trạng thái quay về trước transaction.",
    wrongOutput: "Commit là lệnh xoá mọi hàng vừa thêm.",
    verify: "Cố ý gây lỗi giữa lô rồi đếm hàng sau rollback.",
    debug: "Kiểm tra ranh giới transaction và không nuốt exception trước khi rollback.",
    limit: "Transaction không thay thế sao lưu và không sửa lỗi logic của dữ liệu.",
    test: "Thử thành công cả lô và thử thất bại ở giữa lô.",
    demo1: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (n INTEGER)')\nwith db:\n    db.execute('INSERT INTO obs VALUES (1)')\nprint(db.execute('SELECT COUNT(*) FROM obs').fetchone()[0])",
    demo2: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (n INTEGER UNIQUE)')\ntry:\n    with db:\n        db.execute('INSERT INTO obs VALUES (1)')\n        db.execute('INSERT INTO obs VALUES (1)')\nexcept sqlite3.IntegrityError:\n    pass\nprint(db.execute('SELECT COUNT(*) FROM obs').fetchone()[0])",
    practice: "Thử chèn hai giá trị trùng trong một transaction và kiểm tra số hàng.",
    solution: "import sqlite3\ndb = sqlite3.connect(':memory:')\ndb.execute('CREATE TABLE obs (n INTEGER UNIQUE)')\ntry:\n    with db:\n        db.execute('INSERT INTO obs VALUES (1)')\n        db.execute('INSERT INTO obs VALUES (1)')\nexcept sqlite3.IntegrityError:\n    print('rolled back')\nprint(db.execute('SELECT COUNT(*) FROM obs').fetchone()[0])",
    source: "sqlite",
  });
