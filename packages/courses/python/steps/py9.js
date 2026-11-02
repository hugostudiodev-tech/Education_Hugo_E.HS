// Step 9 — Module math.
export default {
  id: "py9",
  lang: "python",
  file: "so_lop/math.py",
  duration: "40 phút",
  summary: "Nhập module math, dùng sqrt, ceil, floor, pi; phân biệt làm tròn lên, làm tròn xuống, cắt bỏ và round.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **import math** — mượn công cụ có sẵn.
- \`math.sqrt\`, \`math.pi\`, \`math.ceil\`, \`math.floor\`.
- Khi nào làm tròn **lên**, khi nào làm tròn **xuống**.`,
    },
    {
      section: "visual",
      title: "Cần mấy xe cho chuyến dã ngoại?",
      body: "42 bạn, mỗi xe chở 16 người. 42 / 16 = 2.625 — nhưng không thuê được 2.625 xe! Phải làm tròn **lên**.",
      py: { code: "import math\nprint(42 / 16)\nprint(math.ceil(42 / 16), \"xe\")" },
    },
    {
      section: "research",
      title: "Thư viện chuẩn: \"pin đi kèm\"",
      body: `Python có khẩu hiệu **"batteries included"** — cài Python là có sẵn hơn 200 module: toán (math), ngẫu nhiên (random), ngày giờ (datetime), tệp CSV (csv)…

Không cần viết lại hàm căn bậc hai: người khác đã viết, kiểm thử kỹ, và nó chạy nhanh hơn code tự viết.

> Python Software Foundation (2025) *math — Mathematical functions*. Available at: https://docs.python.org/3/library/math.html`,
    },
    {
      section: "ideate",
      title: "Bài toán nào cần làm tròn kiểu gì?",
      body: `- Số xe, số bàn, số hộp → luôn **lên** (ceil): thiếu một chỗ là có bạn đứng.
- Số phần quà mua được với số tiền có → luôn **xuống** (floor): không mua nửa món.
- Điểm trung bình → **gần nhất** (round).

Chọn sai kiểu làm tròn là lỗi logic — chương trình chạy êm mà kết quả sai.`,
    },
    {
      section: "core",
      title: "Các hàm hay dùng",
      body: `| Hàm | Ý nghĩa | Ví dụ |
|---|---|---|
| math.sqrt(x) | căn bậc hai | sqrt(16) → 4.0 |
| math.ceil(x) | làm tròn lên | ceil(2.1) → 3 |
| math.floor(x) | làm tròn xuống | floor(2.9) → 2 |
| math.pi | số π | 3.141592653589793 |
| math.gcd(a, b) | ước chung lớn nhất | gcd(12, 18) → 6 |`,
      py: { code: "import math\nprint(math.sqrt(16), math.ceil(2.1), math.floor(2.9))\nprint(math.pi)\nprint(math.gcd(12, 18))" },
    },
    {
      section: "core",
      title: "floor, int và round khác nhau",
      body: "Với số âm, `floor` và `int` cho kết quả khác nhau: floor đi **xuống**, int **cắt bỏ** về phía 0.",
      py: { code: "import math\nx = -2.7\nprint(math.floor(x), int(x), round(x))" },
    },
    {
      section: "core",
      title: "Hai cách import",
      body: `~~~python
import math
print(math.sqrt(9))

from math import sqrt, pi
print(sqrt(9), pi)
~~~

Cách đầu rõ ràng hàm đến từ đâu; cách sau ngắn hơn. Chặng 6 sẽ dạy bạn viết module của riêng mình.`,
    },
    {
      section: "apply",
      title: "Bài tập: thuê xe",
      body: "Nhập số học sinh và sức chứa mỗi xe. In `Cần 3 xe` (với 42 và 16).",
      py: {
        code: "import math\nhs = int(input())\ncho = int(input())\n",
        stdin: "42\n16",
        solution: 'import math\nhs = int(input())\ncho = int(input())\nprint(f"Cần {math.ceil(hs / cho)} xe")',
        hints: ["Phải làm tròn lên: math.ceil.", "print(f\"Cần {math.ceil(hs / cho)} xe\")"],
      },
    },
    {
      section: "apply",
      title: "Bài tập: sân trường hình tròn",
      body: "Nhập bán kính r (mét) của bồn hoa tròn. In diện tích π·r², **2 chữ số thập phân**. Với r = 3 phải in `28.27`.",
      py: {
        code: "import math\nr = float(input())\n",
        stdin: "3",
        solution: 'import math\nr = float(input())\nprint(f"{math.pi * r ** 2:.2f}")',
        hints: ["Diện tích: math.pi * r ** 2.", "Định dạng 2 chữ số: :.2f trong f-string."],
      },
    },
  ],
  quiz: [
    { q: "math.ceil(4.01) bằng?", o: ["4", "5", "4.0", "4.01"], a: 1, why: "Làm tròn lên." },
    { q: "math.floor(4.99) bằng?", o: ["4", "5", "4.9", "5.0"], a: 0, why: "Làm tròn xuống." },
    { q: "Có 50 000 đ, mỗi cây bút 12 000 đ. Số bút mua được dùng hàm nào?", o: ["ceil", "floor (hoặc //)", "round", "sqrt"], a: 1, why: "Không mua được nửa cây — làm tròn xuống." },
    { kind: "truefalse", q: "math.sqrt(25) trả về 5.0.", a: true, why: "sqrt luôn trả float." },
    { q: "math.floor(-1.5) bằng?", o: ["-1", "-2", "1", "-1.5"], a: 1, why: "Đi xuống phía âm." },
    { q: "int(-1.5) bằng?", o: ["-1", "-2", "1", "-1.5"], a: 0, why: "int cắt về phía 0." },
    { kind: "bug", q: "Dòng nào gây NameError?", lines: ["import math", "print(math.pi)", "print(sqrt(4))", "print(math.sqrt(4))"], a: 2, why: "Chỉ import math, phải gọi math.sqrt — hoặc from math import sqrt." },
    { kind: "match", q: "Nối tình huống với cách làm tròn.", pairs: [["Số xe cần thuê", "ceil"], ["Số món mua được", "floor"], ["Điểm trung bình", "round"]], why: "Chọn theo ý nghĩa thực tế." },
    { q: "math.gcd(8, 12) bằng?", o: ["2", "4", "24", "96"], a: 1, why: "Ước chung lớn nhất." },
    { q: "\"Batteries included\" nói về điều gì?", o: ["Python chạy bằng pin", "Thư viện chuẩn có sẵn rất nhiều module", "Máy tính xách tay", "Một module tên batteries"], a: 1, why: "Cài Python là có sẵn thư viện chuẩn." },
  ],
};
