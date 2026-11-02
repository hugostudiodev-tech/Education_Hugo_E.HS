// Step 19 — Vòng lặp lồng nhau: bảng cửu chương.
export default {
  id: "py19",
  lang: "python",
  file: "so_lop/cuu_chuong.py",
  duration: "45 phút",
  summary: "Đặt vòng lặp trong vòng lặp, đếm số lần chạy của thân trong, in bảng cửu chương và hình tam giác bằng ký tự.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Vòng lặp **lồng nhau**: ngoài chạy 1 lượt, trong chạy hết.
- Đếm số lần: ngoài m lượt × trong n lượt = **m × n**.
- In **bảng** và **hình** bằng ký tự.`,
    },
    {
      section: "visual",
      title: "Kim giờ và kim phút",
      body: "Kim giờ nhích 1 nấc thì kim phút quay **trọn một vòng**. Vòng ngoài là kim giờ, vòng trong là kim phút.",
      py: { code: 'for gio in range(1, 3):\n    for phut in (0, 15, 30, 45):\n        print(f"{gio}:{phut:02d}", end="  ")\n    print()' },
    },
    {
      section: "research",
      title: "Độ phức tạp O(n²)",
      body: `Hai vòng lặp lồng nhau, mỗi vòng chạy n lần → thân trong chạy **n²** lần. Với n = 40 học sinh là 1 600 lần — nhanh. Với n = 1 000 000 là **một nghìn tỉ** lần — chậm thấy rõ.

Các nhà khoa học máy tính ký hiệu điều này là **O(n²)** (đọc "O n bình phương"). Chặng 8 sẽ học cách đánh giá và chọn thuật toán nhanh hơn.

> Knuth, D.E. (1976) 'Big Omicron and big Omega and big Theta', *ACM SIGACT News*, 8(2), pp. 18–24.`,
    },
    {
      section: "ideate",
      title: "Bảng cửu chương cho em lớp 2",
      body: `Lớp bạn làm tặng thư viện một tờ bảng cửu chương. Cần:

- 9 hàng (số bị nhân 1..9) → vòng **ngoài**.
- Mỗi hàng 9 phép (số nhân 1..9) → vòng **trong**.
- Căn cột cho thẳng → f-string \`:>3\`.`,
    },
    {
      section: "core",
      title: "Cấu trúc lồng nhau",
      body: "Chú ý thụt lề: `print()` trống thuộc vòng **ngoài** để xuống dòng sau mỗi hàng.",
      py: { code: 'for i in range(1, 4):\n    for j in range(1, 4):\n        print(f"{i}x{j}={i*j:<3}", end=" ")\n    print()' },
    },
    {
      section: "core",
      title: "Vòng trong phụ thuộc vòng ngoài",
      body: "Vòng trong có thể dùng biến của vòng ngoài — ví dụ hàng thứ i in i ngôi sao.",
      py: { code: 'for i in range(1, 6):\n    print("*" * i)\nprint()\nfor i in range(1, 6):\n    for j in range(i):\n        print("*", end="")\n    print()' },
    },
    {
      section: "core",
      title: "Đếm số lần chạy",
      body: "Dự đoán trước: thân trong chạy bao nhiêu lần? Rồi chạy để kiểm tra.",
      py: { code: "dem = 0\nfor i in range(4):\n    for j in range(6):\n        dem += 1\nprint(dem)" },
    },
    {
      section: "apply",
      title: "Bài tập: bảng cửu chương",
      body: "Nhập n. In bảng nhân từ 1 đến n: hàng i gồm các tích `i*1 … i*n`, mỗi số rộng 4 ký tự căn phải (`:>4`), cuối hàng xuống dòng.",
      py: {
        code: "n = int(input())\n",
        stdin: "4",
        solution: 'n = int(input())\nfor i in range(1, n + 1):\n    for j in range(1, n + 1):\n        print(f"{i * j:>4}", end="")\n    print()',
        hints: ["Hai vòng range(1, n + 1).", "print(f\"{i * j:>4}\", end=\"\") trong vòng trong, print() ở vòng ngoài."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: tam giác số",
      body: `Nhập n. In tam giác, hàng i là các số từ 1 đến i cách nhau một dấu cách. Với n = 4:

~~~
1
1 2
1 2 3
1 2 3 4
~~~`,
      py: {
        code: "n = int(input())\n",
        stdin: "4",
        solution: 'n = int(input())\nfor i in range(1, n + 1):\n    for j in range(1, i + 1):\n        print(j, end=" ")\n    print()',
        hints: ["Vòng trong chạy tới i: range(1, i + 1).", "Khoảng trắng thừa cuối dòng không bị tính khi chấm."],
      },
    },
  ],
  quiz: [
    { q: "Ngoài 3 lượt, trong 5 lượt. Thân trong chạy mấy lần?", o: ["8", "15", "5", "3"], a: 1, why: "3 × 5." },
    { kind: "truefalse", q: "Mỗi lượt của vòng ngoài, vòng trong chạy trọn từ đầu.", a: true, why: "Như kim phút quay trọn vòng." },
    { q: "for i in range(3): print(\"#\" * i) — dòng thứ ba in?", o: ["###", "##", "#", "(trống)"], a: 1, why: "i = 0, 1, 2 → dòng ba là ##." },
    { q: "Hai vòng lồng nhau mỗi vòng n lượt có độ phức tạp?", o: ["O(n)", "O(n²)", "O(1)", "O(2n)"], a: 1, why: "n × n." },
    { kind: "bug", q: "Bảng in hết trên một dòng. Dòng nào thụt lề sai?", lines: ["for i in range(1, 4):", "    for j in range(1, 4):", "        print(i * j, end=\" \")", "        print()"], a: 3, why: "print() phải thuộc vòng ngoài (thụt 4)." },
    { q: "f\"{5:02d}\" cho ra?", o: ["5", "05", "50", "5.00"], a: 1, why: "Đệm số 0 cho đủ 2 chữ số." },
    { kind: "multi", q: "Bài nào cần vòng lặp lồng nhau?", o: ["Bảng cửu chương", "In hình tam giác sao", "Tính tổng 1..100", "So từng cặp học sinh với nhau"], a: [0, 1, 3], why: "Tổng 1..100 chỉ cần một vòng." },
    { q: "Vòng trong for j in range(i) với i = 0 chạy mấy lần?", o: ["0", "1", "i", "Báo lỗi"], a: 0, why: "range(0) rỗng." },
    { q: "Với n = 1 000, vòng lặp O(n²) chạy khoảng?", o: ["1 000", "1 000 000", "2 000", "1 tỉ"], a: 1, why: "1 000²." },
    { kind: "order", q: "Thứ tự in của for i in (1,2): for j in (\"a\",\"b\"): print(i, j)", items: ["1 a", "1 b", "2 a", "2 b"], a: [0, 1, 2, 3], why: "Vòng trong chạy hết trước khi ngoài tăng." },
  ],
};
