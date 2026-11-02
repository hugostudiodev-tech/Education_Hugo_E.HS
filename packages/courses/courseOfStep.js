// Tách riêng khỏi index.js: tra khoá của một step mà không kéo nội dung mọi khoá vào gói đầu của app.
export const courseOfStep = (id) => (
  /^sql\d+$/.test(String(id)) ? "sql"
    : /^pa\d+$/.test(String(id)) ? "python-advanced"
      : /^py\d+$/.test(String(id)) ? "python" : "coding"
);
