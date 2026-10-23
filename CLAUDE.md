# NotaNext — mémo projet

Web app d'apprentissage du solfège (HTML/CSS/JS vanilla, pas de framework),
déployée sur Netlify depuis GitHub (josephardant-vibe/NotaNext).

## Charte visuelle (ne jamais dévier sans le dire explicitement)
- Fond blanc cassé #FAF6EF (jamais blanc pur), cuivre #B8502F (interface/
  accent), or/laiton distinct pour score/série, vert = bonne réponse
  uniquement, gris = mauvaise réponse/neutre. Jamais de violet ni de bleu
  générique.
- Exception validée (5 oct. 2026) : les pictogrammes d'instruments (choix
  d'instrument) sont autorisés, chacun avec sa teinte « classe » propre
  (ébène, acajou, ardoise, laiton, noyer) ; limitée au choix d'instrument.
- Exception validée (13 oct. 2026) : la page « Se connecter » affiche une
  animation illustrée (petit personnage cuivre qui court sur une portée, notes
  qui passent au vert quand il les touche) ; ni pictogramme ni vert « bonne
  réponse » ailleurs. Animation fournie par le propriétaire (js/runner.js).
- Verre (Liquid Glass) : réservé au panneau de démonstration du hero de
  l'accueil. Depuis le 23 oct. 2026 (« papier statique »), les écrans de jeu
  sont plats : fond papier uni, cadre à filet fin, aucun verre ni blanc
  translucide. Aucune ombre portée ailleurs.
- Icônes : uniquement des têtes de note, jamais de pictogramme de portée.
- Polices : Fraunces (titres/score), IBM Plex Sans (texte/boutons).
- Clés de musique : vrais symboles Unicode (police), jamais de tracé SVG
  à main levée.

## Règles de travail
- Ne modifier que les fichiers réellement concernés par une demande.
- Montrer une proposition avant d'implémenter un gros changement.
- Contenu pédagogique : toujours dérivé d'une source citée, jamais
  inventé librement.

