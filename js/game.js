// Boucle de jeu : tirage de la note, boutons de réponse, score et série.
(function () {
  const { NOTE_NAMES, randomNote, playTone, renderStaff } = window.Notanext;

  const svg = document.getElementById('staff');
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  const feedbackEl = document.getElementById('feedback');
  const answersEl = document.getElementById('answers');

  let score = 0;
  let streak = 0;
  let current = null;

  function buildButtons() {
    NOTE_NAMES.forEach((name) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = name;
      btn.className = 'answer-btn';
      btn.addEventListener('click', () => handleAnswer(name));
      answersEl.appendChild(btn);
    });
  }

  function nextNote() {
    current = randomNote();
    renderStaff(svg, current);
    feedbackEl.textContent = ' ';
    feedbackEl.className = 'feedback';
    playTone(current.freq);
  }

  function handleAnswer(name) {
    playTone(current.freq);

    if (name === current.name) {
      score++;
      streak++;
      feedbackEl.textContent = 'Bien joué !';
      feedbackEl.className = 'feedback correct';
    } else {
      streak = 0;
      feedbackEl.textContent = `C'était ${current.name}`;
      feedbackEl.className = 'feedback incorrect';
    }

    scoreEl.textContent = score;
    streakEl.textContent = streak;

    setTimeout(nextNote, 900);
  }

  buildButtons();
  nextNote();
})();
