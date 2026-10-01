/*
  Scenario theater: reusable animated formation-lesson box.
  Reads window.DSA_SCENARIOS (js/data-scenarios.js).

  Usage:
    const scn = DSA_SCENARIO_THEATER.findForThreat('High Templar', 'Zerg');
    const ctrl = DSA_SCENARIO_THEATER.mount(containerEl, scn, { compact: true, autoplay: true });

  Animation is CSS-only (transforms + opacity, GPU-friendly). The play sequence
  is: bad formation (≈4.2s, red flash + shake/fade on impact) → auto-switch to
  good formation (≈4.2s, green pulse on survivors). prefers-reduced-motion
  skips the animation and shows the static end state instead.
*/
(function () {
  'use strict';

  const PLAY_MS = 4200;       // must match --scn-dur in css/style.css
  const BETWEEN_MS = 4500;    // reading pause between bad and good passes (loading bar runs during it)

  function esc(value) { return window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? ''); }
  function slug(value) {
    const alias = {
      'widowmine': 'widow-mine', 'siegetank': 'siege-tank', 'sigetank': 'siege-tank',
      'pheonix': 'phoenix', 'voidray': 'void-ray', 'muta': 'muta', 'mutalisk': 'muta',
      'hydra': 'hydralisk', 'ling': 'zergling', 'lings': 'zergling', 'collos': 'colossus'
    };
    const raw = String(value || '').toLowerCase().trim();
    if (alias[raw]) return alias[raw];
    return raw.replace(/&/g, ' and ').replace(/\s*\/\s*/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
  }
  function unitImage(name) { return `assets/units/${slug(name)}.png`; }
  function costOf(name) {
    const costs = window.DSA_UNIT_COSTS;
    return costs ? Number(costs[slug(name)] || 0) : 0;
  }
  function sideTotal(units) { return (units || []).reduce((sum, u) => sum + costOf(u.name), 0); }
  function reducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function scenarios() { return Array.isArray(window.DSA_SCENARIOS) ? window.DSA_SCENARIOS : []; }

  function findForThreat(threatName, myRace) {
    const key = slug(threatName);
    if (!key || key === 'unknown') return null;
    const hits = scenarios().filter(s =>
      (s.threats || []).some(t => slug(t) === key) ||
      (s.enemy?.units || []).some(u => slug(u.name) === key)
    );
    if (!hits.length) return null;
    return hits.find(s => !myRace || (s.races || []).includes(myRace)) || hits[0];
  }

  function forRace(race) {
    const list = scenarios();
    const matched = list.filter(s => !race || (s.races || []).includes(race));
    return matched.length ? matched : list;
  }

  function unitHTML(unit, side, index, extra) {
    const name = String(unit.name || 'Unknown');
    const x = Math.max(0, Math.min(100, Number(unit.x) || 0));
    const y = Math.max(0, Math.min(100, Number(unit.y) || 0));
    // kb: knockback distance in px. Allies with kb fly backwards on impact
    // (mine pushback); enemies with kb press further in (wedge/split).
    const kb = Math.max(0, Number(unit.kb) || 0);
    return `<span class="scn-unit scn-${side}${kb ? ' scn-kb' : ''}${extra || ''}" style="left:${x}%;top:${y}%;--i:${index};--kb:${kb}px;">
      <img src="${esc(unitImage(name))}" alt="${esc(name)}" loading="lazy"
        onerror="this.onerror=null;this.src='assets/units/unknown.png';">
    </span>`;
  }

  function stageHTML(scenario, mode) {
    const setup = mode === 'good' ? scenario.goodSetup : scenario.badSetup;
    const enemyExtra = scenario.blink ? ' scn-blink' : '';
    const allies = (setup?.units || []).map((u, i) => unitHTML(u, 'ally', i)).join('');
    // unit.frozen → stasis animation in the GOOD pass only (the bad pass is
    // the version of you that didn't bring the Oracle).
    const enemies = (scenario.enemy?.units || []).map((u, i) =>
      unitHTML(u, 'enemy', i, enemyExtra + (mode === 'good' && u.frozen ? ' scn-frozen' : ''))).join('');
    return `${allies}${enemies}<span class="scn-flash" aria-hidden="true"></span>`;
  }

  function updateCostStrip(root, scenario, mode) {
    const strip = root.querySelector('.scn-cost-strip');
    if (!strip) return;
    const setup = mode === 'good' ? scenario.goodSetup : scenario.badSetup;
    const mine = sideTotal(setup?.units);
    const foe = sideTotal(scenario.enemy?.units);
    if (!mine && !foe) { strip.hidden = true; return; }
    const gap = Math.abs(mine - foe);
    strip.hidden = false;
    strip.innerHTML = `
      <span class="scn-cost scn-cost-you"><img class="scn-mineral" src="assets/mineral.ico" alt="minerals">YOU ${mine}</span>
      <span class="scn-cost-gap${gap > 200 ? ' over' : ''}" title="Mineral gap">Δ ${gap}</span>
      <span class="scn-cost scn-cost-foe"><img class="scn-mineral" src="assets/mineral.ico" alt="minerals">${foe} ENEMY</span>
      ${scenario.costNote ? `<em class="scn-cost-note">${esc(scenario.costNote)}</em>` : ''}`;
  }

  function theaterHTML(scenario, opts) {
    const badLabel = scenario.badSetup?.label || 'Bad';
    const goodLabel = scenario.goodSetup?.label || 'Good';
    return `
      <div class="scenario-theater${opts.compact ? ' scn-compact' : ''}" data-mode="bad" data-fx="${esc(scenario.fx || 'storm')}">
        <div class="scn-head">
          <strong class="scn-title">${esc(scenario.title || 'Scenario')}</strong>
          <div class="scn-tabs" role="tablist" aria-label="Formation">
            <button type="button" class="scn-tab scn-tab-bad active" data-scn-mode="bad" aria-pressed="true">✗ ${esc(badLabel)}</button>
            <button type="button" class="scn-tab scn-tab-good" data-scn-mode="good" aria-pressed="false">✓ ${esc(goodLabel)}</button>
          </div>
        </div>
        <div class="scn-cost-strip"></div>
        <div class="scn-stage" aria-hidden="true"></div>
        <div class="scn-next" hidden><span>NOW THE FIX ▸</span><span class="scn-next-track"><i class="scn-next-fill"></i></span></div>
        <div class="scn-foot">
          <button type="button" class="button-secondary scn-play">▶ Play</button>
          <p class="scn-outcome" aria-live="polite"></p>
        </div>
        <p class="scn-lesson">${esc(scenario.lesson || '')}</p>
      </div>`;
  }

  function mount(container, scenario, options) {
    if (!container || !scenario) return null;
    const opts = Object.assign({ compact: false, autoplay: false }, options || {});
    container.innerHTML = theaterHTML(scenario, opts);
    const root = container.querySelector('.scenario-theater');
    const stage = root.querySelector('.scn-stage');
    const outcome = root.querySelector('.scn-outcome');
    const playBtn = root.querySelector('.scn-play');
    let mode = 'bad';
    let timers = [];
    let playing = false;
    let hasPlayed = false;

    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

    function setMode(next, ended) {
      mode = next === 'good' ? 'good' : 'bad';
      root.dataset.mode = mode;
      root.classList.remove('is-playing', 'is-ended', 'is-waiting');
      const nextBar = root.querySelector('.scn-next');
      if (nextBar) nextBar.hidden = true;
      stage.innerHTML = stageHTML(scenario, mode);
      updateCostStrip(root, scenario, mode);
      root.querySelectorAll('[data-scn-mode]').forEach(btn => {
        const active = btn.dataset.scnMode === mode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      if (ended) {
        root.classList.add('is-ended');
        outcome.textContent = String(scenario.outcome?.[mode] || '');
      } else {
        outcome.textContent = '';
      }
    }

    function playPass(passMode, done) {
      setMode(passMode);
      if (reducedMotion()) {
        // Static before/after: jump straight to the end state.
        root.classList.add('is-ended');
        outcome.textContent = String(scenario.outcome?.[passMode] || '');
        later(done, 900);
        return;
      }
      // Force a reflow so re-adding the class restarts CSS animations.
      void stage.offsetWidth;
      root.classList.add('is-playing');
      later(() => {
        root.classList.remove('is-playing');
        root.classList.add('is-ended');
        outcome.textContent = String(scenario.outcome?.[passMode] || '');
        done();
      }, PLAY_MS);
    }

    function play() {
      if (playing) return;
      playing = true;
      hasPlayed = true;
      clearTimers();
      playBtn.textContent = '… Playing';
      playBtn.disabled = true;
      playPass('bad', () => {
        // Hold the failure on screen long enough to read, with a visible
        // countdown bar signalling that the working strategy plays next.
        const nextBar = root.querySelector('.scn-next');
        if (nextBar) nextBar.hidden = false;
        root.classList.add('is-waiting');
        later(() => {
          if (nextBar) nextBar.hidden = true;
          root.classList.remove('is-waiting');
          playPass('good', () => {
            playing = false;
            playBtn.textContent = '↻ Replay';
            playBtn.disabled = false;
          });
        }, BETWEEN_MS);
      });
    }

    playBtn.addEventListener('click', play);
    root.querySelectorAll('[data-scn-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (playing) return;
        clearTimers();
        setMode(btn.dataset.scnMode, true);
        playBtn.textContent = '↻ Replay';
      });
    });

    setMode('bad');
    if (opts.autoplay) later(play, 250);
    else if (opts.idleAutoplay) later(() => { if (!hasPlayed) play(); }, Number(opts.idleAutoplay) || 10000);

    return {
      play,
      setMode,
      destroy() { clearTimers(); container.innerHTML = ''; }
    };
  }

  window.DSA_SCENARIO_THEATER = { findForThreat, forRace, mount, scenarios };
})();
