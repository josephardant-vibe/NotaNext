# Audit complet de NotaNext — 23 oct. 2026

**Méthode.** Lecture du dépôt (branche `nuit-2026-10-23`, issue de `main` local b77c313), greps, calculs de contraste par script Python, vérificateur du design system. Analyse **statique** : aucun navigateur n'a été ouvert, donc rien ci-dessous n'a été vu à l'écran (rendu, mobile, paysage = à regarder par Joseph). Aucun fichier n'a été modifié par cet audit.

---

## 1. Inventaire

**Vues (une seule page `index.html`, routage par `#/…`)** — `js/game.js` lignes 53 et suivantes :
| Vue | Adresse | Remarque |
|---|---|---|
| Accueil | `#/accueil` (ou adresse sans `#`) | `view-home`, hero + sections + `js/home.js` |
| S'exercer (hub) | `#/exercer`, `#/exercer/<jeu>` | `view-ex`, `js/hub.js` |
| Apprendre | `#/apprendre`, `#/apprendre/<cours>` | `view-learn` (un seul cours : « Les clés ») |
| Réglages | `#/reglages` | `view-settings`, `js/settings.js` |
| Pages texte | `#/mentions-legales`, `#/confidentialite`, `#/credits` | `view-doc`, `js/docs.js` |
| Se connecter | `#/compte` | `view-account`, **plus lié nulle part** (voir ch. 12) |

**Jeux (5)** : Deviner la note, Défilement continu, Placer la note (famille « Lire la portée ») ; Oreille absolue — deviner, Oreille absolue — placer (famille « Oreille absolue »). Noms cohérents entre `hub.js`, `home.js` et `game.js`.

**Modules JS (19, 156 Ko au total)** : access 0,4 · version 0,2 · notes 10,1 · keys 5,4 · audio 11,3 · instrument-menu 6,3 · staff 9,4 · scroll-staff 9,6 · window-staff 7,1 · runner 17,6 · account 0,9 · ear 11,7 · game 37,8 · hub 14,8 · settings 13,7 · docs 9,1 · feedback 5,6 · home 9,3 (Ko).
**CSS** : `style.css` 58,9 Ko (≈ 2 160 lignes), `fonts/fonts.css`. **HTML** : `index.html` 15 Ko.
**Polices** : Fraunces roman 68 Ko + italique 44 Ko, IBM Plex Sans 40 Ko, Noto Music 36 Ko.
**Sons** : `audio/` piano 192 Ko, guitare 100 Ko, flûte 100 Ko, violon 120 Ko, trompette 88 Ko (non lus ni modifiés).
**Autres** : `netlify.toml` (en-têtes seulement), `favicon.svg`, `CREDITS.md`, `README.md`, `docs/` (audit UX du 13 oct., plan de mesure, PDF mémoire), `design/shell-v2-2026-10-20.html` (maquette).

## 2. État du chantier « Shell v2 » (décisions du brief § 3)

