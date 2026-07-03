export function getEventIdFromAdminPath(pathname: string): string | null {
  const match = pathname.match(/^\/admin\/events\/([^/]+)/);
  if (!match || match[1] === "new") return null;
  return match[1];
}

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin/events") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const ADMIN_NAV = {
  main: [
    { href: "/admin/events", label: "งานทั้งหมด" },
    { href: "/admin/events/new", label: "สร้างงานใหม่" },
  ],
  event: (eventId: string) => [
    {
      href: `/admin/events/${eventId}/dashboard`,
      label: "รายชื่อลงทะเบียน",
    },
    { href: `/admin/events/${eventId}/import`, label: "นำเข้ารายชื่อ" },
    {
      href: `/admin/events/${eventId}/certificate`,
      label: "ตั้งค่าเกียรติบัตร",
    },
    { href: `/admin/events/${eventId}/edit`, label: "แก้ไขงาน" },
  ],
} as const;
