// Khoá Python — cùng hình dạng với ../sql/index.js; ../index.js đăng ký nó cho API (?course=python).
import { OUTLINE, STEP_IDS } from "./stages.js";
import py1 from "./steps/py1.js";
import py2 from "./steps/py2.js";
import py3 from "./steps/py3.js";
import py4 from "./steps/py4.js";
import py5 from "./steps/py5.js";
import py6 from "./steps/py6.js";
import py7 from "./steps/py7.js";
import py8 from "./steps/py8.js";
import py9 from "./steps/py9.js";
import py10 from "./steps/py10.js";
import py11 from "./steps/py11.js";
import py12 from "./steps/py12.js";
import py13 from "./steps/py13.js";
import py14 from "./steps/py14.js";
import py15 from "./steps/py15.js";
import py16 from "./steps/py16.js";
import py17 from "./steps/py17.js";
import py18 from "./steps/py18.js";
import py19 from "./steps/py19.js";
import py20 from "./steps/py20.js";

export { STAGES, STEP_IDS, STEP_PASS_PERCENT, MAX_SLIDES } from "./stages.js";

const WRITTEN = new Map([py1, py2, py3, py4, py5, py6, py7, py8, py9, py10, py11, py12, py13, py14, py15, py16, py17, py18, py19, py20].map((step) => [step.id, step]));

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