| Décision | État | Fichier |
|---|---|---|
| Nav ordinateur : logo · S'exercer · Apprendre · Réglages (engrenage) · « Comptes bientôt » non cliquable | **Existe** (`<span class="app-user">`, pas un lien) | `index.html:118-124` |
| Mobile : barre fine en haut + barre d'onglets en bas | **Existe** (`nav.tabbar`) | `index.html:196` |
| Hub : titre à gauche + ligne d'aide, 2 familles toujours ouvertes | **Existe** (familles `lire` et `oreille`) ; « toujours ouvertes » : un bouton `hub-fam-head` a un style de focus, donc elles semblent repliables → **à vérifier à l'écran** | `hub.js:12-13`, `style.css:2139` |
| Rangée = titre + description + chevron, cliquable entière, ≥ 72 px mobile / 76 px ordi | **Existe** (`.hub-row`) ; hauteurs exactes **non vérifiables** en statique | `style.css:~1940-1960` |
| Ordi : aperçu au survol/focus, ↑ ↓ + Entrée, « / » vers la recherche | **Existe** | `hub.js:254-271` |
| Aperçus = vrais jeux en mode démonstration (muet, inerte) | **Existe** (`mountDemo`, `setDemoSilent`) | `hub.js:51-93` |
| Recherche en direct, étiquette « Jeu » / « Apprendre » | **Existe** | `hub.js:43-44` |
| Réglages : Affichage, Clavier, Son, Mes données, Bêta, Informations | **Existe**, ordre réel : **Bêta d'abord (ouvert)**, puis Affichage, Clavier, Son, Données, Informations. Le commentaire d'en-tête de `settings.js:1` dit encore l'ancien ordre | `settings.js:1,30-100` |
| Clavier : remplir auto (2 préréglages), tout effacer, doublons, `event.code`, repli AZERTY/QWERTY | **Existe** (préréglages et doublons non relus en détail) | `settings.js:51-72`, `keys.js` |
| Son : volume, couper, écouter Piano / Guitare / Flûte | **Existe** (`PREVIEW_IDS = piano, guitar, flute`) | `settings.js:18` |
| Retours : Tally `yXP4ZW`, champs cachés `version` et `page`, script chargé au premier clic | **Existe** | `feedback.js:8-45` |
| Mentions légales en gabarit « À COMPLÉTER » | **Existe** (statut, identité, directeur, hébergeur, droits à compléter) | `docs.js:11-31` |
| Confidentialité exacte, Tally cité | **Existe mais incomplète** : la clé `notanext.visited` (accueil) n'est pas citée (ch. 7) | `docs.js:36-70` |
| Crédits : sons et polices réellement utilisés | **À changer** : violon et trompette sont crédités et présents dans le code, mais le brief ne retient que Piano / Guitare / Flûte (ch. 11) | `docs.js:74-86`, `CREDITS.md` |
| `access.js` : fonction unique « accès complet = oui » | **Existe**, renvoie `true`, aucun mur ni blocage | `js/access.js` |
| Hero de l'accueil figé | Respecté (non touché) | — |
| Instruments : Piano, Guitare, Flûte seulement | **À changer ou à arbitrer** : `audio.js:138-149` définit 5 instruments (piano, violon, flûte, trompette, guitare) et `instrument-menu.js` leur donne une teinte chacun. `CLAUDE.md` valide d'ailleurs **5** teintes d'instrument (ébène, acajou, ardoise, laiton, noyer). Contradiction brief ↔ CLAUDE.md → **décision Joseph** | `audio.js`, `instrument-menu.js` |
| Jeux : noms actuels gardés | Respecté | — |
| Lien direct `/s-exercer/` → 404 | **Confirmé non résolu** (ch. 10) | `netlify.toml` |

## 3. Conformité au design system (vérificateur `--strict`, avant toute correction)

| Règle | Compteur | Fichier |
|---|---|---|
| color-literal | 33 | `style.css` (teintes `rgba(184,80,47,…)` et vertes) + hex dans JS/HTML (SVG, `instrument-menu.js`) |
| pure-white | 25 | `style.css` |
| font-size-off-scale | 67 | `style.css` |
| radius-off-scale | 10 | `style.css` |
| font-weight-off-scale | 8 | `style.css` |
| shadow | 0 | conforme |
| glass | 3 | `style.css:510, 894, 1283` |
| breakpoint-off-grid | 2 | `style.css:2018 (900px), 2116 (720px)` |
| duration-off-scale | 6 | `style.css` |
| font-family-literal | 35 | `style.css` |
| ambient-animation | 9 | `style.css:50 (fond), 79-86 (8 icônes flottantes)` ; + 2 animations « tilt » (1444, 1733) |

Remarque : l'AUDIT.md du 22 oct. comptait 6 `backdrop-filter` ; le vérificateur en compte 3 (il compte autrement). Les décisions de la phase 3 s'appuient sur le vérificateur.

## 4. Accessibilité

**Contrastes calculés** (script Python, valeurs de `tokens.css`) :
| Texte / fond | Rapport | Verdict |
|---|---|---|
| Encre sur papier | 15,55 | AA/AAA |
| Gris texte (stone-600) sur papier / surface relevée | 5,48 / 5,38 | AA |
| Cuivre (texte) sur papier / relevée | 4,61 / 4,53 | AA (limite : 4,5 requis) |
| Papier sur cuivre (texte des boutons) | 4,61 | AA (limite) |
| Cuivre foncé sur papier | 6,87 | AA |
| Vert 600 sur papier / relevée | 4,57 / **4,48** | **sous 4,5 sur surface relevée** pour du texte ; utiliser `green-700` (5,46 / 5,35) |
| Laiton sur papier / relevée | 3,58 / 3,52 | Grands textes et formes seulement (≥ 3) ; **pas** pour du petit texte |
| Gris « raté » (stone-400) sur papier | **2,82** | Sous 3 : jamais seul, toujours avec libellé |
| Bordure de contrôle `#8a8177` sur papier | 3,55 | OK (1.4.11) |

