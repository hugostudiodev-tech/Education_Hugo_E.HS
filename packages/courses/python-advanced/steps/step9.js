// Step 9 — Kiểm tra giá trị thiếu và ngoài miền
import { createStep } from "../createStep.js";

export default createStep(8, {
    fact: "Kiểm tra miền và giá trị thiếu ngay khi nhập giúp phát hiện dữ liệu không hợp lệ trước khi phân tích.",
    trap: "Thay mọi giá trị thiếu bằng 0 luôn trung thực và không làm đổi kết quả.",
    scenario: "focus_score hợp lệ từ 0 đến 10; chuỗi rỗng là dữ liệu thiếu.",
    apply: "Tách bản ghi hợp lệ khỏi lỗi và ghi lý do thay vì âm thầm sửa.",
    output: "Báo được số hàng hợp lệ, số lỗi và nguyên nhân từng hàng.",
    wrongOutput: "Mọi dòng bị ép kiểu thành công đều đã là dữ liệu hợp lệ.",
    verify: "Thử giá trị biên 0, 10, -1, 11 và ô trống.",
    debug: "Giữ nguyên dòng lỗi trong báo cáo kiểm tra để có thể truy nguyên.",
    limit: "Loại hàng lỗi có thể gây sai lệch nếu lỗi tập trung ở một nhóm.",
    test: "Kiểm tra riêng rỗng, chữ, biên hợp lệ và ngoài miền.",
    demo1: "def valid_focus(value):\n    return value is not None and 0 <= value <= 10\n\nprint([valid_focus(x) for x in [0, 10, 11, None]])",
    demo2: "raw = {'focus': '8'}\ntry:\n    score = int(raw['focus'])\n    print(0 <= score <= 10)\nexcept ValueError:\n    print('invalid number')",
    practice: "Đếm có bao nhiêu giá trị focus hợp lệ trong danh sách.",
    solution: "values = [8, None, 11, 0, 5]\nvalid = [x for x in values if x is not None and 0 <= x <= 10]\nprint(len(valid), valid)",
    source: "csv",
  });
