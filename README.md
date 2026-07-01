# Yamaha Concert Registration

ระบบลงทะเบียนนักแสดงงานคอนเสิร์ต พร้อมระบบเกียรติบัตร

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase

## Features

- **Public** — ค้นหาชื่อนักเรียน + ลงทะเบียน + ดาวน์โหลดเกียรติบัตร
- **Admin** — สร้างงาน, นำเข้า Excel, dashboard realtime, ออกแบบเกียรติบัตร, พิมพ์ PDF

## Local Development

```bash
npm install
cp .env.local.example .env.local
# ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## Supabase Setup

รัน SQL ตามลำดับใน Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/storage.sql`
3. `supabase/admin-policies.sql`

สร้าง admin user ที่ **Authentication → Users → Add user**

รายละเอียดเพิ่มเติม: [supabase/README.md](supabase/README.md)

## Deploy to Vercel

1. Push repo นี้ขึ้น GitHub
2. Import project ใน [vercel.com](https://vercel.com) → เลือก repo `yamaha-project`
3. ตั้ง **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Deploy

## Seed POC Data (one-off)

1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`  
   (Supabase Dashboard → Settings → API → `service_role` secret)
2. Run:

```bash
npm run seed
```

Creates 2 events (4 & 5 ก.ค. 2026) with ~69 students each and prints test URLs.


| Route | Description |
|-------|-------------|
| `/event/[qr_token]` | หน้าลงทะเบียน (public) |
| `/admin/login` | Admin login |
| `/admin/events` | จัดการงาน |