**À vérifier dans le CSS** : usages de `var(--success)` en texte sur fond relevé (4,48) et de `var(--gold)` en petit texte (non audité ligne par ligne).
- **Focus visible** : règle globale `:where(a, button, select, input, [tabindex]):focus-visible` (outline 2 px cuivre foncé, `style.css:1740`) + règles dédiées pour `.hub-row`, `.hub-search`, onglets, switch, `fb-btn`. Bon. Trou possible : `.hub-search input { outline: none }` (ligne 1906) compensé par `:focus-within` (1901) → OK.
- **Mouvement réduit** : géré globalement (`style.css:1758`, durée 0,01 ms), `hub.js`, `home.js`, `runner.js` testent aussi `matchMedia`. Bon. Une animation JS qui ignorerait la requête n'a pas été trouvée.
- **`lang`** : `<html lang="fr">` OK. **Titres** : `h1` présent sur l'accueil, le hub, Apprendre, Se connecter ; Réglages et pages texte injectent le leur par JS (à vérifier à l'écran qu'un seul `h1` est visible à la fois — les vues cachées portent `hidden`).
- **Landmarks** : `<main class="home-main">` sur l'accueil ; **pas de `<main>`** pour l'app (hub/jeux) → lecteurs d'écran sans repère « contenu principal » (P1). Deux `nav` ont le même `aria-label="Navigation principale"` (barre du haut et tabbar, `index.html:119, 196`) : l'un est masqué selon la taille, donc acceptable si `display:none` ; sinon à différencier.
- **aria** : 24 occurrences dans `index.html`, usages présents dans les jeux (`game.js` 13, `instrument-menu.js` 9, `settings.js` 9). L'icône de retours et le runner (SVG `role="img"` avec description) sont décrits.
- **Cibles tactiles** : 10 règles à 44–59 px de hauteur minimum dans le CSS ; les contrôles plus petits (puces, `fb-btn`, boutons de jeu) **n'ont pas été mesurés** → vérifier à 390 px.
- **Couleur seule** : la règle « mauvaise réponse = gris + libellé « c'était X » » est dans le design system ; non vérifiée dans le code des jeux (à contrôler à l'écran).
- **`alert()`** : `feedback.js:51` utilise `alert()` si le formulaire ne s'ouvre pas ; fonctionnel mais brutal (P2).

## 5. Responsive (analyse statique)
- **Largeurs de rupture** : 520 (×3), 760 (×2), 900, 720, 1000 (min-width) + requêtes `max-height: 520px` (×5) pour le paysage mobile. Hors grille : **900** et **720** (`style.css:2018, 2116`).
- Le hub mobile (≤ 900 px) utilise une vignette de 168 × 72 px et un hôte de démonstration de 760 × 605 px mis à l'échelle (`style.css:2031-2032`) : fonctionne par `transform`, **à regarder à 390 px**.
- Largeurs fixes : `max-width` 1240–1280 (colonnes), 578 px, 620 px, 860 px, 940 px ; `width: 104px`, `150px`. Aucun `width` fixe supérieur à 400 px hors la démo du hub. Pas de débordement évident.
- Une règle de rotation : le téléphone en portrait affiche « Tourne ton téléphone » 3 s puis le jeu **se tourne tout seul** (CSS/JS, `game.js:225+`) — comportement à tester sur de vrais appareils (iOS Safari en particulier).
- `viewport` : `width=device-width, initial-scale=1.0` (zoom autorisé, bien).

