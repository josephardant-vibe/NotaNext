// Petit synthétiseur Web Audio : joue une hauteur donnée sans aucun fichier son.
window.Notanext = window.Notanext || {};

(function () {
  let ctx = null;

  function getContext() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // `duration` (secondes) : durée totale du son avant extinction complète.
  // Par défaut 0.7s, comme avant — les appels existants (jeux, "Les clés")
  // ne passent pas ce paramètre et ne changent pas de son.
  // `volume` (gain de crête, 0-1) : 0.25 par défaut, comme avant.
  function playTone(freq, duration, volume) {
    duration = duration || 0.7;
    volume = volume || 0.25;
    try {
      const audioCtx = getContext();
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      // Enveloppe courte pour éviter les clics et donner un son net.
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      // Le navigateur peut bloquer l'audio avant la première interaction : on ignore.
    }
  }

  // Clic de métronome (bruit court, non mélodique) : `accent` = premier temps,
  // plus fort et plus aigu que les autres.
  function playClick(accent) {
    try {
      const audioCtx = getContext();
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'square';
      osc.frequency.value = accent ? 1400 : 900;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(accent ? 0.3 : 0.16, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain).connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // idem : on ignore si l'audio est bloqué.
    }
  }

  window.Notanext.playTone = playTone;
  window.Notanext.playClick = playClick;
})();
