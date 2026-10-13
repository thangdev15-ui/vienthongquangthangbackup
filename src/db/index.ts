import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
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
