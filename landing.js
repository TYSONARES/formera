(function setupFormeraLeadFunnel(){
  const PILOT_LEAD_STORAGE_KEY = 'formera_pilot_leads';
  const form = document.querySelector('#pilotLeadForm');
  const copyButton = document.querySelector('#copyLeadMessage');
  const status = document.querySelector('#leadStatus');
  const previewTitle = document.querySelector('#leadPreviewTitle');
  const previewMeta = document.querySelector('#leadPreviewMeta');
  const previewRecommendation = document.querySelector('#leadPreviewRecommendation');
  if(!form) return;

  function field(name, fallback='-'){
    const value = new FormData(form).get(name);
    return String(value || '').trim() || fallback;
  }

  // Tek paket modeli (Başkan kararı, 2026-09-18): paket seçimi yok; fiyat
  // yalnızca üye sayısı kademesine göre belirlenir. 0–10 üye ücretsizdir.
  // Kademe TL tutarları Başkan netleştirene kadar sitede yazılmaz.
  function tierForMembers(members){
    if(members === '0–10') return {code:'free', label:'0–10 üye · ücretsiz'};
    if(members === '11–25') return {code:'tier_25', label:'11–25 üye kademesi'};
    if(members === '26–45') return {code:'tier_45', label:'26–45 üye kademesi'};
    if(members === '46–60') return {code:'tier_60', label:'46–60 üye kademesi'};
    return {code:'tier_custom', label:'60+ üye · özel teklif'};
  }

  // Kullanım tipi: stüdyo mu, bireysel antrenör mü, kendi antrenmanı mı.
  function usageCode(usageName){
    if(usageName === 'Bireysel antrenör · koç') return 'individual_trainer';
    if(usageName === 'Kendi antrenmanım için') return 'personal';
    if(usageName === 'Emin değilim') return 'unsure';
    return 'studio';
  }

  function selectedTier(){
    return tierForMembers(field('members', '0–10'));
  }

  function normalizedPhone(value){
    return String(value || '').replace(/\D/g, '');
  }

  function leadPayload(){
    const tier = selectedTier();
    const usage = field('package', 'Stüdyo / işletme');
    const timeline = field('timeline', 'Bu hafta');
    return {
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `landing_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: field('name', 'Yeni başvuru'),
      studio: field('studio', 'Stüdyo adı yok'),
      city: field('city', 'Şehir yok'),
      phone: field('phone', ''),
      members: field('members', '0–10'),
      goal: `${field('goal', 'Operasyonu toparlamak')} · ${usage} · ${tier.label} · ${timeline}`,
      stage: 'lead',
      nextAction: timeline === 'Sadece bilgi almak istiyorum' ? 'Bilgilendirme ve tanıtım akışını planla' : 'Tanışma ve kurulum görüşmesini planla',
      // Kademe fiyatları netleşene kadar CRM'e parasal değer yazılmaz.
      value: 0,
      packageCode: `${usageCode(usage)}_${tier.code}`,
      activationStatus: 'pending',
      activationMode: 'manual',
      followUpDate: new Date().toISOString().slice(0,10),
      createdAt: new Date().toISOString(),
      source: 'landing'
    };
  }

  // --- Başvuruyu gerçekten dışarı gönderen katman -------------------------
  // Önceki sürümde başvuru yalnızca ziyaretçinin kendi localStorage'ına
  // yazılıyordu; yani hiçbir başvuru Formera'ya ulaşmıyordu. Artık iki kanal
  // var: kalıcı kayıt için Supabase, anında haber için WhatsApp.

  function whatsappNumber(){
    return String(window.FORMERA_CONTACT?.whatsapp || '').replace(/\D/g, '');
  }

  function supabaseTarget(){
    const cfg = window.FORMERA_SUPABASE;
    if(!cfg?.url || !cfg?.anonKey) return null;
    return {url: String(cfg.url).replace(/\/+$/, ''), key: cfg.anonKey};
  }

  // Supabase REST'e doğrudan fetch: tek bir insert için landing sayfasına
  // 200 KB'lık supabase-js paketini yüklemeye değmez.
  async function sendLeadToSupabase(lead){
    const target = supabaseTarget();
    if(!target) return false;
    try{
      const response = await fetch(`${target.url}/rest/v1/landing_leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': target.key,
          'Authorization': `Bearer ${target.key}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          contact_name: lead.name,
          studio_name: lead.studio,
          city: lead.city,
          phone: lead.phone || null,
          members: lead.members,
          goal: lead.goal,
          package_code: lead.packageCode,
          timeline: field('timeline', 'Bu hafta'),
          value: lead.value,
          source: 'landing',
          consent_at: new Date().toISOString(),
          user_agent: String(navigator.userAgent || '').slice(0, 400)
        })
      });
      return response.ok;
    }catch(error){
      console.warn('Başvuru Supabase’e ulaştırılamadı.', error);
      return false;
    }
  }

  function openWhatsApp(){
    const number = whatsappNumber();
    if(!number) return false;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(leadMessage())}`, '_blank', 'noopener');
    return true;
  }

  function saveLeadToDashboard(){
    const lead = leadPayload();
    try{
      const savedLeads = JSON.parse(localStorage.getItem(PILOT_LEAD_STORAGE_KEY) || '[]');
      const leadPhone = normalizedPhone(lead.phone);
      const leadStudio = lead.studio.toLocaleLowerCase('tr');
      const duplicateIndex = savedLeads.findIndex(item => {
        const samePhone = leadPhone && normalizedPhone(item.phone) === leadPhone;
        const sameStudio = String(item.studio || '').toLocaleLowerCase('tr') === leadStudio;
        return samePhone || sameStudio;
      });
      if(duplicateIndex >= 0){
        savedLeads[duplicateIndex] = {...savedLeads[duplicateIndex], ...lead, id: savedLeads[duplicateIndex].id || lead.id};
      }else{
        savedLeads.unshift(lead);
      }
      localStorage.setItem(PILOT_LEAD_STORAGE_KEY, JSON.stringify(savedLeads));
      return true;
    }catch(error){
      console.warn('Lead dashboard CRM’e kaydedilemedi.', error);
      return false;
    }
  }

  function leadMessage(){
    const usage = field('package', 'Stüdyo / işletme');
    const tier = selectedTier();
    const timeline = field('timeline', 'Bu hafta');
    return [
      'Merhaba, Formera erken kaydına başvurmak istiyorum.',
      '',
      `Ad soyad: ${field('name')}`,
      `Stüdyo: ${field('studio')}`,
      `Şehir: ${field('city')}`,
      `Üye sayısı: ${field('members')}`,
      `Telefon: ${field('phone')}`,
      `Öncelik: ${field('goal')}`,
      `Kullanım: ${usage}`,
      `Kademe: ${tier.label}`,
      `Başlama zamanı: ${timeline}`,
      '',
      'Erken kayıtta özellikle işletmeci paneli, antrenör görevleri, üye program takibi ve haftalık rapor akışını görmek istiyorum.',
      '',
      'Kaynak: Formera ön tanıtım sayfası'
    ].join('\n');
  }

  function setStatus(message, type='info'){
    if(!status) return;
    status.textContent = message;
    status.dataset.type = type;
  }

  function updatePreview(){
    if(!previewTitle || !previewMeta) return;
    const studio = field('studio', 'Stüdyo adı bekleniyor');
    const members = field('members', '0–10');
    const goal = field('goal', 'Operasyonu toparlamak');
    const tier = selectedTier();
    previewTitle.textContent = `${studio} · erken kayıt başvurusu`;
    previewMeta.textContent = `${members} üye · ${goal} · ${field('timeline', 'Bu hafta')}`;
    if(previewRecommendation){
      previewRecommendation.textContent = tier.code === 'free'
        ? 'Kademen: 0–10 üye — Formera senin için tamamen ücretsiz.'
        : `Kademen: ${tier.label} · erken kayıt fiyatı görüşmede sabitlenir.`;
    }
  }

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if(!form.reportValidity()) return;

    const lead = leadPayload();
    if(submitButton){
      submitButton.disabled = true;
      submitButton.dataset.idleLabel = submitButton.textContent;
      submitButton.textContent = 'Gönderiliyor...';
    }
    setStatus('Başvurun gönderiliyor...', 'info');

    const delivered = await sendLeadToSupabase(lead);
    saveLeadToDashboard();
    const whatsappOpened = openWhatsApp();

    if(submitButton){
      submitButton.disabled = false;
      submitButton.textContent = submitButton.dataset.idleLabel || 'Erken kayıt başvurusunu gönder';
    }

    // Mesaj gerçeği yansıtmalı. Eskiden hiçbir yere ulaşmayan başvuru için
    // "kaydedildi" deniyordu; başvuran kişi aranmayı bekliyordu.
    if(delivered && whatsappOpened){
      setStatus('Başvurun bize ulaştı ve WhatsApp penceresi açıldı. Mesajı göndererek hemen konuşmaya başlayabilirsin.', 'success');
    }else if(delivered){
      setStatus('Başvurun bize ulaştı. En kısa sürede dönüş yapacağız.', 'success');
    }else if(whatsappOpened){
      setStatus('WhatsApp penceresi açıldı; mesajı göndererek başvurunu tamamla.', 'warning');
    }else{
      setStatus('Başvuru şu anda gönderilemedi. “Başvuru özetini kopyala” ile metni alıp bize iletebilirsin.', 'warning');
    }
  });

  copyButton?.addEventListener('click', async () => {
    if(!form.reportValidity()) return;
    const message = leadMessage();
    try{
      await navigator.clipboard.writeText(message);
      saveLeadToDashboard();
      setStatus('Başvuru özeti kopyalandı. WhatsApp veya e-posta ile bize iletebilirsin.', 'success');
    }catch(error){
      setStatus('Kopyalama olmadı. Başvuru bilgilerini kontrol edip tekrar dene.', 'warning');
    }
  });

  // --- Hero videosu: kosullu yukleme ---------------------------------------
  // Dosya 7 MB. Dar ekranda, veri tasarrufu acikken, yavas baglantida veya
  // hareket azaltma tercihinde hic indirilmez; poster gorseli (153 KB) yeterli.
  function setupHeroVideo(){
    const video = document.querySelector('#heroVideo');
    if(!video || !video.dataset.src) return;
    const conn = navigator.connection || navigator.webkitConnection || {};
    const saveData = conn.saveData === true;
    const slowLink = typeof conn.effectiveType === 'string' && /2g/.test(conn.effectiveType);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wideEnough = window.matchMedia('(min-width: 900px)').matches;
    if(saveData || slowLink || reduceMotion || !wideEnough) return;
    // Genis ekranda bile kritik kaynaklarla yarismasin: tarayici bosa
    // dustugunde yuklensin. Poster zaten ilk boyamada gorunuyor.
    const start = () => {
      video.src = video.dataset.src;
      const started = video.play();
      if(started && typeof started.catch === 'function') started.catch(()=>{ /* otomatik oynatma engellenirse poster kalir */ });
    };
    if(typeof requestIdleCallback === 'function') requestIdleCallback(start, {timeout: 2500});
    else setTimeout(start, 1200);
  }
  setupHeroVideo();

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  updatePreview();
})();

