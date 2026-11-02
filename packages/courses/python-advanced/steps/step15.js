// Step 15 — Thay đổi schema và sao lưu
import { createStep } from "../createStep.js";

export default createStep(14, {
    fact: "Migration là thay đổi schema có phiên bản và thứ tự; sao lưu phải có quy trình khôi phục đã thử.",
    trap: "Sửa trực tiếp schema trên một máy là đủ để mọi bản cài khác tự cập nhật.",
    scenario: "LabLog cần thêm cột source_note nhưng DB cũ vẫn đang có dữ liệu.",
    apply: "Ghi migration có phiên bản, kiểm tra trạng thái hiện tại và thử trên bản sao dữ liệu.",
    output: "Có thể xác định schema version và biết migration nào đã chạy.",
    wrongOutput: "Migration luôn an toàn để chạy lặp lại dù không kiểm tra trạng thái.",
    verify: "Khôi phục bản sao sang thư mục tạm và chạy smoke test.",
    debug: "Giữ bản sao DB trước migration và đọc phiên bản schema trước khi áp dụng.",
    limit: "Một file backup chưa được thử restore chưa chứng minh có thể khôi phục.",
    test: "Tạo DB version cũ, migrate, rồi xác nhận dữ liệu cũ còn nguyên.",
    demo1: "schema_version = 1\nprint('current schema:', schema_version)",
    demo2: "migration = {'from': 1, 'to': 2, 'change': 'add source_note'}\nprint(migration['from'], '->', migration['to'])",
    practice: "Viết kiểm tra đơn giản chỉ áp migration 2 khi version hiện là 1.",
    solution: "version = 1\nif version == 1:\n    version = 2\nprint('schema version:', version)",
    source: "sqlite",
  });
