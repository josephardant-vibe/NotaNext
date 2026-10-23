# Sources du cours « Les clés » et des affirmations pédagogiques — 23 oct. 2026

**Portée.** Inventaire de toutes les affirmations vérifiables que NotaNext présente comme du contenu d'apprentissage : FAQ du cours « Les clés » (`js/notes.js:160-184`), page d'accueil (méthode, correction immédiate), jeux « Oreille absolue », table de fréquences. Règle du projet : *contenu pédagogique dérivé d'une source citée, jamais inventé.* **Rien n'a été modifié dans le site** : ce document propose des sources et des corrections, il n'en applique aucune.

**Comment j'ai vérifié.** Recherche et lecture web le 23 oct. 2026. Les références bibliographiques ont été recoupées par Crossref / Europe PMC. Les contrôles sur les clés viennent d'une lecture directe de **Larousse (Dictionnaire de la musique, entrée « clef »)** et de **Dolmetsch Online (Dr Brian Blood, leçon 14 « Other Clefs »)**. Wikipédia n'est utilisée que comme point de départ (ses passages sur les clés ne citent presque aucune source). Les fréquences ont été recalculées par script.

**Verdicts.** *confirmée* · *nuancée* (vraie mais incomplète ou trop forte) · *non confirmée* (aucune source trouvée) · *erreur* (contredite par une source lue).

---

## 1. FAQ du cours « Les clés » (`js/notes.js`)

