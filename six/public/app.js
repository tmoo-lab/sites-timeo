/* SIX — logique de l'app. Vanilla JS, aucune dépendance. */
(function () {
'use strict';
const C = window.SIX_CONTENT, A = window.SIX_AUDIO;
const BUILD = '2026-11-09.1';

/* ================= utilitaires ================= */
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseYmd = s => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 864e5);
const today = () => ymd(new Date());
const frDate = s => { const t = parseYmd(s).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); return t.charAt(0).toUpperCase() + t.slice(1); };
const frShort = s => parseYmd(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtMs = ms => { const s = Math.ceil(ms / 1000); return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
const I = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
  flame: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 4 5 6 5 11a5 5 0 01-10 0c0-2 1-3 1-3s0 3 2 3c1 0 2-1 2-2 0-3-2-5 0-9z"/></svg>',
  chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="13" height="11" rx="2"/><path d="M16 11l5-3v9l-5-3z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15V9l5.2 3z"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10v4h4l5 4V6l-5 4z"/><path d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11"/></svg>',
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>'
};
const yt = (q, label) => `<a class="ytlink" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(q)}">${I.yt}${esc(label || 'Voir des tutos sur YouTube')}</a>`;

let toastT = null;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2200); }

/* ================= état ================= */
const LS = 'six2', LS_CODE = 'six-code', LS_SRV = 'six-server-updated', LS_SEEDED = 'six-seeded';
/* Progression déjà faite dans la première version (artefact Claude) */
const SEED = { startDate: '2026-11-08', days: { '2026-11-09': { reps: { ita: true }, xp: 10 } } };

function defaultState() {
  return { v: 2, startDate: today(), italianWords: 0, paliers: { frontlever: 0, guitare: 0, chanson: 0, jjb: 0, magie: 0 }, palierDates: {}, days: {}, boss: {}, drills: {}, holds: [], words: [], jjbLog: [], palierVideos: {}, memoTests: [], updatedAt: 0 };
}
function migrate(s) {
  const d = defaultState(); if (!s || typeof s !== 'object') return d;
  const o = Object.assign({}, d, s);
  o.paliers = Object.assign({}, d.paliers, s.paliers || {});
  ['palierDates', 'days', 'boss', 'drills', 'palierVideos'].forEach(k => { o[k] = (s[k] && typeof s[k] === 'object') ? s[k] : {}; });
  ['holds', 'words', 'jjbLog', 'memoTests'].forEach(k => { o[k] = Array.isArray(s[k]) ? s[k] : []; });
  if (!o.startDate) o.startDate = today();
  o.v = 2; return o;
}
/* Fusion de deux états (deux appareils) : on ne perd jamais une progression. */
function merge(a, b) {
  a = migrate(a); b = migrate(b); const m = defaultState();
  m.startDate = a.startDate < b.startDate ? a.startDate : b.startDate;
  m.italianWords = Math.max(a.italianWords || 0, b.italianWords || 0);
  for (const q in m.paliers) m.paliers[q] = Math.max(a.paliers[q] || 0, b.paliers[q] || 0);
  const pdk = new Set([...Object.keys(a.palierDates), ...Object.keys(b.palierDates)]);
  pdk.forEach(k => { const x = a.palierDates[k], y = b.palierDates[k]; m.palierDates[k] = (x && y) ? (x < y ? x : y) : (x || y); });
  const dk = new Set([...Object.keys(a.days), ...Object.keys(b.days)]);
  dk.forEach(k => { const reps = Object.assign({}, (a.days[k] || {}).reps || {}, (b.days[k] || {}).reps || {}); m.days[k] = { reps, xp: Math.max((a.days[k] || {}).xp || 0, (b.days[k] || {}).xp || 0) }; });
  const bk = new Set([...Object.keys(a.boss), ...Object.keys(b.boss)]); bk.forEach(k => { m.boss[k] = !!(a.boss[k] || b.boss[k]); });
  const drk = new Set([...Object.keys(a.drills), ...Object.keys(b.drills)]); drk.forEach(k => { m.drills[k] = Math.max(a.drills[k] || 0, b.drills[k] || 0); });
  const byId = (arr, key) => { const o = {}; arr.forEach(x => { if (x && x[key]) o[x[key]] = x; }); return o; };
  const ha = byId(a.holds, 'id'), hb = byId(b.holds, 'id'); m.holds = Object.values(Object.assign({}, ha, hb)).sort((x, y) => (x.t || 0) - (y.t || 0));
  const wa = byId(a.words, 'id'), wb = byId(b.words, 'id'); const wk = new Set([...Object.keys(wa), ...Object.keys(wb)]);
  m.words = [...wk].map(k => { const x = wa[k], y = wb[k]; if (!x) return y; if (!y) return x; return (y.box > x.box || (y.box === x.box && (y.r || 0) > (x.r || 0))) ? y : x; }).filter(w => !w.deleted);
  const ja = byId(a.jjbLog, 'id'), jb = byId(b.jjbLog, 'id'); m.jjbLog = Object.values(Object.assign({}, ja, jb)).sort((x, y) => (x.d < y.d ? -1 : 1));
  const ta = byId(a.memoTests, 'id'), tb = byId(b.memoTests, 'id'); m.memoTests = Object.values(Object.assign({}, ta, tb)).sort((x, y) => (x.t || 0) - (y.t || 0));
  m.palierVideos = Object.assign({}, a.palierVideos, b.palierVideos);
  m.updatedAt = Math.max(a.updatedAt || 0, b.updatedAt || 0);
  for (const k in m.days) recomputeDay(m, k);
  return m;
}
let st = defaultState(), loaded = false;

/* ---- sauvegarde locale + synchro serveur ---- */
let code = null, serverUpdatedAt = null, saveT = null, syncing = false, pendingPush = false;
function loadLocal() { try { const raw = localStorage.getItem(LS); if (raw) st = migrate(JSON.parse(raw)); } catch (_) { } }
function saveLocal() { try { localStorage.setItem(LS, JSON.stringify(st)); } catch (_) { } }
function changed() { st.updatedAt = Date.now(); saveLocal(); clearTimeout(saveT); saveT = setTimeout(push, 900); }
function setNote(msg) { const el = $('#note'); if (el) el.textContent = msg || ''; }
async function api(method, body) {
  const r = await fetch('/api/state', { method, headers: { 'x-six-code': code, 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
}
async function pull() {
  if (!code || !navigator.onLine) return;
  try {
    const { status, data } = await api('GET');
    if (status !== 200) throw new Error('get ' + status);
    if (data.state) {
      const before = JSON.stringify(st);
      const merged = merge(st, data.state);
      serverUpdatedAt = data.updatedAt; try { localStorage.setItem(LS_SRV, serverUpdatedAt || ''); } catch (_) { }
      st = merged; saveLocal();
      if (JSON.stringify(merged) !== JSON.stringify(migrate(data.state))) await push();
      if (JSON.stringify(st) !== before) renderAll();
      setNote('');
    } else {
      serverUpdatedAt = null; await push();
    }
  } catch (e) { setNote('Hors ligne, sauvegardé sur cet appareil'); }
}
async function push() {
  if (!code) return; if (!navigator.onLine) { pendingPush = true; setNote('Hors ligne, sauvegardé sur cet appareil'); return; }
  if (syncing) { pendingPush = true; return; }
  syncing = true;
  try {
    let { status, data } = await api('PUT', { state: st, baseUpdatedAt: serverUpdatedAt });
    if (status === 409 && data.state) {
      st = merge(st, data.state); saveLocal(); renderAll();
      ({ status, data } = await api('PUT', { state: st, baseUpdatedAt: data.updatedAt }));
    }
    if (status === 200 && data.ok) { serverUpdatedAt = data.updatedAt; try { localStorage.setItem(LS_SRV, serverUpdatedAt); } catch (_) { } setNote(''); $('#syncstamp') && ($('#syncstamp').textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })); }
    else if (status === 401) setNote('Code de synchro refusé, vérifie-le dans Réglages');
    else throw new Error('put ' + status);
  } catch (e) { pendingPush = true; setNote('Hors ligne, sauvegardé sur cet appareil'); }
  finally { syncing = false; if (pendingPush && navigator.onLine) { pendingPush = false; setTimeout(push, 1500); } }
}
window.addEventListener('online', () => { setNote(''); pull(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') pull(); });

/* ================= vidéos (IndexedDB, sur l'appareil) ================= */
const MDB = { db: null,
  open() { return new Promise((res, rej) => { if (this.db) return res(this.db); const r = indexedDB.open('six-media', 1); r.onupgradeneeded = () => { r.result.createObjectStore('videos', { keyPath: 'id' }); }; r.onsuccess = () => { this.db = r.result; res(this.db); }; r.onerror = () => rej(r.error); }); },
  async put(v) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('videos', 'readwrite'); tx.objectStore('videos').put(v); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); },
  async all() { const db = await this.open(); return new Promise((res, rej) => { const r = db.transaction('videos').objectStore('videos').getAll(); r.onsuccess = () => res((r.result || []).sort((a, b) => b.created - a.created)); r.onerror = () => rej(r.error); }); },
  async del(id) { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('videos', 'readwrite'); tx.objectStore('videos').delete(id); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }); }
};
let videoCache = null; const objUrls = [];
async function videos() { if (!videoCache) { try { videoCache = await MDB.all(); } catch (_) { videoCache = []; } } return videoCache; }
function freeUrls() { objUrls.splice(0).forEach(u => URL.revokeObjectURL(u)); }

/* ================= dérivés ================= */
function sessionFor(S, dateStr) {
  const d = parseYmd(dateStr), dow = d.getDay();
  const since = Math.max(0, daysBetween(S.startDate, dateStr)), week = Math.floor(since / 7) + 1;
  const reps = [], fl = S.paliers.frontlever || 0, g = S.paliers.guitare || 0;
  const flFocus = ['teste le tuck et note ton temps', 'holds tuck, 5 séries de 5 à 10 s', 'tuck avancé, dos plat', 'une jambe tendue', 'straddle, jambes écartées', 'full, 5 séries de 5 s'][Math.min(fl, 5)];
  if ([1, 3, 5].includes(dow)) reps.push({ id: 'fl', q: 'frontlever', sec: 'seance', title: 'Skill front lever', meta: 'Début de séance, ' + flFocus, min: 15, xp: 15 });
  let gt = 'Accords · formes et changements', gm = 'Em puis Am puis C puis G. Chrono 1 min de changements', gs = 'accords';
  if (g >= 6) { gt = 'Bad State of Mind · mêmes accords'; gm = 'C Am Em G en boucle, version plus rock'; gs = 'chanson'; }
  else if (week >= 4 || g >= 4) { gt = 'Freakin’ Out · vitesse réelle'; gm = '124 BPM, filme-toi'; gs = 'chanson'; }
  else if (week === 3 || g >= 3) { gt = 'Par-dessus la chanson à 0,8'; gm = 'Spotify à 0,8, grille sous les yeux, on ne s’arrête pas'; gs = 'chanson'; }
  else if (week === 2 || g >= 2) { gt = 'Rythme · la boucle C Am Em G'; gm = 'Bas, bas-haut, haut-bas-haut. Métronome à 60'; gs = 'rythme'; }
  reps.push({ id: 'gtr', q: 'guitare', sec: gs, title: gt, meta: gm, min: 15, xp: 10 });
  if (week >= 3 || g >= 3) reps.push({ id: 'song', q: 'chanson', sec: 'test', title: 'Paroles · rappel actif', meta: 'Paroles cachées, tu chantes le refrain puis un couplet', min: 5, xp: 10 });
  reps.push({ id: 'ita', q: 'italien', sec: 'revision', title: 'Italien · 10 mots', meta: 'Du français vers l’italien, à voix haute', min: 5, xp: 10 });
  if (since < 14 || [2, 6].includes(dow)) reps.push({ id: 'mag', q: 'magie', sec: 'miroir', title: 'Tourniquet · miroir', meta: since < 14 ? 'Un vrai geste, un faux geste, en alternance' : 'Entretien, 5 minutes suffisent', min: 5, xp: 10 });
  if (dow === 4) reps.push({ id: 'jjb', q: 'jjb', sec: 'club', title: 'Grappling No-Gi · 19h', meta: 'Pôle des Arts Martiaux, Wintzenheim', min: 120, xp: 30, optional: true });
  if (dow === 0) reps.push({ id: 'rev', q: 'all', sec: '', title: 'Revue de la semaine', meta: 'Filme-toi, mets tes paliers à jour, attaque le boss', min: 10, xp: 10 });
  return { reps, week, since, dow };
}
function bossFor(week) { return week <= C.BOSSES.length ? C.BOSSES[week - 1] : C.EXTRA[(week - C.BOSSES.length - 1) % C.EXTRA.length]; }
function recomputeDay(S, dateStr) {
  const s = sessionFor(S, dateStr); const day = S.days[dateStr] || { reps: {}, xp: 0 };
  let xp = 0, all = true, any = false;
  for (const r of s.reps) { if (day.reps[r.id]) { xp += r.xp; any = true; } else if (!r.optional) all = false; }
  if (all && any) xp += 20; day.xp = xp;
  if (Object.keys(day.reps).length) S.days[dateStr] = day; else delete S.days[dateStr];
}
function italianAcquired() { return (st.italianWords || 0) + st.words.filter(w => (w.box || 0) >= 4).length; }
function totalXP() {
  let x = 0; for (const k in st.days) x += st.days[k].xp || 0;
  for (const q in st.paliers) x += (st.paliers[q] || 0) * 100;
  for (const k in st.boss) if (st.boss[k]) x += 150;
  x += italianAcquired() * 3; x += st.jjbLog.length * 20; return x;
}
const threshold = L => 25 * (L - 1) * (L + 4);
function levelFor(xp) { let L = 1; while (threshold(L + 1) <= xp) L++; return L; }
function beltName(L) { const belts = ['Blanche', 'Bleue', 'Violette', 'Marron', 'Noire']; const i = Math.min(Math.floor((L - 1) / 5), 4); const deg = (L - 1) % 5; const rom = ['', 'I', 'II', 'III', 'IV']; return belts[i] + (i < 4 && deg ? ' ' + rom[deg] : ''); }
const dayDone = k => ((st.days[k] || {}).xp || 0) > 0;
function currentStreak() {
  const t = today(); const start = parseYmd(st.startDate); let cur = parseYmd(t), run = 0, misses = 0, first = true, joker = false;
  while (cur >= start) { const k = ymd(cur); if (dayDone(k)) { run++; misses = 0; } else if (!(first && k === t)) { misses++; if (misses >= 2) break; joker = true; } first = false; cur = addDays(cur, -1); }
  return { run, joker: joker && run > 0, todayDone: dayDone(t) };
}
function bestStreak() { let cur = parseYmd(st.startDate); const end = parseYmd(today()); let run = 0, misses = 0, best = 0; while (cur <= end) { const k = ymd(cur); if (dayDone(k)) { run++; misses = 0; best = Math.max(best, run); } else { misses++; if (misses >= 2) run = 0; } cur = addDays(cur, 1); } return best; }
function questPct(q) { const Q = C.QUESTS[q]; if (Q.counter) return Math.min(100, Math.round(italianAcquired() / 2)); return Math.round(((st.paliers[q] || 0) / Q.paliers.length) * 100); }

