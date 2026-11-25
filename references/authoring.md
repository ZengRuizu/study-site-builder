# Authoring reference — API, widgets, questions

All course files are plain JavaScript run in order (manifest `files`) inside one page, after `engine/engine.js` and before `engine/boot.js`. `SITE` is the global; `DSA` is a backward-compatible alias of `SITE`.

## Text helpers (all bilingual)

| Helper | Output |
|---|---|
| `T(en, zh)` | text; shows en / zh / both depending on the mode. In 双语 mode, text over ~40 characters (or with block markup) gets class `blk`: the Chinese starts on its own line with a side bar, so the reader can find it at a glance. Short labels and headings stay inline. |
| `P(en, zh)` | paragraph |
| `L([[en, zh], …], ordered?)` | list; an item can also be raw HTML |
| `BOX(kind, en, zh)` | callout; kind = `note` · `tip` · `warn` (common mistake) · `exam` (exam focus) |
| `K('code')` | inline code |
| ``C`…` `` | highlighted code block (raw string — no escaping needed; indentation is removed) |
| `RV(en, zh, html)` | collapsed refresher ("Refresher: …" / "知识回顾：…") |
| `W(name, arg)` | mount a widget (arg is any JSON value) |
| `QZ(ch, groups, [titleEn, titleZh])` | mount a quiz with the questions of chapter `ch` whose `g` is in `groups` (comma-separated string) |
| `<div class="big-idea"><span class="ico">🔑</span><div>${T(…)}</div></div>` | the one-line key idea at the top of a section |
| `<div class="grid2">…</div>` / `grid3` | side-by-side cards (stack on phones) |
| `<table class="t">` | table (scrolls inside itself on phones) |

Utilities: `$`, `$$`, `esc`, `shuffle`, `rint(a, b)`, `distinctInts(n, lo, hi)`, `codeHTML(raw)`, `highlightLines(pre, [lineNos])`, `LS.get/set` (namespaced storage).

## Chapters

```js
SITE.chapter({ id: 'ch1', num: 'Ch1', t: ['Title', '标题'], sections: [
  { id: 's1', t: ['Section title', '小节标题'], html: () => `…template string using the helpers…` },
]});
```
- `html` is a function, evaluated at render time (so the language mode and widgets are fresh).
- Chapter ids must match `SITE.course.chapters`. A chapter listed in the course but not built shows as "coming soon".
- Route: `#/ch1/s1`. Built-in routes: `#/` home, `#/mistakes`, `#/mock`, `#/vocab`, `#/ai`, `#/save` (💾 Save & load).

## Widgets

A widget is `SITE.widgets.name = (el, arg) => { … }`. Write state → `draw()` that rebuilds `el.innerHTML` → attach handlers. Every label through `T()`. Must work at 375 px (use `flex-wrap`, `.grid2`, SVG with `viewBox` and `width:100%`). A widget that throws shows a red "Widget error" box and fails the quality gate.

CSS classes ready to use inside widgets: `.w` (frame), `.wt` (title), `.row` (button row), `.btn` `.btn.sm` `.btn.pri`, `.in` (input), `.boxes > .box` (array cells; `.a` active, `.ok`, `.bad`, `.dim`), `.msg` (status line), `.pill`, `.mono`.

### Built into the engine (data in `decks.js`)

| Widget | Use it for | Data |
|---|---|---|
| `bucketGame` | classify items into 2–4 groups (linear vs non-linear, valid vs invalid, O(n) vs O(n²)) | `DECK.bucket.id = {t, buckets:[[en,zh]…], items:[[en,zh,bucketIndex,[noteEn,noteZh]?]…], code?}` |
| `flashcards` | definitions, lists the lecturer wants word-for-word | `DECK.flash.id = {t, cards:[[frontEn,frontZh,backEn,backZh]…]}` |
| `codeCloze` | learning to WRITE syntax: blanks inside real code | `DECK.cloze.id = {t, given?, code: String.raw\`… ⟦answer¦alternative⟧ …\`, note?}` — `given` = everything the exam question shows before the code (usage example, file contents, expected output). **A blank must never require a name the student cannot see.** |
| `judgeDrill` | "valid or compile error?" with the reason | `DECK.judge.id = {t, labels?, items:[[code, 1/0, whyEn, whyZh]…]}` |
| `stepPlayer(el, steps, drawStep, {speed})` | a function (not a widget) for any step-by-step animation with ⏮ ◀ ▶ ⏵ ⏭ controls | `drawStep(step, index)` redraws |

