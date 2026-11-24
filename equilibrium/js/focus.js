/* =====================================================================
   focus.js — a focus timer with movement breaks, and the sleep
   trade-off calculator (the opportunity cost of a late night).
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$;
  const MODES = { '25': [25, 5], '50': [50, 10], '15': [15, 3] };
  const CIRC = 2 * Math.PI * 52;
  let mode = '25', F = null;

  function sessionsToday() { return EQ.state.focus[EQ.key()] || 0; }
  function renderSessions() {
    const n = sessionsToday();
    $('#fSessions').innerHTML = `${Array.from({ length: Math.max(4, n) }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}<span>${n} focus block${n === 1 ? '' : 's'} today</span>`;
  }
  function reset(phase = 'focus') {
    if (F) clearInterval(F.timer);
    const [w, b] = MODES[mode];
    const secs = (phase === 'focus' ? w : b) * 60;
    F = { phase, left: secs, total: secs, running: false };
    paint();
  }
  function paint() {
    $('#fTime').textContent = EQ.mmss(F.left);
    $('#fLabel').textContent = F.phase === 'focus' ? 'Focus' : 'Break';
    $('#fArc').classList.toggle('mind-mode', F.phase === 'focus');
    $('#fArc').classList.toggle('rest-mode', F.phase === 'break');
    $('#fArc').style.strokeDashoffset = String(CIRC * (1 - F.left / F.total));
    $('#fPlay').textContent = F.running ? 'Pause' : F.left < F.total ? 'Resume' : F.phase === 'focus' ? 'Start focus' : 'Start break';
    if (F.running) document.title = `${EQ.mmss(F.left)} ${F.phase === 'focus' ? 'focus' : 'break'} · Equilibrium`;
  }
  function showBreak() {
    const ex = EQ.randomBreak();
    $('#fBreak').hidden = false;
    $('#fBreak').innerHTML = `<p class="kicker dark" style="margin:0 0 4px">Break idea</p><p class="h3">${EQ.esc(ex.name)}</p><p style="margin:0 0 6px">${EQ.esc(ex.cue)}</p>
      <p class="fine" style="margin:0">Also: refill your water and look at something far away for 20 seconds to rest your eyes.</p>`;
  }
  function tick() {
    const now = performance.now();
    F.left -= (now - F.last) / 1000; F.last = now;
    if (F.left <= 0) {
      clearInterval(F.timer);
      if (F.phase === 'focus') {
        EQ.state.focus[EQ.key()] = sessionsToday() + 1; EQ.save();
        renderSessions(); showBreak();
        EQ.beep(880, 0.3); setTimeout(() => EQ.beep(1175, 0.4), 250);
        EQ.toast('Focus block done. Time for a movement break.');
        reset('break'); start();
      } else {
        EQ.beep(660, 0.4);
        EQ.toast('Break over. Ready for the next block?');
        $('#fBreak').hidden = true;
        reset('focus');
        document.title = 'Focus · Equilibrium';
      }
      return;
    }
    paint();
  }
  function start() { F.running = true; F.last = performance.now(); F.timer = setInterval(tick, 250); EQ.audio(); paint(); }
  function pause() { clearInterval(F.timer); F.running = false; paint(); }

  /* ---------------- The sleep trade-off ---------------- */
  function trade() {
    const toMin = v => { const [h, m] = (v || '0:0').split(':').map(Number); return h * 60 + m; };
    let diff = toMin($('#tWake').value) - toMin($('#tBed').value);
    if (diff <= 0) diff += 24 * 60;
    const hrs = EQ.round(diff / 60, 2);
    const rest = EQ.pillars({ sleep: hrs, active: 60, water: 8, mood: 3, stress: 5 }).rest;
    const short = EQ.TARGETS.sleepMin - hrs;
    $('#tFill').style.width = `${Math.min(100, hrs / 12 * 100)}%`;
    $('#tFill').style.background = hrs >= 8 && hrs <= 10 ? 'var(--rest)' : 'var(--body)';
    const h = Math.floor(hrs), m = Math.round((hrs - h) * 60);
    const nice = `${h} h${m ? ` ${m} min` : ''}`;
    if (short > 0) {
      const bed = toMin($('#tWake').value) - 8 * 60; const bh = ((Math.floor(bed / 60) % 24) + 24) % 24, bm = ((bed % 60) + 60) % 60;
      $('#tResult').innerHTML = `That’s <b>${nice}</b> of sleep: <b>${EQ.round(short, 1)} h short</b> of the 8-hour minimum. Your Rest pillar would drop to <b>${rest}/100</b>. To get 8 hours with this alarm, be asleep by <b>${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}</b>.`;
      $('#tTips').innerHTML = [
        'Tired revision is slow revision: memory is consolidated during sleep, so the late hour often costs more than it gives.',
        'Move the last topic to a free period or tomorrow’s first focus block instead.',
        'Screens off 30 minutes before bed; try 4-7-8 breathing in Breathe to wind down.'
      ].map(t => `<li>${t}</li>`).join('');
    } else if (hrs > EQ.TARGETS.sleepMax) {
      $('#tResult').innerHTML = `That’s <b>${nice}</b> of sleep, more than the 10-hour upper end. Rest pillar: <b>${rest}/100</b>. Regularly oversleeping can leave you groggy; a steady schedule helps.`;
      $('#tTips').innerHTML = '';
    } else {
      $('#tResult').innerHTML = `That’s <b>${nice}</b> of sleep, inside the 8–10 hour range. Rest pillar: <b>100/100</b>. Good trade.`;
      $('#tTips').innerHTML = '<li>Keep the same wake-up time on weekends too; a regular rhythm makes falling asleep easier.</li>';
    }
  }

  EQ.initFocus = function () {
    EQ.seg($('#fMode'), [['25', '25 / 5'], ['50', '50 / 10'], ['15', '15 / 3']], mode, v => { mode = v; reset('focus'); $('#fBreak').hidden = true; });
    $('#fPlay').addEventListener('click', () => (F.running ? pause() : start()));
    $('#fReset').addEventListener('click', () => { reset('focus'); $('#fBreak').hidden = true; document.title = 'Focus · Equilibrium'; });
    ['#tBed', '#tWake'].forEach(s => $(s).addEventListener('input', trade));
    reset('focus'); renderSessions(); trade();
    EQ.on('change', renderSessions);
  };
})();
