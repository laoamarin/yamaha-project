import { prepareCertificateTemplateUpload } from "@/app/admin/certificate-upload";
import { createClient } from "@/lib/supabase/client";

export async function uploadCertificateTemplate(
  eventId: string,
  file: File
): Promise<{ url: string } | { error: string }> {
  const prepared = await prepareCertificateTemplateUpload(eventId, file.name);

  if ("error" in prepared && prepared.error) {
    return { error: prepared.error };
  }

  if (!("path" in prepared) || !prepared.path || !prepared.token) {
    return { error: "เตรียมอัปโหลดไม่สำเร็จ" };
  }

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from("certificate-templates")
    .uploadToSignedUrl(prepared.path, prepared.token, file, {
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    return { error: `อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}` };
  }

  return { url: prepared.publicUrl };
}
