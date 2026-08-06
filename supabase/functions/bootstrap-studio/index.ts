import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins = new Set([
  'https://formera.me',
  'https://www.formera.me',
  'https://tysonares.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
]);

const text = (value: unknown, limit = 160) => String(value ?? '').trim().slice(0, limit);

function headersFor(request: Request) {
  const origin = request.headers.get('origin') || '';
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://formera.me',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
    'Vary': 'Origin'
  };
}

function json(request: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: headersFor(request) });
}

Deno.serve(async request => {
  const headers = headersFor(request);
  const origin = request.headers.get('origin') || '';
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  if (request.method !== 'POST') return json(request, { error: 'Yalnızca POST isteği kabul edilir.' }, 405);
  if (origin && !allowedOrigins.has(origin)) return json(request, { error: 'Bu alan adından istek kabul edilmiyor.' }, 403);

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return json(request, { error: 'Oturum doğrulanamadı.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!supabaseUrl || !anonKey || !serviceRoleKey) return json(request, { error: 'Sunucu yapılandırması eksik.' }, 500);

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } }
  });
  const { data: auth, error: authError } = await authClient.auth.getUser();
  if (authError || !auth.user) return json(request, { error: 'Oturum doğrulanamadı.' }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(request, { error: 'Geçersiz kurulum verisi.' }, 400);
  }

  const name = text(payload.studioName, 100);
  if (name.length < 2) return json(request, { error: 'Stüdyo adı en az 2 karakter olmalı.' }, 422);
  const logoDataUrl = text(payload.logoDataUrl, 1_500_000);
  if (String(payload.logoDataUrl || '').length > 1_500_000) return json(request, { error: 'Logo dosyası çok büyük. Daha küçük bir görsel seç.' }, 413);

  const studioPatch = {
    name,
    initials: text(payload.initials, 4).toLocaleUpperCase('tr-TR') || name.slice(0, 2).toLocaleUpperCase('tr-TR'),
    location: text(payload.location, 140) || null,
    phone: text(payload.phone, 40) || null,
    address: text(payload.address, 360) || null,
    instagram: text(payload.instagram, 120) || null,
    logo_data_url: logoDataUrl || null,
    accent_color: '#d9ff64',
    status: 'Kurulum tamamlandı',
    setup_completed: true
  };
  const ownerName = text(payload.ownerName, 100) || text(auth.user.email?.split('@')[0], 100) || 'İşletme sahibi';
  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: existingProfile, error: existingError } = await admin
    .from('profiles')
    .select('id, studio_id, role, auth_user_id, full_name, email, phone, avatar_data_url, created_at')
    .eq('auth_user_id', auth.user.id)
    .maybeSingle();
  if (existingError) return json(request, { error: 'Mevcut profil kontrol edilemedi.' }, 500);

  if (existingProfile) {
    if (existingProfile.role !== 'owner' || !existingProfile.studio_id) {
      return json(request, { error: 'Bu hesap yeni işletme kurulumuna uygun değil.' }, 409);
    }
    const { data: studio, error: updateError } = await admin
      .from('studios')
      .update(studioPatch)
      .eq('id', existingProfile.studio_id)
      .select('*')
      .single();
    if (updateError) return json(request, { error: 'Stüdyo bilgileri güncellenemedi.' }, 500);
    return json(request, { studio, profile: existingProfile, existing: true });
  }

  const { data: studio, error: studioError } = await admin
    .from('studios')
    .insert(studioPatch)
    .select('*')
    .single();
  if (studioError || !studio) return json(request, { error: 'Stüdyo oluşturulamadı.' }, 500);

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .insert({
      studio_id: studio.id,
      full_name: ownerName,
      role: 'owner',
      email: auth.user.email || null,
      auth_user_id: auth.user.id
    })
    .select('*')
    .single();
  if (profileError || !profile) {
    await admin.from('studios').delete().eq('id', studio.id);
    return json(request, { error: 'İşletmeci profili oluşturulamadı.' }, 500);
  }

  return json(request, { studio, profile, existing: false }, 201);
});
