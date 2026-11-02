// Step 22 — Tách tầng truy cập dữ liệu và nghiệp vụ
import { createStep } from "../createStep.js";

export default createStep(21, {
    fact: "Tầng repository thực hiện truy vấn; tầng service áp dụng quy tắc nghiệp vụ và điều phối use case.",
    trap: "Đặt câu SQL, xác thực dữ liệu và định dạng HTTP trong cùng một hàm sẽ dễ thay đổi hơn.",
    scenario: "Cả CLI và API cùng cần lưu quan sát hợp lệ.",
    apply: "Cho hai giao diện gọi cùng service, service dùng repository để đọc/ghi DB.",
    output: "Quy tắc nghiệp vụ không bị sao chép riêng trong API và CLI.",
    wrongOutput: "Tách tầng đồng nghĩa phải tạo thật nhiều lớp không có trách nhiệm riêng.",
    verify: "Test service bằng repository giả mà không cần khởi động web server.",
    debug: "Lần theo luồng route → service → repository để tìm tầng gây lỗi.",
    limit: "Kiến trúc phân lớp không tự đảm bảo mọi chức năng được kiểm thử.",
    test: "Gọi service từ test và từ CLI với cùng dữ liệu mẫu.",
    demo1: "def valid_observation(row):\n    return 0 <= row['focus'] <= 10\n\nprint(valid_observation({'focus': 8}))",
    demo2: "def save_observation(repository, row):\n    if not 0 <= row['focus'] <= 10:\n        raise ValueError('focus outside range')\n    return repository.insert(row)\n\nprint(save_observation.__name__)",
    practice: "Viết service chỉ lưu focus hợp lệ và từ chối giá trị ngoài 0–10.",
    solution: "def save_focus(value, insert):\n    if not 0 <= value <= 10:\n        raise ValueError('focus outside range')\n    return insert(value)\n\nprint(save_focus(8, lambda value: 'saved ' + str(value)))",
    source: "python",
  });
