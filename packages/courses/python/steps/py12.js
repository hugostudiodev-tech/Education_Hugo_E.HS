// Step 12 — if và else: hai ngả đường.
export default {
  id: "py12",
  lang: "python",
  file: "so_lop/if_else.py",
  duration: "45 phút",
  summary: "Viết câu lệnh if và if-else, hiểu dấu hai chấm và thụt lề 4 dấu cách tạo thành khối lệnh, dùng biểu đồ luồng để hình dung chương trình rẽ nhánh.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **if**: làm một việc chỉ khi điều kiện đúng.
- **else**: việc thay thế khi điều kiện sai.
- **Khối lệnh**: dấu \`:\` + thụt lề 4 dấu cách.
- Đọc **biểu đồ luồng** (flowchart).`,
    },
    {
      section: "visual",
      title: "Ngã ba đường",
      body: `~~~
          [ĐTB >= 5 ?]
           /        \\
        Đúng        Sai
         |           |
   "Đạt môn"    "Cần thi lại"
           \\        /
           [Tiếp tục]
~~~

Chương trình đi **một trong hai** nhánh rồi gặp lại nhau. Sửa ĐTB trong ô bên dưới và chạy lại.`,
      py: { code: 'dtb = 4.5\nif dtb >= 5:\n    print("Đạt môn")\nelse:\n    print("Cần thi lại")\nprint("Xong")' },
    },
    {
      section: "research",
      title: "Vì sao Python dùng thụt lề?",
      body: `Nhiều ngôn ngữ dùng dấu \`{ }\` để gom khối lệnh và thụt lề chỉ để đẹp. Python **bắt buộc** thụt lề — ý tưởng từ ngôn ngữ ABC mà Guido van Rossum từng tham gia.

Lý do: code được **đọc nhiều hơn viết**. Bắt buộc thụt lề khiến mọi chương trình Python trông gọn gàng như nhau. Quy ước PEP 8: **4 dấu cách** mỗi mức.

> van Rossum, G., Warsaw, B. and Coghlan, N. (2001) *PEP 8 – Style Guide for Python Code*. Available at: https://peps.python.org/pep-0008/`,
    },
    {
      section: "ideate",
      title: "Những ngả rẽ của Sổ Lớp",
      body: `- Nếu đã nộp quỹ → "Cảm ơn"; không thì → "Nhắc nộp".
- Nếu vắng quá 5 buổi → cảnh báo.
- Nếu điểm không hợp lệ → báo lỗi nhập; không thì → tính tiếp.

Mỗi tình huống: **một điều kiện, hai kết cục**.`,
    },
    {
      section: "core",
      title: "Cú pháp if",
      body: `~~~python
if dieu_kien:
    lenh_1
    lenh_2
lenh_sau
~~~

- Cuối dòng if có **dấu hai chấm**.
- Các lệnh thuộc if **thụt vào 4 dấu cách**.
- Dòng không thụt lề là đã **ra khỏi** if — luôn chạy.`,
      py: { code: 'vang = 7\nif vang > 5:\n    print("Cảnh báo: vắng quá nhiều")\n    print("Báo phụ huynh")\nprint("Kiểm tra xong")' },
    },
    {
      section: "core",
      title: "if – else",
      body: "**else** không có điều kiện: nó chạy khi điều kiện của if **sai**. Hai nhánh không bao giờ cùng chạy.",
      py: { code: 'da_nop = False\nif da_nop:\n    print("Cảm ơn bạn đã nộp quỹ")\nelse:\n    print("Nhắc: bạn chưa nộp quỹ")' },
    },
    {
      section: "core",
      title: "Thụt lề sai = ý nghĩa sai",
      body: "Hai chương trình chỉ khác **một dòng thụt lề**. Dự đoán kết quả rồi chạy.",
      py: { code: 'diem = 9\nif diem < 5:\n    print("Thi lại")\n    print("Đăng ký lịch thi")\nprint("---")\nif diem < 5:\n    print("Thi lại")\nprint("Đăng ký lịch thi")' },
    },
    {
      section: "apply",
      title: "Bài tập: chẵn hay lẻ",
      body: "Nhập số thứ tự của một bạn. In `Dãy trái` nếu số chẵn, `Dãy phải` nếu số lẻ.",
      py: {
        code: "stt = int(input())\n",
        stdin: "17",
        solution: 'stt = int(input())\nif stt % 2 == 0:\n    print("Dãy trái")\nelse:\n    print("Dãy phải")',
        hints: ["Số chẵn: stt % 2 == 0.", "Dùng if ...: / else: và nhớ thụt lề 4 dấu cách."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: đạt hay thi lại",
      body: "Nhập ĐTB. Nếu **≥ 5** in `Đạt`, ngược lại in `Thi lại`. **Dù thế nào** cuối cùng cũng in `Đã cập nhật Sổ Lớp`.",
      py: {
        code: "dtb = float(input())\n",
        stdin: "4.9",
        solution: 'dtb = float(input())\nif dtb >= 5:\n    print("Đạt")\nelse:\n    print("Thi lại")\nprint("Đã cập nhật Sổ Lớp")',
        hints: ["Dòng cuối không thụt lề để luôn chạy.", "if dtb >= 5: … else: …"],
      },
    },
  ],
  quiz: [
    { q: "Cuối dòng if phải có ký tự gì?", o: [";", ":", "{", "."], a: 1, why: "Dấu hai chấm mở khối lệnh." },
    { q: "PEP 8 khuyên thụt lề bao nhiêu dấu cách?", o: ["2", "4", "8", "Tuỳ thích"], a: 1, why: "4 dấu cách mỗi mức." },
    { kind: "truefalse", q: "Nhánh if và nhánh else có thể cùng chạy.", a: false, why: "Chỉ một trong hai." },
    { kind: "truefalse", q: "else không cần điều kiện.", a: true, why: "Nó chạy khi if sai." },
    { q: "x = 3. if x > 5: print(\"A\") / else: print(\"B\") in ra?", o: ["A", "B", "A rồi B", "Không in gì"], a: 1, why: "3 > 5 sai." },
    { kind: "bug", q: "Dòng nào gây lỗi?", lines: ["n = 4", "if n % 2 == 0:", "print(\"chẵn\")", "print(\"xong\")"], a: 2, why: "Lệnh trong if phải thụt lề → IndentationError." },
    { q: "Dòng không thụt lề sau khối if sẽ…", o: ["Chỉ chạy khi if đúng", "Chỉ chạy khi if sai", "Luôn chạy", "Không bao giờ chạy"], a: 2, why: "Đã ra khỏi khối if." },
    { kind: "order", q: "Xếp các dòng thành chương trình đúng.", items: ["d = 8", "if d >= 5:", "    print(\"Đạt\")", "else:", "    print(\"Thi lại\")"], a: [0, 1, 2, 3, 4], why: "Gán → if → khối → else → khối." },
    { q: "Ngôn ngữ nào truyền cảm hứng thụt lề cho Python?", o: ["ABC", "C", "Java", "HTML"], a: 0, why: "Guido từng làm ở dự án ABC." },
    { q: "Điều kiện để in \"Dãy trái\" cho số chẵn?", o: ["n % 2 == 1", "n % 2 == 0", "n / 2 == 0", "n // 2 == 0"], a: 1, why: "Chẵn khi chia 2 dư 0." },
  ],
};
