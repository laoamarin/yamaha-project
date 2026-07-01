import { PageContainer, PageShell } from "@/components/layout/page-container";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ArrowLeft, SearchX } from "lucide-react";

export default function EventNotFound() {
  return (
    <PageShell>
      <PageContainer size="sm" className="flex min-h-screen items-center py-12">
        <Card className="w-full text-center shadow-sm">
          <CardHeader className="items-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-7" />
            </div>
            <CardTitle>ไม่พบงานนี้</CardTitle>
            <CardDescription>
              ลิงก์อาจไม่ถูกต้อง หรืองานถูกปิดแล้ว
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkButton variant="outline" href="/">
              <ArrowLeft className="size-4" />
              กลับหน้าแรก
            </LinkButton>
          </CardContent>
        </Card>
      </PageContainer>
    </PageShell>
  );
}
