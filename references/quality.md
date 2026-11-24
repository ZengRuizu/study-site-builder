# Quality checklist

Run `scripts/verify.py` first. It checks automatically:
- no JavaScript error on any page in any language mode; no widget error
- no horizontal scrolling at 375 px
- every question has the "Don't know" button
- question bank: valid answer indexes, non-empty fill answers, unique ids, generators run 200× without throwing
- chapter test has no word-for-word copies of section questions; warns under 8 chapter-test questions
- warns on text-only sections and long sections without a widget

Then check by eye (screenshots from `--shots`, or open the page):
- [ ] Every section you changed: looks clean on desktop and phone; nothing overlaps; diagrams readable at phone width.
- [ ] Switch EN → 中文 → 双语 on a page with widgets and a quiz: all labels switch, no untranslated English in 中文 mode except technical terms.
- [ ] Answer one question right, one wrong, one "Don't know": feedback and explanation appear; the wrong ones appear in Mistakes.
- [ ] Each widget you added: press every button; reset works; edge input (empty, very large, duplicates) does not break it.
- [ ] Every numeric answer and code output was produced by running code, not by hand.
- [ ] Lecturer conventions followed; slide errors flagged with the correct version.
- [ ] Glossary underlines hard words; tapping one shows Chinese and adds it to 生词本.
- [ ] Mock exam (quick) starts, the timer runs, submit shows the score and answers.
- [ ] Home page plan and chapter list match the exam scope.
- [ ] Answer a question, leave the page, come back: its history dots and state are still there.
- [ ] Click Next on a step-through widget several times: the button stays at the same screen position.
- [ ] Each section’s decks and quizzes only cover what has been taught so far.
- [ ] Answer a few questions wrong, open 🤖 Hand over to AI and copy: the report lists them with the student’s answer and the correct one.
- [ ] Mark some answers wrong and look at the screenshot in greyscale: wrong cells must still stand out (dashed border / ✗ / line-through), not only by colour.

If Playwright is unavailable: run `node --check` on the built file's scripts (build.py does this), open the page in a browser yourself if you can, and ask the student to open it and report anything broken.
