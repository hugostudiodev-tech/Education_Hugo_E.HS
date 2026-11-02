// Step 26 — def và return: hàm đầu tiên.
export default {
  id: "py26",
  lang: "python",
  file: "so_lop/ham_dau_tien.py",
  duration: "45 phút",
  summary: "Định nghĩa hàm bằng def, truyền đối số, trả kết quả bằng return và phân biệt return với print.",
  slides: [
    { section: "intro", title: "Đóng gói một công việc", body: "Hàm là một khối code có tên. Ta định nghĩa bằng `def`, gọi khi cần và dùng `return` để gửi kết quả về nơi gọi." },
    { section: "visual", visual: "py-function-machine", title: "Đầu vào → hàm → đầu ra", body: "Hàm giống một chiếc máy: nhận điểm, xử lý, rồi trả xếp loại.", py: { code: 'def xep_loai(diem):\n    if diem >= 8:\n        return "Giỏi"\n    if diem >= 6.5:\n        return "Khá"\n    return "Cần cố gắng"\n\nprint(xep_loai(8.5))\nprint(xep_loai(7))' } },
    { section: "research", title: "Hàm giúp quản lý độ phức tạp", body: `Một tên hàm tốt che chi tiết bên trong và cho người đọc tập trung vào **hàm làm gì**. Đây là dạng trừu tượng cơ bản: thay vì đọc lại công thức nhiều lần, ta gọi một tên có ý nghĩa.

> Python Software Foundation (2026) *Defining Functions*. Available at: https://docs.python.org/3/tutorial/controlflow.html#defining-functions` },
    { section: "ideate", title: "Những hàm của Sổ Lớp", body: "Ta sẽ cần `tinh_trung_binh`, `xep_loai`, `in_bao_cao`. Mỗi hàm nên làm một việc rõ ràng và có tên là động từ." },
    { section: "core", title: "def, tham số và lời gọi", body: "Tên sau `def` là tên hàm; biến trong ngoặc là tham số. Code trong thân hàm chỉ chạy khi hàm được gọi.", py: { code: 'def loi_chao(ten):\n    return f"Chào {ten}!"\n\nthong_bao = loi_chao("An")\nprint(thong_bao)' } },
    { section: "core", title: "return không phải print", body: "`print` chỉ hiển thị. `return` kết thúc hàm và trao giá trị để code khác tiếp tục tính toán.", py: { code: 'def binh_phuong(x):\n    return x * x\n\nket_qua = binh_phuong(4) + binh_phuong(3)\nprint(ket_qua)' } },
    { section: "core", title: "Theo dõi một lời gọi hàm", body: "Khi Python gặp `xep_loai(8.5)`, nó làm theo đúng thứ tự:\n\n| Bước | Điều xảy ra | Giá trị |\n|---|---|---|\n| 1 | Nhảy vào hàm, gán tham số | diem = 8.5 |\n| 2 | Kiểm `diem >= 8` | True |\n| 3 | Gặp `return \"Giỏi\"` → **thoát hàm ngay** | \"Giỏi\" |\n| 4 | Quay về chỗ gọi, lời gọi được thay bằng giá trị | print(\"Giỏi\") |\n\nCác dòng sau `return` không bao giờ chạy trong lần gọi đó. Chạy ví dụ và để ý dòng \"Không bao giờ in\".", py: { code: "def xep_loai(diem):\n    if diem >= 8:\n        return \"Giỏi\"\n        print(\"Không bao giờ in\")\n    return \"Khá\"\n\nkq = xep_loai(8.5)\nprint(\"Nơi gọi nhận:\", kq)" } },
    { section: "core", title: "Lỗi hay gặp với hàm", body: "1. **Quên gọi hàm**: viết `xep_loai` mà thiếu `()` → in ra `<function ...>` thay vì kết quả.\n2. **print thay cho return**: hàm in đúng nhưng biến nhận `None`, phép tính sau đó lỗi.\n3. **Định nghĩa sau khi gọi**: Python đọc từ trên xuống, gọi hàm trước dòng `def` sẽ báo `NameError`.\n4. **Thụt lề sai**: dòng `return` lùi ra ngoài thì không còn thuộc hàm.\n\nChạy ví dụ để thấy lỗi số 2: `x` là `None`.", py: { code: "def cong_sai(a, b):\n    print(a + b)\n\ndef cong_dung(a, b):\n    return a + b\n\nx = cong_sai(2, 3)\ny = cong_dung(2, 3)\nprint(\"x =\", x)\nprint(\"y =\", y)" } },
    { section: "apply", title: "Bài tập: tính trung bình", body: "Viết hàm `trung_binh(a, b, c)` trả trung bình ba điểm. Gọi hàm với ba dòng điểm nhập vào và in kết quả một chữ số thập phân.", py: { code: "def trung_binh(a, b, c):\n    pass\n", stdin: "8\n7.5\n9", solution: 'def trung_binh(a, b, c):\n    return (a + b + c) / 3\n\na = float(input())\nb = float(input())\nc = float(input())\nprint(f"{trung_binh(a, b, c):.1f}")', hints: ["Trong hàm, return (a + b + c) / 3.", "Đọc ba số rồi truyền chúng vào hàm."] } },
    { section: "apply", title: "Bài tập: kiểm tra điểm", body: "Viết hàm `diem_hop_le(d)` trả True khi d từ 0 đến 10. Nhập một điểm và in `Hợp lệ` hoặc `Không hợp lệ`.", py: { code: "def diem_hop_le(d):\n    pass\n", stdin: "10.5", solution: 'def diem_hop_le(d):\n    return 0 <= d <= 10\n\nd = float(input())\nprint("Hợp lệ" if diem_hop_le(d) else "Không hợp lệ")', hints: ["Hàm có thể return thẳng một biểu thức bool.", "Dùng 0 <= d <= 10."] } },
  ],
  quiz: [
    { q: "Từ khoá định nghĩa hàm là?", o: ["def", "func", "function", "return"], a: 0, why: "Python dùng def." },
    { q: "return dùng để?", o: ["Trả giá trị và kết thúc hàm", "Chỉ in ra màn hình", "Lặp hàm", "Nhập dữ liệu"], a: 0, why: "Nơi gọi nhận được giá trị return." },
    { kind: "truefalse", q: "Thân hàm chạy ngay khi Python đọc dòng def.", a: false, why: "Thân chỉ chạy khi gọi hàm." },
    { kind: "output", q: "Hàm cộng một in ra gì khi nhận 4?", code: "def f(x):\n    return x + 1\nprint(f(4))", o: ["5", "4", "x + 1", "None"], a: 0, why: "4 + 1 = 5." },
    { q: "Tham số trong def cong(a, b) là?", o: ["a và b", "cong", "def", "Kết quả"], a: 0, why: "a và b nhận đối số khi gọi." },
    { kind: "bug", q: "Hàm không trả tổng. Dòng nào sai?", lines: ["def cong(a, b):", "    print(a + b)", "x = cong(2, 3)", "print(x)"], a: 1, why: "Cần return a + b; print khiến x nhận None." },
    { kind: "blank", q: "Điền để trả bình phương.", code: "def bp(x):\n    ___ x * x", a: "return", why: "return gửi kết quả về nơi gọi." },
    { kind: "multi", q: "Lợi ích của hàm là?", o: ["Dùng lại code", "Đặt tên cho công việc", "Chia bài toán nhỏ", "Tự sửa mọi lỗi"], a: [0, 1, 2], why: "Hàm không tự sửa lỗi." },
    { q: "Một hàm không có return tường minh trả?", o: ["None", "0", "False", "Chuỗi rỗng"], a: 0, why: "Python mặc định trả None." },
    { q: "Tên hàm phù hợp nhất?", o: ["tinh_trung_binh", "abc", "ham1", "x"], a: 0, why: "Tên nói rõ hành động của hàm." },
  ],
};
