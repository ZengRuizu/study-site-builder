/* =====================================================================
   ===== Sorting visualizer: step generators that follow the listings below line by line
   ===================================================================== */
const SORT_CODE = {
bubble: `void BubbleSort(int data[], int listSize)
{  int pass, hold;
   for (pass = 1; pass < listSize; pass++)
   {  // each pass pushes the biggest remaining value to the back
      for (int x = 0; x < listSize - pass; x++)
      {  // look at one pair of neighbours
         if (data[x] > data[x+1])
         {  // wrong order -> exchange them
            hold = data[x];
            data[x] = data[x+1];
            data[x+1] = hold;
         }
      }
   }
}`,
ibubble: `void BubbleSort(int data[], int n)
{  int hold;
   bool sorted = false;            // becomes true after a pass with no exchange
   for (int pass = 1; (pass < n) && !sorted; ++pass)
   {  sorted = true;               // optimistic until an exchange happens
      for (int x = 0; x < n - pass; ++x)
      {  if (data[x] > data[x+1])
         {  hold = data[x];        // exchange the pair
            data[x] = data[x+1];
            data[x+1] = hold;
            sorted = false;        // an exchange: we need another pass
         }
      }
   }
}`,
selection: `void SelectionSort(int Data[], int n)
{
   for (int last = n - 1; last >= 1; --last)
   {  // find the biggest value in Data[0..last]
      int largestIndex = 0;        // start by guessing index 0
      for (int p = 1; p <= last; ++p)
      {
         if (Data[p] > Data[largestIndex])
            largestIndex = p;
      }
      swap(Data[largestIndex], Data[last]);   // park it at the back
   }
}`,
insertion: `void InsertionSort(int data[], int n)
{  int item;
   int pass, insertIndex;
   for (pass = 1; pass < n; pass++)
   {
      item = data[pass];           // next value to place
      insertIndex = pass;
      while ((insertIndex > 0) && (data[insertIndex-1] > item))
      {  // bigger neighbour on the left: move it one step right
         data[insertIndex] = data[insertIndex-1];
         insertIndex--;
      }
      data[insertIndex] = item;    // drop the item into the gap
   }
}`,
merge: `void mergeSort(int theArray[], int first, int last)
{
   if (first < last)
   {
      int mid = (first + last) / 2;        // split point
      mergeSort(theArray, first, mid);     // left part
      mergeSort(theArray, mid + 1, last);  // right part
      merge(theArray, first, mid, last);   // combine both sorted parts
   }
}
void merge(int theArray[], int first, int mid, int last)
{
   int tempArray[MAX_SIZE];
   int first1 = first, last1 = mid, first2 = mid + 1, last2 = last;
   int index = first1;
   for (; (first1 <= last1) && (first2 <= last2); ++index)
      if (theArray[first1] < theArray[first2])
         tempArray[index] = theArray[first1++];
      else
         tempArray[index] = theArray[first2++];
   for (; first1 <= last1; ++first1, ++index)    // copy what is left on the left
      tempArray[index] = theArray[first1];
   for (; first2 <= last2; ++first2, ++index)    // copy what is left on the right
      tempArray[index] = theArray[first2];
   for (index = first; index <= last; ++index)   // write the result back
      theArray[index] = tempArray[index];
}`,
quick: `void quickSort(int T[], int first, int last)
{
   int cut;
   if (first < last)
   {
      cut = partition(T, first, last);
      quickSort(T, first, cut);
      quickSort(T, cut + 1, last);
   }
}
int partition(int T[], int first, int last)
{
   int pivot = T[first];               // first value is the pivot
   int bottom = first, top = last;
   bool going = true;  int cutPoint, temp;
   while (going)
   {
      while (T[top] > pivot)    top--;      // top walks left past bigger values
      while (T[bottom] < pivot) bottom++;   // bottom walks right past smaller values
      if (bottom < top)
      {  temp = T[bottom]; T[bottom] = T[top]; T[top] = temp;  }
      else
      {  going = false; cutPoint = top;  }
   }
   return cutPoint;
}`
};
const ALG_NAME = { bubble: 'Bubble sort', ibubble: 'Improved bubble sort', selection: 'Selection sort', insertion: 'Insertion sort', merge: 'Merge sort', quick: 'Quick sort' };
const ALG_ZH = { bubble: '冒泡排序', ibubble: '改进冒泡排序', selection: '选择排序', insertion: '插入排序', merge: '归并排序', quick: '快速排序' };