/* ---- Scroll animasyonları -------------------------------------------------
   Bölümler görünüme girince yumuşakça yükselerek belirir; hero lekeleri
   kaydırmayla hafifçe kayar. Hareket yalnızca kullanıcı istiyorsa: <html>'e
   .reveal-ready sınıfı yalnızca prefers-reduced-motion kapalıyken (index.html
   içindeki inline script) eklenir. JS yoksa veya hareket azaltılmışsa tüm
   içerik zaten görünür (CSS failsafe). */
(function setupScrollMotion(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));

  // Reveal: IntersectionObserver destekliyse tembel; değilse hepsini göster.
  if(targets.length){
    if('IntersectionObserver' in window && !reduce){
      const io = new IntersectionObserver((entries, obs)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){ entry.target.classList.add('is-in'); obs.unobserve(entry.target); }
        });
      }, {rootMargin:'0px 0px -8% 0px', threshold:0.12});
      targets.forEach(el=>io.observe(el));
    }else{
      targets.forEach(el=>el.classList.add('is-in'));
    }
  }

  // Hafif hero parallax: lekeler kaydırmaya göre birkaç piksel kayar.
  const orbs = Array.prototype.slice.call(document.querySelectorAll('.hero .light-orb'));
  if(orbs.length && !reduce){
    let ticking = false;
    const apply = () => {
      const y = window.scrollY || 0;
      orbs.forEach((orb, i)=>{
        const depth = i % 2 === 0 ? 0.06 : -0.05;
        orb.style.transform = `transl` + `ate3d(0, ${(y * depth).toFixed(1)}px, 0)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', ()=>{
      if(!ticking){ ticking = true; requestAnimationFrame(apply); }
    }, {passive:true});
    apply();
  }
})();
