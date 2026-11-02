// Step 5 — Đọc thông báo lỗi và dự án nhỏ: thẻ giới thiệu (kết chặng 1).
export default {
  id: "py5",
  lang: "python",
  file: "so_lop/the_gioi_thieu.py",
  duration: "50 phút",
  summary: "Đọc hiểu thông báo lỗi của Python (SyntaxError, NameError, TypeError, ValueError, IndentationError), sửa lỗi theo từng bước, và hoàn thành thẻ giới thiệu bản thân — trang đầu của Sổ Lớp.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Lỗi không đáng sợ: đó là Python **chỉ đường** cho bạn.
- Đọc một thông báo lỗi: **dòng nào, loại gì, vì sao**.
- Năm lỗi người mới gặp nhiều nhất.
- Dự án kết chặng: **thẻ giới thiệu** bản thân.`,
    },
    {
      section: "visual",
      title: "Giải phẫu một thông báo lỗi",
      body: `Cố ý sai: chạy ô dưới đây. Đọc thông báo từ **dưới lên**:

1. Dòng cuối: **loại lỗi** và mô tả — \`NameError: name 'ten_lpo' is not defined\`.
2. Phía trên: **line 2** — lỗi nằm ở dòng 2.
3. Từ đó bạn thấy ngay: gõ nhầm \`ten_lpo\` thay vì \`ten_lop\`.

Sửa rồi chạy lại.`,
      py: { code: 'ten_lop = "10A1"\nprint(ten_lpo)' },
    },
    {
      section: "research",
      title: "\"Bug\" — con bọ thật năm 1947",
      body: `Năm 1947, nhóm vận hành máy tính Harvard Mark II tìm thấy **một con bướm đêm** kẹt trong rơ-le làm máy chạy sai. Họ dán con bướm vào sổ nhật ký với ghi chú "first actual case of bug being found". Nhà khoa học máy tính **Grace Hopper** — thành viên nhóm — hay kể lại câu chuyện này, và từ "bug" (lỗi) cùng "debug" (gỡ lỗi) trở nên phổ biến.

Trang nhật ký kèm con bướm hiện được lưu tại Bảo tàng Lịch sử Quốc gia Hoa Kỳ (Smithsonian).

> Smithsonian National Museum of American History (n.d.) *Log Book With Computer Bug*. Available at: https://americanhistory.si.edu/collections/object/nmah_334663`,
    },
    {
      section: "research",
      title: "Lập trình viên giỏi vẫn gặp lỗi",
      body: `Người mới thường nghĩ lập trình viên giỏi viết code không lỗi. Thực tế, họ gặp lỗi **liên tục** — khác biệt là họ **đọc lỗi nhanh** và có quy trình sửa.

Quy trình bốn bước:

1. **Đọc** dòng cuối của thông báo: loại lỗi là gì?
2. **Tìm** số dòng (line) được chỉ ra.
3. **Đoán** nguyên nhân, sửa **một** chỗ.
4. **Chạy lại** — lặp đến khi hết lỗi.`,
    },
    {
      section: "ideate",
      title: "Thẻ giới thiệu cần gì",
      body: `Trang đầu của Sổ Lớp là thẻ giới thiệu của **chính bạn**. Phân rã trước khi code:

- **Nhập**: tên, lớp, năm sinh, môn học yêu thích.
- **Xử lý**: tính tuổi năm nay = 2026 − năm sinh.
- **Xuất**: một tấm thẻ có viền, các dòng thẳng hàng.

Bạn đã có đủ công cụ: input(), int(), phép trừ, phép nhân xâu để vẽ viền.`,
    },
    {
      section: "core",
      title: "SyntaxError — sai ngữ pháp",
      body: `Python không hiểu câu bạn viết: thiếu ngoặc, thiếu dấu nháy… Lỗi này xảy ra **trước khi chạy** bất kỳ dòng nào.

Cố ý sai: thiếu dấu ngoặc đóng. Chạy, đọc lỗi, rồi sửa.`,
      py: { code: 'print("Sổ Lớp"\nprint("10A1")' },
    },
    {
      section: "core",
      title: "NameError và TypeError",
      body: `- **NameError**: dùng một tên chưa tồn tại — gõ nhầm tên biến, quên ngoặc kép, hoặc dùng biến trước khi gán.
- **TypeError**: phép toán không hợp với kiểu — như \`"Tuổi: " + 16\`.

Cố ý sai: ô dưới có **hai** lỗi. Sửa lỗi đầu, chạy lại để thấy lỗi thứ hai.`,
      py: { code: 'tuoi = 16\nprint(Tuổi)\nprint("Tuổi: " + tuoi)' },
    },
    {
      section: "core",
      title: "ValueError và IndentationError",
      body: `- **ValueError**: đúng kiểu nhưng giá trị không dùng được — \`int("mười")\`.
- **IndentationError**: thụt lề sai. Trong Python, dấu cách ở **đầu dòng** có ý nghĩa; một dòng bình thường không được thụt vào.

Cố ý sai: dòng 2 bị thụt một dấu cách.`,
      py: { code: 'lop = "10A1"\n print(lop)' },
    },
    {
      section: "core",
      title: "Lỗi không báo: lỗi logic",
      body: `Nguy hiểm nhất là lỗi **không có thông báo**: chương trình chạy êm nhưng ra kết quả sai.

~~~python
diem_tb = 8 + 6 / 2   # muốn (8 + 6) / 2 = 7
print(diem_tb)        # in 11.0
~~~

Python làm đúng y như bạn viết — chỉ là bạn viết sai ý. Cách bắt: **tự tính tay một ví dụ nhỏ** rồi so với kết quả máy in ra.`,
    },
    {
      section: "core",
      title: "Bảng tra nhanh",
      body: `| Lỗi | Thường do | Sửa |
|---|---|---|
| SyntaxError | thiếu ngoặc, thiếu dấu nháy | đếm cặp ngoặc, cặp nháy |
| NameError | gõ nhầm tên, quên nháy | so tên với dòng gán |
| TypeError | trộn str với số | str() hoặc int()/float() |
| ValueError | đổi kiểu một giá trị không hợp lệ | kiểm tra dữ liệu nhập |
| IndentationError | thụt lề thừa/thiếu | bỏ dấu cách đầu dòng |`,
    },
    {
      section: "apply",
      title: "Bài tập: sửa chương trình hỏng",
      body: "Chương trình dưới có **ba** lỗi. Sửa để nó in `Bảo - lớp 10A1 - 16 tuổi`.",
      py: {
        code: 'ten = "Bảo\nlop = "10A1"\ntuoi = 2026 - 2010\nprint(ten + " - lớp " + lpo + " - " + tuoi + " tuổi")',
        solution: 'ten = "Bảo"\nlop = "10A1"\ntuoi = 2026 - 2010\nprint(ten + " - lớp " + lop + " - " + str(tuoi) + " tuổi")',
        hints: ["Lỗi 1 (SyntaxError): dòng 1 thiếu dấu nháy đóng.", "Lỗi 2 (NameError): lpo → lop. Lỗi 3 (TypeError): bọc tuoi trong str()."],
      },
    },
    {
      section: "apply",
      title: "Dự án kết chặng: thẻ giới thiệu",
      body: `Nhập lần lượt **tên**, **lớp**, **năm sinh**, **môn yêu thích** (bốn dòng). In đúng tấm thẻ sau — viền là 30 dấu \`=\`, tuổi tính theo năm 2026:

~~~
==============================
Tên: Minh Anh
Lớp: 10A1
Tuổi: 16
Môn yêu thích: Tin học
==============================
~~~

Làm đạt rồi, đổi ô Dữ liệu nhập thành thông tin của chính bạn và chạy lại — đó là trang đầu tiên của Sổ Lớp.`,
      py: {
        code: "ten = input()\n",
        stdin: "Minh Anh\n10A1\n2010\nTin học",
        solution: 'ten = input()\nlop = input()\nnam_sinh = int(input())\nmon = input()\nprint("=" * 30)\nprint("Tên:", ten)\nprint("Lớp:", lop)\nprint("Tuổi:", 2026 - nam_sinh)\nprint("Môn yêu thích:", mon)\nprint("=" * 30)',
        hints: ["Năm sinh phải đổi sang số: nam_sinh = int(input()).", "Viền: print(\"=\" * 30). Tuổi: 2026 - nam_sinh."],
      },
    },
  ],
  quiz: [
    { q: "Khi đọc thông báo lỗi, nên đọc dòng nào trước?", o: ["Dòng đầu tiên", "Dòng cuối cùng — loại lỗi và mô tả", "Dòng giữa", "Không cần đọc"], a: 1, why: "Dòng cuối nói loại lỗi; phía trên chỉ ra dòng code gây lỗi." },
    { kind: "match", q: "Nối dòng code với lỗi nó gây ra.", pairs: [["print(\"hi\"", "SyntaxError"], ["print(chao)", "NameError"], ["\"a\" + 1", "TypeError"], ["int(\"năm\")", "ValueError"]], why: "Năm loại lỗi thường gặp (trừ IndentationError)." },
    { kind: "truefalse", q: "Chương trình chạy không báo lỗi thì chắc chắn kết quả đúng.", a: false, why: "Lỗi logic không có thông báo — phải tự kiểm tra bằng ví dụ tính tay." },
    { q: "8 + 6 / 2 bằng bao nhiêu trong Python?", o: ["7.0", "11.0", "10", "7"], a: 1, why: "Chia trước, cộng sau: 8 + 3.0 = 11.0." },
    { kind: "bug", q: "Dòng nào gây IndentationError?", lines: ["lop = \"10A1\"", "si_so = 40", "  print(lop)", "print(si_so)"], a: 2, why: "Dòng thường không được thụt lề." },
    { kind: "order", q: "Xếp quy trình sửa lỗi.", items: ["Đọc loại lỗi", "Tìm số dòng", "Sửa một chỗ", "Chạy lại"], a: [0, 1, 2, 3], why: "Đọc → tìm → sửa → chạy lại, lặp đến khi hết lỗi." },
    { q: "Từ \"bug\" gắn với câu chuyện nào?", o: ["Một con bướm đêm kẹt trong máy Mark II năm 1947", "Virus máy tính đầu tiên", "Lỗi Y2K năm 2000", "Tên một ngôn ngữ lập trình"], a: 0, why: "Nhật ký vận hành Harvard Mark II, nay ở Smithsonian." },
    { q: "SyntaxError xảy ra khi nào?", o: ["Sau khi chạy xong", "Trước khi chạy dòng nào — Python không hiểu cú pháp", "Chỉ khi có input()", "Khi chia cho 0"], a: 1, why: "Python đọc cả chương trình trước; sai ngữ pháp là dừng ngay." },
    { kind: "multi", q: "Nguyên nhân nào gây NameError?", o: ["Gõ nhầm tên biến", "Quên ngoặc kép quanh chữ", "Dùng biến trước khi gán", "Chia cho 0"], a: [0, 1, 2], why: "Chia cho 0 là ZeroDivisionError." },
    { q: "print(\"=\" * 5) in ra?", o: ["=====", "= * 5", "5", "Báo lỗi"], a: 0, why: "Nhân xâu với số nguyên là lặp xâu." },
  ],
};
