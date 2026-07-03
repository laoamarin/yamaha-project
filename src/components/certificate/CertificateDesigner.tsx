"use client";

import { saveCertificateSettings } from "@/app/admin/actions";
import {
  CertificateRenderer,
  downloadCertificateCanvas,
} from "@/components/certificate/CertificateRenderer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import { CertificateNameFieldSelect } from "@/components/admin/CertificateNameFieldSelect";
import {
  CERTIFICATE_FONT_OPTIONS,
  DEFAULT_CERTIFICATE_CONFIG,
} from "@/lib/certificate-utils";
import { uploadCertificateTemplate } from "@/lib/certificate-upload";
import type { CertificateConfig, Event } from "@/types/database";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CheckCircle2,
  Download,
  ImageIcon,
  Loader2,
  MousePointerClick,
  Save,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const SAMPLE_NAME = "นายทดสอบ ระบบ";

type Props = {
  event: Event;
};

export function CertificateDesigner({ event }: Props) {
  const router = useRouter();
  const initialConfig: CertificateConfig = {
    ...DEFAULT_CERTIFICATE_CONFIG,
    ...(event.certificate_config ?? {}),
    enabled: event.certificate_config?.enabled ?? Boolean(event.certificate_template_url),
  };

  const [config, setConfig] = useState<CertificateConfig>(initialConfig);
  const [templateUrl, setTemplateUrl] = useState<string | null>(
    event.certificate_template_url
  );
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [released, setReleased] = useState(event.certificates_released);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultDialog, setResultDialog] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleTemplateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setTemplateFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }

  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!templateUrl && !previewUrl) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x_pct = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y_pct = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setConfig((c) => ({ ...c, x_pct, y_pct }));
  }

  async function handleSave() {
    setError(null);
    setLoading(true);

    try {
      let uploadedTemplateUrl: string | undefined;

      if (templateFile) {
        const uploadResult = await uploadCertificateTemplate(
          event.id,
          templateFile
        );
        if ("error" in uploadResult) {
          setResultDialog({ type: "error", message: uploadResult.error });
          setError(uploadResult.error);
          return;
        }
        uploadedTemplateUrl = uploadResult.url;
      }

      const result = await saveCertificateSettings(event.id, {
        config: { ...config, enabled: true },
        certificates_released: released,
        templateUrl: uploadedTemplateUrl,
      });

      if (result?.error) {
        setResultDialog({ type: "error", message: result.error });
        setError(result.error);
        return;
      }

      if (result?.templateUrl) {
        setTemplateUrl(result.templateUrl);
        setPreviewUrl(null);
        setTemplateFile(null);
      }

      setConfig((c) => ({ ...c, enabled: true }));
      router.refresh();
      setResultDialog({
        type: "success",
        message: "บันทึกการตั้งค่าเกียรติบัตรเรียบร้อยแล้ว",
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "บันทึกไม่สำเร็จ กรุณาลองใหม่";
      setError(message);
      setResultDialog({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  const activeTemplate = previewUrl ?? templateUrl;

  return (
    <div className="space-y-5">
      <Dialog
        open={resultDialog !== null}
        onOpenChange={(open) => !open && setResultDialog(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {resultDialog?.type === "success" ? (
                <>
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  บันทึกสำเร็จ
                </>
              ) : (
                <>
                  <XCircle className="size-5 text-destructive" />
                  บันทึกไม่สำเร็จ
                </>
              )}
            </DialogTitle>
            <DialogDescription>{resultDialog?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {resultDialog?.type === "success" ? (
              <>
                <Button variant="outline" onClick={() => setResultDialog(null)}>
                  อยู่หน้านี้
                </Button>
                <LinkButton href={`/admin/events/${event.id}/dashboard`}>
                  ไปหน้ารายชื่อ
                </LinkButton>
              </>
            ) : (
              <Button onClick={() => setResultDialog(null)}>ตกลง</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">รูปแบบเกียรติบัตร</CardTitle>
          <CardDescription>
            อัปโหลดรูป template แล้วคลิกบนภาพเพื่อกำหนดตำแหน่งชื่อ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template">รูปเกียรติบัตร (PNG/JPG)</Label>
            <Input
              id="template"
              type="file"
              accept="image/*"
              onChange={handleTemplateChange}
              className="h-10"
            />
            {!activeTemplate && (
              <div className="flex h-32 items-center justify-center rounded-xl border border-dashed bg-muted/50">
                <div className="text-center text-sm text-muted-foreground">
                  <ImageIcon className="mx-auto mb-2 size-8 opacity-40" />
                  ยังไม่มีรูป template
                </div>
              </div>
            )}
          </div>

          {activeTemplate && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MousePointerClick className="size-3.5" />
                คลิกบนภาพเพื่อวางตำแหน่งชื่อ (x: {config.x_pct}%, y:{" "}
                {config.y_pct}%)
              </p>
              <div
                className="relative cursor-crosshair overflow-hidden rounded-xl border bg-muted"
                onClick={handlePreviewClick}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeTemplate}
                  alt="Certificate template"
                  className="block w-full"
                  draggable={false}
                />
                <div
                  className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500 bg-red-500/30"
                  style={{
                    left: `${config.x_pct}%`,
                    top: `${config.y_pct}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ตั้งค่าตัวอักษร</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_name_source">ชื่อเริ่มต้นบนเกียรติบัตร</Label>
              <CertificateNameFieldSelect
                id="default_name_source"
                event={event}
                value={config.default_name_source ?? "full_name"}
                onChange={(value) =>
                  setConfig((c) => ({
                    ...c,
                    default_name_source: value,
                  }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                เลือก column/field ที่จะแสดงบนเกียรติบัตร — รองรับคอลัมน์จาก Excel
                (เช่น english_name, ชื่อไทย) และ override รายคนที่หน้ารายชื่อ
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font_size">ขนาดตัวอักษร</Label>
              <Input
                id="font_size"
                type="number"
                min={12}
                max={120}
                value={config.font_size}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    font_size:
                      Number(e.target.value) ||
                      DEFAULT_CERTIFICATE_CONFIG.font_size,
                  }))
                }
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font_color">สีตัวอักษร</Label>
              <div className="flex gap-2">
                <Input
                  id="font_color"
                  type="color"
                  value={config.font_color}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, font_color: e.target.value }))
                  }
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Input
                  type="text"
                  value={config.font_color}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, font_color: e.target.value }))
                  }
                  className="h-10 flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font_family">ฟอนต์</Label>
              <select
                id="font_family"
                value={config.font_family}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, font_family: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CERTIFICATE_FONT_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>จัดแนว</Label>
              <div className="flex gap-2">
                {(
                  [
                    ["left", AlignLeft],
                    ["center", AlignCenter],
                    ["right", AlignRight],
                  ] as const
                ).map(([align, Icon]) => (
                  <Button
                    key={align}
                    type="button"
                    variant={config.align === align ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig((c) => ({ ...c, align }))}
                  >
                    <Icon className="size-4" />
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ตัวอย่าง</CardTitle>
            <CardDescription>ชื่อตัวอย่าง: {SAMPLE_NAME}</CardDescription>
          </CardHeader>
          <CardContent>
            {activeTemplate ? (
              <CertificateRenderer
                templateUrl={activeTemplate}
                config={config}
                studentName={SAMPLE_NAME}
                maxWidth={480}
                onCanvasReady={(canvas) => {
                  canvasRef.current = canvas;
                }}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                อัปโหลดรูป template เพื่อดูตัวอย่าง
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="certificates-released"
              checked={released}
              onCheckedChange={(v) => setReleased(v === true)}
              disabled={!activeTemplate}
            />
            <Label htmlFor="certificates-released" className="cursor-pointer">
              <p className="font-medium">ปล่อยเกียรติบัตรให้ผู้ปกครอง</p>
              <p className="text-sm font-normal text-muted-foreground">
                เมื่อเปิด ผู้ปกครองที่ลงทะเบียนแล้วจะดูและดาวน์โหลดเกียรติบัตรได้
              </p>
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading || !activeTemplate}
              className="h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  บันทึกการตั้งค่า
                </>
              )}
            </Button>
            {canvasRef.current && (
              <Button
                type="button"
                variant="outline"
                className="h-11"
                onClick={() =>
                  downloadCertificateCanvas(
                    canvasRef.current!,
                    `certificate-sample-${event.event_date}.png`
                  )
                }
              >
                <Download className="size-4" />
                ดาวน์โหลดตัวอย่าง
              </Button>
            )}
            <LinkButton
              variant="outline"
              href={`/admin/events/${event.id}/dashboard`}
              className="h-11"
            >
              กลับรายชื่อ
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
