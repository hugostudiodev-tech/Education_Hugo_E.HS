// Step 25 — tuple, set và dự án nhỏ: sổ quỹ lớp (kết chặng 5).
export default {
  id: "py25",
  lang: "python",
  file: "so_lop/quy_lop.py",
  duration: "50 phút",
  summary: "Dùng tuple cho bản ghi cố định, set cho tập không trùng, rồi ghép list/dict/tuple/set thành sổ quỹ lớp thu chi.",
  slides: [
    {
      section: "intro",
      title: "Dự án kết chặng 5",
      body: `Hai cấu trúc dữ liệu còn lại:

- **tuple**: dãy có thứ tự nhưng không sửa tại chỗ — hợp với một bản ghi cố định.
- **set**: tập hợp không trùng, không dùng chỉ số — hợp với danh sách người đã đóng quỹ.

Kết chặng: làm **sổ quỹ lớp** tổng hợp thu, chi và người đóng.`,
    },
    {
      section: "visual",
      title: "Một giao dịch và một tập người",
      body: "Tuple `(nội_dung, số_tiền)` gói hai phần của một giao dịch. Set tự bỏ tên trùng.",
      py: { code: 'giao_dich = ("Mua phấn", 35000)\nprint(giao_dich[0], giao_dich[1])\nnguoi_dong = {"An", "Bình", "An", "Chi"}\nprint(len(nguoi_dong))\nprint(sorted(nguoi_dong))' },
    },
    {
      section: "research",
      title: "Chọn cấu trúc theo ý nghĩa",
      body: `Không có cấu trúc "tốt nhất" cho mọi việc:

- list: có thứ tự, cho phép trùng, cần sửa.
- tuple: có thứ tự, không sửa.
- set: không trùng, kiểm tra thuộc tập nhanh.
- dict: tra giá trị theo khoá.

Chọn đúng cấu trúc làm code ngắn hơn vì chính cấu trúc đã bảo vệ một phần quy tắc dữ liệu.

> Python Software Foundation (2026) *Data Structures — Tuples and Sets*. Available at: https://docs.python.org/3/tutorial/datastructures.html`,
    },
    {
      section: "ideate",
      title: "Thiết kế sổ quỹ lớp",
      body: `- **cac_khoan_thu**: list các tuple **(tên, số_tiền)**.
- **nguoi_dong**: set tên người đã đóng — không đếm trùng.
- **cac_khoan_chi**: list các tuple **(nội_dung, số_tiền)**.
- Số dư = tổng thu − tổng chi.

Dữ liệu nhập dùng dấu **|** để tách chữ và số.`,
    },
    {
      section: "core",
      title: "Tuple và tháo gói",
      body: "Tuple dùng ngoặc tròn. Khi duyệt, ta có thể tháo gói trực tiếp thành hai biến.",
      py: { code: 'cac_khoan = [("An", 50000), ("Bình", 50000)]\nfor ten, so_tien in cac_khoan:\n    print(f"{ten}: {so_tien:,} đ")\nprint("Tổng:", sum(so_tien for _, so_tien in cac_khoan))' },
    },
    {
      section: "core",
      title: "Set: thêm, kiểm tra, hợp và giao",
      body: "`add` thêm một phần tử; `in` kiểm tra thuộc tập. `|` là hợp, `&` là giao, `-` là hiệu.",
      py: { code: 'to_1 = {"An", "Bình", "Chi"}\nto_2 = {"Chi", "Dũng"}\nprint("Cả hai tổ:", sorted(to_1 | to_2))\nprint("Trùng:", sorted(to_1 & to_2))\nprint("Chỉ tổ 1:", sorted(to_1 - to_2))' },
    },
    {
      section: "apply",
      title: "Dự án: sổ quỹ lớp",
      body: `Dòng đầu là số khoản thu n, sau đó n dòng **tên|số tiền**. Tiếp theo là số khoản chi m và m dòng **nội dung|số tiền**.

In người đã đóng theo ABC, tổng thu, tổng chi và số dư. Một bạn đóng nhiều lần vẫn chỉ hiện một lần trong danh sách.`,
      py: {
        code: "n = int(input())\ncac_khoan_thu = []\nnguoi_dong = set()\n",
        stdin: "4\nAn|50000\nBình|50000\nAn|20000\nChi|50000\n2\nMua phấn|35000\nTrang trí|60000",
        solution: 'n = int(input())\ncac_khoan_thu = []\nnguoi_dong = set()\nfor _ in range(n):\n    ten, tien = input().split("|")\n    tien = int(tien)\n    cac_khoan_thu.append((ten, tien))\n    nguoi_dong.add(ten)\nm = int(input())\ncac_khoan_chi = []\nfor _ in range(m):\n    noi_dung, tien = input().split("|")\n    cac_khoan_chi.append((noi_dung, int(tien)))\ntong_thu = sum(tien for _, tien in cac_khoan_thu)\ntong_chi = sum(tien for _, tien in cac_khoan_chi)\nprint("Người đã đóng:", ", ".join(sorted(nguoi_dong)))\nprint(f"Tổng thu: {tong_thu:,} đ")\nprint(f"Tổng chi: {tong_chi:,} đ")\nprint(f"Số dư: {tong_thu - tong_chi:,} đ")',
        hints: ["split(\"|\") rồi int phần tiền; lưu mỗi khoản bằng tuple.", "Tên đưa vào set; tổng lấy từ các tuple bằng sum."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: ai chưa đóng quỹ?",
      body: "Có hai set `ca_lop` và `da_dong`. In các bạn chưa đóng theo thứ tự ABC, cách nhau bằng dấu phẩy; rồi in `Còn: N bạn`.",
      py: {
        code: 'ca_lop = {"An", "Bình", "Chi", "Dũng", "Hà"}\nda_dong = {"An", "Chi", "Hà"}\n',
        solution: 'ca_lop = {"An", "Bình", "Chi", "Dũng", "Hà"}\nda_dong = {"An", "Chi", "Hà"}\nchua_dong = ca_lop - da_dong\nprint(", ".join(sorted(chua_dong)))\nprint(f"Còn: {len(chua_dong)} bạn")',
        hints: ["Hiệu hai tập: ca_lop - da_dong.", "sorted trước khi join để thứ tự ổn định."],
      },
    },
  ],
  quiz: [
    { q: "Tuple khác list chủ yếu ở điểm?", o: ["Tuple không sửa tại chỗ", "Tuple không có thứ tự", "Tuple không chứa số", "Tuple luôn chỉ có hai phần tử"], a: 0, why: "Tuple là immutable sequence." },
    { q: "Set phù hợp nhất để?", o: ["Giữ các giá trị không trùng", "Lấy phần tử theo chỉ số", "Giữ thứ tự nhập bắt buộc", "Lưu cặp khoá–giá trị"], a: 0, why: "Set loại trùng và hỗ trợ phép toán tập hợp." },
    { kind: "truefalse", q: "Có thể lấy phần tử đầu của set bằng s[0].", a: false, why: "Set không hỗ trợ chỉ số." },
    { q: "{1, 2, 2, 3} có độ dài?", o: ["3", "4", "2", "1"], a: 0, why: "Giá trị 2 trùng chỉ được giữ một lần." },
    { kind: "output", q: "Phép giao hai set in ra list nào?", code: "a = {1, 2, 3}\nb = {3, 4}\nprint(sorted(a & b))", o: ["[3]", "[1, 2, 3, 4]", "[1, 2]", "[4]"], a: 0, why: "Phép giao giữ phần tử có trong cả hai tập." },
    { kind: "bug", q: "Muốn tuple một phần tử nhưng dòng nào tạo int?", lines: ["a = (5,)", "b = (5)", "print(type(a))", "print(type(b))"], a: 1, why: "Tuple một phần tử cần dấu phẩy: (5,)." },
    { q: "ca_lop - da_dong cho?", o: ["Người chưa đóng", "Người đã đóng", "Tất cả mọi người", "Người thuộc cả hai"], a: 0, why: "Hiệu giữ phần tử có ở ca_lop nhưng không ở da_dong." },
    { kind: "multi", q: "Cấu trúc nào có thể chứa nhiều phần tử?", o: ["list", "tuple", "set", "float"], a: [0, 1, 2], why: "float là một giá trị số, không phải collection." },
    { kind: "match", q: "Nối cấu trúc với công việc phù hợp.", pairs: [["list", "Các giao dịch theo thứ tự"], ["tuple", "Một bản ghi thu hoặc chi"], ["set", "Người đã đóng không trùng"], ["dict", "Tra điểm theo tên"]], why: "Chọn cấu trúc theo ý nghĩa dữ liệu." },
    { kind: "order", q: "Thứ tự xử lý sổ quỹ.", items: ["Đọc các khoản thu", "Đọc các khoản chi", "Tính tổng thu và chi", "In số dư"], a: [0, 1, 2, 3], why: "Phải có dữ liệu trước khi tổng hợp và báo cáo." },
  ],
};
