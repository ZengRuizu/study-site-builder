/* =====================================================================
   study-site-builder ENGINE — generic, course-independent.
   Course content registers itself with SITE.chapter(), SITE.bank(), SITE.widgets, DECK.*, SITE.GLOSS, SITE.RVX.
   ===================================================================== */
/* =====================================================================
   CORE ENGINE
   ===================================================================== */
const SITE = { chapters: [], banks: {}, widgets: {}, course: {}, GLOSS: {}, RVX: {} };
const DSA = SITE;   // alias: older course files use DSA.*

/* ---- storage (wrapped: storage may be unavailable). Keys are namespaced per course id, because
   every file:// page in a browser shares one localStorage. ---- */
const lsKey = k => (SITE.course.id || 'site') + ':' + k;
const LS = {
  get(k, d) { try { const v = localStorage.getItem(lsKey(k)); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(lsKey(k), JSON.stringify(v)); } catch (e) {} }
};

/* ---- tiny helpers ---- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function attr(s) { return esc(s).replace(/"/g, '&quot;'); }
/** inline bilingual text */
function T(en, zh) { return `<span class="en">${en}</span><span class="zh">${zh == null ? en : zh}</span>`; }
/** paragraph bilingual */
function P(en, zh) { return `<p class="en">${en}</p><p class="zh">${zh}</p>`; }
/** list of bilingual items */
function L(items, ordered) { const t = ordered ? 'ol' : 'ul'; return `<${t}>` + items.map(x => `<li>${Array.isArray(x) ? T(x[0], x[1]) : x}</li>`).join('') + `</${t}>`; }
/** callout boxes: kind = note | tip | warn | exam */
function BOX(kind, en, zh) {
  const head = { note: ['Note', '注意'], tip: ['Tip', '技巧'], warn: ['Common mistake', '易错点'], exam: ['Exam focus', '考点'] }[kind];
  return `<div class="${kind}"><b class="h">${T(head[0], head[1])}</b>${T(en, zh)}</div>`;
}
/** collapsible, low-key refresher for background knowledge the slides assume */
function RV(en, zh, body) { return `<details class="rv"><summary>${T('Refresher: ' + en, '知识回顾：' + zh)}</summary><div class="rvb">${body}</div></details>`; }
/** inline code */
function K(s) { return `<code class="i">${esc(s)}</code>`; }
/** quiz placeholder: chapter bank + group */
function QZ(ch, group, title, tag) { return `<div class="quizmount" data-ch="${ch}" data-g="${group || ''}" data-tag="${tag || ''}" data-title="${title ? attr(JSON.stringify(title)) : ''}"></div>`; }
/** widget placeholder */
function W(name, arg) { return `<div class="wmount" data-w="${name}" data-arg="${arg ? attr(JSON.stringify(arg)) : ''}"></div>`; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
function distinctInts(n, lo, hi) { const s = new Set(); while (s.size < n) s.add(rint(lo, hi)); return shuffle([...s]); }

/* ---- C++ highlighter ---- */
const KW = new Set(('int double float char bool void long short unsigned const class struct public private protected return if else for while do new delete true false ' +
  'using namespace typedef enum this friend static sizeof break continue switch case default string fstream ifstream ofstream reinterpret_cast std cout cin endl ios').split(' '));
function hlLine(s) {
  const re = /(\/\/.*$|\/\*.*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(#\w+)|\b(\d+\.?\d*L?)\b|([A-Za-z_]\w*)/g;
  let out = '', last = 0, m;
  while ((m = re.exec(s))) {
    out += esc(s.slice(last, m.index));
    if (m[1]) out += `<span class="c-com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="c-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="c-pre">${esc(m[3])}</span>`;
    else if (m[4]) out += `<span class="c-num">${m[4]}</span>`;
    else if (m[5]) out += KW.has(m[5]) ? `<span class="c-kw">${m[5]}</span>` : (/^\s*\(/.test(s.slice(re.lastIndex)) ? `<span class="c-fn">${m[5]}</span>` : esc(m[5]));
    last = re.lastIndex;
  }
  return out + esc(s.slice(last));
}
function dedent(raw) {
  let lines = raw.replace(/^\n/, '').replace(/\s+$/, '').split('\n');
  const ind = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
  return lines.map(l => l.slice(ind));
}
function codeHTML(raw, cls) {
  const lines = dedent(raw);
  return `<pre class="code ${cls || ''}"><code>` + lines.map((l, i) => `<span class="l" data-n="${i + 1}">${hlLine(l) || ' '}</span>`).join('') + `</code></pre>`;
}
/** tagged template for code: C`...` keeps backslashes raw */
function C(s, ...v) { return codeHTML(String.raw(s, ...v)); }
function highlightLines(pre, lines) { $$('.l', pre).forEach((el, i) => el.classList.toggle('hl', lines.includes(i + 1))); }

/* ---- language ---- */
function setLang(l) {
  const h = document.documentElement; h.classList.remove('lang-en', 'lang-zh', 'lang-both'); h.classList.add('lang-' + l);
  $$('#langseg button').forEach(b => b.classList.toggle('on', b.dataset.l === l));
  LS.set('lang', l);
}

/* ---- registration ---- */
SITE.chapter = function (ch) { SITE.chapters.push(ch); };
SITE.bank = function (ch, list) {
  const arr = (SITE.banks[ch] = SITE.banks[ch] || []);
  list.forEach(q => { q.ch = ch; q.id = q.id || ch + '-' + (arr.length + 1); arr.push(q); });
};
SITE.allQs = () => Object.values(SITE.banks).flat();
SITE.findQ = id => SITE.allQs().find(q => q.id === id);

/* ---- progress ---- */
const done = () => LS.get('done', {});
function markDone(key, v) { const d = done(); if (v) d[key] = 1; else delete d[key]; LS.set('done', d); }

/* =====================================================================
   QUIZ ENGINE
   q = { t:'mcq'|'multi'|'fill'|'gen', g:'group', q:[en,zh], code:`raw`, o:[[en,zh]|'same'], a:index|[indexes]|['accepted answers'], e:[en,zh], ecode:`raw` }
   'gen' : { t:'gen', g, make: () => (a normal question object) }  → regenerated each time
   ===================================================================== */
function normAns(s) { return String(s).toLowerCase().replace(/[\[\]{}()]/g, ' ').replace(/[,;\s]+/g, ' ').replace(/\s*([+*\/^=-])\s*/g, '$1').trim(); }
function optHTML(o) { return Array.isArray(o) ? T(o[0], o[1]) : o; }
function stats() { return LS.get('stats', {}); }
/* per-question history: stats[id] = { c: right, w: wrong, h: last 8 results as '1'/'0', t: last time }.
   A random generator is tracked under its own id. Mastered = the last two attempts were both right. */
function recordAnswer(q, ok, inMistakes, id, given) {
  id = id || q.id; if (!id) return;
  const s = stats(); const r = s[id] || { c: 0, w: 0 }; ok ? r.c++ : r.w++; r.h = ((r.h || '') + (ok ? '1' : '0')).slice(-8); r.t = Date.now();
  if (given != null) r.g = String(given).slice(0, 120);                       // what the student answered last time
  if (q.gen) { r.gq = plain(q.q[0]).slice(0, 200); r.ga = ansText(q).slice(0, 120); if (q.code) r.gc = q.code.slice(0, 400); }  // a random instance: keep the actual question
  s[id] = r; LS.set('stats', s);
  if (q.gen) return;
  const wb = new Set(LS.get('wrong', []));
  if (!ok) wb.add(q.id); else if (inMistakes) wb.delete(q.id);
  LS.set('wrong', [...wb]);
}
function plain(h) { return String(h == null ? '' : h).replace(/<br\s*\/?>/g, ' / ').replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
function optPlain(o) { return plain(Array.isArray(o) ? o[0] : o); }
function ansText(q) { const L = 'ABCDEFGH';
  if (q.t === 'mcq') return L[q.a] + '. ' + optPlain(q.o[q.a]);
  if (q.t === 'multi') return q.a.map(i => L[i] + '. ' + optPlain(q.o[i])).join(' + ');
  if (q.t === 'fill') return String(q.a[0]); return ''; }
function qMastered(r) { return !!r && (r.h ? /11$/.test(r.h) : (r.w === 0 && r.c >= 2)); }
function qState(id) { const r = stats()[id]; return !r || !(r.c + r.w) ? 'new' : qMastered(r) ? 'mastered' : 'review'; }
function agoText(t) { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 60 ? T(m + ' min ago', m + ' 分钟前') : m < 1440 ? T(Math.round(m / 60) + ' h ago', Math.round(m / 60) + ' 小时前') : T(Math.round(m / 1440) + ' d ago', Math.round(m / 1440) + ' 天前'); }
function histHTML(id) {
  const r = stats()[id];
  if (!r || !(r.c + r.w)) return `<span class="hist new">${T('new', '未做过')}</span>`;
  const m = qMastered(r), dots = (r.h || '').split('').map(x => `<i class="${x === '1' ? 'y' : 'n'}"></i>`).join('');
  return `<span class="hist ${m ? 'm' : 'r'}" title="right 对 ${r.c} · wrong 错 ${r.w}">${dots}<span class="hc">${m ? '✓ ' + T('mastered', '已掌握') : T('review', '待复习')} · ${r.c}✓ ${r.w}✗</span><span class="ht"> · ${agoText(r.t)}</span></span>`;
}
/* small "last / best" memory for practice widgets (cloze, judge drill, answer sheets) */
function enOnly(h) { return plain(String(h).replace(/<span class="zh">[\s\S]*?<\/span>/g, '')); }
function wRec(key, got, n, label) { const all = LS.get('wrec', {}); const r = all[key] || { n: 0 }; r.n++; if (label) r.lb = enOnly(label).slice(0, 100); r.last = got; r.of = n; const pct = n ? Math.round(got / n * 100) : 0;
  r.bp = Math.max(r.bp != null ? r.bp : (r.best != null && r.of ? Math.min(100, Math.round(r.best / r.of * 100)) : 0), pct); delete r.best; r.t = Date.now(); all[key] = r; LS.set('wrec', all); }
function wRecHTML(key) { const r = LS.get('wrec', {})[key]; return r ? `<span class="wrec">${T('Last', '上次')} ${r.last}/${r.of} · ${T('best', '最好')} ${r.bp != null ? r.bp : Math.min(100, Math.round((r.best || 0) / (r.of || 1) * 100))}% · ${T('done', '做过')} ${r.n}× · ${agoText(r.t)}</span>` : ''; }
function renderQuestion(q, no, opts = {}) {
  let cur = q.t === 'gen' ? Object.assign(q.make(), { gen: true, g: q.g }) : q;
  const el = document.createElement('div'); el.className = 'q';
  const draw = () => {
    el.className = 'q';
    const DK = `<button class="btn sm dk" title="Count it as wrong and show the answer">🤷 ${T('Don’t know', '不会')}</button>`;
    const tag = cur.gen ? `<span class="pill">${T('Random drill', '随机生成')}</span>` : '';
    let h = `<div class="qh"><span class="no">Q${no}</span>${tag}${opts.showCh ? `<span class="pill">${q.ch.toUpperCase()}</span>` : ''}<span style="flex:1"></span>${q.id ? histHTML(q.id) : ''}<button class="xl" title="translate this question / 翻译本题"><span class="en">中文</span><span class="zh">EN</span></button></div>`;
    h += `<div class="qtext">${T(cur.q[0], cur.q[1])}</div>`;
    if (cur.code) h += codeHTML(cur.code);
    if (cur.html) h += cur.html;
    if (cur.t === 'mcq' || cur.t === 'multi') {
      h += `<div class="opts">` + cur.o.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${'ABCDEFGH'[i]}</span><span>${optHTML(o)}</span></button>`).join('') + `</div>`;
      if (cur.t === 'multi') h += `<div class="row"><span style="font-size:13px;color:var(--muted)">${T('Select all that apply', '多选：选出全部正确项')}</span><button class="btn sm pri chk">${T('Check', '提交')}</button>${DK}</div>`;
      else h += `<div class="row">${DK}</div>`;
    } else if (cur.t === 'fill') {
      h += `<div class="row"><input class="in mono ans" style="flex:1;min-width:220px" placeholder="${cur.ph || 'answer'}"><button class="btn pri chk">${T('Check', '提交')}</button>${DK}</div>`;
    }
    h += `<div class="res"></div>`;
    if (cur.gen && !opts.deferred) h += `<div class="row"><button class="btn sm regen">🎲 ${T('New question', '换一题')}</button></div>`;
    el.innerHTML = h;
    const res = $('.res', el);
    const finish = (ok, shown, paint, given) => {
      recordAnswer(cur, ok && !shown, opts.inMistakes, q.id, shown ? "(don't know)" : given);
      const hs = $('.hist', el); if (hs && !opts.deferred) hs.outerHTML = histHTML(q.id);
      opts.onAnswer && opts.onAnswer(ok && !shown, cur);
      const reveal = () => { paint && paint(); finishShow(ok, shown); };
      if (opts.deferred) { el._reveal = reveal; res.innerHTML = `<div class="fb" style="color:var(--blue)">${shown ? '🤷 ' + T('Marked as don’t know', '已标记为不会') : T('Answer recorded', '已作答')}</div>`; }
      else reveal();
    };
    const finishShow = (ok, shown) => {
      el.classList.add(ok ? 'right' : 'wrong');
      let fb = shown ? `<div class="fb no">🤷 ${T('Marked “don’t know” — saved to the mistake bank. Here is the answer:', '已标记“不会”——已放进错题本。答案如下：')}</div>` : `<div class="fb ${ok ? 'ok' : 'no'}">${ok ? T('✓ Correct', '✓ 正确') : T('✗ Not quite', '✗ 错了')}</div>`;
      if (cur.t === 'fill') fb += `<div style="margin-top:4px">${T('Answer', '答案')}: <code style="font-family:var(--mono)">${esc(cur.a[0])}</code></div>`;
      if (cur.e) fb += `<div class="exp">${T(cur.e[0], cur.e[1])}${cur.ecode ? codeHTML(cur.ecode) : ''}</div>`;
      res.innerHTML = fb;
    };
    if (cur.t === 'mcq') {
      $$('.opt', el).forEach(b => b.onclick = () => {
        if (el.dataset.done) return; el.dataset.done = 1;
        const i = +b.dataset.i, ok = i === cur.a;
        b.classList.add('sel');
        finish(ok, false, () => { b.classList.remove('sel'); $$('.opt', el).forEach(x => { if (+x.dataset.i === cur.a) x.classList.add('good'); }); if (!ok) b.classList.add('bad'); }, 'ABCDEFGH'[i] + '. ' + optPlain(cur.o[i]));
      });
    } else if (cur.t === 'multi') {
      $$('.opt', el).forEach(b => b.onclick = () => { if (!el.dataset.done) b.classList.toggle('sel'); });
      $('.chk', el).onclick = () => {
        if (el.dataset.done) return; el.dataset.done = 1;
        const sel = $$('.opt.sel', el).map(b => +b.dataset.i).sort().join();
        const ok = sel === cur.a.slice().sort().join();
        finish(ok, false, () => $$('.opt', el).forEach(b => { const i = +b.dataset.i; if (cur.a.includes(i)) b.classList.add('good'); else if (b.classList.contains('sel')) b.classList.add('bad'); b.classList.remove('sel'); }), sel.split(',').filter(x => x !== '').map(i => 'ABCDEFGH'[+i]).join(' + ') || '(nothing)');
      };
    } else if (cur.t === 'fill') {
      const inp = $('.ans', el);
      const check = () => {
        if (el.dataset.done) return; if (!inp.value.trim()) return;
        el.dataset.done = 1;
        const v = normAns(inp.value); const ok = cur.a.some(a => normAns(a) === v);
        finish(ok, false, null, inp.value.trim());
      };
      $('.chk', el).onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check(); };
    }
    $('.dk', el).onclick = () => {
      if (el.dataset.done) return; el.dataset.done = 1;
      finish(false, true, () => $$('.opt', el).forEach(x => { const i = +x.dataset.i; x.classList.remove('sel'); if (cur.t === 'mcq' ? i === cur.a : (cur.a || []).includes && cur.t === 'multi' && cur.a.includes(i)) x.classList.add('good'); }));
    };
    $('.xl', el).onclick = () => el.classList.toggle('xlate');
    const rg = $('.regen', el);
    if (rg) rg.onclick = () => { cur = Object.assign(q.make(), { gen: true, g: q.g }); delete el.dataset.done; draw(); };
  };
  draw();
  return el;
}
function renderQuizList(container, list, opts = {}) {
  container.innerHTML = '';
  const bar = document.createElement('div'); bar.className = 'qbar';
  let answered = 0, right = 0;
  const all = opts._all || list, cnt = { new: 0, review: 0, mastered: 0 }; all.forEach(q => cnt[qState(q.id)]++);
  const todo = all.filter(q => qState(q.id) !== 'mastered');
  const upd = () => { bar.innerHTML = `<b>${opts.title ? T(opts.title[0], opts.title[1]) : T('Practice', '练习')}</b><span>${T('Answered', '已答')} ${answered}/${list.length}</span><span style="color:var(--ok)">${T('Correct', '正确')} ${right}</span>
      ${opts.noHist ? '' : `<span class="mast" title="Mastered = last two attempts right / 已掌握 = 最近两次都答对"><i class="y"></i>${cnt.mastered} ${T('mastered', '已掌握')} <i class="n"></i>${cnt.review} ${T('to review', '待复习')} <i></i>${cnt.new} ${T('new', '未做')}</span>`}
      <span class="sp" style="flex:1"></span>${opts.noHist ? '' : opts._all ? `<button class="btn sm fa">${T('Show all', '显示全部')} (${all.length})</button>` : todo.length && todo.length < all.length ? `<button class="btn sm pri fo">${T('Only not mastered', '只练没掌握的')} (${todo.length})</button>` : ''}<button class="btn sm rs">${T('Reset', '重做')}</button>${opts.shuffle !== false ? `<button class="btn sm sh">${T('Shuffle', '打乱顺序')}</button>` : ''}`;
    $('.rs', bar).onclick = () => renderQuizList(container, list, opts);
    const fo = $('.fo', bar); if (fo) fo.onclick = () => renderQuizList(container, todo, Object.assign({}, opts, { _all: all }));
    const fa = $('.fa', bar); if (fa) fa.onclick = () => { const o = Object.assign({}, opts); delete o._all; renderQuizList(container, all, o); };
    const sh = $('.sh', bar); if (sh) sh.onclick = () => renderQuizList(container, shuffle(list), opts); };
  upd(); container.appendChild(bar);
  list.forEach((q, i) => container.appendChild(renderQuestion(q, i + 1, Object.assign({}, opts, { onAnswer: ok => { answered++; if (ok) right++; upd(); } }))));
  if (!list.length) container.insertAdjacentHTML('beforeend', `<p>${T('No questions here yet.', '这里还没有题。')}</p>`);
}

/* =====================================================================
   ROUTER + RENDER
   routes:  #/              home
            #/ch1/s2        section
            #/mistakes      wrong-question bank
            #/mock          mock exam
            #/vocab         vocabulary list
            #/ai            hand-over report for an AI tutor
   ===================================================================== */
function sectionKey(ch, s) { return ch.id + '/' + s.id; }
function flatSections() { const out = []; SITE.chapters.forEach(ch => (ch.sections || []).forEach(s => out.push({ ch, s }))); return out; }
/* ---- exam focus: SITE.course.focus = { budget: hours, chapters: { chId: { pct, stars, marks, exam, do, skip, sec: { s1: 'must'|'core'|'low'|'skip' } } } } ---- */
const PRIO = { must: ['★ Must do', '★ 必做'], core: ['Important', '重点'], low: ['Skim', '略看'], skip: ['Skip for this exam', '本次考试可跳过'] };
function focusOf(chId) { const F = SITE.course.focus; return F && F.chapters && F.chapters[chId]; }
function focusBudget() { const F = SITE.course.focus || {}; return +LS.get('budget', F.budget || 20) || 20; }
function focusHours(f) { const h = f.pct * focusBudget() / 100; return h < 1 ? Math.round(h * 60) + ' min' : (Math.round(h * 2) / 2) + ' h'; }
function stars(n) { return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n); }
function focusBanner(ch, s, first) {
  const f = focusOf(ch.id); if (!f) return '';
  const pr = f.sec && f.sec[s.id];
  const head = `<b>🎯 ${T('Effort for this chapter: ', '本章投入：')}<span class="stars">${stars(f.stars)}</span> · ${T('about', '约')} ${focusHours(f)} (${f.pct}% ${T('of your time', '的时间')})</b>`;
  if (!first) return `<div class="focus slim">${head}${pr ? ` · ${T('this section', '本节')}: <span class="prio ${pr}">${T(PRIO[pr][0], PRIO[pr][1])}</span>` : ''} <a href="#/${sectionKey(ch, ch.sections[0])}">${T('details', '详情')}</a></div>`;
  const row = (k, lab) => f[k] ? `<div class="frow"><span class="flab">${T(lab[0], lab[1])}</span><span>${T(f[k][0], f[k][1])}</span></div>` : '';
  const secs = ch.sections.filter(x => f.sec && f.sec[x.id]).map(x => `<a class="prio ${f.sec[x.id]}" href="#/${sectionKey(ch, x)}">${T(PRIO[f.sec[x.id]][0], PRIO[f.sec[x.id]][1])} · ${T(x.t[0], x.t[1])}</a>`).join('');
  const nPast = SITE.allQs().filter(q => q.c === ch.id).length;
  return `<div class="focus">${head}${row('marks', ['Past-paper marks', '历年分值'])}${row('exam', ['How it is examined', '怎么考'])}${row('do', ['Do this', '重点做'])}${row('skip', ['Skip', '可以跳过'])}
    ${secs ? `<div class="frow"><span class="flab">${T('Sections', '各节')}</span><span class="fsecs">${secs}</span></div>` : ''}
    ${nPast ? `<details class="rv"><summary>${T(`Past-paper questions on this chapter (${nPast})`, `本章历年真题（${nPast} 道）`)}</summary><div class="rvb">${QZ(SITE.course.focus.bank || 'test1', '', ['Past-paper questions', '历年真题'], ch.id)}</div></details>` : ''}</div>`;
}
function focusTable() {
  const F = SITE.course.focus; if (!F || !F.chapters) return '';
  const rows = SITE.chapters.filter(c => F.chapters[c.id]).map(c => { const f = F.chapters[c.id];
    return `<tr><td><a href="#/${c.sections && c.sections[0] ? sectionKey(c, c.sections[0]) : ''}">${c.num} ${T(c.t[0], c.t[1])}</a></td><td>${f.avg != null ? f.avg : ''}</td><td><span class="stars">${stars(f.stars)}</span></td><td><div class="fbar"><i style="width:${f.pct}%"></i></div>${f.pct}%</td><td><b>${focusHours(f)}</b></td></tr>`; }).join('');
  const extra = (F.extra || []).map(x => `<tr><td>${T(x.t[0], x.t[1])}</td><td></td><td></td><td><div class="fbar"><i style="width:${x.pct}%"></i></div>${x.pct}%</td><td><b>${focusHours(x)}</b></td></tr>`).join('');
  return `<h2>${T(F.title ? F.title[0] : 'Where to spend your time', F.title ? F.title[1] : '时间该花在哪里')}</h2>${F.note ? P(F.note[0], F.note[1]) : ''}
    <div class="row">${T('Hours I have left before the exam', '考前我还剩')} <input class="in" id="budget" type="number" min="1" max="200" step="1" value="${focusBudget()}" style="width:5em"> ${T('hours', '小时')}</div>
    <div style="overflow-x:auto"><table class="t"><tr><th>${T('Chapter', '章节')}</th><th>${T('Avg marks /' + (SITE.course.focus.outOf || 100), '平均分值 /' + (SITE.course.focus.outOf || 100))}</th><th>${T('Priority', '优先级')}</th><th>${T('Share of time', '时间占比')}</th><th>${T('Hours', '时长')}</th></tr>${rows}${extra}</table></div>`;
}
function renderSide(curKey) {
  const d = done();
  let h = `<a class="sec ${curKey === 'home' ? 'cur' : ''}" href="#/" style="font-weight:650;margin:0 0 8px">🏠 ${T('Home & study plan', '首页 & 复习计划')}</a>`;
  SITE.chapters.forEach(ch => {
    const open = curKey.startsWith(ch.id + '/');
    const fo = focusOf(ch.id);
    h += `<div class="grp ${open ? 'open' : ''}" data-ch="${ch.id}"><button class="ch ${ch.soon ? 'soon' : ''}"><span class="num">${ch.num}</span><span>${T(ch.t[0], ch.t[1])}</span>${fo ? `<span class="hrs" title="${fo.pct}%">${focusHours(fo)}</span>` : ''}</button><div class="secs">`;
    if (ch.soon) h += `<div class="sec" style="color:var(--muted)">${T('Coming soon…', '制作中…')}</div>`;
    (ch.sections || []).forEach(s => { const k = sectionKey(ch, s), pr = fo && fo.sec && fo.sec[s.id]; h += `<a class="sec ${k === curKey ? 'cur' : ''} ${pr ? 'p-' + pr : ''}" href="#/${k}"><span class="tick">${d[k] ? '✓' : (pr === 'must' ? '★' : '')}</span><span>${T(s.t[0], s.t[1])}</span></a>`; });
    h += `</div></div>`;
  });
  const nw = LS.get('wrong', []).length;
  h += `<div class="extra"><a class="sec ${curKey === 'mistakes' ? 'cur' : ''}" href="#/mistakes">📕 ${T('Mistake bank', '错题本')} (${nw})</a><a class="sec ${curKey === 'mock' ? 'cur' : ''}" href="#/mock">📝 ${T('Mock exam', '模拟考')}</a><a class="sec ${curKey === 'vocab' ? 'cur' : ''}" href="#/vocab">📒 ${T('Vocabulary list', '生词本')} (<span id="vocabcount">${Object.keys(LS.get('vocab', {})).length}</span>)</a><a class="sec ${curKey === 'ai' ? 'cur' : ''}" href="#/ai">🤖 ${T('Hand over to AI', '交给 AI')}</a></div>`;
  const side = $('#side'); side.innerHTML = h;
  $$('.grp .ch', side).forEach(b => b.onclick = () => {
    const g = b.parentElement, ch = SITE.chapters.find(c => c.id === g.dataset.ch);
    if (!g.classList.contains('open') && ch.sections && ch.sections.length && !curKey.startsWith(ch.id + '/')) location.hash = '#/' + sectionKey(ch, ch.sections[0]);
    else g.classList.toggle('open');
  });
}
function mountDynamic(root) {
  $$('.wmount', root).forEach(el => {
    const f = SITE.widgets[el.dataset.w];
    const arg = el.dataset.arg ? JSON.parse(el.dataset.arg) : undefined;
    if (f) { try { f(el, arg); } catch (e) { el.innerHTML = '<div class="warn">Widget error: ' + esc(e.message) + '</div>'; console.error(e); } }
  });
  $$('.quizmount', root).forEach(el => {
    const list = (SITE.banks[el.dataset.ch] || []).filter(q => (!el.dataset.g || el.dataset.g.split(',').includes(q.g)) && (!el.dataset.tag || q.c === el.dataset.tag));
    const title = el.dataset.title ? JSON.parse(el.dataset.title) : ['Check yourself', '自测一下'];
    renderQuizList(el, list, { title, shuffle: false });
  });
}
function render() {
  const hash = location.hash.replace(/^#\/?/, '');
  const page = $('#page');
  document.body.classList.remove('menu');
  if (hash === 'mistakes') { renderSide('mistakes'); renderMistakes(page); window.scrollTo(0, 0); return; }
  if (hash === 'vocab') { renderSide('vocab'); renderVocab(page); window.scrollTo(0, 0); return; }
  if (hash === 'mock') { renderSide('mock'); renderMock(page); window.scrollTo(0, 0); return; }
  if (hash === 'ai') { renderSide('ai'); renderAI(page); window.scrollTo(0, 0); return; }
  const flat = flatSections();
  const idx = flat.findIndex(x => sectionKey(x.ch, x.s) === hash);
  if (idx < 0) { renderSide('home'); renderHome(page); window.scrollTo(0, 0); return; }
  const { ch, s } = flat[idx], key = sectionKey(ch, s);
  renderSide(key);
  const prev = flat[idx - 1], next = flat[idx + 1];
  const isDone = !!done()[key];
  page.innerHTML = `<div class="crumb">${ch.num} · ${T(ch.t[0], ch.t[1])}</div><h1>${T(s.t[0], s.t[1])}</h1>` + focusBanner(ch, s, ch.sections[0] === s) +
    (typeof s.html === 'function' ? s.html() : s.html) +
    `<div class="done-row"><button class="btn ${isDone ? '' : 'pri'}" id="donebtn">${isDone ? T('✓ Marked as done (click to undo)', '✓ 已完成（点击取消）') : T('Mark this section as done', '标记本节已完成')}</button></div>` +
    `<div class="navbtns"><div>${prev ? `<a class="btn" href="#/${sectionKey(prev.ch, prev.s)}">← ${T(prev.s.t[0], prev.s.t[1])}</a>` : ''}</div><div>${next ? `<a class="btn pri" href="#/${sectionKey(next.ch, next.s)}">${T(next.s.t[0], next.s.t[1])} →</a>` : ''}</div></div>`;
  $('#donebtn').onclick = () => { markDone(key, !isDone); render(); };
  mountDynamic(page);
  bindBudget(page);
  if (!render.keepScroll) window.scrollTo(0, 0);
}
function chapterProgress(ch) { const d = done(); const s = ch.sections || []; return s.length ? s.filter(x => d[sectionKey(ch, x)]).length / s.length : 0; }
function renderMistakes(page) {
  const ids = LS.get('wrong', []); const list = ids.map(SITE.findQ).filter(Boolean);
  page.innerHTML = `<h1>📕 ${T('Mistake bank', '错题本')}</h1><div class="row"><a class="btn sm" href="#/ai">🤖 ${T('Ask an AI to analyse these', '让 AI 分析这些错题')}</a></div>` +
    P('Every question you get wrong lands here automatically. Answer it correctly <b>on this page</b> to remove it. Clear this list before the exam.', '你答错的题会自动进这里。在<b>本页</b>答对才会移出。考前把它清零。') +
    `<div id="mq"></div>`;
  renderQuizList($('#mq'), list, { title: ['Mistakes', '错题'], inMistakes: true, showCh: true });
}
/* ===================== AI handoff =====================
   The study data lives only in this browser. This page turns it into one Markdown report that the student
   pastes into any AI tool; the report starts with instructions, so the AI can take over without context. */
function aiReport() {
  const C = SITE.course, S = stats(), d = done(), wr = new Set(LS.get('wrong', [])), now = new Date();
  const lang = LS.get('lang', C.lang || 'zh'), langName = { zh: 'Chinese (简体中文)', en: 'English', both: 'Chinese, keeping English technical terms' }[lang] || 'Chinese';
  const pct = (a, b) => b ? Math.round(a / b * 100) + '%' : '–';
  const hist = h => (h || '').split('').map(x => x === '1' ? '✓' : '✗').join('');
  const chName = id => { const ch = SITE.chapters.find(c => c.id === id); return ch ? `${ch.num} ${ch.t[0]}` : id; };
  const tally = qs => { const o = { n: qs.length, tried: 0, mastered: 0, review: 0, c: 0, w: 0 }; qs.forEach(q => { const r = S[q.id]; if (!r || !(r.c + r.w)) return; o.tried++; o.c += r.c; o.w += r.w; qMastered(r) ? o.mastered++ : o.review++; }); return o; };
  const L = [];
  L.push(`# Study handoff — ${C.title ? C.title[0] : 'study site'}`);
  L.push(`Generated ${now.toLocaleString()} · site id \`${C.id || 'site'}\` · hours the student says are left: ${typeof focusBudget === 'function' ? focusBudget() : '?'}`);
  L.push('', '## Instructions for the AI tutor', C.ai ? C.ai : `You are taking over as this student's tutor. The data below was exported from their interactive study page (they cannot see it laid out like this). Using it:
1. Find the weakest topics, weighted by how many exam marks each is worth (see "Exam focus").
2. For the wrong answers listed below, compare the student's answer with the correct one and name the misconception behind it — not just the right answer.
3. Teach each weak point briefly with one worked example in the lecturer's conventions.
4. Give an ordered plan for the remaining time (which page sections / drills to redo first).
5. Finish with 3–5 new practice questions on the weakest points (with answers hidden at the end).
Answer in ${langName}. Be direct and concise. Do not repeat this data back.`);
  const F = C.focus;
  if (F && F.chapters) {
    L.push('', '## Exam focus (from past papers)', '| Chapter | Avg marks /' + (F.outOf || 100) + ' | Suggested share of time |', '|---|---|---|');
    SITE.chapters.filter(c => F.chapters[c.id]).forEach(c => L.push(`| ${chName(c.id)} | ${F.chapters[c.id].avg ?? ''} | ${F.chapters[c.id].pct}% |`));
  }
  L.push('', '## Progress by chapter', '| Chapter | Sections marked done | Questions tried / total | Mastered | To review | Accuracy (all attempts) | Past-paper Qs mastered |', '|---|---|---|---|---|---|---|');
  const all = SITE.allQs();
  SITE.chapters.filter(c => !c.soon).forEach(c => {
    const qs = SITE.banks[c.id] || [], t = tally(qs), secs = c.sections || [], past = tally(all.filter(q => q.c === c.id));
    L.push(`| ${chName(c.id)} | ${secs.filter(x => d[sectionKey(c, x)]).length}/${secs.length} | ${t.tried}/${t.n} | ${t.mastered} | ${t.review} | ${pct(t.c, t.c + t.w)} | ${past.n ? past.mastered + '/' + past.n : '–'} |`);
  });
  const groups = {};
  Object.entries(SITE.banks).forEach(([b, qs]) => qs.forEach(q => { const k = b + ' · ' + q.g; (groups[k] = groups[k] || []).push(q); }));
  L.push('', '## By question group', '| Bank · group | Tried / total | Mastered | To review | Accuracy |', '|---|---|---|---|---|');
  Object.entries(groups).forEach(([k, qs]) => { const t = tally(qs); if (t.tried) L.push(`| ${k} | ${t.tried}/${t.n} | ${t.mastered} | ${t.review} | ${pct(t.c, t.c + t.w)} |`); });
  const W = LS.get('wrec', {}), wk = Object.keys(W).sort((a, b) => W[b].t - W[a].t);
  if (wk.length) {
    L.push('', '## Answer sheets & drills (latest first)', '| Item | Last | Best | Times | When |', '|---|---|---|---|---|');
    const kind = { t1: 'answer sheet', cz: 'code cloze', jd: 'judge drill' };
    wk.forEach(k => { const r = W[k], ty = k.split(':')[0], name = r.lb || ((DECK.cloze[k.slice(3)] || DECK.judge[k.slice(3)] || {}).t || [k.slice(3)])[0];
      const best = r.bp != null ? r.bp : Math.min(100, Math.round((r.best || 0) / (r.of || 1) * 100));
      L.push(`| ${kind[ty] || ty}: ${plain(name)} | ${r.last}/${r.of} | ${best}% | ${r.n} | ${new Date(r.t).toLocaleString()} |`); });
  }
  const weak = all.filter(q => { const r = S[q.id]; return r && (r.c + r.w) && !qMastered(r); }).sort((a, b) => S[b.id].t - S[a.id].t);
  L.push('', `## Not mastered yet (${weak.length}) — latest first`);
  if (!weak.length) L.push('None.');
  weak.slice(0, 80).forEach(q => {
    const r = S[q.id], gen = q.t === 'gen';
    const text = gen ? (r.gq || `random ${q.g} drill`) : plain(q.q[0]);
    const code = gen ? r.gc : q.code;
    L.push(`- **[${chName(q.c || q.ch)} · ${q.ch}/${q.g}${gen ? ' · random' : ''}]** ${text.slice(0, 260)}`);
    if (code) L.push('  ```cpp', ...code.trim().split('\n').slice(0, 12).map(x => '  ' + x), '  ```');
    if (!gen && (q.t === 'mcq' || q.t === 'multi')) L.push(`  - options: ${q.o.map((o, i) => 'ABCDEFGH'[i] + '. ' + optPlain(o)).join(' | ').slice(0, 400)}`);
    L.push(`  - correct: ${gen ? (r.ga || '?') : ansText(q)} · student last answered: ${r.g != null ? r.g : '(not recorded)'} · history: ${hist(r.h) || r.c + '✓ ' + r.w + '✗'} (${r.c}✓ ${r.w}✗)${wr.has(q.id) ? ' · in mistake bank' : ''}`);
  });
  if (weak.length > 80) L.push(`- … and ${weak.length - 80} more`);
  const tried = all.filter(q => S[q.id] && (S[q.id].c + S[q.id].w)).length;
  L.push('', `_Totals: ${tried} of ${all.length} questions tried; ${weak.length} not mastered; ${wr.size} in the mistake bank. “Mastered” = last two attempts right._`);
  return L.join('\n');
}
function renderAI(page) {
  const txt = aiReport();
  page.innerHTML = `<h1>🤖 ${T('Hand over to an AI tutor', '交给 AI')}</h1>
    ${P('Your progress is stored only in this browser. This button turns it into one report — with instructions at the top — that you can paste into any AI chat (Claude, ChatGPT, …). The AI then sees which questions you got wrong, what you answered, and where the marks are.', '你的学习记录只存在这个浏览器里。这个按钮把它整理成一份报告（开头附有给 AI 的说明），粘贴到任何 AI 对话（Claude、ChatGPT……）里，AI 就能看到你错了哪些题、你当时答了什么、分数在哪里。')}
    <div class="row"><button class="btn pri" id="aicopy">📋 ${T('Copy the report', '复制交接报告')}</button><span id="aimsg" style="font-size:14px"></span></div>
    ${BOX('note', 'Nothing is uploaded. Only what you paste leaves your computer. Your answers are recorded from now on; older attempts only have right/wrong.', '不会上传任何东西，只有你粘贴出去的内容才会离开你的电脑。你选的答案从现在开始记录；更早的记录只有对错。')}
    <details class="rv"><summary>${T(`Preview (${txt.length.toLocaleString()} characters)`, `预览（${txt.length.toLocaleString()} 个字符）`)}</summary><div class="rvb"><textarea id="aitext" readonly style="width:100%;min-height:340px;font-family:var(--mono);font-size:12.5px;border:1px solid var(--line);border-radius:8px;padding:8px;background:var(--panel2);color:var(--ink)"></textarea></div></details>`;
  const ta = $('#aitext', page); ta.value = txt;
  $('#aicopy', page).onclick = async () => {
    const msg = $('#aimsg', page);
    try { await navigator.clipboard.writeText(txt); msg.innerHTML = `<span class="tag-ok">✓ ${T('Copied — paste it into the AI chat.', '已复制——粘贴到 AI 对话里即可。')}</span>`; }
    catch (e) { $('details', page).open = true; ta.focus(); ta.select(); msg.innerHTML = `<span class="tag-no">${T('Automatic copy was blocked — the text is selected below, press Ctrl+C.', '浏览器拦截了自动复制——下面的文字已全选，按 Ctrl+C。')}</span>`; }
  };
}
function bindBudget(page) { const b = $('#budget', page); if (b) b.onchange = () => { LS.set('budget', Math.max(1, +b.value || 20)); render.keepScroll = true; render(); render.keepScroll = false; }; }
function renderHome(page) { page.innerHTML = SITE.homeHTML(); mountDynamic(page); bindBudget(page); }
function renderMock(page) { if (SITE.mockRender) SITE.mockRender(page); else page.innerHTML = `<h1>📝 ${T('Mock exam', '模拟考')}</h1>` + P('The mock exam unlocks after the chapters are added.', '章节上线后开放模拟考。'); }

document.addEventListener('keydown', e => {
  if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  const btns = $$('.navbtns a'); if (!btns.length) return;
  const hash = location.hash.replace(/^#\/?/, ''); const flat = flatSections(); const idx = flat.findIndex(x => sectionKey(x.ch, x.s) === hash);
  const t = flat[idx + (e.key === 'ArrowRight' ? 1 : -1)]; if (t) location.hash = '#/' + sectionKey(t.ch, t.s);
});

/** run fn (which may grow or shrink the content above `anchor`), then scroll by the same amount,
 *  so the button the student just clicked stays under the mouse. Use it for every Next/Step button. */
function keepPos(anchor, fn) { const y0 = anchor.getBoundingClientRect().top; fn(); const dy = anchor.getBoundingClientRect().top - y0; if (Math.abs(dy) > 1) window.scrollBy(0, dy); }
/* ---- shared widget: step player (used by recursion/sorting visualizers) ---- */
function stepPlayer(el, steps, drawStep, opts = {}) {
  let i = 0, timer = null;
  const ctl = document.createElement('div'); ctl.className = 'row';
  ctl.innerHTML = `<button class="btn sm" data-a="first">⏮</button><button class="btn sm" data-a="prev">◀ ${T('Back', '上一步')}</button><button class="btn sm pri" data-a="next">${T('Next', '下一步')} ▶</button><button class="btn sm" data-a="play">⏵ ${T('Play', '自动播放')}</button><button class="btn sm" data-a="last">⏭</button><span class="cnt" style="font-size:13px;color:var(--muted)"></span>`;
  el.appendChild(ctl);
  const go = n => { i = Math.max(0, Math.min(steps.length - 1, n)); drawStep(steps[i], i); $('.cnt', ctl).textContent = `${i + 1} / ${steps.length}`; };
  const stop = () => { clearInterval(timer); timer = null; $('[data-a=play]', ctl).innerHTML = `⏵ ${T('Play', '自动播放')}`; };
  ctl.onclick = e => {
    const a = e.target.closest('button')?.dataset.a; if (!a) return;
    if (a === 'play') { if (timer) return stop(); $('[data-a=play]', ctl).innerHTML = `⏸ ${T('Pause', '暂停')}`; timer = setInterval(() => { if (i >= steps.length - 1) return stop(); go(i + 1); }, opts.speed || 700); return; }
    stop();
    keepPos(ctl, () => go({ first: 0, prev: i - 1, next: i + 1, last: steps.length - 1 }[a]));
  };
  go(0);
  return { go, stop };
}

/* ---- SVG drawing helpers (bilingual labels, arrows, nodes) ---- */
let SVGID = 0;
/** bilingual SVG text: shows en / zh / "en · zh" depending on language mode */
function svT(x, y, en, zh, a = '') {
  zh = zh == null ? en : zh;
  return `<text x="${x}" y="${y}" class="sv-en" ${a}>${en}</text><text x="${x}" y="${y}" class="sv-zh" ${a}>${zh}</text><text x="${x}" y="${y}" class="sv-both" ${a}>${en === zh ? en : en + ' · ' + zh}</text>`;
}
function svDefs(id, color = 'var(--muted)') { return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker></defs>`; }
/** line between two circles, shortened so arrowheads touch the rim */
function svEdge(a, b, r, mk, color = 'var(--muted)', w = 2, extra = '') {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  return `<line x1="${a[0] + ux * r}" y1="${a[1] + uy * r}" x2="${b[0] - ux * (r + (mk ? 2 : 0))}" y2="${b[1] - uy * (r + (mk ? 2 : 0))}" stroke="${color}" stroke-width="${w}" ${mk ? `marker-end="url(#${mk})"` : ''} ${extra}/>`;
}
function svNode(p, label, fill = 'var(--panel2)', stroke = 'var(--line)', r = 17) {
  return `<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/><text x="${p[0]}" y="${p[1] + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)" font-family="var(--mono)">${label}</text>`;
}
function svBadge(x, y, en, zh, color) { return `<g font-size="11.5" font-weight="700" fill="${color}">${svT(x, y, en, zh, 'text-anchor="middle"')}</g>`; }


/* =====================================================================
   ===== PRACTICE FORMATS: bucketGame · flashcards · codeCloze (+ decks)
   ===================================================================== */
const DECK = { bucket: {}, flash: {}, cloze: {}, judge: {} };

/* ---------- bucket (sorting) game: click a card, then a box — or drag it ---------- */
SITE.widgets.bucketGame = (el, id) => {
  const D = DECK.bucket[id];
  let pool, placed, sel, wrong, msg;
  const reset = () => { pool = shuffle(D.items.map((x, i) => i)); placed = D.buckets.map(() => []); sel = null; wrong = 0; msg = ''; draw(); };
  const chipHTML = (i, cls) => { const it = D.items[i]; return `<span class="chip ${D.code ? 'code' : ''} ${cls || ''}" data-i="${i}" draggable="${cls === 'done' ? 'false' : 'true'}">${D.code ? esc(it[0]) : T(it[0], it[1])}</span>`; };
  const tryPut = (i, b) => {
    const it = D.items[i];
    if (it[2] === b) { pool = pool.filter(x => x !== i); placed[b].push(i); sel = null; msg = `<span class="tag-ok">✓ ${T('Correct', '正确')}</span>` + (it[3] ? ` — ${T(it[3][0], it[3][1])}` : ''); }
    else { wrong++; sel = i; msg = `<span class="tag-no">✗ ${T('Not', '不是')} “${T(D.buckets[b][0], D.buckets[b][1])}”</span> — ${T('try another box.', '换个格子试试。')}`; }
    draw(); if (it[2] !== b) { const c = $(`.bk-pool .chip[data-i="${i}"]`, el); if (c) { c.classList.add('bad', 'shake'); } }
  };
  const draw = () => {
    const done = !pool.length;
    el.innerHTML = `<div class="w"><div class="wt">🧩 ${T(D.t[0], D.t[1])}</div>
    <div style="font-size:13.5px;color:var(--muted)">${T('Click a card, then click the box it belongs to (or drag it there).', '先点一张卡片，再点它所属的格子（也可以直接拖过去）。')}</div>
    ${done ? `<div class="tip" style="margin:8px 0"><b>🎉 ${T('All sorted!', '全部分好了！')}</b> ${T('Mistakes', '错误次数')}: <b>${wrong}</b> ${wrong === 0 ? '— ' + T('perfect.', '满分。') : ''} <button class="btn sm ag">${T('Play again', '再玩一次')}</button></div>` : `<div class="bk-pool">${pool.map(i => chipHTML(i, i === sel ? 'sel' : '')).join('')}</div>`}
    <div class="msg">${msg}</div>
    <div class="bk-grid">${D.buckets.map((b, k) => `<div class="bucket" data-b="${k}"><div class="bh">${T(b[0], b[1])}</div><div class="bi">${placed[k].map(i => chipHTML(i, 'done')).join('')}</div></div>`).join('')}</div>
    <div class="row" style="margin-top:6px"><span style="font-size:13px;color:var(--muted)">${T('Left', '剩余')}: ${pool.length} · ${T('mistakes', '错误')}: ${wrong}</span><button class="btn sm rs">${T('Restart', '重来')}</button></div></div>`;
    $$('.bk-pool .chip', el).forEach(c => {
      c.onclick = () => { sel = +c.dataset.i === sel ? null : +c.dataset.i; msg = ''; draw(); };
      c.ondragstart = e => { e.dataTransfer.setData('text/plain', c.dataset.i); sel = +c.dataset.i; };
    });
    $$('.bucket', el).forEach(b => {
      b.onclick = () => { if (sel !== null) tryPut(sel, +b.dataset.b); else { msg = T('Pick a card first.', '先选一张卡片。'); draw(); } };
      b.ondragover = e => { e.preventDefault(); b.classList.add('over'); };
      b.ondragleave = () => b.classList.remove('over');
      b.ondrop = e => { e.preventDefault(); const i = parseInt(e.dataTransfer.getData('text/plain'), 10); if (!isNaN(i)) tryPut(i, +b.dataset.b); };
    });
    const rs = $('.rs', el); if (rs) rs.onclick = reset; const ag = $('.ag', el); if (ag) ag.onclick = reset;
  };
  reset();
};

/* ---------- flashcards: flip, then say whether you knew it ---------- */
SITE.widgets.flashcards = (el, id) => {
  const D = DECK.flash[id];
  let queue, known, flipped;
  const reset = () => { queue = shuffle(D.cards.map((_, i) => i)); known = 0; flipped = false; draw(); };
  const draw = () => {
    const tot = D.cards.length;
    if (!queue.length) { el.innerHTML = `<div class="w"><div class="wt">🃏 ${T(D.t[0], D.t[1])}</div><div class="tip"><b>🎉 ${T(`All ${tot} cards known!`, `${tot} 张卡全部记住了！`)}</b> <button class="btn sm ag">${T('Shuffle & go again', '打乱再来一遍')}</button></div></div>`; $('.ag', el).onclick = reset; return; }
    const c = D.cards[queue[0]];
    el.innerHTML = `<div class="w"><div class="wt">🃏 ${T(D.t[0], D.t[1])}</div>
    <div style="height:8px;background:var(--line);border-radius:6px;overflow:hidden"><div style="height:100%;width:${known / tot * 100}%;background:var(--ok)"></div></div>
    <div style="font-size:13px;color:var(--muted);margin-top:4px">${T('Known', '已掌握')} ${known}/${tot} · ${T('in this round', '本轮剩余')} ${queue.length}</div>
    <div class="fc ${flipped ? 'flip' : ''}"><div class="fc-in"><div class="fc-face fc-front"><div>${T(c[0], c[1])}</div><small>${T('Say the answer out loud, then click to flip (or press Space)', '先自己说出答案，再点卡片翻面（或按空格）')}</small></div><div class="fc-face fc-back"><small style="margin:0 0 8px">${T(c[0], c[1])}</small><div>${T(c[2], c[3])}</div></div></div></div>
    <div class="row" style="justify-content:center">${flipped ? `<button class="btn no">✗ ${T('Not yet — show again later', '还没记住——稍后再来')}</button><button class="btn pri yes">✓ ${T('I knew it', '我会了')}</button>` : `<button class="btn pri fl">${T('Flip', '翻面')}</button>`}</div></div>`;
    const flip = () => { flipped = !flipped; draw(); };
    $('.fc', el).onclick = flip; const fl = $('.fl', el); if (fl) fl.onclick = flip;
    const y = $('.yes', el); if (y) y.onclick = () => { queue.shift(); known++; flipped = false; draw(); };
    const n = $('.no', el); if (n) n.onclick = () => { queue.push(queue.shift()); flipped = false; draw(); };
  };
  el.tabIndex = 0;
  el.onkeydown = e => { if (e.key === ' ' && queue && queue.length) { e.preventDefault(); flipped = !flipped; draw(); } };
  reset();
};

/* ---------- code cloze: fill the blanks in real lecture code ---------- */
SITE.widgets.codeCloze = (el, id) => {
  const D = DECK.cloze[id];
  const answers = [];
  const lines = dedent(D.code);
  const body = lines.map((ln, li) => {
    let h = '', last = 0; const re = /⟦(.*?)⟧/g; let m;
    while ((m = re.exec(ln))) { h += hlLine(ln.slice(last, m.index)); const alts = m[1].split('¦'); const w = Math.max(...alts.map(a => a.length)) + 1; h += `<input class="cz" data-k="${answers.length}" style="width:${w + 1}ch" autocomplete="off" spellcheck="false">`; answers.push(alts); last = re.lastIndex; }
    return `<span class="l" data-n="${li + 1}">${h + hlLine(ln.slice(last)) || ' '}</span>`;
  }).join('');
  el.innerHTML = `<div class="w"><div class="wt">✍️ ${T(D.t[0], D.t[1])}</div><div style="font-size:13.5px;color:var(--muted)">${T('Type into every highlighted blank (Tab jumps to the next one), then Check. This is how “complete the code” questions look.', '在每个高亮空格里填写（Tab 跳到下一个），然后点检查。考试的“补全代码”题就是这样。')}</div>
  ${D.given ? `<div class="given">${D.given}</div>` : ''}<pre class="code"><code>${body}</code></pre><div class="row"><button class="btn pri ck">${T('Check', '检查')}</button><button class="btn sw">${T('Show answers', '看答案')}</button><button class="btn rs">${T('Clear', '清空')}</button><span class="sc" style="font-weight:700">${wRecHTML('cz:' + id)}</span></div>${D.note ? `<div class="note" style="font-size:14px">${T(D.note[0], D.note[1])}</div>` : ''}</div>`;
  const ins = $$('input.cz', el);
  const norm = s => s.replace(/\s+/g, '');
  $('.ck', el).onclick = () => { let ok = 0; ins.forEach(inp => { const good = answers[+inp.dataset.k].some(a => norm(a) === norm(inp.value)); inp.classList.toggle('ok', good); inp.classList.toggle('no', !good); if (good) ok++; });
    wRec('cz:' + id, ok, ins.length, D.t[0]);
    $('.sc', el).innerHTML = (ok === ins.length ? `<span class="tag-ok">✓ ${ok}/${ins.length} ${T('— all correct!', '——全对！')}</span>` : `<span class="tag-no">${ok}/${ins.length}</span> ${T('— red blanks are wrong', '——红色的空填错了')}`) + ' ' + wRecHTML('cz:' + id); };
  $('.sw', el).onclick = () => { ins.forEach(inp => { inp.value = answers[+inp.dataset.k][0]; inp.classList.remove('no'); inp.classList.add('ok'); }); $('.sc', el).textContent = ''; };
  $('.rs', el).onclick = () => { ins.forEach(inp => { inp.value = ''; inp.classList.remove('ok', 'no'); }); $('.sc', el).textContent = ''; };
  ins.forEach(inp => inp.onkeydown = e => { if (e.key === 'Enter') $('.ck', el).click(); });
};


/* ---------- judge drill: “does this compile / is this valid?” one item at a time ---------- */
SITE.widgets.judgeDrill = (el, id) => {
  const D = DECK.judge[id];
  let order, k, score, last, recd;
  const reset = () => { order = shuffle(D.items.map((_, i) => i)); k = 0; score = 0; last = ''; recd = false; draw(); };
  const draw = () => {
    const lab = D.labels || [['✓ Valid / compiles', '✓ 合法 / 能编译'], ['✗ Error', '✗ 错误']];
    let h = `<div class="w"><div class="wt">⚖️ ${T(D.t[0], D.t[1])}</div>${k === 0 ? `<div>${wRecHTML('jd:' + id)}</div>` : ''}${D.given ? `<div style="font-size:14px">${T(D.given[0], D.given[1])}</div>` : ''}`;
    if (k < order.length) {
      const it = D.items[order[k]];
      h += `<div style="font-size:13px;color:var(--muted);margin-top:6px">${k + 1} / ${order.length}</div>${codeHTML(it[0])}
        <div class="row"><button class="btn" data-v="1">${T(lab[0][0], lab[0][1])}</button><button class="btn" data-v="0">${T(lab[1][0], lab[1][1])}</button></div>`;
    } else { if (!recd) { wRec('jd:' + id, score, order.length, D.t[0]); recd = true; } h += `<div class="${score === order.length ? 'tip' : 'exam'}" style="margin-top:8px"><b>${T('Score', '得分')}: ${score} / ${order.length}</b> <button class="btn sm ag">${T('Again (shuffled)', '再来一遍（打乱）')}</button> ${wRecHTML('jd:' + id)}</div>`; }
    h += `<div class="msg">${last}</div></div>`;
    el.innerHTML = h;
    $$('[data-v]', el).forEach(b => b.onclick = () => {
      const it = D.items[order[k]], ok = (+b.dataset.v === 1) === !!it[1]; if (ok) score++;
      last = `${ok ? `<span class="tag-ok">✓ ${T('Right', '对')}</span>` : `<span class="tag-no">✗ ${T('Wrong', '错')}</span>`} — <code style="font-family:var(--mono)">${esc(it[0].split('\n')[0])}${it[0].includes('\n') ? ' …' : ''}</code> ${it[1] ? T('is valid.', '是合法的。') : T('is an error.', '是错误的。')} ${T(it[2], it[3])}`;
      k++; draw(); });
    const ag = $('.ag', el); if (ag) ag.onclick = reset;
  };
  reset();
};


/* =====================================================================
   ===== GLOSSARY (tap an underlined English word → Chinese; saved to 生词本)
   Add words here: 'english word or phrase': '中文'
   ===================================================================== */
let GL_RE = null;
function glRegex() {
  if (GL_RE) return GL_RE;
  const ks = Object.keys(SITE.GLOSS || {});
  GL_RE = ks.length ? new RegExp('\\b(' + ks.sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')).join('|') + ')\\b', 'gi') : /(?!)/g;
  return GL_RE;
}
const glOn = () => LS.get('gloss', true);
const GL_SKIP = /^(CODE|PRE|INPUT|TEXTAREA|SCRIPT|STYLE|SELECT|OPTION|text|tspan|svg)$/;
let glBusy = false;
function glossify(root) {
  if (!glOn() || !root || !root.querySelectorAll) return;
  const targets = root.matches && root.matches('.en') ? [root] : [];
  root.querySelectorAll('.en').forEach(e => targets.push(e));
  glBusy = true;
  targets.forEach(t => {
    const walker = document.createTreeWalker(t, NodeFilter.SHOW_TEXT, { acceptNode: n => {
      for (let p = n.parentNode; p && p !== t.parentNode; p = p.parentNode) { if (p.nodeType === 1 && (GL_SKIP.test(p.nodeName) || p.classList.contains('gl') || p.classList.contains('code') || p.classList.contains('i'))) return NodeFilter.FILTER_REJECT; }
      const RE = glRegex(); RE.lastIndex = 0; return RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => {
      const RE = glRegex(); const s = n.nodeValue, frag = document.createDocumentFragment(); let last = 0, m; RE.lastIndex = 0;
      while ((m = RE.exec(s))) { frag.appendChild(document.createTextNode(s.slice(last, m.index))); const sp = document.createElement('span'); sp.className = 'gl'; sp.textContent = m[0]; sp.dataset.k = m[0].toLowerCase(); frag.appendChild(sp); last = RE.lastIndex; }
      frag.appendChild(document.createTextNode(s.slice(last))); n.parentNode.replaceChild(frag, n);
    });
  });
  glBusy = false;
}
/* tooltip + save to vocabulary list */
(function () {
  const tip = document.createElement('div'); tip.id = 'gltip'; document.body.appendChild(tip);
  let hideT;
  const show = (el, saved) => {
    const k = el.dataset.k, zh = SITE.GLOSS[k]; if (!zh) return;
    tip.innerHTML = `<b>${esc(el.textContent)}</b> — ${esc(zh)}${saved ? '<small>✓ 已加入生词本 / saved to vocabulary list</small>' : '<small>点击加入生词本 / tap to save</small>'}`;
    tip.style.display = 'block';
    const r = el.getBoundingClientRect(); const w = tip.offsetWidth;
    tip.style.left = Math.max(6, Math.min(window.innerWidth - w - 6, r.left + r.width / 2 - w / 2)) + 'px';
    tip.style.top = (r.top > 70 ? r.top - tip.offsetHeight - 6 : r.bottom + 6) + 'px';
    clearTimeout(hideT); if (saved) hideT = setTimeout(() => tip.style.display = 'none', 1800);
  };
  document.addEventListener('mouseover', e => { const g = e.target.closest && e.target.closest('.gl'); if (g && glOn()) show(g, false); });
  document.addEventListener('mouseout', e => { if (e.target.closest && e.target.closest('.gl')) { clearTimeout(hideT); hideT = setTimeout(() => tip.style.display = 'none', 150); } });
  window.addEventListener('scroll', () => tip.style.display = 'none', { passive: true });
  // capture phase: a tap on a word must NOT also answer a question / press a button
  document.addEventListener('click', e => {
    const g = e.target.closest && e.target.closest('.gl'); if (!g || !glOn()) return;
    e.stopPropagation(); e.preventDefault();
    const v = LS.get('vocab', {}); const k = g.dataset.k; v[k] = { zh: SITE.GLOSS[k], n: ((v[k] && v[k].n) || 0) + 1, t: Date.now() }; LS.set('vocab', v);
    show(g, true); const sb = $('#vocabcount'); if (sb) sb.textContent = Object.keys(v).length;
  }, true);
})();
/* re-glossify whatever gets rendered into the page */
new MutationObserver(muts => {
  if (glBusy || !glOn()) return;
  const roots = new Set(); muts.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && !n.classList.contains('gl')) roots.add(n); }));
  roots.forEach(r => glossify(r));
}).observe(document.getElementById('page'), { childList: true, subtree: true });

/* vocabulary list page (#/vocab) */
function renderVocab(page) {
  const v = LS.get('vocab', {}); const ks = Object.keys(v).sort((a, b) => v[b].t - v[a].t);
  DECK.flash.__vocab = { t: ['My vocabulary flashcards', '我的生词卡'], cards: ks.map(k => [k, k, v[k].zh, v[k].zh]) };
  page.innerHTML = `<h1>📒 ${T('Vocabulary list', '生词本')}</h1>
  ${P('Every underlined English word you <b>tap</b> is saved here. In the exam you cannot look words up — so review this list until every word is instant.', '你在英文里<b>点过</b>的每个带下划线的词都会存到这里。考试时不能查词——所以把这个列表复习到每个词都秒懂。')}
  ${ks.length ? `<div id="vfc"></div><table class="t"><tr><th>${T('Word', '单词')}</th><th>${T('Meaning', '意思')}</th><th>${T('Looked up', '查过')}</th><th></th></tr>${ks.map(k => `<tr><td><b>${esc(k)}</b></td><td>${esc(v[k].zh)}</td><td>${v[k].n}×</td><td><button class="btn sm" data-del="${esc(k)}">✕</button></td></tr>`).join('')}</table>`
    : `<div class="note">${T('Empty so far. Switch to <b>EN</b> or <b>双语</b>, then tap any word with a dotted underline.', '还是空的。切到 <b>EN</b> 或<b>双语</b>，然后点任意一个带虚线下划线的单词。')}</div>`}
  <h2>${T('All words in this site’s glossary', '本站词汇表里的全部单词')} (${Object.keys(SITE.GLOSS).length})</h2>
  <details class="rv"><summary>${T('Show the full list', '展开完整列表')}</summary><div style="columns:3 220px;font-size:14px">${Object.entries(SITE.GLOSS).sort().map(([k, z]) => `<div><b>${esc(k)}</b> — ${esc(z)}</div>`).join('')}</div></details>`;
  if (ks.length) SITE.widgets.flashcards($('#vfc', page), '__vocab');
  $$('[data-del]', page).forEach(b => b.onclick = () => { const v2 = LS.get('vocab', {}); delete v2[b.dataset.del]; LS.set('vocab', v2); renderVocab(page); renderSide('vocab'); });
}

/** default mock-paper split: proportional to each built chapter's question count, at least 1 each */
function mockSplit(n) {
  const chs = SITE.chapters.filter(c => !c.soon && (SITE.banks[c.id] || []).length);
  const tot = chs.reduce((a, c) => a + SITE.banks[c.id].length, 0) || 1; const per = {};
  chs.forEach(c => per[c.id] = Math.max(1, Math.round(n * SITE.banks[c.id].length / tot)));
  return per;
}
/* =====================================================================
   ===== MOCK EXAM — random mixed paper, answers revealed only on submit
   ===================================================================== */
SITE.mockRender = page => {
  const plans = { quick: { n: 15, min: 25, per: (SITE.course.mock && SITE.course.mock.quick) || mockSplit(15) },
                  full: { n: 30, min: 50, per: (SITE.course.mock && SITE.course.mock.full) || mockSplit(30) } };
  const best = LS.get('mockbest', null);
  page.innerHTML = `<h1>📝 ${T('Mock exam', '模拟考')}</h1>
  ${P('A random paper drawn from every chapter, including freshly generated 🎲 tracing questions. <b>No feedback until you submit</b> — like the real exam. Wrong answers go into the mistake bank.', '从每一章随机抽题，包括现场生成的 🎲 追踪题。<b>交卷前不显示对错</b>——和真实考试一样。答错的题会进错题本。')}
  <div class="grid2"><div class="card"><b>${T('Quick paper', '短卷')}</b><br>15 ${T('questions', '题')} · ~25 min<div class="row"><button class="btn pri" data-p="quick">${T('Start', '开始')}</button></div></div>
  <div class="card"><b>${T('Full paper', '整卷')}</b><br>30 ${T('questions', '题')} · ~50 min<div class="row"><button class="btn pri" data-p="full">${T('Start', '开始')}</button></div></div></div>
  ${best ? `<div class="note">${T('Best score so far', '历史最高')}: <b>${best}%</b></div>` : ''}
  <div id="mockarea"></div>`;
  $$('[data-p]', page).forEach(b => b.onclick = () => start(plans[b.dataset.p]));

  function start(plan) {
    const qs = [];
    Object.entries(plan.per).forEach(([ch, k]) => {
      const bank = SITE.banks[ch] || []; const gens = shuffle(bank.filter(q => q.t === 'gen')), fixed = shuffle(bank.filter(q => q.t !== 'gen'));
      const nGen = gens.length ? Math.min(gens.length, Math.ceil(k / 2)) : 0;
      gens.slice(0, nGen).forEach(q => qs.push(q)); fixed.slice(0, k - nGen).forEach(q => qs.push(q));
    });
    const area = $('#mockarea'); area.innerHTML = '';
    $$('[data-p]', page).forEach(b => b.disabled = true);
    const t0 = Date.now(), results = new Map();
    const bar = document.createElement('div'); bar.className = 'qbar'; bar.style.position = 'sticky'; bar.style.top = '60px'; bar.style.zIndex = 5;
    area.appendChild(bar);
    const els = [];
    qs.forEach((q, i) => { const el = renderQuestion(q, i + 1, { deferred: true, showCh: true, onAnswer: (ok) => { results.set(i, ok); upd(); } }); el.dataset.ch = q.ch; els.push(el); area.appendChild(el); });
    const sub = document.createElement('div'); sub.className = 'row'; sub.style.justifyContent = 'center';
    sub.innerHTML = `<button class="btn pri" style="font-size:16px;padding:10px 26px">${T('Submit paper', '交卷')}</button>`; area.appendChild(sub);
    let timer = setInterval(upd, 1000), submitted = false;
    function upd() {
      if (!document.body.contains(bar)) return clearInterval(timer);
      const sec = Math.floor((Date.now() - t0) / 1000), left = plan.min * 60 - sec;
      bar.innerHTML = `<b>${T('Mock exam', '模拟考')}</b><span>${T('Answered', '已答')} ${results.size}/${qs.length}</span><span style="flex:1"></span><span style="font-family:var(--mono);color:${left < 0 ? 'var(--bad)' : 'inherit'}">⏱ ${left < 0 ? '+' : ''}${Math.floor(Math.abs(left) / 60)}:${String(Math.abs(left) % 60).padStart(2, '0')}</span>`;
    }
    upd();
    $('button', sub).onclick = () => {
      if (submitted) return;
      if (results.size < qs.length && !sub.dataset.warned) { sub.dataset.warned = 1; sub.insertAdjacentHTML('afterbegin', `<div class="warn" style="width:100%">${T(`${qs.length - results.size} question(s) unanswered. Click Submit again to hand in anyway.`, `还有 ${qs.length - results.size} 题没答。再点一次交卷即可强制提交。`)}</div>`); return; }
      submitted = true; clearInterval(timer); els.forEach(e => e.dataset.done = 1);
      els.forEach(e => { if (e._reveal) e._reveal(); else { e.classList.add('wrong'); $('.res', e).innerHTML = `<div class="fb no">${T('Not answered', '未作答')}</div>`; } });
      const by = {}; qs.forEach((q, i) => { const r = by[q.ch] = by[q.ch] || { n: 0, ok: 0 }; r.n++; if (results.get(i)) r.ok++; });
      const total = [...results.values()].filter(Boolean).length, pct = Math.round(total / qs.length * 100);
      if (best === null || pct > best) LS.set('mockbest', pct);
      const mins = Math.round((Date.now() - t0) / 60000);
      const sum = document.createElement('div'); sum.className = 'card';
      sum.innerHTML = `<h2 style="margin-top:0">${T('Result', '成绩')}: ${total} / ${qs.length} (${pct}%)</h2><p>${T('Time used', '用时')}: ${mins} min</p>
      <table class="t"><tr><th>${T('Chapter', '章节')}</th><th>${T('Score', '得分')}</th></tr>${Object.entries(by).map(([ch, r]) => { const c = SITE.chapters.find(x => x.id === ch); return `<tr><td>${c.num} ${T(c.t[0], c.t[1])}</td><td style="color:${r.ok / r.n < .6 ? 'var(--bad)' : 'var(--ok)'}"><b>${r.ok}/${r.n}</b></td></tr>`; }).join('')}</table>
      <p>${T('Red chapters = go back to that chapter’s 🎲 drills. Then redo the', '红色的章节 = 回到那一章刷 🎲 练习。然后去做')} <a href="#/mistakes">📕 ${T('mistake bank', '错题本')}</a>.</p>`;
      area.insertBefore(sum, area.firstChild.nextSibling);
      sub.remove(); bar.innerHTML = `<b>${T('Submitted', '已交卷')}</b> · ${total}/${qs.length}`;
      window.scrollTo({ top: sum.offsetTop - 70, behavior: 'smooth' });
      renderSide('mock');
    };
  }
};


/* =====================================================================
   HOME PAGE — driven by SITE.course (see templates/course/course.js)
   ===================================================================== */
SITE.homeHTML = () => {
  const C = SITE.course, nQ = SITE.allQs().length, nW = LS.get('wrong', []).length;
  const cards = SITE.chapters.map(ch => {
    const p = Math.round(chapterProgress(ch) * 100), first = ch.sections && ch.sections[0];
    return `<a class="chcard" href="${first ? '#/' + sectionKey(ch, first) : '#/'}"><div class="n">${ch.num}${ch.soon ? ' · ' + T('coming soon', '制作中') : ''}</div><b>${T(ch.t[0], ch.t[1])}</b><div style="font-size:13px;color:var(--muted)">${(ch.sections || []).length} ${T('sections', '节')} · ${(SITE.banks[ch.id] || []).length} ${T('questions', '题')}</div><div class="bar"><i style="width:${p}%"></i></div></a>`;
  }).join('');
  const t = C.title || ['Study site', '复习网站'];
  let h = `<div class="hero"><h1>${T(t[0], t[1])}</h1><div>${T('Interactive notes, visualizers and ' + nQ + ' practice questions built from the lecture slides.', '根据课件制作的交互式笔记、可视化工具和 ' + nQ + ' 道练习题。')}</div></div>
  <div class="card"><b>${T('How to use this page', '怎么用这个网页')}</b>${L([
    ['Switch language top-right: <b>EN</b> (exam language), <b>中文</b>, or <b>双语</b> (both). In EN, tap a dotted word for its Chinese meaning; it is saved to the <b>📒 vocabulary list</b>.', '右上角切换语言：<b>EN</b>（考试语言）、<b>中文</b>、<b>双语</b>。EN 模式下点带虚线的词看中文，会自动存进 <b>📒 生词本</b>。'],
    ['Each section = picture & hands-on widget → short notes → “Check yourself” questions. Do the questions; reading alone will not stick.', '每节 = 图和交互 → 简短笔记 → “自测”题。一定要做题，光看记不住。'],
    ['Not sure? Press <b>🤷 Don’t know</b> instead of guessing — it shows the answer and saves the question to the <b>📕 mistake bank</b>.', '不确定就按 <b>🤷 不会</b>，别蒙——会显示答案并把题放进 <b>📕 错题本</b>。'],
    ['🎲 questions are randomly generated — press “New question” for unlimited practice. The last section of each chapter is a test with NEW questions.', '带 🎲 的题是随机生成的——点“换一题”可以无限练。每章最后一节是全新题目的测试。'],
    ['Progress is saved in this browser only. Want help? <a href="#/ai">🤖 Hand over to AI</a> copies a report of your results that any AI tutor can analyse. Keyboard: ← / → for previous / next section.', '进度只保存在当前浏览器。需要帮忙？<a href="#/ai">🤖 交给 AI</a> 会把你的做题情况复制成一份报告，任何 AI 都能据此帮你分析。键盘 ← / → 切换上一节/下一节。']])}</div>
  ${focusTable()}
  <h2>${T('Chapters', '章节')}</h2><div class="chgrid">${cards}</div>
  ${nW ? `<div class="exam" style="margin-top:14px"><b class="h">${T('Mistake bank', '错题本')}</b>${T(`You have <b>${nW}</b> question(s) to redo.`, `你有 <b>${nW}</b> 道错题待重做。`)} <a href="#/mistakes">${T('Go →', '去做 →')}</a></div>` : ''}`;
  if (C.plan && C.plan.rows && C.plan.rows.length) {
    h += `<h2>${T(C.plan.title[0], C.plan.title[1])}</h2><table class="t"><tr><th>${T('When', '时间')}</th><th>${T('Do', '内容')}</th><th>${T('Why', '理由')}</th></tr>` +
      C.plan.rows.map(r => `<tr>${r.map(c => `<td>${Array.isArray(c) ? T(c[0], c[1]) : c}</td>`).join('')}</tr>`).join('') + `</table>`;
  }
  (C.homeNotes || []).forEach(n => h += BOX(n[0], n[1], n[2]));
  if (C.credits) h += `<p style="font-size:13px;color:var(--muted);margin-top:30px">${T(C.credits[0], C.credits[1])}</p>`;
  return h;
};
