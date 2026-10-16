// Portée qui défile en continu, utilisée uniquement par l'exercice "Deviner la note - défilement continu".
// Le défilement est piloté par le temps, indépendamment des réponses du joueur : de nouvelles
// notes apparaissent à intervalle régulier, et une note non répondue avant d'avoir dépassé le
// repère est automatiquement comptée comme une erreur.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const { STEP, BASE_Y } = window.Notanext.staff.geometry;
  const { drawClef } = window.Notanext.staff;

  const VB_HEIGHT = 186;   // hauteur du viewBox (fixe, comme la portée statique)
  const VB_Y = -40;        // marge haute/basse : aucune note coupée (jusqu'au step 11)
  const DEFAULT_VB_WIDTH = 210;
  const MARKER_X = 84;           // repère collé contre la clé (la clé finit vers x = 69), en unités de viewBox
  const CLIP_X = 68;             // les notes glissent sous le bord droit de la clé
  const EXIT_MARGIN = -30;       // les notes sont retirées un peu après être sorties à gauche
  const SPACING_X = 95;          // écart (unités de viewBox) entre deux notes générées : cibles bien distinctes, aussi au doigt

  const REF_SPEED = 44; // vitesse de référence (unités de viewBox / seconde) = "Intermédiaire" (55 * 0.8 : tous les niveaux ralentis de 20 %)
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
    // Rogne les notes à gauche : elles disparaissent sous la clé au lieu de la traverser.
    const clip = el('clipPath', { id: 'scroll-notes-clip' });
    const clipRect = el('rect', { x: CLIP_X, y: -100, width: 4000, height: 400 });
    clip.appendChild(clipRect);
    svg.insertBefore(clip, staticLayer);
    notesLayer.setAttribute('clip-path', 'url(#scroll-notes-clip)');

    let currentClef = clef;
    let SPEED = initialSpeed || REF_SPEED;
    let spawnInterval = (SPACING_X / SPEED) * 1000; // ms
    let vbWidth = DEFAULT_VB_WIDTH;
    let SPAWN_X = vbWidth;

    let notes = []; // toutes les notes affichées, dans l'ordre d'apparition : { note, x, group, state }
    let queue = [];  // sous-ensemble non tranchées (state === 'pending'), même ordre
    let rafId = null;
    let paused = false;
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
      // clientWidth/Height : dimensions de mise en page, insensibles à une rotation CSS du jeu.
      if (!svg.clientWidth || !svg.clientHeight) return vbWidth;
      return VB_HEIGHT * (svg.clientWidth / svg.clientHeight);
    }

    // La portée occupe toute la largeur disponible : le viewBox s'élargit pour coller
    // au ratio réel de la boîte, au lieu de garder une largeur fixe et de "letterboxer".
    function updateGeometry() {
      vbWidth = measureVbWidth();
      SPAWN_X = vbWidth;
      svg.setAttribute('viewBox', `0 ${VB_Y} ${vbWidth} ${VB_HEIGHT}`);
    }

    function drawStatic() {
      staticLayer.innerHTML = '';
      [0, 2, 4, 6, 8].forEach((s) =>
        staticLayer.appendChild(el('line', { class: 'staff-line', x1: -20, x2: vbWidth + 20, y1: yOf(s), y2: yOf(s) }))
      );
      drawClef(staticLayer, currentClef);
      staticLayer.appendChild(el('line', { class: 'marker-line', x1: MARKER_X, x2: MARKER_X, y1: -36, y2: 142 }));
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
      if (wasEmpty) {
        paintTarget();
        if (onDue) onDue(note);
      }
    }

    // Le nom de la note s'écrit dans la tête de note pendant une seconde, juste ou non.
    function flashName(entry) {
      const label = el('text', {
        x: 0,
        y: yOf(entry.note.step) + 4,
        class: 'head-label',
        'text-anchor': 'middle',
      });
      label.textContent = window.Notanext.data.label(entry.note.name);
      entry.group.appendChild(label);
      setTimeout(() => label.remove(), 1000);
    }

    // La note à deviner (la plus ancienne non tranchée) est cerclée : on répond dans l'ordre d'arrivée.
    function paintTarget() {
      notes.forEach((n) => n.group.classList.toggle('is-target', queue[0] === n));
    }

    function markMissed(entry) {
      entry.state = 'missed';
      const ellipse = entry.group.querySelector('.note-head');
      ellipse.classList.add('reveal-wrong');
      flashName(entry);
      if (onMiss) onMiss(entry.note.name, entry.note);
    }

    function tick(nowReal) {
      // Écran masqué (message « Tourne ton téléphone », panneau…) : largeur inconnue, rien ne naît ni n'avance
      // tant que la portée n'a pas sa vraie taille (sinon la 1re note apparaît au mauvais endroit).
      if (!svg.clientWidth) {
        lastReal = nowReal;
        rafId = requestAnimationFrame(tick);
        return;
      }
      let dt = 0;
      if (!document.hidden && !paused) dt = Math.min(nowReal - lastReal, 100);
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
          paintTarget();
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
        flashName(entry);

        paintTarget();
        if (queue.length && onDue) onDue(queue[0].note);
      },
      currentNote() {
        return queue[0] ? queue[0].note : null;
      },
      setClef(newClef) {
        currentClef = newClef;
        drawStatic();
      },
      // Gèle l'horloge (ex. pendant la configuration du clavier) : rien n'avance ni n'est compté raté.
      setPaused(value) {
        paused = value;
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
