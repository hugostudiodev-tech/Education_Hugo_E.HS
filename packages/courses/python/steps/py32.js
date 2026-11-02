// Step 32 — Đọc và ghi tệp văn bản.
export default {
  id: "py32", lang: "python", file: "so_lop/tep_van_ban.py", duration: "45 phút",
  summary: "Mở tệp bằng with, đọc/ghi văn bản UTF-8, phân biệt các chế độ r/w/a và xử lý tệp không tồn tại.",
  slides: [
    { section: "intro", title: "Dữ liệu sống lâu hơn chương trình", body: "Biến mất khi chương trình kết thúc. Tệp giúp lưu ghi chú, điểm và báo cáo để lần chạy sau đọc lại." },
    { section: "visual", title: "Ghi rồi đọc", body: "`with open(...)` tự đóng tệp kể cả khi có lỗi. Ví dụ dọn tệp sau khi chạy.", py: { code: 'import os\npath = "py32_demo.txt"\nwith open(path, "w", encoding="utf-8") as f:\n    f.write("An: 8.5\\nBình: 7.0\\n")\nwith open(path, "r", encoding="utf-8") as f:\n    print(f.read(), end="")\nos.remove(path)' } },
    { section: "research", title: "Mã hoá văn bản", body: `Tệp là dãy byte; **encoding="utf-8"** nói cách đổi byte thành chữ. Ghi rõ UTF-8 giúp tiếng Việt nhất quán giữa các hệ điều hành.

> Python Software Foundation (2026) *Reading and Writing Files*. Available at: https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files` },
    { section: "ideate", title: "Chọn chế độ mở", body: "`r` đọc; `w` ghi mới và xoá nội dung cũ; `a` nối vào cuối. Trước khi dùng `w`, phải chắc dữ liệu cũ được phép thay thế." },
    { section: "core", title: "Đọc từng dòng", body: "Duyệt trực tiếp tệp tiết kiệm bộ nhớ. `strip()` bỏ ký tự xuống dòng và khoảng trắng hai đầu.", py: { code: 'import io\nf = io.StringIO("An: 8.5\\nBình: 7.0\\n")\nfor so_dong, dong in enumerate(f, start=1):\n    print(so_dong, dong.strip())' } },
    { section: "core", title: "read, readline, readlines", body: "`read()` lấy hết; `readline()` lấy một dòng; `readlines()` tạo list các dòng. Với tệp lớn, ưu tiên vòng for.", py: { code: 'import io\nf = io.StringIO("dòng 1\\ndòng 2\\n")\nprint(f.readline().strip())\nprint(f.readline().strip())' } },
    { section: "apply", title: "Bài tập: lưu danh sách", body: "Nhập n rồi n tên. Ghi mỗi tên một dòng vào `py32_names.txt`, đọc lại và in dạng `1. Tên`; cuối cùng xoá tệp.", py: { code: "n = int(input())\nten = []\n", stdin: "3\nAn\nBình\nChi", solution: 'import os\npath = "py32_names.txt"\nn = int(input())\nten = [input().strip() for _ in range(n)]\nwith open(path, "w", encoding="utf-8") as f:\n    for item in ten:\n        f.write(item + "\\n")\nwith open(path, "r", encoding="utf-8") as f:\n    for stt, dong in enumerate(f, start=1):\n        print(f"{stt}. {dong.strip()}")\nos.remove(path)', hints: ["Ghi từng tên kèm \\n trong khối with.", "Mở lại chế độ r và enumerate từ 1; xoá tệp cuối cùng."] } },
    { section: "apply", title: "Bài tập: nối nhật ký", body: "Tạo tệp với dòng `Bắt đầu`, rồi mở chế độ nối để thêm `Hoàn thành`. Đọc và in hai dòng; xoá tệp sau đó.", py: { code: 'path = "py32_log.txt"\n', solution: 'import os\npath = "py32_log.txt"\nwith open(path, "w", encoding="utf-8") as f:\n    f.write("Bắt đầu\\n")\nwith open(path, "a", encoding="utf-8") as f:\n    f.write("Hoàn thành\\n")\nwith open(path, encoding="utf-8") as f:\n    print(f.read(), end="")\nos.remove(path)', hints: ["Lần đầu dùng w, lần hai dùng a.", "Mở lại mặc định r để đọc, rồi os.remove(path)."] } },
  ],
  quiz: [
    { q: "Chế độ nào xoá nội dung cũ khi mở?", o: ["w", "r", "a", "xem"], a: 0, why: "w ghi mới từ đầu." },
    { q: "Chế độ a dùng để?", o: ["Nối vào cuối", "Chỉ đọc", "Xoá tệp", "Đổi tên"], a: 0, why: "a là append." },
    { kind: "truefalse", q: "with open tự đóng tệp khi rời khối.", a: true, why: "Context manager quản lý việc đóng tệp." },
    { kind: "output", q: "readlines đếm được bao nhiêu dòng?", code: "import io\nf=io.StringIO('a\\nb\\n')\nprint(len(f.readlines()))", o: ["2", "1", "3", "0"], a: 0, why: "Có hai dòng." },
    { q: "Vì sao ghi encoding UTF-8?", o: ["Giữ chữ tiếng Việt nhất quán", "Tệp luôn nhỏ nhất", "Tăng điểm", "Không cần đóng tệp"], a: 0, why: "Mã hoá quyết định cách byte thành chữ." },
    { kind: "bug", q: "Dòng nào có nguy cơ mất nội dung cũ khi chỉ muốn thêm?", lines: ["path = 'log.txt'", "with open(path, 'w') as f:", "    f.write('mới')", "print(path)"], a: 1, why: "Cần chế độ a để nối." },
    { kind: "blank", q: "Điền chế độ chỉ đọc.", code: "open(path, ___, encoding='utf-8')", a: ['"r"', "'r'"], why: "r là read." },
    { kind: "multi", q: "Cách đọc tệp hợp lệ?", o: ["read()", "readline()", "Duyệt for", "scan()"], a: [0, 1, 2], why: "File object không có scan()." },
    { q: "strip() thường dùng khi đọc dòng để?", o: ["Bỏ xuống dòng cuối", "Mã hoá tệp", "Đóng tệp", "Ghi thêm"], a: 0, why: "Nó loại whitespace hai đầu." },
    { q: "Mở tệp không tồn tại bằng r có thể gây?", o: ["FileNotFoundError", "ZeroDivisionError", "KeyError", "Không lỗi"], a: 0, why: "Tệp đọc phải tồn tại." },
  ],
};
