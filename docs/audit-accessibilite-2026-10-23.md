# Rapport du fork « a11y » (branche `nuit-a11y`, issue de `nuit-2026-10-23` d923e00)

Travail en statique (aucun navigateur ouvert). Vérificateur (`build-tokens.py --check` + `check-design-system.py`) : réussi après chaque commit, aucun compteur en hausse. Aucun push, aucune suppression, hero de l'accueil, `audio/` et `.woff2` non touchés.

## Commits (du plus ancien au plus récent)
| Hash | Point | Changement | Risque |
|---|---|---|---|
| 798b383 | a | `<main>` : les 5 vues `div.shell` deviennent `<main class="shell">` et `#game` devient `<main class="game">` (index.html seul). | faible |
| c93a5d7 | b | 2e `nav` : `aria-label="Navigation principale (barre du bas)"` (la barre du haut garde « Navigation principale »). | nul |
| e4fb804 | c | Vert « bonne réponse » **en texte** → `var(--color-sys-feedback-correct-text)` (green-700) : `.feedback.correct`, `.side-label.ok` (fill de texte SVG), `.home-tile-msg.ok`, `.ear-note.good` et `.ear-note.reveal` (couleur de texte seulement). | faible |
| ef753b1 | d | `alert()` de js/feedback.js remplacé par `say()` : `div.fb-note[role=status]` créée au chargement, texte identique, se ferme au clic ou après 10 s, styles en jetons (plat, filet, pas d'ombre/verre). | moyen (voir « à vérifier ») |
| 5411910 | e | Flèches « ← », triangle « ▶ » et « → » enveloppés dans `<span aria-hidden="true">` (6 boutons retour, 2 « Réécouter », « Suivant »). | faible (écart ~2 px) |
| 475bb02 | e | Le `h1.gf-title` du jeu n'est plus `display:none` (≤ 520 px, paysage compact, jeu tourné) mais masqué visuellement : le titre reste lisible par les lecteurs d'écran. | faible |
| 8b0b292 | e | Noms accessibles : liens « Jouer » de l'accueil → `aria-label="Jouer : <jeu>"` ; déclencheur du menu d'instrument → `aria-label="Instrument : <nom affiché>"` (contient le texte visible, WCAG 2.5.3). | faible |
| 1e681cd | e | `<h3>FAQ</h3>` du cours Les clés → `aria-level="2"` (plus de saut h1 → h3, rendu inchangé). | nul |

## Points a) à e) en détail
**a) `<main>`.** Vérifié par grep : aucun JS ni CSS ne dépend du type d'élément des vues (sélecteurs par classe/id, `showView` joue sur l'attribut `hidden`, `[hidden]{display:none !important}` existe ligne 598). `.shell`/`.game` restent `display:flex` etc. : `main` n'ajoute aucun style. Un seul main est affiché à la fois : les vues cachées portent `hidden` ; le repère de l'accueil est un `<div class="home-main" role="main">` dans `#view-home` (caché hors accueil ; devenu `div` + `role="main"` le 23 oct. pour que le HTML source n'ait qu'un seul `<main>` sans `hidden`) ; pendant un jeu, `body.in-game .shell {display:none}` retire la vue de l'arbre d'accessibilité et `#game` (sans `hidden`) devient le main. Validité : dans le HTML source, un seul `<main>` n'a pas `hidden` (`#view-ex`). Pendant un jeu, la vue S'exercer garde son attribut mais est masquée par CSS : le DOM en direct n'est pas celui que valide un validateur, et un seul repère principal est rendu à l'écran (vérifié sur 17 vues à 1440 px et 15 à 390 px).

**c) Vert.** Calcul : `green-600` sur surface relevée 4,48:1 (sous 4,5) ; `green-700` 5,35:1. `.ear-note.good/.reveal` : texte `green-700` sur fond teinté (≈ papier + 14 % de vert) ≈ 4,58:1 (au lieu de ≈ 3,8:1). Non touchés (hero figé) : `.home-question.ok` (l. 958) et `.home-answers button.correct` (l. 987) — texte `--success` dans la démo du hero, à migrer si Joseph rouvre le hero ; `js/home.js:173` écrit `#3f7d52` en dur pour des notes SVG (formes, pas du texte). Non touchés car formes/bordures : `.note-head.reveal-correct` (fill de tête de note), bordures et fonds `rgba(63,125,82,…)`.
**Laiton.** Deux usages en texte : `.ex-score` (`--gold`, 24 px / 600) et `.gf-count` (24 px / 600). 24 px = grand texte, 3,58:1 sur papier (≥ 3:1) : **conforme à la charte et à AA grand texte, rien changé**. Aucun usage de laiton en petit texte.

