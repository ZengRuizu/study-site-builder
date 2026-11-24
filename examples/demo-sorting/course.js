/* Demo course for study-site-builder. All content is original and written for this demo.
   The "sample test" is FICTIONAL — it only shows how real past papers drive the site. */
SITE.course = {
  id: 'ssb-demo-sorting',
  lang: 'both',
  title: ['Sorting Algorithms — demo course', '排序算法——示例课程'],
  chapters: [
    ['paper', '🎯', ['Sample test (fictional)', '模拟真题（虚构）']],
    ['ch1', 'Ch1', ['Simple sorts', '简单排序']],
    ['ch2', 'Ch2', ['Merge sort & quick sort', '归并排序与快速排序']]
  ],
  plan: { title: ['A 3-day plan (example)', '三天计划（示例）'], rows: [
    [['Day 1', '第 1 天'], ['Ch1 + 🎯 pass tables', 'Ch1 + 🎯 逐趟表'], ['Every simple sort once in the visualizer, then the answer sheets until zero wrong cells.', '每种简单排序先在可视化里走一遍，再做答题纸直到零错格。']],
    [['Day 2', '第 2 天'], ['Ch2 + 🎯 merge / partition', 'Ch2 + 🎯 归并 / partition'], ['These are the biggest questions in the sample test.', '这是模拟真题里分值最大的题。']],
    [['Day 3', '第 3 天'], ['🎯 Section A + mistakes', '🎯 A 部分 + 错题本'], ['Only not-mastered questions, then hand the report to an AI.', '只练没掌握的题，再把报告交给 AI。']]] },
  homeNotes: [['note', 'This is a <b>demo</b> of <a href="https://github.com/ZengRuizu/study-site-builder">study-site-builder</a>. Every text here is original; the “sample test” is fictional. Built for your own course, the site is driven by your lecture slides and <b>your real past papers</b>.', '这是 <a href="https://github.com/ZengRuizu/study-site-builder">study-site-builder</a> 的<b>示例</b>。这里所有内容都是原创，“模拟真题”是虚构的。给你自己的课程生成时，网页由你的课件和<b>真实的历年试卷</b>驱动。']],
  credits: ['Demo content written for study-site-builder (MIT). Sorting code listings are original.', '示例内容为 study-site-builder 原创编写（MIT 许可）。排序代码清单为原创。'],
  mock: { quick: { ch1: 5, ch2: 5 }, full: { ch1: 10, ch2: 10 } },
  focus: { budget: 12, outOf: 50, bank: 'paper', title: ['Where to spend your time (from the sample papers)', '时间该花在哪里（依据模拟真题）'],
    note: ['In a real course these numbers come from counting marks per chapter in the past papers. Here they come from the two fictional sample tests.', '真实课程里，这些数字来自逐题统计历年试卷每章的分值。这里用的是两份虚构的模拟试卷。'],
    extra: [{ t: ['🎯 Sample Section A + mistake bank', '🎯 模拟 A 部分 + 错题本'], pct: 14 }],
    chapters: {
      ch2: { stars: 5, pct: 46, avg: 27, marks: ['27 / 50 on average — Q2 merge (12) + Q3 partition (12) + 3 MCQs.', '平均 27 / 50——Q2 归并（12 分）+ Q3 partition（12 分）+ 3 道选择。'],
        exam: ['A partition() trace until the first cut in both papers; a merge sort tree or a merge() table.', '两份试卷都有 partition() 追踪到第一次切分；归并树或 merge() 表。'],
        do: ['<a href="#/paper/s3">🎯 Answer sheets</a>: partition and merge until zero wrong cells twice in a row.', '<a href="#/paper/s3">🎯 答题纸</a>：partition 和归并练到连续两次零错格。'],
        skip: ['Nothing — the whole chapter is examined.', '没有可跳的——整章都考。'], sec: { s1: 'must', s2: 'must', s3: 'core' } },
      ch1: { stars: 4, pct: 40, avg: 23, marks: ['23 / 50 on average — Q1 pass tables (16) + 7 MCQs.', '平均 23 / 50——Q1 逐趟表（16 分）+ 7 道选择。'],
        exam: ['Pass tables with comparisons and swaps; which variant of selection sort the printed code uses.', '带比较和交换次数的逐趟表；题目印的选择排序是哪个版本。'],
        do: ['Visualizer once per algorithm, then <a href="#/paper/s3">🎯 pass tables</a> for every algorithm.', '每个算法先看一遍可视化，再做 <a href="#/paper/s3">🎯 逐趟表</a>。'],
        skip: ['Nothing — but s4 flashcards are optional.', '没有——但 s4 的记忆卡可选。'], sec: { s1: 'must', s2: 'must', s3: 'must', s4: 'core' } }
    } }
};
