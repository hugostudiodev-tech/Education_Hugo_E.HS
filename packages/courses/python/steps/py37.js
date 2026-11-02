// Step 37 — random: trò chơi đố vui ôn bài.
export default {
  id: "py37", lang: "python", file: "so_lop/do_vui.py", duration: "45 phút",
  summary: "Dùng random.choice/randint/shuffle, seed để tái hiện và xây trò chơi đố vui có chấm điểm.",
  slides: [
    { section: "intro", title: "Ngẫu nhiên có kiểm soát", body: "Module `random` tạo lựa chọn, số và thứ tự giả ngẫu nhiên. Nó phù hợp cho trò chơi, mô phỏng và xáo câu hỏi—không dùng cho mật khẩu." },
    { section: "visual", visual: "py-random-seed", title: "Ba công cụ quen thuộc", body: "Đặt seed giúp ví dụ cho cùng kết quả mỗi lần, rất hữu ích khi kiểm thử.", py: { code: 'import random\nrandom.seed(7)\nprint(random.randint(1, 10))\nprint(random.choice(["A", "B", "C"]))\nds = [1, 2, 3, 4]\nrandom.shuffle(ds)\nprint(ds)' } },
    { section: "research", title: "Giả ngẫu nhiên và bảo mật", body: `**random** dùng bộ sinh giả ngẫu nhiên Mersenne Twister, có thể tái hiện từ seed và không phù hợp cho bảo mật. Token, mật khẩu tạm hoặc khoá bí mật phải dùng module **secrets**.

> Python Software Foundation (2026) *random — Generate pseudo-random numbers*. Available at: https://docs.python.org/3/library/random.html` },
    { section: "ideate", title: "Thiết kế trò đố vui", body: "Danh sách câu hỏi là các tuple `(câu, đáp án)`. Xáo thứ tự, hỏi từng câu, chuẩn hoá câu trả lời và cộng điểm. Cuối cùng in số đúng trên tổng." },
    { section: "core", title: "choice, sample và shuffle", body: "`choice` lấy một phần tử; `sample` lấy nhiều phần tử không lặp; `shuffle` đổi thứ tự list tại chỗ.", py: { code: 'import random\nrandom.seed(2)\ncau = ["if", "for", "list", "dict"]\nprint(random.choice(cau))\nprint(random.sample(cau, 2))\nrandom.shuffle(cau)\nprint(cau)' } },
    { section: "core", title: "Sinh câu hỏi toán", body: "`randint(a, b)` gồm cả hai đầu. Lưu đáp án tính được để so với input.", py: { code: 'import random\nrandom.seed(3)\na = random.randint(2, 9)\nb = random.randint(2, 9)\nprint(f"{a} × {b} = ?")\nprint("Đáp án:", a * b)' } },
    { section: "core", title: "Chọn đúng hàm random", body: "| Cần | Hàm | Ví dụ kết quả |\n|---|---|---|\n| Một số nguyên trong [a, b] | randint(1, 6) | 4 |\n| Một số thực trong [0, 1) | random() | 0.3746… |\n| Một phần tử | choice(ds) | \"for\" |\n| k phần tử không lặp | sample(ds, 2) | [\"if\", \"dict\"] |\n| Xáo list tại chỗ | shuffle(ds) | None (list đã đổi) |\n\nChạy ví dụ: cùng seed, hai lần chạy cho cùng dãy.", py: { code: "import random\nfor lan in range(2):\n    random.seed(7)\n    print([random.randint(1, 10) for _ in range(4)])" } },
    { section: "core", title: "Lỗi hay gặp với random", body: "1. **Gán kết quả shuffle**: `ds = random.shuffle(ds)` → `ds` thành `None`.\n2. **Nhầm biên randint và randrange**: `randint(1, 6)` có 6, `randrange(1, 6)` không có 6.\n3. **Đặt seed trong vòng lặp**: mỗi lượt lại reset → luôn ra cùng một số.\n4. **Dùng random cho mật khẩu**: đoán được từ seed. Dùng `secrets`.\n5. **So đáp án không chuẩn hoá**: \"Def \" khác \"def\". Dùng `strip().casefold()`.", py: { code: "import random\nfor _ in range(3):\n    random.seed(1)\n    print(random.randint(1, 100))" } },
    { section: "apply", title: "Bài tập: câu hỏi ngẫu nhiên", body: "Đặt seed 5, sinh a và b từ 1..10. Nhập đáp án phép cộng; in câu hỏi rồi `Đúng` hoặc `Sai — đáp án X`.", py: { code: "import random\nrandom.seed(5)\n", stdin: "15", solution: 'import random\nrandom.seed(5)\na = random.randint(1, 10)\nb = random.randint(1, 10)\nprint(f"{a} + {b} = ?")\ntra_loi = int(input())\nif tra_loi == a + b:\n    print("Đúng")\nelse:\n    print(f"Sai — đáp án {a + b}")', hints: ["Sinh a, b trước rồi in câu hỏi.", "So tra_loi với a + b."] } },
    { section: "apply", title: "Dự án: đố vui ba câu", body: "Có ba tuple câu–đáp án. Đặt seed 1, shuffle; đọc ba câu trả lời, không phân biệt hoa thường. In `Điểm: X/3`.", py: { code: 'import random\nrandom.seed(1)\ncau_hoi = [("Từ khoá tạo hàm?", "def"), ("Kiểu không trùng?", "set"), ("Vòng lặp biết số lần?", "for")]\n', stdin: "set\nfor\ndef", solution: 'import random\nrandom.seed(1)\ncau_hoi = [("Từ khoá tạo hàm?", "def"), ("Kiểu không trùng?", "set"), ("Vòng lặp biết số lần?", "for")]\nrandom.shuffle(cau_hoi)\ndiem = 0\nfor cau, dap_an in cau_hoi:\n    print(cau)\n    if input().strip().casefold() == dap_an.casefold():\n        diem += 1\nprint(f"Điểm: {diem}/{len(cau_hoi)}")', hints: ["shuffle thay đổi chính list cau_hoi.", "So sánh hai vế sau strip().casefold()."] } },
  ],
  quiz: [
    { q: "randint(1, 3) có thể trả?", o: ["1, 2 hoặc 3", "Chỉ 1 hoặc 2", "Chỉ 3", "0 đến 3"], a: 0, why: "randint gồm cả hai đầu." },
    { q: "shuffle làm gì?", o: ["Đổi thứ tự list tại chỗ", "Trả số ngẫu nhiên", "Sắp tăng dần", "Tạo dict"], a: 0, why: "List gốc bị xáo." },
    { kind: "truefalse", q: "Cùng seed và cùng chuỗi lệnh cho cùng kết quả.", a: true, why: "Seed giúp tái hiện giả ngẫu nhiên." },
    { kind: "output", q: "Đoán tính chất kết quả.", code: "import random\nrandom.seed(1)\na=random.randint(1,5)\nrandom.seed(1)\nb=random.randint(1,5)\nprint(a==b)", o: ["True", "False"], a: 0, why: "Đặt lại cùng seed tái hiện số." },
    { q: "Dùng gì cho token bảo mật?", o: ["secrets", "random", "shuffle", "statistics"], a: 0, why: "random không an toàn mật mã." },
    { kind: "bug", q: "Muốn list đã xáo nhưng biến kq thành None. Dòng nào sai?", lines: ["ds = [1,2,3]", "kq = random.shuffle(ds)", "print(kq)", "print(ds)"], a: 1, why: "shuffle đổi tại chỗ và trả None." },
    { kind: "blank", q: "Điền để lấy một phần tử.", code: "cau = random.___(cau_hoi)", a: "choice", why: "choice chọn một phần tử." },
    { kind: "multi", q: "Hàm thuộc random?", o: ["choice", "randint", "shuffle", "mean"], a: [0, 1, 2], why: "mean thuộc statistics." },
    { q: "sample(ds, 3) khác choice ở đâu?", o: ["Lấy 3 phần tử không lặp", "Luôn đổi ds", "Chỉ lấy số", "Không ngẫu nhiên"], a: 0, why: "sample trả mẫu mới." },
    { q: "Chuẩn hoá câu trả lời nên dùng?", o: ["strip().casefold()", "randint", "sort", "float"], a: 0, why: "Bỏ khoảng trắng và không phân biệt hoa thường." },
  ],
};
