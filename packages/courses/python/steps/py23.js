// Step 23 — Xâu ký tự: cắt lát và các phương thức.
export default {
  id: "py23",
  lang: "python",
  file: "so_lop/xu_ly_ten.py",
  duration: "45 phút",
  summary: "Lấy và cắt ký tự, hiểu xâu không thể sửa tại chỗ, chuẩn hoá tên bằng strip/title và tách-ghép bằng split/join.",
  slides: [
    {
      section: "intro",
      title: "Xâu cũng là một dãy",
      body: `Xâu **str** là dãy ký tự, nên dùng được chỉ số, **len**, vòng **for** và lát cắt giống list.

Khác biệt quan trọng: xâu **không thể sửa tại chỗ** (immutable). Muốn thay đổi, ta tạo xâu mới.`,
    },
    {
      section: "visual",
      title: "Cắt một đoạn xâu",
      body: "`text[start:stop:step]` lấy từ start tới trước stop. Bỏ start/stop nghĩa là đi từ đầu/tới cuối.",
      py: { code: 'ma = "10A1-023"\nprint(ma[0:4])\nprint(ma[5:])\nprint(ma[-3:])\nprint(ma[::-1])' },
    },
    {
      section: "research",
      title: "Unicode và tiếng Việt",
      body: `Python 3 lưu xâu dưới dạng Unicode, nên có thể xử lý tên tiếng Việt trực tiếp. Tuy vậy, ký tự nhìn giống nhau đôi khi có cách mã hoá khác nhau; ở các hệ thống lớn người ta thường **chuẩn hoá Unicode** trước khi so sánh.

Trong Sổ Lớp, ta giữ nguyên dấu và dùng **casefold()** khi cần so sánh không phân biệt hoa thường.

> Unicode Consortium (2024) *The Unicode Standard, Version 16.0*. Available at: https://www.unicode.org/versions/Unicode16.0.0/`,
    },
    {
      section: "ideate",
      title: "Chuẩn hoá tên học sinh",
      body: `Dữ liệu nhập có thể là **"  nGUYỄN   an  "**. Ta cần:

1. Bỏ khoảng trắng hai đầu bằng **strip()**.
2. Tách thành các từ bằng **split()** — tự bỏ khoảng trắng thừa.
3. Ghép lại bằng **" ".join(...)**.
4. Viết hoa đầu từ bằng **title()**.`,
    },
    {
      section: "core",
      title: "Các phương thức hay dùng",
      body: "`lower()`, `upper()`, `title()` đổi kiểu chữ; `strip()` bỏ khoảng trắng hai đầu; `replace(cũ, mới)` thay đoạn; `count(x)` đếm; `find(x)` tìm vị trí đầu hoặc -1.",
      py: { code: 'ten = "  trần   minh an  "\nchuan = " ".join(ten.split()).title()\nprint(chuan)\nprint(chuan.lower().count("n"))\nprint(chuan.find("Minh"))' },
    },
    {
      section: "core",
      title: "Xâu không sửa tại chỗ",
      body: '`ten[0] = "A"` sẽ lỗi. Hãy ghép một xâu mới bằng lát cắt hoặc dùng `replace`.',
      py: { code: 'ma = "a10a1"\nma_moi = "A" + ma[1:]\nprint(ma_moi)\nprint(ma_moi.replace("a", "A"))' },
    },
    {
      section: "apply",
      title: "Bài tập: chuẩn hoá họ tên",
      body: "Nhập một họ tên có thể thừa khoảng trắng và sai kiểu chữ. In tên đã chuẩn hoá; dòng sau in `Tên gọi: X` với X là từ cuối. Với `  nGUYỄN   văn  an  `, in `Nguyễn Văn An` và `Tên gọi: An`.",
      py: {
        code: "ten = input()\n",
        stdin: "  nGUYỄN   văn  an  ",
        solution: 'ten = input()\ncac_tu = ten.split()\nchuan = " ".join(cac_tu).title()\nprint(chuan)\nprint(f"Tên gọi: {chuan.split()[-1]}")',
        hints: ["split() không tham số tự bỏ khoảng trắng thừa.", "Ghép bằng \" \".join(...), dùng title(), rồi lấy phần tử [-1]."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: kiểm tra mã lớp",
      body: "Nhập mã dạng `10A1-023`. Nếu bốn ký tự đầu là `10A1`, dấu ở chỉ số 4 là `-`, và ba ký tự cuối toàn chữ số thì in `Hợp lệ`; ngược lại in `Không hợp lệ`.",
      py: {
        code: "ma = input().strip()\n",
        stdin: "10A1-023",
        solution: 'ma = input().strip()\nhop_le = len(ma) == 8 and ma[:4] == "10A1" and ma[4] == "-" and ma[5:].isdigit()\nprint("Hợp lệ" if hop_le else "Không hợp lệ")',
        hints: ["Kiểm len(ma) == 8 trước để các vị trí tồn tại.", "Dùng ma[:4], ma[4], ma[5:].isdigit()."],
      },
    },
  ],
  quiz: [
    { q: "\"Python\"[0:2] bằng?", o: ["Py", "Pyt", "yt", "Python"], a: 0, why: "Điểm dừng 2 không được lấy." },
    { q: "\"abc\"[::-1] bằng?", o: ["cba", "abc", "ac", "Lỗi"], a: 0, why: "Bước -1 duyệt ngược toàn xâu." },
    { kind: "truefalse", q: "Có thể gán trực tiếp s[0] = \"A\" cho một xâu.", a: false, why: "Xâu là immutable, phải tạo xâu mới." },
    { q: "strip() làm gì?", o: ["Bỏ khoảng trắng hai đầu", "Bỏ mọi khoảng trắng", "Viết hoa", "Tách thành list"], a: 0, why: "Khoảng trắng ở giữa được giữ nguyên." },
    { kind: "output", q: "split rồi join in ra xâu nào?", code: "print('-'.join('a b'.split()))", o: ["a-b", "ab", "a b", "['a', 'b']"], a: 0, why: "split tạo ['a','b']; join ghép bằng dấu gạch." },
    { kind: "bug", q: "Muốn kiểm mã có 3 số cuối nhưng dòng nào sai?", lines: ["ma = '10A1-023'", "duoi = ma[-3:]", "if duoi.isdigit:", "    print('Hợp lệ')"], a: 2, why: "Phải gọi phương thức: duoi.isdigit()." },
    { q: "find(\"x\") trả gì khi không thấy?", o: ["-1", "0", "None", "Lỗi"], a: 0, why: "find dùng -1 để báo không tìm thấy." },
    { kind: "multi", q: "Phương thức nào trả một xâu mới?", o: ["lower()", "replace()", "title()", "append()"], a: [0, 1, 2], why: "append là phương thức của list; các phương thức xâu tạo xâu mới." },
    { kind: "blank", q: "Điền để lấy ba ký tự cuối.", code: "ba_cuoi = ma[___]", a: "-3:", why: "Lát cắt từ chỉ số -3 tới hết." },
    { q: "split() không tham số xử lý nhiều khoảng trắng thế nào?", o: ["Coi chúng như một dấu tách", "Tạo nhiều phần tử rỗng", "Báo lỗi", "Không tách"], a: 0, why: "Cách này tiện để chuẩn hoá khoảng trắng." },
  ],
};
