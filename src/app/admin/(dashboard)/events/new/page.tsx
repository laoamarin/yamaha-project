"use client";

import { createEvent } from "@/app/admin/actions";
import { ExtraFieldsEditor } from "@/components/admin/ExtraFieldsEditor";
import { AdminPageHeader } from "@/components/layout/admin-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";
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
import type { ExtraField } from "@/types/database";
import { ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export default function NewEventPage() {
  const [extraFields, setExtraFields] = useState<ExtraField[]>([
    { key: "phone", label: "เบอร์โทร", required: true },
    { key: "registered_by", label: "ชื่อผู้ปกครอง", required: true },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("extra_fields", JSON.stringify(extraFields));

    const result = await createEvent(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="สร้างงานใหม่"
        subtitle="กำหนดรายละเอียดงานและช่องข้อมูลตอนลงทะเบียน"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลงาน</CardTitle>
          <CardDescription>ชื่องาน วันที่ และรูปปก</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cover_image">รูปปกงาน (ไม่บังคับ)</Label>
              <div className="overflow-hidden rounded-xl border">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-muted">
                    <ImageIcon className="size-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <Input
                id="cover_image"
                name="cover_image"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                ชื่องาน <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="คอนเสิร์ต Yamaha ประจำปี 2569"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_date">
                วันที่จัดงาน <span className="text-destructive">*</span>
              </Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                required
                className="h-11"
              />
            </div>

            <ExtraFieldsEditor fields={extraFields} onChange={setExtraFields} />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" disabled={loading} className="h-11">
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "สร้างงาน"
                )}
              </Button>
              <LinkButton variant="outline" href="/admin/events" className="h-11">
                ยกเลิก
              </LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