| # | Affirmation du site (fichier:ligne) | Verdict | Source proposée | Remarque |
|---|---|---|---|---|
| 1 | Clé de sol : « Sol sur la 2e ligne en partant du bas » (`notes.js:162`) | confirmée | Larousse, *Dictionnaire de la musique*, « clef » : sol 2e ligne | |
| 2 | Clé de fa : « Fa sur la 4e ligne » (`:168`) | confirmée | Larousse, « clef » : fa 4e ligne | |
| 3 | Clé d'ut alto : « Do central sur la ligne du milieu (3e) » (`:174`) | confirmée | Larousse (ut 3e) ; Dolmetsch Online, leçon 14 (« Other Clefs », B. Blood) : do central sur la ligne centrale | |
| 4 | Clé d'ut ténor : « Do central sur la 4e ligne » (`:180`) | confirmée | Larousse (ut 4e) ; Dolmetsch leçon 14 : do central sur la 2e ligne en partant du haut, donc la 4e en partant du bas | Le code (`notes.js:44-49`, `base`/`line`) place bien le Do central sur ces lignes : recalculé et cohérent. |
| 5 | « À partir de cette note de référence, tu retrouves toutes les autres en comptant les lignes et les espaces » (`:162,168,174,180`) | confirmée (principe) | Larousse : la clef est un signe qui, placé sur une ligne, fixe le nom de la note sur cette ligne | Pas de source qui énonce la phrase telle quelle : c'est la conséquence directe de la définition. |
| 6 | Clé de sol : « Violon, flûte, hautbois, clarinette, trompette, saxophone, main droite au piano, harpe, voix soprano/alto/ténor » (`:163`) | nuancée | Wikipédia EN « Treble clef » (point de départ, liste non sourcée) ; Larousse : soprano et alto, le ténor en « clef de sol transpositrice » | **Ténor** : sa partie est écrite en clé de sol une octave au-dessus de la hauteur réelle (Larousse ; Wikipédia EN). **Harpe** : écrite sur deux portées (sol et fa), pas en clé de sol seule. La liste d'instruments reste à confirmer dans un ouvrage d'orchestration (voir § 5). |
| 7 | Clé de sol : « notes aiguës — en clé de fa, ces notes demanderaient trop de lignes supplémentaires au-dessus » (`:164`) | confirmée (principe) | Dolmetsch leçon 14 (même raisonnement, écrit pour la clé d'ut ténor : éviter les lignes supplémentaires) ; Larousse pour l'histoire (clé de sol répandue aux XVIIe-XVIIIe siècles avec le clavecin puis le piano) | La phrase est un raisonnement et non une citation ; elle reste exacte. |
| 8 | Clé de sol : « la clé la plus utilisée en musique aujourd'hui » (`:165`) | confirmée | Larousse, « clef » : aujourd'hui la plus répandue ; (secondaire) Greer, *American Music Teacher* 53(1), 2003, p. 22-25, cité par Wikipédia EN | Greer non consulté directement. |
| 9 | Clé de fa : « Violoncelle, contrebasse, basson, trombone, tuba, main gauche au piano, voix graves » (`:169`) | confirmée (non sourcée en clair) | Wikipédia EN « Bass clef » (liste non sourcée dans l'article) ; Larousse : clé de fa pour la voix de basse | Larousse place aussi le violoncelle et le basson en clé d'ut 4e ; pas de contradiction (voir lignes 14-16). |
| 10 | Clé de fa : « notes graves — en clé de sol, ces notes demanderaient trop de lignes en dessous » (`:170`) | confirmée (principe) | idem ligne 7 | |
| 11 | Clé de fa : « la deuxième plus utilisée, complémentaire de la clé de sol au piano » (`:171`) | nuancée | Wikipédia EN « Clef » : treble et bass sont de loin les deux clés les plus courantes | Le **classement « deuxième »** n'est pas explicitement sourcé ; « les deux clés les plus courantes » l'est. |
| 12 | Clé d'ut alto : « Principalement l'alto (instrument à cordes) » (`:175`) | confirmée | Dolmetsch leçon 14 : la clé d'alto se trouve surtout dans la musique d'alto (viole) ; Larousse : clef d'ut sur la 3e ligne pour l'alto | « alto » désigne aussi la voix ; l'ajout « instrument à cordes » du site lève l'ambiguïté. |
| 13 | Clé d'ut alto : « tessiture de l'alto entre le violon et le violoncelle — les deux autres clés lui imposeraient des lignes supplémentaires » (`:176`) | confirmée | Wikipédia EN « Viola » (point de départ) qui cite Piston, *Orchestration*, 1955 (page non fournie) : cordes accordées do3-sol3-ré4-la4, une quinte sous le violon, une octave au-dessus du violoncelle | « les deux autres clés » : le site en présente quatre ; préciser « les clés de sol et de fa ». |
| 14 | Clé d'ut alto : « Oui, la seule clé d'ut encore couramment utilisée en pratique courante » (`:177`) | **erreur probable** | Larousse : la clé d'ut 4e est « encore employée » pour le basson et le violoncelle ; Dolmetsch leçon 14 : la clé de ténor sert pour le trombone ténor, le violoncelle et la contrebasse (aigus) et pour « une grande partie » du répertoire de basson | Contredit aussi la réponse du site sur l'ut ténor (ligne 16 ci-dessous : « Oui mais ponctuellement »). À reformuler (voir § 3). |
| 15 | Clé d'ut ténor : « Passages aigus du violoncelle, du basson et du trombone ténor » (`:181`) | confirmée (liste incomplète) | Dolmetsch leçon 14 ; Larousse (basson, violoncelle) | Dolmetsch ajoute la contrebasse, les violes ténor/basse ; pour le basson, la clé de ténor couvre une grande partie du répertoire, pas seulement des « passages aigus ». |
| 16 | Clé d'ut ténor : « Évite trop de lignes au-dessus de la portée dans le registre aigu de ces instruments » (`:182`) | confirmée | Dolmetsch leçon 14 (énonce ce but mot pour mot en substance) | |
| 17 | Clé d'ut ténor : « Oui mais ponctuellement, pour les passages aigus » (`:183`) | nuancée | Dolmetsch leçon 14 ; Larousse | « ponctuellement » sous-estime l'usage pour le basson (voir 15). |

**Table de fréquences** (`notes.js:26-31`, utilisée pour les sons et les repères de la portée) : *confirmée.* J'ai recalculé les 27 valeurs avec la formule du tempérament égal à partir de La4 = 440 Hz : écart maximal de 0,006 Hz (arrondi au centième). La fréquence de référence 440 Hz est fixée par **ISO 16:1975** (« Acoustique — Fréquence normale d'accord »), dernière revue 2022. Pas de source primaire lue pour le tempérament égal ; formule standard.

**Correspondance Do = C, Ré = D, … Si = B** (réglage « Notation » ; `notes.js:11-12`) : *confirmée.* Wikipédia FR « Note de musique » (point de départ, notation alphabétique non sourcée) et dCode (secondaire). À noter : dans les pays germanophones le Si est H. Pour une source de référence, voir *Dictionnaire de la musique* (M. Vignal dir., Larousse, 2005, article « Ut queant laxis », p. 1010, cité par Wikipédia FR) : non consulté.

---

## 2. Page d'accueil et jeux

| # | Affirmation du site (fichier:ligne) | Verdict | Source proposée | Remarque |
|---|---|---|---|---|
| 18 | « Se tester retient mieux que relire : chercher la réponse ancre la note plus solidement qu'une seconde lecture. » (`index.html:90`) | nuancée | Roediger & Karpicke (2006), *Psychological Science* 17(3), 249-255, doi 10.1111/j.1467-9280.2006.01693.x (référence vérifiée par Crossref) | L'étude montre l'avantage du test **après 2 jours et 1 semaine**. **À 5 minutes, c'est la relecture qui gagne.** Les participants lisaient des textes scientifiques, pas des notes de musique. Le test se faisait **sans correction**. La phrase doit préciser « à long terme ». |
| 19 | « Espacer les séances aide la mémoire : mieux vaut des séances courtes et régulières qu'une longue session isolée. » (`index.html:91`) | nuancée | Dunlosky, Rawson, Marsh, Nathan & Willingham (2013), *Psychological Science in the Public Interest* 14(1), 4-58, doi 10.1177/1529100612453266 (PMID 26173288 : vérifié, c'est bien cet article) | L'article classe la **pratique distribuée** parmi les deux techniques à plus haute utilité. Il parle d'**étaler** l'étude dans le temps, pas de la **durée** d'une séance : « courtes » n'est pas démontré par cette source. |
| 20 | « NotaNext applique ces deux principes avec des exercices courts, corrigés tout de suite, faciles à reprendre souvent. » (`index.html:92`) | nuancée | — (description du produit) | Le **test** est bien appliqué (on répond avant de voir la solution). L'**espacement** ne l'est pas par le produit (pas de rappel, pas de comptes) : il est seulement rendu possible. Le tirage reprenant les notes ratées (`notes.js:70-102`, `createPicker`) espace des révisions *dans* une séance, ce n'est pas l'espacement de l'étude évalué par Dunlosky. |
| 21 | Liens affichés : « Se tester retient mieux que relire — Roediger & Karpicke, 2006 » ; « Tester et espacer : deux des techniques d'étude les plus efficaces — Dunlosky et al., 2013 » (`index.html:94-95`) | confirmée | doi et PMID vérifiés | Les intitulés sont des **paraphrases françaises**, pas les titres réels des articles (*Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention* ; *Improving Students' Learning With Effective Learning Techniques…*). Dunlosky classe aussi la **relecture** comme peu utile (conclusion cohérente avec la phrase 18). |
| 22 | « Vert si c'est juste, la bonne réponse affichée sinon : tu apprends à chaque note. » (`index.html:80`) ; « corrigés tout de suite » (`:14, :92`) | nuancée | Hattie & Timperley (2007), « The Power of Feedback », *Review of Educational Research* 77(1), 81-112, doi 10.3102/003465430298487 | « tu apprends à chaque note » est une **promesse d'effet** non sourcée. Hattie & Timperley montrent que le retour est puissant mais que son effet **varie beaucoup selon sa nature** ; je n'ai pas lu l'article en détail, seulement son résumé. « corrigés tout de suite » décrit le produit et n'a pas besoin de source. |
| 23 | « Oreille absolue — deviner / placer » : « Écoute un son, trouve la note » (`notes.js:129-137`, `home.js:134-135`, `hub.js:13`) | nuancée | Définition : Levitin & Rogers (2005), *Trends in Cognitive Sciences* 9(1), 26-33, doi 10.1016/j.tics.2004.11.007 ; Takeuchi & Hulse (1993), *Psychological Bulletin* 113(2), 345-361, doi 10.1037/0033-2909.113.2.345 | L'oreille absolue est la capacité de nommer une hauteur **sans référence**. Dans le jeu, les notes s'enchaînent : on peut s'appuyer sur la note précédente (oreille relative) et sur le timbre. L'exercice entraîne l'association son ↔ nom ; il ne prouve ni ne garantit une oreille absolue. |
| 24 | « développe ton oreille » (`index.html:48`) ; « oreille absolue » en description (`index.html:7, :14`) | nuancée | Levitin & Rogers 2005 : l'oreille absolue « semble dépendre d'un apprentissage précoce ». Takeuchi & Hulse 1993 : théorie de l'apprentissage précoce (jusqu'à ~6 ans). Contre-exemples récents : Van Hedger, Heald & Nusbaum (2019), *PLOS ONE* 14(9) e0223047 (6 adultes, 8 semaines, ~32 h : 2 sur 6 atteignent un niveau proche d'une oreille absolue ; très petit échantillon) ; Wong, Lui, Yip & Wong (2020), *Attention, Perception & Psychophysics* 82(3), 1407-1430 | Le débat scientifique est **ouvert**. Les textes du site ne promettent pas explicitement l'acquisition ; ils ne doivent pas non plus la laisser entendre. Le hero est figé : seule une **proposition** est faite (§ 3). |
| 25 | « Les clés — Clé de sol, clé de fa, clé d'ut : lire une portée quelle que soit la clé. » (`home.js:191`) | nuancée | Larousse, « clef » : cinq clés usuelles (fa 4e, sol 2e, ut 1re, ut 3e, ut 4e) | Le cours en couvre **quatre** : manque l'**ut 1re (clé de soprano)**. « quelle que soit la clé » est une promesse trop large. |
| 26 | « Apprends à lire la musique » (titre, `index.html:6, :47`) | nuancée | — | Le contenu actuel apprend les **hauteurs** (nom, position, clés, oreille). Il n'y a pas encore de **rythme**. Ce n'est pas une affirmation sourçable, mais une promesse à surveiller. |
| 27 | « les sources figurent dans les pages concernées » (Mentions légales, `docs.js:30`) | **non tenue pour « Les clés »** | — | Aucune page du cours n'affiche de source (seuls les liens de l'accueil sont affichés). Une ligne « Sources » sur la page du cours règle ce point (§ 3). |

