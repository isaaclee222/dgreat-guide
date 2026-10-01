(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = value => window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? '');

  function guides() {
    return (window.DSA_STRATEGY_GUIDES || []).slice().sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  }

  function unique(list, key) {
    return ['All'].concat(Array.from(new Set(list.map(x => x[key]).filter(Boolean))).sort());
  }

  function optionHTML(values) {
    return values.map(v => `<option>${esc(v)}</option>`).join('');
  }

  function renderFilters() {
    const all = guides();
    if ($('strategy-race')) $('strategy-race').innerHTML = optionHTML(unique(all, 'race'));
    if ($('strategy-category')) $('strategy-category').innerHTML = optionHTML(unique(all, 'category'));
  }

  function renderGuides() {
    const target = $('strategy-guide-list');
    if (!target) return;
    const race = $('strategy-race')?.value || 'All';
    const category = $('strategy-category')?.value || 'All';
    const search = ($('strategy-search')?.value || '').toLowerCase().trim();
    const filtered = guides().filter(g => {
      const matchesRace = race === 'All' || g.race === race || g.race === 'Any';
      const matchesCat = category === 'All' || g.category === category;
      const hay = [g.title, g.summary, g.body, g.matchup, (g.tags || []).join(' ')].join(' ').toLowerCase();
      const matchesSearch = !search || hay.includes(search);
      return matchesRace && matchesCat && matchesSearch;
    });

    if (!filtered.length) {
      target.innerHTML = '<div class="empty-state">No strategy guides match this filter yet. Add one from admin.html and publish data-community-additions.js.</div>';
      return;
    }

    target.innerHTML = filtered.map(g => `
      <article class="strategy-guide-card">
        <div class="badge-row">
          <span class="badge ${window.DSA?.raceClass ? window.DSA.raceClass(g.race) : ''}">${esc(g.race || 'Any')}</span>
          <span class="badge">${esc(g.category || 'Guide')}</span>
          <span class="badge">${esc(g.matchup || 'Any matchup')}</span>
        </div>
        <h2>${esc(g.title)}</h2>
        <p class="lede small-lede">${esc(g.summary || '')}</p>
        <p>${esc(g.body || '')}</p>
        ${(g.tags || []).length ? `<div class="tag-row">${g.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        <footer class="guide-meta">Updated by ${esc(g.author || g.updatedBy || 'Community')} ${g.updatedAt ? `· ${esc(new Date(g.updatedAt).toLocaleDateString())}` : ''}</footer>
      </article>`).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderFilters();
    ['strategy-race', 'strategy-category', 'strategy-search'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('input', renderGuides);
    });
    renderGuides();
  });
  document.addEventListener('dsa-community-data-ready', () => { renderFilters(); renderGuides(); });
  document.addEventListener('dsa-community-server-data-ready', () => { renderFilters(); renderGuides(); });
})();
