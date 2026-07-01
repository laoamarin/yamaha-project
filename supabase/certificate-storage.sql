-- Certificate template storage (run in Supabase SQL Editor)
-- Fixes: "new row violates row-level security policy" on upload

insert into storage.buckets (id, name, public)
values ('certificate-templates', 'certificate-templates', true)
on conflict (id) do nothing;

-- Drop old policies if re-running
drop policy if exists "public read certificate templates" on storage.objects;
drop policy if exists "admin upload certificate templates" on storage.objects;
drop policy if exists "admin update certificate templates" on storage.objects;
drop policy if exists "admin delete certificate templates" on storage.objects;

create policy "public read certificate templates"
  on storage.objects for select
  using (bucket_id = 'certificate-templates');

create policy "admin upload certificate templates"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'certificate-templates');

create policy "admin update certificate templates"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'certificate-templates');

create policy "admin delete certificate templates"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'certificate-templates');
