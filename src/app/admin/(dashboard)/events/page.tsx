import dynamic from "next/dynamic";
import { requireAdmin } from "@/lib/supabase/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ExternalLink, LayoutDashboard, Plus, Upload } from "lucide-react";

const EventQrCodeButton = dynamic(
  () =>
    import("@/components/admin/EventQrCodeButton").then(
      (m) => m.EventQrCodeButton
    ),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex h-7 items-center rounded-lg border border-border px-2.5 text-sm text-muted-foreground">
        QR Code...
      </span>
    ),
  }
);

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          โหลดข้อมูลไม่สำเร็จ: {error.message}
          <br />
          <span className="text-sm opacity-80">
            ถ้ายังไม่ได้รัน admin policies ให้รัน supabase/admin-policies.sql
          </span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">งานคอนเสิร์ต</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            จัดการงานและลิงก์ลงทะเบียน
          </p>
        </div>
        <LinkButton href="/admin/events/new">
          <Plus className="size-4" />
          สร้างงานใหม่
        </LinkButton>
      </div>

      {events.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <p className="text-muted-foreground">ยังไม่มีงาน</p>
            <LinkButton className="mt-4" variant="outline" href="/admin/events/new">
              <Plus className="size-4" />
              สร้างงานแรก
            </LinkButton>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {formatDate(event.event_date)}
                    </CardDescription>
                  </div>
                  {!event.is_active && (
                    <Badge variant="secondary">ปิดใช้งาน</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                  /event/{event.qr_token}
                </p>
                <div className="flex flex-wrap gap-2">
                  <EventQrCodeButton
                    qrToken={event.qr_token}
                    eventName={event.name}
                  />
                  <LinkButton variant="outline" size="sm" href={`/event/${event.qr_token}`} target="_blank">
                    <ExternalLink className="size-3.5" />
                    หน้าลงทะเบียน
                  </LinkButton>
                  <LinkButton variant="outline" size="sm" href={`/admin/events/${event.id}/import`}>
                    <Upload className="size-3.5" />
                    นำเข้ารายชื่อ
                  </LinkButton>
                  <LinkButton variant="outline" size="sm" href={`/admin/events/${event.id}/dashboard`}>
                    <LayoutDashboard className="size-3.5" />
                    Dashboard
                  </LinkButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
