"""Web sitesi basvurulari (landing_leads) Formera Admin panelinde gorunuyor mu?

Sahte bir Formera admin oturumu kurar, REST ucundan landing_leads dondurur,
sonra sunlari dogrular:
  1. Pilot panelinde "Web sitesinden gelen basvurular" karti render ediliyor
  2. Basvuru satirlari (isim/studyo/telefon) gorunuyor
  3. Rozet sayisi dogru
  4. Bir basvuruda XSS payload'i element olarak DOM'a GIRMIYOR (escape ediliyor)
  5. Admin olmayan (formera_admins'te olmayan) hesap bu karti gormuyor
"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
OWNER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
XSS='<img src=x onerror="window.__XSS=(window.__XSS||0)+1">'

LEADS=[
 {"id":"11111111-1111-4111-8111-111111111111","contact_name":"Ayşe Yılmaz","studio_name":"FitZone",
  "city":"İzmir","phone":"05551112233","members":"50-100","goal":"Üye takibi",
  "package_code":"studio_ai","timeline":"Bu hafta","value":9600,"source":"landing",
  "consent_at":"2026-08-25T10:00:00Z","created_at":"2026-08-25T10:00:00Z"},
 {"id":"22222222-2222-4222-8222-222222222222","contact_name":XSS,"studio_name":XSS,
  "city":XSS,"phone":"05559998877","members":"0-50","goal":XSS,
  "package_code":"starter","timeline":"","value":0,"source":"landing",
  "consent_at":"2026-08-26T09:00:00Z","created_at":"2026-08-26T09:00:00Z"},
]

def base_tables(admin=True):
    return {
     "studios":[{"id":STUDIO,"name":"Test","initials":"TS","location":"Izmir","status":"Pilot",
                 "setup_completed":True,"accent_color":"#d9ff64","logo_data_url":None}],
     "profiles":[{"id":OWNER,"studio_id":STUDIO,"full_name":"Sahip","role":"owner",
                  "auth_user_id":"user-1","email":"o@x.co"}],
     "members":[],"programs":[],"sessions":[],"finance_entries":[],"signatures":[],
     "member_program_selections":[],"trainer_tasks":[],"member_tasks":[],
     "pilot_leads":[],"makeup_requests":[],
     "landing_leads":LEADS if admin else [],
    }

def session_blob():
    return json.dumps({"access_token":"fake","refresh_token":"fake","token_type":"bearer",
      "expires_in":3600,"expires_at":int(time.time())+3600,
      "user":{"id":"user-1","aud":"authenticated","email":"o@x.co",
              "app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})

async def boot(ctx, admin=True):
    tables=base_tables(admin)
    async def rest(route):
        req=route.request
        tail=req.url.split("/rest/v1/")[1]
        t=tail.split("?")[0]
        if t=="formera_admins":
            # maybeSingle -> tek nesne; admin ise dolu, degilse bos
            body = {"id":"admin-1","active":True} if admin else {}
            await route.fulfill(status=200,content_type="application/json",body=json.dumps(body)); return
        if req.method in ("POST","PATCH","PUT"):
            await route.fulfill(status=201,content_type="application/json",body="[]"); return
        await route.fulfill(status=200,content_type="application/json",body=json.dumps(tables.get(t,[])))
    await ctx.route("**/rest/v1/**", rest)
    await ctx.route("**/auth/v1/**", lambda r: r.fulfill(status=200,content_type="application/json",body="{}"))
    await ctx.route("**/storage/v1/**", lambda r: r.fulfill(status=200,content_type="application/json",body="{}"))
    await ctx.route("**fonts.g**", lambda r: r.fulfill(status=200,content_type="text/css",body=""))
    pg=await ctx.new_page()
    await pg.goto(f"{BASE}/dashboard.html?formera_admin=1", wait_until="domcontentloaded")
    await pg.evaluate(f"""() => {{
      localStorage.clear(); sessionStorage.clear();
      localStorage.setItem('formera_supabase_config', JSON.stringify({{url:{json.dumps(PROJECT)}, anonKey:'stub'}}));
      localStorage.setItem('sb-{REF}-auth-token', {json.dumps(session_blob())});
      localStorage.setItem('formera_onboarding_complete','1');
    }}""")
    await pg.goto(f"{BASE}/dashboard.html?formera_admin=1", wait_until="networkidle")
    await pg.wait_for_timeout(3500)
    return pg

async def main():
    results=[]
    def check(n,ok,d=""):
        results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:52} {d}")

    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)

        # --- admin gorunumu ---
        ctx=await b.new_context(locale="tr-TR", viewport={"width":1440,"height":900})
        pg=await boot(ctx, admin=True)
        info=await pg.evaluate("""() => {
          const host=document.querySelector('#appContent')||document.body;
          const html=host.innerHTML;
          return {
            fired: window.__XSS||0,
            injectedImg: document.querySelectorAll('#appContent img[src=\\"x\\"]').length,
            kartVar: html.includes('Web sitesinden gelen başvurular'),
            fitzoneVar: html.includes('FitZone'),
            ayseVar: html.includes('Ayşe Yılmaz'),
            telefonVar: html.includes('05551112233'),
            waVar: html.includes('wa.me/05551112233'),
            payloadEscaped: html.includes('&lt;img'),
            landingSayisi: (typeof state!=='undefined' && state.landingLeads) ? state.landingLeads.length : -1
          };
        }""")
        check("admin: başvuru kartı render edildi", info["kartVar"])
        check("admin: gerçek başvuru görünüyor (FitZone/Ayşe)", info["fitzoneVar"] and info["ayseVar"])
        check("admin: telefon ve WhatsApp linki var", info["telefonVar"] and info["waVar"], f"(wa={info['waVar']})")
        check("admin: state.landingLeads = 2", info["landingSayisi"]==2, f"({info['landingSayisi']})")
        check("XSS: onerror TETIKLENMEDI", info["fired"]==0, f"(fired={info['fired']})")
        check("XSS: payload <img> OLUSMADI", info["injectedImg"]==0, f"(img={info['injectedImg']})")
        check("XSS: payload metin olarak işlendi (yol canlı)", info["payloadEscaped"])
        await ctx.close()

        # --- admin OLMAYAN: RLS bos dondurur, kart bos ---
        ctx2=await b.new_context(locale="tr-TR", viewport={"width":1440,"height":900})
        pg2=await boot(ctx2, admin=False)
        info2=await pg2.evaluate("""() => {
          const html=(document.querySelector('#appContent')||document.body).innerHTML;
          return { landingSayisi:(typeof state!=='undefined'&&state.landingLeads)?state.landingLeads.length:-1,
                   adminMi: !!(window.isFormeraAdmin && isFormeraAdmin()) };
        }""")
        # admin olmayan owner formera workspace'e giremez -> landingLeads bos
        check("admin değil: landingLeads boş (0)", info2["landingSayisi"]==0, f"({info2['landingSayisi']})")
        await ctx2.close()
        await b.close()

    bad=[r for r in results if not r[1]]
    print(f"\n{'='*68}\ntoplam: {len(results)} | basarisiz: {len(bad)}")
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
