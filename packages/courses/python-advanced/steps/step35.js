// Step 35 — Trích dẫn nguồn và giới hạn kết luận
import { createStep } from "../createStep.js";

export default createStep(34, {
    fact: "Báo cáo học thuật nêu nguồn, phương pháp, kết quả, giới hạn và phân biệt dữ liệu mô phỏng với dữ liệu thực.",
    trap: "Một nguồn trích dẫn ở cuối báo cáo có thể thay thế mô tả phương pháp.",
    scenario: "LabLog báo liên hệ trong dữ liệu tự tạo về giờ ngủ và điểm tập trung.",
    apply: "Trích dẫn tài liệu kỹ thuật, ghi dữ liệu giả lập và tránh kết luận nhân quả.",
    output: "Người đọc biết kết quả đến từ đâu, chạy bằng cách nào và chưa thể kết luận gì.",
    wrongOutput: "Một biểu đồ có xu hướng là bằng chứng đủ để khuyên người khác đổi thói quen.",
    verify: "Soát từng kết luận với câu hỏi, mẫu, phép tính và giới hạn.",
    debug: "Nếu kết luận vượt dữ liệu, hạ mức diễn đạt và thêm giới hạn cụ thể.",
    limit: "Dữ liệu giả lập chỉ minh hoạ quy trình, không đưa ra bằng chứng về con người.",
    test: "Đọc báo cáo mà không xem mã vẫn nhận ra nguồn, cỡ mẫu và giới hạn.",
    demo1: "report = {'source': 'synthetic', 'n': 24, 'method': 'descriptive summary'}\nprint(report)",
    demo2: "claim = 'Trong mẫu mô phỏng, hai biến có liên hệ.'\nprint('causal claim avoided:', 'gây ra' not in claim)",
    practice: "Tạo câu kết luận đúng mức cho dữ liệu mô phỏng.",
    solution: "statement = 'Trong bộ dữ liệu mô phỏng này, giờ ngủ và điểm tập trung có xu hướng cùng thay đổi; chưa thể suy ra quan hệ nhân quả.'\nprint(statement)",
    source: "python",
  });
