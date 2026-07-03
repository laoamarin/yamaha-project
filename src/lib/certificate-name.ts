import {
  getCertificateNameFieldOptions,
  getStudentFieldLabel,
  getStudentFieldValue,
} from "@/lib/student-fields";
import type { StudentField } from "@/types/database";

/** Strip Thai/English honorific prefixes for certificate display */
export function stripHonorificPrefix(name: string): string {
  return name
    .replace(
      /^(ด\.?\s*ช\.?|ด\.?\s*ญ\.?|นาย|นาง|นางสาว|น\.?\s*ส\.?|mr\.?|ms\.?|mrs\.?)\s*/i,
      ""
    )
    .trim();
}

/** @deprecated use getCertificateNameFieldOptions */
export const CERTIFICATE_NAME_SOURCE_OPTIONS = getCertificateNameFieldOptions(
  []
).map((f) => ({
  value: f.key,
  label: f.label.split(" (")[0],
  description: f.label,
}));

export function parseCertificateNameField(
  value: string | null | undefined
): string | null {
  if (!value?.trim()) return null;
  const v = value.trim().toLowerCase().replace(/\s+/g, "_");

  const legacy: Record<string, string> = {
    full_name: "full_name",
    fullname: "full_name",
    name: "full_name",
    ชื่อเต็ม: "full_name",
    "ชื่อ-นามสกุล": "full_name",
    nickname: "nickname",
    nick: "nickname",
    ชื่อเล่น: "nickname",
    no_prefix: "no_prefix",
    noprefix: "no_prefix",
    without_prefix: "no_prefix",
    ไม่มีคำนำหน้า: "no_prefix",
    custom: "custom",
    กำหนดเอง: "custom",
    other: "custom",
  };

  return legacy[v] ?? normalizeFieldKey(v);
}

/** @deprecated */
export const parseCertificateNameSource = parseCertificateNameField;

function normalizeFieldKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

export function resolveCertificateNameField(
  studentField: string | null | undefined,
  eventDefault?: string | null
): string {
  return studentField ?? eventDefault ?? "full_name";
}

export function getCertificateDisplayName(
  student: {
    full_name: string;
    nickname?: string | null;
    instrument?: string | null;
    teacher_name?: string | null;
    extra_data?: Record<string, string> | null;
    certificate_name_source?: string | null;
    certificate_name?: string | null;
  },
  eventDefault?: string | null
): string {
  const field = resolveCertificateNameField(
    student.certificate_name_source,
    eventDefault
  );

  if (field === "custom") {
    return student.certificate_name?.trim() || student.full_name;
  }

  if (field === "no_prefix") {
    return stripHonorificPrefix(student.full_name) || student.full_name;
  }

  const value = getStudentFieldValue(student, field);
  return value || student.full_name;
}

export function getCertificateNameFieldLabel(
  fieldKey: string,
  studentFields?: StudentField[] | null
): string {
  return getStudentFieldLabel(fieldKey, studentFields);
}

/** @deprecated */
export function getCertificateNameSourceLabel(
  source: string,
  studentFields?: StudentField[] | null
): string {
  return getCertificateNameFieldLabel(source, studentFields);
}

/** @deprecated */
export const resolveCertificateNameSource = resolveCertificateNameField;
