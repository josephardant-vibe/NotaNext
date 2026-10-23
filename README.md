# NotaNext

Web app d'apprentissage du solfège — lecture de notes, clés et entraînement de l'oreille. HTML / CSS / JavaScript « vanilla », sans framework ni
étape de build : tout tourne dans le navigateur, sans compte ni installation.

Déployée sur Netlify depuis ce dépôt. Adresse définitive prévue : notanext.com (voir `docs/mise-en-ligne-notanext-com.md`).

## Fonctionnalités

**Page d'accueil** — l'adresse du site l'ouvre toujours (réglage
`REDIRIGER_VISITEURS_REVENANTS` dans `js/home.js` pour rétablir « première visite seulement »), avec une démo interactive, la méthode et un aperçu des jeux et des cours.

**Navigation** — logo, S'exercer, Apprendre, Réglages (engrenage) ; sur téléphone, barre d'onglets en bas.
**S'exercer** — liste des jeux en deux familles ; sur ordinateur, survoler une rangée affiche un aperçu animé du jeu (le vrai jeu, en démonstration, muet),
un clic ouvre le jeu ; recherche (raccourci « / ») sur les jeux et les cartes d'Apprendre.
**Réglages** — notation, clavier (touches physiques : AZERTY et QWERTY), son (volume, muet), réinitialisation, retours bêta, pages légales et crédits.
**Retours bêta** — icône discrète qui ouvre un formulaire Tally ; version et page sont jointes à chaque envoi.

**Se connecter** (page « Comptes bientôt », plus accessible depuis la navigation) — « Ton espace personnel arrive bientôt », avec une animation en boucle
(un petit personnage court sur une portée, les notes touchées passent au vert ; `js/runner.js`,
en SVG, sans image). Pas de formulaire : les comptes ne sont pas encore ouverts.

**Mobile** — les jeux de lecture se tournent en paysage, l'oreille absolue (deviner et placer) et la
section Apprendre en portrait (message « Tourne ton téléphone » 2 s, puis rotation d'affichage). Le bouton de
rotation d'un jeu active ou coupe la rotation automatique pour tous les jeux (réglage mémorisé, activé par
défaut). Sur téléphone, l'onglet « Clavier » devient « Réglages » (notation, rotation) : pas de touches à associer.

**S'exercer**
- *Deviner la note* — huit notes sur la portée (celle repérée par le trait et les sept à venir), trouve le nom de celle repérée.
- Dans *Deviner la note* et *Défilement continu*, aucune note n'est jouée pour aider : seule la bonne note sonne quand elle est
  devinée ; un interrupteur « Son » (même réglage que Réglages > Son) remplace « Réécouter ».
- *Deviner la note – défilement continu* — les notes défilent, vitesse réglable
  (Débutant → Expert) ; on répond dans l'ordre d'arrivée, la prochaine note est cerclée et son
  nom s'écrit un instant dans la tête de note.
- *Placer la note* — un nom est donné, on place la note sur la portée (souris : survol + clic ; toucher : on pose le
  doigt, on glisse, on relâche). Sur téléphone, le jeu se joue en portrait avec une portée haute (≈ 18 px par demi-ton).
- *Oreille absolue — deviner* — un son, 7 notes en cercle autour d'un bouton rond ; les
  touches du clavier configurées restent valables.
- *Oreille absolue — placer* — un son, on place la note sur la portée (clic, ou toucher et
  glisser sur mobile) ; seule la position exacte (octave comprise) est juste, et seules les notes
  que l'instrument joue à leur vraie hauteur sont proposées ; option « Afficher le nom de la note ».
- Étendue : 14 notes dans chaque clé, de la 1re ligne supplémentaire sous la portée à l'interligne au-dessus
  de la 1re ligne supplémentaire (de Do4 à Si5 en clé de sol).
- Quatre clés au choix : sol, fa, ut alto, ut ténor (symboles Unicode, police Noto Music).

