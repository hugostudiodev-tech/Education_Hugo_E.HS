// Step 24 — dict: tra điểm theo tên.
export default {
  id: "py24",
  lang: "python",
  file: "so_lop/tra_diem.py",
  duration: "45 phút",
  summary: "Lưu cặp khoá–giá trị trong dict, thêm/sửa/xoá, tra cứu an toàn bằng get và duyệt items để làm sổ điểm theo tên.",
  slides: [
    {
      section: "intro",
      title: "Tra theo tên thay vì nhớ chỉ số",
      body: `List phù hợp khi dữ liệu được tìm theo **vị trí**. **dict** (từ điển) lưu các cặp **khoá → giá trị**:

~~~python
bang_diem = {"An": 8.5, "Bình": 7.0}
~~~

Ta dùng tên làm khoá để tra điểm trực tiếp.`,
    },
    {
      section: "visual",
      title: "Khoá mở đúng ngăn",
      body: '`bang_diem["An"]` dùng khoá `"An"` để lấy 8.5. Mỗi khoá chỉ xuất hiện một lần; gán lại cùng khoá sẽ cập nhật giá trị.',
      py: { code: 'bang_diem = {"An": 8.5, "Bình": 7.0}\nprint(bang_diem["An"])\nbang_diem["Bình"] = 7.5\nbang_diem["Chi"] = 9.0\nprint(bang_diem)' },
    },
    {
      section: "research",
      title: "Tra cứu theo khoá",
      body: `Dict được thiết kế để tìm giá trị theo khoá rất nhanh. Trong Python hiện đại, dict cũng giữ **thứ tự chèn**, nhưng ý nghĩa chính vẫn là ánh xạ khoá sang giá trị — không phải truy cập bằng số thứ tự.

Khoá phải là kiểu không thay đổi được như **str**, **int** hoặc **tuple**; list không thể làm khoá.

> Python Software Foundation (2026) *Data Structures — Dictionaries*. Available at: https://docs.python.org/3/tutorial/datastructures.html#dictionaries`,
    },
    {
      section: "ideate",
      title: "Thiết kế sổ điểm",
      body: `- Khoá: tên hoặc mã học sinh **duy nhất**.
- Giá trị: điểm.
- Thêm/sửa: **bang_diem[ten] = diem**.
- Tra an toàn: **bang_diem.get(ten)**.

Trong sản phẩm thật, hai bạn có thể trùng tên nên nên dùng mã học sinh. Bài này dùng tên cho dễ đọc.`,
    },
    {
      section: "core",
      title: "Tra cứu an toàn bằng get",
      body: "Dùng `d[k]` với khoá không tồn tại gây `KeyError`. `d.get(k)` trả `None`, hoặc nhận giá trị mặc định ở tham số thứ hai.",
      py: { code: 'bang_diem = {"An": 8.5}\nprint(bang_diem.get("An"))\nprint(bang_diem.get("Lan"))\nprint(bang_diem.get("Lan", "Chưa có điểm"))\nprint("An" in bang_diem)' },
    },
    {
      section: "core",
      title: "Duyệt khoá và giá trị",
      body: "`items()` cho từng cặp `(khoá, giá trị)`. `keys()` cho khoá; `values()` cho giá trị.",
      py: { code: 'bang_diem = {"An": 8.5, "Bình": 7.0, "Chi": 9.0}\nfor ten, diem in bang_diem.items():\n    print(f"{ten}: {diem}")\nprint(f"TB: {sum(bang_diem.values()) / len(bang_diem):.1f}")' },
    },
    {
      section: "apply",
      title: "Bài tập: tra điểm theo tên",
      body: "Có sẵn bảng điểm. Nhập tên cần tra. Nếu có, in `Tên: điểm`; nếu không, in `Không tìm thấy`.",
      py: {
        code: 'bang_diem = {"An": 8.5, "Bình": 7.0, "Chi": 9.0}\nten = input().strip().title()\n',
        stdin: "bình",
        solution: 'bang_diem = {"An": 8.5, "Bình": 7.0, "Chi": 9.0}\nten = input().strip().title()\ndiem = bang_diem.get(ten)\nif diem is None:\n    print("Không tìm thấy")\nelse:\n    print(f"{ten}: {diem}")',
        hints: ["Chuẩn hoá tên bằng strip().title().", "Lấy diem = bang_diem.get(ten), rồi kiểm diem is None."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: nhập sổ điểm",
      body: "Dòng đầu là n; tiếp theo lặp n lần, mỗi học sinh nhập hai dòng: tên rồi điểm. Nếu tên lặp, điểm sau cập nhật điểm trước. In tên theo thứ tự chữ cái, dạng `An: 8.5`.",
      py: {
        code: "n = int(input())\nbang_diem = {}\n",
        stdin: "4\nChi\n9\nAn\n8\nBình\n7.5\nAn\n8.5",
        solution: 'n = int(input())\nbang_diem = {}\nfor _ in range(n):\n    ten = input().strip().title()\n    diem = float(input())\n    bang_diem[ten] = diem\nfor ten in sorted(bang_diem):\n    print(f"{ten}: {bang_diem[ten]}")',
        hints: ["Mỗi lượt gán bang_diem[ten] = diem.", "Duyệt for ten in sorted(bang_diem)."],
      },
    },
  ],
  quiz: [
    { q: "Dict lưu dữ liệu theo dạng?", o: ["Khoá → giá trị", "Chỉ số → chỉ số", "Chỉ giá trị", "Chỉ xâu"], a: 0, why: "Mỗi mục là một cặp khoá và giá trị." },
    { q: "d[\"An\"] = 9 khi khoá An đã có sẽ?", o: ["Cập nhật giá trị", "Thêm khoá An thứ hai", "Báo lỗi", "Xoá An"], a: 0, why: "Khoá trong dict là duy nhất." },
    { kind: "truefalse", q: "List có thể dùng trực tiếp làm khoá dict.", a: false, why: "Khoá phải hashable; list có thể thay đổi nên không dùng làm khoá." },
    { q: "d.get(\"Lan\") khi không có khoá Lan trả?", o: ["None", "0", "Chuỗi rỗng", "KeyError"], a: 0, why: "get không có mặc định sẽ trả None." },
    { kind: "output", q: "Cập nhật khoá dict in ra độ dài và giá trị nào?", code: "d = {'a': 1}\nd['a'] = 2\nprint(len(d), d['a'])", o: ["1 2", "2 2", "1 1", "2 1"], a: 0, why: "Cập nhật khoá cũ không làm tăng số mục." },
    { kind: "bug", q: "Muốn tra an toàn nhưng dòng nào có thể gây KeyError?", lines: ["d = {'An': 8}", "ten = 'Bình'", "diem = d[ten]", "print(diem)"], a: 2, why: "Dùng d.get(ten) khi khoá có thể không tồn tại." },
    { q: "d.items() cho ra?", o: ["Các cặp khoá và giá trị", "Chỉ khoá", "Chỉ giá trị", "Độ dài"], a: 0, why: "Mỗi phần tử duyệt được là một cặp." },
    { kind: "multi", q: "Kiểu nào có thể làm khoá dict?", o: ["str", "int", "tuple không chứa list", "list"], a: [0, 1, 2], why: "Ba kiểu đầu không thay đổi và hashable; list thì không." },
    { kind: "blank", q: "Điền để duyệt cả tên và điểm.", code: "for ten, diem in bang_diem.___():", a: "items", why: "items() trả từng cặp khoá–giá trị." },
    { q: "Cách kiểm khoá An có trong d?", o: ["\"An\" in d", "d has \"An\"", "d.contains(\"An\")", "\"An\" in d.values()"], a: 0, why: "Toán tử in trên dict kiểm các khoá." },
  ],
};
