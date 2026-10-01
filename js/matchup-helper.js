(function () {
  function byId(id) { return document.getElementById(id); }
  function esc(value) { return window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? ''); }
  const STORAGE = {
    myRace: 'dsaMatchupMyRace',
    enemyRace: 'dsaMatchupEnemyRace',
    threat: 'dsaMatchupEnemyThreat',
    baselineCollapsed: 'dsaMatchupBaselineCollapsed'
  };
  function readStore(key) {
    try { return localStorage.getItem(key); }
    catch (err) { return null; }
  }
  function writeStore(key, value) {
    try { localStorage.setItem(key, value); }
    catch (err) {}
  }
  function state() {
    return {
      myRace: byId('my-race').value,
      enemyRace: byId('enemy-race').value,
      position: 'Any',
      threat: byId('enemy-threat').value
    };
  }
  function slug(value) {
    const alias = {
      'widowmine':'widow-mine','siegetank':'siege-tank','sigetank':'siege-tank','pheonix':'phoenix','voidray':'void-ray',
      'muta':'muta','mutalisk':'muta','hydra':'hydralisk','ling':'zergling','lings':'zergling','collos':'colossus'
    };
    const raw = String(value || '').toLowerCase().trim();
    if (alias[raw]) return alias[raw];
    return raw.replace(/&/g, ' and ').replace(/\s*\/\s*/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
  }
  function unitImage(name) { return `assets/units/${slug(name)}.png`; }
  function voteKey(rec) {
    return ['dsaVotes', rec.id || rec.enemyThreat, rec.myRace, rec.unitRace, rec.positionContext || 'Any'].join('|');
  }
  function loadVotes(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{"up":0,"down":0,"mine":""}'); }
    catch (err) { return { up:0, down:0, mine:'' }; }
  }
  function confidence(votes) {
    const total = Number(votes.up || 0) + Number(votes.down || 0);
    if (!total) return 84;
    return Math.max(5, Math.round((Number(votes.up || 0) / total) * 100));
  }

  let threatCacheSource = null;
  let threatCacheKey = '';
  let threatCacheList = null;
  function clearThreatCache() {
    threatCacheSource = null;
    threatCacheKey = '';
    threatCacheList = null;
  }

  function labelClassPriority(priority) {
    const p = String(priority || '').toLowerCase();
    if (p.includes('critical')) return 'priority-critical';
    if (p.includes('high')) return 'priority-high';
    if (p.includes('medium')) return 'priority-medium';
    return 'priority-low';
  }
  function labelClassSkill(skill) {
    const s = String(skill || '').toLowerCase();
    if (s.includes('very') || s.includes('expert')) return 'skill-very-high';
    if (s.includes('high')) return 'skill-high';
    if (s.includes('medium')) return 'skill-medium';
    return 'skill-low';
  }
  function contextMatches(value, current) { return !value || value === 'Any' || current === 'Any' || value === current; }
  function hasUsefulResponse(row) {
    return row && row.hasResponse && (row.responseText || (row.counterUnits && row.counterUnits.length) || row.warning || row.notes);
  }
  function getApplicableThreats(st = state()) {
    const source = window.DSA_THREAT_RESPONSES || [];
    const key = [st.myRace, st.enemyRace, st.position].join('|');
    if (source === threatCacheSource && key === threatCacheKey && threatCacheList) return threatCacheList;
    threatCacheSource = source;
    threatCacheKey = key;
    threatCacheList = source
      .filter(x => x.myRace === st.myRace)
      .filter(x => x.unitRace === st.enemyRace)
      .filter(x => contextMatches(x.enemyRaceContext, st.enemyRace))
      .filter(x => contextMatches(x.positionContext, st.position))
      .filter(hasUsefulResponse)
      .sort((a, b) => (b.sortScore || 0) - (a.sortScore || 0));
    return threatCacheList;
  }
  function findGeneral({ myRace, enemyRace, position }) {
    const data = window.DSA_GENERAL_MATCHUPS || [];
    return data.find(x => x.myRace === myRace && x.enemyRace === enemyRace && x.position === position)
      || data.find(x => x.myRace === myRace && x.enemyRace === enemyRace)
      || { title: `${myRace} vs ${enemyRace}`, overview: '', priorities: [], positionNote: '' };
  }
  function selectedThreat(st = state()) {
    const threats = getApplicableThreats(st);
    return threats.find(x => x.enemyThreat === st.threat) || threats[0] || null;
  }
  function shortExcerpt(text, max = 92) {
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return '';
    if (clean.length <= max) return clean;
    return `${clean.slice(0, max).replace(/[\s,.;:!?-]+$/,'')}…`;
  }
  function renderGeneral() {
    const st = state();
    const rec = findGeneral(st);
    const priorities = (rec.priorities || []).filter(Boolean);
    byId('general-results').innerHTML = `
      <article class="card matchup-primer baseline-card">
        <div class="badge-row">
          <span class="badge ${window.DSA.raceClass(st.myRace)}">${esc(st.myRace)}</span>
          <span class="badge">vs</span>
          <span class="badge ${window.DSA.raceClass(st.enemyRace)}">${esc(st.enemyRace)}</span>
        </div>
        <h2>${esc(rec.title || `${st.myRace} vs ${st.enemyRace}`)}</h2>
        ${rec.overview ? `<p>${esc(rec.overview)}</p>` : ''}
        ${priorities.length ? `<div class="small-title">General priorities</div><ul class="list-clean">${priorities.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
      </article>`;
  }
  function populateThreatDropdown(preserve) {
    const st = state();
    const select = byId('enemy-threat');
    const threats = getApplicableThreats(st);
    const current = preserve || select.value;
    if (!threats.length) {
      select.innerHTML = '<option value="">No filled threat responses for this context</option>';
      return;
    }
    select.innerHTML = threats.map(t => `<option value="${esc(t.enemyThreat)}">${esc(t.enemyThreat)} · ${esc(t.priority || 'Priority')} · ${esc(t.skillCap || 'Skill')}</option>`).join('');
    if (threats.some(t => t.enemyThreat === current)) select.value = current;
  }
  function unitPortrait(name, size = 'normal') {
    return `<figure class="unit-portrait ${size}"><img src="${esc(unitImage(name))}" alt="${esc(name)}" onerror="this.onerror=null;this.src='assets/units/unknown.png';"><figcaption>${esc(name)}</figcaption></figure>`;
  }
  function counterChip(name) {
    return `
      <div class="counter-chip">
        <img src="${esc(unitImage(name))}" alt="${esc(name)}" onerror="this.onerror=null;this.src='assets/units/unknown.png';">
        <div>
          <strong>${esc(name)}</strong>
          <span>Suggested counter</span>
        </div>
      </div>`;
  }
  function renderPriorityDeck() {
    const st = state();
    const activeThreat = selectedThreat(st)?.enemyThreat || st.threat;
    const threats = getApplicableThreats(st).slice(0, 8);
    const target = byId('priority-threats');
    if (!target) return;
    if (!threats.length) {
      target.innerHTML = '<div class="empty-state">No filled threat responses for this race pairing yet.</div>';
      return;
    }
    target.innerHTML = threats.map(t => {
      const isSelected = activeThreat === t.enemyThreat;
      const summary = t.importance || t.phase || 'Priority threat';
      return `
        <button class="priority-threat-card ${isSelected ? 'is-selected' : ''}" type="button" data-jump-threat="${esc(t.enemyThreat)}" aria-pressed="${String(isSelected)}">
          <img src="${esc(unitImage(t.enemyThreat))}" alt="" onerror="this.onerror=null;this.src='assets/units/unknown.png';">
          <div class="threat-card-copy">
            <div class="threat-card-meta">
              <strong>${esc(t.enemyThreat)}</strong>
              <em class="${labelClassPriority(t.priority)}">${esc(t.priority || 'Low')}</em>
            </div>
            <small>${esc(summary)} · score ${esc(t.sortScore || 0)}</small>
          </div>
        </button>`;
    }).join('');
    target.querySelectorAll('[data-jump-threat]').forEach(btn => btn.addEventListener('click', () => {
      byId('enemy-threat').value = btn.dataset.jumpThreat;
      saveSelections();
      renderPriorityDeck();
      renderThreat();
      byId('threat-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }));
  }
  function renderFitText(title, text, className = '') {
    if (!text) return '';
    return `<section class="fit-section ${className}" title="${esc(text)}"><strong>${esc(title)}</strong><p>${esc(text)}</p></section>`;
  }
  function renderFitList(title, items, className = '') {
    const clean = (items || []).filter(Boolean);
    if (!clean.length) return '';
    return `<section class="fit-section ${className}" title="${esc(clean.join(' • '))}"><strong>${esc(title)}</strong><ul>${clean.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
  }
  function renderFitActions(rec) {
    const blocks = [
      rec.scoutTiming ? { title: 'Scout', text: rec.scoutTiming, className: 'fit-scout' } : null,
      rec.responseTiming ? { title: 'Respond', text: rec.responseTiming, className: 'fit-respond' } : null,
      rec.notes ? { title: 'Context', text: rec.notes, className: 'fit-context' } : null
    ].filter(Boolean);
    if (!blocks.length) return '';
    return `<div class="fit-action-stack">${blocks.map(block => renderFitText(block.title, block.text, block.className)).join('')}</div>`;
  }
  function renderThreat() {
    const st = state();
    const rec = selectedThreat(st);
    const target = byId('threat-results');
    if (!rec) {
      document.body.classList.remove('matchup-threat-selected');
      target.innerHTML = '<div class="empty-state">Pick a race pairing with filled threat responses.</div>';
      return;
    }

    document.body.classList.add('matchup-threat-selected', 'matchup-baseline-collapsed');
    writeStore(STORAGE.baselineCollapsed, 'true');
    const baselineButton = byId('baseline-reopen');
    if (baselineButton) {
      baselineButton.hidden = false;
      baselineButton.setAttribute('aria-expanded', 'false');
    }

    const counters = (rec.counterUnits || []).slice(0, 4);
    const community = confidence(loadVotes(voteKey(rec)));
    const actionBlocks = renderFitActions(rec);
    target.innerHTML = `
      <article class="response-fit-card is-entering">
        <header class="response-fit-top">
          <section class="response-fit-title">
            <div class="arena-kicker">Selected response</div>
            <div class="response-badges">
              <span class="response-badge ${labelClassPriority(rec.priority)}">Priority: ${esc(rec.priority || 'Low')}</span>
              <span class="response-badge ${labelClassSkill(rec.skillCap)}">Skillcap: ${esc(rec.skillCap || 'Low')}</span>
              <span class="response-badge sort-score">Score: ${esc(rec.sortScore || 0)}</span>
              <span class="response-badge community-confidence" id="confidence-badge">Community: ${community}%</span>
            </div>
            <h2>${esc(st.myRace)} answer to ${esc(rec.enemyThreat)}</h2>
          </section>

          <section class="response-fit-units">
            <div class="fit-unit-card fit-enemy-card">
              <img src="${esc(unitImage(rec.enemyThreat))}" alt="${esc(rec.enemyThreat)}" onerror="this.onerror=null;this.src='assets/units/unknown.png';">
              <div>
                <span>Enemy threat</span>
                <strong>${esc(rec.enemyThreat)}</strong>
                <small>${esc(rec.importance || rec.phase || 'Priority threat')}</small>
              </div>
            </div>
            <div class="fit-counter-card">
              <span>Counter units</span>
              <div class="fit-counter-list">
                ${counters.length ? counters.map(c => `
                  <div class="fit-counter-chip" title="${esc(c)}">
                    <img src="${esc(unitImage(c))}" alt="${esc(c)}" onerror="this.onerror=null;this.src='assets/units/unknown.png';">
                    <strong>${esc(c)}</strong>
                  </div>`).join('') : '<small>No counter unit listed.</small>'}
              </div>
            </div>
          </section>
        </header>

        <div class="response-fit-main ${actionBlocks ? '' : 'no-actions'}">
          ${renderFitText('Quick answer', rec.responseText || 'No written response yet. Use the listed counters as the quick reference.', 'fit-quick')}
          ${actionBlocks}
        </div>

        <div class="response-fit-bottom">
          ${renderFitList('Avoid', rec.avoid, 'fit-avoid')}
          ${rec.warning ? renderFitText('Warning', rec.warning, 'fit-warning') : ''}
          <div class="strategy-vote-row fit-vote-row" data-vote-key="${esc(voteKey(rec))}">
            <span>Useful?</span>
            <button type="button" data-vote="up">👍</button>
            <button type="button" data-vote="down">👎</button>
            <strong>${community}% confidence</strong>
          </div>
        </div>
      </article>`;
    appendScenarioExpander(target, rec, st);
    animateConfidence(target);
    target.querySelectorAll('[data-vote]').forEach(btn => {
      btn.addEventListener('click', () => {
        const wrap = btn.closest('[data-vote-key]');
        const key = wrap?.dataset.voteKey;
        if (!key) return;
        const currentVotes = loadVotes(key);
        const vote = btn.dataset.vote;
        if (currentVotes.mine && currentVotes[currentVotes.mine] > 0) currentVotes[currentVotes.mine] -= 1;
        currentVotes[vote] = Number(currentVotes[vote] || 0) + 1;
        currentVotes.mine = vote;
        localStorage.setItem(key, JSON.stringify(currentVotes));
        renderPriorityDeck();
        renderThreat();
      });
    });
  }
  function animateConfidence(target) {
    const badge = target.querySelector('#confidence-badge');
    if (!badge) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const match = badge.textContent.match(/(\d+)%/);
    const final = Number(match ? match[1] : 0);
    if (!final) return;
    const start = performance.now();
    const duration = 700;
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      badge.textContent = `Community: ${Math.round(final * eased)}%`;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function appendScenarioExpander(target, rec, st) {
    const theater = window.DSA_SCENARIO_THEATER;
    if (!theater || typeof theater.findForThreat !== 'function') return;
    const scn = theater.findForThreat(rec.enemyThreat, st.myRace);
    if (!scn) return;
    const expander = document.createElement('div');
    expander.className = 'scenario-expander';
    expander.innerHTML = `
      <button type="button" class="button-secondary scenario-toggle">▶ See it play out: ${esc(scn.title)}</button>
      <div class="scenario-slot" hidden></div>`;
    target.appendChild(expander);
    const slot = expander.querySelector('.scenario-slot');
    const toggle = expander.querySelector('.scenario-toggle');
    toggle.addEventListener('click', () => {
      const opening = slot.hidden;
      slot.hidden = !opening;
      toggle.textContent = opening ? '▼ Hide scenario' : `▶ See it play out: ${scn.title}`;
      if (opening && !slot.dataset.mounted) {
        slot.dataset.mounted = '1';
        theater.mount(slot, scn, { autoplay: true });
      }
    });
  }
  function saveSelections() {
    writeStore(STORAGE.myRace, byId('my-race').value);
    writeStore('dsaRace', byId('my-race').value);
    writeStore(STORAGE.enemyRace, byId('enemy-race').value);
    if (byId('enemy-threat').value) writeStore(STORAGE.threat, byId('enemy-threat').value);
  }
  function updateAll() {
    const current = byId('enemy-threat').value || readStore(STORAGE.threat);
    renderGeneral();
    populateThreatDropdown(current);
    renderPriorityDeck();
    renderThreat();
    saveSelections();
  }
  window.DSA_MATCHUP_HELPER_REFRESH = function () {
    clearThreatCache();
    if (byId('matchup-context-form')) updateAll();
  };
  document.addEventListener('dsa-community-data-ready', () => window.DSA_MATCHUP_HELPER_REFRESH && window.DSA_MATCHUP_HELPER_REFRESH());
  window.addEventListener('storage', event => {
    if (event.key === 'DSA_COMMUNITY_PATCHES_V3' || event.key === 'dsaCommunityAdditions') {
      clearThreatCache();
      if (window.DSA_APPLY_COMMUNITY_ADDITIONS) window.DSA_APPLY_COMMUNITY_ADDITIONS();
      window.DSA_MATCHUP_HELPER_REFRESH && window.DSA_MATCHUP_HELPER_REFRESH();
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (!byId('matchup-context-form')) return;
    const params = new URLSearchParams(window.location.search);
    const urlRace = params.get('race');
    const storedRace = readStore(STORAGE.myRace) || readStore('dsaRace');
    const chosenRace = urlRace || storedRace;
    if (chosenRace) {
      const sel = byId('my-race');
      const opt = Array.from(sel.options).find(o => o.value === chosenRace);
      if (opt) sel.value = chosenRace;
    }
    const urlEnemy = params.get('enemy');
    const storedEnemy = readStore(STORAGE.enemyRace);
    const chosenEnemy = urlEnemy || storedEnemy;
    if (chosenEnemy) {
      const enemySel = byId('enemy-race');
      const enemyOpt = Array.from(enemySel.options).find(o => o.value === chosenEnemy);
      if (enemyOpt) enemySel.value = chosenEnemy;
    }
    if (params.get('experience')) writeStore('dsaExperience', params.get('experience'));
    writeStore('dsaHasVisited', 'true');
    ['my-race','enemy-race'].forEach(id => byId(id).addEventListener('input', updateAll));
    const baselineButton = byId('baseline-reopen');
    let baselinePinnedOpen = false;
    function setBaselineButton(visible) {
      if (!baselineButton) return;
      baselineButton.hidden = !visible;
      baselineButton.setAttribute('aria-expanded', String(!visible));
    }
    function collapseBaseline() {
      if (baselinePinnedOpen) return;
      document.body.classList.add('matchup-baseline-collapsed');
      writeStore(STORAGE.baselineCollapsed, 'true');
      setBaselineButton(true);
    }
    function expandBaseline() {
      baselinePinnedOpen = true;
      document.body.classList.remove('matchup-baseline-collapsed', 'matchup-threat-selected');
      writeStore(STORAGE.baselineCollapsed, 'false');
      setBaselineButton(false);
    }
    function updateBaselineCollapse() {
      if (window.scrollY <= 80) baselinePinnedOpen = false;
      if (window.scrollY > 160) collapseBaseline();
    }
    if (baselineButton) baselineButton.addEventListener('click', expandBaseline);
    if (readStore(STORAGE.baselineCollapsed) === 'true') {
      document.body.classList.add('matchup-baseline-collapsed');
      setBaselineButton(true);
    } else {
      setBaselineButton(false);
    }
    window.addEventListener('scroll', updateBaselineCollapse, { passive: true });
    updateBaselineCollapse();
    byId('enemy-threat').addEventListener('input', () => {
      saveSelections();
      renderPriorityDeck();
      renderThreat();
    });
    byId('threat-form').addEventListener('submit', event => {
      event.preventDefault();
      renderPriorityDeck();
      renderThreat();
    });
    updateAll();
  });
})();
