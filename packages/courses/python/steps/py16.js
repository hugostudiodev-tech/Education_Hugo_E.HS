// Step 16 — for và range(): lặp đúng số lần.
export default {
  id: "py16",
  lang: "python",
  file: "so_lop/for_range.py",
  duration: "45 phút",
  summary: "Dùng for với range(n), range(a, b) và range(a, b, buoc); hiểu biến chạy; lặp qua từng ký tự của xâu.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Vòng lặp **for** — làm lại một việc nhiều lần.
- **range()** với 1, 2, 3 tham số.
- **Biến chạy** đổi giá trị mỗi vòng.
- Lặp qua từng **ký tự** của xâu.`,
    },
    {
      section: "visual",
      title: "Điểm danh 5 bạn — viết 1 lần",
      body: "Không cần 5 lệnh print. Vòng lặp chạy khối lệnh bên trong **5 lần**, mỗi lần i nhận một giá trị mới.",
      py: { code: 'for i in range(1, 6):\n    print("Gọi bạn số", i)\nprint("Điểm danh xong")' },
    },
    {
      section: "research",
      title: "Nguyên tắc DRY",
      body: `**DRY — Don't Repeat Yourself** (Đừng lặp lại chính mình) là nguyên tắc được Andy Hunt và Dave Thomas phổ biến trong *The Pragmatic Programmer* (1999): mỗi hiểu biết chỉ nên có **một** chỗ thể hiện trong hệ thống.

Chép một dòng 40 lần là vi phạm DRY: sửa một chỗ phải sửa 40 chỗ. Vòng lặp là công cụ đầu tiên giúp bạn giữ DRY.

> Hunt, A. and Thomas, D. (1999) *The Pragmatic Programmer*. Reading, MA: Addison-Wesley.`,
    },
    {
      section: "ideate",
      title: "Những việc lặp trong Sổ Lớp",
      body: `- In số thứ tự 1 → 40.
- In bảng cửu chương.
- Đếm ngược số ngày tới kỳ thi.
- Cộng dồn tiền quỹ qua 12 tháng.

Câu hỏi then chốt: **lặp mấy lần?** Biết trước số lần → dùng **for**. Chưa biết → **while** (step sau).`,
    },
    {
      section: "core",
      title: "range() với 1, 2, 3 tham số",
      body: `| Viết | Sinh ra |
|---|---|
| range(5) | 0, 1, 2, 3, 4 |
| range(1, 6) | 1, 2, 3, 4, 5 |
| range(0, 10, 2) | 0, 2, 4, 6, 8 |
| range(10, 0, -1) | 10, 9, …, 1 |

**Điểm cuối không được tính** — range(1, 6) dừng ở 5.`,
      py: { code: "print(list(range(5)))\nprint(list(range(1, 6)))\nprint(list(range(0, 10, 2)))\nprint(list(range(10, 0, -3)))" },
    },
    {
      section: "core",
      title: "Lặp qua xâu",
      body: "for đi qua **từng phần tử** của bất cứ thứ gì có thứ tự — xâu là dãy ký tự. Chặng 5 sẽ lặp qua danh sách.",
      py: { code: 'for kt in "10A1":\n    print(kt)' },
    },
    {
      section: "core",
      title: "print(end=…) — in trên một dòng",
      body: "Mặc định print xuống dòng. Đặt `end=\" \"` để in nối tiếp trên cùng một dòng.",
      py: { code: 'for i in range(1, 11):\n    print(i, end=" ")\nprint()\nprint("Hết")' },
    },
    {
      section: "apply",
      title: "Bài tập: số thứ tự",
      body: "Nhập sĩ số n. In các số từ 1 đến n, **mỗi số một dòng**.",
      py: {
        code: "n = int(input())\n",
        stdin: "7",
        solution: "n = int(input())\nfor i in range(1, n + 1):\n    print(i)",
        hints: ["Điểm cuối không được tính, nên dùng n + 1.", "for i in range(1, n + 1): print(i)"],
      },
    },
    {
      section: "apply",
      title: "Bài tập: đếm ngược ngày thi",
      body: "Nhập số ngày còn lại n. In đếm ngược `Còn n ngày`, …, `Còn 1 ngày`, rồi dòng cuối `Thi thôi!`.",
      py: {
        code: "n = int(input())\n",
        stdin: "3",
        solution: 'n = int(input())\nfor i in range(n, 0, -1):\n    print(f"Còn {i} ngày")\nprint("Thi thôi!")',
        hints: ["Đếm lùi: range(n, 0, -1).", "Dòng \"Thi thôi!\" nằm ngoài vòng lặp."],
      },
    },
  ],
  quiz: [
    { q: "range(4) sinh ra?", o: ["1, 2, 3, 4", "0, 1, 2, 3", "0, 1, 2, 3, 4", "4"], a: 1, why: "Bắt đầu từ 0, không tính 4." },
    { q: "range(2, 8, 2) sinh ra?", o: ["2, 4, 6", "2, 4, 6, 8", "2, 3, 4, 5, 6, 7", "8, 6, 4, 2"], a: 0, why: "8 không được tính." },
    { q: "Vòng for i in range(10): chạy mấy lần?", o: ["9", "10", "11", "0"], a: 1, why: "i từ 0 tới 9." },
    { kind: "truefalse", q: "for có thể lặp qua từng ký tự của một xâu.", a: true, why: "Xâu là dãy ký tự." },
    { q: "Để in các số trên cùng một dòng dùng?", o: ["print(i, end=\" \")", "print(i, line=0)", "println(i)", "print(i); "], a: 0, why: "Tham số end thay cho ký tự xuống dòng." },
    { q: "DRY nghĩa là?", o: ["Code phải khô khan", "Đừng lặp lại chính mình", "Debug Rồi Yên tâm", "Dữ liệu Rất Yếu"], a: 1, why: "Don't Repeat Yourself." },
    { kind: "bug", q: "Muốn in 1 đến 5, dòng nào sai?", lines: ["for i in range(1, 5):", "    print(i)", "print(\"xong\")"], a: 0, why: "Thiếu số 5 — phải range(1, 6)." },
    { kind: "match", q: "Nối range với dãy.", pairs: [["range(3)", "0 1 2"], ["range(1, 4)", "1 2 3"], ["range(3, 0, -1)", "3 2 1"]], why: "Ba dạng range." },
    { q: "Biết trước số lần lặp thì nên dùng?", o: ["for", "while", "if", "elif"], a: 0, why: "while cho số lần chưa biết." },
    { q: "len(list(range(0, 20, 5))) bằng?", o: ["4", "5", "20", "3"], a: 0, why: "0, 5, 10, 15." },
  ],
};
