"""Formera XSS regresyon testi.

Kullanici kaynakli her alana gercek bir XSS payload'i yazar, paneli her rol ve
sayfa icin render eder, payload'in ELEMENT olarak olusup olusmadigini kontrol
eder. Payload metin olarak gorunuyorsa gecer; <img> olarak DOM'a girdiyse veya
onerror tetiklendiyse kalir.
"""
import asyncio, sys, json
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8899"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"

# Iki varyant: dogrudan etiket, ve attribute'tan kacis denemesi
P1 = '<img src=x onerror="window.__XSS=(window.__XSS||0)+1">'
P2 = '"><img src=x onerror="window.__XSS=(window.__XSS||0)+1">'
P3 = "'><img src=x onerror='window.__XSS=(window.__XSS||0)+1'>"

SEED = f"""
localStorage.clear();
const P1 = {json.dumps(P1)}, P2 = {json.dumps(P2)}, P3 = {json.dumps(P3)};
localStorage.setItem('formera_members', JSON.stringify([
  {{id:'11111111-1111-4111-8111-111111111111', name:P1, initials:P2, trainer:P1, dietitian:P1,
    last:P1, sessions:P2, status:P1, type:'good', phone:P1, email:'a@b.co'}}
]));
localStorage.setItem('formera_finance_entries', JSON.stringify([
  {{id:'f_1', type:'income', title:P1, category:P2, amount:100, date:'2026-07-04', status:'paid'}}
]));
localStorage.setItem('formera_programs', JSON.stringify([
  {{id:'p_1', title:P1, goal:P2, level:P1, duration:40, assigned:P1, exercises:[P1]}}
]));
localStorage.setItem('formera_sessions', JSON.stringify([
  {{id:'s_1', date:'2026-07-15', time:P1, member:P1, trainer:P2, program:P1, room:P3, status:'scheduled'}}
]));
localStorage.setItem('formera_team', JSON.stringify([
  {{id:'t_1', name:P1, role:P2, specialty:P1, phone:P1, commission:10}}
]));
localStorage.setItem('formera_trainer_tasks', JSON.stringify([
  {{id:'tt_1', trainer:P1, title:P1, note:P2, priority:'high', dueDate:'2026-07-16', status:'open'}}
]));
localStorage.setItem('formera_member_tasks', JSON.stringify([
  {{id:'mt_1', member:P1, trainer:P2, type:'workout', title:P1, note:P3, dueDate:'2026-07-18', status:'open'}}
]));
localStorage.setItem('formera_studios', JSON.stringify([
  {{id:'studio_1', name:P1, initials:P2, location:P1, status:P3}}
]));
localStorage.setItem('formera_pilot_leads', JSON.stringify([
  {{id:'lead_1', name:P1, studio:P2, city:P1, phone:P1, members:'0-50', goal:P3,
    stage:'demo', nextAction:P1, value:990}}
]));
localStorage.setItem('formera_onboarding_complete', '1');
"""

CHECK = """() => {
  const injected = document.querySelectorAll('img[src="x"]').length;
  return { fired: window.__XSS || 0, injected };
}"""

PAGES = ["dashboard", "members", "programs", "calendar", "finance", "reports", "team", "growth"]


async def main():
    failures, checks = [], 0
    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME)
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, locale="tr-TR")
        page = await ctx.new_page()
        # seed
        await page.goto(f"{BASE}/dashboard.html", wait_until="domcontentloaded")
        await page.evaluate(SEED)

        async def probe(label):
            nonlocal checks
            await page.wait_for_timeout(900)
            r = await page.evaluate(CHECK)
            checks += 1
            status = "OK " if (r["fired"] == 0 and r["injected"] == 0) else "FAIL"
            if status == "FAIL":
                failures.append((label, r))
            print(f"  [{status}] {label:38} fired={r['fired']} injected_img={r['injected']}")

        print("owner rolu, tum sayfalar:")
        for pg in PAGES:
            await page.goto(f"{BASE}/dashboard.html?page={pg}", wait_until="networkidle")
            await probe(f"owner/{pg}")

        print("\nrol degistirerek (owner -> trainer -> member):")
        await page.goto(f"{BASE}/dashboard.html", wait_until="networkidle")
        for role in ("trainer", "member"):
            btn = await page.query_selector('[data-action="toggle-role"], #roleToggle, .role-button')
            if btn:
                await btn.click()
                await probe(f"role/{role}")
            else:
                # dogrudan state uzerinden
                await page.evaluate(f"window.state && (state.role='{role}', render())")
                await probe(f"role/{role} (state)")

        print("\nformera admin (pilot CRM):")
        await page.goto(f"{BASE}/dashboard.html?formera_admin=1&page=pilot", wait_until="networkidle")
        await probe("admin/pilot")

        await b.close()

    print(f"\n{'='*60}")
    print(f"toplam kontrol: {checks} | basarisiz: {len(failures)}")
    if failures:
        for lbl, r in failures:
            print(f"  !! {lbl}: {r}")
        sys.exit(1)
    print("SONUC: XSS payload'i hicbir noktada calismadi.")


asyncio.run(main())
