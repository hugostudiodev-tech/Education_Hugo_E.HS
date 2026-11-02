import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/apiBase";
import { useEduText } from "./eduText";
import { playEduSound } from "./eduSound";

/**
 * Hugo Developer — thẻ quảng cáo trong Hồ sơ (kiểu thẻ "Super") + trang /developer-team.
 * Đăng ký một lần: nút khoá ngay khi bấm, máy chủ upsert theo email (POST /api/developer/signup),
 * admin xem ở tab "Hugo Developer". Chương trình phi lợi nhuận, không lương — nói thẳng, nói đẹp.
 * ponytail: chữ để tại chỗ (vi/en/zh) vì chỉ hai màn này dùng.
 */
const COPY = {
  vi: {
    badge: "HUGO DEVELOPER",
    promoTitle: "Cùng xây sản phẩm thật",
    promoBody: "Học, làm và chia sẻ cùng đội Hugo Developer — có mentor kèm 1 tháng.",
    promoCta: "Tìm hiểu",
    heroTitle: "Hugo Developer",
    heroBody: "Học cùng nhau, làm dự án thật và chia sẻ kiến thức cùng Education Hugo Studio.",
    perks: [
      ["school", "Học và chia sẻ", "Cùng học, cùng hỏi, cùng giảng lại cho nhau. Kiến thức bạn chia sẻ sẽ giúp những bạn đến sau."],
      ["rocket_launch", "Dự án thật, kiến thức mới", "Tiếp cận công nghệ mới qua chính các dự án phi lợi nhuận của Hugo Studio — sản phẩm có người dùng thật."],
      ["diversity_3", "Mentor đồng hành 1 tháng", "Một mentor kèm bạn trong 30 ngày đầu, hoàn toàn miễn phí: định hướng, review code, gỡ rối."],
      ["volunteer_activism", "Phi lợi nhuận, từ trái tim", "Chương trình không trả lương và cũng không thu phí. Thứ bạn nhận về là kinh nghiệm, sản phẩm để khoe và những người bạn cùng chí hướng."],
    ],
    howTitle: "Tham gia thế nào?",
    how: ["Bấm Đăng ký bên dưới (chỉ một lần).", "Hội đồng Hugo Studio xem danh sách và xây chương trình cho đợt đầu.", "Chúng mình liên hệ bạn qua email tài khoản Education Hugo."],
    signup: "Đăng ký tham gia",
    sending: "Đang gửi…",
    done: "Đã đăng ký — chờ thư của chúng mình nhé!",
    failed: "Chưa gửi được, thử lại sau nhé.",
    back: "Quay lại",
  },
  en: {
    badge: "HUGO DEVELOPER",
    promoTitle: "Build real products together",
    promoBody: "Learn, build and share with the Hugo Developer team — with a mentor for a month.",
    promoCta: "Learn more",
    heroTitle: "Hugo Developer",
    heroBody: "Learn together, work on real projects and share knowledge with Education Hugo Studio.",
    perks: [
      ["school", "Learn and share", "Learn, ask and teach each other. What you share helps the learners who come after you."],
      ["rocket_launch", "Real projects, fresh skills", "Pick up new technology through Hugo Studio's own non-profit projects — products with real users."],
      ["diversity_3", "A mentor for one month", "A mentor walks with you for your first 30 days, completely free: direction, code review, unblocking."],
      ["volunteer_activism", "Non-profit, from the heart", "The programme pays no salary and charges no fee. You leave with experience, work to show and friends who share your goals."],
    ],
    howTitle: "How to join",
    how: ["Tap Sign up below (just once).", "The Hugo Studio board reviews the list and shapes the first cohort.", "We'll reach you at your Education Hugo account email."],
    signup: "Sign up",
    sending: "Sending…",
    done: "You're signed up — watch your inbox!",
    failed: "Couldn't send, please try again later.",
    back: "Back",
  },
  zh: {
    badge: "HUGO DEVELOPER",
    promoTitle: "一起打造真实产品",
    promoBody: "与 Hugo Developer 团队一起学习、实践和分享——还有导师陪伴一个月。",
    promoCta: "了解更多",
    heroTitle: "Hugo Developer",
    heroBody: "与 Education Hugo Studio 一起学习、参与真实项目并分享知识。",
    perks: [
      ["school", "学习与分享", "一起学、一起问、互相讲解。你分享的知识会帮助后来的同学。"],
      ["rocket_launch", "真实项目，新鲜知识", "通过 Hugo Studio 自己的非营利项目接触新技术——这些产品有真实用户。"],
      ["diversity_3", "导师陪伴一个月", "前 30 天由一位导师陪伴，完全免费：方向指导、代码审查、答疑解惑。"],
      ["volunteer_activism", "非营利，发自内心", "本项目不发工资，也不收费用。你收获的是经验、可展示的作品和志同道合的朋友。"],
    ],
    howTitle: "如何加入",
    how: ["点击下方“报名”（只需一次）。", "Hugo Studio 委员会审阅名单并设计首期项目。", "我们会通过你的 Education Hugo 账户邮箱联系你。"],
    signup: "报名参加",
    sending: "发送中…",
    done: "已报名——请留意邮箱！",
    failed: "发送失败，请稍后再试。",
    back: "返回",
  },
};
const useCopy = () => COPY[useEduText().lang] || COPY.vi;

