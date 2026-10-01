(function () {
  let index = 0;
  let score = Number(localStorage.getItem('dsa-gas-score') || 0);
  let answered = 0;

  function render() {
    const data = window.DSA_GAS_SCENARIOS;
    const scenario = data[index];
    document.getElementById('gas-progress').textContent = `Scenario ${index + 1} of ${data.length} • Saved correct answers: ${score}`;
    document.getElementById('gas-progress-bar').style.width = `${(index / data.length) * 100}%`;
    document.getElementById('gas-card').innerHTML = `
      <span class="eyebrow">Gas Trainer</span>
      <h2>${scenario.title}</h2>
      <p>${scenario.prompt}</p>
      <p class="section-intro">Do you gas?</p>
      <div class="quiz-options">
        <button class="button-success" type="button" data-answer="Yes">Yes</button>
        <button class="button-danger" type="button" data-answer="No">No</button>
      </div>
      <div id="gas-result" class="answer-result"></div>`;
    document.querySelectorAll('[data-answer]').forEach(btn => btn.addEventListener('click', answer));
  }

  function answer(event) {
    const data = window.DSA_GAS_SCENARIOS;
    const scenario = data[index];
    const choice = event.currentTarget.dataset.answer;
    const correct = choice === scenario.correct;
    if (correct) {
      score += 1;
      localStorage.setItem('dsa-gas-score', String(score));
    }
    answered += 1;
    document.getElementById('gas-result').innerHTML = `
      <div class="${correct ? 'card-success' : 'card-warning'}">
        <h3>${correct ? 'Correct' : 'Not this time'}</h3>
        <p><strong>Correct answer:</strong> ${scenario.correct}</p>
        <p>${scenario.explanation}</p>
        <button class="button-secondary" type="button" id="next-gas">${index === data.length - 1 ? 'Finish' : 'Next scenario'}</button>
      </div>`;
    document.querySelectorAll('[data-answer]').forEach(btn => btn.disabled = true);
    document.getElementById('next-gas').addEventListener('click', () => {
      if (index === data.length - 1) {
        document.getElementById('gas-progress-bar').style.width = '100%';
        document.getElementById('gas-card').innerHTML = `
          <div class="card-success">
            <h2>Run complete</h2>
            <p>You answered ${answered} scenario${answered === 1 ? '' : 's'} this run. Total saved correct answers: ${score}.</p>
            <button class="button-primary" type="button" id="restart-gas">Restart trainer</button>
            <button class="button-ghost" type="button" id="reset-gas-score">Reset saved score</button>
          </div>`;
        document.getElementById('restart-gas').addEventListener('click', () => { index = 0; answered = 0; render(); });
        document.getElementById('reset-gas-score').addEventListener('click', () => { score = 0; localStorage.setItem('dsa-gas-score', '0'); index = 0; answered = 0; render(); });
      } else {
        index += 1;
        render();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('gas-card')) render();
  });
})();
