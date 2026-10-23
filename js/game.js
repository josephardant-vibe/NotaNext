// Application : navigation (onglets, grille de cartes, pages d'exercice) et logique des exercices.
(function () {
  const { data, staff, scrollStaff, windowStaff, playTone, playNote, instruments, instrumentMenu, sound } = window.Notanext;
  const { CLEFS, clefById, notesOf, FR, ANSWER_ORDER, createPicker, label, getNotation, setNotation, EXERCISES, LEARN_CARDS, FAQ_QUESTIONS, FAQ_ANSWERS } = data;
  const { renderStaff, eventToStep, attachKeyboard } = staff;
  const { createScrollStaff, SPEED_LEVELS } = scrollStaff;
  const { createWindowStaff } = windowStaff;

  const SPEED_LABELS = [
    ['debutant', 'Débutant'],
    ['intermediaire', 'Intermédiaire'],
    ['avance', 'Avancé'],
    ['expert', 'Expert'],
  ];

  const CORRECT_PHRASES = ['Bravo !', 'Exactement !', 'Bien vu !', 'Parfait !'];
  const FIRST_NOTE_MS = 300; // attente avant la 1re note jouée d'un jeu (laisse l'écran se poser avant le son)

  // Réglage mobile : true = les jeux s'affichent en paysage (message « Tourne ton téléphone »,
  // puis rotation automatique après 3 s). Passer à false pour désactiver ce comportement.
  const MOBILE_LANDSCAPE = true;
  document.body.classList.toggle('landscape-only', MOBILE_LANDSCAPE);

  // Réglage du joueur : « Rotation automatique » (mémorisé). Désactivée, les jeux et la section
  // Apprendre gardent l'orientation du téléphone. Modifiable dans Clavier ou depuis le message de rotation.
  const ROTATE_KEY = 'notanext.autorotate';
  let autoRotate = true;
  try { autoRotate = localStorage.getItem(ROTATE_KEY) !== '0'; } catch (e) { /* activée */ }
  const rotationOn = () => MOBILE_LANDSCAPE && autoRotate;

  // ---------- éléments ----------
  const tabButtons = Array.from(document.querySelectorAll('[data-tab]')); // barre du haut (ordinateur) et barre d'onglets (mobile)
  const viewEx = document.getElementById('view-ex');
  const viewLearn = document.getElementById('view-learn');
  const viewSettings = document.getElementById('view-settings');
  const viewDoc = document.getElementById('view-doc');
  const viewAccount = document.getElementById('view-account');
  const views = window.Notanext.views = {}; // écrans remplis par d'autres fichiers : hub, settings, doc (show/hide)
  const exGrid = document.getElementById('ex-grid');
  const exPage = document.getElementById('ex-page');
  const learnPanel = document.getElementById('learn-panel');
  const learnGrid = document.getElementById('learn-grid');
  const learnPage = document.getElementById('learn-page');
  const gameEl = document.getElementById('game');

  // ---------- routeur ----------
  // #/exercer, #/exercer/<jeu>, #/apprendre, #/apprendre/<cours>, #/compte.
  // Le hash est l'unique source de vérité ; `route()` est idempotente (clé `shown`).
  let shown = null;
  let booted = false;
  // Titre de l'onglet = l'écran affiché (WCAG 2.4.2) ; le titre de l'écran reçoit le focus (annonce vocale).
  const BRAND = 'NotaNext';
  const setTitle = (t) => { document.title = t ? `${BRAND} — ${t}` : BRAND; };
  function focusHeading(el) {
    if (!booted || !el) return;
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  }
  const setHash = (h) => { if (location.hash !== h) location.hash = h; };

  // Onglet actif selon l'écran : les pages texte (mentions, confidentialité, crédits) viennent de Réglages.
  const TAB_OF = { ex: 'ex', learn: 'learn', settings: 'settings', doc: 'settings' };
  function showView(name) {
    viewEx.hidden = name !== 'ex';
    viewLearn.hidden = name !== 'learn';
    viewSettings.hidden = name !== 'settings';
    viewDoc.hidden = name !== 'doc';
    viewAccount.hidden = name !== 'account';
    tabButtons.forEach((b) => {
      const on = b.dataset.tab === TAB_OF[name];
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    if (name !== 'ex' && views.hub) views.hub.hide();
    if (name !== 'settings' && views.settings) views.settings.hide();
    currentView = name;
    applyLearnOrientation();
  }

  const DOC_PAGES = ['mentions-legales', 'confidentialite', 'credits'];
  function route() {
    document.documentElement.classList.remove('boot-home'); // le routeur a pris la main
    const [page, arg] = (location.hash.replace(/^#\/?/, '') || 'accueil').split('/');
    // L'accueil a sa propre adresse (#/accueil) : le bouton Retour du navigateur y ramène.
    const home = window.Notanext.home;
    if (page === 'accueil') {
      closeGame();
      shown = 'accueil/';
      if (views.hub) views.hub.hide();
      if (home) home.show();
      return;
    }
    if (home) home.hide();
    const key = `${page}/${arg || ''}`;
    if (key === shown) return;
    shown = key;
    closeGame();
    if (page === 'compte') { // plus aucun lien n'y mène (« Comptes bientôt » n'est plus cliquable)
      showView('account');
      setTitle('Comptes bientôt');
      return focusHeading(document.querySelector('#view-account .page-title'));
    }
    if (page === 'reglages') {
      showView('settings');
      if (views.settings) views.settings.show();
      setTitle('Réglages');
      return focusHeading(viewSettings.querySelector('h1'));
    }
    if (DOC_PAGES.includes(page)) {
      showView('doc');
      if (views.doc) views.doc.show(page);
      return focusHeading(viewDoc.querySelector('h1'));
    }
    if (page === 'apprendre') {
      showView('learn');
      if (arg && LEARN_CARDS.some((c) => c.id === arg)) return openLearnCard(arg, true);
      return showLearnGrid(true);
    }
    showView('ex');
    if (arg && EXERCISES.some((e) => e.id === arg)) return openExercise(arg, true);
    showGrid(true);
  }

  // ---------- hubs : grille de tuiles (AppTile), commune à tous les hubs ----------
  const NOTE_ICON = '<svg viewBox="0 0 24 32" width="22" height="30" fill="currentColor" aria-hidden="true"><ellipse cx="8" cy="25" rx="6.5" ry="4.8" transform="rotate(-20 8 25)"/><path d="M13.6 23.2V3" stroke="currentColor" stroke-width="2" fill="none"/></svg>';

  // tiles : [{ title, desc, action, soon? }] ; action = libellé du lien (« Ouvrir », « Commencer »)
  function buildTiles(grid, tiles) {
    grid.innerHTML = '';
    tiles.forEach((t) => {
      const el = document.createElement(t.soon ? 'div' : 'button');
      if (!t.soon) el.type = 'button';
      el.className = 'tile' + (t.soon ? ' soon' : '');
      el.innerHTML = `<span class="tile-icon">${NOTE_ICON}</span><span class="tile-title">${t.title}</span><span class="tile-desc">${t.desc || ''}</span><span class="tile-go">${t.soon ? 'Bientôt' : t.action}</span>`;
      if (!t.soon) el.addEventListener('click', t.onOpen);
      grid.appendChild(el);
    });
  }

  function showGrid(fromRoute) {
    closeGame();
    exGrid.hidden = false;
    exPage.hidden = true;
    if (fromRoute !== true) setHash('#/exercer');
    shown = 'exercer/';
    setTitle("S'exercer");
    if (views.hub) views.hub.show();
    focusHeading(exGrid.querySelector('h1'));
  }

  function openExercise(id, fromRoute) {
    if (views.hub) views.hub.hide();
    exGrid.hidden = true;
    exPage.hidden = true;
    if (fromRoute !== true) setHash(`#/exercer/${id}`);
    shown = `exercer/${id}`;
    mountExercise(EXERCISES.find((e) => e.id === id));
  }

  // "Apprendre" suit le même principe que "S'exercer" : une grille de tuiles,
  // une tuile ouvre une page dédiée. Ajouter une future leçon ne demande
  // qu'une entrée dans LEARN_CARDS + un mount*.
  function buildLearnGrid() {
    const tiles = LEARN_CARDS.map((c) => ({ title: c.title, desc: c.tag, action: 'Commencer', onOpen: () => openLearnCard(c.id) }));
    const grid = document.getElementById('learn-card-grid');
    buildTiles(grid, tiles);

    // Recherche (même champ que S'exercer) : filtre les cartes en direct, sans tenir compte des accents ni de la casse.
    const input = document.getElementById('learn-search');
    const clear = document.getElementById('learn-clear');
    const empty = document.getElementById('learn-empty');
    const norm = (t) => String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const cards = Array.from(grid.children); // même ordre que LEARN_CARDS
    const entries = LEARN_CARDS.map((c, i) => ({ el: cards[i], title: c.title, tag: c.tag, body: data.learnBody(c) }));
    const esc = (t) => String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
    function filter() {
      // Titre d'abord, puis sous-titre, puis tout le reste de la carte (FAQ comprise).
      const hits = data.searchRank(entries, input.value);
      cards.forEach((el) => { el.hidden = true; });
      hits.forEach((e) => { e.el.hidden = false; grid.appendChild(e.el); });
      const shown = hits.length;
      clear.hidden = !input.value;
      empty.hidden = shown > 0;
      if (!shown) {
        empty.innerHTML = `<p class="hub-empty-t">Aucun résultat pour « ${esc(input.value.trim())} »</p><p class="hub-empty-d">Vérifie l'orthographe ou cherche un autre mot.</p>`;
      }
    }
    input.addEventListener('input', filter);
    clear.addEventListener('click', () => { input.value = ''; filter(); input.focus(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && input.value) { e.preventDefault(); input.value = ''; filter(); }
      else if (e.key === 'Enter') { e.preventDefault(); const first = cards.find((el) => !el.hidden); if (first) first.click(); }
    });
    // « / » place le curseur dans la recherche (comme dans S'exercer), sauf dans un champ ou un jeu.
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || learnGrid.hidden || viewLearn.hidden) return;
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      e.preventDefault();
      input.focus();
      input.select();
    });
  }

  function showLearnGrid(fromRoute) {
    closeGame();
    learnGrid.hidden = false;
    learnPage.hidden = true;
    learnPanel.classList.remove('wide');
    if (fromRoute !== true) setHash('#/apprendre');
    shown = 'apprendre/';
    setTitle('Apprendre');
    focusHeading(learnGrid.querySelector('h1'));
  }

  function openLearnCard(id, fromRoute) {
    learnGrid.hidden = true;
    learnPage.hidden = false;
    if (fromRoute !== true) setHash(`#/apprendre/${id}`);
    shown = `apprendre/${id}`;
    // "Les clés" : deux colonnes (portée + FAQ).
    learnPanel.classList.add('wide');
    mountClefsPage();
    setTitle(LEARN_CARDS.find((c) => c.id === id).title);
    focusHeading(learnPage.querySelector('h1'));
  }

  // ----- Carte "Les clés" (clé + portée annotée + FAQ, inchangé) -----
  function mountClefsPage() {
    learnPage.innerHTML = `
      <button type="button" class="backbtn" id="learn-back"><span aria-hidden="true">&#8592;</span>Apprendre</button>
      <div class="learn-layout">
        <div class="learn-left">
          <h1>Les clés</h1>
          <select id="learn-clef" aria-label="Choisir une clé"></select>
          <p class="learn-hint">Clique une note pour l'entendre.</p>
          <div class="learn-staff">
            <svg id="learn-staff" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Portée annotée"></svg>
          </div>
        </div>
        <div class="faq">
          <h3 aria-level="2">FAQ</h3>
          <div id="faq-body"></div>
          <p class="learn-sources">Sources : <a href="https://www.larousse.fr/encyclopedie/musdico/clef/166855" target="_blank" rel="noopener">Larousse, Dictionnaire de la musique, « Clef »</a> ; <a href="https://dolmetsch.com/musictheory14.htm" target="_blank" rel="noopener">Dolmetsch Online, Music Theory Online, leçon 14 « Other Clefs »</a> (B. Blood).</p>
        </div>
      </div>
    `;
    document.getElementById('learn-back').addEventListener('click', showLearnGrid);
    buildLearn();
  }

  // ---------- cadre de jeu (commun à tous les jeux) ----------
  // Une carte sous le header (le logo NotaNext reste accessible) : retour, compteur
  // « bonnes réponses / total » en haut à droite, réglages propres au jeu, zone
  // portée (ou zone d'écoute), ligne de feedback, zone de réponse. Sans fin : pas de
  // manches tant qu'il n'y a pas de comptes.
  let activeGame = null; // { destroy() } du jeu actuellement affiché

  // ----- orientation (téléphone) : les jeux se jouent en paysage -----
  // Téléphone tenu en portrait : message « Tourne ton téléphone » pendant 3 s, puis le
  // jeu se tourne tout seul en paysage. Le bouton de rotation bascule paysage <-> portrait.
  // Les cours n'utilisent rien de tout cela. Désactivable avec MOBILE_LANDSCAPE.
  const HINT_MS = 1750; // 42 % plus court que les 3 s d'origine (2,1 s auparavant)
  const isPhone = () => Math.min(window.innerWidth, window.innerHeight) <= 500;
  let orient = null;        // null = automatique ; 'landscape' | 'portrait' = choix du joueur
  let gamePref = 'landscape'; // orientation voulue par le jeu en cours (l'oreille absolue se joue en portrait)
  let hintPending = false;
  let hintTimer = null;

  function applyOrientation() {
    document.body.classList.toggle('is-phone', isPhone());
    gameEl.classList.remove('rot-cw', 'rot-ccw', 'show-hint');
    document.body.classList.remove('game-rotated', 'game-portrait');
    if (gameEl.hidden || !isPhone() || (!rotationOn() && !orient)) { hintPaused = false; syncPause(); return; }
    const devicePortrait = window.innerHeight > window.innerWidth;
    const deviceOk = gamePref === 'portrait' ? devicePortrait : !devicePortrait;
    if (hintPending && deviceOk) { hintPending = false; clearTimeout(hintTimer); }
    hintPaused = hintPending;
    syncPause();
    const want = orient || gamePref;
    const rot = want === 'landscape' && devicePortrait ? 'rot-cw' : want === 'portrait' && !devicePortrait ? 'rot-ccw' : null;
    // Le message « Tourne ton téléphone » est déjà affiché dans l'orientation à venir (horizontal pour les jeux de lecture).
    if (hintPending) { gameEl.classList.add('show-hint'); if (rot) { gameEl.classList.add(rot); document.body.classList.add('game-rotated'); if (rot === 'rot-ccw') document.body.classList.add('game-portrait'); } return; }
    if (rot) {
      gameEl.classList.add(rot);
      document.body.classList.add('game-rotated');
      if (rot === 'rot-ccw') document.body.classList.add('game-portrait');
    }
  }

  // ----- section Apprendre : portrait sur téléphone -----
  // Téléphone tenu en paysage : même mécanique que les jeux, message 3 s puis rotation du bloc
  // « barre + vues » en portrait. Un site ne peut pas verrouiller l'orientation : c'est une rotation d'affichage.
  const appEl = document.getElementById('app');
  let currentView = 'ex';
  let learnState = null; // null | 'hint' | 'rot'
  let learnTimer = null;

  function applyLearnOrientation() {
    const landscape = window.innerWidth > window.innerHeight;
    const applies = rotationOn() && isPhone() && landscape && currentView === 'learn' && gameEl.hidden && !document.body.classList.contains('is-home');
    if (!applies) {
      clearTimeout(learnTimer);
      learnState = null;
      appEl.classList.remove('rot-ccw');
      document.body.classList.remove('app-hint-on');
      return;
    }
    if (learnState === null) {
      learnState = 'hint';
      learnTimer = setTimeout(() => { learnState = 'rot'; applyLearnOrientation(); window.dispatchEvent(new Event('resize')); }, HINT_MS);
    }
    appEl.classList.toggle('rot-ccw', learnState === 'rot');
    document.body.classList.toggle('app-hint-on', learnState === 'hint');
  }

  function setAutoRotate(value) {
    autoRotate = value;
    try { localStorage.setItem(ROTATE_KEY, value ? '1' : '0'); } catch (e) { /* valable pour la session */ }
    clearTimeout(hintTimer);
    hintPending = false;
    orient = null;
    syncRotateBtn();
    refreshLayout();
  }

  // Bouton de rotation du cadre de jeu : active ou coupe la rotation automatique pour TOUS les jeux
  // et la section Apprendre (réglage commun, mémorisé).
  function syncRotateBtn() {
    const btn = document.getElementById('gf-rotate-btn');
    if (!btn) return;
    btn.removeAttribute('aria-pressed');
    const text = 'Tourner le jeu : paysage ou portrait';
    btn.setAttribute('aria-label', text);
    btn.title = text;
  }

  // Téléphone : pas de clavier physique (Réglages cache la section Clavier, affiche la rotation automatique).
  function syncPhone() {
    document.body.classList.toggle('is-phone', isPhone());
    // « m » = mise en page mobile (barre du haut fine + barre d'onglets en bas) : téléphone, ou fenêtre étroite.
    document.body.classList.toggle('m', isPhone() || window.innerWidth <= 720);
  }

  document.getElementById('app-hint-keep').addEventListener('click', () => setAutoRotate(false));

  function refreshLayout() {
    applyLearnOrientation();
    applyOrientation();
    window.dispatchEvent(new Event('resize')); // les portées recalculent leur largeur
  }

  window.addEventListener('resize', () => { syncPhone(); if (!gameEl.hidden) applyOrientation(); applyLearnOrientation(); });
  window.addEventListener('orientationchange', () => { syncPhone(); refreshLayout(); });
  syncPhone();

  function closeGame() {
    window.Notanext.stopSounds(); // le son d'une note encore en cours s'arrête avec le jeu
    if (activeGame && activeGame.destroy) activeGame.destroy();
    activeGame = null;
    activeAnswers = null;
    setPanelPause(null);
    clearTimeout(hintTimer);
    hintPending = false;
    orient = null;
    gamePref = 'landscape';
    hintPaused = false;
    gameEl.hidden = true;
    gameEl.innerHTML = '';
    gameEl.classList.remove('rot-cw', 'rot-ccw', 'show-hint');
    document.body.classList.remove('in-game', 'game-rotated', 'game-portrait');
    applyLearnOrientation();
  }

  // opts : title, config (HTML des réglages), stageHtml, answersHtml, replay ('config' | 'stage' | null),
  // showNext, onBack. Renvoie le cadre ; `frame.session.record(ok)` met à jour le compteur.
  // Mode démonstration (aperçus du hub) : `opts.demo = { host }` monte le même écran de jeu dans `host`,
  // sans toucher à l'état de l'application (ni jeu en cours, ni titre, ni focus, ni touches, ni stockage) ;
  // rien n'y est jouable (le conteneur est inerte) et aucun son n'est émis (voir audio.js, setDemoSilent).
  function openFrame(opts) {
    const demo = opts.demo || null;
    const out = demo ? demo.host : gameEl;
    if (!demo) {
      closeGame();
      document.body.classList.add('in-game');
      setTitle(opts.title);
      gameEl.hidden = false;
    }
    out.innerHTML = `
      <div class="gf ${opts.cls || ''}">
        <div class="gf-top">
          <button type="button" class="backbtn" id="back"><span aria-hidden="true">&#8592;</span>S'exercer</button>
          <h1 class="gf-title" id="gf-heading">${opts.title}</h1>
          <span class="gf-right">
            <button type="button" class="gf-rotate-btn" id="gf-rotate-btn" aria-label="Rotation automatique" aria-pressed="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="14" rx="1.8"/><path d="M5 20.5h14M17 18.5l2 2-2 2" transform="translate(0 -2)"/></svg></button>
            <span class="gf-count" id="gf-count" aria-live="polite" title="Bonnes réponses / réponses totales"></span>
          </span>
        </div>
        <div class="gf-config">
          ${opts.config || ''}
          ${opts.soundToggle ? '<label class="switch"><input type="checkbox" id="sound-on" role="switch" checked><span class="switch-track"><span class="switch-thumb"></span></span><span>Son</span></label>' : ''}
          ${opts.replay === 'config' ? '<button type="button" class="replay" id="replay"><span aria-hidden="true">&#9654;</span>Réécouter</button>' : ''}
          ${opts.configAfter || ''}
        </div>
        <div class="gf-stage" id="gf-stage">
          ${opts.replay === 'stage' ? '<button type="button" class="replay big" id="replay"><span aria-hidden="true">&#9654;</span>Réécouter</button>' : ''}
          ${opts.stageHtml || ''}
        </div>
        <p class="feedback gf-feedback" id="feedback" aria-live="polite">&nbsp;</p>
        <div class="gf-next"><button type="button" class="btn-primary" id="gf-next" hidden>Suivant <span aria-hidden="true">&#8594;</span></button></div>
        <div class="gf-answers" id="answers">${opts.answersHtml || ''}</div>
      </div>
      ${demo ? '' : `<div class="gf-hint" role="status">
        <button type="button" class="backbtn" id="hint-back"><span aria-hidden="true">&#8592;</span>S'exercer</button>
        <div class="gf-hint-body">
          <svg class="gf-hint-icon" width="84" height="84" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="22" y="10" width="20" height="34" rx="4"/><path d="M30 38h4"/><path d="M50 22a20 20 0 0 1 0 24M50 46l-1.5-6M50 46l6-1"/></svg>
          <h2>${opts.portrait ? 'Tourne ton téléphone à la verticale' : 'Tourne ton téléphone à l\'horizontale'}</h2>
          <p>Le jeu passera en ${opts.portrait ? 'vertical' : 'horizontal'} dans quelques secondes.</p>
          <button type="button" class="backbtn hint-keep" id="hint-keep">Garder cette orientation</button>
        </div>
      </div>`}
    `;
    const q = (id) => out.querySelector('#' + id);
    const frame = {
      root: out.querySelector('.gf'),
      stage: q('gf-stage'),
      answers: q('answers'),
      replay: q('replay'),
      next: q('gf-next'),
      feedbackEl: q('feedback'),
      setFeedback(html, cls) {
        frame.feedbackEl.innerHTML = html || '&nbsp;';
        frame.feedbackEl.className = 'feedback gf-feedback' + (cls ? ' ' + cls : '');
      },
      setDestroy(fn) { if (demo) demo.destroy = fn; else activeGame = { destroy: fn }; },
    };
    if (demo) {
      // Compteur local seulement ; rien d'autre à brancher.
      const countEl = q('gf-count');
      let good = 0, total = 0;
      const paintCount = () => { countEl.textContent = `${good} / ${total}`; };
      frame.session = { record(ok) { total++; if (ok) good++; paintCount(); } };
      paintCount();
      return frame;
    }
    focusHeading(q('gf-heading'));
    // Interrupteur « Son » (jeux sans « Réécouter ») : c'est le même réglage que Réglages > Son > Couper le son.
    const soundBox = q('sound-on');
    if (soundBox) {
      soundBox.checked = !sound.isMuted();
      soundBox.addEventListener('change', () => sound.setMuted(!soundBox.checked));
    }
    q('back').addEventListener('click', opts.onBack);
    q('hint-back').addEventListener('click', opts.onBack);
    q('hint-keep').addEventListener('click', () => setAutoRotate(false));
    // Le bouton tourne le jeu en cours (paysage <-> portrait), même pour « Placer la note » ; la rotation automatique
    // se règle dans Réglages ou avec « Garder cette orientation ».
    q('gf-rotate-btn').addEventListener('click', () => {
      const cur = orient || gamePref;
      orient = cur === 'landscape' ? 'portrait' : 'landscape';
      clearTimeout(hintTimer);
      hintPending = false;
      refreshLayout();
    });
    syncRotateBtn();

    // ----- compteur : bonnes réponses / total -----
    const countEl = q('gf-count');
    let good = 0, total = 0;
    const paint = () => { countEl.textContent = `${good} / ${total}`; };
    frame.session = {
      record(ok) { total++; if (ok) good++; paint(); },
    };
    paint();
    activeGame = { destroy: null };
    frame.setDestroy = (fn) => { activeGame.destroy = fn; };

    // ----- orientation : message 3 s puis rotation automatique (téléphone en portrait) -----
    orient = null;
    gamePref = opts.portrait ? 'portrait' : 'landscape';
    const devicePortrait = window.innerHeight > window.innerWidth;
    hintPending = rotationOn() && isPhone() && (gamePref === 'portrait' ? !devicePortrait : devicePortrait);
    if (hintPending) {
      hintTimer = setTimeout(() => { hintPending = false; refreshLayout(); }, HINT_MS);
    }
    applyOrientation();
    applyLearnOrientation();
    return frame;
  }

  function setTab(name) {
    if (name === 'ex') { showView('ex'); showGrid(); }
    else if (name === 'settings') { setHash('#/reglages'); route(); }
    else { showView('learn'); showLearnGrid(); }
  }

  window.Notanext.app = { mountDemo: (ex, demo) => mountExercise(ex, demo), setTab, openExercise, openLearnCard, closeGame, isPhone, getAutoRotate: () => autoRotate, setAutoRotate: (v) => setAutoRotate(v) };

  // Boîte à outils pour les jeux écrits dans d'autres fichiers (js/ear.js).
  const kit = {
    FIRST_NOTE_MS,
    openFrame,
    showGrid: () => showGrid(),
    CORRECT_PHRASES,
    setActiveAnswers(map) { activeAnswers = map; refreshKeyHints(); },
  };

  // Boîte à outils des aperçus : mêmes jeux, mais montés dans un conteneur à part (voir openFrame).
  function demoKit(demo) {
    return {
      FIRST_NOTE_MS,
      openFrame: (o) => openFrame(Object.assign({}, o, { demo })),
      showGrid: () => {},
      CORRECT_PHRASES,
      setActiveAnswers() {},
      demo,
    };
  }

  tabButtons.forEach((b) => b.addEventListener('click', () => setTab(b.dataset.tab)));
  document.getElementById('account-back').addEventListener('click', () => setTab('ex'));
  window.addEventListener('hashchange', route);

  // ---------- clavier (global) ----------
  // Une seule configuration (note -> touche physique), gérée par js/keys.js et réglée dans Réglages,
  // partagée par tous les jeux à boutons de réponse Do–Si. `activeAnswers` = les boutons du
  // jeu actuellement affiché (aucun pour "Placer la note", qui n'a pas de boutons).
  const K = window.Notanext.keys;
  let activeAnswers = null;
  let pauseHook = null; // le défilement continu se met en pause pendant le message / la rotation « Tourne ton téléphone »
  let hintPaused = false;
  const syncPause = () => { if (pauseHook) pauseHook(hintPaused); };
  const setPanelPause = (fn) => { pauseHook = fn; syncPause(); };

  function refreshKeyHints() {
    if (!activeAnswers) return;
    FR.forEach((name) => {
      const hint = activeAnswers[name].querySelector('.key-hint');
      if (hint) hint.textContent = K.get(name) ? K.labelOf(K.get(name)) : '';
    });
  }
  window.addEventListener('notanext:keys', refreshKeyHints);
  K.ready.then(refreshKeyHints); // la lettre affichée dépend de la disposition détectée

  // Changement de notation : boutons de réponse et repères de « Les clés » se mettent à jour.
  window.addEventListener('notanext:notation', () => {
    if (activeAnswers) {
      FR.forEach((n) => { const el = activeAnswers[n] && activeAnswers[n].querySelector('.ans-name'); if (el) el.textContent = label(n); });
    }
    if (document.getElementById('learn-staff') && !learnPage.hidden) drawLearn();
  });

  // Appuyer sur la touche associée = cliquer sur le bouton de réponse correspondant (touche physique : AZERTY et QWERTY).
  document.addEventListener('keydown', (e) => {
    if (K.capturing || !activeAnswers || gameEl.hidden) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return;
    const name = K.noteFor(e.code);
    if (!name) return;
    e.preventDefault();
    activeAnswers[name].click();
  });

  // ---------- exercice ----------
  // `demo` (aperçus du hub) : { host } ; le jeu est monté dans `host` en mode démonstration, voir openFrame.
  function mountExercise(ex, demo) {
    const theKit = demo ? demoKit(demo) : kit;
    // Les identifiants sont cherchés dans le conteneur de l'aperçu (plusieurs aperçus peuvent coexister).
    const $ = (id) => (demo ? demo.host : document).querySelector('#' + id);
    if (ex.mode === 'ear-guess') return window.Notanext.ear.mountGuess(ex, theKit);
    if (ex.mode === 'ear-place') return window.Notanext.ear.mountPlace(ex, theKit);
    let clefId = 'sol';
    const isPlace = ex.mode === 'place';
    const frame = openFrame({
      title: ex.title,
      // Placer la note : on vise une position précise sur la portée. Le jeu se joue donc en portrait (comme Oreille
      // absolue — placer), où la portée est deux fois plus haute qu'en paysage, avec un geste « touche, glisse, relâche ».
      cls: isPlace ? 'place-game' : '',
      portrait: isPlace,
      config: `
        ${isPlace ? '<div class="namebox" id="namebox">–</div>' : ''}
        ${ex.mode === 'guess-scroll' ? `<select id="speed-sel" aria-label="Choisir une vitesse">${SPEED_LABELS.map(([v, label]) => `<option value="${v}"${v === 'intermediaire' ? ' selected' : ''}>${label}</option>`).join('')}</select>` : ''}`,
      replay: null,
      soundToggle: !isPlace,
      configAfter: `${instrumentMenu.html()}<span class="inst-note" id="inst-note" hidden></span>`,
      // Le sélecteur de clé est à gauche de la portée, centré en hauteur.
      stageHtml: `<div class="stage-row"><div class="clef-side"><select id="clef-sel" aria-label="Choisir une clé">${CLEFS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></div><div class="staff-box"><svg class="staff-svg" id="staff" role="img" aria-label="Portée"></svg></div></div>`,
      // Placer la note n'a pas de boutons : on réserve leur place pour que la portée ait exactement la même taille que dans les autres jeux.
      answersHtml: isPlace ? ANSWER_ORDER.map(() => '<span class="answer-btn spacer" aria-hidden="true">&nbsp;</span>').join('') : '',
      onBack: () => showGrid(),
      demo,
    });
    const { session } = frame;

    const svg = $('staff');
    const clef = () => clefById(clefId);

    function markCorrect() {
      frame.setFeedback(CORRECT_PHRASES[Math.floor(Math.random() * CORRECT_PHRASES.length)], 'correct');
      session.record(true);
    }

    function markWrong(correctName) {
      frame.setFeedback(`C'était <b>${label(correctName)}</b>`);
      session.record(false);
    }

    const SPD = demo ? demo.speed || 1 : 1; // aperçus du hub : pauses et défilement accélérés
    let controller;
    if (ex.mode === 'guess-scroll') controller = mountGuessScroll(svg, clef, markCorrect, markWrong);
    else if (ex.mode === 'guess-window') controller = mountGuessWindow(svg, clef, markCorrect, markWrong);
    else controller = mountPlace(svg, clef, markCorrect, markWrong);

    // Menu d'instrument + avertissement si certaines notes de la clé sont jouées à l'octave.
    const unmountMenu = instrumentMenu.mount(frame.root);
    const noteEl = $('inst-note');
    function paintFoldNote() {
      const fold = instruments.needsFold(instruments.get(), notesOf(clef()).map((n) => n.freq));
      noteEl.hidden = !fold;
      noteEl.textContent = fold ? 'Notes hors tessiture jouées à l\'octave' : '';
      noteEl.title = fold ? 'Cet instrument ne couvre pas toute la clé : les notes trop graves ou trop aiguës sont jouées une octave plus haut ou plus bas.' : '';
    }
    window.addEventListener('notanext:instrument', paintFoldNote);
    if (!demo) instruments.load(instruments.get()).catch(() => {});
    paintFoldNote();

    frame.setDestroy(() => {
      unmountMenu();
      window.removeEventListener('notanext:instrument', paintFoldNote);
      if (controller.destroy) controller.destroy();
    });
    if (frame.replay) {
      frame.replay.addEventListener('click', () => {
        const note = controller.currentNote();
        if (note) playNote(note.freq);
      });
    }
    $('clef-sel').addEventListener('change', (e) => {
      clefId = e.target.value;
      paintFoldNote();
      controller.onClefChange();
    });
    const speedSel = $('speed-sel');
    if (speedSel) {
      speedSel.addEventListener('change', (e) => controller.onSpeedChange(e.target.value));
    }
    if (demo) return { answer: (ok) => controller.demoAnswer(ok), pause: (p) => controller.demoPause(p) };

    // ----- Deviner la note - défilement continu -----
    function mountGuessScroll(svgEl, clefFn, onGood, onBad) {
      buildAnswerButtons((name) => {
        const current = scroll.currentNote();
        if (!current) return;
        const ok = name === current.name;
        picker.record(current, ok);
        scroll.answer(ok, current.name);
        if (ok) { playNote(current.freq); onGood(); } // seule la bonne note est jouée, quand elle est devinée
        else onBad(current.name);
      });

      // Une note ratée revient dès que possible (après une autre note).
      const picker = createPicker(() => notesOf(clefFn()), { minGap: 1 });
      const pickNote = () => picker.next();

      const scroll = createScrollStaff(svgEl, {
        clef: clefFn(),
        pickNote,
        // Une note qui dépasse le repère sans réponse compte comme une erreur,
        // exactement comme une mauvaise réponse donnée à temps.
        onMiss: (name, note) => { if (note) picker.record(note, false); onBad(name); },
        initialSpeed: SPEED_LEVELS.intermediaire * SPD,
        preRoll: !!demo, // aperçu : la 1re note est déjà près de la clé, prête à être « devinée »
      });

      // Mise en pause pendant le message de rotation (voir syncPause) ; pas dans un aperçu.
      if (!demo) setPanelPause((paused) => scroll.setPaused(paused));

      return {
        currentNote: () => scroll.currentNote(),
        onClefChange: () => { picker.reset(); scroll.setClef(clefFn()); },
        onSpeedChange: (level) => scroll.setSpeed(SPEED_LEVELS[level]),
        demoAnswer: (ok) => demoPressAnswer(scroll.currentNote(), ok),
        demoPause: (p) => scroll.setPaused(p),
        destroy: () => {
          if (!demo) setPanelPause(null);
          scroll.destroy();
        },
      };
    }

    // ----- Deviner la note : fenêtre glissante de 3 notes -----
    function mountGuessWindow(svgEl, clefFn, onGood, onBad) {
      buildAnswerButtons((name) => {
        const current = win.currentNote();
        if (!current) return;
        const ok = name === current.name;
        picker.record(current, ok); // avant answer() : la note ratée est la prochaine à entrer sur la portée
        win.answer(ok, current.name);
        if (ok) { playNote(current.freq); onGood(); } // seule la bonne note est jouée, quand elle est devinée
        else onBad(current.name);
      });

      // Les 7 notes à venir sont déjà affichées : la note ratée entre sur la portée au tirage suivant.
      const picker = createPicker(() => notesOf(clefFn()), { minGap: 0 });
      const pickNote = () => picker.next();

      const win = createWindowStaff(svgEl, {
        clef: clefFn(),
        pickNote,
      });

      return {
        currentNote: () => win.currentNote(),
        onClefChange: () => { picker.reset(); win.setClef(clefFn()); },
        demoAnswer: (ok) => demoPressAnswer(win.currentNote(), ok),
        demoPause: () => {},
        destroy: () => win.destroy(),
      };
    }

    function buildAnswerButtons(onAnswer) {
      const answers = frame.answers;
      const byName = {};
      ANSWER_ORDER.forEach((name) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'answer-btn';
        btn.dataset.note = name;
        btn.innerHTML = `<span class="ans-name">${label(name)}</span><span class="key-hint"></span>`;
        btn.addEventListener('click', () => onAnswer(name));
        answers.appendChild(btn);
        byName[name] = btn;
      });
      if (!demo) {
        activeAnswers = byName;
        refreshKeyHints();
      }
      return byName;
    }

    // Aperçu : « répond » en appuyant sur le bouton (bonne note, ou une autre note si `ok` est faux).
    function demoPressAnswer(current, ok) {
      if (!current) return false;
      const names = ANSWER_ORDER.filter((n) => n !== current.name);
      const name = ok ? current.name : names[Math.floor(Math.random() * names.length)];
      const btn = frame.answers.querySelector(`[data-note="${name}"]`);
      if (!btn) return false;
      btn.click();
      return true;
    }

    // ----- Placer la note : clic sur la portée (inchangé) -----
    function mountPlace(svgEl, clefFn, onGood, onBad) {
      const nameBox = $('namebox');
      const picker = createPicker(() => notesOf(clefFn()), { minGap: 1 });
      let current = null;
      let locked = false;
      let hoverStep = null; // dernier pas affiché par l'indice de survol
      let dead = false;

      function next(first) {
        if (dead) return;
        locked = false;
        hoverStep = null;
        kb.reset();
        current = picker.next();
        frame.setFeedback('');
        nameBox.textContent = label(current.name);
        svgEl.classList.add('placing');
        renderStaff(svgEl, { wide: true, clef: clefFn() });
        const note = current;
        // 1re note : on attend un instant avant de la jouer ; les suivantes partent tout de suite.
        if (first === true) setTimeout(() => { if (!dead && current === note) playNote(note.freq); }, FIRST_NOTE_MS);
        else playNote(note.freq);
      }

      svgEl.addEventListener('mousemove', (e) => {
        if (locked) return;
        hoverStep = eventToStep(svgEl, e.clientY, e.clientX);
        renderStaff(svgEl, { wide: true, clef: clefFn(), ghostStep: hoverStep });
      });
      svgEl.addEventListener('mouseleave', () => {
        hoverStep = null;
        if (!locked) renderStaff(svgEl, { wide: true, clef: clefFn() });
      });
      // Valide une position (clic, ou Entrée au clavier).
      function commit(step) {
        if (locked) return;
        locked = true;
        // Un même nom peut exister à plusieurs positions dans la plage affichée
        // (ex. Do sous la portée et Do au 3e interligne) : toutes comptent comme bonnes.
        const correctSteps = notesOf(clefFn())
          .filter((n) => n.name === current.name)
          .map((n) => n.step);
        const ok = correctSteps.includes(step);
        picker.record(current, ok);
        renderStaff(svgEl, {
          wide: true,
          clef: clefFn(),
          reveal: { correctSteps, correctName: current.name, clickedStep: step, ok },
        });
        if (ok) {
          onGood();
          setTimeout(next, demo ? 1500 : 900);
        } else {
          onBad(current.name);
          setTimeout(next, demo ? 1700 : 1200);
        }
      }
      svgEl.addEventListener('click', (e) => {
        if (locked) return;
        // Toujours placer exactement là où l'indice en pointillés était affiché,
        // plutôt que de recalculer une position potentiellement différente au clic.
        commit(hoverStep != null ? hoverStep : eventToStep(svgEl, e.clientY, e.clientX));
      });
      // Toucher (comme dans Oreille absolue — placer) : on pose le doigt, on le glisse jusqu'à la bonne position
      // (la note fantôme suit), on relâche pour valider. La souris garde survol + clic ci-dessus.
      svgEl.style.touchAction = 'none';
      const stepOf = (e) => eventToStep(svgEl, e.clientY, e.clientX);
      const showGhost = (step) => { hoverStep = step; renderStaff(svgEl, { wide: true, clef: clefFn(), ghostStep: step }); };
      svgEl.addEventListener('pointerdown', (e) => {
        if (locked || e.pointerType === 'mouse') return;
        try { svgEl.setPointerCapture(e.pointerId); } catch (err) { /* capture indisponible : on suit quand même */ }
        showGhost(stepOf(e));
      });
      svgEl.addEventListener('pointermove', (e) => {
        if (locked || e.pointerType === 'mouse' || !e.buttons) return;
        showGhost(stepOf(e));
      });
      svgEl.addEventListener('pointerup', (e) => {
        if (locked || e.pointerType === 'mouse') return;
        commit(stepOf(e));
      });
      svgEl.addEventListener('pointercancel', () => {
        hoverStep = null;
        if (!locked) renderStaff(svgEl, { wide: true, clef: clefFn() });
      });
      // Clavier : flèches pour déplacer la note fantôme, Entrée pour valider.
      const kb = attachKeyboard(svgEl, {
        isLocked: () => locked,
        onMove: (step) => { hoverStep = step; renderStaff(svgEl, { wide: true, clef: clefFn(), ghostStep: step }); },
        onCommit: commit,
      });

      // Changement de notation en cours de partie : le nom demandé se met à jour.
      const onNotation = () => { if (current) nameBox.textContent = label(current.name); };
      window.addEventListener('notanext:notation', onNotation);

      // Rotation / redimensionnement : la portée se redessine à la nouvelle largeur.
      const onResize = () => { if (!locked) renderStaff(svgEl, { wide: true, clef: clefFn() }); };
      window.addEventListener('resize', onResize);

      next(true);

      return {
        currentNote: () => current,
        onClefChange: () => { picker.reset(); next(); },
        // Aperçu : pose la note au bon endroit, ou sur une autre position de la portée.
        demoAnswer: (ok) => {
          if (locked || !current) return false;
          const all = notesOf(clefFn());
          const good = all.filter((n) => n.name === current.name).map((n) => n.step);
          const others = all.filter((n) => n.name !== current.name).map((n) => n.step);
          commit(ok ? good[0] : others[Math.floor(Math.random() * others.length)]);
          return true;
        },
        demoPause: () => {},
        destroy: () => { dead = true; window.removeEventListener('resize', onResize); window.removeEventListener('notanext:notation', onNotation); },
      };
    }
  }

  // ---------- apprendre ----------
  function buildLearn() {
    const sel = document.getElementById('learn-clef');
    if (!sel.options.length) {
      sel.innerHTML = CLEFS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
      sel.addEventListener('change', drawLearn);
    }
    drawLearn();
  }

  function drawLearn() {
    const id = document.getElementById('learn-clef').value || 'sol';
    const clef = clefById(id);
    renderStaff(document.getElementById('learn-staff'), {
      clef,
      labels: notesOf(clef),
      onNoteClick: (note) => playTone(note.freq),
    });
    document.getElementById('faq-body').innerHTML = FAQ_QUESTIONS.map(
      (q, i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><p>${FAQ_ANSWERS[id][i]}</p></details>`
    ).join('');
  }

  buildLearnGrid();
  // Les écrans définis dans d'autres fichiers (hub, réglages, pages texte) sont chargés après celui-ci :
  // on n'affiche la première page qu'une fois tous les scripts exécutés.
  document.addEventListener('DOMContentLoaded', () => { route(); booted = true; });
})();
