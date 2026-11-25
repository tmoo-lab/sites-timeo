# -*- coding: utf-8 -*-
"""La carte du 119 — reprise de la carte 2026 du restaurant (fichier « 119 carte menu 2026.pdf » du 4 nov. 2026) :
noms, descriptions et prix à l'identique (seule la casse est harmonisée : « Choucroute alsacienne », « Quiche lorraine »,
comme dans le reste du site), avec la traduction anglaise et allemande.
Les desserts, gaufres et glaces ne figurent pas sur ce PDF : ils viennent de l'ancien site (à vérifier).
Pour changer un prix ou un plat : modifier ici, puis relancer build.py.

La carte papier photographiée en salle (nov. 2026) est plus courte que le PDF : les plats listés dans
NOT_ON_PAPER n'y figurent pas. Passer PAPER_ONLY à True pour n'afficher que ce qui est sur la carte papier
(les textes du site — « les neuf tartes », etc. — suivent tout seuls)."""

PAPER_ONLY = False
NOT_ON_PAPER = {
    ('tartes', 'Chèvre'), ('tartes', 'Forestière'), ('tartes', 'Escargots'), ('tartes', 'Italienne'),
    ('baguettes', 'Chèvre'), ('crepes-salees', 'Crêpe italienne'),
    ('specialites', 'Quiche lorraine, salade verte'), ('petits', 'Jambon blanc, frites et salade verte'),
}


def L(fr, en=None, de=None):
    """Texte en trois langues. Si une seule valeur : identique partout (nom propre)."""
    return {'fr': fr, 'en': en if en is not None else fr, 'de': de if de is not None else fr}


def I(name, price, desc=None):
    """Un plat : nom, prix (nombre), description éventuelle."""
    return {'name': name if isinstance(name, dict) else L(name), 'price': price, 'desc': desc}


