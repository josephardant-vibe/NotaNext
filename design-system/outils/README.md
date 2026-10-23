# Outils de contrôle à l'écran

`audit-ecran.js` : script à coller dans la console d'un navigateur (ou à injecter avec une balise `<script>`) sur le site en local (`python3 -m http.server 8766`). Il ne modifie rien.

- `window.__audit()` : mesure l'écran affiché (JSON) : débordements horizontaux, cibles cliquables < 44 px, contraste des textes (calculé, fond translucide compris), textes < 12 px, textes coupés.
- `await window.__runAll([routes])` : parcourt les routes (`#/accueil`, `#/exercer`, un jeu, `#/apprendre/clefs`, `#/reglages`, pages texte…) et renvoie un rapport par route. À lancer à 390, 760 et 1440 px, en portrait et en paysage (fenêtre réduite < 768 px = émulation téléphone).

Limites : fonds en dégradé ou en image comptés comme papier ; états de survol et d'animation non mesurés ; les cibles de 24 à 44 px sont signalées mais seules < 24 px sont un manquement WCAG 2.2 AA (2.5.8).
