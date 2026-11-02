// Step 7 — Từ điển dữ liệu và nguồn gốc
import { createStep } from "../createStep.js";

export default createStep(6, {
    fact: "Data dictionary định nghĩa cột, kiểu, đơn vị và miền hợp lệ; provenance ghi dữ liệu đến từ đâu.",
    trap: "Tên cột tự giải thích đủ đơn vị, nguồn và quy tắc cho mọi người đọc.",
    scenario: "Một cột sleep_hours dùng giờ và chỉ chấp nhận từ 0 đến 24.",
    apply: "Ghi định nghĩa, kiểu, đơn vị, miền và nguồn giả lập trong README.",
    output: "Mỗi cột có ý nghĩa và quy tắc đọc được ngoài mã nguồn.",
    wrongOutput: "Tệp CSV tự cho biết nó có bao nhiêu dòng và nguồn nào tạo ra.",
    verify: "Đối chiếu tên cột, từ điển dữ liệu và mẫu CSV.",
    debug: "Nếu hai người hiểu đơn vị khác nhau, bổ sung đơn vị và ví dụ vào data dictionary.",
    limit: "Metadata mô tả quy trình nhưng không đảm bảo dữ liệu gốc chính xác.",
    test: "Người mới có thể xác định kiểu và miền của từng cột chỉ từ tài liệu.",
    demo1: "dictionary = {'sleep_hours': {'type': 'float', 'unit': 'hour', 'min': 0, 'max': 24}}\nprint(dictionary['sleep_hours'])",
    demo2: "provenance = {'source': 'synthetic', 'created_for': 'course practice'}\nprint(provenance['source'])",
    practice: "Tạo từ điển dữ liệu cho focus_score từ 0 đến 10.",
    solution: "column = {'name': 'focus_score', 'type': 'int', 'unit': 'point', 'min': 0, 'max': 10}\nprint(column)",
    source: "python",
  });
