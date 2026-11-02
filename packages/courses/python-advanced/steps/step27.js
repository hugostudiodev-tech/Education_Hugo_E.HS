// Step 27 — Tạo endpoint với FastAPI
import { createStep } from "../createStep.js";

export default createStep(26, {
    fact: "FastAPI ánh xạ hàm Python vào endpoint; khai báo method/path và kiểu phản hồi rõ ràng.",
    trap: "Chạy một hàm endpoint trực tiếp bằng Python đồng nghĩa server HTTP đã hoạt động.",
    scenario: "Tạo GET /health để kiểm tra server LabLog.",
    apply: "Chạy uvicorn app.main:app --reload rồi gọi /health bằng trình duyệt/curl.",
    output: "Server trả JSON qua HTTP; PyPlayground trong trình duyệt không chạy server local này.",
    wrongOutput: "PyPlayground chạy được uvicorn chỉ bằng cách bấm nút Chạy.",
    verify: "Khởi động server local và xác nhận GET /health trả 200.",
    debug: "Kiểm tra interpreter, pip install, import path và cổng 8000.",
    limit: "Endpoint health chỉ kiểm tra một phần ứng dụng, không chứng minh DB đủ dữ liệu.",
    test: "Tắt server rồi thử lại để phân biệt lỗi mạng với lỗi endpoint.",
    demo1: "route = {'method': 'GET', 'path': '/health', 'returns': {'status': 'ok'}}\nprint(route)",
    demo2: "payload = {'status': 'ok', 'service': 'LabLog'}\nprint(payload['status'])",
    practice: "Tạo dict response cho health check và chạy bằng nút Python.",
    solution: "response = {'status': 'ok', 'service': 'LabLog'}\nassert response['status'] == 'ok'\nprint(response)",
    source: "fastapi",
  });
