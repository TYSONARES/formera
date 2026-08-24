"""Isletme bilgileri kaydi gercekten sunucuya gidiyor mu?

Panel `studios` satirini upsert ile yaziyordu. PostgREST upsert'i
`insert ... on conflict do update` uretiyor; studios uzerinde INSERT
politikasi olmadigi icin Postgres bunu RLS ile reddediyordu. Ekranda
"guncellendi" yaziyor, sunucuda hicbir sey degismiyordu.

Bu test uc seyi olcer:
  1. studios yazmasi PATCH mi (POST/upsert degil)
  2. PATCH `id=eq.<studio_id>` ile tek satiri hedefliyor mu
  3. Sunucu yazmayi reddederse kullanici bunu GORUYOR mu ve satir kirli kalip
     bir sonraki kayitta tekrar deneniyor mu
"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
OWNER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"

TABLES={
 "studios":[{"id":STUDIO,"name":"Test Studio","initials":"TS","location":"Izmir",
             "status":"Pilot","setup_completed":True,"accent_color":"#d9ff64",
             "logo_data_url":None,"phone":None,"address":None,"instagram":None,
             "whatsapp":None,"website":None,"map_url":None}],
 "profiles":[{"id":OWNER,"studio_id":STUDIO,"full_name":"Sahip","role":"owner",
              "auth_user_id":"user-1","email":"o@x.co"}],
 "members":[],"programs":[],"sessions":[],"finance_entries":[],"signatures":[],
 "member_program_selections":[],"trainer_tasks":[],"member_tasks":[],
 "pilot_leads":[],"makeup_requests":[],
}
RLS_ERROR=json.dumps({"code":"42501",
  "message":'new row violates row-level security policy for table "studios"'})

def session_blob():
    return json.dumps({"access_token":"fake","refresh_token":"fake","token_type":"bearer",
      "expires_in":3600,"expires_at":int(time.time())+3600,
      "user":{"id":"user-1","aud":"authenticated","email":"o@x.co",
              "app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})

async def boot(ctx, studio_writes, reject):
    async def rest(route):
        req=route.request
        tail=req.url.split("/rest/v1/")[1]
        t=tail.split("?")[0]
        if req.method in ("POST","PATCH","PUT"):
            try: body=json.loads(req.post_data or "[]")
            except Exception: body=[]
            if not isinstance(body,list): body=[body]
            if t=="studios":
                studio_writes.append({"method":req.method,"query":tail,
                                      "prefer":req.headers.get("prefer",""),"body":body})
                if reject():
                    await route.fulfill(status=403,content_type="application/json",
                                        body=RLS_ERROR); return
            await route.fulfill(status=201,content_type="application/json",body="[]"); return
        await route.fulfill(status=200,content_type="application/json",
                            body=json.dumps(TABLES.get(t,[])))
    await ctx.route("**/rest/v1/**", rest)
    await ctx.route("**/storage/v1/object/**", lambda r: r.fulfill(
        status=200,content_type="application/json",body=json.dumps({"Key":"x"})))
    await ctx.route("**/auth/v1/**", lambda r: r.fulfill(
        status=200,content_type="application/json",body="{}"))
    await ctx.route("**fonts.g**", lambda r: r.fulfill(status=200,content_type="text/css",body=""))

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
    return pg

async def save_phone(pg, value):
    await pg.evaluate("""() => document.querySelector('[data-action="customize-studio"]')?.click()""")
    await pg.wait_for_timeout(800)
    ok=await pg.evaluate("""(v) => {
      const f=document.querySelector('#studioBrandForm'); if(!f) return false;
      const el=f.querySelector('[name="phone"]'); if(!el) return false;
      el.value=v; f.querySelector('button[type=submit]')?.click(); return true;
    }""", value)
    await pg.wait_for_timeout(2500)
    return ok

async def main():
    results=[]
    def check(n,ok,d=""):
        results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:56} {d}")

    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)

        # --- 1) mutlu yol -------------------------------------------------
        writes=[]
        ctx=await b.new_context(locale="tr-TR")
        pg=await boot(ctx, writes, lambda: False)
        check("marka formu acildi ve telefon kaydedildi", await save_phone(pg,"05551112233"))
        check("studios'a yazma yapildi", len(writes)>0, f"({len(writes)} istek)")
        if writes:
            w=writes[-1]
            check("yontem PATCH (upsert/POST degil)", w["method"]=="PATCH", f"({w['method']})")
            check("tek satiri hedefliyor: id=eq.<studio>", f"id=eq.{STUDIO}" in w["query"],
                  f"({w['query'][:60]})")
            check("merge-duplicates istenmiyor",
                  "merge-duplicates" not in w["prefer"].lower(), f"(prefer: {w['prefer'] or '-'})")
            check("govdede telefon var", any(r.get("phone")=="05551112233" for r in w["body"]))
            check("govdede id yok (filtreye tasindi)", all("id" not in r for r in w["body"]))
        await ctx.close()

        # --- 2) sunucu reddederse -----------------------------------------
        writes2=[]; rejecting=[True]
        ctx2=await b.new_context(locale="tr-TR")
        pg2=await boot(ctx2, writes2, lambda: rejecting[0])
        await save_phone(pg2,"05559998877")
        toast=await pg2.evaluate("""() => {
          const t=document.querySelector('#toast');
          return {gorunur: t?.classList.contains('show')||false, metin: t?.textContent||''};
        }""")
        check("red gorunur bir uyari uretiyor", toast["gorunur"], f"({toast['metin'][:52]})")
        check("uyari RLS hatasini soyluyor",
              "row-level security" in toast["metin"] or "row level" in toast["metin"])
        before=len(writes2)
        rejecting[0]=False
        await save_phone(pg2,"05559998877")
        check("reddedilen satir kirli kalip tekrar deneniyor", len(writes2)>before,
              f"({before} -> {len(writes2)})")
        await ctx2.close()
        await b.close()

    bad=[r for r in results if not r[1]]
    print(f"\n{'='*76}\ntoplam: {len(results)} | basarisiz: {len(bad)}")
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