# --------------------------------------------------------------------------- À TABLE
FOOD = [
    {
        'id': 'specialites', 'tab': 'plats', 'brk': True,
        'title': L('Nos spécialités alsaciennes', 'Our Alsatian specialities', 'Unsere Elsässer Spezialitäten'),
        'items': [
            I('Choucroute alsacienne', 22, L('Choucroute, viandes et saucisses, pommes de terre', 'Sauerkraut with meats and sausages, potatoes', 'Sauerkraut mit Fleisch und Würsten, Kartoffeln')),
            I('Choucroute royale', 30, L('Choucroute alsacienne avec jarret braisé', 'Alsatian sauerkraut topped with a braised pork knuckle', 'Elsässer Sauerkraut mit geschmorter Schweinshaxe')),
            I('Baeckeoffe alsacien, salade verte', 22, L('3 viandes, pommes de terre, légumes, cuits dans du vin', 'Three meats, potatoes and vegetables cooked in wine, green salad', 'Drei Fleischsorten, Kartoffeln und Gemüse, in Wein gegart, grüner Salat')),
            I('Poêlée alsacienne et sa salade verte', 18, L('Pommes de terre, oignons, lardons et Munster', 'Pan-fried potatoes, onions, bacon and Munster cheese, green salad', 'Kartoffelpfanne mit Zwiebeln, Speck und Munsterkäse, grüner Salat')),
            I('Gratin de spaetzles au Munster et salade verte', 18, L(None, 'Spaetzle baked with Munster cheese, green salad', 'Spätzle mit Munsterkäse überbacken, grüner Salat')),
            I('Gratin de spaetzles au Munster avec Kassler, salade', 25, L('Kassler : filet de porc fumé', 'With Kassler (smoked pork loin), salad', 'Mit Kassler (geräuchertes Schweinefilet), Salat')),
            I('Kassler, frites, salade', 20, L('Filet de porc fumé · supplément Munster 4 €', 'Smoked pork loin, fries, salad · add Munster cheese €4', 'Geräuchertes Schweinefilet, Pommes frites, Salat · mit Munster +4 €')),
            I('Jarret de porc braisé, frites, salade', 22, L('Supplément Munster 4 €', 'Braised pork knuckle, fries, salad · add Munster cheese €4', 'Geschmorte Schweinshaxe, Pommes frites, Salat · mit Munster +4 €')),
            I('Jarret de porc braisé, choux et pommes de terre', 25, L(None, 'Braised pork knuckle with cabbage and potatoes', 'Geschmorte Schweinshaxe mit Kraut und Kartoffeln')),
            I('Quiche lorraine, salade verte', 18, L('Jambon, lardons et salade verte', 'Ham and bacon quiche, green salad', 'Quiche mit Schinken und Speck, grüner Salat')),
        ],
    },
    {
        'id': 'viandes', 'tab': 'plats',
        'title': L('Côté viande', 'From the grill', 'Fleisch'),
        'items': [
            I(L('Filet de bœuf 200 g, frites et légumes', 'Filet de bœuf 200 g, frites et légumes', 'Filet de bœuf 200 g, frites et légumes'), 28,
              L('Sauce au choix : ail des ours, poivre ou champignons', '200 g beef fillet, fries and vegetables · your choice of wild garlic, pepper or mushroom sauce', 'Rinderfilet 200 g, Pommes frites und Gemüse · Sauce nach Wahl: Bärlauch, Pfeffer oder Pilze')),
            I('Poulet croustillant, sauce forestière, frites et salade', 20, L(None, 'Crispy chicken with mushroom sauce, fries and salad', 'Knuspriges Hähnchen mit Pilzsauce, Pommes frites und Salat')),
        ],
        'foot': L('Option spaetzles : + 1,50 €', 'Swap for spaetzle: +€1.50', 'Mit Spätzle statt Beilage: +1,50 €'),
    },
    {
        'id': 'tartes', 'tab': 'tartes', 'brk': True,
        'title': L('Tartes flambées', 'Tartes flambées', 'Flammkuchen'),
        'note': L('Servies à toute heure', 'Served all day', 'Durchgehend serviert'),
        'items': [
            I('Nature', 10, L('Fromage blanc, oignons et lardons', 'Fresh cream cheese, onions and bacon', 'Frischkäse, Zwiebeln und Speck')),
            I('Gratinée', 14, L('Fromage blanc, oignons, lardons et emmental', 'Fresh cream cheese, onions, bacon and Emmental', 'Frischkäse, Zwiebeln, Speck und Emmentaler')),
            I('Munster', 14, L('Fromage blanc, oignons, lardons, emmental, Munster', 'Fresh cream cheese, onions, bacon, Emmental, Munster', 'Frischkäse, Zwiebeln, Speck, Emmentaler, Munster')),
            I('Chèvre', 14, L('Fromage blanc, oignons, lardons, emmental, fromage de chèvre', "Fresh cream cheese, onions, bacon, Emmental, goat's cheese", 'Frischkäse, Zwiebeln, Speck, Emmentaler, Ziegenkäse')),
            I('Forestière', 14, L('Fromage blanc, oignons, champignons et emmental · lardons sur demande', 'Fresh cream cheese, onions, mushrooms and Emmental · bacon on request', 'Frischkäse, Zwiebeln, Pilze und Emmentaler · Speck auf Wunsch')),
            I('Saumon', 14, L('Fromage blanc, oignons, saumon, câpres, aneth et emmental', 'Fresh cream cheese, onions, salmon, capers, dill and Emmental', 'Frischkäse, Zwiebeln, Lachs, Kapern, Dill und Emmentaler')),
            I('Escargots', 14, L('Fromage blanc, oignons, escargots et emmental', 'Fresh cream cheese, onions, snails and Emmental', 'Frischkäse, Zwiebeln, Schnecken und Emmentaler')),
            I('Italienne', 14, L('Sauce tomate, oignons, olives, jambon, champignons et emmental', 'Tomato sauce, onions, olives, ham, mushrooms and Emmental', 'Tomatensauce, Zwiebeln, Oliven, Schinken, Pilze und Emmentaler')),
            I('Myrtilles', 12, L('Fromage blanc, myrtilles et sucre', 'Fresh cream cheese, blueberries and sugar', 'Frischkäse, Heidelbeeren und Zucker')),
            I(L('Salade verte', 'Green salad', 'Grüner Salat'), 4),
        ],
    },
    {
        'id': 'baguettes', 'tab': 'tartes',
        'title': L('Baguettes flambées', 'Baguettes flambées', 'Flammbaguettes'),
        'items': [
            I('Gratinée', 6, L('Fromage blanc, lardons, oignons et emmental', 'Fresh cream cheese, bacon, onions and Emmental', 'Frischkäse, Speck, Zwiebeln und Emmentaler')),
            I('Munster', 8, L('Fromage blanc, lardons, oignons, emmental, fromage de Munster', 'Fresh cream cheese, bacon, onions, Emmental, Munster', 'Frischkäse, Speck, Zwiebeln, Emmentaler, Munster')),
            I('Chèvre', 8, L('Fromage blanc, lardons, oignons, emmental, fromage de chèvre', "Fresh cream cheese, bacon, onions, Emmental, goat's cheese", 'Frischkäse, Speck, Zwiebeln, Emmentaler, Ziegenkäse')),
        ],
    },
    {
        'id': 'crepes-salees', 'tab': 'tartes',
        'title': L('Crêpes salées', 'Savoury crêpes', 'Herzhafte Crêpes'),
        'items': [
            I(L('Crêpe jambon et fromage', 'Ham and cheese crêpe', 'Crêpe mit Schinken und Käse'), 6),
            I('Crêpe alsacienne', 8, L('Jambon, emmental, Munster', 'Ham, Emmental, Munster', 'Schinken, Emmentaler, Munster')),
            I('Crêpe italienne', 8, L('Sauce tomate, jambon, emmental', 'Tomato sauce, ham, Emmental', 'Tomatensauce, Schinken, Emmentaler')),
            I('Crêpe au saumon', 9, L('Saumon, emmental, aneth', 'Salmon, Emmental, dill', 'Lachs, Emmentaler, Dill')),
        ],
    },
    {
        'id': 'burgers', 'tab': 'plats',
        'title': L('Burgers', 'Burgers', 'Burger'),
        'items': [
            I('Alsacien', 13, L('Steak, pommes de terre, Munster, oignons, salade, tomates, cornichons, pain', 'Beef patty, potatoes, Munster, onions, lettuce, tomatoes, gherkins, bun', 'Rindfleisch, Kartoffeln, Munster, Zwiebeln, Salat, Tomaten, Gewürzgurken, Brötchen')),
            I('Comté', 13, L('Steak, comté, bacon, oignons, tomates, salade, cornichons, pain', 'Beef patty, Comté cheese, bacon, onions, tomatoes, lettuce, gherkins, bun', 'Rindfleisch, Comté, Bacon, Zwiebeln, Tomaten, Salat, Gewürzgurken, Brötchen')),
            I('Chicken burger', 13, L('Poulet tenders, comté, oignons, tomates, salade, sauce barbecue, cornichons, pain', 'Chicken tenders, Comté cheese, onions, tomatoes, lettuce, barbecue sauce, gherkins, bun', 'Hähnchen-Tenders, Comté, Zwiebeln, Tomaten, Salat, Barbecuesauce, Gewürzgurken, Brötchen')),
            I(L('Salade', 'Salad', 'Salat'), 4),
            I(L('Frites', 'Fries', 'Pommes frites'), 4),
        ],
    },
    {
        'id': 'petits', 'tab': 'plats',
        'title': L('Pour les petits… et les grands', 'For little ones… and grown-ups', 'Für Kleine… und Große'),
        'items': [
            I(L('Saucisses chaudes, frites et salade verte', 'Hot sausages, fries and green salad', 'Heiße Würstchen, Pommes frites und grüner Salat'), 15),
            I(L('Jambon blanc, frites et salade verte', 'Cooked ham, fries and green salad', 'Gekochter Schinken, Pommes frites und grüner Salat'), 15),
        ],
    },
    # ----- desserts : absents du PDF 2026, repris de l'ancien site (à vérifier)
    {
        'id': 'desserts', 'tab': 'desserts',
        'title': L('Nos desserts', 'Our desserts', 'Unsere Desserts'),
        'items': [
            I(L('Tarte aux myrtilles', 'Blueberry tart', 'Heidelbeerkuchen'), 6),
            I('Kougelhopf glacé aromatisé au Marc de Gewurztraminer', 6, L(None, 'Iced kougelhopf flavoured with Gewurztraminer marc', 'Eis-Gugelhupf, mit Gewürztraminer-Marc aromatisiert')),
            I('Kougelhopf glacé arrosé au Marc de Gewurztraminer', 9, L(None, 'Iced kougelhopf doused with Gewurztraminer marc', 'Eis-Gugelhupf, mit Gewürztraminer-Marc übergossen')),
            I('Forêt Noire glacée', 9, L(None, 'Iced Black Forest cake', 'Schwarzwälder Eistorte')),
            I('Vacherin glacé', 9, L(None, 'Iced vacherin: meringue and ice cream', 'Eis-Vacherin: Baiser und Eis')),
            I(L('Fondant au chocolat', 'Chocolate fondant', 'Schokoladenfondant'), 8),
            I(L('Tarte flambée aux myrtilles', 'Blueberry tarte flambée', 'Heidelbeer-Flammkuchen'), 12),
            I('Café gourmand', 12, L(None, 'Coffee with mini desserts', 'Kaffee mit kleinen Desserts')),
        ],
    },
    {
        'id': 'gaufres', 'tab': 'desserts', 'brk': True,
        'title': L('Gaufres & crêpes', 'Waffles & crêpes', 'Waffeln & Crêpes'),
        'note': L('Au choix · gaufre ou crêpe', 'Your choice of waffle or crêpe', 'Nach Wahl: Waffel oder Crêpe'),
        'compact': True,
        'items': [
            I(L('Sucre', 'Sugar', 'Zucker'), 3.5),
            I(L('Confiture', 'Jam', 'Konfitüre'), 4),
            I(L('Chocolat Nutella', 'Nutella', 'Nutella'), 4),
            I(L('Myrtilles', 'Blueberries', 'Heidelbeeren'), 5),
            I(L('Caramel beurre salé', 'Salted butter caramel', 'Salzbutter-Karamell'), 5),
            I(L('Spéculoos', 'Speculoos', 'Spekulatius'), 5),
            I(L('Chocolat blanc noisettes', 'White chocolate & hazelnut', 'Weiße Schokolade & Haselnuss'), 5),
            I(L('Grand Marnier (alcool)', 'Grand Marnier (alcohol)', 'Grand Marnier (Alkohol)'), 6),
        ],
        'foot': L('Supplément chantilly 1 € · Supplément 1 boule de glace 2,50 €', 'Whipped cream +€1 · One scoop of ice cream +€2.50', 'Schlagsahne +1 € · 1 Kugel Eis +2,50 €'),
    },
    {
        'id': 'glaces', 'tab': 'desserts',
        'title': L('Nos coupes de glaces', 'Our ice cream sundaes', 'Unsere Eisbecher'),
        'items': [
            I('La Kaysersberg', 9, L('Sorbet pêche de vigne, glaces vanille et chocolat, coulis de chocolat et chantilly', 'Vineyard peach sorbet, vanilla and chocolate ice cream, chocolate sauce and whipped cream', 'Weinbergpfirsich-Sorbet, Vanille- und Schokoladeneis, Schokoladensauce und Schlagsahne')),
            I('La Riquewihr', 9, L('Glaces pistache, noisette, vanille et chantilly', 'Pistachio, hazelnut and vanilla ice cream, whipped cream', 'Pistazien-, Haselnuss- und Vanilleeis, Schlagsahne')),
            I('La Colmar', 9, L('Sorbets framboise, citron et passion, coulis de fruits rouges et chantilly', 'Raspberry, lemon and passion fruit sorbets, red berry coulis and whipped cream', 'Himbeer-, Zitronen- und Maracuja-Sorbet, Beerensauce und Schlagsahne')),
            I('La Vosgienne', 9, L('Sorbets framboise, myrtille et glace vanille, coulis de fruits rouges et chantilly', 'Raspberry and blueberry sorbets, vanilla ice cream, red berry coulis and whipped cream', 'Himbeer- und Heidelbeer-Sorbet, Vanilleeis, Beerensauce und Schlagsahne')),
            I("L'Alsacienne", 12, L('Sorbet citron arrosé au Marc de Gewurztraminer', 'Lemon sorbet doused with Gewurztraminer marc', 'Zitronensorbet mit Gewürztraminer-Marc')),
            I('Le chocolat liégeois', 9, L('2 boules chocolat, 1 boule vanille, chocolat chaud, coulis et chantilly', '2 scoops chocolate, 1 scoop vanilla, hot chocolate, sauce and whipped cream', '2 Kugeln Schokolade, 1 Kugel Vanille, heiße Schokolade, Sauce und Schlagsahne')),
            I('Dame Blanche', 9, L('3 boules vanille, coulis de chocolat et chantilly', '3 scoops vanilla, chocolate sauce and whipped cream', '3 Kugeln Vanille, Schokoladensauce und Schlagsahne')),
            I('Le café liégeois', 9, L('3 boules café, un expresso chaud et chantilly', '3 scoops coffee ice cream, a hot espresso and whipped cream', '3 Kugeln Kaffee-Eis, ein heißer Espresso und Schlagsahne')),
            I('Meringue glacée chantilly', 9, L('Meringues, 2 boules au choix et chantilly', 'Meringues, 2 scoops of your choice and whipped cream', 'Baiser, 2 Kugeln nach Wahl und Schlagsahne')),
            I(L('Coupe 3 boules au choix', 'Three scoops of your choice', '3 Kugeln nach Wahl'), 7.5, L('Café · noisette · myrtille · framboise · vanille · caramel · pêche de vigne · citron · chocolat · pistache · fraise · passion', 'Coffee · hazelnut · blueberry · raspberry · vanilla · caramel · vineyard peach · lemon · chocolate · pistachio · strawberry · passion fruit', 'Kaffee · Haselnuss · Heidelbeere · Himbeere · Vanille · Karamell · Weinbergpfirsich · Zitrone · Schokolade · Pistazie · Erdbeere · Maracuja')),
            I(L('Milkshake parfum au choix', 'Milkshake, flavour of your choice', 'Milchshake, Sorte nach Wahl'), 7),
        ],
        'foot': L('1 boule de glace 2,50 € · Supplément chantilly 1 €', 'One scoop of ice cream €2.50 · Whipped cream +€1', '1 Kugel Eis 2,50 € · Schlagsahne +1 €'),
    },
]

