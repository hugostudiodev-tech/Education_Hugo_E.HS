// Step 34 — List và dict comprehension.
export default {
  id: "py34", lang: "python", file: "so_lop/comprehension.py", duration: "45 phút",
  summary: "Tạo list, set và dict bằng comprehension, thêm điều kiện lọc và biết khi nào nên dùng vòng lặp thường.",
  slides: [
    { section: "intro", title: "Tạo collection trong một biểu thức", body: "Comprehension mô tả kết quả cần tạo từ một dãy: biến đổi từng phần tử và tuỳ chọn lọc." },
    { section: "visual", visual: "py-comprehension", title: "Đọc từ trái sang phải", body: "`[biểu_thức for phần_tử in dãy if điều_kiện]` tương đương tạo list rồi append trong vòng lặp.", py: { code: 'diem = [4, 7, 8.5, 3, 9]\ndat = [d for d in diem if d >= 5]\nbinh_phuong = [d * d for d in range(1, 5)]\nprint(dat)\nprint(binh_phuong)' } },
    { section: "research", title: "Ngắn nhưng phải đọc được", body: `Comprehension phù hợp cho một phép biến đổi và một điều kiện đơn giản. Nếu có nhiều nhánh, xử lý lỗi hoặc tác dụng phụ, vòng lặp thường rõ hơn.

> Python Software Foundation (2026) *List Comprehensions*. Available at: https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions` },
    { section: "ideate", title: "Từ yêu cầu sang ba phần", body: "Ví dụ lấy tên học sinh đạt: dãy là bảng điểm, điều kiện là điểm ≥ 5, biểu thức kết quả là tên." },
    { section: "core", title: "List và set comprehension", body: "Dùng ngoặc vuông cho list; ngoặc nhọn không có dấu hai chấm cho set.", py: { code: 'ten = [" an ", "BÌNH", "an", "Chi"]\nchuan = [t.strip().title() for t in ten]\nduy_nhat = {t.strip().title() for t in ten}\nprint(chuan)\nprint(sorted(duy_nhat))' } },
    { section: "core", title: "Dict comprehension", body: "Cặp `k: v` trước từ khoá for tạo dict.", py: { code: 'diem = {"An": 8, "Bình": 6, "Chi": 9}\nxep_loai = {ten: ("Đạt" if d >= 5 else "Chưa đạt") for ten, d in diem.items()}\nprint(xep_loai)' } },
    { section: "core", title: "Comprehension chạy từng phần tử", body: "`[min(d + 0.5, 10) for d in [4, 7.5, 10] if d >= 5]`:\n\n| d | d >= 5? | Giữ gì | Kết quả tạm |\n|---|---|---|---|\n| 4 | False | — (bỏ) | [] |\n| 7.5 | True | 8.0 | [8.0] |\n| 10 | True | 10 *(min chặn)* | [8.0, 10] |\n\nĐọc theo thứ tự: **for** trước, **if** lọc, rồi mới tính **biểu thức** ở đầu." },
    { section: "core", title: "Lỗi hay gặp với comprehension", body: "1. **Đặt if sai chỗ**: `[d for d in ds if d >= 5 else 0]` lỗi cú pháp. Muốn \"nếu–không thì\" phải đặt ở biểu thức: `[d if d >= 5 else 0 for d in ds]`.\n2. **Nhầm set với dict**: `{x for ...}` là set, `{k: v for ...}` mới là dict.\n3. **Nhồi quá nhiều**: hai vòng for + hai if trong một dòng → khó đọc, nên viết vòng lặp.\n4. **Dùng để in**: `[print(x) for x in ds]` tạo list None vô ích. Dùng for thường.\n\nChạy ví dụ để thấy khác nhau giữa **lọc** và **thay thế**.", py: { code: "ds = [4, 7, 3, 9]\nprint([d for d in ds if d >= 5])\nprint([d if d >= 5 else 0 for d in ds])" } },
    { section: "apply", title: "Bài tập: lọc và cộng điểm", body: "Có list `[4, 7.5, 8, 10, 3]`. Dùng một list comprehension lấy các điểm đạt và cộng 0.5 nhưng không vượt 10. In kết quả.", py: { code: "diem = [4, 7.5, 8, 10, 3]\n", solution: "diem = [4, 7.5, 8, 10, 3]\nket_qua = [min(d + 0.5, 10) for d in diem if d >= 5]\nprint(ket_qua)", hints: ["Điều kiện đặt cuối: if d >= 5.", "Biểu thức là min(d + 0.5, 10)."] } },
    { section: "apply", title: "Bài tập: đảo dict", body: "Có dict mã → tên với tên không trùng. Dùng dict comprehension tạo tên → mã và in kết quả theo tên ABC.", py: { code: 'hoc_sinh = {"HS02": "Bình", "HS01": "An", "HS03": "Chi"}\n', solution: 'hoc_sinh = {"HS02": "Bình", "HS01": "An", "HS03": "Chi"}\ndao = {ten: ma for ma, ten in hoc_sinh.items()}\nfor ten in sorted(dao):\n    print(f"{ten}: {dao[ten]}")', hints: ["Đổi vị trí: {ten: ma for ma, ten in ...}.", "Duyệt sorted(dao) để in ổn định."] } },
  ],
  quiz: [
    { q: "List comprehension dùng dấu?", o: ["[]", "{} có dấu :", "()", "<>"], a: 0, why: "Ngoặc vuông tạo list." },
    { q: "Phần if ở cuối comprehension dùng để?", o: ["Lọc", "Sắp xếp", "In", "Bắt lỗi"], a: 0, why: "Chỉ phần tử thỏa điều kiện được giữ." },
    { kind: "truefalse", q: "Comprehension nhiều nhánh phức tạp luôn dễ đọc hơn vòng lặp.", a: false, why: "Khi phức tạp nên dùng vòng lặp thường." },
    { kind: "output", q: "List comprehension nhân đôi in list nào?", code: "print([x*2 for x in range(3)])", o: ["[0, 2, 4]", "[2, 4, 6]", "[0, 1, 2]", "6"], a: 0, why: "x là 0,1,2." },
    { q: "Set comprehension có đặc tính?", o: ["Loại giá trị trùng", "Giữ mọi bản sao", "Luôn có chỉ số", "Chỉ chứa xâu"], a: 0, why: "Kết quả là set." },
    { kind: "bug", q: "Muốn dict nhưng dòng nào thiếu dấu hai chấm?", lines: ["diem = {'An': 8}", "kq = {ten, d for ten, d in diem.items()}", "print(kq)", "print(diem)"], a: 1, why: "Dict comprehension phải {ten: d for ...}." },
    { kind: "blank", q: "Điền để chỉ giữ số chẵn.", code: "[x for x in ds if ___]", a: ["x % 2 == 0", "x%2==0"], why: "Số chẵn có dư 0 khi chia 2." },
    { kind: "multi", q: "Dạng comprehension có sẵn?", o: ["list", "set", "dict", "str trực tiếp"], a: [0, 1, 2], why: "Không có cú pháp str comprehension trực tiếp." },
    { q: "{x: x*x for x in range(3)} tạo?", o: ["{0:0, 1:1, 2:4}", "[0,1,4]", "{0,1,4}", "9"], a: 0, why: "Khoá là x, giá trị x bình phương." },
    { q: "Khi nào nên dùng vòng lặp thường?", o: ["Nhiều bước và xử lý lỗi", "Biến đổi đơn giản", "Lọc một điều kiện", "Tạo list bình phương"], a: 0, why: "Nhiều bước cần ưu tiên rõ ràng." },
  ],
};
