/**
 * Smoke test: normalizeStudentInput + optional DB insert/delete
 * Run: npm run smoke:add-student
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import {
  extractNicknameFromName,
  normalizeStudentInput,
} from "../src/lib/student-import";

config({ path: ".env" });
config({ path: ".env.local" });

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
  console.log("OK:", message);
}

async function main() {
  const parsed = normalizeStudentInput({
    full_name: "  ด.ช.ทดสอบ ระบบ (Testy)  ",
    instrument: " Piano ",
  });
  assert(!("error" in parsed), "normalize returns student row");
  if (!("error" in parsed)) {
    assert(parsed.full_name === "ด.ช.ทดสอบ ระบบ", "strips name");
    assert(parsed.nickname === "Testy", "nickname from parentheses");
    assert(parsed.instrument === "Piano", "trims instrument");
  }

  const empty = normalizeStudentInput({ full_name: "   " });
  assert("error" in empty, "empty name returns error");

  const parenOnly = extractNicknameFromName("นางสาวมิสา (Misa)");
  assert(
    parenOnly.name === "นางสาวมิสา" && parenOnly.nickname === "Misa",
    "extractNicknameFromName"
  );

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.log(
      "SKIP DB: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    console.log("Smoke test passed (unit only).");
    return;
  }

  const supabase = createClient(url, key);

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError || !event) {
    console.log("SKIP DB: no events in database");
    console.log("Smoke test passed (unit only).");
    return;
  }

  const smokeName = `Smoke Test ${Date.now()}`;
  const row = normalizeStudentInput({
    full_name: smokeName,
    nickname: "Smoke",
    instrument: "Test",
    teacher_name: "Tester",
  });

  assert(!("error" in row), "normalize for DB insert");
  if ("error" in row) return;

  const { data: inserted, error: insertError } = await supabase
    .from("students")
    .insert({
      event_id: event.id,
      full_name: row.full_name,
      nickname: row.nickname,
      instrument: row.instrument,
      teacher_name: row.teacher_name,
    })
    .select("id, full_name, search_name")
    .single();

  assert(!insertError && inserted?.id, `insert student: ${insertError?.message ?? "ok"}`);
  assert(
    Boolean(inserted?.search_name?.includes("smoke")),
    "search_name generated for lookup"
  );

  const { error: deleteError } = await supabase
    .from("students")
    .delete()
    .eq("id", inserted!.id);

  assert(!deleteError, "cleanup delete student");

  console.log("\nSmoke test passed (unit + DB).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
