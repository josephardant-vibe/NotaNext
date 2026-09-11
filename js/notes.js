// Données du jeu : clés, notes, exercices, FAQ.
// Ajouter une clé ou un exercice = une entrée dans ces listes, rien d'autre.
window.Notanext = window.Notanext || {};

(function () {
  const FR = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

  const FREQ = {
    Mi2: 82.41, Fa2: 87.31, Sol2: 98.0, La2: 110.0, Si2: 123.47,
    Do3: 130.81, Ré3: 146.83, Mi3: 164.81, Fa3: 174.61, Sol3: 196.0, La3: 220.0, Si3: 246.94,
    Do4: 261.63, Ré4: 293.66, Mi4: 329.63, Fa4: 349.23, Sol4: 392.0, La4: 440.0, Si4: 493.88,
    Do5: 523.25, Ré5: 587.33, Mi5: 659.25, Fa5: 698.46,
  };

  // Numéro diatonique absolu -> note (Do0 = 0, Si0 = 6, Do1 = 7, ...).
  function fromAbs(a) {
    const name = FR[((a % 7) + 7) % 7];
    const octave = Math.floor(a / 7);
    return { name, octave, freq: FREQ[name + octave] };
  }

  // `base` = numéro diatonique absolu de la note posée sur la ligne du bas de la portée.
  // `line` = ligne (0,2,4,6,8) sur laquelle la clé fixe sa note de référence.
  const CLEFS = [
    { id: 'sol', label: 'Clé de sol',       glyph: '𝄞', base: 30, line: 2, glyphSize: 104, glyphDy: 38 },
    { id: 'fa',  label: 'Clé de fa',         glyph: '𝄢', base: 18, line: 6, glyphSize: 70,  glyphDy: 26 },
    { id: 'utA', label: "Clé d'ut (alto)",   glyph: '𝄡', base: 24, line: 4, glyphSize: 74,  glyphDy: 26 },
    { id: 'utT', label: "Clé d'ut (ténor)",  glyph: '𝄡', base: 22, line: 6, glyphSize: 74,  glyphDy: 26 },
  ];

  function clefById(id) {
    return CLEFS.find((c) => c.id === id);
  }

  // Les 11 notes naturelles de la clé, du Do (ou équivalent) sous la portée
  // au Fa (ou équivalent) en haut. `step` : position verticale, 0 = ligne du bas.
  function notesOf(clef) {
    return [-2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8].map((step) => ({ ...fromAbs(clef.base + step), step }));
  }

  const EXERCISES = [
    {
      id: 'guess-window',
      title: 'Deviner la note',
      tag: 'Plusieurs notes défilent, trouve celle repérée par le trait.',
      mode: 'guess-window',
      icon: '<svg viewBox="0 0 60 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><ellipse cx="8" cy="30" rx="6" ry="4.5" transform="rotate(-15 8 30)"/><line x1="14" y1="27" x2="14" y2="8"/><ellipse cx="28" cy="30" rx="6" ry="4.5" transform="rotate(-15 28 30)"/><line x1="34" y1="27" x2="34" y2="8"/><ellipse cx="48" cy="30" rx="6" ry="4.5" transform="rotate(-15 48 30)"/><line x1="54" y1="27" x2="54" y2="8"/><line x1="28" y1="2" x2="28" y2="38" stroke-width="1.5" opacity="0.7"/></svg>',
    },
    {
      id: 'guess-scroll',
      title: 'Deviner la note - défilement continu',
      tag: 'Une note est affichée, trouve son nom.',
      mode: 'guess-scroll',
      icon: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><ellipse cx="13" cy="29" rx="9" ry="6.5" transform="rotate(-18 13 29)"/><path d="M21 27 V 7 C 30 10, 34 16, 32 24"/></svg>',
    },
    {
      id: 'place',
      title: 'Placer la note',
      tag: 'Un nom est donné, place-le sur la portée.',
      mode: 'place',
      icon: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><ellipse cx="13" cy="29" rx="9" ry="6.5" transform="rotate(-18 13 29)" stroke-dasharray="3 3"/><line x1="21" y1="27" x2="21" y2="7" stroke-dasharray="3 3"/></svg>',
    },
  ];

  // FAQ : mêmes 4 questions pour chaque clé, réponses par clé (id -> [r1, r2, r3, r4]).
  const FAQ_QUESTIONS = [
    'Que fixe cette clé ?',
    'Pour quels instruments/voix ?',
    "Pourquoi cette clé plutôt qu'une autre ?",
    "Est-elle encore utilisée aujourd'hui ?",
  ];

  const FAQ_ANSWERS = {
    sol: [
      "La clé de sol t'indique où se trouve la note Sol sur la portée : elle est placée sur la 2e ligne en partant du bas. À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces.",
      'Violon, flûte, hautbois, clarinette, trompette, saxophone, main droite au piano, harpe, voix soprano/alto/ténor.',
      'Convient aux notes aiguës — en clé de fa, ces notes demanderaient trop de lignes supplémentaires au-dessus.',
      "Oui, la clé la plus utilisée en musique aujourd'hui.",
    ],
    fa: [
      "La clé de fa t'indique où se trouve la note Fa sur la portée : elle est placée sur la 4e ligne en partant du bas. À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces.",
      'Violoncelle, contrebasse, basson, trombone, tuba, main gauche au piano, voix graves.',
      'Convient aux notes graves — en clé de sol, ces notes demanderaient trop de lignes en dessous.',
      'Oui, la deuxième plus utilisée, complémentaire de la clé de sol au piano.',
    ],
    utA: [
      "La clé d'ut alto t'indique où se trouve le Do central sur la portée : il est placé sur la ligne du milieu (la 3e en partant du bas). À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces.",
      "Principalement l'alto (instrument à cordes).",
      "La tessiture de l'alto se situe entre le violon et le violoncelle — les deux autres clés lui imposeraient des lignes supplémentaires.",
      "Oui, la seule clé d'ut encore couramment utilisée en pratique courante.",
    ],
    utT: [
      "La clé d'ut ténor t'indique où se trouve le Do central sur la portée : il est placé sur la 4e ligne en partant du bas. À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces.",
      'Passages aigus du violoncelle, du basson et du trombone ténor.',
      'Évite trop de lignes au-dessus de la portée dans le registre aigu de ces instruments.',
      'Oui mais ponctuellement, pour les passages aigus de ces instruments.',
    ],
  };

  window.Notanext.data = {
    FR, CLEFS, clefById, notesOf, EXERCISES, FAQ_QUESTIONS, FAQ_ANSWERS,
  };
})();
