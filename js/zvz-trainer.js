(function () {
  let index = 0;
  let correctCount = 0;

  const facts = [
    'Muta is S-tier in early ZvZ.',
    'Sometimes skipping round 2 is correct.',
    'Best response to Muta is Muta yourself or perfectly timed Viper.',
    'If enemy Viper wins value, switch Hydra and add your own Viper.',
    'If enemy goes Ultra, transition to Ultra also.',
    'Sell Mutas if needed to afford T3 before round start.',
    'Hydra by minute 7 is still usually correct.',
    'Early Infestor and early Queen are not reliable Muta answers.',
    'Lategame is often dominated by Ultra or Lurker.'
  ];

  function byId(id) { return document.getElementById(id); }
  function showScreen(name) {
    const learn = byId('zvz-learn-screen');
    const quiz = byId('zvz-quiz-screen');
    if (!learn || !quiz) return;
    const showingQuiz = name === 'quiz';
    learn.hidden = showingQuiz;
    quiz.hidden = !showingQuiz;
    byId('show-zvz-learn').setAttribute('aria-pressed', String(!showingQuiz));
    byId('start-zvz-quiz').setAttribute('aria-pressed', String(showingQuiz));
    if (showingQuiz) render();
  }

  function renderIntroFacts() {
    const target = byId('zvz-facts');
    if (!target) return;
    target.innerHTML = facts.map((fact, i) => `<article class="card"><div class="lesson-number">${i + 1}</div><p>${fact}</p></article>`).join('');
  }

  function render() {
    const data = window.DSA_ZVZ_SCENARIOS;
    const scenario = data[index];
    byId('zvz-progress').textContent = `Question ${index + 1} of ${data.length} • Correct this run: ${correctCount}`;
    byId('zvz-progress-bar').style.width = `${(index / data.length) * 100}%`;
    byId('zvz-card').innerHTML = `
      <span class="eyebrow">Quiz screen</span>
      <h2>${scenario.title}</h2>
      <p>${scenario.prompt}</p>
      <div class="quiz-options">
        ${scenario.options.map(option => `<button class="button-secondary" type="button" data-zvz-answer="${option}">${option}</button>`).join('')}
      </div>
      <div id="zvz-result" class="answer-result"></div>`;
    document.querySelectorAll('[data-zvz-answer]').forEach(btn => btn.addEventListener('click', answer));
  }

  function answer(event) {
    const data = window.DSA_ZVZ_SCENARIOS;
    const scenario = data[index];
    const choice = event.currentTarget.dataset.zvzAnswer;
    const correct = choice === scenario.correct;
    if (correct) correctCount += 1;
    document.querySelectorAll('[data-zvz-answer]').forEach(btn => btn.disabled = true);
    byId('zvz-result').innerHTML = `
      <div class="${correct ? 'card-success' : 'card-warning'}">
        <h3>${correct ? 'Correct' : 'Not this time'}</h3>
        <p><strong>Correct answer:</strong> ${scenario.correct}</p>
        <p>${scenario.explanation}</p>
        <button class="button-primary" id="next-zvz" type="button">${index === data.length - 1 ? 'Finish' : 'Next decision'}</button>
      </div>`;
    byId('next-zvz').addEventListener('click', () => {
      if (index === data.length - 1) {
        byId('zvz-progress-bar').style.width = '100%';
        byId('zvz-card').innerHTML = `
          <div class="card-success">
            <h2>ZvZ run complete</h2>
            <p>You got ${correctCount} of ${data.length} correct.</p>
            <div class="button-row">
              <button class="button-primary" type="button" id="restart-zvz">Restart quiz</button>
              <button class="button-secondary" type="button" id="review-zvz">Return to lesson</button>
            </div>
          </div>`;
        byId('restart-zvz').addEventListener('click', () => { index = 0; correctCount = 0; render(); });
        byId('review-zvz').addEventListener('click', () => { index = 0; correctCount = 0; showScreen('learn'); });
      } else {
        index += 1;
        render();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!byId('zvz-learn-screen')) return;
    renderIntroFacts();
    byId('show-zvz-learn').addEventListener('click', () => showScreen('learn'));
    byId('start-zvz-quiz').addEventListener('click', () => { index = 0; correctCount = 0; showScreen('quiz'); });
  });
})();
