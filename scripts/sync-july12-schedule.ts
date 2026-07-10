/**
 * Compare + sync Sunday 12 Jul 2026 schedule with event students.
 *
 * Dry run (default):
 *   npm run sync:july12
 *
 * Create event (copy fields from 5 Jul) + replace roster:
 *   npm run sync:july12 -- --create-event --sync
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import {
  COPY_FIELDS_FROM_EVENT_DATE,
  EVENT_DATE,
  EVENT_NAME,
  PENDING_TEACHER_GROUPS,
  SCHEDULE_STUDENTS,
  type ScheduleStudent,
} from "../seed/cosmic-concert-2026-07-12-schedule";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const sync = process.argv.includes("--sync");
const createEvent = process.argv.includes("--create-event");

const FALLBACK_EXTRA_FIELDS = [
  { key: "phone", label: "เบอร์โทรติดต่อ", required: true },
  { key: "registered_by", label: "ชื่อผู้ลงทะเบียน (ผู้ปกครอง)", required: true },
];

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ด.ช.ด.ญ.น.ส.()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function coreName(value: string): string {
  return normalizeForMatch(value);
}

type DbStudent = {
  id: string;
  full_name: string;
  nickname: string | null;
  teacher_name: string | null;
};

function findMatch(
  schedule: ScheduleStudent,
  dbStudents: DbStudent[]
): DbStudent | null {
  const scheduleCore = coreName(schedule.full_name);
  const scheduleNick = schedule.nickname
    ? normalizeForMatch(schedule.nickname)
    : null;

  for (const student of dbStudents) {
    const dbCore = coreName(student.full_name);
    if (dbCore === scheduleCore) return student;

    if (
      scheduleNick &&
      student.nickname &&
      normalizeForMatch(student.nickname) === scheduleNick &&
      dbCore.includes(scheduleCore.split(" ").slice(-1)[0] ?? "")
    ) {
      return student;
    }
  }

  const scheduleLast = scheduleCore.split(" ").slice(-1)[0];
  if (scheduleLast && scheduleLast.length >= 3) {
    const candidates = dbStudents.filter((s) =>
      coreName(s.full_name).includes(scheduleLast)
    );
    if (candidates.length === 1) return candidates[0];
  }

  for (const student of dbStudents) {
    const dbCore = coreName(student.full_name);
    if (levenshtein(dbCore, scheduleCore) <= 1 && dbCore.length > 4) {
      return student;
    }
  }

  return null;
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

function scheduleToRow(eventId: string, s: ScheduleStudent) {
  return {
    event_id: eventId,
    full_name: s.full_name,
    nickname: s.nickname ?? null,
    instrument: null,
    teacher_name: s.teacher_name,
  };
}

async function loadTemplateEvent(
  supabase: ReturnType<typeof createClient<any>>
) {
  const { data } = await supabase
    .from("events")
    .select(
      "id, name, extra_fields, student_fields, certificate_config, certificate_template_url"
    )
    .eq("event_date", COPY_FIELDS_FROM_EVENT_DATE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

async function resolveEventId(
  supabase: ReturnType<typeof createClient<any>>
): Promise<string> {
  const { data: existing } = await supabase
    .from("events")
    .select("id, name, event_date")
    .eq("event_date", EVENT_DATE)
    .eq("name", EVENT_NAME)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: byDate } = await supabase
    .from("events")
    .select("id, name, event_date")
    .eq("event_date", EVENT_DATE)
    .maybeSingle();

  if (byDate) return byDate.id;

  if (!createEvent && !sync) {
    console.log(
      `\nEvent not found for ${EVENT_DATE}. Dry run — schedule has ${SCHEDULE_STUDENTS.length} students.`
    );
    console.log(`Would create: "${EVENT_NAME}"`);
    console.log(
      `Would copy fields from event on ${COPY_FIELDS_FROM_EVENT_DATE} (5 ก.ค.)`
    );
    if (PENDING_TEACHER_GROUPS.length > 0) {
      console.log("\nPending teacher groups (need student names):");
      PENDING_TEACHER_GROUPS.forEach((g) => {
        console.log(`  - ${g.teacher_name}`);
      });
    }
    console.log("\nStudents on schedule:");
    SCHEDULE_STUDENTS.forEach((s, i) => {
      const nick = s.nickname ? ` (${s.nickname})` : "";
      console.log(
        `${String(i + 1).padStart(2, " ")}. ${s.full_name}${nick} — ${s.teacher_name}`
      );
    });
    console.log(
      "\n  npm run sync:july12 -- --create-event --sync   → create event + insert roster"
    );
    return "";
  }

  if (!createEvent) {
    console.error(
      `Event not found for ${EVENT_DATE}. Run with --create-event to create "${EVENT_NAME}".`
    );
    process.exit(1);
  }

  const template = await loadTemplateEvent(supabase);
  const extra_fields = template?.extra_fields ?? FALLBACK_EXTRA_FIELDS;

  const { data: created, error } = await supabase
    .from("events")
    .insert({
      name: EVENT_NAME,
      event_date: EVENT_DATE,
      extra_fields,
      student_fields: template?.student_fields ?? [],
      certificate_config: template?.certificate_config ?? null,
      certificate_template_url: template?.certificate_template_url ?? null,
      certificates_released: false,
      is_active: true,
    })
    .select("id, name, event_date, qr_token")
    .single();

  if (error || !created) {
    console.error("Create event failed:", error?.message);
    process.exit(1);
  }

  console.log(`✓ Created event: ${created.name} (${created.id})`);
  console.log(`  qr_token: ${created.qr_token}`);
  if (template) {
    console.log(`  Copied settings from: ${template.name}`);
  } else {
    console.log(`  Template event ${COPY_FIELDS_FROM_EVENT_DATE} not found — used defaults`);
  }
  return created.id;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const eventId = await resolveEventId(supabase);
  if (!eventId) return;

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, event_date")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    console.error("Event not found:", eventError?.message ?? eventId);
    process.exit(1);
  }

  const [{ data: dbStudents, error: studentsError }, { count: regCount }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, full_name, nickname, teacher_name")
        .eq("event_id", eventId)
        .order("full_name"),
      supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", eventId),
    ]);

  if (studentsError || !dbStudents) {
    console.error("Failed to load students:", studentsError?.message);
    process.exit(1);
  }

  const mode = sync
    ? createEvent
      ? "SYNC (create event + replace roster)"
      : "SYNC (replace roster)"
    : "DRY RUN";

  console.log(`Event: ${event.name} (${event.event_date})`);
  console.log(`Event ID: ${eventId}`);
  console.log(`Schedule total: ${SCHEDULE_STUDENTS.length}`);
  console.log(`DB total: ${dbStudents.length}`);
  console.log(`Registrations: ${regCount ?? 0}`);
  console.log(`Mode: ${mode}\n`);

  if (PENDING_TEACHER_GROUPS.length > 0) {
    console.log("⚠ Pending teacher groups (not in schedule yet):");
    PENDING_TEACHER_GROUPS.forEach((g) => console.log(`  - ${g.teacher_name}`));
    console.log("");
  }

  const matchedDbIds = new Set<string>();
  const missing: ScheduleStudent[] = [];
  const matched: { schedule: ScheduleStudent; db: DbStudent }[] = [];

  for (const schedule of SCHEDULE_STUDENTS) {
    const db = findMatch(schedule, dbStudents);
    if (db) {
      matched.push({ schedule, db });
      matchedDbIds.add(db.id);
    } else {
      missing.push(schedule);
    }
  }

  const extraInDb = dbStudents.filter((s) => !matchedDbIds.has(s.id));

  console.log("─".repeat(60));
  console.log(`Matched in DB:     ${matched.length}`);
  console.log(`Missing (to add):  ${missing.length}`);
  console.log(`Extra in DB only:  ${extraInDb.length}`);
  if (sync) {
    console.log(
      `After --sync:      ${SCHEDULE_STUDENTS.length} (delete ${dbStudents.length}, insert ${SCHEDULE_STUDENTS.length})`
    );
  } else {
    console.log(`Target total:      ${SCHEDULE_STUDENTS.length}`);
  }
  console.log("─".repeat(60));

  if (missing.length > 0) {
    console.log("\nMissing from DB:");
    missing.forEach((s, i) => {
      const nick = s.nickname ? ` (${s.nickname})` : "";
      console.log(
        `${String(i + 1).padStart(2, " ")}. ${s.full_name}${nick} — ${s.teacher_name}`
      );
    });
  }

  if (extraInDb.length > 0) {
    console.log("\nIn DB but not on schedule (will be removed with --sync):");
    extraInDb.forEach((s, i) => {
      const nick = s.nickname ? ` (${s.nickname})` : "";
      const teacher = s.teacher_name ? ` — ${s.teacher_name}` : "";
      console.log(`${String(i + 1).padStart(2, " ")}. ${s.full_name}${nick}${teacher}`);
    });
  }

  if (!sync) {
    console.log("\nDry run complete.");
    console.log(
      "  npm run sync:july12 -- --create-event --sync   → create event + replace roster"
    );
    return;
  }

  if ((regCount ?? 0) > 0) {
    console.error(
      `\nAbort: ${regCount} registration(s) exist. Manual review required.`
    );
    process.exit(1);
  }

  const { error: deleteError } = await supabase
    .from("students")
    .delete()
    .eq("event_id", eventId);

  if (deleteError) {
    console.error("\nDelete failed:", deleteError.message);
    process.exit(1);
  }

  const rows = SCHEDULE_STUDENTS.map((s) => scheduleToRow(eventId, s));
  const CHUNK = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error: insertError } = await supabase.from("students").insert(chunk);
    if (insertError) {
      console.error("\nInsert failed:", insertError.message);
      process.exit(1);
    }
    inserted += chunk.length;
  }

  console.log(`\n✓ Sync complete: deleted ${dbStudents.length}, inserted ${inserted}.`);

  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  console.log(`DB total now: ${count}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
