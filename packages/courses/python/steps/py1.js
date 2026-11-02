// Step 1 — Xin chào Python. Khối mã trong `body` dùng rào ~~~; ô `py` là ô chạy thật (PyPlayground).
export default {
  id: "py1",
  lang: "python",
  file: "so_lop/xin_chao.py",
  duration: "40 phút",
  summary: "Biết Python là gì, vì sao nó được dạy ở trường, và tự chạy những dòng print() đầu tiên ngay trong trình duyệt.",
  slides: [
    {
      section: "intro",
      title: "Chào mừng tới khoá Python",
      body: `Trong 40 step, bạn sẽ tự tay xây **Sổ Lớp** — một trợ lý nhỏ cho lớp học: tính điểm trung bình, xếp loại học lực, quản lý quỹ lớp, đọc bảng điểm từ tệp và cả một trò chơi đố vui để ôn bài.

Mỗi step đi theo cùng trình tự: **giới thiệu → minh hoạ → tìm hiểu → lên ý tưởng → kiến thức chính → áp dụng vào Sổ Lớp → trắc nghiệm**. Muốn qua step, bài trắc nghiệm cuối phải đạt **từ 60%**.`,
    },
    {
      section: "intro",
      title: "Không cần cài gì",
      body: `Mọi ô code trong khoá chạy **Python thật ngay trong trình duyệt** — trên máy tính, máy ở phòng tin hay cả điện thoại.

- Gõ code vào ô, bấm **Chạy** (hoặc Ctrl/⌘ + Enter).
- Lần chạy đầu cần vài giây để tải Python về máy; từ lần sau gần như tức thì.
- Viết dở cũng không sao: ô code tự lưu bài trên máy bạn.

Tới step cuối của khoá, bạn sẽ cài Python lên máy để chạy Sổ Lớp như một phần mềm thật.`,
    },
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- Python là gì và vì sao nó phổ biến đến vậy.
- **Chương trình** là gì, máy tính chạy nó thế nào.
- Lệnh **print()** — in chữ và số ra màn hình.
- Chạy được chương trình đầu tiên của chính bạn.`,
    },
    {
      section: "visual",
      title: "Chương trình là một công thức",
      body: `Một công thức nấu ăn là danh sách các bước, làm **lần lượt từ trên xuống**:

1. Đun sôi nước.
2. Cho mì vào.
3. Chờ 3 phút.

Chương trình cũng vậy: một danh sách lệnh, máy tính làm **từng dòng, từ trên xuống dưới**, không bỏ bước nào và không tự đoán ý bạn. Khác với người, máy làm đúng y như bạn viết — kể cả khi bạn viết sai.`,
    },
    {
      section: "visual",
      title: "Thử ngay: dòng code đầu tiên",
      body: "Bấm **Chạy**. Dòng chữ trong ngoặc kép sẽ hiện ra ở khung đen bên dưới — đó là **màn hình kết quả** của chương trình.",
      py: { code: 'print("Xin chào, mình là Python!")' },
    },
    {
      section: "visual",
      title: "Từng dòng, từ trên xuống",
      body: "Ba lệnh, ba dòng kết quả, đúng thứ tự. Thử đổi chỗ hai dòng rồi chạy lại xem thứ tự in có đổi theo không.",
      py: { code: 'print("Đun sôi nước")\nprint("Cho mì vào")\nprint("Chờ 3 phút")' },
    },
    {
      section: "research",
      title: "Python đến từ đâu",
      body: `Python do **Guido van Rossum** (Hà Lan) bắt đầu viết vào cuối năm 1989 và công bố năm 1991. Cái tên không lấy từ con trăn mà từ chương trình hài *Monty Python's Flying Circus* mà ông yêu thích.

Mục tiêu của Python từ đầu: **dễ đọc như tiếng Anh**. Ngày nay ngôn ngữ do tổ chức phi lợi nhuận **Python Software Foundation** quản lý, miễn phí cho mọi người.

> Python Software Foundation (2025) *The Python Tutorial*. Available at: https://docs.python.org/3/tutorial/`,
    },
    {
      section: "research",
      title: "Python được dùng ở đâu",
      body: `- **Trí tuệ nhân tạo và dữ liệu**: phần lớn công cụ học máy phổ biến viết cho Python.
- **Khoa học**: nhà vật lý, sinh học, khí tượng dùng Python để xử lý số liệu.
- **Web**: nhiều trang lớn có phần máy chủ viết bằng Python.
- **Tự động hoá**: đổi tên 500 tệp ảnh, gửi thư hàng loạt — vài dòng Python.
- **Trường học**: môn Tin học THPT ở Việt Nam dạy lập trình bằng Python.

Vì vậy học Python không chỉ để thi: đó là công cụ bạn dùng được ở gần như mọi ngành.

> Python Software Foundation (n.d.) *Applications for Python*. Available at: https://www.python.org/about/apps/`,
    },
    {
      section: "research",
      title: "So sánh nhanh với ngôn ngữ khác",
      body: `Cùng in một câu chào:

~~~python
print("Xin chào")
~~~

Python cho phép viết chương trình ngắn mà không cần khai báo kiểu cho biến trước. Đây là một lựa chọn thiết kế, không có nghĩa ngôn ngữ khác khó hơn hay kém tốt hơn: mỗi ngôn ngữ phù hợp với mục tiêu khác nhau.

> Python Software Foundation (n.d.) *An Informal Introduction to Python*. Available at: https://docs.python.org/3/tutorial/introduction.html`,
    },
    {
      section: "ideate",
      title: "Sổ Lớp sẽ làm được gì",
      body: `Hãy nghĩ tới những việc lặp đi lặp lại trong lớp bạn:

1. Tính điểm trung bình môn cho 40 bạn.
2. Xếp loại giỏi, khá, đạt cho từng bạn.
3. Ghi thu chi quỹ lớp và biết còn bao nhiêu tiền.
4. Tìm 3 bạn điểm cao nhất.
5. Ra câu đố ngẫu nhiên để cả lớp ôn bài.

Mỗi việc là một phần của Sổ Lớp, và mỗi chặng của khoá học mở khoá một phần.`,
    },
    {
      section: "core",
      title: "Lệnh print()",
      body: `**print()** in ra màn hình thứ nằm trong cặp ngoặc tròn.

~~~python
print("Lớp 10A1")
print(2026)
~~~

- Chữ phải đặt trong **ngoặc kép** \`"…"\` hoặc **ngoặc đơn** \`'…'\`.
- Số thì viết thẳng, không cần ngoặc kép.
- Mỗi lệnh print() in xong sẽ **xuống dòng**.`,
    },
    {
      section: "core",
      title: "In nhiều thứ một lúc",
      body: "Ngăn các thứ cần in bằng **dấu phẩy**. Python tự chèn một dấu cách giữa chúng. Chạy thử, rồi thêm một thứ nữa vào cuối.",
      py: { code: 'print("Sĩ số:", 40, "học sinh")\nprint("Năm học", 2026, "-", 2027)' },
    },
    {
      section: "core",
      title: "Python biết tính toán",
      body: `Không có ngoặc kép, Python **tính** biểu thức rồi mới in kết quả. Có ngoặc kép, nó in **nguyên văn**.

So sánh hai dòng dưới rồi chạy để kiểm tra dự đoán của bạn.`,
      py: { code: 'print(8 + 7)\nprint("8 + 7")' },
    },
    {
      section: "core",
      title: "Chú thích bằng dấu #",
      body: `Mọi thứ sau dấu **#** trên một dòng là **chú thích**: Python bỏ qua, người đọc thì nhờ nó mà hiểu code.

~~~python
# Chương trình đầu tiên của Sổ Lớp
print("Sổ Lớp 10A1")  # in tên lớp
~~~

Viết chú thích để nói **vì sao**, không cần nhắc lại code đã nói rõ **cái gì**.`,
    },
    {
      section: "apply",
      title: "Bài tập: trang bìa Sổ Lớp",
      body: `Viết chương trình in đúng **ba dòng** sau (thay tên lớp nếu muốn — nhưng để được chấm đạt, hãy in y như mẫu):

~~~
SỔ LỚP
Lớp 10A1
Năm học 2026 - 2027
~~~`,
      py: {
        code: "# Viết ba lệnh print() ở đây\n",
        solution: 'print("SỔ LỚP")\nprint("Lớp 10A1")\nprint("Năm học 2026 - 2027")',
        hints: ["Mỗi dòng kết quả là một lệnh print() riêng.", "Chữ phải nằm trong ngoặc kép, ví dụ print(\"SỔ LỚP\")."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: để Python tính",
      body: "Lớp có 22 bạn nữ và 18 bạn nam. In ra dòng `Sĩ số: 40` — nhưng **không được tự cộng**: hãy để Python tính 22 + 18.",
      py: {
        code: 'print("Sĩ số:", )',
        solution: 'print("Sĩ số:", 22 + 18)',
        hints: ["Sau dấu phẩy, viết phép cộng không có ngoặc kép.", "print(\"Sĩ số:\", 22 + 18)"],
      },
    },
  ],
  quiz: [
    { q: "Lệnh nào in ra màn hình dòng chữ Xin chào?", o: ["print(Xin chào)", "print(\"Xin chào\")", "Print[\"Xin chào\"]", "echo \"Xin chào\""], a: 1, why: "Chữ phải nằm trong ngoặc kép, và print viết thường với ngoặc tròn." },
    { q: "print(3 + 4) in ra gì?", o: ["3 + 4", "7", "34", "Báo lỗi"], a: 1, why: "Không có ngoặc kép nên Python tính biểu thức trước rồi in kết quả." },
    { q: "print(\"3 + 4\") in ra gì?", o: ["3 + 4", "7", "\"3 + 4\"", "Báo lỗi"], a: 0, why: "Trong ngoặc kép là chữ, in nguyên văn (không in dấu ngoặc kép)." },
    { kind: "truefalse", q: "Máy tính chạy các lệnh của chương trình lần lượt từ trên xuống dưới.", a: true, why: "Khi chưa có rẽ nhánh hay vòng lặp, lệnh chạy theo đúng thứ tự viết." },
    { kind: "truefalse", q: "Dòng bắt đầu bằng # sẽ được in ra màn hình.", a: false, why: "Đó là chú thích — Python bỏ qua hoàn toàn." },
    { q: "print(\"Lớp\", \"10A1\") in ra gì?", o: ["Lớp10A1", "Lớp 10A1", "Lớp, 10A1", "\"Lớp\" \"10A1\""], a: 1, why: "Dấu phẩy ngăn các thứ cần in; Python chèn một dấu cách giữa chúng." },
    { q: "Ai là người tạo ra Python?", o: ["Bill Gates", "Guido van Rossum", "Mark Zuckerberg", "Tim Berners-Lee"], a: 1, why: "Guido van Rossum bắt đầu viết Python cuối năm 1989." },
    { kind: "order", q: "Ba dòng sau in ra theo thứ tự nào? print(\"B\") / print(\"A\") / print(\"C\")", items: ["B", "A", "C"], a: [0, 1, 2], why: "In đúng thứ tự viết, từ trên xuống." },
    { kind: "bug", q: "Dòng nào báo lỗi?", lines: ["print(\"Sổ Lớp\")", "print(2026)", "print(Lớp 10A1)", "# print(lỗi gì cũng được)"], a: 2, why: "Chữ không có ngoặc kép — Python hiểu Lớp là tên một thứ chưa tồn tại." },
    { kind: "multi", q: "Python thường được dùng trong lĩnh vực nào?", o: ["Trí tuệ nhân tạo", "Xử lý số liệu khoa học", "Tự động hoá công việc", "Chỉ để làm game điện tử"], a: [0, 1, 2], why: "Python đa dụng; game có làm được nhưng không phải lĩnh vực duy nhất hay chính." },
  ],
};
