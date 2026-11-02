// Step 30 — Kiểm thử endpoint và phản hồi lỗi
import { createStep } from "../createStep.js";

export default createStep(29, {
    fact: "API test kiểm tra status, schema và tác động DB; TestClient giúp gọi app mà không mở cổng công khai.",
    trap: "Kiểm tra endpoint bằng trình duyệt một lần là đủ cho mọi trường hợp lỗi.",
    scenario: "GET /studies/{id} phải trả 404 với ID không tồn tại.",
    apply: "Dùng TestClient với database thử riêng, kiểm tra cả body lẫn status.",
    output: "Bài test tái hiện request và phản hồi có thể chạy lại tự động.",
    wrongOutput: "Dùng database production trong test giúp dữ liệu thực tế hơn và an toàn hơn.",
    verify: "Chạy test từ đầu nhiều lần và xác nhận DB thử được làm sạch.",
    debug: "Đọc assertion đầu tiên thất bại rồi so request, response và fixture DB.",
    limit: "TestClient không thay kiểm thử tải hay cấu hình reverse proxy thật.",
    test: "Test 201 tạo mới, 422 dữ liệu sai, 404 không tìm thấy.",
    demo1: "response = {'status_code': 404, 'body': {'error': 'study_not_found'}}\nassert response['status_code'] == 404\nprint(response['body'])",
    demo2: "expected = {'error': 'study_not_found'}\nactual = {'error': 'study_not_found'}\nprint(actual == expected)",
    practice: "Viết assertion cho phản hồi không tìm thấy.",
    solution: "response = {'status_code': 404, 'body': {'error': 'study_not_found'}}\nassert response['status_code'] == 404\nassert response['body']['error'] == 'study_not_found'\nprint('API contract passed')",
    source: "fastapi",
  });
