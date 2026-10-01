(function () {
  'use strict';

  const HOME_DISMISS_KEY = 'dsaWaveLandingDismissed';

  function mount(selector) {
    const target = document.querySelector(selector);
    if (!target || typeof window.mountWaveAnimation !== 'function') return;
    window.mountWaveAnimation(target, {
      width: 680,
      rowHeight: 115,
      rows: 4,
      initialSpeed: 3,
      showControls: true,
      showLegend: false
    });
  }

  function initHomeLanding() {
    const entry = document.getElementById('wave-entry');
    if (!entry) return;

    if (sessionStorage.getItem(HOME_DISMISS_KEY) === 'true') {
      entry.remove();
      document.body.classList.add('wave-entry-gone');
      return;
    }

    document.body.classList.add('wave-entry-active');
    let progress = 0;
    const threshold = 420;

    function setProgress(next) {
      progress = Math.max(0, Math.min(threshold, next));
      const pct = progress / threshold;
      entry.style.setProperty('--wave-dismiss-progress', String(pct));
      if (progress >= threshold) dismiss();
    }

    function dismiss() {
      if (entry.classList.contains('dismissed')) return;
      sessionStorage.setItem(HOME_DISMISS_KEY, 'true');
      entry.classList.add('dismissed');
      document.body.classList.remove('wave-entry-active');
      document.body.classList.add('wave-entry-gone');
      setTimeout(() => entry.remove(), 420);
    }

    function onWheel(event) {
      if (!document.body.classList.contains('wave-entry-active')) return;
      if (event.deltaY <= 0 && progress <= 0) return;
      event.preventDefault();
      setProgress(progress + event.deltaY);
    }

    let touchStartY = null;
    function onTouchStart(event) {
      touchStartY = event.touches && event.touches.length ? event.touches[0].clientY : null;
    }
    function onTouchMove(event) {
      if (touchStartY === null || !event.touches || !event.touches.length) return;
      const dy = touchStartY - event.touches[0].clientY;
      if (dy <= 0 && progress <= 0) return;
      event.preventDefault();
      setProgress(progress + dy * 1.6);
      touchStartY = event.touches[0].clientY;
    }
    function onKeydown(event) {
      const keys = ['ArrowDown', 'PageDown', ' ', 'Enter'];
      if (!keys.includes(event.key) || !document.body.classList.contains('wave-entry-active')) return;
      event.preventDefault();
      setProgress(progress + 160);
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeydown);

    const closeBtn = entry.querySelector('.wave-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    entry.addEventListener('click', event => {
      if (event.target.closest('a, button, input')) return;
      setProgress(progress + 0);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    mount('#home-wave-animation');
    mount('#wave-page-animation');
    initHomeLanding();
  });
})();
