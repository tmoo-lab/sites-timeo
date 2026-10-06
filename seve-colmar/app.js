/* ==========================================================================
   SÈVE — slider quatre saisons · concept TMOO
   Tout est animé avec GSAP (y compris les variables de couleur) pour que la
   capture vidéo puisse piloter l'horloge image par image (mode ?capture=1).
   ========================================================================== */
(() => {
  const qs = new URLSearchParams(location.search);
  const CAPTURE = qs.has('capture');
  const STEP = qs.get('step') ? parseInt(qs.get('step'), 10) : 0;
  const INTERVAL = qs.get('iv') ? parseFloat(qs.get('iv')) : 4.2; // secondes par saison
  const SPEED = qs.get('speed') ? parseFloat(qs.get('speed')) : 1;   // vitesse des transitions
  const root = document.documentElement;

  if (CAPTURE) root.setAttribute('data-capture', '');
  if (STEP) root.setAttribute('data-step', String(STEP));

  /* ---------- Saisons ---------- */
  const SEASONS = [
    { key: 'printemps', bg: '#4F9B3B', bg2: '#3F8630', ink: '#F6F2E8', ink2: 'rgba(246,242,232,0.72)', accent: '#F3B8CB', onAccent: '#1B3A1E' },
    { key: 'ete',       bg: '#E8B421', bg2: '#D29F14', ink: '#1F3A22', ink2: 'rgba(31,58,34,0.72)',    accent: '#1F3A22', onAccent: '#F6E7B7' },
    { key: 'automne',   bg: '#CF4F1F', bg2: '#B64217', ink: '#F7EBDC', ink2: 'rgba(247,235,220,0.74)', accent: '#F7EBDC', onAccent: '#7A2A10' },
    { key: 'hiver',     bg: '#2C4A95', bg2: '#243F85', ink: '#EEF3FA', ink2: 'rgba(238,243,250,0.72)', accent: '#A8D4F0', onAccent: '#12254F' },
  ];
  const NEUTRAL = { bg: '#F3F1EC', bg2: '#E6E3DB', ink: '#1E1E1E', ink2: 'rgba(30,30,30,0.6)', accent: '#1E1E1E', onAccent: '#F3F1EC' };

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const hero = $('.hero');
  const words = $$('.word');
  const dios = $$('.dio');
  const fws = $$('.fw');
  const leads = $$('.lead');
  const snavs = $$('.snav');
  const counterCur = $('.counter__cur');
  const progress = $('.hero__progress i');
  const stageBob = $('.stage__bob');

  const byS = (list, i) => list.filter(el => +el.dataset.s === i);

  /* ---------- Horloge : en capture, GSAP est piloté à la main ---------- */
  if (CAPTURE) {
    gsap.ticker.remove(gsap.updateRoot);
    gsap.ticker.lagSmoothing(0);
    gsap.updateRoot(0);
    window.__tick = (t) => gsap.updateRoot(t);
  }
  gsap.defaults({ overwrite: 'auto' });

  /* ---------- Variables de couleur ---------- */
  const paint = (p, dur = 1.2, ease = 'power2.inOut') => gsap.to(root, {
    duration: dur, ease,
    '--bg': p.bg, '--bg2': p.bg2, '--ink': p.ink, '--ink2': p.ink2, '--accent': p.accent, '--on-accent': p.onAccent,
  });
  const paintNow = (p) => gsap.set(root, { '--bg': p.bg, '--bg2': p.bg2, '--ink': p.ink, '--ink2': p.ink2, '--accent': p.accent, '--on-accent': p.onAccent });

  /* ---------- États initiaux ---------- */
  fws.forEach(fw => {
    const r = parseFloat(getComputedStyle(fw).getPropertyValue('--r')) || 0;
    const img = $('.float', fw);
    gsap.set(img, { rotation: r, opacity: 0, scale: .8 });
    fw._rot = r;
  });
  gsap.set(words, { opacity: 0, y: 70 });
  gsap.set(dios, { opacity: 0, scale: 1.08 });
  gsap.set(leads, { opacity: 0, y: 10 });

  let cur = 0, busy = false, autoCall = null, started = false;

  const showSeason = (i) => {
    // place sans animation (état de départ)
    cur = i;
    root.dataset.season = SEASONS[i].key;
    gsap.set(words, { opacity: 0, y: 70 });
    gsap.set(dios, { opacity: 0, scale: 1.08 });
    gsap.set(leads, { opacity: 0, y: 10 });
    fws.forEach(fw => gsap.set($('.float', fw), { opacity: 0, scale: .8, x: 0, y: 0, rotation: fw._rot }));
    gsap.set(byS(words, i), { opacity: 1, y: 0 });
    gsap.set(byS(dios, i), { opacity: 1, scale: 1, rotation: 0 });
    gsap.set(byS(leads, i), { opacity: 1, y: 0 });
    byS(fws, i).forEach(fw => gsap.set($('.float', fw), { opacity: 1, scale: 1 }));
    snavs.forEach((b, k) => b.classList.toggle('is-active', k === i));
    gsap.set(snavs.map(b => $('i', b)), { width: 18 });
    gsap.set($('i', snavs[i]), { width: 44 });
    counterCur.textContent = String(i + 1).padStart(2, '0');
  };

  /* ---------- Transition entre deux saisons ---------- */
  const goTo = (next, dir = 1, opts = {}) => {
    next = (next + 4) % 4;
    if (next === cur || busy) return null;
    busy = true;
    const prev = cur; cur = next;
    const speed = opts.speed || SPEED;
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' }, onComplete: () => { busy = false; } });
    tl.timeScale(speed);

    root.dataset.season = SEASONS[next].key;
    tl.add(paint(SEASONS[next], 1.15), 0);

    // sortie
    tl.to(byS(words, prev), { y: -60 * dir, opacity: 0, duration: .55, ease: 'power2.in' }, 0);
    tl.to(byS(dios, prev), { scale: .9, rotation: -4 * dir, opacity: 0, duration: .5, ease: 'power2.in' }, 0);
    byS(fws, prev).forEach(fw => {
      const d = parseFloat(getComputedStyle(fw).getPropertyValue('--d')) || 1;
      tl.to($('.float', fw), { y: -110 * d * dir, rotation: fw._rot + 35 * dir, opacity: 0, scale: .7, duration: .5, ease: 'power2.in' }, 0);
    });
    tl.to(byS(leads, prev), { y: -8 * dir, opacity: 0, duration: .35, ease: 'power2.in' }, 0);

    // entrée
    const IN = .38;
    tl.fromTo(byS(words, next), { y: 80 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 1.05, ease: 'expo.out' }, IN);
    tl.fromTo(byS(dios, next), { scale: 1.1, rotation: 4 * dir, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, IN);
    byS(fws, next).forEach((fw, k) => {
      const d = parseFloat(getComputedStyle(fw).getPropertyValue('--d')) || 1;
      tl.fromTo($('.float', fw), { y: 130 * d * dir, rotation: fw._rot - 30 * dir, opacity: 0, scale: .7 }, { y: 0, rotation: fw._rot, opacity: 1, scale: 1, duration: .95, ease: 'expo.out' }, IN + k * .04);
    });
    tl.fromTo(byS(leads, next), { y: 12 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' }, IN + .1);

    // index
    tl.call(() => {
      snavs.forEach((b, k) => b.classList.toggle('is-active', k === next));
    }, null, .3);
    if (!started) { tl.to(snavs.map(b => $('i', b)), { width: 18, duration: .4 }, 0); tl.to($('i', snavs[next]), { width: 44, duration: .6, ease: 'power3.out' }, .3); }
    tl.to(counterCur, { y: -10 * dir, opacity: 0, duration: .25, ease: 'power2.in' }, .15)
      .call(() => { counterCur.textContent = String(next + 1).padStart(2, '0'); }, null, .4)
      .fromTo(counterCur, { y: 10 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: .45, ease: 'power3.out' }, .4);

    return tl;
  };

  /* ---------- Autoplay (horloge GSAP → déterministe en capture) ---------- */
  const armProgress = (dur) => {
    const rules = snavs.map(b => $('i', b));
    gsap.set(rules, { width: 18, overwrite: true });
    gsap.fromTo($('i', snavs[cur]), { width: 18 }, { width: 56, duration: dur, ease: 'none', overwrite: true });
  };
  const schedule = () => {
    if (autoCall) autoCall.kill();
    armProgress(INTERVAL);
    autoCall = gsap.delayedCall(INTERVAL, () => { goTo(cur + 1, 1); schedule(); });
  };
  const startAuto = () => { if (started) return; started = true; schedule(); };
  const userGo = (i, dir) => { goTo(i, dir); if (started) schedule(); };

  /* ---------- Mouvements d'attente (bob, dérive) ---------- */
  const idle = () => {
    gsap.to(stageBob, { y: -12, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    fws.forEach((fw, k) => {
      const fb = $('.fb', fw);
      gsap.to(fb, { y: (k % 2 ? -1 : 1) * (10 + (k % 5) * 4), rotation: (k % 3 - 1) * 5, duration: 3 + (k % 4) * .7, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -(k * .37) });
    });
  };

  /* ---------- Parallaxe souris (ou souris simulée en capture) ---------- */
  const applyParallax = (mx, my) => { // mx,my ∈ [-1,1]
    fws.forEach(fw => {
      const d = parseFloat(fw.style.getPropertyValue('--d')) || 1;
      gsap.to(fw, { x: mx * 26 * d, y: my * 20 * d, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
    });
    gsap.to($('.hero__stage'), { x: mx * 10, y: my * 8, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
    gsap.to($('.hero__words'), { x: mx * -14, y: my * -10, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
  };
  if (!CAPTURE) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      applyParallax(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    });
  } else {
    const m = { x: -.6, y: .2 };
    gsap.to(m, { x: .6, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: () => applyParallax(m.x, m.y) });
    gsap.to(m, { y: -.3, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  }

  /* ---------- Contrôles ---------- */
  $('.arrow--next').addEventListener('click', () => userGo(cur + 1, 1));
  $('.arrow--prev').addEventListener('click', () => userGo(cur - 1, -1));
  $$('[data-go]').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.go; userGo(i, i > cur ? 1 : -1);
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') userGo(cur + 1, 1);
    if (e.key === 'ArrowLeft') userGo(cur - 1, -1);
  });

  /* ---------- Aperçu image au survol des lignes savoir-faire ---------- */
  const peek = $('.row-peek'), peekImg = peek && $('img', peek);
  if (peek && matchMedia('(hover:hover)').matches) {
    const px = gsap.quickTo(peek, 'x', { duration: .5, ease: 'power3.out' });
    const py = gsap.quickTo(peek, 'y', { duration: .5, ease: 'power3.out' });
    $$('.row').forEach(row => {
      row.addEventListener('pointerenter', () => { peekImg.src = row.dataset.img; gsap.to(peek, { opacity: 1, scale: 1, duration: .45, ease: 'power3.out' }); });
      row.addEventListener('pointerleave', () => gsap.to(peek, { opacity: 0, scale: .9, duration: .35, ease: 'power3.in' }));
      row.addEventListener('pointermove', (e) => { px(e.clientX + 24); py(e.clientY - 200); });
    });
  }

  /* ---------- Bande de jardins ---------- */
  const strip = $('.strip');
  $$('[data-scroll]').forEach(b => b.addEventListener('click', () => {
    const card = $('.card', strip);
    strip.scrollBy({ left: (card.offsetWidth + 24) * +b.dataset.scroll, behavior: 'smooth' });
  }));

  /* ---------- Révélations au scroll : une seule arrivée nette par section ---------- */
  if (!CAPTURE && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    $$('.sf__head, .rows, .jardins__head, .saisons__head, .cols, .quote blockquote, .contact__inner').forEach(el => {
      gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    $$('.card__img').forEach(el => {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
    });
  }

  /* ==========================================================================
     Démarrage
     ========================================================================== */
  const whenReady = () => Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    ...$$('img').map(img => (img.complete ? Promise.resolve() : new Promise(r => { img.onload = img.onerror = r; }))),
  ]);

  const intro = () => {
    // Arrivée : tout le hero arrive d'un coup, en une seule respiration.
    const tl = gsap.timeline();
    tl.fromTo(byS(words, 0), { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out' }, 0);
    tl.fromTo(byS(dios, 0), { scale: .86, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.3, ease: 'expo.out' }, .05);
    tl.to('.stage__shadow', { opacity: 1, duration: 1.0 }, .3);
    byS(fws, 0).forEach((fw, k) => tl.fromTo($('.float', fw), { y: 120, opacity: 0, scale: .7 }, { y: 0, opacity: 1, scale: 1, duration: 1.1, ease: 'expo.out' }, .15 + k * .04));
    tl.fromTo(byS(leads, 0), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, .3);
    tl.fromTo(['.kicker', '.hero__actions', '.hero__meta', '.bar', '.arrow--prev', '.arrow--next'], { opacity: 0 }, { opacity: 1, duration: .8, ease: 'power2.out' }, .2);
    return tl;
  };

  /* Chorégraphies du making-of (mode capture + ?step=) */
  const stepChoreo = (step) => {
    const tl = gsap.timeline();
    if (step === 1) {
      paintNow(NEUTRAL);
      gsap.set('.wire__box', { opacity: 0, scale: .96 });
      tl.to('.wire__box', { opacity: 1, scale: 1, duration: .55, ease: 'power3.out' }, .15);
      tl.fromTo('.bar', { opacity: 0 }, { opacity: 1, duration: .5 }, .15);
    }
    if (step === 2) {
      paintNow(NEUTRAL);
      gsap.set(['.kicker', '.hero__actions', '.hero__meta', '.bar', '.arrow--prev', '.arrow--next', '.wire__box'], { opacity: 0 });
      gsap.set(leads, { opacity: 0 });
      tl.fromTo(byS(words, 0), { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out' }, .15);
      tl.fromTo(byS(leads, 0), { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'power3.out' }, .3);
      tl.to(['.kicker', '.hero__actions', '.hero__meta', '.bar', '.arrow--prev', '.arrow--next', '.wire__box'], { opacity: 1, duration: .6, ease: 'power2.out' }, .3);
    }
    if (step === 3) {
      // la palette : quatre couleurs appliquées l'une après l'autre
      showSeason(0);
      const times = [.7, 1.5, 2.3];
      times.forEach((t, k) => tl.add(() => goTo(k + 1, 1, { speed: 2.0 }), t));
    }
    if (step === 4) {
      showSeason(0);
      gsap.set(byS(dios, 0), { opacity: 0, scale: .6 });
      byS(fws, 0).forEach(fw => gsap.set($('.float', fw), { opacity: 0, scale: .5, y: 90 }));
      tl.to(byS(dios, 0), { opacity: 1, scale: 1, duration: 1.0, ease: 'back.out(1.3)' }, .2);
      tl.to('.stage__shadow', { opacity: 1, duration: .8 }, .5);
      byS(fws, 0).forEach((fw, k) => tl.to($('.float', fw), { opacity: 1, scale: 1, y: 0, duration: .9, ease: 'expo.out' }, .75 + k * .06));
    }
    if (step === 5) {
      showSeason(0);
      gsap.set('.stage__shadow', { opacity: 1 });
      tl.add(() => { startAuto(); }, .25);
    }
    return tl;
  };

  whenReady().then(() => {
    idle();
    if (CAPTURE && STEP) {
      if (STEP <= 2) { /* mot statique : afficher l'état de départ sans slider */
        cur = 0; root.dataset.season = 'printemps';
        gsap.set(byS(words, 0), { opacity: 1, y: 0 }); gsap.set(byS(leads, 0), { opacity: 1, y: 0 });
      }
      stepChoreo(STEP);
      window.__ready = true;
      return;
    }
    showSeason(0);
    intro();
    if (CAPTURE) startAuto(); else gsap.delayedCall(1.4, startAuto);
    window.__ready = true;
  });
})();