SHARED = L('Tout plat partagé fait l\'objet d\'un supplément de 5 €.', 'A €5 surcharge applies to any shared dish.', 'Für geteilte Gerichte berechnen wir einen Aufpreis von 5 €.')

# --------------------------------------------------------------------------- AU COMPTOIR
BEERS = {
    'id': 'bieres', 'tab': 'bieres',
    'title': L('Bières pression', 'Draught beers', 'Biere vom Fass'),
    'cols': ['25 cl', '33 cl', '50 cl'],
    'rows': [
        (L("Kaysers'bier blonde"), [3.5, 5.0, 7.0]),
        (L("Kaysers'bier blanche"), [4.0, 6.0, 8.0]),
        (L("Kaysers'bier de saison", "Kaysers'bier de saison (seasonal)", "Kaysers'bier de saison (Saisonbier)"), [4.0, 6.0, 8.0]),
        (L('Leffe'), [4.0, 6.0, 8.0]),
        (L('Panaché', 'Panaché (shandy)', 'Panaché (Radler)'), [3.5, 5.0, 7.0]),
        (L('Monaco'), [4.0, 6.0, 8.0]),
        (L('Amer · Picon · Cynar'), [4.0, 6.0, 8.0]),
    ],
    'foot': L('Bière sans alcool 33 cl — 4,00 € · Supplément rondelle de citron ou sirop 0,20 €', 'Alcohol-free beer 33 cl — €4.00 · Slice of lemon or syrup +€0.20', 'Alkoholfreies Bier 33 cl — 4,00 € · Zitronenscheibe oder Sirup +0,20 €'),
}

