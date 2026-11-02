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
import py21 from "./steps/py21.js";
import py22 from "./steps/py22.js";
import py23 from "./steps/py23.js";
import py24 from "./steps/py24.js";
import py25 from "./steps/py25.js";
import py26 from "./steps/py26.js";
import py27 from "./steps/py27.js";
import py28 from "./steps/py28.js";
import py29 from "./steps/py29.js";
import py30 from "./steps/py30.js";
import py31 from "./steps/py31.js";
import py32 from "./steps/py32.js";
import py33 from "./steps/py33.js";
import py34 from "./steps/py34.js";
import py35 from "./steps/py35.js";
import py36 from "./steps/py36.js";
import py37 from "./steps/py37.js";
import py38 from "./steps/py38.js";
import py39 from "./steps/py39.js";
import py40 from "./steps/py40.js";

import { STAGES as ALL_STAGES } from "./stages.js";
import { shuffleQuiz } from "../shuffleQuiz.js";

export { STEP_IDS, STEP_PASS_PERCENT, MAX_SLIDES } from "./stages.js";

const WRITTEN = new Map([py1, py2, py3, py4, py5, py6, py7, py8, py9, py10, py11, py12, py13, py14, py15, py16, py17, py18, py19, py20, py21, py22, py23, py24, py25, py26, py27, py28, py29, py30, py31, py32, py33, py34, py35, py36, py37, py38, py39, py40].map(shuffleQuiz).map((step) => [step.id, step]));

/** Cả 40 step theo đề cương; step chưa soạn mang `draft: true`. */
const OUTLINED = OUTLINE.map(([stage, title], index) => {
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

// Chỉ phát ra step đã soạn và chặng có bài: khoá soạn từ đầu tới cuối nên step đã soạn luôn
// là một đoạn đầu liền mạch, from/to của chặng vẫn đúng chỉ số.
export const WEB_COURSES = OUTLINED.filter((step) => !step.draft);
export const STAGES = ALL_STAGES.filter((stage) => WEB_COURSES.some((step) => step.stage === stage.id));
