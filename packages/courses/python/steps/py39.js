// Step 39 — Đệ quy và độ phức tạp.
export default {
  id: "py39", lang: "python", file: "so_lop/de_quy.py", duration: "50 phút",
  summary: "Hiểu trường hợp cơ sở, bước đệ quy, ngăn xếp lời gọi và đánh giá khi vòng lặp là lựa chọn tốt hơn.",
  slides: [
    { section: "intro", title: "Hàm gọi chính nó", body: "Đệ quy giải bài toán bằng một phiên bản nhỏ hơn của chính nó. Mọi hàm đệ quy phải tiến tới trường hợp cơ sở để dừng." },
    { section: "visual", visual: "py-call-stack", title: "Giai thừa mở rồi đóng", body: "4! gọi 3!, rồi 2!, rồi 1!; sau đó các kết quả quay ngược lên.", py: { code: 'def giai_thua(n):\n    print("Gọi", n)\n    if n <= 1:\n        return 1\n    return n * giai_thua(n - 1)\n\nprint("Kết quả:", giai_thua(4))' } },
    { section: "research", title: "Ngăn xếp lời gọi", body: `Mỗi lần gọi hàm tạo một frame trên call stack. Python giới hạn độ sâu đệ quy để tránh cạn bộ nhớ. Vì vậy, bài lặp dài thường nên dùng vòng lặp; đệ quy phù hợp với cây và cấu trúc tự lặp.

> Python Software Foundation (2026) *sys — System-specific parameters and functions*. Available at: https://docs.python.org/3/library/sys.html#sys.getrecursionlimit` },
    { section: "ideate", title: "Hai câu hỏi trước khi viết", body: "Trường hợp nhỏ nhất trả ngay là gì? Mỗi lời gọi làm dữ liệu nhỏ đi thế nào? Nếu không trả lời rõ hai câu này, đệ quy dễ chạy mãi." },
    { section: "core", title: "Tổng từ 1 đến n", body: "Trường hợp cơ sở n=0 trả 0; bước đệ quy là n + tổng tới n-1.", py: { code: 'def tong(n):\n    if n == 0:\n        return 0\n    return n + tong(n - 1)\n\nprint(tong(5))' } },
    { section: "core", title: "Đệ quy hay vòng lặp?", body: "Hai cách đều O(n), nhưng vòng lặp dùng O(1) bộ nhớ phụ; đệ quy dùng O(n) stack.", py: { code: 'def tong_lap(n):\n    ket_qua = 0\n    for x in range(1, n + 1):\n        ket_qua += x\n    return ket_qua\n\nprint(tong_lap(1000))' } },
    { section: "core", title: "Theo dõi tong_chu_so(2026)", body: "Mỗi lời gọi tách chữ số cuối và giao phần còn lại cho lời gọi con:\n\n| Lời gọi | n % 10 | n // 10 | Trả về |\n|---|---|---|---|\n| tong_chu_so(2026) | 6 | 202 | 6 + 4 = **10** |\n| tong_chu_so(202) | 2 | 20 | 2 + 2 = 4 |\n| tong_chu_so(20) | 0 | 2 | 0 + 2 = 2 |\n| tong_chu_so(2) | — | — | 2 *(cơ sở: n < 10)* |\n\nĐọc cột \"Trả về\" **từ dưới lên**: đó là lúc các khung trên ngăn xếp lần lượt đóng lại.", py: { code: "def tong_chu_so(n, sau=0):\n    print(\"  \" * sau + f\"gọi({n})\")\n    if n < 10:\n        return n\n    kq = n % 10 + tong_chu_so(n // 10, sau + 1)\n    print(\"  \" * sau + f\"trả {kq}\")\n    return kq\n\ntong_chu_so(2026)" } },
    { section: "core", title: "Lỗi hay gặp với đệ quy", body: "1. **Thiếu trường hợp cơ sở** → `RecursionError: maximum recursion depth exceeded`.\n2. **Bước đệ quy không nhỏ đi**: `f(n + 1)` hoặc `f(n)` → không bao giờ tới cơ sở.\n3. **Quên return**: `n * giai_thua(n - 1)` mà thiếu `return` → trả `None`, nhân None báo lỗi.\n4. **Đệ quy cho việc lặp dài**: tổng 1..100 000 vượt giới hạn ngăn xếp (mặc định khoảng 1000). Dùng vòng lặp.\n5. **Fibonacci đệ quy ngây thơ**: tính lại cùng giá trị rất nhiều lần → cực chậm.", py: { code: "import sys\nprint(\"Giới hạn độ sâu:\", sys.getrecursionlimit())\n\ndef dem(n):\n    return 0 if n == 0 else 1 + dem(n - 1)\n\ntry:\n    dem(5000)\nexcept RecursionError as e:\n    print(\"RecursionError:\", e)" } },
    { section: "apply", title: "Bài tập: tổng chữ số", body: "Viết hàm đệ quy `tong_chu_so(n)`. Trường hợp n < 10 trả n; còn lại trả chữ số cuối cộng kết quả của phần còn lại. Nhập số nguyên không âm.", py: { code: "def tong_chu_so(n):\n    pass\n", stdin: "2026", solution: 'def tong_chu_so(n):\n    if n < 10:\n        return n\n    return n % 10 + tong_chu_so(n // 10)\n\nn = int(input())\nprint(tong_chu_so(n))', hints: ["Chữ số cuối là n % 10.", "Phần còn lại là n // 10."] } },
    { section: "apply", title: "Bài tập: UCLN Euclid", body: "Viết đệ quy `ucln(a, b)`: nếu b=0 trả a; ngược lại gọi `ucln(b, a % b)`. Nhập a và b rồi in kết quả.", py: { code: "def ucln(a, b):\n    pass\n", stdin: "48\n18", solution: 'def ucln(a, b):\n    if b == 0:\n        return a\n    return ucln(b, a % b)\n\na = int(input())\nb = int(input())\nprint(ucln(a, b))', hints: ["Base case: b == 0.", "Bước nhỏ hơn: ucln(b, a % b)."] } },
  ],
  quiz: [
    { q: "Hàm đệ quy bắt buộc cần?", o: ["Trường hợp cơ sở", "Module random", "Class", "Tệp CSV"], a: 0, why: "Base case dừng chuỗi gọi." },
    { q: "giai_thua(0) bằng?", o: ["1", "0", "Không xác định", "-1"], a: 0, why: "0! được định nghĩa bằng 1." },
    { kind: "truefalse", q: "Đệ quy luôn nhanh hơn vòng lặp.", a: false, why: "Nó có chi phí gọi hàm và dùng stack." },
    { kind: "output", q: "Hàm đệ quy f(3) in ra gì?", code: "def f(n):\n if n==0:return 0\n return 1+f(n-1)\nprint(f(3))", o: ["3", "2", "1", "0"], a: 0, why: "Cộng 1 ba lần." },
    { q: "Call stack lưu?", o: ["Các lần gọi hàm chưa hoàn tất", "Chỉ tệp", "Mọi module", "Điểm số"], a: 0, why: "Mỗi frame chờ lời gọi con trả về." },
    { kind: "bug", q: "Dòng nào khiến đệ quy không tiến tới dừng?", lines: ["def f(n):", "    if n == 0: return 0", "    return f(n + 1)", "print(f(3))"], a: 2, why: "n tăng xa 0; phải n - 1." },
    { kind: "blank", q: "Điền base case tổng 1..n.", code: "if n == 0:\n    return ___", a: "0", why: "Tổng rỗng là 0." },
    { kind: "multi", q: "Bài toán phù hợp tự nhiên với đệ quy?", o: ["Duyệt cây thư mục", "Giai thừa để học", "Cấu trúc lồng nhau", "In 1..1 triệu"], a: [0, 1, 2], why: "In dài nên dùng vòng lặp để tránh sâu stack." },
    { q: "Đệ quy tuyến tính thường dùng bộ nhớ phụ?", o: ["O(n)", "O(1)", "O(log n) luôn", "O(n²) luôn"], a: 0, why: "Có n frame trên stack." },
    { q: "Euclid giảm bài toán bằng?", o: ["(b, a % b)", "(a+1, b)", "(a*b, b)", "(a, b+1)"], a: 0, why: "Số dư nhỏ dần tới 0." },
  ],
};
