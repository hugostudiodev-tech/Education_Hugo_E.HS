// Eight stages build one research-data application from a reproducible question
// to a tested API, SQLite database, analysis and final report.
const PYTHON_DOCS = {
  title: "The Python documentation",
  author: "Python Software Foundation",
  url: "https://docs.python.org/3/",
};
const SQLITE_DOCS = {
  title: "SQLite Documentation",
  author: "SQLite Consortium",
  url: "https://www.sqlite.org/docs.html",
};
const FASTAPI_DOCS = {
  title: "FastAPI Documentation",
  author: "Sebastián Ramírez",
  url: "https://fastapi.tiangolo.com/",
};

const STAGE_DEFS = [
  {
    id: "pa-start", tone: "blue", phaseNumber: 1, code: "PY 401",
    title: "PY 401 · Đầu vào và cách làm dự án",
    intro: {
      tagline: "Biết rõ dự án cuối khoá và kiểm tra nền tảng trước khi bắt đầu.",
      learn: ["Vượt bài kiểm tra Python cơ bản 30 câu (từ 60%)", "Tạo môi trường chạy có thể tái lập", "Tổ chức mã và kiểu dữ liệu", "Kiểm thử, đọc lỗi và ghi nhật ký"],
      challenge: "Mọi dữ liệu trong khoá là giả lập; không đưa thông tin thật của học sinh vào bài tập.",
      promise: "Kết chặng: bộ khung dự án LabLog và tiêu chí nghiệm thu rõ ràng.",
      reading: [PYTHON_DOCS],
    },
  },
  {
    id: "pa-research", tone: "green", phaseNumber: 2, code: "PY 402",
    title: "PY 402 · Thiết kế nghiên cứu và dữ liệu",
    intro: {
      tagline: "Từ câu hỏi có thể kiểm tra đến tệp dữ liệu sạch, có nguồn gốc.",
      learn: ["Câu hỏi nghiên cứu và biến đo", "Từ điển dữ liệu và nguồn gốc", "Đọc CSV an toàn", "Kiểm tra thiếu/sai dữ liệu", "Ẩn danh và giảm dữ liệu"],
      challenge: "Tương quan trong dữ liệu mô phỏng không chứng minh nguyên nhân.",
      promise: "Kết chặng: CSV giả lập có quy tắc kiểm tra và tài liệu dữ liệu.",
      reading: [PYTHON_DOCS],
    },
  },
  {
    id: "pa-database", tone: "purple", phaseNumber: 3, code: "PY 403",
    title: "PY 403 · Cơ sở dữ liệu SQLite",
    intro: {
      tagline: "Lưu kết quả có cấu trúc, giữ toàn vẹn và tránh lỗi truy vấn.",
      learn: ["Kết nối SQLite bằng Python", "Bảng, khoá và ràng buộc", "CRUD với tham số an toàn", "Giao dịch và rollback", "Phiên bản schema và sao lưu"],
      challenge: "Tách mã Python khỏi câu SQL; không ghép dữ liệu người dùng vào chuỗi truy vấn.",
      promise: "Kết chặng: dữ liệu nghiên cứu được lưu bền và có thể kiểm tra.",
      reading: [SQLITE_DOCS, { title: "sqlite3 — DB-API 2.0 interface", author: "Python Software Foundation", url: "https://docs.python.org/3/library/sqlite3.html" }],
    },
  },
  {
    id: "pa-sql", tone: "orange", phaseNumber: 4, code: "PY 404",
    title: "PY 404 · Truy vấn và kiểm tra dữ liệu",
    intro: {
      tagline: "Đặt câu hỏi với SQL, kết hợp bảng và kiểm tra tính toàn vẹn.",
      learn: ["JOIN và quan hệ", "Tổng hợp có nhóm", "CTE và truy vấn theo cửa sổ", "Chỉ mục và kế hoạch truy vấn", "Kiểm thử ràng buộc dữ liệu"],
      challenge: "Tối ưu chỉ khi có phép đo; kết quả nhanh nhưng sai vẫn là sai.",
      promise: "Kết chặng: truy vấn tái lập được cho báo cáo nghiên cứu.",
      reading: [SQLITE_DOCS],
    },
  },
  {
    id: "pa-architecture", tone: "pink", phaseNumber: 5, code: "PY 405",
    title: "PY 405 · Cấu trúc ứng dụng",
    intro: {
      tagline: "Đưa dự án từ các đoạn mã rời thành ứng dụng có thể bảo trì.",
      learn: ["Cấu hình từ môi trường", "Tách lớp dữ liệu và nghiệp vụ", "Nhật ký có ngữ cảnh", "Ranh giới lỗi và phản hồi", "Tài liệu hoá giao diện nội bộ"],
      challenge: "Không lưu khoá bí mật trong mã nguồn hay dữ liệu mẫu.",
      promise: "Kết chặng: ứng dụng tách lớp rõ, dễ kiểm thử và sửa lỗi.",
      reading: [PYTHON_DOCS],
    },
  },
  {
    id: "pa-api", tone: "teal", phaseNumber: 6, code: "PY 406",
    title: "PY 406 · API nghiên cứu",
    intro: {
      tagline: "Mở dữ liệu đã kiểm soát qua HTTP API có hợp đồng rõ ràng.",
      learn: ["Tài nguyên và phương thức HTTP", "Endpoint FastAPI", "Kiểm tra dữ liệu đầu vào", "Lọc và phân trang", "Kiểm thử API"],
      challenge: "API chỉ trả dữ liệu tối thiểu cần thiết; lỗi phải rõ mà không làm lộ nội bộ.",
      promise: "Kết chặng: có thể chạy và kiểm thử API LabLog trên máy cá nhân.",
      reading: [FASTAPI_DOCS, { title: "HTTP Semantics (RFC 9110)", author: "Internet Engineering Task Force", url: "https://www.rfc-editor.org/rfc/rfc9110.html" }],
    },
  },
  {
    id: "pa-analysis", tone: "yellow", phaseNumber: 7, code: "PY 407",
    title: "PY 407 · Phân tích và báo cáo",
    intro: {
      tagline: "Tóm tắt dữ liệu thận trọng và trình bày kết quả có giới hạn.",
      learn: ["Thống kê mô tả", "Mẫu, sai lệch và bất định", "Đối chiếu kết quả SQL/Python", "Xuất báo cáo tái lập", "Trích dẫn và giới hạn kết luận"],
      challenge: "Phân biệt mô tả, liên hệ và quan hệ nhân quả.",
      promise: "Kết chặng: báo cáo có phương pháp, nguồn dữ liệu, kết quả và giới hạn.",
      reading: [PYTHON_DOCS, SQLITE_DOCS],
    },
  },
  {
    id: "pa-capstone", tone: "red", phaseNumber: 8, code: "PY 408",
    title: "PY 408 · Hoàn thiện LabLog",
    intro: {
      tagline: "Tích hợp, bảo vệ, chạy lại và trình bày sản phẩm cuối khoá.",
      learn: ["CLI nhập dữ liệu", "Quyền truy cập và an toàn dữ liệu", "Cấu hình triển khai", "Kiểm thử đầu-cuối", "Bảo vệ dự án bằng bằng chứng"],
      challenge: "Chỉ dùng bộ dữ liệu giả lập; ghi rõ môi trường và cách tạo lại kết quả.",
      promise: "Kết chặng: ứng dụng nghiên cứu chạy được, có SQLite, API và báo cáo.",
      reading: [PYTHON_DOCS, SQLITE_DOCS, FASTAPI_DOCS],
    },
  },
];

