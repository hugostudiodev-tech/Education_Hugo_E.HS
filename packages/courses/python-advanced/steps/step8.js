// Step 8 — Đọc CSV đúng cấu trúc
import { createStep } from "../createStep.js";

export default createStep(7, {
    fact: "csv.DictReader ánh xạ mỗi hàng theo tên tiêu đề; encoding='utf-8' và newline='' tránh lỗi phổ biến.",
    trap: "Tách CSV bằng split(',') luôn đúng kể cả khi một ô có dấu phẩy trong dấu nháy.",
    scenario: "Một ô ghi chú chứa 'đọc sách, làm bài' trong dấu nháy kép.",
    apply: "Dùng csv.DictReader thay vì tự tách chuỗi theo dấu phẩy.",
    output: "Một hàng là dict theo tên cột và giá trị ban đầu vẫn là chuỗi.",
    wrongOutput: "CSV tự chuyển mọi ô thành int/float đúng kiểu.",
    verify: "In fieldnames, số hàng và một hàng mẫu trước khi lưu DB.",
    debug: "Kiểm tra encoding, tiêu đề và ký tự xuống dòng trước khi đổi thuật toán.",
    limit: "Đọc CSV không xác nhận rằng các giá trị có ý nghĩa khoa học.",
    test: "Dùng hàng có dấu phẩy trong trường quoted để kiểm tra parser.",
    demo1: "import csv\nfrom io import StringIO\n\nrows = csv.DictReader(StringIO('code,focus\\nS01,8\\n'))\nprint(next(rows))",
    demo2: "import csv\nfrom io import StringIO\n\nrow = next(csv.DictReader(StringIO('code,note\\nS01,\"read, then study\"\\n')))\nprint(row['note'])",
    practice: "Đọc hai hàng giả lập trong chuỗi CSV và đếm số hàng.",
    solution: "import csv\nfrom io import StringIO\n\nrows = list(csv.DictReader(StringIO('code,focus\\nS01,8\\nS02,6\\n')))\nprint(len(rows))",
    source: "csv",
  });
