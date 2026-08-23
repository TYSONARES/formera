"""Cikis sonrasi kisisel veri sizintisi testi.

Sahte bir Supabase oturumuyla giris yapar, uye adi/telefon/e-posta render
edildigini dogrular, sonra cikis yapip ayni verilerin ekranda VE localStorage'da
kalmadigini kontrol eder. Sayfa yenilendikten sonra da kontrol eder.
"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
OWNER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
MEMBER="cccccccc-cccc-4ccc-8ccc-cccccccccccc"

# Ekranda/depoda aranacak benzersiz kisisel veriler
PII_NAME="Zeynep Kisisel Veri"
PII_PHONE="05559998877"
PII_MAIL="zeynep.gizli@ornek.co"

TABLES={
 "studios":[{"id":STUDIO,"name":"Gizli Studio","initials":"GS","location":"Izmir",
             "status":"Pilot","setup_completed":True,"accent_color":"#d9ff64"}],
 "profiles":[{"id":OWNER,"studio_id":STUDIO,"full_name":"Sahip","role":"owner",
              "auth_user_id":"user-1","email":"sahip@ornek.co"}],
 "members":[{"id":MEMBER,"studio_id":STUDIO,"full_name":PII_NAME,"initials":"ZK",
             "phone":PII_PHONE,"email":PII_MAIL,"sessions_used":3,"sessions_total":12,
             "status":"Aktif","risk_type":"good","profile_id":None,"trainer_profile_id":None}],
 "programs":[],"sessions":[],"finance_entries":[],"signatures":[],
 "member_program_selections":[],"trainer_tasks":[],"member_tasks":[],
 "pilot_leads":[],"makeup_requests":[],
}

def session_blob():
    return json.dumps({"access_token":"fake","refresh_token":"fake","token_type":"bearer",
      "expires_in":3600,"expires_at":int(time.time())+3600,
      "user":{"id":"user-1","aud":"authenticated","email":"sahip@ornek.co",
              "app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})

SCAN="""() => {
  const body = document.body.innerText;
  let store = '';
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    store += k + '=' + (localStorage.getItem(k)||'') + '\\n';
  }
  return {body, store};
}"""

async def main():
    results=[]
    def check(name, ok, detail=""):
        results.append((name,ok,detail))
        print(f"  [{'OK  ' if ok else 'SIZINTI'}] {name:52} {detail}")

    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(locale="tr-TR")
        await ctx.route("**fonts.g**", lambda r: r.fulfill(status=200,content_type="text/css",body=""))
        async def rest(route):
            t=route.request.url.split("/rest/v1/")[1].split("?")[0]
            if route.request.method in ("POST","PATCH","PUT"):
                await route.fulfill(status=201,content_type="application/json",body="[]"); return
            await route.fulfill(status=200,content_type="application/json",
                                body=json.dumps(TABLES.get(t,[])))
        await ctx.route("**/rest/v1/**", rest)
        await ctx.route("**/auth/v1/**", lambda r: r.fulfill(status=200,content_type="application/json",body="{}"))
        pg=await ctx.new_page()

        await pg.goto(f"{BASE}/dashboard.html", wait_until="domcontentloaded")
        await pg.evaluate(f"""() => {{
          localStorage.clear();
          localStorage.setItem('formera_supabase_config', JSON.stringify(
            {{url:{json.dumps(PROJECT)}, anonKey:'stub'}}));
          localStorage.setItem('sb-{REF}-auth-token', {json.dumps(session_blob())});
          localStorage.setItem('formera_onboarding_complete','1');
        }}""")

        # --- giris ---
        await pg.goto(f"{BASE}/dashboard.html?page=members", wait_until="networkidle")
        await pg.wait_for_timeout(3500)
        s=await pg.evaluate(SCAN)
        check("giris sonrasi uye adi ekranda (beklenen)", PII_NAME in s["body"])

        # --- cikis ---
        did=await pg.evaluate("""() => {
          const b=document.querySelector('#logoutSupabase');
          if(!b) return 'buton yok';
          b.click(); return 'tiklandi';
        }""")
        await pg.wait_for_timeout(2500)
        s=await pg.evaluate(SCAN)
        print(f"     (cikis: {did})")
        check("cikis sonrasi ad ekranda YOK", PII_NAME not in s["body"])
        check("cikis sonrasi telefon ekranda YOK", PII_PHONE not in s["body"])
        check("cikis sonrasi ad localStorage'da YOK", PII_NAME not in s["store"])
        check("cikis sonrasi e-posta localStorage'da YOK", PII_MAIL not in s["store"])

        # --- yenileme sonrasi ---
        await pg.goto(f"{BASE}/dashboard.html?page=members", wait_until="networkidle")
        await pg.wait_for_timeout(3000)
        s=await pg.evaluate(SCAN)
        check("yenileme sonrasi ad ekranda YOK", PII_NAME not in s["body"])
        check("yenileme sonrasi telefon ekranda YOK", PII_PHONE not in s["body"])
        await b.close()

    bad=[r for r in results if not r[1]]
    print(f"\n{'='*72}\ntoplam: {len(results)} | sizinti: {len(bad)}")
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
