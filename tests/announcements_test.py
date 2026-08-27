"""Duyurular testi: işletmeci yayınlar → sunucuya gider; üye görür; XSS güvenli."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; OWNER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
TABLES={"studios":[{"id":STUDIO,"name":"Test","initials":"TS","location":"Izmir","status":"Pilot","setup_completed":True,"accent_color":"#d9ff64","logo_data_url":None}],
 "profiles":[{"id":OWNER,"studio_id":STUDIO,"full_name":"Sahip","role":"owner","auth_user_id":"user-1","email":"o@x.co"}],
 "members":[],"programs":[],"sessions":[],"finance_entries":[],"signatures":[],"member_program_selections":[],
 "trainer_tasks":[],"member_tasks":[],"pilot_leads":[],"makeup_requests":[],"landing_leads":[],"body_measurements":[],"announcements":[]}
def blob(): return json.dumps({"access_token":"f","refresh_token":"f","token_type":"bearer","expires_in":3600,"expires_at":int(time.time())+3600,"user":{"id":"user-1","aud":"authenticated","email":"o@x.co","app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})
async def main():
    results=[]; writes=[]
    def check(n,ok,d=""): results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:48} {d}")
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(locale="tr-TR",viewport={"width":1440,"height":1000})
        await ctx.route("**fonts.g**", lambda r:r.fulfill(status=200,content_type="text/css",body=""))
        async def rest(route):
            req=route.request; t=req.url.split("/rest/v1/")[1].split("?")[0]
            if req.method in ("POST","PATCH","PUT"):
                try: body=json.loads(req.post_data or "[]")
                except: body=[]
                if not isinstance(body,list): body=[body]
                if t=="announcements": writes.extend(body)
                await route.fulfill(status=201,content_type="application/json",body="[]"); return
            await route.fulfill(status=200,content_type="application/json",body=json.dumps(TABLES.get(t,[])))
        await ctx.route("**/rest/v1/**", rest)
        await ctx.route("**/auth/v1/**", lambda r:r.fulfill(status=200,content_type="application/json",body="{}"))
        await ctx.route("**/storage/v1/**", lambda r:r.fulfill(status=200,content_type="application/json",body="{}"))
        pg=await ctx.new_page()
        await pg.goto(f"{BASE}/dashboard.html",wait_until="domcontentloaded")
        await pg.evaluate(f"""()=>{{localStorage.clear();
          localStorage.setItem('formera_supabase_config',JSON.stringify({{url:{json.dumps(PROJECT)},anonKey:'stub'}}));
          localStorage.setItem('sb-{REF}-auth-token',{json.dumps(blob())});
          localStorage.setItem('formera_onboarding_complete','1');}}""")
        await pg.goto(f"{BASE}/dashboard.html",wait_until="networkidle")
        await pg.wait_for_timeout(3500)
        # isletmeci duyuru yayinlar
        ok=await pg.evaluate("""()=>{ openAnnouncementModal(); const f=document.querySelector('#announcementForm'); if(!f) return false;
          f.elements.title.value='Salon bakımı'; f.elements.body.value='Yarın 14:00-16:00 kapalı'; return true; }""")
        check("duyuru modalı açıldı+dolduruldu", ok)
        await pg.evaluate("""()=>document.querySelector('#announcementForm button[type=submit]').click()""")
        await pg.wait_for_timeout(1200)
        check("announcements'a yazma gitti", len(writes)>0, f"({len(writes)})")
        if writes:
            w=writes[-1]
            check("studio_id + başlık doğru", w.get("studio_id")==STUDIO and w.get("title")=='Salon bakımı')
        # uye gorunumu + XSS
        XSS='<img src=x onerror="window.__XSS=(window.__XSS||0)+1">'
        info=await pg.evaluate(f"""(XSS)=>{{
          window.__XSS=0;
          state.backend.profile={{role:'member',id:'pm',full_name:'Ali',email:'a@b.co'}};
          state.role='member';
          state.members=[normalizeMember({{id:'mm',profileId:'pm',name:'Ali',email:'a@b.co'}})];
          state.announcements=[normalizeAnnouncement({{id:'a1',title:XSS,body:XSS,createdAt:'2026-08-27T10:00:00Z'}})];
          const host=document.querySelector('#appContent'); host.innerHTML=memberDashboard();
          return {{ kart: host.innerHTML.includes('Duyurular'), fired:window.__XSS||0, injected: host.querySelectorAll('img[src=\\"x\\"]').length, escaped: host.innerHTML.includes('&lt;img') }};
        }}""", XSS)
        check("üye panelinde Duyurular kartı var", info["kart"])
        check("XSS: onerror tetiklenmedi", info["fired"]==0, f"(fired={info['fired']})")
        check("XSS: payload <img> oluşmadı", info["injected"]==0)
        check("XSS: metin olarak işlendi", info["escaped"])
        await b.close()
    bad=[r for r in results if not r[1]]
    print(f"\n{'='*62}\ntoplam: {len(results)} | basarisiz: {len(bad)}")
    return 1 if bad else 0
sys.exit(asyncio.run(main()))
