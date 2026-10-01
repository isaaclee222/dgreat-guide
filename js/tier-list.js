(function () {
  const races = ['Zerg', 'Terran', 'Protoss'];
  const phases = [
    { key: 'earlyTier', label: 'Early game' },
    { key: 'lateTier', label: 'Lategame' }
  ];
  const tiers = ['S', 'A', 'B', 'C', 'D', 'F'];
  let selectedRace = 'Zerg';
  let selectedPhase = 'earlyTier';

  function byId(id) { return document.getElementById(id); }
  function esc(value) { return window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? ''); }
  function slug(value) {
    return String(value || '').toLowerCase().replace(/&/g, ' and ').replace(/\s*\/\s*/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
  }
  function imageFor(item) { return item.image || `assets/units/${slug(item.unit)}.png`; }
  function button(label, pressed, attr, value) {
    return `<button class="button-secondary" type="button" aria-pressed="${pressed}" ${attr}="${esc(value)}">${esc(label)}</button>`;
  }
  function normalizeTier(value) {
    const tier = String(value || '').trim().toUpperCase();
    if (!tier) return '';
    if (tier.includes('S')) return 'S';
    if (tier.startsWith('A')) return 'A';
    if (tier.startsWith('B')) return 'B';
    if (tier.startsWith('C')) return 'C';
    if (tier.startsWith('D')) return 'D';
    if (tier.startsWith('F')) return 'F';
    return '';
  }
  function renderControls() {
    byId('tier-race-controls').innerHTML = races.map(r => button(r, r === selectedRace, 'data-tier-race', r)).join('');
    byId('tier-phase-controls').innerHTML = phases.map(p => button(p.label, p.key === selectedPhase, 'data-tier-phase', p.key)).join('');
    document.querySelectorAll('[data-tier-race]').forEach(btn => btn.addEventListener('click', () => { selectedRace = btn.dataset.tierRace; render(); }));
    document.querySelectorAll('[data-tier-phase]').forEach(btn => btn.addEventListener('click', () => { selectedPhase = btn.dataset.tierPhase; render(); }));
  }
  function render() {
    if (!byId('tier-board')) return;
    renderControls();
    const q = (byId('tier-search').value || '').trim().toLowerCase();
    const phaseLabel = phases.find(p => p.key === selectedPhase).label;
    const allItems = window.DSA_TIERLIST || [];
    const items = allItems
      .filter(item => item.race === selectedRace)
      .filter(item => normalizeTier(item[selectedPhase]))
      .filter(item => !q || String(item.unit || '').toLowerCase().includes(q) || String(item.notes || '').toLowerCase().includes(q));
    const total = items.length;
    byId('tier-summary').innerHTML = `<div class="tier-summary-bar"><strong>${esc(selectedRace)} · ${esc(phaseLabel)}</strong><span>${total} ranked units</span></div>`;
    byId('tier-board').innerHTML = tiers.map(tier => {
      const units = items.filter(item => normalizeTier(item[selectedPhase]) === tier);
      return `<section class="tier-row tier-row-table" aria-label="${esc(tier)} tier">
        <div class="tier-label" data-tier="${esc(tier)}">${esc(tier)}</div>
        <div class="tier-units tier-icon-row">${units.length ? units.map(item => `
          <button class="tier-icon" type="button" title="${esc(item.unit)} — ${esc(item.notes || '')}" aria-label="${esc(item.unit)}" data-tier-unit="${esc(item.unit)}">
            <img src="${esc(imageFor(item))}" alt="" onerror="this.onerror=null;this.src='assets/units/unknown.png';">
          </button>`).join('') : '<span class="tier-empty">—</span>'}</div>
      </section>`;
    }).join('');
    byId('tier-notes').innerHTML = `<article class="tier-detail-dock" id="tier-detail-dock"><strong>Hover or tap an icon</strong><span>Unit notes appear in the browser tooltip; replace PNGs in <code>assets/units/</code> with real 64×64 unit art.</span></article>`;
    document.querySelectorAll('[data-tier-unit]').forEach(btn => btn.addEventListener('click', () => {
      const unit = allItems.find(item => item.unit === btn.dataset.tierUnit);
      const dock = byId('tier-detail-dock');
      if (!unit || !dock) return;
      dock.innerHTML = `<strong>${esc(unit.unit)}</strong><span>${esc(unit.notes || 'No notes available.')}</span>`;
    }));
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (!byId('tier-board')) return;
    byId('tier-search').addEventListener('input', render);
    render();
  });
})();
