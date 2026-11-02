// Tài liệu dành riêng cho đối tác (cài đặt + REST API). CHỈ nằm ở máy chủ: trang /developers
// không chứa chữ nào của phần này trong HTML lẫn bundle JS — chưa có key hợp lệ thì trình duyệt
// không bao giờ nhận được, nên xoá lớp mờ hay chèn script cũng không có gì để xem.
// Khối: { h } tiêu đề · { p } đoạn · { code } mã · { list } gạch đầu dòng · { table: { head?, rows } }.
import { EDU_ORIGIN } from '../lib/config.js';

const CONTACT_EMAIL = 'contact@hugowishpax.studio';

export function partnerDocs(key) {
  const api = `${EDU_ORIGIN}/api`;
  return {
    start: [
      { h: '1. Cài gói' },
      { p: 'Gói chỉ tải được bằng key còn hiệu lực. Lệnh dưới đã điền sẵn key của bạn.' },
      { code: `npm i ${EDU_ORIGIN}/sdk/${key}/education-hugo-react.tgz` },
      { h: '2. Lưu key vào biến môi trường' },
      { code: `# .env (Vite)\nVITE_EDU_KEY=${key}\n\n# .env (Next.js)\nNEXT_PUBLIC_EDU_KEY=${key}` },
      { h: '3. Gắn vào trang' },
      { code: `import { EducationHugo } from "education-hugo-react";
import "education-hugo-react/style.css";

export default function HocSQL() {
  return (
    <EducationHugo
      apiKey={import.meta.env.VITE_EDU_KEY}
      course="sql"
      lang="vi"
      onProgress={(p) => console.log("đã xong", p.done.length, "step")}
    />
  );
}` },
      { h: '4. Đăng ký tên miền' },
      { p: `Key nằm trong mã trang web nên ai xem nguồn cũng thấy. Vì vậy key được khoá theo tên miền đã đăng ký với admin: trình duyệt gọi từ tên miền khác sẽ bị từ chối. Thêm tên miền mới (kể cả http://localhost:5173 khi phát triển) thì gửi mail tới ${CONTACT_EMAIL}.` },
      { h: 'Yêu cầu' },
      { list: [
        'React 18 trở lên. Gói đã kèm sẵn mọi thứ khác (sql.js, framer-motion, react-markdown…).',
        'Trình duyệt hỗ trợ WebAssembly (mọi trình duyệt hiện đại) để chạy ô SQL.',
        'Next.js: dùng trong Client Component ("use client").',
      ] },
    ],
    api: [
      { p: `Gốc: ${api}. Gửi key qua header X-Edu-Partner-Key. Không cookie, CORS mở cho tên miền đã đăng ký.` },
      { code: `curl -H "X-Edu-Partner-Key: ${key}" \\\n  "${api}/lessons/sql12?lang=en"` },
      { table: { head: ['', 'Đường dẫn', 'Làm gì', 'Trả về'], rows: [
        ['GET', '/lessons?course=sql&page=1&limit=25', 'Danh mục step + chặng (trang 1). Không cần key.', '{ items: [{ id, title, stage, lessons }], stages: [...], pagination }'],
        ['GET', '/lessons/:id?lang=en', 'Toàn bộ một step: slides, trắc nghiệm (đã xáo, KHÔNG kèm đáp án).', '{ lesson: { id, title, slides, quiz } }'],
        ['POST', '/lessons/:id/grade', 'Chấm trắc nghiệm. Body { answers: [...] }.', '{ score, correct, total, passed, review: [...] }'],
        ['POST', '/partner/verify', 'Kiểm key còn hiệu lực.', '{ ok: true, email: "pa***@abc.edu.vn", expiresAt }'],
      ] } },
      { h: 'Lỗi' },
      { table: { rows: [
        ['401 PARTNER_KEY_INVALID', 'Key sai, hết hạn, bị thu hồi, hoặc gọi từ tên miền không đăng ký.'],
        ['429', 'Gọi quá nhanh (đọc 90/phút, chấm 20/phút, kiểm key 20/10 phút mỗi IP).'],
        ['404', 'Không có step này.'],
        ['409 STEP_NOT_READY', 'Step đang soạn.'],
      ] } },
      { p: 'Đáp án trắc nghiệm không bao giờ nằm trong bài tải về. Chỉ /grade trả lời giải, sau khi học viên đã nộp.' },
    ],
  };
}
