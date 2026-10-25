import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const SP = process.argv[2];
const fake = fs.readFileSync(`${SP}/test/fake-supabase.js`, 'utf8');
const b = await chromium.launch();
const errs = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
p.on('pageerror', (e) => errs.push(e.message));
await p.addInitScript('window.__startCoins = 700;');
await p.route('**/*', (r) => { const u = r.request().url(); if (u.includes('jsdelivr')) return r.fulfill({ contentType: 'application/javascript', body: fake }); if (u.startsWith('file:')) return r.continue(); return r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
const click = (t) => p.locator('button', { hasText: t }).first().click({ force: true });
const coins = () => p.evaluate(() => window.__fake.profile.coins);
await p.goto(`file://${SP}/index.html`); await p.waitForSelector('form'); await p.click('button.link');
await p.fill('input[type=text]', 'Raphael'); await p.fill('input[type=email]', 'a@b.co'); await p.fill('input[type=password]', 'secret123'); await p.click('button[type=submit]');
await p.waitForSelector('.btn-play');
await click('Boutique'); await p.waitForTimeout(500);
await p.screenshot({ path: `${SP}/test/20-shop.png` });
const titles = await p.$$eval('.card-name', (e) => e.map((x) => x.textContent));
console.log('Boutique propose:', titles.join(', '));
// 1) achat Nova (500) avec 700 pièces
await p.locator('.card', { hasText: 'Nova' }).locator('button').click({ force: true }); await p.waitForTimeout(300);
await p.screenshot({ path: `${SP}/test/21-confirm.png` });
await p.locator('.modal-actions .btn-yellow').click({ force: true }); await p.waitForTimeout(700);
console.log('Après achat Nova: pièces serveur =', await coins(), '| toast =', await p.locator('.toast').textContent().catch(() => 'aucun'));
console.log('Nova encore en vente ?', (await p.$$eval('.card-name', (e) => e.map((x) => x.textContent))).includes('Nova'));
// 2) Star Cruiser (600) avec 200 pièces -> manque de l'argent
await p.locator('.card', { hasText: 'Star Cruiser' }).locator('button').click({ force: true }); await p.waitForTimeout(300);
await p.screenshot({ path: `${SP}/test/22-missing.png` });
const dis = await p.locator('.modal .btn-yellow').isDisabled();
console.log('Confirmer désactivé quand il manque des pièces:', dis, '|', (await p.locator('.modal-body').textContent()).trim());
await p.locator('.modal-actions .btn-grey').click({ force: true }); await p.waitForTimeout(300);
// 3) échange 5 gemmes
await click('5 💎'); await p.waitForTimeout(500);
console.log('Après échange 5 gemmes: pièces =', await coins(), 'gemmes =', await p.evaluate(() => window.__fake.profile.gems));
await p.locator('.scroll').evaluate((e) => e.scrollTo(0, e.scrollHeight)); await p.waitForTimeout(300);
await p.screenshot({ path: `${SP}/test/23-shop-bottom.png` });
// 4) Nova utilisable dans Personnages
await click('Retour'); await p.waitForTimeout(300); await click('Personnages'); await p.waitForTimeout(400);
await p.locator('.card', { hasText: 'Nova' }).locator('button').click({ force: true }); await p.waitForTimeout(400);
console.log('Nova sélectionnée côté serveur:', await p.evaluate(() => window.__fake.profile.selected_character === 'c2'));
console.log('Appels:', JSON.stringify(await p.evaluate(() => window.__fake.calls)));
console.log('ERREURS:', errs.length ? errs : 'aucune');
await b.close();
