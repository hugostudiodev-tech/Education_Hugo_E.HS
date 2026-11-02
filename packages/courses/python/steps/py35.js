// Step 35 — Dự án nhỏ: báo cáo điểm từ tệp CSV (kết chặng 7).
export default {
  id: "py35", lang: "python", file: "so_lop/bao_cao_csv.py", duration: "50 phút",
  summary: "Ghép CSV, xử lý lỗi, comprehension và hàm để kiểm dữ liệu rồi tạo báo cáo điểm cả lớp.",
  slides: [
    { section: "intro", title: "Dự án kết chặng 7", body: "Báo cáo phải đọc bảng điểm, bỏ dòng lỗi có giải thích, tính thống kê và xếp danh sách. Dữ liệu bên ngoài không bao giờ được mặc định là sạch." },
    { section: "visual", title: "Đường ống dữ liệu", body: "CSV thô → parse → kiểm tra → dữ liệu sạch → thống kê → báo cáo.", py: { code: 'import csv, io\ndata = "ten,diem\\nAn,8\\nBình,sai\\nChi,9\\n"\nsach = []\nfor row in csv.DictReader(io.StringIO(data)):\n    try:\n        sach.append((row["ten"], float(row["diem"])))\n    except ValueError:\n        print("Bỏ dòng:", row["ten"])\nprint(sach)' } },
    { section: "research", title: "Kiểm tra tại ranh giới", body: `Dữ liệu từ tệp là đầu vào không đáng tin. Kiểm tra ngay khi đọc giúp phần còn lại của chương trình chỉ làm việc với dữ liệu sạch và giảm số nhánh lỗi.

> McConnell, S. (2004) *Code Complete*, 2nd ed. Redmond: Microsoft Press.` },
    { section: "ideate", title: "Quy tắc báo cáo", body: "Dòng hợp lệ cần tên không rỗng và điểm số trong 0..10. Báo cáo gồm số dòng hợp lệ, trung bình, cao nhất và danh sách đạt theo điểm giảm dần." },
    { section: "core", title: "Hàm đọc dữ liệu sạch", body: "Hàm parse nhận text để dễ thử, trả cả dữ liệu tốt và số dòng lỗi.", py: { code: 'import csv, io\ndef doc_csv(text):\n    sach, loi = [], 0\n    for row in csv.DictReader(io.StringIO(text)):\n        try:\n            d = float(row["diem"])\n            if not row["ten"].strip() or not 0 <= d <= 10:\n                raise ValueError\n            sach.append((row["ten"].strip(), d))\n        except (ValueError, KeyError):\n            loi += 1\n    return sach, loi\n\nprint(doc_csv("ten,diem\\nAn,8\\n,7\\nBình,11\\n"))' } },
    { section: "core", title: "Tạo thống kê từ dữ liệu sạch", body: "Sau ranh giới kiểm tra, các hàm thống kê không cần lặp lại kiểm tra kiểu và khoảng.", py: { code: 'sach = [("An", 8), ("Bình", 6.5), ("Chi", 9)]\ndat = sorted([(ten, d) for ten, d in sach if d >= 5], key=lambda x: x[1], reverse=True)\nprint(f"TB: {sum(d for _, d in sach) / len(sach):.1f}")\nfor ten, d in dat:\n    print(ten, d)' } },
    { section: "apply", title: "Dự án: báo cáo từ CSV", body: "Nhập n rồi n dòng `tên,điểm` không tiêu đề. Bỏ dòng tên rỗng, điểm sai dạng/ngoài khoảng. In số hợp lệ, số lỗi, TB và danh sách hợp lệ theo điểm giảm dần.", py: { code: "import csv, io\nn = int(input())\n", stdin: "5\nAn,8\nBình,sai\nChi,9\nDũng,11\nHà,7", solution: 'import csv, io\nn = int(input())\ntext = "\\n".join(input() for _ in range(n))\nsach, loi = [], 0\nfor row in csv.reader(io.StringIO(text)):\n    try:\n        ten, raw = row\n        diem = float(raw)\n        if not ten.strip() or not 0 <= diem <= 10:\n            raise ValueError\n        sach.append((ten.strip(), diem))\n    except (ValueError, TypeError):\n        loi += 1\nsach.sort(key=lambda item: item[1], reverse=True)\nprint(f"Hợp lệ: {len(sach)} | Lỗi: {loi}")\nif sach:\n    print(f"TB: {sum(d for _, d in sach) / len(sach):.1f}")\n    for ten, diem in sach:\n        print(f"{ten}: {diem}")', hints: ["Mỗi row phải tháo được đúng hai cột; float và kiểm 0..10 trong try.", "Chỉ tính TB khi list sach không rỗng."] } },
    { section: "apply", title: "Bài tập: kiểm thử dữ liệu rỗng", body: "Viết hàm `trung_binh(ds)` trả None nếu list rỗng, ngược lại trả trung bình điểm trong các tuple. Thử với list rỗng và một list có dữ liệu.", py: { code: "def trung_binh(ds):\n    pass\n", solution: 'def trung_binh(ds):\n    if not ds:\n        return None\n    return sum(d for _, d in ds) / len(ds)\n\nprint(trung_binh([]))\nprint(trung_binh([("An", 8), ("Bình", 6)]))', hints: ["if not ds: return None.", "Mỗi phần tử là tuple (tên, điểm)."] } },
  ],
  quiz: [
    { q: "Nên kiểm dữ liệu tệp ở đâu?", o: ["Ngay khi đọc vào", "Sau khi in báo cáo", "Không cần", "Chỉ khi chương trình sập"], a: 0, why: "Giữ phần lõi làm việc với dữ liệu sạch." },
    { q: "Dòng điểm 11 nên?", o: ["Bị đánh dấu lỗi", "Được giữ", "Đổi thành 10 tự động", "Đổi thành 0"], a: 0, why: "Ngoài miền điểm 0..10." },
    { kind: "truefalse", q: "Phải kiểm list không rỗng trước khi chia cho len(list).", a: true, why: "Tránh chia cho 0." },
    { kind: "output", q: "Trung bình hai tuple điểm in ra gì?", code: "ds=[('An',8),('Bình',6)]\nprint(sum(d for _,d in ds)/len(ds))", o: ["7.0", "14", "8", "6"], a: 0, why: "(8+6)/2 = 7." },
    { q: "Dữ liệu sạch nên được lưu dạng?", o: ["Tên và điểm đã đổi sang số", "Dòng thô chưa kiểm", "Chỉ xâu", "Ảnh"], a: 0, why: "Phần thống kê cần kiểu đúng." },
    { kind: "bug", q: "Dòng nào có thể chia 0 khi không có bản ghi tốt?", lines: ["sach = []", "tong = sum(d for _,d in sach)", "tb = tong / len(sach)", "print(tb)"], a: 2, why: "Cần if sach trước khi chia." },
    { kind: "blank", q: "Điền sắp xếp điểm giảm dần.", code: "sach.sort(key=lambda x: x[1], ___=True)", a: "reverse", why: "reverse=True đảo thứ tự." },
    { kind: "multi", q: "Dòng nào cần coi là lỗi?", o: ["Tên rỗng", "Điểm là chữ", "Điểm ngoài 0..10", "An,8"], a: [0, 1, 2], why: "An,8 là bản ghi hợp lệ." },
    { q: "Hàm parse nên trả thêm số lỗi để?", o: ["Báo cáo chất lượng dữ liệu", "Tăng điểm", "Đổi encoding", "Xoá CSV"], a: 0, why: "Người dùng biết có bao nhiêu dòng bị bỏ." },
    { kind: "order", q: "Thứ tự pipeline.", items: ["Đọc CSV", "Kiểm và đổi kiểu", "Tính thống kê", "In báo cáo"], a: [0, 1, 2, 3], why: "Thống kê chỉ dùng dữ liệu đã kiểm." },
  ],
};
