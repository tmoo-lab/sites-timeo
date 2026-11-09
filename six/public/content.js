/* SIX — contenu pédagogique. Tout ce que l'app affiche vient d'ici. */
window.SIX_CONTENT = (function () {
  'use strict';

  /* ---------- Guitare : accords ----------
     frets : cordes de la plus grosse (Mi grave, 6) à la plus fine (Mi aigu, 1)
     -1 = X (ne pas jouer), 0 = à vide, n = case
     fingers : 0 = rien, 1 index, 2 majeur, 3 annulaire, 4 auriculaire
     notes : fréquences de chaque corde telle que jouée (pour l'écoute) */
  const CHORDS = {
    Em: { name: 'Mi mineur', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0],
      notes: [82.41, 123.47, 164.81, 196.0, 246.94, 329.63],
      place: ['Majeur (2) sur la corde La, case 2', 'Annulaire (3) sur la corde Ré, case 2, juste à côté', 'Les quatre autres cordes restent à vide', 'Tu grattes les 6 cordes'],
      errors: ['Le doigt qui touche la corde Sol par en dessous : elle ne sonne plus et l’accord devient bizarre. Mets les doigts bien sur le bout, pliés comme des crochets.', 'Doigts trop loin de la barrette (la frette) : ça grésille. Colle-les juste derrière.'],
      feel: 'C’est l’accord le plus facile de la guitare. Deux doigts, six cordes qui sonnent. Commence par lui.' },
    Am: { name: 'La mineur', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
      notes: [0, 110.0, 164.81, 220.0, 261.63, 329.63],
      place: ['Index (1) sur la corde Si, case 1', 'Majeur (2) sur la corde Ré, case 2', 'Annulaire (3) sur la corde Sol, case 2', 'Tu grattes 5 cordes : tu évites la plus grosse (le X)'],
      errors: ['Gratter la grosse corde Mi : ça sonne faux. Commence ton geste sur la corde La.', 'L’index trop à plat qui étouffe la corde Mi aigu. Sur le bout du doigt.'],
      feel: 'C’est exactement la forme du Em, décalée d’une corde vers les aiguës, plus l’index. Si tu sais faire Em, tu sais presque faire Am.' },
    C: { name: 'Do majeur', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
      notes: [0, 130.81, 164.81, 196.0, 261.63, 329.63],
      place: ['Index (1) sur la corde Si, case 1', 'Majeur (2) sur la corde Ré, case 2', 'Annulaire (3) sur la corde La, case 3', 'Tu grattes 5 cordes, pas la plus grosse'],
      errors: ['L’annulaire qui touche la corde Ré : elle ne sonne plus. Les doigts en escalier, bien arqués.', 'Le majeur qui touche la corde Sol. Même remède : sur le bout, arqué.', 'C’est l’accord qui demande le plus d’écart au début. Normal que ça tire deux semaines.'],
      feel: 'Depuis Am, seul l’annulaire bouge : il passe de la corde Sol (case 2) à la corde La (case 3). Index et majeur ne bougent pas. C’est le secret du changement Am → C.' },
    G: { name: 'Sol majeur', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
      notes: [98.0, 123.47, 146.83, 196.0, 246.94, 392.0],
      place: ['Majeur (2) sur la grosse corde Mi, case 3', 'Index (1) sur la corde La, case 2', 'Annulaire (3) sur la corde Mi aigu, case 3', 'Tu grattes les 6 cordes'],
      errors: ['L’annulaire qui n’appuie pas assez sur la petite corde : elle grésille. Appuie juste derrière la frette.', 'Au début la main se crispe à cause de l’écart. Secoue-la entre deux essais.'],
      feel: 'Le plus grand écart des quatre. Version facile au début : garde juste majeur et annulaire (grosse et petite corde), et laisse l’index levé. Si la corde La sonne à vide, pas grave au début.' }
  };

  /* Ordre dans lequel les apprendre et pourquoi */
  const CHORD_ORDER = ['Em', 'Am', 'C', 'G'];

  /* Rythme « Old Faithful » : 8 demi-temps, B = bas, H = haut, · = rien (la main continue de bouger sans toucher) */
  const STRUM = { name: 'Le rythme de base', slots: ['B', '·', 'B', 'H', '·', 'H', 'B', 'H'], count: ['1', '&', '2', '&', '3', '&', '4', '&'],
    tips: ['Ta main droite fait toujours bas-haut-bas-haut, comme un métronome, même quand elle ne touche pas les cordes. C’est ça le secret : le bras ne s’arrête jamais, c’est juste que parfois il frôle à vide.',
      'Compte à voix haute « 1 et 2 et 3 et 4 et ». Les chiffres c’est vers le bas, les « et » c’est vers le haut.',
      'Commence lent, 60 battements par minute, sur un seul accord. Quand c’est automatique, ajoute les changements.'] };

  /* La boucle de Freakin’ Out */
  const SONG = { title: 'Freakin’ Out', artist: 'Dexter and The Moonrocks', bpm: 124, loop: ['C', 'Am', 'Em', 'G'], beatsPerChord: 4,
    notes: ['Toute la chanson tourne sur la même boucle de quatre accords, un accord par mesure de quatre temps : C, Am, Em, G, et on recommence.',
      'La grille complète (couplets, refrain) est sur Ultimate Guitar en tapant « Freakin Out Dexter chords », et les paroles sont dans Spotify (icône paroles sur la chanson). Je ne peux pas les recopier ici, c’est protégé.',
      'Spotify permet de ralentir la chanson (menu … puis « Modifier la vitesse du titre »). Joue par-dessus à 0,8 d’abord.'] };

  /* ---------- Front lever ---------- */
  const FL_PALIERS = [
    { id: 0, n: 'Tuck', short: 'Genoux à la poitrine', hold: '3 × 10 s', when: '2 à 4 semaines',
      how: 'Suspendu à la barre, bras tendus. Tu ramènes les genoux contre la poitrine et tu tires les épaules vers le bas et l’arrière jusqu’à ce que ton dos soit parallèle au sol. Le dos reste rond, c’est normal à ce palier.',
      cue: 'Pense « je tire la barre vers mes hanches ». Les coudes ne plient jamais.' },
    { id: 1, n: 'Tuck avancé', short: 'Dos plat, genoux pliés', hold: '3 × 10 s', when: '1 à 2 mois',
      how: 'Même chose, mais tu ouvres les hanches à 90° : les cuisses pointent vers le bas, les genoux restent pliés, et surtout le dos devient plat, aligné avec les épaules. C’est le palier qui apprend la vraie position.',
      cue: 'Bassin rétroversé (comme si tu rentrais le coccyx), côtes rentrées. Si les hanches tombent, tu es revenu au tuck.' },
    { id: 2, n: 'Une jambe', short: 'Une jambe tendue, l’autre pliée', hold: '3 × 10 s', when: 'vers 3 mois',
      how: 'Depuis le tuck avancé, tu tends une jambe dans l’axe du corps, l’autre reste pliée. Change de jambe à chaque série. Déjà très impressionnant vu de l’extérieur.',
      cue: 'La jambe tendue doit être dans le prolongement du dos, pas plus haute, pas plus basse. Pointe le pied.' },
    { id: 3, n: 'Straddle', short: 'Jambes tendues écartées', hold: '3 × 10 s', when: 'vers 5 ou 6 mois',
      how: 'Les deux jambes tendues, écartées en V. Plus elles sont écartées, plus c’est facile (le levier est plus court). Tu resserres au fil des semaines.',
      cue: 'Serre les fesses et les quadriceps à fond : des jambes molles pèsent deux fois plus lourd.' },
    { id: 4, n: 'Full', short: 'Le corps en une ligne', hold: '3 × 5 s', when: '6 à 12 mois selon ton gabarit',
      how: 'Le corps entier en une ligne horizontale, des mains aux pieds. C’est la figure.',
      cue: 'Tout le corps est contracté, du bout des doigts aux orteils. Et tu respires quand même.' }
  ];

  const FL_SESSION = {
    warmup: ['Rotations d’épaules, 10 dans chaque sens', 'Scapular pull-ups : suspendu bras tendus, tu montes et descends juste les épaules, 2 × 8', 'Un hold facile de 5 s au palier précédent'],
    protocol: 'Cinq séries au palier en cours. Tu lâches deux secondes avant que la forme ne casse, jamais après. 90 secondes de repos entre les séries, montre en main, c’est le minuteur ci-dessous qui s’en occupe.',
    negatives: 'Ensuite trois descentes lentes : tu pars tête en bas (position inversée, jambes groupées) et tu descends en 5 secondes jusqu’à l’horizontale, puis tu lâches. C’est l’exercice qui fait le plus progresser.',
    accessories: ['Sur tes jours dos : pull-over à la poulie bras tendus, 3 × 12. C’est exactement le mouvement du front lever, en version musculation.', 'Hollow body hold au sol, 3 × 30 à 45 s. C’est la position du tronc que tu dois tenir en l’air.', 'Garde tes tractions lestées, elles paient directement.'],
    safety: ['Bras tendus sous charge, ça tire sur les tendons des biceps et l’intérieur des coudes. Ces tissus se renforcent plus lentement que les muscles : jamais deux jours de suite, et si ça tire au coude au lieu du dos, tu réduis.', 'Jamais de hold en début de séance sans échauffement des épaules.', 'Si tu sens le bas du dos, c’est que le hollow est perdu : reviens au palier d’avant.'],
    film: 'Pose le téléphone au sol ou sur un banc, à 3 ou 4 mètres, exactement de profil, à hauteur de tes hanches. C’est le seul angle où on voit si les hanches sont à la bonne hauteur. Filme toutes les deux semaines, même palier, même angle.'
  };

  /* ---------- Tourniquet (French drop) ---------- */
  const MAGIC_STEPS = [
    { n: 'La position de départ', t: 'Main gauche paume vers le haut, à hauteur de la poitrine. La pièce est tenue par la tranche entre le pouce et le bout de l’index et du majeur. Elle est bien visible, le public la voit. Main droite ouverte et détendue, à côté, un peu plus haut.', focus: 'Tiens la pièce du bout des doigts, pas enfoncée dans la paume. Il faut qu’elle puisse tomber.' },
    { n: 'Le vrai geste, dix fois', t: 'La main droite vient par-dessus prendre la pièce : le pouce droit passe sous la pièce, les doigts droits se referment dessus, et la main droite repart en poing fermé vers la droite. La main gauche reste ouverte, vide.', focus: 'Fais-le vraiment dix fois devant le miroir et regarde à quoi ça ressemble. C’est exactement cette image que le faux geste devra reproduire.' },
    { n: 'Le faux geste', t: 'Même mouvement, même vitesse. Mais à l’instant où les doigts droits couvrent la pièce, le pouce gauche la lâche : elle tombe de quelques millimètres dans le creux de la main gauche, retenue par la base des doigts repliés. La main droite se referme sur du vide et repart en poing, comme si elle avait la pièce.', focus: 'La chute est cachée par les doigts de la main droite. C’est pour ça que le public doit être en face de toi, jamais sur ta gauche ni au-dessus.' },
    { n: 'La main gauche devient invisible', t: 'Tes yeux, ta tête et même tes épaules suivent le poing droit. Les gens regardent là où tu regardes. Pendant ce temps la main gauche descend naturellement le long du corps ou se pose sur la table, doigts légèrement courbés.', focus: 'Une main crispée dit « je cache quelque chose ». Une main molle dit « je suis vide ». Ta main gauche doit être molle.' },
    { n: 'La disparition', t: 'Tu frottes le bout des doigts de la main droite l’un contre l’autre, tu souffles dessus, puis tu ouvres lentement, doigt par doigt. Vide.', focus: 'Laisse une vraie seconde de silence. C’est là que le cerveau des gens bugue.' },
    { n: 'La réapparition', t: 'Avec la main gauche, qui tient toujours la pièce dans le creux, tu vas la chercher derrière l’oreille de quelqu’un, dans la poche de sa veste ou sous son verre. Au moment où ta main arrive, tu pousses la pièce au bout des doigts avec le pouce et tu la ressors.', focus: 'C’est ce moment que les gens retiennent. Prends ton temps.' }
  ];
  const MAGIC_CHECK = ['Le vrai et le faux geste ont la même vitesse', 'La main droite se referme au même endroit dans les deux cas', 'Le regard part avec le poing droit', 'La main gauche descend molle, sans se crisper', 'Le public est en face, pas à gauche, pas au-dessus', 'Une seconde de silence avant d’ouvrir la main', 'La pièce ressort d’un endroit précis, pas « de nulle part »', 'Jamais deux fois devant le même public', 'On ne révèle jamais le truc'];

  /* ---------- Chanson par cœur ---------- */
  const SONG_MEMO = {
    structure: ['Intro (la boucle des 4 accords, deux fois)', 'Couplet 1', 'Refrain', 'Couplet 2', 'Refrain', 'Pont', 'Refrain final'],
    plan: ['Commence par le refrain : il revient trois fois, donc c’est 60 % de la chanson pour 20 % du travail.', 'Écoute passive dans la journée (en marchant, en cuisinant), puis le soir tu la chantes sans guitare, paroles cachées.', 'Le test : paroles fermées, tu chantes. Chaque trou que tu combles de mémoire s’imprime dix fois mieux qu’une relecture.', 'Les paroles sont dans Spotify (icône paroles) : lis-les une fois, puis cache.']
  };

  /* ---------- Italien ---------- */
  const ITALIAN = {
    intervals: [0, 1, 3, 7, 14],
    tips: ['10 mots par jour : 5 nouveaux, 5 anciens qui reviennent. Cinq minutes.', 'Toujours du français vers l’italien, à voix haute. Reconnaître un mot c’est facile, le produire c’est le savoir.', 'Un mot en phrase reste. « Il caffè » tout seul s’évapore, « prendo un caffè » tient.', 'Un mot est acquis quand tu l’as sorti de mémoire quatre fois espacées (J+1, J+3, J+7, J+14).'],
    starter: [['bonjour', 'buongiorno'], ['merci', 'grazie'], ['s’il te plaît', 'per favore'], ['je voudrais un café', 'vorrei un caffè'], ['où est la gare ?', 'dov’è la stazione?'], ['combien ça coûte ?', 'quanto costa?'], ['je ne comprends pas', 'non capisco'], ['plus lentement', 'più lentamente'], ['l’addition', 'il conto'], ['à demain', 'a domani']]
  };

  /* ---------- JJB ---------- */
  const JJB = {
    club: 'Behring Jiu-Jitsu Alsace', place: 'Pôle des Arts Martiaux, rue Sainte-Odile, 68920 Wintzenheim', site: 'https://bjjalsace.fr/', fb: 'https://www.facebook.com/BehringAlsace', mail: 'behringalsace@gmail.com',
    maps: 'https://maps.google.com/?q=P%C3%B4le+des+Arts+Martiaux+rue+Sainte-Odile+Wintzenheim',
    hours: [['Lundi', '20h-22h', 'Jiu-Jitsu Brésilien (Gi, kimono)'], ['Mercredi', '20h-22h', 'Jiu-Jitsu Brésilien (Gi, kimono)'], ['Jeudi', '19h-21h', 'Grappling (No-Gi)'], ['Dimanche', '10h-12h', 'Grappling (No-Gi)']],
    message: 'Objet : Cours d’essai grappling (débutant)\n\nBonjour,\n\nJe m’appelle Timéo, j’ai jamais fait de jiu-jitsu ni de sport de combat mais ça me tente depuis un moment. Je m’entraîne déjà en salle plusieurs fois par semaine donc le physique suit, par contre niveau technique je pars de zéro.\n\nEst-ce qu’il serait possible de venir faire un cours d’essai ? J’ai vu que vous aviez du grappling No-Gi le jeudi soir, ça me semble le plus simple pour une première fois. Si un autre créneau est mieux pour un débutant, je m’adapte.\n\nMerci d’avance,\nTiméo',
    bring: ['T-shirt ou rashguard', 'Short sans poches ni fermeture éclair', 'Claquettes pour le bord du tatami', 'Bouteille d’eau', 'Ongles coupés'],
    first: ['Tu vas te faire soumettre quinze fois par des gens plus légers que toi. C’est le programme, pas un échec.', 'Tape (deux fois sur le partenaire ou le sol) dès que ça serre. Tôt. L’ego ne sert à rien le premier mois.', 'Après chaque cours, note une seule technique que tu as retenue. C’est ce qui fait la différence entre dix cours et dix cours utiles.']
  };

  /* ---------- Méthodes ---------- */
  const METHODS = [
    ['Pratique espacée', 'Ebbinghaus · Cepeda 2006', '15 min par jour battent 2 h le dimanche. Le cerveau consolide pendant le sommeil, donc chaque nuit entre deux séances travaille pour toi.', 'Guitare et italien tous les jours, front lever un jour sur deux.'],
    ['Rappel actif', 'Roediger & Karpicke 2006', 'Se tester, pas relire. Sortir une info de mémoire la grave bien plus fort que la revoir, même quand on se trompe.', 'Paroles cachées, mots du français vers l’italien à voix haute, accord formé sans regarder le schéma.'],
    ['Répétition espacée', 'Leitner · SM-2', 'Revoir juste avant d’oublier. J+1, J+3, J+7, J+14, puis le mot est à toi pour de bon.', 'La boîte de mots italiens de l’app fait exactement ça.'],
    ['Interleaving', 'Bjork · difficultés désirables', 'Mélanger au lieu de répéter en bloc. C’est plus dur sur le moment, et c’est justement pour ça que ça tient.', 'Alterner les paires d’accords, alterner vrai geste et faux geste, enchaîner 4 compétences dans une séance.'],
    ['Pratique délibérée', 'Ericsson 1993', 'Viser un point faible précis, avec un feedback immédiat, juste au-dessus de ton niveau. Pas « je m’entraîne » mais « aujourd’hui je règle les hanches qui tombent ».', 'Un seul cue par séance de front lever. Le chrono d’une minute à la guitare.'],
    ['Chunking', 'Miller · Chase & Simon', 'Découper en morceaux qu’on maîtrise puis qu’on enchaîne. Une chanson c’est deux sections, un tour c’est six étapes, un front lever c’est cinq paliers.', 'Les paliers de chaque quête sont les chunks. On ne passe au suivant que quand l’actuel tient.'],
    ['Vidéo = vérité', 'Feedback augmenté', 'Tes sensations mentent, la caméra non. Un palier filmé est un palier réel.', 'La caméra est intégrée : front lever de profil, tourniquet de face, guitare à vitesse réelle.'],
    ['La règle des 2 minutes', 'Fogg · Clear', 'Un jour sans énergie, tu fais 2 minutes. La chaîne tient, l’habitude aussi, et souvent les 2 minutes deviennent 15.', 'Le bouton « 2 minutes » sur l’écran du jour.'],
    ['Le joker', 'Jamais deux jours de suite', 'Un jour sans rien ne casse pas ta série. Deux oui. Les tendons et le cerveau veulent du repos, la discipline veut de la continuité.', 'La série compte les jours actifs et tolère un jour blanc entre deux.'],
    ['Intention d’implémentation', 'Gollwitzer 1999', '« Quand X, alors Y. » Décider à l’avance du signal qui déclenche l’action marche deux à trois fois mieux qu’une bonne intention.', 'Quand la notif de 6h sonne, j’ouvre SIX. Quand je rentre de la salle, je prends la guitare.'],
    ['Performance = test', 'Récupération sous pression', 'Un palier n’existe que filmé ou devant quelqu’un. Le stress du public est le vrai examen, et il se travaille.', 'Les derniers paliers de la guitare, du tourniquet et de la chanson sont tous « devant quelqu’un ».'],
    ['Visualisation', 'Pratique mentale', '2 minutes les yeux fermés à te voir réussir le geste, en détail. Mesuré sur la force comme sur la précision.', 'Avant les holds de front lever, avant le tourniquet.']
  ];

  /* ---------- Quêtes : paliers (ce qui donne les XP) ---------- */
  const QUESTS = {
    frontlever: { name: 'Front lever', eyebrow: 'Calisthénie · 3 fois par semaine', color: 'fl',
      paliers: FL_PALIERS.map(p => ({ n: p.n, d: p.short + ' · ' + p.hold })),
      rule: 'Un palier compte quand il est filmé de profil, hanches à hauteur des épaules.' },
    guitare: { name: 'Guitare', eyebrow: 'Freakin’ Out · Dexter and The Moonrocks',
      paliers: [{ n: 'Em et Am propres', d: 'Chaque corde sonne, 20 changements en 1 min' }, { n: 'Les 4 accords', d: 'C et G aussi, 15 changements Am ↔ C' }, { n: 'La boucle en rythme', d: 'C Am Em G, métronome à 60, sans arrêt' }, { n: 'Par-dessus la chanson à 0,8', d: 'Couplet + refrain d’un bout à l’autre' }, { n: 'Vitesse réelle', d: '124 BPM, filmée' }, { n: 'Jouée devant quelqu’un', d: 'C’est ça qui valide. Ensuite Bad State of Mind, mêmes accords' }],
      rule: 'Tu changes d’accord sur le dernier coup même si c’est moche. On ne s’arrête jamais pour corriger.' },
    chanson: { name: 'Chanson par cœur', eyebrow: 'Freakin’ Out · à partir de la semaine 3',
      paliers: [{ n: 'Le refrain', d: 'Sans regarder les paroles' }, { n: 'Toute la chanson', d: 'Couplets compris, paroles cachées' }, { n: 'Chantée en jouant', d: 'Guitare et voix en même temps' }],
      rule: 'Pour apprendre par cœur, on se teste, on ne relit pas.' },
    italien: { name: 'Italien', eyebrow: '200 mots · déjà en cours', counter: true,
      rule: 'Un mot compte quand tu le sors de mémoire, en phrase, sans aide.' },
    jjb: { name: 'Jiu-jitsu brésilien', eyebrow: 'Nouveau sport · Behring Jiu-Jitsu Alsace',
      paliers: [{ n: 'Message envoyé au club', d: 'behringalsace@gmail.com ou le formulaire du site' }, { n: 'Cours d’essai fait', d: 'Grappling No-Gi, jeudi 19h ou dimanche 10h' }, { n: 'Inscrit', d: 'Le kimono viendra plus tard' }, { n: '10 cours', d: 'Le moment où on commence à comprendre quelque chose' }],
      rule: 'Le but de l’essai c’est d’y aller, pas d’être bon.' },
    magie: { name: 'Tour de magie', eyebrow: 'Le tourniquet · pièce de 2 €',
      paliers: [{ n: 'Faux geste invisible au miroir', d: 'Tu ne vois plus la différence toi-même' }, { n: 'Propre en vidéo', d: 'Filmé de face, la main gauche reste molle' }, { n: 'Réussi devant ta copine', d: 'Premier vrai public' }, { n: 'Réussi devant 3 publics différents', d: 'Là tu sais le faire' }],
      rule: 'Jamais deux fois devant le même public. Jamais révélé.' }
  };
  const QORDER = ['frontlever', 'guitare', 'chanson', 'italien', 'jjb', 'magie'];

  const DRILL_TARGETS = { 'Em-Am': 20, 'Am-C': 15, 'C-G': 12, 'Em-G': 15, 'Am-Em': 20 };
  const BOSSES = ['Filme ton test tuck front lever et joue 20 changements Em ↔ Am en une minute', 'La boucle C Am Em G, quatre tours sans t’arrêter, métronome à 60', 'Le tourniquet devant quelqu’un, sans te faire griller', 'Freakin’ Out en entier à 0,8 par-dessus Spotify', 'Freakin’ Out à vitesse réelle, filmée', 'Freakin’ Out devant quelqu’un, refrain par cœur'];
  const EXTRA = ['Valide un palier filmé, celui que tu veux', 'Bad State of Mind en entier, mêmes accords que Freakin’ Out', 'Un cours de JJB de plus, et tu notes une technique que tu as retenue', 'Le tourniquet devant un public que tu ne connais pas'];

  /* Recherches YouTube toutes prêtes (ouvre YouTube, pas intégrées) */
  const YT = {
    fl: 'front lever progression tutorial tuck advanced tuck straddle',
    flneg: 'front lever negatives tutorial',
    chords: 'JustinGuitar E minor A minor C G chord beginner',
    strum: 'JustinGuitar old faithful strumming pattern',
    change: 'guitar chord changes one minute changes beginner',
    drop: 'french drop coin vanish tutorial slow motion',
    song: 'Freakin Out Dexter and the Moonrocks guitar chords tutorial'
  };

  return { CHORDS, CHORD_ORDER, STRUM, SONG, FL_PALIERS, FL_SESSION, MAGIC_STEPS, MAGIC_CHECK, SONG_MEMO, ITALIAN, JJB, METHODS, QUESTS, QORDER, DRILL_TARGETS, BOSSES, EXTRA, YT };
})();
