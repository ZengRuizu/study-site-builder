/* Course configuration — read by the engine. Every user-visible text is a pair [English, 中文]. */
SITE.course = {
  id: 'course-id',                 // storage namespace (letters/digits/-). NEVER change it after students start using the page
  savePrefix: 'COURSE',            // start of save-file names (💾 Save & load)
  lang: 'zh',                      // default language mode: 'en' | 'zh' | 'both'
  title: ['COURSE Review — Chapters 1–N', 'COURSE 复习 —— 第 1–N 章'],
  // every chapter in the exam scope, in order. Chapters not built yet show as "coming soon".
  chapters: [
    ['ch1', 'Ch1', ['Chapter one title', '第一章标题']],
    ['ch2', 'Ch2', ['Chapter two title', '第二章标题']]
  ],
  // study plan table on the home page: [when, what, why]; each cell is a string or [en, zh]
  plan: { title: ['Plan until the exam', '考前计划'], rows: [
    [['Day 1', '第 1 天'], 'Ch1', ['Definitions — fast marks.', '定义题——快速拿分。']]
  ] },
  homeNotes: [['warn', 'One honest sentence about where the marks really are.', '一句实话：分数真正在哪里。']],
  credits: ['Built from the lecture slides of COURSE. If something here disagrees with your lecturer, your lecturer wins.', '内容依据 COURSE 课件。如与讲师说法不一致，以讲师为准。']
  // focus: { budget: 20, bank: 'paper', chapters: { ch1: { stars: 3, pct: 60, avg: 12, marks: ['…', '…'], exam: ['…', '…'], do: ['…', '…'], skip: ['…', '…'], sec: { s1: 'must', s2: 'skip' } } }, extra: [{ t: ['Mock + mistakes', '模拟考 + 错题'], pct: 40 }] },   // optional; see references/authoring.md
  // mock: { quick: { ch1: 8, ch2: 7 }, full: { ch1: 15, ch2: 15 } }   // optional; default = proportional split
};
