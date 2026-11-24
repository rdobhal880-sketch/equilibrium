/* =====================================================================
   insights.js — turns saved check-ins into numbers, charts and plain-
   English findings. Charts are hand-drawn SVG (no chart library) and
   redraw at the real pixel size whenever their box changes size.
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$, $$ = EQ.$$;
  let range = 7;

  /* ---------------- Data for the selected range ---------------- */
  function rows(n) {
    return EQ.lastDays(n).map(k => {
      const e = EQ.state.entries[k];
      return { k, e, p: EQ.pillars(e) };
    });
  }

  /* ---------------- Shared chart frame ---------------- */
  function frame(el, { yMax, yTicks, n, bottom = 26, left = 34 }) {
    const W = el.clientWidth, H = el.clientHeight;
    const pad = { l: left, r: 10, t: 12, b: bottom };
    const iw = Math.max(10, W - pad.l - pad.r), ih = Math.max(10, H - pad.t - pad.b);
    const x = i => pad.l + (n === 1 ? iw / 2 : (i + 0.5) * iw / n);
    const y = v => pad.t + ih - (v / yMax) * ih;
    const grid = yTicks.map(t => `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${pad.l - 8}" y="${y(t) + 4}" text-anchor="end">${t}</text>`).join('');
    return { W, H, pad, iw, ih, x, y, grid };
  }
  function xLabels(f, data) {
    const narrow = f.W < 520;
    // On phones: fewer labels, and just the day number so they never collide
    const every = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 5;
    return data.map((d, i) => {
      if ((data.length - 1 - i) % every) return '';
      const label = narrow ? EQ.fmtDay(d.k, { day: 'numeric' }) : data.length <= 7 ? EQ.fmtDay(d.k) : EQ.fmtDay(d.k, { day: 'numeric', month: 'short' });
      return `<text x="${f.x(i)}" y="${f.H - 6}" text-anchor="middle">${label}</text>`;
    }).join('');
  }

  /* Tooltip shared by all charts */
  function tooltip(el, data, f, fmt) {
    let tip = $('.chart-tip', el);
    if (!tip) { tip = document.createElement('div'); tip.className = 'chart-tip'; el.appendChild(tip); }
    el.onpointermove = ev => {
      const r = el.getBoundingClientRect(), px = ev.clientX - r.left;
      const i = EQ.clamp(Math.floor((px - f.pad.l) / (f.iw / data.length)), 0, data.length - 1);
      const d = data[i];
      if (!d.e) { tip.classList.remove('show'); return; }
      tip.textContent = `${EQ.fmtDay(d.k, { weekday: 'short', day: 'numeric', month: 'short' })} · ${fmt(d)}`;
      tip.style.left = `${EQ.clamp(f.x(i), 70, f.W - 70)}px`;
      tip.style.top = `${f.pad.t + 30}px`;
      tip.classList.add('show');
    };
    el.onpointerleave = () => tip.classList.remove('show');
  }

  /* ---------------- Line chart: Balance score + mood dots ---------------- */
  function drawScore(el, data) {
    const f = frame(el, { yMax: 100, yTicks: [0, 25, 50, 75, 100], n: data.length });
    let path = '', area = '', started = false, first = null, last = null;
    data.forEach((d, i) => {
      if (!d.p) { started = false; return; }
      const X = f.x(i), Y = f.y(d.p.score);
      path += `${started ? 'L' : 'M'}${X},${Y}`;
      if (first === null) first = X; last = X; started = true;
    });
    // soft area under the line (only the continuous outline, for colour)
    const pts = data.map((d, i) => d.p ? [f.x(i), f.y(d.p.score)] : null).filter(Boolean);
    if (pts.length > 1) area = `M${pts[0][0]},${f.y(0)}` + pts.map(p => `L${p[0]},${p[1]}`).join('') + `L${pts[pts.length - 1][0]},${f.y(0)}Z`;
    const dots = data.map((d, i) => d.p ? `<circle cx="${f.x(i)}" cy="${f.y(d.p.score)}" r="${data.length > 14 ? 3 : 4.5}" fill="var(--surface)" stroke="var(--mind)" stroke-width="2.5"/>` : '').join('');
    const moods = data.map((d, i) => d.e ? `<circle cx="${f.x(i)}" cy="${f.y((d.e.mood - 1) / 4 * 100)}" r="${data.length > 14 ? 3 : 4}" fill="var(--body)" opacity=".85"/>` : '').join('');
    el.querySelector('svg')?.remove();
    el.insertAdjacentHTML('afterbegin', `<svg aria-hidden="true">
      <defs><linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--mind)" stop-opacity=".22"/><stop offset="1" stop-color="var(--mind)" stop-opacity="0"/></linearGradient></defs>
      ${f.grid}${xLabels(f, data)}
      <path d="${area}" fill="url(#gScore)"/>
      <path d="${path}" fill="none" stroke="var(--mind)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${moods}${dots}</svg>`);
    tooltip(el, data, f, d => `Score ${d.p.score} · ${EQ.MOODS[d.e.mood - 1].label} mood`);
  }

  /* ---------------- Bar charts: sleep and activity ---------------- */
  function drawBars(el, data, { field, color, yMax, ticks, band, line, unit }) {
    const f = frame(el, { yMax, yTicks: ticks, n: data.length });
    const bw = Math.max(3, Math.min(34, f.iw / data.length * 0.62));
    const bandSvg = band ? `<rect x="${f.pad.l}" y="${f.y(band[1])}" width="${f.iw}" height="${f.y(band[0]) - f.y(band[1])}" fill="var(--rest)" opacity=".13" rx="4"/>` : '';
    const lineSvg = line ? `<line x1="${f.pad.l}" x2="${f.W - f.pad.r}" y1="${f.y(line)}" y2="${f.y(line)}" stroke="var(--body)" stroke-width="2" stroke-dasharray="6 5"/>` : '';
    const bars = data.map((d, i) => {
      if (!d.e) return '';
      const v = Math.min(yMax, Number(d.e[field]) || 0), top = f.y(v), h = f.y(0) - top;
      const hit = band ? (v >= band[0] && v <= band[1]) : v >= line;
      return `<rect x="${f.x(i) - bw / 2}" y="${top}" width="${bw}" height="${Math.max(0, h)}" rx="${Math.min(6, bw / 2)}" fill="${color}" opacity="${hit ? 1 : 0.5}"/>`;
    }).join('');
    el.querySelector('svg')?.remove();
    el.insertAdjacentHTML('afterbegin', `<svg aria-hidden="true">${bandSvg}${f.grid}${xLabels(f, data)}${lineSvg}${bars}</svg>`);
    tooltip(el, data, f, d => `${d.e[field]} ${unit}`);
  }

  /* ---------------- Findings: plain-English patterns ---------------- */
  function pearson(a, b) {
    const n = a.length, ma = EQ.avg(a), mb = EQ.avg(b);
    let num = 0, da = 0, db = 0;
    for (let i = 0; i < n; i++) { num += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
    return da && db ? num / Math.sqrt(da * db) : 0;
  }
  function findings(data) {
    const d = data.filter(x => x.e);
    const out = [];
    if (d.length < 3) return [{ k: 'mind', t: `Log ${3 - d.length} more day${d.length === 2 ? '' : 's'} in this range to unlock patterns.` }];
    const moodLabel = v => v.toFixed(1);

    const good = d.filter(x => x.e.sleep >= EQ.TARGETS.sleepMin), short = d.filter(x => x.e.sleep < EQ.TARGETS.sleepMin);
    if (good.length >= 2 && short.length >= 2) {
      const a = EQ.avg(good.map(x => x.e.mood)), b = EQ.avg(short.map(x => x.e.mood));
      out.push({ k: 'rest', t: `After 8+ hours of sleep your mood averaged <b>${moodLabel(a)}/5</b>, compared with <b>${moodLabel(b)}/5</b> after shorter nights.` });
    } else if (short.length === d.length) {
      out.push({ k: 'rest', t: `You slept under 8 hours on <b>every</b> logged day in this range. Teenagers need 8–10 hours; that’s the first thing to fix.` });
    }

    const act = d.filter(x => x.e.active >= 30), lazy = d.filter(x => x.e.active < 30);
    if (act.length >= 2 && lazy.length >= 2) {
      const a = EQ.avg(act.map(x => x.e.stress)), b = EQ.avg(lazy.map(x => x.e.stress));
      const diff = b - a;
      out.push({ k: 'body', t: diff > 0.3
        ? `On days with 30+ active minutes your stress averaged <b>${a.toFixed(1)}/10</b>, vs <b>${b.toFixed(1)}/10</b> on less active days.`
        : `Your stress was about the same on active (${a.toFixed(1)}) and less active (${b.toFixed(1)}) days so far.` });
    }

    if (d.length >= 5) {
      const r = pearson(d.map(x => x.e.sleep), d.map(x => x.e.mood));
      const s = Math.abs(r) >= 0.6 ? 'strong' : Math.abs(r) >= 0.3 ? 'moderate' : 'weak';
      out.push({ k: 'mind', t: `Sleep and mood have a <b>${s} ${r >= 0 ? 'positive' : 'negative'}</b> link in your data (r = ${r.toFixed(2)}, ${d.length} days).` });
    }

    const weak = { Mind: 0, Body: 0, Rest: 0 };
    d.forEach(x => weak[x.p.weakest]++);
    const [wn, wc] = Object.entries(weak).sort((a, b) => b[1] - a[1])[0];
    out.push({ k: wn.toLowerCase(), t: `<b>${wn}</b> was your weakest pillar on ${wc} of ${d.length} days. ${({ Mind: 'Try Breathe or Reframe when stress builds.', Body: 'Short Move routines between revision blocks add up.', Rest: 'Use the sleep trade-off in Focus before planning a late night.' })[wn]}` });

    const best = d.reduce((a, b) => (b.p.score > a.p.score ? b : a)), worst = d.reduce((a, b) => (b.p.score < a.p.score ? b : a));
    if (best !== worst) {
      const note = worst.e.note ? ` You wrote: “${EQ.esc(worst.e.note)}”` : '';
      out.push({ k: 'mind', t: `Best day: <b>${EQ.fmtDay(best.k, { weekday: 'long', day: 'numeric' })}</b> (${best.p.score}). Toughest: <b>${EQ.fmtDay(worst.k, { weekday: 'long', day: 'numeric' })}</b> (${worst.p.score}).${note}` });
    }

    if (d.length >= 6) {
      const half = Math.floor(d.length / 2);
      const a = EQ.avg(d.slice(0, half).map(x => x.p.score)), b = EQ.avg(d.slice(half).map(x => x.p.score));
      const ch = Math.round(b - a);
      out.push({ k: 'mind', t: ch >= 3 ? `Your Balance score is <b>trending up</b>: ${ch} points higher in the second half of this period.` : ch <= -3 ? `Your Balance score has <b>dipped</b> ${-ch} points in the second half of this period. Check which pillar slipped.` : `Your Balance score has been <b>steady</b> across this period.` });
    }
    return out;
  }

  function streak() {
    let n = 0, d = new Date();
    if (!EQ.state.entries[EQ.key(d)]) d = EQ.addDays(d, -1); // today not logged yet doesn't break the streak
    while (EQ.state.entries[EQ.key(d)]) { n++; d = EQ.addDays(d, -1); }
    return n;
  }

  /* ---------------- Render everything ---------------- */
  EQ.renderInsights = function () {
    const any = Object.keys(EQ.state.entries).length > 0;
    $('#insightsEmpty').hidden = any;
    $('#insightsBody').hidden = !any;
    if (!any) return;

    const data = rows(range), prev = rows(range * 2).slice(0, range);
    const logged = data.filter(x => x.e), prevLogged = prev.filter(x => x.e);
    const avgScore = logged.length ? Math.round(EQ.avg(logged.map(x => x.p.score))) : null;
    const prevScore = prevLogged.length ? Math.round(EQ.avg(prevLogged.map(x => x.p.score))) : null;
    const avgSleep = logged.length ? EQ.round(EQ.avg(logged.map(x => x.e.sleep)), 1) : null;
    const nightsOk = logged.filter(x => x.e.sleep >= 8 && x.e.sleep <= 10).length;
    const activeOk = logged.filter(x => x.e.active >= 60).length;
    const change = avgScore !== null && prevScore !== null ? avgScore - prevScore : null;

    $('#sampleToggle').textContent = EQ.state.sample ? 'Remove sample data' : 'Add sample fortnight';
    $('#insightsSub').textContent = `${logged.length} of ${range} days logged${EQ.state.sample ? ' · sample data' : ''}.`;
    const k = [
      { t: 'Average Balance', v: avgScore ?? '–', u: '/100', d: change === null ? 'No earlier period to compare' : `${change >= 0 ? '+' : '−'}${Math.abs(change)} vs previous ${range} days` },
      { t: 'Average sleep', v: avgSleep ?? '–', u: 'h', d: `${nightsOk} of ${logged.length} nights in the 8–10 h range` },
      { t: 'Active days', v: activeOk, u: `/ ${logged.length}`, d: 'Days with 60+ active minutes' },
      { t: 'Check-in streak', v: streak(), u: streak() === 1 ? 'day' : 'days', d: 'Consecutive days logged' }
    ];
    $('#kpis').innerHTML = k.map(x => `<div class="kpi"><div class="t">${x.t}</div><div class="v">${x.v}<small> ${x.u}</small></div><p class="d">${x.d}</p></div>`).join('');

    EQ._insightData = data;
    drawAll();
    $('#findings').innerHTML = findings(data).map(f => `<li class="${f.k}"><i></i><span>${f.t}</span></li>`).join('');
    $('#chartScore').setAttribute('aria-label', `Balance score over the last ${range} days. Average ${avgScore ?? 'not available'}.`);
  };

  function drawAll() {
    const data = EQ._insightData; if (!data || $('#insightsBody').hidden) return;
    const maxAct = Math.max(90, ...data.filter(x => x.e).map(x => x.e.active));
    const actMax = Math.ceil(maxAct / 30) * 30;
    drawScore($('#chartScore'), data);
    drawBars($('#chartSleep'), data, { field: 'sleep', color: 'var(--rest)', yMax: 12, ticks: [0, 4, 8, 12], band: [8, 10], unit: 'h sleep' });
    drawBars($('#chartActive'), data, { field: 'active', color: 'var(--body)', yMax: actMax, ticks: [0, actMax / 3, actMax * 2 / 3, actMax].map(Math.round), line: 60, unit: 'active min' });
  }

  /* ---------------- Data tools ---------------- */
  function exportJSON() {
    const { entries, thoughts, focus, prefs } = EQ.state;
    return JSON.stringify({ app: 'equilibrium', version: 1, exported: new Date().toISOString(), entries, thoughts, focus, prefs }, null, 2);
  }
  function validEntry(k, e) {
    return /^\d{4}-\d{2}-\d{2}$/.test(k) && e && [e.mood, e.stress, e.sleep, e.active, e.water].every(v => typeof v === 'number' && isFinite(v));
  }

  EQ.initInsights = function () {
    $$('#rangeSeg button').forEach(b => b.addEventListener('click', () => {
      range = Number(b.dataset.range);
      $$('#rangeSeg button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
      EQ.renderInsights();
    }));
    $$('[data-load-sample]').forEach(b => b.addEventListener('click', () => (EQ.state.sample ? EQ.clearSample() : EQ.loadSample())));

    $('#exportCopy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(exportJSON()); EQ.toast('Copied your data to the clipboard.'); }
      catch (e) { $('#importBox').value = exportJSON(); $('#importBox').select(); EQ.toast('Copy blocked here: your data is selected in the box below.'); }
    });
    $('#exportFile').addEventListener('click', () => {
      try {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([exportJSON()], { type: 'application/json' }));
        a.download = `equilibrium-backup-${EQ.key()}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        EQ.toast('Backup file created. If nothing downloaded, use Copy instead.');
      } catch (e) { EQ.toast('Downloads are blocked here. Use Copy instead.'); }
    });
    $('#importBtn').addEventListener('click', () => {
      try {
        const d = JSON.parse($('#importBox').value);
        const entries = Object.entries(d.entries || {}).filter(([k, e]) => validEntry(k, e));
        if (!entries.length) throw new Error('none');
        entries.forEach(([k, e]) => { EQ.state.entries[k] = e; });
        // imported days are real data, so drop any sample flag
        entries.forEach(([k]) => { delete EQ.state.entries[k].sample; });
        if (Array.isArray(d.thoughts)) EQ.state.thoughts = d.thoughts.filter(t => t && typeof t.thought === 'string');
        EQ.state.sample = false;
        EQ.save(); $('#importBox').value = '';
        EQ.toast(`Imported ${entries.length} day${entries.length === 1 ? '' : 's'}.`);
      } catch (e) { EQ.toast('That doesn’t look like an Equilibrium backup.'); }
    });
    $('#clearAll').addEventListener('click', async () => {
      if (await EQ.confirm('This permanently deletes every check-in, thought record and focus session on this device.', 'Delete everything')) {
        EQ.state.entries = {}; EQ.state.thoughts = []; EQ.state.focus = {}; EQ.state.sample = false; delete EQ.state.pending;
        EQ.save(); EQ.toast('All data deleted.');
      }
    });

    const ro = new ResizeObserver(() => drawAll());
    ['#chartScore', '#chartSleep', '#chartActive'].forEach(s => ro.observe($(s)));
    EQ.on('change', () => { if (!$('[data-view="insights"]').hidden) EQ.renderInsights(); });
    EQ.on('view', v => { if (v === 'insights') EQ.renderInsights(); });
  };
})();