APERITIFS = {
    'id': 'aperitifs', 'tab': 'bieres', 'brk': True,
    'title': L('Apéritifs', 'Aperitifs', 'Aperitifs'),
    'items': [
        I(L('Apéritif maison', 'House aperitif', 'Aperitif des Hauses'), 6, L('Crémant et liqueur de pêche de vigne', 'Crémant and vineyard peach liqueur', 'Crémant und Weinbergpfirsichlikör')),
        I('Kir (10 cl)', 5, L('Cassis, mûre ou framboise', 'Blackcurrant, blackberry or raspberry', 'Cassis, Brombeere oder Himbeere')),
        I(L('Whisky (2 cl) ou Martini (2 cl)', 'Whisky (2 cl) or Martini (2 cl)', 'Whisky (2 cl) oder Martini (2 cl)'), 5),
        I(L('Pastis (2 cl) ou Ricard (2 cl)', 'Pastis (2 cl) or Ricard (2 cl)', 'Pastis (2 cl) oder Ricard (2 cl)'), 3.2),
    ],
}

COCKTAILS = [
    {
        'id': 'cocktails', 'tab': 'bieres',
        'title': L('Cocktails', 'Cocktails', 'Cocktails'),
        'items': [
            I('Cocktail Alsacien', 9, L('Crémant, Gewurztraminer, citrons…', 'Crémant, Gewurztraminer, lemons…', 'Crémant, Gewürztraminer, Zitronen…')),
            I('Spritz Apérol', 10, L('Crémant, Apérol, tonic', 'Crémant, Aperol, tonic', 'Crémant, Aperol, Tonic')),
            I('Pink Rosé', 10, L('Vin rosé, liqueur de framboise, crémant, fruits rouges', 'Rosé wine, raspberry liqueur, crémant, red berries', 'Roséwein, Himbeerlikör, Crémant, rote Beeren')),
            I('Hugo', 10, L('Liqueur de sureau, eau gazeuse, crémant, citron, menthe', 'Elderflower liqueur, sparkling water, crémant, lemon, mint', 'Holunderlikör, Sprudelwasser, Crémant, Zitrone, Minze')),
            I('Sex on the Beach', 10, L("Vodka, liqueur de pêche, jus d'orange et cranberry", 'Vodka, peach liqueur, orange and cranberry juice', 'Wodka, Pfirsichlikör, Orangen- und Cranberrysaft')),
            I('Ananas Velouté', 10, L("Bailey's, liqueur de pêche, jus d'ananas", 'Baileys, peach liqueur, pineapple juice', 'Baileys, Pfirsichlikör, Ananassaft')),
            I('Porn Star Martini', 10, L('Vodka, passion, citron vert, vanille', 'Vodka, passion fruit, lime, vanilla', 'Wodka, Maracuja, Limette, Vanille')),
            I('Mojito', 10, L('Rhum, eau gazeuse, sucre de canne, menthe et citron vert', 'Rum, sparkling water, cane sugar, mint and lime', 'Rum, Sprudelwasser, Rohrzucker, Minze und Limette')),
            I('Cuba Libre', 9, L('Rhum, Coca et rondelle de citron', 'Rum, cola and a slice of lemon', 'Rum, Cola und Zitronenscheibe')),
            I('Téquila Sunrise', 9, L("Téquila, jus d'orange et trait de grenadine", 'Tequila, orange juice and a dash of grenadine', 'Tequila, Orangensaft und ein Schuss Grenadine')),
            I('Gin Tonic', 9, L('Gin, Schweppes et rondelle de citron', 'Gin, tonic and a slice of lemon', 'Gin, Tonic und Zitronenscheibe')),
        ],
    },
    {
        'id': 'sans-alcool', 'tab': 'bieres',
        'title': L('Cocktails sans alcool', 'Alcohol-free cocktails', 'Alkoholfreie Cocktails'),
        'items': [
            I('Tropical', 8, L("Jus d'ananas, limonade, sirop de framboise, citron", 'Pineapple juice, lemonade, raspberry syrup, lemon', 'Ananassaft, Limonade, Himbeersirup, Zitrone')),
            I('Virgin on the Beach', 8, L("Jus d'orange, cranberry, limonade, sirop de pêche", 'Orange juice, cranberry, lemonade, peach syrup', 'Orangensaft, Cranberry, Limonade, Pfirsichsirup')),
            I('Virgin Mojito', 8, L('Citron vert, menthe, sucre de canne, limonade', 'Lime, mint, cane sugar, lemonade', 'Limette, Minze, Rohrzucker, Limonade')),
        ],
    },
]

