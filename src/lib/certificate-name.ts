import type { CertificateNameSource } from "@/types/database";

/** Strip Thai/English honorific prefixes for certificate display */
export function stripHonorificPrefix(name: string): string {
  return name
    .replace(
      /^(ด\.?\s*ช\.?|ด\.?\s*ญ\.?|นาย|นาง|นางสาว|น\.?\s*ส\.?|mr\.?|ms\.?|mrs\.?)\s*/i,
      ""
    )
    .trim();
}

export const CERTIFICATE_NAME_SOURCE_OPTIONS: {
  value: CertificateNameSource;
  label: string;
  description: string;
}[] = [
  {
    value: "full_name",
    label: "ชื่อ-นามสกุลเต็ม",
    description: "ใช้ full_name ตามที่ import",
  },
  {
    value: "nickname",
    label: "ชื่อเล่น",
    description: "ใช้ nickname (ถ้าไม่มี → ชื่อเต็ม)",
  },
  {
    value: "no_prefix",
    label: "ชื่อเต็ม (ไม่มีคำนำหน้า)",
    description: "ตัด ด.ช./ด.ญ./นาย/น.ส. ออก",
  },
  {
    value: "custom",
    label: "กำหนดเอง",
    description: "พิมพ์ชื่อที่ต้องการแสดงบนเกียรติบัตร",
  },
];

export function parseCertificateNameSource(
  value: string | null | undefined
): CertificateNameSource | null {
  if (!value?.trim()) return null;
  const v = value.trim().toLowerCase().replace(/\s+/g, "_");

  const map: Record<string, CertificateNameSource> = {
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

  return map[v] ?? null;
}

export function resolveCertificateNameSource(
  studentSource: CertificateNameSource | null | undefined,
  eventDefault?: CertificateNameSource | null
): CertificateNameSource {
  return studentSource ?? eventDefault ?? "full_name";
}

export function getCertificateDisplayName(
  student: {
    full_name: string;
    nickname?: string | null;
    certificate_name_source?: CertificateNameSource | null;
    certificate_name?: string | null;
  },
  eventDefault?: CertificateNameSource | null
): string {
  const source = resolveCertificateNameSource(
    student.certificate_name_source,
    eventDefault
  );

  switch (source) {
    case "nickname":
      return student.nickname?.trim() || student.full_name;
    case "no_prefix":
      return stripHonorificPrefix(student.full_name) || student.full_name;
    case "custom":
      return student.certificate_name?.trim() || student.full_name;
    case "full_name":
    default:
      return student.full_name;
  }
}

export function getCertificateNameSourceLabel(
  source: CertificateNameSource
): string {
  return (
    CERTIFICATE_NAME_SOURCE_OPTIONS.find((o) => o.value === source)?.label ??
    source
  );
}
