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

  const { error } = await supabase.from("events").insert({
    name,
    event_date,
    extra_fields,
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
