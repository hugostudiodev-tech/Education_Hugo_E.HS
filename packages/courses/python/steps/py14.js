// Step 14 — and, or, not: ghép nhiều điều kiện.
export default {
  id: "py14",
  lang: "python",
  file: "so_lop/logic.py",
  duration: "45 phút",
  summary: "Ghép điều kiện bằng and, or, not; đọc bảng chân trị; hiểu thứ tự ưu tiên not > and > or và tính chất \"đoản mạch\".",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **and**: cả hai đều đúng.
- **or**: ít nhất một cái đúng.
- **not**: đảo đúng thành sai.
- Ưu tiên và **đoản mạch** (short-circuit).`,
    },
    {
      section: "visual",
      title: "Điều kiện đi dã ngoại",
      body: "Được đi dã ngoại khi **đã nộp tiền VÀ có giấy phép phụ huynh**. Đổi các giá trị True/False để thử.",
      py: { code: 'da_nop = True\nco_giay_phep = False\nif da_nop and co_giay_phep:\n    print("Được đi")\nelse:\n    print("Chưa đủ điều kiện")' },
    },
    {
      section: "research",
      title: "Bảng chân trị",
      body: `| A | B | A and B | A or B |
|---|---|---|---|
| True | True | True | True |
| True | False | False | True |
| False | True | False | True |
| False | False | False | False |

Và \`not True\` = False, \`not False\` = True. Đây là ba phép cơ bản của **đại số Boole** — mạch điện tử thực hiện chúng bằng các **cổng logic** AND, OR, NOT.

> Python Software Foundation (n.d.) *Built-in Types: Boolean Operations*. Available at: https://docs.python.org/3/library/stdtypes.html#boolean-operations-and-or-not`,
    },
    {
      section: "ideate",
      title: "Điều kiện học bổng có nhiều vế",
      body: `Ví dụ quy chế (giả định cho dự án):

- ĐTB **≥ 8** **và** không môn nào **dưới 6.5** **và** hạnh kiểm **Tốt**.
- **Hoặc** có giải học sinh giỏi cấp tỉnh.

Viết ra bằng tiếng Việt, gạch chân chữ "và", "hoặc", "không" — mỗi chữ thành một toán tử.`,
    },
    {
      section: "core",
      title: "and, or, not",
      body: "Chạy và dự đoán từng dòng trước.",
      py: { code: "dtb, vang = 8.2, 3\nprint(dtb >= 8 and vang <= 5)\nprint(dtb >= 9 or vang == 0)\nprint(not (vang > 5))" },
    },
    {
      section: "core",
      title: "Thứ tự ưu tiên",
      body: `**not** → **and** → **or**. Nên \`A or B and C\` nghĩa là \`A or (B and C)\`.

Khi trộn and với or, **luôn thêm ngoặc** cho rõ ý:

~~~python
(dtb >= 8 and hanh_kiem == "Tốt") or co_giai
~~~`,
    },
    {
      section: "core",
      title: "Đoản mạch",
      body: `- \`A and B\`: nếu A sai, Python **không xét B** (kết quả chắc chắn sai).
- \`A or B\`: nếu A đúng, **không xét B**.

Dùng để tránh lỗi: kiểm tra mẫu số khác 0 trước khi chia.`,
      py: { code: "so_bai = 0\ntong = 0\nif so_bai > 0 and tong / so_bai >= 5:\n    print(\"Đạt\")\nelse:\n    print(\"Chưa có bài nào\")" },
    },
    {
      section: "apply",
      title: "Bài tập: được thi cuối kỳ?",
      body: "Nhập số buổi vắng (int) và đã nộp đủ bài tập chưa (`co` hoặc `khong`). Được thi khi vắng **≤ 5** **và** nộp đủ. In `Được thi` hoặc `Không được thi`.",
      py: {
        code: "vang = int(input())\nnop = input()\n",
        stdin: "4\nco",
        solution: 'vang = int(input())\nnop = input()\nif vang <= 5 and nop == "co":\n    print("Được thi")\nelse:\n    print("Không được thi")',
        hints: ["So xâu: nop == \"co\".", "Ghép bằng and."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: năm nhuận",
      body: "Nhập năm. Năm nhuận khi **chia hết cho 4 và không chia hết cho 100**, **hoặc chia hết cho 400**. In `Nhuận` hoặc `Không nhuận`.",
      py: {
        code: "nam = int(input())\n",
        stdin: "2028",
        solution: 'nam = int(input())\nif (nam % 4 == 0 and nam % 100 != 0) or nam % 400 == 0:\n    print("Nhuận")\nelse:\n    print("Không nhuận")',
        hints: ["Vế 1: nam % 4 == 0 and nam % 100 != 0.", "Bọc vế 1 trong ngoặc rồi or nam % 400 == 0."],
      },
    },
  ],
  quiz: [
    { q: "True and False bằng?", o: ["True", "False"], a: 1, why: "and cần cả hai đúng." },
    { q: "True or False bằng?", o: ["True", "False"], a: 0, why: "or cần ít nhất một đúng." },
    { q: "not (5 > 3) bằng?", o: ["True", "False"], a: 1, why: "5 > 3 đúng, đảo thành sai." },
    { q: "True or False and False bằng?", o: ["True", "False"], a: 0, why: "and trước: False and False = False; True or False = True." },
    { kind: "truefalse", q: "Với A and B, nếu A sai thì Python không xét B.", a: true, why: "Đoản mạch." },
    { q: "Năm 1900 có nhuận không?", o: ["Có", "Không"], a: 1, why: "Chia hết cho 100 nhưng không cho 400." },
    { kind: "match", q: "Nối chữ tiếng Việt với toán tử.", pairs: [["và", "and"], ["hoặc", "or"], ["không phải", "not"]], why: "Dịch điều kiện sang code." },
    { kind: "bug", q: "Dòng nào có thể gây ZeroDivisionError khi n = 0?", lines: ["if n > 0 and s / n > 5:", "if s / n > 5 and n > 0:", "if n != 0:", "print(n)"], a: 1, why: "Chia trước khi kiểm n > 0." },
    { q: "Thứ tự ưu tiên đúng?", o: ["or > and > not", "not > and > or", "and > or > not", "Ngang nhau"], a: 1, why: "not, rồi and, rồi or." },
    { kind: "multi", q: "Biểu thức nào True với x = 7?", o: ["x > 5 and x < 10", "x < 5 or x > 10", "not x == 7", "x == 7 or x == 8"], a: [0, 3], why: "Tính từng vế." },
  ],
};
