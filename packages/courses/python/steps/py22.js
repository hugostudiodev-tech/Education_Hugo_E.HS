// Step 22 — Duyệt, sửa và sắp xếp list: tìm top 3.
export default {
  id: "py22",
  lang: "python",
  file: "so_lop/top_3.py",
  duration: "45 phút",
  summary: "Duyệt list, dùng enumerate, tính tổng/trung bình, phân biệt sort với sorted và tìm ba điểm cao nhất.",
  slides: [
    {
      section: "intro",
      title: "Làm việc với cả danh sách",
      body: `Có list rồi, ta cần **duyệt** từng phần tử để thống kê hoặc cập nhật. Python cũng có sẵn:

- **sum**, **min**, **max** để tính nhanh.
- **sort** và **sorted** để sắp xếp.
- **enumerate** khi cần cả chỉ số lẫn giá trị.`,
    },
    {
      section: "visual",
      title: "for lấy từng điểm",
      body: "Mỗi vòng, biến `d` nhận một phần tử kế tiếp. Ta không cần tự quản lý chỉ số nếu chỉ đọc giá trị.",
      py: { code: 'diem = [8, 6.5, 9, 7.5]\nfor d in diem:\n    print(f"Điểm: {d}")\nprint(f"TB: {sum(diem) / len(diem):.1f}")' },
    },
    {
      section: "research",
      title: "Sắp xếp tại chỗ và tạo bản mới",
      body: `**list.sort()** thay đổi chính list và trả về **None**. **sorted(list)** tạo list mới, giữ dữ liệu gốc.

Chọn theo ý định: nếu thứ tự cũ còn ý nghĩa (ví dụ thứ tự điểm danh), dùng **sorted**. Nếu không cần thứ tự cũ, **sort** tiết kiệm một bản sao.

> Python Software Foundation (2026) *Sorting Techniques*. Available at: https://docs.python.org/3/howto/sorting.html`,
    },
    {
      section: "ideate",
      title: "Top 3 nhưng không phá sổ gốc",
      body: `Bảng điểm gốc đang theo thứ tự số báo danh. Nếu gọi **diem.sort()**, thứ tự đó mất đi.

Kế hoạch an toàn:

1. Tạo bản đã sắp bằng **sorted(diem, reverse=True)**.
2. Lấy ba phần tử đầu bằng lát cắt **[:3]**.
3. Giữ nguyên **diem**.`,
    },
    {
      section: "core",
      title: "enumerate: chỉ số và giá trị",
      body: "`enumerate(diem, start=1)` cho cặp `(số thứ tự, điểm)`. Đây là cách sạch hơn so với tự tăng biến đếm.",
      py: { code: 'diem = [8, 6.5, 9]\nfor stt, d in enumerate(diem, start=1):\n    print(f"Bạn {stt}: {d}")' },
    },
    {
      section: "core",
      title: "sort và sorted",
      body: "`reverse=True` sắp giảm dần. Lát cắt `[:3]` lấy nhiều nhất ba phần tử nên vẫn an toàn khi lớp có dưới ba bạn.",
      py: { code: 'diem = [7, 9.5, 8, 6, 9]\ntop3 = sorted(diem, reverse=True)[:3]\nprint("Gốc:", diem)\nprint("Top 3:", top3)\ndiem.sort()\nprint("Đã sort:", diem)' },
    },
    {
      section: "apply",
      title: "Bài tập: tìm top 3",
      body: "Dòng đầu là n, sau đó n dòng điểm. In `Top 3: ...` theo thứ tự giảm dần, cách nhau bằng dấu phẩy; rồi in `Cao nhất: X` và `Thấp nhất: Y`.",
      py: {
        code: "n = int(input())\ndiem = []\n",
        stdin: "5\n7\n9.5\n8\n6\n9",
        solution: 'n = int(input())\ndiem = []\nfor _ in range(n):\n    diem.append(float(input()))\ntop3 = sorted(diem, reverse=True)[:3]\nprint("Top 3:", ", ".join(str(d) for d in top3))\nprint("Cao nhất:", max(diem))\nprint("Thấp nhất:", min(diem))',
        hints: ["Đọc từng điểm rồi append vào list.", "top3 = sorted(diem, reverse=True)[:3]; nối bằng join."],
      },
    },
    {
      section: "apply",
      title: "Bài tập: cộng điểm khuyến khích",
      body: "Có list `[7.5, 9.5, 8]`. Dùng `enumerate` để cộng 0.5 cho từng điểm nhưng không vượt 10. In list kết quả.",
      py: {
        code: "diem = [7.5, 9.5, 8]\n",
        solution: "diem = [7.5, 9.5, 8]\nfor i, d in enumerate(diem):\n    diem[i] = min(d + 0.5, 10)\nprint(diem)",
        hints: ["enumerate(diem) cho i và d.", "Gán lại diem[i] = min(d + 0.5, 10)."],
      },
    },
  ],
  quiz: [
    { q: "for d in diem: thì d lần lượt là?", o: ["Từng giá trị điểm", "Từng chỉ số", "Luôn là 0", "Cả list"], a: 0, why: "Duyệt trực tiếp list trả từng phần tử." },
    { q: "enumerate(diem) hữu ích khi cần?", o: ["Cả chỉ số và giá trị", "Chỉ tổng", "Xoá list", "Đổi kiểu"], a: 0, why: "enumerate sinh các cặp (chỉ số, giá trị)." },
    { kind: "truefalse", q: "sorted(diem) giữ nguyên list diem ban đầu.", a: true, why: "sorted tạo một list mới." },
    { q: "diem.sort(reverse=True) sắp theo?", o: ["Giảm dần", "Tăng dần", "Ngẫu nhiên", "Thứ tự cũ"], a: 0, why: "reverse=True đảo thứ tự mặc định." },
    { kind: "output", q: "Hai phần tử nào được in sau sorted và lát cắt?", code: "a = [3, 1, 2]\nprint(sorted(a)[:2])", o: ["[1, 2]", "[3, 2]", "[3, 1]", "[1, 2, 3]"], a: 0, why: "sorted tăng dần rồi lấy hai phần tử đầu." },
    { kind: "bug", q: "Muốn lấy list đã sắp nhưng b lại là None. Dòng nào sai?", lines: ["a = [3, 1, 2]", "b = a.sort()", "print(b)", "print(a)"], a: 1, why: "sort thay đổi tại chỗ và trả None; dùng b = sorted(a)." },
    { q: "Lát cắt [:3] lấy?", o: ["Ba phần tử đầu", "Phần tử chỉ số 3", "Ba phần tử cuối", "Từ chỉ số 3 trở đi"], a: 0, why: "Điểm cuối 3 không được tính." },
    { kind: "multi", q: "Hàm nào tính thống kê trực tiếp từ list số?", o: ["sum", "min", "max", "append"], a: [0, 1, 2], why: "append thay đổi list, không tính thống kê." },
    { kind: "blank", q: "Điền để đánh số từ 1.", code: "for stt, d in enumerate(diem, ___=1):", a: "start", why: "Tham số start đổi số bắt đầu của enumerate." },
    { q: "Top 3 của [8, 9, 9, 7] là?", o: ["[9, 9, 8]", "[9, 8, 7]", "[8, 9, 9]", "[7, 8, 9]"], a: 0, why: "Top theo điểm, nên hai điểm 9 đều được giữ." },
  ],
};
