# Rapport du matin — NotaNext, 23 oct. 2026 (mis à jour après le contrôle à l'écran)

## 1. Résumé
- Tout est dans le worktree `../NotaNext-nuit`, branche `nuit-2026-10-23` (38 commits locaux). **Rien n'est poussé.**
- **Audit complet** + addendum « contrôle à l'écran » : `design-system/AUDIT-COMPLET-2026-10-23.md`.
- **Design system installé** (`tokens.css`, `CLAUDE.md`, vérificateur, baseline abaissée). 6 jetons de teinte **proposés** (v0.2.0) à valider.
- **Corrigé** : graisses, rayons, durées, tailles de police, blancs opaques, polices, teintes, accessibilité (`<main>`, noms, message à la place de `alert()`, contrastes, cibles), 3 bugs d'affichage mobile, code mort, 2 textes (03 et 04) + 1 correction issue de la revue de code.
- **Revue de code** (12 constats) : 8 corrigés, 4 reportés (voir § 5).
- **Contenu pédagogique** : inventaire sourcé dans `design-system/SOURCES-COURS-CLES.md` (27 affirmations ; 1 erreur probable sur la clé d'ut alto). Corrections **proposées**, non appliquées.
- **16 patchs** : 5 déjà appliqués (`PROPOSITIONS/appliquees/`), les autres vérifiés avec `git apply --check`, explications dans `PROPOSITIONS/README.md`.
- Vérifié à l'écran : hub, jeux (jouer, juste/faux, clavier), Réglages, Apprendre, accueil à 390 / 760 / 1440 px et paysage. **Non vérifié** : appareils réels (iOS Safari), lecteur d'écran, le son.

## 2. Avant / après (vérificateur strict)
| Règle | Avant | Après | Reste |
|---|---|---|---|
| Couleurs en dur | 33 | 14 | hero, SVG, instruments, runner |
| Blanc pur | 25 | 2 | hero seulement |
| Tailles de police hors échelle | 67 | 36 | hero, zones compactes (patch 09) |
| Rayons hors échelle | 10 | 4 | hero + onglet |
| Graisses | 8 | 0 | |
| Polices en dur | 35 | 0 | (le vérificateur ignore désormais `@font-face`) |
| Durées | 6 | 1 | `earPop` (patch 10) |
| Verre dépoli | 3 | 1 | hero seulement (voulu) |
| Ruptures hors grille | 2 | 2 | patch 08 |
| Animations d'ambiance | 9 | 0 | |

## 3. Ce que j'ai corrigé après avoir regardé les écrans
Score illisible en paysage ; lignes de cours trop petites ; en-tête de l'accueil mobile écrasé ; FAQ du cours coincée dans une boîte qui défile seule ; recherche du hub surlignée par la couleur seule.

## 4. Ce que je n'ai pas pu vérifier
Vrais téléphones (rotation automatique des jeux), lecteur d'écran sur `<main>` et le message d'erreur, rendu après chaque patch de `PROPOSITIONS/` autre que le 12, le son des instruments.

## 5. Décisions à prendre (avec ma recommandation)
1. ~~Fond des jeux : « papier statique » ?~~ **Fait** (patch 12 appliqué, `CLAUDE.md` mis à jour). Contrôlé à l'écran : 5 jeux à 390, 760, 1440 px et en paysage. Deux défauts révélés et corrigés : le message « Tourne ton téléphone » ne recouvrait plus les réglages (empilement de `.gf`), et la roue d'Oreille absolue dépassait de la carte à 390 px (défaut ancien).
2. **Instruments : 3 ou 5 ?** Réglages en montre 3, Oreille absolue 5, `CLAUDE.md` valide 5 teintes. *Garder 3, retirer violon et trompette d'un coup (menus, crédits, `audio/`).*
3. **404 : patch 01 ou 02 ?** *02.*
4. ~~Hero : compteur « 1 / 8 » (11) et ellipse décorative (16)~~ **Appliqués** (compteur « bonnes réponses / total » comme les vrais jeux, ellipse retirée) et contrôlés à 390 et 1440 px. Le hero a donc été modifié sur ton accord explicite.
5. ~~Textes pédagogiques (13, 14, 15)~~ **Appliqués** et contrôlés à l'écran (Les clés : 4 clés, 390 et 1440 px ; accueil). Les formulations restent à relire par toi. Limites : voir `design-system/SOURCES-COURS-CLES.md` § 4 et 5 (listes d'instruments non confirmées dans un ouvrage d'orchestration ; Roediger lu par son résumé).
6. **Mentions légales** : 5 champs à fournir (obligatoire avant public).
7. **Jetons de teinte (v0.2.0)** : à valider.
8. **Avant de fusionner dans `main`** : ne pas y mettre `RAPPORT-MATIN.md`, `NUIT-JOURNAL.md`, `PROPOSITIONS/`, `design-system/*.md` (Netlify publie tout le dépôt) ; `design-system/` n'est que sur ta `main` locale (la tâche de nuit programmée échouera tant que ce n'est pas poussé).
9. Reportés par la revue : `CLAUDE.md` contradictoire (voir 1), `tokens.css` = une requête bloquante de plus, `hub-row-desc` à 15 px (patch 09).

## 6. Comment regarder la version
```
cd "/Users/ardantjoseph/Entrepreneuriat/Projet NotaNext/NotaNext-nuit" && python3 -m http.server 8766
```
Puis http://localhost:8766 : accueil, hub, un jeu, Réglages, Apprendre, à 390 / 760 / 1440 px.

## 7. Comment valider ou refuser
- **Valider :** `cd "/Users/ardantjoseph/Entrepreneuriat/Projet NotaNext/NotaNext-nuit" && git log --oneline main..` puis `git push -u origin nuit-2026-10-23` et une pull request.
- **Appliquer une proposition :** `git apply PROPOSITIONS/NN-nom.patch`.
- **Tout refuser :** depuis le dossier principal, `git worktree remove ../NotaNext-nuit --force` puis `git branch -D nuit-2026-10-23` (les worktrees `NotaNext-nuit-a11y` et `NotaNext-nuit-sources` et leurs branches se retirent de la même façon).
