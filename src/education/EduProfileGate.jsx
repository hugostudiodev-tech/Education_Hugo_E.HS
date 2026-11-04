import { useState } from "react";
import { notify } from "../lib/notify";
import { persona, PersonaAvatar } from "./EduPersona";
import { useEduText } from "./eduText";
import { playEduSound } from "./eduSound";
import { HOBBIES, MAX_HOBBIES, MIN_AGE, PROVINCES, SENSITIVE_GENDERS, profileDone } from "../../packages/persona/profile.js";

/**
 * Hỏi thông tin hồ sơ riêng tư — MỖI BƯỚC MỘT THÔNG TIN, chỉ hỏi những bước còn thiếu:
 *   ngày sinh (bắt buộc) → tỉnh/thành (bắt buộc) → sở thích (bỏ qua được) → giới tính (bỏ qua được).
 * Thành viên mới: ngay sau tạo nhân vật. Thành viên cũ: lần mở app tiếp theo.
 * Mỗi bước có dòng "Vì sao hỏi" (minh bạch mục đích — Luật BVDLCN 2025). Không công khai trên hồ sơ.
 */
const PROVINCE_NAMES = {
  "ha-noi": "Hà Nội", hue: "Huế", "lai-chau": "Lai Châu", "dien-bien": "Điện Biên", "son-la": "Sơn La", "lang-son": "Lạng Sơn", "quang-ninh": "Quảng Ninh",
  "thanh-hoa": "Thanh Hoá", "nghe-an": "Nghệ An", "ha-tinh": "Hà Tĩnh", "cao-bang": "Cao Bằng", "tuyen-quang": "Tuyên Quang", "lao-cai": "Lào Cai",
  "thai-nguyen": "Thái Nguyên", "phu-tho": "Phú Thọ", "bac-ninh": "Bắc Ninh", "hung-yen": "Hưng Yên", "hai-phong": "Hải Phòng", "ninh-binh": "Ninh Bình",
  "quang-tri": "Quảng Trị", "da-nang": "Đà Nẵng", "quang-ngai": "Quảng Ngãi", "gia-lai": "Gia Lai", "khanh-hoa": "Khánh Hoà", "lam-dong": "Lâm Đồng",
  "dak-lak": "Đắk Lắk", "ho-chi-minh": "TP. Hồ Chí Minh", "dong-nai": "Đồng Nai", "tay-ninh": "Tây Ninh", "can-tho": "Cần Thơ", "vinh-long": "Vĩnh Long",
  "dong-thap": "Đồng Tháp", "ca-mau": "Cà Mau", "an-giang": "An Giang",
};
// Icon đơn sắc Material Symbols (cùng bộ với cả app), không dùng emoji.
const HOBBY_ICON = {
  games: "sports_esports", esports: "emoji_events", anime: "animation", manga: "import_contacts", kpop: "mic_external_on", music: "headphones",
  singing: "mic", instrument: "piano", dance: "nightlife", football: "sports_soccer", basketball: "sports_basketball", badminton: "sports_tennis",
  gym: "fitness_center", swimming: "pool", cycling: "directions_bike", drawing: "palette", photo: "photo_camera", video: "movie",
  design: "design_services", reading: "auto_stories", writing: "edit_note", movies: "theaters", travel: "flight", cooking: "restaurant",
  coding: "code", robotics: "smart_toy", science: "science", pets: "pets", chess: "extension", languages: "translate",
};
// Lựa chọn giới tính vẽ bằng nhân vật pixel của Education Hugo (packages/persona/avatar.js).
const base = { eyes: "variant04", mouth: "happy01", glasses: "none", beard: "none", accessories: "none", skinColor: "#f5cfa0" };
const GENDER_AVATARS = {
  male: { ...base, hair: "short05", clothes: "variant01", hat: "none", hairColor: "#603a14", clothingColor: "#ffc425", backgroundColor: "#dbeafe" },
  female: { ...base, hair: "long03", clothes: "variant05", hat: "none", hairColor: "#cab188", clothingColor: "#ff6f69", backgroundColor: "#fde2e4" },
  other: { ...base, hair: "short12", clothes: "variant09", hat: "variant02", hairColor: "#7e57c2", clothingColor: "#44c585", backgroundColor: "#ede9fe" },
  lesbian: { ...base, hair: "long03", clothes: "variant05", hat: "none", hairColor: "#cab188", clothingColor: "#44c585", backgroundColor: "#dcfce7" },
  gay: { ...base, hair: "short05", clothes: "variant01", hat: "none", hairColor: "#603a14", clothingColor: "#f48fb1", backgroundColor: "#fde2e4" },
};
const CLEAR = "#00000000"; // nền trong suốt khi ghép hai nhân vật trên một khung
const clear = (a) => ({ ...a, backgroundColor: CLEAR });

