import "server-only";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles, passwordResets, wishlists, products } from "@/db/schema";
import type { Profile } from "./types";

const SESSION_COOKIE = "qt_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "qt-dev-session-secret-change-in-production";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/* ------------------------------ password hashing ----------------------------- */

export function hashPassword(pw: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(pw, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* --------------------------------- sessions ---------------------------------- */

function sign(profileId: string, expiresAt: number): string {
  const mac = createHmac("sha256", SESSION_SECRET).update(`${profileId}.${expiresAt}`).digest("base64url");
  return `${profileId}.${expiresAt}.${mac}`;
}

function verify(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [profileId, expiresRaw, mac] = parts;
  const expiresAt = Number(expiresRaw);
  if (!expiresAt || expiresAt < Date.now()) return null;
  const expected = createHmac("sha256", SESSION_SECRET).update(`${profileId}.${expiresAt}`).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return profileId;
}

export async function setSession(profileId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sign(profileId, Date.now() + SESSION_TTL_MS), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_MS / 1000,
    path: "/",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSessionProfile(): Promise<Profile | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const profileId = verify(token);
  if (!profileId) return null;
  const rows = await db.select().from(profiles).where(eq(profiles.id, profileId));
  return rows[0] ?? null;
}

export async function getAdminOrThrow() {
  const user = await getSessionProfile();
  if (!user || user.role !== "admin") return null;
  return user;
}

/* --------------------------------- login gate --------------------------------- */
// Imported by admin pages; performs redirect when unauthorized.

export async function requireAdmin() {
  const user = await getAdminOrThrow();
  if (!user) {
    // Lazy import to avoid cycle
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }
  return user;
}

/* --------------------------- password reset tokens --------------------------- */

export async function createResetRecord(email: string): Promise<string> {
  const token = randomBytes(4).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await db.insert(passwordResets).values({ email, token, expiresAt });
  return token;
}

export async function consumeReset(email: string, token: string): Promise<boolean> {
  const rows = await db
    .select()
    .from(passwordResets)
    .where(eq(passwordResets.email, email))
    .orderBy(passwordResets.createdAt)
    .limit(1);
  const row = rows[rows.length - 1];
  if (!row || row.used || row.expiresAt.getTime() < Date.now()) return false;
  if (row.token !== token.trim().toUpperCase()) return false;
  await db.update(passwordResets).set({ used: true }).where(eq(passwordResets.id, row.id));
  return true;
}

/* ------------------------------ wishlist sync ------------------------------- */

export async function syncWishlistToDb(productIds: string[]) {
  const user = await getSessionProfile();
  if (!user) return 0;
  const valid = productIds.slice(0, 200);
  if (valid.length === 0) return 0;
  // remove existing, then insert the current local set (idempotent merge)
  const existing = await db.select().from(wishlists).where(eq(wishlists.profileId, user.id));
  for (const row of existing) {
    if (!valid.includes(row.productId)) {
      await db.delete(wishlists).where(eq(wishlists.id, row.id));
    }
  }
  const current = new Set(existing.map((r) => r.productId));
  let added = 0;
  for (const pid of valid) {
    if (!current.has(pid)) {
      const exists = await db.select({ id: products.id }).from(products).where(eq(products.id, pid)).limit(1);
      if (exists[0]) {
        await db.insert(wishlists).values({ profileId: user.id, productId: pid }).onConflictDoNothing();
        added++;
      }
    }
  }
  return added;
}
