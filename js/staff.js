// Dessine la portée en clé de sol et la note courante en SVG.
window.Notanext = window.Notanext || {};

(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const STAFF_LINE_STEPS = [0, 2, 4, 6, 8]; // Mi4, Sol4, Si4, Ré5, Fa5
  const BASE_Y = 140; // y de la ligne du bas (step 0)
  const STEP_PX = 10;
  const STAFF_X_START = 70;
  const STAFF_X_END = 280;
  const NOTE_X = 190;

  function stepToY(step) {
    return BASE_Y - step * STEP_PX;
  }

  function drawLedgerLine(svg, y) {
    const ledger = document.createElementNS(SVG_NS, 'line');
    ledger.setAttribute('x1', NOTE_X - 12);
    ledger.setAttribute('x2', NOTE_X + 12);
    ledger.setAttribute('y1', y);
    ledger.setAttribute('y2', y);
    ledger.setAttribute('class', 'ledger-line');
    svg.appendChild(ledger);
  }

  function renderStaff(svg, note) {
    svg.innerHTML = '';

    STAFF_LINE_STEPS.forEach((step) => {
      const y = stepToY(step);
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', STAFF_X_START);
      line.setAttribute('x2', STAFF_X_END);
      line.setAttribute('y1', y);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'staff-line');
      svg.appendChild(line);
    });

    const clef = document.createElementNS(SVG_NS, 'text');
    clef.setAttribute('x', 20);
    clef.setAttribute('y', stepToY(4) + 18);
    clef.setAttribute('class', 'clef');
    clef.textContent = '\u{1D11E}';
    svg.appendChild(clef);

    if (!note) return;

    const y = stepToY(note.step);

    if (note.step < 0) {
      for (let s = -2; s >= note.step; s -= 2) drawLedgerLine(svg, stepToY(s));
    } else if (note.step > 8) {
      for (let s = 10; s <= note.step; s += 2) drawLedgerLine(svg, stepToY(s));
    }

    const head = document.createElementNS(SVG_NS, 'ellipse');
    head.setAttribute('cx', NOTE_X);
    head.setAttribute('cy', y);
    head.setAttribute('rx', 8);
    head.setAttribute('ry', 6);
    head.setAttribute('transform', `rotate(-18 ${NOTE_X} ${y})`);
    head.setAttribute('class', 'note-head');
    svg.appendChild(head);
  }

  function showAnswerLabel(svg, note, isCorrect) {
    const existing = svg.querySelector('.answer-label');
    if (existing) existing.remove();

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', NOTE_X + 22);
    label.setAttribute('y', stepToY(note.step) + 5);
    label.setAttribute('class', 'answer-label ' + (isCorrect ? 'correct' : 'incorrect'));
    label.textContent = note.name;
    svg.appendChild(label);
  }

  window.Notanext.renderStaff = renderStaff;
  window.Notanext.showAnswerLabel = showAnswerLabel;
})();
