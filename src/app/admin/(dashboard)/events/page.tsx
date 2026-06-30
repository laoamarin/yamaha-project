import { requireAdmin } from "@/lib/supabase/admin";
import Link from "next/link";

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false });

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
        โหลดข้อมูลไม่สำเร็จ: {error.message}
        <p className="mt-2 text-red-600">
          ถ้ายังไม่ได้รัน admin policies ให้รัน{" "}
          <code className="bg-red-100 px-1 rounded">supabase/admin-policies.sql</code>
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">งานคอนเสิร์ต</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + สร้างงานใหม่
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <p className="text-slate-500 mb-4">ยังไม่มีงาน — สร้างงานแรกได้เลย</p>
          <Link
            href="/admin/events/new"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
          >
            สร้างงานใหม่ →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="font-semibold text-slate-900">{event.name}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {formatDate(event.event_date)}
                  {!event.is_active && (
                    <span className="ml-2 text-amber-600">(ปิดใช้งาน)</span>
                  )}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  QR: /event/{event.qr_token}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`/event/${event.qr_token}`}
                  target="_blank"
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  เปิดหน้าลงทะเบียน
                </Link>
                <Link
                  href={`/admin/events/${event.id}/import`}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  นำเข้ารายชื่อ
                </Link>
                <Link
                  href={`/admin/events/${event.id}/dashboard`}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
