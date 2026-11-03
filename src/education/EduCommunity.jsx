import { useCallback, useEffect, useState } from "react";
import { notify } from "../lib/notify";
import { API_BASE } from "../config/apiBase";
import { useEduText } from "./eduText";
import AnimIcon from "../components/icons/animated/AnimIcon";
import { detectLang, translatePost } from "./postTranslate";
import EduStatus from "./EduStatus";
import { DeveloperPromo } from "./EduDeveloperTeam";

const API = `${API_BASE}/community/posts`;
const URL_RE = /https?:\/\/[^\s<>"')\]]+/g;
const LINK = { target: "_blank", rel: "noopener noreferrer nofollow" };

async function call(path, options = {}) {
  const response = await fetch(`${API}${path}`, { credentials: "include", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function linkPreview(raw) {
  let url;
  try { url = new URL(raw); } catch { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;
  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  if (host === "github.com" && parts.length >= 2) return { kind: "github", url: url.href, owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  const yt = host === "youtu.be" ? parts[0] : /(^|\.)youtube\.com$/.test(host) ? (url.searchParams.get("v") || (["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : null)) : null;
  if (yt && /^[\w-]{11}$/.test(yt)) return { kind: "youtube", url: url.href, id: yt };
  if (/\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url.pathname)) return { kind: "image", url: url.href };
  return { kind: "link", url: url.href, host, path: url.pathname === "/" ? "" : decodeURIComponent(url.pathname) };
}

function RichText({ text }) {
  const out = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    out.push(text.slice(last, match.index));
    out.push(<a key={match.index} href={match[0]} {...LINK}>{match[0]}</a>);
    last = match.index + match[0].length;
  }
  out.push(text.slice(last));
  return <p className="comm-text">{out}</p>;
}

function Preview({ link }) {
  const { t } = useEduText();
  const [play, setPlay] = useState(false);
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  if (link.kind === "github") return <a className="comm-card" href={link.url} {...LINK}><span className="comm-card-icon"><AnimIcon name="github" /></span><span><b>{link.owner}/{link.repo}</b><small>github.com · {t("community.repo")}</small></span></a>;
  if (link.kind === "youtube") return play ? (
    <div className="comm-media is-video"><iframe src={`https://www.youtube-nocookie.com/embed/${link.id}?autoplay=1`} title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /></div>
  ) : (
    <button type="button" className="comm-media is-video" onClick={() => setPlay(true)} aria-label={t("community.play")}><img src={`https://i.ytimg.com/vi/${link.id}/hqdefault.jpg`} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} /><span className="comm-play"><AnimIcon name="play" size={40} /></span></button>
  );
  if (link.kind === "image") return <a className="comm-media" href={link.url} {...LINK}><img src={link.url} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} /></a>;
  return <a className="comm-card" href={link.url} {...LINK}><span className="comm-card-icon"><AnimIcon name="link" /></span><span><b>{link.host}</b>{link.path && <small>{link.path}</small>}</span></a>;
}

function ago(date, lang) {
  const seconds = (new Date(date) - Date.now()) / 1000;
  const fmt = new Intl.RelativeTimeFormat(lang, { numeric: "auto", style: "short" });
  for (const [unit, size] of [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]]) {
    if (Math.abs(seconds) >= size) return fmt.format(Math.round(seconds / size), unit);
  }
  return fmt.format(0, "minute");
}

function useTranslation(post, lang) {
  const [state, setState] = useState({ from: null, text: null, original: false, busy: false });
  useEffect(() => {
    let alive = true;
    detectLang(post.text).then(async (from) => {
      if (!alive) return;
      setState((current) => ({ ...current, from }));
      if (!from || from === lang) return;
      setState((current) => ({ ...current, busy: true }));
      const text = await translatePost(post, from, lang);
      if (alive) setState((current) => ({ ...current, text, busy: false }));
    });
    return () => { alive = false; };
  }, [post.key, post.text, lang]);
  return [state, () => setState((current) => ({ ...current, original: !current.original }))];
}

function Ad({ post, onChange }) {
  const { t, lang } = useEduText();
  const [translation, toggleOriginal] = useTranslation(post, lang);
  const langName = (code) => t(`community.langs.${code}`) === `community.langs.${code}` ? code.toUpperCase() : t(`community.langs.${code}`);
  const shown = translation.text && !translation.original ? translation.text : post.text;
  const preview = linkPreview(post.text.match(URL_RE)?.[0]);
  const like = async () => {
    onChange({ ...post, liked: !post.liked, likeCount: post.likeCount + (post.liked ? -1 : 1) });
    try { onChange({ ...post, ...(await call(`/${post.key}/like`, { method: "POST" })) }); } catch { onChange(post); }
  };
  return (
    <article className="comm-post">
      <img className="comm-mascot" src={`/edu/${post.author?.mascot || "cast-1"}.svg`} alt="" width="44" height="44" />
      <div className="comm-post-main">
        <header><b>Education Hugo</b><span className="comm-admin">Admin</span><time dateTime={post.createdAt}>{ago(post.createdAt, lang)}</time>{translation.from && <span className="comm-lang">{langName(translation.from)}</span>}</header>
        {post.title && <h2 className="comm-title">{post.title}</h2>}
        <RichText text={shown} />
        {translation.busy && <small className="comm-tr is-busy">{t("community.translating")}</small>}
        {translation.text && <button type="button" className="comm-tr" onClick={toggleOriginal}><AnimIcon name="sparkles" size={16} />{translation.original ? t("community.showTranslation", { lang: langName(lang) }) : t("community.translatedFrom", { lang: langName(translation.from) })}</button>}
        {preview && <Preview link={preview} />}
        <footer><button type="button" className={post.liked ? "is-on" : ""} onClick={like} aria-pressed={post.liked} aria-label={t("community.like")}><AnimIcon name="heart" /><span>{post.likeCount || t("community.like")}</span></button></footer>
      </div>
    </article>
  );
}

export default function EduCommunity() {
  const { t } = useEduText();
  const [posts, setPosts] = useState(null);
  const [more, setMore] = useState(false);
  const load = useCallback(async (before) => {
    try {
      const data = await call(before ? `?before=${encodeURIComponent(before)}` : "");
      setPosts((current) => before ? [...(current || []), ...data.posts] : data.posts);
      setMore(data.more);
    } catch {
      setPosts((current) => current || []);
      notify.error(t("community.failed"));
    }
  }, [t]);
  useEffect(() => { load(); }, [load]);
  const update = (next) => setPosts((all) => all.map((post) => post.key === next.key ? next : post));
  return (
    <section className="edu-page comm">
      <header className="comm-hero"><div><h1 className="edu-page-title">{t("community.title")}</h1><p className="comm-lead">{t("community.lead")}</p></div><div className="comm-hero-cast" aria-hidden="true">{[2, 5, 7].map((n, i) => <img key={n} src={`/edu/cast-${n}.svg`} alt="" width="56" height="56" style={{ "--i": i }} />)}</div></header>
      <DeveloperPromo />
      {posts === null ? <EduStatus kind="loading" compact /> : posts.length === 0 ? <div className="comm-empty is-art"><img src="/edu/buddy-learn.svg" alt="" width="120" height="120" /><p>{t("community.empty")}</p></div> : posts.map((post) => <Ad key={post.key} post={post} onChange={update} />)}
      {more && <button type="button" className="edu-btn is-ghost comm-more" onClick={() => load(posts.at(-1).createdAt)}>{t("community.more")}</button>}
    </section>
  );
}
