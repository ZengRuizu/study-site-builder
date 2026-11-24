/* Ch1 — simple sorts (original demo content) */
SITE.chapter({ id: 'ch1', num: 'Ch1', t: ['Simple sorts', '简单排序'], sections: [

{ id: 's1', t: ['Bubble sort (+ improved)', '冒泡排序（含改进版）'], html: () => `
<div class="big-idea"><span class="ico">🔑</span><div>${T('One idea per algorithm is enough to rebuild the code: <b>bubble</b> = neighbours swap, <b>selection</b> = pick the extreme, <b>insertion</b> = slide into place.', '每个算法记住一个核心动作就能写出代码：<b>冒泡</b> = 邻居交换，<b>选择</b> = 挑出最值，<b>插入</b> = 滑进位置。')}</div></div>
${P('<b>Strategy</b>: walk through the array comparing <b>adjacent</b> pairs; swap any pair that is out of order. After one pass the largest value has moved to the last position, so each later pass can stop one place earlier.', '<b>策略</b>：从头到尾比较<b>相邻</b>的两项，顺序不对就交换。一趟之后最大值到了最后一个位置，所以之后每趟可以少比一个。')}
${W('sortViz', { alg: 'bubble', arr: [5, 1, 4, 2, 8], algs: ['bubble', 'ibubble'], presets: [[5, 1, 4, 2, 8], [9, 7, 5, 3, 1], [1, 2, 4, 3, 5], [1, 2, 3, 4, 5]] })}
${SITE.RVX.swap()}
<h2>${T('Counting the work', '数工作量')}</h2>
${L([['Basic version: (n−1) + (n−2) + … + 1 = <b>n(n−1)/2</b> comparisons in every case → O(n²).', '基础版：(n−1) + (n−2) + … + 1 = <b>n(n−1)/2</b> 次比较，任何情况都一样 → O(n²)。'],
 ['Improved version: a flag <code>sorted</code> is set to true at the start of each pass and to false on any swap. A pass with no swap ends the sort — <b>that pass is still counted</b>.', '改进版：每趟开始把 <code>sorted</code> 设为 true，发生交换就设为 false。没有交换的那一趟结束排序——<b>这一趟仍要算</b>。'],
 ['Improved version on sorted data: one pass, n − 1 comparisons → best case <b>O(n)</b>.', '改进版遇到已排好的数据：一趟、n − 1 次比较 → 最好情况 <b>O(n)</b>。']])}
${W('codeCloze', 'ibubble')}
${QZ('ch1', 'bubble')}
`},

{ id: 's2', t: ['Selection sort', '选择排序'], html: () => `
${P('<b>Strategy</b>: in each pass, find the <b>largest</b> value in the unsorted part and swap it into the <b>last unsorted position</b>. The sorted region grows from the right, one item per pass.', '<b>策略</b>：每趟在未排序部分找<b>最大值</b>，换到<b>未排序部分的最后一个位置</b>。有序区从右边长起，每趟加一个。')}
${W('sortViz', { alg: 'selection', arr: [4, 9, 2, 7, 1], algs: ['selection'], presets: [[4, 9, 2, 7, 1], [3, 8, 6, 1, 7], [1, 2, 3, 4, 5]] })}
${L([['Comparisons: always n(n−1)/2 — it must look at every unsorted item to be sure it found the largest. No early stop.', '比较次数：永远是 n(n−1)/2——必须看完所有未排序项才能确定最大值。不会提前停。'],
 ['Swaps: exactly one per pass in the basic code (even a value swapped with itself) → n − 1 swaps. The improved version skips the swap when the largest is already in place.', '交换次数：基础代码每趟恰好一次（即使是自己和自己换）→ n − 1 次。改进版在最大值已在位时跳过交换。'],
 ['Some textbooks select the <b>smallest</b> and move it to the <b>front</b>. Same idea, mirrored. In an exam, follow whichever code is printed.', '有些教材选<b>最小值</b>放到<b>前面</b>。思路一样，方向相反。考试时照印的代码做。']])}
${BOX('exam', 'A classic trap: the array does not change in a pass, yet the pass still counts one swap in the basic version (the largest was swapped with itself).', '经典陷阱：某一趟数组没变，但基础版这一趟仍然算一次交换（最大值和自己交换）。')}
${QZ('ch1', 'selection')}
`},

{ id: 's3', t: ['Insertion sort', '插入排序'], html: () => `
${P('<b>Strategy</b>: the left part is sorted. Take the next item, shift every bigger item in the sorted part one place right, and drop the item into the gap.', '<b>策略</b>：左边是有序区。取下一个元素，把有序区里比它大的项都右移一格，再把它放进空位。')}
${W('sortViz', { alg: 'insertion', arr: [6, 3, 8, 1], algs: ['insertion'], presets: [[6, 3, 8, 1], [9, 4, 6, 2, 7], [1, 2, 3, 4, 5, 6], [6, 5, 4, 3, 2, 1]] })}
${L([['Best case (already sorted): each new item needs one comparison → n − 1 comparisons, <b>O(n)</b>.', '最好情况（已排好）：每个新元素只比一次 → n − 1 次比较，<b>O(n)</b>。'],
 ['Worst case (reverse order): the item slides all the way to the front every time → n(n−1)/2 comparisons, <b>O(n²)</b>.', '最坏情况（逆序）：每次都滑到最前面 → n(n−1)/2 次比较，<b>O(n²)</b>。'],
 ['For descending order, flip the comparison: shift items that are <b>smaller</b>.', '要降序就把比较反过来：右移比它<b>小</b>的项。']])}
${QZ('ch1', 'insertion')}
`},

{ id: 's4', t: ['Compare the three + flashcards', '三者对比 + 记忆卡'], html: () => `
<table class="t"><tr><th></th><th>${T('Best', '最好')}</th><th>${T('Worst', '最坏')}</th><th>${T('Early stop?', '能提前停？')}</th></tr>
<tr><td>${T('Bubble (basic)', '冒泡（基础）')}</td><td>O(n²)</td><td>O(n²)</td><td>✗</td></tr>
<tr><td>${T('Bubble (improved)', '冒泡（改进）')}</td><td>O(n)</td><td>O(n²)</td><td>✓</td></tr>
<tr><td>${T('Selection', '选择')}</td><td>O(n²)</td><td>O(n²)</td><td>✗</td></tr>
<tr><td>${T('Insertion', '插入')}</td><td>O(n)</td><td>O(n²)</td><td>✓</td></tr></table>
${SITE.RVX.growth()}
${W('bucketGame', 'simple')}
${W('flashcards', 'ch1')}
${W('sheetSteps', { key: 'triangle' })}
`},

{ id: 'test', t: ['Chapter test', '章节测试'], html: () => `
${P('New questions — none of them appear in the sections above. Aim for zero wrong before moving on.', '全新题目——都没在上面的小节出现过。全对再往下走。')}
${QZ('ch1', 'final', ['Chapter 1 test', '第 1 章测试'])}
${QZ('ch1', 'gen', ['🎲 Random pass drills (unlimited)', '🎲 随机逐趟练习（无限）'])}
`}
]});

