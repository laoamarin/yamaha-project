-- Storage bucket for certificate templates
-- Run after schema.sql in Supabase SQL Editor

insert into storage.buckets (id, name, public)
values ('certificate-templates', 'certificate-templates', true)
on conflict (id) do nothing;

-- Public read for certificate template images
create policy "public read certificate templates"
  on storage.objects for select
  using (bucket_id = 'certificate-templates');

-- Admin upload/delete policies — add in step 7 when building certificate designer
