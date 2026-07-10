"use client";

import { deleteEvent } from "@/app/admin/actions";
import { EventQrCodeDialog } from "@/components/admin/EventQrCodeButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Event } from "@/types/database";
import { cn } from "@/lib/utils";
import {
  Award,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  MoreHorizontal,
  Pencil,
  QrCode,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  event: Event;
};

const MENU_WIDTH = 176;
const VIEWPORT_PADDING = 8;
const MENU_GAP = 4;

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  external?: boolean;
  destructive?: boolean;
};

function MenuItem({
  icon,
  label,
  onClick,
  href,
  external,
  destructive,
}: MenuItemProps) {
  const className = cn(
    "flex w-full min-h-[36px] items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors",
    destructive
      ? "text-destructive hover:bg-destructive/10"
      : "text-foreground hover:bg-accent hover:text-accent-foreground"
  );

  if (href) {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={className}
      >
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {icon}
      {label}
    </button>
  );
}

export function EventActionsMenu({ event }: Props) {
  const router = useRouter();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      const menuEl = menuRef.current;
      if (!trigger || !menuEl) return;

      const rect = trigger.getBoundingClientRect();
      const menuHeight = menuEl.offsetHeight;
      const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
      const spaceAbove = rect.top - VIEWPORT_PADDING;
      const openDown = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

      const left = Math.min(
        Math.max(VIEWPORT_PADDING, rect.right - MENU_WIDTH),
        window.innerWidth - MENU_WIDTH - VIEWPORT_PADDING
      );

      let top: number;
      let maxHeight: number | undefined;

      if (openDown) {
        top = rect.bottom + MENU_GAP;
        if (menuHeight > spaceBelow - MENU_GAP) {
          maxHeight = Math.max(120, spaceBelow - MENU_GAP);
        }
      } else {
        const available = spaceAbove - MENU_GAP;
        maxHeight = Math.max(120, available);
        const visibleHeight = Math.min(menuHeight, maxHeight);
        top = Math.max(VIEWPORT_PADDING, rect.top - visibleHeight - MENU_GAP);
      }

      setMenuStyle({
        position: "fixed",
        top,
        left,
        width: MENU_WIDTH,
        zIndex: 100,
        ...(maxHeight ? { maxHeight, overflowY: "auto" as const } : {}),
      });
    }

    updatePosition();

    const menuEl = menuRef.current;
    const observer =
      menuEl && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePosition)
        : null;
    observer?.observe(menuEl!);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError(null);

    const result = await deleteEvent(event.id);

    if (result?.error) {
      setDeleteError(result.error);
      setDeleting(false);
      return;
    }

    setDeleting(false);
    setDeleteOpen(false);
    router.refresh();
  }

  const menu = open ? (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      style={menuStyle}
      className="overflow-y-auto overscroll-contain rounded-lg border bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      <MenuItem
        icon={<LayoutDashboard className="size-4 shrink-0" />}
        label="รายชื่อ"
        href={`/admin/events/${event.id}/dashboard`}
      />
      <MenuItem
        icon={<Upload className="size-4 shrink-0" />}
        label="นำเข้า"
        href={`/admin/events/${event.id}/import`}
      />
      <MenuItem
        icon={<Award className="size-4 shrink-0" />}
        label="เกียรติบัตร"
        href={`/admin/events/${event.id}/certificate`}
      />
      <MenuItem
        icon={<Pencil className="size-4 shrink-0" />}
        label="แก้ไข"
        href={`/admin/events/${event.id}/edit`}
      />
      <MenuItem
        icon={<QrCode className="size-4 shrink-0" />}
        label="QR Code"
        onClick={() => {
          setOpen(false);
          setQrOpen(true);
        }}
      />
      <MenuItem
        icon={<ExternalLink className="size-4 shrink-0" />}
        label="หน้าลงทะเบียน"
        href={`/event/${event.qr_token}`}
        external
      />
      <div className="my-1 h-px bg-border" role="separator" />
      <MenuItem
        icon={<Trash2 className="size-4 shrink-0" />}
        label="ลบงาน"
        destructive
        onClick={() => {
          setOpen(false);
          setDeleteError(null);
          setDeleteOpen(true);
        }}
      />
    </div>
  ) : null;

  return (
    <>
      <div ref={rootRef} className="relative inline-flex">
        <div ref={triggerRef} className="inline-flex">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={`จัดการ ${event.name}`}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={open ? menuId : undefined}
            onClick={() => setOpen((value) => !value)}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
        {mounted && menu ? createPortal(menu, document.body) : null}
      </div>

      <EventQrCodeDialog
        qrToken={event.qr_token}
        eventName={event.name}
        open={qrOpen}
        onOpenChange={setQrOpen}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ลบงาน</DialogTitle>
            <DialogDescription>
              ยืนยันลบ{" "}
              <span className="font-medium text-foreground">{event.name}</span>{" "}
              รายชื่อนักเรียนและข้อมูลลงทะเบียนทั้งหมดจะถูกลบด้วย
              และไม่สามารถกู้คืนได้
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <p className="text-sm text-destructive">{deleteError}</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังลบ...
                </>
              ) : (
                "ยืนยันลบ"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
