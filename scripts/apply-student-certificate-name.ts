/**
 * Apply student certificate name columns + student_fields migration.
 * Usage: npx tsx scripts/apply-student-certificate-name.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";
import { config } from "dotenv";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];
const sqlPath = resolve(process.cwd(), "supabase/student-certificate-name.sql");
const sql = readFileSync(sqlPath, "utf8");

async function runSqlViaManagementApi(): Promise<boolean> {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return false;

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    console.error("Management API SQL failed:", res.status, body);
    return false;
  }

  console.log("✓ SQL applied via Supabase Management API");
  return true;
}

function runSqlViaSupabaseCli(): boolean {
  try {
    execSync(`npx supabase db query -f "${sqlPath}" --linked`, {
      stdio: "inherit",
      cwd: process.cwd(),
    });
    console.log("✓ SQL applied via Supabase CLI");
    return true;
  } catch {
    return false;
  }
}

async function verifyColumns() {
  const { createClient } = await import("@supabase/supabase-js");
  const service = createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await service
    .from("students")
    .select("id, certificate_name_source, certificate_name, extra_data")
    .limit(1);

  if (error) {
    throw new Error(`Column check failed: ${error.message}`);
  }

  console.log("✓ students.certificate_name_source / certificate_name / extra_data OK");
}

async function main() {
  console.log(`Project: ${projectRef}`);

  try {
    await verifyColumns();
    console.log("Migration already applied — nothing to do.");
    return;
  } catch {
    // columns missing — apply migration
  }

  const applied =
    (await runSqlViaManagementApi()) || runSqlViaSupabaseCli();

  if (!applied) {
    console.error(
      "Cannot apply SQL automatically. Options:\n" +
        "  1. Set SUPABASE_ACCESS_TOKEN in .env\n" +
        "  2. Run: npx supabase db query -f supabase/student-certificate-name.sql --linked\n" +
        "  3. Paste supabase/student-certificate-name.sql in Supabase SQL Editor"
    );
    process.exit(1);
  }

  await verifyColumns();
  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
