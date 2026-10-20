// Écran Réglages : une page simple, dans l'ordre Affichage, Clavier, Son, Mes données, Bêta, Informations.
// Rien n'est envoyé nulle part depuis cette page : tout reste dans ce navigateur (sauf le formulaire de retours).
window.Notanext = window.Notanext || {};

(function () {
  const { data, instrumentMenu, sound } = window.Notanext;
  const { FR, label, getNotation, setNotation } = data;
  const K = window.Notanext.keys;
  const root = document.getElementById('settings-panel');
  const viewEl = document.getElementById('view-settings');
  const isPhone = () => Math.min(window.innerWidth, window.innerHeight) <= 500;

  const CHEVRON_DOWN = '<svg class="set-chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const CHEVRON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  // Réglages effacés par « Réinitialiser » (le reste du stockage n'est pas touché).
  const RESET_KEYS = ['notanext.notation', 'notanext.keys.v2', 'notanext.keys', 'notanext.layout', 'notanext.volume', 'notanext.muted',
    'notanext.instrument', 'notanext.autorotate', 'notanext.earplace.names'];
  const PREVIEW_IDS = ['piano', 'guitar', 'flute'];
  const PREVIEW_FREQ = 261.63; // Do4

  let waiting = null; // note dont on attend la touche
  let onCapture = null;

  function html() {
    const phone = isPhone();
    return `
      <div class="settings">
        <h1>Réglages</h1>

        <details class="set-sec"><summary><h2 id="set-aff">Affichage</h2>${CHEVRON_DOWN}</summary><div class="set-body">
          <div class="seg-wrap">
            <span class="seg-label">Notation des notes</span>
            <div class="seg" role="group" aria-label="Notation des notes">
              <button type="button" class="seg-btn" data-notation="fr">Français</button>
              <button type="button" class="seg-btn" data-notation="en">Anglais</button>
            </div>
          </div>
          <p class="set-hint">Notation des notes : Do Ré Mi / C D E.</p>
          ${phone ? '<label class="switch"><input type="checkbox" id="set-rotate" role="switch"><span class="switch-track"><span class="switch-thumb"></span></span><span>Rotation automatique des jeux</span></label>' : ''}
        </div></details>

        ${phone ? '' : `
        <details class="set-sec"><summary><h2 id="set-clav">Clavier</h2>${CHEVRON_DOWN}</summary><div class="set-body">
          <p class="set-hint" id="set-layout-info"></p>
          <div class="seg-wrap" id="set-layout-pick" hidden>
            <span class="seg-label">Ton clavier</span>
            <div class="seg" role="group" aria-label="Disposition de ton clavier">
              <button type="button" class="seg-btn" data-layout="azerty">AZERTY</button>
              <button type="button" class="seg-btn" data-layout="qwerty">QWERTY</button>
            </div>
          </div>
          <p class="set-hint">Clique une note, puis appuie sur la touche de ton choix. Valable pour tous les jeux à boutons.</p>
          <div class="kbd-rows">
            ${FR.map((n) => `<div class="kbd-row"><span class="kbd-name" data-note="${n}"></span><button type="button" class="kbd-key" data-note="${n}"></button></div>`).join('')}
          </div>
          <p class="set-warn" id="set-dups" role="status" hidden></p>
          <div class="set-fill">
            <span class="seg-label">Remplir automatiquement</span>
            <div class="theory-nav">
              <button type="button" class="btn-secondary" id="set-fill-mid">Rangée du milieu du clavier</button>
              <button type="button" class="btn-secondary" id="set-fill-letters">Lettres des notes (C D E F G A B)</button>
            </div>
          </div>
          <div class="theory-nav"><button type="button" class="btn-secondary" id="set-clear">Tout effacer</button></div>
        </div></details>`}

        <details class="set-sec"><summary><h2 id="set-son">Son</h2>${CHEVRON_DOWN}</summary><div class="set-body">
          <div class="set-vol">
            <label for="set-volume">Volume</label>
            <input type="range" id="set-volume" min="0" max="100" step="5">
            <output id="set-volume-out" for="set-volume"></output>
          </div>
          <label class="switch"><input type="checkbox" id="set-mute" role="switch"><span class="switch-track"><span class="switch-thumb"></span></span><span>Couper le son</span></label>
          <p class="seg-label set-inst-label" id="set-inst-label">Instrument : appuie pour écouter</p>
          <div class="set-inst" role="group" aria-labelledby="set-inst-label">
            ${PREVIEW_IDS.map((id) => `<button type="button" class="inst-big set-inst-btn" data-id="${id}"><span class="inst-ico" style="color:${instrumentMenu.META[id].color}">${instrumentMenu.META[id].icon}</span><span>${instrumentMenu.label(id)}</span></button>`).join('')}
          </div>
        </div></details>

        <details class="set-sec"><summary><h2 id="set-data">Mes données</h2>${CHEVRON_DOWN}</summary><div class="set-body">
          <div id="set-reset-idle"><button type="button" class="btn-secondary" id="set-reset">${phone ? 'Réinitialiser mes réglages' : 'Réinitialiser tous mes réglages'}</button></div>
          <div id="set-reset-confirm" class="set-confirm" role="group" aria-labelledby="set-confirm-t" hidden>
            <p id="set-confirm-t"><strong>Réinitialiser tous mes réglages ?</strong><br>Notation, touches et son reviendront aux valeurs d'origine.</p>
            <div class="theory-nav">
              <button type="button" class="btn-primary" id="set-reset-yes">Réinitialiser</button>
              <button type="button" class="btn-secondary" id="set-reset-no">Annuler</button>
            </div>
          </div>
          <p class="set-hint">Tes réglages restent dans ce navigateur. Le formulaire de retours est la seule chose qui envoie un message, quand tu appuies sur Envoyer.</p>
        </div></details>

        <details class="set-sec"><summary><h2 id="set-beta">Bêta</h2>${CHEVRON_DOWN}</summary><div class="set-body">
          <p class="set-hint">Dis-nous ce qui marche, ce qui bloque ou ce qui manque.</p>
          <div class="theory-nav"><button type="button" class="btn-primary" id="set-feedback">Donner mon avis</button></div>
          <p class="set-hint">Version : <span id="set-version"></span></p>
          <p class="set-hint">L'icône de retours est masquée ? Tu peux la remettre.</p>
          <div class="theory-nav"><button type="button" class="btn-secondary" id="set-showicon">Réafficher l'icône</button></div>
        </div></details>

        <details class="set-sec"><summary><h2 id="set-info">Informations</h2>${CHEVRON_DOWN}</summary><div class="set-body">
          <ul class="set-links">
            <li><a href="#/accueil">À propos de NotaNext ${CHEVRON}</a></li>
            <li><a href="#/mentions-legales">Mentions légales ${CHEVRON}</a></li>
            <li><a href="#/confidentialite">Confidentialité ${CHEVRON}</a></li>
            <li><a href="#/credits">Crédits et licences ${CHEVRON}</a></li>
          </ul>
        </div></details>
      </div>`;
  }

  function teardown() {
    waiting = null;
    K.capturing = false;
    if (onCapture) { document.removeEventListener('keydown', onCapture, true); onCapture = null; }
  }

  function build() {
    teardown();
    root.innerHTML = html();
    const q = (sel) => root.querySelector(sel);

    // ----- notation -----
    const segs = Array.from(root.querySelectorAll('[data-notation]'));
    segs.forEach((b) => b.addEventListener('click', () => { setNotation(b.dataset.notation); paint(); }));

    // ----- rotation (téléphone) -----
    const rot = q('#set-rotate');
    if (rot) {
      rot.checked = window.Notanext.app.getAutoRotate();
      rot.addEventListener('change', () => window.Notanext.app.setAutoRotate(rot.checked));
    }

    // ----- clavier -----
    const keyBtns = Array.from(root.querySelectorAll('.kbd-key'));
    const nameEls = Array.from(root.querySelectorAll('.kbd-name'));
    if (keyBtns.length) {
      keyBtns.forEach((b) => b.addEventListener('click', () => { waiting = b.dataset.note; K.capturing = true; paint(); }));
      const stop = () => { waiting = null; K.capturing = false; };
      q('#set-fill-mid').addEventListener('click', () => { K.fill('middle'); stop(); paint(); });
      q('#set-fill-letters').addEventListener('click', () => { K.fill('letters'); stop(); paint(); });
      q('#set-clear').addEventListener('click', () => { K.clear(); stop(); paint(); });
      root.querySelectorAll('[data-layout]').forEach((b) => b.addEventListener('click', () => { K.setManualLayout(b.dataset.layout); paint(); }));
      // Capture : une touche physique (event.code) ; Échap annule.
      onCapture = (e) => {
        if (!waiting || viewEl.hidden) return;
        e.preventDefault();
        e.stopPropagation();
        if (/^(Shift|Control|Alt|Meta)(Left|Right)$/.test(e.code) || e.code === 'CapsLock' || e.code === 'Tab' || e.key === 'Dead') return;
        if (e.key !== 'Escape') K.set(waiting, e.code);
        stop();
        paint();
      };
      document.addEventListener('keydown', onCapture, true);
    }

    // ----- son -----
    const vol = q('#set-volume');
    const volOut = q('#set-volume-out');
    const mute = q('#set-mute');
    vol.addEventListener('input', () => { sound.setVolume(Number(vol.value)); paintSound(); });
    mute.addEventListener('change', () => { sound.setMuted(mute.checked); paintSound(); });
    root.querySelectorAll('.set-inst-btn').forEach((b) => b.addEventListener('click', () => sound.preview(b.dataset.id, PREVIEW_FREQ)));
    function paintSound() {
      vol.value = String(sound.getVolume());
      volOut.textContent = sound.getVolume() + ' %';
      mute.checked = sound.isMuted();
    }

    // ----- mes données -----
    const idle = q('#set-reset-idle');
    const confirmBox = q('#set-reset-confirm');
    q('#set-reset').addEventListener('click', () => { idle.hidden = true; confirmBox.hidden = false; q('#set-reset-no').focus(); });
    q('#set-reset-no').addEventListener('click', () => { confirmBox.hidden = true; idle.hidden = false; q('#set-reset').focus(); });
    q('#set-reset-yes').addEventListener('click', () => {
      RESET_KEYS.forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* rien à effacer */ } });
      location.reload();
    });

    // ----- bêta -----
    q('#set-version').textContent = window.Notanext.version || '';
    q('#set-feedback').addEventListener('click', () => { if (window.Notanext.feedback) window.Notanext.feedback.open(); });
    q('#set-showicon').addEventListener('click', () => { if (window.Notanext.feedback) window.Notanext.feedback.showIcon(); });

    function paint() {
      segs.forEach((b) => { const on = b.dataset.notation === getNotation(); b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
      if (keyBtns.length) {
        nameEls.forEach((el) => { el.textContent = label(el.dataset.note); });
        keyBtns.forEach((b) => {
          const note = b.dataset.note;
          const active = note === waiting;
          const code = K.get(note);
          b.classList.toggle('waiting', active);
          b.classList.toggle('dup', !!code && K.conflicts(note).length > 0);
          b.textContent = active ? 'Appuie sur une touche…' : (code ? K.labelOf(code) : '—');
          b.setAttribute('aria-label', `${label(note)} : ${active ? 'en attente d\'une touche' : (code ? 'touche ' + K.labelOf(code) : 'aucune touche')}`);
        });
        // Doublons : chaque note qui partage sa touche avec une note plus haute dans la liste est signalée.
        const msgs = [];
        FR.forEach((n) => {
          const earlier = K.conflicts(n).filter((m) => FR.indexOf(m) < FR.indexOf(n));
          if (earlier.length) msgs.push(`« ${label(n)} » utilise déjà la touche ${K.labelOf(K.get(n))} (« ${label(earlier[0])} »).`);
        });
        const warn = q('#set-dups');
        warn.hidden = !msgs.length;
        warn.textContent = msgs.join(' ');
        const info = q('#set-layout-info');
        const pick = q('#set-layout-pick');
        if (K.detectionAvailable()) {
          info.textContent = `Disposition détectée : ${K.layout().toUpperCase()}. Les touches s'affichent selon ton clavier.`;
          pick.hidden = true;
        } else {
          info.textContent = 'Ton navigateur ne peut pas détecter la disposition de ton clavier : choisis-la pour que les lettres s\'affichent correctement. Les touches enregistrées restent les mêmes touches physiques.';
          pick.hidden = false;
          pick.querySelectorAll('[data-layout]').forEach((b) => {
            const on = b.dataset.layout === (K.layout() === 'azerty' ? 'azerty' : 'qwerty');
            b.classList.toggle('on', on);
            b.setAttribute('aria-pressed', String(on));
          });
        }
      }
      paintSound();
    }

    api.paint = paint;
    paint();
  }

  const api = {
    paint: () => {},
    show() { build(); }, // reconstruit à chaque visite : l'état affiché est toujours celui du stockage
    hide() { teardown(); },
  };
  const refresh = () => { if (!viewEl.hidden) api.paint(); };
  window.addEventListener('notanext:notation', refresh);
  window.addEventListener('notanext:keys', refresh);
  K.ready.then(refresh);
  window.Notanext.views.settings = api;
})();
