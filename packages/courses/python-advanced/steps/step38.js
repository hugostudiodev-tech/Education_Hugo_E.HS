// Step 38 — Cấu hình chạy và lưu trữ bền vững
import { createStep } from "../createStep.js";

export default createStep(37, {
    fact: "Cấu hình triển khai cần URL/secret từ môi trường; SQLite cần nơi lưu bền và backup phù hợp nền tảng.",
    trap: "Tệp SQLite trên filesystem tạm của hosting sẽ luôn tồn tại sau khi redeploy.",
    scenario: "LabLog chạy trên máy cá nhân và có thể được chuyển sang môi trường thử.",
    apply: "Tách config, xác nhận volume/persistence, quyền tệp và quy trình backup/restore.",
    output: "Môi trường khởi động rõ cấu hình và biết dữ liệu DB được lưu ở đâu.",
    wrongOutput: "Biến môi trường tự tạo volume bền vững cho database.",
    verify: "Khởi động lại service rồi truy vấn lại một dòng thử; test restore bản backup.",
    debug: "Kiểm tra đường dẫn tuyệt đối, quyền ghi và trạng thái filesystem của nền tảng.",
    limit: "Hướng dẫn deploy chung không thay thế việc đọc chính sách lưu trữ của nhà cung cấp.",
    test: "Backup, tạo DB mới, restore và so số hàng cùng checksum.",
    demo1: "config = {'mode': 'local', 'database': 'data/lablog.db'}\nprint(config)",
    demo2: "from pathlib import Path\ndata_dir = Path('data')\ndata_dir.mkdir(exist_ok=True)\nprint(data_dir.is_dir())",
    practice: "Tạo đường dẫn database trong thư mục data và kiểm tra thư mục tồn tại.",
    solution: "from pathlib import Path\ndata_dir = Path('data')\ndata_dir.mkdir(exist_ok=True)\ndb_path = data_dir / 'lablog.db'\nprint(db_path)",
    source: "pathlib",
  });
