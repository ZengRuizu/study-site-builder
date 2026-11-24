# Teaching and question design

Lessons from building and using the first real course site (a Data Structures & Algorithms midterm). Each rule exists because the opposite failed.

## Explaining

- **Picture first, words second.** "Types of data structures" as a list of definitions was unreadable; a family tree you can click, plus pictures of a line vs a tree vs a network, made it click. Any section that is mostly nouns and definitions needs a diagram.
- **One big idea per section**, stated in one line at the top. Notes underneath use the lecturer's exact words for anything that may be asked as a definition.
- **Concrete before abstract.** ADT → a vending machine (buttons public, insides private) before the formal definition. Recursion → stairs and a call stack before the base-case rule.
- **Let them drive.** A simulator where the student presses push/pop, edits a loop bound or picks the pivot beats an animation they watch.
- **Predict, then reveal.** Ask "what happens next?" before showing the next step (sort passes, trace tables, recursion returns).
- **Assumed knowledge goes in collapsed refreshers**, not in the main text. Typical: integer division, `typedef`, named constants, enum/bool/char, pass by reference, echo input, coupling/cohesion, file modes.
- **Show the trap.** For each topic, one "Common mistake" or "Exam focus" box that names the exact trap (off-by-one in step counts, eof read twice, sort direction).

## From "I understand it" to "I can write it"

Knowing what `typedef` is for does not mean you can write it. For every construct the exam may ask the student to write:
1. **Anatomy** — the general pattern with every part labelled (`const` · type · NAME · `=` value · `;`).
2. **Before → after** — a realistic piece of code rewritten with the construct, and what it buys (change one line instead of five).
3. **Fill the blanks** (`codeCloze`) in realistic code.
4. **Valid or error?** (`judgeDrill`) with the classic wrong forms (missing initialiser, swapped order, assigning to a constant, using it before declaring).
5. **Write it yourself** — a `fill` question or a task with a model answer.

## Questions

- **Every section ends with a check-yourself quiz** (3–8 questions). Every chapter ends with a chapter test of at least 8 questions.
- **Chapter tests are variants, not repeats**: same skill, new scenario / numbers / code / wording. Students recognise repeated questions and score high without knowing anything.
- **Mix formats**: definitions (MCQ), "which statement is false" (multi), code output (fill), tracing tables, step counting, Big-O of a loop, "fix this code", "order these steps".
- **Distractors must be real misconceptions**, not obviously silly options. The explanation says why the tempting wrong answer is wrong.
- **Generators for everything computable** — random arrays for sort passes, random loop bounds for step counts, random inputs for recursion traces. Compute the answer with the same algorithm the lecturer uses (copy the lecture code into the generator).
- **Run everything.** Every code output and numeric answer is checked by actually running code. For generators, run them hundreds of times (the quality gate does) and test edge cases (duplicates, already-sorted, size 1).
- **"Don't know" is a feature**: it gives the answer, counts as wrong, and sends the question to the mistake bank, so the student never has to guess.

## Language

- Bilingual pairs everywhere. Chinese text keeps the key English term in brackets the first time: "抽象数据类型 (ADT)". The exam is in English, so the student must recognise the English words.
- Glossary: words a Chinese student at IELTS ~6 may not know (e.g. *hierarchical, traverse, terminate, redundant, invoke*) and course terms. Not everyday words.
- Questions use exam-style English. The per-question translate button exists so a vocabulary problem does not block practice.

## Exam strategy content (home page)

- A day-by-day plan to the exam, weighted by marks and difficulty.
- One honest note on where marks are (e.g. "tracing and step-counting questions are free marks if you practice; definitions are memorisation").

## Past papers

- The answer booklet’s layout is part of the skill being tested. Drill in that exact layout (same columns, same blanks, vertical arrays if the booklet uses them), not just “what is the answer”.
- When the paper prints code, the printed code wins over the slide version (e.g. a selection sort that moves the minimum to the front). Simulate the printed code.
- Weight the plan by marks: procedure slots (tracing, counting, sorting) are the cheapest marks per hour.
- Past-paper errors exist. Name them, give the most reasonable reading, and teach the student to write one line stating the assumption.

## Practice that adds up

- Students revisit pages. A quiz that forgets earlier answers wastes their work: show each question’s history and let them filter to “not mastered”.
- Mastery = two correct attempts in a row (one lucky guess is not mastery; one slip after mastery puts it back into review).
- Never put a later section’s content into an earlier section’s practice (e.g. merge/quick sort cards inside the simple-sort summary). It feels like a test on something not yet taught.
