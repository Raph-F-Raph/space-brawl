import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const SP = process.argv[2];
const fake = fs.readFileSync(`${SP}/test/fake-supabase.js`, 'utf8');
const browser = await chromium.launch();
const errors = [];
async function newPage(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[console] ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  await page.route('**/*', (route) => {
    const u = route.request().url();
    if (u.includes('cdn.jsdelivr.net')) return route.fulfill({ contentType: 'application/javascript', body: fake });
    if (u.startsWith('file:')) return route.continue();
    return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
  });
  return page;
}
const clickText = (page, text) => page.locator('button', { hasText: text }).first().click({ force: true });
const out = (n) => `${SP}/test/${n}.png`;
async function signup(page) {
  await page.goto(`file://${SP}/index.html`);
  await page.waitForSelector('form');
  await page.click('button.link');
  await page.fill('input[type=text]', 'Raphael');
  await page.fill('input[type=email]', 'test@example.com');
  await page.fill('input[type=password]', 'secret123');
  await page.click('button[type=submit]');
  await page.waitForSelector('.btn-play');
}
// --- Portrait : collections ---
let page = await newPage(390, 844);
await signup(page);
await clickText(page, 'Personnages'); await page.waitForTimeout(400);
await page.screenshot({ path: out('4-characters') });
await clickText(page, 'Retour'); await page.waitForTimeout(200);
await clickText(page, 'Soucoupes'); await page.waitForTimeout(400);
await page.screenshot({ path: out('5-ships') });
await clickText(page, 'Retour'); await page.waitForTimeout(200);
await clickText(page, 'Clans'); await page.waitForTimeout(300);
await page.screenshot({ path: out('6-clans') });
// --- Paysage : niveau 1 ---
page = await newPage(844, 390);
await signup(page);
await page.locator('.btn-play').click({ force: true }); await page.waitForTimeout(300);
await clickText(page, 'Chapitres'); await page.waitForTimeout(400);
await page.screenshot({ path: out('7-chapters') });
await page.locator('.node-open, .node-current, .node:not(.node-locked)').first().click({ force: true });
await page.waitForSelector('canvas'); await page.waitForTimeout(1500);
await page.screenshot({ path: out('8-level-start') });
// joue : se déplace + tire en continu
await page.keyboard.down('Space');
for (let i = 0; i < 24; i++) {
  const k = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'][i % 4];
  await page.keyboard.down(k); await page.waitForTimeout(450); await page.keyboard.up(k);
  if (i === 8) await page.screenshot({ path: out('9-level-fight') });
}
await page.screenshot({ path: out('10-level-later') });
const hud = await page.evaluate(() => document.querySelector('.hud, .level-hud')?.textContent ?? document.body.innerText.slice(0, 200));
console.log('HUD:', hud.replace(/\s+/g, ' ').slice(0, 160));
const over = await page.evaluate(() => /VICTOIRE|DÉFAITE/.test(document.body.innerText));
console.log('Level ended already:', over);
console.log('Fake calls:', JSON.stringify(await page.evaluate(() => window.__fake.calls)));
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