WINES = {
    'id': 'vins', 'tab': 'vins',
    'title': L("Vins d'Alsace", 'Alsace wines', 'Elsässer Weine'),
    'note': L('Domaine Bernard Haas & Fils · AOC Alsace', 'Domaine Bernard Haas & Fils · AOC Alsace', 'Domaine Bernard Haas & Fils · AOC Alsace'),
    'cols': ['10 cl', '¼ l', '½ l', '75 cl'],
    'groups': [
        (L('De tradition', 'Tradition', 'Tradition'), [
            ('Edelzwicker', [4, 8, 16, 24]),
            ('Sylvaner', [4, 8, 16, 24]),
            ('Pinot blanc, Côtes de Kaysersberg', [4.5, 9, 18, 27]),
            ('Pinot gris, Côtes de Kaysersberg', [4.5, 9, 18, 27]),
            ('Pinot noir rosé', [4.5, 9, 18, 27]),
            ('Pinot noir, Réserve Personnelle', [4.5, 9, 18, 27]),
            ('Riesling, Réserve Personnelle', [4.5, 9, 18, 27]),
            ('Muscat de Kaysersberg', [5, 10, 20, 30]),
            ('Gewurztraminer, Réserve Personnelle', [5, 10, 20, 30]),
        ]),
        (L('De prestige', 'Prestige', 'Prestige'), [
            ('Riesling, Grand Cru Schlossberg', [6, 12, 24, 36]),
            ('Gewurztraminer, Grand Cru Schlossberg', [6, 12, 24, 36]),
            ('Gewurztraminer, Vendanges Tardives', [9.5, None, 38, 55]),
        ]),
    ],
    # (titre, note, [(nom, description, [(format, prix), ...]), ...])
    'extras': [
        (L('Les fines bulles', 'Sparkling wines', 'Schaumweine'), L('Domaine du Windmuehl · AOC Alsace'), [
            (L('Crémant brut'), None, [('10 cl', 4.5), ('75 cl', 26)]),
            (L('Crémant brut Rosé'), None, [('10 cl', 4.5), ('75 cl', 26)]),
            (L('Crémant Royal'), L('Cassis, framboise ou mûre', 'Blackcurrant, raspberry or blackberry', 'Cassis, Himbeere oder Brombeere'), [('', 6)]),
        ]),
        (L('Cidres', 'Cider', 'Cidre'), None, [
            (L('Cidre doux ou brut', 'Cider, sweet or dry', 'Cidre, süß oder trocken'), None, [('10 cl', 3), ('¼ l', 6), ('½ l', 12), ('75 cl', 18)]),
        ]),
    ],
}

