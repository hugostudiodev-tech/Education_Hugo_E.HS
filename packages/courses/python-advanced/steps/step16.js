// Step 16 — JOIN để kết hợp dữ liệu nghiên cứu
import { createStep } from "../createStep.js";

export default createStep(15, {
    fact: "JOIN ghép hàng qua khoá liên kết; loại JOIN quyết định hàng không khớp có còn trong kết quả không.",
    trap: "JOIN mặc định luôn giữ mọi hàng từ cả hai bảng như FULL OUTER JOIN.",
    scenario: "Ghép observation với study bằng study_id.",
    apply: "Nêu rõ khoá nối và chọn INNER/LEFT JOIN theo câu hỏi phân tích.",
    output: "Cột thuộc hai bảng xuất hiện theo quan hệ nối đã khai báo.",
    wrongOutput: "Hai bảng tự nối đúng chỉ vì có cột cùng tên.",
    verify: "Đếm hàng trước/sau JOIN và kiểm tra trường hợp thiếu khoá liên kết.",
    debug: "Dùng alias, điều kiện ON rõ ràng và rà hiện tượng nhân đôi hàng.",
    limit: "JOIN sai cardinality có thể làm tổng và trung bình bị phóng đại.",
    test: "Thêm một hàng không có quan hệ để so sánh INNER JOIN với LEFT JOIN.",
    demo1: "studies = [{'id': 1, 'name': 'sleep-focus'}]\nobs = [{'study_id': 1, 'focus': 8}]\nprint([(s['name'], o['focus']) for s in studies for o in obs if s['id'] == o['study_id']])",
    demo2: "left = {1: 'sleep-focus', 2: 'screen-time'}\nright = [{'study_id': 1, 'n': 24}]\nprint([(name, next((r['n'] for r in right if r['study_id'] == key), None)) for key, name in left.items()])",
    practice: "Ghép hai nghiên cứu giả lập với số quan sát theo study_id.",
    solution: "studies = {1: 'sleep-focus', 2: 'screen-time'}\ncounts = [{'study_id': 1, 'n': 24}, {'study_id': 2, 'n': 12}]\nprint([(studies[row['study_id']], row['n']) for row in counts])",
    source: "sql",
  });
