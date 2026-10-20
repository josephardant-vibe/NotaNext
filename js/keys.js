// Touches du clavier associées aux notes (Réglages > Clavier), communes à tous les jeux à boutons.
// On enregistre la touche PHYSIQUE (event.code : « KeyA » est la même touche sur AZERTY et sur QWERTY),
// pas la lettre : un joueur qui change de clavier garde la même rangée sous les doigts. La lettre affichée
// vient de la disposition détectée (API Keyboard Map, Chrome/Edge) ou, à défaut, du choix manuel du joueur.
window.Notanext = window.Notanext || {};

(function () {
  const { FR } = window.Notanext.data;
  const STORAGE = 'notanext.keys.v2';
  const OLD_STORAGE = 'notanext.keys'; // anciennes versions : lettres (« a »), pas des touches physiques
  const LAYOUT_KEY = 'notanext.layout';

  // ----- disposition du clavier -----
  const hasMap = !!(navigator.keyboard && navigator.keyboard.getLayoutMap);
  let layoutMap = null;       // Map code -> caractère, quand le navigateur sait la fournir
  let detected = null;        // 'azerty' | 'qwertz' | 'qwerty' (détectée)
  let manual = null;          // choix du joueur quand la détection est absente
  try { manual = localStorage.getItem(LAYOUT_KEY); } catch (e) { /* aucun choix */ }
  if (manual !== 'azerty' && manual !== 'qwerty') manual = null;

  function guessFromMap(map) {
    if (map.get('KeyQ') === 'a') return 'azerty';
    if (map.get('KeyY') === 'z') return 'qwertz';
    return 'qwerty';
  }
  const ready = hasMap
    ? navigator.keyboard.getLayoutMap().then((m) => { layoutMap = m; detected = guessFromMap(m); }).catch(() => { /* choix manuel */ })
    : Promise.resolve();

  // Disposition à utiliser pour la lettre affichée quand on n'a pas la carte du navigateur.
  const layout = () => detected || manual || (/^fr\b/i.test(navigator.language || '') ? 'azerty' : 'qwerty');
  const detectionAvailable = () => !!layoutMap;
  const SWAP_AZERTY = { KeyQ: 'a', KeyA: 'q', KeyW: 'z', KeyZ: 'w', Semicolon: 'm', KeyM: ',' };

  // Caractère à afficher pour une touche physique.
  function charOf(code) {
    if (!code) return '';
    if (layoutMap && layoutMap.get(code)) return layoutMap.get(code);
    if (/^Key[A-Z]$/.test(code)) {
      const base = code.slice(3).toLowerCase();
      return layout() === 'azerty' && SWAP_AZERTY[code] ? SWAP_AZERTY[code] : base;
    }
    if (/^Digit\d$/.test(code)) return code.slice(5);
    if (/^Numpad\d$/.test(code)) return code.slice(6);
    const names = { Semicolon: ';', Comma: ',', Period: '.', Slash: '/', Quote: "'", BracketLeft: '[', BracketRight: ']', Backslash: '\\', Minus: '-', Equal: '=', Backquote: '`', Space: 'Espace' };
    return names[code] || code;
  }
  const labelOf = (code) => { const c = charOf(code); return c.length === 1 ? c.toUpperCase() : c; };

  // Touche physique qui produit ce caractère sur la disposition courante.
  function codeForChar(ch) {
    ch = ch.toLowerCase();
    if (layoutMap) { for (const [code, v] of layoutMap) { if (v === ch) return code; } }
    if (!/^[a-z]$/.test(ch)) return null;
    if (layout() === 'azerty') { for (const k of Object.keys(SWAP_AZERTY)) { if (SWAP_AZERTY[k] === ch) return k; } }
    return 'Key' + ch.toUpperCase();
  }

  // ----- association note -> touche physique -----
  let keys = {};
  try { keys = JSON.parse(localStorage.getItem(STORAGE)) || {}; } catch (e) { keys = {}; }
  // Migration unique : anciennes lettres -> touches physiques (sur la disposition courante).
  try {
    if (!localStorage.getItem(STORAGE) && localStorage.getItem(OLD_STORAGE)) {
      const old = JSON.parse(localStorage.getItem(OLD_STORAGE)) || {};
      FR.forEach((n) => { if (typeof old[n] === 'string') { const c = codeForChar(old[n]); if (c) keys[n] = c; } });
      localStorage.setItem(STORAGE, JSON.stringify(keys));
    }
  } catch (e) { /* pas de migration */ }
  // Une fois la carte du navigateur connue, on refait la migration si elle avait été faite à l'aveugle.
  const save = () => { try { localStorage.setItem(STORAGE, JSON.stringify(keys)); } catch (e) { /* valable pour la session */ } };
  const changed = () => window.dispatchEvent(new Event('notanext:keys'));

  // Préréglages (touches physiques).
  const MIDDLE_ROW = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ']; // rangée du milieu, quelle que soit la disposition
  const NOTE_LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b']; // lettres de la notation anglaise
  function fill(kind) {
    keys = {};
    FR.forEach((n, i) => {
      const code = kind === 'letters' ? codeForChar(NOTE_LETTERS[i]) : MIDDLE_ROW[i];
      if (code) keys[n] = code;
    });
    save(); changed();
  }

  window.Notanext.keys = {
    ready, detectionAvailable, layout,
    setManualLayout(v) {
      manual = v === 'azerty' ? 'azerty' : 'qwerty';
      try { localStorage.setItem(LAYOUT_KEY, manual); } catch (e) { /* valable pour la session */ }
      changed();
    },
    get: (note) => keys[note] || null,
    all: () => Object.assign({}, keys),
    set(note, code) { keys[note] = code; save(); changed(); },
    clear() { keys = {}; save(); changed(); },
    fill,
    labelOf,
    noteFor(code) { return FR.find((n) => keys[n] === code) || null; },
    // Notes (autres que `note`) qui utilisent déjà la même touche.
    conflicts(note) {
      const code = keys[note];
      return code ? FR.filter((n) => n !== note && keys[n] === code) : [];
    },
  };
})();
