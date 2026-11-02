// Step 17 — while: lặp tới khi đạt điều kiện.
export default {
  id: "py17",
  lang: "python",
  file: "so_lop/while.py",
  duration: "45 phút",
  summary: "Dùng while khi chưa biết trước số lần lặp, bảo đảm điều kiện dừng luôn đạt được, và dùng while để hỏi lại khi người dùng nhập sai.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **while**: lặp **chừng nào** điều kiện còn đúng.
- Ba phần của vòng while: **khởi tạo → kiểm tra → cập nhật**.
- Vòng lặp vô hạn và cách tránh.
- Hỏi lại cho đến khi nhập đúng.`,
    },
    {
      section: "visual",
      title: "Tiết kiệm mua máy tính",
      body: "Mỗi tuần để dành 150 nghìn. Bao nhiêu tuần thì đủ 2 triệu? Chưa biết trước số tuần → dùng while.",
      py: { code: 'tiet_kiem = 0\ntuan = 0\nwhile tiet_kiem < 2000000:\n    tiet_kiem += 150000\n    tuan += 1\nprint(f"Sau {tuan} tuần có {tiet_kiem:,} đ")' },
    },
    {
      section: "research",
      title: "Bài toán dừng",
      body: `Năm 1936, **Alan Turing** chứng minh: **không tồn tại** chương trình nào kiểm tra được mọi chương trình khác có dừng hay chạy mãi (*halting problem*).

Nghĩa là máy không thể tự bảo bạn "vòng while này sẽ không bao giờ dừng". Trách nhiệm đảm bảo điều kiện dừng là của **người viết code**. Ô code của khoá học tự ngắt sau vài giây — chương trình thật thì không.

> Turing, A.M. (1936) 'On computable numbers, with an application to the Entscheidungsproblem', *Proceedings of the London Mathematical Society*, s2-42(1), pp. 230–265.`,
    },
    {
      section: "ideate",
      title: "for hay while?",
      body: `| Tình huống | Chọn |
|---|---|
| In 40 số thứ tự | for |
| Hỏi lại tới khi nhập điểm hợp lệ | while |
| Cộng tiền 12 tháng | for |
| Bao nhiêu tuần thì đủ tiền | while |

Quy tắc: **biết số lần → for; biết điều kiện dừng → while**.`,
    },
    {
      section: "core",
      title: "Cú pháp và ba phần",
      body: `~~~python
i = 1              # 1. khởi tạo
while i <= 5:      # 2. kiểm tra
    print(i)
    i += 1         # 3. cập nhật
~~~

Thiếu bước **cập nhật** → điều kiện mãi đúng → **lặp vô hạn**.`,
    },
    {
      section: "core",
      title: "Vòng lặp vô hạn",
      body: "Cố ý sai: quên `i += 1`. Ô code sẽ tự ngắt sau vài giây và báo chạy quá lâu. Thêm dòng cập nhật để sửa.",
      py: { code: "i = 1\nwhile i <= 3:\n    print(i)" },
    },
    {
      section: "core",
      title: "Hỏi lại tới khi nhập đúng",
      body: "Mẫu rất hay dùng: hỏi, nếu sai thì hỏi lại. Ô Dữ liệu nhập có 3 lần trả lời — hai lần đầu sai.",
      py: { code: 'diem = float(input("Điểm (0-10): "))\nwhile not (0 <= diem <= 10):\n    print("Không hợp lệ, nhập lại")\n    diem = float(input("Điểm (0-10): "))\nprint("Đã ghi:", diem)', stdin: "12\n-1\n8.5" },
    },
    {
      section: "apply",
      title: "Bài tập: tiền đủ chưa",
      body: "Nhập **giá món đồ** và **số tiền để dành mỗi tuần** (số nguyên). In số tuần ít nhất cần để đủ tiền, dạng `Cần 14 tuần`.",
      py: {
        code: "gia = int(input())\nmoi_tuan = int(input())\n",
        stdin: "2000000\n150000",
        solution: 'gia = int(input())\nmoi_tuan = int(input())\ntien = 0\ntuan = 0\nwhile tien < gia:\n    tien += moi_tuan\n    tuan += 1\nprint(f"Cần {tuan} tuần")',
        hints: ["Hai biến đếm: tien = 0, tuan = 0.", "while tien < gia: cộng tiền và tăng tuần."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: tổng chữ số",
      body: "Nhập số nguyên dương n. Tính **tổng các chữ số** bằng while (dùng `% 10` và `// 10`). Với 2026 in `10`.",
      py: {
        code: "n = int(input())\n",
        stdin: "2026",
        solution: "n = int(input())\ntong = 0\nwhile n > 0:\n    tong += n % 10\n    n //= 10\nprint(tong)",
        hints: ["Chữ số cuối: n % 10; bỏ chữ số cuối: n //= 10.", "Lặp while n > 0."],
      },
    },
  ],
  quiz: [
    { q: "while lặp khi nào?", o: ["Đúng số lần cho trước", "Chừng nào điều kiện còn đúng", "Một lần duy nhất", "Khi điều kiện sai"], a: 1, why: "Kiểm tra trước mỗi vòng." },
    { q: "i = 0; while i < 3: i += 1. Cuối cùng i bằng?", o: ["2", "3", "4", "0"], a: 1, why: "Dừng khi i = 3." },
    { kind: "truefalse", q: "Quên cập nhật biến trong while có thể gây lặp vô hạn.", a: true, why: "Điều kiện mãi đúng." },
    { q: "Ai chứng minh bài toán dừng không giải được?", o: ["Alan Turing", "Guido van Rossum", "George Boole", "Ada Lovelace"], a: 0, why: "Turing, 1936." },
    { kind: "match", q: "Nối tình huống với vòng lặp.", pairs: [["In 40 số thứ tự", "for"], ["Hỏi lại tới khi nhập đúng", "while"]], why: "Biết số lần vs biết điều kiện dừng." },
    { kind: "bug", q: "Dòng nào thiếu khiến vòng lặp chạy mãi?", lines: ["n = 5", "while n > 0:", "    print(n)", "print(\"xong\")"], a: 2, why: "Sau print(n) phải có n -= 1 — khối lặp thiếu bước cập nhật." },
    { q: "Tổng chữ số của 507?", o: ["12", "57", "7", "13"], a: 0, why: "5 + 0 + 7." },
    { kind: "order", q: "Xếp ba phần của vòng while.", items: ["Khởi tạo", "Kiểm tra điều kiện", "Cập nhật"], a: [0, 1, 2], why: "Khởi tạo trước vòng, kiểm tra ở đầu, cập nhật trong thân." },
    { q: "n = 10; while n > 1: n //= 2. Cuối cùng n?", o: ["0", "1", "2", "5"], a: 1, why: "10 → 5 → 2 → 1." },
    { kind: "truefalse", q: "Thân vòng while có thể không chạy lần nào.", a: true, why: "Nếu điều kiện sai ngay từ đầu." },
  ],
};
