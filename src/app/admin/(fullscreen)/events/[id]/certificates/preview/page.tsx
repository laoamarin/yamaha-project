import { CertificateBatchPreview } from "@/components/certificate/CertificateBatchPreview";
import { eventHasCertificate } from "@/lib/certificate-utils";
import { requireAdmin } from "@/lib/supabase/admin";
import type { Student } from "@/types/database";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function CertificateBatchPreviewPage({ params }: Props) {
  const { supabase } = await requireAdmin();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  if (!eventHasCertificate(event)) {
    notFound();
  }

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("event_id", params.id)
    .order("full_name");

  const { data: registrations } = await supabase
    .from("registrations")
    .select("student_id")
    .eq("event_id", params.id);

  const registeredIds = new Set(
    (registrations ?? []).map((r) => r.student_id)
  );

  const registeredStudents = (students ?? []).filter((s: Student) =>
    registeredIds.has(s.id)
  ) as Student[];

  const backHref = `/admin/events/${params.id}/dashboard`;

  if (registeredStudents.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-6 text-center">
        <p className="text-muted-foreground">ยังไม่มีผู้ลงทะเบียน</p>
        <Link
          href={backHref}
          className="text-sm font-medium text-indigo-600 hover:underline"
        >
          กลับรายชื่อ
        </Link>
      </div>
    );
  }

  return (
    <CertificateBatchPreview
      event={event}
      students={registeredStudents}
      backHref={backHref}
    />
  );
}
