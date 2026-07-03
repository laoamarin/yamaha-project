import type { CertificateConfig } from "@/types/database";

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
  default_name_source: "full_name",
  x_pct: 50,
  y_pct: 42,
  font_size: 48,
  font_color: "#1a1a4e",
  font_family: "Sarabun",
  align: "center",
};

export const CERTIFICATE_FONT_OPTIONS = [
  { value: "Sarabun", label: "Sarabun" },
  { value: "Noto Sans Thai", label: "Noto Sans Thai" },
  { value: "Prompt", label: "Prompt" },
];

const LOADED_FONTS = new Set<string>();

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
  templateImg?: HTMLImageElement
): Promise<HTMLCanvasElement> {
  await loadCertificateFont(config.font_family);
  const img = templateImg ?? (await loadCertificateTemplate(templateUrl));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("ไม่สามารถสร้าง canvas ได้");
  drawCertificate(ctx, img, config, studentName);
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
  scale = 1
) {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  ctx.canvas.width = w;
  ctx.canvas.height = h;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const fontSize = config.font_size * scale;
  ctx.font = `600 ${fontSize}px "${config.font_family}", sans-serif`;
  ctx.fillStyle = config.font_color;
  ctx.textBaseline = "middle";

  const x = (config.x_pct / 100) * w;
  const y = (config.y_pct / 100) * h;

  if (config.align === "left") {
    ctx.textAlign = "left";
    ctx.fillText(studentName, x, y);
  } else if (config.align === "right") {
    ctx.textAlign = "right";
    ctx.fillText(studentName, x, y);
  } else {
    ctx.textAlign = "center";
    ctx.fillText(studentName, x, y);
  }
}