/**
 * Ảnh trong vòng tròn giới tính:
 *  - lesbian: nữ áo/nền xanh lá · gay: nam áo/nền hồng
 *  - bisexual: nam + nữ chung một khung
 *  - transgender: hoạt cảnh lặp — nam nắm tay kéo bạn nữ ra, nữ thành nhân vật chính (nam chuyển giới nữ)
 */
function GenderArt({ kind, size, label }) {
  if (kind === "bisexual" || kind === "transgender") {
    return (
      <span className={`pg-duo is-${kind}`} style={{ width: size, height: size }} role="img" aria-label={label}>
        <span className="pg-duo-a"><PersonaAvatar avatar={clear(GENDER_AVATARS.male)} name="" size={size} /></span>
        <span className="pg-duo-b"><PersonaAvatar avatar={clear(GENDER_AVATARS.female)} name="" size={size} /></span>
        {kind === "transgender" && <i className="material-symbols-outlined pg-duo-hand" aria-hidden="true">handshake</i>}
      </span>
    );
  }
  return <PersonaAvatar avatar={GENDER_AVATARS[kind] || GENDER_AVATARS.other} name={label} size={size} />;
}

function missingSteps(p) {
  return [
    !p?.birthDate && "birth",
    !p?.province && "province",
    !Array.isArray(p?.hobbies) && "hobbies",
    !p?.gender && "gender",
  ].filter(Boolean);
}

