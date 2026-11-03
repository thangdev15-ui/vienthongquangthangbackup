import { google } from "googleapis";

const siteUrl = "https://vienthongquangthang.com/";
const keyFile = process.env.GSC_KEY_FILE;

if (!keyFile) {
  throw new Error("Set GSC_KEY_FILE to the local service-account JSON key path.");
}

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/webmasters"],
});
const searchconsole = google.searchconsole({ version: "v1", auth });

const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

async function performance(startDate: string, endDate: string, dimensions: string[] = []) {
  const { data } = await searchconsole.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions, rowLimit: 25 },
  });
  return data;
}

async function overview() {
  const today = new Date();
  // Search Console data has a reporting delay. Finish three days ago.
  const end = addDays(today, -3);
  const start = addDays(end, -27);
  const previousEnd = addDays(start, -1);
  const previousStart = addDays(previousEnd, -27);

  const [sites, sitemaps, current, previous, topPages, topQueries] = await Promise.all([
    searchconsole.sites.list(),
    searchconsole.sitemaps.list({ siteUrl }),
    performance(isoDate(start), isoDate(end)),
    performance(isoDate(previousStart), isoDate(previousEnd)),
    performance(isoDate(start), isoDate(end), ["page"]),
    performance(isoDate(start), isoDate(end), ["query"]),
  ]);

  const summary = (data: Awaited<ReturnType<typeof performance>>) => ({
    clicks: data.rows?.[0]?.clicks ?? 0,
    impressions: data.rows?.[0]?.impressions ?? 0,
    ctr: data.rows?.[0]?.ctr ?? 0,
    position: data.rows?.[0]?.position ?? 0,
  });

  console.log(JSON.stringify({
    property: siteUrl,
    accessibleProperties: sites.data.siteEntry?.map((site) => site.siteUrl),
    range: { current: [isoDate(start), isoDate(end)], previous: [isoDate(previousStart), isoDate(previousEnd)] },
    performance: { current: summary(current), previous: summary(previous) },
    sitemaps: sitemaps.data.sitemap,
    topPages: topPages.rows?.map((row) => ({ page: row.keys?.[0], clicks: row.clicks, impressions: row.impressions, position: row.position })),
    topQueries: topQueries.rows?.map((row) => ({ query: row.keys?.[0], clicks: row.clicks, impressions: row.impressions, position: row.position })),
  }, null, 2));
}

async function submitSitemap() {
  const feedpath = `${siteUrl}sitemap.xml`;
  await searchconsole.sitemaps.submit({ siteUrl, feedpath });
  console.log(`Submitted ${feedpath}`);
}

async function listSitemaps() {
  const { data } = await searchconsole.sitemaps.list({ siteUrl });
  console.log(JSON.stringify(data.sitemap, null, 2));
}

async function deleteSitemap(feedpath: string | undefined) {
  if (!feedpath) throw new Error("Provide the sitemap URL to delete.");
  await searchconsole.sitemaps.delete({ siteUrl, feedpath });
  console.log(`Deleted ${feedpath}`);
}

async function inspect(urls: string[]) {
  if (!urls.length) throw new Error("Provide one or more URLs to inspect.");
  const client = searchconsole.urlInspection.index;
  for (const inspectionUrl of urls) {
    const { data } = await client.inspect({
      requestBody: { inspectionUrl, siteUrl },
    });
    const result = data.inspectionResult?.indexStatusResult;
    console.log(JSON.stringify({
      url: inspectionUrl,
      verdict: result?.verdict,
      coverageState: result?.coverageState,
      indexingState: result?.indexingState,
      robotsTxtState: result?.robotsTxtState,
      pageFetchState: result?.pageFetchState,
      googleCanonical: result?.googleCanonical,
      userCanonical: result?.userCanonical,
      lastCrawlTime: result?.lastCrawlTime,
    }));
  }
}

async function main() {
  const [command = "overview", ...args] = process.argv.slice(2);
  if (command === "overview") await overview();
  else if (command === "submit-sitemap") await submitSitemap();
  else if (command === "list-sitemaps") await listSitemaps();
  else if (command === "delete-sitemap") await deleteSitemap(args[0]);
  else if (command === "inspect") await inspect(args);
  else throw new Error("Use: overview | submit-sitemap | list-sitemaps | delete-sitemap <url> | inspect <url...>");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
