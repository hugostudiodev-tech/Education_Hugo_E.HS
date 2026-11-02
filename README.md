# Education Hugo

Khoá học miễn phí cho học sinh, sinh viên mọi ngành — `education.hugowishpax.studio`.

Repo này chứa **giao diện** (React + Vite, PWA) và **nội dung khoá học** (`packages/courses`).
Backend (đăng nhập Better Auth, ví JOY, chấm bài, cộng đồng, push) là API của Hugo Studio,
gọi cùng origin qua rewrite `/api/*` (`vercel.json`; dev: proxy của Vite).

Hugo Studio gắn repo này làm git submodule `packages/education-hugo` và trỏ
`packages/courses` vào đây, nên server chấm bài trên **đúng** nội dung bạn sửa ở repo này.
Sửa khoá học xong: push repo này, rồi ở Hugo Studio chạy `npm run sync:edu` và push.

```bash
npm install
npm run dev            # http://localhost:3002, API → backend Hugo Studio cục bộ (8099)
VITE_DEV_BACKEND_URL=https://education-hugo-api.onrender.com npm run dev   # API production
npm run check:all      # lint + kiểm nội dung khoá học + build + SEO
```

| Thư mục | |
|---|---|
| `src/education/` | Vỏ app, các trang |
| `src/components/member/hugoCoder/` | Trình học bài, bản đồ chặng, ô SQL |
| `packages/courses/` | Nội dung khoá (coding, sql) + bản dịch en/zh |
| `packages/shared/` | Logic dùng chung với server (chuỗi lửa, cài đặt, chấm) |
| `scripts/` | SEO sau build, dịch khoá học, bộ kiểm |

Bản quyền nội dung: tự biên soạn; ảnh ngoài ghi nguồn và giấy phép trong `packages/courses/*/LICENSE.md`.
