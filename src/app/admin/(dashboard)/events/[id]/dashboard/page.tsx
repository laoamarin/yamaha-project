import { RegistrationDashboard } from "@/components/admin/RegistrationDashboard";
import { AdminPageHeader } from "@/components/layout/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Registration, Student } from "@/types/database";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function EventDashboardPage({ params }: Props) {
  const { supabase } = await requireAdmin();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  const [{ data: students }, { data: registrations }] = await Promise.all([
    supabase
      .from("students")
      .select("*")
      .eq("event_id", params.id)
      .order("full_name"),
    supabase
      .from("registrations")
      .select("*")
      .eq("event_id", params.id),
  ]);

  const regMap = new Map(
    (registrations ?? []).map((r) => [r.student_id, r as Registration])
  );

  const rows = (students ?? []).map((s: Student) => ({
    ...s,
    registration: regMap.get(s.id) ?? null,
  }));

  const registeredCount = rows.filter((r) => r.registration).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="รายชื่อลงทะเบียน"
        subtitle={event.name}
        backHref="/admin/events"
      />
      <RegistrationDashboard
        event={event}
        initialRows={rows}
        initialRegisteredCount={registeredCount}
      />
    </div>
  );
}