/* ================= schémas SVG ================= */
const STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];
function chordSVG(name, w) {
  const ch = C.CHORDS[name]; w = w || 120;
  const X = i => 20 + i * 16, F = f => 30 + f * 26;
  let s = `<svg class="chord-svg" viewBox="0 0 120 152" width="${w}" role="img" aria-label="Diagramme de l’accord ${esc(ch.name)}">`;
  s += `<line class="nut" x1="19" y1="30" x2="101" y2="30"/>`;
  for (let f = 1; f <= 4; f++) s += `<line class="fret" x1="20" y1="${F(f)}" x2="100" y2="${F(f)}" stroke-width="1.5"/>`;
  for (let i = 0; i < 6; i++) s += `<line class="str" x1="${X(i)}" y1="30" x2="${X(i)}" y2="${F(4)}" stroke-width="${(1.1 + (5 - i) * 0.35).toFixed(2)}"/>`;
  ch.frets.forEach((fr, i) => {
    if (fr === -1) s += `<line class="x" x1="${X(i) - 4}" y1="16" x2="${X(i) + 4}" y2="24"/><line class="x" x1="${X(i) + 4}" y1="16" x2="${X(i) - 4}" y2="24"/>`;
    else if (fr === 0) s += `<circle class="o" cx="${X(i)}" cy="20" r="4"/>`;
    else { const y = 30 + (fr - 0.5) * 26; s += `<circle class="dot" cx="${X(i)}" cy="${y}" r="8.5"/><text class="dot-t" x="${X(i)}" y="${y + 4.5}" text-anchor="middle">${ch.fingers[i]}</text>`; }
  });
  STRING_NAMES.forEach((n, i) => s += `<text class="lbl" x="${X(i)}" y="148" text-anchor="middle">${n}</text>`);
  return s + '</svg>';
}
function chordReadSVG() {
  const ch = C.CHORDS.Am; const X = i => 20 + i * 16, F = f => 30 + f * 26;
  let s = `<svg class="chord-svg" viewBox="0 0 372 160" role="img" aria-label="Comment lire un diagramme d’accord">`;
  s += `<line class="nut" x1="19" y1="30" x2="101" y2="30"/>`;
  for (let f = 1; f <= 4; f++) s += `<line class="fret" x1="20" y1="${F(f)}" x2="100" y2="${F(f)}" stroke-width="1.5"/>`;
  for (let i = 0; i < 6; i++) s += `<line class="str" x1="${X(i)}" y1="30" x2="${X(i)}" y2="${F(4)}" stroke-width="${(1.1 + (5 - i) * 0.35).toFixed(2)}"/>`;
  ch.frets.forEach((fr, i) => {
    if (fr === -1) s += `<line class="x" x1="${X(i) - 4}" y1="16" x2="${X(i) + 4}" y2="24"/><line class="x" x1="${X(i) + 4}" y1="16" x2="${X(i) - 4}" y2="24"/>`;
    else if (fr === 0) s += `<circle class="o" cx="${X(i)}" cy="20" r="4"/>`;
    else { const y = 30 + (fr - 0.5) * 26; s += `<circle class="dot" cx="${X(i)}" cy="${y}" r="8.5"/><text class="dot-t" x="${X(i)}" y="${y + 4.5}" text-anchor="middle">${ch.fingers[i]}</text>`; }
  });
  STRING_NAMES.forEach((n, i) => s += `<text class="lbl" x="${X(i)}" y="148" text-anchor="middle">${n}</text>`);
  const ann = (x1, y1, x2, y2, tx, ty, t) => `<path class="arrow" d="M${x2} ${y2} L${x1} ${y1}"/><circle cx="${x1}" cy="${y1}" r="2" fill="var(--pen)"/><text class="annot" x="${tx}" y="${ty}" font-size="10">${t}</text>`;
  s += ann(X(0), 20, 126, 14, 130, 17, 'X = tu ne joues pas cette corde');
  s += ann(X(1), 20, 126, 34, 130, 37, 'O = corde à vide, tu la joues');
  s += ann(19, 30, 126, 54, 130, 57, 'Trait épais = le sillet, le haut du manche');
  s += ann(X(4), 43, 126, 76, 130, 79, 'Chiffre = le doigt (1 index, 2 majeur,');
  s += `<text class="annot" x="130" y="92" font-size="10">3 annulaire, 4 auriculaire)</text>`;
  s += ann(100, F(2), 126, 112, 130, 115, 'Ligne horizontale = une frette');
  s += ann(X(5), 148, 126, 140, 130, 143, 'Grosse corde à gauche, fine à droite');
  s += `<text class="lbl" x="130" y="158">E A D G B E = Mi La Ré Sol Si Mi</text>`;
  return s + '</svg>';
}
function neckSVG() {
  // tête (0-44) · noms des cordes (48-112) · sillet (116) · 5 cases (120-360)
  let s = `<svg viewBox="0 0 360 160" role="img" aria-label="Le manche vu de dessus quand tu joues">`;
  s += `<rect x="120" y="30" width="240" height="92" rx="3" fill="var(--sunk)" stroke="var(--line)"/>`;
  s += `<rect x="2" y="24" width="42" height="104" rx="8" fill="var(--sunk)" stroke="var(--line)"/>`;
  [0, 1, 2].forEach(i => { s += `<circle cx="12" cy="${42 + i * 28}" r="4.5" fill="none" stroke="var(--ink-3)"/><circle cx="34" cy="${42 + i * 28}" r="4.5" fill="none" stroke="var(--ink-3)"/>`; });
  s += `<rect x="115" y="30" width="5" height="92" fill="var(--ink)"/>`;
  for (let f = 1; f <= 5; f++) { const x = 120 + f * 48; s += `<line x1="${x}" y1="30" x2="${x}" y2="122" stroke="var(--ink-3)" stroke-width="2"/><text x="${x - 24}" y="136" text-anchor="middle" fill="var(--ink-3)" font-family="var(--f-mono)" font-size="10">case ${f}</text>`; }
  const names = ['Mi grave · 6', 'La · 5', 'Ré · 4', 'Sol · 3', 'Si · 2', 'Mi aigu · 1'];
  names.forEach((n, i) => { const y = 42 + i * 14; s += `<line x1="112" y1="${y}" x2="360" y2="${y}" stroke="var(--ink)" stroke-width="${(2.8 - i * 0.38).toFixed(2)}"/><text x="108" y="${y + 3}" text-anchor="end" fill="var(--ink-2)" font-family="var(--f-mono)" font-size="9">${n}</text>`; });
  s += `<text x="23" y="16" text-anchor="middle" fill="var(--pen-text)" font-size="10" font-weight="600">tête</text>`;
  s += `<text x="117" y="154" text-anchor="middle" fill="var(--pen-text)" font-size="10" font-weight="600">sillet</text>`;
  s += `<text x="356" y="16" text-anchor="end" fill="var(--pen-text)" font-size="10" font-weight="600">vers la caisse →</text>`;
  return s + '</svg>';
}
function flSVG(idx, w) {
  w = w || 132; const sh = [72, 60];
  const legs = {
    0: [[116, 78], [[98, 58], [124, 58]]],
    1: [[130, 60], [[132, 96], [100, 100]]],
    2: [[130, 60], [[170, 60], [205, 60]], [[150, 88], [120, 92]]],
    3: [[130, 60], [[168, 50], [204, 44]], [[168, 70], [204, 78]]],
    4: [[130, 60], [[170, 60], [206, 60]]]
  }[idx];
  const hip = legs[0];
  let s = `<svg class="fl-svg" viewBox="0 0 220 120" width="${w}" role="img" aria-label="Palier ${idx + 1}">`;
  s += `<line class="bar" x1="20" y1="14" x2="200" y2="14"/>`;
  s += `<line class="guide" x1="30" y1="60" x2="212" y2="60"/>`;
  s += `<path class="arm" d="M72 16 L72 ${sh[1]}"/>`;
  s += `<circle class="head" cx="52" cy="${idx === 0 ? 66 : 58}" r="9"/>`;
  s += `<path class="body" d="M${sh[0]} ${sh[1]} L${hip[0]} ${hip[1]}"/>`;
  for (let i = 1; i < legs.length; i++) { const [k, a] = legs[i]; s += `<path class="body" d="M${hip[0]} ${hip[1]} L${k[0]} ${k[1]} L${a[0]} ${a[1]}"/>`; }
  s += `<circle class="hip" cx="${hip[0]}" cy="${hip[1]}" r="4.5"/>`;
  return s + '</svg>';
}
function anglesSVG() {
  return `<svg class="angles" viewBox="0 0 300 170" role="img" aria-label="Où placer le public">
  <path class="ok" d="M150 150 L40 20 A140 140 0 0 1 260 20 Z"/>
  <path class="bad" d="M150 150 L0 120 L0 0 L40 20 Z"/>
  <circle class="you" cx="150" cy="150" r="10"/>
  <text class="lbl" x="150" y="60" text-anchor="middle">Public ici, en face</text>
  <text class="lbl2" x="150" y="74" text-anchor="middle">légèrement en dessous de tes mains, c’est parfait</text>
  <text class="lbl" x="34" y="100" text-anchor="start">Jamais là</text>
  <text class="lbl2" x="34" y="113" text-anchor="start">sur ta gauche, on voit</text>
  <text class="lbl2" x="34" y="125" text-anchor="start">la pièce tomber</text>
  <text class="lbl2" x="150" y="166" text-anchor="middle">toi (et personne debout derrière toi, ni au-dessus)</text>
  </svg>`;
}
/* Tourniquet : mains vues de tes yeux. t de 0 à 1. fake = faux geste */
function demoPhase(t) { return t < 0.45 ? 0 : t < 0.62 ? 1 : 2; }
const DEMO_CAPS = [
  ['La main droite arrive par-dessus, paume vers le bas. La pièce est bien visible entre le pouce et les doigts de la main gauche.', 'Exactement pareil. Rien ne change encore.'],
  ['Les doigts de la main droite recouvrent la pièce. Le pouce droit passe dessous, la main se referme sur la pièce.', 'Les doigts de la main droite recouvrent la pièce… et à cet instant le pouce gauche la lâche. Elle tombe dans le creux de la main gauche. La main droite se referme sur du vide.'],
  ['Le poing droit repart avec la pièce. Tes yeux le suivent.', 'Le poing droit repart « avec » la pièce. Tes yeux le suivent. La main gauche descend, molle, la pièce au creux des doigts.']
];
function handsSVG(t, fake) {
  const lerp = (a, b, u) => a + (b - a) * u, clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const ease = u => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  const coin0 = [96, 70];
  let rx, ry, closed = 0, coin = coin0.slice(), coinHidden = false, coinInLeft = false, gaze;
  if (t < 0.45) { const u = ease(t / 0.45); rx = lerp(178, 104, u); ry = lerp(30, 58, u); gaze = [coin0[0], coin0[1]]; }
  else if (t < 0.62) { const u = (t - 0.45) / 0.17; rx = 104; ry = 58; closed = u; if (fake) { coin = [lerp(coin0[0], 70, u), lerp(coin0[1], 106, u)]; coinInLeft = u > 0.4; } gaze = [rx, ry]; }
  else { const u = ease((t - 0.62) / 0.38); rx = lerp(104, 182, u); ry = lerp(58, 24, u); closed = 1; if (fake) { coin = [70, 106]; coinInLeft = true; coinHidden = true; } else { coin = [rx, ry + 6]; coinHidden = true; } gaze = [rx, ry]; }
  let s = `<svg class="hands" viewBox="0 0 200 150" role="img" aria-label="${fake ? 'Faux geste' : 'Vrai geste'}">`;
  // main gauche, paume vers le haut, doigts vers la droite
  s += `<ellipse class="palm" cx="62" cy="108" rx="32" ry="24"/>`;
  for (let i = 0; i < 4; i++) { const x = 84 + i * 6, y = 100 - i * 6; s += `<rect class="palm" x="${x - 7}" y="${y - 30}" width="14" height="40" rx="7" transform="rotate(${-62 + i * 7} ${x} ${y})"/>`; }
  s += `<rect class="palm" x="50" y="52" width="14" height="40" rx="7" transform="rotate(-28 57 72)"/>`; // pouce
  if (!coinHidden || (fake && coinInLeft)) {
    s += `<g opacity="${coinInLeft ? 0.9 : 1}"><circle class="coin" cx="${coin[0]}" cy="${coin[1]}" r="11"/><text class="coin-t" x="${coin[0]}" y="${coin[1] + 3.5}" text-anchor="middle">2€</text></g>`;
  }
  // main droite, paume vers le bas, qui vient prendre
  const open = 1 - closed;
  s += `<g transform="translate(${rx} ${ry})">`;
  s += `<ellipse class="palm" cx="0" cy="0" rx="${24 + 5 * open}" ry="${19 + 2 * open}"/>`;
  for (let i = 0; i < 4; i++) { const ang = -142 + i * 15; const len = 32 - closed * 18; s += `<rect class="palm" x="-7" y="${-len}" width="14" height="${len + 8}" rx="7" transform="rotate(${ang + closed * 22})"/>`; }
  s += `<rect class="palm" x="-7" y="-26" width="14" height="32" rx="7" transform="rotate(${34 - closed * 56})"/>`;
  if (!fake && coinHidden) s += `<circle class="coin" cx="0" cy="7" r="7" opacity=".9"/>`;
  s += `</g>`;
  s += `<circle class="eye" cx="${clamp(gaze[0], 12, 188)}" cy="9" r="4"/><text class="label" x="${clamp(gaze[0], 30, 170)}" y="22" text-anchor="middle">tes yeux</text>`;
  if (fake && coinInLeft && coinHidden) s += `<text class="label" x="62" y="146" text-anchor="middle">pièce cachée ici</text>`;
  return s + '</svg>';
}
function lineChart(points, opts) {
  opts = opts || {}; const W = 320, H = 120, P = { l: 28, r: 10, t: 10, b: 22 };
  if (!points.length) return `<div class="empty">${esc(opts.empty || 'Pas encore de données.')}</div>`;
  const xs = points.map((_, i) => i), ys = points.map(p => p.v);
  const ymax = Math.max(opts.max || 0, ...ys) || 1, n = Math.max(1, xs.length - 1);
  const X = i => P.l + (W - P.l - P.r) * (n === 0 ? 0.5 : i / n), Y = v => H - P.b - (H - P.b - P.t) * (v / ymax);
  let d = '', area = `M${X(0)} ${H - P.b} `;
  points.forEach((p, i) => { d += (i ? 'L' : 'M') + X(i) + ' ' + Y(p.v) + ' '; area += `L${X(i)} ${Y(p.v)} `; });
  area += `L${X(points.length - 1)} ${H - P.b} Z`;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || 'Graphique')}">`;
  [0, 0.5, 1].forEach(f => { const v = Math.round(ymax * f); s += `<line class="ax" x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}"/><text class="lbl" x="${P.l - 4}" y="${Y(v) + 3}" text-anchor="end">${v}</text>`; });
  s += `<path class="area" d="${area}"/><path class="ln" d="${d}"/>`;
  points.forEach((p, i) => { s += `<circle class="pt" cx="${X(i)}" cy="${Y(p.v)}" r="3"/>`; });
  const step = Math.max(1, Math.ceil(points.length / 6));
  points.forEach((p, i) => { if (i % step === 0 || i === points.length - 1) s += `<text class="lbl" x="${X(i)}" y="${H - 6}" text-anchor="middle">${esc(p.l)}</text>`; });
  return s + '</svg>';
}

