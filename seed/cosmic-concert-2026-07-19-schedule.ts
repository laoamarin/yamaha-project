/**
 * Sunday 19 Jul 2026 performance roster.
 * Source: YAMAHA COSMIC CONCERT 2026 student list (19 ก.ค. 2569).
 * JSON review file: seed/cosmic-concert-2026-07-19-schedule.json
 */
import scheduleJson from "./cosmic-concert-2026-07-19-schedule.json";

export type ScheduleStudent = {
  full_name: string;
  nickname?: string | null;
  teacher_name: string;
  order?: number;
};

export const EVENT_NAME = scheduleJson.event_name;
export const EVENT_DATE = scheduleJson.event_date;
export const COPY_FIELDS_FROM_EVENT_DATE =
  scheduleJson.copy_fields_from_event_date;

export const SCHEDULE_STUDENTS: ScheduleStudent[] = scheduleJson.students.map(
  (student) => ({
    full_name: student.full_name,
    nickname: student.nickname ?? null,
    teacher_name: student.teacher_name,
    order: student.order,
  })
);

export const PENDING_TEACHER_GROUPS = scheduleJson.pending_teacher_groups as {
  teacher_name: string;
}[];
