// Step 21 — list: danh sách điểm.
export default {
  id: "py21",
  lang: "python",
  file: "so_lop/danh_sach_diem.py",
  duration: "45 phút",
  summary: "Tạo list, đọc phần tử bằng chỉ số, thêm/sửa/xoá điểm và phân biệt phép gán chung list với sao chép list.",
  slides: [
    {
      section: "intro",
      title: "Từ một điểm tới cả lớp",
      body: `Một biến thường giữ **một** giá trị. Một **list** giữ nhiều giá trị theo thứ tự:

~~~python
diem = [8, 6.5, 9, 7.5]
~~~

Bạn sẽ tạo list, lấy phần tử, thêm, sửa, xoá và sao chép list an toàn.`,
    },
    {
      section: "visual",
      title: "Mỗi phần tử có một chỉ số",
      body: "Chỉ số bắt đầu từ **0**. Chỉ số âm đếm từ cuối: `-1` là phần tử cuối cùng.",
      py: { code: 'diem = [8, 6.5, 9, 7.5]\nprint(diem[0])\nprint(diem[2])\nprint(diem[-1])\nprint("Sĩ số:", len(diem))' },
    },
    {
      section: "research",
      title: "List là cấu trúc dữ liệu có thứ tự",
      body: `Python định nghĩa list là dãy **có thứ tự** và **có thể thay đổi** (mutable). Vì có thứ tự, mỗi phần tử có chỉ số. Vì mutable, ta có thể sửa ngay một vị trí mà không tạo list mới.

List có thể chứa nhiều kiểu, nhưng bảng điểm nên chỉ chứa số để các phép tính sau này nhất quán.

> Python Software Foundation (2026) *Data Structures — More on Lists*. Available at: https://docs.python.org/3/tutorial/datastructures.html#more-on-lists`,
    },
    {
      section: "ideate",
      title: "Sổ Lớp cần những list nào?",
      body: `- Danh sách tên học sinh.
- Danh sách điểm kiểm tra.
- Danh sách khoản thu, chi.

Mỗi list nên chứa các phần tử **cùng ý nghĩa**. Đừng trộn tên, điểm và số tiền vào một list rồi phải đoán từng vị trí là gì.`,
    },
    {
      section: "core",
      title: "Thêm, sửa và xoá",
      body: `- **append(x)**: thêm x vào cuối.
- **insert(i, x)**: chèn x tại vị trí i.
- **diem[i] = x**: sửa vị trí i.
- **pop(i)**: xoá và trả về phần tử ở i.
- **remove(x)**: xoá lần xuất hiện đầu tiên của x.`,
      py: { code: 'diem = [8, 6.5, 9]\ndiem.append(7.5)\ndiem[1] = 7\ndiem.insert(0, 10)\nda_xoa = diem.pop()\nprint(diem)\nprint("Đã xoá:", da_xoa)' },
    },
    {
      section: "core",
      title: "Hai tên, một list",
      body: `Gán **du_phong = diem** không sao chép. Hai biến cùng trỏ tới một list, nên sửa bên này thì bên kia cũng đổi.

Dùng **diem.copy()** hoặc **diem[:]** để tạo bản sao độc lập.`,
      py: { code: 'diem = [7, 8, 9]\ncung_list = diem\nban_sao = diem.copy()\ndiem[0] = 10\nprint(cung_list)\nprint(ban_sao)' },
    },
    {
      section: "apply",
      title: "Bài tập: cập nhật bảng điểm",
      body: "Có list `[7.5, 8, 6.5]`. Nhập một điểm mới, thêm vào cuối; sửa điểm đầu thành `8.0`; xoá điểm thấp nhất đang ở chỉ số 2. In list kết quả và sĩ số, dạng `[8.0, 8.0, 9.0]` rồi `Sĩ số: 3` với đầu vào 9.",
      py: {
        code: "diem = [7.5, 8, 6.5]\ndiem_moi = float(input())\n",
        stdin: "9",
        solution: 'diem = [7.5, 8, 6.5]\ndiem_moi = float(input())\ndiem.append(diem_moi)\ndiem[0] = 8.0\ndiem.pop(2)\nprint(diem)\nprint(f"Sĩ số: {len(diem)}")',
        hints: ["Dùng append(diem_moi), rồi gán diem[0] = 8.0.", "Xoá phần tử chỉ số 2 bằng pop(2)."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: bản sao an toàn",
      body: "Có list `goc = [6, 7, 8]`. Tạo bản sao, đổi phần tử cuối của bản sao thành 10. In lần lượt list gốc và bản sao; list gốc phải không đổi.",
      py: {
        code: "goc = [6, 7, 8]\n",
        solution: 'goc = [6, 7, 8]\nban_sao = goc.copy()\nban_sao[-1] = 10\nprint(goc)\nprint(ban_sao)',
        hints: ["Đừng viết ban_sao = goc.", "Dùng goc.copy(), rồi gán ban_sao[-1]."],
      },
    },
  ],
  quiz: [
    { q: "Chỉ số của phần tử đầu tiên trong list là?", o: ["0", "1", "-1", "Tuỳ list"], a: 0, why: "Python đánh chỉ số từ 0." },
    { q: "Với a = [4, 7, 9], a[-1] bằng?", o: ["4", "7", "9", "Lỗi"], a: 2, why: "-1 là phần tử cuối." },
    { kind: "truefalse", q: "List trong Python có thể thay đổi sau khi tạo.", a: true, why: "List là kiểu mutable." },
    { q: "Lệnh nào thêm 8 vào cuối list diem?", o: ["diem.append(8)", "diem.add(8)", "append(diem, 8)", "diem + 8"], a: 0, why: "append thêm đúng một phần tử vào cuối." },
    { kind: "output", q: "List nào được in sau lệnh insert?", code: "a = [1, 2]\na.insert(1, 9)\nprint(a)", o: ["[1, 9, 2]", "[1, 2, 9]", "[9, 1, 2]", "Lỗi"], a: 0, why: "insert(1, 9) chèn trước phần tử đang ở chỉ số 1." },
    { kind: "bug", q: "Muốn bản sao độc lập nhưng sửa b lại làm a đổi. Dòng nào sai?", lines: ["a = [1, 2, 3]", "b = a", "b[0] = 9", "print(a)"], a: 1, why: "b = a chỉ tạo tên thứ hai cho cùng list; cần a.copy()." },
    { q: "pop(2) làm gì?", o: ["Xoá và trả phần tử chỉ số 2", "Xoá giá trị 2", "Thêm 2", "Sao chép list"], a: 0, why: "Đối số của pop là chỉ số." },
    { kind: "multi", q: "Cách nào tạo bản sao list độc lập?", o: ["a.copy()", "a[:]", "b = a", "list(a)"], a: [0, 1, 3], why: "Gán trực tiếp không sao chép; ba cách còn lại tạo list mới." },
    { kind: "blank", q: "Điền để lấy sĩ số.", code: "si_so = ___(diem)", a: "len", why: "len(list) trả số phần tử." },
    { q: "remove(8) khác pop(8) ở đâu?", o: ["remove tìm giá trị 8, pop dùng chỉ số 8", "Hai lệnh giống hệt", "remove thêm 8", "pop không đổi list"], a: 0, why: "remove nhận giá trị, pop nhận chỉ số." },
  ],
};
