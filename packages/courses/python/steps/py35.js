// Step 35 — Dự án nhỏ: phân tích bảng điểm CSV có câu hỏi nghiên cứu (kết chặng 7).
export default {
  id: "py35", lang: "python", file: "so_lop/bao_cao_csv.py", duration: "50 phút",
  summary: "Ghép CSV, xử lý lỗi và hàm để làm thống kê mô tả từ dữ liệu giả lập; đặt câu hỏi, kiểm tra dữ liệu, báo cáo bằng chứng và giới hạn kết luận.",
  slides: [
    { section: "intro", title: "Dự án kết chặng 7", body: "Báo cáo phải đọc bảng điểm, bỏ dòng lỗi có giải thích, tính thống kê và xếp danh sách. Dữ liệu bên ngoài không bao giờ được mặc định là sạch." },
    { section: "visual", visual: "py-data-pipeline", title: "Đường ống dữ liệu", body: "CSV thô → parse → kiểm tra → dữ liệu sạch → thống kê → báo cáo.", py: { code: 'import csv, io\ndata = "ten,diem\\nAn,8\\nBình,sai\\nChi,9\\n"\nsach = []\nfor row in csv.DictReader(io.StringIO(data)):\n    try:\n        sach.append((row["ten"], float(row["diem"])))\n    except ValueError:\n        print("Bỏ dòng:", row["ten"])\nprint(sach)' } },
    { section: "research", title: "Kiểm tra tại ranh giới", body: `Dữ liệu từ tệp là đầu vào không đáng tin. Kiểm tra ngay khi đọc giúp phần còn lại của chương trình chỉ làm việc với dữ liệu sạch và giảm số nhánh lỗi.

> McConnell, S. (2004) *Code Complete*, 2nd ed. Redmond: Microsoft Press.` },
    { section: "research", title: "Đọc kết quả cho đúng", body: `Dùng **dữ liệu giả lập** (dữ liệu tự tạo để luyện), không lấy tên hay điểm thật của bạn trong lớp.

1. **Câu hỏi**: trong tệp này có bao nhiêu bạn đạt từ 8 điểm?
2. **Dự đoán**: đoán trước rồi mới chạy chương trình.
3. **Kiểm tra**: đếm số dòng đúng, số dòng lỗi và số bạn đạt; ghi dạng \`số bạn đạt/tổng số bạn\`.
4. **Nói đúng điều kết quả cho biết**: kết quả chỉ nói về những dòng trong tệp nhỏ này. Nó không cho biết mọi học sinh đều như vậy, và không chứng minh vì sao điểm cao hay thấp.

Mã như \`HS01\` chỉ để phân biệt các dòng, không phải tên thật. Ghi lại dòng bị bỏ để người khác hiểu vì sao số liệu thay đổi.

> OpenStax (2023) *Introductory Statistics 2e: Introduction*. Available at: https://openstax.org/books/introductory-statistics-2e/pages/1-introduction`,
    },
    { section: "ideate", title: "Chuẩn bị bảng điểm", body: "Mỗi dòng có mã thay tên (ví dụ `HS01`) và một điểm từ 0 đến 10. Dòng thiếu mã, mã bị lặp hoặc điểm sai sẽ được tính là lỗi. Báo cáo gồm số dòng đúng, số lỗi, điểm trung bình và số bạn đạt từ 8 điểm." },
    { section: "core", title: "Hàm đọc dữ liệu sạch", body: "Hàm parse nhận text để dễ thử, trả cả dữ liệu tốt và số dòng lỗi.", py: { code: 'import csv, io\ndef doc_csv(text):\n    sach, loi = [], 0\n    for row in csv.DictReader(io.StringIO(text)):\n        try:\n            d = float(row["diem"])\n            if not row["ten"].strip() or not 0 <= d <= 10:\n                raise ValueError\n            sach.append((row["ten"].strip(), d))\n        except (ValueError, KeyError):\n            loi += 1\n    return sach, loi\n\nprint(doc_csv("ten,diem\\nAn,8\\n,7\\nBình,11\\n"))' } },
    { section: "core", title: "Tạo thống kê từ dữ liệu sạch", body: "Sau ranh giới kiểm tra, các hàm thống kê không cần lặp lại kiểm tra kiểu và khoảng.", py: { code: 'sach = [("An", 8), ("Bình", 6.5), ("Chi", 9)]\ndat = sorted([(ten, d) for ten, d in sach if d >= 5], key=lambda x: x[1], reverse=True)\nprint(f"TB: {sum(d for _, d in sach) / len(sach):.1f}")\nfor ten, d in dat:\n    print(ten, d)' } },
    { section: "core", title: "Theo dõi từng dòng qua bộ lọc", body: "Với dữ liệu thử `HS01,8 · HS02,sai · HS03,9 · HS01,7 · HS04,11`:\n\n| Dòng | Đổi số | Trong 0..10 | Mã mới | Kết quả |\n|---|---|---|---|---|\n| HS01,8 | ✓ | ✓ | ✓ | giữ |\n| HS02,sai | ✗ | — | — | lỗi |\n| HS03,9 | ✓ | ✓ | ✓ | giữ |\n| HS01,7 | ✓ | ✓ | ✗ trùng | lỗi |\n| HS04,11 | ✓ | ✗ | — | lỗi |\n\nBáo cáo: **2 dòng đúng, 3 lỗi**, TB 8.5. Hãy tự điền bảng này trước khi chạy dự án." },
    { section: "core", title: "Lỗi hay gặp khi phân tích dữ liệu", body: "1. **Âm thầm bỏ dòng**: số liệu đổi mà người đọc không biết. Luôn báo số dòng bị bỏ.\n2. **Tự \"sửa\" dữ liệu**: đổi 11 thành 10 là bịa dữ liệu. Đánh dấu lỗi, đừng đoán.\n3. **Chia khi không còn dòng nào**: mọi dòng đều lỗi → `ZeroDivisionError`.\n4. **Kết luận quá mức**: tệp 5 dòng giả lập không nói được gì về \"học sinh nói chung\".\n5. **Đưa tên thật vào**: dùng mã `HS01` và dữ liệu tự tạo." },
    { section: "apply", title: "Dự án: báo cáo từ CSV", body: "Dùng dữ liệu **giả lập**, không dùng tên hay điểm thật. Nhập n rồi n dòng `mã,điểm` (ví dụ `HS01,8`). Bỏ dòng mã trống/trùng hoặc điểm sai/ngoài 0..10. In số dòng đúng, số lỗi, điểm trung bình và số bạn đạt từ 8 điểm trên tổng số dòng đúng.", py: { code: "import csv, io\nn = int(input())\n", stdin: "5\nHS01,8\nHS02,sai\nHS03,9\nHS04,11\nHS05,7", solution: 'import csv, io\nn = int(input())\ntext = "\\n".join(input() for _ in range(n))\nsach, loi, da_gap = [], 0, set()\nfor row in csv.reader(io.StringIO(text)):\n    try:\n        ma, raw = row\n        ma = ma.strip()\n        diem = float(raw)\n        if not ma or ma in da_gap or not 0 <= diem <= 10:\n            raise ValueError\n        da_gap.add(ma)\n        sach.append((ma, diem))\n    except (ValueError, TypeError):\n        loi += 1\nprint(f"Dòng đúng: {len(sach)} | Lỗi: {loi}")\nif sach:\n    print(f"Điểm trung bình: {sum(d for _, d in sach) / len(sach):.1f}")\n    dat = sum(d >= 8 for _, d in sach)\n    print(f"Đạt từ 8: {dat}/{len(sach)}")', hints: ["Dùng mã thay tên; tách mỗi dòng bằng csv.reader, đổi điểm sang float và kiểm khoảng.", "Dùng set để phát hiện mã lặp; chỉ tính trung bình khi có ít nhất một dòng đúng."] } },
    { section: "apply", title: "Bài tập: kiểm thử dữ liệu rỗng", body: "Viết hàm `trung_binh(ds)` trả None nếu list rỗng, ngược lại trả trung bình điểm trong các tuple. Thử với list rỗng và một list có dữ liệu.", py: { code: "def trung_binh(ds):\n    pass\n", solution: 'def trung_binh(ds):\n    if not ds:\n        return None\n    return sum(d for _, d in ds) / len(ds)\n\nprint(trung_binh([]))\nprint(trung_binh([("An", 8), ("Bình", 6)]))', hints: ["if not ds: return None.", "Mỗi phần tử là tuple (tên, điểm)."] } },
  ],
  quiz: [
    { q: "Nên kiểm dữ liệu tệp ở đâu?", o: ["Ngay khi đọc vào", "Sau khi in báo cáo", "Không cần", "Chỉ khi chương trình sập"], a: 0, why: "Giữ phần lõi làm việc với dữ liệu sạch." },
    { q: "Dòng điểm 11 nên?", o: ["Bị đánh dấu lỗi", "Được giữ", "Đổi thành 10 tự động", "Đổi thành 0"], a: 0, why: "Ngoài miền điểm 0..10." },
    { kind: "truefalse", q: "Một bộ dữ liệu giả lập nhỏ có thể đại diện cho mọi trường học.", a: false, why: "Cỡ mẫu và cách tạo dữ liệu giới hạn khả năng khái quát." },
    { kind: "output", q: "Trung bình hai tuple điểm in ra gì?", code: "ds=[('An',8),('Bình',6)]\nprint(sum(d for _,d in ds)/len(ds))", o: ["7.0", "14", "8", "6"], a: 0, why: "(8+6)/2 = 7." },
    { q: "Dữ liệu sạch nên được lưu dạng?", o: ["Mã và điểm đã đổi sang số", "Dòng thô chưa kiểm", "Chỉ xâu", "Ảnh"], a: 0, why: "Phần thống kê cần kiểu đúng; mã thay tên thật." },
    { kind: "bug", q: "Dòng nào có thể chia 0 khi không có bản ghi tốt?", lines: ["sach = []", "tong = sum(d for _,d in sach)", "tb = tong / len(sach)", "print(tb)"], a: 2, why: "Cần if sach trước khi chia." },
    { kind: "blank", q: "Điền sắp xếp điểm giảm dần.", code: "sach.sort(key=lambda x: x[1], ___=True)", a: "reverse", why: "reverse=True đảo thứ tự." },
    { kind: "multi", q: "Cách báo cáo nào đúng?", o: ["Dùng mã thay tên thật", "Nêu số dòng bị bỏ", "Nói tệp nhỏ này đại diện mọi học sinh", "Ghi rõ dữ liệu là giả lập"], a: [0, 1, 3], why: "Mã giúp không lộ tên; cần nói rõ dòng bị bỏ và dữ liệu dùng để luyện." },
    { q: "Hàm parse nên trả thêm số lỗi để?", o: ["Báo cáo chất lượng dữ liệu", "Tăng điểm", "Đổi encoding", "Xoá CSV"], a: 0, why: "Người dùng biết có bao nhiêu dòng bị bỏ." },
    { kind: "order", q: "Thứ tự pipeline.", items: ["Đọc CSV", "Kiểm và đổi kiểu", "Tính thống kê", "In báo cáo"], a: [0, 1, 2, 3], why: "Thống kê chỉ dùng dữ liệu đã kiểm." },
  ],
};
