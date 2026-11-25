/* Au 119 — interactions. Aucun module externe. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  var lang = body.getAttribute('data-lang') || 'fr';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (v, a, b) { v = clamp((v - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); };
  var fontsReady = (d.fonts && d.fonts.ready && d.fonts.ready.then) ? d.fonts.ready : { then: function (f) { setTimeout(f, 0); } };
  var hasIO = 'IntersectionObserver' in window;

  /* ------------------------------------------------------------ heure de Kaysersberg, statut ouvert / fermé */
  var OPEN_H = 10, CLOSE_H = 18;
  // Fermeture annuelle : ajouter ici des périodes ['AAAA-MM-JJ', 'AAAA-MM-JJ'] (bornes incluses).
  var CLOSED_RANGES = [];

  function paris() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date());
      var g = function (t) { for (var i = 0; i < p.length; i++) if (p[i].type === t) return p[i].value; return '0'; };
      return { h: parseInt(g('hour'), 10) % 24, m: parseInt(g('minute'), 10), s: parseInt(g('second'), 10), date: g('year') + '-' + g('month') + '-' + g('day') };
    } catch (e) {
      var n = new Date();
      return { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds(), date: n.toISOString().slice(0, 10) };
    }
  }
  function isOpen(t) {
    for (var i = 0; i < CLOSED_RANGES.length; i++) if (t.date >= CLOSED_RANGES[i][0] && t.date <= CLOSED_RANGES[i][1]) return false;
    return t.h >= OPEN_H && t.h < CLOSE_H;
  }
  function fmtTime(t) {
    var mm = (t.m < 10 ? '0' : '') + t.m, nb = '\u00a0';
    if (lang === 'en') { var h = t.h % 12 || 12; return h + ':' + mm + nb + (t.h < 12 ? 'am' : 'pm'); }
    if (lang === 'de') return t.h + ':' + mm;
    return t.h + nb + 'h' + nb + mm;
  }
  function refreshStatus() {
    var t = paris(), open = isOpen(t);
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', open);
      var txt = $('[data-status-text]', el), sub = $('[data-status-sub]', el);
      if (txt) txt.textContent = el.getAttribute(open ? 'data-o' : 'data-c');
      if (sub) sub.textContent = el.getAttribute(open ? 'data-o2' : 'data-c2');
      el.hidden = false;
    });
    $$('[data-status-long]').forEach(function (el) { el.textContent = el.getAttribute(open ? 'data-o' : 'data-c'); });
    var ct = $('[data-clock-text]');
    if (ct) ct.textContent = ct.getAttribute(open ? 'data-open' : 'data-closed').replace('{t}', fmtTime(t));
  }
  refreshStatus();
  setInterval(refreshStatus, 30000);

  /* ------------------------------------------------------------ horloge */
  (function () {
    var svg = $('[data-clock]'); if (!svg) return;
    var ticks = $('[data-clock-ticks]', svg), ns = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 60; i++) {
      var l = d.createElementNS(ns, 'line'), big = i % 5 === 0;
      l.setAttribute('x1', 100); l.setAttribute('x2', 100);
      l.setAttribute('y1', 8); l.setAttribute('y2', big ? 15 : 11);
      l.setAttribute('transform', 'rotate(' + i * 6 + ' 100 100)');
      if (!big) l.setAttribute('opacity', '.5');
      ticks.appendChild(l);
    }
    var H = $('[data-clock-h]', svg), M = $('[data-clock-m]', svg), S = $('[data-clock-s]', svg);
    var t0 = paris(), base = t0.h * 3600 + t0.m * 60 + t0.s, start = Date.now();
    function tick() {
      var tot = base + Math.floor((Date.now() - start) / 1000);
      S.style.transform = 'rotate(' + tot * 6 + 'deg)';
      M.style.transform = 'rotate(' + tot / 10 + 'deg)';
      H.style.transform = 'rotate(' + tot / 120 + 'deg)';
    }
    tick();
    if (!reduce) setInterval(tick, 1000);
  })();

  /* ------------------------------------------------------------ barre, menu mobile */
  var bar = $('#bar'), burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    root.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!root.classList.contains('menu-open')); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });
  (function () {
    var mq = window.matchMedia('(min-width: 900px)'), f = function (m) { if (m.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', f); else if (mq.addListener) mq.addListener(f);
  })();

  /* ------------------------------------------------------------ ajustements au pixel : textes en anneau, grands mots */
  function fitRings() {
    $$('text[data-ring]').forEach(function (tx) {
      var C = parseFloat(tx.getAttribute('data-ring')), n = tx.textContent.length, was = tx.getAttribute('letter-spacing');
      try {
        tx.setAttribute('letter-spacing', '0');
        var len = tx.getComputedTextLength();
        tx.setAttribute('letter-spacing', (len > 20 && n) ? ((C - len) / n).toFixed(3) : was);
      } catch (e) { tx.setAttribute('letter-spacing', was); }
    });
  }
  var lastFitW = -1;
  function fitWords(force) {
    var w = window.innerWidth;
    if (!force && w === lastFitW) return;            // la barre d'adresse du téléphone change la hauteur, pas la largeur
    lastFitW = w;
    $$('[data-fit]').forEach(function (stage) {
      var el = $(stage.getAttribute('data-fit'), stage); if (!el) return;
      stage.style.fontSize = '';
      if (w >= 900) return;                           // sur grand écran le mot est centré avec de la marge : la feuille de style suffit
      // La feuille de style donne déjà la bonne taille (voir .hero__stage, .sig__stage). Ceci n'est qu'un filet de sécurité :
      // si une police de secours, plus large, faisait déborder le mot, on le réduit — on ne l'agrandit jamais.
      var cs = getComputedStyle(stage), fs = parseFloat(cs.fontSize);
      var avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var ww = el.getBoundingClientRect().width;
      if (ww > avail + 1 && avail > 0) stage.style.fontSize = (fs * avail / ww).toFixed(2) + 'px';
    });
    $$('[data-fit-lines]').forEach(function (h) {
      h.style.fontSize = '';
      var fs = parseFloat(getComputedStyle(h).fontSize), k = 1;
      $$('.line__i', h).forEach(function (l) { if (l.scrollWidth > l.clientWidth + 1) k = Math.min(k, l.clientWidth / l.scrollWidth); });
      if (k < 1) h.style.fontSize = (fs * k * 0.985).toFixed(2) + 'px';
    });
  }
  fitWords(true);
  fontsReady.then(function () { fitWords(true); fitRings(); measure(); onScroll(); });

  /* ------------------------------------------------------------ apparitions
     Textes : d'un bloc. Photos : un rideau se lève, mais seulement sur une image réellement chargée. */
  var revealSel = '[data-fade], [data-lines], [data-rise], [data-sticker], .band';
  var medias = $$('[data-m]');
  function eager(scope) { $$('img[loading="lazy"]', scope).forEach(function (im) { im.loading = 'eager'; }); }
  // chaque cadre sait quand sa photo est arrivée : une image en retard (réseau lent) entre en fondu au lieu de surgir
  medias.forEach(function (m) {
    var im = $('img', m);
    function ok() { m.classList.add('loaded'); }
    if (!im || (im.complete && im.naturalWidth)) ok(); else { im.addEventListener('load', ok); im.addEventListener('error', ok); }
  });
  function whenPainted(m, cb) {
    var im = $('img', m), done = false;
    function go() { if (done) return; done = true; cb(); }
    if (!im) return go();
    im.loading = 'eager';
    function ok() { if (im.decode) im.decode().then(go, go); else go(); }
    if (im.complete && im.naturalWidth) ok(); else { im.addEventListener('load', ok); im.addEventListener('error', go); }
    setTimeout(go, 1500);                                // réseau lent : on ne laisse jamais un rideau fermé
  }
  function reveal(el) {
    if (el.hasAttribute('data-m')) {
      whenPainted(el, function () {
        el.classList.add('in');
        // le film d'un cadre ne démarre qu'une fois le rideau levé : on voit son début, pas son milieu
        if (el.__film) setTimeout(function () { el.__film.open = true; el.__film.sync(); }, 950);
      });
      return;
    }
    el.classList.add('in');
    if (el.classList.contains('band')) $$('[data-m]', el).forEach(reveal);   // toute la bande s'ouvre d'un coup, cartes hors champ comprises
  }
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); reveal(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
    // les photos partent un rien plus tôt que les textes : en défilant vite, on ne croise pas un rideau encore fermé au milieu de l'écran
    var ioM = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { ioM.unobserve(e.target); reveal(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px 6% 0px' });
    $$(revealSel).forEach(function (el) { (el.classList.contains('band') ? ioM : io).observe(el); });
    medias.forEach(function (m) { if (!m.closest('.band')) ioM.observe(m); });
    // un écran d'avance : les photos commencent à se charger avant d'arriver
    var pre = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { pre.unobserve(e.target); eager(e.target); } });
    }, { rootMargin: '110% 0px 110% 0px' });
    medias.forEach(function (m) { if (!m.closest('.band')) pre.observe(m); });
    $$('.band').forEach(function (b) { pre.observe(b); });
    // à l'écran, la photo vit (très lent rapproché, voir la feuille de style) ; hors champ, elle se repose
    var onScreen = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-on', e.isIntersecting); });
    }, { threshold: 0 });
    medias.forEach(function (m) { onScreen.observe(m); });
  } else {
    $$(revealSel).forEach(function (el) { el.classList.add('in'); });
    medias.forEach(function (m) { m.classList.add('in'); });
  }

  /* ------------------------------------------------------------ films
     La photo reste toujours en place. Le film se charge quand son cadre est à l'écran et ne se montre (fondu)
     qu'une fois qu'il joue vraiment. Si le téléphone refuse la lecture automatique (mode économie d'énergie),
     on garde simplement la photo : aucun trou, aucun flash, aucun bouton de lecture. */
  var canFilm = hasIO && !reduce && !saveData;
  var films = [];
  function film(box, v, wanted) {
    var f = { box: box, v: v, vis: false, open: false, dead: false };
    v.muted = true; v.defaultMuted = true;
    v.addEventListener('timeupdate', function () { if (!f.dead && !v.paused && v.currentTime > 0.04 && wanted(f)) box.classList.add('is-live'); });
    v.addEventListener('error', function () { if (v.getAttribute('src')) { f.dead = true; box.classList.remove('is-live'); box.classList.add('is-still'); } });
    f.sync = function () {
      if (f.dead) return;
      if (wanted(f) && !d.hidden) {
        if (!v.getAttribute('src')) v.src = v.getAttribute('data-film');
        var p; try { p = v.play(); } catch (e) { return; }
        if (p && p.catch) p.catch(function (err) { if (err && err.name === 'NotAllowedError') box.classList.add('is-still'); });
      } else if (v.getAttribute('src') && !v.paused) { v.pause(); }
    };
    f.unload = function () {                             // loin de l'écran, le film rend son décodeur (un téléphone n'en a que quelques-uns)
      if (!v.getAttribute('src')) return;
      v.pause(); box.classList.remove('is-live'); v.removeAttribute('src'); try { v.load(); } catch (e) {}
    };
    box.__film = f; films.push(f); return f;
  }
  if (canFilm) {
    var seeFilm = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var f = e.target.__film; f.vis = e.isIntersecting; f.sync(); });
    }, { threshold: 0.3 });
    var farFilm = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) e.target.__film.unload(); });
    }, { rootMargin: '160% 0px 160% 0px' });
    $$('.m--film').forEach(function (box) {
      var v = $('.m__vid', box); if (!v) return;
      film(box, v, function (f) { return f.vis && f.open; });
      seeFilm.observe(box); farFilm.observe(box);
    });
    d.addEventListener('visibilitychange', function () { films.forEach(function (f) { f.sync(); }); });
    // Lecture automatique refusée (mode économie d'énergie) : on n'insiste pas, et surtout on ne lance rien au toucher —
    // dans certains navigateurs intégrés aux applis, cela ouvrirait le film en plein écran. La photo suffit.
  } else {
    $$('.m--film').forEach(function (box) { box.classList.add('is-still'); });
  }

  /* ------------------------------------------------------------ hero : le store se lève sur la façade, puis le film prend le relais */
  var hero = $('.hero'), heroArch = $('[data-hero-arch]'), heroLive = $('[data-hero-live]'), heroMedia = $('[data-hero-media]'), heroW = $('.hero__w'), heroVid = $('[data-hero-video]'), heroGrav = $('.hero__gravure');
  var heroFilm = null, heroVisible = true, heroAway = false, heroStarted = false, gravOk = false;
  (function () {
    if (!hero) return;
    var photo = $('.hero__photo'), okImg = !photo || (photo.complete && photo.naturalWidth > 0), okFont = false, done = false;
    var introAt = 0;
    function go() { if (done) return; done = true; introAt = Date.now(); fitWords(true); requestAnimationFrame(function () { hero.classList.add('is-in'); }); }
    function check() { if (okImg && okFont) go(); }
    if (photo && !okImg) { photo.addEventListener('load', function () { okImg = true; check(); }); photo.addEventListener('error', function () { okImg = true; check(); }); }
    fontsReady.then(function () { okFont = true; check(); });
    setTimeout(go, 1700);
    function later() {
      // la gravure (sous la photo) n'est demandée qu'une fois la page chargée : elle ne dispute pas la bande passante à la façade
      if (heroGrav && !reduce) {
        heroGrav.addEventListener('load', function () { gravOk = true; onScroll(); });
        heroGrav.src = heroGrav.getAttribute('data-src');
      }
      if (heroVid && heroArch && canFilm) {
        heroFilm = film(heroArch, heroVid, function () { return heroStarted && heroVisible && !heroAway; });
        new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; heroFilm.sync(); }, { threshold: 0.05 }).observe(hero);
        farFilm.observe(heroArch);                         // très loin du haut de page, la façade rend elle aussi son décodeur
        // le film ne démarre qu'une fois le store levé et la photo posée : jamais de vidéo animée pendant l'ouverture
        setTimeout(function () { heroStarted = true; heroFilm.sync(); }, Math.max(0, 2400 - (Date.now() - (introAt || Date.now()))));
      }
    }
    if (d.readyState === 'complete') setTimeout(later, 700); else window.addEventListener('load', function () { setTimeout(later, 700); });
  })();

  /* ------------------------------------------------------------ parallaxe, fondu photo -> gravure, barre */
  var pars = $$('[data-par]').map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-par')) || 0, y: 0, h: 0 }; });
  var darkEl = $('[data-dark]'), darkIn = darkEl && $('.tf__in', darkEl), gTop = 1e9, gIn = 1e9, gOut = -1, gEnd = -1;   // section sombre et ses deux fondus
  var vh = window.innerHeight, ticking = false, barH = 58;

  function measure() {
    vh = window.innerHeight;
    var sy = window.pageYOffset;
    barH = bar ? bar.offsetHeight : 58;
    pars.forEach(function (p) {
      var prev = p.el.style.getPropertyValue('--py');
      p.el.style.setProperty('--py', '0px');
      var r = p.el.getBoundingClientRect();
      p.y = r.top + sy; p.h = r.height;
      if (prev) p.el.style.setProperty('--py', prev);
    });
    if (darkEl && darkIn) {
      var dr = darkEl.getBoundingClientRect(), ir = darkIn.getBoundingClientRect();
      gTop = dr.top + sy; gIn = ir.top + sy; gOut = ir.bottom + sy; gEnd = dr.bottom + sy;
    }
  }
  function frame() {
    ticking = false;
    var sy = window.pageYOffset;
    if (bar) {
      bar.classList.toggle('is-solid', sy > 24);
      var mid0 = sy + barH / 2, bot0 = sy + barH;
      // dans les deux fondus de la section sombre, la barre devient transparente et se fond dans le dégradé
      bar.classList.toggle('is-clear', (sy >= gTop && bot0 <= gIn) || (sy >= gOut && bot0 <= gEnd));
      bar.classList.toggle('is-dark', mid0 > gTop + (gIn - gTop) * 0.45 && mid0 < gEnd - (gEnd - gOut) * 0.45);
    }
    if (reduce) return;
    if (heroLive && sy < vh * 1.4) {
      var hp = clamp(sy / (vh * 0.85), 0, 1);
      // dès qu'on descend, le film s'efface vers la photo fixe : c'est elle, calée au pixel sur la gravure, qui se fond ensuite dans le dessin
      var away = hp > (heroAway ? 0.07 : 0.13);
      if (heroVid && away !== heroAway) {
        heroAway = away; heroVid.classList.toggle('is-away', away);
        if (heroFilm) heroFilm.sync();
      }
      heroLive.style.opacity = gravOk ? (1 - smooth(hp, 0.3, 0.98)).toFixed(3) : '1';   // sans gravure chargée, la photo reste
      if (heroMedia) heroMedia.style.scale = (1 + hp * 0.07).toFixed(4);
      if (heroW) heroW.style.translate = '0 ' + (-hp * 12).toFixed(2) + '%';
    }
    var mid = sy + vh / 2;
    for (var i = 0; i < pars.length; i++) {
      var p = pars[i];
      if (p.y > sy + vh * 1.3 || p.y + p.h < sy - vh * 0.3) continue;
      p.el.style.setProperty('--py', ((p.y + p.h / 2 - mid) * -p.k).toFixed(1) + 'px');
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  measure(); frame();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { fitWords(false); measure(); onScroll(); });
  window.addEventListener('orientationchange', function () { setTimeout(function () { fitWords(true); measure(); onScroll(); }, 250); });
  window.addEventListener('load', function () { fitWords(true); measure(); onScroll(); });
  if ('ResizeObserver' in window) new ResizeObserver(function () { measure(); onScroll(); }).observe(body);

  /* ------------------------------------------------------------ bandes à glisser */
  $$('[data-band]').forEach(function (band) {
    var id = band.getAttribute('data-band');
    var prev = $('[data-band-prev="' + id + '"]'), next = $('[data-band-next="' + id + '"]');
    var barI = $('[data-band-bar="' + id + '"]');
    var raf = false;

    function step() { var it = $('.band__track > li', band); return it ? (it.getBoundingClientRect().width + 24) * (window.innerWidth < 700 ? 1 : 2) : band.clientWidth * 0.8; }
    function update() {
      raf = false;
      var max = band.scrollWidth - band.clientWidth, x = band.scrollLeft, p = max > 0 ? clamp(x / max, 0, 1) : 0;
      if (barI) {
        var track = barI.parentElement.clientWidth, w = Math.max(40, track * band.clientWidth / band.scrollWidth);
        barI.style.width = w + 'px'; barI.style.transform = 'translateX(' + (p * (track - w)).toFixed(1) + 'px)';
      }
      if (prev) prev.disabled = x <= 2;
      if (next) next.disabled = x >= max - 2;
    }
    function req() { if (!raf) { raf = true; requestAnimationFrame(update); } }
    band.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    window.addEventListener('load', req);
    update();
    if (prev) prev.addEventListener('click', function () { band.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { band.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    band.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { band.scrollBy({ left: step() / 2, behavior: 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { band.scrollBy({ left: -step() / 2, behavior: 'smooth' }); e.preventDefault(); }
    });

    /* glisser à la souris, avec un peu d'élan (au doigt, le défilement natif s'en charge) */
    var down = false, moved = false, sx = 0, sl = 0, lastX = 0, lastT = 0, v = 0;
    band.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = lastX = e.clientX; sl = band.scrollLeft; lastT = performance.now(); v = 0;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; band.classList.add('is-drag'); }
      if (!moved) return;
      band.scrollLeft = sl - dx;
      var now = performance.now(); if (now > lastT) v = (e.clientX - lastX) / (now - lastT);
      lastX = e.clientX; lastT = now; e.preventDefault();
    });
    window.addEventListener('pointerup', function () {
      if (!down) return; down = false;
      if (moved) {
        band.classList.remove('is-drag');
        band.scrollBy({ left: -v * 260, behavior: reduce ? 'auto' : 'smooth' });
        setTimeout(function () { moved = false; }, 0);
      }
    });
    band.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    band.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  /* ------------------------------------------------------------ onglets de la carte */
  (function () {
    var list = $('[data-tabs]'); if (!list) return;
    var tabs = $$('[role="tab"]', list);
    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = d.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panel) { panel.hidden = !on; panel.classList.toggle('is-on', on); }
      });
      if (focus) tab.focus();
      if (list.scrollWidth > list.clientWidth) list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      measure();
    }
    tabs.forEach(function (t) { var p = d.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = t.getAttribute('aria-selected') !== 'true'; });
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); activate(n, true); }
      });
    });
    $$('[data-tab-link]').forEach(function (a) {
      a.addEventListener('click', function () { var t = d.getElementById('tab-' + a.getAttribute('data-tab-link')); if (t) activate(t, false); });
    });
  })();

  /* ------------------------------------------------------------ lien actif dans la barre */
  (function () {
    var links = $$('.bar__nav a'); if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {}; links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var a = map[e.target.id]; if (a) a.classList.toggle('is-here', e.isIntersecting); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) so.observe(s); });
  })();

  /* ------------------------------------------------------------ suggestion de langue : discrète, une seule fois, jamais de redirection */
  (function () {
    var KEY = 'au119-lang', seen = false;
    try { seen = !!window.localStorage.getItem(KEY); } catch (e) {}
    var remember = function () { try { window.localStorage.setItem(KEY, '1'); } catch (e) {} };
    $$('a[hreflang]').forEach(function (a) { a.addEventListener('click', remember); });
    if (seen) return;
    var nav = String((navigator.languages && navigator.languages[0]) || navigator.language || '').slice(0, 2).toLowerCase();
    if (!nav) return;
    var want = (nav === 'fr' || nav === 'de' || nav === 'en') ? nav : 'en';   // autres langues : on propose l'anglais
    if (want === lang) return;
    var link = $('.menu a[hreflang="' + want + '"]') || $('a[hreflang="' + want + '"]'); if (!link) return;
    var T = { fr: ['Version française', 'Fermer'], en: ['English version', 'Close'], de: ['Deutsche Version', 'Schließen'] }[want];
    var box = d.createElement('div'); box.className = 'langhint'; box.setAttribute('lang', want);
    var a = d.createElement('a'); a.className = 'chip'; a.href = link.getAttribute('href'); a.setAttribute('hreflang', want);
    a.innerHTML = '<span></span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    a.firstChild.textContent = T[0];
    var x = d.createElement('button'); x.type = 'button'; x.className = 'langhint__x'; x.setAttribute('aria-label', T[1]); x.textContent = '×';
    box.appendChild(a); box.appendChild(x); body.appendChild(box);
    var gone = false;
    var hide = function () { if (gone) return; gone = true; box.classList.remove('is-on'); remember(); setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 700); };
    a.addEventListener('click', remember);
    x.addEventListener('click', hide);
    // elle n'apparaît qu'une fois le premier écran dépassé : elle ne recouvre jamais le bouton « Voir la carte »
    var shown = false, show = function () {
      if (shown || window.pageYOffset < 160) return;
      shown = true; window.removeEventListener('scroll', show);
      box.classList.add('is-on'); setTimeout(hide, 16000);
    };
    window.addEventListener('scroll', show, { passive: true }); show();
  })();

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  // Tout s'est installé sans erreur : la page garde ses animations. (Sinon, 4,5 s après le début du chargement,
  // le petit script de l'en-tête retire la classe « js » et tout le contenu s'affiche simplement, sans rien attendre.)
  root.classList.add('ready');
})();
