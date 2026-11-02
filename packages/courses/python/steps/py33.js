// Step 33 — Tệp CSV: bảng điểm cả lớp.
export default {
  id: "py33", lang: "python", file: "so_lop/bang_diem_csv.py", duration: "45 phút",
  summary: "Đọc và ghi CSV bằng module csv, dùng DictReader/DictWriter và đổi kiểu dữ liệu từ văn bản.",
  slides: [
    { section: "intro", title: "Bảng dữ liệu trong tệp", body: "CSV lưu mỗi bản ghi trên một dòng và các cột cách nhau bằng dấu phẩy. Module `csv` xử lý dấu phẩy, dấu nháy và xuống dòng đúng chuẩn." },
    { section: "visual", title: "Từ dòng thành cột", body: "`DictReader` lấy hàng tiêu đề làm tên khoá, giúp code đọc `row['ten']` thay vì nhớ số cột.", py: { code: 'import csv, io\ndata = "ten,diem\\nAn,8.5\\nBình,7\\n"\nfor row in csv.DictReader(io.StringIO(data)):\n    print(row["ten"], float(row["diem"]))' } },
    { section: "research", title: "CSV không phải chỉ split dấu phẩy", body: `Một ô CSV có thể chứa dấu phẩy nếu được đặt trong dấu nháy. Module **csv** hiểu quy tắc này, còn **line.split(",")** sẽ tách sai.

> Python Software Foundation (2026) *csv — CSV File Reading and Writing*. Available at: https://docs.python.org/3/library/csv.html` },
    { section: "ideate", title: "Lược đồ bảng điểm", body: "Ba cột: `ma`, `ten`, `diem`. CSV lưu tất cả dưới dạng chữ, nên phải đổi `diem` sang float và kiểm khoảng trước khi tính." },
    { section: "core", title: "Đọc bằng DictReader", body: "Mỗi hàng là dict có khoá từ tiêu đề.", py: { code: 'import csv, io\ndata = "ma,ten,diem\\nHS01,An,8.5\\nHS02,Bình,7.0\\n"\nrows = list(csv.DictReader(io.StringIO(data)))\nprint(rows[0])\nprint(sum(float(r["diem"]) for r in rows) / len(rows))' } },
    { section: "core", title: "Ghi bằng DictWriter", body: "`writeheader()` ghi tiêu đề; `writerow()` ghi một dict theo fieldnames.", py: { code: 'import csv, io\nout = io.StringIO()\nwriter = csv.DictWriter(out, fieldnames=["ten", "diem"], lineterminator="\\n")\nwriter.writeheader()\nwriter.writerow({"ten": "An", "diem": 8.5})\nprint(out.getvalue(), end="")' } },
    { section: "apply", title: "Bài tập: đọc bảng điểm CSV", body: "Nhập n rồi n dòng CSV dạng `tên,điểm` không có tiêu đề. Dùng `csv.reader`; in từng tên và điểm, cuối cùng in trung bình một chữ số.", py: { code: "import csv, io\nn = int(input())\n", stdin: "3\nAn,8\nBình,7.5\nChi,9", solution: 'import csv, io\nn = int(input())\ndata = "\\n".join(input() for _ in range(n))\nrows = list(csv.reader(io.StringIO(data)))\ndiem = []\nfor ten, value in rows:\n    d = float(value)\n    diem.append(d)\n    print(f"{ten}: {d}")\nprint(f"TB: {sum(diem) / len(diem):.1f}")', hints: ["Ghép n dòng rồi đưa vào io.StringIO.", "csv.reader trả list cột; đổi cột điểm sang float."] } },
    { section: "apply", title: "Bài tập: xuất CSV", body: "Dùng DictWriter ghi hai học sinh An 8.5 và Bình 7 vào StringIO, có tiêu đề `ten,diem`, rồi in nội dung.", py: { code: "import csv, io\nout = io.StringIO()\n", solution: 'import csv, io\nout = io.StringIO()\nwriter = csv.DictWriter(out, fieldnames=["ten", "diem"], lineterminator="\\n")\nwriter.writeheader()\nwriter.writerow({"ten": "An", "diem": 8.5})\nwriter.writerow({"ten": "Bình", "diem": 7})\nprint(out.getvalue(), end="")', hints: ["Tạo DictWriter với fieldnames.", "Gọi writeheader rồi writerow cho từng dict."] } },
  ],
  quiz: [
    { q: "CSV thường dùng để lưu?", o: ["Dữ liệu dạng bảng", "Ảnh", "Âm thanh", "Mã máy"], a: 0, why: "Mỗi dòng là bản ghi, mỗi cột là trường." },
    { q: "DictReader dùng hàng đầu làm?", o: ["Tên cột", "Dữ liệu cuối", "Tên tệp", "Kiểu số"], a: 0, why: "Hàng tiêu đề trở thành khoá." },
    { kind: "truefalse", q: "Đọc điểm từ CSV cần đổi từ xâu sang số.", a: true, why: "CSV là văn bản." },
    { kind: "output", q: "csv.reader trả gì ở cột đầu?", code: "import csv,io\nr=next(csv.reader(io.StringIO('An,8')));print(r[0])", o: ["An", "8", "An,8", "0"], a: 0, why: "Cột đầu là An." },
    { q: "Vì sao không nên luôn dùng split(',')?", o: ["Ô có thể chứa dấu phẩy được trích dẫn", "split quá nhanh", "CSV không có dấu phẩy", "Không đổi được số"], a: 0, why: "Module csv hiểu quy tắc trích dẫn." },
    { kind: "bug", q: "Thiếu bước nào trước khi ghi dữ liệu?", lines: ["writer = csv.DictWriter(out, fieldnames=['ten'])", "writer.writerow({'ten':'An'})", "print(out.getvalue())", "out.close()"], a: 1, why: "Cần writer.writeheader() nếu yêu cầu có tiêu đề." },
    { kind: "blank", q: "Điền để ghi tiêu đề.", code: "writer.___()", a: "writeheader", why: "writeheader dùng fieldnames." },
    { kind: "multi", q: "Công cụ thuộc module csv?", o: ["reader", "writer", "DictReader", "DataFrame"], a: [0, 1, 2], why: "DataFrame thuộc thư viện ngoài như pandas." },
    { q: "newline khi mở CSV thực trên máy nên thường đặt?", o: ["newline=\"\"", "newline=9", "Không thể đặt", "newline=False"], a: 0, why: "Khuyến nghị của module csv tránh dòng trống thừa." },
    { q: "DictWriter cần danh sách nào?", o: ["fieldnames", "indexes", "tabs", "types"], a: 0, why: "fieldnames xác định thứ tự cột." },
  ],
};
