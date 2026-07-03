/**
 * End-to-end smoke test for certificate template upload (signed URL flow).
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const eventId = "57485cb8-d856-44f3-90cd-2e9e58e424ef";

async function main() {
  const service = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const browser = createClient(url, publishableKey);

  const pngPath = resolve(process.cwd(), "public/next.svg");
  let fileBody: Blob;
  let fileName = "test-template.png";
  let contentType = "image/png";

  try {
    const buf = readFileSync(pngPath);
    fileBody = new Blob([buf], { type: "image/svg+xml" });
    fileName = "test-template.svg";
    contentType = "image/svg+xml";
  } catch {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );
    fileBody = new Blob([png], { type: "image/png" });
  }

  const storagePath = `${eventId}/${crypto.randomUUID()}.${fileName.split(".").pop()}`;

  const { data: signed, error: signError } = await service.storage
    .from("certificate-templates")
    .createSignedUploadUrl(storagePath);

  if (signError || !signed) {
    throw new Error(`createSignedUploadUrl: ${signError?.message}`);
  }

  const file = new File([fileBody], fileName, { type: contentType });
  const { error: uploadError } = await browser.storage
    .from("certificate-templates")
    .uploadToSignedUrl(signed.path, signed.token, file, {
      contentType,
    });

  if (uploadError) {
    throw new Error(`uploadToSignedUrl: ${uploadError.message}`);
  }

  const { data: urlData } = service.storage
    .from("certificate-templates")
    .getPublicUrl(storagePath);

  console.log("✓ Full signed upload flow OK");
  console.log("  Path:", storagePath);
  console.log("  URL:", urlData.publicUrl);

  await service.storage.from("certificate-templates").remove([storagePath]);
}

main().catch((e) => {
  console.error("Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});
