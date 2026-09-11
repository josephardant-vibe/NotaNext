// Portée à fenêtre glissante (3 notes visibles), utilisée par l'exercice "Deviner la note".
// Contrairement à la version "défilement continu", il n'y a aucune animation liée au temps :
// la vue n'avance que lorsqu'une réponse est donnée.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const { STEP, BASE_Y, VIEWBOX } = window.Notanext.staff.geometry;

  const WINDOW_SIZE = 3;          // notes visibles simultanément (la 2e est la cible)
  const TARGET_INDEX = 1;
  const SLOTS_X = [60, 112, 164]; // positions horizontales fixes des emplacements
  const OFFSCREEN_X = -20;        // là où glisse (puis disparaît) la note qui sort
  const TRANSITION_MS = 350;

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
    svg.setAttribute('viewBox', VIEWBOX);
    svg.innerHTML = '';

    const staticLayer = el('g', { class: 'window-static' });
    const notesLayer = el('g', { class: 'window-notes' });
    svg.appendChild(staticLayer);
    svg.appendChild(notesLayer);

    let currentClef = clef;
    let entries = []; // { note, group }
    let locked = false;

    function drawStatic() {
      staticLayer.innerHTML = '';
      [0, 2, 4, 6, 8].forEach((s) =>
        staticLayer.appendChild(el('line', { class: 'staff-line', x1: 0, x2: 200, y1: yOf(s), y2: yOf(s) }))
      );
      const t = el('text', {
        x: 2,
        y: yOf(currentClef.line) + currentClef.glyphDy,
        class: 'clef-glyph',
        'font-size': currentClef.glyphSize,
      });
      t.textContent = currentClef.glyph;
      staticLayer.appendChild(t);
      staticLayer.appendChild(
        el('line', { class: 'marker-line', x1: SLOTS_X[TARGET_INDEX], x2: SLOTS_X[TARGET_INDEX], y1: -20, y2: 152 })
      );
    }

    // Au départ (montage ou changement de clé), rien n'est encore "passé" : seule la
    // cible et les notes à venir sont visibles, l'emplacement avant le repère reste vide.
    function fillWindow() {
      notesLayer.innerHTML = '';
      entries = new Array(WINDOW_SIZE).fill(null);
      for (let i = TARGET_INDEX; i < WINDOW_SIZE; i++) {
        const note = pickNote();
        const group = createNoteGroup(note, SLOTS_X[i]);
        notesLayer.appendChild(group);
        entries[i] = { note, group };
      }
      locked = false;
      if (onDue) onDue(entries[TARGET_INDEX].note);
    }

    drawStatic();
    fillWindow();

    return {
      currentNote() {
        return entries[TARGET_INDEX] ? entries[TARGET_INDEX].note : null;
      },
      // Colore la cible (comme déjà défini ailleurs), puis fait avancer toute la
      // fenêtre d'un cran : la note évaluée glisse à gauche, une nouvelle entre à droite.
      answer(isCorrect, correctName) {
        if (locked || !entries[TARGET_INDEX]) return;
        locked = true;

        const target = entries[TARGET_INDEX];
        const ellipse = target.group.querySelector('.note-head');
        ellipse.classList.add(isCorrect ? 'reveal-correct' : 'reveal-wrong');
        const label = el('text', {
          x: 20,
          y: yOf(target.note.step) + 4.5,
          class: 'side-label ' + (isCorrect ? 'ok' : 'no'),
        });
        label.textContent = correctName;
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
        const freshGroup = createNoteGroup(freshNote, SLOTS_X[WINDOW_SIZE - 1]);
        notesLayer.appendChild(freshGroup);

        entries = entries.slice(1).concat([{ note: freshNote, group: freshGroup }]);

        setTimeout(() => {
          locked = false;
          if (onDue) onDue(entries[TARGET_INDEX].note);
        }, TRANSITION_MS);
      },
      setClef(newClef) {
        currentClef = newClef;
        drawStatic();
        fillWindow();
      },
      destroy() {
        notesLayer.innerHTML = '';
        entries = [];
      },
    };
  }

  window.Notanext.windowStaff = { createWindowStaff };
})();
