// Step 36 — Lớp và đối tượng: mô hình hoá học sinh.
export default {
  id: "py36", lang: "python", file: "so_lop/hoc_sinh.py", duration: "45 phút",
  summary: "Tạo class, thuộc tính, phương thức và nhiều đối tượng để mô hình hoá học sinh trong Sổ Lớp.",
  slides: [
    { section: "intro", title: "Gom dữ liệu và hành vi", body: "Class là bản thiết kế; object là một đối tượng cụ thể. Một học sinh có tên, list điểm và các hành vi tính trung bình, xếp loại." },
    { section: "visual", title: "Bản thiết kế và các đối tượng", body: "Cùng class HocSinh tạo được nhiều object độc lập.", py: { code: 'class HocSinh:\n    def __init__(self, ten, diem):\n        self.ten = ten\n        self.diem = diem\n\n    def trung_binh(self):\n        return sum(self.diem) / len(self.diem)\n\nan = HocSinh("An", [8, 9, 7])\nbinh = HocSinh("Bình", [6, 7, 8])\nprint(an.ten, an.trung_binh())\nprint(binh.ten, binh.trung_binh())' } },
    { section: "research", title: "Đóng gói", body: `Đóng gói đặt dữ liệu và các thao tác liên quan gần nhau. Thay vì truyền tên và điểm qua nhiều hàm rời, đối tượng tự giữ trạng thái hợp lệ của nó.

> Python Software Foundation (2026) *Classes*. Available at: https://docs.python.org/3/tutorial/classes.html` },
    { section: "ideate", title: "Thiết kế HocSinh", body: "Thuộc tính tối thiểu: `ten`, `diem`. Phương thức: `trung_binh`, `xep_loai`, `them_diem`. Chỉ thêm dữ liệu mà dự án thực sự dùng." },
    { section: "core", title: "__init__ và self", body: "`__init__` chạy khi tạo object. `self` là object hiện tại; Python tự truyền nó khi gọi phương thức qua object.", py: { code: 'class HocSinh:\n    def __init__(self, ten):\n        self.ten = ten\n        self.diem = []\n\n    def them_diem(self, diem):\n        if 0 <= diem <= 10:\n            self.diem.append(diem)\n\nhs = HocSinh("Chi")\nhs.them_diem(9)\nhs.them_diem(11)\nprint(hs.ten, hs.diem)' } },
    { section: "core", title: "Phương thức biểu diễn", body: "`__str__` trả xâu thân thiện khi print object.", py: { code: 'class HocSinh:\n    def __init__(self, ten, diem):\n        self.ten, self.diem = ten, diem\n    def __str__(self):\n        return f"{self.ten}: {len(self.diem)} điểm"\n\nprint(HocSinh("An", [8, 9]))' } },
    { section: "apply", title: "Bài tập: class HocSinh", body: "Tạo class nhận tên và list điểm, có `trung_binh()` và `xep_loai()` (Đạt nếu TB ≥ 5). Nhập tên, 3 điểm và in `Tên: TB X.X — ...`.", py: { code: "class HocSinh:\n    pass\n", stdin: "An\n8\n7\n9", solution: 'class HocSinh:\n    def __init__(self, ten, diem):\n        self.ten = ten\n        self.diem = diem\n\n    def trung_binh(self):\n        return sum(self.diem) / len(self.diem)\n\n    def xep_loai(self):\n        return "Đạt" if self.trung_binh() >= 5 else "Chưa đạt"\n\nten = input().strip().title()\ndiem = [float(input()) for _ in range(3)]\nhs = HocSinh(ten, diem)\nprint(f"{hs.ten}: TB {hs.trung_binh():.1f} — {hs.xep_loai()}")', hints: ["__init__ gán self.ten và self.diem.", "xep_loai gọi self.trung_binh()."] } },
    { section: "apply", title: "Bài tập: thêm điểm có kiểm tra", body: "Tạo phương thức `them_diem(d)` trả True và thêm khi d hợp lệ; trả False và không thêm khi ngoài 0..10. Thử với 8 và 12 rồi in list điểm.", py: { code: "class HocSinh:\n    def __init__(self):\n        self.diem = []\n", solution: 'class HocSinh:\n    def __init__(self):\n        self.diem = []\n    def them_diem(self, d):\n        if not 0 <= d <= 10:\n            return False\n        self.diem.append(d)\n        return True\n\nhs = HocSinh()\nprint(hs.them_diem(8))\nprint(hs.them_diem(12))\nprint(hs.diem)', hints: ["Kiểm trường hợp sai và return False trước.", "Chỉ append rồi return True khi hợp lệ."] } },
  ],
  quiz: [
    { q: "Class là?", o: ["Bản thiết kế cho object", "Một object duy nhất", "Một vòng lặp", "Một tệp CSV"], a: 0, why: "Class mô tả thuộc tính và hành vi." },
    { q: "__init__ chạy khi?", o: ["Tạo object", "Xoá object", "Import math", "Kết thúc for"], a: 0, why: "Nó khởi tạo object mới." },
    { kind: "truefalse", q: "Hai object cùng class có thể giữ dữ liệu khác nhau.", a: true, why: "Mỗi instance có thuộc tính riêng." },
    { kind: "output", q: "Thuộc tính x của object được in là?", code: "class A:\n def __init__(self,x): self.x=x\na=A(3);print(a.x)", o: ["3", "x", "A", "None"], a: 0, why: "self.x nhận 3." },
    { q: "self đại diện cho?", o: ["Object hiện tại", "Class khác", "Module", "Mọi object"], a: 0, why: "Phương thức thao tác trên instance hiện tại." },
    { kind: "bug", q: "Dòng nào thiếu self?", lines: ["class HS:", "    def __init__(ten):", "        ten = ten", "print(HS('An'))"], a: 1, why: "Phải def __init__(self, ten)." },
    { kind: "blank", q: "Điền để lưu tên vào object.", code: "self.ten = ___", a: "ten", why: "Tham số ten được gán vào thuộc tính." },
    { kind: "multi", q: "Thành phần phù hợp của class HocSinh?", o: ["Thuộc tính ten", "Thuộc tính diem", "Phương thức trung_binh", "Module random bắt buộc"], a: [0, 1, 2], why: "random không phải phần bắt buộc của mô hình." },
    { q: "Phương thức __str__ ảnh hưởng tới?", o: ["print(object)", "Phép chia", "Import", "Đọc CSV"], a: 0, why: "Nó tạo biểu diễn xâu thân thiện." },
    { q: "Gọi phương thức trên hs viết?", o: ["hs.trung_binh()", "HocSinh->trung_binh", "trung_binh.hs", "self(hs)"], a: 0, why: "Dùng dấu chấm trên object." },
  ],
};
