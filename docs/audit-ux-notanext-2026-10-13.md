# Audit UX/UI NotaNext — 13 octobre 2026

Méthode : skill `uxui-pro-max` (mode AUDIT), norme visée WCAG 2.2 AA, checkpoints France/UE.
Version auditée : `main` au commit `001da3a`, servie en local (aucune mesure sur le site en ligne).

## Verdict

NotaNext a une base propre : une charte cohérente, un texte de feedback qui ne repose jamais sur la
seule couleur, aucun traceur, de bons noms accessibles sur les boutons. Les défauts sont
concentrés sur trois sujets : **le clavier** (deux jeux et un menu ne sont pas utilisables sans
souris), **le contraste** (texte secondaire et bordures trop clairs) et **la rotation forcée** de
l'affichage sur téléphone. Rien de ce qui suit ne remet en cause la direction artistique ; ce sont
des corrections ciblées. Les points légaux et de mesure dépendent d'informations que seul le
propriétaire peut donner.

## Étiquettes de preuve

[VERIFIED] observé ou mesuré dans cette session, ou énoncé par une source primaire · [HEURISTIC] règle d'expert ·
[NEEDS DATA] impossible à conclure sans mesure · [ASSUMPTION] hypothèse non confirmée.

## Plan d'actions pour Claude Code (à exécuter dans l'ordre)

