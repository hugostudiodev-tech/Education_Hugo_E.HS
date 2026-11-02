// Step 6 — Câu hỏi nghiên cứu và biến có thể đo
import { createStep } from "../createStep.js";

export default createStep(5, {
    fact: "Câu hỏi nghiên cứu tốt xác định đối tượng, biến đo và phạm vi có thể trả lời bằng dữ liệu.",
    trap: "Một câu hỏi rộng như 'điều gì làm học sinh giỏi hơn' tự nó đã là giả thuyết đo được.",
    scenario: "Bộ dữ liệu mô phỏng có giờ ngủ và điểm tập trung 0–10.",
    apply: "Đặt câu hỏi về mối liên hệ giữa hai biến, không khẳng định ngủ gây ra điểm cao.",
    output: "Hai biến được nêu đúng tên cùng đơn vị/phạm vi đo.",
    wrongOutput: "Một kết luận nhân quả dù chưa có thiết kế thí nghiệm.",
    verify: "Tìm trong câu hỏi: biến giải thích, biến kết quả, đối tượng và giới hạn.",
    debug: "Đổi từ 'ảnh hưởng' sang 'có liên hệ không' nếu dữ liệu chỉ quan sát.",
    limit: "Dữ liệu giả lập dùng để luyện phân tích, không đại diện học sinh thật.",
    test: "Một bạn khác có thể chỉ ra hai cột dữ liệu cần dùng để trả lời câu hỏi.",
    demo1: "question = 'Giờ ngủ có đi cùng điểm tập trung không?'\nvariables = ['sleep_hours', 'focus_score']\nprint(question, variables)",
    demo2: "record = {'sleep_hours': 7.5, 'focus_score': 8}\nprint(record['sleep_hours'], record['focus_score'])",
    practice: "In câu hỏi nghiên cứu và hai biến đo cho bộ dữ liệu mô phỏng.",
    solution: "question = 'Giờ ngủ có liên hệ với điểm tập trung không?'\nvariables = ('sleep_hours', 'focus_score')\nprint(question)\nprint(variables)",
    source: "python",
  });
