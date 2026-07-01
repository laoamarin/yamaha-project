/** Normalize search query to match students.search_name generated column */
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[ด.ช.ญ()]/g, "")
    .trim();
}

export function formatStudentName(student: {
  full_name: string;
  nickname: string | null;
}): string {
  if (student.nickname) {
    return `${student.full_name} (${student.nickname})`;
  }
  return student.full_name;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function lastStudentStorageKey(qrToken: string): string {
  return `last_student_${qrToken}`;
}
