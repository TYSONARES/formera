"""Başarı rozetleri testi: taban çizgisinde kutlama yok; oturum içi yeni
rozette kutlama oynar; reduced-motion'da animasyon yerine toast; rozet
kaydı member_achievements'a POST edilir; kilo bazlı rozet tanımı yoktur."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
MEMBER_PROFILE="cccccccc-cccc-4ccc-8ccc-cccccccccccc"
MEMBER_ROW="dddddddd-dddd-4ddd-8ddd-dddddddddddd"
TABLES={"studios":[{"id":STUDIO,"name":"Test","initials":"TS","location":"Izmir","status":"Pilot","setup_completed":True,"accent_color":"#e39a4d","logo_data_url":None}],
 "profiles":[{"id":MEMBER_PROFILE,"studio_id":STUDIO,"full_name":"Selin Uye","role":"member","auth_user_id":"user-1","email":"m@x.co"}],
 "members":[{"id":MEMBER_ROW,"studio_id":STUDIO,"profile_id":MEMBER_PROFILE,"name":"Selin Uye","initials":"SU","trainer":"Ece","last_visit":"Bugün","sessions_used":5,"sessions_total":12,"status":"Aktif","status_type":"good","phone":"05320000001"}],
 # 5 tamamlanmış seans → taban çizgisinde ilk_adim + isinma_5 açılmalı.
 "sessions":[{"id":f"s{i}","studio_id":STUDIO,"member_id":MEMBER_ROW,"member":"Selin Uye","trainer":"Ece","program":"Genel PT","room":"Salon A","session_date":f"2026-09-{10+i:02d}","session_time":"18:00","status":"done"} for i in range(5)],
 "programs":[],"finance_entries":[],"signatures":[],"member_program_selections":[],
 "trainer_tasks":[],"member_tasks":[],"pilot_leads":[],"makeup_requests":[],"landing_leads":[],
 "body_measurements":[],"announcements":[],"session_requests":[],"member_achievements":[]}
def blob(): return json.dumps({"access_token":"f","refresh_token":"f","token_type":"bearer","expires_in":3600,"expires_at":int(time.time())+3600,"user":{"id":"user-1","aud":"authenticated","email":"m@x.co","app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})
async def main():
    results=[]; writes=[]
    def check(n,ok,d=""): results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:52} {d}")
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)
        async def make_ctx(reduced=False):
            ctx=await b.new_context(locale="tr-TR",viewport={"width":1440,"height":1000},reduced_motion="reduce" if reduced else "no-preference")
            async def rest(route):
                req=route.request; t=req.url.split("/rest/v1/")[1].split("?")[0]
                if req.method in ("POST","PATCH","PUT"):
                    try: body=json.loads(req.post_data or "[]")
                    except: body=[]
                    if not isinstance(body,list): body=[body]
                    if t=="member_achievements": writes.extend(body)
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
            return ctx,pg

        ctx,pg=await make_ctx()
        # 1) Kart + taban çizgisi rozetleri
        card=await pg.evaluate("""()=>{const h=[...document.querySelectorAll('h2')].find(x=>x.textContent==='Başarılarım'); return h? h.closest('article').innerText : ''}""")
        check("Başarılarım kartı üye panelinde", "Sıradaki bölüm" in card or "bölüm" in card)
        check("taban çizgisi: ilk_adim+isinma_5 kazanıldı", card.count("Kazanıldı")>=2, f"({card.count('Kazanıldı')})")
        burst=await pg.evaluate("()=>Boolean(document.querySelector('.achievement-burst'))")
        check("taban çizgisinde kutlama YOK", not burst)
        await pg.wait_for_timeout(800)
        check("rozetler sunucuya POST edildi", len(writes)>=2, f"({len(writes)})")
        # 2) Oturum içinde yeni rozet → kutlama animasyonu
        await pg.evaluate("""()=>{for(let i=0;i<10;i++) state.sessions.push(normalizeSession({member:'Selin Uye',date:'2026-09-0'+((i%7)+1),time:'18:00',status:'done'})); render();}""")
        await pg.wait_for_timeout(700)
        burst=await pg.evaluate("()=>Boolean(document.querySelector('.achievement-burst'))")
        check("yeni rozette kutlama animasyonu oynadı", burst)
        await pg.wait_for_timeout(3000)
        gone=await pg.evaluate("()=>!document.querySelector('.achievement-burst')")
        check("kutlama kendini temizledi", gone)
        await ctx.close()
        # 3) Reduced motion: animasyon yok, toast var
        writes.clear()
        ctx,pg=await make_ctx(reduced=True)
        await pg.evaluate("""()=>{for(let i=0;i<10;i++) state.sessions.push(normalizeSession({member:'Selin Uye',date:'2026-09-0'+((i%7)+1),time:'18:00',status:'done'})); render();}""")
        await pg.wait_for_timeout(700)
        burst=await pg.evaluate("()=>Boolean(document.querySelector('.achievement-burst'))")
        toast=await pg.evaluate("()=>document.querySelector('#toast')?.textContent || ''")
        check("reduced-motion: animasyon YOK", not burst)
        check("reduced-motion: toast ile bildirildi", "başarı" in toast.lower())
        # 4) Tanımlarda kilo/vücut hedefi rozeti yok (davranış bazlı ilke)
        defs=await pg.evaluate("()=>JSON.stringify(ACHIEVEMENT_DEFS)")
        check("kilo bazlı rozet tanımı yok", "kilo" not in defs.lower() and "weight" not in defs.lower())
        await ctx.close(); await b.close()
    fails=[n for n,ok in results if not ok]
    print(f"\n{len(results)-len(fails)}/{len(results)} kontrol geçti")
    sys.exit(1 if fails else 0)
asyncio.run(main())
