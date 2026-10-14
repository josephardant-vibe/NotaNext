// Page d'accueil : l'adresse du site l'ouvre toujours (un lien direct vers une page
// de l'app, #/exercer/place par exemple, ouvre cette page). Le logo de la barre de
// l'app permet d'y revenir à la demande.
// Réglage unique : passer REDIRIGER_VISITEURS_REVENANTS à true rétablit l'ancien
// comportement (accueil à la première visite seulement, puis directement « S'exercer »),
// à réactiver quand les comptes existeront.
(function () {
  const REDIRIGER_VISITEURS_REVENANTS = false;
  const { app } = window.Notanext;
  const VISITED_KEY = 'notanext.visited';

  const home = document.getElementById('view-home');

  const HOME_TITLE = 'NotaNext — Apprends à lire la musique';

  function showHome() {
    // Quitte proprement un jeu en cours (le défilement continu tourne tout seul).
    app.closeGame();
    document.body.classList.add('is-home');
    home.hidden = false;
    home.scrollTop = 0;
    document.title = HOME_TITLE;
  }

  function hideHome() {
    if (home.hidden) return;
    document.body.classList.remove('is-home');
    home.hidden = true;
  }

  // Le routeur (js/game.js) affiche et masque l'accueil selon l'adresse (#/accueil).
  window.Notanext.home = { show: showHome, hide: hideHome };

  // `open` : { exercise: id } ou { learn: id } pour ouvrir directement un jeu / un cours.
  function enterApp(tab, open) {
    document.body.classList.remove('is-home');
    home.hidden = true;
    app.setTab(tab);
    if (open && open.exercise) app.openExercise(open.exercise);
    if (open && open.learn) app.openLearnCard(open.learn);
  }

  document.querySelectorAll('[data-go]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      // data-exercise : ouvre directement ce jeu (ex. « Commencer gratuitement » → Deviner la note).
      enterApp(a.dataset.go, a.dataset.exercise ? { exercise: a.dataset.exercise } : undefined);
    });
  });

  // Liens du header : défilement doux vers la section (sans changer l'adresse).
  document.querySelectorAll('[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
  });
  // Le logo ramène à l'accueil par son adresse propre : le bouton Retour du navigateur fonctionne.
  document.getElementById('nav-home').addEventListener('click', () => {
    if (location.hash !== '#/accueil') location.hash = '#/accueil';
    else showHome();
  });

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

  // ----- "Les jeux" : aperçus animés (boucle : question -> raté -> juste) -----
    const TILES = [
    { title: 'Deviner la note', desc: 'Une note sur la portée, trouve son nom.', open: { exercise: 'guess-window' }, offset: 0, notes: [150] },
    { title: 'Défilement continu', desc: "Les notes défilent, réponds sans t'arrêter.", open: { exercise: 'guess-scroll' }, offset: 1, notes: [100, 150, 200] },
    { title: 'Placer la note', desc: 'On te donne un nom, place la note sur la portée.', open: { exercise: 'place' }, offset: 2, notes: [150] },
    { title: 'Oreille absolue — deviner', desc: 'Écoute un son, trouve la note.', open: { exercise: 'ear-guess' }, offset: 0, notes: [150] },
    { title: 'Oreille absolue — placer', desc: 'Écoute un son, place-le sur la portée.', open: { exercise: 'ear-place' }, offset: 1, notes: [150] },
  ];
  const INK = '#211d18';
  const SOON_NOTE = '#b9a892';
  const tilesEl = document.getElementById('home-tiles');
  const tileViews = TILES.map((t) => {
    const el = document.createElement('div');
    el.className = 'home-tile' + (t.soon ? ' soon' : '');
    const noteSvg = t.notes.map((x, k) => {
      const target = k === Math.floor(t.notes.length / 2);
      const cy = target ? 78 : (k % 2 ? 54 : 66);
      return `<g><ellipse class="n" data-target="${target}" cx="${x}" cy="${cy}" rx="8" ry="5.8" transform="rotate(-20 ${x} ${cy})"/><path class="s" data-target="${target}" d="M${x + 7} ${cy}V${cy - 28}"/></g>`;
    }).join('');
    el.innerHTML = `
      <div><h3>${t.title}</h3><p>${t.desc}</p></div>
      <svg viewBox="0 0 260 104" aria-hidden="true">
        <path d="M6 24H254M6 36H254M6 48H254M6 60H254M6 72H254" stroke="${INK}" stroke-width="1.2" fill="none"/>
        <text x="14" y="70" font-family="Noto Music" font-size="52" fill="${INK}">&#x1D11E;</text>
        ${noteSvg}
      </svg>
      <div class="home-tile-foot">
        <span class="home-tile-msg">${t.soon ? '' : 'Quelle est cette note ?'}</span>
        ${t.soon ? '<span class="home-soon" aria-disabled="true">Bientôt</span>' : '<a href="#" class="home-try">Jouer</a>'}
      </div>`;
    if (!t.soon) {
      el.querySelector('.home-try').addEventListener('click', (e) => {
        e.preventDefault();
        enterApp('ex', t.open);
      });
    }
    tilesEl.appendChild(el);
    return { t, el, msg: el.querySelector('.home-tile-msg'), notes: [...el.querySelectorAll('.n, .s')] };
  });

  let tick = 0;
  function paintTiles() {
    tileViews.forEach(({ t, msg, notes }) => {
      const phase = t.soon ? -1 : (tick + t.offset) % 3;
      const color = phase === 1 ? '#9a938a' : phase === 2 ? '#3f7d52' : INK;
      notes.forEach((n) => {
        const col = t.soon ? SOON_NOTE : (n.dataset.target === 'true' ? color : INK);
        if (n.classList.contains('n')) n.setAttribute('fill', col);
        else { n.setAttribute('stroke', col); n.setAttribute('stroke-width', '1.4'); n.setAttribute('fill', 'none'); }
      });
      if (t.soon) return;
      msg.className = 'home-tile-msg' + (phase === 1 ? ' no' : phase === 2 ? ' ok' : '');
      msg.textContent = phase === 1 ? "Raté. C'était Ré" : phase === 2 ? 'Juste !' : 'Quelle est cette note ?';
    });
  }
  paintTiles();
  // Les aperçus des jeux tournent en boucle, sauf si le visiteur a demandé de réduire les animations.
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) setInterval(() => { tick++; paintTiles(); }, 1800);

  // ----- "Les cours" : bandeau défilant -----
  const COURSES = [
    { title: 'Les clés', desc: "Clé de sol, clé de fa, clé d'ut : lire une portée quelle que soit la clé.", open: { learn: 'clefs' } },
  ];
  const coursesEl = document.getElementById('home-courses');
  COURSES.forEach((c) => {
    const a = document.createElement('a');
    a.href = '#';
    a.className = 'home-course';
    a.innerHTML = `<span class="home-course-kicker">Cours</span><h3>${c.title}</h3><p>${c.desc}</p><span class="home-try">Commencer</span>`;
    a.style.textDecoration = 'none';
    a.style.color = 'inherit';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      enterApp('learn', c.open);
    });
    coursesEl.appendChild(a);
  });

  let seen = false;
  if (REDIRIGER_VISITEURS_REVENANTS) {
    try { seen = !!localStorage.getItem(VISITED_KEY); } catch (e) { /* stockage indisponible : on réaffiche l'accueil */ }
  }
  // Un lien direct vers une page de l'app (#/exercer, #/compte…) n'affiche pas l'accueil.
  if (!seen && (!location.hash.startsWith('#/') || location.hash === '#/accueil')) {
    showHome();
    if (REDIRIGER_VISITEURS_REVENANTS) {
      try { localStorage.setItem(VISITED_KEY, '1'); } catch (e) { /* idem */ }
    }
  }
})();
