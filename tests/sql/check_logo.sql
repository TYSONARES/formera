-- Logo yüklemesi Storage'a mı gitti, yoksa hâlâ satır içinde mi?
-- Supabase > SQL Editor > yapıştır > Run. Hiçbir şeyi değiştirmez.

select
  s.name as studyo,
  case
    when s.logo_data_url is null                then 'BOS — logo hic yuklenmemis'
    when s.logo_data_url like 'data:%'          then 'ESKI BICIM — satir icinde base64'
    when s.logo_data_url like 'http%/storage/%' then 'YENI BICIM — Storage adresi ✓'
    when s.logo_data_url like 'http%'           then 'https ama Storage disi'
    else 'beklenmeyen deger'
  end as logo_durumu,
  length(s.logo_data_url) as karakter_sayisi
from public.studios s
order by s.name;

-- Bucket'ta gercekten dosya var mi?
select
  coalesce(o.name, '(hic dosya yok)') as dosya,
  o.created_at
from storage.objects o
where o.bucket_id = 'formera-media'
order by o.created_at desc
limit 10;
