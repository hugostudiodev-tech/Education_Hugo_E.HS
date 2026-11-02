// Step 18 — CTE và window function
import { createStep } from "../createStep.js";

export default createStep(17, {
    fact: "CTE đặt tên cho truy vấn con; window function tính theo khung hàng mà không gộp mất từng hàng.",
    trap: "Window function luôn thay GROUP BY và làm kết quả chỉ còn một hàng mỗi nhóm.",
    scenario: "Xếp hạng quan sát trong từng nghiên cứu nhưng vẫn giữ từng mã quan sát.",
    apply: "Dùng PARTITION BY để chia nhóm và ORDER BY để xác định thứ tự.",
    output: "Mỗi hàng gốc vẫn còn, kèm giá trị thứ hạng hoặc tổng luỹ kế.",
    wrongOutput: "Thứ hạng có ý nghĩa nếu không định nghĩa cột sắp xếp.",
    verify: "Kiểm tra số hàng trước và sau khi thêm window function.",
    debug: "Kiểm tra PARTITION BY, ORDER BY và xử lý trường hợp đồng hạng.",
    limit: "Thứ hạng chỉ mô tả vị trí trong dữ liệu đã chọn, không phải mức ý nghĩa thống kê.",
    test: "Dùng ba hàng nhỏ, tính thứ hạng bằng tay rồi đối chiếu.",
    demo1: "values = [8, 5, 9]\nranked = sorted(enumerate(values, 1), key=lambda row: row[1], reverse=True)\nprint(ranked)",
    demo2: "rows = [{'group': 'A', 'score': 8}, {'group': 'A', 'score': 6}, {'group': 'B', 'score': 9}]\nprint([(r['group'], r['score']) for r in rows])",
    practice: "Tạo bảng xếp hạng điểm trong từng nhóm mà không xoá các hàng.",
    solution: "rows = [{'group': 'A', 'score': 8}, {'group': 'A', 'score': 6}, {'group': 'B', 'score': 9}]\nfor row in rows:\n    peers = [r['score'] for r in rows if r['group'] == row['group']]\n    print(row['group'], row['score'], 1 + sum(score > row['score'] for score in peers))",
    source: "sql",
  });
