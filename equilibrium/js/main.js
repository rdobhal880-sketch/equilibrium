/* =====================================================================
   main.js — starts the app: preferences, dialogs, every screen,
   then routing. Loaded last.
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$, $$ = EQ.$$;

  function initDisplay() {
    const p = EQ.state.prefs;
    const set = (k, v) => { p[k] = v; EQ.applyPrefs(); EQ.save(); };
    EQ.seg($('#prefTheme'), [['auto', 'Automatic'], ['light', 'Light'], ['dark', 'Dark']], p.theme, v => set('theme', v));
    EQ.seg($('#prefText'), [['m', 'Default'], ['l', 'Large'], ['xl', 'Larger']], p.text, v => set('text', v));
    EQ.seg($('#prefMotion'), [['auto', 'Automatic'], ['reduce', 'Reduce motion']], p.motion, v => set('motion', v));
    $('#prefName').value = p.name;
    $('#prefWater').value = p.water;
    $('#prefName').addEventListener('input', e => set('name', e.target.value.trim().slice(0, 30)));
    $('#prefWater').addEventListener('change', e => set('water', EQ.clamp(Math.round(Number(e.target.value) || 8), 4, 16)));
    $('#openDisplay').addEventListener('click', () => EQ.openDlg('displayDlg'));
  }

  function init() {
    EQ.applyPrefs();
    initDisplay();
    EQ.initAbout();
    EQ.initToday();
    EQ.initCheckin();
    EQ.initInsights();
    EQ.initBreathe();
    EQ.initMove();
    EQ.initReframe();
    EQ.initFocus();

    $('#openSupport').addEventListener('click', () => EQ.showSupport());
    document.addEventListener('click', e => { if (e.target.closest('[data-open-support]')) EQ.showSupport(); });
    // Click on the dimmed backdrop closes a dialog
    $$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close('cancel'); }));
    if (window.matchMedia) matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', EQ.applyPrefs);

    window.addEventListener('hashchange', EQ.route);
    EQ.route();
  }

  try { init(); }
  catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML('afterbegin', '<p style="padding:12px;background:#ffe9e1;color:#1c1a2e;margin:0">Something went wrong loading Equilibrium. Try refreshing the page.</p>');
  }
})();
