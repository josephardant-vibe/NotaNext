# Design system NotaNext — v0.1.0 (22 oct. 2026)

> Version minimale, volontairement courte. Elle évolue (c'est normal : un design system est un produit vivant, pas un projet qu'on termine). Elle sert de **référence unique** à Claude Design, Claude Code et aux automatisations.

## 0. Ordre de vérité (en cas de contradiction)
1. `design-system/tokens.json` (valeurs) → généré en `tokens.css`.
2. Ce document (règles et composants).
3. `CLAUDE.md` et la Charte Notion (contexte). Si la Charte contredit les jetons, **les jetons gagnent** et la Charte est corrigée.
4. Les maquettes Claude Design : elles illustrent, elles ne décident pas.

## 1. Principes
1. **Clarté en 5 secondes.** Une personne qui arrive comprend ce que propose NotaNext, ce que c'est pour elle et quoi faire. Tout élément qui ne sert pas cela est retiré.
2. **Papier et encre, à plat.** Fond papier, encre, filets fins. Pas d'ombre portée, pas d'effet de verre hors du hero, pas de cercle décoratif. La hiérarchie se fait par la taille, le poids, l'espace et les filets.
3. **La couleur a un sens.** Vert = bonne réponse (exclusivement). Gris = mauvaise réponse, avec « c'était [nom] ». Laiton = score et séries. Cuivre = interface. Aucune information ne passe par la couleur seule : toujours un libellé, une forme ou une icône.
4. **Réutiliser avant d'inventer.** Un composant existant d'abord, puis son extension, puis un nouveau (voir § 8).
5. **Accessible par défaut.** Contraste AA, focus visible, clavier complet, mouvement réduit respecté, cibles tactiles suffisantes.
6. **Jamais de contenu pédagogique inventé.** Les textes d'apprentissage viennent de sources vérifiées, pas du design.

## 2. Fondations

### 2.1 Couleur
Deux couches : `color.ref.*` (valeurs de base, ne jamais utiliser directement) et `color.sys.*` (rôles, ce que le code utilise). Variables CSS : `var(--color-sys-…)`.

| Rôle (`color.sys`) | Valeur | Contraste sur papier | Usage |
|---|---|---|---|
| `bg-page` | #FAF6EF | — | Fond. Jamais de blanc pur. |
| `bg-raised` | #F7F4EE | — | Portée, panneaux. |
| `text-primary` | #211D18 | 15,6:1 | Texte, notation musicale. |
| `text-secondary` | #6B635A | 5,5:1 | Descriptions, aides. |
| `text-accent` | #B8502F | 4,6:1 | Titres et liens d'interface. |
| `text-on-accent` | #FAF6EF | 4,6:1 sur cuivre | Texte sur bouton cuivre. |
| `action-primary` / `-hover` | #B8502F / #8F3C22 | 4,6 / 6,9:1 | Boutons, onglet actif. |
| `border-control` | #8A8177 | 3,6:1 | Bordure des contrôles (≥ 3:1). Jamais du texte. |
| `border-subtle`, `border-hairline` | #E4DDD0, encre 12 % | 1,2:1 | Filets de séparation (décoratifs). |
| `feedback-correct` / `-text` | #3F7D52 / #36704A | 4,6 / 5,5:1 | Bonne réponse uniquement. |
| `feedback-wrong-fill` / `-text` | #9A938A / #6B635A | 2,8 / 5,5:1 | Mauvaise réponse : toujours avec libellé. |
| `reward-score`, `reward-series` | #A9791B | 3,6:1 | Score, séries : formes et grands textes seulement. |
| `stamp-navy/burgundy/teal` | #1F3A5F, #7B2A3A, #2F6F73 | 10,7 / 8,7 / 5,4:1 | **Proposé** (cachets, non livré). |

Règles :
- Interdits : blanc pur, violet, vermillon et ocre (trop proches du cuivre et du laiton), rose ancien (confondu avec le vert par certains daltoniens).
- Texte : ≥ 4,5:1 (≥ 3:1 pour du texte ≥ 24 px ou en gras ≥ 19 px). Éléments d'interface : ≥ 3:1.
- Le cuivre et le vert se rapprochent pour certains daltoniens : le nom de la note accompagne toujours le vert.

### 2.2 Typographie
| Famille | Variable | Usage |
|---|---|---|
| Fraunces | `--font-family-display` | Titres |
| IBM Plex Sans | `--font-family-text` | Texte, boutons, étiquettes |
| Noto Music | `--font-family-music` | Symboles musicaux |
| Parisienne | `--font-family-script` | **Proposé** : logo et un mot d'accent par section, 28 px minimum |

