import { EventsListTable } from "@/components/admin/EventsListTable";
import { AdminPageHeader } from "@/components/layout/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";
import { LinkButton } from "@/components/ui/link-button";
import { Plus } from "lucide-react";

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        โหลดข้อมูลไม่สำเร็จ: {error.message}
      </div>
    );
  }

  const eventsWithCounts = await Promise.all(
    (events ?? []).map(async (event) => {
      const [{ count: studentCount }, { count: registeredCount }] =
        await Promise.all([
          supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id),
          supabase
            .from("registrations")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id),
        ]);
      return {
        event,
        studentCount: studentCount ?? 0,
        registeredCount: registeredCount ?? 0,
      };
    })
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      <AdminPageHeader
        title="งานคอนเสิร์ต"
        subtitle="จัดการงาน รายชื่อ และเกียรติบัตร"
        action={
          <LinkButton href="/admin/events/new">
            <Plus className="size-4" />
            สร้างงาน
          </LinkButton>
        }
      />

      {eventsWithCounts.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card py-16 text-center shadow-sm">
          <p className="text-muted-foreground">ยังไม่มีงาน</p>
          <LinkButton href="/admin/events/new" className="mt-4" variant="outline">
            <Plus className="size-4" />
            สร้างงานแรก
          </LinkButton>
        </div>
      ) : (
        <EventsListTable rows={eventsWithCounts} />
      )}
    </div>
  );
}
