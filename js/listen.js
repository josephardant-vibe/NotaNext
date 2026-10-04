// Mini-jeux d'écoute pure ("Les bases : écoute et ressens").
// Chaque jeu est une donnée : titre, choix de réponse, et `next()` qui tire une
// question au hasard -> { answer, play() }. `play()` joue le(s) son(s) via
// audio.js (hauteur, durée et volume de playTone) et renvoie la durée totale
// en ms. Ajouter un jeu = une entrée dans GAMES ; game.js les affiche tous.
window.Notanext = window.Notanext || {};

(function () {
  const { playTone } = window.Notanext;
  const { FREQ } = window.Notanext.data;

  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  // Planifie une suite de sons { at (ms), freq, duration (s), volume }.
  function sequence(sounds) {
    let end = 0;
    sounds.forEach((s) => {
      setTimeout(() => playTone(s.freq, s.duration, s.volume), s.at);
      end = Math.max(end, s.at + s.duration * 1000);
    });
    return end;
  }

  const MID = [FREQ.Do4, FREQ.Ré4, FREQ.Mi4, FREQ.Fa4, FREQ.Sol4];

  const GAMES = [
    {
      id: 'pitch',
      title: 'Aigu ou grave ?',
      options: [{ id: 'aigu', label: 'Aigu' }, { id: 'grave', label: 'Grave' }],
      next() {
        const answer = pick(['aigu', 'grave']);
        const freq = pick(answer === 'aigu' ? [FREQ.Do5, FREQ.Ré5, FREQ.Mi5] : [FREQ.Do3, FREQ.Ré3, FREQ.Mi3]);
        return { answer, play: () => sequence([{ at: 0, freq, duration: 0.9 }]) };
      },
    },
    {
      id: 'length',
      title: 'Long ou court ?',
      options: [{ id: 'long', label: 'Long' }, { id: 'court', label: 'Court' }],
      next() {
        const answer = pick(['long', 'court']);
        const freq = pick(MID);
        return { answer, play: () => sequence([{ at: 0, freq, duration: answer === 'long' ? 1.5 : 0.3 }]) };
      },
    },
    {
      id: 'volume',
      title: 'Fort ou doux ?',
      options: [{ id: 'fort', label: 'Fort' }, { id: 'doux', label: 'Doux' }],
      next() {
        const answer = pick(['fort', 'doux']);
        const freq = pick(MID);
        return { answer, play: () => sequence([{ at: 0, freq, duration: 0.9, volume: answer === 'fort' ? 0.5 : 0.06 }]) };
      },
    },
    {
      id: 'same',
      title: 'Pareil ou différent ?',
      options: [{ id: 'pareil', label: 'Pareil' }, { id: 'different', label: 'Différent' }],
      next() {
        const answer = pick(['pareil', 'different']);
        const a = pick(MID);
        const b = answer === 'pareil' ? a : pick(MID.filter((f) => f !== a));
        return {
          answer,
          play: () => sequence([{ at: 0, freq: a, duration: 0.55 }, { at: 900, freq: b, duration: 0.55 }]),
        };
      },
    },
    {
      id: 'count',
      title: 'Combien de sons entends-tu ?',
      options: [{ id: '2', label: '2' }, { id: '3', label: '3' }, { id: '4', label: '4' }],
      next() {
        const n = pick([2, 3, 4]);
        const freq = pick(MID);
        return {
          answer: String(n),
          play: () => sequence(Array.from({ length: n }, (_, i) => ({ at: i * 550, freq, duration: 0.25 }))),
        };
      },
    },
  ];

  window.Notanext.listen = { GAMES };
})();
