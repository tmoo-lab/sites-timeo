#!/usr/bin/env python3
"""Montage vertical 1080x1920 à partir des captures du site.
Structure (comme la vidéo de référence) :
  0–8 s    hook : écran filmé (mockup) qui diffuse le slider, titre en haut
  8–26 s   making-of : 6 étapes de 3 s sur canvas sombre, légende noire
  26–30 s  outro : retour sur l'écran, légende « concept offert »
usage: python3 compose.py <mockup.png> <framesFull> <stepsRoot> <outFrames> [fps=30]
  framesFull : dossier de la capture complète (≥ 15 s)
  stepsRoot  : dossier contenant s1..s5 (3 s chacun)
"""
import os, sys, glob, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

mockup_path, full_dir, steps_root, out_dir = sys.argv[1:5]
FPS = int(sys.argv[5]) if len(sys.argv) > 5 else 30
W, H = 1080, 1920
HOOK, STEP, NSTEPS, OUTRO = 8.0, 3.0, 6, 4.0
TOTAL = HOOK + STEP * NSTEPS + OUTRO
os.makedirs(out_dir, exist_ok=True)

FONT_DIRS = ['/usr/share/fonts/truetype/higgsfield', os.path.dirname(os.path.abspath(__file__)), '/usr/share/fonts/truetype/dejavu']
def font(size, name='Montserrat-ExtraBold.ttf'):
    for d in FONT_DIRS:
        p = os.path.join(d, name)
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', size)

F_TITLE = font(46); F_CAP = font(42); F_LABEL = font(21); F_URL = font(22); F_SMALL = font(26)

full = sorted(glob.glob(os.path.join(full_dir, 'f_*.jpg')))
steps = {k: sorted(glob.glob(os.path.join(steps_root, f's{k}', 'f_*.jpg'))) for k in range(1, 6)}
assert len(full) >= int(15 * FPS) - 1, f'capture complète trop courte: {len(full)}'
for k in range(1, 6):
    assert len(steps[k]) >= int(STEP * FPS) - 1, f'étape {k} trop courte: {len(steps[k])}'

# ---------- Mockup : redimensionnement + détection de l'écran vert ----------
mk = Image.open(mockup_path).convert('RGB')
scale = W / mk.width
mk = mk.resize((W, round(mk.height * scale)), Image.LANCZOS)
if mk.height > H:
    off = (mk.height - H) // 2
    mk = mk.crop((0, off, W, off + H))
