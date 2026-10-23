# Mise en ligne sur notanext.com

*Préparé le 23 oct. 2026. Le domaine a été acheté ; le site est aujourd'hui sur Netlify (notanext.netlify.app).*

## Ce qui ne change pas (dans le code)
Le site n'écrit nulle part sa propre adresse : liens relatifs, routes en `#/…`, polices et sons chargés depuis le site lui-même. Il n'y a rien d'obligatoire à modifier pour passer sur notanext.com. Une seule contrainte : le site doit rester **à la racine du domaine** (`https://notanext.com/`), car `404.html` redirige vers `/#/…`.

## Ce qui change
1. **Chez l'hébergeur (hors dépôt).** Dans Netlify : *Domain management* → ajouter `notanext.com`. Deux façons de faire pointer le domaine : confier la zone DNS à Netlify (changer les serveurs de noms chez le registraire), ou garder le DNS chez le registraire et y créer les enregistrements indiqués par Netlify (apex + `www`). Netlify émet ensuite le certificat HTTPS tout seul. Choisir **`notanext.com` comme domaine principal** : `www.notanext.com` et `notanext.netlify.app` redirigent alors vers lui.
2. **Les réglages des joueurs repartent à zéro.** Le navigateur range les réglages (`localStorage`) par adresse : sur le nouveau domaine, les bêta-testeurs retrouvent la notation, les touches, le volume, l'instrument, la rotation, l'icône de retours et la « première visite » par défaut. Il n'y a ni compte ni cookie à migrer.
3. **E-mail de contact.** `contact@notanext.app` figure à 3 endroits (`index.html` pied de page, `js/docs.js` Mentions légales et Confidentialité). Rien à changer tant que cette boîte fonctionne. Pour passer à `contact@notanext.com` : créer la boîte (enregistrements MX chez le registraire), remplacer les 3 occurrences, relire les deux pages légales.
4. **Balises de référencement (patch prêt, à appliquer après la mise en ligne).** `docs/domaine-notanext-com.patch` ajoute `rel="canonical"`, `og:url`, un `sitemap.xml` (une seule adresse : le site est une page unique) et la ligne `Sitemap:` de `robots.txt`. À appliquer une fois que `https://notanext.com/` répond : `git apply docs/domaine-notanext-com.patch`. Avant, ces balises pointeraient vers une adresse inactive. L'image de partage (`og:image`) reste à fournir.
5. **Formulaire de retours (Tally).** Il s'ouvre par l'identifiant du formulaire, sans liste d'adresses autorisées dans le code. À confirmer dans les réglages de Tally qu'aucun domaine n'est restreint (non vérifié), puis tester l'icône de retours sur notanext.com.
6. **Mentions légales.** Les champs « À COMPLÉTER » restent à fournir (éditeur, hébergeur, directeur de la publication, droits). Le nom de domaine peut y être mentionné si tu le souhaites.

## Vérifier avant la bascule : l'aperçu de déploiement
Une pull request sur GitHub produit, si Netlify est relié au dépôt, une adresse d'aperçu (`deploy-preview-N--…netlify.app`). C'est le moyen de tester sur le vrai hébergeur, avant de fusionner, ce qui n'a été testé qu'en local : `404.html` (essayer `/s-exercer/`), `robots.txt`, en-têtes de cache, polices et sons.

## Liste de contrôle après la bascule
- `https://notanext.com/` ouvre l'accueil, cadenas HTTPS valide ; `http://` et `www` redirigent.
- `https://notanext.netlify.app/` redirige vers `https://notanext.com/`.
- `/s-exercer/`, `/reglages`, `/exercer/place` arrivent sur la bonne vue ; une adresse inconnue affiche « Page introuvable » aux couleurs du site.
- `/robots.txt` répond ; `/sitemap.xml` répond après application du patch.
- Un jeu se lance, le son part (instrument chargé), la page « Les clés » s'affiche.
- L'icône de retours ouvre le formulaire Tally ; le champ caché `page` est renseigné.
- Appliquer le patch du domaine, redéployer, puis déclarer le site dans la Search Console si tu veux suivre l'indexation.
