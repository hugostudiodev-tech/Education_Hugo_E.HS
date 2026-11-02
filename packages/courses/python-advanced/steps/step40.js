// Step 40 — Capstone: đóng gói và bảo vệ LabLog
import { createStep } from "../createStep.js";

export default createStep(39, {
    fact: "Capstone đạt yêu cầu khi người khác có thể cài, chạy, kiểm tra và hiểu giới hạn kết quả.",
    trap: "Một demo chạy trên máy tác giả là bằng chứng đủ cho sản phẩm hoàn thiện.",
    scenario: "Bạn cùng lớp clone project và cần làm lại kết quả từ bộ dữ liệu giả lập.",
    apply: "Bàn giao source, schema, test, hướng dẫn chạy, API, báo cáo và giới hạn.",
    output: "Sản phẩm có đường chạy rõ từ CSV đầu vào tới kết quả báo cáo.",
    wrongOutput: "Tăng số lượng công nghệ làm dự án học thuật hơn dù không cần.",
    verify: "Người khác làm theo README trên môi trường sạch và ghi nhận lỗi.",
    debug: "Dùng checklist nghiệm thu; sửa lỗi tái lập được trước khi thêm tính năng.",
    limit: "Hoàn thành capstone không đồng nghĩa nghiên cứu đã được thẩm định hay công bố.",
    test: "Clone sạch, tạo venv, cài dependency, chạy test, nhập dữ liệu mẫu và gọi API.",
    demo1: "deliverables = ['CSV', 'SQLite schema', 'API', 'tests', 'research report']\nprint(len(deliverables))",
    demo2: "acceptance = {'reproducible': True, 'synthetic_data': True, 'limitations_written': True}\nprint(all(acceptance.values()))",
    practice: "In checklist nghiệm thu gồm DB, API, test, báo cáo và giới hạn.",
    solution: "checklist = ['database', 'API', 'tests', 'report', 'limitations']\nfor item in checklist:\n    print('[x]', item)",
    source: "python",
  });
