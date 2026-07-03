"use client";

import { createClient } from "@/lib/supabase/client";
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
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-12 lg:grid lg:grid-cols-2 lg:gap-12 lg:px-8">
        <div className="hidden lg:flex lg:flex-col lg:justify-center">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Music2 className="size-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Yamaha Admin
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            ระบบจัดการงานคอนเสิร์ต รายชื่อลงทะเบียน และเกียรติบัตร
            สำหรับเจ้าหน้าที่ admin
          </p>
          <p className="mt-8 text-sm text-muted-foreground">
            ผู้ปกครองใช้ลิงก์ QR /event/... ไม่ต้อง login
          </p>
        </div>

        <Card className="w-full max-w-md shadow-sm lg:max-w-none">
          <CardHeader className="pb-4">
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
              <Music2 className="size-5" />
            </div>
            <CardTitle className="text-xl">เข้าสู่ระบบ</CardTitle>
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
    </div>
  );
}
