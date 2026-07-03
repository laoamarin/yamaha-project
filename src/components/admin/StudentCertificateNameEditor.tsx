"use client";

import { updateStudentCertificateName } from "@/app/admin/actions";
import {
  CertificateNameFieldSelect,
  CertificateNamePreview,
} from "@/components/admin/CertificateNameFieldSelect";
import { Input } from "@/components/ui/input";
import type { Event, Student } from "@/types/database";
import { Loader2 } from "lucide-react";
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
  const [field, setField] = useState(student.certificate_name_source ?? "");
  const [customName, setCustomName] = useState(student.certificate_name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(nextField: string, nextCustom?: string) {
    setLoading(true);
    setError(null);

    const fieldKey = nextField || null;
    const custom =
      fieldKey === "custom" ? (nextCustom ?? customName).trim() : null;

    if (fieldKey === "custom" && !custom) {
      setError("กรุณากรอกชื่อ");
      setLoading(false);
      return;
    }

    const result = await updateStudentCertificateName(event.id, student.id, {
      certificate_name_source: fieldKey,
      certificate_name: custom,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result.student) {
      const updated = { ...student, ...result.student };
      onUpdated?.(updated);
      setField(updated.certificate_name_source ?? "");
      setCustomName(updated.certificate_name ?? "");
    }
  }

  return (
    <div className="min-w-[160px] space-y-1">
      <div className="flex items-center gap-1">
        {loading && (
          <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
        )}
        <CertificateNameFieldSelect
          event={event}
          value={field}
          showDefaultOption
          onChange={(v) => {
            setField(v);
            if (v !== "custom") {
              void save(v);
            }
          }}
        />
      </div>

      <CertificateNamePreview event={event} student={student} fieldKey={field} />

      {field === "custom" && (
        <div className="flex gap-1">
          <Input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="ชื่อบนเกียรติบัตร"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") void save("custom", customName);
            }}
          />
          <button
            type="button"
            onClick={() => void save("custom", customName)}
            className="shrink-0 rounded-md border px-2 text-xs hover:bg-muted"
          >
            บันทึก
          </button>
        </div>
      )}

      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
}
