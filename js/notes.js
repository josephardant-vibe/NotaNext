// Notes naturelles jouables, du Do sous la portée au Fa en haut de la portée.
window.Notanext = window.Notanext || {};

(function () {
  // `step` = position verticale sur la portée en demi-espacements de ligne, 0 = Mi4 (ligne du bas).
  const NOTES = [
    { name: 'Do',  octave: 4, freq: 261.63, step: -2 },
    { name: 'Ré',  octave: 4, freq: 293.66, step: -1 },
    { name: 'Mi',  octave: 4, freq: 329.63, step: 0 },
    { name: 'Fa',  octave: 4, freq: 349.23, step: 1 },
    { name: 'Sol', octave: 4, freq: 392.00, step: 2 },
    { name: 'La',  octave: 4, freq: 440.00, step: 3 },
    { name: 'Si',  octave: 4, freq: 493.88, step: 4 },
    { name: 'Do',  octave: 5, freq: 523.25, step: 5 },
    { name: 'Ré',  octave: 5, freq: 587.33, step: 6 },
    { name: 'Mi',  octave: 5, freq: 659.25, step: 7 },
    { name: 'Fa',  octave: 5, freq: 698.46, step: 8 },
  ];

  const NOTE_NAMES = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

  function randomNote() {
    return NOTES[Math.floor(Math.random() * NOTES.length)];
  }

  window.Notanext.NOTES = NOTES;
  window.Notanext.NOTE_NAMES = NOTE_NAMES;
  window.Notanext.randomNote = randomNote;
})();
