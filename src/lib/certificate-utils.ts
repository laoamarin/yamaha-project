import type { CertificateConfig } from "@/types/database";

export const DEFAULT_CERTIFICATE_CONFIG: CertificateConfig = {
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

export async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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
