/**
 * Apply certificate-templates bucket + RLS policies.
 * Usage: npx tsx scripts/apply-certificate-storage.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];
const sql = readFileSync(
  resolve(process.cwd(), "supabase/certificate-storage.sql"),
  "utf8"
);

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

async function ensureBucket(service: SupabaseClient) {
  const { data: buckets, error: listError } =
    await service.storage.listBuckets();

  if (listError) {
    throw new Error(`listBuckets: ${listError.message}`);
  }

  const exists = buckets?.some((b) => b.id === "certificate-templates");
  if (exists) {
    console.log("✓ Bucket certificate-templates already exists");
    return;
  }

  const { error: createError } = await service.storage.createBucket(
    "certificate-templates",
    { public: true }
  );

  if (createError) {
    throw new Error(`createBucket: ${createError.message}`);
  }

  console.log("✓ Created bucket certificate-templates (public)");
}

async function testSignedUpload(service: SupabaseClient) {
  const eventId = "57485cb8-d856-44f3-90cd-2e9e58e424ef";
  const path = `${eventId}/smoke-test-${crypto.randomUUID()}.png`;
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  const { data, error } = await service.storage
    .from("certificate-templates")
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error(`createSignedUploadUrl: ${error?.message ?? "no data"}`);
  }

  const res = await fetch(data.signedUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/png" },
    body: png,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`signed upload PUT ${res.status}: ${body}`);
  }

  const { data: urlData } = service.storage
    .from("certificate-templates")
    .getPublicUrl(path);

  console.log("✓ Signed upload smoke test OK");
  console.log("  URL:", urlData.publicUrl);

  await service.storage.from("certificate-templates").remove([path]);
}

async function main() {
  const service = createClient(url!, serviceKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Project: ${projectRef}`);

  const sqlOk = await runSqlViaManagementApi();
  if (!sqlOk) {
    console.log(
      "ℹ SUPABASE_ACCESS_TOKEN not set — skipping RLS policy SQL via API"
    );
    console.log(
      "  Run manually in SQL Editor, or: supabase login && npx supabase link --project-ref",
      projectRef,
      "&& npx supabase db query -f supabase/certificate-storage.sql --linked"
    );
  }

  await ensureBucket(service);
  await testSignedUpload(service);

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
