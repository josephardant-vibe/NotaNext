# Rapport du matin — NotaNext, 23 oct. 2026

## 1. Résumé
- L'**audit complet** est fait : `design-system/AUDIT-COMPLET-2026-10-23.md` (12 chapitres + liste de choses à faire classées P0/P1/P2).
- Le **design system est installé** sur la branche `nuit-2026-10-23` : `tokens.css` est chargé avant `style.css`, les deux blocs `:root` sont retirés, les règles pour les agents sont dans `CLAUDE.md`.
- **6 corrections sûres** appliquées, une par commit, sans jamais faire monter un compteur : gris (rien à faire), blancs purs opaques, graisses, rayons, durées, tailles de police.
- **10 propositions** prêtes dans `PROPOSITIONS/` (404, verre, animations, textes, etc.), non appliquées.
- Rien n'est parti sur GitHub : aucun push, aucune pull request. Le travail est dans `../NotaNext-nuit`.
- Cette mission a été lancée à la main dans une session (et non pendant la nuit) après que `design-system/` ait été commité sur ta `main` locale.
- **Je n'ai pas tout vu à l'écran** : seulement un contrôle rapide (hub à 1440 et 390 px, Réglages à 1440 px). Les jeux, le paysage et 760 px sont à regarder.
- Tu dois décider surtout : 3 ou 5 instruments, le choix du 404, et compléter les Mentions légales (voir § 5).

## 2. Avant / après (vérificateur, mode strict)
| Règle | Avant | Après | Reste |
|---|---|---|---|
| Couleurs en dur | 33 | 32 | à créer : jetons de teinte |
| Blanc pur | 25 | **16** | translucides (patch 06) + hero |
| Tailles de police hors échelle | 67 | **36** | zones compactes, hero, cas à arbitrer |
| Rayons hors échelle | 10 | **4** | hero + exception d'onglet (3 px) |
| Graisses hors échelle | 8 | **0** | — |
| Ombres | 0 | 0 | — |
| Verre dépoli | 3 | 3 | patch 06 (hero conservé) |
| Ruptures hors grille | 2 | 2 | patch 08 (720) ; 900 à arbitrer |
| Durées hors échelle | 6 | **1** | `earPop` (patch 10) |
| Polices en dur | 35 | 35 | mécanique, non fait |
| Animations d'ambiance | 9 | 9 | patch 07 |

## 3. Ce qui a changé (branche `nuit-2026-10-23`)
- `0df21d1` Audit complet — risque : nul (texte seulement).
- `3ba714d` Design system installé (tokens.css, `:root` retirés, AGENTS dans CLAUDE.md, baseline) — risque : **faible** ; le gris secondaire passe de `#6f665c` à `#6b635a` (à peine visible).
- `b031c15` 3b blancs purs opaques → `bg-raised`, texte blanc sur cuivre → papier — risque : faible/moyen (les champs passent de blanc à blanc chaud ; contraste du texte sur bouton cuivre 4,6:1, conforme AA).
- `1d850c2` 3c graisses 700 → 600 — risque : faible (Fraunces des scores un peu moins gras ; IBM Plex ne dépassait déjà pas 600).
- `9f66998` 3d rayons (6 usages) hors hero — risque : faible.
- `41a0ec3` 3e durées de transition — risque : faible.
- `3e0491c` 3f tailles de police (31 usages) hors accueil, SVG et zones compactes — risque : **moyen** (de 1 à 4 px selon les cas ; 22 → 24, 26 → 24, 18 → 20, 15 → 16…).
- 3a (gris) : rien à faire, les alias couvrent déjà tout. 3g (restes obsolètes « 1/8 », « 7 questions ») : **aucun trouvé**.

## 4. Ce que je n'ai pas pu vérifier
- Aucun jeu n'a été joué à l'écran (portée, oreille absolue, démonstrations du hub), ni en **paysage mobile** ni à **760 px**.
- L'accueil (hero compris) n'a pas été regardé ; je n'y ai rien modifié.
- Pas de test sur vrais téléphones (rotation automatique des jeux, Safari iOS).
- Les contrastes sont calculés sur les jetons ; chaque usage réel (vert en petit texte sur fond relevé, laiton) n'a pas été vérifié ligne par ligne.
- Rien n'a été interrompu faute de crédits.

## 5. Décisions à prendre
1. **Instruments : 3 ou 5 ?** Le code en a 5, ton brief veut Piano/Guitare/Flûte, `CLAUDE.md` valide 5 teintes. *Recommandation :* garder 3 pour l'accueil et les Réglages, puis retirer violon/trompette partout d'un seul coup (menus, crédits, `audio/`).
2. **404 : solution A (pages-passerelles) ou B (`404.html`) ?** *Recommandation :* B (un seul fichier, couvre aussi les pages texte).
3. **Mentions légales** : fournir les 5 informations (statut, identité/adresse, directeur de publication, hébergeur, droits). Obligatoire avant tout lancement public.
4. **Confidentialité** : ajouter la clé `notanext.visited` (patch 03) et trancher « tout effacer » (la réinitialisation n'efface pas cette clé ni l'icône masquée). *Recommandation :* appliquer 03 et effacer aussi ces deux clés.
5. **Textes de l'accueil** : « dix minutes plusieurs fois par semaine » n'est pas sourcé, « manches » est du jargon (patch 04). *Recommandation :* appliquer 04.
6. **Verre dépoli, blancs translucides, animations d'ambiance** (patchs 06 et 07) : valides-tu la direction « papier statique » ? *Recommandation :* oui pour 06 après un coup d'œil en jeu ; 07 selon ton goût.
7. **Pousser `main`** : `design-system/` n'est que sur ta `main` locale ; la tâche de nuit programmée échouera tant que tu n'as pas fait `git push origin main`.
8. **Couleurs de teinte** (cuivre/vert translucides) : créer des jetons dans `tokens.json` ? *Recommandation :* oui, c'est le seul moyen de vider les 32 couleurs restantes.

## 6. Comment regarder la version
```
cd "/Users/ardantjoseph/Entrepreneuriat/Projet NotaNext/NotaNext-nuit" && python3 -m http.server 8766
```
Puis ouvrir http://localhost:8766 (un serveur est peut-être déjà lancé sur ce port). À regarder en premier : accueil, hub (S'exercer), un jeu, Réglages, à 390 px, 760 px et 1440 px.

## 7. Comment valider ou refuser
- **Valider :** `cd "/Users/ardantjoseph/Entrepreneuriat/Projet NotaNext/NotaNext-nuit" && git log --oneline main..` (relire), puis `git push -u origin nuit-2026-10-23` et ouvrir une pull request.
- **Appliquer une proposition :** `git apply PROPOSITIONS/NN-nom.patch` (explications dans `PROPOSITIONS/README.md`).
- **Tout refuser :** depuis le dossier principal, `git worktree remove ../NotaNext-nuit --force` puis `git branch -D nuit-2026-10-23`.
