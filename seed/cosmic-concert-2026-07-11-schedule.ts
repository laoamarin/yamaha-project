/**
 * Saturday 11 Jul 2026 performance roster.
 * Source: YAMAHA COSMIC CONCERT 2026 student list (11 ก.ค. 2569).
 * JSON review file: seed/cosmic-concert-2026-07-11-schedule.json
 */
import scheduleJson from "./cosmic-concert-2026-07-11-schedule.json";

export type ScheduleStudent = {
  full_name: string;
  nickname?: string | null;
  teacher_name: string;
  slot?: string;
  order?: number;
  song?: string;
};

export const EVENT_NAME = scheduleJson.event_name;
export const EVENT_DATE = scheduleJson.event_date;
export const COPY_FIELDS_FROM_EVENT_DATE =
  scheduleJson.copy_fields_from_event_date;

export const SCHEDULE_STUDENTS: ScheduleStudent[] = scheduleJson.students.map(
  (s) => ({
    full_name: s.full_name,
    nickname: s.nickname ?? null,
    teacher_name: s.teacher_name,
    order: s.order,
  })
);

export const PENDING_TEACHER_GROUPS = scheduleJson.pending_teacher_groups as {
  teacher_name: string;
}[];
