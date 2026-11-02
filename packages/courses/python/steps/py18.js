// Step 18 — break, continue và vòng lặp vô hạn có chủ đích.
export default {
  id: "py18",
  lang: "python",
  file: "so_lop/break_continue.py",
  duration: "40 phút",
  summary: "Thoát vòng lặp sớm bằng break, bỏ qua một lượt bằng continue, dùng while True + break cho menu, và biết else của vòng lặp.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **break**: thoát khỏi vòng lặp ngay.
- **continue**: bỏ qua phần còn lại của lượt này.
- **while True** + break: vòng lặp có chủ đích.
- Ứng dụng: menu Sổ Lớp, tìm kiếm.`,
    },
    {
      section: "visual",
      title: "Tìm bạn đầu tiên bị điểm dưới 5",
      body: "Tìm thấy rồi thì dừng — không cần xem tiếp. Đó là việc của break.",
      py: { code: 'diem = "8 7 4 9 3"\nfor d in diem.split():\n    print("Xem điểm", d)\n    if int(d) < 5:\n        print("Tìm thấy:", d)\n        break' },
    },
    {
      section: "research",
      title: "Tranh cãi về break",
      body: `Năm 1968, **Edsger Dijkstra** viết bức thư nổi tiếng *"Go To Statement Considered Harmful"*, khởi đầu phong trào **lập trình có cấu trúc**: chương trình nên có luồng rõ ràng, một lối vào, một lối ra.

break và continue là những "bước nhảy" có kiểm soát: dùng **vừa phải** thì code gọn hơn; lạm dụng thì luồng chạy rối như mì. Quy tắc thực dụng: vòng lặp ngắn, mục đích rõ thì dùng thoải mái.

> Dijkstra, E.W. (1968) 'Go To Statement Considered Harmful', *Communications of the ACM*, 11(3), pp. 147–148.`,
    },
    {
      section: "ideate",
      title: "Menu cho Sổ Lớp",
      body: `Chương trình thật thường chạy **đến khi người dùng chọn thoát**:

~~~
1. Nhập điểm
2. Xem quỹ
0. Thoát
~~~

Không biết người dùng bấm mấy lần → \`while True\`, gặp lựa chọn 0 → \`break\`.`,
    },
    {
      section: "core",
      title: "continue",
      body: "Bỏ qua phần còn lại của **lượt hiện tại**, nhảy sang lượt kế tiếp. Ví dụ: chỉ in số lẻ.",
      py: { code: "for i in range(1, 10):\n    if i % 2 == 0:\n        continue\n    print(i, end=\" \")" },
    },
    {
      section: "core",
      title: "while True + break",
      body: "Ô Dữ liệu nhập mô phỏng người dùng chọn 1, 2 rồi 0.",
      py: { code: 'while True:\n    chon = input("Chọn (1/2/0): ")\n    if chon == "0":\n        print("Tạm biệt")\n        break\n    elif chon == "1":\n        print("-> Nhập điểm")\n    elif chon == "2":\n        print("-> Xem quỹ")\n    else:\n        print("Không hiểu lựa chọn")', stdin: "1\n2\n9\n0" },
    },
    {
      section: "core",
      title: "else của vòng lặp",
      body: "Python có một tính năng ít ngôn ngữ có: khối **else** sau for/while chạy khi vòng lặp kết thúc **không bị break**. Rất hợp cho tìm kiếm \"không thấy\".",
      py: { code: 'for d in [8, 7, 9]:\n    if d < 5:\n        print("Có điểm dưới 5")\n        break\nelse:\n    print("Không ai dưới 5")' },
    },
    {
      section: "apply",
      title: "Bài tập: cộng tới khi gặp 0",
      body: "Người dùng nhập lần lượt các khoản nộp quỹ (số nguyên), nhập **0** là kết thúc. In tổng, dạng `Tổng: 70000`.",
      py: {
        code: "tong = 0\n",
        stdin: "20000\n30000\n20000\n0",
        solution: 'tong = 0\nwhile True:\n    x = int(input())\n    if x == 0:\n        break\n    tong += x\nprint(f"Tổng: {tong}")',
        hints: ["while True: đọc x = int(input()).", "if x == 0: break, nếu không thì tong += x."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: số nguyên tố",
      body: "Nhập n (n ≥ 2). In `Nguyên tố` nếu n không chia hết cho số nào từ 2 tới n − 1, ngược lại `Hợp số`. Dùng **for … else**.",
      py: {
        code: "n = int(input())\n",
        stdin: "37",
        solution: 'n = int(input())\nfor d in range(2, n):\n    if n % d == 0:\n        print("Hợp số")\n        break\nelse:\n    print("Nguyên tố")',
        hints: ["Gặp ước d thì in Hợp số và break.", "else của for chạy khi không break → Nguyên tố."],
      },
    },
  ],
  quiz: [
    { q: "break làm gì?", o: ["Bỏ qua lượt hiện tại", "Thoát vòng lặp ngay", "Dừng chương trình", "Lặp lại từ đầu"], a: 1, why: "Thoát khỏi vòng lặp gần nhất." },
    { q: "continue làm gì?", o: ["Thoát vòng lặp", "Bỏ phần còn lại của lượt, sang lượt kế", "Tạm dừng 1 giây", "Không làm gì"], a: 1, why: "Nhảy sang lượt kế." },
    { q: "for i in range(5): if i == 3: break; print(i) — in những số nào?", o: ["0 1 2", "0 1 2 3", "3 4", "0 1 2 4"], a: 0, why: "Gặp 3 thì thoát trước khi in." },
    { q: "Như trên nhưng thay break bằng continue — in?", o: ["0 1 2", "0 1 2 4", "3", "0 1 2 3 4"], a: 1, why: "Bỏ riêng số 3." },
    { kind: "truefalse", q: "else của vòng for chạy khi vòng lặp bị break.", a: false, why: "Chạy khi KHÔNG bị break." },
    { kind: "truefalse", q: "while True: không có break sẽ chạy mãi.", a: true, why: "Điều kiện luôn đúng." },
    { q: "Ai viết \"Go To Statement Considered Harmful\"?", o: ["Edsger Dijkstra", "Alan Turing", "Donald Knuth", "Guido van Rossum"], a: 0, why: "Dijkstra, 1968." },
    { kind: "bug", q: "Menu không bao giờ thoát. Dòng nào sai?", lines: ["while True:", "    c = input()", "    if c == 0:", "        break"], a: 2, why: "input() trả xâu; phải so c == \"0\"." },
    { q: "Số nào là nguyên tố?", o: ["21", "27", "29", "33"], a: 2, why: "29 không có ước trong 2..28." },
    { kind: "multi", q: "Khi nào hợp lý dùng while True + break?", o: ["Menu chạy tới khi chọn thoát", "Đọc dữ liệu tới khi gặp 0", "In đúng 10 số", "Hỏi lại tới khi nhập đúng"], a: [0, 1, 3], why: "In 10 số dùng for." },
  ],
};
