/* 🎯 Sample test — FICTIONAL papers written for this demo. In a real course this chapter is built
   from the lecturer's past papers: blueprint, marks per chapter, Section A with verified keys,
   and every Section B format as an interactive answer sheet. */
const PTAB = (rows, head) => `<table class="t"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${Array.isArray(c) ? T(c[0], c[1]) : c}</td>`).join('')}</tr>`).join('')}</table>`;

SITE.chapter({ id: 'paper', num: '🎯', t: ['Sample test (fictional)', '模拟真题（虚构）'], sections: [

{ id: 's1', t: ['Blueprint: what the test looks like', '蓝图：考试长什么样'], html: () => `
${BOX('note', 'Both “past papers” here are <b>invented</b> for the demo. With your own course you drop your real papers into the slides folder; the AI counts the marks per chapter and builds this page from them.', '这里的两份“历年试卷”都是为示例<b>虚构</b>的。用在你自己的课程时，把真实试卷放进课件文件夹；AI 会统计每章分值并据此生成这一页。')}
<div class="big-idea"><span class="ico">🔑</span><div>${T('Both papers share one skeleton: 10 MCQs + 3 structured questions. 40 of the 50 marks are <b>procedures</b> (trace a table) — practised = guaranteed.', '两份试卷骨架一样：10 道选择 + 3 道结构题。50 分里有 40 分是<b>套路题</b>（填追踪表）——练熟就稳拿。')}</div></div>
${PTAB([
  ['A', ['10 MCQs × 1', '10 道选择 × 1'], '10', ['complexity facts, pass results, which sort fits a situation', '复杂度事实、某趟结果、什么情况选什么排序']],
  ['B Q1', ['Simple sorts', '简单排序'], '16', ['two pass tables with comparisons and swaps', '两张逐趟表，含比较和交换次数']],
  ['B Q2', ['Merge sort', '归并排序'], '12', ['merge sort tree, or a merge() table', '归并树，或 merge() 追踪表']],
  ['B Q3', ['Quick sort', '快速排序'], '12', ['partition() until the first cut + next calls', 'partition() 追踪到第一次切分 + 接下来的调用']]], [T('Part', '部分'), T('Content', '内容'), T('Marks', '分值'), T('What they ask', '考什么')])}
${focusTable()}
${BOX('exam', 'Rule that wins marks: when a question prints code, follow the printed code — even if your notes use a different variant.', '拿分规则：题目印了代码就照印的代码做——即使你笔记里是另一个版本。')}
`},

{ id: 's2', t: ['Section A — sample papers', 'A 部分——模拟真题'], html: () => `
${P('Do each set like the exam: 10 minutes, no notes. Then read every explanation, including the ones you got right.', '每套都像考试一样做：10 分钟、不看笔记。然后看每道题的解析，做对的也要看。')}
${QZ('paper', 'sA', ['Sample paper 1 — Section A', '模拟试卷 1——A 部分'])}
${QZ('paper', 'sB', ['Sample paper 2 — Section A', '模拟试卷 2——A 部分'])}
`},

{ id: 's3', t: ['Section B — answer sheets', 'B 部分——答题纸'], html: () => `
${P('Same layouts as the paper. Fill every cell, press <b>Check</b>, and repeat with 🎲 new data until a sheet comes back with zero wrong cells twice in a row.', '和试卷同样的格式。填满每一格再按<b>检查</b>，然后用 🎲 换数据重做，直到连续两次零错格。')}
<h2>${T('Q1 — pass tables (16 marks)', 'Q1——逐趟表（16 分）')}</h2>
${W('sheetPass', { arr: [8, 3, 6, 2, 9], alg: 'ibubble', fixed: true, title: ['Paper 1 Q1(a): improved bubble sort', '试卷 1 Q1(a)：改进冒泡'] })}
${W('sheetPass', { arr: [8, 3, 6, 2, 9], alg: 'selection', fixed: true, title: ['Paper 1 Q1(b): selection sort (largest → end)', '试卷 1 Q1(b)：选择排序（最大值放末尾）'] })}
${W('sheetPass', { arr: [12, 5, 17, 9, 3, 14], alg: 'insertionDesc', fixed: true, vertical: true, title: ['Paper 2 Q1: insertion sort, descending', '试卷 2 Q1：插入排序降序'] })}
${W('sheetBubbleRows', { arr: [6, 2, 8, 4], fixed: true })}
${W('sheetPass', { random: true, alg: 'insertion' })}
<h2>${T('Q2 — merge sort (12 marks)', 'Q2——归并排序（12 分）')}</h2>
${W('sheetMergeTree', { arr: [31, 12, 45, 7, 26, 18], fixed: true, title: ['Paper 1 Q2', '试卷 1 Q2'] })}
${W('sheetMergeTable', { list: [3, 11, 20, 6, 9, 14], mid: 2, fixed: true, title: ['Paper 2 Q2', '试卷 2 Q2'] })}
${W('sheetMergeTree', { random: true, title: ['random array', '随机数组'] })}
<h2>${T('Q3 — partition() (12 marks)', 'Q3——partition()（12 分）')}</h2>
${W('sheetPartition', { arr: [6, 11, 2, 9, 4, 13, 1], fixed: true, title: ['Paper 1 Q3', '试卷 1 Q3'] })}
${W('sheetPartition', { arr: ['M', 'R', 'C', 'T', 'A', 'K'], fixed: true, title: ['Paper 2 Q3 — letters', '试卷 2 Q3——字母'] })}
${W('sheetPartition', { random: true, title: ['random array (unlimited)', '随机数组（无限）'] })}
`}
]});

