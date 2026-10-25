import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const SP = process.argv[2];
const fake = fs.readFileSync(`${SP}/test/fake-supabase.js`, 'utf8');
const browser = await chromium.launch();
const errors = [];
async function newPage(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
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
const btns = (page) => page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.textContent.trim().replace(/\s+/g, ' ')));
const out = (n) => `${SP}/test/${n}.png`;

const page = await newPage(390, 844);
await page.goto(`file://${SP}/index.html`);
await page.waitForSelector('form');
await page.screenshot({ path: out('1-auth') });
await page.click('button.link');
await page.fill('input[type=text]', 'Raphael');
await page.fill('input[type=email]', 'test@example.com');
await page.fill('input[type=password]', 'secret123');
await page.click('button[type=submit]');
await page.waitForSelector('.btn-play');
await page.waitForTimeout(400);
await page.screenshot({ path: out('2-home') });
console.log('HOME buttons:', JSON.stringify(await btns(page)));
await page.locator('.btn-play').click({ force: true });
await page.waitForTimeout(300);
await page.screenshot({ path: out('3-play') });
console.log('PLAY buttons:', JSON.stringify(await btns(page)));
console.log('ERRORS so far:', errors.length ? errors : 'none');
await browser.close();
