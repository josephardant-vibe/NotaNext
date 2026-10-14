// Page « Se connecter » : les comptes ne sont pas encore ouverts. On y affiche l'animation du
// coureur (js/runner.js). Aucun faux profil ni aperçu « membre » : ils ont été supprimés.
window.Notanext = window.Notanext || {};

(function () {
  const runnerSvg = document.getElementById('runner');
  const pauseBtn = document.getElementById('runner-pause');
  const ctl = runnerSvg && window.Notanext.runner ? window.Notanext.runner.mount(runnerSvg) : null;
  if (ctl && pauseBtn) {
    if (ctl.reduced) pauseBtn.hidden = true; // « réduire les animations » : pose fixe, rien à mettre en pause
    pauseBtn.addEventListener('click', () => {
      const paused = pauseBtn.getAttribute('aria-pressed') !== 'true';
      ctl.setPaused(paused);
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.textContent = paused ? "Reprendre l'animation" : "Mettre en pause l'animation";
    });
  }
})();