elif mk.height < H:
    canvas = Image.new('RGB', (W, H), (0, 0, 0)); canvas.paste(mk, (0, (H - mk.height) // 2)); mk = canvas
a = np.asarray(mk).astype(int); R, G, B = a[..., 0], a[..., 1], a[..., 2]
mask = (G > 140) & (R < 130) & (B < 130) & ((G - np.maximum(R, B)) > 70)
ys, xs = np.nonzero(mask)
s_, d_ = xs + ys, xs - ys
TL = (int(xs[s_.argmin()]), int(ys[s_.argmin()])); BR = (int(xs[s_.argmax()]), int(ys[s_.argmax()]))
TR = (int(xs[d_.argmax()]), int(ys[d_.argmax()])); BL = (int(xs[d_.argmin()]), int(ys[d_.argmin()]))
# léger débord pour couvrir le liseré vert
def push(p, cx, cy, k=2.5):
    vx, vy = p[0] - cx, p[1] - cy; n = math.hypot(vx, vy) or 1
    return (p[0] + vx / n * k, p[1] + vy / n * k)
cx, cy = (TL[0] + TR[0] + BR[0] + BL[0]) / 4, (TL[1] + TR[1] + BR[1] + BL[1]) / 4
QUAD = [push(TL, cx, cy), push(TR, cx, cy), push(BR, cx, cy), push(BL, cx, cy)]
print('écran détecté', TL, TR, BR, BL)

# pièce neutre (le vert et le violet de la LED sont désaturés), puis lueur colorée ajoutée
base = ImageEnhance.Color(mk).enhance(0.18)
base = ImageEnhance.Brightness(base).enhance(0.9)
bd = ImageDraw.Draw(base); bd.polygon([tuple(map(int, p)) for p in QUAD], fill=(8, 8, 10))
base_arr = np.asarray(base).astype(np.float32)

# masque de lueur : halo autour de l'écran + spill vers le bas (bureau / clavier)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
sw, sh = (TR[0] - TL[0]), (BL[1] - TL[1])
dx = np.maximum(0, np.abs(xx - cx) - sw / 2); dy = np.maximum(0, np.abs(yy - cy) - sh / 2)
dist = np.sqrt(dx * dx + dy * dy)
halo = np.exp(-(dist / 420.0) ** 1.6)
below = np.exp(-(np.maximum(0, yy - (cy + sh / 2)) / 520.0) ** 1.4) * np.exp(-(np.abs(xx - cx) / 560.0) ** 2) * (yy > cy)
GLOW = np.clip(halo * 0.55 + below * 0.55, 0, 1)[..., None]
GLOW[mask] = 0  # pas de lueur sur l'écran lui-même

def find_coeffs(pa, pb):
    """pa: 4 points destination (quad), pb: 4 points source (rect) -> coeffs PIL (sortie→source)."""
    M = []
    for (x, y), (X, Y) in zip(pa, pb):
        M.append([x, y, 1, 0, 0, 0, -X * x, -X * y]); M.append([0, 0, 0, x, y, 1, -Y * x, -Y * y])
    A = np.array(M, dtype=np.float64); b = np.array(pb, dtype=np.float64).reshape(8)
    return np.linalg.solve(A, b)

COEFFS = find_coeffs(QUAD, [(0, 0), (1600, 0), (1600, 900), (0, 900)])

def monitor_frame(frame_path, zoom=1.0, tint_strength=1.0):
    fr = Image.open(frame_path).convert('RGB')
    if fr.size != (1600, 900): fr = fr.resize((1600, 900), Image.BILINEAR)
    mean = np.asarray(fr.resize((1, 1), Image.BOX)).astype(np.float32)[0, 0]
    # écran incrusté en perspective
    layer = fr.convert('RGBA').transform((W, H), Image.PERSPECTIVE, COEFFS, Image.BICUBIC, fillcolor=(0, 0, 0, 0))
    # lueur colorée
    tint = base_arr + GLOW * (mean[None, None, :] * 0.9 + 30) * 0.75 * tint_strength
    img = Image.fromarray(np.clip(tint, 0, 255).astype(np.uint8)).convert('RGBA')
    img.alpha_composite(layer)
    img = img.convert('RGB')
    if zoom != 1.0:
        cw, ch = W / zoom, H / zoom
        x0, y0 = (W - cw) / 2, (H - ch) / 2 - (zoom - 1) * 140  # on cadre un peu plus haut en zoomant
        img = img.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.BICUBIC)
    return img

# ---------- Textes ----------
def text_block(draw, lines, fnt, cx, cy, fill, spacing=10, tracking=0):
    sizes = [draw.textbbox((0, 0), l, font=fnt) for l in lines]
    hs = [b[3] - b[1] for b in sizes]; ws = [b[2] - b[0] for b in sizes]
    total = sum(hs) + spacing * (len(lines) - 1)
    y = cy - total / 2
    for l, bbx, h, w in zip(lines, sizes, hs, ws):
        draw.text((cx - w / 2 - bbx[0], y - bbx[1]), l, font=fnt, fill=fill)
        y += h + spacing
    return total, max(ws)

def pill(img, lines, fnt, cx, cy, alpha=1.0, scale=1.0, pad=(30, 22), radius=18, bg=(10, 10, 12), fg=(255, 255, 255)):
    tmp = Image.new('RGBA', (W, 600), (0, 0, 0, 0)); d = ImageDraw.Draw(tmp)
    th, tw = text_block(d, lines, fnt, W / 2, 300, fg, spacing=8)
    box = (W / 2 - tw / 2 - pad[0], 300 - th / 2 - pad[1], W / 2 + tw / 2 + pad[0], 300 + th / 2 + pad[1])
    bgl = Image.new('RGBA', tmp.size, (0, 0, 0, 0)); ImageDraw.Draw(bgl).rounded_rectangle(box, radius=radius, fill=bg + (255,))
    bgl.alpha_composite(tmp)
    if scale != 1.0:
        nw, nh = int(bgl.width * scale), int(bgl.height * scale)
        bgl = bgl.resize((nw, nh), Image.BICUBIC)
    if alpha < 1.0:
        al = bgl.getchannel('A').point(lambda v: int(v * alpha)); bgl.putalpha(al)
    img.alpha_composite(bgl, (int(cx - bgl.width / 2), int(cy - bgl.height / 2)))

def ease_out(t): return 1 - (1 - t) ** 3

# ---------- Canvas making-of ----------
CANVAS_BG = (16, 16, 18)
FRAME_W = 980; FRAME_H = round(FRAME_W * 900 / 1600)
rounded_mask = Image.new('L', (FRAME_W, FRAME_H), 0); ImageDraw.Draw(rounded_mask).rounded_rectangle((0, 0, FRAME_W - 1, FRAME_H - 1), radius=20, fill=255)
vignette = None

def canvas_frame(frame_path, label, caption_lines, local_t, browser=False, url=''):
    img = Image.new('RGBA', (W, H), CANVAS_BG + (255,))
    d = ImageDraw.Draw(img)
    fr = Image.open(frame_path).convert('RGB').resize((FRAME_W, FRAME_H), Image.LANCZOS)
    chrome_h = 56 if browser else 0
    total_h = FRAME_H + chrome_h
    x0 = (W - FRAME_W) // 2; y0 = 880 - total_h // 2
    # libellé façon calque
    d.text((x0, y0 - 38), label, font=F_LABEL, fill=(128, 128, 134))
    if browser:
        d.rounded_rectangle((x0, y0, x0 + FRAME_W, y0 + total_h), radius=20, fill=(34, 34, 38))
        for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
            d.ellipse((x0 + 22 + i * 24, y0 + 20, x0 + 36 + i * 24, y0 + 34), fill=c)
        d.rounded_rectangle((x0 + 120, y0 + 12, x0 + FRAME_W - 120, y0 + 44), radius=10, fill=(22, 22, 25))
        ub = d.textbbox((0, 0), url, font=F_URL); d.text((W / 2 - (ub[2] - ub[0]) / 2, y0 + 28 - (ub[3] - ub[1]) / 2 - ub[1]), url, font=F_URL, fill=(200, 200, 206))
        m2 = Image.new('L', (FRAME_W, FRAME_H), 0); ImageDraw.Draw(m2).rounded_rectangle((0, -30, FRAME_W - 1, FRAME_H - 1), radius=20, fill=255)
        img.paste(fr, (x0, y0 + chrome_h), m2)
    else:
        img.paste(fr, (x0, y0), rounded_mask)
        d.rounded_rectangle((x0 - 1, y0 - 1, x0 + FRAME_W, y0 + FRAME_H), radius=20, outline=(255, 255, 255, 28), width=1)
    # légende : apparition rapide
    k = min(1.0, local_t / 0.32); e = ease_out(k)
    pill(img, caption_lines, F_CAP, W / 2, 1300, alpha=e, scale=0.92 + 0.08 * e)
    return img.convert('RGB')

CAPTIONS = {
    1: ('Hero — structure', ['On pose la structure', 'de la page']),
    2: ('Hero — typographie', ['On choisit', 'la typographie']),
    3: ('Hero — palette', ['Une palette', 'par saison']),
    4: ('Hero — éléments', ['On place le jardin', 'et ses éléments']),
    5: ('Hero — animation', ['On anime', 'les transitions']),
    6: ('Mise en ligne', ['On met en ligne.', 'Prêt en 21 jours.']),
}
TITLE = ['UN SITE PAYSAGISTE', 'QUI CHANGE DE SAISON']
OUTRO_CAP = ['Concept offert sous 12 h', 'tmoo.site']

N = int(TOTAL * FPS)
for i in range(N):
    t = i / FPS
    if t < HOOK:
        fi = min(len(full) - 1, i + 8)  # on démarre le hook juste après le début de l'intro
        zoom = 1.0 + 0.06 * (t / HOOK)
        img = monitor_frame(full[fi], zoom=zoom).convert('RGBA')
        d = ImageDraw.Draw(img)
        k = max(0.0, min(1.0, (t - 0.25) / 0.45))
        if k > 0:
            layer = Image.new('RGBA', (W, 260), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
            text_block(ld, TITLE, F_TITLE, W / 2, 130, (255, 255, 255, int(255 * ease_out(k))), spacing=12)
            img.alpha_composite(layer, (0, int(170 + (1 - ease_out(k)) * 14)))
        out = img.convert('RGB')
    elif t < HOOK + STEP * NSTEPS:
        k = int((t - HOOK) // STEP) + 1
        lt = (t - HOOK) - (k - 1) * STEP
        li = int(round(lt * FPS))
        if k <= 5:
            frames = steps[k]; fp = frames[min(len(frames) - 1, li)]
            out = canvas_frame(fp, CAPTIONS[k][0], CAPTIONS[k][1], lt)
        else:
            fp = full[min(len(full) - 1, int(HOOK * FPS) + li)]
            out = canvas_frame(fp, CAPTIONS[6][0], CAPTIONS[6][1], lt, browser=True, url='strate-colmar.netlify.app/seve')
    else:
        lt = t - (HOOK + STEP * NSTEPS)
        fi = min(len(full) - 1, int((HOOK + STEP) * FPS) + int(round(lt * FPS)))
        img = monitor_frame(full[fi], zoom=1.04).convert('RGBA')
        layer = Image.new('RGBA', (W, 260), (0, 0, 0, 0)); ld = ImageDraw.Draw(layer)
        text_block(ld, TITLE, F_TITLE, W / 2, 130, (255, 255, 255, 255), spacing=12)
        img.alpha_composite(layer, (0, 170))
        kk = min(1.0, lt / 0.35); e = ease_out(kk)
        pill(img, OUTRO_CAP, F_CAP, W / 2, 1640, alpha=e, scale=0.92 + 0.08 * e)
        out = img.convert('RGB')
    out.save(os.path.join(out_dir, f'v_{i:05d}.jpg'), quality=93)
    if i % 90 == 0: print(f'{i}/{N}', flush=True)
print('frames ok', N)