## 6. Performance
- **Aucune dépendance externe au chargement** : polices et sons hébergés, aucun script tiers (Tally chargé seulement au premier clic).
- **Scripts** : 19 `<script src>` synchrones en fin de `body` (pas de `defer`, mais en fin de page : non bloquant pour le rendu initial). Pas de bundle : 156 Ko non minifiés, compressibles par le serveur.
- **CSS** : 58,9 Ko, une feuille bloquante (normal). `fonts.css` : `font-display: swap` OK, 2 polices préchargées (Fraunces roman, IBM Plex Sans).
- **Sons** : un seul instrument est chargé à la fois (selon `CREDITS.md` / `audio.js`) ; cache 30 jours via `netlify.toml`. Les violon et trompette (208 Ko) sont déployés mais sans doute inaccessibles si la décision « 3 instruments » est prise.
- **Animations infinies** : fond qui dérive (26 s) + 8 icônes flottantes (18–28 s) + 2 « tilt » (1,6 s). Coût : composition GPU légère, mais elles tournent sur toutes les vues, même derrière l'app ; à retirer si la direction « papier statique » est validée (proposition, pas appliqué).
- `netlify.toml` : en-têtes de cache sans `Cache-Control` pour HTML/JS/CSS → le défaut Netlify (revalidation) s'applique ; correct pour un site sans empreinte de fichier.

## 7. Données et confidentialité
**Clés `localStorage` réellement écrites** (grep) : `notanext.notation`, `notanext.keys.v2` (et ancienne `notanext.keys`), `notanext.layout`, `notanext.volume`, `notanext.muted`, `notanext.instrument`, `notanext.autorotate`, `notanext.earplace.names`, `notanext.feedback.hidden`, `notanext.feedback.pos` (réservée, non écrite), **`notanext.visited`** (`home.js:10`).
- **Écart 1 :** la page Confidentialité ne mentionne pas `notanext.visited` (mémoire de la première visite sur l'accueil). Texte factuel à corriger (phase 3 : faisable, mais c'est un texte légal → voir ch. 11 / proposition).
- **Écart 2 :** la page affirme « Tu peux tout effacer dans Réglages > Mes données ». `RESET_KEYS` n'efface **ni `notanext.visited` ni `notanext.feedback.hidden`** (volontairement ?). Incohérence mineure.
- **Cookies** : aucun (`document.cookie` jamais utilisé). **sessionStorage / IndexedDB** : jamais utilisés.
- **Requêtes externes** : au chargement, aucune. Au clic : liens vers doi.org, PubMed (accueil), pages de crédits, `mailto:contact@notanext.app`. Tally : script `https://tally.so/widgets/embed.js` chargé au premier clic sur l'icône.
- **Mesure d'audience** : aucune (cohérent avec `docs/plan-de-mesure.md`, qui est un document sans code).
- **`Referrer-Policy: strict-origin-when-cross-origin`** et `nosniff` posés par `netlify.toml` (propre à l'hébergeur, à reproduire si l'hébergeur change).
- **Adresse e-mail** `contact@notanext.app` publique dans la page et dans le dépôt : normal, mais l'existence de la boîte est à confirmer par Joseph.
- Aucune clé secrète trouvée dans le dépôt (le `FORM_ID` Tally est public par nature).

## 8. Textes
- **Nom** : « NotaNext » partout dans l'interface ; la casse `Notanext` n'apparaît que dans l'espace de noms JS (`window.Notanext`), invisible. OK.
- **Restes obsolètes** cherchés : « 1/8 », « 7 questions », « mur doux », « essai » : **aucun reste visible** dans l'interface. Un commentaire de `hub.js:24` parle de « 8 essais » (sens interne, sans effet). `index.html:49` et `home.js:46` gardent « Commencer gratuitement » : l'accès est gratuit pour tous aujourd'hui (cohérent avec `access.js`) ; **à surveiller** quand le paiement de 3 € arrivera (« gratuit » deviendrait une promesse à tenir).
- **Jargon** : « manches » (`index.html:91`, « des manches courtes ») est du vocabulaire de jeu peu clair pour des adultes débutants ; `game.js:224` précise « Sans fin : pas de manches ». À simplifier en « séries » ou « petits exercices » (décision de formulation → Joseph).
- **Affirmation à sourcer** : `index.html:90` « mieux vaut dix minutes plusieurs fois par semaine qu'une longue session isolée » — le principe (espacer) est couvert par Dunlosky et al. 2013, mais **« dix minutes » et « plusieurs fois par semaine » ne figurent pas dans les sources citées** : à retirer ou à sourcer. Ne pas corriger sans accord (contenu pédagogique).
- **Autres affirmations pédagogiques** (`index.html:87-95`) : « Se tester retient mieux que relire » (Roediger & Karpicke 2006, source citée), « Espacer… aide la mémoire » (Dunlosky 2013, source citée). OK.
- **Cours « Les clés »** (`home.js:191`, `game.js`) : contenu pédagogique (clé de sol / fa / ut) → **je n'ai pas relu le texte du cours** : sa source n'est pas vérifiée ; les Mentions légales promettent « les sources figurent dans les pages concernées ». À vérifier dans le cours (P1).
- `js/docs.js:15, 36` : dates de mise à jour « 20 octobre 2026 » → à actualiser à chaque changement de texte légal.
- Les messages utilisateur sont tutoyés partout (« Tourne ton téléphone », « Écoute un son ») : cohérent.

