# Add-on: classic algorithms (CS courses)

Optional widgets for data-structures / algorithms courses. Add them to a course's `manifest.json` **before** the chapter files:

```json
"files": ["../../addons/cs-algorithms/sim.js", "../../addons/cs-algorithms/sortviz.js", "../../addons/cs-algorithms/sheets.js", "course.js", "..."]
```
(the path is relative to the course folder)

| File | What it adds |
|---|---|
| `sim.js` | `T1.*` — exact simulators: `partition`, `mergeRows`, `mergeTree`, `passes` (bubble / improved bubble / selection / improved selection / min-to-front selection / insertion asc & desc), `bubbleRows`, recursion frames, a step-count expression evaluator (`T1.sameExpr('2(n-1)', '2n-2')`). Pure functions — testable in Node. |
| `sortviz.js` | `W('sortViz', { alg: 'quick' })` — step-by-step sorting visualizer with the code highlighted line by line, a pass log and a predict-the-next-pass mode. |
| `sheets.js` | Answer-sheet drills in exam-table layouts, each with Check / Show answer / New data and a remembered score: `sheetPartition`, `sheetMergeTable`, `sheetMergeTree`, `sheetPass`, `sheetBubbleRows`, `sheetRec`, `sheetSteps`. Pass `{ arr: [...] }` for a fixed question or `{ random: true }`. |

If a course's own lecturer uses a different variant (e.g. selection sort that moves the minimum to the front), add it to `T1.passes` and verify it against the lecture's printed examples before using it.
