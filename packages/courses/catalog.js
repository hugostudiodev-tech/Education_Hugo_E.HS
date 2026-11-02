// Danh mục khoá công khai — trang giới thiệu (/courses/:id), sơ đồ trang và SEO (scripts/generate-seo.mjs)
// đọc chung. Chỉ import stages.js (nhẹ), không kéo nội dung bài.
import * as coding from "./coding/stages.js";
import * as sql from "./sql/stages.js";
import * as python from "./python/stages.js";

// cast: nhân vật clay của từng chặng (apps/web/public/edu/cast-N.svg) — khớp CourseMap.jsx.
export const CATALOG = [
  {
    id: "coding", cast: 1, hours: 26, stages: coding.STAGES, outline: coding.OUTLINE,
    stageCast: { basic: 1, intermediate: 4, advanced: 6, security: 2, project: 3, devops: 8 },
    title: { vi: "Lập trình Web", en: "Web Programming", zh: "网页编程" },
    tagline: {
      vi: "Tự tay xây mạng xã hội Nhịp: HTML, CSS, JavaScript, PHP, MySQL, bảo mật và triển khai thật.",
      en: "Build the Nhịp social network yourself: HTML, CSS, JavaScript, PHP, MySQL, security and a real deployment.",
      zh: "亲手打造 Nhịp 社交网络：HTML、CSS、JavaScript、PHP、MySQL、安全与真实部署。",
    },
    keywords: "học lập trình web miễn phí, học HTML CSS JavaScript, học PHP MySQL, khoá học lập trình cho người mới",
  },
  {
    id: "sql", cast: 6, hours: 50, stages: sql.STAGES, outline: sql.OUTLINE,
    stageCast: { "sql-basic": 6, "sql-filter": 7, "sql-group": 5, "sql-design": 3, "sql-write": 2, "sql-window": 4, "sql-perf": 8, "sql-capstone": 1 },
    title: { vi: "SQL & Cơ sở dữ liệu", en: "SQL & Databases", zh: "SQL 与数据库" },
    tagline: {
      vi: "Từ câu SELECT đầu tiên tới CTE, window function, chỉ mục và tìm kiếm toàn văn — chạy SQL thật ngay trong trình duyệt.",
      en: "From your first SELECT to CTEs, window functions, indexes and full-text search — real SQL right in your browser.",
      zh: "从第一条 SELECT 到 CTE、窗口函数、索引和全文搜索——直接在浏览器中运行真实 SQL。",
    },
    keywords: "học SQL miễn phí, học SQL cho người mới, khoá học SQL, học cơ sở dữ liệu, SQLite, window function, CTE, JOIN, GROUP BY, chỉ mục SQL",
  },
  {
    id: "python", cast: 5, hours: 40, stages: python.STAGES, outline: python.OUTLINE,
    stageCast: { "py-basic": 5, "py-math": 7, "py-branch": 3, "py-loop": 2, "py-data": 4, "py-func": 6, "py-file": 8, "py-advanced": 1 },
    title: { vi: "Python cho học sinh", en: "Python for Students", zh: "中学生 Python" },
    tagline: {
      vi: "Từ dòng print đầu tiên tới lớp đối tượng và thuật toán — xây Sổ Lớp, chạy Python ngay trong trình duyệt.",
      en: "From your first print to classes and algorithms — build a class organiser, running Python right in your browser.",
      zh: "从第一行 print 到类与算法——打造班级小助手，直接在浏览器中运行 Python。",
    },
    keywords: "học Python miễn phí, Python cho học sinh, học lập trình Python, Tin học 10 Python, Tin học 11 Python, ôn thi học sinh giỏi tin học",
  },
];

export const courseById = (id) => CATALOG.find((c) => c.id === id) || null;
