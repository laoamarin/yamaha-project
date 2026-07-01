import { requireAdmin } from "@/lib/supabase/admin";

export default async function FullscreenAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return children;
}
