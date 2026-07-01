import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";
import { notFound } from "next/navigation";

const EventRegistration = dynamic(
  () =>
    import("@/components/event/EventRegistration").then(
      (m) => m.EventRegistration
    ),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
      </div>
    ),
  }
);

type Props = {
  params: { qr_token: string };
};

export default async function EventPage({ params }: Props) {
  const supabase = createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("qr_token", params.qr_token)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  return <EventRegistration event={event as Event} />;
}