AI hand-over: `#/ai` builds a Markdown report from the stored history (`aiReport()`). Optional `SITE.course.ai = '…'` replaces the default instructions to the AI. Give widget records a readable name: `wRec(key, got, total, label)`.

Progress helpers: question history and mastery are automatic (`stats[id] = {c, w, h, t}`, mastered = last two right). For a widget with a score call `wRec('my:' + id, got, total)` when it is checked and put `wRecHTML('my:' + id)` next to the score. For any Next/Step button that changes content above it, wrap the update in `keepPos(button, () => …)`.

SVG helpers for diagrams: `svT(x,y,en,zh,attrs)` bilingual text, `svDefs(id,color)` arrow marker, `svEdge(a,b,r,markerId,color,width)`, `svNode(p,label,fill,stroke,r)`, `svBadge(x,y,en,zh,color)`.

### Ready-made widgets in `addons/cs-algorithms/` (used by the demo)

| Need | Widget |
|---|---|
| Sorting with code highlighted line by line, pass log, predict-the-next-pass mode | `W('sortViz', { alg, arr, algs, presets })` (sortviz.js) |
| Pass table with comparisons / swaps (bubble, improved bubble, selection, improved selection, min-to-front selection, insertion asc/desc; vertical layout) | `W('sheetPass', { arr, alg, fixed, vertical, title })` or `{ random: true, alg }` |
| One row per comparison bubble trace | `W('sheetBubbleRows', { arr, fixed })` |
| partition() blocks until the first cut + next calls | `W('sheetPartition', { arr, pivotIdx, fixed, title })` |
| Merge sort recursion tree / merge() table | `W('sheetMergeTree', { arr })`, `W('sheetMergeTable', { list, mid })` |
| Recursion tracing template | `W('sheetRec', { fn, args })` or `{ random: true }` (functions in `T1.REC`, sim.js) |
| Step-count table + Big-O (accepts equivalent expressions) | `W('sheetSteps', { key })` or `{ random: true }` (presets in `T1_STEPS`, sheets.js) |

Every sheet has Check / Show answer / Clear / 🎲 New data and remembers its last and best score. The answers come from the simulators in `sim.js`, which are pure functions you can test in Node — add a new algorithm variant there and verify it against the lecturer’s printed examples before using it.

### Custom widgets worth building for a course (ideas from real use)

| Need | Widget idea |
|---|---|
| Family tree of concepts | clickable tree; each node opens a definition + example |
| Linear vs non-linear, hierarchy, network | side-by-side pictures with "which is it?" drag targets |
| Operations on a structure | the student presses push/pop/insert buttons and watches it change |
| A process / pipeline with stages | stage strip + "put the stages in order" drag game |
| An ADT as a machine | public buttons outside, private insides visible only in "x-ray" mode |
| Memory, pointers, pass by value vs reference | memory boxes with addresses and arrows that update step by step |
| Files: text vs binary, read pointer, eof trap | byte view of the same data in both formats; a read pointer you step |
| Recursion | call-stack trace, divide-and-conquer tree |
| Big-O | growth chart + a loop whose bounds the student edits while the step count updates |
| Testing (black/white box, boundaries) | input line with partitions and boundary points to click |

Rule of thumb: if you would explain it on a whiteboard with a drawing, build the drawing; if a student would understand it by trying, let them try.

## Questions

