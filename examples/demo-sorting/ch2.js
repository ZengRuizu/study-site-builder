/* Ch2 — merge sort & quick sort (original demo content) */
SITE.chapter({ id: 'ch2', num: 'Ch2', t: ['Merge sort & quick sort', '归并排序与快速排序'], sections: [

{ id: 's1', t: ['Merge sort', '归并排序'], html: () => `
<div class="big-idea"><span class="ico">🔑</span><div>${T('Both are divide and conquer, but they do the hard work at opposite ends: merge sort splits <b>blindly by position</b> and works when <b>joining</b>; quick sort works when <b>splitting by value</b> and needs no joining.', '两者都是分治，但把难活放在两头：归并<b>按位置盲分</b>，难在<b>合并</b>；快排<b>按数值划分</b>时干活，不需要合并。')}</div></div>
${C`
void mergeSort(int a[], int first, int last) {
    if (first < last) {
        int mid = (first + last) / 2;
        mergeSort(a, first, mid);       // left half includes mid
        mergeSort(a, mid + 1, last);
        merge(a, first, mid, last);     // both halves are sorted now
    }
}`}
${SITE.RVX.intdiv()}
${W('sortViz', { alg: 'merge', arr: [9, 3, 7, 1, 8, 2, 5], algs: ['merge'], presets: [[9, 3, 7, 1, 8, 2, 5], [3, 8, 10, 1, 9], [1, 2, 3, 4, 5, 6]] })}
${L([['merge() walks two pointers through the halves, copying the smaller front item into a temporary array, then copies the leftovers.', 'merge() 用两个指针走两半，每次把较小的队头复制到临时数组，最后复制剩余部分。'],
 ['Every level of the split tree does n work and there are about log₂n levels → <b>O(n log n) in every case</b>.', '分裂树每层做 n 的工作，大约 log₂n 层 → <b>任何情况都是 O(n log n)</b>。'],
 ['The price: a temporary array of size n (not in-place).', '代价：一个大小为 n 的临时数组（不是原地排序）。']])}
${QZ('ch2', 'merge')}
`},

{ id: 's2', t: ['Quick sort & partition()', '快速排序与 partition()'], html: () => `
${C`
int partition(int a[], int first, int last) {
    int pivot = a[first];
    int bottom = first - 1, top = last + 1;
    while (true) {
        do { top--; }    while (a[top] > pivot);     // top stops at a value <= pivot
        do { bottom++; } while (a[bottom] < pivot);  // bottom stops at a value >= pivot
        if (bottom < top) swap(a[bottom], a[top]);
        else return top;                             // the cut point
    }
}
// quickSort(a, first, cut);  quickSort(a, cut + 1, last);`}
${W('sortViz', { alg: 'quick', arr: [7, 2, 9, 4, 1, 8], algs: ['quick'], presets: [[7, 2, 9, 4, 1, 8], [4, 8, 1, 6, 3], [1, 2, 3, 4, 5, 6]] })}
${L([['partition() returns an <b>index</b> (the cut), not the pivot value. Everything in [first..cut] ≤ pivot ≤ everything in [cut+1..last].', 'partition() 返回<b>下标</b>（切分点），不是 pivot 的值。[first..cut] 里的都 ≤ pivot ≤ [cut+1..last] 里的。'],
 ['Good pivots split evenly → O(n log n). A pivot that is always the smallest or largest (sorted data with a first-element pivot) → <b>O(n²)</b>.', '好的 pivot 均匀切分 → O(n log n)。若 pivot 总是最小或最大（已排序数据 + 取首元素）→ <b>O(n²)</b>。']])}
${BOX('exam', 'Trace questions usually stop at the <b>first cut</b>: write each swap and the array after it, then the returned index and the next two calls.', '追踪题通常到<b>第一次切分</b>为止：写出每次交换和交换后的数组，再写返回的下标和接下来的两次调用。')}
${QZ('ch2', 'quick')}
`},

{ id: 's3', t: ['Compare + flashcards', '对比 + 记忆卡'], html: () => `
<table class="t"><tr><th></th><th>${T('Divides by', '按什么分')}</th><th>${T('Work happens in', '主要工作在')}</th><th>${T('Worst', '最坏')}</th><th>${T('Extra memory', '额外内存')}</th></tr>
<tr><td>${T('Merge sort', '归并')}</td><td>${T('position (halves)', '位置（对半）')}</td><td>merge()</td><td>O(n log n)</td><td>O(n)</td></tr>
<tr><td>${T('Quick sort', '快排')}</td><td>${T('value (pivot)', '数值（pivot）')}</td><td>partition()</td><td>O(n²)</td><td>${T('in place', '原地')}</td></tr></table>
${W('flashcards', 'ch2')}
${W('judgeDrill', 'facts')}
`},

{ id: 'test', t: ['Chapter test', '章节测试'], html: () => `
${QZ('ch2', 'final', ['Chapter 2 test', '第 2 章测试'])}
`}
]});

SITE.bank('ch2', [
 { g: 'merge', t: 'mcq', q: ['mergeSort(a, 0, 6): what are the first two recursive calls?', 'mergeSort(a, 0, 6)：前两个递归调用是？'], o: ['(0, 3) and (4, 6)', '(0, 2) and (3, 6)', '(0, 3) and (3, 6)', '(1, 3) and (4, 6)'], a: 0, e: ['mid = (0 + 6) / 2 = 3; left = [0..3], right = [4..6].', 'mid = (0 + 6) / 2 = 3；左 = [0..3]，右 = [4..6]。'] },
 { g: 'merge', t: 'fill', q: ['merge() on halves <code>[3 8 10]</code> and <code>[1 9]</code>. Result?', 'merge() 合并 <code>[3 8 10]</code> 和 <code>[1 9]</code>。结果？'], a: ['1 3 8 9 10'] },
 { g: 'merge', t: 'mcq', q: ['Merge sort on already sorted data is…', '归并排序处理已排好的数据是……'], o: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], a: 1 },
 { g: 'quick', t: 'fill', q: ['partition() on <code>[7 2 9 4 1 8]</code> (pivot = 7). Array when it returns?', 'partition() 处理 <code>[7 2 9 4 1 8]</code>（pivot = 7）。返回时的数组？'], a: ['1 2 4 7 9 8'], e: ['swap 7↔1 → 1 2 9 4 7 8 · swap 9↔7 → 1 2 7 4 9 8 · swap 7↔4 → 1 2 4 7 9 8 · bottom ≥ top → return 3.', '交换 7↔1 → 1 2 9 4 7 8 · 交换 9↔7 → 1 2 7 4 9 8 · 交换 7↔4 → 1 2 4 7 9 8 · bottom ≥ top → 返回 3。'] },
 { g: 'quick', t: 'mcq', q: ['Same array: which calls come next?', '同一数组：接下来调用哪两个？'], o: ['quickSort(0, 3) and quickSort(4, 5)', 'quickSort(0, 2) and quickSort(4, 5)', 'quickSort(0, 3) and quickSort(3, 5)', 'quickSort(1, 3) and quickSort(4, 5)'], a: 0, e: ['cut = 3 → (first, cut) = (0, 3) and (cut + 1, last) = (4, 5).', 'cut = 3 → (first, cut) = (0, 3) 和 (cut + 1, last) = (4, 5)。'] },
 /* chapter test */
 { g: 'final', t: 'mcq', q: ['mergeSort(a, 2, 7): the value of mid?', 'mergeSort(a, 2, 7)：mid 是多少？'], o: ['4', '4.5', '5', '3'], a: 0, e: ['(2 + 7) / 2 = 9 / 2 = 4 in integer division.', '(2 + 7) / 2 = 9 / 2 = 4（整数除法）。'] },
 { g: 'final', t: 'mcq', q: ['How many calls in total does mergeSort make for 7 items (including the first call)?', 'mergeSort 处理 7 个元素一共调用几次（含第一次）？'], o: ['7', '13', '14', '12'], a: 1, e: ['A binary split tree with 7 leaves has 7 − 1 = 6 internal nodes → 13 calls.', '7 个叶子的二叉分裂树有 7 − 1 = 6 个内部结点 → 13 次调用。'] },
 { g: 'final', t: 'fill', q: ['merge() on halves <code>[2 5 9]</code> and <code>[4 6 7]</code>. Result?', 'merge() 合并 <code>[2 5 9]</code> 和 <code>[4 6 7]</code>。结果？'], a: ['2 4 5 6 7 9'] },
 { g: 'final', t: 'fill', q: ['partition() on <code>[4 8 1 6 3]</code> (pivot = 4). Which index does it return?', 'partition() 处理 <code>[4 8 1 6 3]</code>（pivot = 4）。返回哪个下标？'], a: ['2'], e: ['4↔3 → 3 8 1 6 4 · 8↔4 → 3 4 1 6 8 · 4↔1 → 3 1 4 6 8 · return 2.', '4↔3 → 3 8 1 6 4 · 8↔4 → 3 4 1 6 8 · 4↔1 → 3 1 4 6 8 · 返回 2。'] },
 { g: 'final', t: 'fill', q: ['partition() on <code>[5 9 2 8 1 7]</code> (pivot = 5). Array when it returns?', 'partition() 处理 <code>[5 9 2 8 1 7]</code>（pivot = 5）。返回时的数组？'], a: ['1 2 5 8 9 7'], e: ['5↔1 → 1 9 2 8 5 7 · 9↔5 → 1 5 2 8 9 7 · 5↔2 → 1 2 5 8 9 7 · return 2.', '5↔1 → 1 9 2 8 5 7 · 9↔5 → 1 5 2 8 9 7 · 5↔2 → 1 2 5 8 9 7 · 返回 2。'] },
 { g: 'final', t: 'mcq', q: ['partition() on <code>[3 1 4 7 2]</code> (pivot = 3) returns cut = 2. Next calls?', 'partition() 处理 <code>[3 1 4 7 2]</code>（pivot = 3）返回 cut = 2。接下来调用？'], o: ['quickSort(0, 2) and quickSort(3, 4)', 'quickSort(0, 1) and quickSort(3, 4)', 'quickSort(0, 2) and quickSort(2, 4)', 'quickSort(0, 1) and quickSort(2, 4)'], a: 0 },
 { g: 'final', t: 'mcq', q: ['Quick sort with a first-element pivot is slowest on…', '取首元素为 pivot 的快排在哪种数据上最慢？'], o: [['already sorted data', '已排好的数据'], ['random data', '随机数据'], ['data with all different values', '值都不同的数据'], ['short arrays', '短数组']], a: 0, e: ['Each partition peels off one item → n levels → O(n²).', '每次划分只剥掉一个元素 → n 层 → O(n²)。'] },
 { g: 'final', t: 'multi', q: ['Which are true for merge sort? (select all)', '关于归并排序哪些正确？（多选）'], o: [['Needs a temporary array', '需要临时数组'], ['Splits by value', '按数值划分'], ['O(n log n) worst case', '最坏 O(n log n)'], ['Sorting work happens in merge()', '排序工作在 merge() 里']], a: [0, 2, 3] },
 { g: 'final', t: 'mcq', q: ['You need guaranteed O(n log n) and memory is plentiful. Pick:', '需要保证 O(n log n)，且内存充足。选：'], o: [['Merge sort', '归并排序'], ['Quick sort (first-element pivot)', '快排（首元素 pivot）'], ['Insertion sort', '插入排序'], ['Improved bubble sort', '改进冒泡']], a: 0 },
 { g: 'gen', t: 'gen', make: () => { const arr = distinctInts(rint(6, 8), 1, 50); const R = T1.partition(arr), cut = R.steps[R.steps.length - 1].cut, last = R.steps.filter(s => s.swap).pop();
   return { t: 'fill', q: [`partition() (pivot = first element) on <code>[${fmtArr(arr)}]</code>. Which index does it return?`, `partition()（pivot = 首元素）处理 <code>[${fmtArr(arr)}]</code>。返回哪个下标？`], a: [String(cut)],
     e: [R.steps.map(s => s.swap ? `swap ${s.swap} → ${fmtArr(s.a)}` : `return ${s.cut}`).join('<br>'), R.steps.map(s => s.swap ? `交换 ${s.swap} → ${fmtArr(s.a)}` : `返回 ${s.cut}`).join('<br>')] }; } }
]);