function sortRun(alg, input) {
  const a = input.slice(), n = a.length, st = [], log = [], c = { cmp: 0, swp: 0, shf: 0 };
  let done = [], err = null;
  const push = o => { if (st.length > 6000) throw new Error('too many steps'); st.push(Object.assign({ a: a.slice(), done: done.slice(), c: Object.assign({}, c) }, o)); };
  const L = (en, zh) => [en, zh];
  const sw = (i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; };
  const range = (lo, hi) => { const r = []; for (let i = lo; i <= hi; i++) r.push(i); return r; };
  try {
  push({ line: [], msg: L('Start — unsorted list', '开始——未排序列表') });
  if (alg === 'bubble' || alg === 'ibubble') {
    const imp = alg === 'ibubble'; const lc = imp ? 7 : 7, ls = imp ? [8, 9, 10, 11] : [9, 10, 11], lp = imp ? 4 : 3;
    let sorted = false;
    for (let pass = 1; pass < n && !sorted; pass++) {
      if (imp) sorted = true; let swaps = 0;
      push({ line: [lp], msg: L(`Pass ${pass}: compare adjacent pairs from index 0 to ${n - pass - 1}`, `第 ${pass} 趟：比较下标 0 到 ${n - pass - 1} 的相邻对`) });
      for (let x = 0; x < n - pass; x++) {
        c.cmp++; push({ cmp: [x, x + 1], line: [lc], msg: L(`Compare data[${x}]=${a[x]} and data[${x + 1}]=${a[x + 1]}${a[x] > a[x + 1] ? ' → out of order' : ' → OK, no swap'}`, `比较 data[${x}]=${a[x]} 与 data[${x + 1}]=${a[x + 1]}${a[x] > a[x + 1] ? ' → 顺序反了' : ' → 没问题，不交换'}`) });
        if (a[x] > a[x + 1]) { sw(x, x + 1); c.swp++; swaps++; if (imp) sorted = false; push({ swp: [x, x + 1], line: ls, msg: L(`Swap → ${a[x]}, ${a[x + 1]}`, `交换 → ${a[x]}, ${a[x + 1]}`) }); }
      }
      done = range(n - pass, n - 1);
      log.push({ k: st.length, label: L(`After pass ${pass}`, `第 ${pass} 趟后`), a: a.slice(), note: L(`${n - pass} comparisons, ${swaps} swaps${imp && sorted ? ' → no swap, list is sorted, STOP' : ''}`, `${n - pass} 次比较，${swaps} 次交换${imp && sorted ? ' → 没有交换，已排好，停止' : ''}`) });
      push({ line: [lp], msg: L(`End of pass ${pass}: ${a[n - pass]} is in its final position${imp && sorted ? '. No swaps in this pass → sorted = true → stop early!' : ''}`, `第 ${pass} 趟结束：${a[n - pass]} 已在最终位置${imp && sorted ? '。本趟没有交换 → sorted = true → 提前结束！' : ''}`) });
    }
    done = range(0, n - 1);
  } else if (alg === 'selection') {
    for (let last = n - 1; last >= 1; last--) {
      let li = 0; push({ ptr: { last, largest: li }, line: [5], msg: L(`last = ${last}: assume largest is at index 0 (${a[0]})`, `last = ${last}：先假设最大值在下标 0（${a[0]}）`) });
      for (let p = 1; p <= last; p++) {
        c.cmp++; push({ cmp: [p, li], ptr: { last, largest: li }, line: [8], msg: L(`Compare Data[${p}]=${a[p]} > Data[largestIndex=${li}]=${a[li]}?`, `比较 Data[${p}]=${a[p]} > Data[largestIndex=${li}]=${a[li]}？`) });
        if (a[p] > a[li]) { li = p; push({ ptr: { last, largest: li }, line: [9], msg: L(`Yes → largestIndex = ${p}`, `是 → largestIndex = ${p}`) }); }
      }
      sw(li, last); c.swp++;
      push({ swp: [li, last], ptr: { last, largest: li }, line: [11], msg: li === last ? L(`swap(Data[${li}], Data[${last}]) — same position! This basic version swaps anyway (a wasted swap).`, `swap(Data[${li}], Data[${last}])——同一位置！基础版照样交换（白交换）。`) : L(`Swap largest ${a[last]} into position ${last}`, `把最大值 ${a[last]} 换到位置 ${last}`) });
      done = range(last, n - 1);
      log.push({ k: st.length, label: L(`After pass ${n - last} (last = ${last})`, `第 ${n - last} 趟后（last = ${last}）`), a: a.slice(), note: L(`${last} comparisons, largestIndex = ${li}`, `${last} 次比较，largestIndex = ${li}`) });
    }
    done = range(0, n - 1);
  } else if (alg === 'insertion') {
    for (let pass = 1; pass < n; pass++) {
      const item = a[pass]; let ii = pass, cmps = 0;
      done = range(0, pass - 1);
      push({ ptr: { item: pass }, line: [6, 7], msg: L(`Pass ${pass}: item = data[${pass}] = ${item}; sorted region is [0..${pass - 1}]`, `第 ${pass} 趟：item = data[${pass}] = ${item}；已排序区为 [0..${pass - 1}]`), item });
      while (ii > 0) {
        c.cmp++; cmps++;
        push({ cmp: [ii - 1, ii], line: [8], msg: L(`Compare data[${ii - 1}]=${a[ii - 1]} > item ${item}?${a[ii - 1] > item ? ' Yes' : ' No → stop'}`, `比较 data[${ii - 1}]=${a[ii - 1]} > item ${item}？${a[ii - 1] > item ? ' 是' : ' 否 → 停'}`), item });
        if (a[ii - 1] > item) { a[ii] = a[ii - 1]; c.shf++; ii--; push({ swp: [ii, ii + 1], line: [10, 11], msg: L(`Shift ${a[ii + 1]} right to index ${ii + 1}`, `把 ${a[ii + 1]} 右移到下标 ${ii + 1}`), item, hole: ii }); }
        else break;
      }
      a[ii] = item; done = range(0, pass);
      push({ line: [13], msg: L(`Insert ${item} at index ${ii}`, `把 ${item} 插到下标 ${ii}`), ins: ii });
      log.push({ k: st.length, label: L(`After pass ${pass}`, `第 ${pass} 趟后`), a: a.slice(), note: L(`inserted ${item}; ${cmps} comparison(s)`, `插入 ${item}；${cmps} 次比较`) });
    }
    done = range(0, n - 1);
  } else if (alg === 'merge') {
    const ms = (f, l) => {
      push({ range: [f, l], line: [3], msg: L(`mergeSort(theArray, ${f}, ${l})${f < l ? '' : ' — one item, nothing to do'}`, `mergeSort(theArray, ${f}, ${l})${f < l ? '' : '——只有一项，什么都不做'}`) });
      if (f < l) {
        const mid = Math.floor((f + l) / 2);
        push({ range: [f, l], split: mid, line: [5], msg: L(`mid = (${f} + ${l}) / 2 = ${mid} → left [${f}..${mid}], right [${mid + 1}..${l}]`, `mid = (${f} + ${l}) / 2 = ${mid} → 左 [${f}..${mid}]，右 [${mid + 1}..${l}]`) });
        ms(f, mid); ms(mid + 1, l);
        const tmp = []; let i = f, j = mid + 1;
        while (i <= mid && j <= l) {
          c.cmp++; push({ range: [f, l], split: mid, cmp: [i, j], tmp: tmp.slice(), tf: f, line: [17], msg: L(`merge: ${a[i]} < ${a[j]}? → take ${a[i] < a[j] ? a[i] : a[j]}`, `合并：${a[i]} < ${a[j]}？→ 取 ${a[i] < a[j] ? a[i] : a[j]}`) });
          tmp.push(a[i] < a[j] ? a[i++] : a[j++]);
        }
        while (i <= mid) tmp.push(a[i++]); while (j <= l) tmp.push(a[j++]);
        push({ range: [f, l], split: mid, tmp: tmp.slice(), tf: f, line: [21, 22, 23, 24], msg: L('Copy the remaining items into tempArray', '把剩余项复制进 tempArray') });
        for (let k = 0; k < tmp.length; k++) a[f + k] = tmp[k];
        push({ range: [f, l], line: [25, 26], msg: L(`Copy tempArray back → [${f}..${l}] is now sorted`, `把 tempArray 复制回原数组 → [${f}..${l}] 已有序`) });
        log.push({ k: st.length, label: L(`merge(${f}, ${mid}, ${l})`, `merge(${f}, ${mid}, ${l})`), a: a.slice(), hl: [f, l], note: L(`[${a.slice(f, mid + 1 - 0).length ? '' : ''}${tmp.join(' ')}]`, `[${tmp.join(' ')}]`) });
      }
    };
    ms(0, n - 1); done = range(0, n - 1);
  } else if (alg === 'quick') {
    let calls = 0;
    const part = (f, l) => {
      const pivot = a[f]; let b = f, t = l;
      push({ range: [f, l], ptr: { pivot: f, bottom: b, top: t }, line: [13, 14], msg: L(`partition(T, ${f}, ${l}): pivot = T[${f}] = ${pivot}, bottom = ${f}, top = ${l}`, `partition(T, ${f}, ${l})：pivot = T[${f}] = ${pivot}，bottom = ${f}，top = ${l}`), pivot });
      for (let guard = 0; guard < 500; guard++) {
        while (true) { c.cmp++; const g = a[t] > pivot; push({ range: [f, l], ptr: { bottom: b, top: t }, cmp: [t], line: [18], msg: L(`T[top=${t}] = ${a[t]} > ${pivot}?${g ? ' Yes → top--' : ' No → stop top here'}`, `T[top=${t}] = ${a[t]} > ${pivot}？${g ? ' 是 → top--' : ' 否 → top 停在这里'}`), pivot }); if (g) t--; else break; if (t < f) throw new Error('top ran out of range'); }
        while (true) { c.cmp++; const g = a[b] < pivot; push({ range: [f, l], ptr: { bottom: b, top: t }, cmp: [b], line: [19], msg: L(`T[bottom=${b}] = ${a[b]} < ${pivot}?${g ? ' Yes → bottom++' : ' No → stop bottom here'}`, `T[bottom=${b}] = ${a[b]} < ${pivot}？${g ? ' 是 → bottom++' : ' 否 → bottom 停在这里'}`), pivot }); if (g) b++; else break; if (b > l) throw new Error('bottom ran out of range'); }
        if (b < t) {
          if (a[b] === a[t]) throw new Error('DUP');
          sw(b, t); c.swp++; push({ range: [f, l], ptr: { bottom: b, top: t }, swp: [b, t], line: [20, 21], msg: L(`bottom ${b} < top ${t} → swap T[${b}] and T[${t}]`, `bottom ${b} < top ${t} → 交换 T[${b}] 与 T[${t}]`), pivot });
        } else {
          push({ range: [f, l], ptr: { bottom: b, top: t }, line: [23, 25], msg: L(`bottom ${b} ≥ top ${t} → stop, cutPoint = top = ${t}`, `bottom ${b} ≥ top ${t} → 结束，cutPoint = top = ${t}`), pivot, cut: t });
          log.push({ k: st.length, label: L(`partition(T, ${f}, ${l})`, `partition(T, ${f}, ${l})`), a: a.slice(), hl: [f, l], note: L(`pivot ${pivot} → returns cut = ${t}; next: quickSort(T, ${f}, ${t}) and quickSort(T, ${t + 1}, ${l})`, `pivot ${pivot} → 返回 cut = ${t}；接着 quickSort(T, ${f}, ${t}) 和 quickSort(T, ${t + 1}, ${l})`), cut: t });
          return t;
        }
      }
      throw new Error('partition loop');
    };
    const qs = (f, l) => {
      if (++calls > 400) throw new Error('recursion');
      push({ range: [f, l], line: [4], msg: L(`quickSort(T, ${f}, ${l})${f < l ? '' : ' — first ≥ last, nothing to do'}`, `quickSort(T, ${f}, ${l})${f < l ? '' : '——first ≥ last，什么都不做'}`) });
      if (f < l) { const cut = part(f, l); qs(f, cut); qs(cut + 1, l); }
    };
    qs(0, n - 1); done = range(0, n - 1);
  }
  push({ line: [], msg: L('Done — the list is sorted', '完成——列表已排好') });
  } catch (e) { err = e.message; }
  return { st, log, c, a, err };
}

