import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  AdminBody,
  AdminShell,
} from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { LogOut, Music2 } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <AdminShell>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-slate-900 px-4 text-white sm:px-6">
        <Link href="/admin/events" className="flex items-center gap-2.5 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/10">
            <Music2 className="size-4" />
          </div>
          <span className="text-sm">Yamaha Admin</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden max-w-[140px] truncate text-xs text-slate-400 sm:inline">
            {user.email}
          </span>
          <form action={logout}>
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        </div>
      </header>
      <AdminBody>{children}</AdminBody>
    </AdminShell>
  );
}
