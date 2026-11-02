// Step 2 — Môi trường Python có thể tái lập
import { createStep } from "../createStep.js";

export default createStep(1, {
    fact: "Môi trường ảo cô lập các gói của dự án; requirements.txt ghi các phụ thuộc để cài lại.",
    trap: "Cài mọi thư viện vào Python hệ thống sẽ làm mọi dự án độc lập và tái lập hơn.",
    scenario: "LabLog cần fastapi nhưng bài Python cơ bản không; tạo venv trước khi cài.",
    apply: "Tạo venv cho từng dự án, kích hoạt nó, rồi cài các gói đã khai báo.",
    output: "Phiên bản Python của tiến trình hiện tại và danh sách gói của đúng môi trường.",
    wrongOutput: "Mọi máy dùng cùng phiên bản và gói dù chưa khai báo.",
    verify: "Chạy python --version và python -m pip freeze trong venv đã kích hoạt.",
    debug: "Xác nhận interpreter đang trỏ tới .venv rồi cài gói bằng python -m pip.",
    limit: "requirements.txt không tự ghi phiên bản hệ điều hành hay dữ liệu đầu vào.",
    test: "Tạo venv mới, cài requirements.txt và chạy lại một kiểm thử.",
    demo1: "import sys\nprint(sys.version_info.major >= 3)",
    demo2: "packages = ['fastapi', 'uvicorn']\nprint(', '.join(packages))",
    practice: "In ra tên dự án và hai phụ thuộc cần cài để bạn khác chuẩn bị môi trường.",
    solution: "project = 'LabLog'\nrequirements = ['fastapi', 'uvicorn']\nprint(project)\nprint('\\n'.join(requirements))",
    source: "python",
  });
