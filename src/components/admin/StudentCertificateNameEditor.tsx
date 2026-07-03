"use client";

import { updateStudentCertificateName } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CERTIFICATE_NAME_SOURCE_OPTIONS,
  getCertificateDisplayName,
  getCertificateNameSourceLabel,
  resolveCertificateNameSource,
} from "@/lib/certificate-name";
import type { CertificateNameSource, Event, Student } from "@/types/database";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";

type Props = {
  event: Event;
  student: Student;
  onUpdated?: (student: Student) => void;
};

export function StudentCertificateNameEditor({
  event,
  student,
  onUpdated,
}: Props) {
  const eventDefault = event.certificate_config?.default_name_source ?? "full_name";
  const displayName = getCertificateDisplayName(student, eventDefault);
  const effectiveSource = resolveCertificateNameSource(
    student.certificate_name_source,
    eventDefault
  );

  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<CertificateNameSource | "">(
    student.certificate_name_source ?? ""
  );
  const [customName, setCustomName] = useState(student.certificate_name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openEditor() {
    setSource(student.certificate_name_source ?? "");
    setCustomName(student.certificate_name ?? "");
    setError(null);
    setOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    const result = await updateStudentCertificateName(event.id, student.id, {
      certificate_name_source: source === "" ? null : source,
      certificate_name: source === "custom" ? customName : null,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result.student) {
      onUpdated?.({ ...student, ...result.student });
    }
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className="group flex max-w-[180px] items-start gap-1 text-left text-xs"
        title="แก้ไขชื่อบนเกียรติบัตร"
      >
        <span className="min-w-0 truncate font-medium text-slate-800 group-hover:text-indigo-700">
          {displayName}
        </span>
        <Pencil className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
      {student.certificate_name_source && (
        <p className="text-[10px] text-muted-foreground">
          {getCertificateNameSourceLabel(effectiveSource)}
        </p>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ชื่อบนเกียรติบัตร</DialogTitle>
            <DialogDescription>{student.full_name}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cert-name-source">แหล่งชื่อ</Label>
              <select
                id="cert-name-source"
                value={source}
                onChange={(e) =>
                  setSource(e.target.value as CertificateNameSource | "")
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">
                  ใช้ค่าเริ่มต้นงาน (
                  {getCertificateNameSourceLabel(eventDefault)})
                </option>
                {CERTIFICATE_NAME_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                {source === ""
                  ? `จะแสดง: ${getCertificateDisplayName(student, eventDefault)}`
                  : CERTIFICATE_NAME_SOURCE_OPTIONS.find((o) => o.value === source)
                      ?.description}
              </p>
            </div>

            {source === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="cert-custom-name">ชื่อที่แสดง</Label>
                <Input
                  id="cert-custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="เช่น Athena Hongsuok"
                  className="h-10"
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
