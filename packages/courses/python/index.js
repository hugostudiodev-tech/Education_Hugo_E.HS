// Khoá Python — cùng hình dạng với ../sql/index.js; ../index.js đăng ký nó cho API (?course=python).
import { OUTLINE, STEP_IDS } from "./stages.js";
import py1 from "./steps/py1.js";
import py2 from "./steps/py2.js";
import py3 from "./steps/py3.js";
import py4 from "./steps/py4.js";
import py5 from "./steps/py5.js";

export { STAGES, STEP_IDS, STEP_PASS_PERCENT, MAX_SLIDES } from "./stages.js";

const WRITTEN = new Map([py1, py2, py3, py4, py5].map((step) => [step.id, step]));

/** 40 step của khoá Python, đúng thứ tự học. Step chưa soạn mang `draft: true`. */
export const WEB_COURSES = OUTLINE.map(([stage, title], index) => {
  const id = STEP_IDS[index];
  const content = WRITTEN.get(id);
  return {
    lang: "python",
    file: "",
    duration: "",
    ...content,
    id,
    stage,
    title: `${index + 1}. ${title}`,
    practiceType: "slides",
    ...(content ? {} : { draft: true, slides: [], quiz: [] }),
  };
});
