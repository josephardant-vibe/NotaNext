# Brief de la nuit du 23 oct. 2026 — pour Claude Code

## 1. Mission
Joseph dort. Il veut trouver au réveil : (1) un **audit complet** du site au peigne fin, (2) une **version proposée** sur une branche locale, (3) un **rapport** clair pour valider. Il décidera, puis il fera lui-même le push. Rien ne part sur GitHub sans lui.

## 2. Contexte
- NotaNext : web app française pour apprendre à lire la musique (jeux courts, sans compte). Site statique (HTML, CSS, JS dans `js/`), sans bibliothèque de composants ; hébergé sur Netlify aujourd'hui, mais **tout doit rester indépendant de l'hébergeur** (pas de Netlify Forms, Functions, Identity).
- Public : adultes qui voulaient apprendre le solfège sans en avoir eu le temps ni les moyens ; besoin de zéro friction.
- Dépôt public : aucune clé secrète, jamais.
- Design system : `design-system/` (jetons, règles, audit, vérificateur). **Les jetons gagnent** sur la Charte et sur les maquettes.
- Mesures déjà faites (22 oct.) : 22 tailles de police, 13 rayons, 5 largeurs de rupture, 18 couleurs en dur (dont `#fff` ×10), 15 blancs translucides, 6 `backdrop-filter`, graisse 700 ×8, animations d'ambiance infinies. Le lien direct `/s-exercer/` renvoie 404 (pas de dossier, pas de règle de réécriture dans `netlify.toml`). Détail : `design-system/AUDIT.md`.