Échelle (8 pas) : 12, 14, 16, 20, 24, 30, 38, 48 px (`--font-size-xs … 4xl`) + `--font-size-display` (hero, fluide). Graisses : 400, 500, 600 uniquement. Interlignes : 1,1 (titres), 1,3, 1,5 (texte).

| Rôle | Police | Taille | Graisse |
|---|---|---|---|
| Display (hero) | Fraunces | display | 600 |
| Titre de page (h1) | Fraunces | 3xl | 600 |
| Titre de section (h2) | Fraunces | xl–2xl | 600 |
| Titre de composant (h3) | IBM Plex Sans | lg | 600 |
| Texte | IBM Plex Sans | md | 400 |
| Étiquette, bouton | IBM Plex Sans | sm | 500–600 |
| Légende | IBM Plex Sans | xs | 400 |

(Les rôles sont normatifs pour le neuf ; à confirmer sur rendu et à migrer progressivement, voir `AUDIT.md`.)

### 2.3 Espacement, formes, hiérarchie
- Espacement : `--space-1 … 16` = 4, 8, 12, 16, 24, 32, 48, 64 px. Aucune autre valeur.
- Rayons : `--radius-sm` 8, `-md` 12, `-lg` 20, `-pill` 999, `-circle` 50 %.
- Bordures : fine 1 px, forte 2 px. **Pas d'ombre portée** : on sépare avec des filets (`border-hairline`).
- Verre dépoli (`backdrop-filter`) : réservé au hero de l'accueil.