## 9. Référencement et partage
Présent : `title`, `meta description`, `lang="fr"`, `theme-color`, `og:type/locale/site_name/title/description`, `twitter:card=summary`, favicon SVG.
**Absent** : `og:image` (aucun aperçu d'image au partage), `og:url`, `<link rel="canonical">`, `robots.txt`, `sitemap.xml`, favicon PNG/`apple-touch-icon`, `manifest`. Le site étant une page unique à routage par `#`, un seul `title` statique (mis à jour côté JS par vue : `setTitle`). Sans `og:image`, les partages (WhatsApp, etc.) n'ont pas d'illustration (P1, il faut une image fournie par Joseph — pas inventée).

## 10. Liens et routage
- **Liens internes** : tous les `href="#…"` sont soit des ancres de l'accueil (`#comment`, `#jeux`, `#cours`, `#methode`), soit des routes `#/…` connues. Aucune route cassée trouvée par grep. `#/compte` existe encore dans `game.js:104` mais plus aucun lien n'y mène.
- **404 de `/s-exercer/`** : cause confirmée — le site est une page unique : seule la racine `/` existe et `netlify.toml` n'a aucune règle de réécriture. `/s-exercer/` n'est ni un dossier ni une route : le serveur répond 404 ; l'app, elle, ne comprend que `#/exercer`. Même cause pour `/exercer`, `/reglages`, etc.
- **Deux remèdes indépendants de l'hébergeur** (proposés en patchs, non appliqués) :
  1. **Vraies pages-passerelles** : créer `s-exercer/index.html`, `apprendre/index.html`, `reglages/index.html` qui redirigent vers `/#/exercer` etc. (`<meta http-equiv="refresh">` + `location.replace` + lien de secours). Fonctionne sur tout hébergeur statique.
  2. **`404.html` à la racine** qui lit `location.pathname` et redirige vers `/#/<route>` (ex. `/s-exercer/` → `/#/exercer`) ; la plupart des hébergeurs statiques servent `404.html` pour les adresses inconnues. Moins de fichiers, mais dépend de la convention `404.html` de l'hébergeur (quasi universelle).
  Les deux conservent le site sans Functions/Redirects propriétaires. → `PROPOSITIONS/`.

## 11. Légal et crédits
- **Mentions légales** : existent (`#/mentions-legales`), en gabarit : 5 champs « À COMPLÉTER » (statut, identité/adresse, directeur de la publication, hébergeur, droits/licence). **Joseph doit fournir ces informations**; rien n'est inventé. Obligation légale en France pour un site professionnel/public (LCEN).
- **Confidentialité** : existe, claire, cite Tally (Belgique, UE). Corrections factuelles à faire : mentionner `notanext.visited` ; vérifier la phrase « tu peux tout effacer ».
- **Crédits** : page + `CREDITS.md` consistants entre eux. **Écart** : ils créditent violon et trompette (présents dans le code) ; si ces instruments sont retirés de l'interface, le texte et les dossiers `audio/violin`, `audio/trumpet` deviennent sans objet. Piano = CC BY 3.0 (mention obligatoire : présente). Guitare : licence « usage libre » de l'université d'Iowa citée à la lettre du site (à reverifier à la source avant lancement public).
- `LICENSE` du dépôt : **absent** (dépôt public sans licence = « tous droits réservés » par défaut ; la mention « droits » des mentions légales est à compléter en cohérence).

## 12. Code
- **Classes CSS sans correspondance littérale dans le HTML/JS** (10 sur 233) : `ex-config`, `ex-score`, `ex-title`, `ex-top`, `ex-under`, `tally-popup`, `i1`, `i6`, `i7`, `i8`. Les `i1…i8` sont construites dynamiquement (`bg-icon i${n}`) et `tally-popup` est probablement injectée par Tally : **faux positifs probables** ; `ex-config/score/title/top/under` sont **peut-être du code mort** (à confirmer avant suppression : aucune suppression cette nuit).
- **Code mort probable** : vue `view-account` + `js/account.js` + `js/runner.js` (17,6 Ko) + styles : plus aucun lien n'y mène depuis la Shell v2. `CLAUDE.md` indique pourtant que la page « n'est plus liée nulle part » mais garde l'exception de charte (animation) : à conserver tant que Joseph n'a pas décidé.
- **Règles dupliquées** : `.hub-search:focus-within` et règle globale de focus se recoupent ; non gênant. Le CSS contient plusieurs blocs `@media (max-height: 520px)` séparés (lignes 1469, 1564, 1680, 2126) : candidats à regroupement (P2, risque faible).
- **Version** : `js/version.js` = « bêta 0.1 », joint aux retours Tally. Cohérent avec `settings.js` (affichage). À incrémenter à la mise en ligne de cette branche (décision Joseph).
- **`CLAUDE.md` périmé ?** Globalement à jour (Shell v2). Deux points : il parle de « 5 teintes d'instrument » alors que le brief retient 3 instruments ; il ne mentionne pas `design-system/` (la phase 2 ajoute `AGENTS.md`). `README.md` dit « Déployée sur Netlify » (vrai aujourd'hui).
- **Commentaires obsolètes** : `settings.js:1` (ordre des sections, voir ch. 2).
- **Documentation** : `docs/audit-ux-notanext-2026-10-13.md` et PDF « Mémoire du projet » datent d'avant la Shell v2 (non relus en détail).

