# -*- coding: utf-8 -*-
"""Textes du site en français, anglais et allemand.
Chaque entrée : (fr, en, de). Modifier ici puis relancer build.py."""

PHONE_DISPLAY = '03 89 27 56 13'
PHONE_INTL = '+33 3 89 27 56 13'
PHONE_HREF = 'tel:+33389275613'
MAPS_DIR = 'https://www.google.com/maps/dir/?api=1&destination=48.1403445,7.2597468&destination_place_id=ChIJ7xsnDfBgkUcRcOkTp5r7QMo'
MAPS_PLACE = 'https://www.google.com/maps/search/?api=1&query=Au+119+Kaysersberg&query_place_id=ChIJ7xsnDfBgkUcRcOkTp5r7QMo'
SITE_URL = 'https://kaysersberg-au119.restaurant'

S = {
    # ---------------------------------------------------------------- meta
    'meta.title': ('Au 119 · Restaurant brasserie alsacienne à Kaysersberg',
                   'Au 119 · Alsatian brasserie restaurant in Kaysersberg',
                   'Au 119 · Elsässer Brasserie-Restaurant in Kaysersberg'),
    'meta.desc': ("Brasserie alsacienne à Kaysersberg, à deux pas du pont fortifié. Choucroute, baeckeoffe, tartes flambées servies à toute heure, vins d'Alsace et terrasse. Service continu de 10 h à 18 h.",
                  'Alsatian brasserie in Kaysersberg, steps from the fortified bridge. Choucroute, baeckeoffe, tartes flambées served all day, Alsace wines and a terrace. Open 10 am to 6 pm, non-stop.',
                  'Elsässer Brasserie in Kaysersberg, gleich bei der Wehrbrücke. Choucroute, Baeckeoffe, Flammkuchen durchgehend, Elsässer Weine und Terrasse. Durchgehend geöffnet von 10 bis 18 Uhr.'),
    'skip': ('Aller au contenu', 'Skip to content', 'Zum Inhalt springen'),

    # ---------------------------------------------------------------- nav
    'nav.carte': ('La carte', 'Menu', 'Speisekarte'),
    'nav.tartes': ('Tartes flambées', 'Tartes flambées', 'Flammkuchen'),
    'nav.boire': ('À boire', 'Drinks', 'Getränke'),
    'nav.maison': ('La maison', 'The house', 'Das Haus'),
    'nav.trouver': ('Nous trouver', 'Find us', 'Anfahrt'),
    'nav.call': ('Appeler', 'Call', 'Anrufen'),
    'nav.menu': ('Menu', 'Menu', 'Menü'),
    'nav.lang': ('Langue', 'Language', 'Sprache'),
    'status.open': ('Ouvert', 'Open', 'Geöffnet'),
    'status.closed': ('Fermé', 'Closed', 'Geschlossen'),
    'status.until': ("jusqu'à 18 h", 'until 6 pm', 'bis 18 Uhr'),
    'status.opens': ('ouvre à 10 h', 'opens at 10 am', 'öffnet um 10 Uhr'),

    # ---------------------------------------------------------------- hero
    'hero.eyebrow': ('Restaurant · Brasserie — Kaysersberg, Alsace', 'Restaurant · Brasserie — Kaysersberg, Alsace', 'Restaurant · Brasserie — Kaysersberg, Elsass'),
    'hero.eyebrow.s': ('Brasserie alsacienne · Kaysersberg', 'Alsatian brasserie · Kaysersberg', 'Elsässer Brasserie · Kaysersberg'),
    'hero.ring': ('VOIR LA CARTE · VOIR LA CARTE · ', 'SEE THE MENU · SEE THE MENU · ', 'ZUR KARTE · ZUR KARTE · ZUR KARTE · '),
    'hero.lead': ("La brasserie alsacienne à deux pas du pont fortifié. Cuisine maison, tartes flambées à toute heure, terrasse sur les pavés.",
                  'The Alsatian brasserie a few steps from the fortified bridge. Home cooking, tartes flambées all day, a terrace on the cobbles.',
                  'Die Elsässer Brasserie, nur ein paar Schritte von der Wehrbrücke. Hausgemachte Küche, Flammkuchen durchgehend, Terrasse auf dem Kopfsteinpflaster.'),
    'hero.cta1': ('Voir la carte', 'See the menu', 'Zur Speisekarte'),
    'hero.cta2': ('Réserver par téléphone', 'Book by phone', 'Telefonisch reservieren'),
    'hero.hours.label': ('Service continu', 'Open non-stop', 'Durchgehend'),
    'hero.hours': ('10 h – 18 h', '10 am – 6 pm', '10 – 18 Uhr'),
    'hero.days': ('Tous les jours en saison', 'Every day in season', 'In der Saison täglich'),
    'hero.addr.label': ('Adresse', 'Address', 'Adresse'),
    'hero.map': ('Voir sur le plan', 'See on the map', 'Auf dem Plan ansehen'),
    'hero.alt': ('La maison à colombages du 119 et sa terrasse sous le store rouge, à Kaysersberg',
                 'The half-timbered house of Au 119 and its terrace under the red awning, in Kaysersberg',
                 'Das Fachwerkhaus des 119 mit seiner Terrasse unter der roten Markise in Kaysersberg'),

    # ---------------------------------------------------------------- statement
    'st.label': ('Une brasserie alsacienne', 'An Alsatian brasserie', 'Eine Elsässer Brasserie'),
    'st.l1a': ('La', 'Alsatian', 'Elsässer'),
    'st.l1b': ('cuisine', 'cooking,', 'Küche'),
    'st.l2a': ("d'Alsace", 'just', 'wie'),
    'st.l2b': ('comme', 'like', 'bei uns'),
    'st.l3': ('à la maison', 'at home', 'zu Hause'),
    'st.sr': ("La cuisine d'Alsace comme à la maison", 'Alsatian cooking, just like at home', 'Elsässer Küche wie bei uns zu Hause'),
    'st.f1a': ('Tartes flambées', 'Tartes flambées', 'Flammkuchen'),
    'st.f1b': ('à toute heure', 'all day long', 'durchgehend'),
    'st.f2a': ('Service continu', 'Open non-stop', 'Geöffnet'),
    'st.f2b': ('de 10 h à 18 h', '10 am to 6 pm', '10 bis 18 Uhr'),
    'st.f3a': ('Viandes', 'Meat', 'Fleisch'),
    'st.f3b': ('origine France', 'French origin', 'aus Frankreich'),
    'st.f4a': ("Vins d'Alsace", 'Alsace wines', 'Elsässer Weine'),
    'st.f4b': ('Domaine Bernard Haas & Fils', 'Domaine Bernard Haas & Fils', 'Domaine Bernard Haas & Fils'),
    'seal': ('BRASSERIE ALSACIENNE · KAYSERSBERG · ', 'ALSATIAN BRASSERIE · KAYSERSBERG · ', 'ELSÄSSER BRASSERIE · KAYSERSBERG · '),

    # ---------------------------------------------------------------- bandeau défilant
    'mq.choucroute': ('Choucroute royale', 'Choucroute royale', 'Choucroute Royale'),
    'mq.tarte': ('Tartes flambées', 'Tartes flambées', 'Flammkuchen'),
    'mq.jarret': ('Jarret braisé', 'Braised pork knuckle', 'Geschmorte Haxe'),
    'mq.baeckeoffe': ('Baeckeoffe', 'Baeckeoffe', 'Baeckeoffe'),
    'mq.gaufre': ('Gaufres', 'Waffles', 'Waffeln'),
    'mq.bieres': ('Bières pression', 'Beer on tap', 'Bier vom Fass'),
    'mq.vins': ("Vins d'Alsace", 'Alsace wines', 'Elsässer Weine'),

    # ---------------------------------------------------------------- signature dish
    'sig.eyebrow': ('Le plat signature', 'The signature dish', 'Unser Paradegericht'),
    'sig.t1': ('Choucroute', 'Choucroute', 'Choucroute'),
    'sig.t2': ('Royale', 'Royale', 'Royale'),
    'sig.t3': ('au jarret', 'with braised', 'mit geschmorter'),
    'sig.t4': ('braisé', 'pork knuckle', 'Schweinshaxe'),
    'sig.p': ("Le jarret braisé posé sur la choucroute, les saucisses plantées au sommet, les viandes fumées et les pommes de terre autour. L'assiette que tout le monde photographie avant d'attaquer.",
              'A braised pork knuckle set on the sauerkraut, sausages skewered on top, smoked meats and potatoes all around. The plate everyone photographs before digging in.',
              'Die geschmorte Haxe thront auf dem Sauerkraut, die Würste stecken obenauf, Geräuchertes und Kartoffeln ringsum. Der Teller, den alle erst fotografieren und dann genießen.'),
    'sig.r2a': ('La Royale, avec le jarret', 'The Royale, with the knuckle', 'Die Royale, mit Haxe'),
    'sig.r3a': ('La choucroute alsacienne', 'The classic choucroute', 'Die klassische Choucroute'),
    'sig.r4a': ('Viandes', 'Meat', 'Fleisch'),
    'sig.r4b': ('Origine France', 'French origin', 'Aus Frankreich'),
    'sig.badge': ('CHOUCROUTE ROYALE · PRIX ET SERVICE COMPRIS · ', 'CHOUCROUTE ROYALE · SERVICE INCLUDED · ', 'CHOUCROUTE ROYALE · INKL. BEDIENUNG · '),
    'sig.cap': ('Filmé en salle, au 119.', 'Filmed in our dining room.', 'Gefilmt bei uns im Gastraum.'),
    'sig.alt': ('La choucroute royale : jarret braisé, saucisses et viandes fumées sur une assiette noire',
                'The choucroute royale: braised pork knuckle, sausages and smoked meats on a black plate',
                'Die Choucroute Royale: geschmorte Haxe, Würste und Geräuchertes auf einem schwarzen Teller'),
    'sig.valt': ("La choucroute royale posée sur la table", 'The choucroute royale being set on the table', 'Die Choucroute Royale wird auf den Tisch gestellt'),

    # ---------------------------------------------------------------- plates band
    'band.label': ('À table', 'At the table', 'Zu Tisch'),
    'band.title': ('Les assiettes de la maison', 'From our kitchen', 'Aus unserer Küche'),
    'band.hint': ('Faites glisser', 'Drag to browse', 'Zum Blättern ziehen'),
    'band.all': ('Toute la carte', 'The full menu', 'Die ganze Karte'),
    'band.prev': ('Assiettes précédentes', 'Previous plates', 'Vorherige Gerichte'),
    'band.next': ('Assiettes suivantes', 'Next plates', 'Nächste Gerichte'),
    'from': ('dès', 'from', 'ab'),
    'c2.n': ('Jarret de porc braisé', 'Jarret de porc braisé', 'Jarret de porc braisé'),
    'c2.d': ('Frites et salade', 'Braised pork knuckle, fries and salad', 'Geschmorte Schweinshaxe, Pommes frites und Salat'),
    'c4.n': ('Baeckeoffe alsacien', 'Baeckeoffe alsacien', 'Baeckeoffe alsacien'),
    'c4.d': ('Trois viandes cuites au vin', 'Three meats cooked in wine', 'Drei Fleischsorten, in Wein gegart'),
    'c5.n': ('Quiche lorraine', 'Quiche lorraine', 'Quiche lorraine'),
    'c5.d': ('Et sa salade verte', 'With a green salad', 'Mit grünem Salat'),
    'c6.n': ('Filet de bœuf, sauce au choix', 'Filet de bœuf, sauce au choix', 'Filet de bœuf, sauce au choix'),
    'c6.d': ('200 g, frites et légumes', '200 g beef fillet, your choice of sauce, fries and vegetables', 'Rinderfilet 200 g, Sauce nach Wahl, Pommes frites und Gemüse'),
    'c7.n': ('Les burgers', 'The burgers', 'Die Burger'),
    'c7.d': ('Alsacien, comté ou chicken', 'Alsatian, Comté or chicken', 'Elsässer, Comté oder Chicken'),
    'c8.n': ('Gaufres et coupes glacées', 'Waffles and sundaes', 'Waffeln und Eisbecher'),
    'c8.d': ('Pour finir, ou pour le goûter', 'To finish, or for an afternoon treat', 'Zum Abschluss oder am Nachmittag'),

    # ---------------------------------------------------------------- tartes flambées
    'tf.label': ('De 10 h à 18 h, sans coupure', 'From 10 am to 6 pm, non-stop', 'Von 10 bis 18 Uhr, ohne Pause'),
    'tf.t1': ('Tartes flambées', 'Tartes flambées', 'Flammkuchen'),
    'tf.t2': ('à toute heure', 'at any hour', 'zu jeder Stunde'),
    # {n} = nombre de tartes à la carte, écrit en toutes lettres (calculé depuis menu.py)
    'tf.p': ("Étalées, garnies à la main et enfournées à la commande. Nature, gratinée, Munster, saumon ou myrtilles : il y en a {n}, et elles sortent du four quand vous arrivez, pas quand ça nous arrange.",
             'Rolled out, topped by hand and baked to order. Plain, gratinée, Munster, salmon or blueberry: there are {n}, and they come out of the oven when you arrive, not when it suits us.',
             'Ausgerollt, von Hand belegt und auf Bestellung gebacken. Natur, gratiniert, Munster, Lachs oder Heidelbeere: Es gibt {n} Sorten, und sie kommen aus dem Ofen, wenn Sie da sind, nicht wenn es uns passt.'),
    'tf.cap': ("En cuisine : le fromage blanc, les lardons, l'emmental, puis le four.", 'In the kitchen: fromage blanc, bacon, Emmental, then the oven.', 'In der Küche: Frischkäse, Speck, Emmentaler, dann der Ofen.'),
    'tf.valt': ('Deux tartes flambées à la sortie du four, puis une tarte garnie à la main en cuisine', 'Two tartes flambées fresh from the oven, then one being topped by hand in the kitchen', 'Zwei Flammkuchen frisch aus dem Ofen, dann wird einer in der Küche von Hand belegt'),
    'tf.link': ('Toutes les garnitures, dans la carte', 'Every topping, on the menu', 'Alle Beläge in der Karte'),
    'tf.clock.open': ('Il est {t} à Kaysersberg. Le four est chaud.', "It's {t} in Kaysersberg. The oven is hot.", 'In Kaysersberg ist es {t}\u00a0Uhr. Der Ofen ist heiß.'),
    'tf.clock.closed': ('Il est {t} à Kaysersberg. Le four se rallume à 10 h.', "It's {t} in Kaysersberg. The oven is back on at 10 am.", 'In Kaysersberg ist es {t}\u00a0Uhr. Ab 10 Uhr läuft der Ofen wieder.'),
    'tf.clock.alt': ("Horloge à l'heure de Kaysersberg", 'Clock showing Kaysersberg time', 'Uhr mit der Ortszeit von Kaysersberg'),
    'tf.list': ('Les {n} tartes', 'The {n} tartes', 'Die {n} Sorten'),

    # ---------------------------------------------------------------- carte
    'carte.label': ('Carte 2026', '2026 menu', 'Karte 2026'),
    'carte.title': ('La carte, en entier', 'The full menu', 'Die ganze Karte'),
    'carte.sub': ('Prix et service compris.', 'Prices include service.', 'Preise inklusive Bedienung.'),
    'carte.tabs': ('Rubriques de la carte', 'Menu sections', 'Bereiche der Karte'),
    'legal.photos': ('Photos non contractuelles · Prix et service compris', 'Photos are for illustration only · Prices include service', 'Abbildungen unverbindlich · Preise inklusive Bedienung'),
    'legal.alcohol': ("L'abus d'alcool est dangereux pour la santé, à consommer avec modération.", "Alcohol abuse is dangerous for your health. Please drink responsibly.", 'Alkoholmissbrauch gefährdet die Gesundheit. Bitte in Maßen genießen.'),

    # ---------------------------------------------------------------- drinks
    'dr.label': ('Au comptoir', 'At the bar', 'An der Theke'),
    'dr.title': ('Dans le verre', 'In the glass', 'Im Glas'),
    'dr.w.t': ('Les vins du Domaine Bernard Haas & Fils', 'Wines from Domaine Bernard Haas & Fils', 'Die Weine der Domaine Bernard Haas & Fils'),
    'dr.w.p': ("Pinot gris et pinot blanc des Côtes de Kaysersberg, riesling et gewurztraminer du Grand Cru Schlossberg. Au verre dès {p}, au pichet ou à la bouteille.",
               'Pinot gris and pinot blanc from the Côtes de Kaysersberg, riesling and gewurztraminer from the Schlossberg Grand Cru. By the glass from {p}, by the carafe or the bottle.',
               'Pinot gris und Pinot blanc von den Côtes de Kaysersberg, Riesling und Gewürztraminer vom Grand Cru Schlossberg. Im Glas ab {p}, in der Karaffe oder als Flasche.'),
    'dr.w.take': ('Les bouteilles en rayon se vendent aussi à emporter.', 'The bottles on our shelves are for sale to take away, too.', 'Die Flaschen im Regal gibt es auch zum Mitnehmen.'),
    'dr.w.link': ('La carte des vins', 'The wine list', 'Die Weinkarte'),
    'dr.w.alt': ("Les bouteilles du Domaine Bernard Haas sur l'étagère du restaurant, avec leurs étiquettes de prix en forme de cœur",
                 "Bottles from Domaine Bernard Haas on the restaurant's shelves, with heart-shaped price tags",
                 'Flaschen der Domaine Bernard Haas im Regal des Restaurants, mit herzförmigen Preisschildern'),
    'dr.b.t': ('La pression', 'On tap', 'Vom Fass'),
    'dr.b.p': ("Kaysers'bier blonde, blanche ou de saison, tirée au comptoir. En 25, 33 ou 50 cl.",
               "Kaysers'bier lager, wheat or seasonal, pulled at the bar. In 25, 33 or 50 cl.",
               "Kaysers'bier hell, weiß oder Saisonbier, frisch an der Theke gezapft. In 25, 33 oder 50 cl."),
    'dr.b.link': ('Les bières pression', 'Beers on tap', 'Die Biere vom Fass'),
    'dr.c.link': ('La carte des cocktails', 'The cocktail list', 'Die Cocktailkarte'),
    'dr.b.valt': ('Deux bières pression apportées du comptoir', 'Two draught beers brought over from the bar', 'Zwei frisch gezapfte Biere werden serviert'),
    'dr.c.t': ('Les cocktails', 'Cocktails', 'Die Cocktails'),
    'dr.c.p': ("Cocktail alsacien au crémant et au gewurztraminer, spritz, hugo, mojito. Et trois recettes sans alcool.",
               'The Alsatian cocktail with crémant and gewurztraminer, spritz, hugo, mojito. And three alcohol-free recipes.',
               'Elsässer Cocktail mit Crémant und Gewürztraminer, Spritz, Hugo, Mojito. Dazu drei alkoholfreie Rezepte.'),
    'dr.c.alt': ('Un plateau de cocktails aux pailles rayées', 'A tray of cocktails with striped straws', 'Ein Tablett mit Cocktails und gestreiften Strohhalmen'),

    # ---------------------------------------------------------------- the house
    'ho.label': ('La maison', 'The house', 'Das Haus'),
    'ho.t1': ('Des colombages dehors,', 'Half-timbering outside,', 'Fachwerk außen,'),
    'ho.t2': ('des voûtes en grès dedans', 'sandstone vaults inside', 'Sandsteingewölbe innen'),
    'ho.p1': ("Le 119 occupe une maison à colombages de la rue principale. On s'installe en terrasse, sur les pavés, ou à l'intérieur : banquettes rouges, mur végétal et, quelques marches plus bas, une salle sous les arches de grès.",
              'Au 119 sits in a half-timbered house on the main street. Take a table on the terrace, right on the cobbles, or inside: red banquettes, a green wall and, a few steps down, a room beneath sandstone arches.',
              'Das 119 liegt in einem Fachwerkhaus an der Hauptstraße. Platz nehmen Sie auf der Terrasse, direkt auf dem Kopfsteinpflaster, oder drinnen: rote Sitzbänke, eine Pflanzenwand und, ein paar Stufen tiefer, ein Raum unter Sandsteinbögen.'),
    'ho.p2': ("C'est une affaire de famille. On vous y accueille comme à la maison, et la carte se lit aussi en anglais et en allemand.",
              "It's a family business. You're welcomed as you would be at home, and the menu comes in English and German too.",
              'Ein Familienbetrieb. Hier werden Sie empfangen wie zu Hause, und die Karte gibt es auch auf Englisch und Deutsch.'),
    'ho.f1a': ('Terrasse', 'Terrace', 'Terrasse'),
    'ho.f1b': ('sur les pavés de la rue principale', 'on the cobbles of the main street', 'auf dem Pflaster der Hauptstraße'),
    'ho.f2a': ('Deux salles', 'Two rooms', 'Zwei Räume'),
    'ho.f2b': ('banquettes rouges et voûtes en grès', 'red banquettes and sandstone vaults', 'rote Sitzbänke und Sandsteingewölbe'),
    'ho.f3a': ('En famille', 'With the family', 'Mit der Familie'),
    'ho.f3b': ('une carte pour les petits… et les grands', 'a menu for little ones… and grown-ups', 'eine Karte für Kleine… und Große'),
    'ho.hint': ('Faites glisser pour visiter', 'Drag to look around', 'Zum Umsehen ziehen'),
    'g1': ('La salle voûtée', 'The vaulted room', 'Der Gewölberaum'),
    'ho.valt': ("La salle voûtée vue à travers l'arche en grès", 'The vaulted room seen through the sandstone arch', 'Der Gewölberaum, durch den Sandsteinbogen gesehen'),
    'g2': ('Les banquettes rouges', 'The red banquettes', 'Die roten Sitzbänke'),
    'g3': ('La terrasse, sous le store rouge', 'The terrace, under the red awning', 'Die Terrasse unter der roten Markise'),
    'g4': ("L'entrée et ses vins", 'The entrance and its wines', 'Der Eingang mit seinen Weinen'),
    'g5': ('La salle rouge', 'The red room', 'Der rote Raum'),
    'g6': ('Vue à travers le grès', 'A view through the sandstone', 'Blick durch den Sandstein'),
    'g7': ("L'horloge de la salle", 'The dining-room clock', 'Die Uhr im Gastraum'),
    'g8': ('Le mur des paniers', 'The wall of baskets', 'Die Korbwand'),
    'g9': ("L'origine des viandes, à l'ardoise", 'Where the meat comes from, on the slate', 'Die Herkunft des Fleisches, auf der Tafel'),

    # ---------------------------------------------------------------- find us
    'fi.label': ('Nous trouver', 'Find us', 'So finden Sie uns'),
    'fi.t1': ('Sur la rue principale,', 'On the main street,', 'An der Hauptstraße,'),
    'fi.t2': ('à deux pas du pont fortifié', 'steps from the fortified bridge', 'gleich bei der Wehrbrücke'),
    'fi.addr': ('Adresse', 'Address', 'Adresse'),
    'fi.hours': ('Horaires', 'Opening hours', 'Öffnungszeiten'),
    'fi.hours.v': ('10 h – 18 h, service continu', '10 am – 6 pm, non-stop', '10 – 18 Uhr, durchgehend'),
    'fi.hours.d': ('Tous les jours en saison', 'Every day in season', 'In der Saison täglich'),
    'fi.book': ('Réservation', 'Bookings', 'Reservierung'),
    'fi.book.d': ("Un coup de fil et c'est réservé", 'One call and your table is booked', 'Ein Anruf genügt'),
    'fi.route': ("Ouvrir l'itinéraire", 'Get directions', 'Route öffnen'),
    'fi.reviews': ('Lire les avis sur Google', 'Read the reviews on Google', 'Bewertungen auf Google lesen'),
    'fi.sign.t': ("Repérez l'enseigne", 'Look for the sign', 'Achten Sie auf das Schild'),
    'fi.sign.p': ("Une Alsacienne en fer forgé, le plateau à la main, juste au-dessus de la terrasse. C'est là.",
                  'An Alsatian waitress in wrought iron, tray in hand, right above the terrace. That is us.',
                  'Eine Elsässerin aus Schmiedeeisen, das Tablett in der Hand, direkt über der Terrasse. Da sind wir.'),
    'fi.sign.alt': ("L'enseigne en fer forgé « Restaurant Brasserie » avec la serveuse alsacienne", 'The wrought-iron "Restaurant Brasserie" sign with the Alsatian waitress', 'Das schmiedeeiserne Schild „Restaurant Brasserie“ mit der Elsässer Kellnerin'),
    'fi.mascot.alt': ("La mascotte du 119 : une serveuse alsacienne au grand nœud rouge", 'The Au 119 mascot: an Alsatian waitress with a big red bow', 'Das Maskottchen des 119: eine Elsässer Kellnerin mit großer roter Schleife'),
    'fi.line': ('La rue principale, de bas en haut', 'The main street, bottom to top', 'Die Hauptstraße hinauf'),
    'fi.p.p1': ('Parking P1 Vieille ville', 'Car park P1 Vieille ville', 'Parkplatz P1 Vieille ville'),
    'fi.p.ot': ('Office de tourisme', 'Tourist office', 'Tourismusbüro'),
    'fi.p.eg': ('Église Sainte-Croix', 'Sainte-Croix church', 'Kirche Sainte-Croix'),
    'fi.p.pt': ('Pont fortifié', 'Fortified bridge', 'Wehrbrücke'),
    'fi.p.sc': ('Centre Schweitzer', 'Centre Schweitzer', 'Centre Schweitzer'),
    'fi.p.here': ('Vous y êtes', 'You are here', 'Sie sind da'),
    'min': ('min', 'min', 'Min.'),

    # ---------------------------------------------------------------- footer
    'fo.tag': ('Tartes flambées à toute heure, cuisine maison, vins du coin.', 'Tartes flambées all day, home cooking, local wines.', 'Flammkuchen durchgehend, hausgemachte Küche, Weine von nebenan.'),
    'fo.kind': ('Restaurant · Brasserie · Kaysersberg', 'Restaurant · Brasserie · Kaysersberg', 'Restaurant · Brasserie · Kaysersberg'),
    'fo.credit': ('Site réalisé par', 'Website by', 'Website von'),

    # ---------------------------------------------------------------- page introuvable (404.html, une seule page pour les trois langues)
    'nf.title': ('Page introuvable', 'Page not found', 'Seite nicht gefunden'),
    'nf.h': ("Cette page n'est plus à la carte.", 'This page is off the menu.', 'Diese Seite steht nicht mehr auf der Karte.'),
    'nf.home': ("Retour à l'accueil", 'Back to the home page', 'Zur Startseite'),
}

NUMBERS = {'fr': ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze'],
           'en': ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
           'de': ['null', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf']}

LANGS = ['fr', 'en', 'de']
LANG_NAMES = {'fr': 'Français', 'en': 'English', 'de': 'Deutsch'}
LANG_PATH = {'fr': '/', 'en': '/en/', 'de': '/de/'}


def strings(lang):
    i = LANGS.index(lang)
    return {k: v[i] for k, v in S.items()}
