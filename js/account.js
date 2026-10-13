// Compte (APERÇU) : aucun vrai compte n'existe encore. Ce fichier gère
//  - l'état « visiteur / membre » (le mode membre n'existe qu'en aperçu : ?apercu=membre),
//  - la page « Se connecter » (animation du coureur, js/runner.js) et la coquille « Profil »
//    (données FICTIVES, aucune logique réelle).
window.Notanext = window.Notanext || {};

(function () {
  const PREVIEW_KEY = 'notanext.apercu';

  const store = {
    get(area, key) { try { return window[area].getItem(key); } catch (e) { return null; } },
    set(area, key, value) { try { window[area].setItem(key, value); } catch (e) { /* stockage indisponible : valable pour la session */ } },
    del(area, key) { try { window[area].removeItem(key); } catch (e) { /* idem */ } },
  };

  // ?apercu=membre active l'état connecté (mémorisé pour la session), ?apercu=visiteur le coupe.
  const params = new URLSearchParams(location.search);
  if (params.get('apercu') === 'membre') store.set('sessionStorage', PREVIEW_KEY, 'membre');
  if (params.get('apercu') === 'visiteur') store.del('sessionStorage', PREVIEW_KEY);

  const isMember = () => store.get('sessionStorage', PREVIEW_KEY) === 'membre';

  // ----- Profil (coquille, données d'exemple) -----
  const SAMPLE = {
    name: 'Marie',
    level: 'Niveau 3',
    instruments: 'Piano, Violon',
    streak: '7 jours de pratique',
    recent: [
      ['Deviner la note', "Aujourd'hui", '6/7'],
      ['Placer la note', 'Hier', '5/7'],
      ['Défilement continu', 'Il y a 2 jours', '7/7'],
      ['Deviner la note', 'Il y a 4 jours', '4/7'],
    ],
  };

  function renderProfile(root) {
    root.innerHTML = `
      <p class="preview-banner">Aperçu — données d'exemple</p>
      <div class="profile-head">
        <div class="profile-id">
          <div class="avatar big" aria-hidden="true">${SAMPLE.name[0]}</div>
          <div>
            <h1 class="profile-name">${SAMPLE.name}</h1>
            <p>${SAMPLE.level}</p>
            <p>Instruments préférés : ${SAMPLE.instruments}</p>
          </div>
        </div>
        <span class="pill">${SAMPLE.streak}</span>
      </div>
      <h2 class="profile-sub">Derniers exercices joués</h2>
      <ul class="recent">
        ${SAMPLE.recent.map(([game, when, score]) => `<li><div><b>${game}</b><span>${when}</span></div><em>${score}</em></li>`).join('')}
      </ul>
    `;
  }

  // ----- Page « Se connecter » : animation du coureur -----
  const runnerSvg = document.getElementById('runner');
  if (runnerSvg && window.Notanext.runner) window.Notanext.runner.mount(runnerSvg);

  window.Notanext.account = { isMember, renderProfile };
})();
