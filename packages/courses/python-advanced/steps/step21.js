// Step 21 — Cấu hình theo môi trường và đường dẫn
import { createStep } from "../createStep.js";

export default createStep(20, {
    fact: "Biến cấu hình theo môi trường tách đường dẫn và tuỳ chọn khỏi mã; bí mật không nên commit.",
    trap: "Giá trị mặc định trong mã có thể chứa mật khẩu dùng chung cho production.",
    scenario: "Máy cá nhân dùng lablog.db, môi trường kiểm thử dùng tệp DB tạm.",
    apply: "Đọc biến môi trường và kiểm tra thiếu/sai trước khi khởi động.",
    output: "Cùng mã chạy được với cấu hình khác nhau mà không sửa source.",
    wrongOutput: "Biến môi trường tự được lưu bí mật và an toàn trong mọi nền tảng.",
    verify: "Chạy với hai giá trị cấu hình và xác nhận đúng DB được mở.",
    debug: "In tên cấu hình không nhạy cảm; không ghi giá trị bí mật vào log.",
    limit: "Cấu hình không thay thế kiểm soát quyền truy cập của môi trường deploy.",
    test: "Kiểm tra cấu hình thiếu, cấu hình hợp lệ và đường dẫn tương đối.",
    demo1: "import os\nmode = os.getenv('LABLOG_MODE', 'local')\nprint(mode)",
    demo2: "from pathlib import Path\ndb_path = Path('data') / 'lablog.db'\nprint(db_path.as_posix())",
    practice: "Đọc tên tệp DB từ biến LABLOG_DB, mặc định là data/lablog.db.",
    solution: "import os\nfrom pathlib import Path\nraw_path = os.getenv('LABLOG_DB', 'data/lablog.db')\nprint(Path(raw_path))",
    source: "env",
  });