**Instruments** — piano (défaut), violon, flûte, trompette, guitare : menu dans la ligne de
réglages des jeux, choix mémorisé. Échantillons libres de droit dans `audio/` (≈ 65 à 150 Ko par
instrument, seul l'instrument choisi est chargé), hauteurs mesurées et corrigées ; licences et
crédits dans `CREDITS.md`. Les jeux de lecture jouent à l'octave une note hors de la tessiture
de l'instrument, et le signalent.

**Apprendre** — *Les clés* : repères sur la portée, notes cliquables et FAQ clé par clé.
(Les cours « Écoute et ressens » et « Théorie de base » ont été retirés pour l'instant.)

**Accessibilité clavier** — les jeux « placer » se jouent aux flèches (haut/bas) et à Entrée, le menu
d'instrument et le panneau Clavier aussi. Le réglage « Rotation automatique sur téléphone » se coupe
dans le panneau Clavier ou depuis le message de rotation.

**Clavier personnalisable** — le bouton clavier de la barre associe une touche à chaque
note (Do à Si) ; la configuration est enregistrée dans le navigateur (`localStorage`)
et partagée par tous les jeux à boutons de réponse. Le même panneau règle la
**notation** (Français Do Ré Mi… ou Anglais C D E…, mémorisée aussi) et propose un
remplissage automatique des touches.

## Lancer en local

Aucune dépendance. Ouvrir `index.html` directement, ou servir le dossier :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Structure

```
index.html        page unique : accueil, S'exercer, Apprendre, Réglages, pages texte
style.css         tous les styles (valeurs : variables de design-system/tokens.css)
404.html          adresses directes (/s-exercer/, /reglages…) redirigées vers #/…
robots.txt        autorise l'exploration
netlify.toml      configuration de déploiement (cache, en-têtes)
design-system/    jetons (tokens.json → tokens.css), règles, vérificateur (check-design-system.py)
fonts/            polices hébergées (Fraunces, IBM Plex Sans, Noto Music)
audio/            échantillons d'instruments (un dossier par instrument)
docs/             documents du projet : audits, sources du cours, mise en ligne
CREDITS.md        licences et crédits des sons
CLAUDE.md         mémo projet : charte visuelle et règles de travail
js/
  notes.js        données : clés, exercices, cartes Apprendre, théorie, FAQ
  audio.js        synthèse sonore Web Audio + lecture des échantillons d'instruments
  access.js       point d'entrée unique de l'accès complet (renvoie toujours vrai)
  version.js      numéro de version joint aux retours
  keys.js         touches par position physique (event.code)
  instrument-menu.js menu de choix d'instrument (icônes et teintes)
  staff.js        portée statique + clés (glyphes Unicode)
  scroll-staff.js portée à défilement continu
  window-staff.js portée à fenêtre de trois notes
  ear.js          jeux d'oreille absolue (deviner, placer)
  runner.js       animation de la page Se connecter (coureur sur la portée)
  game.js         navigation, exercices, leçons, clavier
  hub.js          hub S'exercer : liste, recherche, aperçus en démonstration
  settings.js     Réglages
  docs.js         mentions légales, confidentialité, crédits
  feedback.js     icône de retours et formulaire Tally
  home.js         page d'accueil (démo, jeux, cours, mémoire de visite)
```

Ajouter un exercice, une clé ou une leçon = une entrée dans `js/notes.js`.

## Charte visuelle

- Fond blanc cassé `#FAF6EF`, cuivre `#B8502F` pour l'interface, or pour score et série,
  vert pour la bonne réponse uniquement, gris pour la mauvaise réponse / le neutre.
- Verre réservé à l'aperçu du hero de l'accueil ; écrans de jeu plats sur papier ; aucune ombre portée.
- Toutes les valeurs (couleurs, tailles, rayons, durées) viennent de `design-system/tokens.json` ;
  `python3 design-system/check-design-system.py` doit rester vert.
- Polices : Fraunces (titres, score) et IBM Plex Sans (texte, boutons).
- Icônes : uniquement des têtes de note (exception : pictogrammes du choix d'instrument).

## Organisation Git

- `main` : la version publiée (Netlify déploie depuis cette branche).
- Une branche par chantier, nommée `feature/<sujet>` (ou `fix/<sujet>`), créée depuis `main`, puis
  fusionnée dans `main` et supprimée.
- Étiquettes : `archive-v0` (première version), `v2.0` (espace jeux v2 : notation, instruments,
  oreille absolue).

## Sources

La page d'accueil s'appuie sur deux études sur l'apprentissage par le test et
l'espacement :
- Roediger & Karpicke, 2006 — <https://doi.org/10.1111/j.1467-9280.2006.01693.x>
- Dunlosky et al., 2013 — <https://pubmed.ncbi.nlm.nih.gov/26173288/>
