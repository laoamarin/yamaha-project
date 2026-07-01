-- Event cover images (run in Supabase SQL Editor)

alter table events add column if not exists cover_image_url text;

insert into storage.buckets (id, name, public)
values ('event-covers', 'event-covers', true)
on conflict (id) do nothing;

create policy "public read event covers"
  on storage.objects for select
  using (bucket_id = 'event-covers');

create policy "admin upload event covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-covers');

create policy "admin update event covers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-covers');

create policy "admin delete event covers"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-covers');
