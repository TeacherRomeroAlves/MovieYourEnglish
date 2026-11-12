const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'learning-data.js'), 'utf8'), sandbox);
const lessons = sandbox.window.MYE_LEARNING_CATALOG.lessons;
(async () => {
  const pages = [...lessons.map(lesson => lesson.href), 'index.html', 'movies.html', 'how-it-works.html', 'social-proof.html', 'my-learning.html'];
  for (const file of pages) {
    const head = fs.readFileSync(path.join(root, file), 'utf8').split('</head>')[0];
    const get = property => {
      const matches = [...head.matchAll(new RegExp(`<meta (?:property|name)="${property}" content="([^"]+)"`, 'g'))];
      assert.equal(matches.length, 1, `${file}: exactly one ${property}`);
      return matches[0][1];
    };
    assert.equal(get('twitter:card'), 'summary_large_image');
    assert(get('og:title').length > 0);
    assert(get('og:description').length > 0);
    assert(get('og:image:alt').length > 0);
    const url = new URL(get('og:url'));
    assert.equal(url.protocol, 'https:');
    const image = new URL(get('og:image'));
    assert.equal(image.origin, url.origin);
    assert.equal(get('twitter:image'), image.href);
    const local = path.join(root, image.pathname);
    const metadata = await sharp(local).metadata();
    assert.equal(metadata.format, 'jpeg');
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert(fs.statSync(local).size < 500000, `${file}: lightweight image`);
    const lesson = lessons.find(lesson => lesson.href === file);
    if (lesson) assert(image.pathname.endsWith(`/${lesson.movieSlug}.jpg`), `${file}: correct movie poster`);
  }
  console.log(`Passed static preview tags, movie images, HTTPS URLs, JPEG dimensions, and file sizes for ${pages.length} pages.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