---

## Backlog priorisé

| P | Sujet | Effort | Risque | Décision requise |
|---|---|---|---|---|
| P0 | Compléter les **Mentions légales** (5 champs) | 30 min (Joseph) | faible | **Oui** : fournir statut, identité, hébergeur… |
| P0 | Régler le **404** des liens directs (2 solutions en patch) | 30 min | faible | Choisir A (pages-passerelles) ou B (`404.html`) |
| P0 | **Pousser** `design-system/` sur `origin/main` (la tâche de nuit en dépend) | 1 min | nul | Oui |
| P0 | Citer `notanext.visited` dans la page Confidentialité + trancher « tout effacer » | 15 min | faible | Oui (texte légal) |
| P1 | Trancher **3 ou 5 instruments** (brief vs `CLAUDE.md`) ; mettre crédits, menus et `audio/` en cohérence | 1–2 h | moyen | **Oui** |
| P1 | Corriger le texte « dix minutes plusieurs fois par semaine » (non sourcé) et « manches » | 15 min | faible | Oui (formulation) |
| P1 | Passer en jetons : blancs purs/translucides, rayons, graisses, durées, tailles (phase 3 fait la part sûre) | 2–3 h | moyen | Rendu à valider à l'écran |
| P1 | Retirer le **verre dépoli** hors hero (3 usages) | 1 h | moyen | Rendu à valider |
| P1 | Ajouter `<main>` à l'app, différencier les deux `nav` | 20 min | faible | Non |
| P1 | `og:image`, `og:url`, canonical, `robots.txt`, `sitemap.xml` | 1 h | faible | Image à fournir |
| P1 | Vérifier la **source du cours « Les clés »** | 30 min | faible | Oui (contenu) |
| P1 | Contraste : vert `green-600` en texte sur surface relevée (4,48) → `green-700` | 20 min | faible | Non |
| P2 | Animations d'ambiance infinies (9) | 30 min | moyen (DA) | Valider « papier statique » |
| P2 | Regrouper les `@media (max-height: 520px)`, rupture 900/720 → 760/1000 | 1 h | moyen | Rendu à valider |
| P2 | Code mort (`ex-*`, `view-account`/runner) | 1 h | moyen | Décision sur la page « Se connecter » |
| P2 | Remplacer `alert()` du retour par un message dans l'interface | 30 min | faible | Non |
| P2 | Ajouter un `LICENSE` au dépôt | 10 min | faible | Choix de licence |
