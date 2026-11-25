#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère le site du 119 (fr, en, de) dans ../public à partir du gabarit et des contenus.
Usage :  python3 build.py            -> aperçu (non indexé par Google)
         python3 build.py --live     -> version à mettre sur le vrai domaine (indexable)"""
import json, os, re, shutil, sys, time
from jinja2 import Environment, FileSystemLoader, select_autoescape
from markupsafe import Markup, escape
import menu as M
import strings as ST

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.join(HERE, '..', 'public')
LIVE = '--live' in sys.argv
PREVIEW_URL = 'https://au119-kaysersberg.netlify.app'   # adresse de l'aperçu (cartes de partage)
SHARE_URL = ST.SITE_URL if LIVE else PREVIEW_URL
VER = time.strftime('%Y%m%d%H%M')
NB = '\u00a0'   # espace insécable


def price(v, lang):
    """20 -> '20 €' / '€20' ; 3.5 -> '3,50 €' / '€3.50'."""
    s = ('%d' % v) if float(v).is_integer() else ('%.2f' % v)
    if lang == 'en': return '€' + s
    return s.replace('.', ',') + NB + '€'


def price2(v, lang):
    """Toujours deux décimales, pour les tableaux (bières, vins). Case vide : tiret."""
    if v is None: return '—'
    s = '%.2f' % v
    if lang == 'en': return '€' + s
    return s.replace('.', ',') + NB + '€'


def typo(s, lang):
    """Finitions typographiques : apostrophes courbes, espaces insécables (unités, ponctuation française, heures)."""
    s = s.replace("'", '’')
    s = re.sub(r'(?<=[\d¼½]) (?=(?:€|cl|g|h|l|min|Min\.|Uhr|am|pm)(?![\w]))', NB, s)       # 22 €, 33 cl, 10 h, 8 min, 6 pm
    s = re.sub(r'(?<=[\dhm]) – (?=\d)', NB + '–' + NB, s)                                    # 10 h – 18 h
    s = re.sub(r'(?<=h) (?=\d\d\b)', NB, s)                                                  # 11 h 53
    s = re.sub(r'\+ (?=\d)', '+' + NB, s)                                                    # + 1,50 €
    s = s.replace(' · ', NB + '· ')                                                           # jamais de point médian en début de ligne
    if lang == 'fr':
        s = re.sub(r' (?=[:;?!»])', NB, s).replace('« ', '«' + NB)
    return s


def deep(o, f):
    """Applique f à toutes les chaînes d'une structure (dictionnaires, listes, tuples)."""
    if isinstance(o, str): return f(o)
    if isinstance(o, dict): return {k: (v if k in ('id', 'tab') else deep(v, f)) for k, v in o.items()}
    if isinstance(o, (list, tuple)): return type(o)(deep(v, f) for v in o)
    return o


def jsonld(t, lang):
    return json.dumps({
        '@context': 'https://schema.org', '@type': 'Restaurant', 'name': 'Au 119',
        'description': t['meta.desc'], 'url': ST.SITE_URL + ST.LANG_PATH[lang], 'image': ST.SITE_URL + '/og.jpg',
        'telephone': ST.PHONE_INTL, 'servesCuisine': ['Alsacienne', 'Française'], 'priceRange': '€€',
        'acceptsReservations': 'True', 'hasMenu': ST.SITE_URL + ST.LANG_PATH[lang] + '#carte',
        'address': {'@type': 'PostalAddress', 'streetAddress': '119 rue du Général de Gaulle', 'postalCode': '68240',
                    'addressLocality': 'Kaysersberg Vignoble', 'addressRegion': 'Alsace', 'addressCountry': 'FR'},
        'geo': {'@type': 'GeoCoordinates', 'latitude': 48.1403445, 'longitude': 7.2597468},
        'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification',
                                       'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                                       'opens': '10:00', 'closes': '18:00'}],
        'hasMap': ST.MAPS_PLACE,
    }, ensure_ascii=False)


def rel_links(lang):
    """Liens relatifs entre langues (le site marche aussi dans un sous-dossier)."""
    up = '' if lang == 'fr' else '../'
    return {'fr': up or './', 'en': up + 'en/', 'de': up + 'de/'}


