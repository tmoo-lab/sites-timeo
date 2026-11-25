# Au 119 — restaurant brasserie, Kaysersberg

Refonte du site du 119 (119 rue du Général de Gaulle, 68240 Kaysersberg). Site statique en trois langues (français, anglais, allemand), sans dépendance externe : polices, photos et vidéos sont servies depuis le site.

- `public/` : le site prêt à mettre en ligne (c'est ce dossier que Netlify publie).
- `build/` : les sources. Le site se régénère avec `python3 build/build.py` (Python 3 + `jinja2` + `pillow`).

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

La carte a été recopiée de l'ancien site et vérifiée ligne par ligne (119 lignes, mêmes prix).

## Images

Toutes les photos et vidéos de plats et de la salle viennent des rushs tournés au restaurant. Les gravures (façade du hero, maison du pied de page) sont calculées à partir de la vraie photo de la façade. Seule la cigogne du pied de page est une illustration générée.
