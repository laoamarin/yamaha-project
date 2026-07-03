"use client";

import { addStudent } from "@/app/admin/actions";
import { CertificateNameFieldSelect } from "@/components/admin/CertificateNameFieldSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Event } from "@/types/database";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  event: Event;
  onAdded?: () => void;
};

export function AddStudentForm({ event, onAdded }: Props) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [instrument, setInstrument] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [certNameSource, setCertNameSource] = useState("");
  const [certName, setCertName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await addStudent(event.id, {
      full_name: fullName,
      nickname: nickname || null,
      instrument: instrument || null,
      teacher_name: teacherName || null,
      certificate_name_source: certNameSource || null,
      certificate_name: certNameSource === "custom" ? certName || null : null,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    const name = result.student?.full_name ?? fullName;
    setSuccess(`เพิ่ม ${name} เรียบร้อยแล้ว`);
    setFullName("");
    setNickname("");
    setInstrument("");
    setTeacherName("");
    setCertNameSource("");
    setCertName("");
    router.refresh();
    onAdded?.();
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserPlus className="size-4" />
          เพิ่มรายชื่อทีละคน
        </CardTitle>
        <CardDescription>
          สำหรับเพิ่มนักเรียนที่ขาดจาก Excel หรือมาใหม่ก่อนงาน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="add-full_name">
                ชื่อ-นามสกุล <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น ด.ช.สมชาย ใจดี หรือ นางสาวมิสา (Misa)"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-nickname">ชื่อเล่น</Label>
              <Input
                id="add-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="ไม่บังคับ"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-instrument">วิชา / เครื่องดนตรี</Label>
              <Input
                id="add-instrument"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder="เช่น Piano"
                className="h-11"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="add-teacher">ครูผู้สอน</Label>
              <Input
                id="add-teacher"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="ไม่บังคับ"
                className="h-11"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="add-cert-source">ชื่อบนเกียรติบัตร (ไม่บังคับ)</Label>
              <CertificateNameFieldSelect
                id="add-cert-source"
                event={event}
                value={certNameSource}
                showDefaultOption
                onChange={setCertNameSource}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            {certNameSource === "custom" && (
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="add-cert-name">ชื่อที่แสดงบนเกียรติบัตร</Label>
                <Input
                  id="add-cert-name"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder="เช่น Athena Hongsuok"
                  className="h-11"
                />
              </div>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading} className="h-11">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                กำลังเพิ่ม...
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                เพิ่มรายชื่อ
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
