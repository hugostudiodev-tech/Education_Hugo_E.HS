import { useEffect } from "react";
import { Link } from "react-router-dom";

const UI_CSS = "/ui/edu-ui.css";

/** Khung trang riêng của khu Nhà phát triển (/developers, /partners): thanh trên riêng, không menu/cột của app. */
export default function DevSite({ children }) {
  // Khu này dùng chính thư viện mở edu-ui.css (nút "Vào học"…): nạp một lần cho mọi trang trong khu.
  useEffect(() => {
    if (!document.querySelector(`link[href="${UI_CSS}"]`)) document.head.appendChild(Object.assign(document.createElement("link"), { rel: "stylesheet", href: UI_CSS }));
  }, []);
  return (
    <div className="dev-site">
      <header className="dev-top">
        <Link to="/developers" className="dev-brand"><img src="/edu/cast-1.svg" alt="" width="32" height="32" /><span>Education Hugo <small>Nhà phát triển</small></span></Link>
        <nav aria-label="Mục lục">
          <Link to="/developers#ui">Thư viện mở</Link>
          <Link to="/developers#step">Thư viện step</Link>
          <Link to="/partners">Quy định đối tác</Link>
        </nav>
        <Link to="/learn" className="eh-btn dev-top-cta">Vào học</Link>
      </header>
      {children}
    </div>
  );
}
