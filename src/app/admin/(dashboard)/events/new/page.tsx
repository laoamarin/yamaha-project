"use client";

import { createEvent } from "@/app/admin/actions";
import { ExtraFieldsEditor } from "@/components/admin/ExtraFieldsEditor";
import type { ExtraField } from "@/types/database";
import Link from "next/link";
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
        <Link
          href="/admin/events"
          className="text-sm text-slate-500 hover:text-indigo-600"
        >
          ← กลับ
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">สร้างงานใหม่</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            ชื่องาน <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="คอนเสิร์ต Yamaha ประจำปี 2569"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            วันที่จัดงาน <span className="text-red-500">*</span>
          </label>
          <input
            name="event_date"
            type="date"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <ExtraFieldsEditor fields={extraFields} onChange={setExtraFields} />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "กำลังบันทึก..." : "สร้างงาน"}
          </button>
          <Link
            href="/admin/events"
            className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
          >
            ยกเลิก
          </Link>
        </div>
      </form>
    </div>
  );
}
