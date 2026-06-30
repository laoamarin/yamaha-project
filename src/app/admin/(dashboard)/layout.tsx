import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin/events" className="font-semibold text-slate-900">
              Yamaha Admin
            </Link>
            <nav className="text-sm text-slate-600">
              <Link href="/admin/events" className="hover:text-indigo-600">
                งานทั้งหมด
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500 hidden sm:inline">{user.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-slate-600 hover:text-red-600 transition-colors"
              >
                ออกจากระบบ
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