## 3. Décisions déjà prises (à vérifier dans le code : existe, à changer, absent)
**Navigation.** Ordinateur : logo NotaNext (→ accueil) · S'exercer · Apprendre · Réglages (engrenage) · « Comptes bientôt » en texte discret **non cliquable**. Mobile : barre du haut fine + barre d'onglets en bas (3 destinations). Même habillage plat partout.
**Hub S'exercer.** Titre aligné à gauche + une ligne d'aide. Deux familles toujours ouvertes (« Lire la portée », « Oreille absolue »). Rangée = titre + description + chevron, toute la rangée cliquable (≥ 72 px mobile, 76 px ordinateur), sans bouton « Jouer ». Ordinateur : liste + volet d'aperçu ; survol ou focus change l'aperçu ; clic sur la rangée ou l'aperçu ouvre le jeu (1 clic) ; ↑ ↓ + Entrée ; « / » place le curseur dans la recherche ; première rangée présélectionnée. Mobile : rangées hautes avec petit aperçu à droite. Les aperçus réutilisent les vrais écrans de jeu en **mode démonstration** (muet, non jouable).
**Recherche.** Champ dans la page, sous le titre, filtre en direct sur les 5 jeux et les cartes d'Apprendre (titres réels lus dans le code), étiquette « Jeu » ou « Apprendre ».
**Réglages.** Affichage (notation Français / Anglais) ; Clavier (ordinateur seulement : correspondance note → touche, « Remplir automatiquement » avec 2 préréglages, « Tout effacer », signalement des doublons, touches lues par position physique `event.code`, choix manuel AZERTY/QWERTY en repli) ; Son (volume, couper, écouter Piano / Guitare / Flûte) ; Mes données (réinitialiser) ; Bêta (donner mon avis, version, « Réafficher l'icône ») ; Informations (À propos → accueil, Mentions légales, Confidentialité, Crédits et licences).
**Retours bêta.** Icône discrète et masquable, jamais sur la portée ni les contrôles ; ouvre le popup du formulaire **Tally id `yXP4ZW`** avec les champs cachés `version` et `page` ; script Tally chargé seulement au premier clic. Les réponses arrivent dans Notion (déjà relié côté Tally).
**Pages texte.** Mentions légales : gabarit « À COMPLÉTER » (n'invente rien). Confidentialité : texte exact après audit de ce que le site stocke et appelle, en citant Tally (Belgique, UE). Crédits : sons et polices réellement utilisés.
**Accès futur.** `js/access.js` existe : vérifier qu'une fonction unique répond « accès complet = oui » pour tous. Plan futur : 3 €, paiement unique, accès complet, interrupteur par compte. **Aucun mur, aucun paiement, aucun blocage maintenant.**
**Hero de l'accueil.** Figé : ne pas le modifier. Proposer seulement.
**Instruments.** Piano, Guitare, Flûte. **Jeux :** garder les noms actuels.

## 4. Interdits
Push, merge dans main, PR ; suppression de fichiers ; installations ; blanc pur, ombre portée, verre dépoli hors du hero, cercles décoratifs, violet, vermillon, ocre ; vert hors « bonne réponse » ; laiton hors score et séries ; information par la couleur seule ; contenu pédagogique inventé ; toucher à `audio/`, aux `.woff2` ; clé secrète ; dépendance à l'hébergeur ; travail dans le dossier principal du dépôt.

## 5. Plan en phases
**Phase 0 — Préparation.** Worktree `../NotaNext-nuit` (branche `nuit-2026-10-23`). `python3 design-system/build-tokens.py --check`. `python3 design-system/check-design-system.py --strict` : note les chiffres **avant**.
**Phase 1 — Audit complet (lecture seule)** → `design-system/AUDIT-COMPLET-2026-10-23.md`, en 12 chapitres :
1. Inventaire : pages et vues, routes, modules JS, fichiers CSS, poids des fichiers.
2. État du chantier « Shell v2 » : tableau de chaque décision du § 3 (existe / à changer / absent), avec le fichier concerné.
3. Conformité au design system : chiffres du vérificateur par règle, par fichier.
4. Accessibilité : contrastes (calcule-les par script Python à partir des variables), focus visible, cibles tactiles, attributs `aria`, `lang`, titres, ordre de tabulation, mouvement réduit.
5. Responsive : largeurs de rupture, paysage, tailles fixes, débordements probables (analyse statique : tu n'as pas de navigateur).
6. Performance : poids, polices chargées, scripts bloquants, chargement des sons, animations infinies.
7. Données et confidentialité : clés `localStorage`/`sessionStorage`, cookies, requêtes externes (grep des URL), polices ou scripts tiers, mesure d'audience, Tally.
8. Textes : cohérence des noms de jeux, orthographe « NotaNext », restes obsolètes (« 1/8 », « 7 questions », « mur doux », essai), promesses non tenues, **toute affirmation pédagogique à sourcer**.
9. Référencement et partage : `title`, `description`, `lang`, balises de partage, favicon, `robots`, plan de site.
10. Liens et routage : liens internes cassés, cause et remède du 404 (proposer 2 solutions indépendantes de l'hébergeur).
11. Légal et crédits : pages Mentions légales, Confidentialité, Crédits (existence, gabarits « À COMPLÉTER »), `CREDITS.md` complet ?
12. Code : classes CSS jamais utilisées, règles dupliquées, erreurs de lecture évidentes, cohérence `version.js`, `CLAUDE.md` périmé, docs obsolètes.
Termine par un **backlog priorisé** (P0 / P1 / P2) : effort, risque, décision requise.
**Phase 2 — Installer le design system sur la branche.** Charger `design-system/tokens.css` avant `style.css` dans toutes les pages ; supprimer les deux blocs `:root` de `style.css` (les alias de `tokens.css` fournissent les anciens noms) ; ajouter le contenu de `design-system/AGENTS.md` à `CLAUDE.md` (sans rien retirer) ; `python3 design-system/check-design-system.py --write-baseline`. Commit.
**Phase 3 — Corrections sûres**, une par commit, vérificateur après chacune ; si un compteur monte, annule ce commit :
- 3a gris : `--muted` et `--grey-text` → `text-secondary` (déjà fait par les alias : vérifier).
- 3b blancs purs et translucides → `bg-raised` ou suppression, **seulement** là où le rendu reste identique ; sinon PROPOSITIONS.
- 3c graisses 700 → 600.
- 3d rayons selon la table de `AUDIT.md` § 4.
- 3e durées de transition selon la table.
- 3f tailles de police selon la table, **sauf** les cas marqués « à arbitrer » (→ PROPOSITIONS).
- 3g restes obsolètes évidents dans les textes (« 1/8 », « 7 questions »…) : corriger seulement si le texte de remplacement est certain.
Ne fais **pas** : le verre dépoli (propose), les animations d'ambiance (propose), le hero (propose), le routage/404 (propose en 2 patchs), les textes juridiques (gabarits seulement).
**Phase 4 — PROPOSITIONS/** : un patch par sujet incertain (`git diff` enregistré) + un fichier d'explication de 5 lignes (pourquoi, risque, comment l'appliquer).
**Phase 5 — Rapport du matin** → `RAPPORT-MATIN.md` à la racine du worktree (voir § 6).

## 6. Gabarit de RAPPORT-MATIN.md (en français simple, sans jargon, ≤ 2 pages)
1. **Résumé en 10 lignes** : ce qui est fait, ce qui ne l'est pas, ce que Joseph doit décider.
2. **Avant / après** : tableau des compteurs du vérificateur (par règle).
3. **Ce qui a changé** : liste des commits (une ligne chacun, avec le risque : faible / moyen / élevé).
4. **Ce que je n'ai pas pu vérifier** : tout ce qui demande l'œil de Joseph (rendu, mobile, paysage), et ce qui a été interrompu faute de crédits.
5. **Décisions à prendre** : questions numérotées, avec ma recommandation.
6. **Comment regarder la version** : `cd ../NotaNext-nuit && python3 -m http.server 8766`, puis ouvrir http://localhost:8766 ; pages à regarder en premier (accueil, hub, un jeu, Réglages) à 390 px, 760 px, 1440 px.
7. **Comment valider ou refuser** :
   - Valider : `cd ../NotaNext-nuit && git log --oneline main..` (relire), puis `git push -u origin nuit-2026-10-23` et ouvrir une pull request.
   - Appliquer une proposition : `git apply PROPOSITIONS/NN-nom.patch`.
   - Tout refuser : `cd` dans le dossier principal puis `git worktree remove ../NotaNext-nuit --force` et `git branch -D nuit-2026-10-23`.
Aucune de ces commandes ne doit être exécutée par toi.

## 7. Journal
`NUIT-JOURNAL.md` à la racine du worktree : une ligne par phase (heure, phase, résultat, commit).
