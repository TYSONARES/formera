(function setupFormeraLeadFunnel(){
  const form = document.querySelector('#pilotLeadForm');
  const copyButton = document.querySelector('#copyLeadMessage');
  const status = document.querySelector('#leadStatus');
  const previewTitle = document.querySelector('#leadPreviewTitle');
  const previewMeta = document.querySelector('#leadPreviewMeta');
  if(!form) return;

  function field(name, fallback='-'){
    const value = new FormData(form).get(name);
    return String(value || '').trim() || fallback;
  }

  function leadMessage(){
    const packageName = field('package', 'Studio');
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
      `Başlama zamanı: ${timeline}`,
      '',
      '30 günlük pilotta özellikle işletmeci paneli, antrenör görevleri, üye program takibi ve haftalık rapor akışını görmek istiyorum.',
      packageName === 'Studio AI' ? 'AI öneriler ve sesli asistan katmanı hakkında da bilgi almak isterim.' : 'Uygunsa demo dashboard üzerinden kısa bir kurulum görüşmesi planlayalım.',
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
    const packageName = field('package', 'Studio');
    previewTitle.textContent = `${studio} · ${packageName} pilot ilgisi`;
    previewMeta.textContent = `${members} üye · ${goal} · ${field('timeline', 'Bu hafta')}`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if(!form.reportValidity()) return;
    const message = leadMessage();
    const encodedMessage = encodeURIComponent(message);
    setStatus('WhatsApp mesajı hazırlandı. Yeni pencerede açılıyor...', 'success');
    try{ navigator.clipboard?.writeText(message); }catch(error){}
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  });

  copyButton?.addEventListener('click', async () => {
    if(!form.reportValidity()) return;
    const message = leadMessage();
    try{
      await navigator.clipboard.writeText(message);
      setStatus('Başvuru mesajı kopyalandı. WhatsApp veya DM içinde yapıştırabilirsin.', 'success');
    }catch(error){
      setStatus('Kopyalama olmadı. WhatsApp butonunu kullanabilirsin.', 'warning');
    }
  });

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  updatePreview();
})();