/* ================= outils vivants (à arrêter quand on quitte une vue) ================= */
const live = [];
function onLeave(fn) { live.push(fn); }
function stopLive() { live.splice(0).forEach(f => { try { f(); } catch (_) { } }); }

/* minuteur de rep (écran du jour) */
let timer = null;
function startTimer(rep) {
  stopTimer(false); A.unlock();
  timer = { id: rep.id, endsAt: Date.now() + rep.min * 60000, iv: null };
  timer.iv = setInterval(() => {
    if (!timer) return; const left = timer.endsAt - Date.now();
    const el = document.querySelector('[data-timer="' + timer.id + '"]'); if (el) el.textContent = fmtMs(Math.max(0, left));
    if (left <= 0) { const id = timer.id; stopTimer(false); A.done(); const day = st.days[today()] || { reps: {} }; if (!day.reps[id]) toggleRep(id, true); else renderToday(); }
  }, 250);
  renderToday();
}
function stopTimer(rerender) { if (timer) { clearInterval(timer.iv); timer = null; } if (rerender !== false) renderToday(); }

/* confettis */
function burst() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#fx'), ctx = c.getContext('2d'); const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cs = getComputedStyle(document.documentElement); const pen = cs.getPropertyValue('--pen').trim() || '#D8286E', ink = cs.getPropertyValue('--ink').trim() || '#1C181D';
  const ps = []; for (let i = 0; i < 70; i++) ps.push({ x: innerWidth / 2 + (Math.random() - .5) * 60, y: innerHeight * 0.45, vx: (Math.random() - .5) * 9, vy: -Math.random() * 9 - 3, r: 2 + Math.random() * 4, c: Math.random() < .8 ? pen : ink, a: 1 });
  (function step() { ctx.clearRect(0, 0, innerWidth, innerHeight); let alive = false; for (const p of ps) { p.vy += .28; p.x += p.vx; p.y += p.vy; p.a -= .012; if (p.a > 0) { alive = true; ctx.globalAlpha = p.a; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); } } ctx.globalAlpha = 1; if (alive) requestAnimationFrame(step); else ctx.clearRect(0, 0, innerWidth, innerHeight); })();
}

/* ================= caméra ================= */
function openCamera(opts) {
  opts = opts || {}; const facing = opts.facing || 'environment'; const mirror = facing === 'user';
  const root = document.createElement('div'); root.className = 'cam';
  root.innerHTML = `<div class="hd"><button data-c="close">Fermer</button><b>${esc(opts.title || 'Filmer')}</b><button data-c="flip">Retourner</button></div>
    <div class="stage"><video id="camv" autoplay muted playsinline class="${mirror ? 'mirror' : ''}"></video>${opts.guide ? '<div class="guide"></div>' : ''}<div class="rec" hidden><i></i><span id="camt">00:00</span></div></div>
    <div class="ctl"><button class="txt" data-c="import">Importer</button><button class="shutter" data-c="rec" aria-label="Enregistrer"><i></i></button><span></span></div>
    <div class="hint">${esc(opts.hint || '')}</div>`;
  document.body.appendChild(root); document.body.style.overflow = 'hidden';
  let stream = null, rec = null, chunks = [], t0 = 0, tIv = null, curFacing = facing, blob = null, mime = '';
  const v = root.querySelector('#camv');
  const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'video/*'; fileInput.hidden = true; root.appendChild(fileInput);
  function cleanup() { if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; clearInterval(tIv); }
  function close() { cleanup(); root.remove(); document.body.style.overflow = ''; }
  function showFallback(msg) {
    cleanup(); root.querySelector('.stage').innerHTML = `<div class="fallback"><div>${esc(msg)}</div><label>${I.cam} Filmer avec l’appareil photo<input type="file" accept="video/*" capture="${curFacing}" id="camfile"></label><div class="muted" style="color:rgba(255,255,255,.6)">La vidéo revient directement dans SIX.</div></div>`;
    root.querySelector('.ctl').hidden = true;
    root.querySelector('#camfile').addEventListener('change', e => { const f = e.target.files[0]; if (f) gotBlob(f, f.type); });
  }
  async function start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return showFallback('La caméra en direct n’est pas disponible ici.');
    try {
      cleanup();
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: curFacing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: !!opts.audio });
      v.srcObject = stream; v.classList.toggle('mirror', curFacing === 'user'); await v.play().catch(() => { });
    } catch (e) { showFallback(e && e.name === 'NotAllowedError' ? 'Accès caméra refusé. Tu peux l’autoriser dans les réglages, ou filmer avec l’appareil photo.' : 'Impossible d’ouvrir la caméra en direct.'); }
  }
  function pickMime() { const c = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']; for (const m of c) { try { if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m; } catch (_) { } } return ''; }
  function toggleRec() {
    if (!stream) return;
    if (rec && rec.state === 'recording') { rec.stop(); return; }
    if (!window.MediaRecorder) return showFallback('L’enregistrement direct n’est pas supporté ici.');
    mime = pickMime(); chunks = [];
    try { rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); } catch (e) { return showFallback('L’enregistrement direct n’est pas supporté ici.'); }
    rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    rec.onstop = () => { const b = new Blob(chunks, { type: rec.mimeType || mime || 'video/mp4' }); clearInterval(tIv); gotBlob(b, b.type); };
    rec.start(250); t0 = Date.now(); A.tick();
    root.querySelector('.rec').hidden = false; root.querySelector('.shutter').classList.add('on');
    tIv = setInterval(() => { root.querySelector('#camt').textContent = fmtMs(Date.now() - t0 + 999); }, 250);
  }
  function gotBlob(b, type) {
    blob = b; cleanup(); const url = URL.createObjectURL(b);
    root.querySelector('.stage').innerHTML = `<video src="${url}" controls playsinline style="object-fit:contain" class="${curFacing === 'user' && opts.mirrorPlayback ? 'mirror' : ''}"></video>`;
    root.querySelector('.ctl').hidden = true; root.querySelector('.hint').hidden = true;
    const after = document.createElement('div'); after.className = 'after';
    after.innerHTML = `<button class="pill" data-c="retry">Refaire</button><button class="pill primary" data-c="keep">Garder</button>`;
    root.appendChild(after);
    after.addEventListener('click', async e => {
      const b2 = e.target.closest('button'); if (!b2) return;
      if (b2.dataset.c === 'retry') { after.remove(); URL.revokeObjectURL(url); root.querySelector('.stage').innerHTML = `<video id="camv2" autoplay muted playsinline></video>`; root.querySelector('.ctl').hidden = false; root.querySelector('.hint').hidden = false; root.querySelector('.rec').hidden = true; root.querySelector('.shutter').classList.remove('on'); const nv = root.querySelector('#camv2'); nv.id = 'camv'; Object.defineProperty(root, '_v', { value: nv, configurable: true }); start2(nv); return; }
      if (b2.dataset.c === 'keep') {
        const dur = Math.round((Date.now() - t0) / 1000);
        const item = { id: uid(), created: Date.now(), quest: opts.quest || '', palier: opts.palier == null ? null : opts.palier, label: opts.label || '', blob: b, mime: type || b.type, duration: t0 ? dur : null, facing: curFacing };
        try { await MDB.put(item); videoCache = null; toast('Vidéo gardée dans SIX'); } catch (err) { toast('Impossible d’enregistrer la vidéo ici'); }
        URL.revokeObjectURL(url); close();
        if (opts.onSaved) opts.onSaved(item);
      }
    });
  }
  async function start2(nv) { // relance après « Refaire »
    try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: curFacing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: !!opts.audio }); nv.srcObject = stream; nv.classList.toggle('mirror', curFacing === 'user'); await nv.play().catch(() => { }); } catch (e) { showFallback('Impossible de rouvrir la caméra.'); }
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    if (b.dataset.c === 'close') { if (rec && rec.state === 'recording') rec.stop(); close(); }
    else if (b.dataset.c === 'flip') { curFacing = curFacing === 'user' ? 'environment' : 'user'; start(); }
    else if (b.dataset.c === 'rec') toggleRec();
    else if (b.dataset.c === 'import') fileInput.click();
  });
  fileInput.addEventListener('change', e => { const f = e.target.files[0]; if (f) { t0 = 0; gotBlob(f, f.type); } });
  start();
}
function filmButton(q, palierIdx, label, facing, extra) {
  return `<button class="pill act" data-act="film" data-q="${q}" data-p="${palierIdx == null ? '' : palierIdx}" data-f="${facing || 'environment'}" data-l="${esc(label || '')}">${I.cam}${esc(extra || 'Filmer')}</button>`;
}

/* ================= actions ================= */
function toggleRep(id, force) {
  const t = today(); const day = st.days[t] || { reps: {}, xp: 0 };
  const on = force === true ? true : !day.reps[id];
  if (on) day.reps[id] = true; else delete day.reps[id];
  st.days[t] = day; recomputeDay(st, t);
  const s = sessionFor(st, t); const allDone = s.reps.filter(r => !r.optional).every(r => (st.days[t] || { reps: {} }).reps[r.id]);
  changed(); renderAll(); if (on && allDone) burst();
}
function setPalier(q, n) {
  const cur = st.paliers[q] || 0;
  if (cur >= n) { st.paliers[q] = n - 1; for (let i = n - 1; i < C.QUESTS[q].paliers.length; i++) delete st.palierDates[q + i]; }
  else { st.paliers[q] = n; for (let i = cur; i < n; i++) if (!st.palierDates[q + i]) st.palierDates[q + i] = today(); burst(); A.done(); }
  changed(); renderAll();
}
async function copyText(txt) { try { await navigator.clipboard.writeText(txt); toast('Copié'); } catch (_) { toast('Sélectionne et copie à la main'); } }

/* ================= rendu : en-tête ================= */
function renderHeader(view) {
  const sk = currentStreak(); const xp = totalXP(), L = levelFor(xp), lo = threshold(L), hi = threshold(L + 1), p = hi > lo ? (xp - lo) / (hi - lo) : 0; const Cc = 2 * Math.PI * 9;
  $('#hdr-streak').innerHTML = I.flame + '<span class="mono">' + (loaded ? sk.run : '–') + '</span> j';
  $('#hdr-belt').innerHTML = '<b>' + (loaded ? beltName(L) : '–') + '</b><svg class="ring" viewBox="0 0 22 22"><circle class="bg" cx="11" cy="11" r="9"/><circle class="fg" cx="11" cy="11" r="9" stroke-dasharray="' + Cc.toFixed(2) + '" stroke-dashoffset="' + (Cc * (1 - p)).toFixed(2) + '"/></svg>';
  const back = $('#backbtn'); back.hidden = !(view && view.startsWith('q/'));
}

