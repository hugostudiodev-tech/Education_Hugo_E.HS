// Step 10 — Dự án nhỏ: điểm trung bình môn theo hệ số (kết chặng 2).
export default {
  id: "py10",
  lang: "python",
  file: "so_lop/diem_tb_mon.py",
  duration: "50 phút",
  summary: "Ghép toàn bộ chặng 2: tính điểm trung bình môn có hệ số (thường xuyên ×1, giữa kỳ ×2, cuối kỳ ×3), làm tròn và in phiếu điểm đẹp.",
  slides: [
    {
      section: "intro",
      title: "Dự án kết chặng 2",
      body: `Bạn sẽ viết phần **tính điểm** của Sổ Lớp: nhập điểm các bài, nhân hệ số, chia tổng hệ số, làm tròn và in phiếu.

Dùng lại mọi thứ của chặng: toán tử, ngoặc, round(), f-string.`,
    },
    {
      section: "visual",
      title: "Trung bình có trọng số",
      body: `Bài quan trọng hơn thì "nặng" hơn. Ví dụ quy ước trong dự án (giả định, mỗi trường có thể khác):

| Bài | Hệ số |
|---|---|
| Thường xuyên (mỗi bài) | 1 |
| Giữa kỳ | 2 |
| Cuối kỳ | 3 |

**ĐTB = (tổng điểm × hệ số) / (tổng hệ số)**`,
      py: { code: "tx1, tx2, gk, ck = 8, 7, 7.5, 9\ntb = (tx1 + tx2 + gk * 2 + ck * 3) / (1 + 1 + 2 + 3)\nprint(tb, round(tb, 1))" },
    },
    {
      section: "research",
      title: "Trung bình cộng và trung bình có trọng số",
      body: `**Trung bình cộng** coi mọi giá trị như nhau. **Trung bình có trọng số** nhân mỗi giá trị với trọng số w rồi chia cho tổng trọng số:

x̄ = (w₁x₁ + w₂x₂ + … + wₙxₙ) / (w₁ + w₂ + … + wₙ)

Khi mọi trọng số bằng nhau, hai cách cho cùng kết quả. Cách tính này dùng cả trong điểm GPA đại học (trọng số = số tín chỉ). Ví dụ trong khóa là **quy ước giả định để học công thức**, không phải quy chế điểm áp dụng cho mọi trường.

> OpenStax (2023) *Introductory Statistics 2e: Measures of the Center of the Data*. Available at: https://openstax.org/books/introductory-statistics-2e/pages/2-5-measures-of-the-center-of-the-data`,
    },
    {
      section: "ideate",
      title: "Phân rã bài toán",
      body: `1. **Nhập**: 2 điểm thường xuyên, 1 giữa kỳ, 1 cuối kỳ (float).
2. **Xử lý**: tử số = tổng điểm × hệ số; mẫu số = tổng hệ số; chia; làm tròn 1 chữ số.
3. **Xuất**: phiếu điểm có viền.

Tự tính tay một ví dụ **trước** khi code để có đáp án mà so.`,
    },
    {
      section: "core",
      title: "Đặt tên cho hệ số",
      body: "Đừng để số 2, 3, 7 nằm rải rác. Gán hệ số vào biến — đổi quy chế chỉ cần sửa một dòng.",
      py: { code: 'HS_TX, HS_GK, HS_CK = 1, 2, 3\ntx1, tx2, gk, ck = 8, 7, 7.5, 9\ntu = (tx1 + tx2) * HS_TX + gk * HS_GK + ck * HS_CK\nmau = 2 * HS_TX + HS_GK + HS_CK\nprint(f"ĐTB: {tu / mau:.1f}")' },
    },
    {
      section: "core",
      title: "Kiểm tra bằng ví dụ tính tay",
      body: `Với 8, 7, 7.5, 9:

- Tử: 8 + 7 + 7.5×2 + 9×3 = 15 + 15 + 27 = **57**
- Mẫu: 1 + 1 + 2 + 3 = **7**
- ĐTB: 57 / 7 ≈ **8.14** → **8.1**

Máy in 8.1 → khớp. Nếu không khớp, lỗi nằm ở ngoặc hoặc hệ số.`,
    },
    {
      section: "apply",
      title: "Dự án: phiếu điểm môn",
      body: `Nhập 5 dòng: **tên**, **tx1**, **tx2**, **giữa kỳ**, **cuối kỳ**. In đúng:

~~~
------------------------
Phiếu điểm: Minh Anh
Điểm TB môn: 8.1
------------------------
~~~

Viền là 24 dấu \`-\`. ĐTB định dạng \`:.1f\`.`,
      py: {
        code: "ten = input()\n",
        stdin: "Minh Anh\n8\n7\n7.5\n9",
        solution: 'ten = input()\ntx1 = float(input())\ntx2 = float(input())\ngk = float(input())\nck = float(input())\ntb = (tx1 + tx2 + gk * 2 + ck * 3) / 7\nprint("-" * 24)\nprint(f"Phiếu điểm: {ten}")\nprint(f"Điểm TB môn: {tb:.1f}")\nprint("-" * 24)',
        hints: ["Bốn điểm đều đổi bằng float(input()).", "tb = (tx1 + tx2 + gk * 2 + ck * 3) / 7, in bằng {tb:.1f}."],
      },
    },
    {
      section: "apply",
      title: "Mở rộng: cần bao nhiêu điểm cuối kỳ?",
      body: `Biết tx1, tx2, gk (nhập 3 dòng) và **mục tiêu ĐTB 8.0**. In điểm cuối kỳ tối thiểu cần đạt, 2 chữ số thập phân.

Gợi ý toán: 8.0 × 7 = tx1 + tx2 + gk×2 + ck×3 → giải ra ck. Với 8, 7, 7.5 phải in \`8.67\`.`,
      py: {
        code: "tx1 = float(input())\ntx2 = float(input())\ngk = float(input())\n",
        stdin: "8\n7\n7.5",
        solution: 'tx1 = float(input())\ntx2 = float(input())\ngk = float(input())\nck = (8.0 * 7 - tx1 - tx2 - gk * 2) / 3\nprint(f"{ck:.2f}")',
        hints: ["ck = (8.0 * 7 - tx1 - tx2 - gk * 2) / 3", "In bằng f\"{ck:.2f}\"."],
      },
    },
  ],
  quiz: [
    { q: "Điểm 6 (hệ số 1) và 9 (hệ số 2). ĐTB có trọng số?", o: ["7.5", "8.0", "7.0", "9.0"], a: 1, why: "(6 + 18) / 3 = 8." },
    { kind: "truefalse", q: "Khi mọi hệ số bằng nhau, trung bình có trọng số bằng trung bình cộng.", a: true, why: "Trọng số triệt tiêu." },
    { q: "Vì sao gán hệ số vào biến HS_GK, HS_CK?", o: ["Chạy nhanh hơn", "Đổi quy chế chỉ sửa một chỗ, code dễ đọc", "Python bắt buộc", "Để dùng được round"], a: 1, why: "Tránh số ma thuật." },
    { kind: "bug", q: "Dòng nào sai?", lines: ["tu = tx * 1 + gk * 2 + ck * 3", "mau = 1 + 2 + 3", "tb = tu / mau", "tb = tu + mau / 2"], a: 3, why: "Công thức thừa, sai ưu tiên và sai ý." },
    { q: "57 / 7 làm tròn 1 chữ số là?", o: ["8.1", "8.2", "8.0", "8.14"], a: 0, why: "8.142… → 8.1." },
    { kind: "order", q: "Xếp các bước làm dự án.", items: ["Tính tay một ví dụ", "Viết code", "Chạy và so với ví dụ", "Sửa nếu lệch"], a: [0, 1, 2, 3], why: "Có đáp án trước để kiểm tra." },
    { q: "GPA đại học thường dùng trọng số là gì?", o: ["Số tín chỉ", "Số buổi học", "Tuổi giảng viên", "Số trang giáo trình"], a: 0, why: "Môn nhiều tín chỉ nặng hơn." },
    { kind: "multi", q: "Kiến thức nào của chặng 2 dùng trong dự án?", o: ["Toán tử và ngoặc", "round / định dạng :.1f", "f-string", "Vòng lặp for"], a: [0, 1, 2], why: "Vòng lặp là chặng 4." },
    { q: "Muốn ĐTB ≥ 8 với tổng hệ số 7, tổng (điểm × hệ số) phải ít nhất?", o: ["8", "56", "7", "64"], a: 1, why: "8 × 7 = 56." },
    { kind: "truefalse", q: "Chương trình chạy không lỗi nghĩa là công thức đúng.", a: false, why: "Lỗi logic chỉ lộ khi so với ví dụ tính tay." },
  ],
};
