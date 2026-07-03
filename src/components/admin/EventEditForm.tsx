"use client";

import { updateEvent } from "@/app/admin/actions";
import { ExtraFieldsEditor } from "@/components/admin/ExtraFieldsEditor";
import { AdminPageHeader } from "@/components/layout/admin-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import type { Event, ExtraField } from "@/types/database";
import { ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
  event: Event;
};

export function EventEditForm({ event }: Props) {
  const [extraFields, setExtraFields] = useState<ExtraField[]>(
    event.extra_fields ?? []
  );
  const [isActive, setIsActive] = useState(event.is_active);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    event.cover_image_url
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("extra_fields", JSON.stringify(extraFields));
    formData.set("is_active", String(isActive));

    const result = await updateEvent(event.id, formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="max-w-3xl">
      <AdminPageHeader
        title="แก้ไขงาน"
        subtitle={event.name}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลงาน</CardTitle>
          <CardDescription>แก้ไขชื่องาน วันที่ รูปปก และช่องข้อมูลเพิ่มเติม</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cover_image">รูปปกงาน</Label>
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
              <p className="text-xs text-muted-foreground">
                ไม่เลือกไฟล์ = ใช้รูปเดิม
              </p>
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
                defaultValue={event.name}
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
                defaultValue={event.event_date}
                className="h-11"
              />
            </div>

            <ExtraFieldsEditor fields={extraFields} onChange={setExtraFields} />

            <label className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={isActive}
                onCheckedChange={(v) => setIsActive(v === true)}
              />
              <span className="text-sm">เปิดใช้งานงานนี้ (ให้ลงทะเบียนได้)</span>
            </label>

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
                  "บันทึกการแก้ไข"
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
