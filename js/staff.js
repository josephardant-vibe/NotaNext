// Composant portée : dessine clé + lignes + note(s) ou étiquettes.
// Réutilisé par les exercices (Deviner / Placer) et par l'onglet Apprendre.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const STEP = 12;                 // demi-espacement de ligne, en unités viewBox
  const BASE_Y = 106;              // y de la ligne du bas (step 0)
  const X0 = 46;
  const X1 = 198;
  // Marge haut/bas : aucune note coupée, jusqu'à la note au-dessus de la 1re ligne supplémentaire (step 11).
  const VB_Y = -40;
  const VB_HEIGHT = 186;
  const VIEWBOX = `0 ${VB_Y} 210 ${VB_HEIGHT}`;
  const STEP_MIN = -2;
  const STEP_MAX = 11;

  const LINE_STEPS = [0, 2, 4, 6, 8];
  const yOf = (step) => BASE_Y - step * STEP;

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  // Vrais symboles Unicode de notation musicale (𝄞 U+1D11E, 𝄢 U+1D122, 𝄡 U+1D121)
  // rendus comme du texte avec la police Noto Music (chargée dans index.html) :
  // leur forme est celle du fondeur, pas un tracé approximatif. `dy` ajuste la
  // ligne de base pour que la note de référence de la clé tombe pile sur
  // `clef.line` (calibré visuellement, voir js/staff.js).
  const CLEF_GLYPHS = {
    treble: { char: '\u{1D11E}', x: 32, dy: 18 },
    bass:   { char: '\u{1D122}', x: 32, dy: 79 },
    cclef:  { char: '\u{1D121}', x: 32, dy: 48 },
  };
  const CLEF_FONT_SIZE = 96; // 4 interlignes (1 interligne = 2 * STEP)

  function drawClef(svg, clef) {
    const cfg = CLEF_GLYPHS[clef.shape];
    const y = yOf(clef.line) + cfg.dy;
    const t = el('text', { class: 'clef-glyph', x: cfg.x, y, 'font-size': CLEF_FONT_SIZE, 'text-anchor': 'middle' });
    t.textContent = cfg.char;
    svg.appendChild(t);
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

  // Largeur de viewBox qui épouse le ratio réel de la boîte (clientWidth : insensible aux rotations CSS).
  function wideWidth(svg) {
    const w = svg.clientWidth, h = svg.clientHeight;
    return w && h ? VB_HEIGHT * (w / h) : 420;
  }

  // opts : { clef, note, ghostStep, sideLabel:{text,ok}, reveal:{correctStep,correctName,clickedStep,ok}, labels:[notes], onNoteClick }
  function renderStaff(svg, opts) {
    opts = opts || {};
    // `wide` : la portée occupe toute la largeur disponible (jeux), le viewBox suit le ratio réel de la boîte.
    let x0 = X0, x1 = X1, NOTE_X = 130;
    if (opts.wide) {
      const vbW = wideWidth(svg);
      x0 = -20; x1 = vbW + 20; NOTE_X = Math.round(vbW * 0.55);
      svg.setAttribute('viewBox', `0 ${VB_Y} ${vbW} ${VB_HEIGHT}`);
    } else {
      svg.setAttribute('viewBox', VIEWBOX);
    }
    svg.innerHTML = '';

    LINE_STEPS.forEach((s) => svg.appendChild(el('line', { class: 'staff-line', x1: x0, x2: x1, y1: yOf(s), y2: yOf(s) })));
    if (opts.clef) drawClef(svg, opts.clef);

    if (opts.ghostStep != null) {
      drawLedgers(svg, opts.ghostStep, NOTE_X);
      svg.appendChild(noteAt(NOTE_X, opts.ghostStep, 'ghost'));
      // Nom de la note sous le curseur, écrit sur la note ; au toucher, juste au-dessus (le doigt la cacherait).
      if (opts.ghostLabel) {
        const above = !!opts.ghostLabelAbove;
        const t = el('text', { x: NOTE_X, y: yOf(opts.ghostStep) + (above ? -20 : 4), class: 'ghost-label' + (above ? ' above' : ''), 'text-anchor': 'middle' });
        t.textContent = opts.ghostLabel;
        svg.appendChild(t);
      }
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
        label.textContent = window.Notanext.data.label(correctName);
        svg.appendChild(label);
      });
      return null;
    }

    if (opts.labels) {
      const list = opts.labels;
      const span = (x1 - x0 - 24) / (list.length - 1);
      list.forEach((nt, i) => {
        const cx = x0 + 16 + i * span;
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
        t.textContent = window.Notanext.data.label(nt.name);
        svg.appendChild(t);
      });
    }

    return null;
  }

  // Convertit un clic sur la portée en `step` (borné à la plage jouable).
  function eventToStep(svg, clientY, clientX) {
    // La matrice écran -> viewBox tient compte du ratio, des marges et d'une éventuelle rotation CSS.
    const pt = svg.createSVGPoint();
    pt.x = clientX || 0;
    pt.y = clientY;
    const y = pt.matrixTransform(svg.getScreenCTM().inverse()).y;
    return Math.max(STEP_MIN, Math.min(STEP_MAX, Math.round((BASE_Y - y) / STEP)));
  }

  // Description parlée d'une position sur la portée (step 0 = ligne du bas, -1 = sous la 1re ligne).
  function describeStep(step) {
    if (step <= -2) return 'ligne supplémentaire sous la portée';
    if (step === 9) return 'au-dessus de la 5e ligne';
    if (step === 10) return '1re ligne supplémentaire au-dessus';
    if (step === 11) return 'au-dessus de la 1re ligne supplémentaire';
    if (step === -1) return 'sous la première ligne';
    if (step % 2 === 0) { const n = step / 2 + 1; return (n === 1 ? '1re' : n + 'e') + ' ligne'; }
    const n = (step + 1) / 2;
    return (n === 1 ? '1er' : n + 'e') + ' interligne';
  }

  // Rend une portée « à placer » utilisable au clavier : focalisable, flèches haut/bas pour déplacer
  // la note fantôme, Début/Fin pour les extrêmes, Entrée ou Espace pour valider. Exposée comme un
  // curseur (slider) avec la position décrite à voix haute.
  // opts : { onMove(step), onCommit(step), isLocked(), extra(step) -> texte ajouté à la description }
  function attachKeyboard(svg, opts) {
    let step = 4;
    svg.setAttribute('tabindex', '0');
    svg.setAttribute('role', 'slider');
    svg.setAttribute('aria-orientation', 'vertical');
    svg.setAttribute('aria-valuemin', String(STEP_MIN));
    svg.setAttribute('aria-valuemax', String(STEP_MAX));
    svg.setAttribute('aria-label', 'Portée : place la note. Flèches haut et bas pour la déplacer, Entrée pour valider.');
    const announce = () => {
      const extra = opts.extra ? opts.extra(step) : '';
      svg.setAttribute('aria-valuenow', String(step));
      svg.setAttribute('aria-valuetext', describeStep(step) + (extra ? ' : ' + extra : ''));
    };
    announce();
    svg.addEventListener('keydown', (e) => {
      if (opts.isLocked()) return;
      let next = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') next = Math.min(STEP_MAX, step + 1);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') next = Math.max(STEP_MIN, step - 1);
      else if (e.key === 'Home') next = STEP_MIN;
      else if (e.key === 'End') next = STEP_MAX;
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.onCommit(step); return; }
      if (next == null) return;
      e.preventDefault();
      step = next;
      announce();
      opts.onMove(step);
    });
    return { reset() { step = 4; announce(); } };
  }

  window.Notanext.staff = {
    renderStaff,
    describeStep,
    attachKeyboard,
    eventToStep,
    drawClef,
    geometry: { STEP, BASE_Y, X0, X1, VIEWBOX, LINE_STEPS },
  };
})();
