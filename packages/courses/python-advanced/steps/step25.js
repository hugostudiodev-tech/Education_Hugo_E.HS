// Step 25 — Tài liệu hoá API nội bộ
import { createStep } from "../createStep.js";

export default createStep(24, {
    fact: "OpenAPI mô tả endpoint, tham số, kiểu phản hồi và lỗi để người dùng API hiểu hợp đồng.",
    trap: "Một trang README ngắn luôn thay thế được schema và ví dụ request/response.",
    scenario: "Nhóm khác cần biết giới hạn page_size và định dạng lỗi của LabLog.",
    apply: "Ghi method, path, schema, status, ví dụ và giới hạn truy vấn.",
    output: "Người dùng có thể thử API mà không phải đọc toàn bộ source.",
    wrongOutput: "Tài liệu API làm endpoint tự thực hiện xác thực đầu vào.",
    verify: "Mở /docs, thử request mẫu và đối chiếu response với hợp đồng đã viết.",
    debug: "Cập nhật mô tả cùng lúc khi schema hoặc status code thay đổi.",
    limit: "Tài liệu sinh tự động có thể thiếu mục đích nghiên cứu và giới hạn dữ liệu.",
    test: "Kiểm tra ví dụ trong tài liệu chạy được trên server thử.",
    demo1: "endpoint = {'method': 'GET', 'path': '/studies', 'response': 'list[Study]'}\nprint(endpoint)",
    demo2: "contract = {'page_size': {'min': 1, 'max': 100}, 'not_found': 404}\nprint(contract)",
    practice: "Tạo mô tả endpoint observations gồm method, path và lỗi not found.",
    solution: "endpoint = {'method': 'GET', 'path': '/observations', 'errors': [404]}\nprint(endpoint['method'], endpoint['path'], endpoint['errors'])",
    source: "fastapi",
  });
