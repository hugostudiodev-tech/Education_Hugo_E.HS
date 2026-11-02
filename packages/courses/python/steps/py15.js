// Step 15 — Dự án nhỏ: xét học bổng (kết chặng 3).
export default {
  id: "py15",
  lang: "python",
  file: "so_lop/hoc_bong.py",
  duration: "50 phút",
  summary: "Ghép chặng 3: kiểm tra dữ liệu nhập, if lồng nhau, điều kiện nhiều vế và xếp mức học bổng — kèm lý do khi không đạt.",
  slides: [
    {
      section: "intro",
      title: "Dự án kết chặng 3",
      body: `Sổ Lớp sẽ tự **xét học bổng** và giải thích lý do. Bạn dùng lại: so sánh, if/elif/else, and/or/not, và học thêm **if lồng nhau**.

Quy chế trong dự án là **giả định** để luyện tập.`,
    },
    {
      section: "visual",
      title: "Quy chế học bổng (giả định)",
      body: `1. Dữ liệu phải hợp lệ: ĐTB và điểm thấp nhất trong 0–10.
2. Hạnh kiểm phải **Tốt**.
3. Mức học bổng:
   - **Xuất sắc**: ĐTB ≥ 9 và không môn nào < 8.
   - **Giỏi**: ĐTB ≥ 8 và không môn nào < 6.5.
   - Còn lại: **Không đạt**.`,
    },
    {
      section: "research",
      title: "Kiểm tra dữ liệu trước — \"rác vào, rác ra\"",
      body: `Ngành máy tính có câu **"Garbage in, garbage out"** (GIGO): dữ liệu vào sai thì kết quả ra cũng sai, dù chương trình đúng.

Vì vậy chương trình tốt luôn **kiểm tra dữ liệu ở cửa vào** (input validation) trước khi xử lý. Điểm 12 hay -3 phải bị chặn ngay, không được lọt vào bước xét học bổng.`,
    },
    {
      section: "ideate",
      title: "Vẽ luồng trước khi code",
      body: `~~~
Hợp lệ? ── không ──> "Dữ liệu sai"
   │ có
Hạnh kiểm Tốt? ── không ──> "Không đạt: hạnh kiểm"
   │ có
Xuất sắc? ── có ──> "Học bổng Xuất sắc"
   │ không
Giỏi? ── có ──> "Học bổng Giỏi"
   │ không
"Không đạt: điểm"
~~~`,
    },
    {
      section: "core",
      title: "if lồng nhau",
      body: "Một khối if có thể chứa if khác — thụt thêm **4 dấu cách** mỗi mức. Đừng lồng quá 3 mức; sâu hơn thì nên tách bằng elif hoặc hàm (chặng 6).",
      py: { code: 'hanh_kiem = "Tốt"\ndtb = 8.4\nif hanh_kiem == "Tốt":\n    if dtb >= 8:\n        print("Xét tiếp mức học bổng")\n    else:\n        print("Không đạt: điểm")\nelse:\n    print("Không đạt: hạnh kiểm")' },
    },
    {
      section: "core",
      title: "Làm phẳng bằng elif",
      body: "Cùng logic, viết phẳng thì dễ đọc hơn: xử lý các trường hợp \"loại\" trước, trường hợp chính sau (gọi là **guard clause**).",
      py: { code: 'hanh_kiem, dtb, min_mon = "Tốt", 8.4, 7\nif not (0 <= dtb <= 10 and 0 <= min_mon <= 10):\n    print("Dữ liệu sai")\nelif hanh_kiem != "Tốt":\n    print("Không đạt: hạnh kiểm")\nelif dtb >= 9 and min_mon >= 8:\n    print("Học bổng Xuất sắc")\nelif dtb >= 8 and min_mon >= 6.5:\n    print("Học bổng Giỏi")\nelse:\n    print("Không đạt: điểm")' },
    },
    {
      section: "apply",
      title: "Dự án: xét học bổng",
      body: `Nhập 3 dòng: **ĐTB**, **điểm môn thấp nhất**, **hạnh kiểm** (\`Tốt\`, \`Khá\`…). In **đúng một** dòng theo quy chế:

\`Dữ liệu sai\` · \`Không đạt: hạnh kiểm\` · \`Học bổng Xuất sắc\` · \`Học bổng Giỏi\` · \`Không đạt: điểm\``,
      py: {
        code: "dtb = float(input())\nmin_mon = float(input())\nhanh_kiem = input()\n",
        stdin: "8.6\n6.5\nTốt",
        solution: 'dtb = float(input())\nmin_mon = float(input())\nhanh_kiem = input()\nif not (0 <= dtb <= 10 and 0 <= min_mon <= 10):\n    print("Dữ liệu sai")\nelif hanh_kiem != "Tốt":\n    print("Không đạt: hạnh kiểm")\nelif dtb >= 9 and min_mon >= 8:\n    print("Học bổng Xuất sắc")\nelif dtb >= 8 and min_mon >= 6.5:\n    print("Học bổng Giỏi")\nelse:\n    print("Không đạt: điểm")',
        hints: ["Kiểm dữ liệu sai đầu tiên, rồi hạnh kiểm.", "Xuất sắc kiểm trước Giỏi (mốc cao trước)."],
      },
    },
    {
      section: "apply",
      title: "Thử các trường hợp biên",
      body: `Sau khi đạt, đổi ô Dữ liệu nhập để thử từng dòng dưới. Kết quả mong đợi ở cột phải:

| Nhập | Mong đợi |
|---|---|
| 9 / 8 / Tốt | Học bổng Xuất sắc |
| 9 / 7.9 / Tốt | Học bổng Giỏi |
| 7.99 / 9 / Tốt | Không đạt: điểm |
| 9.5 / 9 / Khá | Không đạt: hạnh kiểm |
| 11 / 9 / Tốt | Dữ liệu sai |`,
    },
  ],
  quiz: [
    { q: "\"Garbage in, garbage out\" nghĩa là?", o: ["Xoá rác máy tính", "Dữ liệu vào sai thì kết quả ra sai", "Code thừa thì chạy chậm", "Thùng rác của hệ điều hành"], a: 1, why: "Phải kiểm tra dữ liệu đầu vào." },
    { q: "ĐTB 9, môn thấp nhất 7.9, hạnh kiểm Tốt → ?", o: ["Xuất sắc", "Giỏi", "Không đạt: điểm", "Dữ liệu sai"], a: 1, why: "Không đủ ≥ 8 mọi môn cho Xuất sắc, nhưng đủ Giỏi." },
    { kind: "truefalse", q: "Nên kiểm tra dữ liệu hợp lệ trước khi xét học bổng.", a: true, why: "Chặn ở cửa vào." },
    { q: "Guard clause là?", o: ["Xử lý trường hợp loại trước, trường hợp chính sau", "Một module bảo mật", "Vòng lặp vô hạn", "Chú thích"], a: 0, why: "Làm phẳng if lồng nhau." },
    { q: "Mỗi mức if lồng thụt thêm bao nhiêu dấu cách?", o: ["1", "2", "4", "Không cần"], a: 2, why: "4 dấu cách mỗi mức." },
    { kind: "bug", q: "Dòng nào khiến ĐTB 9.5 / min 9 / Tốt chỉ được \"Giỏi\"?", lines: ["if dtb >= 8 and min_mon >= 6.5:", "    print(\"Học bổng Giỏi\")", "elif dtb >= 9 and min_mon >= 8:", "    print(\"Học bổng Xuất sắc\")"], a: 0, why: "Mốc thấp kiểm trước." },
    { q: "not (0 <= 11 <= 10) bằng?", o: ["True", "False"], a: 0, why: "11 ngoài khoảng → False, đảo thành True." },
    { kind: "multi", q: "Bộ nào là ca biên nên thử?", o: ["ĐTB đúng 8", "Môn thấp nhất đúng 6.5", "ĐTB 7.99", "ĐTB 5.5 / min 5 / Tốt"], a: [0, 1, 2], why: "Ca biên nằm sát các mốc." },
    { q: "Nên lồng if tối đa khoảng bao nhiêu mức trước khi tách?", o: ["1", "3", "10", "Không giới hạn"], a: 1, why: "Sâu hơn khó đọc." },
    { kind: "order", q: "Thứ tự kiểm trong dự án.", items: ["Dữ liệu hợp lệ", "Hạnh kiểm", "Xuất sắc", "Giỏi"], a: [0, 1, 2, 3], why: "Loại trước, mốc cao trước." },
  ],
};
