import { OUTLINE, STEP_IDS } from "./stages.js";

const SOURCES = {
  python: ["Python Software Foundation", "Python documentation", "https://docs.python.org/3/"],
  csv: ["Python Software Foundation", "csv — CSV File Reading and Writing", "https://docs.python.org/3/library/csv.html"],
  pathlib: ["Python Software Foundation", "pathlib — Object-oriented filesystem paths", "https://docs.python.org/3/library/pathlib.html"],
  typing: ["Python Software Foundation", "typing — Support for type hints", "https://docs.python.org/3/library/typing.html"],
  dataclasses: ["Python Software Foundation", "dataclasses — Data Classes", "https://docs.python.org/3/library/dataclasses.html"],
  unittest: ["Python Software Foundation", "unittest — Unit testing framework", "https://docs.python.org/3/library/unittest.html"],
  logging: ["Python Software Foundation", "logging — Logging facility for Python", "https://docs.python.org/3/library/logging.html"],
  sqlite: ["Python Software Foundation", "sqlite3 — DB-API 2.0 interface", "https://docs.python.org/3/library/sqlite3.html"],
  sql: ["SQLite Consortium", "SQLite Documentation", "https://www.sqlite.org/docs.html"],
  env: ["Python Software Foundation", "os — Miscellaneous operating system interfaces", "https://docs.python.org/3/library/os.html"],
  fastapi: ["Sebastián Ramírez", "FastAPI Documentation", "https://fastapi.tiangolo.com/"],
  pydantic: ["Pydantic Team", "Pydantic Documentation", "https://docs.pydantic.dev/latest/"],
  http: ["Internet Engineering Task Force", "HTTP Semantics (RFC 9110)", "https://www.rfc-editor.org/rfc/rfc9110.html"],
  statistics: ["Python Software Foundation", "statistics — Mathematical statistics functions", "https://docs.python.org/3/library/statistics.html"],
  json: ["Python Software Foundation", "json — JSON encoder and decoder", "https://docs.python.org/3/library/json.html"],
  argparse: ["Python Software Foundation", "argparse — Parser for command-line options", "https://docs.python.org/3/library/argparse.html"],
};

const q = (question, options, why) => ({ q: question, o: options, a: 0, why });

const DISTRACTORS = [
  "Bỏ qua kiểm tra để chương trình chạy nhanh hơn.",
  "Suy ra nguyên nhân chỉ từ một biểu đồ hoặc một phép tính.",
  "Để dữ liệu đầu vào quyết định cấu trúc chương trình mà không cần quy tắc.",
];

const LAB_SQL_SETUP = `CREATE TABLE lab_studies (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE
);
INSERT INTO lab_studies VALUES (1, 'sleep-focus'), (2, 'screen-time');
CREATE TABLE lab_observations (
  id INTEGER PRIMARY KEY,
  study_id INTEGER NOT NULL REFERENCES lab_studies(id),
  participant_code TEXT NOT NULL,
  focus_score INTEGER NOT NULL CHECK(focus_score BETWEEN 0 AND 10),
  created_at TEXT NOT NULL
);
INSERT INTO lab_observations VALUES
  (1, 1, 'S01', 8, '2026-01-01'),
  (2, 1, 'S02', 6, '2026-01-02'),
  (3, 1, 'S03', 9, '2026-01-03'),
  (4, 2, 'S04', 7, '2026-01-04');`;

