// Step 34 — Xuất báo cáo CSV/Markdown tái lập
import { createStep } from "../createStep.js";

export default createStep(33, {
    fact: "Báo cáo tái lập ghi dữ liệu đầu vào, phiên bản/schema, lệnh chạy và cách tạo bảng/biểu đồ.",
    trap: "Lưu riêng ảnh biểu đồ là đủ để người khác tái tạo toàn bộ kết quả.",
    scenario: "Cần tạo report.csv từ DB và biết dùng phiên bản dữ liệu nào.",
    apply: "Xuất kết quả có header, ghi lệnh chạy và lưu metadata cùng báo cáo.",
    output: "Người khác có thể chạy lại pipeline trên cùng đầu vào và so kết quả.",
    wrongOutput: "Số liệu trong báo cáo không cần trỏ về truy vấn hoặc nguồn.",
    verify: "Xoá file kết quả, chạy lại từ dữ liệu mẫu và so checksum/nội dung.",
    debug: "Ghi phiên bản mã, timestamp, số hàng và lỗi vào metadata không nhạy cảm.",
    limit: "Tái lập phép tính không làm thiết kế nghiên cứu trở nên hợp lệ hơn.",
    test: "Chạy hai lần trên cùng đầu vào và xác nhận bảng xuất không đổi.",
    demo1: "report = {'n': 24, 'mean_focus': 7.2, 'source': 'synthetic'}\nprint(report)",
    demo2: "import csv\nfrom io import StringIO\nout = StringIO()\nwriter = csv.DictWriter(out, fieldnames=['n', 'mean'])\nwriter.writeheader()\nwriter.writerow({'n': 24, 'mean': 7.2})\nprint(out.getvalue().strip())",
    practice: "Tạo CSV một dòng gồm n và mean từ kết quả giả lập.",
    solution: "import csv\nfrom io import StringIO\nout = StringIO()\nwriter = csv.DictWriter(out, fieldnames=['n', 'mean'])\nwriter.writeheader()\nwriter.writerow({'n': 24, 'mean': 7.2})\nprint(out.getvalue())",
    source: "csv",
  });
