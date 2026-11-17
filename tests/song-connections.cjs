const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const context = await browser.newContext();
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'mye.test') return route.abort();
      const file = path.join(root, decodeURIComponent(url.pathname));
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404 });
      const ext = path.extname(file);
      return route.fulfill({ body: fs.readFileSync(file), contentType: ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg' })[ext] || 'image/png' });
    });
    const page = await context.newPage();
    for (const [slug, song] of [['toy-story-5', 'i-knew-it-i-knew-you'], ['kpop-demon-hunters', 'golden']]) {
      await page.goto(`http://mye.test/${slug}/index.html`);
      await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
      await page.locator('#after-questions').evaluate(node => { node.closest('details').open = true; });
      const card = page.locator('.song-connection-card');
      assert.equal(await card.count(), 1);
      assert.equal(await page.locator('#after-questions + .song-connection-card').count(), 1);
      assert.equal(await card.locator('a').getAttribute('href'), `https://musicyourenglish.com/songs/${song}`);
      assert.equal(await card.locator('a').getAttribute('target'), '_blank');
      for (const width of [390, 768, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await card.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => { const image = document.querySelector('.song-connection-cover'); return image.complete && image.naturalWidth > 0; });
        assert(await card.evaluate(node => node.scrollWidth <= node.clientWidth + 1), `${slug}: fits at ${width}px`);
        assert.equal(await card.locator('a').evaluate(node => getComputedStyle(node).color), 'rgb(255, 255, 255)');
      }
      await page.evaluate(() => { window.print = () => {}; document.querySelector('[data-print-lesson]').click(); });
      assert.equal(await page.locator('.lesson-print-export .song-connection-card').count(), 0);
      assert.equal(await page.locator('.lesson-print-section').count(), 3);
    }
    console.log('Passed song links, placement, local thumbnails, mobile/tablet/desktop fit, button contrast, and worksheet exclusion.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
