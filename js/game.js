// Application : navigation (onglets, grille de cartes, pages d'exercice) et logique des exercices.
(function () {
  const { data, staff, scrollStaff, windowStaff, playTone, theory, listen } = window.Notanext;
  const { CLEFS, clefById, notesOf, FR, EXERCISES, LEARN_CARDS, FAQ_QUESTIONS, FAQ_ANSWERS, THEORY_SECTIONS } = data;
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

  // ---------- éléments ----------
  const tabEx = document.getElementById('tab-ex');
  const tabLearn = document.getElementById('tab-learn');
  const viewEx = document.getElementById('view-ex');
  const viewLearn = document.getElementById('view-learn');
  const exGrid = document.getElementById('ex-grid');
  const exPage = document.getElementById('ex-page');
  const exPanel = document.getElementById('ex-panel');
  const learnPanel = document.getElementById('learn-panel');
  const learnGrid = document.getElementById('learn-grid');
  const learnPage = document.getElementById('learn-page');

  // ---------- routeur (générique, indépendant du contenu des exercices) ----------
  function buildGrid() {
    const grid = document.getElementById('card-grid');
    grid.innerHTML = '';
    EXERCISES.forEach((ex) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card';
      btn.innerHTML = `<div class="card-cover">${ex.icon}</div><div class="card-body"><p class="card-title">${ex.title}</p><p class="card-tag">${ex.tag}</p></div>`;
      btn.addEventListener('click', () => openExercise(ex.id));
      grid.appendChild(btn);
    });
  }

  function showGrid() {
    exGrid.hidden = false;
    exPage.hidden = true;
  }

  function openExercise(id) {
    exGrid.hidden = true;
    exPage.hidden = false;
    mountExercise(EXERCISES.find((e) => e.id === id));
  }

  // "Apprendre" suit exactement le même principe que "S'exercer" : une grille
  // de cartes, une carte ouvre une page dédiée avec un bouton retour. Ajouter
  // une future leçon ne demande qu'une entrée dans LEARN_CARDS + un mount*.
  function buildLearnGrid() {
    const grid = document.getElementById('learn-card-grid');
    if (grid.childElementCount) return;
    LEARN_CARDS.forEach((c) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'card';
      btn.innerHTML = `<div class="card-cover">${c.icon}</div><div class="card-body"><p class="card-title">${c.title}</p><p class="card-tag">${c.tag}</p></div>`;
      btn.addEventListener('click', () => openLearnCard(c.id));
      grid.appendChild(btn);
    });
  }

  function showLearnGrid() {
    learnGrid.hidden = false;
    learnPage.hidden = true;
    learnPanel.classList.remove('wide');
  }

  function openLearnCard(id) {
    learnGrid.hidden = true;
    learnPage.hidden = false;
    // "Les clés" reste en deux colonnes (portée + FAQ) ; la théorie est un
    // déroulé plein écran, une section à la fois, plus à l'aise en largeur
    // standard (comme les pages d'exercice) qu'en panneau large.
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
            <button type="button" class="train-btn" disabled title="Bientôt disponible">S'entraîner sur ce thème</button>
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
  // Menu de 5 mini-jeux d'écoute (js/listen.js) puis une question à la fois :
  // le son se joue tout seul, feedback immédiat, "Suivant" tire la suivante.
  function mountListenPage() {
    function showMenu() {
      learnPage.innerHTML = `
        <div class="ex-top">
          <button type="button" class="backbtn" id="listen-back">&#8592; Apprendre</button>
          <span class="ex-title">Écoute et ressens</span>
          <span></span>
        </div>
        <div class="listen-menu">
          ${listen.GAMES.map((g) => `<button type="button" class="quiz-option" data-id="${g.id}">${g.title}</button>`).join('')}
        </div>
      `;
      document.getElementById('listen-back').addEventListener('click', showLearnGrid);
      learnPage.querySelectorAll('.listen-menu .quiz-option').forEach((btn) => {
        btn.addEventListener('click', () => startGame(listen.GAMES.find((g) => g.id === btn.dataset.id)));
      });
    }

    function startGame(game) {
      let score = 0;
      let q = null;
      learnPage.innerHTML = `
        <div class="ex-top">
          <button type="button" class="backbtn" id="listen-back">&#8592; Écoute</button>
          <span class="ex-title">${game.title}</span>
          <span class="ex-score" id="listen-score">0</span>
        </div>
        <div class="theory-screen listen-screen">
          <button type="button" class="replay" id="listen-replay">&#9654; Réécouter</button>
          <div class="listen-answers">
            ${game.options.map((o) => `<button type="button" class="quiz-option" data-id="${o.id}">${o.label}</button>`).join('')}
          </div>
          <span class="feedback" id="listen-feedback" aria-live="polite">&nbsp;</span>
          <button type="button" class="btn-primary" id="listen-next" hidden>Suivant &#8594;</button>
        </div>
      `;
      const answerBtns = Array.from(learnPage.querySelectorAll('.listen-answers .quiz-option'));
      const feedback = document.getElementById('listen-feedback');
      const nextBtn = document.getElementById('listen-next');
      const scoreEl = document.getElementById('listen-score');

      function nextQuestion() {
        q = game.next();
        answerBtns.forEach((b) => { b.disabled = false; b.className = 'quiz-option'; });
        feedback.innerHTML = '&nbsp;';
        feedback.className = 'feedback';
        nextBtn.hidden = true;
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
          if (ok) {
            score++;
            scoreEl.textContent = score;
            feedback.textContent = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)];
            feedback.className = 'feedback correct';
          } else {
            const label = game.options.find((o) => o.id === q.answer).label;
            feedback.innerHTML = `C'était <b>${label}</b>`;
            feedback.className = 'feedback';
          }
          nextBtn.hidden = false;
        });
      });

      document.getElementById('listen-replay').addEventListener('click', () => q && q.play());
      nextBtn.addEventListener('click', nextQuestion);
      document.getElementById('listen-back').addEventListener('click', showMenu);
      nextQuestion();
    }

    showMenu();
  }

  function setTab(name) {
    const isEx = name === 'ex';
    tabEx.classList.toggle('on', isEx);
    tabLearn.classList.toggle('on', !isEx);
    viewEx.hidden = !isEx;
    viewLearn.hidden = isEx;
    if (isEx) showGrid();
    else showLearnGrid();
  }

  window.Notanext.app = { setTab };

  tabEx.addEventListener('click', () => setTab('ex'));
  tabLearn.addEventListener('click', () => setTab('learn'));

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

  // Appuyer sur la touche associée = cliquer sur le bouton de réponse correspondant.
  document.addEventListener('keydown', (e) => {
    if (capturing || !activeAnswers || viewEx.hidden || exPage.hidden) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return;
    const name = FR.find((n) => keys[n] === e.key.toLowerCase());
    if (!name) return;
    e.preventDefault();
    activeAnswers[name].click();
  });

  function openKeyPanel() {
    if (document.querySelector('.kbd-overlay')) return;
    if (pauseHook) pauseHook(true);
    const overlay = document.createElement('div');
    overlay.className = 'kbd-overlay';
    overlay.innerHTML = `
      <div class="kbd-panel">
        <h2>Clavier</h2>
        <p>Clique une note, puis appuie sur la touche de ton choix. Valable pour tous les jeux à boutons.</p>
        <div class="kbd-rows">
          ${FR.map((n) => `<div class="kbd-row"><span>${n}</span><button type="button" class="kbd-key" data-note="${n}"></button></div>`).join('')}
        </div>
        <div class="theory-nav">
          <button type="button" class="btn-secondary" id="kbd-reset">Tout effacer</button>
          <button type="button" class="btn-primary" id="kbd-done">Terminé</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const keyBtns = Array.from(overlay.querySelectorAll('.kbd-key'));
    let waiting = null;

    function paint() {
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
    overlay.querySelector('#kbd-reset').addEventListener('click', () => {
      keys = {};
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
    let clefId = 'sol';
    let score = 0;
    let streak = 0;
    activeAnswers = null;
    setPanelPause(null);

    exPanel.classList.toggle('stretch', ex.mode === 'guess-scroll');

    exPage.innerHTML = `
      <div class="ex-top">
        <button type="button" class="backbtn" id="back">&#8592; Exercices</button>
        <span class="ex-title">${ex.title}</span>
        <span class="ex-score" id="score">0</span>
      </div>
      <div class="ex-config">
        <select id="clef-sel" aria-label="Choisir une clé">${CLEFS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select>
        ${ex.mode === 'guess-scroll' ? `<select id="speed-sel" aria-label="Choisir une vitesse">${SPEED_LABELS.map(([v, label]) => `<option value="${v}"${v === 'intermediaire' ? ' selected' : ''}>${label}</option>`).join('')}</select>` : ''}
      </div>
      ${ex.mode === 'place' ? '<div class="namebox" id="namebox">–</div>' : ''}
      <div class="staff-box"><svg class="staff-svg" id="staff" role="img" aria-label="Portée"></svg></div>
      <div class="ex-under">
        <button type="button" class="replay" id="replay">&#9654; Réécouter</button>
        <span class="feedback" id="feedback" aria-live="polite">&nbsp;</span>
      </div>
      ${ex.mode !== 'place' ? '<div class="answers" id="answers"></div>' : ''}
    `;

    const svg = document.getElementById('staff');
    const scoreEl = document.getElementById('score');
    const feedbackEl = document.getElementById('feedback');
    const clef = () => clefById(clefId);

    function markCorrect() {
      score++;
      streak++;
      scoreEl.textContent = score;
      feedbackEl.textContent = CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)];
      feedbackEl.className = 'feedback correct';
    }

    function markWrong(correctName) {
      streak = 0;
      feedbackEl.innerHTML = `C'était <b>${correctName}</b>`;
      feedbackEl.className = 'feedback';
    }

    let controller;
    if (ex.mode === 'guess-scroll') controller = mountGuessScroll(svg, clef, markCorrect, markWrong);
    else if (ex.mode === 'guess-window') controller = mountGuessWindow(svg, clef, markCorrect, markWrong);
    else controller = mountPlace(svg, clef, markCorrect, markWrong);

    document.getElementById('back').addEventListener('click', () => {
      if (controller.destroy) controller.destroy();
      activeAnswers = null;
      showGrid();
    });
    document.getElementById('replay').addEventListener('click', () => {
      const note = controller.currentNote();
      if (note) playTone(note.freq);
    });
    document.getElementById('clef-sel').addEventListener('change', (e) => {
      clefId = e.target.value;
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
        onDue: (note) => playTone(note.freq),
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
        onDue: (note) => playTone(note.freq),
      });

      return {
        currentNote: () => win.currentNote(),
        onClefChange: () => win.setClef(clefFn()),
        destroy: () => win.destroy(),
      };
    }

    function buildAnswerButtons(onAnswer) {
      const answers = document.getElementById('answers');
      const byName = {};
      FR.forEach((name) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'answer-btn';
        btn.innerHTML = `${name}<span class="key-hint"></span>`;
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

      function next() {
        locked = false;
        hoverStep = null;
        const notes = notesOf(clefFn());
        current = notes[Math.floor(Math.random() * notes.length)];
        feedbackEl.innerHTML = '&nbsp;';
        feedbackEl.className = 'feedback';
        nameBox.textContent = current.name;
        svgEl.classList.add('placing');
        renderStaff(svgEl, { clef: clefFn() });
        playTone(current.freq);
      }

      svgEl.addEventListener('mousemove', (e) => {
        if (locked) return;
        hoverStep = eventToStep(svgEl, e.clientY);
        renderStaff(svgEl, { clef: clefFn(), ghostStep: hoverStep });
      });
      svgEl.addEventListener('mouseleave', () => {
        hoverStep = null;
        if (!locked) renderStaff(svgEl, { clef: clefFn() });
      });
      svgEl.addEventListener('click', (e) => {
        if (locked) return;
        locked = true;
        // Toujours placer exactement là où l'indice en pointillés était affiché,
        // plutôt que de recalculer une position potentiellement différente au clic.
        const step = hoverStep != null ? hoverStep : eventToStep(svgEl, e.clientY);
        // Un même nom peut exister à plusieurs positions dans la plage affichée
        // (ex. Do sous la portée et Do au 3e interligne) : toutes comptent comme bonnes.
        const correctSteps = notesOf(clefFn())
          .filter((n) => n.name === current.name)
          .map((n) => n.step);
        const ok = correctSteps.includes(step);
        renderStaff(svgEl, {
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

      next();

      return {
        currentNote: () => current,
        onClefChange: next,
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
  setTab('ex');
})();
