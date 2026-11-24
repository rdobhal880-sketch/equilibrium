/* =====================================================================
   breathe.js — guided breathing. The orb grows on the in-breath and
   shrinks on the out-breath, timed to the selected pattern. Optional
   tanpura drone is synthesised with the Web Audio API: each "pluck" is
   a stack of harmonics with a slow bloom in the upper partials, which
   imitates the buzzing jawari bridge of a real tanpura.
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$, $$ = EQ.$$;
  let pattern = EQ.BREATHS[0];
  let run = null; // the active session, or null

  /* ---------------- Tanpura drone ---------------- */
  const Drone = {
    on: false, timer: null, next: 0, step: 0, master: null,
    // Pa (lower octave), Sa, Sa, Sa (lower octave): the classic four-string cycle
    ratios: [0.75, 1, 1, 0.5],
    gaps: [1.15, 1.15, 1.15, 1.75],
    start(sa) {
      const ac = EQ.audio(); if (!ac) { EQ.toast('Audio isn’t available in this browser.'); return; }
      this.stop(true);
      this.sa = sa; this.on = true;
      this.master = ac.createGain();
      const comp = ac.createDynamicsCompressor();
      const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3800;
      this.master.gain.setValueAtTime(0.0001, ac.currentTime);
      this.master.gain.exponentialRampToValueAtTime(0.32, ac.currentTime + 2);
      this.master.connect(lp).connect(comp).connect(ac.destination);
      this.next = ac.currentTime + 0.1; this.step = 0;
      this.timer = setInterval(() => this.schedule(), 200);
      this.schedule();
    },
    schedule() {
      const ac = EQ.audio(); if (!ac || !this.on) return;
      while (this.next < ac.currentTime + 0.8) {
        this.pluck(this.sa * this.ratios[this.step], this.next);
        this.next += this.gaps[this.step];
        this.step = (this.step + 1) % 4;
      }
    },
    pluck(f, t) {
      const ac = EQ.audio();
      const out = ac.createGain(); out.gain.value = 0.9; out.connect(this.master);
      for (let h = 1; h <= 9; h++) {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine';
        o.frequency.value = f * h * (1 + (Math.random() - 0.5) * 0.0016); // tiny detune = warmth
        const amp = 0.22 / Math.pow(h, 0.85);
        const bloom = h >= 4 ? 0.35 + h * 0.03 : 0.01; // upper partials swell later (jawari)
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(h >= 4 ? amp * 0.25 : amp, t + 0.02);
        if (h >= 4) g.gain.exponentialRampToValueAtTime(amp * 0.9, t + bloom);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 4.8 - h * 0.18);
        o.connect(g).connect(out);
        o.start(t); o.stop(t + 5);
      }
    },
    stop(instant) {
      clearInterval(this.timer); this.on = false;
      const ac = this.master ? EQ.audio() : null;
      if (this.master && ac) {
        const m = this.master;
        m.gain.cancelScheduledValues(ac.currentTime);
        m.gain.setValueAtTime(Math.max(0.0001, m.gain.value), ac.currentTime);
        m.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + (instant ? 0.05 : 0.8));
        setTimeout(() => m.disconnect(), instant ? 100 : 900);
      }
      this.master = null;
    }
  };
  EQ.Drone = Drone;

  /* ---------------- Pattern picker ---------------- */
  function renderPatterns() {
    $('#patterns').innerHTML = EQ.BREATHS.map(b => `
      <button type="button" class="pattern" role="radio" data-id="${b.id}" aria-checked="${b === pattern}">
        <span class="ph"><b>${b.name}</b><span class="tag">${b.tag}</span></span>
        <p>${b.desc}</p>
        <p class="rhythm">${b.phases.map(p => `${p[0]} ${p[1]}s`).join(' · ')}</p>
      </button>`).join('');
  }

  /* ---------------- Session engine ---------------- */
  function setOrb(size, secs) {
    const orb = $('#orb');
    orb.style.transitionDuration = `${secs}s`;
    orb.style.transform = EQ.reduced() ? '' : `scale(${size})`;
    orb.style.opacity = EQ.reduced() ? (size >= 0.9 ? 1 : 0.55) : 1;
  }
  function startPhase() {
    const [name, secs, size] = pattern.phases[run.i];
    run.phaseStart = performance.now(); run.phaseLen = secs * 1000;
    $('#orbPhase').textContent = name;
    setOrb(size, secs);
    if ($('#chimeOn').checked) {
      const sa = Number($('#droneKey').value) * 4;
      EQ.beep(name.includes('out') ? sa * 0.75 : name === 'Hold' ? sa * 1.125 : sa, 0.5, 0.05);
    }
  }
  function tick() {
    if (!run) return;
    const now = performance.now();
    const left = run.phaseLen - (now - run.phaseStart);
    $('#orbCount').textContent = Math.max(1, Math.ceil(left / 1000));
    const total = (now - run.start) / 1000, remain = Math.max(0, run.len - total);
    $('#breathMeta').textContent = remain > 0 ? `Breath ${run.cycles + 1} · ${EQ.mmss(remain)} left` : `Last breath · finishing the cycle`;
    if (left <= 0) {
      run.i++;
      if (run.i >= pattern.phases.length) {
        run.i = 0; run.cycles++;
        if (total >= run.len) return finish();
      }
      startPhase();
    }
  }
  function begin() {
    const len = Number($('#breathLen').value);
    run = { i: 0, cycles: 0, start: performance.now(), len };
    if ($('#droneOn').checked) Drone.start(Number($('#droneKey').value));
    else EQ.audio(); // unlock audio for chimes on this click
    $('#breathStart').textContent = 'Stop';
    $('#breathStart').classList.remove('primary');
    startPhase();
    run.timer = setInterval(tick, 100);
  }
  function stop(msg) {
    if (!run) return;
    clearInterval(run.timer);
    run = null;
    Drone.stop();
    setOrb(0.5, 1.2);
    $('#orbPhase').textContent = 'Ready'; $('#orbCount').textContent = '';
    $('#breathStart').textContent = 'Start';
    $('#breathStart').classList.add('primary');
    $('#breathMeta').textContent = msg || 'Stopped. Start again whenever you like.';
  }
  function finish() {
    const n = run.cycles, mins = Math.round(run.len / 60);
    stop(`Done: ${n} slow breaths in about ${mins} minute${mins === 1 ? '' : 's'}. Notice how you feel now.`);
    $('#orbPhase').textContent = 'Well done';
    EQ.toast('Breathing session complete.');
  }

  EQ.initBreathe = function () {
    renderPatterns();
    $('#patterns').addEventListener('click', e => {
      const b = e.target.closest('.pattern'); if (!b) return;
      pattern = EQ.BREATHS.find(x => x.id === b.dataset.id);
      renderPatterns();
      $(`.pattern[data-id="${pattern.id}"]`).focus();
      if (run) { stop(); begin(); }
    });
    $('#patterns').addEventListener('keydown', e => {
      if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
      const i = EQ.BREATHS.indexOf(pattern), n = EQ.BREATHS.length;
      pattern = EQ.BREATHS[(i + (e.key === 'ArrowDown' ? 1 : n - 1)) % n];
      renderPatterns(); $(`.pattern[data-id="${pattern.id}"]`).focus(); e.preventDefault();
    });
    $('#breathStart').addEventListener('click', () => (run ? stop() : begin()));
    $('#droneOn').addEventListener('change', e => {
      if (!run) { if (e.target.checked) { Drone.start(Number($('#droneKey').value)); EQ.toast('Drone on. Press Start to begin breathing.'); } else Drone.stop(); return; }
      e.target.checked ? Drone.start(Number($('#droneKey').value)) : Drone.stop();
    });
    $('#droneKey').addEventListener('change', e => { if (Drone.on) Drone.start(Number(e.target.value)); });
    EQ.on('view', v => { if (v !== 'breathe') { stop(); Drone.stop(); $('#droneOn').checked = false; } });
  };
})();
