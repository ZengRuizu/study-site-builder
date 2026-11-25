#!/usr/bin/env python3
"""Quality gate for a built study page. Run it after every build; deliver only when it passes.

Usage:
    python3 scripts/verify.py <built.html> [--shots DIR]

Needs Playwright + a Chromium browser:
    pip install playwright && python3 -m playwright install chromium
(If a system Chrome exists it is used automatically.)

What it checks (exit code 1 if any FAIL):
  FAIL  JavaScript errors on any page, in any of the 3 language modes
  FAIL  a widget that throws ("Widget error" box)
  FAIL  horizontal scrolling at phone width (375 px) on any page
  FAIL  question-bank problems: bad answer index, empty fill answer, duplicate ids,
        a random generator that throws or returns an invalid question
  FAIL  a chapter-test question ('final' group) that is an exact copy of a section question
  FAIL  a question without the "Don't know" button
  WARN  a built chapter with fewer than 8 chapter-test ('final') questions
  WARN  a section with no widget AND no quiz (text only)
  WARN  a text-heavy section (> 450 words of English) with no widget
  WARN  generated random questions whose options repeat
With --shots DIR it also saves a desktop and a phone screenshot of every page for visual review.
"""
import json
import os
import pathlib
import shutil
import sys

if hasattr(sys.stdout, 'reconfigure'):   # Windows consoles default to a legacy code page
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit("Playwright missing: pip install playwright && python3 -m playwright install chromium")

CHROME_CANDIDATES = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
                     r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                     "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]


