/* =====================================================================
   ===== CH1 — template chapter. Copy this file per chapter (ch2.js …) and replace the content.
   Helpers (all bilingual): T(en,zh) inline · P(en,zh) paragraph · L([[en,zh],…], ordered?) list ·
   BOX(kind,en,zh) callout: note | tip | warn | exam · K('code') inline code · C`…` code block ·
   W(name, arg) widget · QZ(chapter, groups, [title en, zh]) quiz · RV(en, zh, html) refresher.
   Recipe for EVERY concept section: big idea (1–2 lines) → picture / hands-on widget → short notes →
   refresher if the slides assume background → "check yourself" quiz.
   ===================================================================== */
SITE.chapter({ id: 'ch1', num: 'Ch1', t: ['Chapter one title', '第一章标题'], sections: [

{ id: 's1', t: ['A concept section', '概念小节'], html: () => `
<div class="big-idea"><span class="ico">🔑</span><div>${T('The one idea that makes this section click.', '让这一节一下就懂的那个核心想法。')}</div></div>
${W('exampleCounter')}
${P('Short notes in the lecturer’s words. Keep the exact terms the exam uses.', '用讲师原话写的简短笔记。保留考试会用的原词。')}
${L([['First key point', '要点一'], ['Second key point', '要点二']])}
${BOX('exam', 'What the exam asks about this, and the trap.', '考试会怎么考这个，以及陷阱在哪。')}
${SITE.RVX.example()}
${QZ('ch1', 'concept')}
`},

{ id: 's2', t: ['Practice formats', '练习形式'], html: () => `
${W('bucketGame', 'example')}
${W('codeCloze', 'example')}
${W('judgeDrill', 'example')}
${QZ('ch1', 'gen', ['🎲 Random drills (unlimited)', '🎲 随机练习（无限）'])}
`},

{ id: 's3', t: ['Cheat sheet + Ch1 test', '速记表 + 本章测试'], html: () => `
<div class="card"><b>${T('One-screen summary', '一屏速记')}</b>${L([['Everything on one screen', '一屏看完全部要点']])}</div>
${W('flashcards', 'ch1')}
${QZ('ch1', 'final', ['Chapter 1 test — new questions (not repeats)', '第 1 章测试——全新题目（不是重复题）'])}
`}
]});

/* A custom widget: el is the container, arg is whatever you passed to W(name, arg).
   Always redraw from state; use T() for every label; keep it usable at 375 px wide. */
SITE.widgets.exampleCounter = el => {
  let n = 0;
  const draw = () => {
    el.innerHTML = `<div class="w"><div class="wt">${T('Hands-on example', '动手示例')}</div>
      <div class="boxes">${Array.from({ length: n }, (_, i) => `<div class="box ${i === n - 1 ? 'a' : ''}">${i + 1}</div>`).join('')}</div>
      <div class="row"><button class="btn sm pri add">${T('Add one', '加一个')}</button><button class="btn sm rs">${T('Reset', '重置')}</button></div>
      <div class="msg">${T(`There are <b>${n}</b> items.`, `现在有 <b>${n}</b> 个元素。`)}</div></div>`;
    $('.add', el).onclick = () => { if (n < 10) n++; draw(); };
    $('.rs', el).onclick = () => { n = 0; draw(); };
  };
  draw();
};

/* Question bank. Groups: section quizzes use any name ('concept' …); 'gen' = random generators;
   'final' = the chapter test — NEW variants of the section questions, never copies (verify.py fails on copies).
   Fill answers: a: ['main answer', 'accepted alternative']. Compare is case-insensitive, extra spaces/brackets ignored. */
SITE.bank('ch1', [
 { g: 'concept', t: 'mcq', q: ['A multiple-choice question?', '一道单选题？'], o: [['Right option', '正确选项'], ['Wrong option', '错误选项']], a: 0,
   e: ['Why it is right (and why the trap option is wrong).', '为什么对（以及陷阱选项为什么错）。'] },
 { g: 'concept', t: 'multi', q: ['Select all that apply.', '选出全部正确项。'], o: ['A', 'B', 'C'], a: [0, 2] },
 { g: 'concept', t: 'fill', q: ['What is printed?', '输出是什么？'], code: `cout << 7 / 2;`, a: ['3'], e: ['int / int drops the decimals.', 'int / int 丢掉小数。'] },
 { g: 'gen', t: 'gen', make: () => { const a = rint(10, 99), b = rint(2, 9);
   return { t: 'fill', q: [`What is <code>${a} / ${b}</code> in C++ (both int)?`, `C++ 里 <code>${a} / ${b}</code>（都是 int）等于多少？`], a: [String(Math.trunc(a / b))], e: ['Integer division drops the decimal part.', '整数除法丢掉小数部分。'] }; } },
 { g: 'final', t: 'mcq', q: ['A NEW question on the same idea (different scenario / numbers).', '同一知识点的新题（换场景/换数字）。'], o: [['Right', '对'], ['Wrong', '错']], a: 0 }
]);
