/* =====================================================================
   checkin.js — the daily check-in form. Every input updates the live
   Balance ring instantly; saving stores the day in localStorage.
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$, $$ = EQ.$$;
  let draft = null; // the values currently in the form

  /* Mood faces drawn in SVG: the mouth curve goes from frown to smile */
  const face = v => {
    const c = [-7, -3.5, 0, 4, 7][v - 1];
    return `<svg viewBox="0 0 40 40" aria-hidden="true"><circle class="f" cx="20" cy="20" r="17"/>
      <circle class="e" cx="14" cy="16" r="2.2"/><circle class="e" cx="26" cy="16" r="2.2"/>
      <path class="m" d="M12 ${26 - c / 3} Q20 ${26 + c} 28 ${26 - c / 3}"/></svg>`;
  };

  const blankDraft = () => ({ mood: 3, stress: 5, sleep: 7.5, active: 0, water: 0, note: '', acts: [] });

  function fill(dateKey) {
    const saved = EQ.state.entries[dateKey];
    draft = saved ? { ...blankDraft(), ...saved, acts: [...(saved.acts || [])] } : blankDraft();
    const pend = EQ.state.pending;
    if (!saved && pend && pend.date === dateKey) { draft.active = pend.active; draft.acts = [...pend.acts]; }
    $('#ciDate').value = dateKey;
    $('#ciDelete').hidden = !saved;
    paint();
  }

  /* Push the draft values into every control, then redraw the live ring */
  function paint() {
    $$('.mood').forEach(b => b.setAttribute('aria-checked', String(Number(b.dataset.v) === draft.mood)));
    $('#ciStress').value = draft.stress;
    $('#stressOut').textContent = `${draft.stress} / 10`;
    $('#ciStress').style.setProperty('--p', `${(draft.stress - 1) / 9 * 100}%`);
    $('#ciSleep').value = draft.sleep;
    $('#sleepMeter').style.width = `${Math.min(100, draft.sleep / 16 * 100)}%`;
    $('#ciActive').value = draft.active;
    $('#activeMeter').style.width = `${Math.min(100, draft.active / EQ.TARGETS.activeMin * 100)}%`;
    $('#ciNote').value = draft.note;
    $$('.chip', $('#actChips')).forEach(c => c.classList.toggle('on', draft.acts.includes(c.dataset.name)));
    renderGlasses();
    live();
  }

  function renderGlasses() {
    const goal = EQ.state.prefs.water || EQ.TARGETS.waterDefault;
    const n = Math.max(goal, draft.water);
    $('#glasses').innerHTML = Array.from({ length: n }, (_, i) => `
      <button type="button" class="glass ${i < draft.water ? 'on' : ''}" data-i="${i}" aria-label="${i + 1} glass${i ? 'es' : ''}" aria-pressed="${i < draft.water}">
        <svg viewBox="0 0 32 40"><path class="g-w" d="M7.6 16h16.8l-1.7 19.5a2 2 0 0 1-2 1.5h-9.4a2 2 0 0 1-2-1.5z"/><path class="g-o" d="M5 4h22l-2.8 31.6a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8z"/></svg>
      </button>`).join('');
    $('#waterOut').textContent = `${draft.water} of ${goal}`;
  }

  function live() {
    const p = EQ.pillars(draft);
    EQ.ring($('#liveRing'), p);
    EQ.legend($('#liveLegend'), p);
    $('#liveExplain').textContent = p.gap >= 40
      ? `Your weakest pillar is ${p.weakest}. A big gap between pillars costs ${Math.round(p.gap * 0.2)} points: that’s the equilibrium rule.`
      : `Weakest pillar: ${p.weakest}. Your pillars are fairly even, so the balance penalty is small.`;
  }

  function save(e) {
    e.preventDefault();
    const k = $('#ciDate').value || EQ.key();
    if (k > EQ.key()) { EQ.toast('You can’t check in for a future day.'); return; }
    draft.note = $('#ciNote').value.trim().slice(0, 500);
    draft.sleep = EQ.clamp(Number($('#ciSleep').value) || 0, 0, 16);
    draft.active = EQ.clamp(Math.round(Number($('#ciActive').value) || 0), 0, 600);
    EQ.state.entries[k] = { ...draft, savedAt: Date.now() };
    delete EQ.state.entries[k].sample; // editing a sample day makes it your own
    if (EQ.state.pending && EQ.state.pending.date === k) delete EQ.state.pending;
    EQ.save();
    const p = EQ.pillars(draft);
    // Safety net: very low mood + very high stress, or worrying words in the note
    if (EQ.hasCrisisWords(draft.note)) { EQ.showSupport('text'); return; }
    if (draft.mood === 1 && draft.stress >= 9) { EQ.showSupport('low'); return; }
    EQ.toast(`Saved. Balance score ${p.score}: ${p.label.toLowerCase()}.`);
    if (k === EQ.key()) location.hash = 'today';
    else $('#ciDelete').hidden = false;
  }

  EQ.initCheckin = function () {
    $('#moodPick').innerHTML = EQ.MOODS.map(m =>
      `<button type="button" class="mood" role="radio" data-v="${m.v}" aria-checked="false" aria-label="${m.label}">${face(m.v)}<span>${m.label}</span></button>`).join('');
    $('#moodPick').addEventListener('click', e => {
      const b = e.target.closest('.mood'); if (!b) return;
      draft.mood = Number(b.dataset.v); paint();
    });
    $('#moodPick').addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      draft.mood = EQ.clamp(draft.mood + (e.key === 'ArrowRight' ? 1 : -1), 1, 5);
      paint(); $(`.mood[data-v="${draft.mood}"]`).focus(); e.preventDefault();
    });

    $('#actChips').innerHTML = EQ.ACTIVITIES.map(a =>
      `<button type="button" class="chip" data-name="${a.name}" data-min="${a.min}">${a.name}<small>+${a.min}</small></button>`).join('');
    $('#actChips').addEventListener('click', e => {
      const c = e.target.closest('.chip'); if (!c) return;
      const on = draft.acts.includes(c.dataset.name), m = Number(c.dataset.min);
      if (on) { draft.acts = draft.acts.filter(x => x !== c.dataset.name); draft.active = Math.max(0, draft.active - m); }
      else { draft.acts.push(c.dataset.name); draft.active += m; }
      paint();
    });

    $('#ciStress').addEventListener('input', e => { draft.stress = Number(e.target.value); paint(); });
    $('#ciSleep').addEventListener('input', e => { draft.sleep = EQ.clamp(Number(e.target.value) || 0, 0, 16); live(); $('#sleepMeter').style.width = `${draft.sleep / 16 * 100}%`; });
    $('#ciActive').addEventListener('input', e => { draft.active = EQ.clamp(Number(e.target.value) || 0, 0, 600); live(); $('#activeMeter').style.width = `${Math.min(100, draft.active / 60 * 100)}%`; });
    $('#ciNote').addEventListener('input', e => { draft.note = e.target.value; });
    $$('.step-btn').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.step, field = id === 'ciSleep' ? 'sleep' : 'active';
      const max = field === 'sleep' ? 16 : 600;
      draft[field] = EQ.clamp(EQ.round((Number(draft[field]) || 0) + Number(b.dataset.delta), 1), 0, max);
      paint();
    }));
    $('#glasses').addEventListener('click', e => {
      const g = e.target.closest('.glass'); if (!g) return;
      const i = Number(g.dataset.i) + 1;
      draft.water = draft.water === i ? i - 1 : i; // tapping the last full glass empties it
      renderGlasses(); live();
    });
    $('#ciDate').max = EQ.key();
    $('#ciDate').addEventListener('change', e => { if (e.target.value) fill(e.target.value); });
    $('#ciDelete').addEventListener('click', async () => {
      const k = $('#ciDate').value;
      if (await EQ.confirm(`Delete your check-in for ${EQ.fmtDay(k, { weekday: 'long', day: 'numeric', month: 'long' })}?`)) {
        delete EQ.state.entries[k]; EQ.save(); fill(k); EQ.toast('Check-in deleted.');
      }
    });
    $('#checkinForm').addEventListener('submit', save);

    EQ.on('view', v => { if (v === 'checkin') fill(EQ.key()); });
    fill(EQ.key());
  };

  /* Used by Move: add finished routine minutes to today's entry */
  EQ.addActiveMinutes = function (min, label) {
    const k = EQ.key();
    // If today has no check-in yet, hold the minutes as "pending" rather than
    // inventing mood/sleep values; the check-in form picks them up later.
    let e = EQ.state.entries[k];
    if (!e) {
      const pend = EQ.state.pending && EQ.state.pending.date === k ? EQ.state.pending : { date: k, active: 0, acts: [] };
      e = pend; EQ.state.pending = pend;
    }
    e.active = Math.min(600, (e.active || 0) + min);
    if (label && !(e.acts || []).includes(label)) e.acts = [...(e.acts || []), label];
    EQ.save();
    return Boolean(EQ.state.entries[k]);
  };
})();
