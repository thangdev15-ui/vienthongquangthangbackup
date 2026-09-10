import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../src/db/index";
import { profiles } from "../src/db/schema";

const email = process.env.ADMIN_EMAIL ?? "admin@vienthongquangthang.com";
const password = process.env.ADMIN_PASSWORD ?? "AdminQT2026!";
const name = process.env.ADMIN_NAME ?? "Quản trị viên Quang Thắng";
const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;

async function main() {
  const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
  if (existing[0]) {
    await db.update(profiles).set({ name, passwordHash, role: "admin", updatedAt: new Date() }).where(eq(profiles.email, email));
  } else {
    await db.insert(profiles).values({ name, email, passwordHash, role: "admin" });
  }
  console.log(`[admin] ready: ${email}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
