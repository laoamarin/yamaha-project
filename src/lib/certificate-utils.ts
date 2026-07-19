import type {
  CertificateConfig,
  CertificateDateFormat,
  CertificateTextOverlay,
} from "@/types/database";

export const DEFAULT_NAME_OVERLAY: CertificateTextOverlay = {
  id: "student-name",
  label: "ชื่อนักเรียน",
  source: "student_name",
  x_pct: 50,
  y_pct: 42,
  font_size: 48,
  font_color: "#1a1a4e",
  font_family: "Sarabun",
  font_weight: 600,
  align: "center",
};

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
  default_name_source: "full_name",
  x_pct: DEFAULT_NAME_OVERLAY.x_pct,
  y_pct: DEFAULT_NAME_OVERLAY.y_pct,
  font_size: DEFAULT_NAME_OVERLAY.font_size,
  font_color: DEFAULT_NAME_OVERLAY.font_color,
  font_family: DEFAULT_NAME_OVERLAY.font_family,
  align: DEFAULT_NAME_OVERLAY.align,
  overlays: [DEFAULT_NAME_OVERLAY],
};

export const CERTIFICATE_FONT_OPTIONS = [
  { value: "Sarabun", label: "Sarabun" },
  { value: "Noto Sans Thai", label: "Noto Sans Thai" },
  { value: "Prompt", label: "Prompt" },
];

const LOADED_FONTS = new Set<string>();

export function getCertificateOverlays(
  config: CertificateConfig
): CertificateTextOverlay[] {
  if (Array.isArray(config.overlays) && config.overlays.length > 0) {
    return config.overlays.map((overlay) => ({
      ...DEFAULT_NAME_OVERLAY,
      ...overlay,
      font_weight: overlay.font_weight ?? 600,
    }));
  }

  return [
    {
      ...DEFAULT_NAME_OVERLAY,
      x_pct: config.x_pct,
      y_pct: config.y_pct,
      font_size: config.font_size,
      font_color: config.font_color,
      font_family: config.font_family,
      align: config.align,
    },
  ];
}

export function normalizeCertificateConfig(
  config?: CertificateConfig | null
): CertificateConfig {
  const merged: CertificateConfig = {
    ...DEFAULT_CERTIFICATE_CONFIG,
    ...(config ?? {}),
  };

  return {
    ...merged,
    overlays: getCertificateOverlays(merged),
  };
}

export function syncLegacyNameConfig(
  config: CertificateConfig
): CertificateConfig {
  const nameOverlay = getCertificateOverlays(config).find(
    (overlay) => overlay.source === "student_name"
  );

  if (!nameOverlay) return config;

  return {
    ...config,
    x_pct: nameOverlay.x_pct,
    y_pct: nameOverlay.y_pct,
    font_size: nameOverlay.font_size,
    font_color: nameOverlay.font_color,
    font_family: nameOverlay.font_family,
    align: nameOverlay.align,
  };
}

function parseEventDate(eventDate?: string): Date | null {
  if (!eventDate) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(eventDate);
  if (!match) return null;
  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  );
}

function ordinal(day: number): string {
  const suffix =
    day % 10 === 1 && day % 100 !== 11
      ? "st"
      : day % 10 === 2 && day % 100 !== 12
        ? "nd"
        : day % 10 === 3 && day % 100 !== 13
          ? "rd"
          : "th";
  return `${day}${suffix}`;
}

export function formatCertificateDate(
  eventDate: string | undefined,
  format: CertificateDateFormat = "en_long"
): string {
  const date = parseEventDate(eventDate);
  if (!date) return "";

  const day = date.getUTCDate();

  switch (format) {
    case "th_long":
      return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
    case "day":
      return String(day);
    case "day_ordinal":
      return ordinal(day);
    case "month_en":
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        timeZone: "UTC",
      }).format(date);
    case "year":
      return String(date.getUTCFullYear());
    case "en_long":
    default:
      return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date);
  }
}

