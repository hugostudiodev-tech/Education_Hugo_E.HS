/**
 * Hình minh hoạ của slide "Minh hoạ" — vẽ bằng SVG nội tuyến chứ không tải ảnh:
 * ăn theo màu chữ (`currentColor`) và màu nhấn của bước (`--step-tone`), đổi
 * theme sáng/tối là đổi theo, và không tốn thêm lượt tải nào.
 *
 * Thêm hình mới: một khoá trong `VISUALS`, slide khai `visual: "<khoá>"`.
 * scripts/checks/check-coder-content.mjs báo lỗi nếu slide trỏ tới khoá không có.
 */
const ACCENT = "var(--step-tone, #0a84ff)";

function Box({ x, y, w, h, label, sub, accent, mono, r = 8 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r}
        fill={accent ? ACCENT : "currentColor"} fillOpacity={accent ? 0.16 : 0.06}
        stroke={accent ? ACCENT : "currentColor"} strokeOpacity={accent ? 1 : 0.35} />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -3 : 4)} textAnchor="middle" fontSize="11"
        fontWeight="700" fontFamily={mono ? "ui-monospace, monospace" : undefined} fill="currentColor">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.65">{sub}</text>}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, label, dashed }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ACCENT} strokeWidth="1.6"
        strokeDasharray={dashed ? "4 3" : undefined} markerEnd="url(#cv-arrow)" />
      {label && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.8">{label}</text>}
    </g>
  );
}

function Label({ x, y, children, size = 10, anchor = "middle", muted, mono, bold }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill="currentColor" fillOpacity={muted ? 0.6 : 1}
      fontWeight={bold ? 700 : 400} fontFamily={mono ? "ui-monospace, monospace" : undefined}>{children}</text>
  );
}

// Thẻ bài đăng thu nhỏ, dùng lại ở nhiều hình.
function MiniPost({ x, y, w = 150, author = "lan.code", text = "Chào Nhịp!" }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="40" rx="6" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.25" />
      <circle cx={x + 14} cy={y + 14} r="7" fill={ACCENT} fillOpacity="0.5" />
      <Label x={x + 26} y={y + 17} anchor="start" size={9} bold>{author}</Label>
      <Label x={x + 26} y={y + 30} anchor="start" size={9} muted>{text}</Label>
    </g>
  );
}

// Sơ đồ tư duy: một nút giữa, các nhánh toả quanh (tối đa 8), mỗi nhánh 1–3 lá.
function MindMap({ center, branches }) {
  const n = branches.length;
  return (
    <g>
      {branches.map(([title, leaves], i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
        const bx = 160 + Math.cos(angle) * 108;
        const by = 90 + Math.sin(angle) * 62;
        const left = bx < 160;
        return (
          <g key={title}>
            <line x1="160" y1="90" x2={bx} y2={by} stroke={ACCENT} strokeWidth="1.4" strokeOpacity="0.7" />
            <rect x={bx - 38} y={by - 9} width="76" height="18" rx="9" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
            <Label x={bx} y={by + 3.5} size={8.5} bold>{title}</Label>
            {leaves && <Label x={bx + (left ? -40 : 40)} y={by + 18} size={7.5} anchor={left ? "end" : "start"} muted>{leaves}</Label>}
          </g>
        );
      })}
      <circle cx="160" cy="90" r="24" fill={ACCENT} fillOpacity="0.28" stroke={ACCENT} strokeWidth="2" />
      <Label x={160} y={94} size={11} bold>{center}</Label>
    </g>
  );
}

