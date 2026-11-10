# Codex Skill Inventory

**Reviewed:** 10/11/2026

## Installed and used for this project

| Skill | Source | Use in this recovery |
| --- | --- | --- |
| `seo` | Luzikov/codex-seo-skill | Technical, on-page, schema, sitemap, content and indexability audit |
| `nextjs-seo` | laguagu/claude-code-nextjs-skills | App Router metadata, canonical, dynamic routes and Core Web Vitals review |
| `spreadsheets` | Bundled Codex runtime | SEO Recovery Tracker workbook |
| `browser:control-in-app-browser` | Bundled Codex plugin | Browser-capable verification when needed |
| `plugin-management` | Bundled Codex plugin | Connector/permission discovery |

## Available but not installed for this project

The environment also contains skills for games, documents, PDFs, images and sites. They are not installed or invoked as SEO/development skills because they do not improve the current Next.js recovery work.

## Deliberately not installed

- No unreviewed GitHub/skills.sh repository is installed automatically.
- No duplicate SEO skill is installed; `seo` and `nextjs-seo` cover the requested technical SEO scope.
- No Supabase-specific or security skill was discovered from a verified source in the available catalog. Database/schema work is handled through the existing repository patterns and direct review.

## API capability verified

| API | Status | Evidence / limitation |
| --- | --- | --- |
| Search Analytics API | Working | Property `https://vienthongquangthang.com/` returns clicks, impressions, CTR, position, query and page dimensions |
| URL Inspection API | Working | Inspected canonical/index states for priority URLs during audit |
| Sitemaps API | Working | Submitted and listed `https://vienthongquangthang.com/sitemap.xml` |
| General URL indexing request | Not available | Search Console API does not provide general-page indexing submission; Indexing API is not appropriate for normal product/article pages |
| Google Analytics / server logs | Not connected | No GA4 or raw access-log API was supplied |
| Vercel CLI deploy token | Invalid | CLI token rejected; GitHub webhook deployment is working |

