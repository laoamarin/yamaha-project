import { PublicCertificateView } from "@/components/certificate/PublicCertificateView";
import { PublicBody, PublicHeader, PublicShell } from "@/components/layout/public-shell";
import { formatEventDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { CertificateConfig } from "@/types/database";
import { notFound } from "next/navigation";

type Props = {
  params: { qr_token: string; student_id: string };
};

export default async function PublicCertificatePage({ params }: Props) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("qr_token", params.qr_token)
    .eq("is_active", true)
    .maybeSingle();

  if (
    !event ||
    !event.certificates_released ||
    !event.certificate_template_url ||
    !event.certificate_config
  ) {
    notFound();
  }

  const config = event.certificate_config as CertificateConfig;
  if (config.enabled === false) {
    notFound();
  }

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", params.student_id)
    .eq("event_id", event.id)
    .maybeSingle();

  if (!student) {
    notFound();
  }

  const { data: registration } = await supabase
    .from("registrations")
    .select("id")
    .eq("student_id", student.id)
    .maybeSingle();

  if (!registration) {
    notFound();
  }

  const displayLabel = student.nickname
    ? `${student.full_name} (${student.nickname})`
    : student.full_name;

  return (
    <PublicShell>
      <PublicHeader
        eventName={event.name}
        eventDate={formatEventDate(event.event_date)}
        coverUrl={event.cover_image_url}
        label="เกียรติบัตร"
      />
      <PublicBody>
        <PublicCertificateView
          templateUrl={event.certificate_template_url}
          config={config}
          studentName={student.full_name}
          displayLabel={displayLabel}
          filename={`certificate-${student.full_name.replace(/\s+/g, "-")}.png`}
        />
      </PublicBody>
    </PublicShell>
  );
}