export const OUTLINE = [
  ["pa-start", "Dự án LabLog và kiểm tra đầu vào (30 câu)"],
  ["pa-start", "Môi trường Python có thể tái lập"],
  ["pa-start", "Tách module và tổ chức package"],
  ["pa-start", "Type hints và dataclass cho bản ghi nghiên cứu"],
  ["pa-start", "Kiểm thử đơn vị và gỡ lỗi có phương pháp"],
  ["pa-research", "Câu hỏi nghiên cứu và biến có thể đo"],
  ["pa-research", "Từ điển dữ liệu và nguồn gốc"],
  ["pa-research", "Đọc CSV đúng cấu trúc"],
  ["pa-research", "Kiểm tra giá trị thiếu và ngoài miền"],
  ["pa-research", "Ẩn danh và giảm dữ liệu thu thập"],
  ["pa-database", "Kết nối Python với SQLite"],
  ["pa-database", "Thiết kế bảng, khoá và ràng buộc"],
  ["pa-database", "CRUD an toàn bằng truy vấn tham số"],
  ["pa-database", "Giao dịch: commit và rollback"],
  ["pa-database", "Thay đổi schema và sao lưu"],
  ["pa-sql", "JOIN để kết hợp dữ liệu nghiên cứu"],
  ["pa-sql", "GROUP BY và tổng hợp có ý nghĩa"],
  ["pa-sql", "CTE và window function"],
  ["pa-sql", "Đọc kế hoạch truy vấn và chỉ mục"],
  ["pa-sql", "Kiểm thử tính toàn vẹn của cơ sở dữ liệu"],
  ["pa-architecture", "Cấu hình theo môi trường và đường dẫn"],
  ["pa-architecture", "Tách tầng truy cập dữ liệu và nghiệp vụ"],
  ["pa-architecture", "Logging để lần theo một lần chạy"],
  ["pa-architecture", "Xử lý lỗi và hợp đồng phản hồi"],
  ["pa-architecture", "Tài liệu hoá API nội bộ"],
  ["pa-api", "HTTP resource, method và status code"],
  ["pa-api", "Tạo endpoint với FastAPI"],
  ["pa-api", "Xác thực đầu vào bằng Pydantic"],
  ["pa-api", "Lọc và phân trang kết quả"],
  ["pa-api", "Kiểm thử endpoint và phản hồi lỗi"],
  ["pa-analysis", "Thống kê mô tả bằng statistics"],
  ["pa-analysis", "Mẫu, sai lệch và bất định"],
  ["pa-analysis", "Đối chiếu truy vấn SQL với Python"],
  ["pa-analysis", "Xuất báo cáo CSV/Markdown tái lập"],
  ["pa-analysis", "Trích dẫn nguồn và giới hạn kết luận"],
  ["pa-capstone", "CLI nhập bộ dữ liệu có kiểm tra"],
  ["pa-capstone", "Bảo vệ dữ liệu và API"],
  ["pa-capstone", "Cấu hình chạy và lưu trữ bền vững"],
  ["pa-capstone", "Kiểm thử đầu-cuối bằng dữ liệu mới"],
  ["pa-capstone", "Capstone: đóng gói và bảo vệ LabLog"],
];

export const STEP_PASS_PERCENT = 60;
export const MAX_SLIDES = 35;
export const STEP_IDS = OUTLINE.map((_, index) => `pa${index + 1}`);

export const STAGES = STAGE_DEFS.map((stage) => {
  const from = OUTLINE.findIndex(([stageId]) => stageId === stage.id);
  const to = from + OUTLINE.filter(([stageId]) => stageId === stage.id).length;
  return { ...stage, from, to, rangeText: `step ${from + 1}–${to}` };
});
