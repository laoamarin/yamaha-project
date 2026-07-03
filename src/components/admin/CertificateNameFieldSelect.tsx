"use client";

import {
  getCertificateDisplayName,
  getCertificateNameFieldLabel,
} from "@/lib/certificate-name";
import { getCertificateNameFieldOptions } from "@/lib/student-fields";
import type { Event, Student } from "@/types/database";

type Props = {
  event: Event;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  showDefaultOption?: boolean;
  defaultLabel?: string;
};

export function CertificateNameFieldSelect({
  event,
  value,
  onChange,
  id,
  className,
  showDefaultOption = false,
  defaultLabel,
}: Props) {
  const options = getCertificateNameFieldOptions(event.student_fields);
  const eventDefault =
    event.certificate_config?.default_name_source ?? "full_name";
  const defaultText =
    defaultLabel ??
    getCertificateNameFieldLabel(eventDefault, event.student_fields);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        "h-9 w-full min-w-[140px] rounded-md border border-input bg-background px-2 text-xs"
      }
    >
      {showDefaultOption && (
        <option value="">ค่าเริ่มต้น ({defaultText})</option>
      )}
      {options.map((opt) => (
        <option key={opt.key} value={opt.key}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

type PreviewProps = {
  event: Event;
  student: Student;
  fieldKey: string;
};

export function CertificateNamePreview({ event, student, fieldKey }: PreviewProps) {
  const eventDefault =
    event.certificate_config?.default_name_source ?? "full_name";
  const effectiveField = fieldKey || eventDefault;
  const previewStudent =
    fieldKey === ""
      ? { ...student, certificate_name_source: null }
      : { ...student, certificate_name_source: fieldKey };

  const name = getCertificateDisplayName(previewStudent, eventDefault);

  return (
    <p className="truncate text-xs font-medium text-slate-800" title={name}>
      {name}
      {fieldKey === "" && (
        <span className="ml-1 font-normal text-muted-foreground">
          ({getCertificateNameFieldLabel(effectiveField, event.student_fields)})
        </span>
      )}
    </p>
  );
}