SOFTS = {
    'id': 'softs', 'tab': 'chaud', 'brk': True,
    'title': L('Softs', 'Soft drinks', 'Alkoholfreie Getränke'),
    'items': [
        I(L('Coca-Cola, Coca zéro · 33 cl', 'Coca-Cola, Coke Zero · 33 cl', 'Coca-Cola, Coca-Cola Zero · 33 cl'), 3),
        I(L('Coca-Cola, Coca zéro · 50 cl', 'Coca-Cola, Coke Zero · 50 cl', 'Coca-Cola, Coca-Cola Zero · 50 cl'), 5),
        I(L('Orangina, Ice Tea · 33 cl'), 3),
        I(L('Schweppes, Schweppes agrumes · 33 cl', 'Schweppes, Schweppes citrus · 33 cl', 'Schweppes, Schweppes Citrus · 33 cl'), 3),
        I(L('Jus de fruits · 25 cl', 'Fruit juice · 25 cl', 'Fruchtsaft · 25 cl'), 3, L('Pomme, ananas, abricot, orange, tomate', 'Apple, pineapple, apricot, orange, tomato', 'Apfel, Ananas, Aprikose, Orange, Tomate')),
        I(L('Fanta, Oasis · 33 cl'), 3),
        I(L('Limonade · 25 cl', 'Lemonade · 25 cl', 'Limonade · 25 cl'), 3),
        I(L('Diabolo · 25 cl'), 3, L('Menthe, citron, grenadine, fraise', 'Mint, lemon, grenadine, strawberry', 'Minze, Zitrone, Grenadine, Erdbeere')),
        I(L('Eau pétillante ou plate · 50 cl', 'Sparkling or still water · 50 cl', 'Wasser mit oder ohne Kohlensäure · 50 cl'), 2.5),
        I(L('Eau pétillante ou plate · 125 cl', 'Sparkling or still water · 125 cl', 'Wasser mit oder ohne Kohlensäure · 125 cl'), 5),
        I(L('Perrier · 33 cl'), 3),
        I(L("Sirop à l'eau · 25 cl", 'Syrup with water · 25 cl', 'Sirup mit Wasser · 25 cl'), 2.5, L('Menthe, citron, grenadine, fraise', 'Mint, lemon, grenadine, strawberry', 'Minze, Zitrone, Grenadine, Erdbeere')),
        I(L('Apfelschorle · 33 cl'), 3.5),
    ],
}

