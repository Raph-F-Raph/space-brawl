import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const SP = process.argv[2];
const fake = fs.readFileSync(`${SP}/test/fake-supabase.js`, 'utf8');
const b = await chromium.launch();
const errs = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
p.on('pageerror', (e) => errs.push(e.message));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await p.addInitScript('window.__startCoins = 5000;');
await p.route('**/*', (r) => { const u = r.request().url(); if (u.includes('jsdelivr')) return r.fulfill({ contentType: 'application/javascript', body: fake }); if (u.startsWith('file:')) return r.continue(); return r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
const click = (t) => p.locator('button', { hasText: t }).first().click({ force: true });
await p.goto(`file://${SP}/index.html`); await p.waitForSelector('form'); await p.click('button.link');
await p.fill('input[type=text]', 'Raphael'); await p.fill('input[type=email]', 'a@b.co'); await p.fill('input[type=password]', 'secret123'); await p.click('button[type=submit]');
await p.waitForSelector('.btn-play');
await click('Personnages'); await p.waitForTimeout(500);
// une planche avec toutes les cartes côte à côte : on met la grille en 1 rangée défilante pour les photographier
const names = await p.$$eval('.card-name', (e) => e.map((x) => x.textContent));
console.log('Personnages:', names.join(', '));
for (const [i, n] of names.entries()) {
  const card = p.locator('.card', { hasText: n }).first();
  await card.scrollIntoViewIfNeeded();
  await card.screenshot({ path: `${SP}/test/char-${i + 1}-${n}.png` });
}
// accueil avec Frelon dans le dôme : on l'achète puis on le choisit
await p.locator('.card', { hasText: 'Frelon' }).locator('button').click({ force: true }); await p.waitForTimeout(300);
await p.locator('.modal-actions .btn-yellow').click({ force: true }); await p.waitForTimeout(600);
await p.locator('.card', { hasText: 'Frelon' }).locator('button', { hasText: 'Choisir' }).click({ force: true }); await p.waitForTimeout(400);
await click('Retour'); await p.waitForTimeout(500);
await p.screenshot({ path: `${SP}/test/home-frelon.png` });
console.log('ERREURS:', errs.length ? errs : 'aucune');
await b.close();
