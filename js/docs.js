// Pages texte : Mentions légales, Confidentialité, Crédits et licences (accessibles depuis Réglages > Informations).
// Textes sobres, écrits d'après ce que le site fait réellement (audit du 20 octobre 2026). Les champs
// « À COMPLÉTER » attendent les informations de l'éditeur : rien n'est inventé.
window.Notanext = window.Notanext || {};

(function () {
  const root = document.getElementById('doc-panel');
  const TODO = (what) => `<mark class="doc-todo">À COMPLÉTER : ${what}</mark>`;

  const PAGES = {
    'mentions-legales': {
      title: 'Mentions légales',
      title2: 'Mentions légales',
      html: () => `
        <p class="doc-date">Dernière mise à jour : 20 octobre 2026 (gabarit à compléter).</p>
        <h2>Éditeur du site</h2>
        <p>Le site NotaNext est édité par :</p>
        <ul>
          <li>Statut de l'éditeur (particulier, entreprise individuelle, société…) : ${TODO('statut de l\'éditeur')}</li>
          <li>Nom et prénom, ou dénomination sociale, et adresse : ${TODO('identité de l\'éditeur')}</li>
          <li>Directeur de la publication : ${TODO('nom du directeur de la publication')}</li>
          <li>Contact : <a href="mailto:contact@notanext.app">contact@notanext.app</a></li>
        </ul>
        <h2>Hébergeur</h2>
        <p>Le site est hébergé par : ${TODO('nom, adresse et contact de l\'hébergeur')}</p>
        <h2>Propriété intellectuelle</h2>
        <p>Les sons et les polices utilisés par NotaNext sont des œuvres libres de droit ou sous licence libre, dont les auteurs et les licences sont indiqués dans la page <a href="#/credits">Crédits et licences</a>.</p>
        <p>Pour tout le reste du site (textes, code, mise en page), les droits appartiennent à l'éditeur : ${TODO('mention de droits ou licence choisie')}</p>
        <h2>Contenu pédagogique</h2>
        <p>Les contenus pédagogiques proposés dans NotaNext sont tirés de sources citées ; les sources figurent dans les pages concernées.</p>`,
    },

    confidentialite: {
      title: 'Confidentialité',
      html: () => `
        <p class="doc-date">Dernière mise à jour : 20 octobre 2026.</p>
        <p>NotaNext fonctionne sans compte. Cette page décrit ce que le site stocke dans ton navigateur, ce qu'il appelle sur Internet et ce qui est envoyé quand tu écris un retour.</p>

        <h2>Ce que NotaNext stocke dans ton navigateur</h2>
        <p>Le site écrit uniquement dans le stockage local de ton navigateur (<em>localStorage</em>), pour retenir tes réglages. Il n'utilise aucun cookie. Ces informations ne quittent pas ton appareil.</p>
        <ul>
          <li>La notation choisie (Do Ré Mi ou C D E).</li>
          <li>Les touches de clavier associées aux notes, et la disposition de clavier que tu as choisie quand ton navigateur ne la détecte pas.</li>
          <li>Le volume, le choix « Couper le son » et l'instrument choisi.</li>
          <li>La rotation automatique des jeux (téléphone) et l'option « Afficher le nom de la note » de « Oreille absolue — placer ».</li>
          <li>La position et l'état (affichée ou masquée) de l'icône de retours.</li>
          <li>Un repère indiquant que tu as déjà ouvert le site (page d'accueil).</li>
        </ul>
        <p>Tu peux tout effacer dans Réglages, section « Mes données » : « Réinitialiser tous mes réglages ». Tu peux aussi vider les données du site dans ton navigateur.</p>

        <h2>Ce que le site appelle sur Internet</h2>
        <p>Les polices, les sons des instruments, le code et les images viennent tous du site lui-même : aucune police ni aucun script n'est chargé depuis un autre service pour afficher les pages ou jouer. Le site n'utilise aucun outil de mesure d'audience ni aucun traceur.</p>
        <p>Comme tout site, le serveur qui l'héberge reçoit ton adresse IP et les adresses des fichiers demandés, et peut les conserver dans des journaux techniques pour la sécurité et le bon fonctionnement. L'hébergeur est indiqué dans les <a href="#/mentions-legales">mentions légales</a>.</p>
        <p>Dans la page d'accueil, deux liens renvoient vers des études publiées (doi.org et PubMed) : ces sites ne sont contactés que si tu cliques dessus.</p>

        <h2>Quand tu envoies un retour</h2>
        <p>Le formulaire de retours est la seule fonction qui envoie quelque chose. Il est fourni par <a href="https://tally.so" target="_blank" rel="noopener">Tally</a>, société belge dont les données sont stockées en Europe. Le script de Tally n'est chargé que lorsque tu ouvres le formulaire pour la première fois ; avant cela, aucune connexion à Tally n'est faite.</p>
        <p>Quand tu appuies sur « Envoyer », Tally reçoit :</p>
        <ul>
          <li>ton message et son type (bug, idée ou autre) ;</li>
          <li>ton prénom, seulement si tu le saisis (champ facultatif) ;</li>
          <li>la version de NotaNext et la page ou le jeu affiché au moment de l'envoi.</li>
        </ul>
        <p>Tally est destinataire de ces informations et les enregistre pour le compte de NotaNext ; Tally peut aussi traiter des données techniques (comme l'adresse IP) selon sa propre politique de confidentialité. Ton message est lu par l'équipe NotaNext, uniquement pour améliorer le site. Ne mets pas d'informations sensibles dans ton message.</p>

        <h2>Tes droits et nous contacter</h2>
        <p>Pour demander l'accès à un retour que tu as envoyé, sa rectification ou sa suppression, écris à <a href="mailto:contact@notanext.app">contact@notanext.app</a>. Responsable du traitement : l'éditeur du site, identifié dans les <a href="#/mentions-legales">mentions légales</a>.</p>`,
    },

    credits: {
      title: 'Crédits et licences',
      html: () => `
        <p class="doc-date">Sons et polices réellement utilisés par le site.</p>
        <h2>Sons des instruments</h2>
        <p>Les instruments de NotaNext utilisent des échantillons libres de droit, recoupés (environ 2 à 3 secondes), passés en mono et ré-encodés en AAC. Seul l'instrument choisi est chargé par le navigateur.</p>
        <ul class="doc-credits">
          <li><strong>Piano</strong> : <a href="https://sfzinstruments.github.io/pianos/salamander/" target="_blank" rel="noopener">Salamander Grand Piano</a>, Alexander Holm (fichiers via le dépôt <a href="https://github.com/Tonejs/audio" target="_blank" rel="noopener">Tone.js audio</a>). Licence <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener">CC BY 3.0</a> : mention de l'auteur obligatoire.</li>
          <li><strong>Violon, flûte, trompette</strong> : <a href="https://github.com/sgossner/VSCO-2-CE" target="_blank" rel="noopener">VSCO 2 Community Edition</a> (Versilian Studios), échantillons relayés par <a href="https://github.com/nbrosowsky/tonejs-instruments" target="_blank" rel="noopener">tonejs-instruments</a>. Licence <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener">CC0 1.0</a> : aucune obligation.</li>
          <li><strong>Guitare acoustique</strong> : <a href="https://theremin.music.uiowa.edu/" target="_blank" rel="noopener">University of Iowa Musical Instrument Samples</a>, relayés par tonejs-instruments. Usage libre « sans restriction » selon le site de l'université.</li>
        </ul>
        <p>Les notes absentes d'une banque sont obtenues en accélérant ou en ralentissant l'échantillon le plus proche (3 demi-tons au plus) ; les notes hors tessiture sont jouées à l'octave la plus proche dans la plage de l'instrument.</p>
        <h2>Polices</h2>
        <p>Hébergées avec le site, sous licence <a href="https://openfontlicense.org/" target="_blank" rel="noopener">SIL Open Font License 1.1</a> :</p>
        <ul class="doc-credits">
          <li><a href="https://github.com/undercasetype/Fraunces" target="_blank" rel="noopener">Fraunces</a> (Undercase Type) : titres.</li>
          <li><a href="https://github.com/IBM/plex" target="_blank" rel="noopener">IBM Plex Sans</a> (IBM) : textes et boutons.</li>
          <li><a href="https://fonts.google.com/noto/specimen/Noto+Music" target="_blank" rel="noopener">Noto Music</a> (Google) : symboles des clés de musique.</li>
        </ul>
        <p>Les fichiers de polices ont été récupérés une fois depuis Google Fonts (sous-ensemble latin) ; le site n'appelle plus aucun serveur de polices.</p>
        <h2>Études citées</h2>
        <p>Sur la page d'accueil : Roediger et Karpicke (2006), « Se tester retient mieux que relire », et Dunlosky et al. (2013) sur les techniques d'étude, avec liens vers les publications.</p>`,
    },
  };

  const api = {
    show(page) {
      const p = PAGES[page] || PAGES['mentions-legales'];
      document.title = `NotaNext — ${p.title}`;
      root.innerHTML = `
        <div class="doc">
          <a class="backbtn doc-back" href="#/reglages"><span aria-hidden="true">&#8592;</span>Réglages</a>
          <h1>${p.title}</h1>
          ${p.html()}
        </div>`;
      root.scrollTop = 0;
    },
    hide() {},
  };
  window.Notanext.views = window.Notanext.views || {};
  window.Notanext.views.doc = api;
})();
