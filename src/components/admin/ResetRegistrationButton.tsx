"use client";

import { resetRegistration } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatStudentName } from "@/lib/event-utils";
import type { Student } from "@/types/database";
import { Loader2, RotateCcw } from "lucide-react";
import { useState } from "react";

type Props = {
  eventId: string;
  student: Student;
  registered: boolean;
  onReset: () => void;
};

export function ResetRegistrationButton({
  eventId,
  student,
  registered,
  onReset,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!registered) {
    return <span className="text-muted-foreground">—</span>;
  }

  async function handleConfirm() {
    setLoading(true);
    setError(null);

    const result = await resetRegistration(eventId, student.id);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onReset();
    setLoading(false);
    setOpen(false);
  }

  const displayName = formatStudentName(student);

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        title="รีเซ็ตการลงทะเบียน"
        className="text-amber-700 hover:bg-amber-50 hover:text-amber-800"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <RotateCcw className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>รีเซ็ตการลงทะเบียน</DialogTitle>
            <DialogDescription>
              ยืนยันรีเซ็ต <span className="font-medium text-foreground">{displayName}</span>{" "}
              ให้กลับเป็นสถานะ &quot;ยังไม่มา&quot; เพื่อให้ลงทะเบียนใหม่ได้
            </DialogDescription>
          </DialogHeader>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังรีเซ็ต...
                </>
              ) : (
                "ยืนยันรีเซ็ต"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
