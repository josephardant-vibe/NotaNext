// Page d'accueil : affichée uniquement à la première visite sur cet appareil
// (mémoire locale du navigateur), puis directement "S'exercer" aux chargements
// suivants. Le logo de la barre de l'app permet d'y revenir à la demande.
(function () {
  const { app } = window.Notanext;
  const VISITED_KEY = 'notanext.visited';

  const home = document.getElementById('view-home');
  const exPage = document.getElementById('ex-page');

  function showHome() {
    // Quitte proprement un exercice en cours (le défilement continu tourne tout seul).
    const back = document.getElementById('back');
    if (back && !exPage.hidden) back.click();
    document.body.classList.add('is-home');
    home.hidden = false;
    home.scrollTop = 0;
  }

  function enterApp(tab) {
    document.body.classList.remove('is-home');
    home.hidden = true;
    app.setTab(tab);
  }

  document.querySelectorAll('[data-go]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      enterApp(a.dataset.go);
    });
  });
  document.getElementById('nav-home').addEventListener('click', showHome);

  // ----- démo interactive du hero : mini "Deviner la note" en boucle -----
  const NAMES = ['Mi', 'Fa', 'Sol', 'La', 'Si', 'Do', 'Ré']; // pas 0 = Mi (ligne du bas)
  const STEPS = [3, 5, 2, 6, 0, 4, 7, 1];
  const BUTTONS = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

  const noteEl = document.getElementById('home-note');
  const stemEl = document.getElementById('home-stem');
  const questionEl = document.getElementById('home-question');
  const countEl = document.getElementById('home-count');
  const answersEl = document.getElementById('home-answers');

  let index = 0;
  let done = 0;
  let picked = null;

  const btns = BUTTONS.map((name) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = name;
    b.addEventListener('click', () => pick(name));
    answersEl.appendChild(b);
    return b;
  });

  function render() {
    const step = STEPS[index];
    const answer = NAMES[step % 7];
    const y = 88 - 6 * step;
    const up = step < 4;
    noteEl.setAttribute('cy', y);
    noteEl.setAttribute('transform', `rotate(-20 250 ${y})`);
    stemEl.setAttribute('d', `M${up ? 259 : 241} ${y}V${up ? y - 38 : y + 38}`);
    countEl.textContent = `${(done % 8) + 1} / 8`;

    btns.forEach((b) => {
      b.className = '';
      if (picked && b.textContent === answer) b.className = 'correct';
      else if (picked === b.textContent) b.className = 'wrong';
    });
    questionEl.className = 'home-question';
    if (picked === answer) {
      questionEl.textContent = `Juste. C'est un ${answer}.`;
      questionEl.classList.add('ok');
    } else if (picked) {
      questionEl.textContent = `Presque. C'est un ${answer}.`;
    } else {
      questionEl.textContent = 'Quelle est cette note ?';
    }
    return answer;
  }

  function pick(name) {
    if (picked) return;
    picked = name;
    render();
    setTimeout(() => {
      index = (index + 1) % STEPS.length;
      done++;
      picked = null;
      render();
    }, 1100);
  }

  render();

  let seen = false;
  try { seen = !!localStorage.getItem(VISITED_KEY); } catch (e) { /* stockage indisponible : on réaffiche l'accueil */ }
  if (!seen) {
    showHome();
    try { localStorage.setItem(VISITED_KEY, '1'); } catch (e) { /* idem */ }
  }
})();
