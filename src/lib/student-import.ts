export type ParsedStudentRow = {
  full_name: string;
  nickname: string | null;
  instrument: string | null;
  teacher_name: string | null;
};

const COLUMN_ALIASES: Record<keyof ParsedStudentRow, string[]> = {
  full_name: ["full_name", "fullname", "name", "ชื่อ", "ชื่อ-นามสกุล", "ชื่อนามสกุล"],
  nickname: ["nickname", "nick", "ชื่อเล่น"],
  instrument: ["instrument", "subject", "วิชา", "เครื่องดนตรี"],
  teacher_name: ["teacher_name", "teacher", "ครู", "ครูผู้สอน"],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function findColumnKey(
  headers: string[],
  field: keyof ParsedStudentRow
): string | null {
  const aliases = COLUMN_ALIASES[field].map(normalizeHeader);
  for (const header of headers) {
    const normalized = normalizeHeader(header);
    if (aliases.includes(normalized)) return header;
  }
  return null;
}

export function extractNicknameFromName(fullName: string): {
  name: string;
  nickname: string | null;
} {
  const match = fullName.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { name: match[1].trim(), nickname: match[2].trim() };
  }
  return { name: fullName.trim(), nickname: null };
}

export function mapRawRow(
  row: Record<string, unknown>,
  columnMap: Record<keyof ParsedStudentRow, string | null>
): ParsedStudentRow | null {
  const rawName = String(row[columnMap.full_name!] ?? "").trim();
  if (!rawName) return null;

  const { name, nickname: fromParen } = extractNicknameFromName(rawName);
  const nicknameCol = columnMap.nickname
    ? String(row[columnMap.nickname] ?? "").trim()
    : "";
  const instrumentCol = columnMap.instrument
    ? String(row[columnMap.instrument] ?? "").trim()
    : "";
  const teacherCol = columnMap.teacher_name
    ? String(row[columnMap.teacher_name] ?? "").trim()
    : "";

  return {
    full_name: name,
    nickname: nicknameCol || fromParen || null,
    instrument: instrumentCol || null,
    teacher_name: teacherCol || null,
  };
}

export function parseStudentRows(
  rawRows: Record<string, unknown>[]
): { students: ParsedStudentRow[]; error?: string } {
  if (rawRows.length === 0) {
    return { students: [], error: "ไฟล์ว่างเปล่า" };
  }

  const headers = Object.keys(rawRows[0] ?? {});
  const columnMap = {
    full_name: findColumnKey(headers, "full_name"),
    nickname: findColumnKey(headers, "nickname"),
    instrument: findColumnKey(headers, "instrument"),
    teacher_name: findColumnKey(headers, "teacher_name"),
  };

  if (!columnMap.full_name) {
    return {
      students: [],
      error:
        "ไม่พบคอลัมน์ชื่อ (full_name) — ต้องมี header เช่น full_name, ชื่อ-นามสกุล",
    };
  }

  const students = rawRows
    .map((row) => mapRawRow(row, columnMap))
    .filter((s): s is ParsedStudentRow => s !== null);

  if (students.length === 0) {
    return { students: [], error: "ไม่พบข้อมูลนักเรียนในไฟล์" };
  }

  return { students };
}