/* ================= rendu : aujourd'hui ================= */
function renderToday() {
  const el = $('#v-jour'); if (!el) return;
  const t = today(); const s = sessionFor(st, t); const day = st.days[t] || { reps: {}, xp: 0 };
  const doneN = s.reps.filter(r => day.reps[r.id]).length, minutes = s.reps.filter(r => !r.optional).reduce((a, r) => a + r.min, 0);
  const sk = currentStreak(); const bossKey = 'w' + s.week, bossOn = !!st.boss[bossKey];
  const reps = s.reps.map(r => {
    const done = !!day.reps[r.id]; const liveT = timer && timer.id === r.id;
    const side = liveT ? `<span class="timerbox"><span class="mono" data-timer="${r.id}">${fmtMs(timer.endsAt - Date.now())}</span><button class="iconbtn live act" data-act="stop" aria-label="Arrêter">${I.stop}</button></span>`
      : (r.min <= 30 && !done ? `<span class="dur mono">${r.min} min</span><button class="iconbtn act" data-act="timer" data-id="${r.id}" aria-label="Lancer ${r.min} minutes">${I.clock}</button>` : `<span class="dur mono">${r.min >= 60 ? (r.min / 60) + ' h' : r.min + ' min'}</span>`);
    const link = r.q !== 'all' ? `<button class="act" data-act="go" data-to="q/${r.q}/${r.sec}">${esc(r.title)} ${I.right.replace('<svg', '<svg style="width:12px;height:12px;display:inline;vertical-align:-1px"')}</button>` : esc(r.title);
    return `<div class="rep${done ? ' done' : ''}${r.optional ? ' optional' : ''}"><button class="tick act" data-act="rep" data-id="${r.id}" aria-pressed="${done}" aria-label="${esc(r.title)}">${I.check}</button><div><div class="t">${link}</div><div class="m">${esc(r.meta)}${r.optional ? ' · <b>si tu y vas</b>' : ''}</div></div><div class="side">${side}</div></div>`;
  }).join('');
  const firstOpen = s.reps.find(r => !day.reps[r.id] && !r.optional);
  const streakLine = !loaded ? '' : (sk.run === 0 ? 'Première séance aujourd’hui, la série démarre.' : sk.joker && !sk.todayDone ? 'Joker utilisé hier. Aujourd’hui compte double pour la série.' : sk.todayDone ? 'Aujourd’hui est dans la série.' : 'Un rep suffit pour garder la série.');
  el.innerHTML = `<div><div class="eyebrow">${frDate(t)} · semaine ${s.week}</div><h1 class="h-page">Séance <span class="pen">du jour</span></h1></div>
  <div class="figs"><div class="fig"><div class="v mono">${loaded ? doneN : '–'}<small>/ ${s.reps.length}</small></div><div class="k">reps · ${minutes} min</div></div><div class="fig"><div class="v mono">${loaded ? day.xp : '–'}<small>XP</small></div><div class="k">aujourd’hui</div></div><div class="fig"><div class="v mono">${loaded ? sk.run : '–'}<small>j</small></div><div class="k">série</div></div></div>
  <div class="reps">${reps}</div>
  <div class="row between"><p class="muted">${streakLine}</p>${firstOpen && !timer ? `<button class="pill sm act" data-act="two" data-id="${firstOpen.id}">${I.clock}Pas d’énergie ? 2 minutes</button>` : ''}</div>
  <div class="card dark"><div class="eyebrow">Boss de la semaine ${s.week}</div><h3 class="h2">${esc(bossFor(s.week))}</h3><p class="small" style="color:inherit">À valider avant dimanche soir. Filmé de préférence.</p><div class="row between"><button class="pill act${bossOn ? ' on' : ''}" data-act="boss" data-key="${bossKey}">${bossOn ? I.check + 'Validé' : 'Je l’ai fait'}</button><span class="mono" style="opacity:.7;font-size:13px">+150 XP</span></div></div>
  <p class="muted">Cette séance mélange ${s.reps.filter(r => !r.optional).length} compétences en ${minutes} min (interleaving), garde le front lever un jour sur deux pour les tendons, et la série tolère un jour blanc, jamais deux. Touche un rep pour ouvrir son guide.</p>`;
}

/* ================= rendu : liste des quêtes ================= */
function renderQuests() {
  const el = $('#v-quetes'); if (!el) return;
  el.innerHTML = `<div><div class="eyebrow">6 compétences · paliers filmés</div><h1 class="h-page">Les <span class="pen">quêtes</span></h1><p class="lede" style="margin-top:8px">Chaque quête a son guide complet dedans : les explications, les schémas, les outils et la caméra.</p></div>
  <div class="qlist">${C.QORDER.map(q => { const Q = C.QUESTS[q]; const total = Q.counter ? 1 : Q.paliers.length, reached = Q.counter ? (italianAcquired() >= 200 ? 1 : 0) : (st.paliers[q] || 0);
    const next = Q.counter ? `${italianAcquired()} / 200 mots` : (reached < total ? 'Prochain · ' + Q.paliers[reached].n : 'Terminée');
    return `<button class="qcard act" data-act="go" data-to="q/${q}"><div><div class="eyebrow">${esc(Q.eyebrow)}</div><div class="n">${esc(Q.name)}</div><div class="s">${esc(next)}</div><div class="segs">${Q.counter ? `<i class="${italianAcquired() >= 200 ? 'on' : ''}" style="flex:${Math.max(1, Math.round(italianAcquired() / 2))}"></i><i style="flex:${Math.max(1, 100 - Math.round(italianAcquired() / 2))}"></i>` : Q.paliers.map((_, i) => `<i class="${i < reached ? 'on' : ''}"></i>`).join('')}</div></div><div style="display:grid;gap:6px;justify-items:end"><span class="pct">${questPct(q)} %</span>${I.right}</div></button>`; }).join('')}</div>`;
}

/* ================= rendu : page d'une quête ================= */
function palierList(q) {
  const Q = C.QUESTS[q]; const reached = st.paliers[q] || 0;
  return `<div class="paliers">${Q.paliers.map((p, i) => `<button class="palier act${i < reached ? ' on' : ''}" data-act="palier" data-q="${q}" data-n="${i + 1}" aria-pressed="${i < reached}"><span class="dot">${I.check}</span><span><div class="n">${esc(p.n)}</div><div class="d">${esc(p.d)}${st.palierDates[q + i] ? ' · validé le ' + frShort(st.palierDates[q + i]) : ''}</div></span><span class="xp">+100</span></button>`).join('')}</div>
  <div class="rulebox">${I.cam}<span>${esc(Q.rule)}</span></div>`;
}
function sec(id, title, body, first) { return `<section class="sec${first ? ' first' : ''}" id="s-${id}"><h2 class="h2">${esc(title)}</h2>${body}</section>`; }
function toc(items) { return `<nav class="toc">${items.map(([id, l]) => `<a href="#" data-scroll="s-${id}">${esc(l)}</a>`).join('')}</nav>`; }

function renderQuest(q, secId) {
  const el = $('#v-quest'); if (!el) return; const Q = C.QUESTS[q]; if (!Q) return;
  let html = `<div><div class="eyebrow">${esc(Q.eyebrow)}</div><h1 class="h-page">${esc(Q.name)}</h1></div>`;
  if (q === 'guitare') html += guitarGuide(); else if (q === 'frontlever') html += flGuide(); else if (q === 'magie') html += magicGuide(); else if (q === 'chanson') html += songGuide(); else if (q === 'italien') html += italianGuide(); else if (q === 'jjb') html += jjbGuide();
  el.innerHTML = html;
  mountTools(q);
  if (secId) { const target = el.querySelector('#s-' + secId); if (target) setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60); }
}

/* ---- guitare ---- */
function guitarGuide() {
  const toc_ = toc([['depart', 'Ta guitare'], ['tenir', 'La tenir'], ['accorder', 'Accorder'], ['lire', 'Lire un accord'], ['accords', 'Les 4 accords'], ['changements', 'Changements'], ['rythme', 'Le rythme'], ['chanson', 'La chanson'], ['plan', 'Le plan'], ['paliers', 'Paliers']]);
  const depart = `<p class="lede">Tu pars de zéro, donc on pose les mots. Une guitare classique a six cordes en nylon. Quand tu la tiens pour jouer, la grosse corde est en haut, près de ton visage, et la plus fine en bas.</p>${neckSVG()}
  <ul class="bul"><li><span><b>Les cordes</b> s’appellent, de la plus grosse à la plus fine : Mi, La, Ré, Sol, Si, Mi. Elles sont numérotées à l’envers : la plus fine est la corde 1, la plus grosse la corde 6.</span></li>
  <li><span><b>Les frettes</b> sont les barrettes métalliques sur le manche. L’espace entre deux frettes s’appelle une case. « Case 2 » veut dire : tu appuies entre la 1re et la 2e frette, en collant le doigt juste derrière la 2e.</span></li>
  <li><span><b>Le sillet</b> est la petite pièce blanche en haut du manche. « Corde à vide » veut dire que tu la joues sans appuyer dessus.</span></li>
  <li><span><b>Les mécaniques</b> sur la tête servent à accorder. Un petit tour change beaucoup la note.</span></li>
  <li><span><b>Le capo</b> est une pince qu’on met sur une case : toutes les cordes deviennent plus aiguës et les mêmes formes d’accords donnent une autre tonalité. Tu n’en as pas besoin pour Freakin’ Out, tu en auras besoin pour iloveitiloveitiloveit (capo case 2) et In My Room (capo case 2). Pour une classique il faut un capo plat.</span></li></ul>
  <p class="small">Cordes anciennes qui sonnent mat ou qui s’accordent mal : change le jeu (nylon, tirant normal, 10 €), ça prend 20 minutes avec un tuto et ça transforme la guitare.</p>`;
  const tenir = `<ul class="bul"><li><span><b>Assis, droit</b>, la guitare sur la cuisse droite, le manche légèrement relevé. Le haut de la caisse contre ta poitrine.</span></li>
  <li><span><b>Main gauche</b> : le pouce derrière le manche, à peu près en face du majeur, jamais par-dessus. La paume ne touche pas le manche, il y a un petit espace. C’est ce qui laisse les doigts arqués.</span></li>
  <li><span><b>Les doigts se numérotent</b> 1 index, 2 majeur, 3 annulaire, 4 auriculaire. Tous les schémas d’accords utilisent ces chiffres.</span></li>
  <li><span><b>Tu appuies avec le bout du doigt</b>, pas la pulpe, le doigt bien plié comme un crochet, juste derrière la frette. Si tu appuies au milieu de la case, ça grésille.</span></li>
  <li><span><b>Les ongles</b> de la main gauche courts, sinon tu ne peux pas appuyer sur le bout.</span></li>
  <li><span><b>Main droite</b> : tu grattes au-dessus de la rosace, avec le pouce ou avec un médiator (mieux pour le rythme de Freakin’ Out). Le mouvement vient du poignet, détendu, pas du bras.</span></li>
  <li><span><b>Ça pique le bout des doigts</b> les dix premiers jours. C’est normal, la peau durcit. Des séances courtes et quotidiennes valent mieux qu’une longue.</span></li></ul>`;
  const accorder = `<p class="lede">Une guitare désaccordée rend tout faux, même un accord parfait. Avant chaque séance, 1 minute. Le plus simple : l’app GuitarTuna (gratuite), elle écoute et te dit si tu es trop bas ou trop haut.</p>
  <p class="small">Sans app, tu peux comparer à l’oreille avec ces notes de référence. Joue la corde à vide, écoute la note ici, et tourne la mécanique jusqu’à ce que les deux sonnent pareil (une sorte de battement disparaît quand c’est juste).</p>
  <div class="listen">${A.OPEN_STRINGS.map((o, i) => `<button class="pill sm act" data-act="tone" data-f="${o[1]}">${I.sound}${esc(o[0])}</button>`).join('')}</div>
  <p class="small">Si tu es loin de la note, tends ou détends par petits quarts de tour. Une corde neuve se détend pendant deux jours, tu la réaccordes souvent au début, c’est normal.</p>`;
  const lire = `<p class="lede">Un diagramme d’accord, c’est ton manche vu de face, debout. Une fois que tu sais le lire, tu peux jouer n’importe quelle chanson d’Ultimate Guitar.</p>${chordReadSVG()}
  <p class="small">Ici c’est le La mineur (Am). Lecture : la grosse corde a un X, tu ne la joues pas. La corde La est à vide. Majeur en case 2 sur la corde Ré, annulaire en case 2 sur la corde Sol, index en case 1 sur la corde Si. La petite corde Mi à vide.</p>`;
  const accords = `<p class="lede">Quatre accords ouverts suffisent pour Freakin’ Out, et aussi pour Bad State of Mind. Apprends-les dans cet ordre, un nouveau tous les deux jours. À chaque fois : forme l’accord, gratte les cordes une par une, chacune doit sonner clair. Si une corde est étouffée, c’est un doigt voisin qui la touche.</p>
  <div class="chordgrid">${C.CHORD_ORDER.map(n => `<button class="chordcard act" data-act="chord" data-n="${n}">${chordSVG(n, 92)}<div class="nm">${n}</div><div class="fn">${esc(C.CHORDS[n].name)}</div></button>`).join('')}</div>
  <div id="chorddetail">${chordDetail('Em')}</div>${yt(C.YT.chords, 'Voir quelqu’un les former, sur YouTube')}`;
  const changements = `<p class="lede">Savoir faire un accord, c’est 20 % du travail. Passer de l’un à l’autre sans s’arrêter, c’est les 80 % restants. Le drill qui marche : une minute chrono, tu comptes combien de fois tu passes d’un accord à l’autre. Tu le refais chaque jour, le chiffre monte tout seul.</p>
  <ul class="bul"><li><span><b>Em → Am</b> : c’est la même forme à deux doigts (majeur et annulaire côte à côte) qui descend d’une corde, plus l’index qui se pose. Garde les deux doigts collés pendant le déplacement.</span></li>
  <li><span><b>Am → C</b> : index et majeur ne bougent pas. Seul l’annulaire saute de la corde Sol (case 2) à la corde La (case 3). Regarde juste lui.</span></li>
  <li><span><b>C → G</b> : le plus grand saut. Regarde d’abord où va le majeur (grosse corde, case 3), les autres suivent.</span></li>
  <li><span><b>La règle d’or</b> : tu changes sur le temps, même si le nouvel accord est moche. On ne s’arrête jamais pour corriger, sinon tu apprends à t’arrêter.</span></li></ul>
  <div id="drill"></div>${yt(C.YT.change, 'Le drill en vidéo, sur YouTube')}`;
  const rythme = `<p class="lede">Le rythme de base de toute la pop s’appelle « Old Faithful ». Huit demi-temps par mesure : bas, rien, bas, haut, rien, haut, bas, haut. C’est exactement ce qu’il te faut pour Freakin’ Out.</p>
  <div id="strumtool"></div>
  <ul class="bul">${C.STRUM.tips.map(t => `<li><span>${esc(t)}</span></li>`).join('')}</ul>${yt(C.YT.strum, 'Le rythme Old Faithful en vidéo, sur YouTube')}`;
  const chanson = `<p class="lede">${esc(C.SONG.notes[0])}</p>
  <div id="looptool"></div>
  <ul class="bul"><li><span>${esc(C.SONG.notes[1])}</span></li><li><span>${esc(C.SONG.notes[2])}</span></li></ul>
  <div class="row"><a class="ytlink" target="_blank" rel="noopener" href="https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent('Freakin Out Dexter and the Moonrocks')}">${I.ext}La grille complète sur Ultimate Guitar</a>${yt(C.YT.song, 'Tuto de la chanson, sur YouTube')}</div>
  <div class="row">${filmButton('guitare', null, 'Freakin’ Out', 'environment', 'Me filmer en train de jouer')}</div>`;
  const plan = `<div class="steps">
  <div class="step"><div><div class="t">Semaine 1, les accords</div><div class="d">Em puis Am puis C puis G, un nouveau tous les deux jours. Former, gratter corde par corde, relâcher, recommencer. Chrono d’une minute : objectif 20 changements Em ↔ Am et 15 Am ↔ C en fin de semaine.</div></div></div>
  <div class="step"><div><div class="t">Semaine 2, le rythme</div><div class="d">Old Faithful sur un seul accord jusqu’à l’automatisme, puis la boucle C → Am → Em → G, une mesure chacun, métronome à 60. On change d’accord sur le dernier « haut » même si c’est moche.</div></div></div>
  <div class="step"><div><div class="t">Semaine 3, par-dessus la chanson</div><div class="d">Spotify à 0,8 puis 0,9, grille sous les yeux, tenir couplet + refrain sans s’arrêter. Paroles en écoute passive dans la journée, chant sans guitare le soir.</div></div></div>
  <div class="step"><div><div class="t">Semaine 4, vitesse réelle</div><div class="d">124 BPM, filmée. Puis jouée devant quelqu’un. Ensuite Bad State of Mind, mêmes accords.</div></div></div></div>
  <p class="small">Si la guitare demande trop de force (cordes très hautes au-dessus du manche), un réglage chez un luthier coûte 40 à 60 € et change la vie.</p>`;
  return toc_ + sec('depart', 'Ta guitare, les mots pour en parler', depart, true) + sec('tenir', 'La tenir et placer les doigts', tenir) + sec('accorder', 'Accorder', accorder) + sec('lire', 'Lire un diagramme d’accord', lire) + sec('accords', 'Les 4 accords de Freakin’ Out', accords) + sec('changements', 'Les changements d’accords', changements) + sec('rythme', 'Le rythme', rythme) + sec('chanson', 'La chanson', chanson) + sec('plan', 'Le plan sur 4 semaines', plan) + sec('paliers', 'Paliers', palierList('guitare') + `<div class="row">${filmButton('guitare', (st.paliers.guitare || 0), 'Palier guitare', 'environment', 'Filmer pour valider')}</div>`);
}
function chordDetail(n) {
  const ch = C.CHORDS[n];
  return `<div class="card"><div class="chordbig">${chordSVG(n, 150)}<div class="stack"><div class="h3">${n} · ${esc(ch.name)}</div><p class="small">${esc(ch.feel)}</p><ol class="bul" style="counter-reset:none">${ch.place.map(p => `<li><span>${esc(p)}</span></li>`).join('')}</ol>
  <div class="listen"><button class="pill sm act" data-act="arp" data-n="${n}">${I.sound}Corde par corde</button><button class="pill sm act" data-act="strum" data-n="${n}">${I.sound}Gratté</button></div></div></div>
  <details class="more"><summary>Les erreurs classiques${I.chev}</summary><div class="in"><ul class="bul">${ch.errors.map(e => `<li><span>${esc(e)}</span></li>`).join('')}</ul></div></details></div>`;
}

