import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const audit = JSON.parse(await readFile(process.argv[2] || '/tmp/quang-thang-seo-local.json', 'utf8'));
const origin = 'https://vienthongquangthang.com';
const redirects = {
  '/camera-tiandy': '/danh-muc/camera-tiandy',
  '/camera-tiandy/': '/danh-muc/camera-tiandy',
  '/cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao': '/tin-tuc/cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao',
  '/cap-mang-la-gi': '/tin-tuc/cap-mang-la-gi',
  '/balun-video-5mp-gai': '/san-pham/balun-video-5mp-gai',
  '/shop-2/': '/san-pham',
  '/gioi-thieu': '/ho-so-nang-luc',
  '/sitemap_index.xml': '/sitemap.xml',
};
for (const row of audit.results) {
  const pathname = new URL(row.url).pathname;
  assert(!row.error, `${pathname}: ${row.error}`);
  const final = row.hops.at(-1);
  if (pathname.includes('seo-audit-nonexistent') || pathname.startsWith('/product-tag/')) {
    assert.equal(final.status, 404, `${pathname} must return HTTP 404`);
    continue;
  }
  assert.equal(final.status, 200, `${pathname} must resolve to HTTP 200`);
  assert(!row.robots.some(value => value.includes('noindex')), `${pathname} unexpectedly noindex`);
  if (redirects[pathname]) {
    assert.equal(row.hops.length, 2, `${pathname} must redirect once`);
    assert.equal(row.hops[0].status, 301);
    assert.equal(new URL(final.url).pathname, redirects[pathname]);
  }
  if (row.type.includes('text/html')) {
    assert.equal(row.canonical, origin + new URL(final.url).pathname.replace(/\/$/, ''), `${pathname} canonical mismatch`);
  }
  if (row.sitemapUrls) {
    assert(row.sitemapUrls.length > 1000, 'Sitemap must include public catalog');
    assert(row.sitemapUrls.every(url => new URL(url).origin === origin), 'Sitemap has incorrect domain');
    assert(!row.sitemapUrls.some(url => url.endsWith('/gioi-thieu')), 'Sitemap includes a redirected page');
  }
  if (pathname === '/robots.txt') assert(row.body.includes(`Sitemap: ${origin}/sitemap.xml`));
}
console.log(`PASS: ${audit.results.length} URL checks (redirects, canonicals, 404s, sitemap, robots).`);
