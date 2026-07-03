"use client";

import { AdminMobileSidebar, AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
  userEmail?: string | null;
};

export function AdminDashboardShell({ children, userEmail }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex min-h-screen">
        <AdminSidebar userEmail={userEmail} />
        <AdminMobileSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          userEmail={userEmail}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={() => setMobileOpen(true)}
              aria-label="เปิดเมนู"
            >
              <Menu className="size-4" />
            </Button>
            <p className="truncate text-sm font-semibold">Yamaha Admin</p>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
