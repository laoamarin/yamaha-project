"use client";

import { updateStudent } from "@/app/admin/actions";
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
import { formatStudentName } from "@/lib/event-utils";
import type { Student } from "@/types/database";
import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";

type Props = {
  eventId: string;
  student: Student;
  onUpdated?: (student: Student) => void;
};

export function StudentNameEditor({ eventId, student, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(student.full_name);
  const [nickname, setNickname] = useState(student.nickname ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setFullName(student.full_name);
    setNickname(student.nickname ?? "");
    setError(null);
    setOpen(true);
  }

  async function handleSave() {
    setLoading(true);
    setError(null);

    const result = await updateStudent(eventId, student.id, {
      full_name: fullName,
      nickname: nickname || null,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    if (result.student) {
      const updated = { ...student, ...result.student };
      onUpdated?.(updated);
      setOpen(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        <p className="font-medium">{formatStudentName(student)}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          title="แก้ไขชื่อ"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={openDialog}
        >
          <Pencil className="size-3.5" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขชื่อนักเรียน</DialogTitle>
            <DialogDescription>
              แก้ไขชื่อ-นามสกุลหรือชื่อเล่นเมื่อข้อมูลผิด
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-full_name-${student.id}`}>
                ชื่อ-นามสกุล <span className="text-destructive">*</span>
              </Label>
              <Input
                id={`edit-full_name-${student.id}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น ด.ช.สมชาย ใจดี"
                className="h-11"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSave();
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`edit-nickname-${student.id}`}>ชื่อเล่น</Label>
              <Input
                id={`edit-nickname-${student.id}`}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ไม่บังคับ"
                className="h-11"
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSave();
                }}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button onClick={() => void handleSave()} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
