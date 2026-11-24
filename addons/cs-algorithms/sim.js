/* =====================================================================
   ===== Exact simulators of the classic algorithms used by the answer-sheet drills
   Pure functions (no DOM) so they can be checked in Node.
   ===================================================================== */
const T1 = {};

/** partition() (first-element pivot, the classic textbook version): pivot = list[pivotIdx] (default first), bottom = first, top = last.
 *  Each loop iteration: top moves left while > pivot, bottom moves right while < pivot,
 *  then swap if bottom < top, else return top.  Returns {steps, cut, a, pivot}. */
T1.partition = (arr, first = 0, last = arr.length - 1, pivotIdx = first) => {
  const a = arr.slice(), pivot = a[pivotIdx], steps = [];
  let bottom = first, top = last, guard = 0;
  while (true) {
    if (++guard > 200) throw new Error('DUP');
    while (a[top] > pivot) top--;
    while (a[bottom] < pivot) bottom++;
    if (bottom < top) {
      const x = a[bottom], y = a[top]; a[bottom] = y; a[top] = x;
      steps.push({ bottom, top, swap: [x, y], a: a.slice() });
    } else { steps.push({ bottom, top, cut: top, a: a.slice() }); return { steps, cut: top, a, pivot, first, last }; }
  }
};

/** merge(list, first, mid, last) trace rows in the usual exam-table layout:
 *  each row = indices/values compared (or '-' if that half is used up) and tempArray after the move. */
T1.mergeRows = (list, first, mid, last) => {
  let f1 = first, f2 = mid + 1; const tmp = [], rows = [], n = last - first + 1;
  while (tmp.length < n) {
    const v1 = f1 <= mid ? list[f1] : null, v2 = f2 <= last ? list[f2] : null;
    const row = { f1, f2, v1, v2 };
    if (v2 === null || (v1 !== null && v1 <= v2)) { tmp.push(v1); f1++; } else { tmp.push(v2); f2++; }
    row.tmp = tmp.slice(); rows.push(row);
  }
  return rows;
};

/** merge sort recursion tree (mid = (first + last) / 2, left half includes mid) */
T1.mergeTree = (arr) => {
  const a = arr.slice(), calls = [];
  const ms = (f, l, d) => {
    const node = { f, l, d, before: a.slice(f, l + 1) }; calls.push(node);
    if (f < l) { const m = Math.floor((f + l) / 2); node.m = m; ms(f, m, d + 1); ms(m + 1, l, d + 1);
      const L = a.slice(f, m + 1), R = a.slice(m + 1, l + 1), out = []; let i = 0, j = 0;
      while (i < L.length || j < R.length) out.push(j >= R.length || (i < L.length && L[i] <= R[j]) ? L[i++] : R[j++]);
      out.forEach((v, k) => a[f + k] = v); node.after = out; }
    else node.after = node.before.slice();
  };
  ms(0, a.length - 1, 0);
  return { calls, sorted: a };
};

/** sort passes in exam-table form.
 *  alg: bubble (basic: n−1 passes, compares 0..n−pass−1), ibubble (stops after a pass with no swap),
 *  bubbleFixed (variant: every pass compares x = 0..n−2),
 *  selection (largest → index last, swaps every pass even with itself),
 *  iselection (improved: no swap when largest already at last),
 *  selmin (variant: minIndex → front, swaps every pass),
 *  insertion / insertionDesc.
 *  Returns [{pass, a, cmp, swp}] */
T1.passes = (arr, alg) => {
  const a = arr.slice(), n = a.length, out = [];
  const sw = (i, j) => { const t = a[i]; a[i] = a[j]; a[j] = t; };
  if (alg === 'bubble' || alg === 'ibubble' || alg === 'bubbleFixed') {
    for (let p = 1; p <= n - 1; p++) {
      let cmp = 0, swp = 0; const end = alg === 'bubbleFixed' ? n - 1 : n - p;
      for (let x = 0; x < end; x++) { cmp++; if (a[x] > a[x + 1]) { sw(x, x + 1); swp++; } }
      out.push({ pass: p, a: a.slice(), cmp, swp });
      if (alg === 'ibubble' && swp === 0) break;
    }
  } else if (alg === 'selection' || alg === 'iselection') {
    for (let last = n - 1, p = 1; last >= 1; last--, p++) {
      let li = 0, cmp = 0;
      for (let q = 1; q <= last; q++) { cmp++; if (a[q] > a[li]) li = q; }
      let swp = 0;
      if (alg === 'selection' || li !== last) { sw(li, last); swp = 1; }
      out.push({ pass: p, a: a.slice(), cmp, swp, li, last });
    }
  } else if (alg === 'selmin') {
    for (let i = 0; i < n - 1; i++) {
      let mi = i, cmp = 0;
      for (let j = i + 1; j < n; j++) { cmp++; if (a[j] < a[mi]) mi = j; }
      sw(i, mi); out.push({ pass: i + 1, a: a.slice(), cmp, swp: 1, mi });
    }
  } else if (alg === 'insertion' || alg === 'insertionDesc') {
    const before = alg === 'insertion' ? (x, y) => x > y : (x, y) => x < y;
    for (let k = 1; k < n; k++) {
      const v = a[k]; let j = k, cmp = 0, shift = 0;
      while (j > 0) { cmp++; if (before(a[j - 1], v)) { a[j] = a[j - 1]; j--; shift++; } else break; }
      a[j] = v; out.push({ pass: k, a: a.slice(), cmp, swp: shift });
    }
  }
  return out;
};

