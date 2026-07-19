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

  function leadValueForPackage(packageName){
    if(packageName === 'Studio AI') return 2490;
    if(packageName === 'Starter') return 790;
    return 1490;
  }

  function recommendedPackage(){
    const members = field('members', '0–50');
    const goal = field('goal', 'Operasyonu toparlamak');
    if(members === '151–300' || members === '300+' || /ai|yapay|rapor|gelir|gider/i.test(goal)) return 'Studio AI';
    if(members === '51–150' || /antrenör|program|takip/i.test(goal)) return 'Studio';
    return 'Starter';
  }

  function selectedPackage(){
    const packageName = field('package', 'Studio');
    return packageName === 'Emin değilim' ? recommendedPackage() : packageName;
  }

  function packageDecisionLabel(){
    const packageName = field('package', 'Studio');
    const suggested = recommendedPackage();
    return packageName === 'Emin değilim' ? `Emin değilim · öneri: ${suggested}` : `${packageName} · öneri: ${suggested}`;
  }

  function normalizedPhone(value){
    return String(value || '').replace(/\D/g, '');
  }

  function leadPayload(){
    const packageName = selectedPackage();
    const timeline = field('timeline', 'Bu hafta');
    return {
      id: `landing_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: field('name', 'Yeni başvuru'),
      studio: field('studio', 'Stüdyo adı yok'),
      city: field('city', 'Şehir yok'),
      phone: field('phone', ''),
      members: field('members', '0–50'),
      goal: `${field('goal', 'Operasyonu toparlamak')} · ${packageDecisionLabel()} · ${timeline}`,
      stage: 'lead',
      nextAction: timeline === 'Sadece bilgi almak istiyorum' ? 'Bilgilendirme mesajı gönder' : 'WhatsApp görüşmesini planla',
      value: leadValueForPackage(packageName),
      followUpDate: new Date().toISOString().slice(0,10),
      createdAt: new Date().toISOString(),
      source: 'landing'
    };
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
    const packageName = field('package', 'Studio');
    const suggestedPackage = recommendedPackage();
    const decisionPackage = selectedPackage();
    const timeline = field('timeline', 'Bu hafta');
    return [
      'Merhaba, Formera kurucu pilot programı için kısa bir görüşme talep ediyorum.',
      '',
      `Ad soyad: ${field('name')}`,
      `Stüdyo: ${field('studio')}`,
      `Şehir: ${field('city')}`,
      `Üye sayısı: ${field('members')}`,
      `Telefon / WhatsApp: ${field('phone')}`,
      `Öncelik: ${field('goal')}`,
      `Paket ilgisi: ${packageName}`,
      `Formera önerisi: ${suggestedPackage}`,
      `Başlama zamanı: ${timeline}`,
      '',
      '30 günlük pilotta özellikle işletmeci paneli, antrenör görevleri, üye program takibi ve haftalık rapor akışını görmek istiyorum.',
      decisionPackage === 'Studio AI' ? 'AI öneriler ve sesli asistan katmanı hakkında da bilgi almak isterim.' : 'Uygunsa demo dashboard üzerinden kısa bir kurulum görüşmesi planlayalım.',
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
    const members = field('members', '0–50');
    const goal = field('goal', 'Operasyonu toparlamak');
    const packageName = selectedPackage();
    const suggestedPackage = recommendedPackage();
    previewTitle.textContent = `${studio} · ${packageName} pilot ilgisi`;
    previewMeta.textContent = `${members} üye · ${goal} · ${field('timeline', 'Bu hafta')}`;
    if(previewRecommendation){
      previewRecommendation.textContent = `Önerilen paket: ${suggestedPackage} · tahmini kurucu fiyat: ${leadValueForPackage(suggestedPackage).toLocaleString('tr-TR')} TL / ay`;
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if(!form.reportValidity()) return;
    const message = leadMessage();
    const encodedMessage = encodeURIComponent(message);
    const saved = saveLeadToDashboard();
    setStatus(saved ? 'WhatsApp mesajı hazırlandı. Lead Dashboard Pilot CRM’e de eklendi.' : 'WhatsApp mesajı hazırlandı. CRM kaydı için Dashboard’u açabilirsin.', 'success');
    try{ navigator.clipboard?.writeText(message); }catch(error){}
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  });

  copyButton?.addEventListener('click', async () => {
    if(!form.reportValidity()) return;
    const message = leadMessage();
    try{
      await navigator.clipboard.writeText(message);
      const saved = saveLeadToDashboard();
      setStatus(saved ? 'Başvuru mesajı kopyalandı ve lead Dashboard Pilot CRM’e eklendi.' : 'Başvuru mesajı kopyalandı. WhatsApp veya DM içinde yapıştırabilirsin.', 'success');
    }catch(error){
      setStatus('Kopyalama olmadı. WhatsApp butonunu kullanabilirsin.', 'warning');
    }
  });

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  updatePreview();
})();