export default function ProfileGate({ current, onDone }) {
  const { t } = useEduText();
  const [steps] = useState(() => missingSteps(current?.profile));
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [birth, setBirth] = useState("");
  const [province, setProvince] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [gender, setGender] = useState("");
  const [consent, setConsent] = useState(false);
  const otherFamily = gender === "other" || SENSITIVE_GENDERS.includes(gender);
  const sensitive = SENSITIVE_GENDERS.includes(gender);
  const step = steps[index];
  const optional = step === "hobbies" || step === "gender";
  const today = new Date();
  const maxBirth = new Date(Date.UTC(today.getFullYear() - MIN_AGE, today.getMonth(), today.getDate())).toISOString().slice(0, 10);

  const save = async (patch) => {
    setBusy(true);
    try {
      const saved = await persona.save({ profile: patch });
      if (index + 1 < steps.length && !profileDone(saved.profile)) { setIndex(index + 1); return; }
      playEduSound("success");
      notify.success(t("friends.pg.done"));
      onDone(saved);
    } catch (error) {
      const key = `friends.pg.err.${error.code}`;
      notify.error(t(key) === key ? t("persona.failed") : t(key));
    } finally { setBusy(false); }
  };
  const value = { birth: birth && { birthDate: birth }, province: province && { province }, hobbies: { hobbies }, gender: gender && (!sensitive || consent) && { gender, ...(sensitive ? { sensitiveConsent: true } : {}) } }[step];
  const skip = { hobbies: { hobbies: [] }, gender: { gender: "skip" } }[step];
  if (!step) return null;
  const toggleHobby = (h) => setHobbies((list) => (list.includes(h) ? list.filter((x) => x !== h) : list.length < MAX_HOBBIES ? [...list, h] : list));

  return (
    <div className="persona-gate" role="dialog" aria-modal="true" aria-labelledby="pg-title">
      <form className="persona-card pg-card" onSubmit={(e) => { e.preventDefault(); if (value) save(value); }}>
        <span className="pg-progress" aria-hidden="true"><i style={{ width: `${((index + 1) / steps.length) * 100}%` }} /></span>
        <small className="pg-count">{index + 1}/{steps.length}{optional ? ` · ${t("friends.pg.optional")}` : ""}</small>
        <h2 id="pg-title">{t(`friends.pg.${step}.title`)}</h2>
        <p>{t(`friends.pg.${step}.body`)}{step === "hobbies" && ` (${hobbies.length}/${MAX_HOBBIES})`}</p>

        {step === "birth" && (
          <div className="persona-nick">
            <input type="date" required value={birth} max={maxBirth} min="1926-01-01" onChange={(e) => setBirth(e.target.value)} aria-label={t("friends.pg.birth.title")} />
          </div>
        )}
        {step === "province" && (
          <div className="persona-nick">
            <select required value={province} onChange={(e) => setProvince(e.target.value)} aria-label={t("friends.pg.province.title")}>
              <option value="" disabled>{t("friends.pg.province.pick")}</option>
              {PROVINCES.map((code) => <option key={code} value={code}>{code === "abroad" ? t("friends.pg.province.abroad") : PROVINCE_NAMES[code]}</option>)}
            </select>
          </div>
        )}
        {step === "hobbies" && (
          <div className="persona-grid pg-chips pg-hobbies" role="group" aria-label={t("friends.pg.hobbies.title")}>
            {HOBBIES.map((h) => (
              <button key={h} type="button" aria-pressed={hobbies.includes(h)} className={hobbies.includes(h) ? "is-on" : ""} onClick={() => toggleHobby(h)}>
                <span className="material-symbols-outlined" aria-hidden="true">{HOBBY_ICON[h]}</span>{t(`friends.pg.hobbies.list.${h}`)}
              </button>
            ))}
          </div>
        )}
        {step === "gender" && (
          <div className="pg-gender" role="radiogroup" aria-label={t("friends.pg.gender.title")}>
            {["male", "female", "other"].map((g) => (
              <button key={g} type="button" role="radio" aria-checked={gender === g} className={gender === g || (g === "other" && otherFamily) ? "is-on" : ""} onClick={() => { setGender(g); setConsent(false); }}>
                <span className="pg-gender-art">
                  <GenderArt kind={g === "other" && SENSITIVE_GENDERS.includes(gender) ? gender : g} label={t(`friends.pg.gender.list.${g === "other" && otherFamily ? (gender === "other" ? "other" : gender) : g}`)} size={112} />
                  {(gender === g || (g === "other" && otherFamily)) && <i className="material-symbols-outlined" aria-hidden="true">check</i>}
                </span>
                <span>{t(`friends.pg.gender.list.${g}`)}</span>
              </button>
            ))}
            {otherFamily && (
              <div className="pg-sub" role="radiogroup" aria-label={t("friends.pg.gender.list.other")}>
                {["other", ...SENSITIVE_GENDERS].map((g) => (
                  <button key={g} type="button" role="radio" aria-checked={gender === g} className={gender === g ? "is-on" : ""} onClick={() => { setGender(g); setConsent(false); }}>
                    {t(`friends.pg.gender.list.${g === "other" ? "otherAll" : g}`)}
                  </button>
                ))}
                {sensitive && (
                  <label className="pg-consent">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                    <span>{t("friends.pg.gender.consent")}</span>
                  </label>
                )}
              </div>
            )}
            <button type="button" role="radio" aria-checked={gender === "private"} className={`pg-gender-private${gender === "private" ? " is-on" : ""}`} onClick={() => setGender("private")}>
              {gender === "private" && <span className="material-symbols-outlined" aria-hidden="true">check</span>}{t("friends.pg.gender.list.private")}
            </button>
          </div>
        )}

        <p className="pg-why"><span className="material-symbols-outlined" aria-hidden="true">info</span>{t(`friends.pg.${step}.why`)}</p>
        <div className="persona-actions">
          {optional && <button type="button" className="edu-btn edu-btn--ghost" disabled={busy} onClick={() => save(skip)}>{t("friends.pg.skip")}</button>}
          <button type="submit" className="edu-btn" disabled={busy || !value || (step === "hobbies" && !hobbies.length)}>{t("friends.pg.next")}</button>
        </div>
      </form>
    </div>
  );
}
