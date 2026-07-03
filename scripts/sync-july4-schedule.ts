/**
 * Compare + sync Saturday 4 Jul 2026 schedule with event students.
 *
 * Dry run (default):
 *   npm run sync:july4
 *
 * Replace roster to match schedule exactly (74 students):
 *   npm run sync:july4 -- --sync
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import {
  EVENT_ID,
  SCHEDULE_STUDENTS,
  type ScheduleStudent,
} from "../seed/cosmic-concert-2026-07-04-schedule";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const sync = process.argv.includes("--sync");

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ด.ช.ด.ญ.()]/g, "")
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

function scheduleToRow(s: ScheduleStudent) {
  return {
    event_id: EVENT_ID,
    full_name: s.full_name,
    nickname: s.nickname ?? null,
    instrument: null,
    teacher_name: s.teacher_name,
  };
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

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, name, event_date")
    .eq("id", EVENT_ID)
    .maybeSingle();

  if (eventError || !event) {
    console.error("Event not found:", eventError?.message ?? EVENT_ID);
    process.exit(1);
  }

  const [{ data: dbStudents, error: studentsError }, { count: regCount }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, full_name, nickname, teacher_name")
        .eq("event_id", EVENT_ID)
        .order("full_name"),
      supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", EVENT_ID),
    ]);

  if (studentsError || !dbStudents) {
    console.error("Failed to load students:", studentsError?.message);
    process.exit(1);
  }

  const mode = sync ? "SYNC (replace roster to 74)" : "DRY RUN";

  console.log(`Event: ${event.name} (${event.event_date})`);
  console.log(`Schedule total: ${SCHEDULE_STUDENTS.length}`);
  console.log(`DB total: ${dbStudents.length}`);
  console.log(`Registrations: ${regCount ?? 0}`);
  console.log(`Mode: ${mode}\n`);

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

  if (matched.length > 0) {
    console.log("\nMatched (schedule ↔ DB):");
    matched.forEach(({ schedule, db }, i) => {
      console.log(
        `${String(i + 1).padStart(2, " ")}. ${schedule.full_name} ↔ ${db.full_name}`
      );
    });
  }

  if (missing.length > 0) {
    console.log("\nMissing from DB:");
    missing.forEach((s, i) => {
      const nick = s.nickname ? ` (${s.nickname})` : "";
      console.log(
        `${String(i + 1).padStart(2, " ")}. [${s.slot}] ${s.full_name}${nick} — ${s.teacher_name}`
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
    console.log("  npm run sync:july4 -- --sync   → replace roster with 74 from schedule");
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
    .eq("event_id", EVENT_ID);

  if (deleteError) {
    console.error("\nDelete failed:", deleteError.message);
    process.exit(1);
  }

  const rows = SCHEDULE_STUDENTS.map(scheduleToRow);
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
    .eq("event_id", EVENT_ID);

  console.log(`DB total now: ${count}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
