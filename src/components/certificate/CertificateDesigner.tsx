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
  DEFAULT_NAME_OVERLAY,
  DEFAULT_CERTIFICATE_CONFIG,
  normalizeCertificateConfig,
  resolveCertificateOverlayText,
  syncLegacyNameConfig,
} from "@/lib/certificate-utils";
import { uploadCertificateTemplate } from "@/lib/certificate-upload";
import { cn } from "@/lib/utils";
import type {
  CertificateConfig,
  CertificateTextOverlay,
  Event,
} from "@/types/database";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Download,
  ImageIcon,
  Loader2,
  MousePointerClick,
  Plus,
  Save,
  Trash2,
  Type,
  UserRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SAMPLE_NAME = "นายทดสอบ ระบบ";
const NUDGE_FINE = 0.1;
const NUDGE_COARSE = 1;

type Props = {
  event: Event;
};

export function CertificateDesigner({ event }: Props) {
  const router = useRouter();
  const initialConfig: CertificateConfig = {
    ...normalizeCertificateConfig(event.certificate_config),
    enabled: event.certificate_config?.enabled ?? Boolean(event.certificate_template_url),
  };

  const [config, setConfig] = useState<CertificateConfig>(initialConfig);
  const [selectedOverlayId, setSelectedOverlayId] = useState(
    initialConfig.overlays?.[0]?.id ?? DEFAULT_NAME_OVERLAY.id
  );
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
  const templateStageRef = useRef<HTMLDivElement | null>(null);
  const [templateNaturalWidth, setTemplateNaturalWidth] = useState(0);
  const [stageWidth, setStageWidth] = useState(0);
  const overlays = config.overlays ?? [];
  const selectedOverlay =
    overlays.find((overlay) => overlay.id === selectedOverlayId) ?? overlays[0];
  const previewScale =
    templateNaturalWidth > 0 && stageWidth > 0
      ? stageWidth / templateNaturalWidth
      : 0.35;

  function updateSelectedOverlay(
    update: Partial<CertificateTextOverlay>
  ) {
    setConfig((current) => ({
      ...current,
      overlays: (current.overlays ?? []).map((overlay) =>
        overlay.id === selectedOverlayId ? { ...overlay, ...update } : overlay
      ),
    }));
  }

  function clampPct(value: number) {
    return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
  }

  function nudgeSelectedOverlay(dx: number, dy: number) {
    setConfig((current) => ({
      ...current,
      overlays: (current.overlays ?? []).map((overlay) =>
        overlay.id === selectedOverlayId
          ? {
              ...overlay,
              x_pct: clampPct(overlay.x_pct + dx),
              y_pct: clampPct(overlay.y_pct + dy),
            }
          : overlay
      ),
    }));
  }

  function getOverlayPreviewText(overlay: CertificateTextOverlay) {
    return (
      resolveCertificateOverlayText(overlay, {
        studentName: SAMPLE_NAME,
        eventDate: event.event_date,
      }) || overlay.label
    );
  }

  useEffect(() => {
    const stage = templateStageRef.current;
    if (!stage) return;

    const updateWidth = () => setStageWidth(stage.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [previewUrl, templateUrl]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedOverlayId || !(previewUrl ?? templateUrl)) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const step = e.shiftKey ? NUDGE_COARSE : NUDGE_FINE;
      let dx = 0;
      let dy = 0;
      if (e.key === "ArrowLeft") dx = -step;
      else if (e.key === "ArrowRight") dx = step;
      else if (e.key === "ArrowUp") dy = -step;
      else if (e.key === "ArrowDown") dy = step;
      else return;

      e.preventDefault();
      setConfig((current) => ({
        ...current,
        overlays: (current.overlays ?? []).map((overlay) =>
          overlay.id === selectedOverlayId
            ? {
                ...overlay,
                x_pct: clampPct(overlay.x_pct + dx),
                y_pct: clampPct(overlay.y_pct + dy),
              }
            : overlay
        ),
      }));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedOverlayId, previewUrl, templateUrl]);

  function addOverlay(source: "event_date" | "custom") {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `overlay-${Date.now()}`;
    const overlay: CertificateTextOverlay = {
      ...DEFAULT_NAME_OVERLAY,
      id,
      label: source === "event_date" ? "วันที่งาน" : "ข้อความเพิ่มเติม",
      source,
      text: source === "custom" ? "ข้อความใหม่" : undefined,
      date_format: source === "event_date" ? "en_long" : undefined,
      y_pct: Math.min(90, 52 + overlays.length * 6),
      font_size: 30,
      font_weight: 600,
    };

    setConfig((current) => ({
      ...current,
      overlays: [...(current.overlays ?? []), overlay],
    }));
    setSelectedOverlayId(id);
  }

  function removeSelectedOverlay() {
    if (!selectedOverlay || selectedOverlay.source === "student_name") return;
    const remaining = overlays.filter(
      (overlay) => overlay.id !== selectedOverlay.id
    );
    setConfig((current) => ({ ...current, overlays: remaining }));
    setSelectedOverlayId(remaining[0]?.id ?? DEFAULT_NAME_OVERLAY.id);
  }

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
    updateSelectedOverlay({ x_pct, y_pct });
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
        config: syncLegacyNameConfig({ ...config, enabled: true }),
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
            เลือกข้อความด้านล่าง แล้วคลิกบนภาพเพื่อกำหนดตำแหน่ง
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
            <div className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MousePointerClick className="size-3.5" />
                กำลังวาง “{selectedOverlay?.label}” (x:{" "}
                {selectedOverlay?.x_pct ?? 0}%, y:{" "}
                {selectedOverlay?.y_pct ?? 0}%) — ใช้ลูกศรคีย์บอร์ดขยับทีละนิด
                (Shift = เร็วขึ้น)
              </p>
              <div
                ref={templateStageRef}
                className="relative cursor-crosshair overflow-hidden rounded-xl border bg-muted"
                onClick={handlePreviewClick}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeTemplate}
                  alt="Certificate template"
                  className="block w-full"
                  draggable={false}
                  onLoad={(e) =>
                    setTemplateNaturalWidth(e.currentTarget.naturalWidth)
                  }
                />
                {overlays.map((overlay) => {
                  const selected = overlay.id === selectedOverlay?.id;
                  const previewText = getOverlayPreviewText(overlay);
                  const translateX =
                    overlay.align === "left"
                      ? "0"
                      : overlay.align === "right"
                        ? "-100%"
                        : "-50%";
                  return (
                    <button
                      key={overlay.id}
                      type="button"
                      className={cn(
                        "absolute max-w-[80%] whitespace-nowrap px-1 py-0.5 leading-none outline-none",
                        selected
                          ? "z-20 ring-2 ring-red-500 ring-offset-1"
                          : "z-10 opacity-90 hover:opacity-100"
                      )}
                      style={{
                        left: `${overlay.x_pct}%`,
                        top: `${overlay.y_pct}%`,
                        transform: `translate(${translateX}, -50%)`,
                        color: overlay.font_color,
                        fontFamily: `"${overlay.font_family}", sans-serif`,
                        fontSize: Math.max(
                          10,
                          overlay.font_size * previewScale
                        ),
                        fontWeight: overlay.font_weight,
                        textAlign: overlay.align,
                      }}
                      title={`${overlay.label}: ${previewText}`}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        setSelectedOverlayId(overlay.id);
                      }}
                    >
                      {previewText}
                    </button>
                  );
                })}
              </div>

              {selectedOverlay && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">
                    ขยับทีละนิด
                    <br />
                    <span className="text-[11px]">0.1% / Shift 1%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="ขยับขึ้น"
                      onClick={() => nudgeSelectedOverlay(0, -NUDGE_FINE)}
                    >
                      <ArrowUp className="size-3.5" />
                    </Button>
                    <span />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="ขยับซ้าย"
                      onClick={() => nudgeSelectedOverlay(-NUDGE_FINE, 0)}
                    >
                      <ArrowLeft className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="ขยับลง"
                      onClick={() => nudgeSelectedOverlay(0, NUDGE_FINE)}
                    >
                      <ArrowDown className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="ขยับขวา"
                      onClick={() => nudgeSelectedOverlay(NUDGE_FINE, 0)}
                    >
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(
                      [
                        ["←1%", -NUDGE_COARSE, 0],
                        ["→1%", NUDGE_COARSE, 0],
                        ["↑1%", 0, -NUDGE_COARSE],
                        ["↓1%", 0, NUDGE_COARSE],
                      ] as const
                    ).map(([label, dx, dy]) => (
                      <Button
                        key={label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={() => nudgeSelectedOverlay(dx, dy)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อความบนเกียรติบัตร</CardTitle>
          <CardDescription>
            เพิ่มข้อความได้หลายรายการ แต่ละรายการมีตำแหน่งและรูปแบบแยกกัน
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {overlays.map((overlay, index) => {
              const Icon =
                overlay.source === "student_name"
                  ? UserRound
                  : overlay.source === "event_date"
                    ? CalendarDays
                    : Type;
              return (
                <button
                  key={overlay.id}
                  type="button"
                  onClick={() => setSelectedOverlayId(overlay.id)}
                  className={`flex min-h-[52px] items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                    overlay.id === selectedOverlay?.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {index + 1}. {overlay.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {getOverlayPreviewText(overlay)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addOverlay("event_date")}
            >
              <CalendarDays className="size-4" />
              เพิ่มวันที่
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addOverlay("custom")}
            >
              <Plus className="size-4" />
              เพิ่มข้อความ
            </Button>
            {selectedOverlay?.source !== "student_name" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={removeSelectedOverlay}
              >
                <Trash2 className="size-4" />
                ลบข้อความที่เลือก
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              ตั้งค่า: {selectedOverlay?.label ?? "ข้อความ"}
            </CardTitle>
            <CardDescription>
              การตั้งค่ามีผลเฉพาะข้อความที่เลือก
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOverlay && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="overlay_label">ชื่อรายการ</Label>
                  <Input
                    id="overlay_label"
                    value={selectedOverlay.label}
                    onChange={(e) =>
                      updateSelectedOverlay({ label: e.target.value })
                    }
                    className="h-10"
                  />
                </div>

                {selectedOverlay.source === "student_name" && (
                  <div className="space-y-2">
                    <Label htmlFor="default_name_source">
                      ข้อมูลนักเรียนที่แสดง
                    </Label>
                    <CertificateNameFieldSelect
                      id="default_name_source"
                      event={event}
                      value={config.default_name_source ?? "full_name"}
                      onChange={(value) =>
                        setConfig((current) => ({
                          ...current,
                          default_name_source: value,
                        }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                )}

                {selectedOverlay.source === "event_date" && (
                  <div className="space-y-2">
                    <Label htmlFor="date_format">รูปแบบวันที่</Label>
                    <select
                      id="date_format"
                      value={selectedOverlay.date_format ?? "en_long"}
                      onChange={(e) =>
                        updateSelectedOverlay({
                          date_format: e.target
                            .value as CertificateTextOverlay["date_format"],
                        })
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="th_long">19 กรกฎาคม 2569</option>
                      <option value="en_long">July 19, 2026</option>
                      <option value="day">19</option>
                      <option value="day_ordinal">19th</option>
                      <option value="month_en">July</option>
                      <option value="year">2026</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      ดึงค่าจากวันที่ของงานโดยอัตโนมัติ
                    </p>
                  </div>
                )}

                {selectedOverlay.source === "custom" && (
                  <div className="space-y-2">
                    <Label htmlFor="overlay_text">ข้อความ</Label>
                    <textarea
                      id="overlay_text"
                      value={selectedOverlay.text ?? ""}
                      onChange={(e) =>
                        updateSelectedOverlay({ text: e.target.value })
                      }
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      ตัวแปรที่ใช้ได้: {"{student_name}"}, {"{day}"},{" "}
                      {"{day_ordinal}"}, {"{month_en}"}, {"{year}"},{" "}
                      {"{date_en}"}, {"{date_th}"}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="x_pct">ตำแหน่ง X (%)</Label>
                    <Input
                      id="x_pct"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={selectedOverlay.x_pct}
                      onChange={(e) =>
                        updateSelectedOverlay({
                          x_pct: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="y_pct">ตำแหน่ง Y (%)</Label>
                    <Input
                      id="y_pct"
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      value={selectedOverlay.y_pct}
                      onChange={(e) =>
                        updateSelectedOverlay({
                          y_pct: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="font_size">ขนาดตัวอักษร</Label>
                    <Input
                      id="font_size"
                      type="number"
                      min={8}
                      max={160}
                      value={selectedOverlay.font_size}
                      onChange={(e) =>
                        updateSelectedOverlay({
                          font_size:
                            Number(e.target.value) ||
                            DEFAULT_CERTIFICATE_CONFIG.font_size,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font_weight">ความหนา</Label>
                    <select
                      id="font_weight"
                      value={selectedOverlay.font_weight}
                      onChange={(e) =>
                        updateSelectedOverlay({
                          font_weight: Number(e.target.value) as 400 | 600 | 700,
                        })
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value={400}>ปกติ</option>
                      <option value={600}>กึ่งหนา</option>
                      <option value={700}>หนา</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font_color">สีตัวอักษร</Label>
                  <div className="flex gap-2">
                    <Input
                      id="font_color"
                      type="color"
                      value={selectedOverlay.font_color}
                      onChange={(e) =>
                        updateSelectedOverlay({ font_color: e.target.value })
                      }
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      type="text"
                      value={selectedOverlay.font_color}
                      onChange={(e) =>
                        updateSelectedOverlay({ font_color: e.target.value })
                      }
                      className="h-10 flex-1 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font_family">ฟอนต์</Label>
                  <select
                    id="font_family"
                    value={selectedOverlay.font_family}
                    onChange={(e) =>
                      updateSelectedOverlay({ font_family: e.target.value })
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {CERTIFICATE_FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
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
                        variant={
                          selectedOverlay.align === align ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => updateSelectedOverlay({ align })}
                      >
                        <Icon className="size-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
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
                eventDate={event.event_date}
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
