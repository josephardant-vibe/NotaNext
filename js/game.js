// Application : navigation (onglets, grille de cartes, pages d'exercice) et logique des exercices.
(function () {
  const { data, staff, scrollStaff, windowStaff, playTone, playNote, instruments, instrumentMenu, theory, listen } = window.Notanext;
  const { CLEFS, clefById, notesOf, FR, ANSWER_ORDER, label, getNotation, setNotation, EXERCISES, LEARN_CARDS, FAQ_QUESTIONS, FAQ_ANSWERS, THEORY_SECTIONS } = data;
  const { renderStaff, eventToStep } = staff;
  const { createScrollStaff, SPEED_LEVELS } = scrollStaff;
  const { createWindowStaff } = windowStaff;

  const SPEED_LABELS = [
    ['debutant', 'Débutant'],
    ['intermediaire', 'Intermédiaire'],
    ['avance', 'Avancé'],
    ['expert', 'Expert'],
  ];

  const CORRECT_PHRASES = ['Bravo !', 'Exactement !', 'Bien vu !', 'Parfait !'];

  // ---------- notes décoratives en fond ----------
  const ICON_CLEF = '<svg viewBox="0 0 60 90" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M30 6 C 44 20, 44 34, 30 46 C 18 56, 14 44, 22 38 C 34 30, 44 44, 34 58 C 26 70, 12 66, 10 54 M30 6 C 22 22, 26 44, 30 60 C 33 74, 30 86, 22 86 C 14 86, 12 78, 18 76"/></svg>';
  const ICON_NOTE = '<svg viewBox="0 0 40 60" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><ellipse cx="13" cy="47" rx="10" ry="7" transform="rotate(-20 13 47)"/><path d="M22 44 V 8 C 30 12, 36 18, 34 28"/></svg>';
  const ICON_QNOTE = '<svg viewBox="0 0 40 60" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><ellipse cx="12" cy="47" rx="10" ry="7" transform="rotate(-20 12 47)"/><path d="M21 44 V 9"/></svg>';
  const BG_ICONS = [ICON_CLEF, ICON_NOTE, ICON_QNOTE, ICON_CLEF, ICON_QNOTE, ICON_NOTE, ICON_QNOTE, ICON_NOTE];
  document.getElementById('bg-icons').innerHTML = BG_ICONS.map((ic, i) => `<span class="bg-icon i${i + 1}">${ic}</span>`).join('');

  // Réglage mobile : true = les jeux s'affichent en paysage (message « Tourne ton téléphone »,
  // puis rotation automatique après 3 s). Passer à false pour désactiver ce comportement.
  const MOBILE_LANDSCAPE = true;
  document.body.classList.toggle('landscape-only', MOBILE_LANDSCAPE);

  const account = window.Notanext.account;

  // ---------- éléments ----------
  const tabEx = document.getElementById('tab-ex');
  const tabLearn = document.getElementById('tab-learn');
  const navLogin = document.getElementById('nav-login');
  const navAccount = document.getElementById('nav-account');
  const viewEx = document.getElementById('view-ex');
  const viewLearn = document.getElementById('view-learn');
  const viewAccount = document.getElementById('view-account');
  const viewProfile = document.getElementById('view-profile');
  const exGrid = document.getElementById('ex-grid');
  const exPage = document.getElementById('ex-page');
  const learnPanel = document.getElementById('learn-panel');
  const learnGrid = document.getElementById('learn-grid');
  const learnPage = document.getElementById('learn-page');
  const gameEl = document.getElementById('game');

  // ---------- header : état visiteur / membre (aperçu) ----------
  navLogin.hidden = account.isMember();
  navAccount.hidden = !account.isMember();

  // ---------- routeur ----------
  // #/exercer, #/exercer/<jeu>, #/apprendre, #/apprendre/<cours>, #/compte, #/profil.
  // Le hash est l'unique source de vérité ; `route()` est idempotente (clé `shown`).
  let shown = null;
  const setHash = (h) => { if (location.hash !== h) location.hash = h; };

  function showView(name) {
    viewEx.hidden = name !== 'ex';
    viewLearn.hidden = name !== 'learn';
    viewAccount.hidden = name !== 'account';
    viewProfile.hidden = name !== 'profile';
    tabEx.classList.toggle('on', name === 'ex');
    tabLearn.classList.toggle('on', name === 'learn');
    navLogin.classList.toggle('on', name === 'account');
    navAccount.classList.toggle('on', name === 'profile');
  }

  function route() {
    const [page, arg] = (location.hash.replace(/^#\/?/, '') || 'exercer').split('/');
    const key = `${page}/${arg || ''}`;
    if (key === shown) return;
    shown = key;
    closeGame();
    if (page === 'compte') return showView('account');
    if (page === 'profil') {
      account.renderProfile(document.getElementById('profile-panel'));
      return showView('profile');
    }
    if (page === 'apprendre') {
      showView('learn');
      if (arg && LEARN_CARDS.some((c) => c.id === arg)) return openLearnCard(arg, true);
      return showLearnGrid(true);
    }
    showView('ex');
    if (arg && EXERCISES.some((e) => e.id === arg)) return openExercise(arg, true);
    showGrid(true);
  }

  // ---------- hubs : grille de tuiles (AppTile), commune à tous les hubs ----------
  const NOTE_ICON = '<svg viewBox="0 0 24 32" width="22" height="30" fill="currentColor" aria-hidden="true"><ellipse cx="8" cy="25" rx="6.5" ry="4.8" transform="rotate(-20 8 25)"/><path d="M13.6 23.2V3" stroke="currentColor" stroke-width="2" fill="none"/></svg>';

  // tiles : [{ title, desc, action, soon? }] ; action = libellé du lien (« Ouvrir », « Commencer »)
  function buildTiles(grid, tiles) {
    grid.innerHTML = '';
    tiles.forEach((t) => {
      const el = document.createElement(t.soon ? 'div' : 'button');
      if (!t.soon) el.type = 'button';
      el.className = 'tile' + (t.soon ? ' soon' : '');
      el.innerHTML = `<span class="tile-icon">${NOTE_ICON}</span><span class="tile-title">${t.title}</span><span class="tile-desc">${t.desc || ''}</span><span class="tile-go">${t.soon ? 'Bientôt' : t.action}</span>`;
      if (!t.soon) el.addEventListener('click', t.onOpen);
      grid.appendChild(el);
    });
  }

  function buildGrid() {
    const tiles = EXERCISES.map((ex) => ({ title: ex.title, desc: ex.tag, action: 'Ouvrir', onOpen: () => openExercise(ex.id) }));
    tiles.push({ title: 'Nouveau jeu', soon: true });
    buildTiles(document.getElementById('card-grid'), tiles);
  }

  function showGrid(fromRoute) {
    closeGame();
    exGrid.hidden = false;
    exPage.hidden = true;
    if (fromRoute !== true) setHash('#/exercer');
    shown = 'exercer/';
  }

  function openExercise(id, fromRoute) {
    exGrid.hidden = true;
    exPage.hidden = true;
    if (fromRoute !== true) setHash(`#/exercer/${id}`);
    shown = `exercer/${id}`;
    mountExercise(EXERCISES.find((e) => e.id === id));
  }

  // "Apprendre" suit le même principe que "S'exercer" : une grille de tuiles,
  // une tuile ouvre une page dédiée. Ajouter une future leçon ne demande
  // qu'une entrée dans LEARN_CARDS + un mount*.
  function buildLearnGrid() {
    const tiles = LEARN_CARDS.map((c) => ({ title: c.title, desc: c.tag, action: 'Commencer', onOpen: () => openLearnCard(c.id) }));
    tiles.push({ title: 'Nouveau cours', soon: true });
    buildTiles(document.getElementById('learn-card-grid'), tiles);
  }

  function showLearnGrid(fromRoute) {
    closeGame();
    learnGrid.hidden = false;
    learnPage.hidden = true;
    learnPanel.classList.remove('wide');
    if (fromRoute !== true) setHash('#/apprendre');
    shown = 'apprendre/';
  }

  function openLearnCard(id, fromRoute) {
    learnGrid.hidden = true;
    learnPage.hidden = false;
    if (fromRoute !== true) setHash(`#/apprendre/${id}`);
    shown = `apprendre/${id}`;
    // "Les clés" reste en deux colonnes (portée + FAQ) ; la théorie est un
    // déroulé plein écran, une section à la fois.
    learnPanel.classList.toggle('wide', id === 'clefs');
    if (id === 'theory') mountTheoryPage();
    else if (id === 'listen') mountListenPage();
    else mountClefsPage();
  }

  // ----- Carte "Les clés" (clé + portée annotée + FAQ, inchangé) -----
  function mountClefsPage() {
    learnPage.innerHTML = `
      <button type="button" class="backbtn" id="learn-back">&#8592; Apprendre</button>
      <div class="learn-layout">
        <div class="learn-left">
          <h2>Les clés</h2>
          <select id="learn-clef" aria-label="Choisir une clé"></select>
          <p class="learn-hint">Clique une note pour l'entendre.</p>
          <div class="learn-staff">
            <svg id="learn-staff" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Portée annotée"></svg>
          </div>
        </div>
        <div class="faq">
          <h3>FAQ</h3>
          <div id="faq-body"></div>
        </div>
      </div>
    `;
    document.getElementById('learn-back').addEventListener('click', showLearnGrid);
    buildLearn();
  }

  // ----- Carte "Théorie de base & notation" -----
  // Déroulé plein écran, une section à la fois : contenu (illustration +
  // texte, son déjà branché par js/theory.js) puis quiz de rappel pour cette
  // section, avant de passer à la suivante. `THEORY_SECTIONS` reste la seule
  // source de vérité (titre, texte, illustration, quiz) ; ce qui suit ne fait
  // que la parcourir pas à pas, une future section n'y change rien.
  function mountTheoryPage() {
    const N = THEORY_SECTIONS.length;
    const TOTAL_STEPS = N * 2; // section i : pas 2i = contenu, 2i+1 = quiz
    let step = 0;

    // Ordre des choix mélangé à chaque démarrage de la leçon (Fisher-Yates),
    // puis figé pendant le parcours pour que "Précédent" retrouve le même quiz.
    const quizzes = THEORY_SECTIONS.map((section) => {
      const { question, options, correctIndex } = section.quiz;
      const order = options.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      return { question, options: order.map((i) => options[i]), correctIndex: order.indexOf(correctIndex) };
    });
    const chosen = new Array(N).fill(null); // choix déjà fait par quiz (index affiché)
    const score = () => quizzes.filter((q, i) => chosen[i] === q.correctIndex).length;

    learnPage.innerHTML = `
      <div class="theory-run">
        <div class="theory-run-top" id="theory-run-top"></div>
        <div class="theory-run-body" id="theory-run-body"></div>
      </div>
    `;
    const topEl = document.getElementById('theory-run-top');
    const bodyEl = document.getElementById('theory-run-body');

    function renderTop(label) {
      const pct = Math.round((Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100);
      topEl.innerHTML = `
        <button type="button" class="backbtn" id="theory-exit">&#8592; Apprendre</button>
        <div class="theory-progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
          <div class="theory-progress-fill" style="width:${pct}%"></div>
        </div>
        ${label ? `<span class="theory-step-label">${label}</span>` : ''}
      `;
      document.getElementById('theory-exit').addEventListener('click', showLearnGrid);
    }

    function goNext() {
      step++;
      render();
    }

    function goPrev() {
      step--;
      render();
    }

    const prevButton = () => (step > 0 ? '<button type="button" class="btn-secondary" id="theory-prev">&#8592; Précédent</button>' : '');
    function bindPrev() {
      const btn = document.getElementById('theory-prev');
      if (btn) btn.addEventListener('click', goPrev);
    }

    function render() {
      if (step >= TOTAL_STEPS) return renderRecap();
      const sectionIndex = Math.floor(step / 2);
      const isQuiz = step % 2 === 1;
      const section = THEORY_SECTIONS[sectionIndex];
      renderTop(`${isQuiz ? 'Quiz' : 'Section'} ${sectionIndex + 1} sur ${N}`);
      if (isQuiz) renderQuiz(section, sectionIndex);
      else renderContent(section);
    }

    function renderContent(section) {
      bodyEl.innerHTML = `
        <div class="theory-screen theory-content" id="theory-illustration">
          <div class="theory-run-icon">${theory.renderIcon(section.illustration)}</div>
          <h2>${section.title}</h2>
          <p>${section.text}</p>
          <div class="theory-actions">
            ${theory.renderListen(section.illustration)}
          </div>
          <div class="theory-nav">
            ${prevButton()}
            <button type="button" class="btn-primary" id="theory-next">Suivant &#8594;</button>
          </div>
        </div>
      `;
      theory.mount(document.getElementById('theory-illustration'), section.illustration);
      document.getElementById('theory-next').addEventListener('click', goNext);
      bindPrev();
    }

    function renderQuiz(section, sectionIndex) {
      const { question, options, correctIndex } = quizzes[sectionIndex];
      bodyEl.innerHTML = `
        <div class="theory-screen theory-quiz">
          <h2>${question}</h2>
          <div class="quiz-options">
            ${options.map((opt, i) => `<button type="button" class="quiz-option" data-i="${i}">${opt}</button>`).join('')}
          </div>
          <div class="quiz-explain" id="quiz-explain" hidden>
            <p></p>
          </div>
          <div class="theory-nav">
            ${prevButton()}
            <button type="button" class="btn-primary" id="theory-next" hidden>Suivant &#8594;</button>
          </div>
        </div>
      `;
      const optionBtns = Array.from(bodyEl.querySelectorAll('.quiz-option'));
      const explain = document.getElementById('quiz-explain');
      const nextBtn = document.getElementById('theory-next');
      nextBtn.addEventListener('click', goNext);
      bindPrev();

      // Affiche le résultat (aussi utilisé en revenant sur un quiz déjà répondu).
      function showResult(pick) {
        optionBtns.forEach((b, i) => {
          b.disabled = true;
          if (i === correctIndex) b.classList.add('correct');
          else if (i === pick) b.classList.add('wrong');
        });
        // Explication : le texte déjà écrit pour cette notion, façon code de la route.
        explain.querySelector('p').textContent = section.text;
        explain.hidden = false;
        nextBtn.hidden = false;
      }

      if (chosen[sectionIndex] != null) return showResult(chosen[sectionIndex]);

      optionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          chosen[sectionIndex] = Number(btn.dataset.i);
          showResult(chosen[sectionIndex]);
        }, { once: true });
      });
    }

    function renderRecap() {
      topEl.innerHTML = '<button type="button" class="backbtn" id="theory-exit">&#8592; Apprendre</button>';
      document.getElementById('theory-exit').addEventListener('click', showLearnGrid);
      bodyEl.innerHTML = `
        <div class="theory-screen theory-recap">
          <h2>Récap</h2>
          <p class="theory-recap-score">${score()} / ${N}</p>
          <p>Bonnes réponses au quiz de rappel.</p>
          <div class="theory-nav">
            ${prevButton()}
            <button type="button" class="btn-primary" id="theory-finish">Retour à Apprendre</button>
          </div>
        </div>
      `;
      document.getElementById('theory-finish').addEventListener('click', showLearnGrid);
      bindPrev();
    }

    render();
  }

  // ----- Carte "Les bases : écoute et ressens" -----
  // Hub de 5 mini-jeux d'écoute (js/listen.js, tuiles comme les autres hubs), puis
  // chaque jeu s'ouvre dans le cadre de jeu commun : le son se joue tout seul,
  // feedback immédiat, "Suivant" tire la suivante.
  function mountListenPage() {
    learnPage.innerHTML = `
      <div class="ex-top">
        <button type="button" class="backbtn" id="listen-back">&#8592; Apprendre</button>
        <span class="ex-title">Écoute et ressens</span>
        <span></span>
      </div>
      <div class="grid" id="listen-grid"></div>
    `;
    document.getElementById('listen-back').addEventListener('click', () => showLearnGrid());
    buildTiles(document.getElementById('listen-grid'), listen.GAMES.map((g) => ({
      title: g.title, action: 'Jouer', onOpen: () => startListenGame(g),
    })));
  }

  function startListenGame(game) {
    const frame = openFrame({
      title: game.title,
      replay: 'stage',
      answersHtml: game.options.map((o) => `<button type="button" class="quiz-option" data-id="${o.id}">${o.label}</button>`).join(''),
      showNext: true,
      onBack: () => closeGame(),
    });
    let q = null;
    const answerBtns = Array.from(frame.answers.querySelectorAll('.quiz-option'));

    function nextQuestion() {
      q = game.next();
      answerBtns.forEach((b) => { b.disabled = false; b.className = 'quiz-option'; });
      frame.setFeedback('');
      frame.next.hidden = true;
      q.play();
    }

    answerBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const ok = btn.dataset.id === q.answer;
        answerBtns.forEach((b) => {
          b.disabled = true;
          if (b.dataset.id === q.answer) b.classList.add('correct');
          else if (b === btn) b.classList.add('wrong');
        });
        if (ok) frame.setFeedback(CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)], 'correct');
        else frame.setFeedback(`C'était <b>${game.options.find((o) => o.id === q.answer).label}</b>`);
        frame.next.hidden = false;
        frame.session.record(ok);
      });
    });

    frame.replay.addEventListener('click', () => q && q.play());
    frame.next.addEventListener('click', nextQuestion);
    nextQuestion();
  }

  // ---------- cadre de jeu (commun à tous les jeux) ----------
  // Une carte sous le header (le logo NotaNext reste accessible) : retour, compteur
  // « bonnes réponses / total » en haut à droite, réglages propres au jeu, zone
  // portée (ou zone d'écoute), ligne de feedback, zone de réponse. Sans fin : pas de
  // manches tant qu'il n'y a pas de comptes.
  let activeGame = null; // { destroy() } du jeu actuellement affiché

  // ----- orientation (téléphone) : les jeux se jouent en paysage -----
  // Téléphone tenu en portrait : message « Tourne ton téléphone » pendant 3 s, puis le
  // jeu se tourne tout seul en paysage. Le bouton de rotation bascule paysage <-> portrait.
  // Les cours n'utilisent rien de tout cela. Désactivable avec MOBILE_LANDSCAPE.
  const HINT_MS = 3000;
  const isPhone = () => Math.min(window.innerWidth, window.innerHeight) <= 500;
  let orient = null;        // null = automatique ; 'landscape' | 'portrait' = choix du joueur
  let hintPending = false;
  let hintTimer = null;

  function applyOrientation() {
    document.body.classList.toggle('is-phone', isPhone());
    gameEl.classList.remove('rot-cw', 'rot-ccw', 'show-hint');
    document.body.classList.remove('game-rotated');
    if (gameEl.hidden || !MOBILE_LANDSCAPE || !isPhone()) return;
    const devicePortrait = window.innerHeight > window.innerWidth;
    if (hintPending && !devicePortrait) { hintPending = false; clearTimeout(hintTimer); }
    if (hintPending) { gameEl.classList.add('show-hint'); return; }
    const want = orient || 'landscape';
    const rot = want === 'landscape' && devicePortrait ? 'rot-cw' : want === 'portrait' && !devicePortrait ? 'rot-ccw' : null;
    if (rot) {
      gameEl.classList.add(rot);
      document.body.classList.add('game-rotated');
    }
  }

  function refreshLayout() {
    applyOrientation();
    window.dispatchEvent(new Event('resize')); // les portées recalculent leur largeur
  }

  function toggleOrientation() {
    const portraitNow = gameEl.classList.contains('rot-ccw') || (!gameEl.classList.contains('rot-cw') && window.innerHeight > window.innerWidth);
    orient = portraitNow ? 'landscape' : 'portrait';
    hintPending = false;
    clearTimeout(hintTimer);
    refreshLayout();
  }

  window.addEventListener('resize', () => { if (!gameEl.hidden) applyOrientation(); });
  window.addEventListener('orientationchange', () => { if (!gameEl.hidden) refreshLayout(); });

  function closeGame() {
    if (activeGame && activeGame.destroy) activeGame.destroy();
    activeGame = null;
    activeAnswers = null;
    setPanelPause(null);
    clearTimeout(hintTimer);
    hintPending = false;
    orient = null;
    gameEl.hidden = true;
    gameEl.innerHTML = '';
    gameEl.classList.remove('rot-cw', 'rot-ccw', 'show-hint');
    document.body.classList.remove('in-game', 'game-rotated');
  }

  // opts : title, config (HTML des réglages), stageHtml, answersHtml, replay ('config' | 'stage' | null),
  // showNext, onBack. Renvoie le cadre ; `frame.session.record(ok)` met à jour le compteur.
  function openFrame(opts) {
    closeGame();
    document.body.classList.add('in-game');
    gameEl.hidden = false;
    gameEl.innerHTML = `
      <div class="gf ${opts.cls || ''}">
        <div class="gf-top">
          <button type="button" class="backbtn" id="back">&#8592; Retour</button>
          <span class="gf-title">${opts.title}</span>
          <span class="gf-right">
            <button type="button" class="gf-rotate-btn" id="gf-rotate-btn" aria-label="Changer l'orientation du jeu" title="Changer l'orientation du jeu"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="14" rx="1.8"/><path d="M5 20.5h14M17 18.5l2 2-2 2" transform="translate(0 -2)"/></svg></button>
            <span class="gf-count" id="gf-count" aria-live="polite" title="Bonnes réponses / réponses totales"></span>
          </span>
        </div>
        <div class="gf-config">
          ${opts.config || ''}
          ${opts.replay === 'config' ? '<button type="button" class="replay" id="replay">&#9654; Réécouter</button>' : ''}
          ${opts.configAfter || ''}
        </div>
        <div class="gf-stage" id="gf-stage">
          ${opts.replay === 'stage' ? '<button type="button" class="replay big" id="replay">&#9654; Réécouter</button>' : ''}
          ${opts.stageHtml || ''}
        </div>
        <p class="feedback gf-feedback" id="feedback" aria-live="polite">&nbsp;</p>
        <div class="gf-next"><button type="button" class="btn-primary" id="gf-next" hidden>Suivant &#8594;</button></div>
        <div class="gf-answers" id="answers">${opts.answersHtml || ''}</div>
      </div>
      <div class="gf-hint" role="status">
        <button type="button" class="backbtn" id="hint-back">&#8592; Retour</button>
        <div class="gf-hint-body">
          <svg class="gf-hint-icon" width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="22" y="10" width="20" height="34" rx="4"/><path d="M30 38h4"/><path d="M50 22a20 20 0 0 1 0 24M50 46l-1.5-6M50 46l6-1"/></svg>
          <h2>Tourne ton téléphone à l'horizontale</h2>
          <p>Le jeu passera en horizontal dans quelques secondes.</p>
        </div>
      </div>
    `;
    const q = (id) => document.getElementById(id);
    const frame = {
      root: gameEl.querySelector('.gf'),
      stage: q('gf-stage'),
      answers: q('answers'),
      replay: q('replay'),
      next: q('gf-next'),
      feedbackEl: q('feedback'),
      setFeedback(html, cls) {
        frame.feedbackEl.innerHTML = html || '&nbsp;';
        frame.feedbackEl.className = 'feedback gf-feedback' + (cls ? ' ' + cls : '');
      },
      setDestroy(fn) { activeGame = { destroy: fn }; },
    };
    q('back').addEventListener('click', opts.onBack);
    q('hint-back').addEventListener('click', opts.onBack);
    q('gf-rotate-btn').addEventListener('click', toggleOrientation);

    // ----- compteur : bonnes réponses / total -----
    const countEl = q('gf-count');
    let good = 0, total = 0;
    const paint = () => { countEl.textContent = `${good} / ${total}`; };
    frame.session = {
      record(ok) { total++; if (ok) good++; paint(); },
    };
    paint();
    activeGame = { destroy: null };
    frame.setDestroy = (fn) => { activeGame.destroy = fn; };

    // ----- orientation : message 3 s puis rotation automatique (téléphone en portrait) -----
    orient = null;
    hintPending = MOBILE_LANDSCAPE && isPhone() && window.innerHeight > window.innerWidth;
    if (hintPending) {
      hintTimer = setTimeout(() => { hintPending = false; refreshLayout(); }, HINT_MS);
    }
    applyOrientation();
    return frame;
  }

  function setTab(name) {
    if (name === 'ex') { showView('ex'); showGrid(); }
    else { showView('learn'); showLearnGrid(); }
  }

  window.Notanext.app = { setTab, openExercise, openLearnCard, closeGame };

  // Boîte à outils pour les jeux écrits dans d'autres fichiers (js/ear.js).
  const kit = {
    openFrame,
    showGrid: () => showGrid(),
    CORRECT_PHRASES,
    setActiveAnswers(map) { activeAnswers = map; refreshKeyHints(); },
  };

  tabEx.addEventListener('click', () => setTab('ex'));
  tabLearn.addEventListener('click', () => setTab('learn'));
  navLogin.addEventListener('click', () => setHash('#/compte'));
  navAccount.addEventListener('click', () => setHash('#/profil'));
  window.addEventListener('hashchange', route);

  // ---------- clavier (global) ----------
  // Une seule configuration (note -> touche), stockée dans le navigateur, partagée
  // par tous les jeux à boutons de réponse Do–Si. `activeAnswers` = les boutons du
  // jeu actuellement affiché (aucun pour "Placer la note", qui n'a pas de boutons).
  const KEYS_STORAGE = 'notanext.keys';
  let keys = {};
  try { keys = JSON.parse(localStorage.getItem(KEYS_STORAGE)) || {}; } catch (e) { keys = {}; }
  const saveKeys = () => {
    try { localStorage.setItem(KEYS_STORAGE, JSON.stringify(keys)); } catch (e) { /* stockage indisponible : réglage valable pour la session */ }
  };
  let activeAnswers = null;
  let capturing = false;
  let pauseHook = null; // le défilement continu se met en pause pendant que le panneau est ouvert
  const setPanelPause = (fn) => { pauseHook = fn; };

  function refreshKeyHints() {
    if (!activeAnswers) return;
    FR.forEach((name) => {
      const hint = activeAnswers[name].querySelector('.key-hint');
      if (hint) hint.textContent = keys[name] ? keys[name].toUpperCase() : '';
    });
  }

  // Changement de notation : boutons de réponse et repères de « Les clés » se mettent à jour.
  window.addEventListener('notanext:notation', () => {
    if (activeAnswers) {
      FR.forEach((n) => { const el = activeAnswers[n] && activeAnswers[n].querySelector('.ans-name'); if (el) el.textContent = label(n); });
    }
    if (document.getElementById('learn-staff') && !learnPage.hidden) drawLearn();
  });

  // Appuyer sur la touche associée = cliquer sur le bouton de réponse correspondant.
  document.addEventListener('keydown', (e) => {
    if (capturing || !activeAnswers || gameEl.hidden) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return;
    const name = FR.find((n) => keys[n] === e.key.toLowerCase());
    if (!name) return;
    e.preventDefault();
    activeAnswers[name].click();
  });

  // Remplissage automatique : la lettre de la note anglaise (c d e f g a b), quelle que soit la notation affichée.
  const AUTO_KEYS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

  // Page « Clavier » : même carte que les jeux (bouton Retour en haut), par-dessus l'écran.
  function openKeyPanel() {
    if (document.querySelector('.kbd-overlay')) return;
    if (pauseHook) pauseHook(true);
    const overlay = document.createElement('div');
    overlay.className = 'kbd-overlay';
    overlay.innerHTML = `
      <div class="bg" aria-hidden="true"></div>
      <div class="gf kbd-card">
        <div class="gf-top">
          <button type="button" class="backbtn" id="kbd-done">&#8592; Retour</button>
          <span class="gf-title">Clavier</span>
          <span class="gf-right"></span>
        </div>
        <div class="kbd-panel">
          <div class="seg-wrap">
            <span class="seg-label">Notation</span>
            <div class="seg" role="group" aria-label="Notation">
              <button type="button" class="seg-btn" data-notation="fr">Français</button>
              <button type="button" class="seg-btn" data-notation="en">Anglais</button>
            </div>
          </div>
          <p>Clique une note, puis appuie sur la touche de ton choix. Valable pour tous les jeux à boutons.</p>
          <div class="kbd-rows">
            ${FR.map((n) => `<div class="kbd-row"><span class="kbd-name" data-note="${n}"></span><button type="button" class="kbd-key" data-note="${n}"></button></div>`).join('')}
          </div>
          <div class="theory-nav">
            <button type="button" class="btn-secondary" id="kbd-reset">Tout effacer</button>
            <button type="button" class="btn-secondary" id="kbd-auto">Remplir automatiquement</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const keyBtns = Array.from(overlay.querySelectorAll('.kbd-key'));
    const nameEls = Array.from(overlay.querySelectorAll('.kbd-name'));
    const segBtns = Array.from(overlay.querySelectorAll('.seg-btn'));
    let waiting = null;

    function paint() {
      segBtns.forEach((b) => b.classList.toggle('on', b.dataset.notation === getNotation()));
      nameEls.forEach((el) => { el.textContent = label(el.dataset.note); });
      keyBtns.forEach((b) => {
        const active = b === waiting;
        b.classList.toggle('waiting', active);
        const k = keys[b.dataset.note];
        b.textContent = active ? 'Appuie sur une touche…' : (k ? k.toUpperCase() : '—');
      });
    }

    const onCapture = (e) => {
      if (!waiting) return;
      e.preventDefault();
      e.stopPropagation();
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Dead'].includes(e.key)) return;
      if (e.key !== 'Escape') {
        const k = e.key.toLowerCase();
        FR.forEach((n) => { if (keys[n] === k) delete keys[n]; }); // une touche = une seule note
        keys[waiting.dataset.note] = k;
        saveKeys();
        refreshKeyHints();
      }
      waiting = null;
      capturing = false;
      paint();
    };
    document.addEventListener('keydown', onCapture, true);
    capturing = false;

    keyBtns.forEach((b) => b.addEventListener('click', () => {
      waiting = b;
      capturing = true;
      paint();
    }));
    segBtns.forEach((b) => b.addEventListener('click', () => {
      setNotation(b.dataset.notation);
      paint();
    }));
    overlay.querySelector('#kbd-reset').addEventListener('click', () => {
      keys = {};
      saveKeys();
      refreshKeyHints();
      paint();
    });
    overlay.querySelector('#kbd-auto').addEventListener('click', () => {
      keys = {};
      FR.forEach((n, i) => { keys[n] = AUTO_KEYS[i]; });
      waiting = null;
      capturing = false;
      saveKeys();
      refreshKeyHints();
      paint();
    });
    overlay.querySelector('#kbd-done').addEventListener('click', () => {
      document.removeEventListener('keydown', onCapture, true);
      capturing = false;
      overlay.remove();
      if (pauseHook) pauseHook(false);
    });
    paint();
  }
  document.getElementById('nav-kbd').addEventListener('click', openKeyPanel);

  // ---------- exercice ----------
  function mountExercise(ex) {
    if (ex.mode === 'ear-guess') return window.Notanext.ear.mountGuess(ex, kit);
    if (ex.mode === 'ear-place') return window.Notanext.ear.mountPlace(ex, kit);
    let clefId = 'sol';
    const isPlace = ex.mode === 'place';
    const frame = openFrame({
      title: ex.title,
      config: `
        ${isPlace ? '<div class="namebox" id="namebox">–</div>' : ''}
        ${ex.mode === 'guess-scroll' ? `<select id="speed-sel" aria-label="Choisir une vitesse">${SPEED_LABELS.map(([v, label]) => `<option value="${v}"${v === 'intermediaire' ? ' selected' : ''}>${label}</option>`).join('')}</select>` : ''}`,
      replay: 'config',
      configAfter: `${instrumentMenu.html()}<span class="inst-note" id="inst-note" hidden></span>`,
      // Le sélecteur de clé est à gauche de la portée, centré en hauteur.
      stageHtml: `<div class="stage-row"><div class="clef-side"><select id="clef-sel" aria-label="Choisir une clé">${CLEFS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></div><div class="staff-box"><svg class="staff-svg" id="staff" role="img" aria-label="Portée"></svg></div></div>`,
      // Placer la note n'a pas de boutons : on réserve leur place pour que la portée ait exactement la même taille que dans les autres jeux.
      answersHtml: isPlace ? ANSWER_ORDER.map(() => '<span class="answer-btn spacer" aria-hidden="true">&nbsp;</span>').join('') : '',
      onBack: () => showGrid(),
    });
    const { session } = frame;

    const svg = document.getElementById('staff');
    const clef = () => clefById(clefId);

    function markCorrect() {
      frame.setFeedback(CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)], 'correct');
      session.record(true);
    }

    function markWrong(correctName) {
      frame.setFeedback(`C'était <b>${label(correctName)}</b>`);
      session.record(false);
    }

    const tone = (note) => playNote(note.freq);

    let controller;
    if (ex.mode === 'guess-scroll') controller = mountGuessScroll(svg, clef, markCorrect, markWrong);
    else if (ex.mode === 'guess-window') controller = mountGuessWindow(svg, clef, markCorrect, markWrong);
    else controller = mountPlace(svg, clef, markCorrect, markWrong);

    // Menu d'instrument + avertissement si certaines notes de la clé sont jouées à l'octave.
    const unmountMenu = instrumentMenu.mount(frame.root);
    const noteEl = document.getElementById('inst-note');
    function paintFoldNote() {
      const fold = instruments.needsFold(instruments.get(), notesOf(clef()).map((n) => n.freq));
      noteEl.hidden = !fold;
      noteEl.textContent = fold ? 'Notes hors tessiture jouées à l\'octave' : '';
      noteEl.title = fold ? 'Cet instrument ne couvre pas toute la clé : les notes trop graves ou trop aiguës sont jouées une octave plus haut ou plus bas.' : '';
    }
    window.addEventListener('notanext:instrument', paintFoldNote);
    instruments.load(instruments.get()).catch(() => {});
    paintFoldNote();

    frame.setDestroy(() => {
      unmountMenu();
      window.removeEventListener('notanext:instrument', paintFoldNote);
      if (controller.destroy) controller.destroy();
    });
    frame.replay.addEventListener('click', () => {
      const note = controller.currentNote();
      if (note) playNote(note.freq);
    });
    document.getElementById('clef-sel').addEventListener('change', (e) => {
      clefId = e.target.value;
      paintFoldNote();
      controller.onClefChange();
    });
    const speedSel = document.getElementById('speed-sel');
    if (speedSel) {
      speedSel.addEventListener('change', (e) => controller.onSpeedChange(e.target.value));
    }

    // ----- Deviner la note - défilement continu -----
    function mountGuessScroll(svgEl, clefFn, onGood, onBad) {
      buildAnswerButtons((name) => {
        const current = scroll.currentNote();
        if (!current) return;
        const ok = name === current.name;
        scroll.answer(ok, current.name);
        if (ok) onGood();
        else onBad(current.name);
      });

      // Le clavier (touches personnalisées) est global : voir « Clavier » plus bas.
      setPanelPause((paused) => scroll.setPaused(paused));

      const pickNote = () => {
        const notes = notesOf(clefFn());
        return notes[Math.floor(Math.random() * notes.length)];
      };

      const scroll = createScrollStaff(svgEl, {
        clef: clefFn(),
        pickNote,
        onDue: tone,
        // Une note qui dépasse le repère sans réponse compte comme une erreur,
        // exactement comme une mauvaise réponse donnée à temps.
        onMiss: (name) => onBad(name),
        initialSpeed: SPEED_LEVELS.intermediaire,
      });

      return {
        currentNote: () => scroll.currentNote(),
        onClefChange: () => scroll.setClef(clefFn()),
        onSpeedChange: (level) => scroll.setSpeed(SPEED_LEVELS[level]),
        destroy: () => {
          setPanelPause(null);
          scroll.destroy();
        },
      };
    }

    // ----- Deviner la note : fenêtre glissante de 3 notes -----
    function mountGuessWindow(svgEl, clefFn, onGood, onBad) {
      buildAnswerButtons((name) => {
        const current = win.currentNote();
        if (!current) return;
        const ok = name === current.name;
        win.answer(ok, current.name);
        if (ok) onGood();
        else onBad(current.name);
      });

      const pickNote = () => {
        const notes = notesOf(clefFn());
        return notes[Math.floor(Math.random() * notes.length)];
      };

      const win = createWindowStaff(svgEl, {
        clef: clefFn(),
        pickNote,
        onDue: tone,
      });

      return {
        currentNote: () => win.currentNote(),
        onClefChange: () => win.setClef(clefFn()),
        destroy: () => win.destroy(),
      };
    }

    function buildAnswerButtons(onAnswer) {
      const answers = frame.answers;
      const byName = {};
      ANSWER_ORDER.forEach((name) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'answer-btn';
        btn.dataset.note = name;
        btn.innerHTML = `<span class="ans-name">${label(name)}</span><span class="key-hint"></span>`;
        btn.addEventListener('click', () => onAnswer(name));
        answers.appendChild(btn);
        byName[name] = btn;
      });
      activeAnswers = byName;
      refreshKeyHints();
      return byName;
    }

    // ----- Placer la note : clic sur la portée (inchangé) -----
    function mountPlace(svgEl, clefFn, onGood, onBad) {
      const nameBox = document.getElementById('namebox');
      let current = null;
      let locked = false;
      let hoverStep = null; // dernier pas affiché par l'indice de survol
      let dead = false;

      function next() {
        if (dead) return;
        locked = false;
        hoverStep = null;
        const notes = notesOf(clefFn());
        current = notes[Math.floor(Math.random() * notes.length)];
        frame.setFeedback('');
        nameBox.textContent = label(current.name);
        svgEl.classList.add('placing');
        renderStaff(svgEl, { wide: true, clef: clefFn() });
        playNote(current.freq);
      }

      svgEl.addEventListener('mousemove', (e) => {
        if (locked) return;
        hoverStep = eventToStep(svgEl, e.clientY, e.clientX);
        renderStaff(svgEl, { wide: true, clef: clefFn(), ghostStep: hoverStep });
      });
      svgEl.addEventListener('mouseleave', () => {
        hoverStep = null;
        if (!locked) renderStaff(svgEl, { wide: true, clef: clefFn() });
      });
      svgEl.addEventListener('click', (e) => {
        if (locked) return;
        locked = true;
        // Toujours placer exactement là où l'indice en pointillés était affiché,
        // plutôt que de recalculer une position potentiellement différente au clic.
        const step = hoverStep != null ? hoverStep : eventToStep(svgEl, e.clientY, e.clientX);
        // Un même nom peut exister à plusieurs positions dans la plage affichée
        // (ex. Do sous la portée et Do au 3e interligne) : toutes comptent comme bonnes.
        const correctSteps = notesOf(clefFn())
          .filter((n) => n.name === current.name)
          .map((n) => n.step);
        const ok = correctSteps.includes(step);
        renderStaff(svgEl, {
          wide: true,
          clef: clefFn(),
          reveal: { correctSteps, correctName: current.name, clickedStep: step, ok },
        });
        if (ok) {
          onGood();
          setTimeout(next, 900);
        } else {
          onBad(current.name);
          setTimeout(next, 1200);
        }
      });

      // Changement de notation en cours de partie : le nom demandé se met à jour.
      const onNotation = () => { if (current) nameBox.textContent = label(current.name); };
      window.addEventListener('notanext:notation', onNotation);

      // Rotation / redimensionnement : la portée se redessine à la nouvelle largeur.
      const onResize = () => { if (!locked) renderStaff(svgEl, { wide: true, clef: clefFn() }); };
      window.addEventListener('resize', onResize);

      next();

      return {
        currentNote: () => current,
        onClefChange: next,
        destroy: () => { dead = true; window.removeEventListener('resize', onResize); window.removeEventListener('notanext:notation', onNotation); },
      };
    }
  }

  // ---------- apprendre ----------
  function buildLearn() {
    const sel = document.getElementById('learn-clef');
    if (!sel.options.length) {
      sel.innerHTML = CLEFS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
      sel.addEventListener('change', drawLearn);
    }
    drawLearn();
  }

  function drawLearn() {
    const id = document.getElementById('learn-clef').value || 'sol';
    const clef = clefById(id);
    renderStaff(document.getElementById('learn-staff'), {
      clef,
      labels: notesOf(clef),
      onNoteClick: (note) => playTone(note.freq),
    });
    document.getElementById('faq-body').innerHTML = FAQ_QUESTIONS.map(
      (q, i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${FAQ_ANSWERS[id][i]}</p></details>`
    ).join('');
  }

  buildGrid();
  buildLearnGrid();
  route();
})();
