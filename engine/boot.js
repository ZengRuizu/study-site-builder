/* =====================================================================
   BOOT — placeholder chapters from SITE.course.chapters, then start the app
   ===================================================================== */
(function () {
  const order = SITE.course.chapters || [];
  order.forEach(([id, num, t]) => { if (!SITE.chapters.find(c => c.id === id)) SITE.chapters.push({ id, num, t, soon: true, sections: [] }); });
  const ix = id => { const i = order.findIndex(x => x[0] === id); return i < 0 ? 999 : i; };
  SITE.chapters.sort((a, b) => ix(a.id) - ix(b.id));
})();
/* ---- boot ---- */
saveBoot();   // stamp stored progress with its format; upgrade older formats (references/design.md)
$$('#langseg button').forEach(b => b.onclick = () => setLang(b.dataset.l));
setLang(LS.get('lang', SITE.course.lang || 'zh'));
const glSync = () => { document.documentElement.classList.toggle('nogl', !glOn()); $('#glbtn').classList.toggle('on', glOn()); };
$('#glbtn').onclick = () => { LS.set('gloss', !glOn()); glSync(); if (glOn()) glossify($('#page')); };
glSync();
window.addEventListener('hashchange', render);
render();
