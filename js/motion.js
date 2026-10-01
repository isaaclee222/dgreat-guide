/*
  Shared scroll-reveal. Load after main.js on every page.
  Marks static .card/.section elements with .reveal, then an IntersectionObserver
  adds .in-view as they scroll in. Dynamically rendered cards never get .reveal,
  so page scripts that rebuild DOM (matchup helper, spotlight, etc.) are unaffected.
  Startup work is deferred to idle time to avoid blocking first interaction.
*/
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(entries => {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  /* threshold 0 (not 0.1): very tall sections (e.g. the 40+ card strategy list)
     can never have 10% on screen at once, which left them permanently hidden. */

  function onIdle(fn) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout: 700 });
    } else {
      setTimeout(fn, 0);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('motion-ready');
    onIdle(() => {
      document.querySelectorAll('.section, .card').forEach(el => {
        el.classList.add('reveal');
        io.observe(el);
      });
    });
  });
})();
