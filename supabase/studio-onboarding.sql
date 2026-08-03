-- İşletmeci ilk kez giriş yaptığında zorunlu kurulum akışını izlemek için.
-- Mevcut Formera projesinde SQL Editor'da bir kez çalıştırılabilir.

alter table public.studios
  add column if not exists setup_completed boolean not null default false;

comment on column public.studios.setup_completed is
  'İşletme sahibi ilk kurulum sihirbazını tamamladığında true olur.';
