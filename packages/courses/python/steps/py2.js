// Step 2 — Biến: đặt tên cho dữ liệu.
export default {
  id: "py2",
  lang: "python",
  file: "so_lop/bien.py",
  duration: "45 phút",
  summary: "Tạo biến bằng phép gán, đặt tên biến đúng luật và dễ đọc, cập nhật giá trị của biến và hiểu dấu = trong Python không phải dấu bằng của toán.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **Biến** là gì và vì sao chương trình cần nó.
- **Phép gán** với dấu \`=\`.
- Luật **đặt tên biến** và cách đặt tên dễ đọc.
- **Cập nhật** giá trị: \`diem = diem + 1\`.`,
    },
    {
      section: "visual",
      title: "Biến là một chiếc hộp có nhãn",
      body: `Hình dung một chiếc hộp dán nhãn **si_so**, bên trong để số **40**.

~~~python
si_so = 40
~~~

- Nhãn là **tên biến**: \`si_so\`.
- Thứ bên trong là **giá trị**: \`40\`.
- Muốn dùng giá trị, chỉ cần gọi tên hộp — Python tự mở hộp lấy ra.`,
    },
    {
      section: "visual",
      title: "Thử ngay",
      body: "Tạo hai biến rồi in chúng ra. Đổi giá trị ở dòng đầu, chạy lại: mọi chỗ dùng biến đều đổi theo.",
      py: { code: 'ten_lop = "10A1"\nsi_so = 40\nprint("Lớp", ten_lop, "có", si_so, "học sinh")' },
    },
    {
      section: "research",
      title: "Vì sao không viết thẳng số 40?",
      body: `Tưởng tượng số 40 xuất hiện ở 15 chỗ trong chương trình. Một bạn chuyển trường — bạn phải sửa 15 chỗ, và chỉ cần quên một chỗ là kết quả sai.

Với biến, bạn chỉ sửa **một dòng**: \`si_so = 39\`. Lập trình viên gọi những con số viết thẳng, không tên tuổi là **"số ma thuật"** (magic number) — một thói quen nên tránh.`,
    },
    {
      section: "ideate",
      title: "Sổ Lớp cần nhớ những gì",
      body: `Trước khi viết code, liệt kê những thông tin chương trình cần **nhớ**:

- Tên lớp, sĩ số, tên giáo viên chủ nhiệm.
- Điểm từng môn của từng bạn.
- Số tiền quỹ lớp hiện có.

Mỗi thông tin như vậy sẽ là một biến (sau này là cả danh sách biến). Đặt tên tốt ngay từ đầu giúp bạn đọc lại code sau một tháng vẫn hiểu.`,
    },
    {
      section: "core",
      title: "Phép gán",
      body: `~~~python
diem_toan = 8.5
~~~

Đọc là: **"gán 8.5 cho diem_toan"**, không đọc là "diem_toan bằng 8.5".

Python làm theo hai bước:
1. Tính **vế phải** của dấu \`=\`.
2. Cất kết quả vào biến ở **vế trái**.

Vì vậy vế trái luôn phải là **tên biến** — viết \`8.5 = diem_toan\` sẽ báo lỗi.`,
    },
    {
      section: "core",
      title: "Luật đặt tên biến",
      body: `Tên biến **hợp lệ** khi:

- Chỉ gồm chữ cái, chữ số và dấu gạch dưới \`_\`.
- **Không bắt đầu bằng chữ số**: \`10a1\` sai, \`lop_10a1\` đúng.
- Không trùng từ khoá của Python như \`if\`, \`for\`, \`print\`… (print không cấm, nhưng đặt trùng sẽ "đè" mất lệnh print).
- **Phân biệt hoa thường**: \`Diem\` và \`diem\` là hai biến khác nhau.

Quy ước của Python (PEP 8): viết thường, nối từ bằng \`_\` — \`diem_trung_binh\`. Tránh chữ có dấu như \`điểm\` cho đỡ rắc rối khi gõ.`,
    },
    {
      section: "core",
      title: "Gán lại và cập nhật",
      body: `Biến **thay được** giá trị — đó là lý do nó tên là *biến*. Giá trị cũ bị thay hẳn.

Dòng \`quy = quy + 20000\` trông vô lý nếu đọc như toán, nhưng theo hai bước của phép gán thì rất rõ: tính \`quy + 20000\` trước, rồi cất kết quả lại vào \`quy\`.`,
      py: { code: 'quy = 500000\nprint("Đầu tuần:", quy)\nquy = quy + 20000   # bạn Lan nộp quỹ\nprint("Sau khi Lan nộp:", quy)\nquy = quy - 150000  # mua phấn, giấy\nprint("Cuối tuần:", quy)' },
    },
    {
      section: "core",
      title: "Viết tắt: += và -=",
      body: `\`quy += 20000\` là cách viết gọn của \`quy = quy + 20000\`. Tương tự có \`-=\`, \`*=\`, \`/=\`.

~~~python
luot_xem = 0
luot_xem += 1
luot_xem += 1
print(luot_xem)   # 2
~~~`,
    },
    {
      section: "core",
      title: "Gán nhiều biến một lúc",
      body: "Python cho gán nhiều biến trên một dòng, và có mẹo **đổi chỗ** hai biến không cần biến tạm.",
      py: { code: 'toan, van = 8, 7\nprint("Toán:", toan, "- Văn:", van)\ntoan, van = van, toan   # đổi chỗ\nprint("Toán:", toan, "- Văn:", van)' },
    },
    {
      section: "apply",
      title: "Bài tập: thông tin lớp",
      body: `Tạo ba biến \`ten_lop\` = \`"10A1"\`, \`si_so\` = \`40\`, \`gvcn\` = \`"cô Hạnh"\`, rồi in đúng hai dòng:

~~~
Lớp 10A1 - sĩ số 40
Chủ nhiệm: cô Hạnh
~~~

Hãy **dùng biến** trong print, đừng gõ lại chữ.`,
      py: {
        code: "# tạo ba biến rồi in\n",
        solution: 'ten_lop = "10A1"\nsi_so = 40\ngvcn = "cô Hạnh"\nprint("Lớp", ten_lop, "- sĩ số", si_so)\nprint("Chủ nhiệm:", gvcn)',
        hints: ["print(\"Lớp\", ten_lop, \"- sĩ số\", si_so) — dấu phẩy tự chèn dấu cách.", "Dòng hai: print(\"Chủ nhiệm:\", gvcn)."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: sổ quỹ một tuần",
      body: `Quỹ lớp đầu tuần có **300000** đồng. Trong tuần: 5 bạn nộp, mỗi bạn **20000**; lớp chi **85000** mua hoa 20/11.

Dùng một biến \`quy\` và các phép cập nhật, cuối cùng in: \`Quỹ còn: 315000\``,
      py: {
        code: "quy = 300000\n",
        solution: 'quy = 300000\nquy += 5 * 20000\nquy -= 85000\nprint("Quỹ còn:", quy)',
        hints: ["5 bạn nộp: quy += 5 * 20000", "Chi tiền: quy -= 85000, rồi print(\"Quỹ còn:\", quy)."],
      },
    },
  ],
  quiz: [
    { q: "Sau hai dòng x = 5 rồi x = 9, x bằng bao nhiêu?", o: ["5", "9", "14", "Báo lỗi"], a: 1, why: "Gán lại thay hẳn giá trị cũ." },
    { q: "Tên biến nào HỢP LỆ?", o: ["10a1", "diem toan", "diem_toan", "for"], a: 2, why: "Không bắt đầu bằng số, không có dấu cách, không trùng từ khoá." },
    { q: "n = 3, rồi n = n * 2 + 1. n bằng?", o: ["3", "6", "7", "9"], a: 2, why: "Tính vế phải trước: 3 * 2 + 1 = 7, rồi cất vào n." },
    { kind: "truefalse", q: "Trong Python, Diem và diem là cùng một biến.", a: false, why: "Python phân biệt chữ hoa và chữ thường." },
    { kind: "truefalse", q: "a += 3 có nghĩa giống a = a + 3.", a: true, why: "+= là cách viết gọn." },
    { kind: "bug", q: "Dòng gán biến nào báo lỗi?", lines: ["si_so = 40", "40 = si_so", "si_so += 1", "print(si_so)"], a: 1, why: "Vế trái của phép gán phải là tên biến, không phải một con số." },
    { q: "a, b = 1, 2 rồi a, b = b, a. Lúc này a và b là?", o: ["a = 1, b = 2", "a = 2, b = 1", "a = 2, b = 2", "Báo lỗi"], a: 1, why: "Vế phải được tính xong (2, 1) rồi mới gán lại — hai biến đổi chỗ." },
    { kind: "match", q: "Nối dòng lệnh với giá trị của q sau khi chạy (q ban đầu = 10).", pairs: [["q += 5", "15"], ["q -= 4", "6"], ["q *= 3", "30"], ["q = 0", "0"]], why: "Mỗi dòng chạy riêng từ q = 10." },
    { q: "Theo quy ước PEP 8, tên biến nên viết thế nào?", o: ["DiemTrungBinh", "diem_trung_binh", "DIEM-TRUNG-BINH", "diemtrungbinh!"], a: 1, why: "Chữ thường, nối từ bằng dấu gạch dưới." },
    { q: "Vì sao nên dùng biến si_so thay vì viết số 40 ở nhiều chỗ?", o: ["Chạy nhanh hơn", "Đổi sĩ số chỉ cần sửa một dòng", "Python bắt buộc", "Tốn ít bộ nhớ hơn"], a: 1, why: "Tránh \"số ma thuật\": một nguồn sự thật, sửa một chỗ." },
  ],
};
