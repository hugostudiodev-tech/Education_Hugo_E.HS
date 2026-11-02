// Step 28 — Xác thực đầu vào bằng Pydantic
import { createStep } from "../createStep.js";

export default createStep(27, {
    fact: "Pydantic kiểm tra và chuyển đổi dữ liệu tại biên request theo schema khai báo.",
    trap: "Type hint trong mọi hàm Python tự xác thực JSON từ client.",
    scenario: "Request observation cần focus từ 0 đến 10 và mã code không rỗng.",
    apply: "Khai báo schema Pydantic có giới hạn và từ chối payload sai.",
    output: "Dữ liệu hợp lệ thành object có kiểu; payload sai nhận phản hồi validation.",
    wrongOutput: "Validation đầu vào có thể thay constraint trong database.",
    verify: "Gửi payload hợp lệ, thiếu trường, sai kiểu và ngoài miền.",
    debug: "Đọc vị trí field trong lỗi validation, không tắt kiểm tra để cho request lọt qua.",
    limit: "Schema không xác nhận nội dung đo lường có đáng tin về mặt khoa học.",
    test: "Điểm 8 được chấp nhận; điểm 12 và thiếu code bị từ chối.",
    demo1: "payload = {'code': 'S014', 'focus_score': 8}\nprint(0 <= payload['focus_score'] <= 10)",
    demo2: "def validate(payload):\n    return bool(payload.get('code')) and 0 <= payload.get('focus_score', -1) <= 10\n\nprint(validate({'code': 'S01', 'focus_score': 8}))",
    practice: "Viết hàm kiểm tra payload có code và focus_score trong 0–10.",
    solution: "def valid(payload):\n    score = payload.get('focus_score')\n    return isinstance(payload.get('code'), str) and isinstance(score, int) and 0 <= score <= 10\n\nprint(valid({'code': 'S03', 'focus_score': 6}))",
    source: "pydantic",
  });