SITE.bank('paper', [
 /* sample paper 1 */
 { g: 'sA', c: 'ch1', t: 'mcq', q: ['[P1 Q1] Which sort finishes in one pass when the data is already in order?', '[P1 Q1] 数据已经有序时，哪种排序一趟就结束？'], o: [['Basic bubble sort', '基础冒泡'], ['Improved bubble sort', '改进冒泡'], ['Selection sort', '选择排序'], ['Merge sort', '归并排序']], a: 1 },
 { g: 'sA', c: 'ch1', t: 'mcq', q: ['[P1 Q2] Basic bubble sort on 6 items: total comparisons?', '[P1 Q2] 基础冒泡排序 6 个元素：一共比较几次？'], o: ['6', '15', '30', '36'], a: 1, e: ['5 + 4 + 3 + 2 + 1 = 15.', '5 + 4 + 3 + 2 + 1 = 15。'] },
 { g: 'sA', c: 'ch1', t: 'mcq', q: ['[P1 Q3] Selection sort (largest → end) on <code>[8 3 6 2 9]</code>: array after pass 1?', '[P1 Q3] 选择排序（最大值放末尾）<code>[8 3 6 2 9]</code>：第 1 趟后？'], o: ['8 3 6 2 9', '3 6 2 8 9', '2 3 6 8 9', '9 3 6 2 8'], a: 0, e: ['9 is already last → swapped with itself; the array is unchanged.', '9 已在最后 → 和自己交换；数组不变。'] },
 { g: 'sA', c: 'ch2', t: 'mcq', q: ['[P1 Q4] partition() returns…', '[P1 Q4] partition() 返回……'], o: [['the pivot value', 'pivot 的值'], ['the index of the cut', '切分点的下标'], ['the sorted array', '排好的数组'], ['the number of swaps', '交换次数']], a: 1 },
 { g: 'sA', c: 'ch2', t: 'mcq', q: ['[P1 Q5] mergeSort(a, 0, 5): first two calls?', '[P1 Q5] mergeSort(a, 0, 5)：前两个调用？'], o: ['(0, 2) and (3, 5)', '(0, 3) and (4, 5)', '(0, 2) and (2, 5)', '(0, 1) and (2, 5)'], a: 0, e: ['mid = 5 / 2 = 2.', 'mid = 5 / 2 = 2。'] },
 /* sample paper 2 */
 { g: 'sB', c: 'ch1', t: 'mcq', q: ['[P2 Q1] Insertion sort on reverse-ordered data of n items makes how many comparisons?', '[P2 Q1] 插入排序处理 n 个逆序元素要比较几次？'], o: ['n − 1', 'n(n−1)/2', 'n log n', 'n²'], a: 1 },
 { g: 'sB', c: 'ch1', t: 'mcq', q: ['[P2 Q2] Which sort always makes n(n−1)/2 comparisons, whatever the input?', '[P2 Q2] 无论输入如何，哪种排序永远比较 n(n−1)/2 次？'], o: [['Selection sort', '选择排序'], ['Insertion sort', '插入排序'], ['Improved bubble sort', '改进冒泡'], ['Quick sort', '快速排序']], a: 0 },
 { g: 'sB', c: 'ch2', t: 'mcq', q: ['[P2 Q3] Which sort is not in place?', '[P2 Q3] 哪种排序不是原地的？'], o: [['Merge sort', '归并排序'], ['Quick sort', '快速排序'], ['Selection sort', '选择排序'], ['Insertion sort', '插入排序']], a: 0 },
 { g: 'sB', c: 'ch2', t: 'mcq', q: ['[P2 Q4] Quick sort is O(n²) when…', '[P2 Q4] 快排什么时候是 O(n²)？'], o: [['the pivot always splits evenly', 'pivot 总是均匀切分'], ['the pivot is always the smallest or largest', 'pivot 总是最小或最大'], ['n is even', 'n 是偶数'], ['the array has duplicates', '数组有重复值']], a: 1 },
 { g: 'sB', c: 'ch2', t: 'mcq', q: ['[P2 Q5] merge() of <code>[1 4]</code> and <code>[2 3]</code>: how many comparisons?', '[P2 Q5] merge() 合并 <code>[1 4]</code> 和 <code>[2 3]</code>：比较几次？'], o: ['2', '3', '4', '1'], a: 1, e: ['1<2 → 1 · 4>2 → 2 · 4>3 → 3 · right half empty, copy 4 → 3 comparisons.', '1<2 → 1 · 4>2 → 2 · 4>3 → 3 · 右半空了，复制 4 → 3 次比较。'] }
]);
