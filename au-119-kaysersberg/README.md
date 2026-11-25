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

## Images

Toutes les photos et vidéos de plats et de la salle viennent des rushs tournés au restaurant. Les gravures (façade du hero, maison du pied de page) sont calculées à partir de la vraie photo de la façade. Seule la cigogne du pied de page est une illustration générée.

Sur la vidéo et la photo de la façade, le visage des clients assis en terrasse est légèrement estompé. La photo « terrasse » de la galerie est cadrée sans clients.
