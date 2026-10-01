(function () {
  function byId(id) { return document.getElementById(id); }
  function esc(value) { return window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? ''); }
  function filled(value, fallback = 'Not filled yet.') { return window.DSA?.filled ? window.DSA.filled(value, fallback) : esc(value || fallback); }

  function getValues() {
    return {
      q: byId('unit-search').value.trim().toLowerCase(),
      race: byId('race-filter').value,
      tier: byId('tier-filter').value,
      skill: byId('skill-filter').value
    };
  }

  function normalizeTier(value) {
    const tier = String(value || '').toUpperCase();
    if (tier.includes('S')) return 'S';
    if (tier.startsWith('A')) return 'A';
    if (tier.startsWith('B')) return 'B';
    if (tier.startsWith('C')) return 'C';
    if (tier.startsWith('D')) return 'D';
    if (tier.startsWith('F')) return 'F';
    return 'Unknown';
  }

  function matches(unit, filters) {
    const haystack = [unit.name, unit.role, unit.summary, unit.tierNotes].join(' ').toLowerCase();
    const nameMatch = haystack.includes(filters.q);
    const raceMatch = filters.race === 'All' || unit.race === filters.race;
    const tierMatch = filters.tier === 'All' || normalizeTier(unit.tier) === filters.tier || String(unit.tier || '').includes(filters.tier);
    const skillText = String(unit.skillLevel || 'Medium');
    const skillMatch = filters.skill === 'All' || skillText === filters.skill;
    return nameMatch && raceMatch && tierMatch && skillMatch;
  }

  function card(unit) {
    const DSA = window.DSA;
    const strong = [...(unit.strongAgainst || []), ...(unit.strongWhen || [])].filter(Boolean);
    const weak = [...(unit.weakAgainst || []), ...(unit.weakWhen || [])].filter(Boolean);
    return `
      <article class="card unit-card" tabindex="0" role="button" aria-expanded="false">
        <div class="badge-row">
          ${DSA.label(unit.race, DSA.raceClass(unit.race))}
          ${DSA.label(`Tier ${unit.tier || 'Unknown'}`, DSA.tierClass(unit.tier))}
          ${DSA.label(`Early ${unit.earlyTier || 'Unknown'}`)}
          ${DSA.label(`Late ${unit.lateTier || 'Unknown'}`)}
          ${DSA.label(unit.skillLevel || 'Medium')}
        </div>
        <h3>${esc(unit.name)}</h3>
        <p><strong>${filled(unit.role, 'Role not filled yet.')}</strong></p>
        <p>${filled(unit.summary || unit.tierNotes)}</p>
        ${unit.beginnerWarning ? `<p class="decision-label decision-danger">${esc(unit.beginnerWarning)}</p>` : ''}
        <div class="unit-details">
          <div class="small-title">Spreadsheet tier notes</div>
          <p>${filled(unit.tierNotes)}</p>
          <div class="small-title">Strong against / strong when</div>
          ${DSA.renderList(strong)}
          <div class="small-title">Weak against / weak when</div>
          ${DSA.renderList(weak)}
          <div class="small-title">Common mistake</div>
          <p>${filled(unit.commonMistake)}</p>
          ${unit.specialNote ? `<div class="small-title">Special note</div><p>${esc(unit.specialNote)}</p>` : ''}
          <div class="badge-row">
            ${unit.oldTier ? DSA.label(`Old: ${unit.oldTier}`) : ''}
            ${unit.newTier ? DSA.label(`New: ${unit.newTier}`) : ''}
            ${unit.status ? DSA.label(unit.status) : ''}
          </div>
        </div>
      </article>`;
  }

  function populateTierFilter() {
    const filter = byId('tier-filter');
    if (!filter || filter.dataset.ready === 'true') return;
    const tiers = ['All', 'S', 'A', 'B', 'C', 'D', 'F', 'Unknown'];
    filter.innerHTML = tiers.map(t => `<option>${esc(t)}</option>`).join('');
    filter.dataset.ready = 'true';
  }

  function render() {
    const list = byId('unit-list');
    if (!list || !window.DSA_UNITS) return;
    populateTierFilter();
    const filters = getValues();
    const units = window.DSA_UNITS.filter(unit => matches(unit, filters));
    list.innerHTML = units.length ? units.map(card).join('') : '<div class="empty-state">No units match these filters.</div>';
    list.querySelectorAll('.unit-card').forEach(el => {
      const toggle = () => el.setAttribute('aria-expanded', String(el.getAttribute('aria-expanded') !== 'true'));
      el.addEventListener('click', toggle);
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!byId('unit-list')) return;
    populateTierFilter();
    ['unit-search', 'race-filter', 'tier-filter', 'skill-filter'].forEach(id => {
      byId(id).addEventListener('input', render);
    });
    render();
  });
})();