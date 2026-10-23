// Retours bêta : une petite icône (bulle de dialogue au trait) qui ouvre le formulaire Tally en fenêtre
// flottante. Le même formulaire s'ouvre depuis Réglages > Bêta. Aucun formulaire maison.
// Le script de Tally n'est chargé qu'au premier clic : avant, aucune connexion à tally.so.
// Deux champs cachés sont joints à chaque envoi : « version » (js/version.js) et « page » (écran ou jeu en cours).
window.Notanext = window.Notanext || {};

(function () {
  const FORM_ID = 'yXP4ZW';
  const SCRIPT_SRC = 'https://tally.so/widgets/embed.js';
  const HIDDEN_KEY = 'notanext.feedback.hidden';
  const POS_KEY = 'notanext.feedback.pos'; // réserve : position libre (non utilisée tant que l'icône reste dans son coin)

  void POS_KEY;
  let loading = null;
  let isOpen = false;

  function loadScript() {
    if (window.Tally) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => { loading = null; reject(new Error('Tally indisponible')); };
      document.head.appendChild(s);
    });
    return loading;
  }

  // « page » : l'écran affiché, ou « Jeu : <nom> » quand un jeu est ouvert.
  function currentPage() {
    const t = document.title.replace(/^NotaNext\s+—\s+/, '').trim() || 'NotaNext';
    return document.body.classList.contains('in-game') ? `Jeu : ${t}` : t;
  }

  function open() {
    loadScript().then(() => {
      if (!window.Tally || !window.Tally.openPopup) throw new Error('Tally indisponible');
      window.Tally.openPopup(FORM_ID, {
        layout: 'modal',
        width: 420,
        overlay: true,
        hideTitle: false,
        hiddenFields: { version: window.Notanext.version || '', page: currentPage() },
        onOpen: () => { isOpen = true; },
        onClose: () => { isOpen = false; },
      });
    }).catch(() => {
      // Hors ligne ou script bloqué : on le dit simplement, sans rien envoyer.
      say("Impossible d'ouvrir le formulaire pour l'instant. Vérifie ta connexion et réessaie.");
    });
  }

  // Petit message d'état (région vivante, annoncée par les lecteurs d'écran) : se ferme tout seul ou au clic.
  const NOTE_MS = 10000;
  const note = document.createElement('div');
  note.className = 'fb-note';
  note.setAttribute('role', 'status');
  document.body.appendChild(note);
  let noteTimer = 0;
  function hideNote() { clearTimeout(noteTimer); note.classList.remove('on'); note.textContent = ''; } // vidée : plus rien à lire pour un lecteur d'écran
  function say(msg) {
    clearTimeout(noteTimer);
    note.textContent = msg;
    note.classList.add('on');
    noteTimer = setTimeout(hideNote, NOTE_MS);
  }
  note.addEventListener('click', hideNote);
  function close() { if (window.Tally && window.Tally.closePopup) window.Tally.closePopup(FORM_ID); isOpen = false; }

  // ----- icône -----
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'fb-btn';
  btn.className = 'fb-btn';
  btn.setAttribute('aria-label', 'Donner mon avis');
  btn.title = 'Donner mon avis';
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12z"/></svg>';
  document.body.appendChild(btn);

  let hidden = false;
  try { hidden = localStorage.getItem(HIDDEN_KEY) === '1'; } catch (e) { /* visible */ }
  const syncVisibility = () => { btn.hidden = hidden || document.body.classList.contains('is-home') || document.body.classList.contains('app-hint-on'); };
  new MutationObserver(syncVisibility).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  syncVisibility();

  function setHidden(v) {
    hidden = v;
    try { localStorage.setItem(HIDDEN_KEY, v ? '1' : '0'); } catch (e) { /* valable pour la session */ }
    syncVisibility();
  }

  // Un toucher / clic ouvre ou ferme le formulaire ; glisser l'icône vers le bord de l'écran la masque
  // (sans croix ni message) : « Réafficher l'icône » est dans Réglages > Bêta.
  let drag = null;
  // Distance entre le centre de l'icône et le bord d'écran le plus proche.
  const edgeDistance = (r) => {
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    return Math.min(cx, window.innerWidth - cx, cy, window.innerHeight - cy);
  };
  btn.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, startEdge: edgeDistance(btn.getBoundingClientRect()) };
    try { btn.setPointerCapture(e.pointerId); } catch (err) { /* pas de capture : on suit quand même */ }
  });
  btn.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 8) { drag.moved = true; btn.classList.add('dragging'); }
    if (drag.moved) btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  function endDrag(e, cancelled) {
    if (!drag || e.pointerId !== drag.id) return;
    const wasMoved = drag.moved;
    const startEdge = drag.startEdge;
    drag = null;
    btn.classList.remove('dragging');
    const moved = btn.getBoundingClientRect(); // position où elle a été lâchée
    btn.style.transform = '';
    if (!wasMoved || cancelled) return;
    btn.dataset.justDragged = '1';
    setTimeout(() => { delete btn.dataset.justDragged; }, 0);
    // Lâchée en direction d'un bord (plus près qu'au départ, à moins de 16 px du bord) : masquée.
    const endEdge = edgeDistance(moved);
    if (endEdge < startEdge - 10 && endEdge < 16) setHidden(true);
  }
  btn.addEventListener('pointerup', (e) => endDrag(e, false));
  btn.addEventListener('pointercancel', (e) => endDrag(e, true));
  btn.addEventListener('click', () => {
    if (btn.dataset.justDragged) return;
    if (isOpen) close(); else open();
  });

  window.Notanext.feedback = { open, close, showIcon: () => setHidden(false), hideIcon: () => setHidden(true) };
})();
