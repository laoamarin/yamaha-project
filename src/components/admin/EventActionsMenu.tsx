"use client";

import { deleteEvent } from "@/app/admin/actions";
import { EventQrCodeButton } from "@/components/admin/EventQrCodeButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LinkButton } from "@/components/ui/link-button";
import type { Event } from "@/types/database";
import {
  Award,
  ExternalLink,
  LayoutDashboard,
  Loader2,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  event: Event;
};

export function EventActionsMenu({ event }: Props) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  return (
    <>
      <div className="flex min-w-[9rem] flex-col items-stretch gap-1">
        <LinkButton
          variant="outline"
          size="sm"
          href={`/admin/events/${event.id}/dashboard`}
          className="w-full justify-start"
        >
          <LayoutDashboard className="size-3.5" />
          รายชื่อ
        </LinkButton>
        <LinkButton
          variant="outline"
          size="sm"
          href={`/admin/events/${event.id}/import`}
          className="w-full justify-start"
        >
          <Upload className="size-3.5" />
          นำเข้า
        </LinkButton>
        <LinkButton
          variant="outline"
          size="sm"
          href={`/admin/events/${event.id}/certificate`}
          className="w-full justify-start"
        >
          <Award className="size-3.5" />
          เกียรติบัตร
        </LinkButton>
        <LinkButton
          variant="outline"
          size="sm"
          href={`/admin/events/${event.id}/edit`}
          className="w-full justify-start"
        >
          <Pencil className="size-3.5" />
          แก้ไข
        </LinkButton>
        <EventQrCodeButton
          qrToken={event.qr_token}
          eventName={event.name}
          className="w-full justify-start"
        />
        <LinkButton
          variant="outline"
          size="sm"
          href={`/event/${event.qr_token}`}
          target="_blank"
          className="w-full justify-start"
        >
          <ExternalLink className="size-3.5" />
          หน้าลงทะเบียน
        </LinkButton>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            setDeleteError(null);
            setDeleteOpen(true);
          }}
        >
          <Trash2 className="size-3.5" />
          ลบงาน
        </Button>
      </div>

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
