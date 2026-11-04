import { readCache, writeCache } from "../lib/offlineCache";
import { useEffect, useMemo, useState } from "react";
import { notify } from "../lib/notify";
import { API_BASE } from "../config/apiBase";
import { AVATAR_COLORS, AVATAR_PARTS, INTRO_MAX, NICKNAME_MAX, PersonaClient, checkIntro, checkNickname, randomAvatar } from "../../packages/persona";
import { useEduText } from "./eduText";
import { playEduSound } from "./eduSound";

export const persona = new PersonaClient({ baseUrl: API_BASE });

// DiceBear chỉ tải khi cần vẽ nhân vật (tách khỏi bundle chính).
let renderer = null;
const loadRenderer = () => (renderer ||= import("../../packages/persona/render.js"));

/** Ảnh nhân vật Persona; chưa có nhân vật thì hiện chữ cái đầu. */
export function PersonaAvatar({ avatar, name = "", size = 64, className = "" }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    if (!avatar) return undefined;
    let alive = true;
    loadRenderer().then(({ avatarDataUri }) => alive && setSrc(avatarDataUri(avatar, size * 2)));
    return () => { alive = false; };
  }, [avatar, size]);
  if (avatar && src) return <img src={src} alt="" width={size} height={size} className={`persona-avatar ${className}`} />;
  return <span className={`persona-avatar is-letter nick-font ${className}`} style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">{[...(name || "?")][0].toUpperCase()}</span>;
}

const TABS = [...Object.keys(AVATAR_PARTS), ...Object.keys(AVATAR_COLORS).map((c) => `${c}Color`)];

/** Trình tạo nhân vật: xem trước lớn, thẻ từng bộ phận, ô chọn vẽ sẵn bằng chính nhân vật. */
function AvatarEditor({ initial, onSave, onClose, busy }) {
  const { t } = useEduText();
  const [avatar, setAvatar] = useState(() => initial || randomAvatar());
  const [tab, setTab] = useState("hair");
  const options = AVATAR_PARTS[tab] || AVATAR_COLORS[tab.replace(/Color$/, "")];
  const isColor = !AVATAR_PARTS[tab];
  const set = (value) => { setAvatar((a) => ({ ...a, [tab]: value })); playEduSound("pop"); };

  return (
    <div className="persona-editor">
      <PersonaAvatar avatar={avatar} size={168} className="persona-preview" />
      <button type="button" className="persona-random" onClick={() => setAvatar(randomAvatar())}>
        <span className="material-symbols-outlined" aria-hidden="true">casino</span>{t("persona.random")}
      </button>
      <div className="persona-tabs" role="tablist">
        {TABS.map((key) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? "is-on" : ""} onClick={() => setTab(key)}>{t(`persona.parts.${key}`)}</button>
        ))}
      </div>
      <div className={`persona-grid${isColor ? " is-colors" : ""}`}>
        {options.map((value) => (
          <button key={value} type="button" aria-pressed={avatar[tab] === value} className={avatar[tab] === value ? "is-on" : ""} onClick={() => set(value)} title={value === "none" ? t("persona.none") : value}>
            {isColor ? <span className="persona-swatch" style={{ background: value }} />
              : value === "none" ? <span className="material-symbols-outlined" aria-hidden="true">block</span>
                : <PersonaAvatar avatar={{ ...avatar, [tab]: value }} size={56} />}
          </button>
        ))}
      </div>
      <div className="persona-actions">
        {onClose && <button type="button" className="edu-btn is-ghost" onClick={onClose}>{t("persona.close")}</button>}
        <button type="button" className="edu-btn" disabled={busy} onClick={() => onSave(avatar)}>{t("persona.done")}</button>
      </div>
      <small className="persona-credit">{t("persona.credit")}</small>
    </div>
  );
}

function NicknameStep({ initial, onSave, busy }) {
  const { t } = useEduText();
  const [value, setValue] = useState(initial || "");
  const checked = checkNickname(value);
  return (
    <form className="persona-nick" onSubmit={(e) => { e.preventDefault(); if (checked.ok) onSave(checked.value); }}>
      <input className="nick-font" value={value} onChange={(e) => setValue(e.target.value)} maxLength={NICKNAME_MAX * 4} placeholder={t("streak.social.nickPlaceholder")} aria-label={t("streak.social.nickLabel")} autoComplete="off" autoFocus />
      <small className={value && !checked.ok ? "is-error" : ""}>{value && !checked.ok ? t(`streak.social.${checked.code}`) : t("streak.social.nickHint")}</small>
      <button type="submit" className="edu-btn" disabled={busy || !checked.ok}>{t("persona.next")}</button>
    </form>
  );
}