def launch(p):
    try:
        return p.chromium.launch(args=["--no-sandbox"])
    except Exception:
        for c in CHROME_CANDIDATES:
            if os.path.exists(c):
                return p.chromium.launch(executable_path=c, args=["--no-sandbox"])
        raise


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = os.path.abspath(sys.argv[1])
    shots = sys.argv[sys.argv.index("--shots") + 1] if "--shots" in sys.argv else None
    if shots:
        os.makedirs(shots, exist_ok=True)
    url = pathlib.Path(path).as_uri()   # file:///C:/... on Windows, spaces and non-ASCII escaped
    fails, warns = [], []

    with sync_playwright() as p:
        b = launch(p)
        pg = b.new_page(viewport={"width": 1280, "height": 900})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(url)
        pg.wait_for_timeout(400)
        if errs:
            fails.append(f"JS error on load: {errs[:3]}")
        routes = pg.evaluate("SITE.chapters.flatMap(c => (c.sections||[]).map(s => c.id + '/' + s.id))")
        routes = [""] + routes + ["mistakes", "mock", "vocab", "ai", "save"]

        # ---- question bank (static + generated) ----
        bank = pg.evaluate("""() => {
          const bad = [], gw = [];
          const chk = (q, id) => {
            if (!q.q || q.q.length !== 2) bad.push(id + ': question text must be [en, zh]');
            if (q.t === 'mcq') { if (!(q.a >= 0 && q.a < q.o.length)) bad.push(id + ': answer index out of range'); }
            else if (q.t === 'multi') { if (!Array.isArray(q.a) || !q.a.every(i => i >= 0 && i < q.o.length)) bad.push(id + ': bad multi answer'); }
            else if (q.t === 'fill') { if (!q.a || !q.a.length || !String(q.a[0]).trim()) bad.push(id + ': empty fill answer'); }
            else bad.push(id + ': unknown type ' + q.t);
          };
          let fixed = 0, gens = 0;
          SITE.allQs().forEach(q => {
            if (q.t === 'gen') { gens++; for (let k = 0; k < 200; k++) { let x; try { x = q.make(); } catch (e) { bad.push(q.id + ': generator throws ' + e.message); break; } chk(x, q.id);
                if (x.t === 'mcq' && new Set(x.o.map(o => JSON.stringify(o))).size !== x.o.length) gw.push(q.id); } }
            else { fixed++; chk(q, q.id); } });
          const ids = SITE.allQs().map(q => q.id);
          const norm = s => s.replace(/<[^>]+>/g, '').toLowerCase().replace(/\\s+/g, ' ').trim();
          const dups = [], finals = {};
          Object.entries(SITE.banks).forEach(([ch, qs]) => {
            const fin = qs.filter(q => q.g === 'final'), rest = qs.filter(q => q.g !== 'final' && q.t !== 'gen');
            finals[ch] = fin.length;
            fin.forEach(f => { if (rest.some(r => norm(r.q[0]) === norm(f.q[0]) && (r.code || '') === (f.code || ''))) dups.push(f.id); });
          });
          const built = SITE.chapters.filter(c => !c.soon).map(c => c.id);
          const F = SITE.course.focus, fw = [];
          if (F && F.chapters) {
            const tot = Object.values(F.chapters).reduce((x, f) => x + (f.pct || 0), 0) + (F.extra || []).reduce((x, f) => x + (f.pct || 0), 0);
            if (Math.abs(tot - 100) > 1) fw.push('focus percentages add up to ' + tot + ', not 100');
            Object.entries(F.chapters).forEach(([id, f]) => { const ch = SITE.chapters.find(c => c.id === id);
              if (!ch) fw.push('focus for unknown chapter ' + id);
              else Object.keys(f.sec || {}).forEach(k => { if (!ch.sections.some(x => x.id === k)) fw.push(id + ': focus.sec names unknown section ' + k); }); });
          }
          return { fixed, gens, bad: [...new Set(bad)], genWarn: [...new Set(gw)], dupIds: ids.length - new Set(ids).size, dups, finals, built, fw };
        }""")
        fails += [f"bank: {x}" for x in bank["bad"][:20]]
        if bank["dupIds"]:
            fails.append(f"bank: {bank['dupIds']} duplicate question ids")
        if bank["dups"]:
            fails.append(f"chapter test repeats section questions word-for-word: {bank['dups']}")
        for ch in bank["built"]:
            if bank["finals"].get(ch, 0) < 8:
                warns.append(f"{ch}: only {bank['finals'].get(ch, 0)} chapter-test ('final') questions (aim for 8+)")
        warns += [f"focus: {x}" for x in bank["fw"]]
        if bank["genWarn"]:
            warns.append(f"generators with repeated options: {bank['genWarn']}")

        # ---- every page, desktop ----
        for r in routes:
            errs.clear()
            pg.evaluate(f"location.hash = '#/{r}'")
            pg.wait_for_timeout(250)
            info = pg.evaluate("""() => {
              const page = document.getElementById('page');
              const werr = [...page.querySelectorAll('.warn')].filter(x => x.textContent.includes('Widget error')).map(x => x.textContent.slice(0, 120));
              const qs = page.querySelectorAll('.q').length, dk = page.querySelectorAll('.q .dk').length;
              const widgets = page.querySelectorAll('.wmount').length, quizzes = page.querySelectorAll('.quizmount').length;
              const en = [...page.querySelectorAll('.en')].filter(e => !e.closest('.wmount') && !e.closest('.quizmount') && !e.closest('.rv') && !e.parentElement.closest('.en'));
              const words = en.map(e => e.textContent).join(' ').split(/\\s+/).filter(Boolean).length;
              return { werr, qs, dk, widgets, quizzes, words };
            }""")
            name = r or "home"
            if errs:
                fails.append(f"{name}: JS error {errs[:2]}")
            if info["werr"]:
                fails.append(f"{name}: {info['werr']}")
            if info["qs"] != info["dk"]:
                fails.append(f"{name}: {info['qs'] - info['dk']} question(s) without the Don't-know button")
            if "/" in r:
                if info["widgets"] == 0 and info["quizzes"] == 0:
                    warns.append(f"{name}: text only — add a widget or a quiz")
                elif info["widgets"] == 0 and info["words"] > 450:
                    warns.append(f"{name}: {info['words']} words of English and no widget — add a picture or interaction")
            if shots:
                pg.screenshot(path=os.path.join(shots, (name.replace('/', '_')) + "_desktop.png"), full_page=True)

        # ---- language modes ----
        for lang in ("en", "both", "zh"):
            errs.clear()
            pg.evaluate(f"setLang('{lang}')")
            for r in routes[:6]:
                pg.evaluate(f"location.hash = '#/{r}'")
                pg.wait_for_timeout(120)
            if errs:
                fails.append(f"language mode {lang}: JS errors {errs[:2]}")

        # ---- phone width ----
        m = b.new_page(viewport={"width": 375, "height": 800})
        m.goto(url)
        m.wait_for_timeout(300)
        for r in routes:
            m.evaluate(f"location.hash = '#/{r}'")
            m.wait_for_timeout(150)
            sw = m.evaluate("document.documentElement.scrollWidth")
            if sw > 376:
                fails.append(f"{r or 'home'}: horizontal scroll on phone (width {sw}px > 375)")
            if shots:
                m.screenshot(path=os.path.join(shots, (r or "home").replace('/', '_') + "_phone.png"))

        # ---- save code: export → wipe → import must give back exactly the same data ----
        sp = b.new_page()
        sp.goto(url)
        sp.wait_for_timeout(300)
        rt = sp.evaluate("""async () => {
          const bad = [], canon = x => Array.isArray(x) ? x.map(canon) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((o, k) => (o[k] = canon(x[k]), o), {}) : x;
          const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b)), strip = d => { const o = Object.assign({}, d); delete o.lang; return o; };
          const ids = SITE.allQs().filter(q => q.t !== 'gen').slice(0, 3).map(q => q.id), now = Date.now();
          LS.set('stats', Object.fromEntries(ids.map((id, i) => [id, { c: i, w: 1, h: '01', t: now - i, g: 'B. “quoted” 中文' }])));
          LS.set('wrong', ids.slice(0, 1)); LS.set('done', { 'x/s1': 1 }); LS.set('wtext', { t1: 'line 1\\nline 2 ✓ 中文' }); LS.set('wrec', { 'k:1': { n: 1, last: 2, of: 3, bp: 66, t: now } }); LS.set('lang', 'both');
          const before = saveRead(), e = await saveExport();
          if (!/^SSB-SAVE fmt\\d+ .* check [0-9a-f]{8}\\n[zj]/.test(e.code)) bad.push('save code: header line or payload missing');
          if (!/_save_.*\\d{4}-\\d\\d-\\d\\d_\\d{4}_.+\\.txt$/.test(e.file)) bad.push('save file name lacks date/time/browser: ' + e.file);
          saveWriteAll({ lang: 'en' });
          let P; try { P = await saveParse(e.code); } catch (x) { bad.push('own save code rejected: ' + x.message); return bad; }
          saveApply(P, 'replace');
          if (!same(strip(saveRead()), strip(before))) bad.push('replace import does not restore the exported data');
          if (LS.get('lang') !== 'en') bad.push('import overwrote a device preference (lang)');
          saveApply(P, 'merge');
          if (!same(strip(saveRead()), strip(before))) bad.push('merging a save into identical data changed it');
          saveUndo();
          if (!same(strip(saveRead()), strip(before))) bad.push('undo did not restore the data before the import');
          const lines = e.code.split('\\n'), mid = lines[1].length >> 1;
          for (const [name, txt] of [['changed character', lines[0] + '\\n' + lines[1].slice(0, mid) + (lines[1][mid] === 'A' ? 'B' : 'A') + lines[1].slice(mid + 1)], ['cut off', lines[0] + '\\n' + lines[1].slice(0, mid)]]) {
            try { await saveParse(txt); bad.push('a ' + name + ' save code was accepted'); } catch (x) { if (x.message !== 'damaged') bad.push(name + ': wrong error ' + x.message); } }
          try { await saveParse(e.code.replace(/\\n/, '\\n   ').replace(/(.{40})/, '$1')); } catch (x) { bad.push('save code with extra spaces/line breaks rejected'); }
          saveWriteAll({}); localStorage.removeItem(savePrefix() + '_undo');
          return bad;
        }""")
        fails += [f"save: {x}" for x in rt]
        b.close()

    print(json.dumps({"pages": len(routes), "fixed_questions": bank["fixed"], "generators": bank["gens"],
                      "chapter_test_questions": bank["finals"]}, ensure_ascii=False))
    for w in warns:
        print("WARN ", w)
    for f in fails:
        print("FAIL ", f)
    print("RESULT:", "PASS" if not fails else f"FAIL ({len(fails)})")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
