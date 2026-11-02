// Step 17 — GROUP BY và tổng hợp có ý nghĩa
import { createStep } from "../createStep.js";

export default createStep(16, {
    fact: "GROUP BY tạo nhóm; COUNT, AVG và SUM tóm tắt từng nhóm theo câu hỏi cụ thể.",
    trap: "AVG bỏ qua mọi vấn đề về đơn vị, dữ liệu thiếu và cách lấy mẫu.",
    scenario: "Tính số quan sát và điểm tập trung trung bình theo study_id.",
    apply: "Chọn đúng biến nhóm, phép tổng hợp và lọc sau nhóm bằng HAVING.",
    output: "Mỗi nhóm có một hàng tóm tắt cùng giá trị tổng hợp.",
    wrongOutput: "Một trung bình tổng thể trả lời được khác biệt giữa mọi nhóm.",
    verify: "Đối chiếu COUNT của các nhóm với số hàng hợp lệ đầu vào.",
    debug: "Kiểm tra NULL, hàng trùng và cột được chọn ngoài GROUP BY.",
    limit: "Trung bình không cho biết phân phối hay bất định của từng nhóm.",
    test: "Dùng nhóm nhỏ tính tay để kiểm tra AVG và COUNT.",
    demo1: "scores = [6, 8, 10]\nprint(sum(scores) / len(scores), len(scores))",
    demo2: "groups = {'A': [8, 9], 'B': [5, 7]}\nprint({key: round(sum(values) / len(values), 1) for key, values in groups.items()})",
    practice: "Tính số quan sát và trung bình cho mỗi nhóm trong dict.",
    solution: "groups = {'A': [8, 9, 7], 'B': [5, 7]}\nsummary = {key: {'n': len(values), 'mean': sum(values) / len(values)} for key, values in groups.items()}\nprint(summary)",
    source: "sql",
  });