const VISUALS = {
  ipo: () => (
    <>
      <Box x={10} y={60} w={86} h={56} label="Đầu vào" sub="bàn phím, biểu mẫu" />
      <Box x={117} y={60} w={86} h={56} label="Xử lý" sub="mã của bạn" accent />
      <Box x={224} y={60} w={86} h={56} label="Đầu ra" sub="màn hình, dữ liệu" />
      <Arrow x1={96} y1={88} x2={115} y2={88} />
      <Arrow x1={203} y1={88} x2={222} y2={88} />
      <Label x={160} y={150} muted>Mọi chương trình là chuỗi vòng vào → xử lý → ra</Label>
    </>
  ),
  "flowchart-post": () => (
    <>
      <Box x={110} y={4} w={100} h={24} label="Nhận nội dung" r={12} />
      <Arrow x1={160} y1={28} x2={160} y2={40} />
      <polygon points="160,42 210,64 160,86 110,64" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
      <Label x={160} y={67} size={9} bold>Trống?</Label>
      <Arrow x1={210} y1={64} x2={238} y2={64} label="có" />
      <Box x={240} y={52} w={74} h={24} label="Báo lỗi" />
      <Arrow x1={160} y1={86} x2={160} y2={98} />
      <Label x={166} y={96} anchor="start" size={9} muted>không</Label>
      <polygon points="160,100 210,122 160,144 110,122" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
      <Label x={160} y={125} size={9} bold>{"> 500?"}</Label>
      <Arrow x1={210} y1={122} x2={238} y2={84} label="có" />
      <Arrow x1={110} y1={122} x2={84} y2={122} label="không" />
      <Box x={6} y={110} w={76} h={24} label="Đăng bài" accent />
    </>
  ),
  variables: () => (
    <>
      {[["author", "\"lan.code\"", "string"], ["likes", "3", "number"], ["isPublic", "true", "boolean"]].map(([name, value, type], i) => (
        <g key={name}>
          <rect x={14 + i * 102} y={50} width="88" height="64" rx="8" fill={ACCENT} fillOpacity="0.1" stroke={ACCENT} />
          <rect x={14 + i * 102} y={34} width="88" height="20" rx="4" fill="currentColor" fillOpacity="0.85" />
          <text x={58 + i * 102} y={48} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--background, #fff)" fontFamily="ui-monospace, monospace">{name}</text>
          <Label x={58 + i * 102} y={88} mono bold size={11}>{value}</Label>
          <Label x={58 + i * 102} y={132} muted size={9}>{type}</Label>
        </g>
      ))}
      <Label x={160} y={162} muted>Nhãn là tên biến · đồ trong hộp là giá trị</Label>
    </>
  ),
  "client-server": () => (
    <>
      <Box x={8} y={50} w={90} h={70} label="Trình duyệt" sub="client" />
      <Box x={222} y={50} w={90} h={70} label="Máy chủ" sub="server" accent />
      <Arrow x1={98} y1={72} x2={220} y2={72} label="request: GET /index" />
      <Arrow x1={220} y1={102} x2={100} y2={102} label="response: 200 + HTML" dashed />
      <Label x={160} y={150} muted>Một lần bấm = một vòng hỏi–đáp</Label>
    </>
  ),
  "url-anatomy": () => {
    const parts = [["https://", "giao thức", 0], ["nhip.example", "tên miền", 52], ["/profile", "đường dẫn", 150], ["?u=lan", "truy vấn", 210]];
    return (
      <>
        <Label x={20} y={70} anchor="start" size={15} mono bold>https://nhip.example/profile?u=lan</Label>
        {parts.map(([text, name, offset], i) => {
          const x = 20 + offset * 1.18 + text.length * 4.3;
          return (
            <g key={name}>
              <line x1={x} y1={78} x2={x} y2={100 + (i % 2) * 22} stroke={ACCENT} />
              <Label x={x} y={112 + (i % 2) * 22} size={10} bold>{name}</Label>
            </g>
          );
        })}
      </>
    );
  },
  dns: () => (
    <>
      <Box x={8} y={20} w={86} h={44} label="Trình duyệt" />
      <Box x={222} y={20} w={90} h={44} label="Máy chủ DNS" accent />
      <Box x={222} y={112} w={90} h={44} label="203.0.113.7" sub="máy chủ Nhịp" mono />
      <Arrow x1={94} y1={34} x2={220} y2={34} label="nhip.example ở đâu?" />
      <Arrow x1={220} y1={54} x2={96} y2={54} label="IP: 203.0.113.7" dashed />
      <Arrow x1={60} y1={64} x2={220} y2={128} label="kết nối tới IP" />
    </>
  ),
  "http-message": () => (
    <>
      <rect x="8" y="10" width="146" height="150" rx="8" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.3" />
      <rect x="166" y="10" width="146" height="150" rx="8" fill={ACCENT} fillOpacity="0.08" stroke={ACCENT} />
      <Label x={81} y={28} bold>Request</Label>
      <Label x={239} y={28} bold>Response</Label>
      {["POST /posts HTTP/1.1", "Host: nhip.example", "Content-Type: form", "", "content=Chào Nhịp"].map((line, i) => (
        <Label key={i} x={16} y={52 + i * 18} anchor="start" size={8.5} mono>{line}</Label>
      ))}
      {["HTTP/1.1 201 Created", "Content-Type: text/html", "", "<!DOCTYPE html> …"].map((line, i) => (
        <Label key={i} x={174} y={52 + i * 18} anchor="start" size={8.5} mono>{line}</Label>
      ))}
      <Label x={81} y={150} size={8} muted>method · header · body</Label>
      <Label x={239} y={150} size={8} muted>status · header · body</Label>
    </>
  ),
  "app-wireframe": () => (
    <>
      {[[8, "Bảng tin"], [166, "Trang cá nhân"]].map(([x, title]) => (
        <g key={title}>
          <rect x={x} y="6" width="146" height="164" rx="10" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.3" />
          <Label x={x + 73} y={22} bold>{title}</Label>
        </g>
      ))}
      <rect x="16" y="30" width="130" height="28" rx="6" fill={ACCENT} fillOpacity="0.14" stroke={ACCENT} />
      <Label x={81} y={48} size={9}>Có gì mới? … [Đăng]</Label>
      <MiniPost x={16} y={64} w={130} />
      <MiniPost x={16} y={110} w={130} author="minh.dev" text="Flexbox cứu cả buổi chiều" />
      <circle cx="198" cy="48" r="14" fill={ACCENT} fillOpacity="0.5" />
      <Label x={218} y={44} anchor="start" size={10} bold>Lan Nguyễn</Label>
      <Label x={218} y={58} anchor="start" size={9} muted>@lan.code · 128 theo dõi</Label>
      <MiniPost x={174} y={72} w={130} />
      <MiniPost x={174} y={118} w={130} text="Box model là gì?" />
    </>
  ),
  "dom-tree": () => {
    const nodes = [["html", 160, 18], ["head", 90, 70], ["body", 230, 70], ["title", 90, 122], ["header", 180, 122], ["main", 280, 122], ["article", 280, 162]];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [2, 5], [5, 6]];
    return (
      <>
        {edges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={nodes[a][1]} y1={nodes[a][2] + 10} x2={nodes[b][1]} y2={nodes[b][2] - 10} stroke="currentColor" strokeOpacity="0.4" />
        ))}
        {nodes.map(([name, x, y], i) => (
          <Box key={name} x={x - 30} y={y - 10} w={60} h={20} label={name} mono accent={i === 0 || name === "article"} r={10} />
        ))}
      </>
    );
  },
  "semantic-layout": () => (
    <>
      <Box x={10} y={6} w={300} h={26} label="<header> + <nav>" mono />
      <Box x={10} y={40} w={206} h={108} label="" accent />
      <Label x={113} y={56} mono bold>{"<main>"}</Label>
      <Box x={20} y={64} w={186} h={34} label="<article> bài đăng" mono />
      <Box x={20} y={106} w={186} h={34} label="<article> bài đăng" mono />
      <Box x={224} y={40} w={86} h={108} label="<aside>" sub="gợi ý theo dõi" mono />
      <Box x={10} y={154} w={300} h={20} label="<footer>" mono />
    </>
  ),
  "tag-anatomy": () => (
    <>
      <Label x={160} y={74} size={13} mono bold>{'<a href="profile.html">lan.code</a>'}</Label>
      {[[44, "thẻ mở"], [118, "thuộc tính"], [204, "nội dung"], [262, "thẻ đóng"]].map(([x, name], i) => (
        <g key={name}>
          <line x1={x} y1={82} x2={x} y2={104 + (i % 2) * 20} stroke={ACCENT} />
          <Label x={x} y={116 + (i % 2) * 20} bold>{name}</Label>
        </g>
      ))}
    </>
  ),
  "post-anatomy": () => (
    <>
      <rect x="30" y="30" width="260" height="110" rx="10" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.3" />
      <circle cx="56" cy="56" r="14" fill={ACCENT} fillOpacity="0.5" />
      <Label x={78} y={60} anchor="start" bold>lan.code</Label>
      <Label x={270} y={60} anchor="end" muted size={9}>9:30</Label>
      <Label x={78} y={86} anchor="start" size={10}>Hôm nay mình bắt đầu học Coding!</Label>
      <Label x={78} y={120} anchor="start" size={10}>Thích 3 · Trả lời 1</Label>
      {[[56, 22, "ảnh + tên"], [270, 22, "time"], [170, 156, "nội dung"], [96, 156, "hành động"]].map(([x, y, name]) => (
        <Label key={name} x={x} y={y} size={9} bold>{name}</Label>
      ))}
      <Label x={160} y={174} muted size={9}>{"Cả khối là một <article>"}</Label>
    </>
  ),
  "box-model": () => (
    <>
      {[[10, 6, 300, 164, "margin", 0.04], [40, 26, 240, 124, "border", 0.1], [56, 42, 208, 92, "padding", 0.16]].map(([x, y, w, h, name, op]) => (
        <g key={name}>
          <rect x={x} y={y} width={w} height={h} rx="6" fill={ACCENT} fillOpacity={op} stroke={name === "border" ? "currentColor" : ACCENT} strokeWidth={name === "border" ? 3 : 1} strokeDasharray={name === "border" ? undefined : "4 3"} />
          <Label x={x + 6} y={y + 12} anchor="start" size={9} bold>{name}</Label>
        </g>
      ))}
      <Box x={90} y={66} w={140} h={44} label="nội dung" sub="width × height" accent />
    </>
  ),
  "flex-axes": () => (
    <>
      <rect x="10" y="30" width="300" height="110" rx="10" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.3" />
      {[0, 1, 2].map((i) => <Box key={i} x={30 + i * 95} y={60} w={70} h={50} label={`con ${i + 1}`} accent />)}
      <Arrow x1={20} y1={150} x2={300} y2={150} label="trục chính · justify-content" />
      <Arrow x1={316} y1={36} x2={316} y2={134} />
      <Label x={160} y={22} muted size={9}>gap = khoảng cách giữa các con · align-items = trục phụ</Label>
    </>
  ),
  "post-layout": () => (
    <>
      <rect x="10" y="20" width="300" height="130" rx="10" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.3" />
      <Box x={20} y={30} w={44} h={44} label="ảnh" r={22} />
      <rect x="74" y="30" width="226" height="110" rx="8" fill={ACCENT} fillOpacity="0.08" stroke={ACCENT} strokeDasharray="4 3" />
      <Label x={186} y={44} size={9} bold>.post-body · flex: 1</Label>
      <Box x={84} y={52} w={206} h={22} label="tên ←  space-between  → giờ" />
      <Box x={84} y={80} w={206} h={28} label="nội dung" />
      <Box x={84} y={114} w={120} h={20} label="Thích · Trả lời" />
      <Label x={160} y={168} muted size={9}>.post · display: flex · gap: 12px</Label>
    </>
  ),
  "array-index": () => (
    <>
      {["\"Chào\"", "\"HTML\"", "\"CSS\"", "\"JS\""].map((value, i) => (
        <g key={value}>
          <rect x={30 + i * 66} y={60} width="62" height="44" rx="6" fill={ACCENT} fillOpacity="0.12" stroke={ACCENT} />
          <Label x={61 + i * 66} y={87} mono size={11}>{value}</Label>
          <Label x={61 + i * 66} y={124} mono bold>{i}</Label>
        </g>
      ))}
      <Label x={160} y={40} mono size={11}>posts.length === 4</Label>
      <Label x={160} y={150} muted size={9}>posts[0] là ô đầu · posts[3] là ô cuối · posts[4] → undefined</Label>
    </>
  ),
  "object-shape": () => (
    <>
      <rect x="70" y="14" width="180" height="150" rx="10" fill={ACCENT} fillOpacity="0.08" stroke={ACCENT} />
      <Label x={160} y={32} bold mono>post</Label>
      {[["id", "1"], ["author", "\"lan.code\""], ["text", "\"Chào Nhịp\""], ["createdAt", "\"2026-10-27…\""], ["likes", "3"], ["likedByMe", "false"]].map(([key, value], i) => (
        <g key={key}>
          <Label x={84} y={54 + i * 19} anchor="start" mono size={10} bold>{key}:</Label>
          <Label x={160} y={54 + i * 19} anchor="start" mono size={10}>{value}</Label>
        </g>
      ))}
    </>
  ),
  pipeline: () => (
    <>
      <Box x={6} y={66} w={60} h={40} label="posts" sub="12 bài" mono />
      <Box x={88} y={66} w={64} h={40} label="filter" sub="của Lan: 5" accent mono />
      <Box x={174} y={66} w={64} h={40} label="sort" sub="mới nhất" accent mono />
      <Box x={260} y={66} w={56} h={40} label="map" sub="→ thẻ" accent mono />
      <Arrow x1={66} y1={86} x2={86} y2={86} />
      <Arrow x1={152} y1={86} x2={172} y2={86} />
      <Arrow x1={238} y1={86} x2={258} y2={86} />
      <Label x={160} y={140} muted size={9}>Mỗi bước trả mảng MỚI — mảng gốc giữ nguyên</Label>
    </>
  ),
  "render-cycle": () => (
    <>
      <Box x={120} y={6} w={80} h={36} label="Sự kiện" sub="bấm, gõ" />
      <Box x={226} y={74} w={86} h={36} label="Dữ liệu" sub="state" accent />
      <Box x={120} y={140} w={80} h={34} label="render()" mono />
      <Box x={8} y={74} w={86} h={36} label="Giao diện" sub="DOM" />
      <Arrow x1={200} y1={30} x2={240} y2={72} label="cập nhật" />
      <Arrow x1={256} y1={110} x2={202} y2={150} label="vẽ lại" />
      <Arrow x1={120} y1={156} x2={60} y2={112} />
      <Arrow x1={60} y1={74} x2={118} y2={30} label="người dùng" />
    </>
  ),
  "event-bubble": () => (
    <>
      {[["body", 6, 6, 308, 168], ["section#posts", 22, 28, 276, 136], ["article", 40, 52, 240, 98], ["button.like", 100, 96, 120, 34]].map(([name, x, y, w, h], i) => (
        <g key={name}>
          <rect x={x} y={y} width={w} height={h} rx="8" fill={ACCENT} fillOpacity={0.05 + i * 0.05} stroke={i === 1 ? ACCENT : "currentColor"} strokeOpacity={i === 1 ? 1 : 0.35} strokeWidth={i === 1 ? 2 : 1} />
          <Label x={x + 8} y={y + 14} anchor="start" mono size={9} bold={i === 1}>{name}</Label>
        </g>
      ))}
      <Arrow x1={160} y1={110} x2={160} y2={64} label="nổi bọt" />
      <Label x={160} y={166} size={9} muted>Một bộ nghe trên section#posts bắt được mọi nút tim</Label>
    </>
  ),
  "xss-compare": () => (
    <>
      <Label x={160} y={18} mono size={9.5}>{'text = "<img src=x onerror=alert(1)>"'}</Label>
      <rect x="8" y="34" width="146" height="128" rx="8" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.35" />
      <rect x="166" y="34" width="146" height="128" rx="8" fill="#e5484d" fillOpacity="0.08" stroke="#e5484d" />
      <Label x={81} y={54} mono bold>textContent</Label>
      <Label x={239} y={54} mono bold>innerHTML</Label>
      <Label x={81} y={92} mono size={8}>{"<img src=x onerror…>"}</Label>
      <Label x={81} y={140} size={9} muted>hiện nguyên văn · an toàn</Label>
      <rect x="196" y="78" width="86" height="30" rx="6" fill="#e5484d" fillOpacity="0.2" stroke="#e5484d" />
      <Label x={239} y={97} size={9} bold>alert(1) chạy!</Label>
      <Label x={239} y={140} size={9} muted>chạy như mã · XSS</Label>
    </>
  ),
  // ── Chặng 2: localhost, PHP, SQL, PDO ──
  "lamp-stack": () => (
    <>
      <Box x={2} y={66} w={74} h={44} label="Trình duyệt" />
      <Box x={96} y={66} w={60} h={44} label="Apache" sub="cổng 80" accent />
      <Box x={174} y={66} w={60} h={44} label="PHP" sub="chạy .php" accent />
      <Box x={252} y={66} w={64} h={44} label="MySQL" sub="cổng 3306" accent />
      <Arrow x1={76} y1={80} x2={94} y2={80} />
      <Arrow x1={156} y1={80} x2={172} y2={80} />
      <Arrow x1={234} y1={80} x2={250} y2={80} />
      <Arrow x1={250} y1={98} x2={236} y2={98} dashed />
      <Arrow x1={172} y1={98} x2={158} y2={98} dashed />
      <Arrow x1={94} y1={98} x2={78} y2={98} dashed />
      <Label x={160} y={40} muted size={9}>yêu cầu HTTP đi sang phải →</Label>
      <Label x={160} y={140} muted size={9}>← HTML đi ngược về trình duyệt</Label>
      <rect x="88" y="54" width="230" height="68" rx="10" fill="none" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="4 3" />
      <Label x={200} y={166} size={9} bold>XAMPP trên máy bạn = localhost</Label>
    </>
  ),
  "xampp-panel": () => (
    <>
      <rect x="10" y="8" width="300" height="164" rx="10" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.35" />
      <Label x={22} y={26} anchor="start" bold size={10}>XAMPP Control Panel</Label>
      {[["Apache", "80, 443", true], ["MySQL", "3306", true], ["FileZilla", "", false]].map(([name, port, on], i) => (
        <g key={name}>
          <rect x="20" y={40 + i * 30} width="64" height="22" rx="4" fill={on ? "#30a46c" : "currentColor"} fillOpacity={on ? 0.22 : 0.06} />
          <Label x={52} y={55 + i * 30} size={10} bold>{name}</Label>
          <Label x={120} y={55 + i * 30} size={9} mono muted>{port}</Label>
          <rect x="170" y={40 + i * 30} width="56" height="22" rx="4" fill={ACCENT} fillOpacity={on ? 0.1 : 0.2} stroke={ACCENT} />
          <Label x={198} y={55 + i * 30} size={9} bold>{on ? "Stop" : "Start"}</Label>
          <rect x="234" y={40 + i * 30} width="64" height="22" rx="4" fill="currentColor" fillOpacity="0.06" />
          <Label x={266} y={55 + i * 30} size={9}>Config</Label>
        </g>
      ))}
      <rect x="20" y="132" width="278" height="32" rx="4" fill="currentColor" fillOpacity="0.06" />
      <Label x={28} y={146} anchor="start" size={8.5} mono muted>[Apache] Status change detected: running</Label>
      <Label x={28} y={158} anchor="start" size={8.5} mono muted>[mysql]  Status change detected: running</Label>
    </>
  ),
  "htdocs-map": () => (
    <>
      <Box x={8} y={18} w={130} h={26} label="htdocs/" mono />
      <Box x={28} y={58} w={110} h={26} label="nhip/" mono accent />
      <Box x={48} y={98} w={90} h={24} label="index.php" mono />
      <Box x={48} y={132} w={90} h={24} label="hello.php" mono />
      <line x1="18" y1="44" x2="18" y2="71" stroke="currentColor" strokeOpacity="0.4" />
      <line x1="18" y1="71" x2="28" y2="71" stroke="currentColor" strokeOpacity="0.4" />
      <line x1="38" y1="84" x2="38" y2="144" stroke="currentColor" strokeOpacity="0.4" />
      <line x1="38" y1="110" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.4" />
      <line x1="38" y1="144" x2="48" y2="144" stroke="currentColor" strokeOpacity="0.4" />
      <Arrow x1={140} y1={31} x2={176} y2={31} />
      <Arrow x1={140} y1={110} x2={176} y2={90} />
      <Arrow x1={140} y1={144} x2={176} y2={144} />
      <Label x={180} y={35} anchor="start" mono size={9}>http://localhost/</Label>
      <Label x={180} y={86} anchor="start" mono size={9}>http://localhost/nhip/</Label>
      <Label x={180} y={98} anchor="start" muted size={8.5}>(tự mở index.php)</Label>
      <Label x={180} y={148} anchor="start" mono size={9}>…/nhip/hello.php</Label>
    </>
  ),
  "php-request": () => (
    <>
      <Box x={6} y={60} w={70} h={50} label="Trình duyệt" sub="GET index.php" />
      <rect x="100" y="20" width="130" height="140" rx="10" fill={ACCENT} fillOpacity="0.08" stroke={ACCENT} />
      <Label x={165} y={38} bold size={10}>PHP chạy từ trên xuống</Label>
      {["1. require bootstrap", "2. đọc $_POST / $_GET", "3. truy vấn dữ liệu", "4. in HTML", "5. kết thúc, quên hết"].map((line, i) => (
        <Label key={line} x={112} y={60 + i * 20} anchor="start" size={9} mono>{line}</Label>
      ))}
      <Box x={244} y={60} w={74} h={50} label="HTML" sub="không còn PHP" accent />
      <Arrow x1={76} y1={85} x2={98} y2={85} />
      <Arrow x1={230} y1={85} x2={242} y2={85} />
      <Label x={160} y={176} muted size={9}>Lần tải sau chạy lại từ dòng 1</Label>
    </>
  ),
  "prg-flow": () => (
    <>
      <line x1="50" y1="20" x2="50" y2="170" stroke="currentColor" strokeOpacity="0.3" />
      <line x1="270" y1="20" x2="270" y2="170" stroke="currentColor" strokeOpacity="0.3" />
      <Label x={50} y={14} bold size={10}>Trình duyệt</Label>
      <Label x={270} y={14} bold size={10}>Máy chủ</Label>
      <Arrow x1={52} y1={40} x2={268} y2={40} label="POST index.php (body=…)" />
      <Label x={265} y={62} anchor="end" size={9} muted>kiểm tra + lưu bài</Label>
      <Arrow x1={268} y1={80} x2={52} y2={80} label="303 See Other · Location: index.php" dashed />
      <Arrow x1={52} y1={112} x2={268} y2={112} label="GET index.php" />
      <Arrow x1={268} y1={144} x2={52} y2={144} label="200 + bảng tin mới" dashed />
      <Label x={160} y={170} size={9} bold>F5 lúc này chỉ lặp lại GET — không đăng trùng</Label>
    </>
  ),
  "erd-nhip": () => {
    const Entity = ({ x, y, name, cols }) => (
      <g>
        <rect x={x} y={y} width="96" height={22 + cols.length * 13} rx="6" fill="currentColor" fillOpacity="0.04" stroke={ACCENT} />
        <rect x={x} y={y} width="96" height="17" rx="6" fill={ACCENT} fillOpacity="0.22" />
        <Label x={x + 48} y={y + 12} bold size={9.5} mono>{name}</Label>
        {cols.map((col, i) => <Label key={col} x={x + 6} y={y + 29 + i * 13} anchor="start" size={8.5} mono>{col}</Label>)}
      </g>
    );
    return (
      <>
        <Entity x={10} y={8} name="users" cols={["PK id", "username UQ", "email UQ", "password_hash"]} />
        <Entity x={214} y={8} name="posts" cols={["PK id", "user_id → users", "parent_id → posts", "body"]} />
        <Entity x={10} y={122} name="follows" cols={["PK follower_id", "PK followee_id"]} />
        <Entity x={214} y={122} name="likes" cols={["PK user_id", "PK post_id"]} />
        <Arrow x1={106} y1={34} x2={212} y2={34} label="1 – nhiều: viết" />
        <Arrow x1={60} y1={82} x2={60} y2={120} />
        <Label x={66} y={106} anchor="start" size={9} muted>theo dõi</Label>
        <Arrow x1={106} y1={64} x2={212} y2={136} label="thả tim" />
        <Arrow x1={262} y1={82} x2={262} y2={120} />
      </>
    );
  },
  "table-anatomy": () => (
    <>
      <rect x="20" y="30" width="280" height="110" rx="6" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.4" />
      {["id", "username", "display_name"].map((c, i) => (
        <g key={c}>
          <rect x={20 + i * 93} y="30" width="93" height="22" fill={ACCENT} fillOpacity="0.18" stroke={ACCENT} strokeOpacity="0.5" />
          <Label x={66 + i * 93} y={45} mono bold size={9.5}>{c}</Label>
        </g>
      ))}
      {[["1", "lan.code", "Lan Nguyễn"], ["2", "minh.dev", "Minh Trần"], ["3", "an.ui", "An Phạm"]].map((row, r) => row.map((v, i) => (
        <Label key={`${r}${i}`} x={66 + i * 93} y={72 + r * 24} mono size={9.5}>{v}</Label>
      )))}
      <rect x="20" y="82" width="280" height="22" fill="none" stroke={ACCENT} strokeWidth="2" rx="3" />
      <Label x={66} y={20} size={9} bold>khoá chính</Label>
      <Label x={160} y={160} size={9} muted>Cột = thuộc tính · dòng = một bản ghi · ô = MỘT giá trị</Label>
    </>
  ),
  "sql-join": () => (
    <>
      <Label x={70} y={14} bold size={10} mono>posts</Label>
      <Label x={250} y={14} bold size={10} mono>likes</Label>
      {[["4", "Màu nhấn…"], ["5", "JOIN không…"], ["7", "Nhắc nhẹ…"]].map(([id, body], i) => (
        <g key={id}>
          <rect x="10" y={22 + i * 26} width="120" height="22" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.3" />
          <Label x={20} y={37 + i * 26} anchor="start" mono size={9}>{`${id} · ${body}`}</Label>
        </g>
      ))}
      {[["post 5", "user 1"], ["post 5", "user 2"], ["post 7", "user 4"]].map(([p, u], i) => (
        <g key={p + u}>
          <rect x="196" y={22 + i * 26} width="114" height="22" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.3" />
          <Label x={206} y={37 + i * 26} anchor="start" mono size={9}>{`${p} · ${u}`}</Label>
        </g>
      ))}
      <Arrow x1={130} y1={59} x2={194} y2={33} />
      <Arrow x1={130} y1={59} x2={194} y2={59} />
      <Arrow x1={130} y1={85} x2={194} y2={85} />
      <rect x="10" y="112" width="300" height="60" rx="8" fill={ACCENT} fillOpacity="0.1" stroke={ACCENT} />
      <Label x={20} y={130} anchor="start" size={9} bold>JOIN: bài 4 biến mất (không có cặp)</Label>
      <Label x={20} y={148} anchor="start" size={9} bold>LEFT JOIN: bài 4 còn, likes = NULL → COUNT = 0</Label>
      <Label x={20} y={164} anchor="start" size={8.5} muted>bài 5 nhân thành 2 dòng → GROUP BY gộp lại, COUNT = 2</Label>
    </>
  ),
  "sql-order": () => {
    const steps = ["FROM/JOIN", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY", "LIMIT"];
    return (
      <>
        {steps.map((s, i) => (
          <g key={s}>
            <rect x={6 + (i % 4) * 78} y={i < 4 ? 30 : 100} width="70" height="34" rx="8" fill={ACCENT} fillOpacity={0.08 + i * 0.03} stroke={ACCENT} />
            <Label x={41 + (i % 4) * 78} y={(i < 4 ? 30 : 100) + 21} mono bold size={9}>{s}</Label>
            <Label x={41 + (i % 4) * 78} y={(i < 4 ? 30 : 100) - 6} size={8.5} muted>{i + 1}</Label>
          </g>
        ))}
        {[0, 1, 2, 4, 5].map((i) => <Arrow key={i} x1={76 + (i % 4) * 78} y1={(i < 4 ? 47 : 117)} x2={82 + (i % 4) * 78} y2={(i < 4 ? 47 : 117)} />)}
        <Arrow x1={290} y1={64} x2={40} y2={98} dashed />
        <Label x={160} y={164} muted size={9}>Viết SELECT trước, nhưng nó chạy thứ năm</Label>
      </>
    );
  },
  pagination: () => (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={10 + i * 34} y="30" width="30" height="40" rx="4" fill={i >= 3 && i < 6 ? ACCENT : "currentColor"} fillOpacity={i >= 3 && i < 6 ? 0.3 : 0.06} stroke="currentColor" strokeOpacity="0.3" />
      ))}
      <Label x={60} y={86} size={9} muted>OFFSET 3: đọc rồi bỏ</Label>
      <Label x={162} y={86} size={9} bold>LIMIT 3</Label>
      <line x1="10" y1="96" x2="108" y2="96" stroke="#e5484d" strokeWidth="2" />
      <Label x={160} y={120} size={9.5} bold>Keyset: WHERE (created_at, id) &lt; (mốc cuối trang trước)</Label>
      <Label x={160} y={140} size={9} muted>nhảy thẳng tới đúng chỗ nhờ chỉ mục — trang sâu vẫn nhanh</Label>
      <Label x={160} y={166} size={9} muted>Luôn ORDER BY created_at DESC, id DESC</Label>
    </>
  ),
  "pdo-prepare": () => (
    <>
      <Box x={4} y={20} w={150} h={44} label="1 · prepare()" sub="VALUES (:user_id, :body)" mono />
      <Box x={4} y={104} w={150} h={44} label="2 · execute()" sub={"body: \"'); DROP TABLE…\""} mono />
      <Box x={214} y={50} w={98} h={68} label="MySQL" sub="khuôn đã cố định" accent />
      <Arrow x1={154} y1={42} x2={212} y2={66} label="khuôn lệnh" />
      <Arrow x1={154} y1={126} x2={212} y2={104} label="giá trị" />
      <Label x={262} y={140} size={9} bold>→ lưu nguyên văn</Label>
      <Label x={262} y={154} size={9} muted>không bao giờ chạy</Label>
    </>
  ),
  "lamp-flow-db": () => (
    <>
      {[["GET", "/nhip/", 8], ["bootstrap", ".php", 70], ["db()", "→ PDO", 132], ["feed_posts", "()", 194], ["foreach", "post.php", 256]].map(([label, sub, x], i) => (
        <g key={label}>
          <rect x={x} y={56} width="58" height="52" rx="8" fill={ACCENT} fillOpacity={0.06 + i * 0.05} stroke={ACCENT} />
          <Label x={x + 29} y={84} size={8} mono bold>{label}</Label>
          <Label x={x + 29} y={98} size={8} muted>{sub}</Label>
          <Label x={x + 29} y={46} size={9} muted>{i + 1}</Label>
        </g>
      ))}
      {[66, 128, 190, 252].map((x) => <Arrow key={x} x1={x} y1={82} x2={x + 4} y2={82} />)}
      <Box x={150} y={128} w={92} h={30} label="MySQL :3306" accent />
      <Arrow x1={180} y1={108} x2={190} y2={126} />
      <Label x={160} y={176} size={9} muted>Một yêu cầu = một kết nối, đóng khi PHP chạy xong</Label>
    </>
  ),
  // ── Chặng 3: tài khoản, CRUD, hồ sơ, tương tác ──
  "session-flow": () => (
    <>
      <Box x={4} y={40} w={76} h={100} label="Trình duyệt" />
      <rect x="10" y="98" width="64" height="30" rx="6" fill={ACCENT} fillOpacity="0.18" stroke={ACCENT} />
      <Label x={42} y={110} size={8} bold>cookie</Label>
      <Label x={42} y={122} size={8} mono>k3f9…</Label>
      <Box x={240} y={40} w={76} h={100} label="Máy chủ" accent />
      <rect x="244" y="98" width="68" height="30" rx="6" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.4" />
      <Label x={278} y={110} size={8} bold>phiên k3f9</Label>
      <Label x={278} y={122} size={8} mono>user_id=1</Label>
      <Arrow x1={80} y1={56} x2={238} y2={56} label="1 · POST login.php" />
      <Arrow x1={238} y1={82} x2={82} y2={82} label="2 · Set-Cookie: k3f9…" dashed />
      <Arrow x1={80} y1={120} x2={238} y2={120} label="3 · mọi yêu cầu kèm cookie" />
      <Label x={160} y={174} size={9} muted>Cookie chỉ là chìa khoá; dữ liệu nằm ở máy chủ</Label>
    </>
  ),
  "hash-verify": () => (
    <>
      <Box x={4} y={24} w={100} h={34} label="mật khẩu" sub="nhip-demo-2026" />
      <Box x={4} y={110} w={100} h={34} label="muối" sub="ngẫu nhiên, 16 byte" />
      <Box x={122} y={58} w={80} h={60} label="bcrypt" sub="2^10 vòng" accent />
      <Box x={222} y={58} w={94} h={60} label="$2y$10$h0d…" sub="lưu vào CSDL" mono />
      <Arrow x1={102} y1={44} x2={120} y2={74} />
      <Arrow x1={102} y1={126} x2={120} y2={104} />
      <Arrow x1={202} y1={88} x2={220} y2={88} />
      <Label x={216} y={150} size={9} bold>một chiều: không có đường ngược lại</Label>
    </>
  ),
  "crud-map": () => {
    const rows = [["Create", "POST", "INSERT"], ["Read", "GET", "SELECT"], ["Update", "POST", "UPDATE"], ["Delete", "POST", "DELETE"]];
    return (
      <>
        {["Thao tác", "HTTP", "SQL"].map((h, i) => <Label key={h} x={58 + i * 102} y={18} bold size={10}>{h}</Label>)}
        {rows.map(([op, http, sql], r) => (
          <g key={op}>
            <Box x={10} y={28 + r * 37} w={96} h={30} label={op} accent={r !== 1} />
            <Box x={112} y={28 + r * 37} w={96} h={30} label={http} mono />
            <Box x={214} y={28 + r * 37} w={96} h={30} label={sql} mono />
            <Arrow x1={106} y1={43 + r * 37} x2={110} y2={43 + r * 37} />
            <Arrow x1={208} y1={43 + r * 37} x2={212} y2={43 + r * 37} />
          </g>
        ))}
      </>
    );
  },
  "ownership-check": () => (
    <>
      <Box x={6} y={20} w={110} h={40} label="Lớp giao diện" sub="ẩn nút Sửa/Xoá" />
      <Box x={6} y={100} w={110} h={40} label="Lớp máy chủ" sub="kiểm trong SQL" accent />
      <rect x="140" y="18" width="174" height="44" rx="8" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="4 3" />
      <Label x={227} y={36} size={9}>gõ tay edit.php?id=2 là vượt qua</Label>
      <Label x={227} y={52} size={9} muted>→ chỉ để dễ dùng</Label>
      <rect x="140" y="98" width="174" height="44" rx="8" fill={ACCENT} fillOpacity="0.12" stroke={ACCENT} />
      <Label x={227} y={116} size={9} mono bold>WHERE id = ? AND user_id = ?</Label>
      <Label x={227} y={132} size={9}>không phải chủ → 0 dòng</Label>
      <Arrow x1={116} y1={40} x2={138} y2={40} dashed />
      <Arrow x1={116} y1={120} x2={138} y2={120} />
      <Label x={160} y={170} size={9} bold>Chỉ lớp máy chủ mới là bảo mật</Label>
    </>
  ),
  "follow-graph": () => {
    const at = { lan: [160, 40], minh: [60, 110], an: [260, 110], khoa: [110, 160], mai: [220, 160] };
    const edges = [["lan", "minh"], ["minh", "lan"], ["an", "lan"], ["lan", "khoa"], ["khoa", "mai"], ["mai", "lan"], ["lan", "mai"]];
    return (
      <>
        {edges.map(([a, b]) => {
          const [x1, y1] = at[a];
          const [x2, y2] = at[b];
          const len = Math.hypot(x2 - x1, y2 - y1);
          const k = 20 / len;
          return <Arrow key={a + b} x1={x1 + (x2 - x1) * k + (y2 - y1) * 0.05} y1={y1 + (y2 - y1) * k - (x2 - x1) * 0.05} x2={x2 - (x2 - x1) * k + (y2 - y1) * 0.05} y2={y2 - (y2 - y1) * k - (x2 - x1) * 0.05} />;
        })}
        {Object.entries(at).map(([name, [x, y]]) => (
          <g key={name}>
            <circle cx={x} cy={y} r="17" fill={name === "lan" ? ACCENT : "currentColor"} fillOpacity={name === "lan" ? 0.3 : 0.08} stroke={name === "lan" ? ACCENT : "currentColor"} strokeOpacity="0.5" />
            <Label x={x} y={y + 4} size={9} bold>{name}</Label>
          </g>
        ))}
        <Label x={8} y={18} anchor="start" size={9} muted>mũi tên = "theo dõi"</Label>
        <Label x={312} y={18} anchor="end" size={9} muted>lan: 3 vào · 3 ra</Label>
      </>
    );
  },
  "upload-pipeline": () => (
    <>
      {[["Gửi", "multipart"], ["$_FILES", "tệp tạm"], ["Kiểm", "2MB·finfo"], ["Đổi tên", "32 hex"], ["Lưu", "uploads/"]].map(([label, sub], i) => (
        <g key={label}>
          <Box x={4 + i * 64} y={60} w={56} h={50} label={label} sub={sub} accent={i === 2 || i === 3} />
          {i < 4 && <Arrow x1={60 + i * 64} y1={85} x2={66 + i * 64} y2={85} />}
        </g>
      ))}
      <Arrow x1={160} y1={112} x2={160} y2={140} dashed />
      <Label x={160} y={156} size={9} bold>sai → huỷ, tệp tạm tự xoá</Label>
      <Label x={160} y={38} size={9} muted>Không tin tên tệp, không tin Content-Type</Label>
    </>
  ),
  "fetch-flow": () => (
    <>
      <line x1="50" y1="24" x2="50" y2="168" stroke="currentColor" strokeOpacity="0.3" />
      <line x1="270" y1="24" x2="270" y2="168" stroke="currentColor" strokeOpacity="0.3" />
      <Label x={50} y={16} bold size={10}>app.js</Label>
      <Label x={270} y={16} bold size={10}>like.php</Label>
      <Label x={56} y={40} anchor="start" size={9} muted>bấm Thích · preventDefault()</Label>
      <Arrow x1={52} y1={60} x2={268} y2={60} label="fetch POST · Accept: application/json" />
      <Label x={264} y={84} anchor="end" size={9} muted>toggle_like()</Label>
      <Arrow x1={268} y1={104} x2={52} y2={104} label='200 {"liked":true,"likes":5}' dashed />
      <Label x={56} y={128} anchor="start" size={9}>cập nhật aria-pressed + số</Label>
      <Label x={160} y={160} size={9} bold>Trang không tải lại, không cuộn mất chỗ</Label>
    </>
  ),
  "reply-tree": () => {
    const nodes = [["5 · Khoa", 10, 14, true], ["6 · Minh", 40, 52], ["14 · An", 70, 90], ["15 · Lan", 100, 128], ["9 · Khoa", 40, 156]];
    return (
      <>
        {nodes.map(([label, x, y, root]) => (
          <g key={label}>
            <rect x={x} y={y} width="96" height="24" rx="6" fill={root ? ACCENT : "currentColor"} fillOpacity={root ? 0.25 : 0.06} stroke={root ? ACCENT : "currentColor"} strokeOpacity="0.5" />
            <Label x={x + 48} y={y + 16} size={9} bold mono>{label}</Label>
          </g>
        ))}
        <path d="M24 38 V64 H40 M54 76 V102 H70 M84 114 V140 H100 M24 64 V168 H40" fill="none" stroke={ACCENT} strokeWidth="1.5" />
        <Label x={314} y={30} anchor="end" size={9} mono>[5] → 6, 9</Label>
        <Label x={314} y={68} anchor="end" size={9} mono>[6] → 14</Label>
        <Label x={314} y={106} anchor="end" size={9} mono>[14] → 15</Label>
        <Label x={314} y={144} anchor="end" size={9} mono>[15] → rỗng: dừng</Label>
        <Label x={314} y={172} anchor="end" size={8.5} muted>$byParent</Label>
      </>
    );
  },
  // ── Chặng 4: bảo mật ──
  "cia-triad": () => (
    <>
      <polygon points="160,38 52,150 268,150" fill={ACCENT} fillOpacity="0.1" stroke={ACCENT} strokeWidth="1.5" />
      <circle cx="160" cy="38" r="4" fill={ACCENT} />
      <circle cx="52" cy="150" r="4" fill={ACCENT} />
      <circle cx="268" cy="150" r="4" fill={ACCENT} />
      <Label x={160} y={22} bold size={11}>Confidentiality — Bí mật</Label>
      <Label x={52} y={166} bold size={10}>Integrity</Label>
      <Label x={52} y={178} muted size={8.5}>Toàn vẹn</Label>
      <Label x={268} y={166} bold size={10}>Availability</Label>
      <Label x={268} y={178} muted size={8.5}>Sẵn sàng</Label>
      <Label x={160} y={108} bold size={10}>CIA</Label>
      <Label x={160} y={124} muted size={8.5}>mọi lỗ hổng phá ít nhất một</Label>
    </>
  ),
  "threat-model": () => (
    <>
      <Box x={6} y={66} w={70} h={44} label="Trình duyệt" sub="người dùng" />
      <Box x={126} y={30} w={70} h={40} label="Apache" sub="+ PHP" accent />
      <Box x={126} y={110} w={70} h={40} label="uploads/" />
      <Box x={246} y={66} w={66} h={44} label="MySQL" accent />
      <Arrow x1={76} y1={88} x2={124} y2={60} />
      <Arrow x1={76} y1={92} x2={124} y2={128} />
      <Arrow x1={196} y1={60} x2={244} y2={84} />
      <rect x="92" y="14" width="228" height="150" rx="10" fill="none" stroke="#e5484d" strokeWidth="1.5" strokeDasharray="5 4" />
      <Label x={206} y={12} size={9} bold>vùng tin được (máy chủ)</Label>
      <Label x={100} y={86} size={8.5} muted>ranh giới</Label>
      <Label x={100} y={96} size={8.5} muted>tin cậy</Label>
      <Label x={160} y={178} size={9}>Dữ liệu từ trình duyệt = KHÔNG tin được</Label>
    </>
  ),
  "injection-concept": () => (
    <>
      <Box x={10} y={30} w={96} h={30} label="lệnh lập trình viên" />
      <Box x={10} y={74} w={96} h={30} label="dữ liệu người dùng" accent />
      <Box x={200} y={52} w={110} h={40} label="bộ diễn giải" sub="CSDL / trình duyệt" />
      <Arrow x1={106} y1={45} x2={198} y2={64} />
      <Arrow x1={106} y1={89} x2={198} y2={80} />
      <Label x={150} y={126} size={9.5} bold>Hai kênh tách biệt → an toàn</Label>
      <Label x={150} y={146} size={9} muted>Ghép thành một chuỗi → dữ liệu băng qua</Label>
      <Label x={150} y={162} size={9} muted>thành lệnh = tiêm nhiễm</Label>
      <rect x="4" y="22" width="108" height="90" rx="8" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="4 3" />
    </>
  ),
  "sqli-anatomy": () => (
    <>
      <Label x={160} y={22} mono size={10} bold>body LIKE '%___%'</Label>
      <rect x="40" y="44" width="240" height="30" rx="6" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.3" />
      <Label x={160} y={63} mono size={9}>{"' UNION SELECT … -- "}</Label>
      {[["'", "đóng chuỗi gốc", 58], ["UNION SELECT", "nối truy vấn khác", 150], ["-- ", "bỏ phần đuôi", 250]].map(([, desc, x], i) => (
        <g key={desc}>
          <line x1={x} y1={74} x2={x} y2={92 + (i % 2) * 20} stroke={ACCENT} />
          <Label x={x} y={104 + (i % 2) * 20} size={9} bold>{desc}</Label>
        </g>
      ))}
      <Label x={160} y={168} size={9} muted>Dấu nháy làm câu lệnh gãy đúng chỗ đó</Label>
    </>
  ),
  "csrf-flow": () => (
    <>
      <Box x={6} y={30} w={74} h={40} label="Lan" sub="đã đăng nhập" />
      <Box x={120} y={30} w={86} h={40} label="trang-xau" sub="biểu mẫu ẩn" />
      <Box x={244} y={78} w={70} h={40} label="Nhịp" accent />
      <Arrow x1={80} y1={50} x2={118} y2={50} label="2 · mở" />
      <Arrow x1={163} y1={70} x2={250} y2={94} label="3 · POST delete.php" />
      <rect x="2" y="86" width="90" height="30" rx="6" fill={ACCENT} fillOpacity="0.18" stroke={ACCENT} />
      <Label x={47} y={104} size={8.5} bold>cookie Nhịp</Label>
      <Arrow x1={92} y1={101} x2={242} y2={101} label="tự kèm cookie" dashed />
      <Label x={160} y={150} size={9.5} bold>Chỉ kiểm cookie → Nhịp tưởng là Lan → xoá bài</Label>
      <Label x={160} y={168} size={9} muted>trang-xau KHÔNG đọc được gì, nhưng kích hoạt được</Label>
    </>
  ),
  "csrf-token": () => (
    <>
      <Box x={6} y={28} w={150} h={48} label="biểu mẫu Nhịp thật" sub="_token = a9f3… (ô ẩn)" accent />
      <Box x={6} y={108} w={150} h={48} label="biểu mẫu trang-xau" sub="_token = ??? (không biết)" />
      <Box x={230} y={68} w={84} h={48} label="csrf_check" sub="so với phiên" />
      <Arrow x1={156} y1={52} x2={228} y2={80} />
      <Arrow x1={156} y1={132} x2={228} y2={104} />
      <Label x={300} y={60} anchor="end" size={9} bold>khớp → xử lý</Label>
      <Label x={300} y={128} anchor="end" size={9} bold>sai → 419</Label>
      <Label x={160} y={176} size={9} muted>Token nằm trong HTML Nhịp; khác nguồn không đọc được</Label>
    </>
  ),
  "rate-limit": () => (
    <>
      {[1,2,3,4,5].map((n,i)=>(
        <g key={n}>
          <rect x={10+i*42} y={40} width="34" height="34" rx="6" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.35" />
          <Label x={27+i*42} y={61} size={10} bold>{n}</Label>
        </g>
      ))}
      <rect x={220} y={40} width="40" height="34" rx="6" fill="#e5484d" fillOpacity="0.18" stroke="#e5484d" />
      <Label x={240} y={61} size={10} bold>6</Label>
      <Label x={120} y={28} size={9} muted>5 lần sai được thử</Label>
      <Label x={240} y={28} size={9} bold>bị chặn</Label>
      <Arrow x1={44} y1={90} x2={220} y2={90} label="cửa sổ trượt 15 phút" />
      <Label x={160} y={120} size={9.5} bold>Đăng nhập ĐÚNG → xoá bộ đếm</Label>
      <Label x={160} y={140} size={9} muted>{'Đếm theo IP: COUNT(*) WHERE created_at > NOW()-15min'}</Label>
      <Label x={160} y={162} size={9} muted>Không khoá vĩnh viễn (tránh bị khoá oan)</Label>
    </>
  ),
  "audit-log": () => (
    <>
      <rect x="10" y="26" width="300" height="118" rx="8" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.35" />
      {["action","user_id","detail","created_at"].map((c,i)=>(
        <Label key={c} x={[52,128,196,268][i]} y={42} mono bold size={8.5}>{c}</Label>
      ))}
      {[["login","1","","13:59"],["post_delete","1","post #42","14:02"],["login_failed","—","lan.code","14:05"]].map((row,r)=>(
        <g key={r}>
          {row.map((v,i)=><Label key={i} x={[52,128,196,268][i]} y={64+r*24} mono size={8.5}>{v}</Label>)}
          <line x1="16" y1={72+r*24} x2="304" y2={72+r*24} stroke="currentColor" strokeOpacity="0.15" />
        </g>
      ))}
      <Label x={160} y={160} size={9} bold>Ai · làm gì · khi nào — KHÔNG có mật khẩu</Label>
      <Label x={160} y={176} size={8.5} muted>xoá tài khoản vẫn giữ dòng (ON DELETE SET NULL)</Label>
    </>
  ),
  // ── Chặng 5: hoàn thiện sản phẩm ──
  "mvc-layers": () => (
    <>
      <Box x={10} y={30} w={90} h={44} label="Controller" sub="src/pages" accent />
      <Box x={115} y={30} w={90} h={44} label="Model" sub="src/*.php (SQL)" />
      <Box x={220} y={30} w={90} h={44} label="View" sub="src/views" accent />
      <Arrow x1={100} y1={52} x2={113} y2={52} label="gọi" />
      <Arrow x1={205} y1={52} x2={218} y2={52} label="dữ liệu" />
      <Box x={115} y={110} w={90} h={34} label="CSDL" />
      <Arrow x1={160} y1={74} x2={160} y2={108} />
      <Label x={160} y={162} size={9} bold>Controller điều phối · Model dữ liệu · View hiển thị</Label>
      <Label x={160} y={178} size={8.5} muted>mỗi phần một trách nhiệm, đổi phần này không vỡ phần kia</Label>
    </>
  ),
  "front-controller": () => (
    <>
      {["/","/login","/post/5","/u/lan"].map((p,i)=>(
        <g key={p}>
          <rect x={8} y={24+i*30} width="80" height="24" rx="6" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.3" />
          <Label x={48} y={40+i*30} mono size={9}>{p}</Label>
          <Arrow x1={88} y1={36+i*30} x2={128} y2={88} />
        </g>
      ))}
      <Box x={128} y={66} w={96} h={44} label="index.php" sub="front controller" accent />
      <Box x={250} y={30} w={64} h={34} label="router" sub="khớp tuyến" />
      <Box x={250} y={78} w={64} h={34} label="pages/*" sub="controller" />
      <Box x={250} y={126} w={64} h={30} label="bootstrap" />
      <Arrow x1={224} y1={80} x2={248} y2={50} label="1" />
      <Arrow x1={224} y1={92} x2={248} y2={95} label="2" />
      <Label x={160} y={176} size={9} bold>Một cửa → bảo mật áp một lần cho tất cả</Label>
    </>
  ),
  "n-plus-one": () => (
    <>
      <Box x={10} y={30} w={120} h={30} label="1 truy vấn" sub="lấy 20 bài" accent />
      {[0,1,2].map(i=>(
        <rect key={i} x={160+i*8} y={28+i*4} width="140" height="26" rx="5" fill="#e5484d" fillOpacity="0.12" stroke="#e5484d" strokeOpacity="0.5" />
      ))}
      <Label x={236} y={46} size={9}>+20 lấy tác giả</Label>
      <Label x={70} y={82} size={9}>+20 đếm tim</Label>
      <rect x="10" y="66" width="120" height="24" rx="5" fill="#e5484d" fillOpacity="0.12" stroke="#e5484d" strokeOpacity="0.5" />
      <Label x={236} y={86} size={13} bold>= 41 truy vấn</Label>
      <line x1="10" y1="108" x2="310" y2="108" stroke="currentColor" strokeOpacity="0.2" />
      <Box x={10} y={120} w={300} h={30} label="JOIN + IN: 2 truy vấn cho MỌI số bài" accent />
      <Label x={160} y={170} size={9} muted>N+1: số truy vấn tăng theo số phần tử — tránh bằng JOIN</Label>
    </>
  ),
  "db-index": () => (
    <>
      <Label x={80} y={20} bold size={10}>Không chỉ mục</Label>
      {[0,1,2,3,4].map(i=>(
        <rect key={i} x={20} y={30+i*22} width="120" height="18" rx="3" fill={i===3?ACCENT:"currentColor"} fillOpacity={i===3?0.3:0.06} stroke="currentColor" strokeOpacity="0.25" />
      ))}
      <Label x={80} y={152} size={9} muted>đọc từng dòng (type: ALL)</Label>
      <Label x={240} y={20} bold size={10}>Có chỉ mục</Label>
      <path d="M200 70 L240 44 M240 44 L280 30 M240 44 L280 58 M200 70 L240 96 M240 96 L280 82 M240 96 L280 110" stroke={ACCENT} strokeWidth="1.3" fill="none" />
      {[[240,44],[280,30],[280,58],[240,96],[280,82],[280,110]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="7" fill={ACCENT} fillOpacity={i===4?0.5:0.14} stroke={ACCENT} />
      ))}
      <circle cx="200" cy="70" r="8" fill={ACCENT} fillOpacity="0.2" stroke={ACCENT} />
      <Label x={250} y={152} size={9} muted>tra B-tree, tới thẳng (type: ref)</Label>
      <Label x={160} y={176} size={9} muted>Chỉ mục = mục lục · nhanh khi tìm, tốn chút khi ghi</Label>
    </>
  ),
  "hashtag-model": () => (
    <>
      <Box x={10} y={40} w={80} h={70} label="posts" accent />
      <Box x={120} y={56} w={80} h={40} label="post_tags" sub="bảng nối" />
      <Box x={230} y={40} w={80} h={70} label="tags" sub="name UQ" accent />
      <Arrow x1={90} y1={74} x2={118} y2={74} />
      <Arrow x1={200} y1={74} x2={228} y2={74} />
      <Label x={160} y={30} size={9} bold>nhiều — nhiều</Label>
      <Label x={160} y={134} size={9}>1 bài nhiều thẻ · 1 thẻ nhiều bài</Label>
      <Label x={160} y={156} size={9} muted>#php → INSERT IGNORE tags, rồi nối post_tags</Label>
      <Label x={160} y={174} size={9} muted>/tag/php: JOIN ngược lấy mọi bài mang thẻ</Label>
    </>
  ),
  "notif-model": () => (
    <>
      <rect x="20" y="24" width="280" height="96" rx="8" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.35" />
      <Label x={160} y={18} bold size={10} mono>notifications</Label>
      {[["user_id","người NHẬN"],["actor_id","người GÂY ra"],["type","reply/like/follow/mention"],["post_id","bài liên quan (có thể NULL)"]].map(([c,d],i)=>(
        <g key={c}>
          <Label x={34} y={44+i*22} anchor="start" mono size={9} bold>{c}</Label>
          <Label x={150} y={44+i*22} anchor="start" size={9} muted>{d}</Label>
        </g>
      ))}
      <Label x={160} y={140} size={9.5} bold>Lan thích bài Minh → Minh nhận "like"</Label>
      <Label x={160} y={160} size={9} muted>user_id = Minh · actor_id = Lan · bỏ qua nếu trùng</Label>
    </>
  ),
  "metrics-types": () => (
    <>
      <rect x="8" y="30" width="144" height="118" rx="8" fill="#e5484d" fillOpacity="0.06" stroke="#e5484d" strokeOpacity="0.5" />
      <Label x={80} y={48} bold size={10}>Phù phiếm</Label>
      <Label x={80} y={72} size={9} muted>"Tổng bài từ trước"</Label>
      <Label x={80} y={92} size={9} muted>chỉ tăng · không</Label>
      <Label x={80} y={106} size={9} muted>gợi hành động gì</Label>
      <rect x="168" y="30" width="144" height="118" rx="8" fill={ACCENT} fillOpacity="0.1" stroke={ACCENT} />
      <Label x={240} y={48} bold size={10}>Hành động</Label>
      <Label x={240} y={72} size={9} muted>"Bài mỗi ngày"</Label>
      <Label x={240} y={92} size={9} muted>giảm 3 ngày →</Label>
      <Label x={240} y={106} size={9} bold>đi tìm nguyên nhân</Label>
      <Label x={160} y={170} size={9} muted>Hỏi: "số này đổi thì tôi làm gì khác?" — không trả lời được = phù phiếm</Label>
    </>
  ),
  "analytics-pipeline": () => (
    <>
      {[["Sự kiện","created_at"],["Truy vấn","GROUP BY"],["Biểu đồ","dễ đọc"],["Quyết định","hành động"]].map(([t,sub],i)=>(
        <g key={t}>
          <Box x={6+i*78} y={60} w={66} h={48} label={t} sub={sub} accent={i===3} />
          {i<3 && <Arrow x1={72+i*78} y1={84} x2={82+i*78} y2={84} />}
        </g>
      ))}
      <Label x={160} y={40} size={9} muted>Mọi bảng ghi created_at từ đầu → giờ phân tích được</Label>
      <Label x={160} y={140} size={9.5} bold>Dữ liệu thô → chỉ số → quyết định</Label>
    </>
  ),
  "deploy-diff": () => (
    <>
      <Box x={20} y={34} w={120} h={30} label="localhost" />
      <Box x={180} y={34} w={120} h={30} label="production" accent />
      {[["debug = true","debug = FALSE"],["127.0.0.1","sql123.host"],["HTTP","HTTPS"],["Secure: off","Secure: ON"]].map(([a,b],i)=>(
        <g key={i}>
          <Label x={80} y={86+i*22} size={9} mono muted>{a}</Label>
          <Label x={240} y={86+i*22} size={9} mono bold>{b}</Label>
        </g>
      ))}
      <Label x={160} y={176} size={9} muted>Mọi khác biệt nằm trong config.php + vài cờ</Label>
    </>
  ),
  "deploy-layout": () => (
    <>
      <Box x={70} y={24} w={180} h={28} label="web root (htdocs / public_html)" />
      <Box x={90} y={62} w={140} h={26} label="= nội dung public/" accent />
      <Label x={160} y={104} size={9} muted>index.php · css · js · uploads</Label>
      <Box x={70} y={120} w={180} h={28} label="thư mục CHA (ngoài web)" />
      <Label x={160} y={162} size={9} mono>src/ · config.php · database/</Label>
      <Label x={160} y={178} size={9} bold>Trình duyệt KHÔNG tải được config.php</Label>
    </>
  ),
  "diataxis": () => (
    <>
      <line x1="160" y1="20" x2="160" y2="156" stroke="currentColor" strokeOpacity="0.25" />
      <line x1="24" y1="88" x2="296" y2="88" stroke="currentColor" strokeOpacity="0.25" />
      <Box x={28} y={30} w={112} h={44} label="Tutorial" sub="học — người mới" accent />
      <Box x={180} y={30} w={112} h={44} label="How-to" sub="làm — DEPLOY.md" />
      <Box x={28} y={102} w={112} h={44} label="Explanation" sub="hiểu — SECURITY.md" />
      <Box x={180} y={102} w={112} h={44} label="Reference" sub="tra cứu — schema" accent />
      <Label x={160} y={14} size={8.5} muted>thực hành ▲ / lý thuyết ▼</Label>
      <Label x={160} y={176} size={9} bold>Mỗi tài liệu phục vụ MỘT nhu cầu — đừng trộn</Label>
    </>
  ),
  "capstone-map": () => (
    <>
      <Box x={60} y={24} w={200} h={28} label="Nhịp bản mẫu (khoá)" accent />
      {["theo dõi","thả tim","trả lời lồng","hashtag","nhắc tên","thông báo"].map((f,i)=>(
        <g key={f}>
          <rect x={10+(i%3)*103} y={62+Math.floor(i/3)*26} width="96" height="20" rx="5" fill={ACCENT} fillOpacity="0.1" stroke={ACCENT} strokeOpacity="0.5" />
          <Label x={58+(i%3)*103} y={76+Math.floor(i/3)*26} size={8}>{f}</Label>
        </g>
      ))}
      <Box x={60} y={122} w={200} h={26} label="+ 5 tính năng & 3 trang CỦA BẠN" />
      <Arrow x1={160} y1={114} x2={160} y2={120} />
      <Label x={160} y={170} size={9} bold>Dự án hoàn tất = thêm dấu ấn riêng lên nền đã có</Label>
    </>
  ),
  "feature-lifecycle": () => (
    <>
      {[["1 Dữ liệu","bảng/cột"],["2 Model","SQL"],["3 Tuyến","controller"],["4 View","HTML"],["5 Bảo mật","CSRF·STRIDE"],["6 Tài liệu","README"]].map(([t,sub],i)=>(
        <g key={t}>
          <rect x={10+(i%3)*103} y={34+Math.floor(i/3)*54} width="96" height="42" rx="7" fill={ACCENT} fillOpacity={0.07+i*0.03} stroke={ACCENT} />
          <Label x={58+(i%3)*103} y={54+Math.floor(i/3)*54} size={9} bold>{t}</Label>
          <Label x={58+(i%3)*103} y={68+Math.floor(i/3)*54} size={8} muted>{sub}</Label>
        </g>
      ))}
      <Arrow x1={106} y1={55} x2={112} y2={55} />
      <Arrow x1={209} y1={55} x2={215} y2={55} />
      <Arrow x1={106} y1={109} x2={112} y2={109} />
      <Arrow x1={209} y1={109} x2={215} y2={109} />
      <Label x={160} y={170} size={9} muted>Bỏ bước nào là nợ kỹ thuật — làm đủ 6 cho MỘT tính năng</Label>
    </>
  ),
  "sql-mindmap": () => (
    <MindMap center="SQL" branches={[
      ["SELECT", "chọn cột"], ["WHERE", "lọc dòng"], ["GROUP BY", "gom, đếm"], ["JOIN", "nối bảng"],
      ["Thiết kế", "khoá, 3NF"], ["Ghi", "giao dịch"], ["Window", "xếp hạng"], ["Hiệu năng", "chỉ mục"],
    ]} />
  ),
  "data-mindmap": () => (
    <MindMap center="Dữ liệu" branches={[
      ["Sự kiện", "một đơn hàng"], ["Thông tin", "doanh thu hôm nay"], ["Cơ sở dữ liệu", "tập dữ liệu có tổ chức"],
      ["DBMS", "SQLite, PostgreSQL"], ["SQL", "ngôn ngữ để hỏi"],
    ]} />
  ),
  "notebook-to-table": () => (
    <>
      <rect x="10" y="22" width="120" height="130" rx="6" fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.35" />
      {["8h: 2 bạc xỉu, Lan", "8h05: 1 trà đào", "8h10: Minh 1 cà phê", "… viết tay, khó tìm"].map((t, i) => (
        <Label key={t} x={18} y={44 + i * 26} anchor="start" size={8.5} muted={i === 3}>{t}</Label>
      ))}
      <Arrow x1={134} y1={86} x2={168} y2={86} label="cấu trúc" />
      {["giờ", "món", "sl", "khách"].map((c, i) => (
        <g key={c}>
          <rect x={172 + i * 36} y="40" width="36" height="20" fill={ACCENT} fillOpacity="0.18" stroke={ACCENT} strokeOpacity="0.5" />
          <Label x={190 + i * 36} y={54} size={8.5} mono bold>{c}</Label>
        </g>
      ))}
      {[["8:00", "bạc xỉu", "2", "Lan"], ["8:05", "trà đào", "1", "NULL"], ["8:10", "cà phê", "1", "Minh"]].map((row, r) => row.map((v, i) => (
        <Label key={`${r}${i}`} x={190 + i * 36} y={76 + r * 22} size={8} mono>{v}</Label>
      )))}
      <Label x={160} y={170} size={9} muted>Cùng dữ liệu — nhưng bảng thì hỏi được, đếm được</Label>
    </>
  ),
  "dbms-layers": () => (
    <>
      <Box x={10} y={20} w={90} h={44} label="Ứng dụng" sub="app thu ngân" />
      <Box x={10} y={74} w={90} h={44} label="Bạn" sub="gõ SQL" />
      <Arrow x1={100} y1={42} x2={126} y2={72} label="SQL" />
      <Arrow x1={100} y1={96} x2={126} y2={88} />
      <Box x={128} y={50} w={88} h={64} label="DBMS" sub="SQLite" accent />
      <Arrow x1={216} y1={82} x2={238} y2={82} />
      <Box x={240} y={50} w={72} h={64} label="Tệp .db" sub="trên đĩa" />
      <Label x={160} y={150} size={9} muted>Bạn nói "cần gì" bằng SQL — DBMS lo "lấy thế nào"</Label>
    </>
  ),
  "relational-anatomy": () => (
    <>
      <Label x={20} y={18} anchor="start" mono bold size={10}>menu_items</Label>
      {["id", "name", "price"].map((c, i) => (
        <g key={c}>
          <rect x={20 + i * 93} y="26" width="93" height="22" fill={ACCENT} fillOpacity="0.18" stroke={ACCENT} strokeOpacity="0.5" />
          <Label x={66 + i * 93} y={41} mono bold size={9.5}>{c}</Label>
        </g>
      ))}
      {[["1", "Bạc xỉu", "29000"], ["2", "Trà đào", "35000"], ["3", "Cà phê đen", "25000"]].map((row, r) => row.map((v, i) => (
        <Label key={`${r}${i}`} x={66 + i * 93} y={66 + r * 22} mono size={9.5}>{v}</Label>
      )))}
      <rect x="20" y="74" width="279" height="20" fill="none" stroke={ACCENT} strokeWidth="2" rx="3" />
      <rect x="113" y="26" width="93" height="112" fill="none" stroke="currentColor" strokeDasharray="4 3" strokeOpacity="0.6" />
      <Label x={300} y={88} anchor="end" size={8.5} bold>← bộ (hàng)</Label>
      <Label x={160} y={152} size={8.5} bold>↑ thuộc tính (cột) · id = khoá chính</Label>
      <Label x={160} y={170} size={8.5} muted>Quan hệ = tập các bộ: không trùng, không thứ tự</Label>
    </>
  ),
  "select-mindmap": () => (
    <MindMap center="SELECT" branches={[
      ["Cột", "name, price"], ["*", "mọi cột"], ["AS", "bí danh"], ["DISTINCT", "bỏ trùng"], ["Biểu thức", "price * 2"], ["FROM", "bảng nguồn"],
    ]} />
  ),
  "types-mindmap": () => (
    <MindMap center="Kiểu" branches={[
      ["INTEGER", "số nguyên, tiền"], ["REAL", "số thực"], ["TEXT", "chữ, ngày ISO"], ["BLOB", "nhị phân"], ["NULL", "chưa biết"],
    ]} />
  ),
  "select-pipeline": () => (
    <>
      <Box x={8} y={60} w={86} h={56} label="FROM" sub="lấy bảng" />
      <Box x={117} y={60} w={86} h={56} label="SELECT" sub="chọn, tính cột" accent />
      <Box x={226} y={60} w={86} h={56} label="DISTINCT" sub="bỏ dòng trùng" />
      <Arrow x1={94} y1={88} x2={115} y2={88} />
      <Arrow x1={203} y1={88} x2={224} y2={88} />
      <Label x={160} y={150} size={9} muted>Viết SELECT trước, nhưng DBMS đọc FROM trước</Label>
    </>
  ),
  "where-filter": () => (
    <>
      {["Bạc xỉu 29k", "Trà đào 35k", "Cà phê 25k", "Matcha 45k", "Cold brew 39k"].map((t, i) => (
        <g key={t}>
          <rect x="10" y={18 + i * 28} width="96" height="22" rx="4" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.3" />
          <Label x={58} y={33 + i * 28} size={8.5}>{t}</Label>
        </g>
      ))}
      <Box x={128} y={64} w={70} h={44} label="WHERE" sub="price > 30000" accent />
      <Arrow x1={106} y1={86} x2={126} y2={86} />
      <Arrow x1={198} y1={86} x2={218} y2={86} />
      {["Trà đào 35k", "Matcha 45k", "Cold brew 39k"].map((t, i) => (
        <g key={t}>
          <rect x="220" y={46 + i * 28} width="92" height="22" rx="4" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
          <Label x={266} y={61 + i * 28} size={8.5}>{t}</Label>
        </g>
      ))}
      <Label x={160} y={170} size={9} muted>Mỗi dòng được hỏi một câu: đúng thì giữ, sai hoặc NULL thì bỏ</Label>
    </>
  ),
  "three-valued": () => (
    <>
      {[["AND", "TRUE", "FALSE", "NULL"], ["TRUE", "TRUE", "FALSE", "NULL"], ["FALSE", "FALSE", "FALSE", "FALSE"], ["NULL", "NULL", "FALSE", "NULL"]].map((row, r) => row.map((v, c) => (
        <g key={`${r}${c}`}>
          <rect x={20 + c * 70} y={14 + r * 34} width="70" height="34" fill={r === 0 || c === 0 ? ACCENT : "currentColor"} fillOpacity={r === 0 || c === 0 ? 0.16 : (v === "NULL" ? 0.1 : 0.03)} stroke="currentColor" strokeOpacity="0.25" />
          <Label x={55 + c * 70} y={35 + r * 34} size={9.5} mono bold={r === 0 || c === 0}>{v}</Label>
        </g>
      )))}
      <Label x={160} y={170} size={9} muted>WHERE chỉ giữ dòng TRUE — NULL bị bỏ như FALSE</Label>
    </>
  ),
  "order-limit": () => (
    <>
      <Box x={8} y={60} w={70} h={50} label="WHERE" sub="lọc" />
      <Box x={92} y={60} w={70} h={50} label="SELECT" sub="cột" />
      <Box x={176} y={60} w={70} h={50} label="ORDER BY" sub="sắp xếp" accent />
      <Box x={260} y={60} w={54} h={50} label="LIMIT" sub="cắt" accent />
      <Arrow x1={78} y1={85} x2={90} y2={85} />
      <Arrow x1={162} y1={85} x2={174} y2={85} />
      <Arrow x1={246} y1={85} x2={258} y2={85} />
      <Label x={160} y={40} size={9} bold>FROM → WHERE → SELECT → ORDER BY → LIMIT</Label>
      <Label x={160} y={150} size={9} muted>Vì ORDER BY chạy sau SELECT nên dùng được bí danh</Label>
    </>
  ),
  "case-flow": () => (
    <>
      <Box x={8} y={70} w={74} h={40} label="price" sub="mỗi dòng" />
      <Box x={110} y={14} w={96} h={36} label="< 30000 ?" sub="WHEN" accent />
      <Box x={110} y={72} w={96} h={36} label="< 40000 ?" sub="WHEN" accent />
      <Box x={110} y={130} w={96} h={36} label="còn lại" sub="ELSE" />
      <Box x={236} y={14} w={76} h={36} label="'rẻ'" mono />
      <Box x={236} y={72} w={76} h={36} label="'vừa'" mono />
      <Box x={236} y={130} w={76} h={36} label="'cao'" mono />
      <Arrow x1={82} y1={84} x2={108} y2={34} />
      <Arrow x1={82} y1={90} x2={108} y2={90} />
      <Arrow x1={82} y1={96} x2={108} y2={146} />
      <Arrow x1={206} y1={32} x2={234} y2={32} label="đúng" />
      <Arrow x1={206} y1={90} x2={234} y2={90} label="đúng" />
      <Arrow x1={206} y1={148} x2={234} y2={148} />
    </>
  ),
  "filter-mindmap": () => (
    <MindMap center="WHERE" branches={[
      ["So sánh", "= <> < >"], ["Logic", "AND OR NOT"], ["Tập", "IN, BETWEEN"], ["Chuỗi", "LIKE, GLOB"], ["NULL", "IS NULL"], ["Sắp xếp", "ORDER BY"], ["CASE", "phân loại"],
    ]} />
  ),
  "group-mindmap": () => (
    <MindMap center="Gom" branches={[
      ["COUNT", "đếm"], ["SUM", "cộng"], ["GROUP BY", "theo nhóm"], ["HAVING", "lọc nhóm"], ["JOIN", "nối bảng"], ["Truy vấn con", "IN, EXISTS"], ["UNION", "ghép tập"],
    ]} />
  ),
  "group-by": () => (
    <>
      {[["coffee", "Bạc xỉu"], ["coffee", "Cà phê"], ["coffee", "Cold brew"], ["tea", "Trà đào"], ["tea", "Matcha"], ["food", "Bánh mì"]].map(([c, n], i) => (
        <g key={n}>
          <rect x="10" y={14 + i * 25} width="120" height="21" rx="4" fill={ACCENT} fillOpacity={c === "coffee" ? 0.25 : c === "tea" ? 0.12 : 0.04} stroke="currentColor" strokeOpacity="0.3" />
          <Label x={70} y={28 + i * 25} size={8.5} mono>{`${c} · ${n}`}</Label>
        </g>
      ))}
      <Arrow x1={132} y1={44} x2={196} y2={44} />
      <Arrow x1={132} y1={102} x2={196} y2={86} />
      <Arrow x1={132} y1={139} x2={196} y2={128} />
      {[["coffee", "3"], ["tea", "2"], ["food", "1"]].map(([c, n], i) => (
        <g key={c}>
          <rect x="198" y={32 + i * 42} width="114" height="26" rx="6" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
          <Label x={255} y={49 + i * 42} size={9} mono bold>{`${c} · COUNT = ${n}`}</Label>
        </g>
      ))}
      <Label x={160} y={172} size={8.5} muted>GROUP BY gộp nhiều dòng thành MỘT dòng mỗi nhóm</Label>
    </>
  ),
  "join-types": () => (
    <>
      {[["INNER", 0], ["LEFT", 1], ["FULL", 2]].map(([name, k], i) => {
        const cx = 55 + i * 105;
        return (
          <g key={name}>
            <circle cx={cx - 13} cy="80" r="30" fill={k >= 1 ? ACCENT : "none"} fillOpacity="0.25" stroke="currentColor" strokeOpacity="0.5" />
            <circle cx={cx + 13} cy="80" r="30" fill={k === 2 ? ACCENT : "none"} fillOpacity="0.25" stroke="currentColor" strokeOpacity="0.5" />
            <path d={`M${cx} 56 A30 30 0 0 1 ${cx} 104 A30 30 0 0 1 ${cx} 56`} fill={ACCENT} fillOpacity="0.55" />
            <Label x={cx} y={135} size={10} bold mono>{name} JOIN</Label>
          </g>
        );
      })}
      <Label x={160} y={30} size={9} muted>trái = orders · phải = customers</Label>
      <Label x={160} y={165} size={8.5} muted>Phần tô = các dòng có trong kết quả</Label>
    </>
  ),
  "design-mindmap": () => (
    <MindMap center="Thiết kế" branches={[
      ["ERD", "thực thể"], ["PK", "khoá chính"], ["FK", "khoá ngoại"], ["Ràng buộc", "CHECK, UNIQUE"], ["1NF", "nguyên tử"], ["2NF", "đủ khoá"], ["3NF", "không bắc cầu"], ["n–n", "bảng nối"],
    ]} />
  ),
  "erd-hat": () => (
    <>
      <Box x={6} y={10} w={92} h={40} label="customers" mono />
      <Box x={6} y={70} w={92} h={40} label="orders" mono accent />
      <Box x={6} y={130} w={92} h={40} label="branches" mono />
      <Box x={130} y={70} w={92} h={40} label="order_items" mono accent />
      <Box x={130} y={10} w={92} h={40} label="menu_items" mono />
      <Box x={244} y={10} w={70} h={40} label="categories" mono />
      <Box x={244} y={130} w={70} h={40} label="tags" mono />
      <Box x={130} y={130} w={92} h={40} label="item_tags" mono />
      <Arrow x1={52} y1={68} x2={52} y2={52} />
      <Arrow x1={52} y1={112} x2={52} y2={128} />
      <Arrow x1={128} y1={90} x2={100} y2={90} />
      <Arrow x1={176} y1={68} x2={176} y2={52} />
      <Arrow x1={224} y1={30} x2={242} y2={30} />
      <Arrow x1={176} y1={128} x2={176} y2={112} dashed />
      <Arrow x1={224} y1={150} x2={242} y2={150} />
    </>
  ),
  "normal-forms": () => (
    <>
      <Box x={8} y={20} w={96} h={60} label="1NF" sub="mỗi ô một giá trị" />
      <Box x={112} y={20} w={96} h={60} label="2NF" sub="phụ thuộc đủ khoá" />
      <Box x={216} y={20} w={96} h={60} label="3NF" sub="không phụ thuộc bắc cầu" accent />
      <Arrow x1={104} y1={50} x2={110} y2={50} />
      <Arrow x1={208} y1={50} x2={214} y2={50} />
      <Label x={160} y={110} size={9.5} bold>"Mọi cột phụ thuộc vào khoá, cả khoá,</Label>
      <Label x={160} y={126} size={9.5} bold>và không gì khác ngoài khoá"</Label>
      <Label x={160} y={150} size={8.5} muted>— câu nhớ của Bill Kent (1983)</Label>
    </>
  ),
  "write-mindmap": () => (
    <MindMap center="Ghi" branches={[
      ["INSERT", "thêm"], ["UPDATE", "sửa"], ["DELETE", "xoá"], ["UPSERT", "thêm-hoặc-sửa"], ["BEGIN", "giao dịch"], ["VIEW", "bảng ảo"], ["TRIGGER", "tự động"], ["?", "tham số"],
    ]} />
  ),
  "acid": () => (
    <>
      {[["A", "Atomicity", "tất cả hoặc không gì"], ["C", "Consistency", "luôn thoả ràng buộc"], ["I", "Isolation", "không thấy việc dở"], ["D", "Durability", "đã COMMIT là còn"]].map(([k, name, sub], i) => (
        <g key={k}>
          <circle cx={40 + i * 80} cy="60" r="26" fill={ACCENT} fillOpacity="0.2" stroke={ACCENT} strokeWidth="2" />
          <Label x={40 + i * 80} y={67} size={20} bold>{k}</Label>
          <Label x={40 + i * 80} y={108} size={9} bold>{name}</Label>
          <Label x={40 + i * 80} y={122} size={7.5} muted>{sub}</Label>
        </g>
      ))}
      <Label x={160} y={160} size={8.5} muted>Härder & Reuter (1983)</Label>
    </>
  ),
  "window-mindmap": () => (
    <MindMap center="Cửa sổ" branches={[
      ["WITH", "CTE"], ["Đệ quy", "cây, chuỗi ngày"], ["ROW_NUMBER", "đánh số"], ["RANK", "xếp hạng"], ["LAG/LEAD", "dòng trước/sau"], ["SUM OVER", "luỹ kế"], ["Khung", "ROWS/RANGE"],
    ]} />
  ),
  "window-frame": () => (
    <>
      {["01/10", "02/10", "03/10", "04/10", "05/10", "06/10"].map((d, i) => (
        <g key={d}>
          <rect x={14 + i * 50} y="60" width="44" height="40" rx="5" fill={ACCENT} fillOpacity={i >= 2 && i <= 4 ? 0.3 : 0.05} stroke="currentColor" strokeOpacity="0.35" />
          <Label x={36 + i * 50} y={84} size={9} mono>{d}</Label>
        </g>
      ))}
      <rect x="112" y="54" width="146" height="52" rx="8" fill="none" stroke={ACCENT} strokeWidth="2.2" />
      <Label x={185} y={44} size={8.5} bold>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</Label>
      <Arrow x1={236} y1={120} x2={236} y2={104} />
      <Label x={236} y={134} size={8.5}>dòng hiện tại</Label>
      <Label x={160} y={165} size={8.5} muted>Mỗi dòng giữ nguyên — chỉ tính thêm trên khung trượt</Label>
    </>
  ),
  "perf-mindmap": () => (
    <MindMap center="Nhanh" branches={[
      ["B-tree", "cây cân bằng"], ["EXPLAIN", "kế hoạch"], ["Phủ", "covering"], ["Một phần", "WHERE"], ["JSON", "->>"], ["FTS", "MATCH"],
    ]} />
  ),
  "btree": () => (
    <>
      <Box x={120} y={10} w={80} h={30} label="30000" mono accent />
      <Box x={30} y={70} w={80} h={30} label="20000 · 25000" mono />
      <Box x={210} y={70} w={80} h={30} label="35000 · 45000" mono />
      <Arrow x1={140} y1={40} x2={80} y2={68} label="<" />
      <Arrow x1={180} y1={40} x2={240} y2={68} label="≥" />
      {["Bánh mì", "Cà phê", "Bạc xỉu"].map((t, i) => <Label key={t} x={40 + i * 30} y={122 + (i % 2) * 12} size={7.5} muted>{t}</Label>)}
      {["Trà đào", "Cold brew", "Matcha"].map((t, i) => <Label key={t} x={220 + i * 32} y={122 + (i % 2) * 12} size={7.5} muted>{t}</Label>)}
      <Label x={160} y={165} size={8.5} muted>Tìm giá = 35000: 2 bước thay vì đọc cả bảng — log n</Label>
    </>
  ),
  "capstone-sql": () => (
    <MindMap center="Hạt" branches={[
      ["Doanh thu", "ngày, tuần"], ["Món", "top, ABC"], ["Khách", "RFM"], ["Cohort", "quay lại"], ["Giờ cao điểm", "strftime"], ["Xu hướng", "LAG, MA7"],
    ]} />
  ),
  "relational-mindmap": () => (
    <MindMap center="Quan hệ" branches={[
      ["Bảng", "quan hệ"], ["Cột", "thuộc tính"], ["Hàng", "bộ"], ["Khoá", "chính · ngoại"], ["Miền", "kiểu + CHECK"],
    ]} />
  ),
  "fk-link": () => (
    <>
      <Label x={70} y={16} mono bold size={9.5}>order_items</Label>
      {[["order_id", "item_id", "qty"], ["7", "2", "1"], ["7", "3", "2"]].map((row, r) => row.map((v, i) => (
        <Label key={`a${r}${i}`} x={22 + i * 46} y={36 + r * 22} mono size={8.5} bold={r === 0}>{v}</Label>
      )))}
      <rect x="54" y="48" width="38" height="18" rx="3" fill="none" stroke={ACCENT} strokeWidth="2" />
      <Label x={250} y={16} mono bold size={9.5}>menu_items</Label>
      {[["id", "name", "price"], ["1", "Bạc xỉu", "29000"], ["2", "Trà đào", "35000"], ["3", "Cà phê", "25000"]].map((row, r) => row.map((v, i) => (
        <Label key={`b${r}${i}`} x={196 + i * 50} y={36 + r * 22} mono size={8.5} bold={r === 0}>{v}</Label>
      )))}
      <rect x="182" y="70" width="134" height="18" rx="3" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
      <Arrow x1={94} y1={57} x2={180} y2={78} label="khoá ngoại → khoá chính" />
      <Label x={160} y={150} size={9} muted>Tên và giá chỉ lưu một chỗ — order_items chỉ giữ con số 2</Label>
    </>
  ),
  "hat-schema": () => (
    <>
      <Box x={8} y={20} w={92} h={50} label="customers" sub="id · name · phone" mono />
      <Box x={8} y={110} w={92} h={50} label="orders" sub="id · customer_id · at" mono accent />
      <Box x={150} y={110} w={110} h={50} label="order_items" sub="order_id · item_id · qty" mono accent />
      <Box x={150} y={20} w={110} h={50} label="menu_items" sub="id · name · price" mono />
      <Arrow x1={54} y1={108} x2={54} y2={72} label="1 – n" />
      <Arrow x1={148} y1={135} x2={102} y2={135} label="n – 1" />
      <Arrow x1={205} y1={108} x2={205} y2={72} label="n – 1" />
      <Label x={290} y={90} size={8.5} muted>mũi tên:</Label>
      <Label x={290} y={102} size={8.5} muted>FK → PK</Label>
    </>
  ),

  // ——— Python cơ bản, chặng 6–8 (py26–py40) ———
  "py-function-machine": () => (
    <>
      <Box x={8} y={62} w={62} h={44} label="8.5" sub="đối số" mono />
      <Arrow x1={70} y1={84} x2={98} y2={84} />
      <rect x={100} y={40} width={120} height={88} rx={12} fill={ACCENT} fillOpacity="0.14" stroke={ACCENT} strokeWidth="1.6" />
      <Label x={160} y={58} mono bold size={10}>def xep_loai(diem):</Label>
      <Label x={112} y={78} anchor="start" mono size={8.5} muted>if diem &gt;= 8:</Label>
      <Label x={124} y={92} anchor="start" mono size={8.5} muted>return "Giỏi"</Label>
      <Label x={112} y={112} anchor="start" mono size={8.5} muted>return "Khá" …</Label>
      <Arrow x1={220} y1={84} x2={248} y2={84} label="return" />
      <Box x={250} y={62} w={62} h={44} label={'"Giỏi"'} sub="giá trị trả về" mono accent />
      <Label x={160} y={152} muted>Tham số nhận dữ liệu vào · return trao kết quả về nơi gọi</Label>
      <Label x={160} y={168} muted size={9}>print chỉ hiện lên màn hình, nơi gọi không nhận được gì</Label>
    </>
  ),
  "py-scope": () => (
    <>
      <rect x={8} y={8} width={304} height={150} rx={10} fill="currentColor" fillOpacity="0.04" stroke="currentColor" strokeOpacity="0.35" />
      <Label x={18} y={24} anchor="start" bold size={10}>Toàn cục (cả tệp)</Label>
      <Label x={18} y={40} anchor="start" mono size={9}>diem_lop = 9.8</Label>
      <rect x={120} y={32} width={180} height={112} rx={10} fill={ACCENT} fillOpacity="0.12" stroke={ACCENT} strokeWidth="1.5" />
      <Label x={210} y={48} bold size={10}>Cục bộ: cong_thuong()</Label>
      <Label x={210} y={70} mono size={9}>diem = 9.8  (tham số)</Label>
      <Label x={210} y={86} mono size={9}>thuong = 0.5  (mặc định)</Label>
      <Label x={210} y={102} mono size={9}>ket_qua = 10</Label>
      <Label x={210} y={130} size={8.5} muted>biến mất khi hàm kết thúc</Label>
      <Arrow x1={60} y1={60} x2={118} y2={70} label="truyền vào" />
      <Arrow x1={130} y1={110} x2={70} y2={128} label="return" />
      <Label x={60} y={140} mono size={9} bold>10</Label>
      <Label x={160} y={174} muted size={9}>Bên ngoài không thấy được biến cục bộ của hàm</Label>
    </>
  ),
  "py-call-tree": () => (
    <>
      <Box x={120} y={6} w={80} h={26} label="main()" mono />
      <Arrow x1={160} y1={32} x2={160} y2={50} />
      <Box x={110} y={52} w={100} h={26} label="bao_cao(ds)" mono accent />
      <Arrow x1={140} y1={78} x2={70} y2={104} label="1" />
      <Arrow x1={180} y1={78} x2={250} y2={104} label="2" />
      <Box x={14} y={106} w={112} h={34} label="trung_binh(ds)" sub="trả 7.0" mono />
      <Box x={194} y={106} w={112} h={34} label="xep_loai(7.0)" sub={'trả "Đạt"'} mono />
      <Label x={160} y={162} muted>Hàm lớn gọi hàm nhỏ · mỗi hàm một việc, thử riêng được</Label>
    </>
  ),
  "py-module-import": () => (
    <>
      <Box x={8} y={12} w={120} h={58} label="statistics" sub="mean · median · …" mono />
      <Box x={8} y={94} w={120} h={58} label="math" sub="sqrt · ceil · pi · …" mono />
      <rect x={180} y={26} width={132} height={112} rx={10} fill={ACCENT} fillOpacity="0.12" stroke={ACCENT} strokeWidth="1.5" />
      <Label x={246} y={44} bold mono size={10}>so_lop.py</Label>
      <Label x={190} y={66} anchor="start" mono size={8.5}>import statistics</Label>
      <Label x={190} y={82} anchor="start" mono size={8.5}>from math import sqrt</Label>
      <Label x={190} y={106} anchor="start" mono size={8.5}>statistics.mean(ds)</Label>
      <Label x={190} y={122} anchor="start" mono size={8.5}>sqrt(81)</Label>
      <Arrow x1={128} y1={41} x2={178} y2={62} label="import" />
      <Arrow x1={128} y1={123} x2={178} y2={80} label="from…import" />
      <Label x={160} y={172} muted size={9}>Module = tệp .py chứa hàm dùng lại · không cần chép code</Label>
    </>
  ),
  "py-grade-pipeline": () => (
    <>
      <Box x={4} y={50} w={68} h={40} label="Nhập" sub="điểm, hệ số" />
      <Arrow x1={72} y1={70} x2={84} y2={70} />
      <polygon points="122,46 160,70 122,94 84,70" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
      <Label x={122} y={73} size={8.5} bold>hợp lệ?</Label>
      <Arrow x1={122} y1={94} x2={122} y2={128} label="không" />
      <Box x={82} y={130} w={80} h={26} label="Dữ liệu sai" />
      <Arrow x1={160} y1={70} x2={172} y2={70} />
      <Box x={174} y={50} w={64} h={40} label="trung_binh" sub="có trọng số" mono />
      <Arrow x1={238} y1={70} x2={250} y2={70} />
      <Box x={252} y={50} w={64} h={40} label="xep_loai" sub="Giỏi/Khá/…" mono accent />
      <Arrow x1={284} y1={90} x2={284} y2={128} />
      <Box x={234} y={130} w={82} h={26} label="bao_cao" mono />
      <Label x={160} y={22} muted>Mỗi quy tắc nằm ở đúng một hàm — một nguồn sự thật</Label>
    </>
  ),
  "py-try-flow": () => (
    <>
      <Box x={110} y={4} w={100} h={26} label="try: float(s)" mono accent />
      <Arrow x1={160} y1={30} x2={160} y2={44} />
      <polygon points="160,46 206,66 160,86 114,66" fill={ACCENT} fillOpacity="0.16" stroke={ACCENT} />
      <Label x={160} y={69} size={9} bold>có lỗi?</Label>
      <Arrow x1={114} y1={66} x2={78} y2={66} label="có" />
      <Box x={4} y={52} w={72} h={30} label="except" sub="ValueError" mono />
      <Arrow x1={206} y1={66} x2={242} y2={66} label="không" />
      <Box x={244} y={52} w={72} h={30} label="else" sub="dùng kết quả" mono />
      <Arrow x1={40} y1={82} x2={130} y2={124} />
      <Arrow x1={280} y1={82} x2={190} y2={124} />
      <Box x={110} y={124} w={100} h={28} label="finally" sub="luôn chạy" mono />
      <Label x={160} y={172} muted size={9}>Chương trình không sập — lỗi được giải thích rồi đi tiếp</Label>
    </>
  ),
  "py-file-modes": () => (
    <>
      {[["r", "đọc", ["An: 8.5", "Bình: 7.0"], null], ["w", "ghi mới", ["Chi: 9"], "nội dung cũ bị xoá!"], ["a", "nối thêm", ["An: 8.5", "Bình: 7.0", "Chi: 9"], null]].map(([mode, name, lines, warn], i) => (
        <g key={mode}>
          <rect x={10 + i * 104} y={30} width="92" height="100" rx="6" fill="currentColor" fillOpacity="0.05" stroke={i === 1 ? ACCENT : "currentColor"} strokeOpacity={i === 1 ? 1 : 0.35} />
          <Label x={56 + i * 104} y={20} bold mono size={11}>{`"${mode}" · ${name}`}</Label>
          {lines.map((line, j) => (
            <Label key={line} x={18 + i * 104} y={52 + j * 16} anchor="start" mono size={8.5}
              bold={(i === 2 && j === 2) || i === 1}>{line}</Label>
          ))}
          {warn && <Label x={56 + i * 104} y={122} size={8} muted>{warn}</Label>}
          {i === 2 && <Label x={56 + i * 104} y={122} size={8} muted>dòng mới ở cuối</Label>}
          {i === 0 && <Label x={56 + i * 104} y={122} size={8} muted>tệp phải tồn tại</Label>}
        </g>
      ))}
      <Label x={160} y={152} mono size={9}>with open(path, "a", encoding="utf-8") as f:</Label>
      <Label x={160} y={170} muted size={9}>with tự đóng tệp, kể cả khi có lỗi</Label>
    </>
  ),
  "py-csv-table": () => (
    <>
      <rect x={6} y={22} width={118} height={92} rx={6} fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.35" />
      <Label x={65} y={14} bold size={9}>Tệp diem.csv (văn bản)</Label>
      {["ma,ten,diem", "HS01,An,8.5", "HS02,Bình,7", "HS03,Chi,9"].map((line, i) => (
        <Label key={line} x={14} y={42 + i * 18} anchor="start" mono size={9} bold={i === 0}>{line}</Label>
      ))}
      <Arrow x1={126} y1={68} x2={150} y2={68} label="DictReader" />
      {["ma", "ten", "diem"].map((h, c) => (
        <g key={h}>
          <rect x={154 + c * 54} y={22} width="54" height="20" fill={ACCENT} fillOpacity="0.22" stroke={ACCENT} />
          <Label x={181 + c * 54} y={36} bold mono size={9}>{h}</Label>
          {[["HS01", "An", "8.5"], ["HS02", "Bình", "7"], ["HS03", "Chi", "9"]].map((row, r) => (
            <g key={row[0]}>
              <rect x={154 + c * 54} y={42 + r * 20} width="54" height="20" fill="none" stroke="currentColor" strokeOpacity="0.3" />
              <Label x={181 + c * 54} y={56 + r * 20} mono size={9}>{row[c]}</Label>
            </g>
          ))}
        </g>
      ))}
      <Label x={235} y={120} mono size={8.5}>{'row["diem"] == "8.5"'}</Label>
      <Label x={160} y={148} muted size={9}>Hàng đầu thành tên cột · mỗi dòng sau là một dict</Label>
      <Label x={160} y={166} muted size={9}>Mọi ô đều là xâu — nhớ float(row["diem"]) trước khi tính</Label>
    </>
  ),
  "py-comprehension": () => (
    <>
      <Label x={160} y={22} bold size={10}>Một dòng comprehension…</Label>
      {[["min(d+0.5, 10)", "biểu thức: giữ gì", 18], ["for d in diem", "dãy: lấy từ đâu", 122], ["if d >= 5", "lọc: điều kiện", 222]].map(([code, note, x], i) => (
        <g key={code}>
          <rect x={x} y={32} width={i === 0 ? 100 : 96} height="26" rx="5" fill={ACCENT} fillOpacity={0.1 + i * 0.08} stroke={ACCENT} />
          <Label x={x + (i === 0 ? 50 : 48)} y={49} mono bold size={9}>{code}</Label>
          <Label x={x + (i === 0 ? 50 : 48)} y={72} muted size={8.5}>{note}</Label>
        </g>
      ))}
      <Label x={10} y={38} anchor="start" mono bold size={12}>[</Label>
      <Label x={312} y={38} anchor="end" mono bold size={12}>]</Label>
      <Label x={160} y={98} bold size={10}>…bằng vòng lặp này:</Label>
      <Label x={80} y={118} anchor="start" mono size={9}>kq = []</Label>
      <Label x={80} y={132} anchor="start" mono size={9}>for d in diem:</Label>
      <Label x={98} y={146} anchor="start" mono size={9}>if d &gt;= 5:</Label>
      <Label x={116} y={160} anchor="start" mono size={9}>kq.append(min(d+0.5, 10))</Label>
    </>
  ),
  "py-data-pipeline": () => (
    <>
      {[["CSV thô", "văn bản"], ["parse", "csv.reader"], ["kiểm tra", "kiểu · miền · trùng"], ["dữ liệu sạch", "list tuple"], ["thống kê", "TB · đếm"], ["báo cáo", "+ giới hạn"]].map(([label, sub], i) => {
        const x = 6 + (i % 3) * 106;
        const y = i < 3 ? 22 : 104;
        return <Box key={label} x={x} y={y} w={94} h={40} label={label} sub={sub} accent={i === 2} />;
      })}
      <Arrow x1={100} y1={42} x2={110} y2={42} />
      <Arrow x1={206} y1={42} x2={216} y2={42} />
      <Arrow x1={260} y1={62} x2={60} y2={102} />
      <Arrow x1={100} y1={124} x2={110} y2={124} />
      <Arrow x1={206} y1={124} x2={216} y2={124} />
      <Label x={314} y={78} anchor="end" size={8.5} muted>dòng lỗi → đếm, ghi lại</Label>
      <Label x={160} y={170} muted size={9}>Kiểm ngay tại ranh giới · phần sau chỉ làm việc với dữ liệu sạch</Label>
    </>
  ),
  "py-class-objects": () => (
    <>
      <rect x={8} y={18} width={120} height={120} rx={8} fill={ACCENT} fillOpacity="0.12" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="5 3" />
      <Label x={68} y={36} bold mono size={10}>class HocSinh</Label>
      <Label x={68} y={50} muted size={8.5}>bản thiết kế</Label>
      <Label x={16} y={72} anchor="start" mono size={8.5}>ten</Label>
      <Label x={16} y={86} anchor="start" mono size={8.5}>diem</Label>
      <line x1={16} y1={94} x2={120} y2={94} stroke="currentColor" strokeOpacity="0.3" />
      <Label x={16} y={110} anchor="start" mono size={8.5}>trung_binh()</Label>
      <Label x={16} y={124} anchor="start" mono size={8.5}>xep_loai()</Label>
      {[["an", "An", "[8, 9, 7]", "8.0"], ["binh", "Bình", "[6, 7, 8]", "7.0"]].map(([name, ten, diem, tb], i) => (
        <g key={name}>
          <Arrow x1={128} y1={60 + i * 36} x2={178} y2={38 + i * 72} label={i ? "" : "tạo"} />
          <rect x={180} y={14 + i * 72} width={132} height={60} rx={8} fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.4" />
          <Label x={246} y={30 + i * 72} bold mono size={9.5}>{`${name} (object)`}</Label>
          <Label x={188} y={46 + i * 72} anchor="start" mono size={8.5}>{`ten = "${ten}"`}</Label>
          <Label x={188} y={60 + i * 72} anchor="start" mono size={7.5}>{`diem = ${diem} → TB ${tb}`}</Label>
        </g>
      ))}
      <Label x={160} y={166} muted size={9}>Một class · nhiều object · mỗi object giữ dữ liệu riêng</Label>
    </>
  ),
  "py-random-seed": () => (
    <>
      {[0, 1].map((run) => (
        <g key={run}>
          <Box x={6} y={22 + run * 62} w={76} h={40} label="seed(7)" sub={`lần chạy ${run + 1}`} mono accent />
          <Arrow x1={82} y1={42 + run * 62} x2={104} y2={42 + run * 62} />
          <Box x={106} y={22 + run * 62} w={70} h={40} label="bộ sinh" sub="giả ngẫu nhiên" />
          <Arrow x1={176} y1={42 + run * 62} x2={196} y2={42 + run * 62} />
          {[6, 2, 9, 4].map((n, i) => (
            <g key={i}>
              <rect x={198 + i * 29} y={28 + run * 62} width="25" height="28" rx="4" fill={ACCENT} fillOpacity="0.14" stroke={ACCENT} />
              <Label x={210.5 + i * 29} y={47 + run * 62} mono bold size={11}>{n}</Label>
            </g>
          ))}
        </g>
      ))}
      <Label x={160} y={150} muted size={9}>Cùng seed → cùng dãy số: dễ kiểm thử, dễ tái hiện lỗi</Label>
      <Label x={160} y={168} muted size={9}>Vì đoán trước được, mật khẩu/token phải dùng module secrets</Label>
    </>
  ),
  "py-binary-search": () => {
    const ds = [3, 7, 12, 18, 23, 31, 42];
    const rows = [[0, 6, 3], [4, 6, 5], [4, 4, 4]];
    return (
      <>
        <Label x={160} y={12} bold size={9.5}>Tìm 23 trong list đã sắp</Label>
        {rows.map(([l, r, m], row) => (
          <g key={row}>
            <Label x={14} y={40 + row * 46} anchor="start" size={8.5} muted>{`lượt ${row + 1}`}</Label>
            {ds.map((v, i) => {
              const out = i < l || i > r;
              return (
                <g key={i} opacity={out ? 0.25 : 1}>
                  <rect x={56 + i * 36} y={24 + row * 46} width="32" height="24" rx="4"
                    fill={i === m ? ACCENT : "currentColor"} fillOpacity={i === m ? 0.3 : 0.06}
                    stroke={i === m ? ACCENT : "currentColor"} strokeOpacity={i === m ? 1 : 0.35} />
                  <Label x={72 + i * 36} y={40 + row * 46} mono bold={i === m} size={10}>{v}</Label>
                </g>
              );
            })}
            <Label x={72 + m * 36} y={60 + row * 46} size={7.5} muted>{row === 2 ? "giữa = 23 ✓" : `giữa = ${ds[m]} < 23`}</Label>
          </g>
        ))}
        <Label x={160} y={170} muted size={9}>Mỗi lượt bỏ một nửa · 7 phần tử chỉ cần 3 lần so sánh</Label>
      </>
    );
  },
  "py-call-stack": () => (
    <>
      <Label x={90} y={14} bold size={9.5}>Gọi xuống ↓</Label>
      <Label x={250} y={14} bold size={9.5}>Trả lên ↑</Label>
      {[4, 3, 2, 1].map((n, i) => (
        <g key={n}>
          <rect x={14 + i * 4} y={22 + i * 32} width={162 - i * 8} height="26" rx="5"
            fill={ACCENT} fillOpacity={0.08 + i * 0.07} stroke={ACCENT} />
          <Label x={95} y={39 + i * 32} mono size={9} bold={n === 1}>{n === 1 ? "giai_thua(1) → 1 (cơ sở)" : `giai_thua(${n}) = ${n} × …`}</Label>
          <Label x={250} y={39 + i * 32} mono size={9}>{["4 × 6 = 24", "3 × 2 = 6", "2 × 1 = 2", "1"][i]}</Label>
          {i < 3 && <Arrow x1={250} y1={44 + (i + 1) * 32 - 18} x2={250} y2={44 + i * 32} />}
        </g>
      ))}
      <Label x={160} y={162} muted size={9}>Mỗi lời gọi là một khung trên ngăn xếp, chờ lời gọi con trả về</Label>
      <Label x={160} y={176} muted size={8.5}>Không có trường hợp cơ sở → RecursionError</Label>
    </>
  ),
  "py-solop-arch": () => (
    <>
      <Box x={4} y={24} w={70} h={40} label="input()" sub="HS01|8,9,7" mono />
      <Arrow x1={74} y1={44} x2={86} y2={44} />
      <Box x={88} y={24} w={70} h={40} label="doc_dong" sub="kiểm + parse" mono accent />
      <Arrow x1={158} y1={44} x2={170} y2={44} />
      <Box x={172} y={24} w={70} h={40} label="HocSinh" sub="list object" mono />
      <Arrow x1={242} y1={44} x2={254} y2={44} />
      <Box x={256} y={24} w={60} h={40} label="sort" sub="(-tb, ma)" mono />
      <Arrow x1={286} y1={64} x2={286} y2={92} />
      <Box x={226} y={94} w={90} h={40} label="in_bao_cao" sub="bảng + giới hạn" mono />
      <Arrow x1={123} y1={64} x2={123} y2={92} label="dòng lỗi" />
      <Box x={78} y={94} w={90} h={40} label="đếm lỗi" sub="mã trùng, ngoài 0..10" />
      <rect x={4} y={146} width={312} height={26} rx={6} fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="4 3" />
      <Label x={160} y={163} mono size={7.5}>assert: list rỗng · điểm 0/10 · dòng sai · mã trùng · bằng điểm</Label>
    </>
  ),
};

export default function CodingVisual({ name, label }) {
  const Draw = VISUALS[name];
  if (!Draw) return null;
  return (
    <figure className="coding-visual">
      <svg viewBox="0 0 320 180" role="img" aria-label={label || name}>
        <defs>
          <marker id="cv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={ACCENT} />
          </marker>
        </defs>
        <Draw />
      </svg>
    </figure>
  );
}
