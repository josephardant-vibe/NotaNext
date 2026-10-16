// Portée à fenêtre glissante, utilisée par l'exercice "Deviner la note" : la note repérée par
// le trait + les 7 notes à venir sont toutes affichées (la précédente reste un cran avant le
// trait, le temps d'afficher son résultat). Contrairement à la version "défilement continu", il n'y a aucune animation liée au temps :
// la vue n'avance que lorsqu'une réponse est donnée.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const { STEP, BASE_Y } = window.Notanext.staff.geometry;
  const { drawClef } = window.Notanext.staff;

  const WINDOW_SIZE = 9;          // 1 précédente + la cible (indice 1) + 7 à venir
  const TARGET_INDEX = 1;
  const LEFT_X = 105;             // 1er emplacement : juste après la clé (qui finit vers x = 69)
  const RIGHT_MARGIN = 34;
  const MIN_GAP = 40;             // écart minimal entre deux notes ; sur une boîte étroite les dernières sortent du cadre
  const VB_HEIGHT = 186;
  const OFFSCREEN_X = -20;        // là où glisse (puis disparaît) la note qui sort
  const TRANSITION_MS = 180;      // glissement court : les réponses peuvent s'enchaîner très vite

  const yOf = (step) => BASE_Y - step * STEP;

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function ledgerSteps(step) {
    const steps = [];
    if (step <= -2) for (let s = -2; s >= step; s -= 2) steps.push(s);
    if (step >= 10) for (let s = 10; s <= step; s += 2) steps.push(s);
    return steps;
  }

  function createNoteGroup(note, x) {
    const cy = yOf(note.step);
    const group = el('g', { class: 'window-note', transform: `translate(${x},0)` });
    ledgerSteps(note.step).forEach((s) =>
      group.appendChild(el('line', { class: 'ledger-line', x1: -15, x2: 15, y1: yOf(s), y2: yOf(s) }))
    );
    const spin = el('g', { transform: `rotate(-18 0 ${cy})` });
    spin.appendChild(el('ellipse', { class: 'note-head', cx: 0, cy, rx: 11, ry: 7.5 }));
    group.appendChild(spin);
    return group;
  }

  // `pickNote()` est appelée à chaque note générée : elle lit toujours la clé courante.
  // `onDue(note)` est appelée dès qu'une note devient la cible active (celle que les
  // boutons de réponse évaluent et que "Réécouter" rejoue) — au montage puis après chaque avancée.
  function createWindowStaff(svg, { clef, pickNote, onDue }) {
    svg.innerHTML = '';

    const staticLayer = el('g', { class: 'window-static' });
    const notesLayer = el('g', { class: 'window-notes' });
    svg.appendChild(staticLayer);
    svg.appendChild(notesLayer);

    let currentClef = clef;
    let entries = []; // { note, group }

    // Géométrie : la portée occupe toute la largeur de la boîte (même ratio que le défilement
    // continu) ; les 3 emplacements sont placés autour du repère, à l'écart de la clé.
    let vbW = 420;
    let GAP = MIN_GAP;
    let SLOTS_X = [];
    function layout() {
      const w = svg.clientWidth, h = svg.clientHeight;
      if (w && h) vbW = VB_HEIGHT * (w / h);
      // Les emplacements se partagent toute la largeur après la clé.
      GAP = Math.max(MIN_GAP, (vbW - RIGHT_MARGIN - LEFT_X) / (WINDOW_SIZE - 1));
      SLOTS_X = Array.from({ length: WINDOW_SIZE }, (_, i) => Math.round(LEFT_X + i * GAP));
      svg.setAttribute('viewBox', `0 -40 ${vbW} ${VB_HEIGHT}`);
    }
    layout();

    function drawStatic() {
      staticLayer.innerHTML = '';
      [0, 2, 4, 6, 8].forEach((s) =>
        staticLayer.appendChild(el('line', { class: 'staff-line', x1: -20, x2: vbW + 20, y1: yOf(s), y2: yOf(s) }))
      );
      drawClef(staticLayer, currentClef);
      staticLayer.appendChild(
        el('line', { class: 'marker-line', x1: SLOTS_X[TARGET_INDEX], x2: SLOTS_X[TARGET_INDEX], y1: -36, y2: 142 })
      );
    }

    // Au départ (montage ou changement de clé), rien n'est encore "passé" : la cible et
    // ses 7 notes à venir sont visibles, l'emplacement avant le repère reste vide.
    function fillWindow() {
      notesLayer.innerHTML = '';
      entries = new Array(WINDOW_SIZE).fill(null);
      for (let i = TARGET_INDEX; i < WINDOW_SIZE; i++) {
        const note = pickNote();
        const group = createNoteGroup(note, SLOTS_X[i]);
        notesLayer.appendChild(group);
        entries[i] = { note, group };
      }
      if (onDue) onDue(entries[TARGET_INDEX].note);
    }

    drawStatic();
    fillWindow();

    function onResize() {
      layout();
      drawStatic();
      entries.forEach((e, i) => { if (e) e.group.setAttribute('transform', `translate(${SLOTS_X[i]},0)`); });
    }
    window.addEventListener('resize', onResize);

    return {
      currentNote() {
        return entries[TARGET_INDEX] ? entries[TARGET_INDEX].note : null;
      },
      // Colore la cible (comme déjà défini ailleurs), puis fait avancer toute la
      // fenêtre d'un cran : la note évaluée glisse à gauche, une nouvelle entre à droite.
      answer(isCorrect, correctName) {
        if (!entries[TARGET_INDEX]) return;

        const target = entries[TARGET_INDEX];
        const ellipse = target.group.querySelector('.note-head');
        ellipse.classList.add(isCorrect ? 'reveal-correct' : 'reveal-wrong');
        const label = el('text', {
          x: 20,
          y: yOf(target.note.step) + 4.5,
          class: 'side-label ' + (isCorrect ? 'ok' : 'no'),
        });
        label.textContent = window.Notanext.data.label(correctName);
        target.group.appendChild(label);

        const leaving = entries[0];
        if (leaving) {
          leaving.group.setAttribute('transform', `translate(${OFFSCREEN_X},0)`);
          setTimeout(() => leaving.group.remove(), TRANSITION_MS);
        }

        for (let i = 1; i < WINDOW_SIZE; i++) {
          entries[i].group.setAttribute('transform', `translate(${SLOTS_X[i - 1]},0)`);
        }
        const freshNote = pickNote();
        // La nouvelle note entre par la droite (hors cadre) et glisse jusqu'au dernier emplacement.
        const lastX = SLOTS_X[WINDOW_SIZE - 1];
        const freshGroup = createNoteGroup(freshNote, lastX + GAP);
        notesLayer.appendChild(freshGroup);
        freshGroup.getBoundingClientRect(); // fixe la position de départ avant la transition
        freshGroup.setAttribute('transform', `translate(${lastX},0)`);

        entries = entries.slice(1).concat([{ note: freshNote, group: freshGroup }]);

        // La nouvelle cible sonne tout de suite (pas d'attente de la fin du glissement) : on peut
        // enchaîner les réponses très vite, comme dans le défilement continu.
        if (onDue) onDue(entries[TARGET_INDEX].note);
      },
      setClef(newClef) {
        currentClef = newClef;
        drawStatic();
        fillWindow();
      },
      destroy() {
        window.removeEventListener('resize', onResize);
        notesLayer.innerHTML = '';
        entries = [];
      },
    };
  }

  window.Notanext.windowStaff = { createWindowStaff };
})();
