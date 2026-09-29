// Composant portée : dessine clé + lignes + note(s) ou étiquettes.
// Réutilisé par les exercices (Deviner / Placer) et par l'onglet Apprendre.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const STEP = 12;                 // demi-espacement de ligne, en unités viewBox
  const BASE_Y = 106;              // y de la ligne du bas (step 0)
  const X0 = 46;
  const X1 = 198;
  const NOTE_X = 130;
  const VIEWBOX = '0 -24 210 180'; // marge haut/bas : aucune note coupée

  const LINE_STEPS = [0, 2, 4, 6, 8];
  const yOf = (step) => BASE_Y - step * STEP;

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  // Tracés dessinés à la main, calibrés sur les lignes de la portée (STEP/BASE_Y)
  // plutôt que rendus via un glyphe Unicode musical (𝄞 𝄢 𝄡) dont la position réelle
  // dépend de la police de secours choisie par le navigateur/l'OS — c'était la
  // cause du mauvais positionnement (notamment la clé de sol) selon la machine.
  // Coordonnées locales : (0,0) = le point que `clef.line` doit toucher exactement
  // (le cœur de la spirale pour sol, entre les 2 points pour fa, le pincement
  // central pour ut alto/ténor).
  const CLEF_PATHS = {
    treble: `M 6,-96 C 22,-92 24,-78 12,-70 C -2,-62 -18,-70 -16,-84 C -14,-95 0,-99 10,-92
              M 10,-92 C 14,-84 8,-70 -2,-58 C -14,-44 -18,-30 -10,-18 C -4,-9 6,-9 10,-16 C 14,-24 8,-30 3,-27 C -1,-25 0,-19 4,-19
              M -10,-18 C -15,-18 -18,-5 -13,8 C -7,20 7,25 9,37 C 11,47 2,54 -7,51 C -14,48 -15,40 -10,36 C -7,33 -4,35 -4,38`,
    bass: 'M -22,-4 C -22,-22 -8,-34 6,-32 C 20,-30 29,-15 26,-1 C 23,13 9,22 -6,22',
    cclef: 'M -8,-50 C 10,-45 10,-6 -8,0 C 10,6 10,45 -8,50',
  };
  const CLEF_OFFSET_X = { treble: 22, bass: 24, cclef: 22 };
  // Décalage vertical fin : le repère (0,0) du tracé lui-même ne tombe pas
  // toujours exactement sur son point notable (spirale/pince) une fois dessiné
  // à la main ; ce petit ajustement corrige l'écart, calibré visuellement.
  const CLEF_OFFSET_Y = { treble: 18, bass: 0, cclef: 0 };

  function drawClef(svg, clef) {
    const y = yOf(clef.line) + CLEF_OFFSET_Y[clef.shape];
    const g = el('g', { class: 'clef-glyph', transform: `translate(${2 + CLEF_OFFSET_X[clef.shape]},${y})` });
    g.appendChild(el('path', { d: CLEF_PATHS[clef.shape] }));
    if (clef.shape === 'bass') {
      g.appendChild(el('circle', { class: 'clef-dot', cx: 30, cy: -13, r: 3.2 }));
      g.appendChild(el('circle', { class: 'clef-dot', cx: 30, cy: 10, r: 3.2 }));
    }
    if (clef.shape === 'cclef') {
      g.appendChild(el('line', { class: 'clef-bar', x1: -20, x2: -20, y1: -50, y2: 50 }));
      g.appendChild(el('line', { x1: 16, x2: 16, y1: -50, y2: 50 }));
      g.appendChild(el('line', { x1: 24, x2: 24, y1: -50, y2: 50 }));
    }
    svg.appendChild(g);
  }

  function drawLedgers(svg, step, cx) {
    if (step <= -2) for (let s = -2; s >= step; s -= 2) svg.appendChild(el('line', { class: 'ledger-line', x1: cx - 15, x2: cx + 15, y1: yOf(s), y2: yOf(s) }));
    if (step >= 10) for (let s = 10; s <= step; s += 2) svg.appendChild(el('line', { class: 'ledger-line', x1: cx - 15, x2: cx + 15, y1: yOf(s), y2: yOf(s) }));
  }

  function noteAt(cx, step, cls) {
    const y = yOf(step);
    const g = el('g', { transform: `rotate(-18 ${cx} ${y})` });
    g.appendChild(el('ellipse', { class: cls, cx, cy: y, rx: 11, ry: 7.5 }));
    return g;
  }

  // opts : { clef, note, ghostStep, sideLabel:{text,ok}, reveal:{correctStep,correctName,clickedStep,ok}, labels:[notes], onNoteClick }
  function renderStaff(svg, opts) {
    opts = opts || {};
    svg.setAttribute('viewBox', VIEWBOX);
    svg.innerHTML = '';

    LINE_STEPS.forEach((s) => svg.appendChild(el('line', { class: 'staff-line', x1: X0, x2: X1, y1: yOf(s), y2: yOf(s) })));
    if (opts.clef) drawClef(svg, opts.clef);

    if (opts.ghostStep != null) {
      drawLedgers(svg, opts.ghostStep, NOTE_X);
      svg.appendChild(noteAt(NOTE_X, opts.ghostStep, 'ghost'));
    }

    if (opts.note) {
      const y = yOf(opts.note.step);
      drawLedgers(svg, opts.note.step, NOTE_X);
      svg.appendChild(noteAt(NOTE_X, opts.note.step, 'note-head'));

      if (opts.sideLabel) {
        const t = el('text', { x: NOTE_X + 20, y: y + 4.5, class: 'side-label ' + (opts.sideLabel.ok ? 'ok' : 'no') });
        t.textContent = opts.sideLabel.text;
        svg.appendChild(t);
      }
      return svg.querySelector('.note-head');
    }

    // Mode Placer : révèle TOUTES les positions valides pour le nom demandé
    // (vert transparent + nom) et, si la réponse est fausse, la position
    // cliquée en plus (grise, sans nom) — et rien d'autre.
    if (opts.reveal) {
      const { correctSteps, correctName, clickedStep, ok } = opts.reveal;
      const correctX = ok ? NOTE_X : NOTE_X + 16;
      if (!ok) {
        drawLedgers(svg, clickedStep, NOTE_X - 16);
        svg.appendChild(noteAt(NOTE_X - 16, clickedStep, 'note-head reveal-wrong'));
      }
      correctSteps.forEach((step) => {
        drawLedgers(svg, step, correctX);
        svg.appendChild(noteAt(correctX, step, 'note-head reveal-correct'));
        const label = el('text', { x: correctX + 20, y: yOf(step) + 4.5, class: 'side-label ok' });
        label.textContent = correctName;
        svg.appendChild(label);
      });
      return null;
    }

    if (opts.labels) {
      const list = opts.labels;
      const span = (X1 - X0 - 24) / (list.length - 1);
      list.forEach((nt, i) => {
        const cx = X0 + 16 + i * span;
        const cy = yOf(nt.step);
        drawLedgers(svg, nt.step, cx);
        const g = noteAt(cx, nt.step, '');
        g.setAttribute('class', 'learn-note');
        g.querySelector('ellipse').setAttribute('rx', 6);
        g.querySelector('ellipse').setAttribute('ry', 4.8);
        g.querySelector('ellipse').setAttribute('fill', '#b8502f');
        if (opts.onNoteClick) {
          g.style.cursor = 'pointer';
          g.addEventListener('click', () => opts.onNoteClick(nt));
        }
        svg.appendChild(g);
        const t = el('text', { x: cx + 11, y: cy + 3.5, class: 'learn-label' });
        t.textContent = nt.name;
        svg.appendChild(t);
      });
    }

    return null;
  }

  // Convertit un clic sur la portée en `step` (borné à la plage jouable).
  function eventToStep(svg, clientY) {
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scale = Math.min(r.width / vb.width, r.height / vb.height);
    const offY = (r.height - vb.height * scale) / 2;
    const y = (clientY - r.top - offY) / scale + vb.y;
    return Math.max(-2, Math.min(8, Math.round((BASE_Y - y) / STEP)));
  }

  window.Notanext.staff = {
    renderStaff,
    eventToStep,
    drawClef,
    geometry: { STEP, BASE_Y, X0, X1, VIEWBOX, LINE_STEPS },
  };
})();
