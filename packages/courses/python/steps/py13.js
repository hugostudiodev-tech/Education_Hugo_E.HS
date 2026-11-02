// Step 13 — elif: xếp loại học lực.
export default {
  id: "py13",
  lang: "python",
  file: "so_lop/xep_loai.py",
  duration: "45 phút",
  summary: "Dùng if-elif-else cho nhiều nhánh, hiểu Python chỉ chạy nhánh ĐÚNG ĐẦU TIÊN nên thứ tự điều kiện quan trọng, và viết chương trình xếp loại học lực.",
  slides: [
    {
      section: "intro",
      title: "Step này dạy gì",
      body: `- **elif** = "else if": thêm nhánh thứ ba, thứ tư…
- Chỉ **nhánh đúng đầu tiên** được chạy.
- **Thứ tự** điều kiện quyết định kết quả.
- Viết phần **xếp loại** của Sổ Lớp.`,
    },
    {
      section: "visual",
      title: "Cầu thang xếp loại",
      body: `Quy ước trong dự án (giả định cho bài tập, không phải quy chế chính thức):

| ĐTB | Xếp loại |
|---|---|
| từ 8.0 | Tốt |
| từ 6.5 | Khá |
| từ 5.0 | Đạt |
| dưới 5.0 | Chưa đạt |

Python kiểm từ bậc trên cùng xuống; gặp bậc đúng đầu tiên là dừng.`,
      py: { code: 'dtb = 7.2\nif dtb >= 8:\n    print("Tốt")\nelif dtb >= 6.5:\n    print("Khá")\nelif dtb >= 5:\n    print("Đạt")\nelse:\n    print("Chưa đạt")' },
    },
    {
      section: "research",
      title: "Bảng quyết định",
      body: `Trong kỹ thuật phần mềm, khi có nhiều điều kiện, người ta vẽ **bảng quyết định** (decision table): mỗi hàng là một tổ hợp điều kiện, cột cuối là hành động. Bảng giúp kiểm tra đã phủ **hết mọi trường hợp** và **không chồng chéo**.

Bảng xếp loại ở slide trước chính là một bảng quyết định nhỏ. Viết bảng trước, code sau — bạn sẽ ít sót trường hợp hơn.`,
    },
    {
      section: "ideate",
      title: "Kiểm tra biên",
      body: `Lỗi hay nằm ở **ranh giới**. Trước khi code, liệt kê các giá trị cần thử:

- 8.0 (đúng mốc Tốt), 7.99
- 6.5, 6.49
- 5.0, 4.99
- 0 và 10

Nếu chương trình đúng ở mọi mốc, gần như chắc chắn đúng ở giữa.`,
    },
    {
      section: "core",
      title: "Cú pháp if – elif – else",
      body: `~~~python
if dk1:
    ...
elif dk2:
    ...
elif dk3:
    ...
else:
    ...
~~~

- Có bao nhiêu elif cũng được; else là tuỳ chọn.
- Kiểm **lần lượt** từ trên xuống, chạy nhánh đúng **đầu tiên**, bỏ qua phần còn lại.`,
    },
    {
      section: "core",
      title: "Sai thứ tự — sai kết quả",
      body: "Đảo thứ tự: ĐTB 9.5 thoả `>= 5` trước tiên, nên bị xếp \"Đạt\". Không có lỗi nào được báo — đây là lỗi logic.",
      py: { code: 'dtb = 9.5\nif dtb >= 5:\n    print("Đạt")\nelif dtb >= 6.5:\n    print("Khá")\nelif dtb >= 8:\n    print("Tốt")' },
    },
    {
      section: "core",
      title: "elif khác nhiều if rời",
      body: "Nhiều if rời nhau thì **mỗi if đều được kiểm**, có thể in nhiều dòng. Chạy để thấy khác biệt.",
      py: { code: 'dtb = 9\nif dtb >= 8:\n    print("Tốt")\nif dtb >= 6.5:\n    print("Khá")\nif dtb >= 5:\n    print("Đạt")' },
    },
    {
      section: "apply",
      title: "Bài tập: xếp loại học lực",
      body: "Nhập ĐTB, in xếp loại theo bảng: **Tốt** (≥ 8), **Khá** (≥ 6.5), **Đạt** (≥ 5), **Chưa đạt**.",
      py: {
        code: "dtb = float(input())\n",
        stdin: "6.5",
        solution: 'dtb = float(input())\nif dtb >= 8:\n    print("Tốt")\nelif dtb >= 6.5:\n    print("Khá")\nelif dtb >= 5:\n    print("Đạt")\nelse:\n    print("Chưa đạt")',
        hints: ["Bắt đầu từ mốc cao nhất: if dtb >= 8.", "Thêm hai elif và một else."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: điểm chữ",
      body: "Nhập điểm thang 10, đổi sang điểm chữ: **A** (≥ 8.5), **B** (≥ 7), **C** (≥ 5.5), **D** (≥ 4), **F** (còn lại). In chỉ một chữ cái.",
      py: {
        code: "d = float(input())\n",
        stdin: "7",
        solution: 'd = float(input())\nif d >= 8.5:\n    print("A")\nelif d >= 7:\n    print("B")\nelif d >= 5.5:\n    print("C")\nelif d >= 4:\n    print("D")\nelse:\n    print("F")',
        hints: ["Năm nhánh: if, ba elif, else.", "Mốc 7 là B (>= 7)."],
      },
    },
  ],
  quiz: [
    { q: "elif là viết tắt của?", o: ["else if", "else list", "elevate if", "end if"], a: 0, why: "else if." },
    { q: "Trong if-elif-else, có bao nhiêu nhánh được chạy?", o: ["Tất cả nhánh đúng", "Đúng một nhánh (nhánh đúng đầu tiên hoặc else)", "Hai nhánh", "Không nhánh nào"], a: 1, why: "Dừng ở nhánh đúng đầu tiên." },
    { q: "dtb = 8 với bảng xếp loại chuẩn (≥8 Tốt, ≥6.5 Khá…) in?", o: ["Tốt", "Khá", "Đạt", "Tốt và Khá"], a: 0, why: "8 >= 8 đúng ở nhánh đầu." },
    { kind: "truefalse", q: "Đảo thứ tự các elif có thể làm sai kết quả mà không báo lỗi.", a: true, why: "Lỗi logic." },
    { kind: "truefalse", q: "Mọi if đều bắt buộc phải có else.", a: false, why: "else là tuỳ chọn." },
    { kind: "multi", q: "Giá trị nào nên thử khi kiểm tra mốc 6.5?", o: ["6.5", "6.49", "3", "100"], a: [0, 1], why: "Kiểm tra biên: đúng mốc và sát dưới mốc." },
    { kind: "bug", q: "Dòng nào khiến ĐTB 9 bị xếp \"Khá\"?", lines: ["if dtb >= 6.5:", "    print(\"Khá\")", "elif dtb >= 8:", "    print(\"Tốt\")"], a: 0, why: "Mốc thấp đặt trước mốc cao." },
    { q: "x = 9 với ba if rời: if x>=8 / if x>=6.5 / if x>=5 (mỗi cái in một chữ). In mấy dòng?", o: ["1", "2", "3", "0"], a: 2, why: "If rời được kiểm độc lập." },
    { q: "Bảng quyết định giúp gì?", o: ["Chạy nhanh hơn", "Kiểm đã phủ hết trường hợp, không chồng chéo", "Thay thế code", "Vẽ giao diện"], a: 1, why: "Công cụ thiết kế điều kiện." },
    { q: "Điểm 4 theo thang A/B/C/D/F (≥8.5, ≥7, ≥5.5, ≥4) là?", o: ["C", "D", "F", "B"], a: 1, why: "4 >= 4." },
  ],
};
