import { PageContainer, PageShell } from "@/components/layout/page-container";
import { LinkButton } from "@/components/ui/link-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Music2, Shield } from "lucide-react";

export default function Home() {
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
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                เข้าใช้งาน
              </p>
              <LinkButton className="w-full" size="lg" href="/admin/login">
                <Shield className="size-4" />
                Login สำหรับ แอดมินเท่านั้น
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}
