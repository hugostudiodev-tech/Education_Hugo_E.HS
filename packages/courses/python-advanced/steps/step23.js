// Step 23 — Logging để lần theo một lần chạy
import { createStep } from "../createStep.js";

export default createStep(22, {
    fact: "Logging phân biệt mức độ và ngữ cảnh; log hữu ích để chẩn đoán nhưng không nên chứa dữ liệu nhạy cảm.",
    trap: "Dùng print mọi giá trị đầu vào là cách quan sát an toàn trong ứng dụng nghiên cứu.",
    scenario: "Cần biết lần nhập CSV thất bại ở bước nào mà không ghi tên người tham gia.",
    apply: "Ghi event, số hàng và mã lỗi; không ghi payload nhận diện.",
    output: "Log có mức INFO/WARNING/ERROR và ngữ cảnh truy vết.",
    wrongOutput: "Logger tự xoá dữ liệu riêng tư khỏi mọi thông điệp.",
    verify: "Kiểm tra log mẫu chỉ có mã lô và số hàng, không có tên/email.",
    debug: "Đặt logger theo module và bật mức DEBUG có kiểm soát khi phát triển.",
    limit: "Log không thay thế audit trail có kiểm soát truy cập.",
    test: "Gửi một dòng lỗi và xác nhận log có mã lô nhưng không có trường nhạy cảm.",
    demo1: "import logging\nlogging.basicConfig(level=logging.INFO)\nlogging.info('import_started batch=%s', 'B07')",
    demo2: "import logging\nlogger = logging.getLogger('lablog.import')\nlogger.warning('invalid_rows=%d', 2)",
    practice: "Ghi một thông báo lỗi có mã lô và số dòng, không chứa nguyên hàng CSV.",
    solution: "import logging\nlogger = logging.getLogger('lablog')\nbatch_id, row_number = 'B07', 12\nlogger.error('invalid_row batch=%s row=%d', batch_id, row_number)\nprint('safe context recorded')",
    source: "logging",
  });