const SQL_EXAMPLES = {
  11: {
    setup: LAB_SQL_SETUP,
    query: "SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name LIKE 'lab_%';",
  },
  12: {
    setup: LAB_SQL_SETUP,
    query: "SELECT code FROM lab_studies WHERE code = 'sleep-focus';",
    solution: "SELECT code FROM lab_studies WHERE code = 'screen-time';",
    hints: ["Lọc theo cột code.", "Thay giá trị điều kiện bằng 'screen-time'."],
  },
  15: {
    setup: LAB_SQL_SETUP,
    query: "SELECT s.code, o.participant_code, o.focus_score\nFROM lab_studies AS s\nJOIN lab_observations AS o ON o.study_id = s.id\nORDER BY s.code, o.participant_code;",
  },
  16: {
    setup: LAB_SQL_SETUP,
    query: "SELECT s.code, COUNT(o.id) AS n, ROUND(AVG(o.focus_score), 2) AS mean_focus\nFROM lab_studies AS s\nLEFT JOIN lab_observations AS o ON o.study_id = s.id\nGROUP BY s.id, s.code\nORDER BY s.code;",
  },
  17: {
    setup: LAB_SQL_SETUP,
    query: "WITH ranked AS (\n  SELECT study_id, participant_code, focus_score,\n         ROW_NUMBER() OVER (PARTITION BY study_id ORDER BY focus_score DESC) AS position\n  FROM lab_observations\n)\nSELECT study_id, participant_code, focus_score, position\nFROM ranked\nORDER BY study_id, position;",
  },
  18: {
    setup: LAB_SQL_SETUP,
    query: "EXPLAIN QUERY PLAN\nSELECT participant_code, focus_score\nFROM lab_observations\nWHERE study_id = 1\nORDER BY created_at;",
  },
  19: {
    setup: LAB_SQL_SETUP,
    query: "PRAGMA integrity_check;\nSELECT COUNT(*) AS observations FROM lab_observations;",
  },
};

const LOCAL_GUIDES = {
  26: {
    heading: "Ví dụ framework chạy trên máy tính",
    file: "app/main.py",
    code: "from fastapi import FastAPI\n\napp = FastAPI(title='LabLog')\n\n@app.get('/health')\ndef health():\n    return {'status': 'ok'}",
    run: "python -m pip install fastapi uvicorn\nuvicorn app.main:app --reload",
    check: "Mở http://127.0.0.1:8000/health và /docs; endpoint phải trả JSON status=ok. Ô PyPlayground bên trên chỉ chạy Python thường, không khởi động server.",
  },
  27: {
    heading: "Ví dụ schema request chạy trên máy tính",
    file: "app/schemas.py",
    code: "from pydantic import BaseModel, Field\n\nclass ObservationIn(BaseModel):\n    participant_code: str\n    focus_score: int = Field(ge=0, le=10)",
    run: "python -m pip install fastapi",
    check: "Thử ObservationIn(participant_code='S01', focus_score=8), sau đó thử điểm 11 và chuỗi rỗng. Pydantic phải từ chối giá trị ngoài schema.",
  },
  28: {
    heading: "Ví dụ phân trang FastAPI",
    file: "app/main.py",
    code: "from fastapi import FastAPI, Query\n\napp = FastAPI()\n\n@app.get('/observations')\ndef list_observations(\n    limit: int = Query(default=20, ge=1, le=100),\n    offset: int = Query(default=0, ge=0),\n):\n    return {'items': [], 'limit': limit, 'offset': offset}",
    run: "uvicorn app.main:app --reload",
    check: "Gọi /observations?limit=5&offset=0 rồi thử limit=500; schema phải giới hạn request trong khoảng 1–100.",
  },
  29: {
    heading: "Ví dụ kiểm thử API",
    file: "tests/test_api.py",
    code: "from fastapi.testclient import TestClient\nfrom app.main import app\n\nclient = TestClient(app)\n\ndef test_health():\n    response = client.get('/health')\n    assert response.status_code == 200\n    assert response.json()['status'] == 'ok'",
    run: "python -m pip install 'fastapi[standard]' pytest\npython -m pytest -q",
    check: "Test gọi app trong tiến trình kiểm thử, không cần mở cổng công khai; dùng database tạm cho các test có ghi dữ liệu.",
  },
  35: {
    heading: "Chạy CLI LabLog trên máy tính",
    file: "lablog/cli.py",
    code: "import argparse\nfrom pathlib import Path\nimport csv\n\ndef build_parser():\n    parser = argparse.ArgumentParser(prog='lablog')\n    commands = parser.add_subparsers(dest='command', required=True)\n    import_data = commands.add_parser('import-data')\n    import_data.add_argument('--file', required=True)\n    import_data.add_argument('--study', required=True)\n    return parser\n\ndef main(argv=None):\n    args = build_parser().parse_args(argv)\n    path = Path(args.file)\n    if path.suffix.lower() != '.csv' or not path.is_file():\n        raise SystemExit('Cần cung cấp tệp CSV tồn tại.')\n    with path.open(newline='', encoding='utf-8') as source:\n        rows = list(csv.DictReader(source))\n    print(f'{args.study}: đọc {len(rows)} dòng')\n\nif __name__ == '__main__':\n    main()",
    run: "python -m lablog.cli import-data --file data/sample.csv --study sleep-focus",
    check: "Tạo data/sample.csv có dòng tiêu đề và ít nhất một dòng dữ liệu. Lệnh phải in số dòng; thử bỏ --study, đổi đuôi tệp và dùng đường dẫn không tồn tại để kiểm tra lỗi.",
  },
};