### 2.4 Mouvement
Durées : 120 ms (retour immédiat), 180 ms (transition standard, apposition d'un cachet), 250 ms (changement de vue). Courbe `ease-out`. Toute animation respecte `prefers-reduced-motion`. Pas de confettis, pas de rebond, pas de son obligatoire. Les animations d'ambiance infinies (fond qui dérive, icônes flottantes) sont une dette connue : à retirer si la direction « papier statique » est validée.

### 2.5 Grille et points de rupture
Trois largeurs : **520** (téléphone), **760** (tablette), **1000** (ordinateur). Les requêtes de hauteur et d'orientation (jeux en paysage) restent autorisées. Contenus : une colonne sur téléphone ; liste + volet d'aperçu à partir de 1000 px.

### 2.6 Iconographie et notation
Les icônes sont des têtes de note (pleines, vides, pointillées, groupées selon le sens). Les clés, silences et altérations sont de vrais symboles musicaux (Noto Music), jamais des images. La notation est toujours en encre.

### 2.7 Texture et papier (proposé)
Fond statique `bg-page`, grain très discret (variation ≤ 4 %), portées en filigrane dans le hero seulement (≤ 6 % d'opacité). Non livré : à valider après le test des 5 secondes.

## 3. Accessibilité (règles de base)
- Contraste : voir § 2.1. WCAG 2.2 : cible tactile ≥ 24 × 24 px (critère 2.5.8) ; recommandation interne : 44 px au tactile.
- Focus clavier toujours visible : anneau `--color-sys-focus-ring`, 2 px, décalage 2 px.
- Chaque fonction est utilisable au clavier. Toute information portée par la couleur est doublée par du texte ou une forme.
- Mouvement réduit : fondu seulement, pas d'animation de déplacement.

## 4. Composants
Statuts : **stable** (existe et conforme), **à migrer** (existe, écarts connus), **à documenter** (existe, fiche à écrire d'après les états réels), **proposé** (pas livré). Classes CSS d'après l'inventaire du 22 oct. (235 classes).

| Composant | Classes existantes | Statut |
|---|---|---|
| Bouton principal / secondaire | `btn-primary`, `btn-secondary` | à migrer |
| Bouton de réponse | `answer-btn`, `gf-answers` | à migrer |
| Contrôle segmenté, interrupteur | `seg-btn`, `seg-wrap`, `switch` | à documenter |
| Champ de recherche | `hub-search`, `hub-clear`, `hub-slash` | à documenter |
| Menu d'instrument | `inst-trigger`, `inst-list`, `inst-row` | à documenter |
| Navigation haute, barre du bas | `nav`, `app-tabs`, `tabbar` | à migrer |
| Rangée de hub | `hub-row`, `hub-chev` | à migrer |
| Titre de famille | `hub-fam`, `hub-fam-head` | à migrer (toujours ouvert) |
| Volet d'aperçu | `hub-detail`, `hub-thumb`, `hub-launch` | à documenter |
| Portée et note | `staff-box`, `staff-svg`, `note-head` | stable (notation en encre) |
| Retour de jeu (juste/faux) | `feedback`, `correct`, `gf-feedback` | à migrer |
| Score et série | `gf-count` | à documenter |
| Section de réglages | `settings`, `set-sec` | à documenter |
| Touche de clavier | `kbd-key`, `kbd-row` | à documenter |
| Bouton de retours bêta | `fb-btn` | à documenter |
| Tuile d'accueil / de cours | `tile`, `home-tile`, `home-course` | à migrer (après la DA) |
| Cachet de récompense | — | proposé |

### 4.1 Fiches des composants de base

**Bouton principal.** Fond `action-primary`, texte `text-on-accent`, rayon pill, poids 600, `font-size-sm`. États : repos, survol (`action-primary-hover`), focus (anneau), appui, désactivé (bordure `border-control`, texte `text-secondary`, pas de fond). Un seul bouton principal par écran. Pas d'ombre, pas de double contour. Libellé = verbe d'action précis (« Jouer ma première note »).

**Bouton secondaire.** Fond transparent, bordure `border-control`, texte `text-primary`. Mêmes états.

**Rangée de hub.** Titre (Plex 600, `lg`) + description (`text-secondary`, `sm`, une ligne) + chevron. Toute la rangée est un seul lien, hauteur ≥ `component.row.height-mobile` (72 px) / `-desktop` (76 px), séparée par `border-hairline`. Pas de bouton « Jouer », pas d'icône décorative. Signal de clic sans ombre : chevron + changement de fond au survol + anneau de focus. Familles toujours ouvertes (pas de repli).

**Bouton de réponse (Do à Si).** Cible ≥ 44 px au tactile. Après réponse : juste = fond `feedback-correct` + nom de la note ; faux = `feedback-wrong-fill` + « c'était [nom] ». Jamais la couleur seule.

**Retour de jeu.** Note juste : vert, nom de la note affiché 1 s. Note ratée : gris, « c'était [nom] » affiché 1,8 s (durées validées pour « Oreille absolue — placer »). Le retour ne bloque pas le joueur.

**Navigation.** Ordinateur : logo (→ accueil) · S'exercer · Apprendre · Réglages ; onglet actif souligné ; « Comptes bientôt » en texte discret **non cliquable**. Mobile : barre du haut fine + barre d'onglets en bas (3 destinations). Tout ce qui n'existe pas est étiqueté « Bientôt » et n'est pas cliquable.

**Champ.** Bordure `border-control` 1 px, rayon `md`, hauteur ≥ 44 px, libellé visible. Focus : anneau. Erreur : texte `text-primary` + message explicite (pas de rouge nouveau).

## 5. Motifs
- **Retour juste/faux** : voir § 4.1.
- **Gamification** : score et séries en laiton (paliers 5, 10, 15, 20) ; cachets proposés (3 événements), apposition de 180 ms, jamais de confettis.
- **États vides, erreurs, chargement** : texte court en `text-secondary`, une seule action proposée.
- **Retours des testeurs** : icône discrète, masquable, formulaire Tally en popup ; jamais sur la portée ni sur les contrôles de jeu.
- **Texte** : tutoiement, impératif, phrases courtes, « NotaNext » avec deux majuscules.

## 6. Contenu
Voix : directe, chaleureuse, précise. Pas de jargon, pas de promesse non tenue. Notation française (Do Ré Mi) ou anglaise (C D E) selon le réglage. Aucun chiffre de résultat dans le hero tant qu'il n'est pas mesuré.

## 7. Versionnage et changements
SemVer : 0.x tant que les composants de base ne sont pas tous migrés. MINEUR = nouveau jeton ou composant ; CORRECTIF = valeur corrigée sans changer le sens ; MAJEUR = renommage ou retrait. Tout changement : ligne dans le changelog (`README.md`), jeton modifié dans `tokens.json`, `tokens.css` regénéré, décision notée dans Notion.

## 8. Contribution (arbre de décision)
1. Un composant existant fait ce besoin ? **L'utiliser.**
2. Une variante suffit ? **Étendre** le composant (nouvelle variante, jetons existants).
3. Sinon, créer un composant : fiche (anatomie, variantes, états, jetons, accessibilité) + ajout au tableau § 4 + validation de Joseph.
Toute valeur visuelle nouvelle (couleur, taille, rayon, durée) passe d'abord par `tokens.json`. Un écart ponctuel est documenté dans la PR (« Exception design : … »).

## 9. Dette connue
Voir `AUDIT.md` : 22 tailles de police, 13 rayons, 5 largeurs de rupture, 6 usages du verre dépoli, 15 blancs translucides et 10 `#fff`, 3 teintes de fond anciennes. Elle n'est jamais aggravée (le vérificateur interdit toute hausse) et se réduit étape par étape.
