// Step 4 — input(): hỏi người dùng và đổi kiểu. Ô có `stdin` hiện thêm ô "Dữ liệu nhập".
export default {
  id: "py4",
  lang: "python",
  file: "so_lop/nhap_lieu.py",
  duration: "45 phút",
  summary: "Dùng input() để chương trình hỏi và nhận câu trả lời, nhớ rằng input() luôn trả về xâu, và đổi sang số bằng int() hoặc float() trước khi tính.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **input()** — chương trình hỏi, người dùng trả lời.
- input() **luôn trả về xâu** (str).
- Đổi câu trả lời sang số trước khi tính.
- Viết chương trình **nhập → xử lý → xuất** đầu tiên.`,
    },
    {
      section: "visual",
      title: "Chương trình biết hỏi",
      body: `Đến giờ chương trình của bạn luôn in ra cùng một thứ. Với **input()**, nó hỏi người dùng và làm theo câu trả lời.

Trong khoá học, câu trả lời được gõ sẵn ở ô **Dữ liệu nhập** (mỗi dòng là một lần trả lời). Sửa tên trong ô đó rồi chạy lại.`,
      py: { code: 'ten = input("Bạn tên gì? ")\nprint("Chào " + ten + ", chào mừng tới Sổ Lớp!")', stdin: "Minh Anh" },
    },
    {
      section: "visual",
      title: "Nhập → Xử lý → Xuất",
      body: `Gần như mọi chương trình đều theo khuôn ba bước:

1. **Nhập** (input): nhận dữ liệu — từ bàn phím, từ tệp, từ cảm biến.
2. **Xử lý**: tính toán, so sánh, sắp xếp.
3. **Xuất** (output): in kết quả, ghi tệp, hiện lên màn hình.

Máy ATM: nhập số tiền → kiểm tra số dư → nhả tiền. Sổ Lớp: nhập điểm → tính trung bình → in xếp loại.`,
    },
    {
      section: "research",
      title: "Vì sao input() trả về xâu?",
      body: `Bàn phím chỉ gửi **ký tự**. Khi bạn gõ \`8\`, Python nhận ký tự "8", không biết bạn muốn nó là số 8, điểm 8.0 hay chữ "8" trong tên lớp "8A".

Python chọn cách an toàn: **trả nguyên văn dưới dạng xâu**, để người viết chương trình tự quyết định đổi sang kiểu gì. Đây là nguyên tắc chung trong Python: *"Rõ ràng tốt hơn ngầm định"* (The Zen of Python, PEP 20).

> Peters, T. (2004) *PEP 20 – The Zen of Python*. Available at: https://peps.python.org/pep-0020/`,
    },
    {
      section: "ideate",
      title: "Sổ Lớp cần hỏi gì",
      body: `Để tính điểm một bạn, chương trình cần hỏi:

- Tên học sinh → giữ nguyên **str**.
- Điểm giữa kỳ, cuối kỳ → đổi sang **float** (điểm có thể lẻ).
- Số buổi vắng → đổi sang **int**.

Quyết định kiểu cho từng câu hỏi **trước** khi viết code giúp bạn tránh lỗi TypeError.`,
    },
    {
      section: "core",
      title: "Cú pháp input()",
      body: `~~~python
bien = input("Câu hỏi hiện ra: ")
~~~

- Chữ trong ngoặc là **lời nhắc** (prompt), in ra trước khi chờ.
- Nên để một **dấu cách** ở cuối lời nhắc cho câu trả lời khỏi dính sát.
- Chương trình **dừng chờ** đến khi người dùng nhấn Enter.
- Giá trị nhận được là **str**, kể cả khi người dùng gõ số.`,
    },
    {
      section: "core",
      title: "Cái bẫy: cộng hai câu trả lời",
      body: "Code dưới đây có bẫy: hai điểm 8 và 7 bị **nối** thành 87 thay vì cộng thành 15. Chạy, nhìn kết quả, rồi sửa bằng float().",
      py: { code: 'a = input("Điểm 1: ")\nb = input("Điểm 2: ")\nprint("Tổng:", a + b)', stdin: "8\n7" },
    },
    {
      section: "core",
      title: "Đổi kiểu ngay khi nhận",
      body: "Cách gọn nhất: bọc input() trong int() hoặc float() ngay trên một dòng.",
      py: { code: 'gk = float(input("Điểm giữa kỳ: "))\nck = float(input("Điểm cuối kỳ: "))\nprint("Tổng hai bài:", gk + ck)', stdin: "7.5\n8" },
    },
    {
      section: "core",
      title: "Khi người dùng gõ sai",
      body: `Nếu người dùng gõ \`tám\` thay vì \`8\`, \`float("tám")\` báo **ValueError** và chương trình dừng.

Hiện tại hãy chấp nhận điều đó. Ở chặng 7, bạn sẽ học **try / except** để bắt lỗi và hỏi lại một cách lịch sự. Thử sửa ô Dữ liệu nhập thành \`tám\` để xem lỗi trông thế nào.`,
      py: { code: 'diem = float(input("Điểm: "))\nprint("Bạn được", diem, "điểm")', stdin: "8" },
    },
    {
      section: "apply",
      title: "Bài tập: lời chào cá nhân",
      body: `Hỏi tên và lớp (hai lần input), rồi in:

~~~
Xin chào Linh, học sinh lớp 11B2!
~~~

Ô Dữ liệu nhập đã có sẵn \`Linh\` và \`11B2\`. Lời nhắc của input() bạn viết gì cũng được — lúc chấm, Python bỏ qua lời nhắc và chỉ so dòng bạn in ra.`,
      py: {
        code: "ten = input()\n",
        stdin: "Linh\n11B2",
        solution: 'ten = input()\nlop = input()\nprint("Xin chào " + ten + ", học sinh lớp " + lop + "!")',
        hints: ["lop = input() để nhận dòng thứ hai.", "Nối: \"Xin chào \" + ten + \", học sinh lớp \" + lop + \"!\""],
      },
    },
    {
      section: "apply",
      title: "Bài tập: tiền quỹ cả lớp",
      body: `Nhập **sĩ số** và **số tiền mỗi bạn nộp** (hai dòng). In tổng tiền quỹ thu được, dạng:

~~~
Tổng quỹ: 800000
~~~`,
      py: {
        code: "",
        stdin: "40\n20000",
        solution: 'si_so = int(input())\nmoi_ban = int(input())\nprint("Tổng quỹ:", si_so * moi_ban)',
        hints: ["Cả hai đều là số nguyên: int(input()).", "Nhân hai số rồi in: print(\"Tổng quỹ:\", si_so * moi_ban)."],
      },
    },
  ],
  quiz: [
    { q: "input() trả về kiểu gì?", o: ["int", "float", "str", "Tuỳ người dùng gõ gì"], a: 2, why: "Luôn là xâu — muốn số thì phải đổi kiểu." },
    { q: "Người dùng gõ 4 và 5 cho a = input(), b = input(). print(a + b) in ra?", o: ["9", "45", "4 5", "Báo lỗi"], a: 1, why: "Hai xâu được nối: \"4\" + \"5\" = \"45\"." },
    { q: "Cách đúng để nhận điểm 8.5 thành số?", o: ["int(input())", "float(input())", "input(float)", "str(input())"], a: 1, why: "Điểm có phần lẻ dùng float; int(\"8.5\") sẽ báo lỗi." },
    { kind: "truefalse", q: "Chữ trong ngoặc của input(\"...\") là câu trả lời mặc định.", a: false, why: "Đó là lời nhắc in ra trước khi chờ người dùng gõ." },
    { kind: "order", q: "Xếp đúng khuôn của một chương trình.", items: ["Nhập", "Xử lý", "Xuất"], a: [0, 1, 2], why: "Input → process → output." },
    { kind: "bug", q: "Dòng nào sẽ báo lỗi khi người dùng gõ 16?", lines: ["tuoi = input(\"Tuổi: \")", "print(\"Bạn \" + tuoi + \" tuổi\")", "print(tuoi * 2)", "print(tuoi + 1)"], a: 3, why: "tuoi là xâu; xâu cộng số báo TypeError. (tuoi * 2 không lỗi — nó in 1616.)" },
    { q: "float(\"abc\") gây ra lỗi gì?", o: ["TypeError", "ValueError", "NameError", "Không lỗi"], a: 1, why: "Đúng kiểu xâu nhưng giá trị không đổi được sang số → ValueError." },
    { kind: "multi", q: "Thông tin nào nên đổi sang int ngay khi nhập?", o: ["Số buổi vắng", "Sĩ số", "Tên lớp", "Điểm trung bình"], a: [0, 1], why: "Đếm được là int; tên giữ str; điểm trung bình là float." },
    { q: "Vì sao Python không tự đoán kiểu khi input()?", o: ["Vì Python chậm", "Rõ ràng tốt hơn ngầm định — người viết tự quyết định", "Vì bàn phím không gõ được số", "Vì int không tồn tại"], a: 1, why: "Nguyên tắc trong The Zen of Python (PEP 20)." },
    { kind: "match", q: "Nối câu hỏi với cách nhận phù hợp.", pairs: [["Tên bạn?", "input()"], ["Mấy buổi vắng?", "int(input())"], ["Điểm cuối kỳ?", "float(input())"]], why: "Chọn kiểu theo cách bạn sẽ dùng giá trị." },
  ],
};
