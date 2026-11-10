# Development and SEO Delivery Standards

## Before changing production

1. Read the route, component, data model and current production behavior.
2. Confirm the issue with HTTP, Search Console or performance evidence.
3. Keep redirects, canonical tags, published URLs and production data unchanged unless the change has explicit evidence and approval.
4. Do not commit keys, service-account JSON, tokens or `.env` values.

## Implementation standard

- Use App Router metadata and server rendering for public SEO pages.
- Return real HTTP 404/410 responses for absent/retired records; never use a `200` not-found UI for crawlers.
- Use one canonical URL per public record and a single-hop 301 only when an equivalent replacement exists.
- Emit schema only from true data. Product offers must not invent price, availability or reviews.
- Prefer image sizing/optimization and stable layout dimensions. Treat field Core Web Vitals as the final measure, not one Lighthouse run.
- Add internal links only where the target genuinely helps the reader; use descriptive anchor text.

## Verification before push

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. Test changed routes locally for HTTP status, canonical and structured data.
5. Push a focused commit, then verify the production URL after deployment.

## SEO recovery operating rules

- Track Search Console at 7-day and 28-day intervals; do not infer success or failure from one day.
- Recover pages with historic traffic before expanding into new low-evidence content.
- Do not reverse a migration or change URL architecture again without a documented mapping and 4-6 weeks of post-fix data.
- Do not bulk-validate intentional 301/404/410 groups in Search Console.
- Escalate sales decisions for stock, price, discontinued SKU and replacement model rather than fabricating commercial data.