def context(lang):
    T = lambda o: deep(o, lambda x: typo(x, lang))
    t = ST.strings(lang)
    # prix repris de la carte (un seul endroit à modifier : menu.py)
    px = dict(royale=M.find('specialites', 'Choucroute royale'), classique=M.find('specialites', 'Choucroute alsacienne'),
              jarret=M.find('specialites', 'Jarret de porc braisé, frites'), baeckeoffe=M.find('specialites', 'Baeckeoffe'),
              quiche=M.find('specialites', 'Quiche'), filet=M.find('viandes', 'Filet de bœuf'), burger=M.find('burgers', 'Alsacien'),
              gaufre=min(i['price'] for c in M.FOOD if c['id'] == 'gaufres' for i in c['items']),
              vin=min(r[1][0] for g in M.WINES['groups'] for r in g[1]))
    tartes = M.tartes()
    n = ST.NUMBERS[lang][len(tartes)]
    t['dr.w.p'] = t['dr.w.p'].replace('{p}', price(px['vin'], lang))
    for k in ('tf.p', 'tf.list'): t[k] = t[k].replace('{n}', n)
    t = T(t)
    plates = [
        dict(img='jarret', big=900, name=t['c2.n'], desc=t['c2.d'], price=px['jarret'], fr=False),
        dict(img='baeckeoffe', big=900, name=t['c4.n'], desc=t['c4.d'], price=px['baeckeoffe'], fr=False),
        dict(img='quiche', big=900, name=t['c5.n'], desc=t['c5.d'], price=px['quiche'], fr=False),
        dict(img='filet', big=900, name=t['c6.n'], desc=t['c6.d'], price=px['filet'], fr=False),
        dict(img='burger', big=900, name=t['c7.n'], desc=t['c7.d'], price=px['burger'], fr=False),
        dict(img='gaufre', big=900, name=t['c8.n'], desc=t['c8.d'], price=px['gaufre'], fr=True),
    ]
    plates = [p for p in plates if p['price'] is not None]          # un plat retiré de la carte disparaît aussi de la bande
    for p in plates: p['alt'] = p['name'] + ' — ' + p['desc']
    marquee = [dict(img=k, name=t['mq.' + k]) for k in ('choucroute', 'tarte', 'jarret', 'baeckeoffe', 'gaufre', 'bieres', 'vins')]
    sp, sl = '(min-width: 900px) 28vw, 72vw', '(min-width: 900px) 50vw, 92vw'
    gallery = [
        dict(img='salle', kind='p', widths=[600, 1000], w=1000, h=1250, sizes=sp, cap=t['g2']),
        dict(img='salle-rouge', kind='l', widths=[900, 1600], w=1600, h=900, sizes=sl, cap=t['g5']),
        dict(img='terrasse', kind='p', widths=[600, 1000], w=1000, h=1250, sizes=sp, cap=t['g3']),
        dict(img='horloge', kind='l', widths=[800, 1300], w=1300, h=975, sizes=sl, cap=t['g7']),
        dict(img='ouverture', kind='a', widths=[600, 1000], w=1000, h=1250, sizes=sp, cap=t['g6']),
        dict(img='entree', kind='p', widths=[600, 1000], w=1000, h=1250, sizes=sp, cap=t['g4']),
        dict(img='salle-b', kind='p', widths=[600, 1000], w=1000, h=1250, sizes=sp, cap=t['g8']),
        dict(img='ardoise', kind='p', widths=[600, 1000], w=1000, h=1250, sizes=sp, cap=t['g9']),
    ]
    return dict(lang=lang, t=t, a=('' if lang == 'fr' else '../'), rel=rel_links(lang), langs=ST.LANGS,
                lang_names=ST.LANG_NAMES, lang_path=ST.LANG_PATH, site_url=ST.SITE_URL, share_url=SHARE_URL, preview=not LIVE, ver=VER,
                phone=typo(ST.PHONE_DISPLAY if lang == 'fr' else ST.PHONE_INTL, lang).replace(' ', NB), phone_href=ST.PHONE_HREF,
                maps_dir=ST.MAPS_DIR, maps_place=ST.MAPS_PLACE, jsonld=jsonld(t, lang), px=px,
                plates=plates, marquee=marquee, gallery=gallery, tartes=T(tartes), tabs=T(M.TABS), food=T(M.FOOD), beers=T(M.BEERS),
                apero=T(M.APERITIFS), cocktails=T(M.COCKTAILS), wines=T(M.WINES), softs=T(M.SOFTS), hot=T(M.HOT),
                digestifs=T(M.DIGESTIFS), shared=T(M.SHARED))