| # | ID | Action | Fichiers | Terminé quand | Effort |
|---|---|---|---|---|---|
| 1 | F5 | Remonter le contraste du texte secondaire : `--muted` de `#8a8177` à `#6f665c` (5,22:1 sur le fond, 5,62:1 sur blanc) ; ajouter un jeton `--grey-text` ≈ `#6b635a` pour le texte « raté » (le gris `#9a938a` ne reste que pour les remplissages) | `style.css` | `scripts/contrast_check.py` donne ≥ 4,5:1 pour chaque paire texte/fond (hint, feedback, tuiles, « C'était », cercle « raté ») | S |
| 2 | F2 | Rendre le menu d'instrument utilisable au clavier : à l'ouverture, focus sur l'option choisie ; flèches haut/bas, Début/Fin, Entrée, Échap ; `aria-controls` | `js/instrument-menu.js` | Tab → Entrée → flèches → Entrée change l'instrument sans souris | S |
| 3 | F1 | Rendre « Placer la note » et « Oreille absolue — placer » jouables au clavier : portée focalisable, flèches haut/bas déplacent la note fantôme, Entrée valide, annonce vocale de la position (nom seulement si l'option est active) | `js/game.js` (mountPlace), `js/ear.js`, `js/staff.js` | Une partie complète se joue sans souris ; la position est annoncée | M |
| 4 | F3 | Panneau Clavier : `role="dialog"`, `aria-modal`, `aria-labelledby`, focus placé dedans à l'ouverture, piégé pendant l'ouverture, rendu au bouton clavier à la fermeture | `js/game.js` (openKeyPanel), `style.css` | Tab ne sort pas du panneau ; à la fermeture le focus revient sur l'icône clavier | S |
| 5 | F4 | Rotation : ajouter dans Apprendre un bouton « Rotation automatique » (ou réglage mémorisé) pour la désactiver, et l'appliquer aussi aux jeux | `js/game.js`, `index.html`, `style.css` | Un téléphone en paysage peut garder Apprendre en paysage | S–M |
| 6 | F8 | Titre de page par écran (`document.title`), titre de jeu en `<h1>`, focus déplacé sur le titre au changement de route | `js/game.js`, `index.html` | Le titre de l'onglet change à chaque écran ; un lecteur d'écran annonce le nouvel écran | S |
| 7 | F17 | Anneau de focus global `:focus-visible` (2 px, `--accent-dark`) sur tous les contrôles, y compris les options du menu ; `scroll-padding-top` pour que l'en-tête collant de l'accueil ne cache pas l'élément focalisé | `style.css` | Chaque contrôle montre un focus visible ≥ 3:1 ; aucun focus masqué par l'en-tête | S |
| 8 | F7 | Mouvement : bloc `@media (prefers-reduced-motion: reduce)` global (fond animé, démo du hero, tuiles, flèche de rotation) et bouton « Pause » pour l'animation du coureur | `style.css`, `js/home.js`, `js/runner.js` | Avec « réduire les animations », plus rien ne bouge en boucle ; le coureur a un bouton pause | S |
| 9 | F6 | Bordures des contrôles interactifs à ≥ 3:1 (boutons de réponse, sélecteurs, interrupteur, champs) ; l'interrupteur éteint doit être identifiable | `style.css` | Rapport mesuré ≥ 3:1 par le script ; validation visuelle du propriétaire (tension avec le style aéré) | S–M |
| 10 | F11 | Héberger les polices soi-même (woff2, sous-ensemble latin) au lieu de Google Fonts ; supprimer les deux `preconnect` | `index.html`, `style.css`, nouveau dossier `fonts/`, `CREDITS.md` | Aucune requête vers `googleapis.com` / `gstatic.com` ; rendu identique | S–M |
| 11 | F12 | Alléger et mettre en cache : ne charger que les graisses utilisées (italique de Fraunces seulement pour le hero), en-têtes de cache dans `netlify.toml` (`/audio/*`, `/fonts/*` longs ; `/js/*`, `/style.css` courts) | `netlify.toml`, polices | Poids des polices mesuré avant/après ; en-têtes visibles dans la réponse | S |
| 12 | F10 | Métadonnées : description, `theme-color`, favicon (tête de note), Open Graph | `index.html`, nouveau `favicon.svg` | Le partage d'un lien montre titre, description et icône | S |
| 13 | F13 | Pages « Mentions légales » et « Confidentialité » liées depuis le pied de page, à partir des informations de l'éditeur (à fournir par le propriétaire) | `index.html`, `js/home.js` | Liens présents sur chaque écran ; contenu relu par un professionnel | S + juridique |
| 14 | F14 | Plan de mesure : définir 6 événements (début de jeu, réponse, changement d'instrument, clic « Commencer », ouverture d'un cours, abandon) avant d'ajouter un outil ; vérifier la doctrine CNIL | nouveau `docs/plan-de-mesure.md` | Document validé ; aucun outil installé sans accord | S |
| 15 | F15 | Harmoniser la graphie « NotaNext » (titre de page, README) | `index.html` | Une seule graphie partout | S |

Ordre = gravité, puis impact ÷ effort. Les lignes 1 à 4 d'abord : elles lèvent les défauts qui bloquent des utilisateurs.

## Périmètre et méthode

- **Pages** : accueil, grille S'exercer, 5 jeux, Apprendre (grille, Les clés, théorie, écoute), Se connecter, Profil (aperçu).
- **Passes faites** : revue du code source ; contrastes calculés avec `scripts/contrast_check.py` ; vérifications dans un navigateur intégré (téléphone 320, 390 × 844, 844 × 390 ; ordinateur) ; poids des polices mesuré en direct.
- **Date / profil** : 13 octobre 2026, Chromium intégré, aucun appareil réel.

## Hypothèses

- [ASSUMPTION] Public : débutants en solfège, majoritairement sur téléphone.
- [ASSUMPTION] Objectif principal : lancer et enchaîner des exercices (« Commencer gratuitement »).
- [ASSUMPTION] Le site cible la France ; l'éditeur et le statut juridique ne sont pas connus.
- [ASSUMPTION] Pas de statistiques disponibles (aucun outil de mesure sur le site).

## Statut par dimension

| Dimension | Statut | Justification |
|---|---|---|
| Stratégie et clarté | Partiel | Promesse et action principale claires sur l'accueil ; l'effet sur la conversion est [NEEDS DATA] |
| Architecture de l'information | Partiel | Navigation simple ; routes en `#`, titre de page unique (F8) |
| Design visuel et cohérence | Partiel | Jetons cohérents, hiérarchie nette ; contrastes insuffisants (F5, F6) |
| Accessibilité | **Échec** (périmètre testé) | Plusieurs P1 : clavier (F1, F2, F3), rotation forcée (F4), contraste (F5) |
| Performance | Non évaluée sur le terrain | Poids mesurés en local ; aucune donnée de mesure réelle |
| Conversion | Non évaluée | Aucune donnée ; pas de test A/B recommandé sans trafic |
| Conformité FR/UE | Partiel | Aucun traceur observé ; pages légales absentes (F13) |

## Résultats détaillés (P1 et P2)

| ID | Sév. | Où | Observation | Pourquoi c'est important | Correction | Preuve | Effort |
|---|---|---|---|---|---|---|---|
| F1 | P1 | « Placer la note », « Oreille absolue — placer » (`js/game.js`, `js/ear.js`) | La portée est un `svg role="img"` qui ne réagit qu'à la souris et au toucher | Une partie ne peut pas être jouée au clavier ni avec un lecteur d'écran (WCAG 2.1.1) | Voir ligne 3 du plan | [VERIFIED] code | M |
| F2 | P1 | Menu d'instrument (`js/instrument-menu.js`) | À l'ouverture, aucun focus n'entre dans la liste ; les options ont `tabindex="-1"`, les flèches ne fonctionnent que depuis une option | Un utilisateur au clavier ne peut pas changer d'instrument (2.1.1) | Ligne 2 | [VERIFIED] code | S |
| F3 | P1 | Panneau Clavier (`openKeyPanel`) | Pas de `role="dialog"`, pas de gestion du focus, Échap sert à annuler la capture d'une touche | Navigation et annonce impossibles pour lecteur d'écran (2.4.3, 4.1.2) | Ligne 4 | [VERIFIED] code | S |
| F4 | P1 | Jeux de lecture et section Apprendre sur téléphone | L'affichage est tourné de force ; un bouton de rotation existe dans les jeux, pas dans Apprendre | WCAG 1.3.4 (Orientation) demande de ne pas imposer une orientation sauf nécessité ; à confirmer sur S-WCAG22 (non relu dans cette session) | Ligne 5 | [VERIFIED] comportement ; [HEURISTIC] gravité | S–M |
| F5 | P1 | Texte secondaire (`--muted`, 24 usages) et gris « raté » (`--grey-ind`) | `#8a8177` sur `#faf6ef` : 3,55:1 ; `#9a938a` : 2,81:1 (échec même en grand texte) | Sous 4,5:1 le texte est difficile à lire pour beaucoup d'utilisateurs (1.4.3) | Ligne 1 (valeurs vérifiées avec le script) | [VERIFIED] script | S |
| F6 | P2 | Bordures des boutons, sélecteurs, interrupteur | `#e4ddd0` sur fond : 1,25 à 1,35:1 | Les limites des contrôles sont à peine visibles (1.4.11, selon que le contour est nécessaire pour les repérer) | Ligne 9 | [VERIFIED] script | S–M |
| F7 | P2 | Fond animé, démo du hero, tuiles, coureur | Boucles infinies ; seule `runner.js` respecte `prefers-reduced-motion` | Mouvement > 5 s sans pause (2.2.2) ; gêne vestibulaire | Ligne 8 | [VERIFIED] code | S |
| F8 | P2 | Routage par `#` | Un seul `<title>` ; titre de jeu dans un `span` ; pas de focus déplacé au changement d'écran | 2.4.2, 2.4.6, 4.1.3 | Ligne 6 | [VERIFIED] code | S |
| F10 | P2 | `<head>` | Seulement `charset`, `viewport`, titre | Partage et recherche de la page d'accueil moins efficaces ; effet sur le classement [NEEDS DATA] | Ligne 12 | [VERIFIED] code | S |
| F11 | P2 | Google Fonts | Les polices viennent de serveurs tiers (adresse IP transmise) | Point à vérifier côté CNIL / RGPD ; aussi une requête externe bloquante | Ligne 10 | [VERIFIED] code ; [NEEDS DATA] exigence juridique | S–M |
| F12 | P2 | Poids | Polices latines : Fraunces 244 Ko, IBM Plex 121 Ko, Noto Music 10 Ko (≈ 375 Ko, mesuré) ; JS 154 Ko et CSS 49 Ko non minifiés ; aucun en-tête de cache dans `netlify.toml` | Chargement plus lent sur réseau mobile ; effet réel [NEEDS DATA] | Ligne 11 | [VERIFIED] mesure locale | S |
| F13 | P2 | Pied de page | Seul `contact@notanext.app` ; pas de mentions légales ni de politique de confidentialité | Checkpoint LCEN / RGPD ; à confirmer sur S-LEGI et S-CNIL | Ligne 13 | [VERIFIED] observation ; [NEEDS DATA] obligation | S + juridique |
| F14 | P2 | Mesure | Aucun outil de mesure, donc aucune hypothèse de conversion testable | Impossible de savoir où les visiteurs abandonnent | Ligne 14 | [NEEDS DATA] | S |
| F17 | P2 | Focus | Les options du menu d'instrument retirent le contour (`outline: none`) pour un fond à 8 % ; le reste suit le style du navigateur ; l'en-tête collant de l'accueil peut masquer un élément focalisé | 2.4.7 ; 2.4.11 (à tester au clavier) | Ligne 7 | [VERIFIED] code ; [NEEDS DATA] test clavier | S |

Polish (P3) : F15, graphie « Notanext » / « NotaNext ».

## Ce qui fonctionne bien (à ne pas changer)

- Texte encre `#211d18` sur fond crème : 15,54:1.
- Boutons cuivre : texte clair sur `#b8502f` à 4,96:1 ; vert `#3f7d52` à 4,56:1.
- Feedback doublé en texte (« Raté, c'était Sol ») ; zone `aria-live` sur le message de réponse.
- Vrais `<button>` pour les tuiles et réponses, `aria-label` sur les sélecteurs et le bouton de lecture.
- `lang="fr"`, symboles de clés en Unicode, aucun traceur, réglages en `localStorage` seulement.
- Pas de défilement horizontal détecté dans les écrans testés à 320 px (méthode limitée).

## Roadmap

- **Maintenant** : lignes 1 à 4 du plan (contraste, menu, clavier, panneau).
- **Ensuite** : lignes 5 à 9 (rotation, titres, focus, mouvement, bordures) et 10 à 12 (polices, cache, métadonnées).
- **Plus tard** : lignes 13 à 15 (pages légales dès que l'éditeur est connu ; plan de mesure ; graphie). Pas de test A/B tant qu'il n'y a pas de trafic.

## Points de conformité FR/UE à vérifier

| Checkpoint | Statut | Où | Source à confirmer | Notes |
|---|---|---|---|---|
| Mentions légales | Absent | Pied de page | S-LEGI (LCEN) | Éditeur, hébergeur (Netlify), contact |
| Politique de confidentialité | Absente | — | S-CNIL | Le site stocke seulement des préférences ; formulaire d'email supprimé |
| Cookies / traceurs | Aucun observé | — | S-CNIL | Pas de bandeau nécessaire tant qu'aucun traceur non essentiel n'est ajouté [à vérifier] |
| Polices externes | Présentes | `index.html` | S-CNIL | Voir F11 |
| Déclaration d'accessibilité | Non applicable à confirmer | — | S-RGAA, S-EAA | L'obligation dépend du statut de l'éditeur |

## Non évalué (et ce qu'il faudrait)

- Passe lecteur d'écran (VoiceOver, NVDA) et parcours complet au clavier avec une vraie personne : seulement le code a été lu.
- Test sur un vrai téléphone (Safari iOS, rotation, audio).
- Zoom 200 %, espacement du texte (1.4.12), taille des cibles tactiles mesurée (2.5.8).
- Scores de performance réels (Lighthouse, Web Vitals de terrain) : outil non installé, à proposer à l'utilisateur.
- Audit RGAA officiel (celui-ci n'en est pas un).

## Annexe : contrastes (script `contrast_check.py`)

| Premier plan | Fond | Rapport | Texte AA | Grand texte | Composant 3:1 |
|---|---|---|---|---|---|
| `#211d18` | `#faf6ef` | 15,54 | oui | oui | oui |
| `#8a8177` | `#faf6ef` | 3,55 | **non** | oui | oui |
| `#8a8177` | `#ffffff` | 3,82 | **non** | oui | oui |
| `#b8502f` | `#faf6ef` | 4,61 | oui | oui | oui |
| `#ffffff` | `#b8502f` | 4,96 | oui | oui | oui |
| `#8f3c22` | `#faf6ef` | 6,87 | oui | oui | oui |
| `#a9791b` (or, score) | `#faf6ef` | 3,58 | non | oui (≥ 24 px, ou ≥ 18,66 px gras) | oui |
| `#3f7d52` | `#faf6ef` | 4,56 | oui | oui | oui |
| `#9a938a` | `#faf6ef` | 2,81 | **non** | **non** | **non** |
| `#e4ddd0` (bordure) | `#faf6ef` | 1,25 | non | non | **non** |
| `#e4ddd0` (bordure) | `#ffffff` | 1,35 | non | non | **non** |
| `#6f665c` (proposé) | `#faf6ef` | 5,22 | oui | oui | oui |
| `#6f665c` (proposé) | `#ffffff` | 5,62 | oui | oui | oui |
| `#6b635a` (proposé, texte « raté ») | `#e6e2da` | 4,56 | oui | oui | oui |

Sources : S-WCAG22 (critères 1.3.4, 1.4.3, 1.4.11, 2.1.1, 2.2.2, 2.4.2, 2.4.3, 2.4.7, 2.4.11, 4.1.2, 4.1.3), S-CNIL, S-LEGI, S-CWV (non rechargées dans cette session ; dernière vérification inscrite au registre : 13 octobre 2026).
