// Step 26 — HTTP resource, method và status code
import { createStep } from "../createStep.js";

export default createStep(25, {
    fact: "HTTP method biểu thị ý định; status code cho biết kết quả xử lý theo hợp đồng.",
    trap: "GET được dùng để xoá dữ liệu nếu tên URL có chữ delete.",
    scenario: "Đọc danh sách dùng GET; tạo bản ghi dùng POST.",
    apply: "Chọn resource-oriented path và method phù hợp, không đặt hành động ghi vào GET.",
    output: "Client biết nên đọc, tạo hay cập nhật từ method/status.",
    wrongOutput: "Status 200 phù hợp cho mọi request kể cả tài nguyên không tồn tại.",
    verify: "Thử GET/POST sai method và quan sát status cùng response.",
    debug: "Đối chiếu method, path, status và body với tài liệu endpoint.",
    limit: "HTTP status không chứng minh dữ liệu được nghiên cứu thu thập đúng.",
    test: "Một request đọc không làm thay đổi số hàng trong database.",
    demo1: "routes = {('GET', '/studies'): 'read list', ('POST', '/studies'): 'create'}\nprint(routes[('GET', '/studies')])",
    demo2: "status = {'created': 201, 'not_found': 404, 'invalid': 422}\nprint(status)",
    practice: "Chọn status phù hợp cho tạo thành công, không tìm thấy, dữ liệu sai.",
    solution: "responses = {'created': 201, 'missing': 404, 'invalid': 422}\nfor name, code in responses.items():\n    print(name, code)",
    source: "http",
  });