function quizFor(lesson, title) {
  const choices = (correct, alternatives) => [...new Set([correct, ...alternatives])].slice(0, 4);
  const common = [lesson.trap, lesson.apply, lesson.debug, ...DISTRACTORS];
  return [
    q(`${title}: phát biểu nào mô tả đúng mục đích chính?`, choices(lesson.fact, common), lesson.fact),
    q(`${title}: kết quả đúng cần được diễn giải như thế nào?`, choices(lesson.output, [lesson.wrongOutput, "Không in gì và không báo lỗi.", "Chương trình tự tạo dữ liệu thật."]), lesson.output),
    q(`Trong tình huống “${lesson.scenario}”, cách làm phù hợp là gì?`, choices(lesson.apply, [lesson.trap, lesson.debug, DISTRACTORS[0]]), lesson.apply),
    q(`Với ${title}, phát biểu sai nào cần được sửa?`, choices(lesson.trap, [lesson.fact, lesson.apply, lesson.verify]), `Không nên hiểu rằng: ${lesson.trap}`),
    q(`Cách kiểm tra nào phù hợp nhất cho ${title}?`, choices(lesson.verify, [lesson.trap, lesson.apply, lesson.wrongOutput]), lesson.verify),
    q(`Nếu gặp lỗi khi áp dụng ${title}, bước gỡ lỗi nào tốt nhất?`, choices(lesson.debug, [lesson.trap, lesson.output, lesson.wrongOutput]), lesson.debug),
    q(`Giới hạn nào cần nêu khi diễn giải kết quả của ${title}?`, choices(lesson.limit, [lesson.fact, lesson.apply, lesson.output]), lesson.limit),
    q(`Ca kiểm thử nào giúp xác nhận ${title} hoạt động đúng?`, choices(lesson.test, [lesson.trap, lesson.wrongOutput, lesson.apply]), lesson.test),
  ];
}

