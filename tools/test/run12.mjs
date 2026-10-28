import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const SP = process.argv[2]; const cleared = process.argv[3] ?? '0'; const tag = process.argv[4] ?? 'n';
const fake = fs.readFileSync(`${SP}/test/fake-supabase.js`, 'utf8');
const b = await chromium.launch(); const errs = [];
const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
const p = await ctx.newPage(); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript(`window.__startCleared = ${cleared}; window.__startCoins = 0; window.__heal = true;`);
await p.route('**/*', (r) => { const u = r.request().url(); if (u.includes('jsdelivr')) return r.fulfill({ contentType: 'application/javascript', body: fake }); if (u.startsWith('file:')) return r.continue(); return r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
await p.goto(`file://${SP}/index.html?debug`); await p.waitForSelector('form'); await p.click('button.link');
await p.fill('input[type=text]', 'Raphael'); await p.fill('input[type=email]', 'a@b.co'); await p.fill('input[type=password]', 'secret123'); await p.click('button[type=submit]');
await p.waitForSelector('.btn-play'); await p.locator('.btn-play').click({ force: true }); await p.waitForTimeout(300);
await p.locator('button', { hasText: 'Chapitres' }).first().click({ force: true }); await p.waitForTimeout(300);
await p.locator('.node-current').first().click({ force: true });
await p.waitForSelector('canvas');
const hud = () => p.evaluate(() => document.querySelector('.hud-wave')?.textContent);
console.log('HUD départ:', await hud());
await p.screenshot({ path: `${SP}/test/r12-${tag}-0.png` });
await p.keyboard.down('Space'); await p.keyboard.down('ArrowUp');
let ended = false, t = 0, shots = 0;
const dodge = ['ArrowLeft', 'ArrowRight'];
while (!ended && t < 140) {
  await p.evaluate(() => { if (window.__engine && window.__heal) window.__engine.player.hp = 9999; });
  const open = /ouvert/.test((await hud()) ?? '');
  const k = dodge[Math.floor(t / 1.2) % 2];
  if (open) await p.evaluate(() => { window.__engine.player.x = 480; });
  if (!open) await p.keyboard.down(k);
  await p.waitForTimeout(600); if (!open) await p.keyboard.up(k); t += 0.6;
  ended = await p.evaluate(() => /VICTOIRE|DÉFAITE/.test(document.body.innerText));
  if (Math.floor(t) % 15 === 0 && shots < 6 && !ended) { shots++; await p.screenshot({ path: `${SP}/test/r12-${tag}-${shots}.png` }); console.log(`t=${t.toFixed(0)}s HUD:`, await hud()); }
}
await p.keyboard.up('Space'); await p.keyboard.up('ArrowUp');
await p.waitForTimeout(500);
console.log('Fini après ~', t.toFixed(0), 's :', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 120));
console.log('Appels:', JSON.stringify(await p.evaluate(() => window.__fake.calls)));
await p.screenshot({ path: `${SP}/test/r12-${tag}-end.png` });
console.log('ERREURS:', errs.length ? errs : 'aucune'); await b.close();
