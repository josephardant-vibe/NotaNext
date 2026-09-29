// Rendu + interactivité des illustrations de "Théorie de base & notation".
// Chaque section (js/notes.js -> THEORY_SECTIONS) décrit son illustration
// comme une donnée { type, ... } ; ce module sait dessiner chaque type et
// brancher le son correspondant (audio.js). Ajouter une future section qui
// réutilise un type existant ne touche pas ce fichier, seulement les données.
window.Notanext = window.Notanext || {};

(function () {
  const { playTone, playClick } = window.Notanext;

  const TEMPO_BPM = 132; // tempo fixe utilisé pour les valeurs de note et la mesure
  const BEAT_SEC = 60 / TEMPO_BPM;

  function semitoneFreq(freq, steps) {
    return freq * Math.pow(2, steps / 12);
  }

  // Répartit `n` points sur une largeur donnée (mêmes positions qu'avant pour n=3).
  function spread(n, width, margin) {
    if (n === 1) return [width / 2];
    const step = (width - margin * 2) / (n - 1);
    return Array.from({ length: n }, (_, i) => margin + step * i);
  }

  // Surligne un glyphe en cuivre (feedback "en cours de lecture") pendant `duration`s,
  // puis revient au noir de la notation.
  function flash(g, duration) {
    g.classList.add('is-active');
    setTimeout(() => g.classList.remove('is-active'), duration * 1000);
  }

  // Silences : rien à jouer, seul un clignotement (`beats` fois, au tempo fixe)
  // marque visuellement les temps.
  function beatBlink(g, beats) {
    for (let i = 0; i < beats; i++) {
      setTimeout(() => g.classList.add('is-active'), i * BEAT_SEC * 1000);
      setTimeout(() => g.classList.remove('is-active'), (i * BEAT_SEC + BEAT_SEC * 0.55) * 1000);
    }
  }

  // ---------- tracés (même esprit "dessiné à la main" que les icônes existantes) ----------
  function noteHead(cx, cy, filled) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="11" ry="8" transform="rotate(-18 ${cx} ${cy})" ${filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2.4"'}/>`;
  }

  function stem(cx, cy) {
    const x = cx + 10;
    return `<line x1="${x}" y1="${cy - 3}" x2="${x}" y2="${cy - 21}" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>`;
  }

  function restGlyph(cx, cy, variant) {
    if (variant === 'whole') {
      return `<line x1="${cx - 10}" y1="${cy}" x2="${cx + 10}" y2="${cy}" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><rect x="${cx - 5}" y="${cy}" width="10" height="5" fill="currentColor"/>`;
    }
    if (variant === 'half') {
      return `<line x1="${cx - 10}" y1="${cy + 9}" x2="${cx + 10}" y2="${cy + 9}" stroke="currentColor" stroke-width="1.5" opacity="0.5"/><rect x="${cx - 5}" y="${cy + 4}" width="10" height="5" fill="currentColor"/>`;
    }
    return `<path d="M${cx + 2} ${cy - 16} C ${cx - 4} ${cy - 10}, ${cx + 6} ${cy - 6}, ${cx - 2} ${cy} C ${cx + 8} ${cy + 4}, ${cx - 6} ${cy + 6}, ${cx} ${cy + 12} C ${cx + 3} ${cy + 14}, ${cx + 1} ${cy + 18}, ${cx - 3} ${cy + 16}" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  function accidentalGlyph(cx, cy, variant) {
    if (variant === 'sharp') {
      return `<line x1="${cx - 5}" y1="${cy - 18}" x2="${cx - 8}" y2="${cy + 18}" stroke-width="2.2"/><line x1="${cx + 7}" y1="${cy - 18}" x2="${cx + 4}" y2="${cy + 18}" stroke-width="2.2"/><line x1="${cx - 12}" y1="${cy - 6}" x2="${cx + 12}" y2="${cy - 10}" stroke-width="3"/><line x1="${cx - 12}" y1="${cy + 10}" x2="${cx + 12}" y2="${cy + 6}" stroke-width="3"/>`;
    }
    if (variant === 'flat') {
      return `<line x1="${cx - 5}" y1="${cy - 20}" x2="${cx - 5}" y2="${cy + 16}" stroke-width="2.2"/><path d="M${cx - 5} ${cy} C ${cx + 7} ${cy}, ${cx + 11} ${cy + 10}, ${cx + 1} ${cy + 16} C ${cx - 5} ${cy + 20}, ${cx - 7} ${cy + 14}, ${cx - 5} ${cy + 8}" stroke-width="2.2" fill="none"/>`;
    }
    return `<line x1="${cx - 6}" y1="${cy - 16}" x2="${cx - 6}" y2="${cy + 10}" stroke-width="2.2"/><line x1="${cx + 8}" y1="${cy - 10}" x2="${cx + 8}" y2="${cy + 16}" stroke-width="2.2"/><line x1="${cx - 6}" y1="${cy - 10}" x2="${cx + 8}" y2="${cy - 7}" stroke-width="2.2"/><line x1="${cx - 6}" y1="${cy + 7}" x2="${cx + 8}" y2="${cy + 10}" stroke-width="2.2"/>`;
  }

  function labelText(cx, y, text) {
    return `<text x="${cx}" y="${y}" class="theory-label">${text}</text>`;
  }

  // ---------- registre des types d'illustration ----------
  // Chaque type expose : icon(illustration) -> SVG, listen(illustration) -> bouton
  // optionnel (sinon ''), mount(root, illustration) -> branche les événements.
  const ILLUSTRATIONS = {
    'note-single': {
      icon() {
        return `<svg width="64" height="64" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-linecap="round"><g class="theory-glyph is-playable" data-i="0">${noteHead(20, 22, true)}</g></svg>`;
      },
      listen: () => '',
      mount(root, ill) {
        const g = root.querySelector('.theory-glyph[data-i="0"]');
        g.addEventListener('click', () => { playTone(ill.sound.freq); flash(g, 0.7); });
      },
    },

    'note-values': {
      icon(ill) {
        const xs = spread(ill.items.length, 150, 20);
        const parts = ill.items.map((item, i) => {
          const cx = xs[i];
          return `<g class="theory-glyph is-playable" data-i="${i}">${noteHead(cx, 24, item.filled)}${item.stem ? stem(cx, 24) : ''}${labelText(cx, 54, item.label)}</g>`;
        });
        return `<svg width="170" height="68" viewBox="0 0 150 60" fill="none" stroke="currentColor">${parts.join('')}</svg>`;
      },
      listen: () => '',
      mount(root, ill) {
        ill.items.forEach((item, i) => {
          const g = root.querySelector(`.theory-glyph[data-i="${i}"]`);
          const duration = item.sound.beats * BEAT_SEC;
          g.addEventListener('click', () => { playTone(ill.sound.freq, duration); flash(g, duration); });
        });
      },
    },

    'rest-values': {
      icon(ill) {
        const xs = spread(ill.items.length, 150, 20);
        const parts = ill.items.map((item, i) => {
          const cx = xs[i];
          return `<g class="theory-glyph is-playable" data-i="${i}">${restGlyph(cx, 24, item.variant)}${labelText(cx, 54, item.label)}</g>`;
        });
        return `<svg width="170" height="68" viewBox="0 0 150 60" fill="none" stroke="currentColor">${parts.join('')}</svg>`;
      },
      listen: () => '',
      mount(root, ill) {
        ill.items.forEach((item, i) => {
          const g = root.querySelector(`.theory-glyph[data-i="${i}"]`);
          g.addEventListener('click', () => beatBlink(g, item.pulseBeats));
        });
      },
    },

    measure: {
      icon(ill) {
        const [num, den] = ill.timeSig.split('/');
        const xs = spread(ill.beats, 108, 0).map((x) => x + 34);
        const notes = xs.map((cx, i) => `<g class="theory-glyph" data-i="${i}"><ellipse cx="${cx}" cy="30" rx="6" ry="4.3" fill="currentColor" stroke="none" transform="rotate(-15 ${cx} 30)"/><line x1="${cx + 5}" y1="27" x2="${cx + 5}" y2="13" stroke-width="2"/></g>`).join('');
        return `<svg width="185" height="70" viewBox="0 0 160 60" fill="none" stroke="currentColor">
          <line x1="18" y1="10" x2="18" y2="44" stroke-width="2.2"/>
          <line x1="146" y1="10" x2="146" y2="44" stroke-width="2.2"/>
          <line x1="18" y1="18" x2="146" y2="18" stroke-width="1.3" opacity="0.6"/>
          <line x1="18" y1="36" x2="146" y2="36" stroke-width="1.3" opacity="0.6"/>
          <text x="26" y="25" font-family="Georgia, serif" font-weight="700" font-size="13" fill="currentColor" stroke="none">${num}</text>
          <text x="26" y="42" font-family="Georgia, serif" font-weight="700" font-size="13" fill="currentColor" stroke="none">${den}</text>
          ${notes}
        </svg>`;
      },
      listen: () => '<button type="button" class="replay theory-listen">&#9654; Écouter</button>',
      mount(root, ill) {
        const btn = root.querySelector('.theory-listen');
        const beats = root.querySelectorAll('.theory-glyph');
        const accentFirst = ill.sound && ill.sound.accentFirst;
        let playing = false;
        btn.addEventListener('click', () => {
          if (playing) return;
          playing = true;
          btn.disabled = true;
          for (let i = 0; i < ill.beats; i++) {
            setTimeout(() => {
              playClick(accentFirst && i === 0);
              beats[i].classList.add('is-active');
              if (accentFirst && i === 0) beats[i].classList.add('is-accent');
              setTimeout(() => beats[i].classList.remove('is-active', 'is-accent'), BEAT_SEC * 550);
            }, i * BEAT_SEC * 1000);
          }
          setTimeout(() => { playing = false; btn.disabled = false; }, ill.beats * BEAT_SEC * 1000);
        });
      },
    },

    accidentals: {
      icon(ill) {
        const xs = spread(ill.items.length, 150, 20);
        const parts = ill.items.map((item, i) => {
          const cx = xs[i];
          return `<g class="theory-glyph${item.sound ? ' is-playable' : ''}" data-i="${i}">${accidentalGlyph(cx, 24, item.variant)}${labelText(cx, 54, item.label)}</g>`;
        });
        return `<svg width="170" height="68" viewBox="0 0 150 60" fill="none" stroke="currentColor" stroke-linecap="round">${parts.join('')}</svg>`;
      },
      listen: () => '',
      mount(root, ill) {
        ill.items.forEach((item, i) => {
          if (!item.sound) return;
          const g = root.querySelector(`.theory-glyph[data-i="${i}"]`);
          const freq = semitoneFreq(ill.sound.freq, item.sound.semitone);
          g.addEventListener('click', () => { playTone(freq); flash(g, 0.7); });
        });
      },
    },
  };

  function renderIcon(illustration) {
    return ILLUSTRATIONS[illustration.type].icon(illustration);
  }

  function renderListen(illustration) {
    return ILLUSTRATIONS[illustration.type].listen(illustration);
  }

  function mount(sectionEl, illustration) {
    ILLUSTRATIONS[illustration.type].mount(sectionEl, illustration);
  }

  window.Notanext.theory = { renderIcon, renderListen, mount };
})();
