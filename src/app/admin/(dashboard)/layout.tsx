import { AdminDashboardShell } from "@/components/layout/admin-dashboard-shell";
import { requireAdmin } from "@/lib/supabase/admin";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <AdminDashboardShell userEmail={user.email}>
      {children}
    </AdminDashboardShell>
  );
}
