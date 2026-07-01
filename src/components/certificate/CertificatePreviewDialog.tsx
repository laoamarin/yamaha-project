"use client";

import {
  CertificateRenderer,
  downloadCertificateCanvas,
} from "@/components/certificate/CertificateRenderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CertificateConfig, Event } from "@/types/database";
import { Download } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  event: Event;
  studentName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CertificatePreviewDialog({
  event,
  studentName,
  open,
  onOpenChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const templateUrl = event.certificate_template_url;
  const config = event.certificate_config as CertificateConfig | null;

  if (!templateUrl || !config) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ตัวอย่างเกียรติบัตร</DialogTitle>
          <DialogDescription>{studentName}</DialogDescription>
        </DialogHeader>

        <CertificateRenderer
          templateUrl={templateUrl}
          config={config}
          studentName={studentName}
          maxWidth={560}
          onCanvasReady={(canvas) => {
            canvasRef.current = canvas;
            setReady(true);
          }}
        />

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() =>
              downloadCertificateCanvas(
                canvasRef.current!,
                `certificate-${studentName.replace(/\s+/g, "-")}.png`
              )
            }
          >
            <Download className="size-4" />
            ดาวน์โหลด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
