import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const SP = process.argv[2];
const fake = fs.readFileSync(`${SP}/test/fake-supabase.js`, 'utf8');
const b = await chromium.launch();
const errs = [];
for (const w of [360, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 740 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/*', (r) => { const u = r.request().url(); if (u.includes('jsdelivr')) return r.fulfill({ contentType: 'application/javascript', body: fake }); if (u.startsWith('file:')) return r.continue(); return r.fulfill({ status: 200, contentType: 'text/css', body: '' }); });
  await p.goto(`file://${SP}/index.html`); await p.waitForSelector('form'); await p.click('button.link');
  await p.fill('input[type=text]', 'Raphael'); await p.fill('input[type=email]', 'a@b.co'); await p.fill('input[type=password]', 'secret123'); await p.click('button[type=submit]');
  await p.waitForSelector('.btn-play'); await p.locator('.btn-play').click({ force: true }); await p.waitForTimeout(400);
  await p.screenshot({ path: `${SP}/test/12-play-${w}.png` });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  console.log(w, 'overflow horizontal:', overflow);
}
console.log('errors:', errs.length ? errs : 'none');
await b.close();
