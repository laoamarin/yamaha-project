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
import { Check, Copy, Download, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

type DialogProps = {
  qrToken: string;
  eventName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EventQrCodeDialog({
  qrToken,
  eventName,
  open,
  onOpenChange,
}: DialogProps) {
  const [copied, setCopied] = useState(false);
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRegistrationUrl(`${window.location.origin}/event/${qrToken}`);
    }
  }, [qrToken]);

  async function handleCopy() {
    if (!registrationUrl) return;
    await navigator.clipboard.writeText(registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    if (!registrationUrl) return;
    setDownloading(true);
    try {
      const QRCodeLib = (await import("qrcode")).default;
      const dataUrl = await QRCodeLib.toDataURL(registrationUrl, {
        width: 512,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-${eventName.replace(/[^\w\u0E00-\u0E7F]+/g, "-")}.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code ลงทะเบียน</DialogTitle>
          <DialogDescription>{eventName}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            {registrationUrl ? (
              <QRCode
                value={registrationUrl}
                size={240}
                level="M"
                bgColor="#ffffff"
                fgColor="#1a1a2e"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            ) : (
              <div className="flex size-[240px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}
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
              disabled={!registrationUrl}
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
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!registrationUrl || downloading}
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            ดาวน์โหลด PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type Props = {
  qrToken: string;
  eventName: string;
  className?: string;
};

export function EventQrCodeButton({ qrToken, eventName, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <QrCode className="size-3.5" />
        QR Code
      </Button>

      <EventQrCodeDialog
        qrToken={qrToken}
        eventName={eventName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
