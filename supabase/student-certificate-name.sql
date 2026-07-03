-- Student certificate name + dynamic import fields
-- Run in Supabase SQL Editor

alter table events
  add column if not exists student_fields jsonb default '[]';

alter table students
  add column if not exists extra_data jsonb default '{}';

alter table students
  add column if not exists certificate_name_source text;

alter table students
  add column if not exists certificate_name text;

-- Drop legacy enum check if present (allow any field key)
alter table students
  drop constraint if exists students_certificate_name_source_check;

comment on column events.student_fields is
  'Custom import columns available for certificate name, e.g. [{"key":"english_name","label":"English Name"}]';

comment on column students.extra_data is
  'Values for custom import columns keyed by student_fields';

comment on column students.certificate_name_source is
  'Field key for certificate display: full_name, nickname, english_name, no_prefix, custom, etc.';

comment on column students.certificate_name is
  'Custom display name when certificate_name_source = custom';
