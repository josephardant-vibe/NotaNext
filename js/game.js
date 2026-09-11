// Application : navigation (onglets, grille de cartes, pages d'exercice) et logique des exercices.
(function () {
  const { data, staff, scrollStaff, windowStaff, playTone } = window.Notanext;
  const { CLEFS, clefById, notesOf, FR, EXERCISES, FAQ_QUESTIONS, FAQ_ANSWERS } = data;
  const { renderStaff, eventToStep } = staff;
  const { createScrollStaff } = scrollStaff;
  const { createWindowStaff } = windowStaff;

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

  function setTab(name) {
    const isEx = name === 'ex';
    tabEx.classList.toggle('on', isEx);
    tabLearn.classList.toggle('on', !isEx);
    viewEx.hidden = !isEx;
    viewLearn.hidden = isEx;
    if (isEx) showGrid();
    else buildLearn();
  }

  tabEx.addEventListener('click', () => setTab('ex'));
  tabLearn.addEventListener('click', () => setTab('learn'));

  // ---------- exercice ----------
  function mountExercise(ex) {
    let clefId = 'sol';
    let score = 0;
    let streak = 0;

    exPage.innerHTML = `
      <div class="ex-top">
        <button type="button" class="backbtn" id="back">&#8592; Exercices</button>
        <span class="ex-title">${ex.title}</span>
        <span class="ex-score" id="score">0</span>
      </div>
      <div class="ex-config">
        <select id="clef-sel" aria-label="Choisir une clé">${CLEFS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select>
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

      const pickNote = () => {
        const notes = notesOf(clefFn());
        return notes[Math.floor(Math.random() * notes.length)];
      };

      const scroll = createScrollStaff(svgEl, {
        clef: clefFn(),
        pickNote,
        onDue: (note) => playTone(note.freq),
      });

      return {
        currentNote: () => scroll.currentNote(),
        onClefChange: () => scroll.setClef(clefFn()),
        destroy: () => scroll.destroy(),
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
      FR.forEach((name) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'answer-btn';
        btn.textContent = name;
        btn.addEventListener('click', () => onAnswer(name));
        answers.appendChild(btn);
      });
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
  setTab('ex');
})();
