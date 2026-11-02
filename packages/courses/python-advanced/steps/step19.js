// Step 19 — Đọc kế hoạch truy vấn và chỉ mục
import { createStep } from "../createStep.js";

export default createStep(18, {
    fact: "Index có thể giảm công tìm kiếm nhưng tốn dung lượng và làm thao tác ghi phức tạp hơn.",
    trap: "Tạo index trên mọi cột luôn khiến mọi truy vấn nhanh hơn.",
    scenario: "Endpoint thường lọc observation theo study_id và thời gian.",
    apply: "Đo truy vấn, xem EXPLAIN QUERY PLAN rồi chỉ tạo index phù hợp.",
    output: "Kế hoạch cho biết SQLite chọn quét bảng hay dùng index.",
    wrongOutput: "Có index nghĩa là truy vấn chắc chắn nhanh với dữ liệu thật.",
    verify: "So sánh kế hoạch và thời gian trên cùng bộ dữ liệu thử.",
    debug: "Kiểm tra thứ tự cột trong index tổng hợp và điều kiện WHERE thực tế.",
    limit: "EXPLAIN không thay phép đo với kích thước và phân phối dữ liệu đại diện.",
    test: "Chạy cùng câu hỏi trước/sau index trên bộ dữ liệu lớn hơn mẫu nhỏ.",
    demo1: "query = 'SELECT * FROM observations WHERE study_id = ? ORDER BY created_at'\nprint(query)",
    demo2: "index_columns = ('study_id', 'created_at')\nprint('CREATE INDEX idx_obs_study_time ON observations(study_id, created_at)')",
    practice: "Nêu index tổng hợp cho truy vấn lọc theo study_id rồi sắp xếp theo created_at.",
    solution: "columns = ('study_id', 'created_at')\nindex_sql = 'CREATE INDEX idx_obs_study_time ON observations(' + ', '.join(columns) + ')'\nprint(index_sql)",
    source: "sql",
  });
