"use client";

import type { ExtraField } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

type Props = {
  fields: ExtraField[];
  onChange: (fields: ExtraField[]) => void;
};

export function ExtraFieldsEditor({ fields, onChange }: Props) {
  function addField() {
    onChange([...fields, { key: "", label: "", required: false }]);
  }

  function updateField(index: number, patch: Partial<ExtraField>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">ช่องข้อมูลเพิ่มเติม</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            แสดงตอนผู้ปกครองลงทะเบียน
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addField}>
          <Plus className="size-3.5" />
          เพิ่มช่อง
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          ยังไม่มีช่องเพิ่มเติม — เช่น เบอร์โทร, ชื่อผู้ปกครอง
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-lg border bg-background p-3 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"
          >
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Key</Label>
              <Input
                value={field.key}
                onChange={(e) =>
                  updateField(index, {
                    key: e.target.value.replace(/\s/g, "_").toLowerCase(),
                  })
                }
                placeholder="phone"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="เบอร์โทร"
              />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Checkbox
                id={`required-${index}`}
                checked={field.required}
                onCheckedChange={(checked) =>
                  updateField(index, { required: checked === true })
                }
              />
              <Label
                htmlFor={`required-${index}`}
                className="text-sm font-normal cursor-pointer"
              >
                บังคับ
              </Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => removeField(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
