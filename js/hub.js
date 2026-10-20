// Hub S'exercer : liste des jeux en deux familles (toujours ouvertes), recherche globale, et aperçus.
// Ordinateur : liste + détail ; survoler ou mettre le focus sur une rangée change l'aperçu (578 × 460 px),
// un clic sur la rangée, le titre ou l'aperçu ouvre le jeu. Mobile : rangées hautes avec aperçu à droite (168 × 72 px).
// Les aperçus montent les vrais écrans de jeu en mode démonstration (muet, non jouable, sans clavier ni stockage).
window.Notanext = window.Notanext || {};

(function () {
  const { data, sound } = window.Notanext;
  const { EXERCISES, LEARN_CARDS } = data;

  const FAMILIES = [
    { id: 'lire', title: 'Lire la portée', sub: 'Reconnaître et placer les notes', ids: ['guess-window', 'guess-scroll', 'place'] },
    { id: 'oreille', title: 'Oreille absolue', sub: 'Sans voir la portée', ids: ['ear-guess', 'ear-place'] },
  ];
  const CHEVRON_DOWN = '<svg class="hub-fam-chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const CHEVRON = '<svg class="hub-chev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

  const GAME_W = 760;   // largeur de l'écran de jeu monté dans l'aperçu
  const GAME_H = 605;   // hauteur correspondante (578 × 460 à l'échelle 0,76)
  const THUMB_W = 168;
  const THUMB_H = 72;
  const THUMB_SCALE = 0.5;

  // Réponses de la démonstration : un enchaînement naturel de réussites et d'erreurs (8 essais, puis on recommence).
  const SCRIPT = [true, true, false, true, true, true, false, true];

  const $ = (id) => document.getElementById(id);
  const listEl = $('hub-list');
  const emptyEl = $('hub-empty');
  const searchEl = $('hub-search');
  const clearEl = $('hub-clear');
  const viewEl = $('view-ex');
  const gridEl = $('ex-grid');
  const detail = { title: $('hub-detail-title'), desc: $('hub-detail-desc'), fade: $('hub-detail-fade'), preview: $('hub-preview'), wrap: $('hub-preview-wrap') };

  detail.preview.inert = true; // l'aperçu n'est ni jouable ni focalisable
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMq = window.matchMedia('(max-width: 900px)');
  const norm = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // ----- les éléments de la liste (lus dans le code : jamais recopiés à la main) -----
  const gameOf = (id) => EXERCISES.find((e) => e.id === id);
  const exItem = (ex) => ({ kind: 'ex', id: ex.id, title: ex.title, desc: ex.tag, tag: 'Jeu', hash: `#/exercer/${ex.id}` });
  const learnItem = (c) => ({ kind: 'learn', id: c.id, title: c.title, desc: c.tag, tag: 'Apprendre', hash: `#/apprendre/${c.id}` });
  const allItems = () => EXERCISES.map(exItem).concat(LEARN_CARDS.map(learnItem));

  let visible = false;      // le hub est affiché
  let query = '';
  let rows = [];            // rangées affichées : { item, el }
  let selected = null;      // item sélectionné (ordinateur)
  const demos = new Map();  // clé -> démonstration en cours
  let swapTimer = null;
  let io = null;            // observe les miniatures mobiles

  // ----- démonstration -----
  function startDemo(key, ex, host) {
    stopDemo(key);
    const run = { host, ex, timer: null, handle: null, demo: { host }, step: 0, dead: false };
    demos.set(key, run);
    sound.setDemoSilent(true);
    host.innerHTML = '';
    try {
      run.handle = window.Notanext.app.mountDemo(ex, run.demo);
    } catch (e) {
      host.innerHTML = '';
      return null;
    }
    if (!run.handle) return run;
    if (reduce()) { run.handle.pause(true); return run; } // mouvement réduit : image fixe, rien ne bouge
    const tick = () => {
      if (run.dead) return;
      if (!document.hidden && visible) {
        const ok = SCRIPT[run.step % SCRIPT.length];
        run.step++;
        try { run.handle.answer(ok); } catch (e) { /* le jeu a changé d'état : on réessaie au prochain tour */ }
      }
      run.timer = setTimeout(tick, 1700 + Math.random() * 900);
    };
    run.timer = setTimeout(tick, 1200);
    return run;
  }

  function stopDemo(key) {
    const run = demos.get(key);
    if (!run) return;
    run.dead = true;
    clearTimeout(run.timer);
    try { if (run.demo.destroy) run.demo.destroy(); } catch (e) { /* déjà démonté */ }
    run.host.innerHTML = '';
    demos.delete(key);
    if (!demos.size) sound.setDemoSilent(false);
  }
  function stopAllDemos() { Array.from(demos.keys()).forEach(stopDemo); }

  // ----- recadrage mobile : la zone utile (portée, notes) à l'échelle 0,5 -----
  function cropThumb(run) {
    const host = run.host;
    const hostRect = host.getBoundingClientRect();
    const target = host.querySelector('.ear-wheel') || host.querySelector('.staff-box') || host.querySelector('.stage-row');
    if (!target) return;
    const r = target.getBoundingClientRect();
    const k = hostRect.width / GAME_W || 1; // échelle actuelle de l'hôte (1 hors transformation)
    const x0 = (r.left - hostRect.left) / k; // position et taille de la zone utile dans l'écran de jeu (px d'origine)
    const y0 = (r.top - hostRect.top) / k;
    const w = r.width / k;
    const h = r.height / k;
    const isWheel = target.classList.contains('ear-wheel');
    // Échelle : 0,5 quand la zone utile tient en hauteur ; sinon on réduit pour que toute sa hauteur utile
    // (le cercle entier, ou les cinq lignes de la portée) entre dans la miniature.
    const usefulH = isWheel ? h : h * 0.62;
    const scale = Math.min(THUMB_SCALE, THUMB_H / usefulH);
    const cropW = THUMB_W / scale;
    const cropH = THUMB_H / scale;
    // Horizontalement : cercle centré ; portée calée à droite (la clé de sol est rognée à gauche).
    const x = isWheel ? x0 + (w - cropW) / 2 : x0 + Math.max(0, w - cropW) * 0.62;
    const y = y0 + (h - cropH) / 2;
    host.style.transform = `scale(${scale}) translate(${-Math.round(x)}px, ${-Math.round(y)}px)`;
  }

  // ----- construction de la liste -----
  function rowHtml(item, q) {
    const title = q ? highlight(item.title, q) : escapeHtml(item.title);
    return `<button type="button" class="hub-row" data-kind="${item.kind}" data-id="${item.id}">
      <span class="hub-row-text"><span class="hub-row-title">${title}</span><span class="hub-row-desc">${escapeHtml(item.desc || '')}</span></span>
      ${q ? `<span class="hub-tag">${item.tag}</span>` : ''}
      <span class="hub-thumb" aria-hidden="true"><span class="hub-thumb-host"></span></span>
      ${CHEVRON}
    </button>`;
  }
  const escapeHtml = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Met en gras la partie du titre qui correspond à la recherche (sans tenir compte des accents ni de la casse).
  function highlight(text, q) {
    const n = norm(text);
    const i = n.indexOf(norm(q));
    if (i < 0 || n.length !== text.length) return escapeHtml(text);
    const qLen = norm(q).length;
    return `${escapeHtml(text.slice(0, i))}<b>${escapeHtml(text.slice(i, i + qLen))}</b>${escapeHtml(text.slice(i + qLen))}`;
  }

  function render() {
    stopAllDemos();
    if (io) io.disconnect();
    const q = query.trim();
    let list;
    if (!q) {
      listEl.innerHTML = FAMILIES.map((f, k) => `
        <details class="hub-fam${k ? ' second' : ''}" open>
          <summary class="hub-fam-head"><span class="hub-fam-titles"><h2 id="hub-fam-${f.id}">${f.title}</h2><p>${f.sub}</p></span>${CHEVRON_DOWN}</summary>
          ${f.ids.map((id) => rowHtml(exItem(gameOf(id)), '')).join('')}
        </details>`).join('');
      list = FAMILIES.flatMap((f) => f.ids).map((id) => exItem(gameOf(id)));
    } else {
      const nq = norm(q);
      list = allItems().filter((it) => norm(`${it.title} ${it.desc || ''}`).includes(nq));
      listEl.innerHTML = list.map((it) => rowHtml(it, q)).join('');
    }
    const empty = q && !list.length;
    emptyEl.hidden = !empty;
    listEl.hidden = !!empty;
    if (empty) {
      emptyEl.innerHTML = `<p class="hub-empty-t">Aucun résultat pour « ${escapeHtml(q)} »</p><p class="hub-empty-d">Vérifie l'orthographe ou cherche un autre mot.</p><button type="button" class="btn-secondary" id="hub-empty-clear">Effacer la recherche</button>`;
      $('hub-empty-clear').addEventListener('click', () => { searchEl.value = ''; onInput(); searchEl.focus(); });
    }
    clearEl.hidden = !searchEl.value;
    rows = Array.from(listEl.querySelectorAll('.hub-row')).map((el, i) => ({ el, item: list[i] }));
    rows.forEach(({ el, item }) => {
      el.addEventListener('click', (e) => { if (e.isTrusted) open(item); }); // les clics simulés de la démonstration n'ouvrent rien
      el.addEventListener('mouseenter', () => { if (!mobileMq.matches) select(item); });
      el.addEventListener('focus', () => { if (!mobileMq.matches) select(item); });
    });
    $('hub-detail').hidden = !rows.length;
    selected = null;
    if (mobileMq.matches) observeThumbs();
    else if (rows.length) select(rows[0].item, true); // la première rangée est présélectionnée
    else clearDetail();
  }

  // ----- ordinateur : détail et aperçu -----
  function clearDetail() { stopDemo('main'); detail.preview.innerHTML = ''; detail.title.textContent = ''; detail.desc.textContent = ''; }

  function select(item, immediate) {
    if (selected && selected.kind === item.kind && selected.id === item.id) return;
    selected = item;
    rows.forEach((r) => r.el.classList.toggle('sel', r.item === item));
    clearTimeout(swapTimer);
    const apply = () => {
      detail.title.textContent = item.title;
      detail.desc.textContent = item.desc || '';
      $('hub-launch').firstChild.textContent = item.kind === 'ex' ? 'Lancer le jeu ' : 'Ouvrir la carte ';
      detail.fade.classList.remove('out');
      mountPreview(item);
    };
    if (immediate || reduce()) { apply(); return; }
    detail.fade.classList.add('out');          // fondu de 140 ms (voir style.css), désactivé si mouvement réduit
    swapTimer = setTimeout(apply, 140);
  }

  function mountPreview(item) {
    stopDemo('main');
    detail.preview.innerHTML = '';
    detail.wrap.classList.toggle('no-preview', item.kind !== 'ex');
    if (item.kind !== 'ex') return; // pas d'aperçu pour une carte d'Apprendre
    const host = document.createElement('div');
    host.className = 'hub-demo-host';
    detail.preview.appendChild(host);
    fitPreview();
    startDemo('main', gameOf(item.id), host);
  }

  // L'écran de jeu garde sa vraie largeur (760 px) ; on réduit l'ensemble (0,76 à pleine taille).
  function fitPreview() {
    const host = detail.preview.firstElementChild;
    if (!host) return;
    const w = detail.wrap.clientWidth;
    if (w) host.style.transform = `scale(${w / GAME_W})`;
  }

  // ----- mobile : miniatures -----
  function observeThumbs() {
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const el = en.target;
        const key = `${el.dataset.kind}:${el.dataset.id}`;
        if (el.dataset.kind !== 'ex') return;
        const host = el.querySelector('.hub-thumb-host');
        if (en.isIntersecting && visible) {
          if (!demos.has(key)) {
            host.style.transform = '';
            const run = startDemo(key, gameOf(el.dataset.id), host);
            if (run) { requestAnimationFrame(() => cropThumb(run)); setTimeout(() => { if (!run.dead) cropThumb(run); }, 500); setTimeout(() => { if (!run.dead) cropThumb(run); }, 1600); } // la mise en page du jeu se termine après le montage
          }
        } else stopDemo(key);
      });
    }, { root: $('ex-panel'), threshold: 0.2 });
    rows.forEach((r) => { const t = r.el.querySelector('.hub-thumb'); if (t) t.inert = true; io.observe(r.el); });
  }

  // ----- actions -----
  function open(item) {
    if (!item) return;
    location.hash = item.hash;
  }

  // ----- recherche -----
  function onInput() {
    query = searchEl.value;
    render();
  }
  searchEl.addEventListener('input', onInput);
  clearEl.addEventListener('click', () => { searchEl.value = ''; onInput(); searchEl.focus(); });
  searchEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchEl.value) { e.preventDefault(); searchEl.value = ''; onInput(); }
    else if (e.key === 'Enter') { e.preventDefault(); const t = mobileMq.matches ? (rows[0] && rows[0].item) : (selected || (rows[0] && rows[0].item)); open(t); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
  });

  // ----- clavier : ↑ ↓ pour parcourir, Entrée pour lancer, « / » pour chercher -----
  function move(delta) {
    const shown = rows.filter((r) => r.el.offsetParent !== null); // les familles repliées n'ont pas de rangées visibles
    if (!shown.length) return;
    const cur = shown.findIndex((r) => r.item === selected || r.el === document.activeElement);
    const next = Math.max(0, Math.min(shown.length - 1, (cur < 0 ? (delta > 0 ? 0 : shown.length - 1) : cur + delta)));
    shown[next].el.focus(); // le focus fait aussi passer l'aperçu à ce jeu (voir le gestionnaire « focus »)
    if (!mobileMq.matches) select(shown[next].item);
  }
  document.addEventListener('keydown', (e) => {
    if (!visible || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.body.classList.contains('in-game')) return;
    const inField = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.key === '/' && !inField) { e.preventDefault(); searchEl.focus(); searchEl.select(); }
    else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !inField) { e.preventDefault(); move(e.key === 'ArrowDown' ? 1 : -1); }
  });
  $('hub-detail-text').addEventListener('click', () => open(selected));
  $('hub-preview-wrap').addEventListener('click', (e) => { if (e.isTrusted) open(selected); });
  $('hub-launch').addEventListener('click', () => open(selected));

  // ----- cycle de vie -----
  window.addEventListener('resize', () => { if (visible && !mobileMq.matches) fitPreview(); });
  mobileMq.addEventListener('change', () => { if (visible) render(); });
  document.addEventListener('visibilitychange', () => { /* les démonstrations se mettent en attente toutes seules (voir tick) */ });
  new ResizeObserver(() => { if (visible && !mobileMq.matches) fitPreview(); }).observe(detail.wrap);

  window.Notanext.views.hub = {
    show() {
      visible = true;
      render();
    },
    hide() {
      visible = false;
      clearTimeout(swapTimer);
      if (io) io.disconnect();
      stopAllDemos();
    },
  };
  void viewEl; void gridEl;
})();
