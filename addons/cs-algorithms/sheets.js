/* =====================================================================
   ===== Answer-sheet drills for classic algorithms (exam-table layouts)
   Every widget: fill the boxes like on the answer booklet → Check / Show answer / New data.
   ===================================================================== */
(function () {
  const css = `
  .t1 .t1i{width:3.3em;padding:4px 3px;text-align:center;font-family:var(--mono);font-size:13.5px;border:1px solid var(--line);border-radius:6px;background:var(--panel);color:var(--ink)}
  .t1 .t1i.m{width:6.5em}.t1 .t1i.w{width:12em;text-align:left}.t1 .t1i.xw{width:100%;max-width:26em;text-align:left}
  .t1 select.t1i{width:auto;max-width:100%}
  .t1 select{max-width:100%}
  @media (max-width:480px){.t1 .t1i.m{width:5.2em}.t1 .t1i.w{width:9.5em}}
  .t1 .t1i.ok{border:2px solid var(--ok);background:var(--ok-soft);color:var(--ok);font-weight:700}
  .t1 .t1i.bad{border:2.5px dashed var(--bad);background:var(--bad-soft);color:var(--bad);font-weight:700;text-decoration:line-through}
  .t1 .t1blk{border:1px dashed var(--line);border-radius:10px;padding:8px 10px;margin:8px 0}
  .t1 .t1lab{font-size:13px;color:var(--muted)}
  .t1 .t1row{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;margin:4px 0}
  .t1 .t1arr{display:flex;flex-wrap:wrap;gap:3px;align-items:center}
  .t1 .t1arr .ix{display:inline-block;width:3.3em;text-align:center;font-size:11px;color:var(--muted);font-family:var(--mono)}
  .t1 .t1cells{overflow-x:auto;max-width:100%}
  .t1 .t1frame{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:6px 0;background:var(--panel2)}
  .t1 .t1arrow{color:var(--muted);font-size:13px;margin:2px 0 2px 14px}
  .t1 .t1score{font-weight:700}
  .t1 table.t td,.t1 table.t th{padding:4px 6px}
  `;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();

const t1norm = v => String(v == null ? '' : v).toLowerCase().replace(/[{}\[\]]/g, ' ').replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim();
const t1arrEq = (got, exp) => t1norm(got).split(' ').filter(x => x !== '-' && x !== '–').join(' ') === t1norm(exp).split(' ').filter(x => x !== '-').join(' ');
const t1fmt = a => a.join(' ');
const t1cmpVal = (got, exp) => {           // '-' / 'none' / empty-ish for an exhausted half
  if (exp === '-') return ['-', '–', 'none', 'x', 'null', '/'].includes(t1norm(got));
  return t1norm(got) === t1norm(exp);
};
const t1in = (k, cls = '', ph = '') => `<input class="t1i ${cls}" data-k="${k}" placeholder="${ph}" autocomplete="off" spellcheck="false">`;
const t1sel = (k, opts) => `<select class="t1i" data-k="${k}"><option value="">?</option>${opts.map(o => `<option value="${attr(o[0])}">${o[1]}</option>`).join('')}</select>`;

/** generic answer-sheet form.
 *  spec: { title, intro, body (html with t1in/t1sel keys), exp: {key: expected | {v, cmp}}, model (html shown with the answer), newData (fn → redraw) } */
function t1Form(el, spec) {
  el.innerHTML = `<div class="w t1"><div class="wt">${spec.title}</div>${spec.intro || ''}<div class="t1body">${spec.body}</div>
    <div class="row"><button class="btn sm pri ck">${T('Check', '检查')}</button><button class="btn sm sh">${T('Show answer', '看答案')}</button>
    <button class="btn sm cl">${T('Clear', '清空')}</button>${spec.newData ? `<button class="btn sm nw">🎲 ${T('New data', '换一组数据')}</button>` : ''}<span class="t1score">${wRecHTML('t1:' + (spec.key || String(spec.title).replace(/<[^>]+>/g, '').slice(0, 80)))}</span></div>
    <div class="t1model"></div></div>`;
  const rkey = 't1:' + (spec.key || String(spec.title).replace(/<[^>]+>/g, '').slice(0, 80));   // random sheets share one record per type
  const inputs = () => $$('[data-k]', el);
  const expOf = k => { const e = spec.exp[k]; return e && typeof e === 'object' && 'v' in e ? e : { v: e }; };
  const check = () => {
    let ok = 0, n = 0;
    inputs().forEach(i => { const e = expOf(i.dataset.k); if (e.v === undefined) return; n++;
      const good = e.cmp ? e.cmp(i.value, e.v) : t1norm(i.value) === t1norm(e.v); i.classList.toggle('ok', good); i.classList.toggle('bad', !good); if (good) ok++; });
    wRec(rkey, ok, n, spec.title);
    $('.t1score', el).innerHTML = `${ok} / ${n} ${ok === n ? '✅' : ''} ${wRecHTML(rkey)}`;
    return ok === n;
  };
  $('.ck', el).onclick = check;
  $('.sh', el).onclick = () => {
    inputs().forEach(i => { const e = expOf(i.dataset.k); if (e.v === undefined) return; i.value = e.show !== undefined ? e.show : e.v; i.classList.add('ok'); i.classList.remove('bad'); });
    $('.t1score', el).textContent = '';
    if (spec.model) $('.t1model', el).innerHTML = spec.model;
  };
  $('.cl', el).onclick = () => { inputs().forEach(i => { if (!i.dataset.keep) i.value = ''; i.classList.remove('ok', 'bad'); }); $('.t1score', el).textContent = ''; $('.t1model', el).innerHTML = ''; };
  if (spec.newData) $('.nw', el).onclick = spec.newData;
  $$('.cp', el).forEach(b => b.onclick = () => {        // "copy row above" buttons
    const from = $$(`[data-k^="${b.dataset.from}"]`, el), to = $$(`[data-k^="${b.dataset.to}"]`, el);
    to.forEach((t, i) => { if (from[i]) t.value = from[i].value; });
  });
  if (spec.after) spec.after(el);
}
const t1cells = (prefix, n, pre) => `<div class="t1cells"><div class="t1arr">${Array.from({ length: n }, (_, i) => `<span style="display:inline-flex;flex-direction:column;align-items:center"><span class="ix">[${i}]</span>${t1in(prefix + i).replace('>', pre ? ` value="${attr(pre[i])}" data-keep="1">` : '>')}</span>`).join('')}</div></div>`;
const t1arrShow = (a, hl = []) => `<div class="t1arr">${a.map((v, i) => `<span style="display:inline-flex;flex-direction:column;align-items:center"><span class="ix">[${i}]</span><span class="box ${hl.includes(i) ? 'a' : ''}" style="min-width:2.6em">${v}</span></span>`).join('')}</div>`;
const T1RANDARR = (n, lo = 1, hi = 60) => distinctInts(n, lo, hi);

/* ---------- Quick sort partition trace (exam format) ---------- */
const T1_PART_CODE = `int partition(int list[], int first, int last) {
    int pivot = list[first];        // (or a chosen pivot index)
    int bottom = first, top = last;
    while (true) {
        while (list[top] > pivot) top--;
        while (list[bottom] < pivot) bottom++;
        if (bottom < top)
            swap(list[bottom], list[top]);
        else
            return top;             // cutPoint
    }
}
void quickSort(int list[], int first, int last) {
    if (first < last) {
        int cut = partition(list, first, last);
        quickSort(list, first, cut);
        quickSort(list, cut + 1, last);
    }
}`;
SITE.widgets.sheetPartition = (el, arg = {}) => {
  let arr = arg.arr ? arg.arr.slice() : null, pi = arg.pivotIdx || 0;
  const make = () => { if (!arr || arg.random) { for (;;) { const a = T1RANDARR(rint(6, 9)); try { T1.partition(a); arr = a; break; } catch (e) { } } } };
  const draw = () => {
    make();
    const R = T1.partition(arr, 0, arr.length - 1, pi), n = arr.length, exp = {};
    let body = `<details><summary class="t1lab">${T('partition() code', 'partition() 代码')}</summary>${codeHTML(T1_PART_CODE)}</details>
      <div class="t1blk"><div class="t1row"><b>cut = partition(list, 0, ${n - 1})</b></div>
      <div class="t1row">pivot value = <b>${R.pivot}</b>${pi ? ` <span class="t1lab">(list[${pi}])</span>` : ''} · bottom = <b>0</b> · top = <b>${n - 1}</b></div>${t1arrShow(arr)}</div>`;
    R.steps.forEach((st, k) => {
      exp[`b${k}`] = String(st.bottom); exp[`t${k}`] = String(st.top);
      body += `<div class="t1blk"><div class="t1row"><span class="t1lab">${T('Step', '第')} ${k + 1}${T('', ' 步')}</span> bottom = ${t1in('b' + k)} top = ${t1in('t' + k)}`;
      if (st.swap) {
        exp[`s${k}a`] = String(st.swap[0]); exp[`s${k}b`] = String(st.swap[1]);
        body += ` swap(${t1in('s' + k + 'a')}, ${t1in('s' + k + 'b')})</div>`;
        st.a.forEach((v, i) => exp[`a${k}_${i}`] = String(v));
        body += `<div class="t1row"><span class="t1lab">${T('array after the swap', '交换后的数组')}</span>${k ? `<button class="btn sm cp" data-from="a${k - 1}_" data-to="a${k}_" title="copy">⧉ ${T('copy row above', '复制上一行')}</button>` : ''}</div>${t1cells(`a${k}_`, n, k ? null : arr)}</div>`;
      } else {
        exp.cut = String(st.cut); exp.q1a = '0'; exp.q1b = String(st.cut); exp.q2a = String(st.cut + 1); exp.q2b = String(n - 1);
        body += ` → bottom ≥ top → <b>cutPoint</b> = ${t1in('cut')}</div>
          <div class="t1row"><span class="t1lab">${T('Next recursive calls', '下一步递归调用')}</span></div>
          <div class="t1row"><code>quickSort(list, ${t1in('q1a')}, ${t1in('q1b')})</code> <code>quickSort(list, ${t1in('q2a')}, ${t1in('q2b')})</code></div></div>`;
      }
    });
    const fin = R.a;
    t1Form(el, { title: `${T('Quick sort partition trace', '快排 partition 追踪')} — ${arg.title ? T(arg.title[0], arg.title[1]) : T('exam format', '考试格式')}`,
      intro: P(`Trace <code>partition()</code> until the first cut. In every step write where <b>bottom</b> and <b>top</b> stop, the two values swapped, and the array after the swap. Steps shown here = steps needed (the exam sheet may give extra blocks — leave them empty).`,
        `追踪 <code>partition()</code> 到第一次切分。每一步写出 <b>bottom</b> 和 <b>top</b> 停在哪、交换的两个值、交换后的数组。这里给出的步数 = 实际需要的步数（答题纸可能多给几格——空着即可）。`),
      body, exp, newData: arg.fixed ? null : () => { arg.random = true; arr = null; draw(); },
      model: `<div class="note">${T('Partitioned array', '划分后的数组')}: <b>${t1fmt(fin)}</b> · cutPoint = <b>${R.cut}</b> → quickSort(list, 0, ${R.cut}) ${T('and', '和')} quickSort(list, ${R.cut + 1}, ${n - 1}).
        ${T(`Everything in [0..${R.cut}] is ≤ ${R.pivot}; everything in [${R.cut + 1}..${n - 1}] is ≥ ${R.pivot}.`, `[0..${R.cut}] 全部 ≤ ${R.pivot}；[${R.cut + 1}..${n - 1}] 全部 ≥ ${R.pivot}。`)}</div>` });
  };
  draw();
};

/* ---------- merge() trace table ---------- */
SITE.widgets.sheetMergeTable = (el, arg = {}) => {
  let list = arg.list ? arg.list.slice() : null, mid = arg.mid;
  const make = () => { if (!list || arg.random) { const k1 = rint(3, 4), k2 = rint(3, 4), v = T1RANDARR(k1 + k2, 1, 40); const L = v.slice(0, k1).sort((a, b) => a - b), R = v.slice(k1).sort((a, b) => a - b); list = L.concat(R); mid = k1 - 1; } };
  const draw = () => {
    make();
    const last = list.length - 1, rows = T1.mergeRows(list, 0, mid, last), exp = {};
    let body = `<div class="t1row">${T('first half', '前半')}: <b>${t1fmt(list.slice(0, mid + 1))}</b> &nbsp; ${T('second half', '后半')}: <b>${t1fmt(list.slice(mid + 1))}</b> &nbsp; <code>merge(list, 0, ${mid}, ${last})</code></div>
    <div class="t1cells"><table class="t"><tr><th>first1</th><th>first2</th><th>list[first1]</th><th>list[first2]</th><th>tempArray</th></tr>`;
    rows.forEach((r, k) => {
      exp[`f1_${k}`] = String(r.f1); exp[`f2_${k}`] = String(r.f2);
      exp[`v1_${k}`] = { v: r.v1 === null ? '-' : String(r.v1), cmp: t1cmpVal }; exp[`v2_${k}`] = { v: r.v2 === null ? '-' : String(r.v2), cmp: t1cmpVal };
      const shown = r.tmp.concat(Array(list.length - r.tmp.length).fill('-'));
      exp[`tp_${k}`] = { v: t1fmt(r.tmp), cmp: t1arrEq, show: '{' + shown.join(', ') + '}' };
      body += `<tr><td>${t1in('f1_' + k)}</td><td>${t1in('f2_' + k)}</td><td>${t1in('v1_' + k)}</td><td>${t1in('v2_' + k)}</td><td>${t1in('tp_' + k, 'w', '2 4 6 - - -')}</td></tr>`;
    });
    body += `</table></div>`;
    t1Form(el, { title: `${T('merge() trace table', 'merge() 追踪表')}${arg.title ? ' — ' + T(arg.title[0], arg.title[1]) : ''}`,
      intro: P('One row per item copied into <code>tempArray</code>: the two indices being compared, their values (write <b>-</b> when a half is used up), then tempArray after the copy.', '每复制一个元素到 <code>tempArray</code> 写一行：正在比较的两个下标、它们的值（某一半用完就写 <b>-</b>），然后是复制后的 tempArray。'),
      body, exp, newData: arg.fixed ? null : () => { arg.random = true; list = null; draw(); } });
  };
  draw();
};

/* ---------- merge sort recursion tree ---------- */
SITE.widgets.sheetMergeTree = (el, arg = {}) => {
  let arr = arg.arr ? arg.arr.slice() : null;
  const draw = () => {
    if (!arr || arg.random) arr = T1RANDARR(rint(5, 7), 1, 90);
    const { calls } = T1.mergeTree(arr), exp = {}, maxD = Math.max(...calls.map(c => c.d));
    let body = `<div class="t1lab">${T('Divide (top → bottom). Fill the index range of each mergeSort() call and the items it holds.', '拆分（从上到下）。填每个 mergeSort() 调用的下标范围和它包含的元素。')}</div>`;
    for (let d = 0; d <= maxD; d++) {
      body += `<div class="t1blk"><span class="t1lab">${T('Level', '第')} ${d}${T('', ' 层')}</span><div class="t1row">`;
      calls.filter(c => c.d === d).forEach(c => {
        const k = `${c.f}_${c.l}`;
        if (d === 0) body += `<code>mergeSort(a, ${c.f}, ${c.l})</code> [ ${t1fmt(c.before)} ]`;
        else { exp[`f${k}`] = String(c.f); exp[`l${k}`] = String(c.l); exp[`e${k}`] = { v: t1fmt(c.before), cmp: t1arrEq };
          body += `<span><code>mergeSort(a, ${t1in('f' + k)}, ${t1in('l' + k)})</code> ${t1in('e' + k, 'm', 'items')}</span>`; }
      });
      body += `</div></div>`;
    }
    body += `<div class="t1lab">${T('Merge (bottom → top). Fill the merged result of every merge(a, first, mid, last).', '合并（从下到上）。填每个 merge(a, first, mid, last) 合并后的结果。')}</div>`;
    for (let d = maxD; d >= 0; d--) {
      const ms = calls.filter(c => c.d === d && c.f < c.l); if (!ms.length) continue;
      body += `<div class="t1blk"><div class="t1row">`;
      ms.forEach(c => { const k = `${c.f}_${c.l}`; exp[`m${k}`] = { v: t1fmt(c.after), cmp: t1arrEq };
        body += `<span><code>merge(a, ${c.f}, ${c.m}, ${c.l})</code> → ${t1in('m' + k, d === 0 ? 'w' : 'm')}</span>`; });
      body += `</div></div>`;
    }
    t1Form(el, { title: `${T('Merge sort recursion tree', '归并排序递归树')}${arg.title ? ' — ' + T(arg.title[0], arg.title[1]) : ''}`,
      intro: P('Rule: <code>mid = (first + last) / 2</code> (integer division) and the <b>left half includes mid</b>. Single items are not split further.', '规则：<code>mid = (first + last) / 2</code>（整除），<b>左半包含 mid</b>。单个元素不再拆。'),
      body, exp, newData: arg.fixed ? null : () => { arg.random = true; draw(); } });
  };
  draw();
};

/* ---------- pass tables for simple sorts ---------- */
const T1_ALG = {
  bubble: ['Bubble sort (basic, n−1 passes)', '冒泡排序（基础版，n−1 趟）'],
  ibubble: ['Improved bubble sort (stop after a pass with no swap)', '改进冒泡（某趟无交换即停）'],
  selection: ['Selection sort (largest → end, swaps every pass)', '选择排序（最大值放末尾，每趟都交换）'],
  iselection: ['Improved selection sort (no swap if already in place)', '改进选择排序（已在位就不交换）'],
  selmin: ['Selection sort, minIndex → front variant', '选择排序，最小值放前面的版本'],
  insertion: ['Insertion sort, ascending', '插入排序，升序'],
  insertionDesc: ['Insertion sort, descending', '插入排序，降序']
};
SITE.widgets.sheetPass = (el, arg = {}) => {
  let arr = arg.arr ? arg.arr.slice() : null, alg = arg.alg || 'ibubble';
  const draw = () => {
    if (!arr || arg.random) arr = T1RANDARR(rint(5, 6), 1, 60);
    const P_ = T1.passes(arr, alg), n = arr.length, exp = {}, counts = arg.counts !== false && ['ibubble', 'iselection', 'bubble', 'selection', 'selmin'].includes(alg);
    let tc = 0, ts = 0;
    let body = `${arg.fixed ? '' : `<div class="t1row">${T('Algorithm', '算法')}: <select class="algsel in">${Object.entries(T1_ALG).map(([k, v]) => `<option value="${k}" ${k === alg ? 'selected' : ''}>${v[1]} · ${v[0]}</option>`).join('')}</select></div>`}
      <div class="t1row"><b>${T(T1_ALG[alg][0], T1_ALG[alg][1])}</b></div><div class="t1lab">${T('Initial array', '初始数组')}</div>${t1arrShow(arr)}`;
    P_.forEach((p, k) => {
      p.a.forEach((v, i) => exp[`p${k}_${i}`] = String(v));
      body += `<div class="t1blk"><div class="t1row"><b>${T('After pass', '第')} ${p.pass}${T('', ' 趟后')}</b>${k ? `<button class="btn sm cp" data-from="p${k - 1}_" data-to="p${k}_">⧉ ${T('copy row above', '复制上一行')}</button>` : ''}`;
      if (counts) { exp[`c${k}`] = String(p.cmp); exp[`s${k}`] = String(p.swp); tc += p.cmp; ts += p.swp;
        body += ` <span>${T('comparisons', '比较')} ${t1in('c' + k)}</span> <span>${T('swaps', '交换')} ${t1in('s' + k)}</span>`; }
      body += `</div>${t1cells(`p${k}_`, n)}</div>`;
    });
    if (counts) { exp.tc = String(tc); exp.ts = String(ts); body += `<div class="t1row"><b>${T('Total comparisons', '总比较次数')}</b> ${t1in('tc')} <b>${T('Total swaps', '总交换次数')}</b> ${t1in('ts')}</div>`; }
    const notes = {
      ibubble: T(`Stops after pass ${P_.length} because ${P_[P_.length - 1].swp === 0 ? 'that pass made no swap' : 'all n−1 passes are done'}.`, `在第 ${P_.length} 趟后停止，因为${P_[P_.length - 1].swp === 0 ? '这一趟没有交换' : 'n−1 趟都做完了'}。`),
      selection: T('This basic code swaps every pass, even when the largest is already at <code>last</code> (a wasted swap) → always n−1 swaps.', '基础版每趟都交换，即使最大值已在 <code>last</code>（白交换）→ 永远 n−1 次交换。'),
      iselection: T('Improved: skip the swap when <code>largestIndex == last</code> → best case (sorted data) 0 swaps, but comparisons stay n(n−1)/2.', '改进版：<code>largestIndex == last</code> 时不交换 → 最好情况（已有序）0 次交换，但比较仍是 n(n−1)/2。'),
      selmin: T('Variant: the <b>smallest</b> goes to the <b>front</b>. When a question prints code, follow the printed code.', '变体：<b>最小值</b>放到<b>前面</b>。题目印了代码就照代码做。'),
      insertion: T('Pass k inserts element [k] into the sorted left part.', '第 k 趟把 [k] 插入左边已排好的部分。'), insertionDesc: T('Descending: bigger items move left.', '降序：大的往左移。'),
      bubble: T('Basic version: always n−1 passes, pass k makes n−k comparisons.', '基础版：永远 n−1 趟，第 k 趟比较 n−k 次。') };
    t1Form(el, { title: `${T('Pass table', '逐趟表')}${arg.title ? ' — ' + T(arg.title[0], arg.title[1]) : ''}`, body, exp,
      intro: arg.vertical ? BOX('warn', 'The answer sheet draws each array <b>vertically with [0] at the bottom</b>. Copy carefully — reading upward is where people swap two cells by accident.', '答题纸把每个数组<b>竖着画，[0] 在最下面</b>。抄写要小心——从下往上读最容易把两格抄反。') : '',
      model: `<div class="note">${notes[alg] || ''}</div>`,
      newData: arg.fixed ? null : () => { arg.random = true; draw(); },
      after: e => { const s = $('.algsel', e); if (s) s.onchange = () => { alg = s.value; draw(); }; } });
  };
  draw();
};

/* ---------- bubble trace rows (pass, x, compare, output, arr) ---------- */
SITE.widgets.sheetBubbleRows = (el, arg = {}) => {
  let arr = arg.arr ? arg.arr.slice() : null;
  const draw = () => {
    if (!arr || arg.random) arr = T1RANDARR(4, 1, 20);
    const rows = T1.bubbleRows(arr), exp = {};
    let body = `${codeHTML(`int arr[] = {${arr.join(', ')}};\nfor (int pass = 1; pass < 4; pass++) {\n    for (int x = 0; x < 3; x++) {\n        if (arr[x] > arr[x+1]) {\n            cout << "swap" << "\\n";\n            temp = arr[x]; arr[x] = arr[x+1]; arr[x+1] = temp;\n        } else {\n            cout << "no swap" << "\\n";\n        }\n    }\n}`)}
    <div class="t1cells"><table class="t"><tr><th>pass</th><th>x</th><th>arr[x] &gt; arr[x+1]</th><th>${T('Output', '输出')}</th><th>arr</th></tr>`;
    rows.forEach((r, k) => {
      exp[`g${k}`] = r.gt ? 'true' : 'false'; exp[`o${k}`] = r.gt ? 'swap' : 'no swap'; exp[`a${k}`] = { v: t1fmt(r.a), cmp: t1arrEq, show: '{' + r.a.join(', ') + '}' };
      body += `<tr><td>${r.p}</td><td>${r.x}</td><td><code>${r.l} &gt; ${r.r}</code> ${t1sel('g' + k, [['true', 'true'], ['false', 'false']])}</td><td>${t1sel('o' + k, [['swap', 'swap'], ['no swap', 'no swap']])}</td><td>${t1in('a' + k, 'm')}</td></tr>`;
    });
    body += `</table></div>`;
    t1Form(el, { title: T('Bubble sort trace table', '冒泡排序追踪表'), body, exp,
      intro: P('This code never shrinks the inner loop (always x = 0, 1, 2), so every pass prints three lines.', '这段代码内层循环不缩短（x 永远是 0、1、2），所以每趟都输出三行。'),
      newData: arg.fixed ? null : () => { arg.random = true; draw(); } });
  };
  draw();
};

/* ---------- recursion tracing template ---------- */
SITE.widgets.sheetRec = (el, arg = {}) => {
  let fn = arg.fn, args = arg.args;
  const rand = () => {
    const pick = ['addDown', 'sum', 'meet', 'power', 'fact', 'triple', 'digits'][rint(0, 6)];
    const A = { addDown: () => [rint(2, 4), rint(1, 9)], sum: () => [rint(100, 999)], meet: () => { const x = rint(1, 4); return [x, x + rint(2, 5)]; }, power: () => [rint(2, 3), rint(2, 4)],
      fact: () => [rint(3, 5)], triple: () => [2 * rint(1, 3)], digits: () => [rint(100, 9999)] }[pick]();
    fn = pick; args = A;
  };
  const draw = () => {
    if (!fn || arg.random) rand();
    const F = T1.REC[fn], fr = T1.recFrames(fn, args), exp = {};
    let body = `${codeHTML(`${F.sig} {\n${F.code.map(l => '    ' + l).join('\n')}\n}`)}<div class="t1row"><code>cout &lt;&lt; ${fn}(${args.join(', ')});</code></div>`;
    fr.forEach((f, k) => {
      exp[`a${k}`] = f.args.join(', '); exp[`r${k}`] = String(f.ret);
      exp[`k${k}`] = 'base' in f ? 'base' : 'general';
      if (!('base' in f)) exp[`n${k}`] = f.next.join(', ');
      body += `${k ? `<div class="t1arrow">↓ ${T('calls', '调用')}</div>` : ''}<div class="t1frame" style="margin-left:${Math.min(k, 4) * 8}px"><div class="t1row"><code>${fn}(</code>${k ? t1in('a' + k, 'm') : `<b>${f.args.join(', ')}</b>`}<code>)</code>
        <span>${T('case', '情况')}: ${t1sel('k' + k, [['base', 'base / 基本'], ['general', 'general / 一般']])}</span></div>
        <div class="t1row">${'base' in f ? `<span class="t1lab">${T('no further call', '不再调用')}</span>` : `<span>${T('next call', '下一次调用')}: <code>${fn}(</code>${t1in('n' + k, 'm')}<code>)</code></span>`}
        <span>↑ return ${t1in('r' + k, 'm')}</span></div></div>`;
      if (k === 0) exp[`a0`] = undefined;
    });
    exp.out = String(fr[0].ret);
    body += `<div class="t1row"><b>${T('Value printed', '打印的值')}</b> ${t1in('out', 'm')}</div>`;
    t1Form(el, { title: `${T('Recursion trace template', '递归追踪模板')}${arg.title ? ' — ' + T(arg.title[0], arg.title[1]) : ''}`,
      intro: P('Go <b>down</b> writing each call’s arguments, then come back <b>up</b> filling the return values from the base case to the first call. Integer division: <code>123 / 10 = 12</code>.', '先往<b>下</b>写每次调用的参数，再从基本情况往<b>上</b>回填返回值，直到第一次调用。整数除法：<code>123 / 10 = 12</code>。'),
      body, exp, newData: arg.fixed ? null : () => { arg.random = true; draw(); },
      model: `<div class="note">${fr.map(f => `${fn}(${f.args.join(', ')})`).join(' → ')} ⇒ ${T('returns', '返回')} ${fr.slice().reverse().map(f => f.ret).join(' → ')}</div>` });
  };
  draw();
};

/* ---------- step-count table (count iterations per line) ---------- */
// every line in a loop counts as many times as the loop body runs; header line = number of iterations
const T1_STEPS = {
  triangle: { t: ['Dependent inner loop (b ≤ a)', '内层依赖外层（b ≤ a）'], rows: [['for (int a = 1; a <= n; a++)', 'n'], ['    for (int b = 1; b <= a; b++)', 'n(n+1)/2'], ['        cout << "step";', 'n(n+1)/2']],
    total: 'n + n(n+1)', big: 'n2', why: ['Inner loop runs 1 + 2 + … + n = n(n+1)/2 times in total.', '内层总共运行 1 + 2 + … + n = n(n+1)/2 次。'] }
};
const T1_BIGO = [['1', 'O(1)'], ['logn', 'O(log₂n)'], ['n', 'O(n)'], ['nlogn', 'O(n log₂n)'], ['n2', 'O(n²)'], ['n3', 'O(n³)'], ['2n', 'O(2ⁿ)']];
function t1RandSteps() {
  const kind = rint(0, 4), a = rint(0, 3), lt = rint(0, 1), up = lt ? `i < n` : `i <= n`, it = lt ? `n-${a}` : (a ? `n-${a}+1` : 'n+1');
  const iters = lt ? `(n-${a})` : `(n-${a}+1)`;
  if (kind === 0) return { t: ['Random: single loop', '随机：单层循环'], rows: [['int sum = 0;', '1'], [`for (int i = ${a}; ${up}; i++) {`, iters], ['    sum = sum + i;', iters], ['    cout << sum;', iters], ['}', null]], total: `1 + 3${iters}`, big: 'n', why: [`Loop from ${a} ${lt ? 'to n−1' : 'to n'} → ${it} iterations (b − a + 1).`, `从 ${a} 到 ${lt ? 'n−1' : 'n'} → ${it} 次（b − a + 1）。`] };
  if (kind === 1) { const m = [2, 4][rint(0, 1)], s = [1, m][rint(0, 1)], cnt = s === 1 ? `(1+log${m}n)` : `log${m}n`;
    return { t: ['Random: multiplying loop', '随机：乘法循环'], rows: [[`int i = ${s};`, '1'], ['while (i <= n) {', cnt], ['    x++;', cnt], [`    i = i * ${m};`, cnt], ['}', null]], total: `1 + 3${cnt}`, big: 'logn', why: [`i = ${s}, ${s * m}, … ≤ n → ${s === 1 ? `1 + log${m}n` : `log${m}n`} iterations${s === 1 ? ' (i = 1 is counted too)' : ''}.`, `i = ${s}、${s * m}…≤ n → ${s === 1 ? `1 + log${m}n` : `log${m}n`} 轮${s === 1 ? '（i = 1 也算一轮）' : ''}。`] }; }
  if (kind === 2) return { t: ['Random: nested n × n', '随机：嵌套 n × n'], rows: [['for (int i = 1; i <= n; i++)', 'n'], ['    for (int j = 1; j <= n; j++)', 'n^2'], ['        cout << i * j;', 'n^2']], total: 'n + 2n^2', big: 'n2', why: ['Inner header and body run n · n times.', '内层循环头和循环体各运行 n · n 次。'] };
  if (kind === 3) return { t: ['Random: loop with a doubling inner loop', '随机：外层 n、内层翻倍'], rows: [['for (int i = 1; i <= n; i++) {', 'n'], ['    int j = 1;', 'n'], ['    while (j <= n) {', 'n(1+log2n)'], ['        cout << j;', 'n(1+log2n)'], ['        j = j * 2; }', 'n(1+log2n)'], ['}', null]], total: '2n + 3n(1+log2n)', big: 'nlogn', why: ['Each outer iteration runs the doubling loop 1 + log₂n times.', '外层每一轮，翻倍循环都跑 1 + log₂n 次。'] };
  return { t: ['Random: dependent inner loop', '随机：内层依赖外层'], rows: [['for (int a = 1; a <= n; a++)', 'n'], ['    for (int b = 1; b <= a; b++)', 'n(n+1)/2'], ['        cout << a + b;', 'n(n+1)/2']], total: 'n + n(n+1)', big: 'n2', why: ['1 + 2 + … + n = n(n+1)/2.', '1 + 2 + … + n = n(n+1)/2。'] };
}
const t1exprShow = s => s.replace(/log(\d)n/g, (m, b) => `log${'₀₁₂₃₄'[b]}n`).replace(/\^2/g, '²').replace(/-/g, ' − ').replace(/\+/g, ' + ');
SITE.widgets.sheetSteps = (el, arg = {}) => {
  let P_ = typeof arg === 'string' ? T1_STEPS[arg] : arg.key ? T1_STEPS[arg.key] : null;
  const draw = () => {
    if (!P_ || arg.random) P_ = t1RandSteps();
    const exp = {};
    let body = `<div class="t1cells"><table class="t"><tr><th>${T('Statement', '语句')}</th><th>${T('Number of steps', '步数')}</th></tr>`;
    P_.rows.forEach(([code, cnt], k) => {
      if (cnt !== null) exp[`r${k}`] = { v: cnt, cmp: (g, e) => T1.sameExpr(g, e), show: t1exprShow(cnt) };
      body += `<tr><td><code style="white-space:pre">${esc(code)}</code></td><td>${cnt === null ? '' : t1in('r' + k, 'm')}</td></tr>`;
    });
    exp.tot = { v: P_.total, cmp: (g, e) => T1.sameExpr(g, e), show: t1exprShow(P_.total) }; exp.big = P_.big;
    body += `<tr><td><b>${T('Total steps', '总步数')}</b></td><td>${t1in('tot', 'w')}</td></tr><tr><td><b>Big-O</b></td><td>${t1sel('big', T1_BIGO)}</td></tr></table></div>`;
    t1Form(el, { title: `${T('Step-count table', '步数表')} — ${T(P_.t[0], P_.t[1])}`, body, exp,
      intro: P('Method: a loop header counts the <b>number of iterations</b>; each line inside counts the same; nested lines multiply. Type expressions like <code>n-1</code>, <code>(n-1)log4n</code>, <code>n^2</code>, <code>2n(1+log2n)</code> — any equivalent form is accepted.', '方法：循环头记<b>迭代次数</b>；循环里每行同样多；嵌套就相乘。输入 <code>n-1</code>、<code>(n-1)log4n</code>、<code>n^2</code>、<code>2n(1+log2n)</code> 这类表达式——等价写法都算对。'),
      model: `<div class="note">${T(P_.why[0], P_.why[1])}<br>${T('Total', '总步数')} = ${t1exprShow(P_.total)} → <b>${T1_BIGO.find(b => b[0] === P_.big)[1]}</b></div>`,
      newData: arg.fixed ? null : () => { arg = { random: true }; draw(); } });
  };
  draw();
};
