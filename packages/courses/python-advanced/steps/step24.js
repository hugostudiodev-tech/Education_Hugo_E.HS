// Step 24 — Xử lý lỗi và hợp đồng phản hồi
import { createStep } from "../createStep.js";

export default createStep(23, {
    fact: "Lỗi nội bộ nên được ghi nhận và chuyển thành phản hồi có mã ổn định, không lộ traceback cho người dùng.",
    trap: "Bắt mọi exception rồi trả danh sách rỗng giúp hệ thống luôn đúng và dễ sửa.",
    scenario: "Truy vấn DB lỗi cần trả 500; mã nghiên cứu không tồn tại cần trả 404.",
    apply: "Phân biệt lỗi đầu vào, không tìm thấy và lỗi hệ thống; giữ nguyên nguyên nhân trong log.",
    output: "Người gọi nhận thông báo có thể xử lý; đội phát triển có ngữ cảnh chẩn đoán.",
    wrongOutput: "Trả 200 cùng dữ liệu rỗng cho mọi lỗi giúp API dễ dự đoán.",
    verify: "Thử từng tình huống và kiểm tra cả status code lẫn cấu trúc response.",
    debug: "Không nuốt exception; bắt loại lỗi cụ thể tại ranh giới phù hợp.",
    limit: "Thông báo ngắn không nên chứa SQL, đường dẫn nội bộ hay dữ liệu cá nhân.",
    test: "Gửi ID sai định dạng, ID không tồn tại và truy vấn lỗi riêng biệt.",
    demo1: "def find_study(studies, code):\n    if code not in studies:\n        raise LookupError('study not found')\n    return studies[code]\n\nprint(find_study({'A': 1}, 'A'))",
    demo2: "def public_error(code):\n    return {'error': code}\n\nprint(public_error('study_not_found'))",
    practice: "Trả mã lỗi ổn định khi mã nghiên cứu không tồn tại.",
    solution: "def find_study(studies, code):\n    if code not in studies:\n        return {'error': 'study_not_found'}\n    return {'study': studies[code]}\n\nprint(find_study({}, 'missing'))",
    source: "fastapi",
  });
