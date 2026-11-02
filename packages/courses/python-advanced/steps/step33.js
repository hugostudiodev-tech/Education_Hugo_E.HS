// Step 33 — Đối chiếu truy vấn SQL với Python
import { createStep } from "../createStep.js";

export default createStep(32, {
    fact: "Kết quả SQL và Python nên được đối chiếu trên cùng tập lọc, cùng quy tắc thiếu và cùng định nghĩa thống kê.",
    trap: "Hai con số khác nhau chứng minh một trong hai công cụ tính toán sai.",
    scenario: "SQLite AVG và statistics.mean phải dùng cùng 24 điểm hợp lệ.",
    apply: "Ghi rõ lọc, số hàng và quy tắc làm tròn trước khi so sánh.",
    output: "Hai quy trình độc lập cho kết quả tương đương trong dung sai đã định.",
    wrongOutput: "Chỉ so sánh số đã làm tròn tới một chữ số là đủ để đối chiếu pipeline.",
    verify: "So số hàng, giá trị thiếu và precision trước khi so mean.",
    debug: "Tìm khác biệt ở bộ lọc, NULL, chuyển kiểu và làm tròn.",
    limit: "Đồng thuận giữa hai công cụ không chứng minh dữ liệu nguồn không sai.",
    test: "Dùng bộ nhỏ có kết quả tính tay để xác nhận cả SQL lẫn Python.",
    demo1: "from statistics import mean\nvalues = [6, 8, 10]\nprint(mean(values))",
    demo2: "sql_result = 8.0\npython_result = 8\nprint(abs(sql_result - python_result) < 1e-9)",
    practice: "So sánh mean Python với kết quả SQL giả lập và báo đạt nếu lệch dưới 1e-9.",
    solution: "python_mean = sum([6, 8, 10]) / 3\nsql_mean = 8.0\nprint(abs(python_mean - sql_mean) < 1e-9)",
    source: "statistics",
  });
