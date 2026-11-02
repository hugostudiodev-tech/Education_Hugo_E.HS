// Step 6 — Toán tử số học: chia nguyên, chia lấy dư, luỹ thừa.
export default {
  id: "py6",
  lang: "python",
  file: "so_lop/toan_tu.py",
  duration: "45 phút",
  summary: "Dùng đủ bảy toán tử số học + − * / // % **, hiểu khác biệt giữa / và //, dùng % để kiểm tra chẵn lẻ và chia nhóm.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Bảy toán tử số học của Python.
- **/** và **//** khác nhau thế nào.
- **%** (chia lấy dư): chẵn lẻ, chia nhóm, đổi phút ra giờ.
- **\\*\\*** luỹ thừa.`,
    },
    {
      section: "visual",
      title: "Chia kẹo cho cả nhóm",
      body: "Có 23 cái kẹo chia đều cho 5 bạn. Mỗi bạn được mấy cái, còn dư mấy cái? Chạy để xem `//` và `%` trả lời.",
      py: { code: 'keo = 23\nban = 5\nprint("Mỗi bạn:", keo // ban)\nprint("Còn dư:", keo % ban)\nprint("Chia thường:", keo / ban)' },
    },
    {
      section: "research",
      title: "Phép chia có dư — từ lớp 3 tới máy tính",
      body: `Với hai số nguyên a và b (b > 0), luôn có duy nhất **thương q** và **số dư r** sao cho:

**a = b × q + r**, với 0 ≤ r < b.

Đây là **định lý chia có dư** (Euclid). Python làm đúng như vậy: \`a // b\` cho q, \`a % b\` cho r. Phép chia lấy dư có mặt khắp nơi: đồng hồ (giờ quay vòng 12), lịch (thứ quay vòng 7), mã kiểm tra số thẻ…

> Python Software Foundation (n.d.) *Expressions: Binary arithmetic operations*. Available at: https://docs.python.org/3/reference/expressions.html#binary-arithmetic-operations`,
    },
    {
      section: "ideate",
      title: "Sổ Lớp cần tính gì",
      body: `- 40 bạn xếp thành nhóm 6 người: được mấy nhóm đủ, mấy bạn lẻ? → \`//\` và \`%\`
- Số thứ tự chẵn ngồi dãy trái, lẻ ngồi dãy phải → \`% 2\`
- Giờ học 135 phút là mấy giờ mấy phút? → \`// 60\` và \`% 60\`
- Quỹ lớp gửi tiết kiệm 3 năm lãi kép → \`**\``,
    },
    {
      section: "core",
      title: "Bảng toán tử",
      body: `| Toán tử | Ý nghĩa | Ví dụ | Kết quả |
|---|---|---|---|
| + | cộng | 7 + 2 | 9 |
| − | trừ | 7 - 2 | 5 |
| * | nhân | 7 * 2 | 14 |
| / | chia (luôn ra float) | 7 / 2 | 3.5 |
| // | chia lấy phần nguyên | 7 // 2 | 3 |
| % | chia lấy dư | 7 % 2 | 1 |
| ** | luỹ thừa | 7 ** 2 | 49 |`,
    },
    {
      section: "core",
      title: "% để kiểm tra chẵn lẻ và chia hết",
      body: `- \`n % 2 == 0\` → n chẵn.
- \`n % 3 == 0\` → n chia hết cho 3.
- \`n % 10\` → chữ số hàng đơn vị của n.
- \`n // 10\` → bỏ chữ số cuối.`,
      py: { code: 'n = 2026\nprint("Dư khi chia 2:", n % 2)\nprint("Chữ số cuối:", n % 10)\nprint("Bỏ số cuối:", n // 10)' },
    },
    {
      section: "core",
      title: "Đổi phút ra giờ",
      body: "Mẫu \"chia lấy nguyên + chia lấy dư\" dùng để đổi đơn vị: phút → giờ, giây → phút, đồng → nghìn.",
      py: { code: 'phut = 135\nprint(phut // 60, "giờ", phut % 60, "phút")' },
    },
    {
      section: "core",
      title: "Luỹ thừa và số rất lớn",
      body: `\`2 ** 10\` = 1024. Số nguyên trong Python **không giới hạn độ lớn** — \`2 ** 100\` vẫn in đầy đủ, điều nhiều ngôn ngữ khác không làm được.

Luỹ thừa với số mũ 0.5 là **căn bậc hai**: \`16 ** 0.5\` = 4.0.`,
      py: { code: "print(2 ** 10)\nprint(2 ** 100)\nprint(16 ** 0.5)" },
    },
    {
      section: "apply",
      title: "Bài tập: chia nhóm",
      body: `Nhập sĩ số và số người mỗi nhóm. In ra:

~~~
Số nhóm đủ: 6
Bạn lẻ: 4
~~~`,
      py: {
        code: "si_so = int(input())\nmoi_nhom = int(input())\n",
        stdin: "40\n6",
        solution: 'si_so = int(input())\nmoi_nhom = int(input())\nprint("Số nhóm đủ:", si_so // moi_nhom)\nprint("Bạn lẻ:", si_so % moi_nhom)',
        hints: ["Số nhóm đủ: si_so // moi_nhom.", "Bạn lẻ: si_so % moi_nhom."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: thời lượng buổi học",
      body: "Nhập tổng số **giây** của một video bài giảng. In dạng `1 giờ 2 phút 5 giây` (với 3725 giây).",
      py: {
        code: "giay = int(input())\n",
        stdin: "3725",
        solution: 'giay = int(input())\nprint(giay // 3600, "giờ", giay % 3600 // 60, "phút", giay % 60, "giây")',
        hints: ["Giờ: giay // 3600. Giây lẻ: giay % 60.", "Phút: lấy phần dư sau khi bỏ giờ (giay % 3600) rồi // 60."],
      },
    },
  ],
  quiz: [
    { q: "17 // 5 bằng?", o: ["3", "3.4", "2", "4"], a: 0, why: "Lấy phần nguyên của 3.4." },
    { q: "17 % 5 bằng?", o: ["3", "2", "0", "3.4"], a: 1, why: "17 = 5 × 3 + 2." },
    { q: "8 / 2 bằng?", o: ["4", "4.0", "\"4\"", "Báo lỗi"], a: 1, why: "/ luôn ra float." },
    { q: "2 ** 3 bằng?", o: ["6", "8", "9", "5"], a: 1, why: "2 × 2 × 2." },
    { kind: "truefalse", q: "n % 2 == 1 nghĩa là n là số lẻ (với n ≥ 0).", a: true, why: "Chia 2 dư 1 là số lẻ." },
    { kind: "match", q: "Nối biểu thức với kết quả.", pairs: [["9 // 2", "4"], ["9 % 2", "1"], ["9 / 2", "4.5"], ["9 ** 0.5", "3.0"]], why: "Bốn toán tử dễ nhầm." },
    { q: "Chữ số hàng đơn vị của n lấy bằng?", o: ["n // 10", "n % 10", "n / 10", "n ** 10"], a: 1, why: "Phần dư khi chia 10." },
    { q: "150 phút là?", o: ["1 giờ 50 phút", "2 giờ 30 phút", "2 giờ 50 phút", "1 giờ 30 phút"], a: 1, why: "150 // 60 = 2, 150 % 60 = 30." },
    { kind: "bug", q: "Dòng nào cho kết quả SAI ý định \"chia đều 25 kẹo cho 4 bạn, mỗi bạn bao nhiêu cái nguyên\"?", lines: ["keo = 25", "ban = 4", "moi_ban = keo / ban", "print(moi_ban)"], a: 2, why: "/ ra 6.25 — kẹo không cắt được, phải dùng //." },
    { kind: "truefalse", q: "Python in được đầy đủ 2 ** 100.", a: true, why: "Số nguyên Python không giới hạn độ lớn." },
  ],
};
