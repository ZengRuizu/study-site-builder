#!/usr/bin/env python3
"""Build one self-contained study page from the engine + a course folder.

Usage:
    python3 scripts/build.py <course-folder> [--out OUTPUT.html]

The course folder must contain manifest.json:
    {
      "title":  "Sorting Algorithms · demo course", # browser tab title (plain text)
      "brand":  "<b>Sorting</b> demo course",      # top-left label (HTML allowed)
      "lang":   "zh",                              # default language: en | zh | both
      "version": "1.0",                            # page version major.minor; {version} in title/brand/output is replaced
      "output": "index.html",                      # file name written to <course-folder>/dist/, e.g. "COURSE_Review_v{version}.html"
      "files":  ["course.js", "glossary.js", ...]  # course JS files, in load order
    }
Versioning rules (bump on every delivery, never reuse a number): references/design.md.

Only the Python standard library is needed. If `node` is installed, the combined
JavaScript is syntax-checked and the build fails on a syntax error.
"""
import json
import os
import re
import shutil
import subprocess
import sys

if hasattr(sys.stdout, 'reconfigure'):   # Windows consoles default to a legacy code page
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENGINE = os.path.join(ROOT, "engine")


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def main():
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    course = os.path.abspath(args[0])
    out = None
    if "--out" in args:
        out = os.path.abspath(args[args.index("--out") + 1])

    man = json.loads(read(os.path.join(course, "manifest.json")))
    for key in ("title", "brand", "output", "files"):
        if key not in man:
            sys.exit(f"manifest.json is missing '{key}'")

    ver = str(man.get("version", ""))
    if ver and not re.fullmatch(r"\d+\.\d+", ver):
        sys.exit(f"manifest.json: version must look like 2.1 (major.minor), got {ver!r}")
    for key in ("title", "brand", "output"):
        if "{version}" in man[key] and not ver:
            sys.exit(f"manifest.json: {key} uses {{version}} but 'version' is missing")
        man[key] = man[key].replace("{version}", ver)

    head = read(os.path.join(ENGINE, "head.html"))
    head = head.replace("{{TITLE}}", man["title"]).replace("{{BRAND}}", man["brand"]).replace("{{LANG}}", man.get("lang", "zh"))

    blocks = [("engine.js", read(os.path.join(ENGINE, "engine.js")))]
    blocks.append(("version", f"SITE.version = {json.dumps(ver)};"))
    for name in man["files"]:
        path = os.path.join(course, name)
        if not os.path.exists(path):
            sys.exit(f"listed in manifest but missing: {name}")
        blocks.append((name, read(path)))
    blocks.append(("boot.js", read(os.path.join(ENGINE, "boot.js"))))

    for name, code in blocks:
        # a literal </script> inside a script block would end it early and break the page
        if re.search(r"</script", code, re.I):
            sys.exit(f"{name}: contains '</script' — split it, e.g. '<\\/script>'")

    html = head + "".join(f"<script>\n/* ===== {name} ===== */\n{code}\n</script>\n" for name, code in blocks) + "</body>\n</html>\n"

    if out is None:
        os.makedirs(os.path.join(course, "dist"), exist_ok=True)
        out = os.path.join(course, "dist", man["output"])
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)

    node = shutil.which("node")
    if node:
        with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tmp:
            tmp.write("\n;\n".join(code for _, code in blocks))
        res = subprocess.run([node, "--check", tmp.name], capture_output=True, text=True)
        os.unlink(tmp.name)
        if res.returncode != 0:
            sys.exit("JavaScript syntax error:\n" + res.stderr)
        print("syntax: OK (node --check)")
    else:
        print("syntax: SKIPPED (node not installed) — open the page and check the browser console")
    print(f"built: {out} ({len(html.encode('utf-8')):,} bytes)")


if __name__ == "__main__":
    main()
