"use server";

import { DEFAULT_CERTIFICATE_CONFIG } from "@/lib/certificate-utils";
import { mergeStudentFields } from "@/lib/student-fields";
import { normalizeStudentInput, type ParsedStudentRow, type StudentInput } from "@/lib/student-import";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { CertificateConfig, Event, ExtraField, StudentField } from "@/types/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function updateEventRecord(eventId: string, update: Partial<Event>) {
  const service = createServiceClient();
  const { data, error } = await service
    .from("events")
    .update(update)
    .eq("id", eventId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "บันทึกไม่สำเร็จ — ไม่พบงานนี้" };
  }
  return { success: true as const };
}

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
  students: ParsedStudentRow[],
  discoveredFields: StudentField[] = []
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
    .select("id, student_fields")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return { error: "ไม่พบงานนี้" };
  }

  const service = createServiceClient();
  const mergedFields = mergeStudentFields(event.student_fields, discoveredFields);

  if (mergedFields.length > 0) {
    await service
      .from("events")
      .update({ student_fields: mergedFields })
      .eq("id", eventId);
  }

  const rows = students.map((s) => ({
    event_id: eventId,
    full_name: s.full_name,
    nickname: s.nickname,
    instrument: s.instrument,
    teacher_name: s.teacher_name,
    extra_data: s.extra_data,
    certificate_name_source: s.certificate_name_source,
    certificate_name: s.certificate_name,
  }));

  const CHUNK = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const { error } = await service.from("students").insert(chunk);
    if (error) {
      return { error: error.message, inserted };
    }
    inserted += chunk.length;
  }

  revalidatePath(`/admin/events/${eventId}/import`);
  revalidatePath(`/admin/events/${eventId}/dashboard`);
  revalidatePath("/admin/events");
  return { success: true, inserted };
}

export async function addStudent(eventId: string, data: StudentInput) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  const normalized = normalizeStudentInput(data);
  if ("error" in normalized) {
    return { error: normalized.error };
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (eventError || !event) {
    return { error: "ไม่พบงานนี้" };
  }

  const service = createServiceClient();
  const { data: student, error } = await service
    .from("students")
    .insert({
      event_id: eventId,
      full_name: normalized.full_name,
      nickname: normalized.nickname,
      instrument: normalized.instrument,
      teacher_name: normalized.teacher_name,
      extra_data: normalized.extra_data,
      certificate_name_source: normalized.certificate_name_source,
      certificate_name: normalized.certificate_name,
    })
    .select(
      "id, full_name, nickname, instrument, teacher_name, extra_data, certificate_name_source, certificate_name"
    )
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/events/${eventId}/import`);
  revalidatePath(`/admin/events/${eventId}/dashboard`);
  revalidatePath("/admin/events");
  return { success: true, student };
}

export async function updateStudentCertificateName(
  eventId: string,
  studentId: string,
  data: {
    certificate_name_source: string | null;
    certificate_name?: string | null;
  }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  if (data.certificate_name_source === "custom" && !data.certificate_name?.trim()) {
    return { error: "กรุณากรอกชื่อเมื่อเลือก 'กำหนดเอง'" };
  }

  const service = createServiceClient();
  const { data: student, error } = await service
    .from("students")
    .update({
      certificate_name_source: data.certificate_name_source,
      certificate_name:
        data.certificate_name_source === "custom"
          ? data.certificate_name?.trim() || null
          : null,
    })
    .eq("id", studentId)
    .eq("event_id", eventId)
    .select(
      "id, full_name, nickname, extra_data, certificate_name_source, certificate_name"
    )
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/events/${eventId}/dashboard`);
  revalidatePath(`/admin/events/${eventId}/import`);
  return { success: true, student };
}

