/* SIX — audio : métronome, cordes pincées (Karplus-Strong), bips, notes de référence. */
window.SIX_AUDIO = (function () {
  'use strict';
  let ac = null;
  function ctx() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; } }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }
  /* À appeler depuis un geste utilisateur (tap) pour débloquer le son sur iPhone */
  function unlock() { const c = ctx(); if (!c) return; const b = c.createBuffer(1, 1, c.sampleRate); const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(0); }

  /* ----- bips ----- */
  function tone(freq, when, dur, gain, type) {
    const c = ctx(); if (!c) return; when = when == null ? c.currentTime : when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain || 0.25, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + (dur || 0.12));
    o.connect(g).connect(c.destination); o.start(when); o.stop(when + (dur || 0.12) + 0.05);
  }
  function beep() { const c = ctx(); if (!c) return; tone(880, c.currentTime, 0.3, 0.25); tone(1175, c.currentTime + 0.14, 0.35, 0.25); }
  function tick() { const c = ctx(); if (!c) return; tone(1400, c.currentTime, 0.05, 0.15, 'square'); }
  function go() { const c = ctx(); if (!c) return; tone(660, c.currentTime, 0.12, 0.3); tone(990, c.currentTime + 0.12, 0.25, 0.3); }
  function done() { const c = ctx(); if (!c) return; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, c.currentTime + i * 0.11, 0.3, 0.22)); }

  /* ----- corde pincée (Karplus-Strong) ----- */
  const cache = {};
  function stringBuffer(freq, seconds) {
    const c = ctx(); if (!c) return null;
    const key = freq.toFixed(2) + ':' + seconds;
    if (cache[key]) return cache[key];
    const sr = c.sampleRate, N = Math.max(2, Math.round(sr / freq)), len = Math.floor(sr * seconds);
    const buf = c.createBuffer(1, len, sr), out = buf.getChannelData(0);
    const ring = new Float32Array(N);
    for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
    // un peu de « corps » : filtre passe-bas initial pour adoucir l'attaque
    for (let k = 0; k < 2; k++) for (let i = 1; i < N; i++) ring[i] = (ring[i] + ring[i - 1]) * 0.5;
    const decay = freq < 150 ? 0.998 : freq < 300 ? 0.996 : 0.994;
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const cur = ring[idx], nxt = ring[(idx + 1) % N];
      out[i] = cur;
      ring[idx] = (cur + nxt) * 0.5 * decay;
      idx = (idx + 1) % N;
    }
    // fondu de fin
    const fade = Math.min(len, Math.floor(sr * 0.05));
    for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
    cache[key] = buf; return buf;
  }
  function pluck(freq, when, gain, seconds) {
    const c = ctx(); if (!c || !freq) return;
    const buf = stringBuffer(freq, seconds || 2.2); if (!buf) return;
    const s = c.createBufferSource(), g = c.createGain();
    s.buffer = buf; g.gain.value = gain == null ? 0.5 : gain;
    s.connect(g).connect(c.destination); s.start(when == null ? c.currentTime : when);
  }
  /* notes : tableau du grave à l'aigu (0 = corde non jouée) */
  function strum(notes, opts) {
    const c = ctx(); if (!c) return 0; opts = opts || {};
    const gap = opts.gap == null ? 0.045 : opts.gap, t0 = c.currentTime + (opts.delay || 0.02);
    const played = notes.filter(Boolean); const up = !!opts.up;
    const seq = up ? played.slice().reverse() : played;
    seq.forEach((f, i) => pluck(f, t0 + i * gap, opts.gain == null ? 0.45 : opts.gain, opts.seconds));
    return played.length * gap;
  }
  function arpeggio(notes, gap) { return strum(notes, { gap: gap || 0.5, gain: 0.55, seconds: 2.6 }); }

  /* ----- métronome (ordonnanceur avec avance) ----- */
  function Metronome(opts) {
    opts = opts || {};
    let bpm = opts.bpm || 60, running = false, nextTime = 0, beat = 0, timer = null;
    const lookahead = 0.12, interval = 25;
    let onBeat = opts.onBeat || null, subdiv = opts.subdiv || 1, beatsPerBar = opts.beatsPerBar || 4;
    function schedule() {
      const c = ctx(); if (!c) return;
      while (nextTime < c.currentTime + lookahead) {
        const inBar = beat % (beatsPerBar * subdiv);
        const accent = inBar === 0, onDown = inBar % subdiv === 0;
        if (opts.click !== false) tone(accent ? 1500 : (onDown ? 1000 : 800), nextTime, 0.04, accent ? 0.35 : (onDown ? 0.22 : 0.1), 'square');
        if (onBeat) { const b = beat, t = nextTime; setTimeout(() => { if (running) onBeat({ beat: b, inBar, accent, onDown, time: t }); }, Math.max(0, (t - c.currentTime) * 1000)); }
        nextTime += 60 / bpm / subdiv; beat++;
      }
    }
    return {
      start() { const c = ctx(); if (!c) return; running = true; beat = 0; nextTime = c.currentTime + 0.1; clearInterval(timer); timer = setInterval(schedule, interval); },
      stop() { running = false; clearInterval(timer); timer = null; },
      get running() { return running; },
      set bpm(v) { bpm = v; }, get bpm() { return bpm; },
      set onBeat(f) { onBeat = f; }, set subdiv(v) { subdiv = v; }, set beatsPerBar(v) { beatsPerBar = v; }
    };
  }

  const OPEN_STRINGS = [['Mi grave (6)', 82.41], ['La (5)', 110.0], ['Ré (4)', 146.83], ['Sol (3)', 196.0], ['Si (2)', 246.94], ['Mi aigu (1)', 329.63]];

  return { unlock, beep, tick, go, done, pluck, strum, arpeggio, Metronome, OPEN_STRINGS, ctx };
})();
