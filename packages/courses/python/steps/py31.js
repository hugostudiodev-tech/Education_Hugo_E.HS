// Step 31 — try và except: chương trình không sập.
export default {
  id: "py31", lang: "python", file: "so_lop/xu_ly_loi.py", duration: "45 phút",
  summary: "Bắt lỗi dự kiến bằng try/except, xử lý đúng loại ngoại lệ và dùng else/finally hợp lý.",
  slides: [
    { section: "intro", title: "Lỗi dữ liệu không phải kết thúc", body: "Người dùng có thể nhập `tám` thay vì `8`. `try/except` cho phép chương trình giải thích lỗi và tiếp tục thay vì dừng đột ngột." },
    { section: "visual", title: "Thử → lỗi → xử lý", body: "Python chạy khối try. Nếu gặp ValueError, nó chuyển sang except tương ứng.", py: { code: 'du_lieu = "tám"\ntry:\n    diem = float(du_lieu)\n    print(diem)\nexcept ValueError:\n    print("Điểm phải là một số")' } },
    { section: "research", title: "Bắt đúng loại lỗi", body: `Ngoại lệ là tín hiệu một thao tác không thể hoàn thành. Bắt loại cụ thể giúp không che giấu lỗi lập trình khác. Ví dụ, **ValueError** cho dữ liệu sai dạng và **ZeroDivisionError** cho chia 0.

> Python Software Foundation (2026) *Errors and Exceptions*. Available at: https://docs.python.org/3/tutorial/errors.html` },
    { section: "ideate", title: "Lỗi nào có thể dự đoán?", body: "Đổi xâu sang số có thể ValueError; mở tệp có thể FileNotFoundError; tra khoá có thể KeyError. Chỉ bắt lỗi ta biết cách giải thích hoặc phục hồi." },
    { section: "core", title: "else và finally", body: "`else` chạy khi không lỗi. `finally` luôn chạy, thường để đóng hoặc giải phóng tài nguyên.", py: { code: 'try:\n    diem = float("8.5")\nexcept ValueError:\n    print("Sai dữ liệu")\nelse:\n    print("Đã đọc:", diem)\nfinally:\n    print("Kết thúc lần đọc")' } },
    { section: "core", title: "Không dùng except trống", body: "`except Exception` hoặc `except:` quá rộng có thể che lỗi code. Hãy liệt kê các lỗi dự kiến, có thể gộp bằng tuple.", py: { code: 'for mau in ("10/2", "10/0", "x/2"):\n    try:\n        a, b = mau.split("/")\n        print(float(a) / float(b))\n    except (ValueError, ZeroDivisionError):\n        print("Không tính được:", mau)' } },
    { section: "apply", title: "Bài tập: đọc điểm an toàn", body: "Nhập một dòng. Nếu không đổi được sang số, in `Không phải số`; nếu ngoài 0..10, in `Ngoài khoảng`; còn lại in `Điểm: X`.", py: { code: "du_lieu = input()\n", stdin: "tám", solution: 'du_lieu = input()\ntry:\n    diem = float(du_lieu)\nexcept ValueError:\n    print("Không phải số")\nelse:\n    if 0 <= diem <= 10:\n        print(f"Điểm: {diem}")\n    else:\n        print("Ngoài khoảng")', hints: ["Chỉ đặt phép float trong try.", "Kiểm khoảng trong else sau khi đổi thành công."] } },
    { section: "apply", title: "Bài tập: chia an toàn", body: "Nhập tử và mẫu. Bắt ValueError để in `Sai số`, bắt ZeroDivisionError để in `Không thể chia 0`; nếu thành công in kết quả hai chữ số.", py: { code: "tu = input()\nmau = input()\n", stdin: "10\n0", solution: 'tu = input()\nmau = input()\ntry:\n    ket_qua = float(tu) / float(mau)\nexcept ValueError:\n    print("Sai số")\nexcept ZeroDivisionError:\n    print("Không thể chia 0")\nelse:\n    print(f"{ket_qua:.2f}")', hints: ["Hai except riêng cho hai thông báo.", "In kết quả trong else."] } },
  ],
  quiz: [
    { q: "float(\"tám\") gây lỗi?", o: ["ValueError", "KeyError", "NameError", "IndexError"], a: 0, why: "Xâu không có dạng số." },
    { q: "10 / 0 gây lỗi?", o: ["ZeroDivisionError", "ValueError", "TypeError", "Không lỗi"], a: 0, why: "Không thể chia cho 0." },
    { kind: "truefalse", q: "Nên bắt loại ngoại lệ cụ thể khi có thể.", a: true, why: "Tránh che giấu lỗi không dự kiến." },
    { kind: "output", q: "Khối except in gì khi int nhận x?", code: "try:\n    int('x')\nexcept ValueError:\n    print('Sai')", o: ["Sai", "x", "0", "Dừng"], a: 0, why: "ValueError được bắt." },
    { q: "Khối else của try chạy khi?", o: ["Không có ngoại lệ", "Luôn luôn", "Có mọi lỗi", "finally xong"], a: 0, why: "else chỉ chạy sau try thành công." },
    { kind: "bug", q: "Dòng nào bắt lỗi quá rộng?", lines: ["try:", "    diem = float(s)", "except:", "    print('Sai')"], a: 2, why: "Nên except ValueError." },
    { kind: "blank", q: "Điền loại lỗi mở tệp không tồn tại.", code: "except ___:", a: "FileNotFoundError", why: "Đây là ngoại lệ cho đường dẫn không tìm thấy." },
    { kind: "multi", q: "Khối nào thuộc cấu trúc xử lý ngoại lệ?", o: ["try", "except", "finally", "switch"], a: [0, 1, 2], why: "Python không có khối switch trong try." },
    { q: "finally chạy khi?", o: ["Dù có lỗi hay không", "Chỉ khi lỗi", "Chỉ khi thành công", "Không bao giờ"], a: 0, why: "Nó dùng cho dọn dẹp bắt buộc." },
    { q: "Nên đặt bao nhiêu code trong try?", o: ["Chỉ phần có thể gây lỗi dự kiến", "Toàn bộ chương trình", "Không có code", "Mọi hàm"], a: 0, why: "Phạm vi nhỏ giúp biết thao tác nào lỗi." },
  ],
};
