# Google Search Console Traffic Analysis

**Property:** `https://vienthongquangthang.com/`  
**Collected:** 10/11/2026 through the Search Console API  
**Latest complete range:** 11/10/2026-07/11/2026 (Google reporting delay applied)

## Executive result

| Metric | Current 28 days | Previous 28 days | Change |
| --- | ---: | ---: | ---: |
| Clicks | 247 | 817 | -69.8% |
| Impressions | 8,452 | 27,831 | -69.6% |
| CTR | 2.92% | 2.94% | -0.01 percentage points |
| Average position | 9.97 | 8.36 | +1.61 positions worse |

Clicks and impressions fell together while CTR stayed effectively flat. The primary issue is therefore loss of search visibility and/or eligible URL coverage, not merely a snippet-click problem.

## When the decline started

Weekly Search Console data shows the first material decline in the week beginning 21/09/2026, followed by a sharper decline through October:

| Week | Clicks | Impressions |
| --- | ---: | ---: |
| 07/09/2026 | 299 | 10,738 |
| 14/09/2026 | 271 | 10,220 |
| 21/09/2026 | 232 | 7,778 |
| 28/09/2026 | 156 | 5,095 |
| 05/10/2026 | 120 | 3,674 |
| 12/10/2026 | 74 | 1,880 |
| 19/10/2026 | 48 | 1,581 |
| 26/10/2026 | 57 | 2,534 |
| 02/11/2026 | 60 | 2,162 |

This aligns with the website/migration period. It is strong timing evidence, but it does not prove a single code change was the only cause.

## Current opportunities from real GSC data

| Query / page | Impressions | Position | Action |
| --- | ---: | ---: | --- |
| `dây cáp quang` | 211 | 7.57 | Strengthen the matching category, add intent-specific selection text and internal links |
| `dh-sd6ce225u-hni` | 67 | 9.88 | Verify product availability/specification; improve product landing page |
| `cat5e` | 50 | 6.38 | Build a useful Cat5e category/guide relationship |
| `cat6e` | 49 | 4.67 | Protect and expand Cat6e comparison content |
| Cat6 vs Cat6e article | 407 | 7.39 | Refresh content and link to current relevant products/categories |
| Dây cáp quang category | 314 | 6.87 | Add specific metadata/content and improve commercial navigation |

## Sitemap and index API status

- Sitemap submitted: `https://vienthongquangthang.com/sitemap.xml`
- Last submission and download: 10/11/2026
- API warnings/errors: `0 / 0`
- Sitemap API's `indexed: 0` field is stale/aggregate data and must not be interpreted as zero indexed site pages; individual URL Inspection checks showed priority canonical URLs are indexed.

## Limits

- Search Analytics data is delayed and sampled/aggregated by Google.
- No GA4 or server logs were supplied, so conversion, bot 5xx rate and channel attribution cannot be verified here.
- Search Console API cannot submit ordinary article/product URLs for indexing on demand.

