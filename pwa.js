(function registerFormeraPwa(){
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if(!('serviceWorker' in navigator) || !isSecure) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Sessiz geç: PWA desteklenmeyen ortamda uygulama normal web olarak çalışır.
    });
  });
})();
