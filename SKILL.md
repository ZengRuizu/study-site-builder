---
name: study-site-builder
description: Turn a course's lecture slides into one interactive, bilingual (English/中文) single-file HTML study site with visual explanations, many exercise types, a mistake bank and a mock exam. Use when a student asks to make a review/study webpage from slides, notes or a syllabus for an exam.
---

# Study Site Builder

Build ONE self-contained HTML file (works offline, double-click to open, can be sent to classmates) that teaches a course from its slides and drills the student until the exam. The engine, build script, quality gate, a template course, an add-on for algorithm courses and a complete demo course live in this repository. You write **course content files**; the engine does navigation, language switching, quizzes, storage, glossary and the mock exam.

The demo course (`examples/demo-sorting/`, built page at `docs/index.html`) is the minimum quality bar. Before writing a new course, open its built page and read `paper.js` and one chapter file. A real course has more chapters and more custom visuals (see the widget ideas in `references/authoring.md`), but every chapter must be at least this good.

## 0. Get the engine

The skill needs the files next to this SKILL.md (`engine/`, `scripts/`, `templates/`, `examples/`). If you only have SKILL.md:
1. Look for a local folder named `study-site-builder`, or
2. Clone it: `git clone https://github.com/ZengRuizu/study-site-builder` (read only — never commit or push to it), or
3. Ask the student to attach the repository as a zip.
Do not rebuild the engine from scratch.

Tools needed: Python 3, Node (for `node --check`, optional), Playwright + Chromium for the quality gate (`pip install playwright && python3 -m playwright install chromium`). If Playwright cannot run, do the manual checklist in `references/quality.md`.

## 1. Ask before building (one round, short)

Ask only what changes the build. Typical set:
- Exam date/time and exact scope (which chapters/topics). Which question formats appear (MCQ, short answer, code tracing, writing code)? If unknown, cover all.
- Sources: slides only, or also past papers / lab sheets / tutorial answers?
- Language mode default: English, 中文, or both (all three are always available via the toggle).
- Delivery: chapter by chapter (default) or all at once; where to save (a subfolder of the course folder).
- Anything they already find hard.
If the student is not there to answer, take sensible defaults, write them at the top of your reply, and continue.

## 2. Read the slides properly

- Extract text AND look at every page as an image. Many slides are diagrams, code screenshots or tables with no text layer; text extraction alone misses them.
- Record **the lecturer's conventions** — they override textbooks: algorithm variants (e.g. selection sort moves the largest to the end), counting rules (e.g. "a loop from a to b runs b−a+1 times"), notation, naming, exact definitions and lists ("7 key issues"). Questions must follow them.
- Record **slide errors** (wrong output, code that would not compile, an algorithm that loops forever on duplicates). Teach the correct version and add a "⚠️ the slide says X; actually Y; in the exam, follow your lecturer" box.
- Record **assumed knowledge** — things the slides use without teaching (e.g. `typedef`, named constants, enum, echo input, coupling). Each becomes a collapsed refresher.
- Record **hard English words** (above IELTS ~6.0 academic words + course terms) for the glossary.
- Run every code example and every numeric answer (Node, Python, g++ — whatever is available). Never trust mental arithmetic for an answer key.
- **Past papers, if given, are the most valuable source.** Extract every question (pages with scrambled fonts or scans must be read as images), then build: (1) a **blueprint** — sections, marks, which topic sits in which slot each year, recurring MCQ themes; (2) the full papers as quizzes with **verified keys** (simulate the exact code printed in the paper; check your simulator against any partial answers the paper prints); (3) **answer-sheet drills** that copy the booklet’s layout (trace templates, pass tables, step tables, partition blocks) with random data; (4) a **mock in the real format**; (5) **marks per chapter** counted question by question → `SITE.course.focus` (effort %, hours, must/skip sections, past questions per chapter — see `references/authoring.md`). Flag broken questions and say how to answer them.

## 3. Plan, then build chapter by chapter

Per chapter: list sections (follow the slide order, merge tiny ones, split huge ones), for each section choose the visual/interactive treatment and the question groups. Share the plan in a few lines, then build. Deliver after each chapter so the student can start studying and redirect early.

Optional add-ons live in `addons/` (e.g. `addons/cs-algorithms/`: sorting visualizer, exact simulators, exam-layout answer sheets). List them first in the manifest `files` with a `../../addons/...` path relative to the course folder, as the demo does.

Files (copy `templates/course/` to `<course folder>/<Site>_src/` or similar):
```
manifest.json   title, brand, default lang, output name, ordered file list
course.js       SITE.course: id (storage namespace — never change later), chapters, plan, notes, credits, mock split
glossary.js     SITE.GLOSS: english → 中文
refreshers.js   SITE.RVX.*: collapsed background-knowledge boxes
decks.js        DECK.bucket / flash / cloze / judge: data for built-in practice widgets
ch1.js …        one file per chapter: SITE.chapter({...}), its custom widgets, SITE.bank('ch1', [...])
```
Build: `python3 scripts/build.py <course folder>` → `<course folder>/dist/<output>.html`.
API, widget catalog and question schema: `references/authoring.md`. Teaching and question design rules: `references/pedagogy.md`.

## 4. Non-negotiable requirements

