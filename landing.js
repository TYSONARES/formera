(function setupFormeraLeadFunnel(){
  const PILOT_LEAD_STORAGE_KEY = 'formera_pilot_leads';
  const form = document.querySelector('#pilotLeadForm');
  const copyButton = document.querySelector('#copyLeadMessage');
  const status = document.querySelector('#leadStatus');
  const previewTitle = document.querySelector('#leadPreviewTitle');
  const previewMeta = document.querySelector('#leadPreviewMeta');
  const previewRecommendation = document.querySelector('#leadPreviewRecommendation');
  const planModal = document.querySelector('#planPaymentModal');
  const planTitle = document.querySelector('#planPaymentTitle');
  const planSummary = document.querySelector('#planPaymentSummary');
  const packageSelect = form?.elements.package;
  const planPrices = {
    'Starter':{list:'1.290 TL / ay',pilot:'990 TL / ay'},
    'Studio':{list:'2.490 TL / ay',pilot:'1.690 TL / ay'},
    'Studio AI':{list:'4.490 TL / ay',pilot:'2.990 TL / ay'}
  };
  const pilotPrice = document.querySelector('#planPilotPrice');
  if(!form) return;

  let selectedPlan = 'Studio';

  function openPlanModal(plan){
    selectedPlan = planPrices[plan] ? plan : 'Studio';
    if(planTitle) planTitle.textContent = `${selectedPlan} · ${planPrices[selectedPlan].list}`;
    if(pilotPrice) pilotPrice.textContent = planPrices[selectedPlan].pilot;
    if(planSummary) planSummary.textContent = `${selectedPlan} planı için 30 günlük kurucu pilot başvurusunu başlatalım.`;
    if(planModal?.showModal) planModal.showModal();
    else planModal?.setAttribute('open','');
  }

  function closePlanModal(){
    if(planModal?.close) planModal.close();
    else planModal?.removeAttribute('open');
  }

  document.querySelectorAll('[data-plan-select]').forEach(button=>{
    button.addEventListener('click', ()=>openPlanModal(button.dataset.planSelect));
  });
  const pricingSection = document.querySelector('#pricing');
  const billingToggles = document.querySelectorAll('[data-billing]');
  const priceNodes = document.querySelectorAll('[data-price-plan]');
  billingToggles.forEach(toggle=>{
    toggle.addEventListener('click', ()=>{
      const billing = toggle.dataset.billing === 'yearly' ? 'yearly' : 'monthly';
      pricingSection?.setAttribute('data-billing', billing);
      billingToggles.forEach(item=>{
        const active = item.dataset.billing === billing;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      priceNodes.forEach(node=>{
        node.textContent = node.dataset[billing] || node.dataset.monthly || '';
      });
    });
  });
  document.querySelector('#closePlanPayment')?.addEventListener('click', closePlanModal);
  document.querySelector('#closePlanPaymentSecondary')?.addEventListener('click', closePlanModal);
  planModal?.addEventListener('click', event=>{ if(event.target === planModal) closePlanModal(); });
  document.querySelector('#continuePlanToPilot')?.addEventListener('click', ()=>{
    if(packageSelect) packageSelect.value = selectedPlan;
    closePlanModal();
    document.querySelector('#pilot')?.scrollIntoView({behavior:'smooth', block:'start'});
    setTimeout(()=>form.elements.name?.focus(), 450);
    updatePreview();
  });

  function field(name, fallback='-'){
    const value = new FormData(form).get(name);
    return String(value || '').trim() || fallback;
  }

  function leadValueForPackage(packageName){
    if(packageName === 'Studio AI') return 2990;
    if(packageName === 'Starter') return 990;
    return 1690;
  }

  function packageCode(packageName){
    return packageName === 'Studio AI' ? 'studio_ai' : packageName === 'Starter' ? 'starter' : 'studio';
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
      id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `landing_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      name: field('name', 'Yeni başvuru'),
      studio: field('studio', 'Stüdyo adı yok'),
      city: field('city', 'Şehir yok'),
      phone: field('phone', ''),
      members: field('members', '0–50'),
      goal: `${field('goal', 'Operasyonu toparlamak')} · ${packageDecisionLabel()} · ${timeline}`,
      stage: 'lead',
      nextAction: timeline === 'Sadece bilgi almak istiyorum' ? 'Bilgilendirme ve demo akışını planla' : 'Demo ve pilot görüşmesini planla',
      value: leadValueForPackage(packageName),
      packageCode: packageCode(packageName),
      activationStatus: 'pending',
      activationMode: 'manual',
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
      'Merhaba, Formera kurucu pilotuna başvurmak istiyorum.',
      '',
      `Ad soyad: ${field('name')}`,
      `Stüdyo: ${field('studio')}`,
      `Şehir: ${field('city')}`,
      `Üye sayısı: ${field('members')}`,
      `Telefon: ${field('phone')}`,
      `Öncelik: ${field('goal')}`,
      `Paket ilgisi: ${packageName}`,
      `Formera önerisi: ${suggestedPackage}`,
      `Başlama zamanı: ${timeline}`,
      '',
      '30 günlük pilotta özellikle işletmeci paneli, antrenör görevleri, üye program takibi ve haftalık rapor akışını görmek istiyorum.',
      decisionPackage === 'Studio AI' ? 'AI öneriler ve sesli asistan katmanı hakkında da bilgi almak isterim.' : 'Demo akışını incelemek ve pilot planını netleştirmek istiyorum.',
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
    const saved = saveLeadToDashboard();
    setStatus(saved ? 'Pilot başvurusu kaydedildi. Başvuru özetini ayrıca kopyalayabilirsiniz.' : 'Başvuru özeti hazırlandı; bu cihazdaki CRM kaydı oluşturulamadı.', saved ? 'success' : 'warning');
  });

  copyButton?.addEventListener('click', async () => {
    if(!form.reportValidity()) return;
    const message = leadMessage();
    try{
      await navigator.clipboard.writeText(message);
      const saved = saveLeadToDashboard();
      setStatus(saved ? 'Başvuru özeti kopyalandı ve pilot CRM’e eklendi.' : 'Başvuru özeti kopyalandı; CRM kaydı oluşturulamadı.', saved ? 'success' : 'warning');
    }catch(error){
      setStatus('Kopyalama olmadı. Başvuru bilgilerini kontrol edip tekrar dene.', 'warning');
    }
  });

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  updatePreview();
})();
