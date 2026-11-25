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
      var cs = getComputedStyle(stage), fs = parseFloat(cs.fontSize);
      var avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      var ww = el.getBoundingClientRect().width;
      if (ww > 0 && avail > 0) stage.style.fontSize = (fs * avail / ww).toFixed(2) + 'px';
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

  /* ------------------------------------------------------------ apparitions */
  var revealSel = '[data-fade], [data-lines], [data-img], [data-rise], [data-sticker], .band';
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    $$(revealSel).forEach(function (el) { io.observe(el); });
  } else {
    $$(revealSel).forEach(function (el) { el.classList.add('in'); });
  }

  /* ------------------------------------------------------------ hero : la gravure, puis la photo, puis le film */
  var hero = $('.hero'), heroLive = $('[data-hero-live]'), heroMedia = $('[data-hero-media]'), heroW = $('.hero__w'), heroVid = $('[data-hero-video]');
  var heroStarted = false, heroVisible = true, heroAway = false;
  var gestureQueue = [];                                 // vidéos refusées par le navigateur (mode économie d'énergie) : relancées au premier geste
  function play(v) {
    var p; try { p = v.play(); } catch (e) { return; }
    if (p && p.catch) p.catch(function () { if (gestureQueue.indexOf(v) < 0) gestureQueue.push(v); });
  }
  (function () {
    if (!hero) return;
    var photo = $('.hero__photo'), okImg = !photo || photo.complete, okFont = false, done = false;
    function go() { if (done) return; done = true; fitWords(true); requestAnimationFrame(function () { hero.classList.add('is-in'); }); }
    function check() { if (okImg && okFont) go(); }
    if (photo && !photo.complete) { photo.addEventListener('load', function () { okImg = true; check(); }); photo.addEventListener('error', function () { okImg = true; check(); }); }
    fontsReady.then(function () { okFont = true; check(); });
    setTimeout(go, 1700);
    if (!heroVid || reduce || saveData) return;
    function start() {
      if (heroStarted) return; heroStarted = true;
      heroVid.addEventListener('playing', function () { heroVid.classList.add('is-playing'); });
      heroVid.src = heroVid.getAttribute('data-src');
      heroVid.load();
      if (heroVisible && !heroAway) play(heroVid);
    }
    if (d.readyState === 'complete') setTimeout(start, 900); else window.addEventListener('load', function () { setTimeout(start, 900); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        heroVisible = es[0].isIntersecting;
        if (!heroStarted) return;
        if (heroVisible && !heroAway) play(heroVid); else heroVid.pause();
      }, { threshold: 0.05 }).observe(hero);
    }
  })();

  /* ------------------------------------------------------------ parallaxe, fondu photo -> gravure, barre */
  var pars = $$('[data-par]').map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-par')) || 0, y: 0, h: 0 }; });
  var inner = $$('[data-par-in]').map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-par-in')) || 0, y: 0, h: 0 }; });
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
    inner.forEach(function (q) {
      var r = q.el.parentElement.getBoundingClientRect();
      q.y = r.top + sy; q.h = r.height;
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
        if (heroStarted) { if (away) heroVid.pause(); else if (heroVisible) play(heroVid); }
      }
      heroLive.style.opacity = (1 - smooth(hp, 0.3, 0.98)).toFixed(3);
      if (heroMedia) heroMedia.style.scale = (1 + hp * 0.07).toFixed(4);
      if (heroW) heroW.style.translate = '0 ' + (-hp * 12).toFixed(2) + '%';
    }
    var mid = sy + vh / 2;
    for (var i = 0; i < pars.length; i++) {
      var p = pars[i];
      if (p.y > sy + vh * 1.3 || p.y + p.h < sy - vh * 0.3) continue;
      p.el.style.setProperty('--py', ((p.y + p.h / 2 - mid) * -p.k).toFixed(1) + 'px');
    }
    for (var j = 0; j < inner.length; j++) {
      var q = inner[j];
      if (q.y > sy + vh * 1.2 || q.y + q.h < sy - vh * 0.2) continue;
      var rel = clamp((q.y + q.h / 2 - mid) / (vh / 2 + q.h / 2), -1, 1);
      q.el.style.translate = '0 ' + (rel * -q.k * 100).toFixed(2) + '%';
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
    var bxs = $$('[data-bx]', band), raf = false;

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
      if (reduce) return;
      var bw = band.clientWidth, br = band.getBoundingClientRect().left;
      for (var i = 0; i < bxs.length; i++) {
        var card = bxs[i].parentElement, r = card.getBoundingClientRect();
        if (r.right < br - 200 || r.left > br + bw + 200) continue;
        var rel = clamp((r.left + r.width / 2 - (br + bw / 2)) / bw, -1, 1);
        bxs[i].style.transform = 'translate3d(' + (rel * -r.width * 0.07).toFixed(1) + 'px,0,0)';
      }
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

  /* ------------------------------------------------------------ films : chargés à l'approche, lus seulement à l'écran, libérés quand ils sont loin */
  (function () {
    var vids = $$('[data-video]');
    // sans script, la balise <source> laisse le film lisible à la main ; avec script, c'est nous qui chargeons et libérons
    vids.forEach(function (v) { var so = $('source', v); if (so) { v.setAttribute('data-src', so.getAttribute('src')); v.removeChild(so); } });
    function load(v) { if (!v.getAttribute('src')) v.src = v.getAttribute('data-src'); }
    if (reduce || saveData || !('IntersectionObserver' in window)) {
      // moins de mouvement ou économie de données : rien ne démarre tout seul ; les grands films gardent un bouton de lecture, les assiettes restent des photos
      vids.forEach(function (v) { if (v.getAttribute('data-video') !== 'quiet') { load(v); v.controls = true; } });
      return;
    }
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { v.setAttribute('data-on', '1'); load(v); play(v); } else { v.removeAttribute('data-on'); v.pause(); }
      });
    }, { threshold: 0.25 });
    // loin de l'écran, le film rend son décodeur (un téléphone n'en a que quelques-uns) : l'affiche, identique à la première image, reste en place
    var far = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (!e.isIntersecting && v.getAttribute('src')) { v.pause(); v.removeAttribute('src'); try { v.load(); } catch (err) {} }
      });
    }, { rootMargin: '150% 0px 150% 0px' });
    vids.forEach(function (v) { vo.observe(v); far.observe(v); });
    var unlock = function () {
      var q = gestureQueue.splice(0, gestureQueue.length);
      q.forEach(function (v) { if (v === heroVid ? (heroVisible && !heroAway) : v.hasAttribute('data-on')) play(v); });
    };
    ['pointerdown', 'touchend', 'keydown'].forEach(function (ev) { window.addEventListener(ev, unlock, { passive: true }); });
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
})();
