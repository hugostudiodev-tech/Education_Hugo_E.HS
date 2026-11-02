// Step 30 — Dự án nhỏ: thư viện tính điểm (kết chặng 6).
export default {
  id: "py30", lang: "python", file: "so_lop/tinh_diem.py", duration: "50 phút",
  summary: "Ghép hàm, kiểm tra dữ liệu, docstring và main thành thư viện tính điểm có thể dùng lại.",
  slides: [
    { section: "intro", title: "Dự án kết chặng 6", body: "Ta xây một thư viện nhỏ: kiểm điểm, tính trung bình có trọng số, xếp loại và tạo báo cáo. Mọi quy tắc nằm trong hàm thay vì rải khắp chương trình." },
    { section: "visual", title: "Luồng dữ liệu qua các hàm", body: "Điểm + hệ số → kiểm tra → trung bình → xếp loại → báo cáo.", py: { code: 'def trung_binh(diem):\n    return sum(diem) / len(diem)\n\ndef xep_loai(tb):\n    if tb >= 8: return "Giỏi"\n    if tb >= 6.5: return "Khá"\n    if tb >= 5: return "Đạt"\n    return "Chưa đạt"\n\ntb = trung_binh([8, 7, 9])\nprint(tb, xep_loai(tb))' } },
    { section: "research", title: "Một nguồn sự thật", body: `Nếu cùng quy tắc xếp loại được chép ở ba màn hình, sửa mốc điểm phải sửa ba nơi và rất dễ lệch. Đặt quy tắc trong một hàm tạo **một nguồn sự thật** cho chương trình.

> Hunt, A. and Thomas, D. (2019) *The Pragmatic Programmer, 20th Anniversary Edition*. Boston: Addison-Wesley.` },
    { section: "ideate", title: "Hợp đồng của thư viện", body: "`diem_hop_le(d)` trả bool; `trung_binh(diem, he_so)` trả số; `xep_loai(tb)` trả xâu; `bao_cao(...)` ghép kết quả. Mỗi hàm có đầu vào/đầu ra rõ." },
    { section: "core", title: "Trung bình có trọng số", body: "Nhân từng điểm với hệ số, cộng lại rồi chia tổng hệ số. Hai list phải cùng độ dài và tổng hệ số phải lớn hơn 0.", py: { code: 'def trung_binh_co_trong_so(diem, he_so):\n    tong = 0\n    for d, h in zip(diem, he_so):\n        tong += d * h\n    return tong / sum(he_so)\n\nprint(trung_binh_co_trong_so([8, 7, 9], [1, 1, 2]))' } },
    { section: "core", title: "main điều phối", body: "`main` đọc dữ liệu và gọi các hàm. Công thức không nên nằm trong main để vẫn thử độc lập được.", py: { code: 'def xep_loai(tb):\n    return "Đạt" if tb >= 5 else "Chưa đạt"\n\ndef main():\n    diem = [7, 8, 6]\n    tb = sum(diem) / len(diem)\n    print(f"TB {tb:.1f} — {xep_loai(tb)}")\n\nmain()' } },
    { section: "apply", title: "Dự án: thư viện tính điểm", body: "Nhập tên, 3 điểm và 3 hệ số. Nếu có điểm ngoài 0..10, hệ số không dương hoặc tổng hệ số bằng 0, in `Dữ liệu sai`. Ngược lại in tên, trung bình một chữ số và xếp loại.", py: { code: "def diem_hop_le(d):\n    return 0 <= d <= 10\n", stdin: "An\n8\n7\n9\n1\n1\n2", solution: 'def diem_hop_le(d):\n    """Trả True khi d nằm trong 0..10."""\n    return 0 <= d <= 10\n\ndef trung_binh(diem, he_so):\n    return sum(d * h for d, h in zip(diem, he_so)) / sum(he_so)\n\ndef xep_loai(tb):\n    if tb >= 8: return "Giỏi"\n    if tb >= 6.5: return "Khá"\n    if tb >= 5: return "Đạt"\n    return "Chưa đạt"\n\ndef bao_cao(ten, diem, he_so):\n    tb = trung_binh(diem, he_so)\n    return f"{ten}: {tb:.1f} — {xep_loai(tb)}"\n\nten = input().strip().title()\ndiem = [float(input()) for _ in range(3)]\nhe_so = [float(input()) for _ in range(3)]\nif not all(diem_hop_le(d) for d in diem) or not all(h > 0 for h in he_so):\n    print("Dữ liệu sai")\nelse:\n    print(bao_cao(ten, diem, he_so))', hints: ["Dùng zip để ghép từng điểm với hệ số.", "Kiểm toàn bộ điểm và hệ số trước khi gọi trung_binh."] } },
    { section: "apply", title: "Bài tập: kiểm thử thư viện", body: "Dùng assert kiểm ba điều: điểm -1 không hợp lệ, điểm 10 hợp lệ, và xếp loại 8 là Giỏi. Nếu qua hết, in `Kiểm thử đạt`.", py: { code: "def diem_hop_le(d):\n    return 0 <= d <= 10\n\ndef xep_loai(tb):\n    return \"Giỏi\" if tb >= 8 else \"Khác\"\n", solution: 'def diem_hop_le(d):\n    return 0 <= d <= 10\n\ndef xep_loai(tb):\n    return "Giỏi" if tb >= 8 else "Khác"\n\nassert diem_hop_le(-1) is False\nassert diem_hop_le(10) is True\nassert xep_loai(8) == "Giỏi"\nprint("Kiểm thử đạt")', hints: ["assert nhận một biểu thức phải đúng.", "Dùng is False, is True và == cho xâu."] } },
  ],
  quiz: [
    { q: "Một nguồn sự thật giúp?", o: ["Quy tắc không bị chép lệch", "Code luôn không lỗi", "Bỏ mọi hàm", "Không cần kiểm thử"], a: 0, why: "Sửa quy tắc ở một nơi." },
    { q: "zip(diem, he_so) tạo?", o: ["Các cặp điểm và hệ số", "Tổng hai list", "Một dict tự động", "Điểm lớn nhất"], a: 0, why: "zip ghép phần tử cùng vị trí." },
    { kind: "truefalse", q: "Nên kiểm hệ số trước khi chia cho tổng hệ số.", a: true, why: "Tránh dữ liệu sai và chia cho 0." },
    { kind: "output", q: "Tổng có trọng số trong đoạn code bằng?", code: "print(sum(d*h for d,h in zip([8,9],[1,2])))", o: ["26", "17", "18", "25"], a: 0, why: "8×1 + 9×2 = 26." },
    { q: "Vai trò chính của main?", o: ["Điều phối nhập/xuất và gọi hàm", "Chứa mọi công thức", "Thay cho return", "Cài module"], a: 0, why: "Logic tái sử dụng nên ở hàm riêng." },
    { kind: "bug", q: "Dòng nào có thể chia cho 0?", lines: ["tong = sum(d*h for d,h in zip(ds, hs))", "mau = sum(hs)", "tb = tong / mau", "print(tb)"], a: 2, why: "Phải bảo đảm mau > 0 trước khi chia." },
    { kind: "blank", q: "Điền để ghép hai list.", code: "for d, h in ___(diem, he_so):", a: "zip", why: "zip ghép theo vị trí." },
    { kind: "multi", q: "Ca nào thư viện phải từ chối?", o: ["Điểm -1", "Điểm 11", "Hệ số 0", "Điểm 8"], a: [0, 1, 2], why: "Điểm 8 và hệ số dương là hợp lệ." },
    { q: "assert dùng để?", o: ["Xác nhận điều kiện phải đúng", "Nhập dữ liệu", "In đẹp", "Tạo module"], a: 0, why: "Sai assert sẽ báo AssertionError." },
    { kind: "order", q: "Thứ tự xử lý báo cáo.", items: ["Kiểm dữ liệu", "Tính trung bình", "Xếp loại", "Định dạng báo cáo"], a: [0, 1, 2, 3], why: "Không tính trên dữ liệu chưa hợp lệ." },
  ],
};
