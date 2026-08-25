"""Render sinki XSS regresyon testi (uye programi + AI notlari).

xss_test.py demo modda "giris yapmis belirli uye"yi taklit edemedigi icin
uyenin 'Bugunku program' gorunumunu (app.js: memberDashboard) hic tetiklemiyor;
orada program.title/goal/level dogrudan innerHTML'e giriyordu. Ayni sekilde
rapor/ekip/antrenor AI notlari, icine uye ve antrenor adini gomup esc'siz
basiyordu.

Bu test state'i dogrudan kurar (giris yapmis uye + atanmis program + riskli
uyeler + yogun antrenor), gercek render fonksiyonlarini CANLI DOM'a basar ve
XSS payload'inin element olarak olusup olusmadigini / onerror'in tetiklenip
tetiklenmedigini olcer.
"""
import asyncio, sys, json
from playwright.async_api import async_playwright

BASE="http://127.0.0.1:8899"; CHROME="/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
P='<img src=x onerror="window.__XSS=(window.__XSS||0)+1">'

SETUP = """(P) => {
  window.__XSS = 0;
  // Giris yapmis belirli bir uye
  state.backend.profile = { role:'member', id:'prof-1', full_name:P, email:'m@x.co' };
  state.role = 'member';
  state.members = [ normalizeMember({ id:'m1', profileId:'prof-1', name:P, email:'m@x.co',
    trainer:P, dietitian:'Atanmadı', sessions:'2 / 12', status:'Yenileme riski', type:'risk',
    last:'2026-08-01' }) ];
  // Ayni uyeye, basligi/hedefi/seviyesi payload olan bir program atanmis
  state.programs = [ normalizeProgram({ id:'pr1', title:P, goal:P, level:P, duration:40,
    assigned:P, exercises:['squat'] }) ];
  state.programSelections = { [P]: 'pr1' };
  // Ekip: yogun bir antrenor (adi payload) -> teamAiNotes / trainer kocu
  state.team = [ normalizeTrainer({ id:'t1', name:P, accountRole:'trainer', role:'PT Coach',
    specialty:'x', phone:'5', email:'t@x.co' }) ];
  state.trainerName = P;
}"""

async def render_and_check(page, fn):
    return await page.evaluate("""(fn) => {
      window.__XSS = 0;
      const host = document.querySelector('#appContent') || document.body;
      let html='';
      try { html = window[fn](); } catch(e){ return {error:String(e)}; }
      host.innerHTML = html;               // canli DOM -> onerror gercekten tetiklenir
      return {
        fired: window.__XSS || 0,
        injectedImg: document.querySelectorAll('#appContent img[src="x"]').length,
        payloadEscaped: host.innerHTML.includes('&lt;img'),
        len: html.length
      };
    }""", fn)

async def main():
    results=[]
    def check(n, ok, d=""):
        results.append((n,ok)); print(f"  [{'OK  ' if ok else 'FAIL'}] {n:46} {d}")

    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME)
        ctx=await b.new_context(locale="tr-TR", viewport={"width":1440,"height":900})
        await ctx.route("**fonts.g**", lambda r: r.fulfill(status=200,content_type="text/css",body=""))
        page=await ctx.new_page()
        await page.goto(f"{BASE}/dashboard.html", wait_until="networkidle")
        await page.evaluate(SETUP, P)

        for fn, need_payload in [("memberDashboard", True), ("reportsPage", False),
                                 ("teamPage", False), ("trainerDashboard", False)]:
            r = await render_and_check(page, fn)
            if r.get("error"):
                check(f"{fn} render edildi", False, r["error"][:60]); continue
            check(f"{fn}: onerror TETIKLENMEDI", r["fired"]==0, f"(fired={r['fired']})")
            check(f"{fn}: payload <img> OLUSMADI", r["injectedImg"]==0, f"(img={r['injectedImg']})")
            if need_payload:
                # Bu yolun gercekten payload'i isledigini kanitla (kor nokta olmasin)
                check(f"{fn}: payload metin olarak islendi (yol canli)", r["payloadEscaped"])

        await b.close()

    bad=[r for r in results if not r[1]]
    print(f"\n{'='*64}\ntoplam: {len(results)} | basarisiz: {len(bad)}")
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
