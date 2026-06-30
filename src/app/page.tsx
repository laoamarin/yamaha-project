import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function checkSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "ยังไม่ได้ตั้งค่า env — ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ใน .env.local",
    };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("events").select("id").limit(1);

    if (error) {
      return {
        ok: false,
        message: `เชื่อมต่อได้ แต่ query ล้มเหลว: ${error.message}`,
      };
    }

    return { ok: true, message: "เชื่อมต่อ Supabase สำเร็จ" };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "เกิดข้อผิดพลาด",
    };
  }
}

export default async function Home() {
  const connection = await checkSupabaseConnection();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          ระบบลงทะเบียนนักแสดงงานคอนเสิร์ต
        </h1>
        <p className="text-slate-500 text-sm mb-8">Yamaha Concert Registration</p>

        <div
          className={`rounded-lg p-4 mb-6 text-sm ${
            connection.ok
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          <span className="font-medium">
            {connection.ok ? "✓ " : "⚠ "}
            {connection.message}
          </span>
        </div>

        <div className="space-y-3 text-sm text-slate-600">
          <p className="font-medium text-slate-800">ลิงก์สำคัญ:</p>
          <ul className="space-y-1">
            <li>
              <a href="/admin/login" className="text-indigo-600 hover:underline">
                Admin Login →
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