**Hors périmètre pédagogique, vérifié contre le code :** « notes absentes obtenues en accélérant ou ralentissant l'échantillon le plus proche (3 demi-tons au plus) » (`docs.js:81`) est cohérent avec `audio.js:133-135`.

**Sons d'instruments.** `audio.js` joue la note à sa hauteur réelle (fréquence du tableau). Un guitariste note pourtant sa musique **une octave au-dessus** du son réel (instrument transpositeur ; sources secondaires : Fundamental Changes, référence MusicXML « octave-change »). Trompette en si bémol, clarinette et saxophone sont aussi transpositeurs. Aucune affirmation du site n'est fausse, puisque les jeux parlent de hauteurs réelles, mais ce point doit rester expliqué si on affiche un jour la musique « comme la lit l'instrumentiste ». Je n'ai pas vérifié les plages `lo/hi` de `audio.js:142-149` (limites de banques d'échantillons, pas la tessiture réelle des instruments).

---

## 3. Corrections de texte PROPOSÉES (aucune appliquée ; à valider par Joseph)

1. **`notes.js:177` (ut alto, « encore utilisée ? »)** : « Oui, surtout pour l'alto (instrument à cordes). La clé d'ut ténor reste aussi employée, pour les passages aigus d'autres instruments. » *(Larousse ; Dolmetsch leçon 14)*
2. **`notes.js:183` (ut ténor, « encore utilisée ? »)** : « Oui : pour les passages aigus du violoncelle et du trombone ténor, et très couramment au basson. » *(Dolmetsch leçon 14 : « une grande partie du répertoire de basson »)*
3. **`notes.js:163` (clé de sol, instruments)** : remplacer « voix soprano/alto/ténor » par « voix soprano, alto et ténor (le ténor se note une octave au-dessus de sa hauteur réelle) ». *(Larousse ; Wikipédia EN « Treble clef » comme point de départ)* Et remplacer « harpe » par « harpe (avec la clé de fa) » ou la retirer si l'on veut une liste stricte.
4. **`notes.js:171` (clé de fa, « encore utilisée ? »)** : « Oui, avec la clé de sol, c'est l'une des deux clés les plus courantes ; elles se complètent aux deux mains du piano. » *(retire le classement « deuxième »)*
5. **`notes.js:176` (ut alto, tessiture)** : remplacer « les deux autres clés » par « les clés de sol et de fa ».
6. **`index.html:90`** : « À long terme, se tester retient mieux que relire : chercher la réponse ancre ce qu'on apprend plus solidement qu'une seconde lecture. » *(Roediger & Karpicke 2006, délais de 2 jours et d'une semaine)*
7. **`index.html:91`** : « Espacer les séances aide la mémoire : mieux vaut répartir son entraînement dans le temps que tout concentrer en une seule longue session. » *(Dunlosky et al. 2013)*
8. **`index.html:92`** : « NotaNext applique ces deux principes : des exercices où tu cherches la réponse avant de la voir, corrigés tout de suite, faciles à reprendre souvent. »
9. **`index.html:80`** : « Vert si c'est juste, la bonne réponse affichée sinon : tu vois tout de suite où tu en es. » *(retire la promesse d'effet « tu apprends à chaque note »)*
10. **Page « Les clés » (ajout)** : une ligne « Sources » sous la FAQ, par exemple : *Larousse, Dictionnaire de la musique (en ligne), article « Clef » ; Dolmetsch Online, Music Theory Online, leçon 14 « Other Clefs » (B. Blood).* Cela tient la promesse de `docs.js:30`.
11. **Page « Les clés » ou Crédits (ajout)** : une phrase de prudence sur l'oreille absolue : « Nommer une note sans référence (l'oreille absolue) est rare. Savoir si elle peut s'acquérir à l'âge adulte est encore discuté (Levitin & Rogers 2005 ; Van Hedger et al. 2019 ; Wong et al. 2020). Ces exercices entraînent l'association entre un son et un nom de note. »
12. **Hero (figé, proposition seulement)** : « développe ton oreille » (`index.html:48`) peut rester tel quel ; si Joseph veut plus de prudence, « entraîne ton oreille ».
13. **`home.js:191`** : « Clé de sol, clé de fa, clé d'ut (alto et ténor) : lire une portée dans les clés les plus courantes. » (remplace « quelle que soit la clé », qui exclut la clé de soprano).

