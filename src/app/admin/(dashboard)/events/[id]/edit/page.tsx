import { EventEditForm } from "@/components/admin/EventEditForm";
import { requireAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function EditEventPage({ params }: Props) {
  const { supabase } = await requireAdmin();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  return <EventEditForm event={event} />;
}