/* ---- front lever ---- */
function flGuide() {
  const toc_ = toc([['paliers', 'Paliers'], ['seance', 'La séance'], ['cues', 'Les 3 cues'], ['filmer', 'Filmer'], ['log', 'Mes holds'], ['accessoires', 'Accessoires'], ['securite', 'Sécurité']]);
  const reached = st.paliers.frontlever || 0;
  const paliers = `<p class="lede">Le front lever se construit palier par palier. On passe au suivant quand l’actuel tient 3 fois 10 secondes propres, filmé de profil. La ligne rose pointillée, c’est la hauteur des épaules : les hanches doivent rester dessus.</p>
  <div class="flgrid">${C.FL_PALIERS.map((p, i) => `<div class="flcard${i === reached ? ' on' : ''}">${flSVG(i, 132)}<div><div class="nm">${i + 1}. ${esc(p.n)}</div><div class="sh">${esc(p.short)} · ${esc(p.hold)}</div><div class="wh">${esc(p.when)}${i === reached ? ' · <b style="color:var(--pen-text)">palier en cours</b>' : ''}</div><details class="more" style="border:0;padding-top:6px"><summary style="font-size:13px">Comment${I.chev}</summary><div class="in small">${esc(p.how)}<br><br><b>Cue :</b> ${esc(p.cue)}</div></details></div></div>`).join('')}</div>
  ${palierList('frontlever')}<div class="row">${filmButton('frontlever', reached, C.FL_PALIERS[Math.min(reached, 4)].n, 'environment', 'Filmer le palier en cours')}${yt(C.YT.fl, 'Voir les paliers en vidéo')}</div>`;
  const seance = `<p class="lede">${esc(C.FL_SESSION.protocol)}</p>
  <div class="stack"><div class="h3">Échauffement, 3 minutes</div><ul class="bul">${C.FL_SESSION.warmup.map(w => `<li><span>${esc(w)}</span></li>`).join('')}</ul></div>
  <div id="holdtool"></div>
  <div class="stack"><div class="h3">Ensuite, les négatives</div><p class="small">${esc(C.FL_SESSION.negatives)}</p>${yt(C.YT.flneg, 'Les négatives en vidéo')}</div>`;
  const cues = `<div class="steps">
  <div class="step"><div><div class="t">Bras tendus, coudes verrouillés</div><div class="d">Prise en pronation (paumes vers l’avant), un peu plus large que les épaules. Si les coudes plient, ce n’est plus un front lever, c’est une traction ratée.</div></div></div>
  <div class="step"><div><div class="t">Épaules tirées vers le bas et l’arrière</div><div class="d">Pense « je ramène la barre vers mes hanches ». Ce sont les dorsaux qui tiennent, pas les bras. C’est le même geste que le pull-over à la poulie.</div></div></div>
  <div class="step"><div><div class="t">Hollow : bassin rétroversé, côtes rentrées</div><div class="d">Comme si tu voulais rentrer le coccyx entre tes jambes et plaquer le bas du dos vers le plafond. Les hanches qui tombent, c’est le défaut numéro un, et on ne le sent pas, on le voit seulement en vidéo.</div></div></div></div>
  <p class="small">Un seul cue par séance. Aujourd’hui tu règles les hanches, demain tu règles les épaules. Pas les trois en même temps.</p>`;
  const filmer = `<p class="lede">${esc(C.FL_SESSION.film)}</p><div class="row">${filmButton('frontlever', reached, C.FL_PALIERS[Math.min(reached, 4)].n, 'environment', 'Ouvrir la caméra')}</div><p class="small">La caméra arrière, posée, avec la ligne pointillée de l’écran à hauteur de tes épaules. Tu retrouves toutes tes vidéos dans Progression, pour comparer avant / après.</p>`;
  const accessoires = `<ul class="bul">${C.FL_SESSION.accessories.map(a => `<li><span>${esc(a)}</span></li>`).join('')}</ul>`;
  const securite = `<ul class="bul">${C.FL_SESSION.safety.map(a => `<li><span>${esc(a)}</span></li>`).join('')}</ul>`;
  return toc_ + sec('paliers', 'Les 5 paliers', paliers, true) + sec('seance', 'La séance de 15 minutes', seance) + sec('cues', 'Les 3 cues', cues) + sec('filmer', 'Filmer', filmer) + sec('log', 'Mes holds', `<div id="holdchart"></div>`) + sec('accessoires', 'Sur les jours dos', accessoires) + sec('securite', 'Sécurité', securite);
}

/* ---- magie ---- */
function magicGuide() {
  const toc_ = toc([['demo', 'La démo'], ['etapes', 'Les 6 étapes'], ['miroir', 'Miroir'], ['angles', 'Les angles'], ['check', 'Checklist'], ['paliers', 'Paliers']]);
  const demo = `<p class="lede">Le tourniquet (les magiciens disent « French drop ») : tu fais semblant de prendre une pièce avec la main droite, elle reste en fait dans la main gauche. Tout le tour tient dans un seul geste. Regarde les deux versions côte à côte, le vrai geste et le faux, c’est la même image vue de l’extérieur.</p>
  <div id="demotool"></div>${yt(C.YT.drop, 'Voir de vrais magiciens le faire, sur YouTube')}`;
  const etapes = `<div class="steps">${C.MAGIC_STEPS.map(s => `<div class="step"><div><div class="t">${esc(s.n)}</div><div class="d">${esc(s.t)}</div><div class="f">${esc(s.focus)}</div></div></div>`).join('')}</div>`;
  const miroir = `<p class="lede">Le miroir, c’est ton premier public. La caméra frontale te montre exactement ce que les gens voient. Alterne un vrai geste, un faux geste, jusqu’à ne plus voir la différence toi-même. Puis enregistre : la vidéo attrape la main gauche qui se crispe avant toi.</p>
  <div class="row">${filmButton('magie', 0, 'Tourniquet au miroir', 'user', 'Ouvrir le miroir')}</div>
  <p class="small">Vingt minutes le premier soir, puis cinq minutes par jour. Le geste devient propre vers le dixième jour.</p>`;
  const angles = `<p class="lede">Le faux geste est invisible de face et légèrement en dessous. Il est visible depuis ta gauche (on voit la pièce tomber) et depuis au-dessus (on voit la paume). Donc tu choisis ta place avant de commencer.</p>${anglesSVG()}`;
  const check = `<div class="check">${C.MAGIC_CHECK.map((c, i) => `<label><input type="checkbox" data-ck="magic${i}">${esc(c)}</label>`).join('')}</div><p class="small">Coche en regardant ta dernière vidéo. Quand tout est coché deux vidéos de suite, le palier 2 est validé.</p>`;
  return toc_ + sec('demo', 'La démo animée', demo, true) + sec('etapes', 'Les 6 étapes', etapes) + sec('miroir', 'Le miroir et la vidéo', miroir) + sec('angles', 'Les angles', angles) + sec('check', 'La checklist', check) + sec('paliers', 'Paliers', palierList('magie'));
}

/* ---- chanson ---- */
function songGuide() {
  const toc_ = toc([['plan', 'Comment'], ['test', 'Le test'], ['paliers', 'Paliers']]);
  const plan = `<p class="lede">Une chanson par cœur, ça ne s’apprend pas en relisant les paroles. Ça s’apprend en se testant : paroles cachées, tu chantes, et tu combles les trous de mémoire.</p>
  <ul class="bul">${C.SONG_MEMO.plan.map(p => `<li><span>${esc(p)}</span></li>`).join('')}</ul>
  <div class="stack"><div class="h3">La structure</div><ol class="bul">${C.SONG_MEMO.structure.map(s => `<li><span>${esc(s)}</span></li>`).join('')}</ol></div>
  <a class="ytlink" target="_blank" rel="noopener" href="https://open.spotify.com/search/${encodeURIComponent('Freakin Out Dexter and the Moonrocks')}">${I.ext}Ouvrir dans Spotify (paroles dans le lecteur)</a>`;
  const tests = st.memoTests.slice(-8).reverse();
  const test = `<p class="lede">Le test de rappel : paroles fermées, tu chantes la partie choisie, puis tu te notes. 0 = rien, 1 = des bouts, 2 = presque tout, 3 = sans faute. On vise trois 3 d’affilée.</p>
  <div class="card sunk"><div class="opts" id="memopart"><button class="pill on" data-part="Refrain">Refrain</button><button class="pill" data-part="Couplet 1">Couplet 1</button><button class="pill" data-part="Couplet 2">Couplet 2</button><button class="pill" data-part="Pont">Pont</button><button class="pill" data-part="Entière">Entière</button></div>
  <div class="row">Ma note :<div class="opts">${[0, 1, 2, 3].map(n => `<button class="pill act" data-act="memo" data-n="${n}">${n}</button>`).join('')}</div></div></div>
  ${tests.length ? `<div class="loglist">${tests.map(t => `<div class="r"><span>${esc(t.part)} · <b>${t.n}/3</b></span><span class="mono">${frShort(t.d)}</span></div>`).join('')}</div>` : '<div class="empty">Aucun test encore. Le premier se fait semaine 3, quand la guitare tient.</div>'}
  <div class="row">${filmButton('chanson', null, 'Chant', 'user', 'M’enregistrer en chantant')}</div>`;
  return toc_ + sec('plan', 'Comment on apprend une chanson par cœur', plan, true) + sec('test', 'Le test de rappel', test) + sec('paliers', 'Paliers', palierList('chanson'));
}

/* ---- italien ---- */
function italianGuide() {
  const toc_ = toc([['compteur', 'Compteur'], ['revision', 'Révision'], ['mots', 'Mes mots'], ['methode', 'Méthode']]);
  const acq = italianAcquired(), due = st.words.filter(w => (w.due || '') <= today()).length;
  const compteur = `<div class="counter"><div class="big"><span class="v mono">${acq}</span><span class="of">/ 200 mots acquis</span></div><div class="bar"><i style="width:${Math.min(100, acq / 2)}%"></i></div>
  <p class="small">Un mot est acquis quand tu l’as sorti de mémoire quatre fois espacées dans la boîte ci-dessous (J+1, J+3, J+7, J+14), ou quand tu le comptes toi-même parmi les mots déjà appris ailleurs.</p>
  <div class="row between"><span class="small">Mots déjà acquis ailleurs : <b class="mono">${st.italianWords || 0}</b></span><div class="opts"><button class="pill sm act" data-act="words" data-n="-1">−1</button><button class="pill sm act" data-act="words" data-n="1">+1</button><button class="pill sm act" data-act="words" data-n="10">+10</button></div></div></div>`;
  const revision = `<p class="lede">${due ? `<b>${due}</b> mot${due > 1 ? 's' : ''} à revoir aujourd’hui.` : 'Rien à revoir pour l’instant.'} Du français vers l’italien, à voix haute, en phrase si tu peux.</p><div id="flashtool"></div>`;
  const mots = `<div class="wordform"><input id="wfr" class="input" placeholder="français (ex. le café)" autocomplete="off"><input id="wit" class="input" placeholder="italien (il caffè)" autocomplete="off" lang="it"><button class="pill primary act" data-act="addword">Ajouter</button></div>
  ${st.words.length ? '' : `<button class="pill act" data-act="starter">Ajouter 10 mots de base pour commencer</button>`}
  <div class="wordlist">${st.words.slice().sort((a, b) => (a.due || '') < (b.due || '') ? -1 : 1).map(w => `<div class="w"><span>${esc(w.fr)}</span><span class="it">${esc(w.it)}</span><span class="boxes" title="${w.box || 0} / 4">${[0, 1, 2, 3].map(i => `<i class="${i < (w.box || 0) ? 'on' : ''}"></i>`).join('')}</span><button class="del act" data-act="delword" data-id="${w.id}">retirer</button></div>`).join('')}</div>`;
  const methode = `<ul class="bul">${C.ITALIAN.tips.map(t => `<li><span>${esc(t)}</span></li>`).join('')}</ul>`;
  return toc_ + sec('compteur', 'Le compteur', compteur, true) + sec('revision', 'La révision du jour', revision) + sec('mots', 'Mes mots', mots) + sec('methode', 'La méthode', methode);
}

