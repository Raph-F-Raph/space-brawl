import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const SP = process.argv[2];
const fake = fs.readFileSync(`${SP}/test/fake-supabase.js`, 'utf8');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.addInitScript('window.__startCoins = 9000;');
await p.route('**/*', (r) => { const u = r.request().url(); if (u.includes('jsdelivr')) return r.fulfill({ contentType: 'application/javascript', body: fake }); if (u.startsWith('file:')) return r.continue(); return r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
const click = (t) => p.locator('button', { hasText: t }).first().click({ force: true });
await p.goto(`file://${SP}/index.html`); await p.waitForSelector('form'); await p.click('button.link');
await p.fill('input[type=text]', 'Raphael'); await p.fill('input[type=email]', 'a@b.co'); await p.fill('input[type=password]', 'secret123'); await p.click('button[type=submit]');
await p.waitForSelector('.btn-play');
await click('Personnages'); await p.waitForTimeout(400);
for (const n of ['Nova', 'Volt', 'Frelon', 'Titan']) {
  await p.locator('.card', { hasText: n }).locator('button').click({ force: true }); await p.waitForTimeout(250);
  await p.locator('.modal-actions .btn-yellow').click({ force: true }); await p.waitForTimeout(500);
}
// planche : toutes les cartes débloquées
const card = (n) => p.locator('.card', { hasText: n }).first();
for (const n of ['Nova', 'Volt', 'Frelon', 'Titan']) { await card(n).scrollIntoViewIfNeeded(); await card(n).screenshot({ path: `${SP}/test/own-${n}.png` }); }
await card('Frelon').locator('button', { hasText: 'Choisir' }).click({ force: true }); await p.waitForTimeout(400);
await click('Retour'); await p.waitForTimeout(500);
await p.screenshot({ path: `${SP}/test/home-frelon.png` });
await b.close();
