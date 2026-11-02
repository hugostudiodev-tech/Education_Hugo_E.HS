// Step 20 — Mẫu tích luỹ: tổng, đếm, lớn nhất — sổ tiết kiệm (kết chặng 4).
export default {
  id: "py20",
  lang: "python",
  file: "so_lop/tich_luy.py",
  duration: "50 phút",
  summary: "Nắm bốn mẫu tích luỹ kinh điển (tổng, đếm, lớn nhất/nhỏ nhất, tích), rồi làm sổ tiết kiệm quỹ lớp với lãi kép theo tháng.",
  slides: [
    {
      section: "intro",
      title: "Dự án kết chặng 4",
      body: `Bốn **mẫu** (pattern) bạn sẽ dùng cả đời lập trình:

1. **Tổng**: bắt đầu 0, cộng dồn.
2. **Đếm**: bắt đầu 0, gặp thoả thì +1.
3. **Lớn nhất / nhỏ nhất**: giữ "kỷ lục", gặp tốt hơn thì thay.
4. **Tích**: bắt đầu 1, nhân dồn.

Kết chặng: **sổ tiết kiệm** quỹ lớp.`,
    },
    {
      section: "visual",
      title: "Bốn mẫu trong một chương trình",
      body: "Đọc điểm 5 bạn (mỗi dòng một điểm) và tính cùng lúc: tổng, số bạn ≥ 8, điểm cao nhất.",
      py: { code: 'tong = 0\ngioi = 0\ncao_nhat = -1\nfor _ in range(5):\n    d = float(input())\n    tong += d\n    if d >= 8:\n        gioi += 1\n    if d > cao_nhat:\n        cao_nhat = d\nprint(f"TB {tong / 5:.1f} | giỏi {gioi} | cao nhất {cao_nhat}")', stdin: "8\n6.5\n9.5\n7\n8" },
    },
    {
      section: "research",
      title: "Lãi kép",
      body: `Gửi P đồng, lãi suất r mỗi kỳ, sau n kỳ có:

**A = P × (1 + r)ⁿ** (\`r\` là lãi suất viết dạng thập phân, ví dụ 0.5% = 0.005).

Lãi kỳ sau tính trên cả tiền gốc **lẫn lãi đã có** — "lãi mẹ đẻ lãi con". Bạn có thể tính bằng công thức (\`**\`), hoặc bằng **vòng lặp tích luỹ** mỗi tháng nhân thêm (1 + r). Hai cách phải ra cùng một số — đó cũng là cách kiểm tra chương trình. Bài toán giả định lãi suất cố định, ghép lãi mỗi tháng và chưa tính thuế, phí hay lạm phát; kết quả không phải dự báo lợi nhuận thực tế.

> Khan Academy (n.d.) *Compound interest*. Available at: https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/compound-interest-tutorial/a/compound-interest-and-e`,
    },
    {
      section: "ideate",
      title: "Thiết kế sổ tiết kiệm",
      body: `- **Nhập**: tiền gốc, lãi suất tháng (%), số tháng.
- **Mỗi tháng**: tiền = tiền × (1 + r/100); in dòng \`Tháng k: …\`.
- **Cuối**: tổng lãi = tiền cuối − gốc.

Số tiền làm tròn tới **đồng** (\`round(x)\`) và in có dấu phẩy hàng nghìn.`,
    },
    {
      section: "core",
      title: "Mẫu lớn nhất: chọn giá trị khởi đầu",
      body: `Đặt "kỷ lục" ban đầu thế nào?

- Nếu biết miền giá trị (điểm 0–10) → đặt **thấp hơn mọi giá trị**: -1.
- Tổng quát: lấy **phần tử đầu tiên** làm kỷ lục.
- Hoặc \`float("-inf")\` — âm vô cùng.

Sai lầm hay gặp: đặt \`cao_nhat = 0\` khi dữ liệu có thể toàn số âm.`,
    },
    {
      section: "core",
      title: "Mẫu tích: giai thừa",
      body: "Tích bắt đầu từ **1** (không phải 0 — nhân với 0 thì mãi bằng 0). n! = 1 × 2 × … × n.",
      py: { code: "n = 10\ngt = 1\nfor i in range(1, n + 1):\n    gt *= i\nprint(f\"{n}! = {gt:,}\")" },
    },
    {
      section: "core",
      title: "Hai cách tính lãi kép phải khớp",
      body: "Vòng lặp và công thức cho cùng kết quả (sai khác rất nhỏ do số thực).",
      py: { code: "goc, r, n = 1000000, 0.5, 12\ntien = goc\nfor thang in range(n):\n    tien *= 1 + r / 100\nprint(round(tien))\nprint(round(goc * (1 + r / 100) ** n))" },
    },
    {
      section: "apply",
      title: "Dự án: sổ tiết kiệm",
      body: `Nhập 3 dòng: **gốc** (int), **lãi suất %/tháng** (float), **số tháng** (int). In mỗi tháng một dòng \`Tháng k: X đ\` (X làm tròn đồng, có dấu phẩy), cuối cùng \`Tổng lãi: Y đ\`.

Với 1000000 / 0.5 / 3:

~~~
Tháng 1: 1,005,000 đ
Tháng 2: 1,010,025 đ
Tháng 3: 1,015,075 đ
Tổng lãi: 15,075 đ
~~~`,
      py: {
        code: "goc = int(input())\nr = float(input())\nn = int(input())\n",
        stdin: "1000000\n0.5\n3",
        solution: 'goc = int(input())\nr = float(input())\nn = int(input())\ntien = goc\nfor k in range(1, n + 1):\n    tien *= 1 + r / 100\n    print(f"Tháng {k}: {round(tien):,} đ")\nprint(f"Tổng lãi: {round(tien - goc):,} đ")',
        hints: ["tien bắt đầu bằng goc; mỗi tháng tien *= 1 + r / 100.", "In bằng f\"{round(tien):,}\"."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: điểm thấp nhất",
      body: "Dòng đầu là số bạn n, sau đó n dòng điểm. In điểm **thấp nhất** và **số bạn dưới 5**, dạng `Thấp nhất: 3.5 | Dưới 5: 2`.",
      py: {
        code: "n = int(input())\n",
        stdin: "5\n7\n3.5\n8\n4.5\n9",
        solution: 'n = int(input())\nthap = 11\nduoi5 = 0\nfor _ in range(n):\n    d = float(input())\n    if d < thap:\n        thap = d\n    if d < 5:\n        duoi5 += 1\nprint(f"Thấp nhất: {thap} | Dưới 5: {duoi5}")',
        hints: ["Kỷ lục thấp nhất khởi đầu cao hơn mọi điểm, ví dụ 11.", "Hai if riêng: một cho kỷ lục, một cho đếm."],
      },
    },
  ],
  quiz: [
    { q: "Biến tổng nên khởi đầu bằng?", o: ["0", "1", "None", "-1"], a: 0, why: "Cộng dồn từ 0." },
    { q: "Biến tích nên khởi đầu bằng?", o: ["0", "1", "10", "-1"], a: 1, why: "Nhân với 0 sẽ luôn ra 0." },
    { q: "5! bằng?", o: ["15", "120", "25", "60"], a: 1, why: "1×2×3×4×5." },
    { kind: "truefalse", q: "Với dữ liệu có thể toàn số âm, đặt cao_nhat = 0 là an toàn.", a: false, why: "0 lớn hơn mọi số âm nên sẽ không bao giờ bị thay." },
    { q: "1 000 000 đ, lãi 1%/tháng, sau 2 tháng (lãi kép)?", o: ["1 020 000", "1 020 100", "1 010 000", "1 200 000"], a: 1, why: "1 000 000 × 1.01²." },
    { kind: "match", q: "Nối mẫu với câu lệnh cập nhật.", pairs: [["Tổng", "tong += x"], ["Đếm", "dem += 1"], ["Tích", "tich *= x"], ["Lớn nhất", "if x > m: m = x"]], why: "Bốn mẫu tích luỹ." },
    { kind: "bug", q: "Kết quả luôn là 0. Dòng nào sai?", lines: ["tich = 0", "for i in range(1, 6):", "    tich *= i", "print(tich)"], a: 0, why: "Tích phải khởi đầu bằng 1." },
    { q: "float(\"-inf\") dùng để?", o: ["Báo lỗi", "Khởi đầu kỷ lục lớn nhất — nhỏ hơn mọi số", "Làm tròn", "Đếm"], a: 1, why: "Âm vô cùng." },
    { kind: "multi", q: "Cách nào kiểm tra chương trình lãi kép?", o: ["So với công thức P(1+r)ⁿ", "Tính tay tháng đầu", "Tin là đúng vì không báo lỗi", "Thử r = 0 (tiền không đổi)"], a: [0, 1, 3], why: "Không báo lỗi chưa đủ." },
    { q: "Lãi kép khác lãi đơn ở chỗ?", o: ["Lãi tính trên cả lãi đã có", "Không có lãi", "Lãi trả một lần", "Lãi giảm dần"], a: 0, why: "Lãi mẹ đẻ lãi con." },
  ],
};
