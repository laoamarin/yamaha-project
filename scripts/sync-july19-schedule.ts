/**
 * Compare and sync the Sunday 19 Jul 2026 performance roster.
 *
 * Dry run:
 *   npm run sync:july19
 *
 * Create the event and insert the roster:
 *   npm run sync:july19 -- --create-event --sync
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import {
  COPY_FIELDS_FROM_EVENT_DATE,
  EVENT_DATE,
  EVENT_NAME,
  SCHEDULE_STUDENTS,
} from "../seed/cosmic-concert-2026-07-19-schedule";

config({ path: resolve(process.cwd(), ".env") });
config({ path: resolve(process.cwd(), ".env.local") });

const sync = process.argv.includes("--sync");
const createEvent = process.argv.includes("--create-event");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const fallbackExtraFields = [
  { key: "phone", label: "เบอร์โทรติดต่อ", required: true },
  {
    key: "registered_by",
    label: "ชื่อผู้ลงทะเบียน (ผู้ปกครอง)",
    required: true,
  },
];

async function loadTemplateEvent() {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, name, extra_fields, student_fields, certificate_config, certificate_template_url"
    )
    .eq("event_date", COPY_FIELDS_FROM_EVENT_DATE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function loadOrCreateEvent() {
  const { data: existing, error: existingError } = await supabase
    .from("events")
    .select("id, name, event_date, qr_token")
    .eq("event_date", EVENT_DATE)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  if (!createEvent) return null;

  const template = await loadTemplateEvent();
  const { data, error } = await supabase
    .from("events")
    .insert({
      name: EVENT_NAME,
      event_date: EVENT_DATE,
      extra_fields: template?.extra_fields ?? fallbackExtraFields,
      student_fields: template?.student_fields ?? [],
      certificate_config: template?.certificate_config ?? null,
      certificate_template_url: template?.certificate_template_url ?? null,
      certificates_released: false,
      is_active: true,
    })
    .select("id, name, event_date, qr_token")
    .single();

  if (error) throw error;

  console.log(`✓ Created event: ${data.name} (${data.id})`);
  console.log(`  qr_token: ${data.qr_token}`);
  if (template) console.log(`  Copied settings from: ${template.name}`);

  return data;
}

async function main() {
  const event = await loadOrCreateEvent();

  if (!event) {
    console.log(`Event not found for ${EVENT_DATE}.`);
    console.log(`Would create: ${EVENT_NAME}`);
    console.log(`Schedule total: ${SCHEDULE_STUDENTS.length}`);
    console.log(
      "Run npm run sync:july19 -- --create-event --sync to create and sync."
    );
    return;
  }

  const [{ count: dbTotal, error: countError }, { count: registrations }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id),
      supabase
        .from("registrations")
        .select("id", { count: "exact", head: true })
        .eq("event_id", event.id),
    ]);

  if (countError) throw countError;

  console.log(`Event: ${event.name} (${event.event_date})`);
  console.log(`Event ID: ${event.id}`);
  console.log(`qr_token: ${event.qr_token}`);
  console.log(`Schedule total: ${SCHEDULE_STUDENTS.length}`);
  console.log(`DB total: ${dbTotal ?? 0}`);
  console.log(`Registrations: ${registrations ?? 0}`);

  if (!sync) {
    console.log("Mode: DRY RUN");
    return;
  }

  if ((registrations ?? 0) > 0) {
    console.error(
      `Abort: ${registrations} registration(s) exist. Manual review required.`
    );
    process.exit(1);
  }

  const { error: deleteError } = await supabase
    .from("students")
    .delete()
    .eq("event_id", event.id);

  if (deleteError) throw deleteError;

  const rows = SCHEDULE_STUDENTS.map((student) => ({
    event_id: event.id,
    full_name: student.full_name,
    nickname: student.nickname ?? null,
    instrument: null,
    teacher_name: student.teacher_name,
  }));

  const { error: insertError } = await supabase.from("students").insert(rows);
  if (insertError) throw insertError;

  console.log(`✓ Sync complete: inserted ${rows.length}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
