"""Antrenman defteri testi: set kaydı workout_logs'a doğru alanlarla POST
edilir; kişisel rekor tespit edilip toast gösterilir; dinlenme sayacı çalışır
ve yeniden çizimde sürer; hareket adındaki XSS payload'ı element olmaz."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
MEMBER_PROFILE="cccccccc-cccc-4ccc-8ccc-cccccccccccc"
MEMBER_ROW="dddddddd-dddd-4ddd-8ddd-dddddddddddd"
TABLES={"studios":[{"id":STUDIO,"name":"Test","initials":"TS","location":"Izmir","status":"Pilot","setup_completed":True,"accent_color":"#e39a4d","logo_data_url":None}],
 "profiles":[{"id":MEMBER_PROFILE,"studio_id":STUDIO,"full_name":"Selin Uye","role":"member","auth_user_id":"user-1","email":"m@x.co"}],
 "members":[{"id":MEMBER_ROW,"studio_id":STUDIO,"profile_id":MEMBER_PROFILE,"name":"Selin Uye","initials":"SU","trainer":"Ece","last_visit":"Bugün","sessions_used":2,"sessions_total":12,"status":"Aktif","status_type":"good","phone":"05320000001"}],
 "sessions":[],"programs":[],"finance_entries":[],"signatures":[],"member_program_selections":[],
 "trainer_tasks":[],"member_tasks":[],"pilot_leads":[],"makeup_requests":[],"landing_leads":[],
 "body_measurements":[],"announcements":[],"session_requests":[],"member_achievements":[],"workout_logs":[]}
def blob(): return json.dumps({"access_token":"f","refresh_token":"f","token_type":"bearer","expires_in":3600,"expires_at":int(time.time())+3600,"user":{"id":"user-1","aud":"authenticated","email":"m@x.co","app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})
async def main():
    results=[]; writes=[]
    def check(n,ok,d=""): results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:52} {d}")
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(locale="tr-TR",viewport={"width":1440,"height":1000})
        async def rest(route):
            req=route.request; t=req.url.split("/rest/v1/")[1].split("?")[0]
            if req.method in ("POST","PATCH","PUT"):
                try: body=json.loads(req.post_data or "[]")
                except: body=[]
                if not isinstance(body,list): body=[body]
                if t=="workout_logs": writes.extend(body)
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
        check("defter kartı üye panelinde", await pg.locator("h2", has_text="Antrenman defterim").count()==1)
        async def add_set(ex,reps,kg):
            await pg.fill('#wlExercise',ex); await pg.fill('#wlReps',str(reps)); await pg.fill('#wlWeight',str(kg))
            await pg.locator('[data-action="add-workout-set"]').click(); await pg.wait_for_timeout(700)
        await add_set("Goblet squat",10,40)
        row=[w for w in writes if w.get("exercise")=="Goblet squat"]
        check("set workout_logs'a POST edildi", len(row)>=1)
        check("alanlar doğru", bool(row) and row[0].get("reps")==10 and float(row[0].get("weight_kg"))==40 and row[0].get("member_id")==MEMBER_ROW)
        await add_set("Goblet squat",8,45)
        toast=await pg.evaluate("()=>document.querySelector('#toast')?.textContent || ''")
        check("kişisel rekor toastı", "rekor" in toast.lower(), toast[:40])
        body=await pg.locator("body").inner_text()
        check("rekor satırı görünür", "Rekor 45" in body)
        await pg.locator('[data-action="rest-timer"][data-seconds="60"]').click()
        await pg.wait_for_timeout(2200)
        t=await pg.locator('#restTimerDisplay').inner_text()
        check("dinlenme sayacı geriye sayıyor", t.startswith("0:5"), t)
        await pg.evaluate("render()"); await pg.wait_for_timeout(1200)
        t2=await pg.locator('#restTimerDisplay').inner_text()
        check("sayaç yeniden çizimde sürüyor", t2!="Hazır" and t2!=t, t2)
        await add_set("<img src=x onerror=window.__xss=1>",5,10)
        ok=await pg.evaluate("()=>!window.__xss && document.querySelectorAll('img[src=\"x\"]').length===0")
        check("hareket adındaki XSS element olmadı", ok)
        await ctx.close(); await b.close()
    fails=[n for n,ok in results if not ok]
    print(f"\n{len(results)-len(fails)}/{len(results)} kontrol geçti")
    sys.exit(1 if fails else 0)
asyncio.run(main())
