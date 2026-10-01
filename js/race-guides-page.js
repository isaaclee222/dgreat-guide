(function () {
  'use strict';
  const esc = value => window.DSA?.escapeHTML ? window.DSA.escapeHTML(value) : String(value ?? '');
  const page = document.body.dataset.raceGuidePage || '';
  const titleMap = { tvt: 'TvT Strategy Lab', pvp: 'PvP Strategy Lab' };
  const scoreKey = `DSA_${page.toUpperCase()}_QUIZ_SCORES`;

  function renderList(title, items) {
    const clean = (items || []).filter(Boolean);
    if (!clean.length) return '';
    return `<section class="race-guide-sublist"><strong>${esc(title)}</strong><ul>${clean.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
  }

  function isSeed(section) {
    return section?.category === 'Admin Seed' || String(section?.title || '').includes('Expert Notes Needed');
  }

  function renderQuiz(section) {
    const questions = (section.quizQuestions || []).filter(q => q.question && (q.answers || []).length >= 2);
    if (!questions.length) return '';
    return `<section class="race-guide-quiz" data-section-id="${esc(section.id)}">
      <div class="small-title">Check yourself</div>
      ${questions.map((q, qi) => `<article class="race-quiz-question" data-question-index="${qi}">
        <strong>${qi + 1}. ${esc(q.question)}</strong>
        <div class="race-quiz-options">
          ${(q.answers || []).map((a, ai) => `<button type="button" data-answer="${ai}" data-correct="${Number(q.correctIndex || 0)}">${esc(a)}</button>`).join('')}
        </div>
        <p class="race-quiz-feedback" hidden>${esc(q.explanation || '')}</p>
      </article>`).join('')}
    </section>`;
  }

  function render() {
    const target = document.getElementById('race-guide-sections');
    if (!target) return;
    let sections = (window.DSA_RACE_GUIDES || []).filter(x => x.page === page).sort((a, b) => Number(a.order || 10) - Number(b.order || 10));
    const realSections = sections.filter(x => !isSeed(x));
    sections = realSections.length ? realSections : [];
    if (!sections.length) {
      target.innerHTML = '<div class="empty-state">No community sections are published for this page yet.</div>';
      return;
    }
    target.innerHTML = sections.map(section => `
      <article class="race-guide-section">
        <div class="badge-row">
          <span class="badge">${esc(section.category || 'Strategy')}</span>
          <span class="response-badge ${String(section.priority || '').toLowerCase().includes('high') ? 'priority-high' : 'priority-medium'}">Priority: ${esc(section.priority || 'Medium')}</span>
          <span class="response-badge ${String(section.skillLevel || '').toLowerCase().includes('expert') ? 'skill-very-high' : 'skill-medium'}">Skill: ${esc(section.skillLevel || 'Medium')}</span>
        </div>
        <h2>${esc(section.title)}</h2>
        <p class="lede small-lede">${esc(section.summary || '')}</p>
        <p>${esc(section.body || '')}</p>
        <div class="race-guide-columns">
          ${renderList('Key points', section.keyPoints)}
          ${renderList('Common mistakes', section.commonMistakes)}
        </div>
        ${renderQuiz(section)}
        <footer class="guide-meta">Updated by ${esc(section.updatedBy || 'Community')} ${section.updatedAt ? `· ${esc(new Date(section.updatedAt).toLocaleDateString())}` : ''}</footer>
      </article>`).join('');
    wireQuizzes();
  }

  function wireQuizzes() {
    document.querySelectorAll('.race-guide-quiz [data-answer]').forEach(btn => {
      btn.addEventListener('click', () => {
        const correct = Number(btn.dataset.correct || 0);
        const picked = Number(btn.dataset.answer || 0);
        const question = btn.closest('.race-quiz-question');
        question.querySelectorAll('[data-answer]').forEach(b => {
          b.disabled = true;
          if (Number(b.dataset.answer || 0) === correct) b.classList.add('correct');
        });
        if (picked !== correct) btn.classList.add('wrong');
        const feedback = question.querySelector('.race-quiz-feedback');
        if (feedback) feedback.hidden = false;
        const previous = JSON.parse(localStorage.getItem(scoreKey) || '{"answered":0,"correct":0}');
        previous.answered += 1;
        if (picked === correct) previous.correct += 1;
        localStorage.setItem(scoreKey, JSON.stringify(previous));
      }, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const heading = document.getElementById('race-guide-title');
    if (heading) heading.textContent = titleMap[page] || 'Race Strategy Lab';
    render();
  });
  document.addEventListener('dsa-community-data-ready', render);
  document.addEventListener('dsa-community-server-data-ready', render);
})();
