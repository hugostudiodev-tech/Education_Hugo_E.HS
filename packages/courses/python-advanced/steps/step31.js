// Step 31 — Thống kê mô tả bằng statistics
import { createStep } from "../createStep.js";

export default createStep(30, {
    fact: "Mean, median và standard deviation mô tả các khía cạnh khác nhau của một mẫu dữ liệu.",
    trap: "Mean luôn là giá trị đại diện tốt nhất dù dữ liệu có ngoại lệ lớn.",
    scenario: "Tóm tắt điểm tập trung mô phỏng và so sánh mean với median.",
    apply: "Chọn thống kê phù hợp, báo số quan sát và đơn vị cùng kết quả.",
    output: "statistics.mean/median/pstdev trả tóm tắt; mẫu nhỏ cần diễn giải thận trọng.",
    wrongOutput: "Standard deviation cho biết sai số đo của từng cá nhân.",
    verify: "Thử thêm một ngoại lệ lớn rồi so mean, median và độ phân tán.",
    debug: "Kiểm tra danh sách rỗng, kiểu dữ liệu và dùng đúng stdev hay pstdev.",
    limit: "Thống kê mô tả không tự chứng minh quan hệ nhân quả hay ý nghĩa thống kê.",
    test: "Với [2, 4, 6], mean và median đều bằng 4.",
    demo1: "from statistics import mean, median\nscores = [6, 8, 10]\nprint(mean(scores), median(scores))",
    demo2: "from statistics import pstdev\nprint(round(pstdev([2, 4, 6]), 2))",
    practice: "Tính mean, median và số phần tử của điểm [5, 7, 8, 10].",
    solution: "from statistics import mean, median\nscores = [5, 7, 8, 10]\nprint(mean(scores), median(scores), len(scores))",
    source: "statistics",
  });
