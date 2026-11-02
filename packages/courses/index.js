// Sổ đăng ký các khoá: id step không trùng giữa các khoá (step1… / sql1… / py1…), nên
// tra một step không cần biết trước nó thuộc khoá nào.
import * as coding from "./coding/index.js";
import * as sql from "./sql/index.js";
import * as python from "./python/index.js";
import * as pythonAdvanced from "./python-advanced/index.js";
import { localizeCourse as localizeCoding } from "./coding/localize.js";
import { localizeCourse as localizeSql } from "./sql/localize.js";
import { localizeCourse as localizePython } from "./python/localize.js";
import { localizeCourse as localizePythonAdvanced } from "./python-advanced/index.js";

export const COURSES = {
  coding: { ...coding, preview: 6, localize: localizeCoding },
  sql: { ...sql, preview: 5, getStageBenefits: null, localize: localizeSql },
  python: { ...python, preview: 5, getStageBenefits: null, localize: localizePython },
  "python-advanced": { ...pythonAdvanced, preview: 0, getStageBenefits: null, localize: localizePythonAdvanced },
};

export const ALL_STEPS = Object.values(COURSES).flatMap((c) => c.WEB_COURSES);

import { courseOfStep } from "./courseOfStep.js";
export { courseOfStep };

/** { key, course, step, index } hoặc null; index đếm trong khoá của nó. */
export function findStep(id) {
  const key = courseOfStep(id);
  const course = COURSES[key];
  const index = course.WEB_COURSES.findIndex((s) => s.id === id);
  return index < 0 ? null : { key, course, step: course.WEB_COURSES[index], index };
}
