// Step 27 — Tham số, giá trị mặc định và phạm vi biến.
export default {
  id: "py27", lang: "python", file: "so_lop/tham_so.py", duration: "45 phút",
  summary: "Dùng đối số vị trí/từ khoá, giá trị mặc định, nhiều return và hiểu phạm vi biến cục bộ.",
  slides: [
    { section: "intro", title: "Làm hàm linh hoạt", body: "Tham số cho phép một hàm xử lý nhiều dữ liệu. Giá trị mặc định giúp lời gọi ngắn hơn, còn đối số từ khoá làm lời gọi dễ đọc." },
    { section: "visual", title: "Một hàm, nhiều cách gọi", body: "Tham số có mặc định phải đứng sau tham số bắt buộc.", py: { code: 'def hien_thi_diem(ten, diem, don_vi="điểm"):\n    return f"{ten}: {diem} {don_vi}"\n\nprint(hien_thi_diem("An", 8.5))\nprint(hien_thi_diem(diem=9, ten="Bình", don_vi="/10"))' } },
    { section: "research", title: "Phạm vi tên", body: `Biến tạo trong hàm thường chỉ tồn tại trong **phạm vi cục bộ** của lần gọi đó. Cô lập trạng thái giúp các hàm ít vô tình ảnh hưởng lẫn nhau.

> Python Software Foundation (2026) *Scopes and Namespaces*. Available at: https://docs.python.org/3/tutorial/classes.html#python-scopes-and-namespaces` },
    { section: "ideate", title: "Thiết kế chữ ký hàm", body: "Dữ liệu bắt buộc đặt trước; tuỳ chọn đặt sau với mặc định. Ví dụ `tinh_diem(thuong, he_so=1)` cho trường hợp thông thường ngắn gọn." },
    { section: "core", title: "Đối số vị trí và từ khoá", body: "Đối số vị trí ghép theo thứ tự. Đối số từ khoá ghép theo tên nên có thể đổi thứ tự.", py: { code: 'def tinh_tien(so_luong, don_gia, giam=0):\n    return so_luong * don_gia * (1 - giam)\n\nprint(tinh_tien(3, 10000))\nprint(tinh_tien(don_gia=10000, so_luong=3, giam=0.1))' } },
    { section: "core", title: "Biến cục bộ", body: "Biến `ket_qua` chỉ có trong hàm. Tránh `global`; hãy truyền dữ liệu vào và return dữ liệu ra.", py: { code: 'def cong_thuong(diem, thuong=0.5):\n    ket_qua = min(diem + thuong, 10)\n    return ket_qua\n\nprint(cong_thuong(9.8))\nprint(cong_thuong(8, thuong=1))' } },
    { section: "apply", title: "Bài tập: điểm có trọng số", body: "Viết hàm `diem_he_so(diem, he_so=1)` trả tích. Nhập điểm; gọi mặc định và với `he_so=2`, in hai kết quả.", py: { code: "def diem_he_so(diem, he_so=1):\n    pass\n", stdin: "8.5", solution: 'def diem_he_so(diem, he_so=1):\n    return diem * he_so\n\ndiem = float(input())\nprint(diem_he_so(diem))\nprint(diem_he_so(diem, he_so=2))', hints: ["return diem * he_so.", "Lần gọi thứ hai truyền he_so=2."] } },
    { section: "apply", title: "Bài tập: chuẩn hoá điểm", body: "Viết hàm `gioi_han(diem, thap=0, cao=10)` trả điểm nằm trong khoảng. Nhập điểm và in kết quả.", py: { code: "def gioi_han(diem, thap=0, cao=10):\n    pass\n", stdin: "12", solution: 'def gioi_han(diem, thap=0, cao=10):\n    return max(thap, min(diem, cao))\n\ndiem = float(input())\nprint(gioi_han(diem))', hints: ["min(diem, cao) chặn phía trên.", "Bọc tiếp bằng max(thap, ...)."] } },
  ],
  quiz: [
    { q: "Tham số mặc định nên đứng?", o: ["Sau tham số bắt buộc", "Trước mọi tham số", "Ở ngoài hàm", "Bất kỳ"], a: 0, why: "Python yêu cầu tham số không mặc định đứng trước." },
    { q: "Đối số từ khoá ghép theo?", o: ["Tên tham số", "Vị trí dòng", "Kiểu dữ liệu", "Giá trị"], a: 0, why: "Ví dụ diem=8." },
    { kind: "truefalse", q: "Biến tạo trong hàm mặc định là biến cục bộ.", a: true, why: "Nó thuộc phạm vi hàm." },
    { kind: "output", q: "Hàm dùng tham số mặc định in ra gì?", code: "def f(x, y=2):\n    return x * y\nprint(f(3))", o: ["6", "3", "2", "None"], a: 0, why: "y dùng mặc định 2." },
    { q: "Lời gọi nào rõ ý nhất khi có nhiều tuỳ chọn?", o: ["f(8, thuong=1)", "f(8, 1)", "f()", "def f"], a: 0, why: "Tên tham số giải thích số 1." },
    { kind: "bug", q: "Dòng định nghĩa nào sai cú pháp?", lines: ["def a(x, y=0): pass", "def b(x=0, y): pass", "def c(x=0): pass", "def d(x, y): pass"], a: 1, why: "Tham số bắt buộc y không thể đứng sau x có mặc định." },
    { kind: "blank", q: "Điền giá trị mặc định.", code: "def chao(ten, loi=___):", a: ['"Xin chào"', "'Xin chào'"], why: "Mặc định là một xâu." },
    { kind: "multi", q: "Cách giảm phụ thuộc biến toàn cục?", o: ["Truyền tham số", "Dùng return", "Tạo biến cục bộ", "Dùng global nhiều hơn"], a: [0, 1, 2], why: "global tăng liên kết ngầm." },
    { q: "max(0, min(12, 10)) bằng?", o: ["10", "12", "0", "22"], a: 0, why: "min chặn 12 xuống 10." },
    { q: "Lời gọi f(y=2, x=1) hợp lệ khi def f(x, y)?", o: ["Có", "Không"], a: 0, why: "Đối số từ khoá có thể đổi thứ tự." },
  ],
};
