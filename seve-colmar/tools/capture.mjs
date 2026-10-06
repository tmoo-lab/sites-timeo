// Capture déterministe du site : on pilote l'horloge GSAP image par image.
// usage: node capture.mjs <url> <outDir> <seconds> [fps=30] [w=1600] [h=900]
import fs from 'node:fs';
import path from 'node:path';

async function loadPlaywright() {
  try { return await import('playwright'); } catch {}
  try { return await import('/usr/local/lib/node_modules/playwright/index.js'); } catch {}
  return await import('playwright-core');
}

const [,, url, outDir, secondsArg, fpsArg = '30', wArg = '1600', hArg = '900'] = process.argv;
if (!url || !outDir || !secondsArg) {
  console.error('usage: node capture.mjs <url> <outDir> <seconds> [fps] [w] [h]');
  process.exit(1);
}
const seconds = parseFloat(secondsArg), fps = parseInt(fpsArg, 10), W = parseInt(wArg, 10), H = parseInt(hArg, 10);
fs.mkdirSync(outDir, { recursive: true });

const pw = await loadPlaywright();
const chromium = pw.chromium || pw.default?.chromium;
const launchOpts = { headless: true, args: ['--force-device-scale-factor=1', '--hide-scrollbars', '--font-render-hinting=none', '--disable-lcd-text'] };
if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH;
const browser = await chromium.launch(launchOpts);
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
const page = await ctx.newPage();
page.on('pageerror', e => console.error('[pageerror]', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('[console]', m.text()); });

await page.goto(url, { waitUntil: 'load' });
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
await page.evaluate(() => document.fonts.ready);
// première image : état t=0
await page.evaluate(() => window.__tick(0));
await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

const total = Math.round(seconds * fps);
const t0 = Date.now();
for (let k = 0; k < total; k++) {
  const t = k / fps;
  await page.evaluate((tt) => window.__tick(tt), t);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.screenshot({ path: path.join(outDir, `f_${String(k).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
  if (k % 60 === 0) console.log(`frame ${k}/${total} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
await browser.close();
console.log(`done: ${total} frames in ${outDir} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
