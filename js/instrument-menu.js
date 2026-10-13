// Choix d'instrument : pictogramme + nom, une teinte par instrument (exception validée dans
// CLAUDE.md, limitée à ce choix). Menu déroulant personnalisé (un <select> natif ne peut pas
// afficher d'icônes), même style que les autres sélecteurs. Le réglage est global : tous les
// menus de la page se synchronisent via l'événement « notanext:instrument ».
window.Notanext = window.Notanext || {};

(function () {
  const { instruments } = window.Notanext;

  const SVG = (inner) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const META = {
    piano: { color: '#3b3430', icon: SVG('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 18v-5M12 18v-5M16 18v-5"/><path d="M6.5 6v4.5M10 6v4.5M14 6v4.5M17.5 6v4.5" stroke-width="2.6"/>') },
    violin: { color: '#7c3a2d', icon: SVG('<path d="M12 8.5c-2 0-3.4 1.1-3.4 2.8 0 .9.5 1.5 1 1.9-.7.5-1.6 1.4-1.6 2.8 0 2.3 1.8 4 4 4s4-1.7 4-4c0-1.4-.9-2.3-1.6-2.8.5-.4 1-1 1-1.9 0-1.7-1.4-2.8-3.4-2.8z"/><path d="M12 8.5V2.5M10.5 4.5h3"/><path d="M10.5 15.5h3"/>') },
    flute: { color: '#5f6f7e', icon: SVG('<path d="M3.5 20.5l17-17"/><circle cx="8.5" cy="15.5" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/><circle cx="15.5" cy="8.5" r=".9" fill="currentColor"/>') },
    trumpet: { color: '#b3862a', icon: SVG('<path d="M2.5 11h5"/><path d="M7.5 11h9.5"/><path d="M17 11l4.5-3.5v7L17 11z"/><path d="M7.5 11c0 3.2 2 5 4.5 5h5"/><path d="M10 11V7.5M13 11V7.5"/>') },
    guitar: { color: '#8f6b47', icon: SVG('<circle cx="9" cy="15" r="5.2"/><circle cx="9" cy="15" r="1.4"/><path d="M12.7 11.3L19.5 4.5M18 3.5l2.5 2.5"/>') },
  };
  const CHEVRON = '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';

  const label = (id) => instruments.INSTRUMENTS[id].label;
  const iconHtml = (id) => `<span class="inst-ico" style="color:${META[id].color}">${META[id].icon}</span>`;

  let uid = 0;
  function html() {
    const listId = 'inst-list-' + (++uid);
    return `<div class="inst-menu">
      <button type="button" class="inst-trigger" aria-haspopup="listbox" aria-expanded="false" aria-controls="${listId}" aria-label="Choisir un instrument"></button>
      <ul class="inst-list" id="${listId}" role="listbox" aria-label="Instrument" hidden>
        ${instruments.LIST.map((id) => `<li role="option" data-id="${id}" tabindex="-1">${iconHtml(id)}<span>${label(id)}</span></li>`).join('')}
      </ul>
    </div>`;
  }

  // Branche le menu situé dans `root` ; renvoie une fonction de nettoyage.
  function mount(root) {
    const menu = root.querySelector('.inst-menu');
    const trigger = menu.querySelector('.inst-trigger');
    const list = menu.querySelector('.inst-list');
    const options = Array.from(list.querySelectorAll('li'));

    const paint = () => {
      const id = instruments.get();
      trigger.innerHTML = `${iconHtml(id)}<span class="inst-name">${label(id)}</span>${CHEVRON}`;
      options.forEach((o) => o.setAttribute('aria-selected', String(o.dataset.id === id)));
    };
    const close = () => { list.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
    // À l'ouverture, le focus entre dans la liste, sur l'instrument actuel (utilisable au clavier).
    const open = (focusIndex) => {
      list.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      const current = options.findIndex((o) => o.dataset.id === instruments.get());
      options[focusIndex != null ? focusIndex : Math.max(0, current)].focus();
    };

    trigger.addEventListener('click', () => (list.hidden ? open() : close()));
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); open(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); open(options.length - 1); }
    });
    options.forEach((o, i) => {
      const choose = () => { instruments.set(o.dataset.id); close(); trigger.focus(); };
      o.addEventListener('click', choose);
      o.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); options[Math.min(i + 1, options.length - 1)].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); options[Math.max(i - 1, 0)].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); options[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); options[options.length - 1].focus(); }
        else if (e.key === 'Tab') close();
      });
    });
    const onDoc = (e) => { if (!menu.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === 'Escape' && !list.hidden) { close(); trigger.focus(); } };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('notanext:instrument', paint);
    paint();

    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('notanext:instrument', paint);
    };
  }

  // Rangée de 5 grands boutons (Oreille absolue — deviner) : toujours visibles, un seul actif.
  function bigRowHtml() {
    return `<div class="inst-row" role="radiogroup" aria-label="Instrument">
      ${instruments.LIST.map((id) => `<button type="button" class="inst-big" role="radio" data-id="${id}">${iconHtml(id)}<span>${label(id)}</span></button>`).join('')}
    </div>`;
  }

  function mountBig(root) {
    const btns = Array.from(root.querySelectorAll('.inst-big'));
    const paint = () => btns.forEach((b) => {
      const on = b.dataset.id === instruments.get();
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
    });
    btns.forEach((b) => b.addEventListener('click', () => instruments.set(b.dataset.id)));
    window.addEventListener('notanext:instrument', paint);
    paint();
    return () => window.removeEventListener('notanext:instrument', paint);
  }

  window.Notanext.instrumentMenu = { html, mount, bigRowHtml, mountBig, META, label };
})();
