# NotaNext — mémo projet

Web app d'apprentissage du solfège (HTML/CSS/JS vanilla, pas de framework),
déployée sur Netlify depuis GitHub (josephardant-vibe/NotaNext).

## Charte visuelle (ne jamais dévier sans le dire explicitement)
- Fond blanc cassé #FAF6EF (jamais blanc pur), cuivre #B8502F (interface/
  accent), or/laiton distinct pour score/série, vert = bonne réponse
  uniquement, gris = mauvaise réponse/neutre. Jamais de violet ni de bleu
  générique.
- Exception validée (5 oct. 2026) : les pictogrammes d'instruments (choix
  d'instrument) sont autorisés, chacun avec sa teinte « classe » propre
  (ébène, acajou, ardoise, laiton, noyer) ; limitée au choix d'instrument.
- Exception validée (13 oct. 2026) : la page « Se connecter » affiche une
  animation illustrée (petit personnage cuivre qui court sur une portée, notes
  qui passent au vert quand il les touche) ; ni pictogramme ni vert « bonne
  réponse » ailleurs. Animation fournie par le propriétaire (js/runner.js).
- Un seul panneau "verre" (Liquid Glass) par écran, jamais un effet par
  bouton. Aucune ombre portée ailleurs.
- Icônes : uniquement des têtes de note, jamais de pictogramme de portée.
- Polices : Fraunces (titres/score), IBM Plex Sans (texte/boutons).
- Clés de musique : vrais symboles Unicode (police), jamais de tracé SVG
  à main levée.

## Règles de travail
- Ne modifier que les fichiers réellement concernés par une demande.
- Montrer une proposition avant d'implémenter un gros changement.
- Contenu pédagogique : toujours dérivé d'une source citée, jamais
  inventé librement.

## Structure actuelle
- index.html, style.css, netlify.toml, js/ (notes.js = données, game.js =
  navigation et jeux, ear.js = oreille absolue, runner.js = animation de la
  page Se connecter), audio/ (échantillons), docs/.
- Onglets : S'exercer (5 jeux) / Apprendre (« Les clés » seulement pour
  l'instant). Pas de profil ni de comptes : la page Se connecter annonce
  « Comptes bientôt ».
