"use client";

import { toggleCertificateEnabled } from "@/app/admin/actions";
import { CertificatePreviewDialog } from "@/components/certificate/CertificatePreviewDialog";
import { getCertificateDisplayName } from "@/lib/certificate-name";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import type { Event, Student } from "@/types/database";
import { Award, Eye, Loader2, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";

type Props = {
  event: Event;
  student: Student;
  registered: boolean;
};

export function CertificatePreviewButton({
  event,
  student,
  registered,
}: Props) {
  const [open, setOpen] = useState(false);

  const hasCertificate =
    Boolean(event.certificate_template_url) &&
    Boolean(
      event.certificate_config?.enabled ?? event.certificate_template_url
    );

  const displayName = getCertificateDisplayName(
    student,
    event.certificate_config?.default_name_source
  );

  if (!registered || !hasCertificate) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        title="ดูเกียรติบัตร"
        onClick={() => setOpen(true)}
      >
        <Eye className="size-4" />
      </Button>
      <CertificatePreviewDialog
        event={event}
        studentName={displayName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

type PanelProps = {
  event: Event;
};

export function CertificateSettingsPanel({ event }: PanelProps) {
  const router = useRouter();
  const checkboxId = useId();
  const hasTemplate = Boolean(event.certificate_template_url);
  const released = event.certificates_released;

  const [enabled, setEnabled] = useState(
    event.certificate_config?.enabled ?? hasTemplate
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEnabled(event.certificate_config?.enabled ?? hasTemplate);
  }, [event.certificate_config?.enabled, hasTemplate]);

  async function handleToggle(checked: boolean) {
    if (!hasTemplate) {
      setError("กรุณาอัปโหลด template ที่หน้าตั้งค่าเกียรติบัตรก่อน");
      return;
    }

    setError(null);
    setLoading(true);

    const result = await toggleCertificateEnabled(event.id, checked);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setEnabled(checked);
    router.refresh();
    setLoading(false);
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Award className="size-5" />
          </div>
          <div>
            <p className="font-medium">เกียรติบัตร</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {hasTemplate ? (
                <Badge variant="outline" className="text-emerald-700">
                  มี template แล้ว
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-700">
                  ยังไม่ได้อัปโหลด
                </Badge>
              )}
              {enabled && hasTemplate && (
                <Badge variant="outline" className="text-indigo-700">
                  เปิดใช้งาน
                </Badge>
              )}
              {released && (
                <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
                  ปล่อยให้ผู้ปกครองแล้ว
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex items-center gap-2">
            {loading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <Checkbox
                id={checkboxId}
                checked={enabled}
                onCheckedChange={(v) => handleToggle(v === true)}
              />
            )}
            <Label
              htmlFor={checkboxId}
              className="cursor-pointer text-sm font-normal"
            >
              ใช้เกียรติบัตร
            </Label>
          </div>
          {!hasTemplate && (
            <p className="text-xs text-amber-700">
              อัปโหลด template ก่อนจึงจะเปิดใช้ได้
            </p>
          )}
          <LinkButton
            href={`/admin/events/${event.id}/certificate`}
            variant="outline"
            size="sm"
          >
            <Settings2 className="size-3.5" />
            ตั้งค่า / อัปโหลด template
          </LinkButton>
          {error && (
            <Alert variant="destructive" className="max-w-xs py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
