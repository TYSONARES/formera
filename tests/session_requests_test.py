"""Üye self-servis seans talebi testi."""
import asyncio, json, sys, time
from playwright.async_api import async_playwright
BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT="https://stub.supabase.co"; REF="stub"
STUDIO="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; OWNER="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
MEMBER="cccccccc-cccc-4ccc-8ccc-cccccccccccc"
TABLES={"studios":[{"id":STUDIO,"name":"Test","initials":"TS","location":"Izmir","status":"Pilot","setup_completed":True,"accent_color":"#d9ff64","logo_data_url":None}],
 "profiles":[{"id":OWNER,"studio_id":STUDIO,"full_name":"Sahip","role":"owner","auth_user_id":"user-1","email":"o@x.co"}],
 "members":[{"id":MEMBER,"studio_id":STUDIO,"profile_id":None,"full_name":"Ali Veli","phone":"05551112233","email":"a@b.co","created_at":"2026-01-01T00:00:00Z"}],
 "programs":[],"sessions":[],"finance_entries":[],"signatures":[],"member_program_selections":[],
 "trainer_tasks":[],"member_tasks":[],"pilot_leads":[],"makeup_requests":[],"landing_leads":[],
 "body_measurements":[],"announcements":[],"session_requests":[]}
def blob(): return json.dumps({"access_token":"f","refresh_token":"f","token_type":"bearer","expires_in":3600,"expires_at":int(time.time())+3600,"user":{"id":"user-1","aud":"authenticated","email":"o@x.co","app_metadata":{},"user_metadata":{},"created_at":"2026-01-01T00:00:00Z"}})
async def main():
    results=[]; sr_writes=[]
    def check(n,ok,d=""): results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:50} {d}")
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
                if t=="session_requests": sr_writes.extend(body)
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

        # --- A) UYE talep olusturur ---
        ok=await pg.evaluate(f"""()=>{{
          state.backend.profile={{role:'member',id:'pm',full_name:'Ali Veli',email:'a@b.co'}};
          state.role='member';
          state.members=[normalizeMember({{id:{json.dumps(MEMBER)},profileId:'pm',name:'Ali Veli',email:'a@b.co',trainer:'Ece'}})];
          openSessionRequestModal();
          const f=document.querySelector('#sessionRequestForm'); if(!f) return false;
          f.elements.requestedDate.value='2026-09-05'; f.elements.requestedTime.value='18:30'; f.elements.note.value='Akşam olsun';
          return true;
        }}""")
        check("üye seans talebi modalı açıldı", ok)
        await pg.evaluate("()=>document.querySelector('#sessionRequestForm button[type=submit]').click()")
        await pg.wait_for_timeout(1200)
        check("session_requests'e yazma gitti", len(sr_writes)>0, f"({len(sr_writes)})")
        if sr_writes:
            w=sr_writes[-1]
            check("talep pending + member_id + tarih doğru",
                  w.get("status")=="pending" and w.get("member_id")==MEMBER and w.get("requested_date")=="2026-09-05")

        # --- B) ISLETMECI onaylar -> seans olusur ---
        res=await pg.evaluate("""()=>{
          state.backend.profile={role:'owner',id:'user-1',full_name:'Sahip'};
          state.role='owner'; state.workspace='studio';
          state.members=[normalizeMember({id:'"""+MEMBER+"""',name:'Ali Veli',trainer:'Ece'})];
          state.sessions=[];
          state.sessionRequests=[ normalizeSessionRequest({id:'dddddddd-dddd-4ddd-8ddd-ddddddddddd1',studioId:'x',memberId:'"""+MEMBER+"""',member:'Ali Veli',requestedDate:'2026-09-05',requestedTime:'18:30',status:'pending'}) ];
          const before=state.sessions.length;
          decideSessionRequest('dddddddd-dddd-4ddd-8ddd-ddddddddddd1','approved');
          return { seansOncesi:before, seansSonrasi:state.sessions.length, talepDurum:state.sessionRequests.find(r=>r.id==='dddddddd-dddd-4ddd-8ddd-ddddddddddd1')?.status };
        }""")
        check("onayda takvime seans eklendi", res["seansSonrasi"]==res["seansOncesi"]+1, f"({res['seansOncesi']}→{res['seansSonrasi']})")
        check("talep 'approved' oldu", res["talepDurum"]=="approved")
        await pg.wait_for_timeout(1200)
        check("onay session_requests'e yazıldı (approved)", any(w.get("status")=="approved" for w in sr_writes))

        # --- C) XSS: not alanina payload ---
        XSS='<img src=x onerror="window.__XSS=(window.__XSS||0)+1">'
        info=await pg.evaluate(f"""(XSS)=>{{
          window.__XSS=0;
          state.role='owner'; state.workspace='studio';
          state.sessionRequests=[ normalizeSessionRequest({{id:'r2',memberId:'{MEMBER}',member:'Ali',requestedDate:'2026-09-06',note:XSS,status:'pending'}}) ];
          const host=document.querySelector('#appContent'); host.innerHTML=ownerSessionRequestCard();
          return {{ fired:window.__XSS||0, injected: host.querySelectorAll('img[src=\\"x\\"]').length, kart: host.innerHTML.includes('Seans talepleri') }};
        }}""", XSS)
        check("işletmeci talep kartı render oldu", info["kart"])
        check("XSS: onerror tetiklenmedi", info["fired"]==0, f"(fired={info['fired']})")
        check("XSS: payload <img> oluşmadı", info["injected"]==0)
        await b.close()
    bad=[r for r in results if not r[1]]
    print(f"\n{'='*64}\ntoplam: {len(results)} | basarisiz: {len(bad)}")
    return 1 if bad else 0
sys.exit(asyncio.run(main()))
