import { EventRegistration } from "@/components/event/EventRegistration";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types/database";
import { notFound } from "next/navigation";

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
