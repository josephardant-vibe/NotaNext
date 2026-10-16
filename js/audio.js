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

  // ---------- instruments (échantillons) ----------
  // Chaque instrument = quelques échantillons AAC dans audio/<id>/ (voir CREDITS.md). Une note
  // absente est obtenue en changeant la vitesse de l'échantillon le plus proche (3 demi-tons au
  // plus) ; une note hors de la plage [lo, hi] (numéros MIDI) est jouée à l'octave la plus proche
  // dans cette plage. Seul l'instrument choisi est chargé ; en attendant (ou si le chargement
  // échoue), la note est jouée par le synthétiseur ci-dessus.
  const INSTRUMENTS = {
    // lo / hi : plage jouable (numéros MIDI, hauteurs réelles) ; la borne basse suit la vraie note la plus
    // grave de l'instrument (sol3 violon, do4 flûte, mi3 trompette en si bémol, mi2 guitare).
    // detune : écart mesuré de l'échantillon par rapport à sa note (cents), corrigé à la lecture.
    piano:   { label: 'Piano',     samples: ['Ds2', 'A2', 'Ds3', 'A3', 'Ds4', 'A4', 'Ds5', 'A5'], lo: 36, hi: 84, gain: 0.8,
               detune: { Ds2: 4, A2: 2, A3: 5, Ds4: 6, A4: 6, Ds5: 5, A5: 7 } },
    violin:  { label: 'Violon',    samples: ['G3', 'C4', 'G4', 'C5', 'E5', 'C6'],           lo: 55, hi: 87, gain: 0.85,
               detune: { C4: -3, E5: 16 } },
    flute:   { label: 'Flûte',     samples: ['C4', 'E4', 'A4', 'E5', 'C6'],                 lo: 60, hi: 87, gain: 0.85 },
    trumpet: { label: 'Trompette', samples: ['F3', 'C4', 'G4', 'D5', 'C6'],                 lo: 52, hi: 84, gain: 0.8,
               detune: { F3: -12, C4: -3 } },
    guitar:  { label: 'Guitare',   samples: ['E2', 'B2', 'F3', 'C4', 'G4'],                 lo: 40, hi: 70, gain: 0.85 },
  };
  const INSTRUMENT_KEY = 'notanext.instrument';
  const PC = { C: 0, Cs: 1, D: 2, Ds: 3, E: 4, F: 5, Fs: 6, G: 7, Gs: 8, A: 9, As: 10, B: 11 };
  const sampleMidi = (name) => 12 * (Number(name.slice(-1)) + 1) + PC[name.slice(0, -1)];
  const freqToMidi = (f) => Math.round(69 + 12 * Math.log2(f / 440));

  let current = 'piano';
  try { const v = localStorage.getItem(INSTRUMENT_KEY); if (INSTRUMENTS[v]) current = v; } catch (e) { /* piano */ }

  const loaded = {};   // id -> [{ midi, buffer }]
  const loading = {};  // id -> Promise

  function decode(data) {
    return new Promise((resolve, reject) => getContext().decodeAudioData(data, resolve, reject));
  }

  function loadInstrument(id) {
    if (loaded[id]) return Promise.resolve(loaded[id]);
    if (loading[id]) return loading[id];
    const inst = INSTRUMENTS[id];
    loading[id] = Promise.all(inst.samples.map((name) =>
      fetch(`audio/${id}/${name}.m4a`).then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
        .then(decode).then((buffer) => ({ midi: sampleMidi(name), buffer, cents: (inst.detune && inst.detune[name]) || 0 }))
    )).then((list) => { loaded[id] = list; return list; })
      .catch((e) => { delete loading[id]; throw e; }); // pas de blocage définitif : un prochain essai recharge
    return loading[id];
  }

  function fold(midi, inst) {
    while (midi < inst.lo) midi += 12;
    while (midi > inst.hi) midi -= 12;
    return midi;
  }

  function playSample(list, inst, midi) {
    try {
      const audioCtx = getContext();
      const now = audioCtx.currentTime;
      const s = list.reduce((best, c) => (Math.abs(c.midi - midi) < Math.abs(best.midi - midi) ? c : best));
      const src = audioCtx.createBufferSource();
      const gain = audioCtx.createGain();
      src.buffer = s.buffer;
      src.playbackRate.value = Math.pow(2, (midi - s.midi) / 12 - s.cents / 1200);
      gain.gain.value = inst.gain;
      src.connect(gain).connect(audioCtx.destination);
      src.start(now);
    } catch (e) { /* audio bloqué : on ignore */ }
  }

  // Joue la note (fréquence) avec l'instrument choisi.
  function playNote(freq) {
    const id = current;
    const inst = INSTRUMENTS[id];
    // Réveille le contexte audio tout de suite, pendant le geste de l'utilisateur : certains navigateurs
    // (Safari surtout) refusent de le faire plus tard, après le chargement asynchrone des échantillons.
    try { getContext(); } catch (e) { /* audio indisponible */ }
    const midi = fold(freqToMidi(freq), inst);
    if (loaded[id]) return playSample(loaded[id], inst, midi);
    loadInstrument(id).then((list) => { if (current === id) playSample(list, inst, midi); }).catch(() => playTone(freq));
  }

  // Vrai si au moins une des fréquences est hors de la plage de l'instrument (jouée à l'octave).
  function needsFold(id, freqs) {
    const inst = INSTRUMENTS[id];
    return freqs.some((f) => { const m = freqToMidi(f); return m < inst.lo || m > inst.hi; });
  }

  // Vrai si la note est jouée à sa vraie hauteur par l'instrument (sans décalage d'octave).
  function inRange(id, freq) {
    const inst = INSTRUMENTS[id];
    const m = freqToMidi(freq);
    return m >= inst.lo && m <= inst.hi;
  }

  function setInstrument(id) {
    if (!INSTRUMENTS[id]) return;
    current = id;
    try { localStorage.setItem(INSTRUMENT_KEY, id); } catch (e) { /* valable pour la session */ }
    try { getContext(); } catch (e) { /* audio indisponible */ }
    loadInstrument(id).catch(() => {});
    window.dispatchEvent(new Event('notanext:instrument'));
  }

  // Déverrouillage au premier geste (clic, toucher, touche) : crée et réveille le contexte audio.
  const unlock = () => {
    try { getContext(); } catch (e) { /* idem */ }
    ['pointerdown', 'keydown', 'touchend'].forEach((t) => document.removeEventListener(t, unlock, true));
  };
  ['pointerdown', 'keydown', 'touchend'].forEach((t) => document.addEventListener(t, unlock, true));

  window.Notanext.playTone = playTone;
  window.Notanext.playNote = playNote;
  window.Notanext.instruments = {
    LIST: Object.keys(INSTRUMENTS), INSTRUMENTS, get: () => current, set: setInstrument, load: loadInstrument, needsFold, inRange,
  };
  window.Notanext.playClick = playClick;
})();