SITE.widgets.sortViz = (el, arg) => {
  let alg = arg.alg, arr = (arg.arr || [7, 8, 3, 1, 6]).slice();
  const algs = arg.algs || Object.keys(ALG_NAME);
  const presets = arg.presets || [];
  const build = () => {
    el.innerHTML = `<div class="w"><div class="wt">${T('Sorting visualizer — runs the code line by line', '排序可视化——逐行运行代码')}</div>
    <div class="row"><select class="in al">${algs.map(k => `<option value="${k}" ${k === alg ? 'selected' : ''}>${ALG_NAME[k]} / ${ALG_ZH[k]}</option>`).join('')}</select>
    <input class="in mono ar" value="${arr.join(' ')}" style="flex:1;min-width:180px"><button class="btn sm pri go">${T('Load', '载入')}</button><button class="btn sm rnd">🎲 ${T('Random', '随机')}</button></div>
    ${presets.length ? `<div class="row" style="font-size:13px">${T('Examples', '例子')}: ${presets.map(p => `<button class="btn sm ps" data-p="${p.join(' ')}">[${p.join(' ')}]</button>`).join('')}</div>` : ''}
    <div class="vz"></div></div>`;
    $('.al', el).onchange = e => { alg = e.target.value; run(); };
    $('.go', el).onclick = () => { const v = $('.ar', el).value.trim().split(/[\s,]+/).map(Number).filter(x => !isNaN(x)); if (v.length >= 2 && v.length <= 14) { arr = v; run(); } };
    $('.rnd', el).onclick = () => { arr = distinctInts(rint(5, 8), 1, 99); $('.ar', el).value = arr.join(' '); run(); };
    $$('.ps', el).forEach(b => b.onclick = () => { arr = b.dataset.p.split(' ').map(Number); $('.ar', el).value = arr.join(' '); run(); });
    run();
  };
  const run = () => {
    const R = sortRun(alg, arr); const vz = $('.vz', el);
    if (R.err) {
      vz.innerHTML = R.err === 'DUP' ? `<div class="warn">${T('This <code>partition()</code> loops forever on this input: two values equal to the pivot meet (bottom and top both stop on equal values and swapping them changes nothing). Use distinct numbers here.', '这个 <code>partition()</code> 遇到这个输入会死循环：两个等于 pivot 的值相遇（bottom 和 top 都停在相等的值上，交换也没变化）。请用不重复的数。')}</div>`
        : `<div class="warn">${T('This input cannot be visualized (' + esc(R.err) + '). Try distinct numbers.', '无法可视化这个输入（' + esc(R.err) + '）。请用互不相同的数。')}</div>`;
      return;
    }
    vz.innerHTML = `<div class="vzgrid"><div style="min-width:0"><div class="stage" style="overflow-x:auto;padding:6px 0"></div><div class="msg m" style="min-height:3em"></div>
      <div class="row cnt" style="font-size:14px"></div><div class="ctl"></div></div><div style="min-width:0">${codeHTML(SORT_CODE[alg])}</div></div>
      <div class="row" style="margin-top:10px"><button class="btn pri pstart">🧠 ${T('Test me: predict every step for this array', '考考我：预测这个数组的每一步')}</button></div><div class="pred"></div>
      <div class="plogw"><b>${T('Pass log (what the exam asks you to write)', '每趟结果（考试要你写的就是这个）')}</b><div class="plog"></div></div>`;
    const pre = $('pre', vz);
    const draw = (s, i) => {
      const n = s.a.length, ptrs = s.ptr || {};
      const inRange = k => !s.range || (k >= s.range[0] && k <= s.range[1]);
      let h = `<div style="display:flex;gap:5px;align-items:flex-end">`;
      for (let k = 0; k < n; k++) {
        let cls = 'box';
        if (s.done.includes(k)) cls += ' g';
        if (s.cmp && s.cmp.includes(k)) cls += ' b';
        if (s.swp && s.swp.includes(k)) cls += ' a';
        if (s.ins === k) cls += ' a';
        if (!inRange(k)) cls += ' dim';
        const labels = Object.entries(ptrs).filter(([, v]) => v === k).map(([kk]) => kk);
        const sep = s.split === k ? 'margin-right:14px;' : '';
        h += `<div style="text-align:center;${sep}"><div class="${cls}" style="min-width:42px">${s.hole === k && s.item !== undefined ? '<span style="opacity:.4">' + s.a[k] + '</span>' : s.a[k]}</div><div style="font-size:11px;color:var(--muted)">[${k}]</div><div style="font-size:11px;font-weight:700;color:var(--accent);min-height:14px">${labels.join('<br>')}</div></div>`;
      }
      h += `</div>`;
      if (s.tmp) h += `<div style="margin-top:6px;font-size:12px;color:var(--muted)">tempArray</div><div style="display:flex;gap:5px">${Array.from({ length: n }, (_, k) => { const v = k >= s.tf && k - s.tf < s.tmp.length ? s.tmp[k - s.tf] : null; return `<div class="box ${v === null ? 'dim' : 'b'}" style="min-width:42px;height:32px">${v === null ? '' : v}</div>`; }).join('')}</div>`;
      if (s.item !== undefined) h += `<div style="margin-top:6px;font-size:14px">item = <b style="font-family:var(--mono)">${s.item}</b></div>`;
      if (s.pivot !== undefined) h += `<div style="margin-top:6px;font-size:14px">pivot = <b style="font-family:var(--mono)">${s.pivot}</b></div>`;
      $('.stage', vz).innerHTML = h;
      $('.m', vz).innerHTML = T(s.msg[0], s.msg[1]);
      $('.cnt', vz).innerHTML = `${T('Comparisons', '比较')}: <b>${s.c.cmp}</b> · ${alg === 'insertion' ? T('Shifts', '移位') + ': <b>' + s.c.shf + '</b>' : alg === 'merge' ? '' : T('Swaps', '交换') + ': <b>' + s.c.swp + '</b>'}`;
      highlightLines(pre, s.line || []);
      $('.plog', vz).innerHTML = `<table class="t" style="font-size:14px">` + R.log.map(L => `<tr style="${L.k > i ? 'opacity:.25' : ''}"><td style="white-space:nowrap">${T(L.label[0], L.label[1])}</td><td style="font-family:var(--mono);white-space:nowrap">${L.a.map((v, k) => L.hl && (k < L.hl[0] || k > L.hl[1]) ? `<span style="color:var(--muted)">${v}</span>` : `<b>${v}</b>`).join(' ')}</td><td style="font-size:13px">${T(L.note[0], L.note[1])}</td></tr>`).join('') + `</table>`;
    };
    stepPlayer($('.ctl', vz), R.st, draw, { speed: 650 });
    const pred = $('.pred', vz), plogw = $('.plogw', vz);
    $('.pstart', vz).onclick = () => {
      let k = 0, score = 0; const res = [];
      plogw.style.display = 'none'; $('.pstart', vz).style.display = 'none';
      const norm = t => t.trim().split(/[\s,]+/).filter(Boolean).map(Number);
      const show = () => {
        const n = R.log.length;
        let h = `<div class="card" style="border-color:var(--blue)"><b>🧠 ${T('Predict every step', '预测每一步')}</b> <span style="font-size:13px;color:var(--muted)">${T('Write the whole array after each step, numbers separated by spaces. The pass log is hidden until you finish — don’t play the animation above.', '写出每一步之后的整个数组，数字用空格隔开。做完之前每趟结果是隐藏的——别去播放上面的动画。')}</span>
          <div style="font-family:var(--mono);margin:6px 0">${T('Start', '初始')}: [${arr.join(' ')}]</div><table class="t" style="font-size:14px">`;
        R.log.forEach((L, i) => { if (i < k) h += `<tr><td style="white-space:nowrap">${T(L.label[0], L.label[1])}</td><td style="font-family:var(--mono)">${res[i]}</td></tr>`; });
        if (k < n) h += `<tr><td style="white-space:nowrap">${T(R.log[k].label[0], R.log[k].label[1])}</td><td><input class="in mono pin" style="width:100%" placeholder="${arr.join(' ')}"></td></tr>`;
        h += `</table>`;
        h += k < n ? `<div class="row"><button class="btn sm pri pck">${T('Check', '检查')}</button><button class="btn sm pq">${T('Stop', '停止')}</button></div>`
          : `<div class="${score === n ? 'tip' : 'exam'}"><b>${T(`Score: ${score} / ${n}`, `得分：${score} / ${n}`)}</b> ${score === n ? T('— exam-ready for this algorithm.', '——这个算法可以上考场了。') : T('— step through the red ones in the visualizer above, then press 🎲 Random and try again.', '——在上面的可视化器里把红色的步骤走一遍，然后按 🎲 随机再试一次。')} <button class="btn sm pq">${T('Close', '关闭')}</button></div>`;
        h += `</div>`;
        pred.innerHTML = h;
        const pin = $('.pin', pred); if (pin) { pin.focus(); pin.onkeydown = e => { if (e.key === 'Enter') $('.pck', pred).click(); }; }
        const ck = $('.pck', pred); if (ck) ck.onclick = () => {
          const got = norm(pin.value), want = R.log[k].a; if (!got.length) return;
          const ok = got.length === want.length && got.every((v, j) => v === want[j]);
          if (ok) score++;
          res[k] = ok ? `<span class="tag-ok">✓ ${want.join(' ')}</span>` : `<span class="tag-no">✗ ${esc(pin.value.trim())}</span><br>${T('correct', '正确')}: <b>${want.join(' ')}</b>`;
          k++; show(); };
        $$('.pq', pred).forEach(b => b.onclick = () => { pred.innerHTML = ''; plogw.style.display = ''; $('.pstart', vz).style.display = ''; });
      };
      show();
    };
  };
  build();
};

