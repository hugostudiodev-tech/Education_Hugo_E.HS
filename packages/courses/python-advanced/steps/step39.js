// Step 39 — Kiểm thử đầu-cuối bằng dữ liệu mới
import { createStep } from "../createStep.js";

export default createStep(38, {
    fact: "Smoke test đầu-cuối chạy luồng nhập → lưu DB → truy vấn → API → báo cáo với dữ liệu thử.",
    trap: "Các unit test đều đạt nghĩa là cấu hình, database và API chắc chắn kết nối đúng.",
    scenario: "Một bộ CSV mới phải đi hết pipeline mà không chạm dữ liệu thật.",
    apply: "Dùng thư mục/DB tạm, chạy mọi bước, kiểm tra số hàng và xoá dữ liệu thử sau test.",
    output: "Bằng chứng toàn luồng dùng được với input mới, không chỉ hàm riêng lẻ.",
    wrongOutput: "Test chỉ dùng một hàng mẫu đủ chứng minh khả năng xử lý mọi lô.",
    verify: "Chạy smoke test hai lần và kiểm tra tính lặp, lỗi, số hàng.",
    debug: "Giữ log mã lô và stage; tìm bước đầu tiên có kết quả khác mong đợi.",
    limit: "Smoke test không thay test tải, bảo mật hoặc đánh giá chất lượng nghiên cứu.",
    test: "CSV thử → DB tạm → endpoint đọc → file report có kết quả.",
    demo1: "pipeline = ['validate_csv', 'insert_sqlite', 'query_summary', 'write_report']\nprint(' -> '.join(pipeline))",
    demo2: "expected = {'input_rows': 3, 'stored_rows': 3, 'reported_rows': 3}\nprint(len(set(expected.values())) == 1)",
    practice: "So sánh số hàng đầu vào, lưu DB và báo cáo; báo lỗi nếu lệch.",
    solution: "counts = {'input': 3, 'stored': 3, 'reported': 3}\nassert len(set(counts.values())) == 1\nprint('end-to-end row counts match')",
    source: "unittest",
  });