/* ---- jjb ---- */
function jjbGuide() {
  const J = C.JJB; const toc_ = toc([['club', 'Le club'], ['message', 'Le message'], ['jourj', 'Le jour J'], ['cours', 'Mes cours'], ['paliers', 'Paliers']]);
  const club = `<p class="lede">${esc(J.club)}, ${esc(J.place)}, à 5 minutes de Colmar. L’essai visé : un cours de grappling No-Gi, sans kimono, un jeudi soir.</p>
  <div class="info">${J.hours.map(h => `<div class="r"><span>${esc(h[0])} · ${esc(h[1])}</span><span>${esc(h[2])}</span></div>`).join('')}</div>
  <div class="info"><div class="r"><span class="mono">${esc(J.mail)}</span><button class="link act" data-act="copy" data-text="${esc(J.mail)}">${I.copy}copier</button></div><div class="r"><a href="${J.site}" target="_blank" rel="noopener">bjjalsace.fr</a><a href="${J.fb}" target="_blank" rel="noopener">Facebook / Messenger</a><a href="${J.maps}" target="_blank" rel="noopener">Itinéraire</a></div></div>
  <p class="small">Pas d’Instagram, pas besoin d’appeler : mail, formulaire du site, ou Messenger.</p>`;
  const message = `<div class="msg">${esc(J.message)}</div><div class="row"><button class="pill primary act" data-act="copy" data-text="${esc(J.message)}">${I.copy}Copier le message</button></div>`;
  const jourj = `<div class="stack"><div class="h3">À apporter</div><ul class="bul">${J.bring.map(b => `<li><span>${esc(b)}</span></li>`).join('')}</ul></div><div class="stack"><div class="h3">Ce qui va se passer</div><ul class="bul">${J.first.map(b => `<li><span>${esc(b)}</span></li>`).join('')}</ul></div>`;
  const log = st.jjbLog.slice().reverse();
  const cours = `<p class="lede"><b class="mono">${st.jjbLog.length}</b> cours fait${st.jjbLog.length > 1 ? 's' : ''}. Après chaque cours, note une seule technique retenue. À dix cours, le palier 4 tombe.</p>
  <div class="card sunk"><textarea id="jjbnote" class="ta" placeholder="La technique que j’ai retenue ce soir (ex. l’étranglement en triangle depuis la garde)"></textarea><div class="row"><button class="pill primary act" data-act="jjblog">${I.check}J’ai fait un cours aujourd’hui</button></div></div>
  ${log.length ? `<div class="loglist">${log.map(l => `<div class="r"><span>${esc(l.note || 'Cours')}</span><span class="mono">${frShort(l.d)}</span></div>`).join('')}</div>` : ''}`;
  return toc_ + sec('club', 'Le club', club, true) + sec('message', 'Le message à envoyer', message) + sec('jourj', 'Le jour J', jourj) + sec('cours', 'Mes cours', cours) + sec('paliers', 'Paliers', palierList('jjb'));
}

/* ================= outils montés dans les guides ================= */
function mountTools(q) {
  if (q === 'guitare') { mountDrill(); mountStrum(); mountLoop(); }
  if (q === 'frontlever') { mountHold(); mountHoldChart(); }
  if (q === 'magie') { mountDemo(); mountChecks(); }
  if (q === 'italien') { mountFlash(); }
}
/* drill d'une minute */
let drill = { pair: 'Em-Am', running: false, count: 0, endsAt: 0, iv: null, result: null };
function mountDrill() {
  const el = $('#drill'); if (!el) return;
  const draw = () => {
    const pairs = Object.keys(C.DRILL_TARGETS).map(p => `<button class="pill${drill.pair === p ? ' on' : ''}" data-pair="${p}">${p.replace('-', ' ↔ ')}</button>`).join('');
    const best = st.drills[drill.pair] || 0, tgt = C.DRILL_TARGETS[drill.pair];
    const [a, b] = drill.pair.split('-');
    const go = drill.running ? `<button class="go live" data-d="tap"><span class="n mono" id="drill-n">${drill.count}</span><span class="s"><span class="mono" id="drill-s">${Math.ceil((drill.endsAt - Date.now()) / 1000)}</span> s · tape à chaque changement</span></button>` : `<button class="go" data-d="start"><span class="n">Go</span><span class="s">60 secondes</span></button>`;
    const res = drill.result !== null && !drill.running ? `<div class="res"><b>${drill.result}</b> changements${drill.result >= tgt ? ' · objectif atteint' : ''}${drill.result >= best && drill.result > 0 ? ' · nouveau record' : ''}</div>` : '';
    el.innerHTML = `<div class="drill"><div class="eyebrow">Une minute de changements</div><div class="pairs">${pairs}</div><div class="row" style="justify-content:center;gap:16px">${chordSVG(a, 70)}<span class="muted">↔</span>${chordSVG(b, 70)}</div>${go}${res}<div class="tgt">Objectif ${tgt} · record <span class="mono">${best}</span></div></div>`;
  };
  draw();
  el.addEventListener('click', e => {
    const p = e.target.closest('[data-pair]'); if (p) { drill.pair = p.dataset.pair; drill.result = null; draw(); return; }
    const d = e.target.closest('[data-d]'); if (!d) return;
    if (d.dataset.d === 'tap') { if (drill.running) { drill.count++; const n = $('#drill-n'); if (n) n.textContent = drill.count; A.tick(); } return; }
    if (d.dataset.d === 'start') {
      A.unlock(); drill.running = true; drill.count = 0; drill.result = null; drill.endsAt = Date.now() + 60000; clearInterval(drill.iv);
      drill.iv = setInterval(() => { const left = drill.endsAt - Date.now(); const s = $('#drill-s'); if (s) s.textContent = Math.max(0, Math.ceil(left / 1000)); if (left <= 0) { clearInterval(drill.iv); drill.running = false; drill.result = drill.count; if (drill.count > (st.drills[drill.pair] || 0)) { st.drills[drill.pair] = drill.count; changed(); if (drill.count >= C.DRILL_TARGETS[drill.pair]) burst(); } A.done(); draw(); } }, 200);
      draw();
    }
  });
  onLeave(() => { clearInterval(drill.iv); drill.running = false; });
}
/* rythme : pattern animé + métronome */
function mountStrum() {
  const el = $('#strumtool'); if (!el) return; let bpm = 60; const m = A.Metronome({ bpm, subdiv: 2, beatsPerBar: 4, click: true });
  el.innerHTML = `<div class="card sunk"><div class="strum">${C.STRUM.slots.map((s, i) => `<div class="s" data-i="${i}"><div class="c">${C.STRUM.count[i]}</div><div class="a ${s === '·' ? 'rest' : (s === 'B' ? 'down' : 'up')}">${s === '·' ? '·' : (s === 'B' ? '↓' : '↑')}</div></div>`).join('')}</div>
  <div class="bpm"><button class="iconbtn" id="strum-play" aria-label="Lancer">${I.play}</button><input type="range" id="strum-bpm" min="40" max="130" value="${bpm}" step="2"><span class="v" id="strum-v">${bpm} BPM</span></div>
  <p class="small">↓ = vers le bas (les chiffres), ↑ = vers le haut (les « et »), · = la main passe sans toucher. Lance le métronome, compte à voix haute, et gratte sur un Em.</p></div>`;
  const slots = el.querySelectorAll('.s');
  m.onBeat = b => { const i = b.inBar; slots.forEach(s => s.classList.remove('now', 'hit')); const s = slots[i]; if (s) { s.classList.add('now'); if (C.STRUM.slots[i] !== '·') s.classList.add('hit'); } };
  el.querySelector('#strum-play').addEventListener('click', () => { A.unlock(); if (m.running) { m.stop(); el.querySelector('#strum-play').innerHTML = I.play; el.querySelector('#strum-play').classList.remove('live'); slots.forEach(s => s.classList.remove('now', 'hit')); } else { m.start(); el.querySelector('#strum-play').innerHTML = I.pause; el.querySelector('#strum-play').classList.add('live'); } });
  el.querySelector('#strum-bpm').addEventListener('input', e => { bpm = +e.target.value; m.bpm = bpm; el.querySelector('#strum-v').textContent = bpm + ' BPM'; });
  onLeave(() => m.stop());
}
/* boucle de la chanson */
function mountLoop() {
  const el = $('#looptool'); if (!el) return; let bpm = 60, idx = 0, beat = 0; const loop = C.SONG.loop; const m = A.Metronome({ bpm, subdiv: 1, beatsPerBar: 4, click: true });
  const draw = () => { el.innerHTML = `<div class="card sunk"><div class="eyebrow">La boucle · un accord par mesure</div><div class="loopnow"><div class="cur" id="loop-cur">${loop[idx]}</div><div class="nxt">ensuite<b id="loop-nxt">${loop[(idx + 1) % loop.length]}</b></div></div><div class="beats" id="loop-beats">${[0, 1, 2, 3].map(() => '<i></i>').join('')}</div><div id="loop-svg">${chordSVG(loop[idx], 110)}</div>
  <div class="bpm"><button class="iconbtn" id="loop-play" aria-label="Lancer">${I.play}</button><input type="range" id="loop-bpm" min="40" max="130" value="${bpm}" step="2"><span class="v" id="loop-v">${bpm} BPM</span></div>
  <p class="small">Commence à 60. Quand quatre tours passent sans arrêt, monte de 10. La chanson est à 124 : c’est l’objectif de la semaine 4.</p></div>`;
    el.querySelector('#loop-play').addEventListener('click', () => { A.unlock(); if (m.running) { m.stop(); el.querySelector('#loop-play').innerHTML = I.play; el.querySelector('#loop-play').classList.remove('live'); } else { idx = 0; beat = 0; m.start(); el.querySelector('#loop-play').innerHTML = I.pause; el.querySelector('#loop-play').classList.add('live'); } });
    el.querySelector('#loop-bpm').addEventListener('input', e => { bpm = +e.target.value; m.bpm = bpm; el.querySelector('#loop-v').textContent = bpm + ' BPM'; });
  };
  draw();
  m.onBeat = b => { const dots = el.querySelectorAll('#loop-beats i'); if (b.inBar === 0 && b.beat > 0) { idx = (idx + 1) % loop.length; const cur = $('#loop-cur'), nxt = $('#loop-nxt'), sv = $('#loop-svg'); if (cur) cur.textContent = loop[idx]; if (nxt) nxt.textContent = loop[(idx + 1) % loop.length]; if (sv) sv.innerHTML = chordSVG(loop[idx], 110); } dots.forEach((d, i) => d.classList.toggle('on', i <= b.inBar)); };
  onLeave(() => m.stop());
}
/* minuteur de holds */
function mountHold() {
  const el = $('#holdtool'); if (!el) return;
  const palier = Math.min(st.paliers.frontlever || 0, 4); let target = palier === 4 ? 5 : 8, rest = 90, sets = 5, set = 0, phase = 'idle', endsAt = 0, iv = null, lastBeep = -1;
  const draw = () => {
    const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    const big = phase === 'idle' ? target + ' s' : phase === 'ready' ? left : phase === 'work' ? left : phase === 'rest' ? fmtMs(left * 1000) : 'Fini';
    const ph = { idle: 'Prêt · palier ' + C.FL_PALIERS[palier].n, ready: 'Place-toi', work: 'TIENS', rest: 'Repos', ask: 'Tenu combien ?', done: 'Séance faite' }[phase];
    el.innerHTML = `<div class="hold ${phase}"><div class="phase">${ph}</div><div class="big mono">${big}</div><div class="sets">${Array.from({ length: sets }, (_, i) => `<i class="${i < set ? 'on' : ''}"></i>`).join('')}</div>
    ${phase === 'idle' ? `<div class="opts" style="justify-content:center"><span class="small">Objectif par série</span>${[5, 8, 10, 12].map(s => `<button class="pill${s === target ? ' on' : ''}" data-t="${s}">${s} s</button>`).join('')}</div><button class="pill primary" data-h="start">${I.play}Lancer les ${sets} séries</button>` : ''}
    ${phase === 'ask' ? `<div class="quick">${[3, 5, 8, 10, 12, 15].map(s => `<button class="pill" data-s="${s}">${s} s</button>`).join('')}<button class="pill" data-s="0">raté</button></div>` : ''}
    ${(phase === 'work' || phase === 'rest' || phase === 'ready') ? `<button class="pill" data-h="skip">${phase === 'rest' ? 'Passer le repos' : 'Arrêter'}</button>` : ''}
    ${phase === 'done' ? `<button class="pill" data-h="reset">Recommencer</button>` : ''}
    <p class="small">Lâche deux secondes avant que la forme ne casse. Le bip te dit quand lâcher, puis compte le repos.</p></div>`;
  };
  const tickLoop = () => {
    iv = setInterval(() => {
      if (phase !== 'ready' && phase !== 'work' && phase !== 'rest') return;
      const left = (endsAt - Date.now()) / 1000; const bigEl = el.querySelector('.big'); if (bigEl) bigEl.textContent = phase === 'rest' ? fmtMs(Math.max(0, left) * 1000) : Math.max(0, Math.ceil(left));
      const sec = Math.ceil(left); if (sec <= 3 && sec > 0 && sec !== lastBeep && phase !== 'rest') { lastBeep = sec; A.tick(); }
      if (left <= 0) { lastBeep = -1; if (phase === 'ready') { phase = 'work'; endsAt = Date.now() + target * 1000; A.go(); draw(); } else if (phase === 'work') { phase = 'ask'; A.done(); draw(); } else if (phase === 'rest') { phase = 'ready'; endsAt = Date.now() + 5000; draw(); } }
    }, 200);
  };
  draw();
  el.addEventListener('click', e => {
    const t = e.target.closest('[data-t]'); if (t) { target = +t.dataset.t; draw(); return; }
    const h = e.target.closest('[data-h]'); if (h) { A.unlock(); if (h.dataset.h === 'start') { set = 0; phase = 'ready'; endsAt = Date.now() + 5000; clearInterval(iv); tickLoop(); draw(); } else if (h.dataset.h === 'skip') { if (phase === 'rest') { phase = 'ready'; endsAt = Date.now() + 5000; } else { phase = 'idle'; clearInterval(iv); } draw(); } else if (h.dataset.h === 'reset') { phase = 'idle'; set = 0; draw(); } return; }
    const s = e.target.closest('[data-s]'); if (s) { const secs = +s.dataset.s; st.holds.push({ id: uid(), t: Date.now(), d: today(), p: palier, s: secs }); changed(); set++; if (set >= sets) { phase = 'done'; clearInterval(iv); A.done(); } else { phase = 'rest'; endsAt = Date.now() + rest * 1000; } draw(); mountHoldChart(); }
  });
  onLeave(() => clearInterval(iv));
}
function mountHoldChart() {
  const el = $('#holdchart'); if (!el) return; const palier = Math.min(st.paliers.frontlever || 0, 4);
  const byDay = {}; st.holds.filter(h => h.p === palier).forEach(h => { byDay[h.d] = Math.max(byDay[h.d] || 0, h.s); });
  const pts = Object.keys(byDay).sort().map(d => ({ l: frShort(d), v: byDay[d] }));
  const total = st.holds.filter(h => h.p === palier).length; const best = pts.reduce((m, p) => Math.max(m, p.v), 0);
  el.innerHTML = `<p class="small">Meilleur hold par jour au palier <b>${C.FL_PALIERS[palier].n}</b> · ${total} série${total > 1 ? 's' : ''} loguée${total > 1 ? 's' : ''} · record <b class="mono">${best} s</b></p>${lineChart(pts, { max: 12, label: 'Holds', empty: 'Lance ta première séance de holds ci-dessus, le graphique se remplit tout seul.' })}`;
}
/* démo du tourniquet */
function mountDemo() {
  const el = $('#demotool'); if (!el) return; let t = 0, playing = false, raf = null, last = 0, speed = 0.25;
  el.innerHTML = `<div class="demo"><div class="panes"><div class="pane"><div class="t">Vrai geste</div><div id="hand-real"></div></div><div class="pane fake"><div class="t">Faux geste (le tour)</div><div id="hand-fake"></div></div></div>
  <div class="scrub"><button class="iconbtn" id="demo-play" aria-label="Lire">${I.play}</button><input type="range" id="demo-t" min="0" max="1000" value="0"><button class="pill sm" id="demo-speed">lent</button></div>
  <div class="card sunk" style="gap:8px"><div class="small"><b>Vrai geste ·</b> <span id="cap-real"></span></div><div class="small" style="color:var(--pen-text)"><b>Faux geste ·</b> <span id="cap-fake"></span></div></div>
  <p class="small">Vue de tes yeux, main gauche à gauche. Fais glisser pour avancer image par image. Le seul moment qui compte, c’est quand les doigts de la main droite recouvrent la pièce : dans le vrai geste tu la serres, dans le faux geste le pouce gauche la lâche. Vu de face, les deux sont identiques.</p></div>`;
  const real = el.querySelector('#hand-real'), fake = el.querySelector('#hand-fake'), range = el.querySelector('#demo-t'), capR = el.querySelector('#cap-real'), capF = el.querySelector('#cap-fake');
  const draw = () => { real.innerHTML = handsSVG(t, false); fake.innerHTML = handsSVG(t, true); range.value = Math.round(t * 1000); const ph = demoPhase(t); capR.textContent = DEMO_CAPS[ph][0]; capF.textContent = DEMO_CAPS[ph][1]; };
  const step = now => { if (!playing) return; const dt = (now - last) / 1000; last = now; t += dt * speed; if (t >= 1) { t = 1; playing = false; el.querySelector('#demo-play').innerHTML = I.play; } draw(); if (playing) raf = requestAnimationFrame(step); };
  draw();
  el.querySelector('#demo-play').addEventListener('click', () => { if (playing) { playing = false; el.querySelector('#demo-play').innerHTML = I.play; cancelAnimationFrame(raf); } else { if (t >= 1) t = 0; playing = true; last = performance.now(); el.querySelector('#demo-play').innerHTML = I.pause; raf = requestAnimationFrame(step); } });
  range.addEventListener('input', e => { playing = false; el.querySelector('#demo-play').innerHTML = I.play; t = +e.target.value / 1000; draw(); });
  el.querySelector('#demo-speed').addEventListener('click', e => { speed = speed === 0.25 ? 0.6 : 0.25; e.target.textContent = speed === 0.25 ? 'lent' : 'normal'; });
  onLeave(() => { playing = false; cancelAnimationFrame(raf); });
}
function mountChecks() { document.querySelectorAll('[data-ck]').forEach(cb => { try { cb.checked = localStorage.getItem('ck-' + cb.dataset.ck) === '1'; } catch (_) { } cb.addEventListener('change', () => { try { localStorage.setItem('ck-' + cb.dataset.ck, cb.checked ? '1' : '0'); } catch (_) { } }); }); }
/* flashcards italien */
function mountFlash() {
  const el = $('#flashtool'); if (!el) return; let queue = st.words.filter(w => (w.due || '') <= today()).sort((a, b) => (a.box || 0) - (b.box || 0)); let cur = null, shown = false, doneN = 0;
  const draw = () => {
    if (!cur) { el.innerHTML = `<div class="flash"><div class="k">${doneN ? doneN + ' mot' + (doneN > 1 ? 's' : '') + ' revu' + (doneN > 1 ? 's' : '') + ' aujourd’hui.' : ''}</div><div class="q">${queue.length ? 'Prêt ?' : (st.words.length ? 'Tout est à jour' : 'Ajoute des mots ci-dessous')}</div>${queue.length ? `<div class="btns"><button class="pill primary" data-f="start">Commencer · ${queue.length} mot${queue.length > 1 ? 's' : ''}</button></div>` : ''}</div>`; return; }
    el.innerHTML = `<div class="flash"><div class="k">${queue.length + 1} restant${queue.length ? 's' : ''} · boîte ${(cur.box || 0) + 1}/5</div><div class="q">${esc(cur.fr)}</div>${shown ? `<div class="a" lang="it">${esc(cur.it)}</div><div class="btns"><button class="pill" data-f="no">Raté</button><button class="pill primary" data-f="yes">${I.check}Je l’avais</button></div>` : `<div class="btns"><button class="pill primary" data-f="show">Voir la réponse</button></div>`}</div>`;
  };
  const next = () => { cur = queue.shift() || null; shown = false; draw(); };
  draw();
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-f]'); if (!b) return; const f = b.dataset.f;
    if (f === 'start') return next();
    if (f === 'show') { shown = true; return draw(); }
    const w = st.words.find(x => x.id === cur.id); if (w) { if (f === 'yes') { w.box = Math.min(4, (w.box || 0) + 1); } else { w.box = 0; } const days = f === 'yes' ? C.ITALIAN.intervals[Math.min(w.box, 4)] || 14 : 1; w.due = ymd(addDays(new Date(), Math.max(1, days))); w.r = Date.now(); changed(); }
    doneN++; if (f === 'yes') A.tick(); next(); if (!cur) { renderHeader(); const c = $('#s-compteur'); if (c) { const v = c.querySelector('.v'); if (v) v.textContent = italianAcquired(); } }
  });
}

