import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PageContainer, PageShell } from "@/components/layout/page-container";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Music2, Shield } from "lucide-react";

async function checkSupabaseConnection() {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message:
        "ยังไม่ได้ตั้งค่า env — ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
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
    <PageShell>
      <PageContainer size="sm" className="flex min-h-screen items-center py-12">
        <Card className="w-full shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Music2 className="size-7" />
            </div>
            <CardTitle className="text-xl leading-snug">
              ระบบลงทะเบียนนักแสดงงานคอนเสิร์ต
            </CardTitle>
            <CardDescription>Yamaha Concert Registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert
              className={
                connection.ok
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : undefined
              }
              variant={connection.ok ? "default" : "destructive"}
            >
              {connection.ok && <CheckCircle2 className="text-emerald-600" />}
              <AlertDescription className="font-medium">
                {connection.message}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                เข้าใช้งาน
              </p>
              <LinkButton className="w-full" size="lg" href="/admin/login">
                <Shield className="size-4" />
                Admin Login
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}
