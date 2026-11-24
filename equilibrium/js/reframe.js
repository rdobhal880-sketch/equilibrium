/* =====================================================================
   reframe.js — CBT thought records: catch a thought, name the trap,
   weigh the evidence, write a balanced version, and see how much the
   feeling changed. Free text is checked by the safety net.
   ===================================================================== */
(function () {
  const EQ = window.EQ, $ = EQ.$, $$ = EQ.$$;
  let picked = new Set();

  function renderTraps() {
    $('#traps').innerHTML = EQ.TRAPS.map(t => `<button type="button" class="trap" data-id="${t.id}" aria-pressed="${picked.has(t.id)}">${t.name}</button>`).join('');
  }
  function slider(id, out) {
    const el = $(id), o = $(out);
    const upd = () => { o.textContent = `${el.value}%`; el.style.setProperty('--p', `${el.value}%`); };
    el.addEventListener('input', upd); upd();
    return upd;
  }

  function renderList() {
    const list = EQ.state.thoughts.slice().reverse();
    if (!list.length) { $('#rfList').innerHTML = '<p class="muted">Your saved thought records appear here. Only you can see them.</p>'; return; }
    $('#rfList').innerHTML = list.map(t => {
      const drop = t.before - t.after;
      const traps = (t.traps || []).map(id => EQ.TRAPS.find(x => x.id === id)).filter(Boolean);
      return `<article class="rf-item">
        <div class="row between"><span class="when">${EQ.esc(new Date(t.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }))} · ${EQ.esc(t.situation)}</span>
        <button class="linklike fine" data-del="${t.at}" aria-label="Delete this record" style="margin:0">Delete</button></div>
        <p class="old">${EQ.esc(t.thought)}</p>
        <p class="new">${EQ.esc(t.balanced)}</p>
        <div class="drop"><span>${t.before}%</span><div class="bar"><i style="width:${t.after}%;background:var(--mind)"></i></div><span>${t.after}%</span>
        <span class="${drop > 0 ? 'pass' : 'muted'}">${drop > 0 ? `−${drop} points` : 'no change'}</span></div>
        ${traps.length ? `<div class="rf-tags">${traps.map(x => `<span>${EQ.esc(x.name)}</span>`).join('')}</div>` : ''}
      </article>`;
    }).join('');
  }

  EQ.initReframe = function () {
    renderTraps();
    const ub = slider('#rfBefore', '#rfBeforeOut'), ua = slider('#rfAfter', '#rfAfterOut');
    $('#traps').addEventListener('click', e => {
      const b = e.target.closest('.trap'); if (!b) return;
      const t = EQ.TRAPS.find(x => x.id === b.dataset.id);
      picked.has(t.id) ? picked.delete(t.id) : picked.add(t.id);
      renderTraps();
      $(`.trap[data-id="${t.id}"]`).focus();
      $('#trapHint').innerHTML = `<b>${EQ.esc(t.name)}:</b> ${EQ.esc(t.help)}`;
    });

    $('#reframeForm').addEventListener('submit', e => {
      e.preventDefault();
      const v = id => $(id).value.trim();
      const rec = { at: Date.now(), situation: v('#rfSituation'), thought: v('#rfThought'), for: v('#rfFor'), against: v('#rfAgainst'),
        balanced: v('#rfBalanced'), before: Number($('#rfBefore').value), after: Number($('#rfAfter').value), traps: [...picked] };
      if (!rec.situation || !rec.thought || !rec.balanced) { EQ.toast('Fill in what happened, the thought and a balanced thought.'); return; }
      EQ.state.thoughts.push(rec);
      EQ.save();
      const allText = [rec.situation, rec.thought, rec.for, rec.against, rec.balanced].join(' ');
      e.target.reset(); picked.clear(); renderTraps(); ub(); ua();
      $('#trapHint').textContent = 'Tap a trap to see what it means.';
      if (EQ.hasCrisisWords(allText)) { EQ.showSupport('text'); return; }
      const d = rec.before - rec.after;
      EQ.toast(d > 0 ? `Saved. The feeling dropped by ${d} points.` : 'Saved. Some thoughts take a few goes. That’s normal.');
    });
    $('#reframeForm').addEventListener('reset', () => { picked.clear(); setTimeout(() => { renderTraps(); ub(); ua(); }, 0); });
    $('#rfList').addEventListener('click', async e => {
      const b = e.target.closest('[data-del]'); if (!b) return;
      if (await EQ.confirm('Delete this thought record?')) {
        EQ.state.thoughts = EQ.state.thoughts.filter(t => String(t.at) !== b.dataset.del);
        EQ.save(); EQ.toast('Thought record deleted.');
      }
    });
    EQ.on('change', renderList);
    renderList();
  };
})();
