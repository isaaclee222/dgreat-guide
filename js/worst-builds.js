(function () {
  'use strict';
  const API = '/api/admin';
  const VOTE_KEY = 'DSA_WORST_BUILD_VOTES_V1';
  const $ = id => document.getElementById(id);
  const esc = value => window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let payload = { top: [], builds: [], weeks: [] };
  let idx = 0;
  let timer = null;

  function score(build) { return Number(build.votes?.up || 0) - Number(build.votes?.down || 0); }
  function localVotes() { try { return JSON.parse(localStorage.getItem(VOTE_KEY) || '{}'); } catch { return {}; } }
  function saveLocalVotes(v) { try { localStorage.setItem(VOTE_KEY, JSON.stringify(v)); } catch {} }
  function staticBuilds() { return (window.DSA_WORST_BUILDS || []).slice().sort((a,b)=>score(b)-score(a)); }
  async function fetchBuilds() {
    try {
      const res = await fetch(`${API}/worst-builds?_=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Backend unavailable');
      payload = await res.json();
    } catch (err) {
      const builds = staticBuilds();
      const weeks = Array.from(new Set(builds.map(b=>b.week))).sort().reverse();
      payload = { ok:false, currentWeek: weeks[0] || '', weeks, top: builds.slice(0,3), builds };
    }
    renderCard();
    renderModalContent();
    if (!timer && (payload.top || []).length > 1) timer = setInterval(() => { idx = (idx + 1) % payload.top.length; renderCard(); }, 7000);
  }
  function renderCard() {
    const target = $('worst-build-card'); if (!target) return;
    const builds = payload.top || [];
    if (!builds.length) {
      target.innerHTML = '<strong>No submissions yet.</strong><p>Add the first awful build you saw this week.</p>';
      return;
    }
    const b = builds[idx % builds.length];
    target.innerHTML = `<div class="worst-build-mini"><div><span class="badge">${esc(b.week || 'This week')}</span><span class="badge ${window.DSA?.raceClass ? window.DSA.raceClass(b.race) : ''}">${esc(b.race || 'Any')}</span></div><h3>${esc(b.title)}</h3><p>${esc(b.buildText || '')}</p>${b.whyBad ? `<p class="mini"><strong>Why it hurts:</strong> ${esc(b.whyBad)}</p>` : ''}<div class="worst-build-score">Score ${score(b)} · ${esc(b.submittedBy || 'Anonymous')}</div></div>`;
  }
  function ensureModal() {
    if ($('worst-build-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'worst-build-modal';
    modal.className = 'worst-build-modal';
    modal.hidden = true;
    modal.innerHTML = `<div class="settings-backdrop" data-wb-close></div><section class="worst-build-dialog" role="dialog" aria-modal="true" aria-labelledby="wb-title"><button class="settings-close" type="button" data-wb-close>×</button><span class="eyebrow">Community vote</span><h2 id="wb-title">Worst builds by week</h2><div class="worst-build-dialog-grid"><div><h3>Submit a build</h3><label class="form-field">Title<input id="wb-title-input" placeholder="Mass Vikings into pure ground"></label><label class="form-field">Race<select id="wb-race"><option>Any</option><option>Zerg</option><option>Terran</option><option>Protoss</option></select></label><label class="form-field">Matchup<input id="wb-matchup" placeholder="TvP, ZvZ, Any"></label><label class="form-field">Build<textarea id="wb-build" placeholder="What did they build?"></textarea></label><label class="form-field">Why it is bad<textarea id="wb-why" placeholder="What makes it a donation?"></textarea></label><label class="form-field">Name<input id="wb-name" placeholder="Anonymous"></label><button id="wb-submit" class="button-primary" type="button">Submit build</button><p id="wb-message" class="mini"></p></div><div><div class="week-filter-row"><label class="form-field">Week<select id="wb-week-filter"></select></label></div><div id="wb-list" class="worst-build-list"></div></div></div></section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target.closest('[data-wb-close]')) closeModal(); });
    $('wb-submit')?.addEventListener('click', submitBuild);
    $('wb-week-filter')?.addEventListener('change', renderModalContent);
  }
  function openModal() { ensureModal(); renderModalContent(); $('worst-build-modal').hidden = false; document.body.classList.add('settings-open'); }
  function closeModal() { const m=$('worst-build-modal'); if(m) m.hidden=true; document.body.classList.remove('settings-open'); }
  function renderModalContent() {
    const list = $('wb-list'); const weekSel = $('wb-week-filter'); if (!list || !weekSel) return;
    const weeks = payload.weeks?.length ? payload.weeks : Array.from(new Set((payload.builds||[]).map(b=>b.week))).sort().reverse();
    const current = weekSel.value || weeks[0] || '';
    weekSel.innerHTML = weeks.map(w => `<option value="${esc(w)}">${esc(w)}</option>`).join('') || '<option>No weeks yet</option>';
    if (weeks.includes(current)) weekSel.value = current;
    const chosen = weekSel.value;
    const voted = localVotes();
    const builds = (payload.builds || []).filter(b => !chosen || b.week === chosen).sort((a,b)=>score(b)-score(a));
    list.innerHTML = builds.length ? builds.map(b => `<article class="worst-build-list-row"><strong>${esc(b.title)}</strong><span>${esc(b.race || 'Any')} · Score ${score(b)} · ${esc(b.submittedBy || 'Anonymous')}</span><p>${esc(b.buildText || '')}</p>${b.whyBad ? `<p class="mini">${esc(b.whyBad)}</p>` : ''}<div class="button-row"><button class="button-secondary" data-wb-vote="up" data-build-id="${esc(b.id)}" ${voted[b.id] ? 'disabled' : ''}>Vote worst</button><button class="button-ghost" data-wb-vote="down" data-build-id="${esc(b.id)}" ${voted[b.id] ? 'disabled' : ''}>Not that bad</button></div></article>`).join('') : '<div class="empty-state">No builds for this week yet.</div>';
    list.querySelectorAll('[data-wb-vote]').forEach(btn => btn.addEventListener('click', () => voteBuild(btn.dataset.buildId, btn.dataset.wbVote)));
  }
  async function submitBuild() {
    const body = { title:$('wb-title-input')?.value || '', race:$('wb-race')?.value || 'Any', matchup:$('wb-matchup')?.value || '', buildText:$('wb-build')?.value || '', whyBad:$('wb-why')?.value || '', submittedBy:$('wb-name')?.value || 'Anonymous' };
    const msg=$('wb-message'); if(msg) msg.textContent='Submitting...';
    try {
      const res = await fetch(`${API}/worst-builds/submit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Submit failed');
      payload = data.worstBuilds || payload;
      ['wb-title-input','wb-matchup','wb-build','wb-why','wb-name'].forEach(id=>{ if($(id)) $(id).value=''; });
      if(msg) msg.textContent='Submitted. It is live now.';
      renderCard(); renderModalContent();
    } catch(err){ if(msg) msg.textContent=err.message; }
  }
  async function voteBuild(buildId, direction) {
    const voted = localVotes(); if (voted[buildId]) return;
    voted[buildId] = direction; saveLocalVotes(voted);
    try {
      const res = await fetch(`${API}/worst-builds/vote`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ buildId, direction }) });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error || 'Vote failed');
      payload = data.worstBuilds || payload;
    } catch (err) {
      const b = (payload.builds || []).find(x => x.id === buildId);
      if (b) { b.votes = b.votes || { up:0, down:0 }; b.votes[direction] = Number(b.votes[direction] || 0) + 1; }
    }
    renderCard(); renderModalContent();
  }
  document.addEventListener('DOMContentLoaded', () => { if (!$('worst-build-widget')) return; ensureModal(); $('worst-build-open')?.addEventListener('click', openModal); fetchBuilds(); });
  document.addEventListener('dsa-community-data-ready', () => { if (!payload.builds?.length) { payload.builds = staticBuilds(); payload.top = payload.builds.slice(0,3); renderCard(); } });
})();