def not_found():
    """Page 404 : une seule page pour les trois langues, chemins absolus (elle est servie depuis n'importe quelle adresse)."""
    T = {l: ST.strings(l) for l in ST.LANGS}
    h = ''.join('<span lang="%s">%s</span>' % (l, typo(T[l]['nf.h'], l)) for l in ST.LANGS)
    links = ''.join('<a class="%s" href="%s" hreflang="%s" lang="%s">%s</a>' % ('under', ST.LANG_PATH[l], l, l, typo(T[l]['nf.home'], l)) for l in ST.LANGS)
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{T['fr']['nf.title']} — Au 119, Kaysersberg</title>
<meta name="robots" content="noindex">
<meta name="theme-color" content="#F0E6D2">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-48.png" sizes="48x48" type="image/png">
<link rel="stylesheet" href="/assets/css/styles.css?v={VER}">
<style>
.nf {{ min-height: 100vh; min-height: 100svh; display: grid; place-items: center; padding: calc(var(--bar-h) + 24px) var(--pad) 56px; text-align: center; }}
.nf__n {{ font-family: var(--serif); font-weight: 800; font-variation-settings: "opsz" 144, "SOFT" 50, "WONK" 0; font-size: clamp(132px, 38vw, 380px); line-height: .8; letter-spacing: -.035em; color: var(--red); margin: .12em 0 .2em; }}
.nf__n span {{ color: var(--ink); }}
.nf__h {{ display: grid; gap: 6px; font-family: var(--serif); font-weight: 480; font-size: clamp(22px, 3vw, 34px); line-height: 1.2; letter-spacing: -.01em; font-variation-settings: "opsz" 60, "SOFT" 40; }}
.nf__h span + span {{ font-style: italic; font-size: .72em; color: var(--ink-2); font-variation-settings: "opsz" 30, "SOFT" 100, "WONK" 1; }}
.nf__l {{ display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 30px; margin-top: 34px; }}
.nf__t {{ margin-top: 30px; font-size: 14px; color: var(--ink-2); }}
</style>
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<header class="bar is-solid"><a class="bar__logo" href="/" aria-label="Au 119"><span>Au</span> <b>119</b></a></header>
<main class="nf">
  <div>
    <p class="eyebrow red">404 · Brasserie · Kaysersberg</p>
    <p class="nf__n" aria-hidden="true"><span>4</span>0<span>4</span></p>
    <h1 class="nf__h">{h}</h1>
    <p class="nf__l">{links}</p>
    <p class="nf__t">119 rue du Général de Gaulle, 68240 Kaysersberg · <a class="tel" href="{ST.PHONE_HREF}">{ST.PHONE_DISPLAY.replace(' ', NB)}</a></p>
  </div>
</main>
</body>
</html>
"""


def main():
    env = Environment(loader=FileSystemLoader(HERE), autoescape=select_autoescape(['html', 'j2']), trim_blocks=False)
    env.filters['price'] = lambda v: price(v, 'fr')
    env.filters['price2'] = lambda v: price2(v, 'fr')
    # mots composés (« au-dessus ») : jamais coupés au trait d'union en fin de ligne
    env.filters['nb'] = lambda v: Markup(re.sub(r'(\w+-\w+)', r'<span class="nb">\1</span>', str(escape(v))))
    tpl = env.get_template('template.html.j2')
    for lang in ST.LANGS:
        env.filters['price'] = lambda v, l=lang: price(v, l)
        env.filters['price2'] = lambda v, l=lang: price2(v, l)
        out = os.path.join(PUB, '' if lang == 'fr' else lang)
        os.makedirs(out, exist_ok=True)
        html = tpl.render(**context(lang))
        open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(html)
        print(lang, len(html) // 1024, 'Ko')
    for sub, name in (('css', 'styles.css'), ('js', 'main.js')):
        os.makedirs(os.path.join(PUB, 'assets', sub), exist_ok=True)
        shutil.copyfile(os.path.join(HERE, name), os.path.join(PUB, 'assets', sub, name))
    open(os.path.join(PUB, 'robots.txt'), 'w').write(
        'User-agent: *\n' + ('Allow: /\nSitemap: %s/sitemap.xml\n' % ST.SITE_URL if LIVE else 'Disallow: /\n'))
    open(os.path.join(PUB, '404.html'), 'w', encoding='utf-8').write(not_found())
    urls = ''.join('  <url><loc>%s%s</loc></url>\n' % (ST.SITE_URL, ST.LANG_PATH[l]) for l in ST.LANGS)
    open(os.path.join(PUB, 'sitemap.xml'), 'w').write(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n')
    # polices + css/js (versionnés par ?v=) : cache long. Photos et vidéos : cache court tant que le site bouge encore.
    media = 'public, max-age=2592000' if LIVE else 'public, max-age=600'
    open(os.path.join(PUB, '_headers'), 'w').write(
        '/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n'
        '/assets/css/*\n  Cache-Control: public, max-age=31536000, immutable\n'
        '/assets/js/*\n  Cache-Control: public, max-age=31536000, immutable\n'
        '/assets/img/*\n  Cache-Control: %s\n/assets/video/*\n  Cache-Control: %s\n'
        '/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n' % (media, media))
    print('ok', 'LIVE' if LIVE else 'APERÇU (noindex)', VER)


if __name__ == '__main__':
    main()
