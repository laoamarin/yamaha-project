-- Admin RLS policies (Step 3)
-- Run in Supabase SQL Editor after schema.sql

-- Events: admin full access
create policy "admin can read all events"
  on events for select
  to authenticated
  using (true);

create policy "admin can insert events"
  on events for insert
  to authenticated
  with check (true);

create policy "admin can update events"
  on events for update
  to authenticated
  using (true);

create policy "admin can delete events"
  on events for delete
  to authenticated
  using (true);

-- Students: admin write (for Excel import in step 4)
create policy "admin can insert students"
  on students for insert
  to authenticated
  with check (true);

create policy "admin can update students"
  on students for update
  to authenticated
  using (true);

create policy "admin can delete students"
  on students for delete
  to authenticated
  using (true);

-- Storage: admin upload certificate templates (step 7)
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
