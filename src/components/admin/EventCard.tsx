"use client";

import { EventQrCodeButton } from "@/components/admin/EventQrCodeButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { formatEventDate } from "@/lib/format";
import type { Event } from "@/types/database";
import {
  Calendar,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  Music2,
  Pencil,
  Upload,
  Award,
} from "lucide-react";

type Props = {
  event: Event;
  studentCount?: number;
  registeredCount?: number;
};

export function EventCard({ event, studentCount, registeredCount }: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-36 w-full bg-gradient-to-br from-slate-700 to-slate-900">
        {event.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_image_url}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Music2 className="size-12 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <LinkButton
          variant="secondary"
          size="sm"
          href={`/admin/events/${event.id}/edit`}
          className="absolute right-3 top-3 bg-white/90 text-slate-800 hover:bg-white"
        >
          <Pencil className="size-3.5" />
          แก้ไข
        </LinkButton>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="font-semibold text-white leading-snug">{event.name}</h2>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/80">
            <Calendar className="size-3" />
            {formatEventDate(event.event_date)}
          </p>
        </div>
        {!event.is_active && (
          <Badge variant="secondary" className="absolute right-3 top-3">
            ปิดใช้งาน
          </Badge>
        )}
      </div>

      <CardContent className="space-y-4 p-4">
        {studentCount !== undefined && (
          <div className="flex gap-2 text-sm">
            <Badge variant="outline">
              นักเรียน {studentCount} คน
            </Badge>
            {registeredCount !== undefined && (
              <Badge variant={registeredCount === studentCount ? "default" : "secondary"}>
                ลงทะเบียน {registeredCount}/{studentCount}
              </Badge>
            )}
          </div>
        )}

        {/* Public — สำหรับผู้ปกครอง */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            สำหรับผู้ปกครอง
          </p>
          <div className="flex flex-wrap gap-2">
            <EventQrCodeButton qrToken={event.qr_token} eventName={event.name} />
            <LinkButton
              variant="outline"
              size="sm"
              href={`/event/${event.qr_token}`}
              target="_blank"
              className="border-emerald-200 text-emerald-800 hover:bg-emerald-50"
            >
              <ExternalLink className="size-3.5" />
              เปิดหน้าลงทะเบียน
            </LinkButton>
          </div>
        </div>

        {/* Admin tools */}
        <div className="space-y-2 border-t pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            จัดการงาน
          </p>
          <div className="grid gap-2">
            <LinkButton
              variant="outline"
              className="h-11 w-full justify-between"
              href={`/admin/events/${event.id}/dashboard`}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="size-4" />
                รายชื่อลงทะเบียน
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </LinkButton>
            <LinkButton
              variant="outline"
              className="h-11 w-full justify-between"
              href={`/admin/events/${event.id}/import`}
            >
              <span className="flex items-center gap-2">
                <Upload className="size-4" />
                นำเข้ารายชื่อ Excel
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </LinkButton>
            <LinkButton
              variant="outline"
              className="h-11 w-full justify-between"
              href={`/admin/events/${event.id}/certificate`}
            >
              <span className="flex items-center gap-2">
                <Award className="size-4" />
                ตั้งค่าเกียรติบัตร
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </LinkButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
