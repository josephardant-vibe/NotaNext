# Propositions (rien n'est appliqué dans la branche)

Chaque patch a été vérifié avec `git apply --check` sur la branche `nuit-2026-10-23`. Les patchs 03, 04, 06 à 16 sont déjà appliqués ; restent seulement 01, 02 (404) et 05 (robots.txt) (dossier `appliquees/`). Les autres ont été regénérés le 23 oct. après les derniers commits (`git apply --check` OK). Pour en appliquer un : `git apply PROPOSITIONS/NN-nom.patch`, puis relancer `python3 design-system/check-design-system.py` et **regarder à l'écran** (390 / 760 / 1440 px).

## 01 — 404, solution A : pages-passerelles (`01-404-pages-passerelles.patch`)
- Pourquoi : `/s-exercer/`, `/apprendre/`, `/reglages/` renvoient 404 (il n'y a qu'une page `index.html` et aucune règle de réécriture).
- Ce que ça fait : crée 3 petits dossiers avec un `index.html` qui redirige vers `/#/exercer` etc.
- Risque : faible ; fonctionne sur n'importe quel hébergeur statique. Ne couvre que les 3 adresses créées.
- Choisir A **ou** B (pas les deux).

## 02 — 404, solution B : `404.html` (`02-404-page-unique.patch`)
- Pourquoi : même problème, un seul fichier à la racine qui lit l'adresse et redirige vers la bonne route (`#/…`) ; couvre aussi les pages texte.
- Risque : faible ; suppose que l'hébergeur sert `404.html` pour les adresses inconnues (Netlify, GitHub Pages, Cloudflare Pages le font) et que le site est à la racine du domaine.
- Le 404 des adresses inconnues sans correspondance reste affiché (« Page introuvable » + lien d'accueil).

## 03 — Confidentialité : clé `notanext.visited` — APPLIQUÉE (`appliquees/03-…`, commit 99d391d)
- Pourquoi : `js/home.js` écrit `notanext.visited` dans le navigateur et la page ne le dit pas ; or elle prétend être complète.
- Ce que ça fait : ajoute une ligne à la liste des données stockées.
- Risque : texte légal, donc à faire relire. Le bouton « Réinitialiser » n'efface ni cette clé ni celle de l'icône masquée : à décider (corriger la phrase « tu peux tout effacer » ou ajouter ces clés à `RESET_KEYS`, `js/settings.js:16`).

## 04 — Textes de l'accueil — APPLIQUÉE (`appliquees/04-…`, commit d923e00), à corriger par la 14
- Pourquoi : « dix minutes plusieurs fois par semaine » ne figure dans aucune des deux sources citées ; « manches courtes » est du jargon.
- Ce que ça fait : « des séances courtes et régulières » et « des exercices courts, corrigés ».
- Risque : formulation pédagogique, à valider. Si la précision « dix minutes » est voulue, il faut une source.

## 05 — `robots.txt` (`05-robots-txt.patch`)
- Pourquoi : aucun fichier `robots.txt`. Ce patch autorise tout, sans plan de site (l'adresse définitive du site n'est pas connue, je ne l'invente pas).
- Risque : nul.

## 06 — Verre dépoli et blancs translucides — INCLUSE DANS LA 12, APPLIQUÉE (`appliquees/06-…`)
- Pourquoi : `backdrop-filter` en dehors du hero (3 → 1 restant : le hero) et blancs translucides `rgba(255,255,255,…)` (pure-white 16 → 2 restants, tous dans le hero).
- Ce que ça fait : fonds pleins `bg-raised`, filets `border-subtle`, retrait des reflets internes.
- Risque : **moyen** — les écrans de jeu (`.gf`, `.faq`, boutons) perdent la transparence sur le fond animé ; à regarder en jeu et en paysage.

## 07 — Animations d'ambiance — INCLUSE DANS LA 12, APPLIQUÉE (`appliquees/07-…`)
- Pourquoi : le fond de l'écran de jeu dérive en boucle (26 s). Les 8 icônes flottantes ne sont plus dans le code (code mort retiré, commit 21d6eee). La direction « papier statique » n'est pas validée.
- Risque : moyen (direction artistique). Les animations « tilt » des indices ne sont pas touchées.

## 08 — Rupture 720 → 760 px — APPLIQUÉE (`appliquees/08-…`, commit 130f2f3)
- Pourquoi : 720 px n'est pas sur la grille (520 / 760 / 1000). La rupture 900 px (hub mobile) n'est **pas** dans le patch : table « à arbitrer » (760 ou 1000).
- Risque : faible, mais les téléphones larges (721–760 px) changent de comportement en portrait.

## 09 — Tailles de police restantes — APPLIQUÉE (`appliquees/09-…`, commit 70f3b5c)
- Pourquoi : valeurs de la table de `AUDIT.md` § 4 laissées de côté cette nuit (zones compactes : paysage mobile, étiquettes SVG, touches, rangées du hub) car un pixel de plus peut faire déborder.
- Risque : moyen ; à regarder dans les jeux en paysage et dans le hub. Le patch ne touche pas `.home-*`.

## 10 — Animation « earPop » — APPLIQUÉE (`appliquees/10-…`, commit e5579ce)
- Pourquoi : durée de 0,5 s hors échelle (120 / 180 / 250 ms). Le patch la ramène à 250 ms.
- Risque : faible (réaction visuelle plus vive sur la bonne réponse d'Oreille absolue).

## 11 — Compteur de la démo du hero — APPLIQUÉE (`appliquees/11-…`, commit 67bdceb + correctif 0aab355 : le patch affichait « 1 / 0 » 1,1 s après une bonne réponse)
- Pourquoi : la démo du hero affiche « 1 / 8 » en boucle (`js/home.js`, `index.html`), reste des anciennes manches de 8 questions. Les vrais jeux affichent « bonnes réponses / total » sans fin (« 0 / 0 »).
- Ce que ça fait : la démo compte comme les vrais jeux (`0 / 0`, puis `1 / 1`…).
- Risque : faible, **mais c'est le hero (figé)** : à toi de décider.

## 12 — Papier statique complet — APPLIQUÉE (`appliquees/12-…`, avec deux correctifs : empilement de `.gf` et roue d'Oreille absolue)
- Pourquoi : les écrans de jeu gardent un fond dégradé beige qui dérive, un cadre en verre dépoli et des blancs translucides, alors que tout le shell (hub, Réglages, Apprendre) est plat sur papier. Ce patch regroupe 06 + 07 + un fond uni `bg-page` (retrait de `bgDrift`). Les verres/blancs du hero restent.
- Vérificateur après le patch : pure-white 2, glass 1 (hero), ambient-animation 0, color-literal 27.
- Testé à l'écran (jeu 1440 px, oreille absolue, Apprendre) : lisible, cohérent avec le hub ; à regarder en paysage mobile.
- Risque : moyen (direction artistique). **Ne pas appliquer en plus de 06 et 07** (il les contient).
- Note : le code mort des icônes de fond a été retiré à part (commit 21d6eee).

## 13 — Cours « Les clés » : corrections sourcées — APPLIQUÉE (`appliquees/13-…`, commit 41a0b65)
- Pourquoi : `design-system/SOURCES-COURS-CLES.md` (sources lues : Larousse, Dolmetsch Online). La FAQ de l'ut alto dit « la seule clé d'ut encore couramment utilisée » : c'est contredit par ces sources (la clé d'ut ténor sert couramment au basson).
- Ce que ça fait : 6 textes (notes.js : sol, fa, ut alto ×2, ut ténor ; home.js : carte du cours).
- Risque : contenu pédagogique : à valider par toi avant d'appliquer (règle du projet).

## 14 — Accueil : textes conformes aux sources — APPLIQUÉE (`appliquees/14-…`, commit 3872140)
- Pourquoi : Roediger & Karpicke (2006) ne montrent l'avantage du test qu'à long terme (à 5 minutes la relecture gagne) ; Dunlosky et al. (2013) parlent d'espacer l'étude, pas de séances « courtes ». « tu apprends à chaque note » est une promesse non sourcée.
- Ce que ça fait : reformule 3 phrases. La phrase sur « séances courtes » (proposition 04 déjà appliquée) a été corrigée par la revue de code (commit e0f9e6d) ; ce patch reprend les 3 autres reformulations.
- Risque : formulation pédagogique, à valider.

## 15 — Cours « Les clés » : ligne « Sources » — APPLIQUÉE (`appliquees/15-…`, commit ef836d7)
- Pourquoi : les Mentions légales promettent « les sources figurent dans les pages concernées » ; la page du cours n'en affiche aucune.
- Ce que ça fait : une ligne « Sources » (Larousse, Dolmetsch) sous la FAQ, stylée par jetons.
- Risque : faible.

## 16 — Hero : retirer l'ellipse décorative — APPLIQUÉE (`appliquees/16-…`, commit b240686)
- Pourquoi : le hero affiche une grande ellipse cuivre translucide derrière le titre (`.home-blob`). Les règles (BRIEF § 4, AGENTS.md) interdisent les cercles décoratifs.
- Ce que ça fait : retire l'élément SVG de `index.html` et sa règle CSS.
- Risque : faible techniquement, **mais c'est le hero (figé)** : à toi de décider. Le bouton « Commencer gratuitement » a aussi un liseré bas de 3 px (`border-bottom`) qui ressemble à une ombre : non touché.

## Avant de fusionner (décisions hors patch)

- `netlify.toml` publie tout le dépôt (`publish = "."`) : une fois fusionnés, `RAPPORT-MATIN.md`, `NUIT-JOURNAL.md`, `PROPOSITIONS/` et `design-system/*.md` seraient publics sur le site. Ne fusionne pas ces fichiers dans `main` (ou publie un dossier dédié).
- `CLAUDE.md` se contredit : « Un seul panneau verre par écran » (charte) contre « verre dépoli hors du hero : interdit » (bloc design system). À trancher avec le patch 12.

---

## Sujets sans patch (décision préalable de Joseph)

- **Instruments : 3 ou 5 ?** Le code propose 5 instruments (piano, violon, flûte, trompette, guitare) ; le brief retient Piano / Guitare / Flûte ; `CLAUDE.md` valide 5 teintes d'instrument. À trancher, puis mettre en cohérence `audio.js`, `instrument-menu.js`, `docs.js`, `CREDITS.md` et le dossier `audio/` (jamais touché cette nuit).
- **Hero de l'accueil** (figé) : les rayons 28 et 14 px, le verre (`blur(20px)`) et les blancs de `.home-demo` ne sont pas modifiés. Proposition : les migrer seulement si Joseph valide un nouveau hero.
- **Couleurs en dur restantes (32)** : teintes cuivre `rgba(184,80,47,…)` et vertes `rgba(63,125,82,…)`, hex dans le SVG et `instrument-menu.js`. Il faut d'abord **créer des jetons de teinte** dans `tokens.json` (avec contraste) : décision de Joseph.
- **Tailles de police hors table** : 28 px (`.learn-left h1`), 32 et 40 px (titres des pages texte), 34 px (titres du hub et de Réglages), 36 px (`.hub-detail-title`), et les `clamp(...)` : 30 ou 38 ? À arbitrer sur rendu.
- **Polices en dur (35)** : `font-family: "Fraunces", Georgia, serif` partout ; remplacement par `var(--font-family-…)` sûr mais mécanique (35 lignes) : je ne l'ai pas fait faute de temps de vérification visuelle ; patch faisable sur demande.
- **Mentions légales** : 5 champs « À COMPLÉTER » à fournir par Joseph (statut, identité/adresse, directeur de la publication, hébergeur, droits).
- **Partage** : `og:image`, `og:url`, canonical, favicon PNG : il faut l'adresse définitive et une image fournie par Joseph.
- **Repère `<main>`** : fait par le fork a11y (voir `design-system/A11Y-FORK-RAPPORT.md`), à tester avec un lecteur d'écran.
