"use client";

import { createEvent } from "@/app/admin/actions";
import { ExtraFieldsEditor } from "@/components/admin/ExtraFieldsEditor";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

export default function NewEventPage() {
  const [extraFields, setExtraFields] = useState<ExtraField[]>([
    { key: "phone", label: "เบอร์โทร", required: true },
    { key: "registered_by", label: "ชื่อผู้ปกครอง", required: true },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <LinkButton variant="ghost" size="sm" href="/admin/events" className="-ml-2 mb-2">
          <ArrowLeft className="size-4" />
          กลับ
        </LinkButton>
        <h1 className="text-2xl font-semibold tracking-tight">สร้างงานใหม่</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          กำหนดรายละเอียดงานและช่องข้อมูลตอนลงทะเบียน
        </p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลงาน</CardTitle>
          <CardDescription>ชื่องานและวันที่จัด</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  "สร้างงาน"
                )}
              </Button>
              <LinkButton variant="outline" href="/admin/events">
                ยกเลิก
              </LinkButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