/* ================= rendu : progression ================= */
async function renderProgress() {
  const el = $('#v-progression'); if (!el) return;
  const xp = totalXP(), L = levelFor(xp), lo = threshold(L), hi = threshold(L + 1); const sk = currentStreak(), best = bestStreak();
  const active = Object.keys(st.days).filter(k => dayDone(k)).length;
  let reps = 0, mins = 0; for (const k in st.days) { const s = sessionFor(st, k); for (const r of s.reps) if (st.days[k].reps[r.id]) { reps++; mins += r.min; } }
  const paliers = C.QORDER.filter(q => !C.QUESTS[q].counter).reduce((a, q) => a + (st.paliers[q] || 0), 0);
  const t = parseYmd(today()); const mon = addDays(t, -((t.getDay() + 6) % 7)); const first = addDays(mon, -77); let cols = '';
  for (let w = 0; w < 12; w++) { let col = '<div class="col">'; for (let d = 0; d < 7; d++) { const day = addDays(first, w * 7 + d); const k = ymd(day); const xpd = (st.days[k] || {}).xp || 0; let cls = 'c'; if (day > t || k < st.startDate) cls += ' future'; else if (xpd >= 60) cls += ' l3'; else if (xpd >= 30) cls += ' l2'; else if (xpd > 0) cls += ' l1'; if (k === ymd(t)) cls += ' today'; col += `<div class="${cls}" title="${frShort(k)}${xpd ? ' · ' + xpd + ' XP' : ''}"></div>`; } col += '</div>'; cols += col; }
  const log = []; for (const k in st.palierDates) { const q = k.replace(/\d+$/, ''), i = Number(k.slice(q.length)); if (C.QUESTS[q] && C.QUESTS[q].paliers && C.QUESTS[q].paliers[i]) log.push({ d: st.palierDates[k], t: C.QUESTS[q].name + ' · ' + C.QUESTS[q].paliers[i].n }); }
  for (const k in st.boss) if (st.boss[k]) log.push({ d: null, t: 'Boss semaine ' + k.slice(1) });
  log.sort((a, b) => ((b.d || '') < (a.d || '') ? -1 : 1));
  const drills = Object.keys(st.drills).map(k => `<div class="r"><span>${k.replace('-', ' ↔ ')}</span><span class="mono">${st.drills[k]} / min</span></div>`).join('');
  el.innerHTML = `<div><div class="eyebrow">Depuis le ${frShort(st.startDate)}</div><h1 class="h-page">Ta <span class="pen">progression</span></h1></div>
  <div class="levelcard"><div class="eyebrow">Ceinture · niveau ${L}</div><div class="name">${beltName(L)}</div><div class="bar"><i style="width:${Math.round(100 * (xp - lo) / (hi - lo))}%"></i></div><div class="sub"><b class="mono">${xp} XP</b> · encore <b class="mono">${hi - xp}</b> avant la ceinture suivante</div></div>
  <div class="figs"><div class="fig"><div class="v mono">${sk.run}<small>j</small></div><div class="k">série en cours</div></div><div class="fig"><div class="v mono">${best}<small>j</small></div><div class="k">meilleure série</div></div><div class="fig"><div class="v mono">${active}<small>j</small></div><div class="k">jours actifs</div></div></div>
  <div class="heat"><div class="eyebrow">12 dernières semaines</div><div class="grid" style="margin-top:8px">${cols}</div><div class="legend"><span>lundi en haut, dimanche en bas</span><span>plus c’est rose, plus la journée a compté</span></div></div>
  <div class="figs"><div class="fig"><div class="v mono">${reps}</div><div class="k">reps faits</div></div><div class="fig"><div class="v mono">${Math.round(mins / 60 * 10) / 10}<small>h</small></div><div class="k">de pratique</div></div><div class="fig"><div class="v mono">${paliers}</div><div class="k">paliers validés</div></div></div>
  <div><div class="eyebrow">Journal vidéo</div><p class="small" style="margin:6px 0 10px">Tes vidéos restent sur cet appareil (elles ne passent pas par le serveur). Pense à les enregistrer dans Photos pour les garder.</p><div class="row" style="margin-bottom:10px">${filmButton('', null, 'Vidéo libre', 'environment', 'Filmer')}<button class="pill act" data-act="importvid">Importer une vidéo</button></div><div class="gallery" id="gallery"><div class="empty">Chargement…</div></div></div>
  ${drills ? `<div><div class="eyebrow">Records du drill d’une minute</div><div class="loglist" style="margin-top:6px">${drills}</div></div>` : ''}
  <div><div class="eyebrow">Journal des paliers</div>${log.length ? `<div class="loglist" style="margin-top:6px">${log.map(l => `<div class="r"><span>${esc(l.t)}</span><span class="mono">${l.d ? frShort(l.d) : ''}</span></div>`).join('')}</div>` : '<div class="empty">Le premier palier arrive. Le test du tuck front lever est le plus proche.</div>'}</div>`;
  renderGallery();
}
async function renderGallery() {
  const g = $('#gallery'); if (!g) return; freeUrls(); const vids = await videos();
  if (!vids.length) { g.innerHTML = '<div class="empty">Aucune vidéo encore. Chaque palier a son bouton « Filmer » dans sa quête.</div>'; return; }
  g.innerHTML = vids.map(v => { const url = URL.createObjectURL(v.blob); objUrls.push(url); const qn = v.quest && C.QUESTS[v.quest] ? C.QUESTS[v.quest].name : 'Libre'; const pn = v.quest && v.palier != null && C.QUESTS[v.quest].paliers && C.QUESTS[v.quest].paliers[v.palier] ? C.QUESTS[v.quest].paliers[v.palier].n : (v.label || '');
    const canValidate = v.quest && v.palier != null && C.QUESTS[v.quest].paliers && (st.paliers[v.quest] || 0) <= v.palier;
    return `<div class="clip" data-id="${v.id}"><video src="${url}" preload="metadata" playsinline controls class="${v.facing === 'user' ? '' : ''}"></video><div class="meta"><b>${esc(qn)}</b><span>${esc(pn)}${v.duration ? ' · ' + v.duration + ' s' : ''} · ${new Date(v.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span></div><div class="acts"><button class="act" data-act="share" data-id="${v.id}">Enregistrer / partager</button>${canValidate ? `<button class="act" data-act="validvid" data-id="${v.id}">Valider le palier</button>` : ''}<button class="act danger" data-act="delvid" data-id="${v.id}">Supprimer</button></div></div>`; }).join('');
}
async function shareVideo(id) {
  const v = (await videos()).find(x => x.id === id); if (!v) return;
  const ext = (v.mime || '').includes('webm') ? 'webm' : 'mp4'; const file = new File([v.blob], `six-${v.quest || 'video'}-${new Date(v.created).toISOString().slice(0, 10)}.${ext}`, { type: v.mime || 'video/mp4' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'SIX' }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  const url = URL.createObjectURL(v.blob); const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ================= rendu : méthodes ================= */
function renderMethods() { const el = $('#v-methodes'); if (!el || el.innerHTML) return; el.innerHTML = `<div><div class="eyebrow">Ce qui marche vraiment</div><h1 class="h-page">Les <span class="pen">méthodes</span></h1><p class="lede" style="margin-top:10px">Douze principes tirés de la recherche sur l’apprentissage et la pratique. Chacun est déjà câblé dans tes séances, la ligne rose dit où.</p></div><div>${C.METHODS.map(m => `<div class="mcard"><h3>${esc(m[0])}<small>${esc(m[1])}</small></h3><p>${esc(m[2])}</p><div class="you">${esc(m[3])}</div></div>`).join('')}</div>`; }

/* ================= rendu : réglages ================= */
async function renderSettings() {
  const el = $('#v-reglages'); if (!el) return;
  let est = ''; try { if (navigator.storage && navigator.storage.estimate) { const e = await navigator.storage.estimate(); est = Math.round((e.usage || 0) / 1048576) + ' Mo utilisés'; } } catch (_) { }
  const standalone = window.navigator.standalone === true || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  el.innerHTML = `<div><div class="eyebrow">SIX · version ${BUILD}</div><h1 class="h-page">Réglages</h1></div>
  <div class="card"><div class="h3">Code de synchro</div><p class="small">C’est la clé de ta progression. Le même code sur un autre appareil, et tu retrouves tout. Garde-le quelque part (Notes).</p><div class="codebox" id="codebox">${esc(code || '')}</div><div class="row"><button class="pill act" data-act="copy" data-text="${esc(code || '')}">${I.copy}Copier</button><button class="pill act" data-act="syncnow">Synchroniser maintenant</button><span class="small">dernière synchro <span class="mono" id="syncstamp">${serverUpdatedAt ? new Date(serverUpdatedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '–'}</span></span></div>
  <details class="more"><summary>Utiliser un autre code${I.chev}</summary><div class="in stack"><input class="input" id="newcode" placeholder="mot-mot-mot-mot-12" autocapitalize="off" autocorrect="off" spellcheck="false"><div class="row"><button class="pill act" data-act="setcode">Changer de code</button></div><p class="small">La progression de ce téléphone sera fusionnée avec celle du nouveau code, rien n’est perdu.</p></div></details></div>
  ${standalone ? '' : `<div class="card sunk"><div class="h3">Mettre SIX sur l’écran d’accueil</div><p class="small">Dans Safari : bouton Partager (le carré avec la flèche), puis « Sur l’écran d’accueil ». L’app s’ouvre alors en plein écran, sans barre de navigateur.</p></div>`}
  <div class="card"><div class="h3">Stockage</div><div class="kv"><div class="r"><span class="k">Vidéos sur cet appareil</span><span class="v">${est || '–'}</span></div><div class="r"><span class="k">Début de l’aventure</span><span class="v">${frShort(st.startDate)}</span></div></div><div class="row"><button class="pill act" data-act="export">Exporter ma progression (JSON)</button><label class="pill" style="cursor:pointer">Importer<input type="file" accept="application/json" id="importfile" hidden></label></div></div>
  <div class="card"><div class="h3">Zone dangereuse</div><p class="small">Remet la progression de cet appareil et du serveur à zéro. Les vidéos restent.</p><div class="row"><button class="pill act" data-act="reset1" id="reset1">Tout réinitialiser</button></div></div>`;
  const imp = el.querySelector('#importfile'); if (imp) imp.addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { const data = JSON.parse(await f.text()); st = merge(st, data); changed(); renderAll(); toast('Progression importée'); } catch (_) { toast('Fichier illisible'); } });
}

