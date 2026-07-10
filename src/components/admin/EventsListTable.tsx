"use client";

import { EventActionsMenu } from "@/components/admin/EventActionsMenu";
import { AdminStatCard } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatEventDate } from "@/lib/format";
import { normalizeSearchQuery } from "@/lib/event-utils";
import type { Event } from "@/types/database";
import { Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type EventListRow = {
  event: Event;
  studentCount: number;
  registeredCount: number;
};

type FilterStatus = "all" | "active" | "inactive";

const PAGE_SIZES = [10, 20, 50];

type Props = {
  rows: EventListRow[];
};

export function EventsListTable({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalStudents = rows.reduce((sum, r) => sum + r.studentCount, 0);
  const totalRegistered = rows.reduce((sum, r) => sum + r.registeredCount, 0);
  const activeEvents = rows.filter((r) => r.event.is_active).length;

  const filtered = useMemo(() => {
    const q = normalizeSearchQuery(search);
    return rows.filter(({ event }) => {
      if (filter === "active" && !event.is_active) return false;
      if (filter === "inactive" && event.is_active) return false;
      if (!q) return true;
      const haystack = normalizeSearchQuery(
        `${event.name} ${event.event_date}`
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

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card py-16 text-center shadow-sm">
        <p className="text-muted-foreground">ยังไม่มีงาน</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="งานทั้งหมด"
          value={rows.length}
          hint={`เปิดใช้งาน ${activeEvents} งาน`}
        />
        <AdminStatCard
          label="นักเรียนทั้งหมด"
          value={totalStudents}
          hint="รวมทุกงาน"
        />
        <AdminStatCard
          label="ลงทะเบียนแล้ว"
          value={totalRegistered}
          hint="ผู้ปกครองที่ลงทะเบียนแล้ว"
        />
        <AdminStatCard
          label="ยังไม่มา"
          value={Math.max(0, totalStudents - totalRegistered)}
          hint="รอการลงทะเบียน"
        />
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">รายการงาน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่องาน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "ทั้งหมด"],
                ["active", "เปิดใช้งาน"],
                ["inactive", "ปิดใช้งาน"],
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
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">ชื่องาน</TableHead>
                  <TableHead className="hidden sm:table-cell">วันที่</TableHead>
                  <TableHead className="text-right">นักเรียน</TableHead>
                  <TableHead className="text-right">ลงทะเบียน</TableHead>
                  <TableHead className="hidden md:table-cell text-right">
                    ยังไม่มา
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">สถานะ</TableHead>
                  <TableHead className="w-[3.5rem] text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      ไม่พบงาน
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map(
                    ({ event, studentCount, registeredCount }) => {
                      const pending = Math.max(
                        0,
                        studentCount - registeredCount
                      );
                      const rate =
                        studentCount > 0
                          ? Math.round((registeredCount / studentCount) * 100)
                          : 0;

                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Link
                              href={`/admin/events/${event.id}/dashboard`}
                              className="font-medium hover:underline"
                            >
                              {event.name}
                            </Link>
                            <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                              {formatEventDate(event.event_date)}
                            </p>
                            {studentCount > 0 && (
                              <p className="mt-0.5 text-xs text-muted-foreground lg:hidden">
                                ลงทะเบียน {rate}%
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {formatEventDate(event.event_date)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {studentCount}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-emerald-700">
                            {registeredCount}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right tabular-nums text-amber-700">
                            {pending}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {event.is_active ? (
                              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                                เปิด
                              </Badge>
                            ) : (
                              <Badge variant="outline">ปิด</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <EventActionsMenu event={event} />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Label htmlFor="events-page-size" className="sr-only">
                จำนวนต่อหน้า
              </Label>
              <span>แสดง</span>
              <select
                id="events-page-size"
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
              <span>รายการ · ทั้งหมด {filtered.length} งาน</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
