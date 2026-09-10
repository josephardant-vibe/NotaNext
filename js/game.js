// Boucle de jeu : tirage de la note, boutons de réponse, score et série.
(function () {
  const { NOTE_NAMES, randomNote, playTone, renderStaff, showAnswerLabel } = window.Notanext;

  const CORRECT_PHRASES = ['Bien joué !', 'Bravo !', 'Exactement !', 'Bien vu !', 'Parfait !'];
  const MAX_STREAK_VISUAL = 8;

  const svg = document.getElementById('staff');
  const scoreEl = document.getElementById('score');
  const streakEl = document.getElementById('streak');
  const streakFillEl = document.getElementById('streak-fill');
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

  function pop(el) {
    el.classList.remove('pop');
    void el.offsetWidth; // force reflow pour rejouer l'animation
    el.classList.add('pop');
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

    const isCorrect = name === current.name;
    showAnswerLabel(svg, current, isCorrect);

    if (isCorrect) {
      score++;
      streak++;
      feedbackEl.textContent = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)];
      feedbackEl.className = 'feedback correct';
      pop(scoreEl);
    } else {
      streak = 0;
      feedbackEl.textContent = ' ';
      feedbackEl.className = 'feedback';
    }

    scoreEl.textContent = score;
    streakEl.textContent = streak;
    streakFillEl.style.width = Math.min(streak / MAX_STREAK_VISUAL, 1) * 100 + '%';

    setTimeout(nextNote, 900);
  }

  buildButtons();
  nextNote();
})();
