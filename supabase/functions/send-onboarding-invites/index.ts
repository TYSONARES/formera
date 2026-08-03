import { createClient } from 'npm:@supabase/supabase-js@2';

const allowedOrigins = new Set([
  'https://formera.me',
  'https://www.formera.me',
  'https://tysonares.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:5500'
]);

type InviteRole = 'trainer' | 'member';
type InvitePayload = { email?: unknown; fullName?: unknown; role?: unknown };

const text = (value: unknown, limit = 160) => String(value ?? '').trim().slice(0, limit);
const emailIsValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

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

  const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: auth, error: authError } = await authClient.auth.getUser();
  if (authError || !auth.user) return json(request, { error: 'Oturum doğrulanamadı.' }, 401);

  let body: { invites?: InvitePayload[] };
  try {
    body = await request.json();
  } catch {
    return json(request, { error: 'Geçersiz davet verisi.' }, 400);
  }

  const invites = (Array.isArray(body.invites) ? body.invites : [])
    .slice(0, 2)
    .map(invite => ({
      email: text(invite.email, 254).toLocaleLowerCase('tr-TR'),
      fullName: text(invite.fullName, 100),
      role: invite.role === 'trainer' ? 'trainer' as InviteRole : invite.role === 'member' ? 'member' as InviteRole : null
    }))
    .filter(invite => invite.role && emailIsValid(invite.email));
  if (!invites.length) return json(request, { error: 'Gönderilecek geçerli bir davet e-postası yok.' }, 422);

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: owner, error: ownerError } = await admin
    .from('profiles')
    .select('studio_id, full_name, role')
    .eq('auth_user_id', auth.user.id)
    .eq('role', 'owner')
    .maybeSingle();
  if (ownerError || !owner?.studio_id) return json(request, { error: 'Davet gönderme yetkin bulunmuyor.' }, 403);

  const appUrl = Deno.env.get('FORMERA_APP_URL') || 'https://formera.me';
  const results: Array<{ email: string; status: 'sent' | 'failed' }> = [];
  for (const invite of invites) {
    const redirectTo = new URL('/dashboard.html', appUrl);
    redirectTo.searchParams.set('invite', invite.role!);
    redirectTo.searchParams.set('email', invite.email);
    const { error } = await admin.auth.admin.inviteUserByEmail(invite.email, {
      redirectTo: redirectTo.toString(),
      data: {
        studio_id: owner.studio_id,
        invited_role: invite.role,
        invited_name: invite.fullName,
        invited_by: owner.full_name || 'İşletme yöneticisi'
      }
    });
    results.push({ email: invite.email, status: error ? 'failed' : 'sent' });
  }

  const sent = results.filter(result => result.status === 'sent').length;
  return json(request, { sent, failed: results.length - sent, results });
});
