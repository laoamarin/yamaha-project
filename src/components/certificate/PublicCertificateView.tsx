"use client";

import {
  CertificateRenderer,
  downloadCertificateCanvas,
} from "@/components/certificate/CertificateRenderer";
import { Button } from "@/components/ui/button";
import type { CertificateConfig } from "@/types/database";
import { Download } from "lucide-react";
import { useRef } from "react";

type Props = {
  templateUrl: string;
  config: CertificateConfig;
  studentName: string;
  eventDate: string;
  displayLabel: string;
  filename: string;
};

export function PublicCertificateView({
  templateUrl,
  config,
  studentName,
  eventDate,
  displayLabel,
  filename,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">{displayLabel}</p>
      <CertificateRenderer
        templateUrl={templateUrl}
        config={config}
        studentName={studentName}
        eventDate={eventDate}
        maxWidth={640}
        onCanvasReady={(canvas) => {
          canvasRef.current = canvas;
        }}
      />
      <Button
        className="h-11"
        onClick={() => {
          if (canvasRef.current) {
            downloadCertificateCanvas(canvasRef.current, filename);
          }
        }}
      >
        <Download className="size-4" />
        ดาวน์โหลดเกียรติบัตร
      </Button>
    </div>
  );
}