/** bubble trace table: pass 1..n−1, x 0..n−2 (no shrinking), one row per comparison */
T1.bubbleRows = (arr) => {
  const a = arr.slice(), n = a.length, rows = [];
  for (let p = 1; p < n; p++) for (let x = 0; x < n - 1; x++) {
    const l = a[x], r = a[x + 1], gt = l > r;
    if (gt) { a[x] = r; a[x + 1] = l; }
    rows.push({ p, x, l, r, gt, a: a.slice() });
  }
  return rows;
};

/** small recursive functions for tracing drills: each returns the list of frames [{args, next, ret}] */
T1.REC = {
  addDown: { sig: 'int addDown(int x, int y)', code: ['if (x == 0)', '    return y;', 'else', '    return addDown(x - 1, x + y);'],
        step: ([x, y]) => x === 0 ? { base: y } : { next: [x - 1, x + y] } },
  sum: { sig: 'int sum(int n)', code: ['if (n == 0)', '    return 0;', 'else', '    return n + sum(n / 10);'],
         step: ([n]) => n === 0 ? { base: 0 } : { next: [Math.trunc(n / 10)], comb: r => n + r } },
  meet: { sig: 'int meet(int x, int y)', code: ['if (x < y)', '    return meet(x + 1, y - 1);', 'else', '    return x + y;'],
              step: ([x, y]) => x < y ? { next: [x + 1, y - 1] } : { base: x + y } },
  power: { sig: 'int power(int x, int y)', code: ['if (y != 0)', '    return x * power(x, y - 1);', 'else', '    return 1;'],
                step: ([x, y]) => y !== 0 ? { next: [x, y - 1], comb: r => x * r } : { base: 1 } },
  fact: { sig: 'int fact(int x)', code: ['if (x == 1)', '    return 1;', 'else', '    return x * fact(x - 1);'],
        step: ([x]) => x === 1 ? { base: 1 } : { next: [x - 1], comb: r => x * r } },
  triple: { sig: 'int triple(int d)', code: ['if (d == 0)', '    return 1;', 'else', '    return 3 * triple(d - 2);'],
             step: ([d]) => d === 0 ? { base: 1 } : { next: [d - 2], comb: r => 3 * r } },
  digits: { sig: 'int digits(int n)', code: ['if (n < 10)', '    return n;', 'else', '    return n % 10 + digits(n / 10);'],
            step: ([n]) => n < 10 ? { base: n } : { next: [Math.trunc(n / 10)], comb: r => n % 10 + r } }
};
T1.recFrames = (fn, args) => {
  const F = T1.REC[fn], frames = []; let cur = args;
  for (let k = 0; k < 40; k++) {
    const s = F.step(cur); frames.push({ args: cur, ...s });
    if ('base' in s) break; cur = s.next;
  }
  if (!('base' in frames[frames.length - 1])) throw new Error('no base case reached');
  for (let i = frames.length - 1; i >= 0; i--) { const f = frames[i]; f.ret = 'base' in f ? f.base : (f.comb ? f.comb(frames[i + 1].ret) : frames[i + 1].ret); }
  return frames;
};

/** print-order functions (head vs tail recursion) — return the printed text */
T1.PRINT = {
  after: { code: n => `void func(int n) {\n    if (n > 0) {\n        func(n - 1);\n        cout << n << " ";\n    }\n}`, run: n => { const o = []; const f = k => { if (k > 0) { f(k - 1); o.push(k); } }; f(n); return o.join(' '); } },
  before: { code: n => `void func(int n) {\n    if (n > 0) {\n        cout << n << " ";\n        func(n - 1);\n    }\n}`, run: n => { const o = []; const f = k => { if (k > 0) { o.push(k); f(k - 1); } }; f(n); return o.join(' '); } },
  count: { code: n => `void count(int n) {\n    if (n > 0) count(n - 1);\n    cout << n << " ";\n}`, run: n => { const o = []; const f = k => { if (k > 0) f(k - 1); o.push(k); }; f(n); return o.join(' '); } },
};

/** step-count expression evaluator: accepts things like "2(n-1) + 3(n-1)log4n", "n²+2n", "1+3(1+log₂n)" */
T1.evalExpr = (s, n) => {
  let e = String(s).toLowerCase().replace(/\s+/g, '')
    .replace(/[−–]/g, '-').replace(/[·×]/g, '*').replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/₂/g, '2').replace(/₃/g, '3').replace(/₄/g, '4').replace(/lg/g, 'log2');
  if (!/^[0-9n+\-*/^().logq]*$/.test(e)) return NaN;
  e = e.replace(/log(\d)\(n\)/g, 'L$1').replace(/log(\d)n/g, 'L$1').replace(/log\(n\)/g, 'L2').replace(/logn/g, 'L2');   // log2n → L2
  // tokens: numbers, n, L<base>, operators, parentheses
  const toks = e.match(/\d+(\.\d+)?|n|L\d|[+\-*/^()]/g); if (!toks || toks.join('') !== e) return NaN;
  const out = [];
  const val = t => /^(\d|n|L)/.test(t);
  toks.forEach((t, i) => {   // implicit multiplication: 2n, 3(n-1), n log2n, (n-1)(n+1)
    const prev = toks[i - 1];
    if (i && (val(prev) || prev === ')') && (val(t) || t === '(')) out.push('*');
    out.push(t);
  });
  const js = out.join('').replace(/L(\d)/g, (m, b) => `(Math.log(n)/Math.log(${b}))`).replace(/\^/g, '**');
  try { const v = Function('n', `return ${js};`)(n); return typeof v === 'number' ? v : NaN; } catch (err) { return NaN; }
};
T1.sameExpr = (a, b) => [16, 64, 256, 4096].every(n => { const x = T1.evalExpr(a, n), y = T1.evalExpr(b, n); return isFinite(x) && isFinite(y) && Math.abs(x - y) < 1e-6 * Math.max(1, Math.abs(y)); });

if (typeof module !== 'undefined') module.exports = T1;
