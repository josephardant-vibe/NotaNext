// Données du jeu : clés, notes, exercices, FAQ.
// Ajouter une clé ou un exercice = une entrée dans ces listes, rien d'autre.
window.Notanext = window.Notanext || {};

(function () {
  const FR = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

  // ----- Notation d'affichage (réglage global, mémorisé dans le navigateur) -----
  // En interne les notes gardent leur nom français (fréquences, touches, quiz) ; seul
  // `label(nom)` traduit ce qui est affiché. Les textes de leçons restent en français.
  const EN_NAMES = { Do: 'C', Ré: 'D', Mi: 'E', Fa: 'F', Sol: 'G', La: 'A', Si: 'B' };
  const NOTATION_KEY = 'notanext.notation';
  // Ordre d'affichage des boutons de réponse : l'ordre normal, 4 en haut, 3 centrés dessous.
  const ANSWER_ORDER = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
  let notation = 'fr';
  try { if (localStorage.getItem(NOTATION_KEY) === 'en') notation = 'en'; } catch (e) { /* stockage indisponible : français */ }

  const getNotation = () => notation;
  function setNotation(value) {
    notation = value === 'en' ? 'en' : 'fr';
    try { localStorage.setItem(NOTATION_KEY, notation); } catch (e) { /* valable pour la session */ }
    window.dispatchEvent(new Event('notanext:notation'));
  }
  const label = (name) => (notation === 'en' ? EN_NAMES[name] || name : name);

  const FREQ = {
    Mi2: 82.41, Fa2: 87.31, Sol2: 98.0, La2: 110.0, Si2: 123.47,
    Do3: 130.81, Ré3: 146.83, Mi3: 164.81, Fa3: 174.61, Sol3: 196.0, La3: 220.0, Si3: 246.94,
    Do4: 261.63, Ré4: 293.66, Mi4: 329.63, Fa4: 349.23, Sol4: 392.0, La4: 440.0, Si4: 493.88,
    Do5: 523.25, Ré5: 587.33, Mi5: 659.25, Fa5: 698.46, Sol5: 783.99, La5: 880.0, Si5: 987.77, Do6: 1046.5,
  };

  // Numéro diatonique absolu -> note (Do0 = 0, Si0 = 6, Do1 = 7, ...).
  function fromAbs(a) {
    const name = FR[((a % 7) + 7) % 7];
    const octave = Math.floor(a / 7);
    return { name, octave, freq: FREQ[name + octave] };
  }

  // `base` = numéro diatonique absolu de la note posée sur la ligne du bas de la portée.
  // `line` = ligne (0,2,4,6,8) sur laquelle la clé fixe sa note de référence —
  // c'est aussi la ligne sur laquelle js/staff.js calibre le tracé de la clé
  // (`shape`), donc modifier `line` seul suffit à replacer correctement le dessin.
  const CLEFS = [
    { id: 'sol', label: 'Clé de sol',       shape: 'treble', base: 30, line: 2 },
    { id: 'fa',  label: 'Clé de fa',         shape: 'bass',   base: 18, line: 6 },
    { id: 'utA', label: "Clé d'ut (alto)",   shape: 'cclef',  base: 24, line: 4 },
    { id: 'utT', label: "Clé d'ut (ténor)",  shape: 'cclef',  base: 22, line: 6 },
  ];

  function clefById(id) {
    return CLEFS.find((c) => c.id === id);
  }

  // Les 14 notes naturelles de la clé : de la 1re ligne supplémentaire sous la portée
  // (Do4 en clé de sol) à l'interligne au-dessus de la 1re ligne supplémentaire (Si5 en clé de sol).
  // `step` : position verticale, 0 = ligne du bas de la portée.
  const STEP_MIN = -2;
  const STEP_MAX = 11;
  function notesOf(clef) {
    const steps = [];
    for (let s = STEP_MIN; s <= STEP_MAX; s++) steps.push(s);
    return steps.map((step) => ({ ...fromAbs(clef.base + step), step }));
  }

  // Tirage des notes avec rappel prioritaire des notes ratées : une fausse réponse remet cette note
  // dans la file ; elle revient dès que possible, après `minGap` autres notes (0 = au prochain tirage).
  // Une note ratée au moins 2 fois sur les 20 dernières réponses revient 2 fois. Sans note ratée, le
  // tirage est aléatoire (jamais deux fois la même note de suite).
  function createPicker(getNotes, opts) {
    const minGap = (opts && opts.minGap) || 0;
    const keyOf = (n) => (n.step != null ? 's' + n.step : n.name);
    let history = []; // { key, ok } : les 20 dernières réponses
    let queue = [];   // clés à redemander
    let gap = 99;     // tirages depuis la dernière erreur
    let lastKey = null;
    function next() {
      const notes = getNotes();
      let chosen = null;
      if (queue.length && gap >= minGap) {
        const i = queue.findIndex((k) => notes.some((n) => keyOf(n) === k));
        if (i >= 0) { const k = queue.splice(i, 1)[0]; chosen = notes.find((n) => keyOf(n) === k); }
      }
      if (!chosen) {
        const pool = notes.length > 1 ? notes.filter((n) => keyOf(n) !== lastKey) : notes;
        chosen = pool[Math.floor(Math.random() * pool.length)];
      }
      gap++;
      lastKey = keyOf(chosen);
      return chosen;
    }
    function record(note, ok) {
      const key = keyOf(note);
      history.push({ key, ok });
      if (history.length > 20) history.shift();
      if (ok) return;
      const wanted = history.filter((h) => h.key === key && !h.ok).length >= 2 ? 2 : 1;
      while (queue.filter((k) => k === key).length < wanted) queue.push(key);
      gap = 0;
    }
    function reset() { history = []; queue = []; gap = 99; lastKey = null; }
    return { next, record, reset };
  }

  const EXERCISES = [
    {
      id: 'guess-window',
      title: 'Deviner la note',
      tag: 'Plusieurs notes à l\'écran : trouve le nom de celle repérée par le trait.',
      mode: 'guess-window',
      icon: '<svg viewBox="0 0 60 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><ellipse cx="8" cy="30" rx="6" ry="4.5" transform="rotate(-15 8 30)"/><line x1="14" y1="27" x2="14" y2="8"/><ellipse cx="28" cy="30" rx="6" ry="4.5" transform="rotate(-15 28 30)"/><line x1="34" y1="27" x2="34" y2="8"/><ellipse cx="48" cy="30" rx="6" ry="4.5" transform="rotate(-15 48 30)"/><line x1="54" y1="27" x2="54" y2="8"/><line x1="28" y1="2" x2="28" y2="38" stroke-width="1.5" opacity="0.7"/></svg>',
    },
    {
      id: 'guess-scroll',
      title: 'Défilement continu',
      tag: "Les notes défilent, réponds sans t'arrêter.",
      mode: 'guess-scroll',
      icon: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><ellipse cx="13" cy="29" rx="9" ry="6.5" transform="rotate(-18 13 29)"/><path d="M21 27 V 7 C 30 10, 34 16, 32 24"/></svg>',
    },
    {
      id: 'place',
      title: 'Placer la note',
      tag: 'On te donne un nom, place la note sur la portée.',
      mode: 'place',
      icon: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><ellipse cx="13" cy="29" rx="9" ry="6.5" transform="rotate(-18 13 29)" stroke-dasharray="3 3"/><line x1="21" y1="27" x2="21" y2="7" stroke-dasharray="3 3"/></svg>',
    },
    {
      id: 'ear-guess',
      title: 'Oreille absolue — deviner',
      tag: 'Écoute un son, trouve la note.',
      mode: 'ear-guess',
    },
    {
      id: 'ear-place',
      title: 'Oreille absolue — placer',
      tag: 'Écoute un son, place-le sur la portée.',
      mode: 'ear-place',
    },
  ];

  // "Apprendre" est aussi une grille de cartes : ajouter une future leçon
  // = une entrée ici, comme pour EXERCISES.
  const LEARN_CARDS = [
    {
      id: 'clefs',
      title: 'Les clés',
      tag: 'Repères sur la portée et FAQ, clé par clé.',
      icon: '<svg viewBox="0 0 60 90" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M30 6 C 44 20, 44 34, 30 46 C 18 56, 14 44, 22 38 C 34 30, 44 44, 34 58 C 26 70, 12 66, 10 54 M30 6 C 22 22, 26 44, 30 60 C 33 74, 30 86, 22 86 C 14 86, 12 78, 18 76"/></svg>',
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
      'Violon, flûte, hautbois, clarinette, trompette, saxophone, main droite au piano, harpe (avec la clé de fa), voix soprano, alto et ténor (le ténor se note une octave au-dessus de sa hauteur réelle).',
      'Convient aux notes aiguës — en clé de fa, ces notes demanderaient trop de lignes supplémentaires au-dessus.',
      "Oui, la clé la plus utilisée en musique aujourd'hui.",
    ],
    fa: [
      "La clé de fa t'indique où se trouve la note Fa sur la portée : elle est placée sur la 4e ligne en partant du bas. À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces.",
      'Violoncelle, contrebasse, basson, trombone, tuba, main gauche au piano, voix graves.',
      'Convient aux notes graves — en clé de sol, ces notes demanderaient trop de lignes en dessous.',
      'Oui : avec la clé de sol, c\'est l\'une des deux clés les plus courantes ; elles se complètent aux deux mains du piano.',
    ],
    utA: [
      "La clé d'ut alto t'indique où se trouve le Do central sur la portée : il est placé sur la ligne du milieu (la 3e en partant du bas). À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces.",
      "Principalement l'alto (instrument à cordes).",
      "La tessiture de l'alto se situe entre le violon et le violoncelle — les clés de sol et de fa lui imposeraient des lignes supplémentaires.",
      "Oui, surtout pour l'alto (instrument à cordes). La clé d'ut ténor reste aussi employée, pour les passages aigus d'autres instruments.",
    ],
    utT: [
      "La clé d'ut ténor t'indique où se trouve le Do central sur la portée : il est placé sur la 4e ligne en partant du bas. À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces.",
      'Passages aigus du violoncelle, du basson et du trombone ténor.',
      'Évite trop de lignes au-dessus de la portée dans le registre aigu de ces instruments.',
      'Oui : pour les passages aigus du violoncelle et du trombone ténor, et très couramment au basson.',
    ],
  };

  window.Notanext.data = {
    FR, ANSWER_ORDER, createPicker, label, getNotation, setNotation, FREQ, CLEFS, clefById, notesOf, EXERCISES, LEARN_CARDS, FAQ_QUESTIONS, FAQ_ANSWERS,
  };
})();
