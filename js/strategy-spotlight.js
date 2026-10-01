/*
  Matchup-helper left sidebar.
  Layout: header → featured visualizer (with ‹ › cycle arrows + its tied guide
  card) → shuffle button (re-rolls the GUIDE CARDS only) → guide cards →
  browse link → command deck grid.
   - Visualizer order is randomized once per page load, then the arrows cycle
     through it sequentially — returning users see a different order each visit.
   - The featured theater autoplays once if the user hasn't pressed play
     within 10 seconds (engine option idleAutoplay).
  Desktop-only via CSS (hidden under 1100px).
*/
(function () {
  'use strict';
  function byId(id) { return document.getElementById(id); }
  function esc(value) { return window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? ''); }
  function raceClass(race) { return window.DSA?.raceClass ? window.DSA.raceClass(race) : ''; }
  function currentRace() { return byId('my-race')?.value || ''; }
  function enemyRace() { return byId('enemy-race')?.value || ''; }
  function currentPage() { return (location.pathname.split('/').pop() || 'index.html').toLowerCase(); }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function mentionsEnemy(guide, enemy) {
    if (!enemy) return false;
    const hay = [guide.matchup, guide.title, (guide.tags || []).join(' ')].join(' ').toLowerCase();
    return hay.includes(enemy.toLowerCase());
  }

  function picks(count) {
    const all = window.DSA_STRATEGY_GUIDES || [];
    if (!all.length) return [];
    const race = currentRace();
    const enemy = enemyRace();
    const raceMatched = all.filter(g => !race || !g.race || g.race === race || g.race === 'Any');
    const pool = raceMatched.length ? raceMatched : all;
    const relevant = shuffle(pool.filter(g => mentionsEnemy(g, enemy)));
    const rest = shuffle(pool.filter(g => !mentionsEnemy(g, enemy)));
    return relevant.concat(rest).slice(0, count);
  }

  function scenarioForGuide(guideId) {
    const list = window.DSA_SCENARIOS || [];
    return list.find(s => s.guideId === guideId || (Array.isArray(s.guideIds) && s.guideIds.includes(guideId))) || null;
  }
  function guideForScenario(scn) {
    const ids = [scn.guideId].concat(scn.guideIds || []).filter(Boolean);
    return (window.DSA_STRATEGY_GUIDES || []).find(g => ids.includes(g.id)) || null;
  }

  /* Visualizer cycling: order randomized once per page load. */
  let scnOrder = [];
  let scnIndex = 0;
  let currentScn = null;
  let featuredCtrl = null;

  function ensureOrder() {
    const theater = window.DSA_SCENARIO_THEATER;
    const all = theater && typeof theater.scenarios === 'function' ? theater.scenarios() : [];
    if (all.length && scnOrder.length !== all.length) {
      scnOrder = shuffle(all);
      scnIndex = 0;
    }
    return scnOrder;
  }

  function guideCard(guide, isFeatured) {
    const tied = !isFeatured && scenarioForGuide(guide.id);
    return `
      <article class="card spotlight-card${isFeatured ? ' spotlight-featured-card' : ''}" data-guide-id="${esc(guide.id)}">
        <div class="badge-row">
          <span class="badge ${raceClass(guide.race)}">${esc(guide.race || 'Any')}</span>
          ${guide.category ? `<span class="badge">${esc(guide.category)}</span>` : ''}
          ${guide.matchup ? `<span class="badge">${esc(guide.matchup)}</span>` : ''}
        </div>
        <h3>${esc(guide.title)}</h3>
        <p>${esc(guide.summary || guide.body || '')}</p>
        ${(guide.tags || []).length ? `<div class="tag-row">${guide.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        ${tied ? `<button type="button" class="button-secondary guide-watch" data-watch-guide="${esc(guide.id)}">▶ Watch it play out</button><div class="guide-theater-slot" hidden></div>` : ''}
      </article>`;
  }

  function deckTiles() {
    const cards = (window.DSA?.toolCards || []).filter(c => String(c.href || '').toLowerCase() !== currentPage());
    if (!cards.length) return '';
    return `
      <div class="deck-block">
        <span class="eyebrow">Command deck</span>
        <nav class="deck-grid" aria-label="All pages">
          ${cards.map(c => `
            <a class="deck-tile" data-accent="${esc(c.accent || 'cyan')}" href="${esc(c.href)}" title="${esc(c.description || c.title)}">
              <span class="deck-icon" aria-hidden="true">${esc(c.icon || '▶')}</span>
              <strong>${esc(c.title)}</strong>
            </a>`).join('')}
        </nav>
      </div>`;
  }

  function wireWatchButtons(zone) {
    const theater = window.DSA_SCENARIO_THEATER;
    if (!theater) return;
    zone.querySelectorAll('[data-watch-guide]').forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('[data-guide-id]');
        const slot = card?.querySelector('.guide-theater-slot');
        const scn = scenarioForGuide(btn.dataset.watchGuide);
        if (!slot || !scn) return;
        const opening = slot.hidden;
        slot.hidden = !opening;
        btn.textContent = opening ? '▼ Hide' : '▶ Watch it play out';
        if (opening && !slot.dataset.mounted) {
          slot.dataset.mounted = '1';
          theater.mount(slot, scn, { compact: true, autoplay: true });
        }
      });
    });
  }

  function renderFeatured(target) {
    const zone = target.querySelector('#featured-zone');
    if (!zone) return;
    const order = ensureOrder();
    if (!order.length) { zone.innerHTML = ''; currentScn = null; return; }
    scnIndex = ((scnIndex % order.length) + order.length) % order.length;
    currentScn = order[scnIndex];
    const guide = guideForScenario(currentScn);
    if (featuredCtrl) { try { featuredCtrl.destroy(); } catch (err) {} featuredCtrl = null; }
    zone.innerHTML = `
      <div class="featured-theater-slot"></div>
      <div class="scn-cycle-bar">
        <button type="button" class="button-secondary scn-cycle" data-cycle="-1" aria-label="Previous visualizer">‹</button>
        <span class="scn-cycle-count">${scnIndex + 1} / ${order.length}</span>
        <button type="button" class="button-secondary scn-cycle" data-cycle="1" aria-label="Next visualizer">›</button>
      </div>
      ${guide ? guideCard(guide, true) : ''}`;
    const slot = zone.querySelector('.featured-theater-slot');
    if (slot && window.DSA_SCENARIO_THEATER) {
      featuredCtrl = window.DSA_SCENARIO_THEATER.mount(slot, currentScn, { compact: true, idleAutoplay: 10000 });
    }
    zone.querySelectorAll('[data-cycle]').forEach(btn => {
      btn.addEventListener('click', () => {
        scnIndex += Number(btn.dataset.cycle);
        renderFeatured(target);
        // If the new featured guide is duplicated in the guides list, drop that copy.
        const dupId = currentScn ? (guideForScenario(currentScn)?.id || '') : '';
        if (dupId) target.querySelector(`#spotlight-guides [data-guide-id="${dupId}"]`)?.remove();
      });
    });
  }

  function renderGuides(target) {
    const zone = target.querySelector('#spotlight-guides');
    if (!zone) return;
    const excludeId = currentScn ? (guideForScenario(currentScn)?.id || '') : '';
    const guides = picks(5).filter(g => g.id !== excludeId).slice(0, 3);
    zone.innerHTML = guides.map(g => guideCard(g, false)).join('') ||
      '<div class="empty-state">No strategy guides published yet.</div>';
    wireWatchButtons(zone);
  }

  function render() {
    const target = byId('strategy-spotlight');
    if (!target) return;
    target.innerHTML = `
      <div class="spotlight-header">
        <div>
          <span class="eyebrow">Strategy spotlight</span>
          <h2>Reads other players are using.</h2>
        </div>
      </div>
      <div id="featured-zone"></div>
      <button id="spotlight-shuffle" class="button-secondary spotlight-shuffle" type="button" aria-label="Shuffle the strategy guides">↻ Shuffle strategies</button>
      <div id="spotlight-guides"></div>
      <a class="button-secondary spotlight-more" href="strategy-database.html">Browse all strategies →</a>
      ${deckTiles()}`;
    renderFeatured(target);
    renderGuides(target);
    byId('spotlight-shuffle')?.addEventListener('click', () => renderGuides(target));
  }

  document.addEventListener('DOMContentLoaded', () => {
    const target = byId('strategy-spotlight');
    if (!target) return;
    render();
    // Race change re-rolls the guide cards (race-filtered); the visualizer
    // cycle is global and keeps its position.
    ['my-race', 'enemy-race'].forEach(id => byId(id)?.addEventListener('input', () => renderGuides(target)));
  });
  document.addEventListener('dsa-community-data-ready', render);
  document.addEventListener('dsa-community-server-data-ready', render);
})();