**d) Message d'état.** Positionné au-dessus de l'icône de retours (tokens `--space-*`, `--component-target-comfort`), `z-index: 41`, masqué sur l'accueil (`body.is-home`), ajusté pour la barre du bas sur mobile (`body.m`). Texte conservé : « Impossible d'ouvrir le formulaire pour l'instant. Vérifie ta connexion et réessaie. » `NOTE_MS = 10000` (modifiable). Non testé sans `node` : relecture manuelle de la syntaxe.

## Relecture e) : constats NON corrigés (à décider ou à vérifier à l'écran)
1. `<summary><h2>` (Réglages, familles du hub) : titre dans un `summary` ; selon le navigateur/lecteur d'écran (VoiceOver surtout) la sémantique de titre peut se perdre. Alternative : `<h2>` hors `summary` + bouton. Structure à retoucher avec test sur lecteur d'écran.
2. `hub.js:148` : `<span class="hub-fam-titles"><h2>…</h2><p>…</p></span>` dans un `summary` : `h2` et `p` dans un `span` / `summary` = non conforme au modèle de contenu HTML (fonctionne partout).
3. IDs dupliqués : `openFrame` écrit `#back`, `#feedback`, `#gf-count`, `#gf-heading`… à la fois dans les aperçus du hub (`demo`) et dans le vrai jeu ; les aperçus sont `aria-hidden` et inertes, et `game.js` cherche toujours dans le conteneur (`out.querySelector`), donc sans effet fonctionnel, mais un doublon d'`id` reste possible dans le DOM.
4. Recherche du hub : aucun message vivant pour le nombre de résultats ; `#hub-empty` n'est pas une région `status`. Ajout possible (`aria-live` sur une région persistante), à tester avec un lecteur d'écran.
5. `.gf-count` : « 3/5 » lu sans contexte (le `title` n'est pas fiable) ; un `aria-label` sur un `span` sans rôle n'est pas pris en charge de façon fiable : prévoir `role="status"` + libellé caché.
6. `.hub-clear` (32 px) et `.hub-slash` : cibles ≥ 24 px (WCAG 2.2 AA OK), sous la cible confortable de 44 px ; non mesuré réellement.
7. `home.js:157` : `<span class="home-soon" aria-disabled="true">` : `aria-disabled` n'a pas d'effet sur un `span` sans rôle (inoffensif).
8. `<a href="#" …>` utilisés comme boutons (logo de l'accueil, « S'exercer », `home-try`) : navigation gérée en JS avec `preventDefault`; sémantiquement des boutons.
9. Les hint `role="status"` (`.gf-hint`, `.app-hint`) contiennent un titre et des boutons : toute la zone est annoncée à l'apparition ; acceptable mais verbeux.
10. Aucun lien d'évitement (« Aller au contenu ») : la navigation est courte (3 onglets), P2.

## À vérifier à l'écran (non fait ici)
- **Espacement des flèches** (commit 5411910) : `.backbtn`/`.replay` sont en `inline-flex; gap: 6px` : la flèche est maintenant un élément à part, l'écart passe d'une espace (~4 px) à 6 px.
- **Message d'état** (ef753b1) : simuler l'échec (hors ligne ou bloquer `tally.so`) puis cliquer sur l'icône de retours : message lisible à 390 / 760 / 1440 px, ne recouvre ni la barre du bas ni les touches en paysage ; se ferme au clic et au bout de 10 s.
- **`<main>`** (798b383) : naviguer dans les 5 vues + un jeu : mise en page identique ; contrôle à faire avec un lecteur d'écran (un seul repère « principal » par écran).
- **Titre h1 du jeu masqué** (475bb02) : vérifier à 390 px et en paysage que rien ne dépasse de `.gf-top` (élément passé en `position:absolute`, 1 px).
- **Vert en texte** (e4fb804) : regarder « Bonne réponse » en jeu et la note d'Oreille absolue — texte un peu plus foncé.
