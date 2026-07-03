"use client";

import { AddStudentForm } from "@/components/admin/AddStudentForm";
import { importStudents } from "@/app/admin/actions";
import { AdminPageHeader } from "@/components/layout/admin-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { parseStudentRows, type ParsedStudentRow } from "@/lib/student-import";
import type { Event } from "@/types/database";
import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

type Props = {
  event: Event;
  existingCount: number;
};

export function StudentImportForm({ event, existingCount }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [students, setStudents] = useState<ParsedStudentRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setImportError(null);
    setDone(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });

        const { students: parsed, error } = parseStudentRows(rawRows);
        if (error) {
          setParseError(error);
          setStudents([]);
          return;
        }

        setStudents(parsed);
      } catch {
        setParseError("อ่านไฟล์ไม่สำเร็จ — ตรวจสอบว่าเป็น .xlsx หรือ .xls");
        setStudents([]);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function handleReset() {
    setStudents([]);
    setFileName(null);
    setParseError(null);
    setImportError(null);
    setDone(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImport() {
    if (!students.length) return;

    setImporting(true);
    setImportError(null);

    const result = await importStudents(event.id, students);

    setImporting(false);

    if (result.error) {
      setImportError(
        result.inserted
          ? `${result.error} (นำเข้าได้ ${result.inserted} คนก่อน error)`
          : result.error
      );
      return;
    }

    setDone(result.inserted ?? students.length);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="นำเข้ารายชื่อ"
        subtitle={event.name}
        backHref="/admin/events"
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">มีอยู่แล้ว {existingCount} คน</Badge>
        {students.length > 0 && (
          <Badge>พร้อมนำเข้า {students.length} คน</Badge>
        )}
      </div>

      {done !== null && (
        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCircle2 className="text-emerald-600" />
          <AlertDescription>
            นำเข้าสำเร็จ {done} คน
            <div className="mt-3 flex gap-2">
              <LinkButton size="sm" href={`/admin/events/${event.id}/dashboard`}>
                ไป Dashboard
              </LinkButton>
              <Button size="sm" variant="outline" onClick={handleReset}>
                นำเข้าไฟล์ใหม่
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <AddStudentForm eventId={event.id} />

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="size-4" />
            อัปโหลด Excel
          </CardTitle>
          <CardDescription>
            รองรับ .xlsx / .xls — คอลัมน์: full_name, nickname, instrument,
            teacher_name, certificate_name_source, certificate_name (ไม่บังคับ)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border file:border-border file:bg-background file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted"
            />
            {fileName && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                ล้าง
              </Button>
            )}
          </div>

          {parseError && (
            <Alert variant="destructive">
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {students.length > 0 && done === null && (
        <>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">ตัวอย่างข้อมูล</CardTitle>
              <CardDescription>
                ตรวจสอบก่อนกดยืนยัน — แสดง {Math.min(students.length, 10)} จาก{" "}
                {students.length} แถว
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>ชื่อเล่น</TableHead>
                    <TableHead>วิชา</TableHead>
                    <TableHead>ครูผู้สอน</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.slice(0, 10).map((s, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{s.full_name}</TableCell>
                      <TableCell>{s.nickname ?? "—"}</TableCell>
                      <TableCell>{s.instrument ?? "—"}</TableCell>
                      <TableCell>{s.teacher_name ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {students.length > 10 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  ... และอีก {students.length - 10} คน
                </p>
              )}
            </CardContent>
          </Card>

          {importError && (
            <Alert variant="destructive">
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={importing} size="lg">
              {importing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังนำเข้า...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  ยืนยันนำเข้า {students.length} คน
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={importing}>
              ยกเลิก
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
