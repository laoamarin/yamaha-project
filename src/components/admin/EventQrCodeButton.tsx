"use client";

import { Button } from "@/components/ui/button";
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
import { Check, Copy, Download, QrCode } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  qrToken: string;
  eventName: string;
};

export function EventQrCodeButton({ qrToken, eventName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [registrationUrl, setRegistrationUrl] = useState("");

  useEffect(() => {
    setRegistrationUrl(`${window.location.origin}/event/${qrToken}`);
  }, [qrToken]);

  const drawQr = useCallback(async () => {
    if (!canvasRef.current || !registrationUrl) return;
    const QRCode = (await import("qrcode")).default;
    await QRCode.toCanvas(canvasRef.current, registrationUrl, {
      width: 240,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
  }, [registrationUrl]);

  useEffect(() => {
    if (open && registrationUrl) {
      drawQr();
    }
  }, [open, registrationUrl, drawQr]);

  async function handleCopy() {
    if (!registrationUrl) return;
    await navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    if (!registrationUrl) return;
    const QRCode = (await import("qrcode")).default;
    const dataUrl = await QRCode.toDataURL(registrationUrl, {
      width: 512,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `qr-${eventName.replace(/[^\w\u0E00-\u0E7F]+/g, "-")}.png`;
    link.click();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <QrCode className="size-3.5" />
        QR Code
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code ลงทะเบียน</DialogTitle>
            <DialogDescription>{eventName}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <canvas ref={canvasRef} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              ให้ผู้ปกครองสแกนเพื่อเปิดหน้าลงทะเบียน
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reg-url">ลิงก์ลงทะเบียน</Label>
            <div className="flex gap-2">
              <Input
                id="reg-url"
                readOnly
                value={registrationUrl}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                title="คัดลอกลิงก์"
              >
                {copied ? (
                  <Check className="size-4 text-emerald-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="size-4" />
              ดาวน์โหลด PNG
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