---

## 4. Affirmations sans source trouvée ou non vérifiables

- **« Deuxième clé la plus utilisée » (clé de fa)** : aucune source ne classe les clés au-delà de « treble et bass de loin les plus courantes ».
- **Listes d'instruments (clés de sol et de fa)** : seulement Wikipédia EN, non sourcée dans l'article. À confirmer dans **un ouvrage d'orchestration** : W. Piston, *Orchestration* (1955) ; S. Adler, *The Study of Orchestration* ; E. Gould, *Behind Bars* (2011) (aucun n'a été consulté).
- **« Main droite / main gauche au piano », « harpe »** : la grande portée n'a pas été lue dans une source.
- **Plages d'instruments dans `audio.js`** (`lo/hi`) et tessitures : non vérifiées.
- **Effets pédagogiques** : « tu apprends à chaque note », « corrigés tout de suite » : pas de source lue sur l'effet du retour **immédiat** en lecture de notes. Je n'ai lu que le résumé de Hattie & Timperley.
- **Extrapolation à la lecture de notes** : Roediger & Karpicke 2006 utilise des textes scientifiques ; Dunlosky 2013 affirme une portée large (matériaux et âges variés), mais aucune des deux sources ne porte sur la lecture musicale.
- **Greer (2003)**, cité par Wikipédia pour « clé de sol la plus courante » : non consulté. Larousse suffit pour la clé de sol.

