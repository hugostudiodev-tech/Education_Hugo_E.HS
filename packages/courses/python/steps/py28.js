// Step 28 — Chia nhỏ bài toán: hàm gọi hàm, docstring.
export default {
  id: "py28", lang: "python", file: "so_lop/chia_nho.py", duration: "45 phút",
  summary: "Chia bài toán thành hàm nhỏ, viết docstring, kết hợp hàm và thử các trường hợp biên.",
  slides: [
    { section: "intro", title: "Mỗi hàm một trách nhiệm", body: "Bài toán lớn dễ làm hơn khi chia thành các bước có tên. Hàm nhỏ dễ đọc, dễ thử và dễ dùng lại." },
    { section: "visual", visual: "py-call-tree", title: "Dây chuyền báo cáo", body: "Dữ liệu đi qua từng hàm: kiểm tra → tính trung bình → xếp loại → định dạng.", py: { code: 'def trung_binh(ds):\n    return sum(ds) / len(ds)\n\ndef xep_loai(tb):\n    return "Đạt" if tb >= 5 else "Chưa đạt"\n\ndef bao_cao(ds):\n    tb = trung_binh(ds)\n    return f"TB {tb:.1f} — {xep_loai(tb)}"\n\nprint(bao_cao([7, 8, 6]))' } },
    { section: "research", title: "Docstring là hợp đồng nhỏ", body: `Chuỗi đầu tiên trong thân hàm là docstring. Nó mô tả mục đích, dữ liệu vào và kết quả, và được công cụ **help()** đọc tự động.

> Python Software Foundation (2001) *PEP 257 — Docstring Conventions*. Available at: https://peps.python.org/pep-0257/` },
    { section: "ideate", title: "Tách dự án theo động từ", body: "Liệt kê các động từ: đọc dữ liệu, kiểm tra điểm, tính trung bình, xếp loại, tạo báo cáo. Mỗi động từ là ứng viên cho một hàm." },
    { section: "core", title: "Docstring và help", body: "Docstring nằm ngay sau dòng def, trong dấu ba nháy.", py: { code: 'def diem_hop_le(diem):\n    """Trả True nếu điểm nằm trong khoảng 0..10."""\n    return 0 <= diem <= 10\n\nprint(diem_hop_le.__doc__)\nprint(diem_hop_le(8))' } },
    { section: "core", title: "Kiểm tra trường hợp biên", body: "Với điểm, hãy thử 0, 10, ngay dưới 0 và ngay trên 10. Hàm nhỏ cho phép thử trực tiếp không cần chạy cả dự án.", py: { code: 'def diem_hop_le(diem):\n    return 0 <= diem <= 10\n\nfor d in (0, 10, -0.1, 10.1):\n    print(d, diem_hop_le(d))' } },
    { section: "core", title: "Theo dõi hàm gọi hàm", body: "`bao_cao([7, 8, 6])` chạy như sau. Mỗi hàm **chờ** hàm con trả về rồi mới làm tiếp:\n\n| Thứ tự | Đang chạy | Việc làm | Trả về |\n|---|---|---|---|\n| 1 | bao_cao | gọi trung_binh([7, 8, 6]) | (chờ) |\n| 2 | trung_binh | 21 / 3 | 7.0 |\n| 3 | bao_cao | tb = 7.0, gọi xep_loai(7.0) | (chờ) |\n| 4 | xep_loai | 7.0 >= 5 | \"Đạt\" |\n| 5 | bao_cao | ghép xâu | \"TB 7.0 — Đạt\" |\n\nMẹo: thử từng hàm nhỏ trước. Hàm con đúng thì chỉ còn kiểm cách ghép." },
    { section: "core", title: "Lỗi hay gặp khi chia nhỏ", body: "1. **Hàm \"làm tất cả\"**: vừa nhập, vừa tính, vừa in → không thể thử riêng phần tính toán. Tách nhập/in ra `main`.\n2. **Dùng biến ngoài thay vì tham số**: hàm chỉ đúng với một list cụ thể. Truyền dữ liệu qua tham số.\n3. **Docstring đặt sai chỗ**: phải là **dòng đầu tiên** trong thân hàm; đặt sau lệnh khác thì `__doc__` là `None`.\n4. **Không thử ca biên**: list rỗng làm `sum(ds) / len(ds)` chia cho 0.\n\nChạy ví dụ: `help()` đọc docstring tự động.", py: { code: "def trung_binh(ds):\n    \"\"\"Trả trung bình của list điểm.\n\n    ds: list số, không rỗng.\n    \"\"\"\n    return sum(ds) / len(ds)\n\nhelp(trung_binh)" } },
    { section: "apply", title: "Bài tập: báo cáo học sinh", body: "Viết ba hàm `trung_binh`, `dat`, `bao_cao`. Nhập tên và ba điểm; in `Tên: TB X.X — Đạt/Chưa đạt`.", py: { code: "def trung_binh(ds):\n    pass\n", stdin: "An\n7\n5\n6", solution: 'def trung_binh(ds):\n    """Trả trung bình của list điểm không rỗng."""\n    return sum(ds) / len(ds)\n\ndef dat(tb):\n    return tb >= 5\n\ndef bao_cao(ten, ds):\n    tb = trung_binh(ds)\n    ket_qua = "Đạt" if dat(tb) else "Chưa đạt"\n    return f"{ten}: TB {tb:.1f} — {ket_qua}"\n\nten = input()\ndiem = [float(input()) for _ in range(3)]\nprint(bao_cao(ten, diem))', hints: ["bao_cao gọi trung_binh, rồi truyền kết quả vào dat.", "Mỗi hàm return kết quả thay vì phụ thuộc biến ngoài."] } },
    { section: "apply", title: "Bài tập: thử ca biên", body: "Viết hàm `diem_hop_le`, sau đó duyệt list `[0, 10, -1, 11]` và in mỗi giá trị cùng kết quả True/False.", py: { code: "def diem_hop_le(diem):\n    pass\n", solution: 'def diem_hop_le(diem):\n    """Kiểm tra điểm trong khoảng đóng 0..10."""\n    return 0 <= diem <= 10\n\nfor diem in [0, 10, -1, 11]:\n    print(diem, diem_hop_le(diem))', hints: ["Khoảng đóng gồm cả 0 và 10.", "Duyệt list ca thử bằng for."] } },
  ],
  quiz: [
    { q: "Một hàm tốt thường nên?", o: ["Làm một việc rõ ràng", "Làm mọi việc", "Dài nhất có thể", "Dùng nhiều global"], a: 0, why: "Trách nhiệm đơn giúp dễ hiểu và thử." },
    { q: "Docstring nằm ở đâu?", o: ["Chuỗi đầu tiên trong thân hàm", "Sau return", "Ngoài tệp", "Trong tên hàm"], a: 0, why: "Python lưu chuỗi đầu tiên làm __doc__." },
    { kind: "truefalse", q: "Một hàm có thể gọi hàm khác.", a: true, why: "Đó là cách ghép các bước nhỏ." },
    { kind: "output", q: "Hai hàm gọi nhau in ra gì với b(3)?", code: "def a(x): return x+1\ndef b(x): return a(x)*2\nprint(b(3))", o: ["8", "7", "6", "4"], a: 0, why: "a(3)=4, rồi nhân 2." },
    { q: "Ca biên của khoảng điểm 0..10 gồm?", o: ["0 và 10", "5", "7", "Chỉ số nguyên"], a: 0, why: "Hai ranh giới cần được thử." },
    { kind: "bug", q: "Hàm nào phụ thuộc biến ngoài không cần thiết?", lines: ["diem = [7, 8]", "def tb():", "    return sum(diem) / len(diem)", "print(tb())"], a: 1, why: "Nên nhận diem làm tham số: def tb(diem)." },
    { kind: "blank", q: "Điền để xem docstring.", code: "print(ham.___)", a: "__doc__", why: "Docstring được lưu trong __doc__." },
    { kind: "multi", q: "Lợi ích của hàm nhỏ?", o: ["Dễ thử", "Dễ đặt tên", "Dễ dùng lại", "Luôn chạy nhanh hơn"], a: [0, 1, 2], why: "Chia hàm không đảm bảo tăng tốc." },
    { q: "Tên hàm nào thể hiện một trách nhiệm?", o: ["tinh_trung_binh", "xu_ly_moi_thu", "lam", "abc"], a: 0, why: "Tên cụ thể nói rõ kết quả." },
    { q: "help(ham) sử dụng nội dung nào?", o: ["Docstring", "Biến global", "Kết quả print", "Tên tệp"], a: 0, why: "help đọc tài liệu của đối tượng." },
  ],
};
