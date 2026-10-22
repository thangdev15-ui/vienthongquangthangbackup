import { mkdir, writeFile } from 'node:fs/promises';

const base = process.argv[2] || 'https://vienthongquangthang.com';
const output = process.argv[3] || '/tmp/quang-thang-seo-before.json';
const paths = [
  '/', '/sitemap.xml', '/robots.txt', '/camera-tiandy', '/camera-tiandy/?column=1&per_page=18',
  '/danh-muc/camera-tiandy', '/cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao',
  '/tin-tuc/cap-mang-cat6-va-cap-mang-cat6e-khac-nhau-o-cho-nao',
  '/balun-video-5mp-gai', '/san-pham/balun-video-5mp-gai',
  '/cap-mang-la-gi', '/tin-tuc/cap-mang-la-gi',
  '/?wc-ajax=%25endpoint%25&elementor_page_id=9247',
  '/shop-2/?filter_cat=153,105&shop_view=grid_view',
  '/san-pham', '/tin-tuc', '/gioi-thieu', '/ho-so-nang-luc',
  '/seo-audit-nonexistent-20261022', '/san-pham/seo-audit-nonexistent-20261022',
  '/product-tag/cap-mang-vcom-cat5e', '/sitemap_index.xml',
];
const results = [];
for (const pathname of paths) {
  const url = new URL(pathname, base).href;
  const start = Date.now();
  const hops = [];
  let target = url;
  try {
    for (let i = 0; i < 8; i++) {
      const response = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
      const location = response.headers.get('location');
      hops.push({ url: target, status: response.status, location });
      if (location && response.status >= 300 && response.status < 400) { target = new URL(location, target).href; continue; }
      const body = await response.text();
      results.push({ url, hops, ms: Date.now() - start, type: response.headers.get('content-type'),
        title: body.match(/<title>(.*?)<\/title>/s)?.[1],
        canonical: body.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1],
        robots: [...body.matchAll(/<meta[^>]*name="robots"[^>]*content="([^"]+)"/g)].map(m => m[1]),
        sitemapUrls: pathname.endsWith('.xml') ? [...body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]) : undefined,
        body: pathname === '/robots.txt' ? body : undefined,
      });
      break;
    }
  } catch (error) { results.push({ url, hops, error: error.message }); }
  const { sitemapUrls, ...summary } = results.at(-1) || {};
  console.log(JSON.stringify({ ...summary, sitemapCount: sitemapUrls?.length }));
}
await mkdir(new URL('.', `file://${output}`).pathname, { recursive: true });
await writeFile(output, JSON.stringify({ checkedAt: new Date().toISOString(), base, results }, null, 2));
