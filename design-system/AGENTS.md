# Règles design pour les agents et automatisations (Claude Code, Claude Design, tâches planifiées)

> À copier dans `CLAUDE.md` (section « Design system ») et à relire avant TOUTE tâche qui touche à l'interface, aux textes, aux couleurs ou à la mise en page.

## Sources, dans cet ordre
1. `design-system/tokens.json` (valeurs) → `design-system/tokens.css` (variables).
2. `design-system/DESIGN-SYSTEM.md` (règles, composants).
3. `design-system/AUDIT.md` (dette connue et plan de migration).

## Obligatoire
- **Utilise les variables** `var(--color-sys-…)`, `--font-size-…`, `--space-…`, `--radius-…`, `--motion-duration-…`. Aucune valeur visuelle écrite en dur.
- **Une valeur manque ?** Ne l'invente pas : propose son ajout dans `tokens.json` (avec description et contraste), lance `python3 design-system/build-tokens.py`, puis utilise-la.
- **Composants :** réutiliser, puis étendre, puis créer (voir DESIGN-SYSTEM.md § 8). Pas de nouveau composant sans fiche et sans accord de Joseph.
- **Avant de terminer** une tâche d'interface, exécute :
  ```
  python3 design-system/build-tokens.py --check
  python3 design-system/check-design-system.py
  ```
  Si le second échoue, tu as ajouté de la dette de design : corrige-la ou, si l'exception est justifiée, explique-la dans la PR sous « Exception design : … ».
- **Ne modifie jamais** `tokens.css` à la main (il est généré) ni `baseline.json` à la hausse (seulement pour réduire la dette, avec `--write-baseline` après correction).

## Interdits
- Blanc pur ; ombre portée ; verre dépoli hors du hero de l'accueil ; cercles décoratifs ; violet ; vermillon et ocre.
- Vert pour autre chose qu'une bonne réponse ; laiton pour autre chose que le score et les séries ; gris seul pour une mauvaise réponse (ajouter « c'était [nom] »).
- Taille de police, rayon, graisse, durée ou largeur de rupture hors des échelles (DESIGN-SYSTEM.md § 2).
- Information portée par la couleur seule.
- **Contenu pédagogique inventé.** Un texte d'apprentissage vient d'une source vérifiée, jamais de toi.
- Toucher au hero de l'accueil sans demande explicite de Joseph.
- Dépendre d'un hébergeur (Netlify Forms, Functions, Identity) : le site doit pouvoir changer d'hébergeur. Aucune clé secrète dans le dépôt (il est public).

## Claude Design (maquettes)
- Une planche, un objet. Jamais plusieurs étapes à la fois.
- Cite les jetons par leur nom (ex. `color.sys.action-primary`) et les contrastes.
- Toute valeur proposée hors des jetons est marquée **PROPOSÉ** et justifiée (contraste AA, distance de couleur y compris daltonisme).
- Une maquette n'est pas la vérité : en cas d'écart avec les jetons, les jetons gagnent.

## En cas de doute
Ne devine pas. Écris la question dans la PR sous « Questions pour Joseph » et continue avec la solution la plus prudente (réutiliser l'existant).

## Définition de « terminé » (design)
- [ ] Aucune valeur en dur nouvelle (vérificateur OK).
- [ ] États couverts : repos, survol, focus, appui, désactivé (et erreur si formulaire).
- [ ] Contraste AA vérifié, focus visible, usage au clavier testé, mouvement réduit respecté.
- [ ] Testé en 390 px, 760 px et 1440 px.
- [ ] Fiche du composant ajoutée ou mise à jour dans DESIGN-SYSTEM.md ; changelog à jour si un jeton a changé.