export async function updateStudent(
  eventId: string,
  studentId: string,
  data: Pick<StudentInput, "full_name" | "nickname">
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  const normalized = normalizeStudentInput({
    full_name: data.full_name,
    nickname: data.nickname,
  });
  if ("error" in normalized) {
    return { error: normalized.error };
  }

  const service = createServiceClient();
  const { data: student, error } = await service
    .from("students")
    .update({
      full_name: normalized.full_name,
      nickname: normalized.nickname,
    })
    .eq("id", studentId)
    .eq("event_id", eventId)
    .select(
      "id, full_name, nickname, instrument, teacher_name, extra_data, certificate_name_source, certificate_name"
    )
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/events/${eventId}/dashboard`);
  revalidatePath(`/admin/events/${eventId}/import`);
  return { success: true, student };
}

export async function updateEvent(eventId: string, formData: FormData) {
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
  const is_active = formData.get("is_active") === "true";

  if (!name || !event_date) {
    return { error: "กรุณากรอกชื่องานและวันที่" };
  }

  for (const field of extra_fields) {
    if (!field.key?.trim() || !field.label?.trim()) {
      return { error: "ช่องเพิ่มเติมต้องมี key และ label" };
    }
  }

  const update: Partial<Event> = {
    name,
    event_date,
    extra_fields,
    is_active,
  };

  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${eventId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("event-covers")
      .upload(path, coverFile, { contentType: coverFile.type });

    if (uploadError) {
      return { error: `อัปโหลดรูปไม่สำเร็จ: ${uploadError.message}` };
    }

    const { data: urlData } = supabase.storage
      .from("event-covers")
      .getPublicUrl(path);
    update.cover_image_url = urlData.publicUrl;
  }

  const writeResult = await updateEventRecord(eventId, update);
  if (writeResult.error) {
    return { error: writeResult.error };
  }

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath(`/admin/events/${eventId}/dashboard`);
  redirect("/admin/events");
}

export async function saveCertificateSettings(
  eventId: string,
  data: {
    config: CertificateConfig;
    certificates_released: boolean;
    templateUrl?: string;
  }
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
    .select("certificate_template_url")
    .eq("id", eventId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "ไม่พบงานนี้" };
  }

  const templateUrl =
    data.templateUrl ?? existing.certificate_template_url ?? undefined;

  if (!templateUrl) {
    return { error: "กรุณาอัปโหลดรูป template ก่อนบันทึก" };
  }

  const update: Partial<Event> = {
    certificate_config: data.config,
    certificates_released: data.certificates_released,
    certificate_template_url: templateUrl,
  };

  const writeResult = await updateEventRecord(eventId, update);
  if (writeResult.error) {
    return { error: writeResult.error };
  }

  revalidatePath(`/admin/events/${eventId}/certificate`);
  revalidatePath(`/admin/events/${eventId}/dashboard`);
  revalidatePath("/admin/events");
  return { success: true, templateUrl };
}

export async function toggleCertificateEnabled(
  eventId: string,
  enabled: boolean
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("certificate_config, certificate_template_url")
    .eq("id", eventId)
    .maybeSingle();

  if (fetchError || !event) {
    return { error: "ไม่พบงานนี้" };
  }

  if (!event.certificate_template_url) {
    return { error: "กรุณาอัปโหลด template ก่อน" };
  }

  const config: CertificateConfig = {
    ...DEFAULT_CERTIFICATE_CONFIG,
    ...(event.certificate_config as CertificateConfig | null),
    enabled,
  };

  const writeResult = await updateEventRecord(eventId, {
    certificate_config: config,
  });
  if (writeResult.error) {
    return { error: writeResult.error };
  }

  revalidatePath(`/admin/events/${eventId}/dashboard`);
  revalidatePath(`/admin/events/${eventId}/certificate`);
  return { success: true };
}

export async function resetRegistration(eventId: string, studentId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("student_id", studentId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "ไม่พบการลงทะเบียน — อาจถูกรีเซ็ตไปแล้ว" };
  }

  revalidatePath(`/admin/events/${eventId}/dashboard`);
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบ" };
  }

  const service = createServiceClient();
  const { data, error } = await service
    .from("events")
    .delete()
    .eq("id", eventId)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }
  if (!data) {
    return { error: "ไม่พบงานนี้ — อาจถูกลบไปแล้ว" };
  }

  revalidatePath("/admin/events");
  return { success: true };
}