/* ================= onboarding (code de synchro) ================= */
const WORDS = 'tuck,tour,corde,rose,colmar,barre,pince,miroir,capo,hollow,stylo,cahier,piece,hanche,epaule,frette,boucle,palier,joker,serie,ceinture,rappel,drill,tempo,souffle,silence,angle,paume,pouce,scapula,pont,grimpe,feuille,nuage,sapin,vosges,ried,neige,lune,braise'.split(',');
function genCode() { const r = n => { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; }; return [0, 1, 2, 3].map(() => WORDS[r(WORDS.length)]).join('-') + '-' + (10 + r(90)); }
function needOnboarding() { return !code; }
function renderOnboarding() {
  const suggested = genCode();
  const el = document.createElement('div'); el.className = 'onb'; el.id = 'onb';
  el.innerHTML = `<div class="box"><div class="big">SI<i>X</i></div><p class="lede">Tes six objectifs, en jeu. Avant de commencer, un code de synchro : c’est lui qui garde ta progression et la retrouve sur tes autres appareils.</p>
  <div class="codebox">${suggested}</div><button class="pill primary" id="onb-go" style="height:46px">C’est parti avec ce code</button>
  <details class="more"><summary>J’ai déjà un code${I.chev}</summary><div class="in stack"><input class="input" id="onb-code" placeholder="mot-mot-mot-mot-12" autocapitalize="off" autocorrect="off" spellcheck="false"><button class="pill" id="onb-use">Utiliser ce code</button></div></details>
  <p class="muted">Pas de compte, pas de mot de passe. Juste ce code.</p></div>`;
  document.body.appendChild(el);
  const finish = c => { setCode(c); el.remove(); boot(); };
  el.querySelector('#onb-go').addEventListener('click', () => finish(suggested));
  el.querySelector('#onb-use').addEventListener('click', () => { const v = (el.querySelector('#onb-code').value || '').trim().toLowerCase(); if (v.length < 8) { toast('Code trop court'); return; } finish(v); });
}
function setCode(c) { code = c.trim().toLowerCase(); try { localStorage.setItem(LS_CODE, code); localStorage.removeItem(LS_SRV); } catch (_) { } serverUpdatedAt = null; }

/* ================= routage ================= */
const TABS = ['jour', 'quetes', 'progression', 'methodes', 'reglages'];
function route() { const h = location.hash.replace('#', ''); if (h.startsWith('q/')) { const p = h.split('/'); return { view: 'q/' + p[1], q: p[1], sec: p[2] || '' }; } return { view: TABS.includes(h) ? h : 'jour' }; }
function showView() {
  stopLive(); freeUrls(); const r = route();
  TABS.forEach(x => { $('#v-' + x).hidden = (x !== r.view); }); $('#v-quest').hidden = !r.q;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.view === r.view || (r.q && t.dataset.view === 'quetes')));
  renderHeader(r.view);
  if (r.q) renderQuest(r.q, r.sec); else if (r.view === 'progression') renderProgress(); else if (r.view === 'reglages') renderSettings(); else if (r.view === 'methodes') renderMethods();
  if (!r.sec) window.scrollTo({ top: 0 });
}
window.addEventListener('hashchange', showView);
function renderAll() { document.getElementById('app').classList.toggle('pending', !loaded); const r = route(); renderHeader(r.view); renderToday(); renderQuests(); if (r.q) { stopLive(); renderQuest(r.q, ''); } else if (r.view === 'progression') renderProgress(); else if (r.view === 'reglages') renderSettings(); }

/* ================= événements ================= */
document.getElementById('app').addEventListener('click', e => {
  const sc = e.target.closest('[data-scroll]'); if (sc) { e.preventDefault(); const t = document.getElementById(sc.dataset.scroll); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
  const b = e.target.closest('[data-act]'); if (!b) return; const act = b.dataset.act;
  if (act === 'go') { location.hash = '#' + b.dataset.to; return; }
  if (act === 'copy') { copyText(b.dataset.text); return; }
  if (act === 'tone') { A.unlock(); A.pluck(+b.dataset.f, null, 0.6, 3); return; }
  if (act === 'arp') { A.unlock(); A.arpeggio(C.CHORDS[b.dataset.n].notes, 0.45); return; }
  if (act === 'strum') { A.unlock(); A.strum(C.CHORDS[b.dataset.n].notes); setTimeout(() => A.strum(C.CHORDS[b.dataset.n].notes, { up: true, gain: 0.3 }), 650); return; }
  if (act === 'chord') { const d = $('#chorddetail'); if (d) { d.innerHTML = chordDetail(b.dataset.n); d.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } A.unlock(); A.strum(C.CHORDS[b.dataset.n].notes, { gain: 0.35 }); return; }
  if (act === 'film') { A.unlock(); const q = b.dataset.q, p = b.dataset.p === '' ? null : +b.dataset.p; openCamera({ facing: b.dataset.f, quest: q, palier: p, label: b.dataset.l, title: b.dataset.l || 'Filmer', guide: q === 'frontlever', audio: q === 'guitare' || q === 'chanson', hint: q === 'frontlever' ? 'Pose le téléphone de profil, la ligne pointillée à hauteur de tes épaules' : q === 'magie' ? 'Caméra frontale = miroir. Vrai geste, faux geste, en alternance' : '', onSaved: () => { if (route().view === 'progression') renderProgress(); } }); return; }
  if (act === 'importvid') { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'video/*'; inp.addEventListener('change', async () => { const f = inp.files[0]; if (!f) return; try { await MDB.put({ id: uid(), created: Date.now(), quest: '', palier: null, label: 'Importée', blob: f, mime: f.type, duration: null }); videoCache = null; renderGallery(); toast('Vidéo importée'); } catch (_) { toast('Import impossible'); } }); inp.click(); return; }
  if (act === 'share') { shareVideo(b.dataset.id); return; }
  if (act === 'delvid') { if (b.dataset.sure) { MDB.del(b.dataset.id).then(() => { videoCache = null; renderGallery(); toast('Vidéo supprimée'); }); } else { b.dataset.sure = '1'; b.textContent = 'Sûr ? Supprimer'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'Supprimer'; }, 3000); } return; }
  if (act === 'validvid') { videos().then(vs => { const v = vs.find(x => x.id === b.dataset.id); if (!v) return; st.palierVideos[v.quest + v.palier] = v.id; setPalier(v.quest, v.palier + 1); toast('Palier validé avec la vidéo'); }); return; }
  if (act === 'syncnow') { pull().then(() => toast('Synchronisé')); return; }
  if (act === 'setcode') { const v = ($('#newcode').value || '').trim().toLowerCase(); if (v.length < 8) { toast('Code trop court'); return; } setCode(v); pull().then(() => { renderSettings(); toast('Code changé'); }); return; }
  if (act === 'export') { const blob = new Blob([JSON.stringify(st, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'six-progression-' + today() + '.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 3000); return; }
  if (act === 'reset1') { if (b.dataset.sure) { st = defaultState(); changed(); renderAll(); toast('Remis à zéro'); } else { b.dataset.sure = '1'; b.textContent = 'Vraiment tout effacer ? Appuie encore'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'Tout réinitialiser'; }, 4000); } return; }
  if (!loaded) return;
  if (act === 'rep') toggleRep(b.dataset.id);
  else if (act === 'two') { const r = sessionFor(st, today()).reps.find(x => x.id === b.dataset.id); if (r) startTimer(Object.assign({}, r, { min: 2 })); }
  else if (act === 'timer') { const r = sessionFor(st, today()).reps.find(x => x.id === b.dataset.id); if (r) startTimer(r); }
  else if (act === 'stop') stopTimer();
  else if (act === 'boss') { st.boss[b.dataset.key] = !st.boss[b.dataset.key]; changed(); renderAll(); if (st.boss[b.dataset.key]) { burst(); A.done(); } }
  else if (act === 'palier') setPalier(b.dataset.q, Number(b.dataset.n));
  else if (act === 'words') { const n = Number(b.dataset.n); st.italianWords = Math.max(0, Math.min(999, (st.italianWords || 0) + n)); changed(); renderAll(); if (italianAcquired() >= 200 && n > 0) burst(); }
  else if (act === 'addword') { const fr = ($('#wfr').value || '').trim(), it = ($('#wit').value || '').trim(); if (!fr || !it) { toast('Les deux champs'); return; } st.words.push({ id: uid(), fr, it, box: 0, due: today(), created: Date.now() }); changed(); renderQuest('italien', 'mots'); toast('Mot ajouté'); }
  else if (act === 'starter') { C.ITALIAN.starter.forEach(([fr, it]) => st.words.push({ id: uid(), fr, it, box: 0, due: today(), created: Date.now() })); changed(); renderQuest('italien', 'revision'); }
  else if (act === 'delword') { const w = st.words.find(x => x.id === b.dataset.id); if (w) { st.words = st.words.filter(x => x.id !== w.id); changed(); renderQuest('italien', 'mots'); } }
  else if (act === 'jjblog') { const note = ($('#jjbnote').value || '').trim(); st.jjbLog.push({ id: uid(), d: today(), note }); changed(); if (st.jjbLog.length >= 10 && (st.paliers.jjb || 0) < 4) setPalier('jjb', 4); renderQuest('jjb', 'cours'); toast('Cours noté, +20 XP'); }
  else if (act === 'memo') { const part = (document.querySelector('#memopart .on') || {}).dataset ? document.querySelector('#memopart .on').dataset.part : 'Refrain'; st.memoTests.push({ id: uid(), t: Date.now(), d: today(), part, n: +b.dataset.n }); changed(); renderQuest('chanson', 'test'); if (+b.dataset.n === 3) A.done(); }
});
document.getElementById('app').addEventListener('click', e => { const p = e.target.closest('#memopart [data-part]'); if (p) { document.querySelectorAll('#memopart .pill').forEach(x => x.classList.remove('on')); p.classList.add('on'); } });

/* ================= démarrage ================= */
function boot() {
  loadLocal();
  try { if (!localStorage.getItem(LS) && !localStorage.getItem(LS_SEEDED)) { st = merge(defaultState(), SEED); localStorage.setItem(LS_SEEDED, '1'); saveLocal(); } } catch (_) { }
  try { serverUpdatedAt = localStorage.getItem(LS_SRV) || null; } catch (_) { }
  loaded = true; renderAll(); showView(); pull();
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
}
(function init() {
  const params = new URLSearchParams(location.search); const k = params.get('k');
  try { code = localStorage.getItem(LS_CODE); } catch (_) { }
  if (k && k.trim().length >= 8) { setCode(k); }
  if (needOnboarding()) { renderHeader('jour'); renderOnboarding(); } else boot();
  let lastDay = today(); setInterval(() => { if (today() !== lastDay) { lastDay = today(); renderAll(); } }, 30000);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => { const nw = reg.installing; if (!nw) return; nw.addEventListener('statechange', () => { if (nw.state === 'activated' && navigator.serviceWorker.controller) toast('Nouvelle version de SIX chargée'); }); });
    }).catch(() => { });
  }
})();
})();
