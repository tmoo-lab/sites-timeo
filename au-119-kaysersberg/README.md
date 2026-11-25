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

Toutes les photos et tous les films viennent des rushs tournés au restaurant. Les rushs d'intérieur (10 bits) ont une forte dominante orange due à l'éclairage : les photos sont donc **développées** à partir de ces rushs, avec une balance des blancs faite en lumière linéaire, puis recadrées une par une pour le cadre qui les reçoit (arche, carré, carte de galerie). Aucun sujet n'est coupé par le cadre ; chaque fichier a exactement les proportions de son cadre, le navigateur ne recadre donc rien de plus.

| Fichiers (`public/assets/img/`) | Usage |
| --- | --- |
| `plat-*-480/720.webp` | les six assiettes de la bande « Les assiettes de la maison » |
| `verre-*-480/720.webp` | vins, bières, cocktails |
| `g-*.webp`, `terrasse-*.webp` | galerie ; les deux vues en largeur (`g-rouge`, `g-horloge`) ont un cadrage vertical pour le téléphone (`-p-`) |
| `med-*-240.webp`, `pill-*-360.webp` | médaillons du bandeau défilant, pastilles du titre |
| `choucroute-cut-*.webp` | la choucroute royale détourée |
| `facade-*.webp`, `facade-gravure-900.webp`, `gravure-maison-800.webp` | façade du hero et gravures calculées à partir de la vraie photo |

Il reste **quatre films** (`public/assets/video/`) : la façade, la choucroute, les tartes flambées et la salle voûtée. Ce sont de courtes boucles muettes. Sur la page, la photo est toujours présente ; le film vient se poser dessus en fondu seulement quand il joue réellement. Si le téléphone refuse la lecture automatique (mode économie d'énergie, économiseur de données, « réduire les animations »), on voit simplement la photo : pas de cadre vide, pas de bouton de lecture, rien ne se lance au toucher. Un film se charge quand son cadre arrive à l'écran et rend la main quand il est loin.

Chaque photo est dévoilée par un rideau (rouge du store, ou braise dans la section des tartes) qui ne se lève que lorsque l'image est chargée. Si le script du site n'arrive pas (réseau coupé), toute la page s'affiche simplement au bout de 4,5 secondes.

Sur le film et la photo de la façade, le visage des clients assis en terrasse et des passants est estompé. La photo « terrasse » de la galerie est cadrée sans clients ; les bières et les cocktails sont cadrés sous le visage.

## Divers

- `public/404.html` : page « introuvable » aux couleurs du site, dans les trois langues (générée par `build.py`).
- `public/og.jpg` : image affichée quand le lien est partagé (WhatsApp, Facebook, iMessage).
- Dans la carte, la casse des noms de plats est harmonisée avec le reste du site (« Choucroute alsacienne », « Quiche lorraine ») ; les mots, les descriptions et les prix sont ceux de la carte du restaurant.
