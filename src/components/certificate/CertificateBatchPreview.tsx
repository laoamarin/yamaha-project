"use client";

import {
  exportCertificatesPdf,
  loadCertificateTemplate,
  renderCertificateToCanvas,
} from "@/lib/certificate-utils";
import { getCertificateDisplayName } from "@/lib/certificate-name";
import { formatStudentName } from "@/lib/event-utils";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import type { CertificateConfig, Event, Student } from "@/types/database";
import { Download, Loader2, Printer, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  event: Event;
  students: Student[];
  backHref: string;
};

type CertificateItem = {
  student: Student;
  canvas: HTMLCanvasElement;
};

export function CertificateBatchPreview({ event, students, backHref }: Props) {
  const [items, setItems] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const templateUrl = event.certificate_template_url!;
  const config = event.certificate_config as CertificateConfig;
  const eventDefault = config.default_name_source ?? "full_name";

  useEffect(() => {
    let cancelled = false;

    async function renderAll() {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const templateImg = await loadCertificateTemplate(templateUrl);
        const rendered: CertificateItem[] = [];

        for (let i = 0; i < students.length; i++) {
          if (cancelled) return;
          const student = students[i];
          const displayName = getCertificateDisplayName(
            student,
            eventDefault
          );
          const canvas = await renderCertificateToCanvas(
            templateUrl,
            config,
            displayName,
            templateImg
          );
          rendered.push({ student, canvas });
          setProgress(i + 1);
        }

        if (!cancelled) {
          setItems(rendered);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "สร้างเกียรติบัตรไม่สำเร็จ");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    renderAll();
    return () => {
      cancelled = true;
    };
  }, [templateUrl, config, students, eventDefault, event.student_fields]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  async function handleExportPdf() {
    setExporting(true);
    try {
      await exportCertificatesPdf(
        items.map((item) => ({
          canvas: item.canvas,
          name: getCertificateDisplayName(item.student, eventDefault),
        })),
        `certificates-${event.event_date}.pdf`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "ส่งออก PDF ไม่สำเร็จ");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-200">
      {/* Toolbar — hidden when printing */}
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-slate-300 bg-white px-4 py-3 shadow-sm print:hidden">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {event.name}
          </p>
          <p className="text-xs text-muted-foreground">
            เกียรติบัตร {students.length} ฉบับ
            {loading && ` · กำลังสร้าง ${progress}/${students.length}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LinkButton variant="outline" size="sm" href={backHref}>
            <X className="size-4" />
            ปิด
          </LinkButton>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            disabled={loading || items.length === 0}
          >
            <Printer className="size-4" />
            พิมพ์
          </Button>
          <Button
            size="sm"
            onClick={handleExportPdf}
            disabled={loading || exporting || items.length === 0}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export PDF
          </Button>
        </div>
      </header>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:overflow-visible print:p-0">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm">
              กำลังสร้างเกียรติบัตร {progress}/{students.length}...
            </p>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div
            ref={printRef}
            id="cert-print-area"
            className="mx-auto flex max-w-4xl flex-col gap-8 print:max-w-none print:gap-0"
          >
            {items.map((item, index) => (
              <article
                key={item.student.id}
                className="cert-sheet flex flex-col items-center gap-2 print:break-after-page print:py-0"
              >
                <p className="text-sm font-medium text-slate-600 print:hidden">
                  {index + 1}. {formatStudentName(item.student)}
                </p>
                <div className="overflow-hidden rounded-lg bg-white shadow-md print:rounded-none print:shadow-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.canvas.toDataURL("image/jpeg", 0.92)}
                    alt={`เกียรติบัตร ${getCertificateDisplayName(item.student, eventDefault)}`}
                    className="block max-w-full"
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
