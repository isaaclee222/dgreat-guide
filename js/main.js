(function () {
  const primaryNavItems = [
    { href: 'matchup-helper.html', label: 'Matchup' },
    { href: 'start.html', label: 'Start' },
    { href: 'strategy-database.html', label: 'Strategies' }
  ];
  const moreNavItems = [
    { href: 'tier-list.html', label: 'Tier List' },
    { href: 'unit-counter.html', label: 'Unit Index' },
    { href: 'wave-function.html', label: 'Wave Lab' },
    { href: 'beginner.html', label: 'Foundations' },
    { href: 'zvz-trainer.html', label: 'ZvZ Trainer' },
    { href: 'tvt-trainer.html', label: 'TvT Lab' },
    { href: 'pvp-trainer.html', label: 'PvP Lab' },
    { href: 'gas-trainer.html', label: 'Gas Quiz' },
    { href: 'meta.html', label: 'Current Meta' },
    { href: 'glossary.html', label: 'Glossary' }
  ];

  const toolCards = [
    { title: 'Foundations', icon: '🎓', description: 'Wave strength, gas timing, mid control, upgrade timing. In order. Everything else depends on getting these right first.', href: 'beginner.html', action: 'Read foundations', accent: 'green' },
    { title: 'Current Meta', icon: '⚡', description: 'The High Templar storm rule and the ZvZ Muta opener. What is actually relevant to your decisions right now.', href: 'meta.html', action: 'Read meta', accent: 'orange' },
    { title: 'Matchup Helper', icon: '🧭', description: 'Race and position first. Threat response second. Counter units shown visually. Built for use during a game.', href: 'matchup-helper.html', action: 'Open helper', accent: 'cyan' },
    { title: 'Tier List', icon: '📊', description: 'Phase-based rankings by race. Switch the filters and see how the board changes from early to late game.', href: 'tier-list.html', action: 'View tiers', accent: 'gold' },
    { title: 'Wave Lab', icon: '〰️', description: 'Why timing, mid control, and teammate sync change total wave amplitude. The math behind decisions most players make by feel.', href: 'wave-function.html', action: 'Open lab', accent: 'purple' },
    { title: 'Unit Index', icon: '🧬', description: 'Strengths, weaknesses, common misuse, and counter reads for every unit. Expand any card to see what most players get wrong.', href: 'unit-counter.html', action: 'Browse units', accent: 'cyan' },
    { title: 'Gas Quiz', icon: '⛽', description: 'When is gas safe. When is it a donation. Test the read without the answer sitting in front of you.', href: 'gas-trainer.html', action: 'Take the quiz', accent: 'orange' },
    { title: 'ZvZ Reference', icon: '🦇', description: 'Muta phase fundamentals and mirror matchup reads. Read the lesson. Then prove you know it on the quiz screen.', href: 'zvz-trainer.html', action: 'Study ZvZ', accent: 'purple' },
    { title: 'Strategy Database', icon: '🗂️', description: 'Community-built timing notes, counter guides, and edge-case strategies that admins can publish without changing core data formats.', href: 'strategy-database.html', action: 'Browse strategies', accent: 'cyan' },
    { title: 'TvT Strategy Lab', icon: '🛠️', description: 'A specialist-fillable Terran mirror page for tank timing, Liberator/Raven/BC transitions, and lane-stabilizing responses.', href: 'tvt-trainer.html', action: 'Open TvT lab', accent: 'orange' },
    { title: 'PvP Strategy Lab', icon: '🔮', description: 'A specialist-fillable Protoss mirror page for Archon, Disruptor, Carrier, Mothership, and storm mirror decision points.', href: 'pvp-trainer.html', action: 'Open PvP lab', accent: 'purple' },
    { title: 'Glossary', icon: '📖', description: 'The terms players use mid-game and what they actually mean. Useful when giving or receiving advice under time pressure.', href: 'glossary.html', action: 'Open glossary', accent: 'green' }
  ];

  const noobTraps = [
    {
      id: 'early-gas',
      label: 'Gas before stabilizing',
      severity: 'High',
      advice: 'Stabilize wave strength first. Gas is safer after mid control, cannon bounty, or several stable waves.'
    },
    {
      id: 'hydra-storm',
      label: 'Mass Hydras into High Templar',
      severity: 'Critical',
      advice: 'Add Roach buffers, spread Hydras, bait storm, or switch tech instead of making one giant Hydra clump.'
    },
    {
      id: 'marine-storm',
      label: 'Mass Marines into storm',
      severity: 'Critical',
      advice: 'Spread, support, or transition. Terran usually needs Liberators, Ravens, Thors, Tanks, or Battlecruisers into heavy HT.'
    },
    {
      id: 'too-many-libs',
      label: 'Build too many early Liberators',
      severity: 'Medium',
      advice: 'Liberators are strong, but three can be too many too early. Watch Stalker count and wave stability.'
    },
    {
      id: 'early-upgrade',
      label: 'Upgrade before having enough units',
      severity: 'High',
      advice: 'Upgrades are good only when they affect enough army. If you lose count first, the upgrade may cost the wave.'
    },
    {
      id: 'blame-team',
      label: 'Blame teammate before watching all waves',
      severity: 'Medium',
      advice: 'Watch all three waves. Your build might be creating a bad handoff even if your own opponent looks manageable.'
    }
  ];

  const beginnerLessons = [
    { title: 'What Direct Strike Is', text: 'Direct Strike is a wave-based team strategy mode. You build an army that fights automatically, but your decisions before each wave decide how strong that wave becomes.' },
    { title: 'The Four Core Skills', text: 'There are four main skills to develop in Direct Strike: army spending, upgrade timing, micro, and strategy.' },
    { title: 'Army Spending', text: 'You are not just buying units. You are buying wave strength. Bad spending gives your opponent a chance to punish you.' },
    { title: 'Upgrade Timing', text: 'Upgrades are good only when they affect enough units. Upgrading too early can lose the wave because you delayed army count.' },
    { title: 'Micro', text: 'Auto-cast is useful, but it is not always smart. Units like High Templar, Liberator, Viper, Raven, Ravager, and Battlecruiser become much stronger with manual control.' },
    { title: 'Strategy', text: 'Your wave affects your teammates. Direct Strike is not three isolated 1v1s. Team strategy matters.' },
    { title: 'Gas Timing', text: 'Gas is not free. Early gas can make you lose wave strength, lose mid, and hand bounty to the enemy. Take it when your team is stable or already winning control.' },
    { title: 'Mid Control', text: 'Holding mid means your waves are meeting farther forward, pressuring cannons, and reducing enemy space. Losing mid often means your team is reacting instead of controlling the game.' },
    { title: 'Common Mistakes', text: 'The biggest beginner traps are early gas, blind upgrades, one-unit spam, clumping into storm, and blaming a teammate before checking all waves.' },
    { title: 'What to Watch During Waves', text: 'Watch what kills your army, what survives, whether your wave leaks, and whether your build helps or hurts the next teammate.' }
  ];

  const glossaryEntries = [
    ['Wave', 'The army that spawns from your side and fights the enemy wave. Your spending decisions become wave strength.'],
    ['Mid', 'The center of the map. Holding mid usually means your team has pressure and safer gas opportunities.'],
    ['Cannon', 'Defensive structures on each side. Killing cannons gives bounty and often makes gas safer.'],
    ['Leak', 'Enemy units that survive your wave and continue into your teammate or cannon line.'],
    ['Gas', 'Economy investment that increases future income but reduces immediate army strength.'],
    ['Gassing', 'Taking gas. It is good when stable and dangerous when your wave is already losing.'],
    ['Micro', 'Manual control of spells, targeting, or positioning instead of relying only on auto-cast.'],
    ['Auto-cast', 'Automatic ability use. Useful, but not always smart for units like High Templar, Viper, Raven, or Liberator.'],
    ['Bait', 'Low-cost or small groups used to draw spells or bad targeting before your main army arrives.'],
    ['Buffer', 'Durable frontline units that absorb damage or spells before your important damage units get hit.'],
    ['Clump', 'Units packed tightly together. Clumps give huge value to AoE like storm.'],
    ['Tech switch', 'Changing into a different unit path or tier because the current plan is being countered.'],
    ['Hard counter', 'A response that strongly beats a specific enemy plan when timed and positioned correctly.'],
    ['Soft counter', 'A response that helps against a threat but does not fully solve it by itself.'],
    ['Upgrade timing', 'Choosing when upgrades affect enough units to be worth delaying more army.'],
    ['Storm value', 'How much damage and army value a High Templar gets from one storm. Clumped units give high storm value. Spread units and bait reduce storm value.'],
    ['Roach buffer', 'Roaches placed ahead of fragile Zerg damage units so storm or frontline damage hits Roaches first.'],
    ['Muta phase', 'The early ZvZ period where Mutas dominate decisions before Hydra, Viper, Ultra, or Lurker transitions.'],
    ['Panic switch', 'A rushed tech change made after losing a wave, often without enough minerals, upgrades, or formation support.']
  ];



  const BACKGROUND_DEFAULT = 'assets/background-1920.png';

  function normalizeBackgroundPath(value) {
    const raw = String(value || '').trim().replace(/^\/+/, '');
    if (!raw) return BACKGROUND_DEFAULT;
    if (/^https?:/i.test(raw) || raw.includes('..') || !/\.png$/i.test(raw)) return null;
    if (raw.includes('/')) return raw;
    return `assets/backgrounds/${raw}`;
  }

  function applyBackgroundSetting() {
    const saved = localStorage.getItem('dsaBackgroundImage') || BACKGROUND_DEFAULT;
    const path = normalizeBackgroundPath(saved) || BACKGROUND_DEFAULT;
    document.documentElement.style.setProperty('--site-bg-image', `url("${path}")`);
  }

  function initSettingsPanel() {
    if (document.getElementById('settings-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'settings-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="settings-backdrop" data-settings-close></div>
      <section class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button class="settings-close" type="button" data-settings-close aria-label="Close settings">×</button>
        <span class="eyebrow">Site Settings</span>
        <h2 id="settings-title">Settings & admin</h2>
        <p class="section-intro">Background art is optional. Most site changes now happen through the admin page.</p>
        <div class="admin-settings-block">
          <strong>Strategy admin</strong>
          <p>Open the admin panel to add strategy updates, publish changelogs, and export permanent data.</p>
          <a class="button-primary" href="admin.html">Open Admin Page</a>
        </div>
        <label class="form-field" for="background-file-input">
          <span>Background PNG file</span>
          <input id="background-file-input" type="text" placeholder="assets/backgrounds/my-banner.png" autocomplete="off">
        </label>
        <div id="settings-message" class="settings-message" aria-live="polite"></div>
        <div class="button-row">
          <button class="button-primary" type="button" id="save-background-setting">Save background</button>
          <button class="button-secondary" type="button" id="reset-background-setting">Reset default</button>
        </div>
      </section>`;
    document.body.appendChild(panel);

    const input = panel.querySelector('#background-file-input');
    const msg = panel.querySelector('#settings-message');
    function openPanel() {
      input.value = localStorage.getItem('dsaBackgroundImage') || BACKGROUND_DEFAULT;
      msg.textContent = '';
      panel.hidden = false;
      document.body.classList.add('settings-open');
      setTimeout(() => input.focus(), 30);
    }
    function closePanel() {
      panel.hidden = true;
      document.body.classList.remove('settings-open');
    }
    document.addEventListener('click', event => {
      if (event.target.closest('[data-settings-open]')) openPanel();
      if (event.target.closest('[data-settings-close]')) closePanel();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) closePanel();
    });
    panel.querySelector('#save-background-setting').addEventListener('click', () => {
      const clean = normalizeBackgroundPath(input.value);
      if (!clean) {
        msg.textContent = 'Use a relative .png path only. Example: assets/backgrounds/side-art.png';
        msg.className = 'settings-message error';
        return;
      }
      localStorage.setItem('dsaBackgroundImage', clean);
      applyBackgroundSetting();
      input.value = clean;
      msg.textContent = 'Saved. Make sure the PNG exists at that path before hosting.';
      msg.className = 'settings-message success';
    });
    panel.querySelector('#reset-background-setting').addEventListener('click', () => {
      localStorage.removeItem('dsaBackgroundImage');
      input.value = BACKGROUND_DEFAULT;
      applyBackgroundSetting();
      msg.textContent = 'Reset to assets/background-1920.png.';
      msg.className = 'settings-message success';
    });
  }

  function byId(id) { return document.getElementById(id); }

  function initNav() {
    const header = byId('site-header');
    if (!header) return;
    const current = location.pathname.split('/').pop() || 'index.html';
    const inMore = moreNavItems.some(item => item.href === current);
    header.innerHTML = `
      <div class="nav-shell">
        <a class="logo" href="index.html?home=1" aria-label="dgreat.guide home">
          <span class="logo-mark">DG</span>
          <span>dgreat.guide</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav id="site-nav" class="nav-links" aria-label="Primary navigation">
          ${primaryNavItems.map(item => `<a href="${item.href}" class="${current === item.href ? 'active' : ''}">${item.label}</a>`).join('')}
          <div class="nav-more">
            <button class="nav-more-trigger ${inMore ? 'active' : ''}" type="button" aria-expanded="false">More</button>
            <div class="nav-more-menu">${moreNavItems.map(item => `<a href="${item.href}" class="${current === item.href ? 'active' : ''}">${item.label}</a>`).join('')}</div>
          </div>
          <button class="settings-trigger" type="button" data-settings-open>Settings / Admin</button>
        </nav>
      </div>`;

    const toggle = header.querySelector('.nav-toggle');
    const nav = header.querySelector('#site-nav');
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    const more = header.querySelector('.nav-more');
    const moreBtn = header.querySelector('.nav-more-trigger');
    moreBtn?.addEventListener('click', event => {
      event.stopPropagation();
      const open = more.classList.toggle('open');
      moreBtn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-more')) {
        more?.classList.remove('open');
        moreBtn?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initFooter() {
    const footer = byId('site-footer');
    if (!footer) return;
    footer.innerHTML = `
      <div class="footer-shell">
        <span>dgreat.guide — Direct Strike reference.</span>
        <span>Strategy updates: <a href="admin.html">Admin</a> · <a href="docs.html">Code Docs</a> · Background art via Settings.</span>
      </div>`;
  }

  function renderToolCards(targetId, cards = toolCards) {
    const target = byId(targetId);
    if (!target) return;
    target.innerHTML = cards.map(card => `
      <article class="card card-link"${card.accent ? ` data-accent="${card.accent}"` : ''}>
        <div class="card-icon" aria-hidden="true">${card.icon}</div>
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        <a class="button-secondary" href="${card.href}">${card.action}</a>
      </article>
    `).join('');
  }

  function initNoobTrapDetector(targetId = 'noob-trap-detector') {
    const target = byId(targetId);
    if (!target) return;
    target.innerHTML = `
      <div class="noob-detector">
        <div class="noob-header">
          <div>
            <span class="eyebrow">Decisions</span>
            <h2>Pre-wave sanity check.</h2>
            <p class="section-intro">Mark what you are about to do. The meter shows how much it is likely to cost you.</p>
          </div>
          <div class="risk-meter" id="risk-meter" style="--risk: 0deg"><span id="risk-label">0 risks</span></div>
        </div>
        <div class="noob-options">
          ${noobTraps.map(trap => `<button class="trap-button" type="button" aria-pressed="false" data-trap="${trap.id}">${trap.label}</button>`).join('')}
        </div>
        <div id="trap-result" class="empty-state">Select a risky plan to get corrected advice before the next wave.</div>
      </div>`;

    const result = byId('trap-result');
    const meter = byId('risk-meter');
    const label = byId('risk-label');
    target.querySelectorAll('.trap-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
        const selected = Array.from(target.querySelectorAll('.trap-button[aria-pressed="true"]'))
          .map(el => noobTraps.find(trap => trap.id === el.dataset.trap));
        const riskDeg = Math.min(360, selected.length * 68);
        meter.style.setProperty('--risk', `${riskDeg}deg`);
        label.textContent = `${selected.length} ${selected.length === 1 ? 'risk' : 'risks'}`;
        if (!selected.length) {
          result.className = 'empty-state';
          result.innerHTML = 'Select a risky plan to get corrected advice before the next wave.';
          return;
        }
        result.className = 'trap-summary-grid';
        result.innerHTML = selected.map(trap => `
          <article class="${trap.severity === 'Critical' ? 'card-warning' : trap.severity === 'High' ? 'card-conditional' : 'card'}">
            <div class="badge-row"><span class="badge decision-danger">${trap.severity} risk</span></div>
            <h3>${trap.label}</h3>
            <p><strong>Correction:</strong> ${trap.advice}</p>
          </article>`).join('');
      });
    });
  }

  function initBeginnerLessons() {
    const target = byId('lesson-list');
    if (!target) return;
    target.innerHTML = beginnerLessons.map((lesson, index) => `
      <article class="card lesson-card">
        <div class="lesson-number">${index + 1}</div>
        <div>
          <h3>${lesson.title}</h3>
          <p>${lesson.text}</p>
        </div>
      </article>`).join('');
  }

  function initGlossary() {
    const target = byId('glossary-grid');
    if (!target) return;
    target.innerHTML = glossaryEntries.map(([term, definition]) => `
      <article class="card">
        <div class="term">${term}</div>
        <p>${definition}</p>
      </article>`).join('');
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }
  function raceClass(race) { return `race-${String(race || '').toLowerCase()}`; }
  function tierClass(tier) {
    const normalized = String(tier || '').toLowerCase();
    if (normalized.includes('s')) return 'tier-s';
    if (normalized.includes('a')) return 'tier-a';
    if (normalized.includes('c')) return 'tier-c';
    if (normalized.includes('d')) return 'tier-d';
    if (normalized.includes('f')) return 'tier-f';
    return 'tier-b';
  }
  function label(text, type = '') {
    const safeText = escapeHTML(text || '');
    return safeText ? `<span class="badge ${type}">${safeText}</span>` : '';
  }
  function renderList(items) {
    const clean = (Array.isArray(items) ? items : [items]).map(item => String(item ?? '').trim()).filter(Boolean);
    if (!clean.length) return '<p class="section-intro">Not filled yet.</p>';
    return `<ul class="list-clean">${clean.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
  }
  function filled(value, fallback = 'Not filled yet.') {
    const text = String(value ?? '').trim();
    return text ? escapeHTML(text) : `<span class="section-intro">${escapeHTML(fallback)}</span>`;
  }

  window.DSA = { navItems: primaryNavItems.concat(moreNavItems), primaryNavItems, moreNavItems, toolCards, noobTraps, beginnerLessons, glossaryEntries, renderToolCards, initNoobTrapDetector, initBeginnerLessons, initGlossary, raceClass, tierClass, label, renderList, escapeHTML, filled };

  applyBackgroundSetting();

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initSettingsPanel();
    initFooter();
    renderToolCards('tool-card-grid');
    initNoobTrapDetector();
    initBeginnerLessons();
    initGlossary();
  });
})();
