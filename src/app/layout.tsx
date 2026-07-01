import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yamaha Concert Registration",
  description: "ระบบลงทะเบียนนักแสดงงานคอนเสิร์ต พร้อมระบบเกียรติบัตร",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={cn("font-sans", notoSansThai.variable)}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