1. **One HTML file**, inline CSS/JS, no CDN, no network. Opens from `file://` on phone and laptop. **The HTML alone is the whole site** — `src/` is only for editing; never make the page load anything from it. When delivering, say plainly: “share only the .html”. Previews that do not run JavaScript (chat apps, cloud-drive/file apps, e-mail) show the engine’s built-in `<noscript>` notice telling the reader to open it in Chrome/Safari.
2. **Bilingual everywhere**: every visible string is an [English, 中文] pair; the top-bar toggle switches EN / 中文 / 双语 instantly; each question also has its own translate button. Keep the lecturer's English terms visible in the Chinese text (e.g. "栈 (stack)").
3. **Chapter → Section navigation** with progress; a section can be marked done.
4. **Every concept section** = big idea → picture or hands-on widget → short notes in the lecturer's words → refresher if needed → a check-yourself quiz. Text-only sections are a defect. Abstract ideas (data-structure families, recursion, complexity, pointers, sorting) need a visual or an interaction, not more paragraphs.
5. **Varied interaction**: step players, simulators the student drives, predict-then-reveal, drag/sort into buckets, flashcards, code cloze, valid-or-error drills, tracing tables, random generators. Mix them; do not use only MCQs.
6. **Know-how, not just know-what**: for every syntax or algorithm the student must write, go up the ladder: anatomy (labelled parts) → fill the blanks → judge valid vs error → write it in a realistic task. Understanding what a feature is for is not the same as being able to write it.
7. **Every question has a "🤷 Don't know" button**. It reveals the explanation and counts as wrong, so the question enters the mistake bank. Never guess-to-pass.
8. **Explanations for every answer**, including why the tempting wrong option is wrong.
9. **Chapter test (`final` group) uses new variants** — new scenario, new numbers, new code — never word-for-word copies of section questions. The quality gate fails on copies.
10. **Random generators** for anything computable (traces, outputs, step counts, sort passes, Big-O of generated loops) so practice is unlimited.
11. **Mistake bank, mock exam (quick and full, timed, answers shown at the end), stats** — provided by the engine; make sure every built chapter has questions in the bank.
12. **Glossary**: every hard English word is underlined; tap → Chinese meaning, saved to the vocabulary list ("生词本").
13. **Refreshers are low-key**: collapsed by default, short, never in the way of the main path.
14. **Follow the lecturer**, flag slide errors, verify every answer by running code.
15. **Phone-friendly**: no horizontal scrolling at 375 px (wide tables and code scroll inside their own box).
16. **Progress is local and namespaced** (`course.id`), so several study sites on one computer do not overwrite each other.
17. **Past papers → blueprint, verified keys, same-format answer-sheet drills, a real-format mock, and an effort banner before every chapter** (how many hours, what is examined, what to skip — from counted marks). Tell the student honestly when a topic they worked on earned 0 marks in the papers.
18. **Progress that survives**: every question shows its own history (last results as dots, right/wrong counts, when) and a state — new / to review / mastered (last two attempts right); each quiz header counts the three states and offers “only not mastered”; practice widgets remember last and best score. Built into the engine — custom widgets with a score use `wRec(key, got, n)` + `wRecHTML(key)`.
19. **No content from later sections**: a section’s flashcards, sort-it games and quizzes only use what has been taught up to that point. Put mixed review decks at the end of the later chapter.
20. **Step-through controls never move away from the mouse**: use the engine’s `stepPlayer` (or wrap your own Next handler in `keepPos(button, fn)`), so content growing above the buttons does not push them down.
21. **Right/wrong must be readable without colour vision**: right = blue, wrong = red-orange (never green vs red), and every wrong mark also differs in shape — dashed thicker border, ✗ / line-through — so it is visible in any colour mode. The engine’s `--ok` / `--bad` variables and option/blank styles do this; custom widgets must use those variables and the same border styles.
22. **Hand-over to an AI tutor**: the page has a 🤖 “Hand over to AI” page (`#/ai`, linked in the sidebar, home and mistake bank) that copies one Markdown report: instructions for the AI, exam focus, progress per chapter and per question group, answer-sheet scores, and every not-mastered question with the correct answer and **what the student answered**. Nothing is uploaded. Engine built-in; set `SITE.course.ai` to replace the default instructions. When a student pastes such a report to you, analyse misconceptions from their wrong answers, weight by exam marks, and give an ordered plan plus a few new questions.
23. **Editable later**: content lives in small source files; anyone can change a question and rebuild.

## 5. Quality gate (every build)

```
python3 scripts/build.py <course folder>
python3 scripts/verify.py <course folder>/dist/<output>.html --shots /tmp/shots
```
`verify.py` must print `RESULT: PASS`. Then look at the screenshots of the sections you changed (desktop and phone) — a layout that passes the script can still be ugly or confusing. Fix WARN lines unless there is a reason. Also click through one quiz in each language mode. The manual checklist is in `references/quality.md`.

## 6. Deliver

- Put the built HTML where the student asked, plus the source folder next to it. Say how to rebuild.
- Tell the student in one or two lines what is new, what to do first, and any slide errors you found.
- Do not copy slide PDFs into any repository (copyright and size). Paraphrase slides; short code examples are fine.
- If the student asked for version control: give them the git commands (explain each command and option) and let them commit and push themselves, with their own identity. Do not add AI co-author trailers unless they ask.
