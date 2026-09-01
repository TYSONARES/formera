/* Formera "Ana ekrana ekle" yardımcısı.
   - Android/masaüstü Chrome/Edge: beforeinstallprompt yakalanır, [data-install]
     butonları görünür; tıklayınca native yükleme istemi açılır.
   - iOS Safari: programatik istem yok; buton "Paylaş > Ana Ekrana Ekle" ipucu
     sayfasını açar.
   - Zaten kurulu (standalone) ise buton gizli kalır.
   Harici bağımlılık yok; tüm stil kendi origin'imizden. */
(function(){
  var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches)
    || window.navigator.standalone === true;
  var ua = navigator.userAgent || '';
  var isIOS = /iphone|ipad|ipod/i.test(ua)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var deferred = null;
  var sheet = null;

  function targets(){ return Array.prototype.slice.call(document.querySelectorAll('[data-install]')); }
  function reveal(){ targets().forEach(function(b){ b.hidden = false; }); }
  function conceal(){ targets().forEach(function(b){ b.hidden = true; }); }

  if(standalone){ conceal(); return; }

  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; reveal(); });
  window.addEventListener('appinstalled', function(){ deferred = null; conceal(); closeSheet(); });
  if(isIOS) reveal();

  function ensureStyles(){
    if(document.getElementById('fx-install-css')) return;
    var s = document.createElement('style'); s.id = 'fx-install-css';
    s.textContent = [
      '.fx-ins{position:fixed;inset:0;z-index:9999;display:none;align-items:flex-end;justify-content:center;background:rgba(20,15,40,.5);backdrop-filter:blur(3px)}',
      '.fx-ins.open{display:flex}',
      '@media(min-width:620px){.fx-ins{align-items:center}}',
      '.fx-ins-card{background:var(--paper,#fff);color:var(--ink,#06040e);width:min(460px,100%);border:1px solid var(--mist,#e1edf2);border-radius:22px 22px 0 0;padding:24px 22px 26px;font-family:"DM Sans",system-ui,sans-serif}',
      '@media(min-width:620px){.fx-ins-card{border-radius:22px}}',
      '.fx-ins-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}',
      '.fx-ins-mark{width:40px;height:40px;border-radius:11px;background:var(--terracotta,#e39a4d);color:#3a1e06;display:grid;place-items:center;font:800 20px "Manrope",sans-serif;flex:0 0 auto}',
      '.fx-ins-top h3{font:800 18px "Manrope",sans-serif;margin:0;letter-spacing:-.02em}',
      '.fx-ins-top p{margin:2px 0 0;font-size:12px;color:var(--muted,#6a6473)}',
      '.fx-ins-close{margin-left:auto;border:1px solid var(--mist,#e1edf2);background:#eeecf2;color:#6b6673;width:34px;height:34px;border-radius:9px;font-size:20px;cursor:pointer;line-height:1}',
      '.fx-ins-steps{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:12px}',
      '.fx-ins-steps li{display:flex;gap:12px;align-items:flex-start;font-size:14px;line-height:1.45}',
      '.fx-ins-steps b{flex:0 0 auto;width:24px;height:24px;border-radius:8px;background:var(--terracotta,#e39a4d);color:#3a1e06;display:grid;place-items:center;font:800 12px "Manrope",sans-serif}',
      '.fx-ins-note{margin:16px 0 0;font-size:12px;color:var(--muted,#6a6473);line-height:1.5}',
      '.fx-share{display:inline-grid;place-items:center;width:20px;height:20px;border:1.5px solid currentColor;border-radius:5px;vertical-align:-4px;position:relative}',
      '.fx-share::before{content:"";position:absolute;top:-6px;width:1.5px;height:9px;background:currentColor}',
      '.fx-share::after{content:"";position:absolute;top:-6px;width:6px;height:6px;border-top:1.5px solid currentColor;border-right:1.5px solid currentColor;transform:rotate(-45deg)}'
    ].join('');
    document.head.appendChild(s);
  }

  function sheetHtml(){
    var ios = [
      '<li><b>1</b><div>Bu sayfayı <strong>Safari</strong>’de aç.</div></li>',
      '<li><b>2</b><div>Alttaki <strong>Paylaş</strong> <span class="fx-share" aria-hidden="true"></span> butonuna dokun.</div></li>',
      '<li><b>3</b><div><strong>“Ana Ekrana Ekle”</strong> seç → <strong>Ekle</strong>.</div></li>'
    ].join('');
    var android = [
      '<li><b>1</b><div>Sağ üst <strong>⋮</strong> menüyü aç.</div></li>',
      '<li><b>2</b><div><strong>“Uygulamayı yükle”</strong> / <strong>“Ana ekrana ekle”</strong> seç.</div></li>',
      '<li><b>3</b><div>Onayla — Formera ana ekranına eklenir.</div></li>'
    ].join('');
    var steps = isIOS ? ios : android;
    return '<div class="fx-ins-card" role="dialog" aria-modal="true" aria-label="Ana ekrana ekle">'
      + '<div class="fx-ins-top"><span class="fx-ins-mark" aria-hidden="true">F</span>'
      + '<div><h3>Formera’yı ana ekrana ekle</h3><p>Uygulama gibi tek dokunuşla açılır, çevrimdışı çalışır.</p></div>'
      + '<button class="fx-ins-close" data-install-close aria-label="Kapat">×</button></div>'
      + '<ul class="fx-ins-steps">' + steps + '</ul>'
      + '<p class="fx-ins-note">' + (isIOS ? 'Not: iOS’ta ekleme yalnızca Safari’den yapılır.' : 'Cihazınız “yükle” seçeneği sunmuyorsa tarayıcı menüsünden ekleyebilirsiniz.') + '</p>'
      + '</div>';
  }

  function ensureSheet(){
    if(sheet) return;
    ensureStyles();
    sheet = document.createElement('div');
    sheet.className = 'fx-ins';
    sheet.innerHTML = sheetHtml();
    document.body.appendChild(sheet);
    sheet.addEventListener('click', function(e){ if(e.target === sheet) closeSheet(); });
  }
  function openSheet(){ ensureSheet(); requestAnimationFrame(function(){ sheet.classList.add('open'); }); }
  function closeSheet(){ if(sheet) sheet.classList.remove('open'); }

  document.addEventListener('click', function(e){
    var t = e.target.closest && e.target.closest('[data-install]');
    if(t){
      e.preventDefault();
      if(deferred){
        deferred.prompt();
        (deferred.userChoice || Promise.resolve()).then(function(){ deferred = null; conceal(); });
        return;
      }
      openSheet();
      return;
    }
    if(e.target.closest && e.target.closest('[data-install-close]')) closeSheet();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSheet(); });
})();
