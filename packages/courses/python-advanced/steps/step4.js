// Step 4 — Type hints và dataclass cho bản ghi nghiên cứu
import { createStep } from "../createStep.js";

export default createStep(3, {
    fact: "Type hint mô tả kiểu mong đợi; dataclass tự tạo các phương thức dữ liệu phổ biến.",
    trap: "Python tự từ chối mọi giá trị sai kiểu chỉ vì tham số có type hint.",
    scenario: "Một bản ghi có mã người tham gia ẩn danh và điểm tập trung.",
    apply: "Mô tả trường dữ liệu bằng type hint rồi tạo một dataclass nhỏ.",
    output: "Đối tượng giữ các trường đã truyền; type hint chủ yếu giúp đọc và phân tích mã.",
    wrongOutput: "Python tự xác minh mọi type hint lúc chạy.",
    verify: "Tạo đối tượng, đọc trường và chạy bộ kiểm tra kiểu nếu dự án có cấu hình.",
    debug: "So sánh giá trị thực với type hint; thêm kiểm tra runtime ở biên dữ liệu.",
    limit: "Type hint không thay thế xác thực dữ liệu CSV/API.",
    test: "Tạo hai bản ghi và xác nhận mã cùng điểm được giữ nguyên.",
    demo1: "from dataclasses import dataclass\n\n@dataclass\nclass Record:\n    code: str\n    focus: int\n\nprint(Record('S014', 7))",
    demo2: "def normalize_score(value: int) -> float:\n    return value / 10\n\nprint(normalize_score(76))",
    practice: "Tạo dataclass Study có mã nghiên cứu và số quan sát.",
    solution: "from dataclasses import dataclass\n\n@dataclass\nclass Study:\n    code: str\n    observations: int\n\nstudy = Study('sleep-focus', 24)\nprint(study.code, study.observations)",
    source: "dataclasses",
  });
