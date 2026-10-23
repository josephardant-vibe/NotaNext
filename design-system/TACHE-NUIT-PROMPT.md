# Prompt de la tâche planifiée (à coller dans la tâche Claude Code)

```
Tu es Claude Code, en mission de nuit sur NotaNext (web app française pour apprendre le solfège). Personne n'est devant l'écran : travaille seul, en sécurité, et laisse un résultat que Joseph relira au réveil.

ÉTAPE 0 : lis design-system/BRIEF-NUIT.md (contexte, décisions, règles, plan) et design-system/AGENTS.md. Si design-system/ n'existe pas à la racine du dépôt, écris ERREUR-NUIT.md à la racine (« design-system/ manquant ») et arrête-toi.

SÉCURITÉ (non négociable)
- Travaille UNIQUEMENT dans un worktree séparé : git fetch origin ; git worktree add -b nuit-2026-10-23 ../NotaNext-nuit origin/main (sinon depuis main). N'écris jamais dans le dossier principal du dépôt.
- Aucun git push, aucun merge dans main, aucune pull request, aucun gh. Commits LOCAUX seulement, dans la branche nuit-2026-10-23.
- N'installe rien. N'exécute que python3 (build-tokens.py, check-design-system.py, un serveur local) et des commandes de lecture (git, grep, wc, ls).
- Ne supprime aucun fichier. Ne touche pas à audio/, ni aux fichiers .woff2, ni au hero de l'accueil (propose seulement). Aucune clé secrète. Aucun contenu pédagogique inventé.
- Respecte le design system (tokens.json) : aucune valeur de design en dur.
- Si une correction n'est pas sûre à 100 %, ne l'applique pas : écris-la sous forme de patch dans PROPOSITIONS/NN-nom.patch avec son explication.

MISSION : (A) audit complet « au peigne fin » du site, (B) installation du design system et corrections sûres sur la branche, (C) un rapport du matin.
Ordre obligatoire (valeur d'abord, au cas où les crédits s'épuiseraient) : 0 préparation, 1 audit complet (lecture seule), 2 installation du design system, 3 corrections sûres, 4 propositions, 5 rapport. Après CHAQUE phase : mets à jour NUIT-JOURNAL.md (heure, phase, résultat) et fais un commit local. À la moindre erreur de quota ou de limite d'usage : écris RAPPORT-MATIN.md avec ce qui est fait et ce qui reste, puis arrête-toi.
Économie : pas de sous-agents, ne relis pas un fichier déjà lu, préfère grep et wc à une lecture complète, ne lis jamais les fichiers audio ni les polices.

Les chapitres de l'audit, les corrections autorisées et le gabarit du rapport sont dans design-system/BRIEF-NUIT.md : suis-les à la lettre.
```
