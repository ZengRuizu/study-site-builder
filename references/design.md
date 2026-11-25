# Design decisions — storage, save codes, versions

Read this before you change how progress is stored, change question ids, or deliver a new version of a site. Every rule below exists to keep a student's progress safe across updates, browsers and devices.

## 1. Where progress lives

- Progress is in the browser's `localStorage`, **not in the HTML file**. Every key is `<course.id>:<name>` (`LS.get/set` adds the prefix).
- Chromium browsers (Chrome, Edge, Opera, Brave) give all `file://` pages one shared storage, so **a newer version of the file opened in the same browser keeps the progress automatically**, whatever the file name or folder (tested). Firefox may treat each file as its own site; other browsers and devices never share storage.
- Therefore: **`course.id` never changes** after students use the page, and a site must never write progress anywhere but `LS`.

| Key | Content |
|---|---|
| `stats` | `{ questionId: { c, w, h, t, g, gq?, ga?, gc? } }` right/wrong counts, last 8 results, time, last answer (generated questions keep their instance) |
| `wrong` | `[questionId]` mistake bank |
| `done` | `{ 'ch/s': 1 }` sections marked done |
| `wrec` | `{ widgetKey: { n, last, of, bp, t, lb } }` widget scores |
| `vocab`, `gloss` | vocabulary list `{ word: { zh, n, t } }`, glossary on/off |
| `mockbest`, `budget`, `lang` | best mock %, hours left, language mode |
| course-specific | e.g. `wtext` (written answers `{ id: text }`), `ucstext`, `tm:*` (timers) — any key under the prefix is exported |
| `_meta` | `{ fmt, site, t }` storage format and the page version that last wrote it (internal) |
| `_undo` | snapshot taken before the last import (internal) |

## 2. Question ids are part of the storage format

Records are stored by question id, and ids are **positional** (`m2-14`) unless set explicitly. Inserting or reordering questions attaches old records to the wrong questions. So: **append new questions at the end of a bank, or give explicit `id`s; never insert, reorder or delete in the middle once students use the page.** To retire a question, keep it in place (or replace it with one on the same skill). Widget record keys (`wRec('wt:p25a1', …)`) follow the same rule: never rename them.

## 3. Storage format version (`SAVE_FMT`, engine)

- `SAVE_FMT` is the version of the **data structure**, independent of the page version. Data without `_meta` is format 1 (the original structure).
- On start, `saveBoot()` stamps `_meta`. Older format → runs `SAVE_MIGRATE[n]` step by step and writes the result. Newer format (an old file opened after a new one) → touches nothing and shows a warning to open the newest file.
- **Bump `SAVE_FMT` only when the structure of stored data changes**, and in the same change add `SAVE_MIGRATE[old] = data => newData` plus a round-trip test. Adding a new key is not a structure change.

## 4. Save codes (💾 Save & load, `#/save`)

For moving progress to another browser or device, or keeping a backup. A page cannot write files by itself, so the student copies a code or downloads a file — two steps, nothing to install.

```
SSB-SAVE fmt1 · SE Midterm Review v2.1 (se-mid-2026) · 2026-11-25 11:03 UTC+8 · Chrome 131 / Windows · 186 answered · 12 mistakes · check 3fa2c1d0
z<base64 of gzip(JSON)>
```
- **Line 1** is for people: storage format, site title and page version, course id, export time with time zone, browser and OS (from the user agent — approximate: Brave reports Chrome), counts, and an FNV-1a checksum of line 2.
- **Line 2** is the payload: `z` + base64(gzip(JSON)), or `j` + base64(JSON) where `CompressionStream` is missing. JSON = `{ fmt, id, title, site, at, tz, browser, data }`, `data` = every key under the prefix except `_meta` and `_undo`.
- File name: `<savePrefix>_save_v<version>_<YYYY-MM-DD>_<HHMM>_<Browser>-<OS>.txt` (`SITE.course.savePrefix`, default `course.id`). `.txt` because line 1 makes it not pure JSON, and every phone can open text.
- Import refuses: no `SSB-SAVE` line; checksum mismatch (cut off or edited in a chat app); a newer format; another course id. Whitespace and line breaks inside the payload are ignored.
- Before writing, the current data is copied to `_undo`; the write is all-or-nothing (restored on error); the student can undo the last import.
- **Merge** (default): per question / widget / word keep the record with the newer `t`; mistake bank and done sections = union; `mockbest` = max; written answers = the longer text; device preferences (`lang`, `gloss`, `budget`, timers) stay. **Replace**: the browser becomes exactly the save, except device preferences.
- `verify.py` runs export → wipe → import → compare, merge-into-identical, undo, and damaged/cut-off codes on every build.

## 5. Page versions

- `manifest.json` has `"version": "major.minor"`; `{version}` in `title`, `brand` and `output` is replaced at build time and `SITE.version` is set (shown in save codes and the AI report).
- The version is in the **file name** (`COURSE_Review_v2.1.html`) and the top-left brand, so students can tell files apart.
- Bump on **every** delivery and never reuse a number: **+0.1** for a fix, layout change or small feature; **+1** for new chapters, past papers or a changed structure. Older files go to `old_versions/` next to the current one.
- Tell students when delivering: same browser → just open the new file; other browser or device → 💾 Save & load.
