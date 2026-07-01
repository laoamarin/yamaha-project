import dynamic from "next/dynamic";
import { PageContainer, PageShell } from "@/components/layout/page-container";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

  if (error) {
    return (
      <PageShell>
        <PageContainer size="sm" className="flex min-h-screen items-center py-12">
          <Alert variant="destructive" className="w-full">
            <AlertDescription>
              <p className="font-medium">เชื่อมต่อฐานข้อมูลไม่ได้</p>
              <p className="mt-1 text-sm opacity-90">
                ตรวจสอบการเชื่อมต่อ internet แล้วลองใหม่อีกครั้ง
              </p>
            </AlertDescription>
          </Alert>
        </PageContainer>
      </PageShell>
    );
  }

  if (!event) {
    notFound();
  }

  return <EventRegistration event={event as Event} />;
}
