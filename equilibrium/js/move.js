/* =====================================================================
   move.js — routine builder, interval-timer player, and the heat
   index check (US National Weather Service equation).
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$, $$ = EQ.$$;
  const opts = { time: 10, space: 'room', focus: 'energise' };
  let steps = [];
  let P = null; // player state
  const CIRC = 2 * Math.PI * 52;

  /* ---------------- Heat index ---------------- */
  EQ.heatIndexC = function (tc, rh) {
    const T = tc * 9 / 5 + 32;
    let HI = 0.5 * (T + 61 + (T - 68) * 1.2 + rh * 0.094);
    if ((HI + T) / 2 >= 80) {
      HI = -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh - 0.00683783 * T * T
        - 0.05481717 * rh * rh + 0.00122874 * T * T * rh + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
      if (rh < 13 && T >= 80 && T <= 112) HI -= ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      if (rh > 85 && T >= 80 && T <= 87) HI += ((rh - 85) / 10) * ((87 - T) / 5);
    }
    return (HI - 32) * 5 / 9;
  };
  const LEVELS = [
    { max: 26.7, n: 'Comfortable', c: '#7fd1ae', a: 'Fine for outdoor activity. Still take water with you.' },
    { max: 32.2, n: 'Caution', c: '#ffd36b', a: 'Fatigue is possible with longer activity. Take water breaks and stay in the shade.' },
    { max: 39.4, n: 'Extreme caution', c: '#ffad5c', a: 'Heat cramps or heat exhaustion are possible. Move indoors, or go before 8 am or after sunset and keep it short.' },
    { max: 51.7, n: 'Danger', c: '#ff7a5c', a: 'Heat exhaustion is likely with outdoor exercise. Train indoors today.' },
    { max: 999, n: 'Extreme danger', c: '#ff4d6d', a: 'Heat stroke is highly likely. Do not exercise outdoors.' }
  ];
  EQ.heatLevel = c => LEVELS.findIndex(l => c < l.max);
  function renderHeat() {
    const t = Number($('#hTemp').value), h = Number($('#hHum').value);
    if (!isFinite(t) || !isFinite(h) || $('#hTemp').value === '' || $('#hHum').value === '') { $('#heatOut').innerHTML = '<p class="muted">Enter temperature and humidity.</p>'; return; }
    const hi = EQ.heatIndexC(EQ.clamp(t, -10, 60), EQ.clamp(h, 0, 100));
    const li = EQ.heatLevel(hi), L = LEVELS[li];
    $('#heatOut').innerHTML = `<div class="fine" style="margin:0">Feels like</div>
      <div class="hv">${Math.round(hi)} °C</div>
      <span class="hl" style="background:${L.c}">${L.n}</span>
      <p style="margin:0">${L.a}</p>
      <div class="heat-scale" aria-hidden="true">${LEVELS.map((l, i) => `<i class="${i === li ? 'on' : ''}" style="background:${l.c}"></i>`).join('')}</div>`;
    EQ._heatLevel = li;
  }

  /* ---------------- Routine builder ---------------- */
  const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  function build() {
    const L = EQ.EXERCISES.filter(e => e.space.includes(opts.space));
    const stretchy = L.filter(e => e.focus.includes('stretch'));
    const warm = L.find(e => e.warm) || stretchy[0] || L[0];
    const cool = shuffle(stretchy)[0] || L[0];
    // Warm-up and cool-down are kept out of the main pool so nothing repeats needlessly
    const main = shuffle(L.filter(e => e.focus.includes(opts.focus) && e !== warm && e !== cool));
    const extra = shuffle(L.filter(e => !e.focus.includes(opts.focus) && e !== warm && e !== cool));
    const work = opts.focus === 'stretch' ? 50 : 40, rest = 60 - work;
    const n = opts.time;
    const seq = [warm];
    let mi = 0, xi = 0;
    while (seq.length < n - 1) {
      const useExtra = extra.length && (seq.length % 4 === 3 || !main.length);
      let pick = useExtra ? extra[xi++ % extra.length] : main[mi++ % main.length];
      if (pick === seq[seq.length - 1]) pick = (main.length > 1 ? main[mi++ % main.length] : extra[xi++ % (extra.length || 1)]) || pick;
      seq.push(pick);
    }
    if (n > 1) seq.push(cool);
    steps = seq.filter(Boolean).map((ex, i, arr) => ({ ex, work, rest: i === arr.length - 1 ? 0 : rest, tag: i === 0 ? "Warm-up" : i === arr.length - 1 && n > 1 ? 'Cool-down' : '' }));
    resetPlayer();
    $('#playerEmpty').hidden = true;
    $('#playerLive').hidden = false;
    if (opts.space === 'outdoor' && EQ._heatLevel >= 2) EQ.toast(`Heat check says “${LEVELS[EQ._heatLevel].n}”. Consider an indoor routine.`);
  }

  /* ---------------- Player ---------------- */
  function resetPlayer() {
    stopTimer();
    P = { i: 0, mode: 'ready', left: 5, total: 5, running: false, last: 0, elapsed: 0 };
    paint();
  }
  function paint() {
    if (!steps.length) return;
    const s = steps[P.i], next = steps[P.i + 1];
    $('#pStep').textContent = `Exercise ${P.i + 1} of ${steps.length}${s.tag ? ' · ' + s.tag : ''}`;
    $('#pName').textContent = s.ex.name;
    $('#pCue').textContent = s.ex.cue;
    $('#pNext').textContent = next ? `Next: ${next.ex.name}` : 'Last one. You’ve got this.';
    $('#pTime').textContent = EQ.mmss(P.left);
    $('#pMode').textContent = P.mode === 'work' ? 'Work' : P.mode === 'rest' ? 'Rest' : P.mode === 'done' ? 'Done' : 'Get ready';
    const arc = $('#pArc');
    arc.classList.toggle('rest-mode', P.mode === 'rest' || P.mode === 'ready');
    arc.style.strokeDashoffset = String(CIRC * (1 - P.left / P.total));
    $('#pPlay').textContent = P.mode === 'done' ? 'Start again' : P.running ? 'Pause' : P.mode === 'ready' && P.i === 0 && P.left === 5 ? 'Start' : 'Resume';
    const doneSecs = steps.slice(0, P.i).reduce((a, x) => a + x.work + x.rest, 0);
    const all = steps.reduce((a, x) => a + x.work + x.rest, 0);
    $('#pProg').style.width = `${P.mode === 'done' ? 100 : doneSecs / all * 100}%`;
    $('#routineList').innerHTML = steps.map((x, i) => `<li class="${i === P.i && P.mode !== 'done' ? 'now' : i < P.i || P.mode === 'done' ? 'done' : ''}"><span>${EQ.esc(x.ex.name)}</span><span>${x.work}s${x.tag ? ' · ' + x.tag.toLowerCase() : ''}</span></li>`).join('');
    const now = $('#routineList .now'); if (now && P.running) now.scrollIntoView({ block: 'nearest' });
  }
  function setMode(mode, secs) { P.mode = mode; P.left = P.total = secs; }
  function advance() {
    const s = steps[P.i];
    if (P.mode === 'ready') { setMode('work', s.work); EQ.beep(988, 0.25); }
    else if (P.mode === 'work' && s.rest > 0) { setMode('rest', s.rest); EQ.beep(523, 0.3); }
    else if (P.i < steps.length - 1) { P.i++; setMode('work', steps[P.i].work); EQ.beep(988, 0.25); }
    else return finish();
    paint();
  }
  function tick() {
    const now = performance.now(), dt = (now - P.last) / 1000; P.last = now;
    const before = Math.ceil(P.left);
    P.left -= dt;
    if (P.mode === 'work' || P.mode === 'rest') P.elapsed += dt;
    const after = Math.ceil(P.left);
    if (after !== before && after <= 3 && after > 0) EQ.beep(740, 0.12, 0.08); // 3-2-1 countdown
    if (P.left <= 0) advance(); else paint();
  }
  function startTimer() { P.running = true; P.last = performance.now(); P.timer = setInterval(tick, 200); EQ.audio(); paint(); }
  function stopTimer() { if (P) { clearInterval(P.timer); P.running = false; } }
  function finish() {
    stopTimer();
    P.mode = 'done'; P.left = 0; P.total = 1;
    // Only log the time actually spent moving, not skipped exercises
    const mins = Math.round(P.elapsed / 60);
    EQ.beep(1175, 0.4); setTimeout(() => EQ.beep(1568, 0.5), 220);
    paint();
    if (mins < 1) { EQ.toast('Routine finished. Run it with the timer to log active minutes.'); return; }
    const logged = EQ.addActiveMinutes(mins, 'Move routine');
    EQ.toast(logged ? `Routine done. ${mins} minute${mins === 1 ? '' : 's'} added to today’s check-in.` : `Routine done. ${mins} minute${mins === 1 ? '' : 's'} will be added when you check in today.`);
  }

  EQ.initMove = function () {
    EQ.seg($('#mTime'), [[5, '5 min'], [10, '10 min'], [15, '15 min'], [20, '20 min']], opts.time, v => (opts.time = Number(v)));
    EQ.seg($('#mSpace'), [['desk', 'At my desk'], ['room', 'In my room'], ['outdoor', 'Outside']], opts.space, v => (opts.space = v));
    EQ.seg($('#mFocus'), [['energise', 'Energy'], ['stretch', 'Stretch'], ['strength', 'Strength']], opts.focus, v => (opts.focus = v));
    $('#builder').addEventListener('submit', e => { e.preventDefault(); build(); if (innerWidth < 900) $('#player').scrollIntoView({ behavior: EQ.reduced() ? 'auto' : 'smooth' }); });
    $('#pShuffle').addEventListener('click', build);
    $('#pPlay').addEventListener('click', () => {
      if (P.mode === 'done') { resetPlayer(); startTimer(); return; }
      P.running ? (stopTimer(), paint()) : startTimer();
    });
    $('#pSkip').addEventListener('click', () => {
      if (P.mode === 'done') return;
      if (P.i < steps.length - 1) { P.i++; setMode('work', steps[P.i].work); paint(); } else finish();
    });
    $('#pPrev').addEventListener('click', () => {
      if (P.mode === 'done') return;
      if (P.i > 0) P.i--;
      setMode('work', steps[P.i].work); paint();
    });
    ['#hTemp', '#hHum'].forEach(s => $(s).addEventListener('input', renderHeat));
    renderHeat();
    EQ.on('view', v => { if (v !== 'move' && P && P.running) { stopTimer(); paint(); } });
  };

  /* Used by Focus breaks: a random stretch that suits a desk */
  EQ.randomBreak = () => { const l = EQ.EXERCISES.filter(e => e.space.includes('desk')); return l[Math.floor(Math.random() * l.length)]; };
})();
