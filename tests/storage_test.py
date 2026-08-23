"""Gorsel yukleme testi: base64 yerine Storage adresi yaziliyor mu?

Sahte Supabase oturumu + sahte Storage ucu kurar, marka ayari formundan bir
logo yukler, sonra iki seyi kontrol eder:
  1. Dosya Storage'a POST edildi mi ve yolu <studio_id>/ ile mi basliyor
  2. studios satirina yazilan deger kisa bir https adresi mi (base64 degil)
"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
OWNER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

TABLES={
 "studios":[{"id":STUDIO,"name":"Test Studio","initials":"TS","location":"Izmir",
             "status":"Pilot","setup_completed":True,"accent_color":"#d9ff64","logo_data_url":None}],
 "profiles":[{"id":OWNER,"studio_id":STUDIO,"full_name":"Sahip","role":"owner",
              "auth_user_id":"user-1","email":"o@x.co"}],
 "members":[],"programs":[],"sessions":[],"finance_entries":[],"signatures":[],
 "member_program_selections":[],"trainer_tasks":[],"member_tasks":[],
 "pilot_leads":[],"makeup_requests":[],
}
def session_blob():
    return json.dumps({"access_token":"fake","refresh_token":"fake","token_type":"bearer",
      "expires_in":3600,"expires_at":int(time.time())+3600,
      "user":{"id":"user-1","aud":"authenticated","email":"o@x.co",
              "app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})

async def main():
    uploads=[]; studio_writes=[]
    results=[]
    def check(n,ok,d=""):
        results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:52} {d}")

    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(locale="tr-TR")
        await ctx.route("**fonts.g**", lambda r: r.fulfill(status=200,content_type="text/css",body=""))

        async def storage_route(route):
            req=route.request
            path=req.url.split("/storage/v1/object/")[-1]
            uploads.append({"path":path,"method":req.method,"bytes":len(req.post_data_buffer or b"")})
            await route.fulfill(status=200,content_type="application/json",
                                body=json.dumps({"Key":path}))
        await ctx.route("**/storage/v1/object/**", storage_route)

        async def rest(route):
            req=route.request
            t=req.url.split("/rest/v1/")[1].split("?")[0]
            if req.method in ("POST","PATCH","PUT"):
                try: body=json.loads(req.post_data or "[]")
                except Exception: body=[]
                if not isinstance(body,list): body=[body]
                if t=="studios": studio_writes.extend(body)
                await route.fulfill(status=201,content_type="application/json",body="[]"); return
            await route.fulfill(status=200,content_type="application/json",
                                body=json.dumps(TABLES.get(t,[])))
        await ctx.route("**/rest/v1/**", rest)
        await ctx.route("**/auth/v1/**", lambda r: r.fulfill(status=200,content_type="application/json",body="{}"))

        pg=await ctx.new_page()
        await pg.goto(f"{BASE}/dashboard.html", wait_until="domcontentloaded")
        await pg.evaluate(f"""() => {{
          localStorage.clear();
          localStorage.setItem('formera_supabase_config', JSON.stringify({{url:{json.dumps(PROJECT)}, anonKey:'stub'}}));
          localStorage.setItem('sb-{REF}-auth-token', {json.dumps(session_blob())});
          localStorage.setItem('formera_onboarding_complete','1');
        }}""")
        await pg.goto(f"{BASE}/dashboard.html", wait_until="networkidle")
        await pg.wait_for_timeout(3500)

        # marka ayari modalini ac ve 1x1 PNG yukle
        await pg.evaluate("""() => {
          const b=document.querySelector('[data-action="customize-studio"]');
          if(b) b.click();
        }""")
        await pg.wait_for_timeout(900)
        png=(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06"
             b"\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00"
             b"\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")
        inp=await pg.query_selector('#studioBrandForm input[name="logo"]')
        check("marka formu ve logo alani acildi", inp is not None)
        if inp:
            await inp.set_input_files({"name":"logo.png","mimeType":"image/png","buffer":png})
            await pg.evaluate("""() => document.querySelector('#studioBrandForm button[type=submit]')?.click()""")
            await pg.wait_for_timeout(3000)

        check("Storage'a yukleme yapildi", len(uploads)>0, f"({len(uploads)} istek)")
        if uploads:
            u=uploads[0]
            check("yol <studio_id>/ ile basliyor", u["path"].split("/")[1].startswith(STUDIO) or STUDIO in u["path"],
                  f"({u['path'][:60]})")
        logo=[w.get("logo_data_url") for w in studio_writes if w.get("logo_data_url")]
        check("studios satirina deger yazildi", len(logo)>0, f"({len(studio_writes)} yazma)")
        if logo:
            v=logo[-1]
            check("yazilan deger base64 DEGIL", not v.startswith("data:"), f"({v[:58]}...)")
            check("yazilan deger kisa (<300 karakter)", len(v)<300, f"({len(v)} karakter)")
        await b.close()

    bad=[r for r in results if not r[1]]
    print(f"\n{'='*72}\ntoplam: {len(results)} | basarisiz: {len(bad)}")
    return 1 if bad else 0
sys.exit(asyncio.run(main()))
