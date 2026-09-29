// Portée qui défile en continu, utilisée uniquement par l'exercice "Deviner la note - défilement continu".
// Le défilement est piloté par le temps, indépendamment des réponses du joueur : de nouvelles
// notes apparaissent à intervalle régulier, et une note non répondue avant d'avoir dépassé le
// repère est automatiquement comptée comme une erreur.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const { STEP, BASE_Y } = window.Notanext.staff.geometry;
  const { drawClef } = window.Notanext.staff;

  const VB_HEIGHT = 180;   // hauteur du viewBox (fixe, comme la portée statique)
  const VB_Y = -24;        // marge haute/basse : aucune note coupée
  const DEFAULT_VB_WIDTH = 210;
  const MARKER_FRACTION = 1 / 3; // position du repère, en fraction de la largeur du viewBox
  const EXIT_MARGIN = -30;       // les notes sont retirées un peu après être sorties à gauche
  const SPACING_X = 65;          // écart (unités de viewBox) entre deux notes générées

  const REF_SPEED = 55; // vitesse de référence (unités de viewBox / seconde) = "Intermédiaire"
  const SPEED_LEVELS = {
    debutant: Math.round(REF_SPEED * 0.6),
    intermediaire: REF_SPEED,
    avance: Math.round(REF_SPEED * 1.5),
    expert: Math.round(REF_SPEED * 2.2),
  };

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
  // `onMiss(correctName)` est appelée quand une note dépasse le repère sans réponse.
  function createScrollStaff(svg, { clef, pickNote, onDue, onMiss, initialSpeed }) {
    svg.innerHTML = '';
    const staticLayer = el('g', { class: 'scroll-static' });
    const notesLayer = el('g', { class: 'scroll-notes' });
    svg.appendChild(staticLayer);
    svg.appendChild(notesLayer);

    let currentClef = clef;
    let SPEED = initialSpeed || REF_SPEED;
    let spawnInterval = (SPACING_X / SPEED) * 1000; // ms
    let vbWidth = DEFAULT_VB_WIDTH;
    let SPAWN_X = vbWidth;
    let MARKER_X = vbWidth * MARKER_FRACTION;

    let notes = []; // toutes les notes affichées, dans l'ordre d'apparition : { note, x, group, state }
    let queue = [];  // sous-ensemble non tranchées (state === 'pending'), même ordre
    let rafId = null;
    let clock = 0;
    let nextSpawnAt = 0;

    // Horloge virtuelle : n'avance que pendant que l'onglet est visible, pour que
    // les notes ne "téléportent" pas après un changement d'onglet ou une mise en veille.
    let lastReal = performance.now();
    const onVisibility = () => {
      lastReal = performance.now();
    };
    document.addEventListener('visibilitychange', onVisibility);

    function measureVbWidth() {
      const rect = svg.getBoundingClientRect();
      if (!rect.width || !rect.height) return vbWidth;
      return VB_HEIGHT * (rect.width / rect.height);
    }

    // La portée occupe toute la largeur disponible : le viewBox s'élargit pour coller
    // au ratio réel de la boîte, au lieu de garder une largeur fixe et de "letterboxer".
    function updateGeometry() {
      vbWidth = measureVbWidth();
      SPAWN_X = vbWidth;
      MARKER_X = vbWidth * MARKER_FRACTION;
      svg.setAttribute('viewBox', `0 ${VB_Y} ${vbWidth} ${VB_HEIGHT}`);
    }

    function drawStatic() {
      staticLayer.innerHTML = '';
      [0, 2, 4, 6, 8].forEach((s) =>
        staticLayer.appendChild(el('line', { class: 'staff-line', x1: -20, x2: vbWidth + 20, y1: yOf(s), y2: yOf(s) }))
      );
      drawClef(staticLayer, currentClef);
      staticLayer.appendChild(el('line', { class: 'marker-line', x1: MARKER_X, x2: MARKER_X, y1: -20, y2: 152 }));
    }

    function spawnNote() {
      const note = pickNote();
      const cy = yOf(note.step);

      const group = el('g', { class: 'scroll-note', transform: `translate(${SPAWN_X},0)` });
      ledgerSteps(note.step).forEach((s) =>
        group.appendChild(el('line', { class: 'ledger-line', x1: -15, x2: 15, y1: yOf(s), y2: yOf(s) }))
      );
      const spin = el('g', { transform: `rotate(-18 0 ${cy})` });
      spin.appendChild(el('ellipse', { class: 'note-head', cx: 0, cy, rx: 11, ry: 7.5 }));
      group.appendChild(spin);
      notesLayer.appendChild(group);

      const entry = { note, x: SPAWN_X, group, state: 'pending' };
      notes.push(entry);
      const wasEmpty = queue.length === 0;
      queue.push(entry);
      if (wasEmpty && onDue) onDue(note);
    }

    function markMissed(entry) {
      entry.state = 'missed';
      const ellipse = entry.group.querySelector('.note-head');
      ellipse.classList.add('reveal-wrong');
      const label = el('text', {
        x: 20,
        y: yOf(entry.note.step) + 4.5,
        class: 'side-label no',
      });
      label.textContent = entry.note.name;
      entry.group.appendChild(label);
      if (onMiss) onMiss(entry.note.name);
    }

    function tick(nowReal) {
      let dt = 0;
      if (!document.hidden) dt = Math.min(nowReal - lastReal, 100);
      lastReal = nowReal;
      clock += dt;

      while (clock >= nextSpawnAt) {
        spawnNote();
        nextSpawnAt += spawnInterval;
      }

      const dx = (SPEED * dt) / 1000;
      for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.x -= dx;
        n.group.setAttribute('transform', `translate(${n.x},0)`);

        if (n.state === 'pending' && n.x < MARKER_X && queue[0] === n) {
          markMissed(n);
          queue.shift();
          if (queue.length && onDue) onDue(queue[0].note);
        }
        if (n.x < EXIT_MARGIN) {
          n.group.remove();
          notes.splice(i, 1);
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function onResize() {
      updateGeometry();
      drawStatic();
    }

    updateGeometry();
    drawStatic();
    nextSpawnAt = 0;
    rafId = requestAnimationFrame(tick);
    window.addEventListener('resize', onResize);

    return {
      // Évalue la note actuellement due (comme déjà défini ailleurs dans l'app),
      // puis passe la main à la suivante déjà en approche, sans jamais mettre le jeu en pause.
      answer(isCorrect, correctName) {
        const entry = queue[0];
        if (!entry || entry.state !== 'pending') return;
        entry.state = isCorrect ? 'correct' : 'wrong';
        queue.shift();

        const ellipse = entry.group.querySelector('.note-head');
        ellipse.classList.add(isCorrect ? 'reveal-correct' : 'reveal-wrong');
        const label = el('text', {
          x: 20,
          y: yOf(entry.note.step) + 4.5,
          class: 'side-label ' + (isCorrect ? 'ok' : 'no'),
        });
        label.textContent = correctName;
        entry.group.appendChild(label);

        if (queue.length && onDue) onDue(queue[0].note);
      },
      currentNote() {
        return queue[0] ? queue[0].note : null;
      },
      setClef(newClef) {
        currentClef = newClef;
        drawStatic();
      },
      setSpeed(newSpeed) {
        SPEED = newSpeed;
        spawnInterval = (SPACING_X / SPEED) * 1000;
      },
      destroy() {
        if (rafId) cancelAnimationFrame(rafId);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('resize', onResize);
        notes.forEach((n) => n.group.remove());
        notes = [];
        queue = [];
      },
    };
  }

  window.Notanext.scrollStaff = { createScrollStaff, SPEED_LEVELS };
})();
