/* =====================================================================
   today.js — the home screen: greeting, today's ring, the three
   "next best step" recommendations, today's numbers, and the
   sample-data button for demos.
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$;

  const ICONS = {
    check: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 13l2 2 4-4"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    move: '<svg viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="2"/><path d="M8 21l3-6 3 3v4M7 10l4-3 3 3 3 1M11 7l-1 6"/></svg>',
    wind: '<svg viewBox="0 0 24 24"><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/></svg>',
    drop: '<svg viewBox="0 0 24 24"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg>',
    timer: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>'
  };

  /* Decide the three most useful next steps from today's data */
  function nextSteps(e, p) {
    const out = [];
    if (!e) out.push({ k: 'mind', i: 'check', t: 'Do your 60-second check-in', d: 'Six quick questions give you today’s Balance score and tell you which pillar needs attention.', href: '#checkin', go: 'Start check-in' });
    if (p && p.rest < 60) out.push({ k: 'rest', i: 'moon', t: 'Protect tonight’s sleep', d: `You slept ${e.sleep} h. See what a late night really costs before you plan tonight’s revision.`, href: '#focus', go: 'Open the sleep trade-off' });
    if (p && p.body < 60) out.push({ k: 'body', i: 'move', t: `Move for ${e.active >= 30 ? 10 : 5} minutes`, d: `You have ${Math.max(0, EQ.TARGETS.activeMin - (e.active || 0))} active minutes to go. A desk routine fits between topics.`, href: '#move', go: 'Build a routine' });
    if (p && (p.mind < 60 || e.stress >= 7)) out.push({ k: 'mind', i: 'wind', t: 'Two minutes of cyclic sighing', d: 'Stress is running high. A long out-breath is one of the quickest ways to settle your body.', href: '#breathe', go: 'Start breathing' });
    if (p && (e.water || 0) < (EQ.state.prefs.water || 8) / 2) out.push({ k: 'body', i: 'drop', t: 'Top up your water', d: 'You’re under half your water goal. Easy to forget during revision, especially in the heat.', href: '#checkin', go: 'Update water' });
    // Fillers so there are always three useful cards
    const fill = [
      { k: 'mind', i: 'timer', t: 'Revise in focused blocks', d: '25 minutes on, 5 off, with a movement idea in every break.', href: '#focus', go: 'Open Focus' },
      { k: 'mind', i: 'pen', t: 'Reframe a worrying thought', d: 'Write it down, check the evidence, find a fairer version. Takes about four minutes.', href: '#reframe', go: 'Open Reframe' },
      { k: 'mind', i: 'wind', t: 'Reset with your breath', d: 'Box breathing is easy to do silently, even in an exam hall.', href: '#breathe', go: 'Start breathing' },
      { k: 'body', i: 'move', t: 'Stretch out the revision hunch', d: 'A five-minute stretch routine for your desk.', href: '#move', go: 'Build a routine' }
    ];
    for (const f of fill) { if (out.length >= 3) break; if (!out.some(o => o.href === f.href)) out.push(f); }
    return out.slice(0, 3);
  }

  function careCheck() {
    // Gentle message if mood has been low on 3 of the last 5 logged days
    const days = EQ.lastDays(5).map(k => EQ.state.entries[k]).filter(Boolean);
    const low = days.filter(d => d.mood <= 2).length;
    const card = $('#careCard');
    if (days.length >= 3 && low >= 3 && !days.some(d => d.sample)) {
      card.innerHTML = `<p><strong>You’ve logged a low mood on ${low} of the last ${days.length} days.</strong> That’s worth talking about with someone you trust, like a friend, family member or your school counsellor. You don’t have to wait until it feels serious.</p><button class="btn ghost" data-open-support>See support options</button>`;
      card.hidden = false;
    } else card.hidden = true;
  }

  EQ.renderToday = function () {
    const h = new Date().getHours();
    const name = EQ.state.prefs.name ? `, ${EQ.state.prefs.name}` : '';
    $('#greeting').textContent = `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}${name} · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`;

    const e = EQ.state.entries[EQ.key()];
    const p = EQ.pillars(e);
    EQ.ring($('#todayRing'), p);
    EQ.legend($('#todayLegend'), p);
    $('#ctaCheckin').textContent = e ? 'Update today’s check-in' : 'Start today’s check-in';
    $('#ctaSample').hidden = EQ.state.sample || Object.keys(EQ.state.entries).length >= 5;
    $('#sampleNote').hidden = !EQ.state.sample;

    $('#nextSteps').innerHTML = nextSteps(e, p).map(s => `
      <a class="card step-card" href="${s.href}">
        <span class="step-icon ${s.k}">${ICONS[s.i]}</span>
        <span class="h3">${EQ.esc(s.t)}</span>
        <span class="muted">${EQ.esc(s.d)}</span>
        <span class="go">${EQ.esc(s.go)}</span>
      </a>`).join('');

    const T = EQ.TARGETS, waterGoal = EQ.state.prefs.water || T.waterDefault;
    const g = [
      { t: 'Sleep last night', v: e ? e.sleep : '–', u: 'h', pct: e ? Math.min(100, e.sleep / T.sleepMin * 100) : 0, c: 'var(--rest)', note: `Target ${T.sleepMin}–${T.sleepMax} h` },
      { t: 'Active minutes', v: e ? e.active : '–', u: 'min', pct: e ? Math.min(100, e.active / T.activeMin * 100) : 0, c: 'var(--body)', note: `Target ${T.activeMin} min` },
      { t: 'Water', v: e ? e.water : '–', u: `/ ${waterGoal}`, pct: e ? Math.min(100, e.water / waterGoal * 100) : 0, c: 'var(--rest)', note: 'Your daily goal' },
      { t: 'Mood', v: e ? EQ.MOODS[e.mood - 1].label : '–', u: '', pct: e ? e.mood / 5 * 100 : 0, c: 'var(--mind)', note: e ? `Stress ${e.stress}/10` : 'Not logged yet' }
    ];
    $('#glance').innerHTML = g.map(x => `
      <div class="card gl"><div class="t">${x.t}</div><div class="v">${EQ.esc(x.v)}<small>${x.u}</small></div>
      <div class="bar"><i style="width:${x.pct}%;background:${x.c}"></i></div><div class="fine">${x.note}</div></div>`).join('');
    careCheck();
  };

  /* ---------------- Sample data for demos (clearly flagged) ---------------- */
  EQ.loadSample = function () {
    const entries = {};
    // A believable exam-season fortnight: a mock week dip, then recovery
    const plan = [
      [8.5, 45, 7, 4, 4], [8, 60, 8, 4, 3], [7, 30, 6, 3, 5], [6.5, 20, 5, 3, 6], [6, 15, 5, 2, 8],
      [5.5, 10, 4, 2, 9], [7.5, 70, 6, 3, 6], [9, 90, 8, 4, 4], [8, 40, 7, 4, 4], [7, 25, 6, 3, 6],
      [6.5, 35, 7, 3, 6], [8.5, 60, 8, 4, 4], [8, 75, 9, 5, 3], [7.5, 30, 6, 4, 5]
    ];
    const notes = { 4: 'Chemistry mock tomorrow, revised until late.', 5: 'Mock day. Exhausted.', 7: 'Cricket nets after school, felt much better.', 12: 'Padel with friends. Good day.' };
    // Sample days only fill gaps: any real check-in you've saved is kept
    const days = EQ.lastDays(plan.length);
    let added = 0;
    days.forEach((k, i) => {
      if (EQ.state.entries[k]) return;
      const [sleep, active, water, mood, stress] = plan[i];
      entries[k] = { sleep, active, water, mood, stress, note: notes[i] || '', acts: [], sample: true };
      added++;
    });
    Object.assign(EQ.state.entries, entries);
    EQ.state.sample = true;
    EQ.save();
    EQ.toast(`Sample data added for ${added} day${added === 1 ? '' : 's'}. Your own check-ins are kept.`);
  };
  EQ.clearSample = function () {
    for (const [k, e] of Object.entries(EQ.state.entries)) if (e.sample) delete EQ.state.entries[k];
    EQ.state.sample = false; EQ.save();
    EQ.toast('Sample data cleared. Your own check-ins are kept.');
  };

  EQ.initToday = function () {
    $('#ctaSample').addEventListener('click', EQ.loadSample);
    $('#clearSample').addEventListener('click', EQ.clearSample);
    EQ.on('change', EQ.renderToday);
    EQ.on('view', v => { if (v === 'today') EQ.renderToday(); });
    EQ.renderToday();
  };
})();
