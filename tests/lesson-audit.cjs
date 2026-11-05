// Run with NODE_PATH pointing at an installed Playwright package.
const fs = require('fs');
const path = require('path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const context = await browser.newContext();
    // Serve only repository files, without connecting to production accounts or analytics.
    await context.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (url.hostname !== 'mye.test') return route.abort();
      let file = path.join(root, decodeURIComponent(url.pathname));
      if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
      if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return route.fulfill({ status: 404, body: '' });
      const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.html') ? 'text/html' : 'image/png';
      return route.fulfill({ body: fs.readFileSync(file), contentType: type });
    });
    const page = await context.newPage();
    page.on('dialog', (dialog) => dialog.accept());
    const slugs = fs.readdirSync(root).filter((slug) => fs.existsSync(path.join(root, slug, 'index.html')) && (!process.env.LESSON_AUDIT_SLUG || process.env.LESSON_AUDIT_SLUG === slug));
    for (const slug of slugs) {
      console.log("Checking " + slug);
      const errors = [];
      const onError = (error) => {
        // Account imports are intentionally blocked by the isolated route above.
        if (!error.message.includes('Failed to fetch dynamically imported module: https://esm.sh/')) errors.push(error.message);
      };
      page.on('pageerror', onError);
      await page.goto(`http://mye.test/${slug}/index.html`);
      await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
      const before = parseInt(await page.locator('.progress-panel strong').innerText());
      if (slug === 'spider-man-brand-new-day' || slug === 'about-time') {
        await page.evaluate(() => {
          document.querySelectorAll('details.lesson-section').forEach((section) => { section.open = true; });
          const carousel = document.querySelector('#before-questions .question-carousel');
          carousel.scrollLeft = carousel.clientWidth;
          carousel.querySelectorAll('.question-slide')[1].querySelector('.answer-choice').click();
        });
        await page.waitForTimeout(100);
        const positions = await page.locator('.lesson-page .question-carousel').evaluateAll((carousels) => carousels.map((carousel) => Math.round(carousel.scrollLeft / Math.max(1, carousel.clientWidth))));
        assert.equal(positions[0], 1, 'Answering preserves the active question');
        assert(positions.slice(1).every((index) => index === 0), 'Other activities remain on question one');
        await page.evaluate(() => document.querySelector('#reset-lesson').click());
      }
      await page.evaluate(() => document.dispatchEvent(new CustomEvent('mye-speaking-saved')));
      assert.equal(parseInt(await page.locator('.progress-panel strong').innerText()), before + 1, `${slug}: speaking adds one task`);
      await page.reload();
      await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
      assert.equal(parseInt(await page.locator('.progress-panel strong').innerText()), before + 1, `${slug}: speaking persists`);
      await page.evaluate(() => { window.print = () => {}; document.querySelector('[data-print-lesson]').click(); });
      assert.equal(await page.locator('.lesson-print-section').count(), 3, `${slug}: three printable stages`);
      assert.equal(await page.locator('.lesson-print-export .speaking-card').count(), 0, `${slug}: no printable recording controls`);
      if (slug === 'about-time') {
        await page.evaluate(() => {
          document.body.classList.remove('lesson-printing');
          document.querySelector('.lesson-print-export').replaceChildren();
          document.querySelector('#preference-activity').closest('details').open = true;
        });
        await page.locator('#preference-activity [data-nav="next"]').click();
        await page.waitForFunction(() => { const carousel = document.querySelector('#preference-activity .question-carousel'); return Math.round(carousel.scrollLeft / carousel.clientWidth) === 1; });
        await page.locator('[data-preference="dreams"][data-preference-option="0"]').click();
        assert.equal(await page.locator('#preference-activity .question-carousel').evaluate((node) => Math.round(node.scrollLeft / node.clientWidth)), 1, 'Choosing an option preserves the active slide');
        await page.locator('#preference-activity [data-nav="previous"]').click();
        await page.waitForFunction(() => { const carousel = document.querySelector('#preference-activity .question-carousel'); return Math.round(carousel.scrollLeft / carousel.clientWidth) === 0; });
        await page.evaluate(() => {
          document.body.classList.remove('lesson-printing');
          document.querySelector('.lesson-print-export').replaceChildren();
          for (const question of window.ABOUT_TIME_LESSON.preferences) document.querySelector(`[data-preference="${question.id}"][data-preference-option="0"]`).click();
        });
        assert.equal(await page.locator('.progress-panel strong').innerText(), '4 / 24 complete');
        assert.equal(await page.locator('.preference-option.is-selected').count(), 3);
        assert((await page.locator('.preference-follow-up').allTextContents()).every((text) => text.includes('Let’s talk:')));
        await page.evaluate(() => document.querySelector('[data-preference="powers"][data-preference-option="1"]').click());
        assert.equal(await page.locator('.progress-panel strong').innerText(), '4 / 24 complete');
        await page.reload();
        await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
        assert.equal(await page.locator('.preference-option.is-selected').count(), 3);
        await page.evaluate(() => { window.print = () => {}; document.querySelector('[data-print-lesson]').click(); });
        assert.equal(await page.locator('.lesson-print-export .preference-option.is-selected').count(), 0);
        assert.equal(await page.locator('.lesson-print-export .preference-option small').count(), 6);
        await page.evaluate(() => { document.body.classList.remove('lesson-printing'); document.querySelector('[data-reset-activity]').click(); });
        await page.waitForLoadState('load');
        await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
        assert.equal(await page.locator('.progress-panel strong').innerText(), '1 / 24 complete');
        assert.equal(await page.locator('.preference-option.is-selected').count(), 0);
      }
      if (slug === 'obsession') {
        await page.evaluate(() => {
          document.body.classList.remove('lesson-printing');
          document.querySelector('.lesson-print-export').replaceChildren();
          for (const group of ['before', 'after', 'scene']) {
            for (const question of window.OBSESSION_LESSON[group]) document.querySelector(`[data-group="${group}"][data-id="${question[0]}"][data-answer="${question[3]}"]`).click();
          }
          const questions = [...document.querySelectorAll('[data-during]')].map((button) => button.dataset.during);
          questions.forEach((id) => document.querySelector(`[data-during="${id}"]`).click());
          window.OBSESSION_LESSON.gapWords.forEach((word, index) => {
            const transfer = new DataTransfer();
            transfer.setData('text/plain', word);
            document.querySelector(`[data-drop-slot="${index}"]`).dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
          });
        });
        assert.equal(await page.locator('.progress-panel strong').innerText(), '27 / 27 complete');
        assert.equal(await page.locator('.question-card.is-correct').count(), 16);
        await page.evaluate(() => document.querySelector('[data-reset-activity]').click());
        await page.waitForLoadState('load');
        await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
        assert.equal(await page.locator('.progress-panel strong').innerText(), '23 / 27 complete', 'Extra challenge reset preserves other answers');
      }
      if (slug === 'spider-man-brand-new-day') {
        await page.evaluate(() => {
          document.body.classList.remove('lesson-printing');
          document.querySelector('.lesson-print-export').replaceChildren();
          const distractors = window.SPIDER_MAN_LESSON.gridDistractors.slice(0, 5);
          distractors.forEach((word) => document.querySelector(`[data-vocab-word="${word}"]`).click());
          document.querySelector('[data-check-vocab]').click();
        });
        assert.equal(await page.locator('.vocab-grid-word.is-wrong').count(), 5);
        assert.equal(await page.locator('.progress-panel strong').innerText(), '1 / 25 complete', 'Incorrect grid must not count as completed');
        await page.evaluate(() => {
          window.SPIDER_MAN_LESSON.gridDistractors.slice(0, 5).forEach((word) => document.querySelector(`[data-vocab-word="${word}"]`).click());
          window.SPIDER_MAN_LESSON.gridAnswers.forEach((word) => document.querySelector(`[data-vocab-word="${word}"]`).click());
          document.querySelector('[data-check-vocab]').click();
          for (const group of ['before', 'after', 'scene']) for (const question of window.SPIDER_MAN_LESSON[group]) document.querySelector(`[data-group="${group}"][data-id="${question[0]}"][data-answer="${question[3]}"]`).click();
          for (let i = 0; i < window.SPIDER_MAN_LESSON.during.length; i++) document.querySelector(`[data-during="${i}"]`).click();
        });
        assert.equal(await page.locator('.progress-panel strong').innerText(), '25 / 25 complete');
        await page.reload();
        await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
        assert.equal(await page.locator('.vocab-grid-word.is-correct').count(), 5);
        assert.equal(await page.locator('.vocab-grid-word').count(), 16);
        await page.evaluate(() => { window.print = () => {}; document.querySelector('[data-print-lesson]').click(); });
        assert.equal(await page.locator('.lesson-print-export .vocab-grid-word.is-correct, .lesson-print-export .vocab-grid-word.is-selected, .lesson-print-export [data-check-vocab]').count(), 0);
        await page.evaluate(() => { document.body.classList.remove('lesson-printing'); document.querySelector('[data-reset-activity]').click(); });
        await page.waitForLoadState('load');
        await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
        assert.equal(await page.locator('.progress-panel strong').innerText(), '24 / 25 complete');
        assert.equal(await page.locator('.vocab-grid-word.is-selected').count(), 0);
      }
      if (slug === 'ballad-of-songbirds-and-snakes') {
        await page.evaluate(() => {
          document.body.classList.remove('lesson-printing');
          document.querySelector('.lesson-print-export').replaceChildren();
          for (const group of ['before', 'after']) {
            for (const question of window.BALLAD_LESSON[group]) document.querySelector(`[data-group="${group}"][data-id="${question[0]}"][data-answer="${question[3]}"]`).click();
          }
          for (let i = 0; i < window.BALLAD_LESSON.during.length; i++) document.querySelector(`[data-during="${i}"]`).click();
          for (const question of window.BALLAD_LESSON.preferences) document.querySelector(`[data-preference="${question.id}"][data-preference-option="0"]`).click();
        });
        assert.equal(await page.locator('.progress-panel strong').innerText(), '22 / 22 complete');
        assert.equal(await page.locator('.content-note .eyebrow').textContent(), 'Mild content warning');
        await page.evaluate(() => document.querySelector('[data-reset-activity]').click());
        await page.waitForLoadState('load');
        await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
        assert.equal(await page.locator('.progress-panel strong').innerText(), '19 / 22 complete');
      }
      await page.evaluate(() => { document.body.classList.remove('lesson-printing'); document.querySelector('#reset-lesson').click(); });
      assert.equal(parseInt(await page.locator('.progress-panel strong').innerText()), 0, `${slug}: reset clears speaking completion`);
      assert.deepEqual(errors, [], `${slug}: no lesson runtime errors`);
      page.off('pageerror', onError);
    }
    console.log(`Passed speaking, reload, print, and reset checks for ${slugs.length} lessons.`);
    await page.goto('http://mye.test/project-hail-mary/index.html');
    await page.waitForFunction(() => !!document.querySelector('[data-print-lesson]'));
    await page.evaluate(() => {
      const cells = [...document.querySelectorAll('[data-cell]')].map((node) => node.dataset.cell);
      cells.forEach((cell) => document.querySelector(`[data-cell="${cell}"]`)?.click());
      document.querySelectorAll('[data-reveal-rocky]').forEach((button) => button.click());
      window.print = () => {};
      document.querySelector('[data-print-lesson]').click();
    });
    assert((await page.locator('.lesson-print-export .word-item strong').allTextContents()).every((text) => /letters$/.test(text)));
    assert.equal(await page.locator('.lesson-print-export .found-mark, .lesson-print-export .correction-card small').count(), 0);
    assert.equal(await page.locator('.lesson-print-export .letter[class*="color-"]').count(), 0);
    console.log('Passed completed word-search and correction worksheet checks.');
    await page.goto('http://mye.test/odyssey/index.html');
    await page.waitForFunction(() => window.__myeLessonExportsReady);
    const prompt = await page.locator('.response-prompt-text').innerText();
    const popupReady = page.waitForEvent('popup');
    await page.evaluate(() => document.querySelector('#save-report').click());
    const popup = await popupReady;
    await popup.waitForLoadState('domcontentloaded');
    assert((await popup.locator('.writing').innerText()).includes(prompt));
    await popup.close();
    console.log('Passed report prompt check.');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://mye.test/movies.html');
    await page.waitForFunction(() => document.querySelectorAll('.featured-slide').length === 3);
    assert.equal(await page.locator('.featured-slide[aria-hidden="false"]').count(), 1);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(3300);
    assert.equal(await page.locator('.featured-slide.is-active .activity-link').getAttribute('href'), './project-hail-mary/index.html', 'Featured movies rotate automatically');
    await page.locator('[data-featured-slide="1"]').click();
    assert.equal(await page.locator('.featured-slide.is-active .activity-link').getAttribute('href'), './project-hail-mary/index.html');
    await page.locator('[data-featured-slide="2"]').click();
    assert.equal(await page.locator('.featured-slide.is-active .activity-link').getAttribute('href'), './spider-man-brand-new-day/index.html');
    assert.equal(await page.locator('.featured-slide[inert]').count(), 2);
    await page.locator('.featured-pause').click();
    assert.equal(await page.locator('.featured-pause').innerText(), 'Play');
    await page.locator('[data-featured-slide="0"]').click();
    for (let index = 0; index < 3; index++) {
      await page.locator(`[data-featured-slide="${index}"]`).click();
      const fits = await page.locator('.featured-slide.is-active').evaluate((slide) => {
        const actions = slide.querySelector('.hero-actions').getBoundingClientRect();
        const controls = slide.parentElement.querySelector('.featured-rotation-controls').getBoundingClientRect();
        return actions.bottom <= controls.top && slide.scrollWidth <= slide.clientWidth + 1;
      });
      assert(fits, 'Mobile featured content fits above its controls');
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.featured-pause').innerText(), 'Play');
    console.log('Passed featured movie links, slide selection, and pause checks.');
    assert.equal(await page.locator('#poster-carousel .movie-tile[data-year=""]').count(), 0, 'Every movie has a release year');
    await page.locator('.movie-filter-panel').evaluate((panel) => { panel.open = true; });
    assert.equal(await page.locator('#movie-filter-order').inputValue(), 'random');
    assert.equal(await page.locator('#movie-filter-year').count(), 0);
    const originalShuffle = await page.locator('#poster-carousel .movie-poster-link').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    await page.locator('#movie-filter-order').selectOption('recent');
    const newest = await page.locator('#poster-carousel .movie-poster-link').evaluateAll((links) => links.slice(0, 4).map((link) => link.getAttribute('href')));
    assert.deepEqual(newest, ['./spider-man-brand-new-day/index.html', './ballad-of-songbirds-and-snakes/index.html', './about-time/index.html', './obsession/index.html']);
    for (const mode of ['newest', 'oldest']) {
      await page.locator('#movie-filter-order').selectOption(mode);
      const years = await page.locator('#poster-carousel .movie-tile').evaluateAll((tiles) => tiles.map((tile) => Number(tile.dataset.year)));
      assert.deepEqual(years, [...years].sort((a, b) => mode === 'newest' ? b - a : a - b));
    }
    assert.equal(await page.locator('#poster-carousel .movie-tile h3').first().innerText(), 'Forrest Gump');
    await page.locator('#movie-title-search').fill('Spider');
    assert.equal(await page.locator('#poster-carousel .movie-tile:not([hidden])').count(), 1);
    await page.locator('#movie-filter-platform').selectOption('netflix');
    assert.equal(await page.locator('#poster-carousel .movie-tile:not([hidden])').count(), 0, 'Search and platform filters combine with ordering');
    await page.locator('#movie-filter-platform').selectOption('all');
    assert.equal(await page.locator('#poster-carousel').evaluate((node) => node.scrollLeft), 0);
    await page.locator('#movie-title-search').fill('');
    await page.locator('#movie-filter-order').selectOption('random');
    assert.deepEqual(await page.locator('#poster-carousel .movie-poster-link').evaluateAll((links) => links.map((link) => link.getAttribute('href'))), originalShuffle, 'Random order stays stable while changing filters');
    console.log('Passed random order, recently added, release-year ordering, and combined filters.');
    assert.equal(await page.locator('.family-row a[href="./spider-man-brand-new-day/index.html"]').count(), 1);
    assert.equal(await page.locator('.debate-row a[href="./spider-man-brand-new-day/index.html"]').count(), 0);
    assert.equal(await page.locator('.family-row a[href="./ballad-of-songbirds-and-snakes/index.html"]').count(), 0);
    assert.equal(await page.locator('.debate-row a[href="./ballad-of-songbirds-and-snakes/index.html"]').count(), 1);
    await page.locator('a.movie-poster-link[href="./ballad-of-songbirds-and-snakes/index.html"]').click();
    assert.equal(await page.locator('.content-warning-dialog[open] .eyebrow').textContent(), 'Mild content warning');
    assert((await page.locator('.content-warning-dialog[open] h2').innerText()).includes('The Ballad of Songbirds'));
    await page.locator('.content-warning-dialog[open] .warning-cancel').click();
    assert.equal(await page.locator('a.movie-poster-link[href="./about-time/index.html"]').count(), 1);
    assert.equal(await page.locator('.curated-row a[href="./about-time/index.html"]').count(), 2);
    await page.locator('a.movie-poster-link[href="./obsession/index.html"]').click();
    assert.equal(await page.locator('.content-warning-dialog[open] h2').innerText(), 'Obsession');
    await page.locator('.content-warning-dialog[open] .warning-cancel').click();
    await page.locator('.mobile-nav-toggle').click();
    assert.equal(await page.locator('.mobile-nav-toggle').getAttribute('aria-expanded'), 'true');
    assert(await page.locator('.global-nav').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.mobile-nav-toggle').getAttribute('aria-expanded'), 'false');
    console.log('Passed mobile menu open and Escape checks.');
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
