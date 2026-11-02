// Tám chặng của khoá Python cho học sinh. Mã chặng mang tiền tố `py-`, id step là `pyN`
// để không đụng khoá Coding (stepN) và SQL (sqlN).
//
// Cả khoá xoay quanh MỘT dự án: "Sổ Lớp" — trợ lý nhỏ của một lớp học với bảng điểm,
// thời khoá biểu, quỹ lớp và câu đố ôn bài. Chặng 1–6 đi khớp mạch Python của môn Tin học
// lớp 10–11 (nội dung tự viết, không chép sách giáo khoa); chặng 8 có nhánh ôn thi học
// sinh giỏi (tuỳ chọn).
//
// Bản quyền: lời giảng, ví dụ, bài tập do Hugo Studio tự viết; Python (PSF License) và
// Pyodide (MPL 2.0) chỉ là công cụ chạy bài. Chi tiết: ./LICENSE.md.
const PYDOCS = { title: "The Python Tutorial", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/" };

const STAGE_DEFS = [
  {
    id: "py-basic", tone: "blue", phaseNumber: 1, code: "PY 101",
    title: "PY 101 · Làm quen với Python",
    intro: {
      tagline: "Dòng code đầu tiên chạy ngay trên điện thoại của bạn.",
      learn: ["Python là gì, vì sao được dạy ở trường", "print() và chạy chương trình", "Biến và phép gán", "Kiểu dữ liệu và input()"],
      challenge: "Không cài gì: Python chạy ngay trong trình duyệt.",
      promise: "Kết chặng: thẻ giới thiệu bản thân — trang đầu của Sổ Lớp.",
      reading: [PYDOCS],
    },
  },
  {
    id: "py-math", tone: "green", phaseNumber: 2, code: "PY 102",
    title: "PY 102 · Tính toán",
    intro: {
      tagline: "Để máy tính điểm thay bạn — và không bao giờ cộng nhầm.",
      learn: ["Toán tử + − * / // % **", "Thứ tự ưu tiên và làm tròn", "f-string định dạng kết quả", "Module math"],
      challenge: "0.1 + 0.2 không bằng 0.3 — và bạn sẽ hiểu vì sao.",
      promise: "Kết chặng: máy tính điểm trung bình môn theo hệ số.",
      reading: [{ title: "Numbers — An Informal Introduction to Python", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/introduction.html#numbers" }],
    },
  },
  {
    id: "py-branch", tone: "purple", phaseNumber: 3, code: "PY 103",
    title: "PY 103 · Rẽ nhánh",
    intro: {
      tagline: "Chương trình biết tự quyết định: giỏi, khá hay cần cố gắng.",
      learn: ["So sánh và kiểu bool", "if / else", "elif nhiều nhánh", "and, or, not"],
      challenge: "Thụt lề sai một dấu cách là chương trình hiểu khác hẳn.",
      promise: "Kết chặng: xếp loại học lực và xét học bổng.",
      reading: [{ title: "if Statements", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/controlflow.html#if-statements" }],
    },
  },
  {
    id: "py-loop", tone: "pink", phaseNumber: 4, code: "PY 104",
    title: "PY 104 · Vòng lặp",
    intro: {
      tagline: "Việc lặp lại 1000 lần chỉ cần viết một lần.",
      learn: ["for và range()", "while", "break, continue", "Vòng lặp lồng nhau và mẫu tích luỹ"],
      challenge: "Vòng lặp không có điểm dừng sẽ chạy mãi — học cách tránh nó.",
      promise: "Kết chặng: bảng cửu chương, đếm ngược ngày thi và sổ tiết kiệm.",
      reading: [{ title: "for Statements", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/controlflow.html#for-statements" }],
    },
  },
  {
    id: "py-data", tone: "orange", phaseNumber: 5, code: "PY 201",
    title: "PY 201 · Danh sách và từ điển",
    intro: {
      tagline: "Từ một con điểm tới bảng điểm cả lớp.",
      learn: ["list: thêm, sửa, xoá, sắp xếp", "Xâu ký tự và cắt lát", "dict: tra cứu theo tên", "tuple và set"],
      challenge: "Hai biến cùng trỏ một list — sửa bên này, bên kia cũng đổi.",
      promise: "Kết chặng: bảng điểm cả lớp, top 3 và sổ quỹ lớp thu chi.",
      reading: [{ title: "Data Structures", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/datastructures.html" }],
    },
  },
  {
    id: "py-func", tone: "teal", phaseNumber: 6, code: "PY 202",
    title: "PY 202 · Hàm",
    intro: {
      tagline: "Viết một lần, gọi ở mọi nơi.",
      learn: ["def và return", "Tham số, giá trị mặc định, phạm vi biến", "Docstring và chia nhỏ bài toán", "Module và import"],
      challenge: "Một hàm chỉ làm một việc — và làm tốt việc đó.",
      promise: "Kết chặng: thư viện tính điểm dùng lại cho cả Sổ Lớp.",
      reading: [{ title: "Defining Functions", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/controlflow.html#defining-functions" }],
    },
  },
  {
    id: "py-file", tone: "yellow", phaseNumber: 7, code: "PY 301",
    title: "PY 301 · Dữ liệu, tệp và lỗi",
    intro: {
      tagline: "Đọc bảng điểm từ tệp, xuất báo cáo, không sợ dữ liệu sai.",
      learn: ["try / except", "Đọc và ghi tệp", "Tệp CSV", "List và dict comprehension"],
      challenge: "Ai đó gõ \"tám\" thay vì 8 — chương trình vẫn không được sập.",
      promise: "Kết chặng: báo cáo điểm cả lớp từ tệp CSV.",
      reading: [{ title: "Reading and Writing Files", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/inputoutput.html#reading-and-writing-files" }, { title: "csv — CSV File Reading and Writing", author: "Python Software Foundation", url: "https://docs.python.org/3/library/csv.html" }],
    },
  },
  {
    id: "py-advanced", tone: "red", phaseNumber: 8, code: "PY 302",
    title: "PY 302 · Nâng cao và dự án tốt nghiệp",
    intro: {
      tagline: "Lớp đối tượng, thuật toán và một sản phẩm hoàn chỉnh.",
      learn: ["Lớp (class) và đối tượng", "random và trò chơi đố vui", "Tìm kiếm và sắp xếp", "Đệ quy và độ phức tạp (nhánh thi học sinh giỏi)"],
      challenge: "Thuật toán đúng chưa đủ — còn phải đủ nhanh.",
      promise: "Kết chặng: Sổ Lớp hoàn chỉnh, chạy trên máy của chính bạn.",
      reading: [PYDOCS, { title: "Classes", author: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/classes.html" }],
    },
    elite: true,
  },
];

/** Đề cương 40 step. Step đã soạn có tệp trong ./steps/ cùng id. */
export const OUTLINE = [
  // Chặng 1 — Làm quen
  ["py-basic", "Xin chào Python: chạy dòng code đầu tiên"],
  ["py-basic", "Biến: đặt tên cho dữ liệu"],
  ["py-basic", "Kiểu dữ liệu: số nguyên, số thực, xâu và bool"],
  ["py-basic", "input(): hỏi người dùng và đổi kiểu"],
  ["py-basic", "Đọc thông báo lỗi và dự án nhỏ: thẻ giới thiệu"],
  // Chặng 2 — Tính toán
  ["py-math", "Toán tử số học: chia nguyên, chia lấy dư, luỹ thừa"],
  ["py-math", "Thứ tự ưu tiên, làm tròn và sai số số thực"],
  ["py-math", "f-string: in kết quả cho đẹp"],
  ["py-math", "Module math: căn, làm tròn lên, làm tròn xuống"],
  ["py-math", "Dự án nhỏ: điểm trung bình môn theo hệ số"],
  // Chặng 3 — Rẽ nhánh
  ["py-branch", "So sánh và kiểu bool"],
  ["py-branch", "if và else: hai ngả đường"],
  ["py-branch", "elif: xếp loại học lực"],
  ["py-branch", "and, or, not: ghép nhiều điều kiện"],
  ["py-branch", "Dự án nhỏ: xét học bổng"],
  // Chặng 4 — Vòng lặp
  ["py-loop", "for và range(): lặp đúng số lần"],
  ["py-loop", "while: lặp tới khi đạt điều kiện"],
  ["py-loop", "break, continue và vòng lặp vô hạn"],
  ["py-loop", "Vòng lặp lồng nhau: bảng cửu chương"],
  ["py-loop", "Mẫu tích luỹ: tổng, đếm, lớn nhất — sổ tiết kiệm"],
  // Chặng 5 — Danh sách và từ điển
  ["py-data", "list: danh sách điểm"],
  ["py-data", "Duyệt, sửa và sắp xếp list: tìm top 3"],
  ["py-data", "Xâu ký tự: cắt lát và các phương thức"],
  ["py-data", "dict: tra điểm theo tên"],
  ["py-data", "tuple, set và dự án nhỏ: sổ quỹ lớp"],
  // Chặng 6 — Hàm
  ["py-func", "def và return: hàm đầu tiên"],
  ["py-func", "Tham số, giá trị mặc định và phạm vi biến"],
  ["py-func", "Chia nhỏ bài toán: hàm gọi hàm, docstring"],
  ["py-func", "Module và import"],
  ["py-func", "Dự án nhỏ: thư viện tính điểm"],
  // Chặng 7 — Dữ liệu, tệp và lỗi
  ["py-file", "try và except: chương trình không sập"],
  ["py-file", "Đọc và ghi tệp văn bản"],
  ["py-file", "Tệp CSV: bảng điểm cả lớp"],
  ["py-file", "List và dict comprehension"],
  ["py-file", "Dự án nhỏ: báo cáo điểm từ tệp CSV"],
  // Chặng 8 — Nâng cao
  ["py-advanced", "Lớp và đối tượng: mô hình hoá học sinh"],
  ["py-advanced", "random: trò chơi đố vui ôn bài"],
  ["py-advanced", "Tìm kiếm và sắp xếp: tuyến tính, nhị phân, nổi bọt"],
  ["py-advanced", "Đệ quy và độ phức tạp (nhánh thi học sinh giỏi)"],
  ["py-advanced", "Cài Python lên máy và dự án tốt nghiệp: Sổ Lớp"],
];

export const STEP_PASS_PERCENT = 60;

export const MAX_SLIDES = 35;

export const STEP_IDS = OUTLINE.map((_, index) => `py${index + 1}`);

export const STAGES = STAGE_DEFS.map((stage) => {
  const from = OUTLINE.findIndex(([stageId]) => stageId === stage.id);
  const to = from + OUTLINE.filter(([stageId]) => stageId === stage.id).length;
  return { ...stage, from, to, rangeText: `step ${from + 1}–${to}` };
});