/** Mascot nhún nhảy so le — mỗi con lệch pha một nhịp. */
function Dancers({ ids = [1, 3, 5, 6], size = 72 }) {
  return (
    <div className="edu-dev-dancers" aria-hidden="true">
      {ids.map((n, i) => <img key={n} src={`/edu/cast-${n}.svg`} alt="" width={size} height={size} style={{ "--i": i }} />)}
    </div>
  );
}

/** Thẻ quảng cáo trong Hồ sơ. */
export function DeveloperPromo() {
  const c = useCopy();
  return (
    <Link to="/developer-team" className="edu-dev-promo">
      <div className="edu-dev-art">
        <img src="/edu/dev-rocket.svg" alt="" width="800" height="520" />
        <span className="edu-dev-badge">{c.badge}</span>
      </div>
      <div className="edu-dev-promo-body">
        <b>{c.promoTitle}</b>
        <p>{c.promoBody}</p>
        <span className="edu-dev-link">{c.promoCta}</span>
      </div>
    </Link>
  );
}

export default function EduDeveloperTeam() {
  const c = useCopy();
  const navigate = useNavigate();
  const [state, setState] = useState("loading"); // loading · open · sending · done · error
  useEffect(() => {
    fetch(`${API_BASE}/developer`, { credentials: "include" })
      .then((r) => r.json()).then((d) => setState(d.signedUp ? "done" : "open")).catch(() => setState("open"));
  }, []);
  const signUp = async () => {
    setState("sending"); // khoá nút ngay từ cú bấm đầu
    try {
      const r = await fetch(`${API_BASE}/developer/signup`, { method: "POST", credentials: "include" });
      if (!r.ok) throw new Error();
      playEduSound("coin");
      setState("done");
    } catch {
      setState("error");
    }
  };
  const locked = state !== "open" && state !== "error";

  return (
    <section className="edu-page edu-dev">
      <button type="button" className="edu-icon-btn" onClick={() => navigate(-1)} aria-label={c.back}>
        <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
      </button>
      <div className="edu-dev-hero">
        <div className="edu-dev-art">
          <img src="/edu/dev-rocket.svg" alt="" width="800" height="520" />
          <span className="edu-dev-badge">{c.badge}</span>
        </div>
        <Dancers ids={[3, 6, 1, 8, 5]} size={84} />
        <h1>{c.heroTitle}</h1>
        <p>{c.heroBody}</p>
      </div>
      <ul className="edu-dev-perks">
        {c.perks.map(([icon, title, body]) => (
          <li key={icon}>
            <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
            <div><b>{title}</b><p>{body}</p></div>
          </li>
        ))}
      </ul>
      <h2 className="edu-subhead">{c.howTitle}</h2>
      <ol className="edu-dev-how">{c.how.map((step) => <li key={step}>{step}</li>)}</ol>
      <button type="button" className="edu-btn edu-dev-signup" disabled={locked} onClick={signUp}>
        {state === "done" ? c.done : state === "sending" ? c.sending : c.signup}
      </button>
      {state === "error" && <p role="alert" className="edu-dev-error">{c.failed}</p>}
    </section>
  );
}
