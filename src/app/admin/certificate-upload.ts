"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function prepareCertificateTemplateUpload(
  eventId: string,
  fileName: string
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "ไม่พบงานนี้" };
  }

  try {
    const service = createServiceClient();
    const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${eventId}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await service.storage
      .from("certificate-templates")
      .createSignedUploadUrl(path);

    if (error || !data) {
      return {
        error: `เตรียมอัปโหลดไม่สำเร็จ: ${error?.message ?? "unknown error"}`,
      };
    }

    const { data: urlData } = service.storage
      .from("certificate-templates")
      .getPublicUrl(path);

    return {
      path: data.path,
      token: data.token,
      publicUrl: urlData.publicUrl,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "เตรียมอัปโหลดไม่สำเร็จ";
    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return {
        error:
          "ไม่พบ SUPABASE_SERVICE_ROLE_KEY ใน .env.local — ดู README หรือรัน supabase/certificate-storage.sql",
      };
    }
    return { error: message };
  }
}