/**
 * Màn bắt buộc sau đăng nhập, toàn màn, phải xong mới vào học: 1. biệt danh  2. nhân vật.
 * Đã có biệt danh thì vào thẳng bước nhân vật. `editOnly` = mở từ trang hồ sơ để sửa nhân vật.
 */
export function PersonaGate({ current, onDone, editOnly = false }) {
  const { t } = useEduText();
  const [stage, setStage] = useState(editOnly || current?.nickname ? "avatar" : "nickname");
  const [nickname, setNickname] = useState(current?.nickname || "");
  const [busy, setBusy] = useState(false);

  const save = async (patch, next) => {
    setBusy(true);
    try {
      const saved = await persona.save(patch);
      if (patch.nickname) setNickname(saved.nickname);
      if (next) setStage(next);
      else { notify.success(t("persona.saved")); playEduSound("success"); onDone(saved); }
    } catch (error) {
      const key = `streak.social.${error.code}`;
      notify.error(t(key) === key ? t("persona.failed") : t(key));
    } finally { setBusy(false); }
  };
  return (
    <div className="persona-gate" role="dialog" aria-modal="true" aria-labelledby="persona-title">
      <div className="persona-card">
        <h2 id="persona-title">{t(stage === "nickname" ? "persona.stepNick" : "persona.stepAvatar")}</h2>
        <p>{t(stage === "nickname" ? "persona.nickBody" : "persona.avatarBody")}</p>
        {stage === "nickname"
          ? <NicknameStep initial={nickname} busy={busy} onSave={(value) => save({ nickname: value }, "avatar")} />
          : <AvatarEditor initial={current?.avatar} busy={busy} onSave={(avatar) => save({ avatar })} onClose={editOnly ? () => onDone(null) : null} />}
        {stage === "avatar" && nickname && <b className="persona-name nick-font">{nickname}</b>}
      </div>
    </div>
  );
}

/** Tải Persona của người đang đăng nhập: null = đang tải, {complete:false} = phải qua cổng. */
export function usePersona(email) {
  const key = email ? `persona:${email}` : null;
  const [state, setState] = useState(() => readCache(key));
  useEffect(() => {
    if (!key) { setState(null); return undefined; }
    let alive = true;
    // Lỗi mạng: dùng bản lưu trên máy; chưa có thì đừng khoá người học ngoài cửa — coi như đủ, lần tải sau hỏi lại.
    persona.get().then((p) => alive && setState(p)).catch(() => alive && setState((s) => s || { complete: true, failed: true }));
    return () => { alive = false; };
  }, [key]);
  useEffect(() => { if (key && state && !state.failed) writeCache(key, state); }, [key, state]);
  return useMemo(() => [state, setState], [state]);
}

/** Sửa biệt danh + lời giới thiệu — CHỈ ở trang Hồ sơ (biệt danh không sửa ở nơi nào khác). */
export function PersonaInfoForm({ current, onSaved }) {
  const { t } = useEduText();
  const [nickname, setNickname] = useState(current?.nickname || "");
  const [intro, setIntro] = useState(current?.intro || "");
  const [busy, setBusy] = useState(false);
  const nick = checkNickname(nickname);
  const about = checkIntro(intro);
  const dirty = nickname !== (current?.nickname || "") || intro !== (current?.intro || "");
  const save = async (event) => {
    event.preventDefault();
    if (!nick.ok || !about.ok) return;
    setBusy(true);
    try {
      const saved = await persona.save({ nickname: nick.value, intro: about.value });
      notify.success(t("persona.saved"));
      onSaved(saved);
    } catch (error) {
      const key = `streak.social.${error.code}`;
      notify.error(t(key) === key ? t("persona.failed") : t(key));
    } finally { setBusy(false); }
  };
  return (
    <form className="persona-info" onSubmit={save}>
      <label>
        <span>{t("streak.social.nickLabel")}</span>
        <input className="nick-font" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={NICKNAME_MAX * 4} autoComplete="off" />
        <small className={nickname && !nick.ok ? "is-error" : ""}>{nickname && !nick.ok ? t(`streak.social.${nick.code}`) : t("streak.social.nickHint")}</small>
      </label>
      <label>
        <span>{t("persona.intro")}</span>
        <textarea value={intro} onChange={(e) => setIntro(e.target.value)} maxLength={INTRO_MAX + 20} rows={2} placeholder={t("persona.introPlaceholder")} />
        <small>{[...intro].length}/{INTRO_MAX}</small>
      </label>
      <button type="submit" className="edu-btn" disabled={busy || !dirty || !nick.ok || !about.ok}>{t("persona.saveInfo")}</button>
    </form>
  );
}
