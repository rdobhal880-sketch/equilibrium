/* =====================================================================
   about.js — fills the "How it works" page and the support dialog
   from the data in content.js.
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$;
  EQ.initAbout = function () {
    $('#buildLog').innerHTML = EQ.BUILD_LOG.map(s => `<li><b>${EQ.esc(s.t)}</b><p>${EQ.esc(s.d)}</p></li>`).join('');
    $('#testRows').innerHTML = EQ.TESTS.map(([t, h, r]) => `<tr><td>${EQ.esc(t)}</td><td>${EQ.esc(h)}</td><td class="pass">${EQ.esc(r)}</td></tr>`).join('');
    $('#codeMap').innerHTML = EQ.CODEMAP.map(([f, d]) => `<tr><td><code>${EQ.esc(f)}</code></td><td>${EQ.esc(d)}</td></tr>`).join('');
    $('#sources').innerHTML = EQ.SOURCES.map(s => `<li>${EQ.esc(s.t)}<br><a href="${EQ.esc(s.u)}" target="_blank" rel="noopener">${EQ.esc(s.u)}</a></li>`).join('');
    $('#helplines').innerHTML = EQ.HELPLINES.map(h => `<li><span><b>${EQ.esc(h.name)}</b><small>${EQ.esc(h.note)}</small></span><a class="n" href="tel:${EQ.esc(h.tel)}">${EQ.esc(h.num)}</a></li>`).join('');
  };
})();
