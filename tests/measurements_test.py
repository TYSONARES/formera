"""Vücut ölçümü (İlerleme takibi) testi.

İki şeyi doğrular:
  A) İşletmeci bir üyeye ölçüm kaydeder → body_measurements'a doğru alanlarla
     PATCH/POST gider (studio_id, member_id, weight_kg vb.).
  B) Render katmanı: üyenin panelinde 'İlerlemem' kartı ölçümlerle + SVG
     grafikle çıkar; XSS payload'ı element olmaz (nota kötü veri konsa bile).
"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
OWNER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
MEMBER="cccccccc-cccc-4ccc-8ccc-cccccccccccc"

TABLES={
 "studios":[{"id":STUDIO,"name":"Test","initials":"TS","location":"Izmir","status":"Pilot",
             "setup_completed":True,"accent_color":"#d9ff64","logo_data_url":None}],
 "profiles":[{"id":OWNER,"studio_id":STUDIO,"full_name":"Sahip","role":"owner","auth_user_id":"user-1","email":"o@x.co"}],
 "members":[{"id":MEMBER,"studio_id":STUDIO,"profile_id":None,"full_name":"Ali Veli",
             "phone":"05551112233","email":"a@b.co","created_at":"2026-01-01T00:00:00Z"}],
 "programs":[],"sessions":[],"finance_entries":[],"signatures":[],
 "member_program_selections":[],"trainer_tasks":[],"member_tasks":[],
 "pilot_leads":[],"makeup_requests":[],"landing_leads":[],"body_measurements":[],
}
def blob():
    return json.dumps({"access_token":"f","refresh_token":"f","token_type":"bearer",
      "expires_in":3600,"expires_at":int(time.time())+3600,
      "user":{"id":"user-1","aud":"authenticated","email":"o@x.co","app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})

async def main():
    results=[]; writes=[]
    def check(n,ok,d=""):
        results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:50} {d}")
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(locale="tr-TR", viewport={"width":1440,"height":1000})
        await ctx.route("**fonts.g**", lambda r: r.fulfill(status=200,content_type="text/css",body=""))
        async def rest(route):
            req=route.request; t=req.url.split("/rest/v1/")[1].split("?")[0]
            if req.method in ("POST","PATCH","PUT"):
                try: body=json.loads(req.post_data or "[]")
                except Exception: body=[]
                if not isinstance(body,list): body=[body]
                if t=="body_measurements": writes.extend(body)
                await route.fulfill(status=201,content_type="application/json",body="[]"); return
            await route.fulfill(status=200,content_type="application/json",body=json.dumps(TABLES.get(t,[])))
        await ctx.route("**/rest/v1/**", rest)
        await ctx.route("**/auth/v1/**", lambda r: r.fulfill(status=200,content_type="application/json",body="{}"))
        await ctx.route("**/storage/v1/**", lambda r: r.fulfill(status=200,content_type="application/json",body="{}"))
        pg=await ctx.new_page()
        await pg.goto(f"{BASE}/dashboard.html", wait_until="domcontentloaded")
        await pg.evaluate(f"""() => {{ localStorage.clear();
          localStorage.setItem('formera_supabase_config', JSON.stringify({{url:{json.dumps(PROJECT)}, anonKey:'stub'}}));
          localStorage.setItem('sb-{REF}-auth-token', {json.dumps(blob())});
          localStorage.setItem('formera_onboarding_complete','1'); }}""")
        await pg.goto(f"{BASE}/dashboard.html?page=members", wait_until="networkidle")
        await pg.wait_for_timeout(3500)

        # --- A) isletmeci olcum kaydeder ---
        opened = await pg.evaluate(f"""() => {{
          const m = state.members.find(x=>x.id==={json.dumps(MEMBER)}) || state.members[0];
          if(!m) return false;
          openMeasurementModal(m);
          const f=document.querySelector('#measurementForm'); if(!f) return false;
          f.elements.weight.value='80'; f.elements.waist.value='95'; f.elements.bodyFat.value='24';
          return true;
        }}""")
        check("ölçüm modalı açıldı ve dolduruldu", opened)
        await pg.evaluate("""() => document.querySelector('#measurementForm button[type=submit]').click()""")
        await pg.wait_for_timeout(1500)
        check("body_measurements'a yazma gitti", len(writes)>0, f"({len(writes)} yazma)")
        if writes:
            w=writes[-1]
            check("yazma studio_id + member_id içeriyor", w.get("studio_id")==STUDIO and w.get("member_id")==MEMBER)
            check("weight_kg=80, waist_cm=95, body_fat_pct=24",
                  str(w.get("weight_kg"))=="80" and str(w.get("waist_cm"))=="95" and str(w.get("body_fat_pct"))=="24",
                  f"(w={w.get('weight_kg')},bel={w.get('waist_cm')},yag={w.get('body_fat_pct')})")

        # --- B) render katmani: uye panelinde ilerleme karti + grafik + XSS ---
        XSS='<img src=x onerror="window.__XSS=(window.__XSS||0)+1">'
        info=await pg.evaluate(f"""(XSS) => {{
          window.__XSS=0;
          state.backend.profile={{role:'member',id:'prof-m',full_name:'Ali Veli',email:'a@b.co'}};
          state.role='member';
          state.members=[ normalizeMember({{id:{json.dumps(MEMBER)},profileId:'prof-m',name:'Ali Veli',email:'a@b.co'}}) ];
          state.measurements=[
            normalizeMeasurement({{id:'m1',memberId:{json.dumps(MEMBER)},measuredOn:'2026-06-01',weight:85,waist:98,note:XSS}}),
            normalizeMeasurement({{id:'m2',memberId:{json.dumps(MEMBER)},measuredOn:'2026-07-01',weight:82}}),
            normalizeMeasurement({{id:'m3',memberId:{json.dumps(MEMBER)},measuredOn:'2026-08-01',weight:80,bodyFat:24}})
          ];
          const host=document.querySelector('#appContent');
          host.innerHTML = memberDashboard();
          return {{
            kart: host.innerHTML.includes('İlerlemem'),
            grafik: host.querySelectorAll('svg.progress-spark').length,
            kilo80: host.innerHTML.includes('80 kg'),
            degisim: host.innerHTML.includes('-5 kg'),
            fired: window.__XSS||0,
            injected: host.querySelectorAll('img[src=\\"x\\"]').length
          }};
        }}""", XSS)
        check("üye panelinde 'İlerlemem' kartı var", info["kart"])
        check("SVG kilo grafiği çizildi", info["grafik"]==1, f"({info['grafik']})")
        check("son kilo 80 kg görünüyor", info["kilo80"])
        check("değişim -5 kg hesaplandı (85→80)", info["degisim"])
        check("XSS: onerror tetiklenmedi", info["fired"]==0, f"(fired={info['fired']})")
        check("XSS: payload <img> oluşmadı", info["injected"]==0, f"(img={info['injected']})")
        await b.close()

    bad=[r for r in results if not r[1]]
    print(f"\n{'='*66}\ntoplam: {len(results)} | basarisiz: {len(bad)}")
    return 1 if bad else 0
sys.exit(asyncio.run(main()))
