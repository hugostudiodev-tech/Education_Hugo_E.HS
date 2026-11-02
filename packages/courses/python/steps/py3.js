// Step 3 — Kiểu dữ liệu: int, float, str, bool.
export default {
  id: "py3",
  lang: "python",
  file: "so_lop/kieu_du_lieu.py",
  duration: "45 phút",
  summary: "Phân biệt bốn kiểu cơ bản int, float, str, bool; xem kiểu bằng type(); đổi kiểu bằng int(), float(), str(); và hiểu vì sao \"8\" + \"2\" ra 82.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Bốn kiểu dữ liệu cơ bản: **int**, **float**, **str**, **bool**.
- Xem kiểu của một giá trị bằng **type()**.
- **Đổi kiểu**: int(), float(), str().
- Vì sao cùng dấu \`+\` mà lúc cộng số, lúc nối chữ.`,
    },
    {
      section: "visual",
      title: "Cùng là \"8\", nhưng khác nhau",
      body: "Chạy thử. Dòng đầu cộng hai **số**, dòng sau nối hai **xâu chữ**. Với Python, `8` và `\"8\"` là hai thứ hoàn toàn khác nhau.",
      py: { code: 'print(8 + 2)\nprint("8" + "2")' },
    },
    {
      section: "visual",
      title: "Hỏi Python: đây là kiểu gì?",
      body: "**type()** cho biết kiểu của một giá trị. Thêm vài giá trị của riêng bạn vào để thử.",
      py: { code: 'print(type(40))\nprint(type(8.5))\nprint(type("10A1"))\nprint(type(True))' },
    },
    {
      section: "research",
      title: "Máy tính lưu mọi thứ bằng số",
      body: `Ở tầng thấp nhất, bộ nhớ chỉ chứa các bit 0 và 1. **Kiểu dữ liệu** cho Python biết phải *hiểu* dãy bit đó thế nào: là một số nguyên, một số có phần thập phân, hay một chuỗi ký tự.

Mỗi ký tự cũng được đánh số theo bảng mã **Unicode** — chữ \`A\` là 65, chữ \`ạ\` là 7841. Nhờ Unicode, Python viết được tiếng Việt, tiếng Trung hay cả biểu tượng toán học.

> Python Software Foundation (2025) *Built-in Types*. Available at: https://docs.python.org/3/library/stdtypes.html`,
    },
    {
      section: "ideate",
      title: "Mỗi thông tin của Sổ Lớp là kiểu gì?",
      body: `| Thông tin | Ví dụ | Kiểu |
|---|---|---|
| Sĩ số | 40 | int |
| Điểm Toán | 8.5 | float |
| Tên học sinh | "Minh Anh" | str |
| Đã nộp quỹ chưa | True | bool |
| Số điện thoại | "0901234567" | str — không phải int! |

Số điện thoại là **str** vì ta không cộng trừ nó, và số 0 ở đầu phải được giữ lại.`,
    },
    {
      section: "core",
      title: "int và float",
      body: `- **int** (integer): số nguyên — \`40\`, \`-3\`, \`0\`.
- **float**: số thực, có dấu chấm thập phân — \`8.5\`, \`-0.25\`, \`7.0\`.

Python dùng **dấu chấm**, không dùng dấu phẩy: viết \`8.5\` chứ không viết \`8,5\` (dấu phẩy để ngăn các giá trị).

Phép chia \`/\` luôn ra float: \`10 / 2\` cho \`5.0\`.`,
    },
    {
      section: "core",
      title: "str — xâu ký tự",
      body: `Xâu nằm trong ngoặc kép hoặc ngoặc đơn. Hai phép hay dùng:

- \`+\` **nối** hai xâu.
- \`*\` **lặp** xâu nhiều lần.
- **len()** đếm số ký tự.`,
      py: { code: 'ho = "Nguyễn"\nten = "Minh Anh"\nprint(ho + " " + ten)\nprint("=" * 20)\nprint(len(ten))' },
    },
    {
      section: "core",
      title: "bool — đúng hay sai",
      body: `**bool** chỉ có hai giá trị: \`True\` và \`False\` (viết hoa chữ đầu). Phép so sánh luôn cho ra bool:

~~~python
print(8.5 >= 8)   # True
print(40 == 41)   # False
~~~

Chặng 3 sẽ dùng bool để chương trình tự rẽ nhánh: giỏi hay khá, đủ hay thiếu.`,
    },
    {
      section: "core",
      title: "Đổi kiểu",
      body: `- **int("40")** → \`40\` (xâu thành số nguyên)
- **float("8.5")** → \`8.5\`
- **str(40)** → \`"40"\` (số thành xâu, để nối với chữ)
- **int(8.9)** → \`8\` — cắt bỏ phần thập phân, **không làm tròn**!

Chạy ô bên dưới, rồi thử \`int("tám")\` để xem Python phản ứng ra sao.`,
      py: { code: 'diem = "8"\nprint(int(diem) + 2)\nprint("Điểm: " + str(9))\nprint(int(8.9))' },
    },
    {
      section: "core",
      title: "Lỗi kiểu kinh điển",
      body: `Cố ý sai: nối xâu với số sẽ báo **TypeError**. Chạy để thấy lỗi, rồi sửa bằng **str()** hoặc dùng dấu phẩy trong print.`,
      py: { code: 'si_so = 40\nprint("Sĩ số: " + si_so)' },
    },
    {
      section: "apply",
      title: "Bài tập: nối cho đúng",
      body: `Cho \`ho = "Trần"\`, \`ten = "Bảo"\`, \`tuoi = 16\`. In ra **đúng** dòng sau bằng phép nối \`+\` (không dùng dấu phẩy):

~~~
Trần Bảo - 16 tuổi
~~~`,
      py: {
        code: 'ho = "Trần"\nten = "Bảo"\ntuoi = 16\n',
        solution: 'ho = "Trần"\nten = "Bảo"\ntuoi = 16\nprint(ho + " " + ten + " - " + str(tuoi) + " tuổi")',
        hints: ["Đừng quên dấu cách: ho + \" \" + ten.", "tuoi là int, phải đổi: str(tuoi)."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: cộng điểm cộng",
      body: `Điểm Tin của bạn lưu dạng xâu \`"7.5"\` (đọc từ một tệp). Thầy cộng **1.5** điểm thưởng. In ra \`9.0\`.`,
      py: {
        code: 'diem = "7.5"\n',
        solution: 'diem = "7.5"\nprint(float(diem) + 1.5)',
        hints: ["\"7.5\" là xâu — cộng với số sẽ lỗi.", "Dùng float(diem) vì điểm có phần thập phân."],
      },
    },
  ],
  quiz: [
    { q: "type(8.0) là kiểu gì?", o: ["int", "float", "str", "bool"], a: 1, why: "Có dấu chấm thập phân là float, dù phần lẻ bằng 0." },
    { q: "\"5\" + \"5\" cho kết quả?", o: ["10", "55", "\"5 5\"", "Báo lỗi"], a: 1, why: "Hai xâu được nối lại." },
    { q: "\"5\" * 3 cho kết quả?", o: ["15", "555", "Báo lỗi", "5 5 5"], a: 1, why: "Xâu nhân số nguyên là lặp xâu." },
    { q: "int(7.9) bằng?", o: ["7", "8", "7.9", "Báo lỗi"], a: 0, why: "int() cắt bỏ phần thập phân, không làm tròn." },
    { kind: "truefalse", q: "Số điện thoại 0901234567 nên lưu kiểu int.", a: false, why: "Không tính toán với nó, và int sẽ làm mất số 0 ở đầu — nên dùng str." },
    { kind: "match", q: "Nối giá trị với kiểu.", pairs: [["40", "int"], ["8.5", "float"], ["\"10A1\"", "str"], ["False", "bool"]], why: "Bốn kiểu cơ bản." },
    { kind: "bug", q: "Dòng nào báo lỗi TypeError?", lines: ["a = 40", "b = \"Sĩ số: \"", "print(b + str(a))", "print(b + a)"], a: 3, why: "Không nối được str với int." },
    { q: "len(\"10A1\") bằng?", o: ["1", "3", "4", "10"], a: 2, why: "Đếm ký tự: 1, 0, A, 1." },
    { q: "10 / 5 cho kết quả?", o: ["2", "2.0", "\"2\"", "Báo lỗi"], a: 1, why: "Phép chia / luôn ra float." },
    { kind: "multi", q: "Những giá trị nào là kiểu str?", o: ["\"True\"", "True", "'8'", "8"], a: [0, 2], why: "Có ngoặc (kép hoặc đơn) là xâu, kể cả khi trông như số hay bool." },
  ],
};
