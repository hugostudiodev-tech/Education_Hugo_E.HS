// Step 10 — Ẩn danh và giảm dữ liệu thu thập
import { createStep } from "../createStep.js";

export default createStep(9, {
    fact: "Ẩn danh hoá bỏ định danh trực tiếp; chỉ thu thập biến cần thiết và không dùng dữ liệu thật trong bài tập.",
    trap: "Đổi tên người thành mã luôn đảm bảo dữ liệu không thể nhận diện lại.",
    scenario: "Bài học chỉ cần giờ ngủ và điểm tập trung, không cần tên hay email.",
    apply: "Dùng mã giả lập ngẫu nhiên, bỏ cột nhận diện và ghi rõ dữ liệu tổng hợp.",
    output: "Bản ghi thực hành không chứa tên, email, trường hay mã học sinh thật.",
    wrongOutput: "Mã hoá tên bằng một hàm đơn giản là đủ để bảo vệ dữ liệu nhạy cảm.",
    verify: "Rà cột, tên tệp, metadata và log để tìm thông tin nhận diện.",
    debug: "Xoá trường không cần thiết khỏi nguồn trước khi xuất bản hoặc gửi API.",
    limit: "Ẩn danh không làm dữ liệu nhạy cảm được tự do chia sẻ trong mọi hoàn cảnh.",
    test: "Quét schema đầu ra và từ chối các trường định danh không nằm trong allowlist.",
    demo1: "row = {'code': 'S014', 'sleep_hours': 7.5, 'focus_score': 8}\nprint(sorted(row))",
    demo2: "allowed = {'code', 'sleep_hours', 'focus_score'}\nrow = {'code': 'S014', 'email': 'example.invalid'}\nprint(set(row) <= allowed)",
    practice: "Tạo bản ghi đã loại tên và chỉ giữ ba trường cần dùng.",
    solution: "source = {'name': 'Sample Person', 'code': 'S014', 'sleep_hours': 7.5, 'focus_score': 8}\nclean = {key: source[key] for key in ('code', 'sleep_hours', 'focus_score')}\nprint(clean)",
    source: "python",
  });
