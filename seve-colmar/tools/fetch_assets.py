#!/usr/bin/env python3
"""Télécharge les visuels générés (Higgsfield) et les optimise dans assets/img/.
PNG détourés → PNG réduits (alpha conservé, bbox recadrée) ; photos → WebP.
usage: python3 fetch_assets.py [--video-dir DIR]"""
import json, os, sys, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
IMG = os.path.join(SITE, 'assets', 'img')
os.makedirs(IMG, exist_ok=True)
man = json.load(open(os.path.join(HERE, 'assets.json')))
base = man['base']

def get(url, dest):
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        return dest
    urllib.request.urlretrieve(url, dest)
    return dest

tmp = os.path.join(HERE, 'out', 'raw'); os.makedirs(tmp, exist_ok=True)

for name, spec in man['site'].items():
    raw = get(base + spec['src'], os.path.join(tmp, spec['src']))
    im = Image.open(raw)
    out = os.path.join(IMG, name)
    if name.endswith('.png'):
        im = im.convert('RGBA')
        bbox = im.getchannel('A').getbbox()
        if bbox:
            pad = int(max(im.size) * 0.03)
            bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
            im = im.crop(bbox)
        # recadrage carré centré pour garder la géométrie des positions CSS
        side = max(im.size)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
        im = sq
        if im.width > spec['max']:
            im = im.resize((spec['max'], spec['max']), Image.LANCZOS)
        im.save(out, optimize=True)
    else:
        im = im.convert('RGB')
        if im.width > spec['max']:
            im = im.resize((spec['max'], round(im.height * spec['max'] / im.width)), Image.LANCZOS)
        im.save(out, 'WEBP', quality=82, method=6)
    print(f'{name:22} {im.size} {os.path.getsize(out)//1024} Ko')

vdir = None
if '--video-dir' in sys.argv:
    vdir = sys.argv[sys.argv.index('--video-dir') + 1]
    os.makedirs(vdir, exist_ok=True)
    for name, spec in man['video'].items():
        get(base + spec['src'], os.path.join(vdir, name))
        print('video asset', name)
print('ok')
