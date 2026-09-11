// Portée qui défile en continu, utilisée uniquement par l'exercice "Deviner la note".
// Les notes déjà à l'écran ne sont jamais redessinées : seule leur position (translation)
// est mise à jour à chaque image, pour rester fluide sur une session longue.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const { STEP, BASE_Y, VIEWBOX } = window.Notanext.staff.geometry;

  const SPAWN_X = 210;   // les notes apparaissent au bord droit du viewBox
  const EXIT_X = -30;    // ... et sont retirées une fois sorties à gauche
  const MARKER_X = 70;   // repère fixe, environ un tiers depuis la gauche
  const SPEED = 55;      // unités de viewBox par seconde

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

  // `pickNote()` est appelée à chaque nouvelle note : elle lit toujours la clé
  // courante, donc un changement de clé s'applique de lui-même aux notes à venir.
  // `onDue(note)` est appelée dès qu'une note devient la cible active (celle que
  // les boutons de réponse évaluent et que "Réécouter" rejoue).
  function createScrollStaff(svg, { clef, pickNote, onDue }) {
    svg.setAttribute('viewBox', VIEWBOX);
    svg.innerHTML = '';

    const staticLayer = el('g', { class: 'scroll-static' });
    const notesLayer = el('g', { class: 'scroll-notes' });
    svg.appendChild(staticLayer);
    svg.appendChild(notesLayer);

    let currentClef = clef;
    let notes = []; // { note, t0, group, answered }
    let active = null;
    let rafId = null;

    // Horloge virtuelle : n'avance que pendant que l'onglet est visible, pour que
    // les notes ne "téléportent" pas après un changement d'onglet ou une mise en veille.
    let clock = 0;
    let lastReal = performance.now();
    const onVisibility = () => {
      lastReal = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    function drawStatic() {
      staticLayer.innerHTML = '';
      [0, 2, 4, 6, 8].forEach((s) =>
        staticLayer.appendChild(el('line', { class: 'staff-line', x1: -20, x2: 230, y1: yOf(s), y2: yOf(s) }))
      );
      const t = el('text', {
        x: 2,
        y: yOf(currentClef.line) + currentClef.glyphDy,
        class: 'clef-glyph',
        'font-size': currentClef.glyphSize,
      });
      t.textContent = currentClef.glyph;
      staticLayer.appendChild(t);
      staticLayer.appendChild(el('line', { class: 'marker-line', x1: MARKER_X, x2: MARKER_X, y1: -20, y2: 152 }));
    }

    function spawnNote() {
      const note = pickNote();
      const cy = yOf(note.step);

      const group = el('g', { class: 'scroll-note' });
      ledgerSteps(note.step).forEach((s) =>
        group.appendChild(el('line', { class: 'ledger-line', x1: -15, x2: 15, y1: yOf(s), y2: yOf(s) }))
      );
      const spin = el('g', { transform: `rotate(-18 0 ${cy})` });
      spin.appendChild(el('ellipse', { class: 'note-head', cx: 0, cy, rx: 11, ry: 7.5 }));
      group.appendChild(spin);
      notesLayer.appendChild(group);

      const entry = { note, t0: clock, group, answered: false };
      notes.push(entry);
      active = entry;
      if (onDue) onDue(note);
    }

    function tick(nowReal) {
      if (!document.hidden) clock += Math.min(nowReal - lastReal, 100);
      lastReal = nowReal;

      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        const x = SPAWN_X - (SPEED * (clock - n.t0)) / 1000;
        n.group.setAttribute('transform', `translate(${x},0)`);
        if (x < EXIT_X) {
          n.group.remove();
          notes.splice(i, 1);
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    drawStatic();
    spawnNote();
    rafId = requestAnimationFrame(tick);

    return {
      // Évalue la note active, la colore (comme déjà défini ailleurs dans l'app),
      // puis fait immédiatement entrer la suivante — le jeu ne se met jamais en pause.
      answer(isCorrect, correctName) {
        if (!active) return;
        const entry = active;
        entry.answered = true;
        active = null;

        const ellipse = entry.group.querySelector('.note-head');
        ellipse.classList.add(isCorrect ? 'reveal-correct' : 'reveal-wrong');
        const label = el('text', {
          x: 20,
          y: yOf(entry.note.step) + 4.5,
          class: 'side-label ' + (isCorrect ? 'ok' : 'no'),
        });
        label.textContent = correctName;
        entry.group.appendChild(label);

        spawnNote();
      },
      currentNote() {
        return active ? active.note : null;
      },
      setClef(newClef) {
        currentClef = newClef;
        drawStatic();
      },
      destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        document.removeEventListener('visibilitychange', onVisibility);
        notes.forEach((n) => n.group.remove());
        notes = [];
        active = null;
      },
    };
  }

  window.Notanext.scrollStaff = { createScrollStaff };
})();
