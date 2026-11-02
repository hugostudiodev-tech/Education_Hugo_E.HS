// Step 8 — f-string: in kết quả cho đẹp.
export default {
  id: "py8",
  lang: "python",
  file: "so_lop/fstring.py",
  duration: "40 phút",
  summary: "Dùng f-string để chèn biến và biểu thức vào câu, định dạng số thập phân, thêm dấu phân cách hàng nghìn và căn lề thành bảng.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **f-string**: \`f"…{bien}…"\`.
- Chèn cả **biểu thức** vào trong ngoặc nhọn.
- Định dạng: \`:.1f\`, \`:,\`, \`:>8\`.
- In bảng điểm thẳng hàng.`,
    },
    {
      section: "visual",
      title: "Ba cách in một câu",
      body: "Cả ba dòng in giống nhau. Cách nào dễ đọc nhất?",
      py: { code: 'ten = "Lan"\ndiem = 8.5\nprint("Bạn " + ten + " được " + str(diem) + " điểm")\nprint("Bạn", ten, "được", diem, "điểm")\nprint(f"Bạn {ten} được {diem} điểm")' },
    },
    {
      section: "research",
      title: "f-string ra đời năm 2016",
      body: `f-string (\"formatted string literal\") được thêm vào **Python 3.6** theo đề xuất **PEP 498** của Eric V. Smith. Trước đó người ta dùng \`%\` hoặc \`.format()\` — dài và dễ nhầm thứ tự.

Ngày nay f-string là cách được khuyên dùng vì **ngắn, đọc theo đúng thứ tự câu, và chạy nhanh**.

> Smith, E.V. (2015) *PEP 498 – Literal String Interpolation*. Available at: https://peps.python.org/pep-0498/`,
    },
    {
      section: "ideate",
      title: "Bảng điểm cần trông thế nào",
      body: `~~~
Tên        Toán   Văn
Minh Anh    8.5    7.0
Bảo        10.0    6.5
~~~

Để thẳng cột như vậy, mỗi ô phải có **độ rộng cố định** và số luôn có **một chữ số thập phân**. f-string làm được cả hai.`,
    },
    {
      section: "core",
      title: "Chèn biểu thức",
      body: "Trong `{ }` viết được bất kỳ biểu thức nào. Thêm `=` sau biểu thức để in cả tên lẫn giá trị — rất tiện khi gỡ lỗi.",
      py: { code: 'a, b = 8, 7\nprint(f"Tổng: {a + b}, trung bình: {(a + b) / 2}")\nprint(f"{a * 2 = }")' },
    },
    {
      section: "core",
      title: "Định dạng số",
      body: `| Mẫu | Ý nghĩa | Ví dụ → kết quả |
|---|---|---|
| \`{x:.1f}\` | 1 chữ số thập phân | 7 → 7.0 |
| \`{x:.2f}\` | 2 chữ số | 3.14159 → 3.14 |
| \`{x:,}\` | dấu phẩy hàng nghìn | 1500000 → 1,500,000 |
| \`{x:.0%}\` | phần trăm | 0.85 → 85% |`,
      py: { code: 'tb = 7.25\nquy = 1500000\nti_le = 0.85\nprint(f"{tb:.1f} | {quy:,} đ | {ti_le:.0%}")' },
    },
    {
      section: "core",
      title: "Căn lề",
      body: "`:<10` căn trái rộng 10, `:>6` căn phải rộng 6, `:^10` căn giữa. Kết hợp được: `{diem:>6.1f}`.",
      py: { code: 'print(f"{\'Tên\':<10}{\'Toán\':>6}")\nprint(f"{\'Minh Anh\':<10}{8.5:>6.1f}")\nprint(f"{\'Bảo\':<10}{10:>6.1f}")' },
    },
    {
      section: "apply",
      title: "Bài tập: phiếu điểm",
      body: `Nhập tên và điểm (số thực). In đúng:

~~~
Học sinh: Hà - Điểm: 9.0
~~~

Điểm luôn có **1 chữ số thập phân**.`,
      py: {
        code: "ten = input()\ndiem = float(input())\n",
        stdin: "Hà\n9",
        solution: 'ten = input()\ndiem = float(input())\nprint(f"Học sinh: {ten} - Điểm: {diem:.1f}")',
        hints: ["Dùng f\"...{ten}...\".", "Định dạng điểm: {diem:.1f}."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: số tiền quỹ",
      body: "Nhập số tiền quỹ (số nguyên). In dạng `Quỹ lớp: 1,250,000 đồng`.",
      py: {
        code: "quy = int(input())\n",
        stdin: "1250000",
        solution: 'quy = int(input())\nprint(f"Quỹ lớp: {quy:,} đồng")',
        hints: ["Mẫu dấu phẩy hàng nghìn là :,", "print(f\"Quỹ lớp: {quy:,} đồng\")"],
      },
    },
  ],
  quiz: [
    { q: "x = 5. f\"{x * 2}\" cho ra?", o: ["x * 2", "10", "{10}", "52"], a: 1, why: "Biểu thức trong {} được tính." },
    { q: "f\"{3.14159:.2f}\" cho ra?", o: ["3.14", "3.1", "3.142", "3"], a: 0, why: ".2f giữ 2 chữ số thập phân." },
    { q: "f\"{2000000:,}\" cho ra?", o: ["2000000", "2,000,000", "2.000.000", "2 000 000"], a: 1, why: ":, chèn dấu phẩy hàng nghìn." },
    { kind: "truefalse", q: "Quên chữ f trước dấu nháy thì {ten} được in nguyên văn.", a: true, why: "Không có f thì là xâu thường." },
    { q: "f\"{0.5:.0%}\" cho ra?", o: ["0.5%", "50%", "5%", "0%"], a: 1, why: "Nhân 100 và thêm %." },
    { kind: "match", q: "Nối mẫu với ý nghĩa.", pairs: [[":<10", "căn trái rộng 10"], [":>10", "căn phải rộng 10"], [":^10", "căn giữa rộng 10"], [":.1f", "1 chữ số thập phân"]], why: "Ký hiệu căn lề và độ chính xác." },
    { q: "f-string có từ phiên bản Python nào?", o: ["2.7", "3.0", "3.6", "3.12"], a: 2, why: "PEP 498, Python 3.6." },
    { kind: "bug", q: "Dòng nào in ra {ten} thay vì tên?", lines: ["ten = \"Vy\"", "print(f\"Chào {ten}\")", "print(\"Chào {ten}\")", "print(\"Chào\", ten)"], a: 2, why: "Thiếu chữ f." },
    { q: "a = 3; f\"{a = }\" cho ra?", o: ["a = 3", "3", "a", "= 3"], a: 0, why: "Dấu = in cả biểu thức lẫn giá trị." },
    { q: "f\"{7:>4}\" có độ dài mấy ký tự?", o: ["1", "3", "4", "7"], a: 2, why: "Rộng 4, đệm 3 dấu cách bên trái." },
  ],
};
