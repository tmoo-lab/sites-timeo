# Au 119 — restaurant brasserie, Kaysersberg

Refonte du site du 119 (119 rue du Général de Gaulle, 68240 Kaysersberg). Site statique en trois langues (français, anglais, allemand), sans dépendance externe : polices, photos et vidéos sont servies depuis le site.

- `public/` : le site prêt à mettre en ligne (c'est ce dossier que Netlify publie).
- `build/` : les sources. Le site se régénère avec `python3 build/build.py` (Python 3 + `jinja2`).

## Aperçu ou vrai site

| Commande | Résultat |
| --- | --- |
| `python3 build/build.py` | Aperçu : pages en `noindex`, `robots.txt` fermé. C'est la version envoyée sur `au119-kaysersberg.netlify.app`. |
| `python3 build/build.py --live` | Version pour le vrai domaine `kaysersberg-au119.restaurant` : indexable, `sitemap.xml` déclaré. |

## Où changer quoi

| Besoin | Fichier |
| --- | --- |
| Un plat, un prix, une traduction de la carte | `build/menu.py` |
| Un texte du site (titres, phrases, horaires affichés) | `build/strings.py` |
| Horaires du voyant « ouvert / fermé » et fermeture annuelle | `build/main.js` (`OPEN_H`, `CLOSE_H`, `CLOSED_RANGES`) |
| Mise en page, couleurs, animations | `build/template.html.j2`, `build/styles.css`, `build/main.js` |

## La carte

La carte reprend le fichier « 119 carte menu 2026 » du restaurant (plats, tartes flambées, burgers, vins, bières, cocktails, softs, boissons chaudes), ligne par ligne, avec les mêmes prix. Les desserts, gaufres et glaces ne sont pas sur ce fichier : ils viennent de l'ancien site et restent à confirmer.

La carte papier photographiée en salle est un peu plus courte que ce fichier (5 tartes flambées au lieu de 9, pas de quiche ni de jambon blanc…). Les plats concernés sont listés dans `NOT_ON_PAPER`, en haut de `build/menu.py` : passer `PAPER_ONLY` à `True` suffit pour les retirer du site, et les textes qui en dépendent (« les neuf tartes », la bande des assiettes) suivent tout seuls.

Les prix cités dans les textes du site (choucroute à 30 €, vin au verre dès 4 €…) sont lus dans `build/menu.py` : il n'y a qu'un seul endroit à modifier.

## Images et films

Toutes les photos et tous les films (plats, salle, façade, bières, cocktails) viennent des rushs tournés au restaurant. Les gravures (façade du hero, maison du pied de page) sont calculées à partir de la vraie photo de la façade, redressée pour que les maisons soient d'aplomb. Seule la cigogne du pied de page est une illustration générée.

Chaque film est une courte boucle muette (`public/assets/video/`) dont l'affiche (`public/assets/img/*-film-*.webp`, `plat-*-600.webp`) est exactement la première image : le passage de la photo au film ne se voit pas. Les films ne se chargent qu'à l'approche, ne jouent qu'à l'écran et se déchargent quand ils sont loin (`build/main.js`, « films »). Avec « réduire les animations » activé sur l'appareil, rien ne démarre tout seul.

Sur le film et la photo de la façade, le visage des clients assis en terrasse et des passants est estompé. La photo « terrasse » de la galerie est cadrée sans clients. Les films des bières et des cocktails sont cadrés sous le visage.

## Divers

- `public/404.html` : page « introuvable » aux couleurs du site, dans les trois langues (générée par `build.py`).
- `public/og.jpg` : image affichée quand le lien est partagé (WhatsApp, Facebook, iMessage).
- Dans la carte, la casse des noms de plats est harmonisée avec le reste du site (« Choucroute alsacienne », « Quiche lorraine ») ; les mots, les descriptions et les prix sont ceux de la carte du restaurant.
