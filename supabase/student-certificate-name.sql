-- Per-student certificate name settings
-- Run in Supabase SQL Editor

alter table students
  add column if not exists certificate_name_source text
    check (
      certificate_name_source is null
      or certificate_name_source in ('full_name', 'nickname', 'no_prefix', 'custom')
    );

alter table students
  add column if not exists certificate_name text;

comment on column students.certificate_name_source is
  'Override event default: full_name | nickname | no_prefix | custom';

comment on column students.certificate_name is
  'Custom display name when certificate_name_source = custom';