```js
SITE.bank('ch1', [
  { g: 'concept', t: 'mcq',   q: [en, zh], o: [[en, zh], …] | ['A', 'B'], a: 0, e: [en, zh] },
  { g: 'concept', t: 'multi', q: [en, zh], o: […], a: [0, 2], e: [en, zh] },
  { g: 'trace',   t: 'fill',  q: [en, zh], code: `…`, a: ['main', 'also accepted'], ph: 'placeholder', e: [en, zh] },
  { g: 'gen',     t: 'gen',   make: () => ({ t: 'fill' | 'mcq', q, o?, a, e, code? }) },
  { g: 'final',   t: 'mcq',   … },   // chapter test: NEW variants only
]);
```
- Optional on any question: `code` (shown highlighted), `html` (e.g. an SVG), `ecode` (code inside the explanation), `id`.
- Fill answers are compared case-insensitively; spaces, brackets and commas are normalised; list every acceptable form.
- **Ids are positional** (`ch1-1`, `ch1-2`, …) unless you set `id`. The mistake bank and stats are stored by id, so after students start using the page: **append new questions at the end of a bank** (or give explicit ids). Never insert in the middle or reorder. Same for widget record keys. See `references/design.md`.
- Group names are free (`concept`, `trace`, `code`, `gen`, `final` …). `final` is the chapter test; `gen` holds generators.
- Mock exam split per chapter: `SITE.course.mock = { quick: {ch1: 8, …}, full: {ch1: 15, …} }`, otherwise proportional to bank size.

## Exam focus (where to spend time)

Set it after you have counted marks per chapter in the past papers. The engine then shows: a time table with a “hours left” input on the home page (`${focusTable()}` can also be placed in any section), an hours badge per chapter in the sidebar, ★ on must-do sections and struck-through skip sections, a full banner on the first section of each chapter and a one-line banner on the others, and a collapsed list of that chapter’s past-paper questions.

```js
SITE.course.focus = {
  budget: 20,                 // default hours left; the student can change it (saved per browser)
  outOf: 100,                 // total marks of one paper (column header "Avg marks /outOf"); default 100
  bank: 'paper',              // bank that holds past-paper questions tagged with c: 'chX'
  title: [en, zh], note: [en, zh],
  extra: [{ t: [en, zh], pct: 8 }],          // time not tied to a chapter (mock, mistake bank)
  chapters: { ch3: { stars: 4, pct: 18, avg: 19,   // pct of all chapters + extra must add up to 100
    marks: [en, zh], exam: [en, zh], do: [en, zh], skip: [en, zh],
    sec: { s1: 'core', s3: 'must', s4: 'skip' } } }   // must | core | low | skip
};
```
Tag each past-paper question with its chapter (`c: 'ch3'`), so the banner can list it. `QZ(bank, groups, title, tag)` filters a bank by that tag anywhere. Base `pct` on marks, then adjust for how fast a topic is learned (procedures like tracing earn the most marks per hour), and say plainly which sections earned 0 marks in the papers.

## Glossary and refreshers

- `SITE.GLOSS['word or phrase'] = '中文'` — lower case; phrases match before single words; matching is whole-word and skips code.
- `SITE.RVX.name = () => RV(en, zh, html)` then `${SITE.RVX.name()}` inside a section. One refresher per assumed concept, reused wherever it is needed.

## Storage, versions, save codes

- Custom widgets store state only through `LS.get/set` (never raw `localStorage`), so it is namespaced, exported in save codes and merged on import. Give records a time `t` if they should merge “newest wins”.
- `manifest.json`: `"version": "2.1"` and `{version}` in `title` / `brand` / `output`; `SITE.course.savePrefix` names save files. Format, merge rules and when to bump `SAVE_FMT`: `references/design.md`.

## Build

`python3 scripts/build.py <course folder> [--out file.html]` — refuses `</script` inside course files (write `<\/script>` if you must), runs `node --check` when Node exists, writes `<course folder>/dist/<output>`.
