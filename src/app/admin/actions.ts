"use server";

import { createClient } from "@/lib/supabase/server";
import type { ExtraField } from "@/types/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function createEvent(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const name = (formData.get("name") as string)?.trim();
  const event_date = formData.get("event_date") as string;
  const coverFile = formData.get("cover_image") as File | null;
  const extra_fields = JSON.parse(
    (formData.get("extra_fields") as string) || "[]"
  ) as ExtraField[];

  if (!name || !event_date) {
    return { error: "กรุณากรอกชื่องานและวันที่" };
  }

  for (const field of extra_fields) {
    if (!field.key?.trim() || !field.label?.trim()) {
      return { error: "ช่องเพิ่มเติมต้องมี key และ label" };
    }
  }

  let cover_image_url: string | null = null;

  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("event-covers")
      .upload(path, coverFile, { contentType: coverFile.type });

    if (uploadError) {
      return { error: `อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage
      .from("event-covers")
      .getPublicUrl(path);
    cover_image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("events").insert({
    name,
    event_date,
    extra_fields,
    cover_image_url,
    certificates_released: false,
    is_active: true,
    certificate_template_url: null,
    certificate_config: null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function importStudents(
  eventId: string,
  students: {
    full_name: string;
    nickname: string | null;
    instrument: string | null;
    teacher_name: string | null;
  }[]
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  if (!students.length) {
    return { error: "ไม่มีข้อมูลให้นำเข้า" };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return { error: "ไม่พบงานนี้" };
  }

  const rows = students.map((s) => ({
    event_id: eventId,
    full_name: s.full_name,
    nickname: s.nickname,
    instrument: s.instrument,
    teacher_name: s.teacher_name,
  }));

  const CHUNK = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await supabase.from("students").insert(chunk);
    if (error) {
      return { error: error.message, inserted };
    }
    inserted += chunk.length;
  }

  revalidatePath(`/admin/events/${eventId}/import`);
  revalidatePath("/admin/events");
  return { success: true, inserted };
}
