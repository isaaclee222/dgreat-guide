/*
  Direct Strike Academy visit router.
  - First-time visitors landing on index.html are sent to the identity hook page.
  - Returning visitors landing on index.html are sent straight to the matchup helper.
  - The DG logo uses index.html?home=1 so the normal index remains accessible.
*/
(function () {
  'use strict';
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'index.html' && page !== '') return;

  const params = new URLSearchParams(location.search);
  const forceHome = params.has('home') || params.has('showHome') || params.has('noRedirect');
  if (forceHome) return;

  try {
    const profileComplete = localStorage.getItem('dsaVisitorProfileComplete') === 'true';
    const hasVisited = localStorage.getItem('dsaHasVisited') === 'true';
    if (profileComplete || hasVisited) {
      const race = localStorage.getItem('dsaRace') || '';
      const experience = localStorage.getItem('dsaExperience') || '';
      const qs = new URLSearchParams();
      if (race) qs.set('race', race);
      if (experience) qs.set('experience', experience);
      qs.set('source', 'return');
      location.replace('matchup-helper.html?' + qs.toString());
      return;
    }
    location.replace('start.html');
  } catch (err) {
    // If storage is blocked, keep the normal homepage usable.
  }
})();
