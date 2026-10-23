# Audit de l'interface existante — 22 oct. 2026

**Méthode.** Mesures faites dans le navigateur sur le site publié (notanext.netlify.app) et sur la version locale (localhost:8765), en lisant `style.css` et `fonts/fonts.css`. Les deux `style.css` sont **identiques** (58 767 octets). Aucun code n'a été modifié. Les chiffres sont des mesures, pas des estimations ; les règles du vérificateur (`check-design-system.py`) pourront compter légèrement différemment : sa première exécution fait foi (`--write-baseline`).

## 1. Ce qui existe
- 1 feuille de style (`style.css`) + `fonts/fonts.css` + styles en ligne dans la page. 235 noms de classes CSS.
- 18 modules JS : access, version, notes, keys, audio, instrument-menu, staff, scroll-staff, window-staff, runner, account, ear, game, hub, settings, docs, feedback, home. Le CSS contient déjà des classes de la refonte (`hub-search`, `hub-detail`, `tabbar`, `fb-btn`, `settings`) : à confirmer avec la PR « Shell v2 ».
- Polices : Fraunces (24 usages), IBM Plex Sans (5), Noto Music (2).
- 12 variables CSS (`--paper`, `--ink`, `--control-border`, `--muted`, `--border`, `--accent`, `--accent-dark`, `--gold`, `--success`, `--grey-ind`, `--grey-text`, `--hair`).
- Mouvement réduit déjà géré (2 requêtes `prefers-reduced-motion`). Bon point.

