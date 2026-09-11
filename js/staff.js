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

  function drawClef(svg, clef) {
    const t = el('text', {
      x: 2,
      y: yOf(clef.line) + clef.glyphDy,
      class: 'clef-glyph',
      'font-size': clef.glyphSize,
    });
    t.textContent = clef.glyph;
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
    geometry: { STEP, BASE_Y, X0, X1, VIEWBOX, LINE_STEPS },
  };
})();
