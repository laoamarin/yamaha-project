/**
 * One-off seed script for POC testing.
 * Run: npx tsx scripts/seed-event.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never commit).
 */
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { ExtraField } from "../src/types/database";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const baseUrl = process.env.SEED_BASE_URL ?? "http://localhost:3000";

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXTRA_FIELDS: ExtraField[] = [
  { key: "phone", label: "เบอร์โทรติดต่อ", required: true },
  { key: "registered_by", label: "ชื่อผู้ลงทะเบียน (ผู้ปกครอง)", required: true },
];

const EVENTS = [
  {
    name: "Yamaha Cosmic Concert 2026 - 4 ก.ค.",
    event_date: "2026-07-04",
    csv: "seed/event_2026-07-04.csv",
  },
  {
    name: "Yamaha Cosmic Concert 2026 - 5 ก.ค.",
    event_date: "2026-07-05",
    csv: "seed/event_2026-07-05.csv",
  },
] as const;

type CsvRow = {
  full_name: string;
  nickname: string;
  teacher_name: string;
};

function parseCsv(filePath: string): CsvRow[] {
  const content = readFileSync(resolve(process.cwd(), filePath), "utf8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as CsvRow[];
}

function extractNicknameFromName(fullName: string): {
  name: string;
  nickname: string | null;
} {
  const match = fullName.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { name: match[1].trim(), nickname: match[2].trim() };
  }
  return { name: fullName.trim(), nickname: null };
}

function mapRow(row: CsvRow) {
  const { name, nickname: fromParen } = extractNicknameFromName(row.full_name);
  const nickname = row.nickname?.trim() || fromParen || null;
  const teacher = row.teacher_name?.trim() || null;

  return {
    full_name: name,
    nickname,
    instrument: null as string | null,
    teacher_name: teacher,
  };
}

async function seedEvent(
  name: string,
  event_date: string,
  csvPath: string
) {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      name,
      event_date,
      extra_fields: EXTRA_FIELDS,
      certificates_released: false,
      is_active: true,
      certificate_template_url: null,
      certificate_config: null,
    })
    .select("id, qr_token, name, event_date")
    .single();

  if (eventError || !event) {
    throw new Error(`Failed to create event "${name}": ${eventError?.message}`);
  }

  const rows = parseCsv(csvPath);
  const students = rows.map((row) => ({
    event_id: event.id,
    ...mapRow(row),
  }));

  const CHUNK = 50;
  for (let i = 0; i < students.length; i += CHUNK) {
    const chunk = students.slice(i, i + CHUNK);
    const { error } = await supabase.from("students").insert(chunk);
    if (error) {
      throw new Error(`Failed to insert students for "${name}": ${error.message}`);
    }
  }

  return { event, studentCount: students.length };
}

async function main() {
  console.log("Seeding Yamaha Cosmic Concert 2026 events...\n");

  const results = [];
  for (const evt of EVENTS) {
    const result = await seedEvent(evt.name, evt.event_date, evt.csv);
    results.push(result);
  }

  console.log("✓ Seed complete!\n");
  console.log("─".repeat(60));

  for (const { event, studentCount } of results) {
    console.log(`\n${event.name}`);
    console.log(`  event_id:  ${event.id}`);
    console.log(`  qr_token:  ${event.qr_token}`);
    console.log(`  students:  ${studentCount}`);
    console.log(`  test URL:  ${baseUrl}/event/${event.qr_token}`);
  }

  console.log("\n" + "─".repeat(60));
  console.log("\nเปิด test URL ด้านบนเพื่อลองค้นหาชื่อ + ลงทะเบียน\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
