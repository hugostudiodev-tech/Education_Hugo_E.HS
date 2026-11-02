// Step 11 — So sánh và kiểu bool.
export default {
  id: "py11",
  lang: "python",
  file: "so_lop/so_sanh.py",
  duration: "40 phút",
  summary: "Dùng sáu toán tử so sánh, hiểu kết quả bool True/False, phân biệt = và ==, so sánh xâu và so sánh chuỗi kiểu 5 <= x <= 10.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Sáu toán tử so sánh: \`== != < > <= >=\`.
- Kết quả luôn là **bool**: True hoặc False.
- **=** (gán) khác **==** (so sánh).
- So sánh chuỗi: \`0 <= diem <= 10\`.`,
    },
    {
      section: "visual",
      title: "Hỏi máy một câu có/không",
      body: "Mỗi phép so sánh là một câu hỏi có/không. Python trả lời True (có) hoặc False (không).",
      py: { code: "diem = 7.5\nprint(diem >= 5)\nprint(diem == 10)\nprint(diem != 10)" },
    },
    {
      section: "research",
      title: "George Boole và đại số logic",
      body: `Kiểu **bool** mang tên **George Boole** (1815–1864), nhà toán học Anh đã xây dựng **đại số logic** — phép tính trên hai giá trị đúng/sai — trong cuốn *The Laws of Thought* (1854).

Gần một thế kỷ sau, Claude Shannon chỉ ra mạch điện bật/tắt thực hiện được đại số Boole — nền móng của mọi máy tính số ngày nay.

> Boole, G. (1854) *An Investigation of the Laws of Thought*. London: Walton and Maberly.`,
    },
    {
      section: "ideate",
      title: "Sổ Lớp cần hỏi những câu có/không nào",
      body: `- Điểm có hợp lệ không? (0 ≤ điểm ≤ 10)
- Bạn này đạt môn chưa? (ĐTB ≥ 5)
- Đã nộp quỹ chưa? (đã nộp == True)
- Có vắng quá số buổi cho phép không? (vắng > 5)

Mỗi câu là một biểu thức so sánh — step sau sẽ dùng chúng để rẽ nhánh.`,
    },
    {
      section: "core",
      title: "Sáu toán tử so sánh",
      body: `| Toán tử | Nghĩa | Ví dụ | Kết quả |
|---|---|---|---|
| == | bằng | 5 == 5 | True |
| != | khác | 5 != 3 | True |
| < | nhỏ hơn | 3 < 5 | True |
| > | lớn hơn | 3 > 5 | False |
| <= | nhỏ hơn hoặc bằng | 5 <= 5 | True |
| >= | lớn hơn hoặc bằng | 4 >= 5 | False |`,
    },
    {
      section: "core",
      title: "= và == là hai việc khác nhau",
      body: `- \`diem = 8\` — **gán**: cất 8 vào diem.
- \`diem == 8\` — **hỏi**: diem có bằng 8 không?

Nhầm hai dấu này là lỗi kinh điển của người mới. Viết \`if diem = 8:\` sẽ báo SyntaxError.`,
    },
    {
      section: "core",
      title: "So sánh chuỗi và so sánh xâu",
      body: `- Python cho viết **chuỗi so sánh** như toán: \`0 <= diem <= 10\`.
- Xâu so sánh theo **thứ tự từ điển** (theo mã Unicode): "An" < "Bảo".
- Chữ hoa khác chữ thường: "a" == "A" là False.`,
      py: { code: 'diem = 11\nprint(0 <= diem <= 10)\nprint("An" < "Bảo")\nprint("lan" == "Lan")\nprint("lan" == "Lan".lower())' },
    },
    {
      section: "core",
      title: "bool cũng là số",
      body: "True tính như 1, False như 0. Mẹo: cộng các bool để **đếm** bao nhiêu điều kiện đúng.",
      py: { code: "toan, van, anh = 8, 4.5, 6\nso_mon_dat = (toan >= 5) + (van >= 5) + (anh >= 5)\nprint(\"Số môn đạt:\", so_mon_dat)" },
    },
    {
      section: "apply",
      title: "Bài tập: điểm hợp lệ?",
      body: "Nhập một điểm (số thực). In `True` nếu điểm nằm trong khoảng 0 đến 10 (tính cả hai đầu), ngược lại `False`.",
      py: {
        code: "diem = float(input())\n",
        stdin: "10.5",
        solution: "diem = float(input())\nprint(0 <= diem <= 10)",
        hints: ["Dùng so sánh chuỗi.", "print(0 <= diem <= 10)"],
      },
    },
    {
      section: "apply",
      title: "Bài tập: đếm môn đạt",
      body: "Nhập điểm 4 môn (4 dòng). In số môn có điểm **từ 5 trở lên**, dạng `Đạt 3/4 môn`.",
      py: {
        code: "",
        stdin: "8\n4.5\n6\n5",
        solution: 'a = float(input())\nb = float(input())\nc = float(input())\nd = float(input())\ndat = (a >= 5) + (b >= 5) + (c >= 5) + (d >= 5)\nprint(f"Đạt {dat}/4 môn")',
        hints: ["Mỗi (diem >= 5) là True/False, cộng lại được số môn đạt.", "print(f\"Đạt {dat}/4 môn\")"],
      },
    },
  ],
  quiz: [
    { q: "7 >= 7 cho kết quả?", o: ["True", "False", "7", "Báo lỗi"], a: 0, why: "Bằng cũng thoả >=." },
    { q: "Dấu nào là so sánh bằng?", o: ["=", "==", "===", ":="], a: 1, why: "= là gán." },
    { q: "\"b\" > \"a\" cho kết quả?", o: ["True", "False", "Báo lỗi", "\"b\""], a: 0, why: "Thứ tự từ điển." },
    { kind: "truefalse", q: "\"Lan\" == \"lan\" là True.", a: false, why: "Phân biệt hoa thường." },
    { q: "True + True + False bằng?", o: ["2", "True", "1", "Báo lỗi"], a: 0, why: "True = 1, False = 0." },
    { q: "x = 15. 0 <= x <= 10 cho?", o: ["True", "False", "10", "Báo lỗi"], a: 1, why: "15 > 10." },
    { kind: "match", q: "Nối toán tử với nghĩa.", pairs: [["!=", "khác"], ["<=", "nhỏ hơn hoặc bằng"], ["==", "bằng"], [">", "lớn hơn"]], why: "Sáu toán tử so sánh." },
    { q: "Kiểu bool được đặt theo tên ai?", o: ["George Boole", "Alan Turing", "Ada Lovelace", "Blaise Pascal"], a: 0, why: "Đại số Boole, 1854." },
    { kind: "bug", q: "Dòng nào báo lỗi cú pháp?", lines: ["d = 8", "print(d == 8)", "if d = 8:", "print(d != 8)"], a: 2, why: "Trong if phải dùng ==." },
    { kind: "multi", q: "Biểu thức nào cho True?", o: ["3 != 4", "5 < 5", "2 <= 2", "\"A\" == \"a\""], a: [0, 2], why: "5 < 5 sai; hoa thường khác nhau." },
  ],
};
