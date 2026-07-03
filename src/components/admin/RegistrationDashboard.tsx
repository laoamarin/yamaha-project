"use client";

import { CertificatePreviewButton, CertificateSettingsPanel } from "@/components/admin/CertificateSettings";
import { ResetRegistrationButton } from "@/components/admin/ResetRegistrationButton";
import { StudentCertificateNameEditor } from "@/components/admin/StudentCertificateNameEditor";
import { eventHasCertificate } from "@/lib/certificate-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatEventDate } from "@/lib/format";
import { getCertificateDisplayName } from "@/lib/certificate-name";
import { formatStudentName, normalizeSearchQuery } from "@/lib/event-utils";
import type { Event, Registration, Student } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { Download, Eye, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Row = Student & {
  registration: Registration | null;
};

type FilterStatus = "all" | "registered" | "pending";

type Props = {
  event: Event;
  initialRows: Row[];
  initialRegisteredCount: number;
};

const PAGE_SIZES = [10, 20, 50, 100];

export function RegistrationDashboard({
  event,
  initialRows,
  initialRegisteredCount,
}: Props) {
  const [rows, setRows] = useState(initialRows);
  const [registeredCount, setRegisteredCount] = useState(initialRegisteredCount);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Realtime updates
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`registrations-${event.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "registrations",
          filter: `event_id=eq.${event.id}`,
        },
        async (payload) => {
          const reg = payload.new as Registration;
          setRows((prev) =>
            prev.map((r) =>
              r.id === reg.student_id ? { ...r, registration: reg } : r
            )
          );
          setRegisteredCount((c) => c + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "registrations",
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          const reg = payload.old as Registration;
          setRows((prev) =>
            prev.map((r) =>
              r.id === reg.student_id ? { ...r, registration: null } : r
            )
          );
          setRegisteredCount((c) => Math.max(0, c - 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  const eventDefault =
    event.certificate_config?.default_name_source ?? "full_name";

  const filtered = useMemo(() => {
    const q = normalizeSearchQuery(search);
    return rows.filter((row) => {
      if (filter === "registered" && !row.registration) return false;
      if (filter === "pending" && row.registration) return false;
      if (!q) return true;
      const haystack = normalizeSearchQuery(
        `${row.full_name} ${row.nickname ?? ""}`
      );
      return haystack.includes(q);
    });
  }, [rows, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [search, filter, pageSize]);

  const canPreviewAll =
    eventHasCertificate(event) && registeredCount > 0;

  function exportCsv() {
    const header = [
      "ชื่อ-นามสกุล",
      "ชื่อเล่น",
      "ชื่อบนเกียรติบัตร",
      "วิชา",
      "ครูผู้สอน",
      "สถานะ",
      "เวลาลงทะเบียน",
    ];
    const lines = filtered.map((row) => [
      row.full_name,
      row.nickname ?? "",
      getCertificateDisplayName(row, eventDefault),
      row.instrument ?? "",
      row.teacher_name ?? "",
      row.registration ? "ลงทะเบียนแล้ว" : "ยังไม่ลงทะเบียน",
      row.registration
        ? formatDateTime(row.registration.registered_at)
        : "",
    ]);
    const csv = [header, ...lines]
      .map((line) =>
        line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${event.event_date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <CertificateSettingsPanel event={event} />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{rows.length}</p>
            <p className="text-xs text-muted-foreground">ทั้งหมด</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {registeredCount}
            </p>
            <p className="text-xs text-muted-foreground">ลงทะเบียนแล้ว</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {rows.length - registeredCount}
            </p>
            <p className="text-xs text-muted-foreground">ยังไม่มา</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            รายชื่อ — {formatEventDate(event.event_date)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "ทั้งหมด"],
                ["registered", "ลงทะเบียนแล้ว"],
                ["pending", "ยังไม่มา"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="ml-auto" onClick={exportCsv}>
              <Download className="size-3.5" />
              Export CSV
            </Button>
            {canPreviewAll && (
              <LinkButton
                variant="outline"
                size="sm"
                href={`/admin/events/${event.id}/certificates/preview`}
                target="_blank"
              >
                <Eye className="size-3.5" />
                Preview เกียรติบัตรทั้งหมด
              </LinkButton>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  {eventHasCertificate(event) && (
                    <TableHead className="hidden lg:table-cell">
                      ชื่อเกียรติบัตร
                    </TableHead>
                  )}
                  <TableHead className="hidden sm:table-cell">ครู</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="hidden md:table-cell">เวลา</TableHead>
                  <TableHead className="w-12 text-center">เกียรติบัตร</TableHead>
                  <TableHead className="w-12 text-center">รีเซ็ต</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={eventHasCertificate(event) ? 8 : 7} className="py-10 text-center text-muted-foreground">
                      ไม่พบรายชื่อ
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((row, i) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-muted-foreground">
                        {(safePage - 1) * pageSize + i + 1}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatStudentName(row)}</p>
                        {row.teacher_name && (
                          <p className="text-xs text-muted-foreground sm:hidden">
                            ครู {row.teacher_name}
                          </p>
                        )}
                      </TableCell>
                      {eventHasCertificate(event) && (
                        <TableCell className="hidden lg:table-cell">
                          <StudentCertificateNameEditor
                            event={event}
                            student={row}
                            onUpdated={(updated) =>
                              setRows((prev) =>
                                prev.map((r) =>
                                  r.id === updated.id ? { ...r, ...updated } : r
                                )
                              )
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {row.teacher_name ?? "—"}
                      </TableCell>
                      <TableCell>
                        {row.registration ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            แล้ว
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-700">
                            ยังไม่มา
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {row.registration
                          ? formatDateTime(row.registration.registered_at)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <CertificatePreviewButton
                          event={event}
                          student={row}
                          registered={Boolean(row.registration)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <ResetRegistrationButton
                          eventId={event.id}
                          student={row}
                          registered={Boolean(row.registration)}
                          onReset={() => {
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id ? { ...r, registration: null } : r
                              )
                            );
                            setRegisteredCount((c) => Math.max(0, c - 1));
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Label htmlFor="page-size" className="sr-only">
                จำนวนต่อหน้า
              </Label>
              <span>แสดง</span>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-8 rounded-md border border-input bg-background px-2 text-sm"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span>
                รายการ · ทั้งหมด {filtered.length} คน
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ก่อนหน้า
              </Button>
              <span className="text-sm text-muted-foreground">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ถัดไป
              </Button>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            อัปเดตอัตโนมัติเมื่อมีการลงทะเบียนใหม่
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