export function createStep(index, lesson) {
  const id = STEP_IDS[index];
  const title = OUTLINE[index][1];
  const [author, sourceTitle, url] = SOURCES[lesson.source] || SOURCES.python;
  const demo1 = lesson.demo1;
  const demo2 = lesson.demo2;
  const localGuide = LOCAL_GUIDES[index];
  const guidedSteps = lesson.guidedSteps || [
    {
      title: "Bước 1 — đọc và chạy ví dụ nền",
      code: demo1,
      body: `Trước khi bấm **Chạy**, đọc lần lượt từng dòng và dự đoán kết quả. Tập trung vào ý chính: ${lesson.fact}\n\nSau khi chạy, đối chiếu với mục tiêu: ${lesson.output}. Thử đổi một giá trị đầu vào rồi chạy lại để quan sát điều gì thay đổi.`,
    },
    {
      title: "Bước 2 — áp dụng vào tình huống LabLog",
      code: demo2,
      body: `Bài toán: ${lesson.scenario}\n\nChạy ví dụ, rồi tự sửa code để tiến gần hơn tới cách làm: ${lesson.apply}\n\n**Tự kiểm tra:** ${lesson.verify}\n\n**Nếu gặp lỗi:** ${lesson.debug}`,
    },
  ];
  return {
    id,
    lang: "python",
    file: `lablog/step-${index + 1}.py`,
    duration: "45 phút",
    summary: `${title}. ${lesson.fact}`,
    slides: [
      {
        section: "intro",
        title: `Mục tiêu: ${title}`,
        body: `**Một kiến thức trọng tâm:** ${lesson.fact}\n\nLabLog dùng dữ liệu hoàn toàn giả lập về giờ ngủ và điểm tập trung. Không dùng tên, email hay dữ liệu thật của học sinh.`,
      },
      {
        section: "visual",
        title: "Chuẩn bị trước khi code",
        body: `**Mục tiêu:** ${lesson.fact}\n\n**Bài toán LabLog:** ${lesson.scenario}\n\nBạn sẽ làm theo từng bước trong ô Python: đọc code, dự đoán kết quả, bấm **Chạy**, sau đó sửa một phần nhỏ và chạy lại. Có thể nhấn **Ctrl/⌘ + Enter** để chạy nhanh.`,
      },
      {
        section: "research",
        title: "Đọc tài liệu gốc",
        body: `Tài liệu chính thức giúp kiểm tra hành vi của công cụ; bài học diễn giải lại bằng ví dụ nhỏ, không thay thế tài liệu tham khảo.\n\n> ${author} (n.d.) *${sourceTitle}*. Available at: ${url}`,
      },
      {
        section: "ideate",
        title: "Đặt câu hỏi trước khi sửa code",
        body: `Tình huống: **${lesson.scenario}**\n\nThử dự đoán: đầu vào nào có thể làm cách làm trên thất bại? Ghi một ca biên trước khi chọn giải pháp.`,
      },
      ...guidedSteps.map((guidedStep, guidedIndex) => ({
        section: "core",
        title: guidedStep.title,
        body: `${guidedStep.body}\n\n**Cách học:** chạy code một lần chưa sửa; đọc kết quả; thay đổi một dòng; chạy lại và ghi nhận khác biệt.${localGuide && guidedIndex === guidedSteps.length - 1 ? `\n\n**Chạy dự án thật trên máy tính**\n\nTệp \`${localGuide.file}\`:\n\n~~~python\n${localGuide.code}\n~~~\n\nTrong terminal:\n\n~~~bash\n${localGuide.run}\n~~~\n\n**Kiểm tra:** ${localGuide.check}\n\nÔ Python bên trên chạy ví dụ độc lập; lệnh terminal mới chạy ứng dụng LabLog.` : ""}`,
        py: { code: guidedStep.code },
        ...(guidedIndex === guidedSteps.length - 1 && SQL_EXAMPLES[index] ? { sql: SQL_EXAMPLES[index] } : {}),
      })),
      {
        section: "apply",
        title: "Bước cuối — tự viết và kiểm tra",
        body: `**Bài làm:** ${lesson.practice}\n\nLàm theo thứ tự:\n\n1. Đọc yêu cầu và viết ra kết quả bạn mong đợi.\n2. Điền code vào ô bên dưới; dùng các ví dụ vừa chạy làm điểm bắt đầu.\n3. Bấm **Chạy**, đọc cả kết quả lẫn thông báo lỗi.\n4. Kiểm tra ca thử: ${lesson.test}\n5. Nếu chưa đúng, xem gợi ý rồi sửa từng lỗi một.\n\n**Gỡ lỗi:** ${lesson.debug}\n\n**Giới hạn cần nhớ:** ${lesson.limit}`,
        py: {
          code: lesson.starter || `# Bài tập: ${lesson.practice}\n# Viết lời giải của bạn bên dưới.`,
          solution: lesson.solution,
          hints: [lesson.fact, lesson.apply, lesson.verify],
        },
      },
    ],
    quiz: quizFor(lesson, title),
  };
}