export function resolveCertificateOverlayText(
  overlay: CertificateTextOverlay,
  values: { studentName: string; eventDate?: string }
): string {
  if (overlay.source === "student_name") return values.studentName;
  if (overlay.source === "event_date") {
    return formatCertificateDate(values.eventDate, overlay.date_format);
  }

  const date = parseEventDate(values.eventDate);
  const replacements: Record<string, string> = {
    "{student_name}": values.studentName,
    "{date_th}": formatCertificateDate(values.eventDate, "th_long"),
    "{date_en}": formatCertificateDate(values.eventDate, "en_long"),
    "{day}": formatCertificateDate(values.eventDate, "day"),
    "{day_ordinal}": formatCertificateDate(values.eventDate, "day_ordinal"),
    "{month_en}": formatCertificateDate(values.eventDate, "month_en"),
    "{year}": date ? String(date.getUTCFullYear()) : "",
  };

  return Object.entries(replacements).reduce(
    (text, [token, value]) => text.split(token).join(value),
    overlay.text ?? ""
  );
}

export async function loadCertificateFont(family: string): Promise<void> {
  if (LOADED_FONTS.has(family)) return;

  const weights = "400;600;700";
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights}&display=swap`;

  if (!document.querySelector(`link[data-cert-font="${family}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-cert-font", family);
    document.head.appendChild(link);
  }

  await Promise.all([
    document.fonts.load(`400 16px "${family}"`),
    document.fonts.load(`600 16px "${family}"`),
    document.fonts.load(`700 16px "${family}"`),
  ]);

  LOADED_FONTS.add(family);
}

const templateCache = new Map<string, HTMLImageElement>();

export async function loadCertificateTemplate(
  templateUrl: string
): Promise<HTMLImageElement> {
  const cached = templateCache.get(templateUrl);
  if (cached) return cached;

  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("โหลดรูป template ไม่สำเร็จ"));
    img.src = templateUrl;
  });
  templateCache.set(templateUrl, img);
  return img;
}

export async function renderCertificateToCanvas(
  templateUrl: string,
  config: CertificateConfig,
  studentName: string,
  eventDate?: string,
  templateImg?: HTMLImageElement
): Promise<HTMLCanvasElement> {
  await Promise.all(
    getCertificateOverlays(config).map((overlay) =>
      loadCertificateFont(overlay.font_family)
    )
  );
  const img = templateImg ?? (await loadCertificateTemplate(templateUrl));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ไม่สามารถสร้าง canvas ได้");
  drawCertificate(ctx, img, config, studentName, eventDate);
  return canvas;
}

export function eventHasCertificate(event: {
  certificate_template_url: string | null;
  certificate_config: CertificateConfig | null;
}): boolean {
  return (
    Boolean(event.certificate_template_url) &&
    Boolean(
      event.certificate_config?.enabled ?? event.certificate_template_url
    )
  );
}

export async function exportCertificatesPdf(
  items: { canvas: HTMLCanvasElement; name: string }[],
  filename: string
) {
  if (!items.length) return;

  const { jsPDF } = await import("jspdf");
  const first = items[0].canvas;
  const pageW = first.width;
  const pageH = first.height;
  const orientation = pageW > pageH ? "landscape" : "portrait";

  const pdf = new jsPDF({
    orientation,
    unit: "px",
    format: [pageW, pageH],
    compress: true,
  });

  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      pdf.addPage([pageW, pageH], orientation);
    }
    const imgData = items[i].canvas.toDataURL("image/jpeg", 0.92);
    pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
  }

  pdf.save(filename);
}

export function drawCertificate(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  config: CertificateConfig,
  studentName: string,
  eventDate?: string,
  scale = 1
) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  for (const overlay of getCertificateOverlays(config)) {
    const text = resolveCertificateOverlayText(overlay, {
      studentName,
      eventDate,
    });
    if (!text) continue;

    const fontSize = overlay.font_size * scale;
    ctx.font = `${overlay.font_weight} ${fontSize}px "${overlay.font_family}", sans-serif`;
    ctx.fillStyle = overlay.font_color;
    ctx.textBaseline = "middle";
    ctx.textAlign = overlay.align;
    ctx.fillText(
      text,
      (overlay.x_pct / 100) * w,
      (overlay.y_pct / 100) * h
    );
  }
}
