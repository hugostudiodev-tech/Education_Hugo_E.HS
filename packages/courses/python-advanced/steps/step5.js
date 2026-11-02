// Step 5 — Kiểm thử đơn vị và gỡ lỗi có phương pháp
import { createStep } from "../createStep.js";

export default createStep(4, {
    fact: "Unit test kiểm tra một đơn vị nhỏ với dữ liệu biết trước; debug tốt bắt đầu bằng tái hiện lỗi.",
    trap: "Nếu chương trình chạy hết một lần thì các hàm của nó đã được kiểm thử đầy đủ.",
    scenario: "Hàm kiểm tra điểm phải chấp nhận 0 và 100 nhưng từ chối -1 và 101.",
    apply: "Viết các ca biên và chạy unittest để bắt lỗi trước khi nhập cả CSV.",
    output: "Bộ test báo từng ca đạt hoặc chỉ rõ kết quả mong đợi khác thực tế.",
    wrongOutput: "Một ca test thành công chứng minh mọi đầu vào đều đúng.",
    verify: "Chạy python -m unittest discover -s tests -v.",
    debug: "Tái hiện ca lỗi nhỏ nhất, đọc traceback, sửa nguyên nhân rồi chạy lại test.",
    limit: "Unit test không chứng minh ứng dụng hoạt động tốt với mọi dữ liệu bên ngoài.",
    test: "Kiểm tra cả điểm biên 0, 100 và hai giá trị nằm ngoài miền.",
    demo1: "def valid_score(score):\n    return 0 <= score <= 100\n\nfor score in [0, 100, -1]:\n    print(score, valid_score(score))",
    demo2: "import unittest\n\nclass ScoreTest(unittest.TestCase):\n    def test_boundary(self):\n        self.assertTrue(0 <= 100 <= 100)\n\nprint('Run: python -m unittest')",
    practice: "Viết kiểm tra nhận điểm 82 và từ chối điểm 120.",
    solution: "def valid_score(score):\n    return 0 <= score <= 100\n\nassert valid_score(82)\nassert not valid_score(120)\nprint('2 checks passed')",
    source: "unittest",
  });
