import type { StudentField } from "@/types/database";

/** Built-in student columns always available for certificate name */
export const BUILTIN_STUDENT_FIELDS: StudentField[] = [
  { key: "full_name", label: "ชื่อ-นามสกุล (full_name)" },
  { key: "nickname", label: "ชื่อเล่น (nickname)" },
  { key: "instrument", label: "วิชา / เครื่องดนตรี" },
  { key: "teacher_name", label: "ครูผู้สอน" },
];

export const CERTIFICATE_SPECIAL_FIELDS: StudentField[] = [
  {
    key: "no_prefix",
    label: "ชื่อเต็ม (ไม่มีคำนำหน้า)",
  },
  { key: "custom", label: "กำหนดเอง (พิมพ์เอง)" },
];

const RESERVED_IMPORT_KEYS = new Set([
  "full_name",
  "fullname",
  "name",
  "ชื่อ",
  "ชื่อ-นามสกุล",
  "ชื่อนามสกุล",
  "nickname",
  "nick",
  "ชื่อเล่น",
  "instrument",
  "subject",
  "วิชา",
  "เครื่องดนตรี",
  "teacher_name",
  "teacher",
  "ครู",
  "ครูผู้สอน",
  "certificate_name_source",
  "name_source",
  "cert_name_source",
  "แหล่งชื่อเกียรติบัตร",
  "certificate_name",
  "name_on_certificate",
  "cert_name",
  "ชื่อบนเกียรติบัตร",
  "ชื่อเกียรติบัตร",
]);

export function normalizeFieldKey(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

export function isReservedImportHeader(header: string): boolean {
  return RESERVED_IMPORT_KEYS.has(normalizeFieldKey(header));
}

export function headerToFieldKey(header: string): string {
  return normalizeFieldKey(header);
}

export function mergeStudentFields(
  existing: StudentField[] | null | undefined,
  discovered: StudentField[]
): StudentField[] {
  const map = new Map<string, StudentField>();
  for (const f of BUILTIN_STUDENT_FIELDS) {
    map.set(f.key, f);
  }
  for (const f of existing ?? []) {
    if (!map.has(f.key)) map.set(f.key, f);
  }
  for (const f of discovered) {
    if (!map.has(f.key)) map.set(f.key, f);
  }
  return Array.from(map.values()).filter(
    (f) => !BUILTIN_STUDENT_FIELDS.some((b) => b.key === f.key)
  );
}

export function getCertificateNameFieldOptions(
  studentFields?: StudentField[] | null
): StudentField[] {
  const custom = (studentFields ?? []).filter(
    (f) =>
      !BUILTIN_STUDENT_FIELDS.some((b) => b.key === f.key) &&
      !CERTIFICATE_SPECIAL_FIELDS.some((s) => s.key === f.key)
  );

  return [
    ...BUILTIN_STUDENT_FIELDS,
    ...custom,
    ...CERTIFICATE_SPECIAL_FIELDS,
  ];
}

export function getStudentFieldLabel(
  fieldKey: string,
  studentFields?: StudentField[] | null
): string {
  const all = getCertificateNameFieldOptions(studentFields);
  return all.find((f) => f.key === fieldKey)?.label ?? fieldKey;
}

export type StudentLike = {
  full_name: string;
  nickname?: string | null;
  instrument?: string | null;
  teacher_name?: string | null;
  extra_data?: Record<string, string> | null;
};

export function getStudentFieldValue(
  student: StudentLike,
  fieldKey: string
): string | null {
  switch (fieldKey) {
    case "full_name":
      return student.full_name?.trim() || null;
    case "nickname":
      return student.nickname?.trim() || null;
    case "instrument":
      return student.instrument?.trim() || null;
    case "teacher_name":
      return student.teacher_name?.trim() || null;
    default:
      return student.extra_data?.[fieldKey]?.trim() || null;
  }
}
