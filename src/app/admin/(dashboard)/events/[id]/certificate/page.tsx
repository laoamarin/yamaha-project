import { CertificateDesigner } from "@/components/certificate/CertificateDesigner";
import { AdminPageHeader } from "@/components/layout/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function CertificatePage({ params }: Props) {
  const { supabase } = await requireAdmin();

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !event) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="ตั้งค่าเกียรติบัตร"
        subtitle={event.name}
      />
      <CertificateDesigner
        key={`${event.certificate_template_url ?? "new"}-${JSON.stringify(event.certificate_config ?? {})}`}
        event={event}
      />
    </div>
  );
}
