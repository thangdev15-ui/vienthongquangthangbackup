import { redirect } from "next/navigation";
import { getAdminOrThrow } from "@/lib/auth";
import { AdminLoginForm } from "./login-form";

export const metadata = { title: "Đăng nhập quản trị" };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getAdminOrThrow();
  if (admin) redirect("/admin");
  return <AdminLoginForm />;
}
