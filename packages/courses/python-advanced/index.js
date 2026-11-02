import { OUTLINE, STEP_IDS } from "./stages.js";
import step1 from "./steps/step1.js";
import step2 from "./steps/step2.js";
import step3 from "./steps/step3.js";
import step4 from "./steps/step4.js";
import step5 from "./steps/step5.js";
import step6 from "./steps/step6.js";
import step7 from "./steps/step7.js";
import step8 from "./steps/step8.js";
import step9 from "./steps/step9.js";
import step10 from "./steps/step10.js";
import step11 from "./steps/step11.js";
import step12 from "./steps/step12.js";
import step13 from "./steps/step13.js";
import step14 from "./steps/step14.js";
import step15 from "./steps/step15.js";
import step16 from "./steps/step16.js";
import step17 from "./steps/step17.js";
import step18 from "./steps/step18.js";
import step19 from "./steps/step19.js";
import step20 from "./steps/step20.js";
import step21 from "./steps/step21.js";
import step22 from "./steps/step22.js";
import step23 from "./steps/step23.js";
import step24 from "./steps/step24.js";
import step25 from "./steps/step25.js";
import step26 from "./steps/step26.js";
import step27 from "./steps/step27.js";
import step28 from "./steps/step28.js";
import step29 from "./steps/step29.js";
import step30 from "./steps/step30.js";
import step31 from "./steps/step31.js";
import step32 from "./steps/step32.js";
import step33 from "./steps/step33.js";
import step34 from "./steps/step34.js";
import step35 from "./steps/step35.js";
import step36 from "./steps/step36.js";
import step37 from "./steps/step37.js";
import step38 from "./steps/step38.js";
import step39 from "./steps/step39.js";
import step40 from "./steps/step40.js";

export { STAGES, STEP_IDS, STEP_PASS_PERCENT, MAX_SLIDES } from "./stages.js";

const WRITTEN = new Map([
  step1, step2, step3, step4, step5, step6, step7, step8, step9, step10,
  step11, step12, step13, step14, step15, step16, step17, step18, step19, step20,
  step21, step22, step23, step24, step25, step26, step27, step28, step29, step30,
  step31, step32, step33, step34, step35, step36, step37, step38, step39, step40,
].map((step) => [step.id, step]));

export const WEB_COURSES = OUTLINE.map(([stage, title], index) => ({
  lang: "python",
  file: "",
  duration: "",
  ...WRITTEN.get(STEP_IDS[index]),
  id: STEP_IDS[index],
  stage,
  title: `${index + 1}. ${title}`,
  practiceType: "slides",
}));

export const localizeCourse = (course) => course;
