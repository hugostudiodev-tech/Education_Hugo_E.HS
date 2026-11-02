// Step 29 — Module và import.
export default {
  id: "py29", lang: "python", file: "so_lop/modules.py", duration: "45 phút",
  summary: "Dùng module chuẩn, ba kiểu import, bí danh và khối __name__ để tổ chức code có thể tái sử dụng.",
  slides: [
    { section: "intro", title: "Thư viện là hộp dụng cụ", body: "Module là một tệp Python chứa hàm, lớp và biến. `import` giúp dùng lại code thay vì chép nó vào dự án." },
    { section: "visual", title: "Tên module giữ nguồn gốc", body: "Cách `import statistics` khiến lời gọi `statistics.mean` nói rõ hàm đến từ đâu.", py: { code: 'import statistics\n\ndiem = [7, 8.5, 9, 6.5]\nprint(statistics.mean(diem))\nprint(statistics.median(diem))' } },
    { section: "research", title: "Thư viện chuẩn", body: `Python đi kèm một thư viện chuẩn lớn: toán học, thống kê, ngày giờ, CSV, JSON và nhiều công cụ khác. Trước khi tự viết, hãy kiểm tra xem thư viện chuẩn đã có chưa.

> Python Software Foundation (2026) *The Python Standard Library*. Available at: https://docs.python.org/3/library/` },
    { section: "ideate", title: "Chọn kiểu import", body: "Ưu tiên `import module` để nguồn gốc rõ. Dùng `from module import name` cho một vài tên quen thuộc. Tránh `import *` vì khó biết tên đến từ đâu." },
    { section: "core", title: "Ba cách import", body: "Bí danh ngắn hữu ích khi tên module dài, nhưng phải phổ biến và dễ hiểu.", py: { code: 'import math\nfrom statistics import mean\nimport datetime as dt\n\nprint(math.sqrt(81))\nprint(mean([7, 8, 9]))\nprint(dt.date(2026, 11, 2).year)' } },
    { section: "core", title: "__name__ và code chạy trực tiếp", body: "Khi tệp được chạy trực tiếp, `__name__` là `__main__`. Khối guard giữ code demo không chạy khi tệp được import.", py: { code: 'def main():\n    print("Sổ Lớp khởi động")\n\nif __name__ == "__main__":\n    main()' } },
    { section: "apply", title: "Bài tập: thống kê điểm", body: "Nhập 5 điểm. Dùng module `statistics` để in trung bình và trung vị, mỗi số một chữ số thập phân.", py: { code: "import statistics\n", stdin: "5\n7\n8\n9\n10", solution: 'import statistics\n\ndiem = [float(input()) for _ in range(5)]\nprint(f"Trung bình: {statistics.mean(diem):.1f}")\nprint(f"Trung vị: {statistics.median(diem):.1f}")', hints: ["Đọc 5 số vào list.", "Dùng statistics.mean và statistics.median."] } },
    { section: "apply", title: "Bài tập: khoảng cách", body: "Nhập hai cạnh vuông a, b. Dùng `math.hypot` để in độ dài cạnh huyền hai chữ số thập phân.", py: { code: "import math\na = float(input())\nb = float(input())\n", stdin: "3\n4", solution: 'import math\na = float(input())\nb = float(input())\nprint(f"{math.hypot(a, b):.2f}")', hints: ["math.hypot(a, b) tính căn của a²+b².", "Định dạng :.2f."] } },
  ],
  quiz: [
    { q: "Module là?", o: ["Tệp chứa code Python có thể dùng lại", "Một vòng lặp", "Một kiểu số", "Một lỗi"], a: 0, why: "Module gom các định nghĩa và câu lệnh." },
    { q: "Cách gọi sqrt sau import math?", o: ["math.sqrt(9)", "sqrt.math(9)", "math->sqrt(9)", "import.sqrt(9)"], a: 0, why: "Dùng cú pháp module.tên." },
    { kind: "truefalse", q: "import * thường làm nguồn gốc tên khó theo dõi.", a: true, why: "Nhiều tên được đưa vào cùng phạm vi." },
    { kind: "output", q: "math.ceil in gì với 2.1?", code: "from math import ceil\nprint(ceil(2.1))", o: ["3", "2", "2.1", "Lỗi"], a: 0, why: "ceil làm tròn lên." },
    { q: "Bí danh được tạo bằng từ khoá?", o: ["as", "alias", "name", "with"], a: 0, why: "Ví dụ import datetime as dt." },
    { kind: "bug", q: "Dòng nào dùng module sai?", lines: ["import math", "x = sqrt(9)", "print(x)", "print(math.pi)"], a: 1, why: "Phải gọi math.sqrt(9) hoặc import sqrt riêng." },
    { kind: "blank", q: "Điền guard chạy trực tiếp.", code: "if __name__ == ___:", a: ['"__main__"', "'__main__'"], why: "__main__ là tên khi chạy tệp trực tiếp." },
    { kind: "multi", q: "Module nào thuộc thư viện chuẩn?", o: ["math", "statistics", "datetime", "react"], a: [0, 1, 2], why: "React không phải module chuẩn Python." },
    { q: "statistics.median dùng để?", o: ["Tìm trung vị", "Tìm tổng", "Sắp xếp tệp", "Sinh số ngẫu nhiên"], a: 0, why: "Median là giá trị giữa." },
    { q: "Khi import một module, guard __main__ giúp?", o: ["Không chạy code demo", "Xoá hàm", "Đổi tên Python", "Cài thư viện"], a: 0, why: "Code trong guard chỉ chạy trực tiếp." },
  ],
};