/* helpers for quiz generators */
const fmtArr = a => a.join(' ');
/** random "array after pass k" fill-in question for bubble / selection (largest → end) / insertion */
function passDrill(alg) {
  const n = rint(5, 6), arr = distinctInts(n, 1, 60); const R = sortRun(alg, arr); const k = rint(1, Math.min(3, R.log.length));
  const nm = { bubble: ['bubble sort', '冒泡排序'], selection: ['selection sort (largest to the end)', '选择排序（最大值放到末尾）'], insertion: ['insertion sort', '插入排序'] }[alg];
  return { t: 'fill', q: [`Sort <code>[${fmtArr(arr)}]</code> into ascending order with <b>${nm[0]}</b>. Write the array <b>after pass ${k}</b>.`, `用<b>${nm[1]}</b>把 <code>[${fmtArr(arr)}]</code> 升序排列。写出<b>第 ${k} 趟后</b>的数组。`], a: [fmtArr(R.log[k - 1].a)], ph: 'e.g. 3 7 1 6 8',
    e: [R.log.slice(0, k).map((L, i) => `Pass ${i + 1}: ${fmtArr(L.a)}`).join('<br>'), R.log.slice(0, k).map((L, i) => `第 ${i + 1} 趟：${fmtArr(L.a)}`).join('<br>')] };
}