## Structure actuelle
- index.html, style.css, 404.html (adresses directes → #/…), robots.txt,
  netlify.toml, js/ (notes.js = données, game.js = navigation et jeux, ear.js =
  oreille absolue, runner.js = animation de la page Se connecter), audio/
  (échantillons), docs/ (audits, sources du cours, mise en ligne),
  design-system/ (jetons, vérificateur, outil de contrôle à l'écran dans
  outils/). Passage prévu sur notanext.com : docs/mise-en-ligne-notanext-com.md.
- Navigation (shell v2, maquette design/shell-v2-2026-10-20.html) : logo ·
  S'exercer · Apprendre · Réglages (engrenage) · « Comptes bientôt » (texte non
  cliquable) ; mobile : barre fine en haut + barre d'onglets en bas. Habillage
  plat partout. Pas de profil ni de comptes ; l'ancienne page Se connecter
  (#/compte) n'est plus liée nulle part.
- Modules : hub.js (hub S'exercer : liste-détail, recherche, aperçus en mode
  démonstration), settings.js (Réglages), keys.js (touches par position
  physique, event.code), docs.js (mentions légales, confidentialité, crédits),
  feedback.js (icône de retours + popup Tally yXP4ZW, script chargé au premier
  clic), version.js (numéro de version joint aux retours), access.js.
- Aperçus du hub : les vrais jeux montés en mode démonstration (openFrame avec
  `demo`) ; muet (Notanext.sound.setDemoSilent), conteneur inerte, aucun
  stockage ni clavier. Tout nouveau jeu doit fournir `answer(ok)` (renvoie
  faux tant que le jeu n'est pas prêt) / `pause(p)` quand il est monté avec
  `demo` ; `demo.speed` (1,9) accélère ses pauses. Un aperçu répond dès son
  affichage (première réponse juste).
- Retours bêta : formulaire Tally (hors Netlify) → base Notion « Retours bêta —
  NotaNext ». Champs cachés : version, page.

## Accès complet (à venir)
- Modèle prévu : paiement unique de 3 €, accès complet ; un interrupteur par compte
  (accès accordé ou non). Rien n'est en place : comptes et paiement ne sont pas
  construits.
- Point d'entrée unique : `js/access.js`, `window.Notanext.access.hasFullAccess()`,
  qui renvoie toujours vrai pour l'instant (« remplacée plus tard par comptes +
  paiement »). Tout futur contenu réservé passera par cette fonction ; aucun mur,
  aucune page de paiement, aucun blocage tant qu'elle n'a pas été remplacée.

## Design system


> À copier dans `CLAUDE.md` (section « Design system ») et à relire avant TOUTE tâche qui touche à l'interface, aux textes, aux couleurs ou à la mise en page.

### Sources, dans cet ordre
1. `design-system/tokens.json` (valeurs) → `design-system/tokens.css` (variables).
2. `design-system/DESIGN-SYSTEM.md` (règles, composants).
3. `design-system/AUDIT.md` (dette connue et plan de migration).

### Obligatoire
- **Utilise les variables** `var(--color-sys-…)`, `--font-size-…`, `--space-…`, `--radius-…`, `--motion-duration-…`. Aucune valeur visuelle écrite en dur.
- **Une valeur manque ?** Ne l'invente pas : propose son ajout dans `tokens.json` (avec description et contraste), lance `python3 design-system/build-tokens.py`, puis utilise-la.
- **Composants :** réutiliser, puis étendre, puis créer (voir DESIGN-SYSTEM.md § 8). Pas de nouveau composant sans fiche et sans accord de Joseph.
- **Avant de terminer** une tâche d'interface, exécute :
  ```
  python3 design-system/build-tokens.py --check
  python3 design-system/check-design-system.py
  ```
  Si le second échoue, tu as ajouté de la dette de design : corrige-la ou, si l'exception est justifiée, explique-la dans la PR sous « Exception design : … ».
- **Ne modifie jamais** `tokens.css` à la main (il est généré) ni `baseline.json` à la hausse (seulement pour réduire la dette, avec `--write-baseline` après correction).

### Interdits
- Blanc pur ; ombre portée ; verre dépoli hors du hero de l'accueil ; cercles décoratifs ; violet ; vermillon et ocre.
- Vert pour autre chose qu'une bonne réponse ; laiton pour autre chose que le score et les séries ; gris seul pour une mauvaise réponse (ajouter « c'était [nom] »).
- Taille de police, rayon, graisse, durée ou largeur de rupture hors des échelles (DESIGN-SYSTEM.md § 2).
- Information portée par la couleur seule.
- **Contenu pédagogique inventé.** Un texte d'apprentissage vient d'une source vérifiée, jamais de toi.
- Toucher au hero de l'accueil sans demande explicite de Joseph.
- Dépendre d'un hébergeur (Netlify Forms, Functions, Identity) : le site doit pouvoir changer d'hébergeur. Aucune clé secrète dans le dépôt (il est public).

### Claude Design (maquettes)
- Une planche, un objet. Jamais plusieurs étapes à la fois.
- Cite les jetons par leur nom (ex. `color.sys.action-primary`) et les contrastes.
- Toute valeur proposée hors des jetons est marquée **PROPOSÉ** et justifiée (contraste AA, distance de couleur y compris daltonisme).
- Une maquette n'est pas la vérité : en cas d'écart avec les jetons, les jetons gagnent.

### En cas de doute
Ne devine pas. Écris la question dans la PR sous « Questions pour Joseph » et continue avec la solution la plus prudente (réutiliser l'existant).

### Définition de « terminé » (design)
- [ ] Aucune valeur en dur nouvelle (vérificateur OK).
- [ ] États couverts : repos, survol, focus, appui, désactivé (et erreur si formulaire).
- [ ] Contraste AA vérifié, focus visible, usage au clavier testé, mouvement réduit respecté.
- [ ] Testé en 390 px, 760 px et 1440 px.
- [ ] Fiche du composant ajoutée ou mise à jour dans DESIGN-SYSTEM.md ; changelog à jour si un jeton a changé.
