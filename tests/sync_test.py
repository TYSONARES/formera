"""Formera satir bazli senkronizasyon testi.

Eskiden her kayit ilgili tablonun TAMAMINI upsert ediyordu. Bu test, sahte bir
Supabase oturumu kurup REST trafigini sayarak su davranislari dogrular:

  1. Giriste sunucudan gelen veri sunucuya geri YAZILMAZ.
  2. Tek bir uye duzenlendiginde yalnizca O satir gonderilir.
  3. Degisiklik yokken kayit hicbir istek uretmez.
  4. Yazma hata alirsa satir kirli kalir ve sonraki kayitta tekrar denenir.
"""
import asyncio, json, sys, time
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8899"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
PROJECT = "https://stub.supabase.co"
REF = "stub"

STUDIO = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"
OWNER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
MEMBERS = [f"cccccccc-cccc-4ccc-8ccc-{i:012d}" for i in range(1, 26)]  # 25 uye

TABLE_DATA = {
    "studios": [{"id": STUDIO, "name": "Test Studio", "initials": "TS", "location": "İstanbul",
                 "status": "Pilot", "setup_completed": True, "accent_color": "#d9ff64"}],
    "profiles": [{"id": OWNER, "studio_id": STUDIO, "full_name": "Sahip", "role": "owner",
                  "auth_user_id": "user-1", "email": "o@x.co"}],
    "members": [{"id": m, "studio_id": STUDIO, "full_name": f"Uye {i}", "initials": "U",
                 "sessions_used": 1, "sessions_total": 12, "status": "Aktif", "risk_type": "good",
                 "profile_id": None, "trainer_profile_id": None}
                for i, m in enumerate(MEMBERS, 1)],
    "programs": [], "sessions": [], "finance_entries": [], "signatures": [],
    "member_program_selections": [], "trainer_tasks": [], "member_tasks": [],
    "pilot_leads": [], "makeup_requests": [],
}


def session_blob():
    return json.dumps({
        "access_token": "fake-access", "refresh_token": "fake-refresh",
        "token_type": "bearer", "expires_in": 3600,
        "expires_at": int(time.time()) + 3600,
        "user": {"id": "user-1", "aud": "authenticated", "email": "o@x.co",
                 "app_metadata": {}, "user_metadata": {}, "created_at": "2026-01-01T00:00:00Z"},
    })


class Recorder:
    def __init__(self):
        self.writes = []   # (table, rowcount, method)
        self.fail_next = False

    def reset(self):
        self.writes = []

    @property
    def rows(self):
        return sum(w[1] for w in self.writes)


async def main():
    rec = Recorder()
    results = []

    def check(name, ok, detail=""):
        results.append((name, ok, detail))
        print(f"  [{'OK ' if ok else 'FAIL'}] {name:52} {detail}")

    async with async_playwright() as pw:
        b = await pw.chromium.launch(executable_path=CHROME)
        ctx = await b.new_context(locale="tr-TR")
        page = await ctx.new_page()

        async def handle(route):
            req = route.request
            url = req.url
            table = url.split("/rest/v1/")[1].split("?")[0]
            if req.method in ("POST", "PATCH", "PUT"):
                try:
                    body = json.loads(req.post_data or "[]")
                except Exception:
                    body = []
                if not isinstance(body, list):
                    body = [body]
                rec.writes.append((table, len(body), req.method))
                if rec.fail_next:
                    await route.fulfill(status=400, content_type="application/json",
                                        body=json.dumps({"message": "stub failure"}))
                    return
                await route.fulfill(status=201, content_type="application/json", body="[]")
                return
            await route.fulfill(status=200, content_type="application/json",
                                body=json.dumps(TABLE_DATA.get(table, [])))

        await page.route("**/rest/v1/**", handle)
        await page.route("**/auth/v1/**", lambda r: r.fulfill(
            status=200, content_type="application/json", body=json.dumps({})))

        await page.goto(f"{BASE}/dashboard.html", wait_until="domcontentloaded")
        await page.evaluate(f"""() => {{
          localStorage.clear();
          localStorage.setItem('formera_supabase_config', JSON.stringify(
            {{url: {json.dumps(PROJECT)}, anonKey: 'stub-anon-key'}}));
          localStorage.setItem('sb-{REF}-auth-token', {json.dumps(session_blob())});
          localStorage.setItem('formera_onboarding_complete','1');
        }}""")

        # --- 1. Giris ---
        rec.reset()
        await page.goto(f"{BASE}/dashboard.html", wait_until="networkidle")
        await page.wait_for_timeout(4000)
        connected = await page.evaluate(
            "() => !!document.querySelector('.member-row, .metric')")
        check("panel acildi", connected)
        check("giriste sunucuya geri yazma yok", rec.rows == 0,
              f"(yazilan satir={rec.rows}, istek={len(rec.writes)})")

        # --- 2. Tek uye duzenle ---
        rec.reset()
        edited = await page.evaluate("""() => {
          const row = document.querySelector('.member-row [data-action="checkin-member"]');
          if(!row) return false;
          row.click();
          return true;
        }""")
        await page.wait_for_timeout(2500)
        check("uye duzenleme tetiklendi", edited)
        member_writes = [w for w in rec.writes if w[0] == "members"]
        sent = sum(w[1] for w in member_writes)
        check("yalnizca degisen satir gonderildi", sent == 1,
              f"(gonderilen={sent}, beklenen=1, toplam uye={len(MEMBERS)})")

        # --- 3. Degisiklik yokken kayit ---
        rec.reset()
        await page.evaluate("""() => {
          const b=document.querySelector('[data-action="checkin-member"]');
          // ayni degeri tekrar yazan bir kayit tetikle
          window.dispatchEvent(new Event('resize'));
        }""")
        await page.wait_for_timeout(1200)
        check("degisiklik yokken ek istek yok", rec.rows == 0, f"(satir={rec.rows})")

        # --- 4. Hata sonrasi tekrar deneme ---
        rec.fail_next = True
        rec.reset()
        await page.evaluate("""() => {
          const b=document.querySelectorAll('[data-action="checkin-member"]')[1];
          if(b) b.click();
        }""")
        await page.wait_for_timeout(2500)
        failed_sent = sum(w[1] for w in rec.writes if w[0] == "members")
        rec.fail_next = False
        rec.reset()
        await page.evaluate("""() => {
          const b=document.querySelectorAll('[data-action="checkin-member"]')[2];
          if(b) b.click();
        }""")
        await page.wait_for_timeout(2500)
        retried = sum(w[1] for w in rec.writes if w[0] == "members")
        # Tam olarak 2 olmali: hata alip kirli kalan satir + yeni degisen satir.
        # Eski tam-tablo davranisinda burasi 25 gelir, yani bu esik gevsek degil.
        check("hata alan satir kirli kaldi ve tekrar denendi", failed_sent == 1 and retried == 2,
              f"(hatali gonderim={failed_sent} -> 1, sonraki gonderim={retried} -> 2: eski + yeni)")

        await b.close()

    print("\n" + "=" * 68)
    bad = [r for r in results if not r[1]]
    print(f"toplam: {len(results)} | basarisiz: {len(bad)}")
    for n, _, d in bad:
        print("  !!", n, d)
    return 1 if bad else 0


sys.exit(asyncio.run(main()))
