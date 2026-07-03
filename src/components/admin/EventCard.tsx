"use client";

import { EventQrCodeButton } from "@/components/admin/EventQrCodeButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { formatEventDate } from "@/lib/format";
import type { Event } from "@/types/database";
import {
  Award,
  Calendar,
  ExternalLink,
  LayoutDashboard,
  Music2,
  Pencil,
  Upload,
} from "lucide-react";

type Props = {
  event: Event;
  studentCount?: number;
  registeredCount?: number;
};

export function EventCard({ event, studentCount, registeredCount }: Props) {
  const registrationRate =
    studentCount && studentCount > 0 && registeredCount !== undefined
      ? Math.round((registeredCount / studentCount) * 100)
      : null;

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="relative h-40 w-full bg-gradient-to-br from-slate-700 to-slate-900">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <LinkButton
          variant="secondary"
          size="sm"
          href={`/admin/events/${event.id}/edit`}
          className="absolute right-3 top-3 bg-white/90 text-slate-800 hover:bg-white"
        >
          <Pencil className="size-3.5" />
          แก้ไข
        </LinkButton>
        {!event.is_active && (
          <Badge variant="secondary" className="absolute left-3 top-3">
            ปิดใช้งาน
          </Badge>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="line-clamp-2 font-semibold text-white leading-snug">
            {event.name}
          </h2>
          <p className="mt-1 flex items-center gap-1 text-xs text-white/80">
            <Calendar className="size-3" />
            {formatEventDate(event.event_date)}
          </p>
        </div>
      </div>

      <CardContent className="space-y-5 p-5">
        {studentCount !== undefined && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-muted/60 px-3 py-2 text-center">
              <p className="text-lg font-semibold">{studentCount}</p>
              <p className="text-xs text-muted-foreground">นักเรียน</p>
            </div>
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
              <p className="text-lg font-semibold text-emerald-700">
                {registeredCount ?? 0}
              </p>
              <p className="text-xs text-emerald-700/80">ลงทะเบียน</p>
            </div>
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
              <p className="text-lg font-semibold text-amber-700">
                {Math.max(0, studentCount - (registeredCount ?? 0))}
              </p>
              <p className="text-xs text-amber-700/80">ยังไม่มา</p>
            </div>
          </div>
        )}

        {registrationRate !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>อัตราลงทะเบียน</span>
              <span>{registrationRate}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${registrationRate}%` }}
              />
            </div>
          </div>
        )}

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

        <div className="grid gap-2 sm:grid-cols-3">
          <LinkButton
            variant="outline"
            className="h-10 w-full justify-start"
            href={`/admin/events/${event.id}/dashboard`}
          >
            <LayoutDashboard className="size-4" />
            รายชื่อ
          </LinkButton>
          <LinkButton
            variant="outline"
            className="h-10 w-full justify-start"
            href={`/admin/events/${event.id}/import`}
          >
            <Upload className="size-4" />
            นำเข้า
          </LinkButton>
          <LinkButton
            variant="outline"
            className="h-10 w-full justify-start"
            href={`/admin/events/${event.id}/certificate`}
          >
            <Award className="size-4" />
            เกียรติบัตร
          </LinkButton>
        </div>
      </CardContent>
    </Card>
  );
}