SITE.bank('ch1', [
 { g: 'bubble', t: 'fill', q: ['Bubble sort <code>[5 1 4 2 8]</code> ascending. Array after <b>pass 1</b>?', '冒泡排序 <code>[5 1 4 2 8]</code> 升序。<b>第 1 趟</b>后的数组？'], a: ['1 4 2 5 8'], e: ['5/1 swap; 5/4 swap; 5/2 swap; 5/8 no swap → 1 4 2 5 8.', '5/1 换；5/4 换；5/2 换；5/8 不换 → 1 4 2 5 8。'] },
 { g: 'bubble', t: 'mcq', q: ['Basic bubble sort on 5 items: how many comparisons in total?', '基础冒泡排序处理 5 个元素：一共比较几次？'], o: ['5', '10', '20', '25'], a: 1, e: ['4 + 3 + 2 + 1 = 10 = n(n−1)/2.', '4 + 3 + 2 + 1 = 10 = n(n−1)/2。'] },
 { g: 'bubble', t: 'mcq', q: ['Improved bubble sort on <code>[1 2 4 3 5]</code>: how many passes run?', '改进冒泡排序处理 <code>[1 2 4 3 5]</code>：一共运行几趟？'], o: ['1', '2', '3', '4'], a: 1, e: ['Pass 1 swaps 4/3; pass 2 makes no swap and ends the sort — it still counts.', '第 1 趟交换 4/3；第 2 趟无交换，排序结束——这一趟也要算。'] },
 { g: 'selection', t: 'fill', q: ['Selection sort (largest → end) on <code>[4 9 2 7 1]</code>. Array after <b>pass 1</b>?', '选择排序（最大值放末尾）处理 <code>[4 9 2 7 1]</code>。<b>第 1 趟</b>后的数组？'], a: ['4 1 2 7 9'], e: ['Largest = 9 at index 1; swap with the last item 1 → 4 1 2 7 9.', '最大值 9 在下标 1；与最后一项 1 交换 → 4 1 2 7 9。'] },
 { g: 'selection', t: 'mcq', q: ['Same array <code>[4 9 2 7 1]</code>: what happens in pass 2?', '同一数组 <code>[4 9 2 7 1]</code>：第 2 趟发生什么？'], o: [['7 is swapped with itself — the array does not change', '7 和自己交换——数组不变'], ['7 and 2 are swapped', '7 和 2 交换'], ['The sort stops', '排序结束'], ['4 moves to the end', '4 移到末尾']], a: 0, e: ['After pass 1: 4 1 2 7 | 9. Largest of 4 1 2 7 is 7, already last in the unsorted part → swapped with itself.', '第 1 趟后：4 1 2 7 | 9。4 1 2 7 中最大是 7，已在未排序部分末尾 → 和自己交换。'] },
 { g: 'selection', t: 'mcq', q: ['Basic selection sort on n items makes how many swaps?', '基础选择排序处理 n 个元素交换几次？'], o: ['0', 'n − 1', 'n(n−1)/2', ['depends on the data', '取决于数据']], a: 1 },
 { g: 'insertion', t: 'fill', q: ['Insertion sort <code>[6 3 8 1]</code> ascending. Array after <b>pass 3</b> (the last)?', '插入排序 <code>[6 3 8 1]</code> 升序。<b>第 3 趟</b>（最后一趟）后的数组？'], a: ['1 3 6 8'], e: ['Pass 1: 3 6 8 1 · pass 2: 3 6 8 1 · pass 3: 1 slides to the front → 1 3 6 8.', '第 1 趟：3 6 8 1 · 第 2 趟：3 6 8 1 · 第 3 趟：1 滑到最前 → 1 3 6 8。'] },
 { g: 'insertion', t: 'mcq', q: ['Insertion sort on <code>[6 3 8 1]</code>: total comparisons?', '插入排序处理 <code>[6 3 8 1]</code>：一共比较几次？'], o: ['3', '5', '6', '4'], a: 1, e: ['Pass 1: 1 (6 > 3) · pass 2: 1 (6 < 8, stop) · pass 3: 3 (1 passes 8, 6, 3) → 5.', '第 1 趟：1 次 · 第 2 趟：1 次（6 < 8 停）· 第 3 趟：3 次（1 越过 8、6、3）→ 5。'] },
 /* chapter test */
 { g: 'final', t: 'fill', q: ['Bubble sort <code>[6 2 9 1 5]</code> ascending. Array after <b>pass 2</b>?', '冒泡排序 <code>[6 2 9 1 5]</code> 升序。<b>第 2 趟</b>后的数组？'], a: ['2 1 5 6 9'], e: ['Pass 1: 2 6 1 5 9 · pass 2: 2 1 5 6 9.', '第 1 趟：2 6 1 5 9 · 第 2 趟：2 1 5 6 9。'] },
 { g: 'final', t: 'fill', q: ['Basic bubble sort <code>[6 2 9 1 5]</code>: total number of <b>swaps</b>?', '基础冒泡排序 <code>[6 2 9 1 5]</code>：一共<b>交换</b>几次？'], a: ['6'], e: ['3 + 2 + 1 + 0 = 6.', '3 + 2 + 1 + 0 = 6。'] },
 { g: 'final', t: 'fill', q: ['Selection sort (largest → end) <code>[3 8 6 1 7]</code>. Array after <b>pass 2</b>?', '选择排序（最大值放末尾）<code>[3 8 6 1 7]</code>。<b>第 2 趟</b>后的数组？'], a: ['3 1 6 7 8'], e: ['Pass 1: 8 ↔ 7 → 3 7 6 1 8 · pass 2: 7 ↔ 1 → 3 1 6 7 8.', '第 1 趟：8 ↔ 7 → 3 7 6 1 8 · 第 2 趟：7 ↔ 1 → 3 1 6 7 8。'] },
 { g: 'final', t: 'fill', q: ['Insertion sort <code>[9 4 6 2 7]</code> ascending: total <b>comparisons</b>?', '插入排序 <code>[9 4 6 2 7]</code> 升序：一共<b>比较</b>几次？'], a: ['8'], e: ['1 + 2 + 3 + 2 = 8 (pass 4: 7 passes 9, then 6 < 7 stops it).', '1 + 2 + 3 + 2 = 8（第 4 趟：7 越过 9，遇到 6 < 7 停）。'] },
 { g: 'final', t: 'mcq', q: ['Improved bubble sort on <code>[2 1 3 5 4]</code>: comparisons in total?', '改进冒泡排序处理 <code>[2 1 3 5 4]</code>：一共比较几次？'], o: ['4', '7', '9', '10'], a: 1, e: ['Pass 1 (4 comparisons) fixes both pairs; pass 2 (3 comparisons) has no swap → 7.', '第 1 趟（4 次比较）把两对都换好；第 2 趟（3 次）无交换 → 7。'] },
 { g: 'final', t: 'mcq', q: ['Improved selection sort on <code>[1 5 3 4 9]</code>: how many swaps?', '改进选择排序处理 <code>[1 5 3 4 9]</code>：交换几次？'], o: ['0', '1', '2', '4'], a: 2, e: ['Pass 1: 9 in place (skip) · pass 2: 5 ↔ 4 · pass 3: 4 ↔ 3 · pass 4: in place → 2 swaps.', '第 1 趟：9 已在位（跳过）· 第 2 趟：5 ↔ 4 · 第 3 趟：4 ↔ 3 · 第 4 趟：已在位 → 2 次。'] },
 { g: 'final', t: 'mcq', q: ['Data is almost sorted. Which simple sort is the worst choice?', '数据几乎有序。哪种简单排序最不合适？'], o: [['Improved bubble sort', '改进冒泡'], ['Insertion sort', '插入排序'], ['Selection sort', '选择排序'], ['They are all the same', '都一样']], a: 2, e: ['Selection sort always makes n(n−1)/2 comparisons; the other two stop early or barely shift.', '选择排序永远 n(n−1)/2 次比较；另外两个会提前停或几乎不用移动。'] },
 { g: 'final', t: 'multi', q: ['Which sorts are O(n) in their best case? (select all)', '哪些排序最好情况是 O(n)？（多选）'], o: [['Basic bubble sort', '基础冒泡'], ['Improved bubble sort', '改进冒泡'], ['Selection sort', '选择排序'], ['Insertion sort', '插入排序']], a: [1, 3] },
 { g: 'final', t: 'mcq', q: ['Insertion sort, descending, on <code>[2 7 4 9]</code>. Array after pass 2?', '插入排序降序处理 <code>[2 7 4 9]</code>。第 2 趟后的数组？'], o: ['7 2 4 9', '7 4 2 9', '2 4 7 9', '9 7 4 2'], a: 1, e: ['Pass 1: 7 2 4 9 · pass 2: 4 slides past 2 → 7 4 2 9.', '第 1 趟：7 2 4 9 · 第 2 趟：4 越过 2 → 7 4 2 9。'] },
 { g: 'gen', t: 'gen', make: () => passDrill('bubble') },
 { g: 'gen', t: 'gen', make: () => passDrill('selection') },
 { g: 'gen', t: 'gen', make: () => passDrill('insertion') }
]);
