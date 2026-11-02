// Step 7 — Thứ tự ưu tiên, làm tròn và sai số số thực.
export default {
  id: "py7",
  lang: "python",
  file: "so_lop/lam_tron.py",
  duration: "45 phút",
  summary: "Nắm thứ tự ưu tiên của toán tử, dùng ngoặc để viết đúng ý, làm tròn bằng round(), và hiểu vì sao 0.1 + 0.2 không đúng bằng 0.3.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Thứ tự ưu tiên: \`**\` → \`* / // %\` → \`+ -\`.
- Dùng **ngoặc tròn** để viết đúng ý.
- **round()** — làm tròn điểm.
- **Sai số số thực** và cách so sánh an toàn.`,
    },
    {
      section: "visual",
      title: "Một con số, hai đáp án",
      body: "Điểm trung bình của 8 và 6 là 7. Chạy hai dòng và xem dòng nào đúng.",
      py: { code: "print(8 + 6 / 2)\nprint((8 + 6) / 2)" },
    },
    {
      section: "research",
      title: "Vì sao 0.1 + 0.2 ≠ 0.3?",
      body: `Máy tính lưu số thực ở **hệ nhị phân** theo chuẩn **IEEE 754**. Giống như 1/3 không viết hết được ở hệ thập phân (0.333…), số 0.1 cũng không viết hết được ở hệ nhị phân — máy chỉ giữ một số **gần đúng**.

Lỗi này có trong mọi ngôn ngữ dùng số thực chuẩn, không riêng Python.

> Python Software Foundation (2025) *Floating-Point Arithmetic: Issues and Limitations*. Available at: https://docs.python.org/3/tutorial/floatingpoint.html`,
      py: { code: "print(0.1 + 0.2)\nprint(0.1 + 0.2 == 0.3)\nprint(round(0.1 + 0.2, 2) == 0.3)" },
    },
    {
      section: "ideate",
      title: "Điểm trung bình phải làm tròn thế nào?",
      body: `Sổ điểm thường ghi **một chữ số thập phân**: 7.25 → 7.3? hay 7.2?

Trước khi viết code, hãy hỏi: quy định làm tròn của trường là gì? Lập trình viên giỏi **hỏi rõ quy tắc** trước, rồi mới chọn công cụ. Step này cho bạn thấy round() làm tròn thế nào để bạn chọn cho đúng.`,
    },
    {
      section: "core",
      title: "Thứ tự ưu tiên",
      body: `Từ cao tới thấp:

1. \`( )\` ngoặc
2. \`**\` luỹ thừa
3. \`*  /  //  %\`
4. \`+  -\`

Cùng mức thì tính **từ trái sang phải** (riêng \`**\` tính từ phải sang). Khi phân vân, **thêm ngoặc** — ngoặc thừa không hại gì, còn giúp người đọc.`,
    },
    {
      section: "core",
      title: "round()",
      body: `- \`round(x)\` → số nguyên gần nhất.
- \`round(x, 1)\` → giữ 1 chữ số thập phân.

Chú ý: Python làm tròn **"về số chẵn"** khi đúng ở giữa: \`round(2.5)\` = 2, \`round(3.5)\` = 4. Ngoài ra số như 7.25 vốn lưu gần đúng, nên \`round(7.25, 1)\` có thể ra 7.2. Chạy để thấy.`,
      py: { code: "print(round(7.46))\nprint(round(7.46, 1))\nprint(round(2.5), round(3.5))\nprint(round(7.25, 1))" },
    },
    {
      section: "core",
      title: "So sánh số thực an toàn",
      body: `Đừng so \`a == b\` trực tiếp với số thực tính ra. Hai cách an toàn:

~~~python
abs(a - b) < 1e-9          # khoảng cách đủ nhỏ
round(a, 2) == round(b, 2) # làm tròn rồi so
~~~

\`abs()\` là **giá trị tuyệt đối**; \`1e-9\` nghĩa là 10⁻⁹.`,
    },
    {
      section: "apply",
      title: "Bài tập: điểm trung bình hai bài",
      body: "Nhập điểm giữa kỳ và cuối kỳ. In trung bình cộng, **làm tròn 1 chữ số**. Với 7.5 và 8.9 phải in `8.2`.",
      py: {
        code: "a = float(input())\nb = float(input())\n",
        stdin: "7.5\n8.9",
        solution: "a = float(input())\nb = float(input())\nprint(round((a + b) / 2, 1))",
        hints: ["Nhớ ngoặc: (a + b) / 2.", "Bọc trong round(..., 1)."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: sửa công thức",
      body: "Công thức dưới muốn tính **(giữa kỳ + cuối kỳ × 2) / 3** nhưng in sai. Thêm ngoặc cho đúng: với 6 và 9 phải ra `8.0`.",
      py: {
        code: "gk = 6\nck = 9\nprint(gk + ck * 2 / 3)",
        solution: "gk = 6\nck = 9\nprint((gk + ck * 2) / 3)",
        hints: ["Hiện tại Python tính ck * 2 / 3 trước rồi mới cộng gk.", "Bọc cả tử số trong ngoặc: (gk + ck * 2) / 3."],
      },
    },
  ],
  quiz: [
    { q: "2 + 3 * 4 bằng?", o: ["20", "14", "24", "9"], a: 1, why: "Nhân trước: 2 + 12." },
    { q: "(2 + 3) * 4 bằng?", o: ["20", "14", "24", "9"], a: 0, why: "Ngoặc trước." },
    { q: "2 ** 3 ** 2 bằng?", o: ["64", "512", "36", "12"], a: 1, why: "** tính từ phải: 3 ** 2 = 9, 2 ** 9 = 512." },
    { kind: "truefalse", q: "0.1 + 0.2 == 0.3 cho True trong Python.", a: false, why: "Sai số nhị phân: 0.30000000000000004." },
    { q: "round(4.567, 2) bằng?", o: ["4.56", "4.57", "4.6", "5"], a: 1, why: "Giữ 2 chữ số thập phân." },
    { q: "round(2.5) bằng?", o: ["2", "3", "2.5", "Báo lỗi"], a: 0, why: "Làm tròn về số chẵn khi đúng ở giữa." },
    { q: "Cách so hai số thực an toàn?", o: ["a == b", "abs(a - b) < 1e-9", "a is b", "str(a) == b"], a: 1, why: "So khoảng cách đủ nhỏ." },
    { kind: "order", q: "Xếp mức ưu tiên từ cao xuống thấp.", items: ["( )", "**", "* / // %", "+ -"], a: [0, 1, 2, 3], why: "Ngoặc → luỹ thừa → nhân chia → cộng trừ." },
    { kind: "bug", q: "Dòng nào tính SAI trung bình của a và b?", lines: ["a = 8", "b = 6", "tb = a + b / 2", "print(tb)"], a: 2, why: "Thiếu ngoặc: phải là (a + b) / 2." },
    { q: "abs(-7) bằng?", o: ["-7", "7", "0", "49"], a: 1, why: "Giá trị tuyệt đối." },
  ],
};
