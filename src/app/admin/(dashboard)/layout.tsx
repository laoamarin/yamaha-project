import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LogOut, Music2 } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/events"
              className="flex items-center gap-2 font-semibold text-foreground"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Music2 className="size-4" />
              </div>
              <span className="hidden sm:inline">Yamaha Admin</span>
            </Link>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <nav className="hidden text-sm text-muted-foreground sm:block">
              <Link
                href="/admin/events"
                className="transition-colors hover:text-foreground"
              >
                งานทั้งหมด
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground sm:inline">
              {user.email}
            </span>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="size-4" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
