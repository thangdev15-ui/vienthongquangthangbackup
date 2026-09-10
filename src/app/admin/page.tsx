import { requireAdmin } from "@/lib/auth";
import { getDashboardStats } from "@/lib/data";
import { AdminShell } from "@/components/admin/shell";
import { DashboardView } from "@/components/admin/sections";

export const metadata = { title: "Dashboard — Quản trị" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getDashboardStats();
  return (
    <AdminShell title="Dashboard">
      <DashboardView
        stats={{
          totalProducts: stats.totalProducts,
          activeProducts: stats.activeProducts,
          totalCategories: stats.totalCategories,
          ordersToday: stats.ordersToday,
          pendingOrders: stats.pendingOrders,
          completedOrders: stats.completedOrders,
          revenue: stats.revenue,
          pendingReviews: stats.pendingReviews,
          recentOrders: stats.recentOrders.map((o) => ({
            id: o.id,
            orderCode: o.orderCode,
            customerName: o.customerName,
            total: o.total,
            status: o.status,
            createdAt: o.createdAt,
          })),
          recentProducts: stats.recentProducts.map((p) => ({ id: p.id, name: p.name, status: p.status, createdAt: p.createdAt })),
          recentArticles: stats.recentArticles.map((a) => ({ id: a.id, title: a.title, status: a.status, createdAt: a.createdAt })),
        }}
      />
    </AdminShell>
  );
}
