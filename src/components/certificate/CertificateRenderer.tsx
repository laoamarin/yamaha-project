"use client";

import {
  drawCertificate,
  loadCertificateFont,
} from "@/lib/certificate-utils";
import type { CertificateConfig } from "@/types/database";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  templateUrl: string;
  config: CertificateConfig;
  studentName: string;
  maxWidth?: number;
  className?: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
};

export function CertificateRenderer({
  templateUrl,
  config,
  studentName,
  maxWidth = 640,
  className,
  onCanvasReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const render = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setError(null);

    try {
      await loadCertificateFont(config.font_family);

      if (!imgRef.current || imgRef.current.src !== templateUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("โหลดรูป template ไม่สำเร็จ"));
          img.src = templateUrl;
        });
        imgRef.current = img;
      }

      const img = imgRef.current!;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      drawCertificate(ctx, img, config, studentName);

      canvas.style.width = `${maxWidth}px`;
      canvas.style.height = "auto";

      onCanvasReady?.(canvas);
    } catch (e) {
      setError(e instanceof Error ? e.message : "วาดเกียรติบัตรไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [templateUrl, config, studentName, maxWidth, onCanvasReady]);

  useEffect(() => {
    render();
  }, [render]);

  return (
    <div className={cn("relative inline-block", className)}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={cn("max-w-full rounded-lg shadow-sm", loading && "opacity-0")}
      />
    </div>
  );
}

export function downloadCertificateCanvas(
  canvas: HTMLCanvasElement,
  filename: string
) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
