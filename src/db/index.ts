import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

function getDatabaseUrl(urlString: string) {
  const url = new URL(urlString);
  // Session Pooler (5432) has a low per-project client cap and is unsuitable
  // for concurrent serverless requests. Supabase Transaction Pooler (6543)
  // safely multiplexes those requests over the same database.
  if (url.hostname.endsWith(".pooler.supabase.com") && url.port === "5432") {
    url.port = "6543";
    url.searchParams.set("pgbouncer", "true");
  }
  return url.toString();
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: getDatabaseUrl(databaseUrl),
    // Supabase Session Pooler has a small connection cap. A serverless instance
    // only needs one reusable connection; letting every request open a pool can
    // exhaust the cap and return intermittent 5xx responses.
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    allowExitOnIdle: true,
  });

globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