## 5. Limites de ma vérification

- **Britannica et Open Music Theory** (Nebraska/Viva Pressbooks) : accès refusé (403), non lus. Grove / Oxford Music Online : payants.
- **Roediger & Karpicke 2006** : le PDF est illisible dans mon environnement (outil de rendu PDF absent) ; le contenu (conditions, délais, résultats, absence de correction) vient du résumé institutionnel (WUSTL) et de l'article de l'APS *Observer*, pas du texte intégral.
- **PubMed** m'a refusé l'accès (cookies) : l'identité de l'article PMID 26173288 a été confirmée par Europe PMC.
- **Wong et al. (2020)** : identifié par Crossref (titre, volume, pages), résumé non lu.
- Wikipédia a servi pour **repérer** les informations, jamais comme source finale. Larousse et Dolmetsch sont les deux seules sources de clés que j'ai lues en entier.
- Cette note ne vérifie pas le **contenu pédagogique des autres jeux** (aucun texte d'apprentissage n'y a été trouvé en dehors de ceux listés ici).

## 6. Références (à copier)

- Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students' learning with effective learning techniques. *Psychological Science in the Public Interest, 14*(1), 4-58. https://doi.org/10.1177/1529100612453266 (PMID 26173288)
- Hattie, J., & Timperley, H. (2007). The power of feedback. *Review of Educational Research, 77*(1), 81-112. https://doi.org/10.3102/003465430298487
- Levitin, D. J., & Rogers, S. E. (2005). Absolute pitch: perception, coding, and controversies. *Trends in Cognitive Sciences, 9*(1), 26-33. https://doi.org/10.1016/j.tics.2004.11.007
- Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: taking memory tests improves long-term retention. *Psychological Science, 17*(3), 249-255. https://doi.org/10.1111/j.1467-9280.2006.01693.x
- Takeuchi, A. H., & Hulse, S. H. (1993). Absolute pitch. *Psychological Bulletin, 113*(2), 345-361. https://doi.org/10.1037/0033-2909.113.2.345
- Van Hedger, S. C., Heald, S. L. M., & Nusbaum, H. C. (2019). Absolute pitch can be learned by some adults. *PLOS ONE, 14*(9), e0223047. https://doi.org/10.1371/journal.pone.0223047
- Wong, Y. K., Lui, K. F. H., Yip, K. H. M., & Wong, A. C.-N. (2020). Is it impossible to acquire absolute pitch in adulthood? *Attention, Perception, & Psychophysics, 82*(3), 1407-1430. https://doi.org/10.3758/s13414-019-01869-3
- Blood, B. *Music Theory Online*, leçon 14 « Other Clefs ». Dolmetsch Online. https://dolmetsch.com/musictheory14.htm
- Larousse. *Dictionnaire de la musique* (en ligne), article « Clef ». https://www.larousse.fr/encyclopedie/musdico/clef/166855
- ISO 16:1975, *Acoustique — Fréquence normale d'accord (fréquence normale du la3)*. https://www.iso.org/standard/3601.html
