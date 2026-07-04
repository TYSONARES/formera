const state = {
  role: 'owner',
  page: 'dashboard',
  members: [
    {name:'Selin Aksoy', initials:'SA', trainer:'Ece', last:'Bugün', sessions:'7 / 12', status:'Aktif', type:'good'},
    {name:'Mert Özkan', initials:'MÖ', trainer:'Kerem', last:'9 gün önce', sessions:'2 / 12', status:'Riskli', type:'risk'},
    {name:'Deniz Erdem', initials:'DE', trainer:'Ece', last:'3 gün önce', sessions:'9 / 12', status:'Aktif', type:'good'},
    {name:'Buse Kılıç', initials:'BK', trainer:'Kerem', last:'6 gün önce', sessions:'11 / 12', status:'Yenileme', type:'warn'},
    {name:'Can Aydın', initials:'CA', trainer:'Ece', last:'Dün', sessions:'5 / 8', status:'Aktif', type:'good'}
  ]
};

const savedMembers = localStorage.getItem('formera_members');
if(savedMembers){
  try{ state.members = JSON.parse(savedMembers); }catch(e){ console.warn('Kayıtlı üyeler okunamadı.'); }
}

const money = new Intl.NumberFormat('tr-TR');
const app = document.querySelector('#appContent');
const toast = document.querySelector('#toast');

function metric(title, value, delta, icon, down=false){
  return `<article class="metric"><div class="metric-head"><span>${title}</span><span class="metric-icon">${icon}</span></div><strong>${value}</strong><span class="delta ${down?'down':''}">${delta} <em>geçen haftaya göre</em></span></article>`;
}

function memberRows(items=state.members){
  return items.map(m=>`<div class="member-row"><div class="member"><span class="avatar">${m.initials}</span><div><strong>${m.name}</strong><small>PT: ${m.trainer}</small></div></div><span><small class="cell-label">Son ziyaret</small><br>${m.last}</span><span><small class="cell-label">Seans</small><br>${m.sessions}</span><span class="status ${m.type}">${m.status}</span></div>`).join('');
}

function dashboard(){
  return `<div class="welcome"><div><span class="eyebrow">4–10 Temmuz · 28. Hafta</span><h1>Günaydın, Ömer 👋</h1><p>Stüdyon bu hafta iyi ilerliyor. İşte dikkat isteyen noktalar.</p></div><button class="primary" data-action="new-member">+ Yeni üye</button></div>
  <section class="metrics">
    ${metric('Aktif üye','48','↑ %6','♙')}
    ${metric('Haftalık gelir','₺42.850','↑ %12','₺')}
    ${metric('Tamamlanan seans','126','↑ %8','✓')}
    ${metric('Yenileme riski','6','↑ 2 üye','! ',true)}
  </section>
  <section class="dashboard-grid">
    <article class="card"><div class="card-title"><div><h2>Gelir ve gider</h2><p>Son 6 haftanın nakit hareketi</p></div><span class="badge">Net +₺27.600</span></div><div class="chart">
      ${[['H23',51,30],['H24',64,38],['H25',57,34],['H26',74,43],['H27',69,40],['H28',86,36]].map(x=>`<div class="bar-group"><i class="bar" style="height:${x[1]}%"></i><i class="bar expense" style="height:${x[2]}%"></i><small class="bar-label">${x[0]}</small></div>`).join('')}
    </div><div class="chart-legend"><span><i class="dot"></i>Gelir</span><span><i class="dot gray"></i>Gider</span></div></article>
    <article class="card ai-card"><span class="ai-label">✦ FORMA AI · HAFTALIK ÖZET</span><h2>Bu hafta büyüme var, ancak 6 üye dikkat istiyor.</h2><p>Gelirin %12 arttı. Seans katılımı güçlü; fakat iki üyenin ziyareti 8 günü geçti ve dört paketin süresi bu hafta doluyor.</p>
      <div class="insight"><span>↗</span><div><strong>3 üyeye bugün ulaş</strong><small>Yenileme ihtimali yüksek · ₺9.600 potansiyel</small></div></div>
      <div class="insight"><span>◷</span><div><strong>Salı 18:00 yoğunluğu</strong><small>Bir ek PT saati planlamayı düşün</small></div></div>
      <button class="primary ai-action" data-action="ai-plan">Hafta planını hazırla →</button>
    </article>
    <article class="card"><div class="card-title"><div><h2>Dikkat isteyen üyeler</h2><p>Katılım ve paket durumuna göre</p></div><button class="secondary" data-page-link="members">Tümünü gör</button></div><div class="member-list">${memberRows(state.members.slice(0,4))}</div></article>
    <article class="card"><div class="card-title"><div><h2>Bugünün akışı</h2><p>4 Temmuz, Cumartesi</p></div><span class="badge">18 seans</span></div>
      <div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>09:30</span><div><strong>Selin Aksoy · Alt vücut</strong><small>Ece ile · Salon A</small></div></div>
      <div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>10:30</span><div><strong>Can Aydın · Fonksiyonel</strong><small>Ece ile · Salon B</small></div></div>
      <div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>11:00</span><div><strong>Buse Kılıç · Full body</strong><small>Kerem ile · Salon A</small></div></div>
    </article>
  </section>`;
}

