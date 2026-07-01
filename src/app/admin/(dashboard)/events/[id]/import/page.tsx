import { StudentImportForm } from "@/components/admin/StudentImportForm";
import { requireAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function ImportStudentsPage({ params }: Props) {
  const { supabase } = await requireAdmin();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  const { count } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true })
    .eq("event_id", params.id);

  return (
    <StudentImportForm event={event} existingCount={count ?? 0} />
  );
}
