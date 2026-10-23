# design-system/ — NotaNext

Version **0.1.0** — 22 oct. 2026. Version minimale d'un design system professionnel : une source de valeurs, des règles, un vérificateur et un audit. Elle évolue avec le produit.

## Contenu
| Fichier | Rôle |
|---|---|
| `tokens.json` | **Source unique** des valeurs (format W3C Design Tokens 2025.10). |
| `tokens.css` | Variables CSS **générées** (ne pas modifier à la main). |
| `build-tokens.py` | Génère `tokens.css` depuis `tokens.json`. Python 3, aucune dépendance. |
| `DESIGN-SYSTEM.md` | Principes, fondations, composants, motifs, accessibilité, contribution. |
| `AGENTS.md` | Règles pour Claude Code, Claude Design et les automatisations (à copier dans `CLAUDE.md`). |
| `AUDIT.md` | Inventaire de l'interface existante, écarts, table de migration, plan. |
| `check-design-system.py` | Vérificateur « cliquet » : refuse toute **nouvelle** dette de design. |
| `index.html` | Guide visuel (jetons, échelles, composants de base). À ouvrir depuis le dépôt. |

## Installation (une fois)
1. Copier le dossier `design-system/` à la racine du dépôt.
2. Dans la page, charger `design-system/tokens.css` **avant** `style.css`. Les anciennes variables (`--paper`, `--ink`…) restent valables grâce aux alias.
3. Figer la dette actuelle : `python3 design-system/check-design-system.py --write-baseline` puis commiter `baseline.json`.
4. Copier `AGENTS.md` dans `CLAUDE.md` (section « Design system »).

## Au quotidien
```
python3 design-system/build-tokens.py            # après toute modification de tokens.json
python3 design-system/build-tokens.py --check    # vérifie que tokens.css est à jour
python3 design-system/check-design-system.py     # vérifie qu'aucune dette n'est ajoutée
```

## Règles de version
SemVer. MINEUR : nouveau jeton ou composant. CORRECTIF : valeur corrigée. MAJEUR : renommage ou retrait. Chaque changement : une ligne ci-dessous + une décision dans Notion.

## Changelog
- **0.1.0 (22 oct. 2026)** — Création : jetons (couleur, police, espacement, rayon, mouvement, rupture), règles, audit, vérificateur. Décisions : vert du code (#3F7D52) retenu face à la Charte (#4C7A52) ; gris texte fusionnés en #6B635A ; laiton #A9791B ; échelle de 8 tailles de police ; 3 largeurs de rupture ; jetons « proposés » (cachets, Parisienne) non livrés.