## 2. Écarts mesurés (dette)
| Sujet | Mesure | Cible |
|---|---|---|
| Tailles de police | **22 valeurs** différentes (10 à 48 px + 4 `clamp`) | 8 pas |
| Rayons | **13 valeurs** (6, 8, 10, 12, 14, 16, 20, 22, 28, 999 px, 50 %…) | 5 |
| Largeurs de rupture | **5** (520, 720, 760, 900, 1000 px) + requêtes de hauteur | 3 (520, 760, 1000) |
| Graisses | 400 (×2), 500 (×24), 600 (×33), **700 (×8)** | 400, 500, 600 |
| Couleurs en dur | **18 hex** distincts, dont `#fff` ×10 | uniquement les jetons |
| Blancs translucides | **15** `rgba(255,255,255,…)` + 1 blanc chaud | 0 (le papier n'est jamais blanc pur) |
| Teintes de fond anciennes | `#e7cba2`, `#f3e4c8`, `#d9a866` (dégradé) | à retirer avec le fond statique |
| Verre dépoli | **6** `backdrop-filter` (3 combinaisons) | hero de l'accueil seulement |
| Ombres | 2, ce sont des reflets internes (`inset`) | aucune ombre portée : conforme |
| Durées | 0,12 / 0,15 / 0,18 / 0,25 s | 120 / 180 / 250 ms |
| Animations d'ambiance infinies | fond qui dérive (26 s), icônes flottantes (18 à 22 s), « tilt » (1,6 s) | à retirer si « papier statique » validé |

## 3. Contradictions Charte contre code
| Sujet | Charte (Notion) | Code | Décision v0.1 |
|---|---|---|---|
| Vert bonne réponse | #4C7A52 | **#3F7D52** | Le code gagne (écart de couleur de 2,7 : très faible). Ajout de `green-700` #36704A pour le texte : #3F7D52 donne 4,48:1 sur la surface relevée, juste sous 4,5. |
| Gris texte | #6B6359 | #6F665C **et** #6B635A | Fusion en `stone-600` #6B635A (écart de 1,4 : à peine visible). |
| Or / laiton | non fixé | #A9791B | Retenu `brass-500` #A9791B (3,6:1 : formes et grands textes). Ma proposition précédente (#A67B1F) est abandonnée. |
| Gris « raté » | — | #9A938A (2,8:1) | Conservé pour remplissage et bordure, **toujours avec libellé** (il ne tient pas 3:1 seul). |
| Blanc | « jamais de blanc pur » | 10 `#fff` + 15 blancs translucides | Dette (voir § 2). |
| Verre dépoli | hero seulement | 6 usages dans l'app | Dette (voir § 2). |

## 4. Table de migration (ancien → nouveau)
**Variables CSS** (alias déjà fournis dans `tokens.css`, rien à casser) :
`--paper`→`bg-page` · `--ink`→`text-primary` · `--muted` et `--grey-text`→`text-secondary` · `--border`→`border-subtle` · `--control-border`→`border-control` · `--hair`→`border-hairline` · `--accent`→`action-primary` · `--accent-dark`→`action-primary-hover` · `--gold`→`reward-score` · `--success`→`feedback-correct` · `--grey-ind`→`feedback-wrong-fill`.

**Tailles de police** (plus proche) : 10, 11, 11,5, 12, 12,5 → `xs` 12 · 13, 14, 14,5 → `sm` 14 · 15, 16, 17 → `md` 16 · 18, 20 → `lg` 20 · 22, 24, 26 → `xl` 24 · 34 → `2xl` 30 ou `3xl` 38 (à arbitrer sur rendu) · 48 → `4xl` · `clamp(42px, 6.2vw, 84px)` → `display` · les autres `clamp` (19–25, 30–44, 11–13,5) à revoir au cas par cas.

**Rayons** : 6, 8, 10 → `sm` · 12, 14, 16 → `md` · 20, 22, 28 → `lg` · 999 → `pill` · 50 % → `circle`. Exception connue : `0 0 3px 3px` (soulignement d'onglet).

**Ruptures** : 520 → `phone` · 720, 760 → `tablet` · 900 (à arbitrer : 760 ou 1000), 1000 → `desktop`.

**Durées** : 0,12 s → 120 · 0,15 et 0,18 s → 180 · 0,25 s → 250.

**Couleurs** : `#fff` et blancs translucides → `bg-raised` ou suppression · `#f7f4ee` → `bg-raised` · `#e6e2da` → `border-subtle` · `#4a443c` → `text-primary` ou `text-secondary` (à relire) · `#e7cba2`, `#f3e4c8`, `#d9a866` → retirés avec le fond statique · teintes cuivre `rgba(184,80,47,…)` (10 usages) et vertes `rgba(63,125,82,…)` (5) → à remplacer par des jetons de teinte (à créer si nécessaire).

## 5. Constats confirmés dans le dépôt (lecture de `josephardant-vibe/NotaNext`, `main@014d71d`, 22 oct. 2026)
- **Lien direct qui échoue (404) : cause trouvée.** `netlify.toml` ne contient aucune règle de réécriture et le dépôt n'a pas de dossier `s-exercer/`. Un visiteur qui ouvre ou recharge `/s-exercer/` reçoit « Page not found ». Deux remèdes : créer de vraies pages (un dossier avec son `index.html`) ou passer à un routage par ancre (`#`). Pour rester indépendant de l'hébergeur, éviter une règle propre à Netlify.
- **Marque :** il n'existe qu'un fichier, `favicon.svg` (tête de note et queue en cuivre #B8502F sur carré arrondi papier #FAF6EF). Pas de logo.
- **Polices :** hébergées avec le site (aucune requête vers Google), fichiers variables : Fraunces (roman 400–700 et italique), IBM Plex Sans (400–600), Noto Music (symboles musicaux). Licences SIL OFL dans `CREDITS.md`. Le design system les reprend telles quelles.
- **Variables CSS du dépôt = celles du site publié** (12 variables, mêmes valeurs). Le `style.css` du dépôt fait 58 922 octets contre 58 767 sur le site publié : le dépôt a avancé de quelques lignes.
- **`design/shell-v2-2026-10-20.html`** (maquette de référence) est déjà dans le dépôt.

## 6. Plan de migration (ordre)
**P0 — cette semaine**
1. Ajouter `design-system/` au dépôt, charger `tokens.css` **avant** `style.css`, remplacer le bloc `:root` de `style.css` par rien (les alias de `tokens.css` fournissent les anciens noms).
2. `python3 design-system/check-design-system.py --write-baseline` : fige la dette ; à partir de là, elle ne peut que baisser.
3. Ajouter `AGENTS.md` à `CLAUDE.md`.
4. Régler le 404 des liens directs.

**P1 — avec le prochain chantier d'interface**
5. Fusionner les gris, retirer les blancs purs et translucides, supprimer le verre hors du hero.
6. Passer les tailles de police et les rayons sur les échelles.
7. Documenter les états réels des composants « à documenter ».

**P2 — avec la refonte DA**
8. Ruptures et durées, animations d'ambiance, texture papier, cachets, logo.
