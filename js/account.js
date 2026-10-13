// Page « Se connecter » : les comptes ne sont pas encore ouverts. On y affiche l'animation du
// coureur (js/runner.js). Aucun faux profil ni aperçu « membre » : ils ont été supprimés.
window.Notanext = window.Notanext || {};

(function () {
  const runnerSvg = document.getElementById('runner');
  if (runnerSvg && window.Notanext.runner) window.Notanext.runner.mount(runnerSvg);
})();