HOT = {
    'id': 'chaud', 'tab': 'chaud',
    'title': L('Boissons chaudes', 'Hot drinks', 'Heiße Getränke'),
    'items': [
        I(L('Expresso', 'Espresso', 'Espresso'), 2.5),
        I(L('Double expresso', 'Double espresso', 'Doppelter Espresso'), 4.5),
        I(L('Expresso crème', 'Espresso with cream', 'Espresso mit Sahne'), 2.8),
        I(L('Grand café', 'Large coffee', 'Großer Kaffee'), 3),
        I(L('Grand café crème', 'Large coffee with cream', 'Großer Kaffee mit Sahne'), 3.3),
        I('Cappuccino', 3.5),
        I('Latte macchiato', 4),
        I(L('Latte vanille (froid ou chaud)', 'Vanilla latte (iced or hot)', 'Vanille-Latte (kalt oder heiß)'), 5.5),
        I(L('Latte caramel (froid ou chaud)', 'Caramel latte (iced or hot)', 'Karamell-Latte (kalt oder heiß)'), 5.5),
        I(L('Infusion · Thé', 'Herbal tea · Tea', 'Kräutertee · Tee'), 3),
        I('Chococcino', 4.5),
        I('Café con panna', 4),
        I(L('Chocolat chaud', 'Hot chocolate', 'Heiße Schokolade'), 4),
        I('Eis-café', 6.5),
        I(L('Irish coffee · Café alsacien', 'Irish coffee · Alsatian coffee', 'Irish Coffee · Elsässer Kaffee'), 10),
        I('Café gourmand', 12, L(None, 'Coffee with mini desserts', 'Kaffee mit kleinen Desserts')),
    ],
}

