/* Au 119 — interactions. Aucun module externe. */
(function () {
  'use strict';
  var d = document, root = d.documentElement, body = d.body;
  var lang = body.getAttribute('data-lang') || 'fr';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (v, a, b) { v = clamp((v - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); };

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
    var mm = (t.m < 10 ? '0' : '') + t.m;
    if (lang === 'en') { var h = t.h % 12 || 12; return h + ':' + mm + (t.h < 12 ? ' am' : ' pm'); }
    if (lang === 'de') return t.h + ':' + mm;
    return t.h + ' h ' + mm;
  }
  function refreshStatus() {
    var t = paris(), open = isOpen(t);
    $$('[data-status]').forEach(function (el) {
      el.classList.toggle('is-open', open);
      var txt = $('[data-status-text]', el);
      if (txt) txt.textContent = el.getAttribute(open ? 'data-o' : 'data-c');
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
      l.setAttribute('y1', 12); l.setAttribute('y2', big ? 20 : 15);
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
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ------------------------------------------------------------ apparitions */
  var revealSel = '[data-fade], [data-lines], [data-img], [data-rise], .band';
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    $$(revealSel).forEach(function (el) { io.observe(el); });
  } else {
    $$(revealSel).forEach(function (el) { el.classList.add('in'); });
  }

  /* ------------------------------------------------------------ intro du hero : la gravure, puis la photo */
  (function () {
    var hero = $('.hero'), photo = $('.hero__photo'); if (!hero) return;
    var done = false, go = function () { if (done) return; done = true; requestAnimationFrame(function () { hero.classList.add('is-in'); }); };
    if (!photo || photo.complete) go(); else { photo.addEventListener('load', go); photo.addEventListener('error', go); }
    setTimeout(go, 1600);
  })();

  /* ------------------------------------------------------------ parallaxe et fondu photo -> gravure */
  var pars = $$('[data-par]').map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-par')) || 0, y: 0, h: 0 }; });
  var inner = $$('[data-par-in]').map(function (el) { return { el: el, k: parseFloat(el.getAttribute('data-par-in')) || 0, y: 0, h: 0 }; });
  var heroPhoto = $('.hero__photo'), heroGrav = $('.hero__gravure'), heroW = $('.hero__w');
  var vh = window.innerHeight, ticking = false;

  function measure() {
    vh = window.innerHeight;
    var sy = window.pageYOffset;
    pars.concat(inner).forEach(function (p) {
      var host = p.el.hasAttribute('data-par-in') ? p.el.parentElement : p.el;
      var prev = p.el.style.getPropertyValue('--py');
      if (!p.el.hasAttribute('data-par-in')) p.el.style.setProperty('--py', '0px');
      var r = host.getBoundingClientRect();
      p.y = r.top + sy; p.h = r.height;
      if (!p.el.hasAttribute('data-par-in') && prev) p.el.style.setProperty('--py', prev);
    });
  }
  function frame() {
    ticking = false;
    var sy = window.pageYOffset;
    if (bar) bar.classList.toggle('is-solid', sy > 24);
    if (reduce) return;
    var hp = clamp(sy / (vh * 0.8), 0, 1);
    if (heroPhoto && sy < vh * 1.4) {
      heroPhoto.style.opacity = (1 - smooth(hp, 0.22, 0.95)).toFixed(3);
      var drift = (hp * 4).toFixed(2) + '%';
      heroPhoto.style.translate = '0 ' + drift; if (heroGrav) heroGrav.style.translate = '0 ' + drift;
      if (heroW) heroW.style.translate = '0 ' + (-hp * 10).toFixed(2) + '%';
    }
    var mid = sy + vh / 2;
    for (var i = 0; i < pars.length; i++) {
      var p = pars[i];
      if (p.y > sy + vh * 1.4 || p.y + p.h < sy - vh * 0.4) continue;
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
  window.addEventListener('resize', function () { measure(); onScroll(); });
  window.addEventListener('load', function () { measure(); onScroll(); });
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
      var max = band.scrollWidth - band.clientWidth, x = band.scrollLeft, p = max > 0 ? x / max : 0;
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

    /* glisser à la souris, avec un peu d'élan */
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

  /* ------------------------------------------------------------ vidéos : lecture seulement à l'écran */
  (function () {
    var vids = $$('[data-video]'); if (!vids.length) return;
    if (reduce || !('IntersectionObserver' in window)) { vids.forEach(function (v) { v.controls = true; }); return; }
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
      });
    }, { threshold: 0.3 });
    vids.forEach(function (v) { vo.observe(v); });
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

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();
})();
