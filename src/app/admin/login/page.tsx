"use client";

import { createClient } from "@/lib/supabase/client";
import { AdminShell } from "@/components/layout/admin-shell";
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
import { Loader2, Music2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <AdminShell>
      <div className="flex min-h-screen flex-col bg-slate-900">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-white/10">
            <Music2 className="size-8 text-white" />
          </div>
          <h1 className="mb-1 text-xl font-bold text-white">Yamaha Admin</h1>
          <p className="mb-8 text-sm text-slate-400">ระบบจัดการงานคอนเสิร์ต</p>

          <Card className="w-full max-w-sm shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">เข้าสู่ระบบ</CardTitle>
              <CardDescription>สำหรับเจ้าหน้าที่ admin เท่านั้น</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">รหัสผ่าน</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="h-11"
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={loading} className="h-11 w-full">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <p className="pb-6 text-center text-xs text-slate-600">
          ผู้ปกครองใช้ลิงก์ QR /event/... ไม่ต้อง login
        </p>
      </div>
    </AdminShell>
  );
}
