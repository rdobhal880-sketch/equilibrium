/* =====================================================================
   core.js — shared building blocks used by every screen:
   storage, dates, the Balance score formula, the ring graphic,
   routing, toasts, dialogs, preferences and the safety net.
   ===================================================================== */
(function () {
  const EQ = window.EQ;
  const KEY = 'equilibrium.v1';

  /* ---------------- Storage (localStorage, with safe fallbacks) ---------------- */
  const blank = () => ({ entries: {}, thoughts: [], focus: {}, sample: false,
    prefs: { theme: 'auto', text: 'm', motion: 'auto', name: '', water: EQ.TARGETS.waterDefault } });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return blank();
      const data = JSON.parse(raw);
      const b = blank();
      return { ...b, ...data, prefs: { ...b.prefs, ...(data.prefs || {}) } };
    } catch (e) { return blank(); }
  }
  EQ.state = load();
  EQ.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(EQ.state)); } catch (e) { /* private mode: app still works this session */ }
    EQ.emit('change');
  };

  /* ---------------- Tiny event bus so screens can refresh each other ---------------- */
  const subs = {};
  EQ.on = (ev, fn) => (subs[ev] = subs[ev] || []).push(fn);
  EQ.emit = (ev, data) => (subs[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } });

  /* ---------------- Helpers ---------------- */
  EQ.$ = (s, r = document) => r.querySelector(s);
  EQ.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  EQ.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  EQ.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  EQ.round = (v, d = 0) => { const m = 10 ** d; return Math.round(v * m) / m; };
  EQ.avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  /* Dates as local YYYY-MM-DD keys (not UTC, so late-night check-ins land on the right day) */
  EQ.key = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  EQ.parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  EQ.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  EQ.lastDays = n => Array.from({ length: n }, (_, i) => EQ.key(EQ.addDays(new Date(), i - n + 1)));
  EQ.fmtDay = (k, opts = { weekday: 'short', day: 'numeric' }) => EQ.parseKey(k).toLocaleDateString('en-GB', opts);
  EQ.mmss = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  /* ---------------- The Balance score ----------------
     Rest: 100 inside 8–10 h, −25 per hour under 8, −15 per hour over 10.
     Body: 80% active minutes vs 60, 20% water vs personal goal.
     Mind: 60% mood (1–5), 40% calm (stress 1–10 inverted).
     Balance: mean of the three − 20% of (strongest − weakest).         */
  EQ.pillars = function (e) {
    if (!e) return null;
    const T = EQ.TARGETS;
    const s = Number(e.sleep) || 0;
    let rest = 100;
    if (s < T.sleepMin) rest = 100 - (T.sleepMin - s) * 25;
    else if (s > T.sleepMax) rest = 100 - (s - T.sleepMax) * 15;
    const waterGoal = EQ.state.prefs.water || T.waterDefault;
    const body = 0.8 * Math.min(1, (Number(e.active) || 0) / T.activeMin) * 100 +
                 0.2 * Math.min(1, (Number(e.water) || 0) / waterGoal) * 100;
    const mind = 0.6 * ((Number(e.mood) || 3) - 1) / 4 * 100 +
                 0.4 * (10 - (Number(e.stress) || 5)) / 9 * 100;
    const p = { mind: EQ.clamp(mind, 0, 100), body: EQ.clamp(body, 0, 100), rest: EQ.clamp(rest, 0, 100) };
    const vals = [p.mind, p.body, p.rest];
    const mean = EQ.avg(vals);
    const gap = Math.max(...vals) - Math.min(...vals);
    p.score = Math.round(EQ.clamp(mean - 0.2 * gap, 0, 100));
    p.gap = Math.round(gap);
    p.mind = Math.round(p.mind); p.body = Math.round(p.body); p.rest = Math.round(p.rest);
    const low = [['Mind', p.mind], ['Body', p.body], ['Rest', p.rest]].sort((a, b) => a[1] - b[1])[0];
    p.weakest = low[0];
    p.label = p.score >= 75 ? 'In equilibrium' : p.score >= 55 ? 'Nearly balanced' : 'Out of balance';
    return p;
  };

  /* ---------------- The ring graphic: three arcs, one per pillar ---------------- */
  const SEG = [['mind', 'Mind'], ['body', 'Body'], ['rest', 'Rest']];
  EQ.ring = function (el, p, opts = {}) {
    const R = 80, C = 2 * Math.PI * R, gapLen = 14, segLen = C / 3 - gapLen;
    const arcs = SEG.map(([k], i) => {
      const off = -(i * C / 3) + C / 4 - gapLen / 2; // start at 12 o'clock, then clockwise
      const val = p ? p[k] : 0;
      const fill = segLen * val / 100;
      return `<circle class="rt" cx="100" cy="100" r="${R}" stroke-dasharray="${segLen} ${C - segLen}" stroke-dashoffset="${off}"/>
              <circle class="rf ${k}" cx="100" cy="100" r="${R}" stroke-dasharray="${fill} ${C - fill}" stroke-dashoffset="${off}"${val < 1 ? ' opacity="0"' : ''}/>`;
    }).join('');
    const score = p ? p.score : '–';
    const label = p ? p.label : (opts.empty || 'No check-in yet');
    el.innerHTML = `<svg viewBox="0 0 200 200" aria-hidden="true">${arcs}</svg>
      <div class="ring-mid"><span class="ring-score">${score}</span><span class="ring-label">${EQ.esc(label)}</span></div>`;
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', p ? `Balance score ${p.score} out of 100, ${p.label}. Mind ${p.mind}, Body ${p.body}, Rest ${p.rest}.` : 'No Balance score yet');
  };
  EQ.legend = function (el, p) {
    el.innerHTML = SEG.map(([k, n]) => `<span class="lg ${k}"><i></i>${n}<b>${p ? p[k] : '–'}</b></span>`).join('');
  };

  /* ---------------- Routing on the URL hash (#today, #checkin, ...) ---------------- */
  const VIEWS = ['today', 'checkin', 'insights', 'breathe', 'move', 'reframe', 'focus', 'about'];
  EQ.route = function () {
    const name = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'today';
    EQ.$$('.view').forEach(v => { v.hidden = v.dataset.view !== name; });
    EQ.$$('.nav a').forEach(a => {
      const on = a.getAttribute('href') === '#' + name;
      a.toggleAttribute('aria-current', on);
      if (on) a.setAttribute('aria-current', 'page');
      if (on && a.scrollIntoView) a.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
    window.scrollTo(0, 0);
    EQ.emit('view', name);
    // Move focus to the heading so screen readers announce the new screen
    if (EQ._routed) { const h = EQ.$(`[data-view="${name}"] h1`); if (h) h.focus({ preventScroll: true }); }
    EQ._routed = true;
    document.title = name === 'today' ? 'Equilibrium' : `${EQ.$(`[data-view="${name}"] h1`).textContent} · Equilibrium`;
  };

  /* ---------------- Toast messages ---------------- */
  let toastTimer;
  EQ.toast = function (msg) {
    const t = EQ.$('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  };

  /* ---------------- Dialogs ---------------- */
  EQ.openDlg = function (id) {
    const d = document.getElementById(id);
    if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
  };
  EQ.confirm = function (text, okLabel = 'Delete') {
    return new Promise(res => {
      const d = EQ.$('#confirmDlg');
      EQ.$('#confirmText').textContent = text;
      EQ.$('#confirmOk').textContent = okLabel;
      d.returnValue = '';
      d.addEventListener('close', () => res(d.returnValue === 'ok'), { once: true });
      EQ.openDlg('confirmDlg');
    });
  };

  /* ---------------- Segmented controls (button groups acting like radios) ---------------- */
  EQ.seg = function (el, options, value, onPick) {
    el.setAttribute('role', 'radiogroup');
    el.innerHTML = options.map(([v, label]) =>
      `<button type="button" role="radio" data-v="${EQ.esc(v)}" aria-checked="${String(v) === String(value)}">${EQ.esc(label)}</button>`).join('');
    el.onclick = e => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      EQ.$$('button', el).forEach(x => x.setAttribute('aria-checked', String(x === b)));
      onPick(b.dataset.v);
    };
    el.onkeydown = e => { // arrow keys move between options
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const bs = EQ.$$('button', el); const i = bs.indexOf(document.activeElement);
      if (i < 0) return;
      const n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
      n.focus(); n.click(); e.preventDefault();
    };
  };

  /* ---------------- Preferences: theme, text size, motion ---------------- */
  EQ.applyPrefs = function () {
    const p = EQ.state.prefs, root = document.documentElement;
    if (p.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', p.theme);
    root.dataset.text = p.text;
    const sysReduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.classList.toggle('reduce', p.motion === 'reduce' || (p.motion === 'auto' && sysReduce));
  };
  EQ.reduced = () => document.documentElement.classList.contains('reduce');

  /* ---------------- Sound: short beeps and chimes with Web Audio ---------------- */
  let ac;
  EQ.audio = function () {
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === 'suspended') ac.resume();
      return ac;
    } catch (e) { return null; }
  };
  EQ.beep = function (freq = 880, dur = 0.18, vol = 0.12) {
    const a = EQ.audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(vol, a.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
    o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + dur + 0.05);
  };

  /* ---------------- Safety net ---------------- */
  EQ.hasCrisisWords = text => {
    const t = String(text || '').toLowerCase().replace(/[’']/g, "'");
    return EQ.CRISIS_WORDS.some(w => t.includes(w));
  };
  EQ.showSupport = function (reason) {
    const intro = EQ.$('#supportIntro');
    intro.textContent = reason === 'text'
      ? 'What you wrote sounds really heavy. You deserve support from a real person right now, and these services are free and confidential.'
      : reason === 'low'
        ? 'It sounds like today is really hard. Talking to someone can help, and these services are free and confidential.'
        : 'Talking to someone helps. These services are free and confidential.';
    EQ.openDlg('supportDlg');
  };
})();
