(function setupFormeraLeadFunnel(){
  const form = document.querySelector('#pilotLeadForm');
  const copyButton = document.querySelector('#copyLeadMessage');
  const status = document.querySelector('#leadStatus');
  if(!form) return;

  function leadMessage(){
    const data = new FormData(form);
    return [
      'Merhaba, Formera kurucu pilot programı hakkında görüşmek istiyorum.',
      '',
      `Ad: ${data.get('name') || '-'}`,
      `Stüdyo: ${data.get('studio') || '-'}`,
      `Şehir: ${data.get('city') || '-'}`,
      `Üye sayısı: ${data.get('members') || '-'}`,
      `Telefon: ${data.get('phone') || '-'}`,
      `Öncelik: ${data.get('goal') || '-'}`,
      '',
      '30 günlük pilot kurulum için bilgi alabilir miyim?'
    ].join('\n');
  }

  function setStatus(message, type='info'){
    if(!status) return;
    status.textContent = message;
    status.dataset.type = type;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if(!form.reportValidity()) return;
    const message = encodeURIComponent(leadMessage());
    setStatus('WhatsApp mesajı hazırlanıyor...', 'success');
    window.location.href = `https://api.whatsapp.com/send?text=${message}`;
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
})();