DIGESTIFS = {
    'id': 'digestifs', 'tab': 'chaud',
    'title': L('Digestifs (3 cl)', 'Digestifs (3 cl)', 'Digestifs (3 cl)'),
    'items': [
        I(L('Marc de Gewurztraminer, Poire Williams, Kirsch, Framboise, Mirabelle, Quetsch',
            'Gewurztraminer marc, Williams pear, kirsch, raspberry, mirabelle plum, quetsch plum',
            'Gewürztraminer-Marc, Williamsbirne, Kirsch, Himbeere, Mirabelle, Zwetschge'), 6.5),
    ],
}

TABS = [
    ('plats', L('Plats & burgers', 'Mains & burgers', 'Gerichte & Burger')),
    ('tartes', L('Tartes flambées', 'Tartes flambées', 'Flammkuchen')),
    ('desserts', L('Desserts & glaces', 'Desserts & ice cream', 'Desserts & Eis')),
    ('bieres', L('Bières & cocktails', 'Beers & cocktails', 'Biere & Cocktails')),
    ('vins', L("Vins d'Alsace", 'Alsace wines', 'Elsässer Weine')),
    ('chaud', L('Softs & cafés', 'Soft drinks & coffee', 'Softdrinks & Kaffee')),
]


_names = {(c['id'], i['name']['fr']) for c in FOOD for i in c['items']}
assert NOT_ON_PAPER <= _names, NOT_ON_PAPER - _names          # garde-fou : une faute de frappe ici ne passe pas inaperçue
if PAPER_ONLY:
    for c in FOOD: c['items'] = [i for i in c['items'] if (c['id'], i['name']['fr']) not in NOT_ON_PAPER]


def find(cat_id, startswith):
    """Prix d'un plat retrouvé par le début de son nom (sert aux textes du site : un seul endroit à modifier).
    Renvoie None si le plat n'est pas (ou plus) à la carte."""
    for c in FOOD:
        if c['id'] == cat_id:
            for it in c['items']:
                if it['name']['fr'].startswith(startswith): return it['price']
    return None


def tartes():
    """Les tartes flambées, sans la salade verte vendue à côté."""
    return [i for c in FOOD if c['id'] == 'tartes' for i in c['items'] if not i['name']['fr'].startswith('Salade')]
