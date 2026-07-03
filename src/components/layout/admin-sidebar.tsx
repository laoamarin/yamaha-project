"use client";

import { logout } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV, getEventIdFromAdminPath, isAdminNavActive } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  Award,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Music2,
  Pencil,
  Plus,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MAIN_ICONS = {
  "/admin/events": CalendarDays,
  "/admin/events/new": Plus,
} as const;

const EVENT_ICONS = {
  dashboard: LayoutDashboard,
  import: Upload,
  certificate: Award,
  edit: Pencil,
} as const;

type SidebarProps = {
  userEmail?: string | null;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function SidebarNav({
  userEmail,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const eventId = getEventIdFromAdminPath(pathname);
  const [eventName, setEventName] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) {
      setEventName(null);
      return;
    }

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("events")
      .select("name")
      .eq("id", eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setEventName(data?.name ?? null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const eventLinks = eventId ? ADMIN_NAV.event(eventId) : [];

  function handleNavClick() {
    onMobileClose?.();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between border-b px-4 lg:h-16 lg:px-5">
        <Link
          href="/admin/events"
          className="flex min-w-0 items-center gap-2.5"
          onClick={handleNavClick}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Music2 className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Yamaha Admin</p>
            <p className="truncate text-xs text-muted-foreground">
              ระบบจัดการงาน
            </p>
          </div>
        </Link>
        {mobileOpen && onMobileClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={onMobileClose}
            aria-label="ปิดเมนู"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4 lg:p-5">
        <div>
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            หลัก
          </p>
          <ul className="space-y-1">
            {ADMIN_NAV.main.map((item) => {
              const Icon =
                MAIN_ICONS[item.href as keyof typeof MAIN_ICONS] ?? CalendarDays;
              const active = isAdminNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {eventId && (
          <div>
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              งานนี้
            </p>
            {eventName && (
              <p className="mb-2 line-clamp-2 px-2 text-xs text-foreground/80">
                {eventName}
              </p>
            )}
            <ul className="space-y-1">
              {eventLinks.map((item) => {
                const Icon = item.href.includes("/dashboard")
                  ? EVENT_ICONS.dashboard
                  : item.href.includes("/import")
                    ? EVENT_ICONS.import
                    : item.href.includes("/certificate")
                      ? EVENT_ICONS.certificate
                      : EVENT_ICONS.edit;
                const active = isAdminNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent font-medium text-accent-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      <div className="border-t p-4 lg:p-5">
        {userEmail && (
          <p className="mb-3 truncate px-2 text-xs text-muted-foreground">
            {userEmail}
          </p>
        )}
        <form action={logout}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AdminSidebar(props: SidebarProps) {
  return (
    <aside className="hidden h-full w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <SidebarNav {...props} />
    </aside>
  );
}

export function AdminMobileSidebar({
  open,
  onClose,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="ปิดเมนู"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-[min(18rem,85vw)] flex-col bg-card shadow-xl">
        <SidebarNav
          userEmail={userEmail}
          mobileOpen
          onMobileClose={onClose}
        />
      </aside>
    </div>
  );
}
