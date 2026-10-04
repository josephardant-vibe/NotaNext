# NotaNext

Web app d'apprentissage du solfège — lecture de notes, clés, théorie de base et
entraînement de l'oreille. HTML / CSS / JavaScript « vanilla », sans framework ni
étape de build : tout tourne dans le navigateur, sans compte ni installation.

Déployée sur Netlify depuis ce dépôt.

## Fonctionnalités

**Page d'accueil** — affichée à la première visite seulement (mémorisée dans le
navigateur), avec une démo interactive, la méthode et un aperçu des jeux et des cours.

**S'exercer**
- *Deviner la note* — fenêtre de trois notes, trouve celle repérée par le trait.
- *Deviner la note – défilement continu* — les notes défilent, vitesse réglable
  (Débutant → Expert).
- *Placer la note* — un nom est donné, clique sa position sur la portée.
- Quatre clés au choix : sol, fa, ut alto, ut ténor (symboles Unicode, police Noto Music).

**Apprendre**
- *Les bases : écoute et ressens* — 5 mini-jeux d'écoute pure (aigu/grave, long/court,
  fort/doux, pareil/différent, combien de sons).
- *Les clés* — repères sur la portée, notes cliquables et FAQ clé par clé.
- *Théorie de base & notation* — notes, valeurs, silences, mesure, altérations, avec
  illustrations sonores et quiz de rappel (réponses mélangées à chaque lancement).

**Clavier personnalisable** — le bouton clavier de la barre associe une touche à chaque
note (Do à Si) ; la configuration est enregistrée dans le navigateur (`localStorage`)
et partagée par tous les jeux à boutons de réponse.

## Lancer en local

Aucune dépendance. Ouvrir `index.html` directement, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html        page unique : accueil, onglets S'exercer / Apprendre
style.css         tous les styles (palette et polices définies dans :root)
netlify.toml      configuration de déploiement
js/
  notes.js        données : clés, exercices, cartes Apprendre, théorie, FAQ
  audio.js        synthèse sonore Web Audio (hauteur, durée, volume)
  staff.js        portée statique + clés (glyphes Unicode)
  scroll-staff.js portée à défilement continu
  window-staff.js portée à fenêtre de trois notes
  theory.js       illustrations interactives de la théorie
  listen.js       mini-jeux d'écoute
  game.js         navigation, exercices, leçons, clavier
  home.js         page d'accueil (démo, jeux, cours, mémoire de visite)
```

Ajouter un exercice, une clé ou une leçon = une entrée dans `js/notes.js`
(ou `js/listen.js` pour un jeu d'écoute).

## Charte visuelle

- Fond blanc cassé `#FAF6EF`, cuivre `#B8502F` pour l'interface, or pour score et série,
  vert pour la bonne réponse uniquement, gris pour la mauvaise réponse / le neutre.
- Un seul panneau « verre » par écran, aucune ombre portée ailleurs.
- Polices : Fraunces (titres, score) et IBM Plex Sans (texte, boutons).
- Icônes : uniquement des têtes de note.

## Sources

La page d'accueil s'appuie sur deux études sur l'apprentissage par le test et
l'espacement :
- Roediger & Karpicke, 2006 — <https://doi.org/10.1111/j.1467-9280.2006.01693.x>
- Dunlosky et al., 2013 — <https://pubmed.ncbi.nlm.nih.gov/26173288/>
