# Supabase Setup (Step 1)

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → choose org, name, password, region
3. Wait until the project is ready

## 2. Run SQL

1. Open **SQL Editor** → **New query**
2. Paste and run `schema.sql`
3. Paste and run `storage.sql`

## 3. Storage bucket (UI alternative)

If `storage.sql` fails, create manually:

1. **Storage** → **New bucket**
2. Name: `certificate-templates`
3. Enable **Public bucket**

## 4. Copy API keys

**Project Settings → API**:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **Publishable key** → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Copy `.env.local.example` to `.env.local` and paste the values from **Connect your app** in the Supabase dashboard.

## 6. Admin user (Step 3)

1. **Authentication → Users → Add user** (email + password)
2. Run `admin-policies.sql` in SQL Editor
3. Login at `/admin/login`

## 5. Verify

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the home page shows connection status.
