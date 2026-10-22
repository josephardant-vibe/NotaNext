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
- Navigation (shell v2, maquette design/shell-v2-2026-10-20.html) : logo ·
  S'exercer · Apprendre · Réglages (engrenage) · « Comptes bientôt » (texte non
  cliquable) ; mobile : barre fine en haut + barre d'onglets en bas. Habillage
  plat partout. Pas de profil ni de comptes ; l'ancienne page Se connecter
  (#/compte) n'est plus liée nulle part.
- Modules : hub.js (hub S'exercer : liste-détail, recherche, aperçus en mode
  démonstration), settings.js (Réglages), keys.js (touches par position
  physique, event.code), docs.js (mentions légales, confidentialité, crédits),
  feedback.js (icône de retours + popup Tally yXP4ZW, script chargé au premier
  clic), version.js (numéro de version joint aux retours), access.js.
- Aperçus du hub : les vrais jeux montés en mode démonstration (openFrame avec
  `demo`) ; muet (Notanext.sound.setDemoSilent), conteneur inerte, aucun
  stockage ni clavier. Tout nouveau jeu doit fournir `answer(ok)` / `pause(p)`
  quand il est monté avec `demo`.
- Retours bêta : formulaire Tally (hors Netlify) → base Notion « Retours bêta —
  NotaNext ». Champs cachés : version, page.

## Accès complet (à venir)
- Modèle prévu : paiement unique de 3 €, accès complet ; un interrupteur par compte
  (accès accordé ou non). Rien n'est en place : comptes et paiement ne sont pas
  construits.
- Point d'entrée unique : `js/access.js`, `window.Notanext.access.hasFullAccess()`,
  qui renvoie toujours vrai pour l'instant (« remplacée plus tard par comptes +
  paiement »). Tout futur contenu réservé passera par cette fonction ; aucun mur,
  aucune page de paiement, aucun blocage tant qu'elle n'a pas été remplacée.