function memberPage(){return `<div class="welcome"><div><span class="eyebrow">ÜYE YÖNETİMİ</span><h1>Üyeler</h1><p>Tüm üyeleri, paketleri ve katılım durumlarını tek yerden izle.</p></div><button class="primary" data-action="new-member">+ Yeni üye</button></div><article class="card page-card"><div class="page-toolbar"><input id="memberSearch" placeholder="İsim veya antrenör ara..."><button class="secondary">Filtrele</button></div><div id="memberResults">${memberRows()}</div></article>`}

function genericPage(title, desc, icon){return `<div class="welcome"><div><span class="eyebrow">NORTHFIT STUDIO</span><h1>${title}</h1><p>${desc}</p></div><button class="primary">+ Yeni oluştur</button></div><article class="card page-card"><div class="empty-illustration"><div><b>${icon}</b><h2>${title} modülü hazırlanıyor</h2><p>İlk pilot kapsamındaki veri yapısı bu ekrana bağlanacak.</p></div></div></article>`}

function memberDashboard(){return `<div class="welcome"><div><span class="eyebrow">ÜYE ALANI</span><h1>Merhaba Selin, hazırsan başlayalım.</h1><p>Bu hafta 2 antrenmanı tamamladın. Hedefine bir adım daha yakınsın.</p></div><button class="primary" data-action="start-workout">Antrenmanı başlat</button></div>
  <section class="metrics">${metric('Bu haftaki antrenman','2 / 3','1 kaldı','✓')}${metric('Toplam seans','7 / 12','5 seans kaldı','◷')}${metric('Seri','3 hafta','Kişisel rekor','↗')}${metric('Son ölçüm','−1,8 kg','Son 30 gün','◎')}</section>
  <section class="dashboard-grid"><article class="card"><div class="card-title"><div><h2>Bugünkü program</h2><p>Alt vücut · 48 dakika</p></div><span class="badge">PT Ece</span></div>
  ${['Goblet squat · 4 × 10','Romanian deadlift · 3 × 12','Walking lunge · 3 × 10','Hip thrust · 4 × 12'].map((x,i)=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>${i+1}</span><div><strong>${x}</strong><small>Dinlenme 60–90 saniye</small></div></div>`).join('')}</article>
  <article class="card ai-card"><span class="ai-label">✦ FORMA AI</span><h2>İstikrarlı gidiyorsun.</h2><p>Son üç haftadır programına %89 uyum gösterdin. Bugün squat ağırlığını artırmadan formunu koruman daha iyi olabilir.</p><button class="primary ai-action" data-action="coach-tip">Koç notunu gör →</button></article></section>`}

const pages={programs:['Programlar','Antrenman şablonlarını oluştur ve üyelere ata.','▤'],calendar:['Takvim','PT seanslarını ve stüdyo kapasitesini planla.','□'],finance:['Finans','Gelir, gider ve tahsilat hareketlerini yönet.','₺'],reports:['Raporlar','Haftalık ve aylık performansı karşılaştır.','↗'],team:['Ekip','Antrenörleri, görevleri ve performansı izle.','♧']};

function render(){
  if(state.role==='member'){app.innerHTML=memberDashboard();return bind()}
  app.innerHTML=state.page==='dashboard'?dashboard():state.page==='members'?memberPage():genericPage(...pages[state.page]); bind();
}
function bind(){
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{
    if(b.dataset.action==='new-member') return document.querySelector('#memberModal').showModal();
    showToast({
    'new-member':'Yeni üye formu pilotun sonraki adımında açılacak.',
    'ai-plan':'Forma AI, 5 maddelik hafta planını hazırladı.',
    'start-workout':'Antrenman modu başlatıldı. Hadi bakalım! 💪',
    'coach-tip':'Ece’nin notu: Tempo kontrollü, form öncelikli.'
  }[b.dataset.action])});
  document.querySelectorAll('[data-page-link]').forEach(b=>b.onclick=()=>navigate(b.dataset.pageLink));
  const input=document.querySelector('#memberSearch'); if(input)input.oninput=e=>{const q=e.target.value.toLocaleLowerCase('tr');document.querySelector('#memberResults').innerHTML=memberRows(state.members.filter(m=>(m.name+m.trainer).toLocaleLowerCase('tr').includes(q)))};
}
function navigate(page){state.page=page;document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));render()}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.page));
document.querySelector('#roleSwitch').onclick=()=>{state.role=state.role==='owner'?'member':'owner';document.querySelector('#roleSwitch span').textContent=state.role==='owner'?'İşletmeci':'Üye';document.querySelector('#roleSwitch small').textContent=state.role==='owner'?'Üye görünümü':'İşletmeci görünümü';document.querySelector('.sidebar').style.display=state.role==='member'?'none':'';document.querySelector('main').style.gridColumn=state.role==='member'?'1 / -1':'';render()};
document.querySelector('.mobile-menu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');
document.querySelector('#memberForm').onsubmit=e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const name=data.get('name').trim();
  const initials=name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toLocaleUpperCase('tr');
  const total=parseInt(data.get('package'))||12;
  state.members.unshift({name,initials,trainer:data.get('trainer'),last:'Henüz gelmedi',sessions:`0 / ${total}`,status:'Yeni',type:'warn',phone:data.get('phone')});
  localStorage.setItem('formera_members',JSON.stringify(state.members));
  document.querySelector('#memberModal').close();
  e.currentTarget.reset();
  render(); showToast(`${name} başarıyla kaydedildi.`);
};
render();
