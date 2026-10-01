(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = value => window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? '');
  const state = {
    experience: localStorage.getItem('dsaExperience') || 'lane',
    race: localStorage.getItem('dsaRace') || ''
  };

  const painLines = {
    default: [
      'Keep getting rolled in Wave 3?',
      'Tired of losing to mass Void Rays?',
      "Can't figure out what actually counters Mech?",
      'Your lane partner keeps dying first?',
      'Not sure which unit is killing your wave?',
      'Still gassing when your wave is already leaking?'
    ],
    beginner: [
      'Not sure what to build first?',
      'Gas feels good until mid disappears?',
      'One unit keeps deleting your whole army?',
      'You know the units, but not the timing yet.'
    ],
    lane: [
      'You know the counter, but the lane still leaks?',
      'Your wave wins, then your teammate gets crushed?',
      'The right unit at the wrong timing still loses.',
      'You keep stabilizing one round too late.'
    ],
    edge: [
      'Looking for the counter-counter?',
      'The weird timing is where the lane flips.',
      'You need the edge case before they punish you.',
      'Small formation errors decide late waves.'
    ]
  };

  const racePain = {
    Terran: ['Liberators looked good, then Stalkers deleted them.', 'Bio wins early until storm turns the lane off.', 'Mech answers feel slow unless the timing is clean.'],
    Zerg: ['Hydras feel right until storm farms them.', 'Muta wins early, then the transition window gets scary.', 'Roach buffers matter more than they look.'],
    Protoss: ['Mirror tech is not always the answer.', 'Archon and Disruptor timings flip matchups hard.', 'Carriers force switches, but only if you survive the timing.']
  };

  function startPainLoop() {
    const el = $('pain-line');
    if (!el) return;
    let i = 0;
    function activeList() {
      if (state.race && racePain[state.race]) return racePain[state.race];
      return painLines[state.experience] || painLines.default;
    }
    function tick() {
      const list = activeList();
      el.classList.add('fade-out');
      setTimeout(() => {
        el.textContent = list[i % list.length];
        el.classList.remove('fade-out');
        i += 1;
      }, 220);
    }
    tick();
    setInterval(tick, 3000);
  }

  function selectExperience(exp) {
    state.experience = exp || 'lane';
    localStorage.setItem('dsaExperience', state.experience);
    document.querySelectorAll('.experience-card').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.experience === state.experience);
    });
    $('race-draft')?.classList.add('ready');
  }

  function selectRaceAndGo(race, btn) {
    if (!race) return;
    state.race = race;
    localStorage.setItem('dsaRace', race);
    localStorage.setItem('dsaHasVisited', 'true');
    localStorage.setItem('dsaVisitorProfileComplete', 'true');
    const experience = state.experience || localStorage.getItem('dsaExperience') || 'lane';
    localStorage.setItem('dsaExperience', experience);
    const url = `matchup-helper.html?race=${encodeURIComponent(race)}&experience=${encodeURIComponent(experience)}`;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (btn && !reduced) {
      // Selection pulse (css .race-selected), then redirect.
      btn.classList.add('race-selected');
      setTimeout(() => window.location.assign(url), 430);
    } else {
      window.location.assign(url);
    }
  }

  function hydrateSelections() {
    document.querySelectorAll('.experience-card').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.experience === state.experience);
    });
    if (state.experience) $('race-draft')?.classList.add('ready');
    if (state.race) {
      document.body.dataset.selectedRace = state.race.toLowerCase();
      const anchor = $('selected-race-anchor');
      if (anchor) anchor.innerHTML = `<span class="race-mini ${window.DSA?.raceClass ? window.DSA.raceClass(state.race) : ''}">${esc(state.race[0])}</span><strong>${esc(state.race)}</strong>`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    startPainLoop();
    hydrateSelections();

    document.querySelectorAll('.experience-card').forEach(btn => {
      btn.addEventListener('click', () => selectExperience(btn.dataset.experience));
    });
    document.querySelectorAll('.race-portrait').forEach(btn => {
      btn.addEventListener('click', () => selectRaceAndGo(btn.dataset.race, btn));
    });
  });
})();
