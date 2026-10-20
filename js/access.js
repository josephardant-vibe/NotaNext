// Accès complet : point d'entrée unique pour savoir si le joueur a accès à tout le contenu.
// Aujourd'hui tout est gratuit et ouvert, aucun mur, aucun blocage nulle part dans le site.
window.Notanext = window.Notanext || {};

(function () {
  // Remplacée plus tard par comptes + paiement.
  function hasFullAccess() {
    return true;
  }

  window.Notanext.access = { hasFullAccess };
})();
