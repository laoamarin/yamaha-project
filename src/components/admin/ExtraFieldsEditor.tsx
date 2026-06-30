"use client";

import type { ExtraField } from "@/types/database";

type Props = {
  fields: ExtraField[];
  onChange: (fields: ExtraField[]) => void;
};

export function ExtraFieldsEditor({ fields, onChange }: Props) {
  function addField() {
    onChange([
      ...fields,
      { key: "", label: "", required: false },
    ]);
  }

  function updateField(index: number, patch: Partial<ExtraField>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-700">
          ช่องข้อมูลเพิ่มเติม (ตอนลงทะเบียน)
        </label>
        <button
          type="button"
          onClick={addField}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + เพิ่มช่อง
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-slate-400 italic">
          ยังไม่มีช่องเพิ่มเติม — กด &quot;เพิ่มช่อง&quot; ถ้าต้องการ เช่น เบอร์โทร, ชื่อผู้ปกครอง
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={index}
          className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end p-3 bg-slate-50 rounded-lg border border-slate-200"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">Key (ภาษาอังกฤษ)</label>
            <input
              type="text"
              value={field.key}
              onChange={(e) =>
                updateField(index, {
                  key: e.target.value.replace(/\s/g, "_").toLowerCase(),
                })
              }
              placeholder="phone"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Label (แสดงผล)</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(index, { label: e.target.value })}
              placeholder="เบอร์โทร"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(index, { required: e.target.checked })}
              className="rounded border-slate-300"
            />
            บังคับ
          </label>
          <button
            type="button"
            onClick={() => removeField(index)}
            className="text-sm text-red-500 hover:text-red-700 pb-2"
          >
            ลบ
          </button>
        </div>
      ))}
    </div>
  );
}
