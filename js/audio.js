// Petit synthétiseur Web Audio : joue une hauteur donnée sans aucun fichier son.
window.Notanext = window.Notanext || {};

(function () {
  let ctx = null;

  function getContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function playTone(freq) {
    try {
      const audioCtx = getContext();
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      // Enveloppe courte pour éviter les clics et donner un son net.
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.75);
    } catch (e) {
      // Le navigateur peut bloquer l'audio avant la première interaction : on ignore.
    }
  }

  window.Notanext.playTone = playTone;
})();
