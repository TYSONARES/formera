const STORAGE_KEY = 'formera_members';

const starterMembers = [
  {name:'Selin Aksoy', initials:'SA', trainer:'Ece', last:'Bugün', sessions:'7 / 12', status:'Aktif', type:'good', phone:'0532 000 00 01'},
  {name:'Mert Özkan', initials:'MÖ', trainer:'Kerem', last:'9 gün önce', sessions:'2 / 12', status:'Riskli', type:'risk', phone:'0532 000 00 02'},
  {name:'Deniz Erdem', initials:'DE', trainer:'Ece', last:'3 gün önce', sessions:'9 / 12', status:'Aktif', type:'good', phone:'0532 000 00 03'},
  {name:'Buse Kılıç', initials:'BK', trainer:'Kerem', last:'6 gün önce', sessions:'11 / 12', status:'Yenileme', type:'warn', phone:'0532 000 00 04'},
  {name:'Can Aydın', initials:'CA', trainer:'Ece', last:'Dün', sessions:'5 / 8', status:'Aktif', type:'good', phone:'0532 000 00 05'}
];

const state = {
  role: 'owner',
  page: 'dashboard',
  members: starterMembers.map(normalizeMember)
};

const savedMembers = localStorage.getItem(STORAGE_KEY);
if(savedMembers){
  try{ state.members = JSON.parse(savedMembers).map(normalizeMember); }
  catch(e){ console.warn('Kayıtlı üyeler okunamadı.'); }
}

const money = new Intl.NumberFormat('tr-TR');
const app = document.querySelector('#appContent');
const toast = document.querySelector('#toast');
const memberModal = document.querySelector('#memberModal');
const memberForm = document.querySelector('#memberForm');
const memberModalTitle = document.querySelector('#memberModalTitle');
const memberModalEyebrow = document.querySelector('#memberModalEyebrow');

function makeId(){
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function initialsFromName(name){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toLocaleUpperCase('tr');
}

function parseSessions(value='0 / 12'){
  const [used='0', total='12'] = String(value).split('/').map(x=>parseInt(x.trim(),10));
  return {used: Number.isFinite(used) ? used : 0, total: Number.isFinite(total) ? total : 12};
}

function parsePackageTotal(value='12 Seans'){
  const total = parseInt(value,10);
  return Number.isFinite(total) ? total : 12;
}

function statusFor(member){
  const {used,total} = parseSessions(member.sessions);
  const remaining = total - used;
  if(member.last.includes('9 gün') || member.last.includes('8 gün')) return {status:'Riskli', type:'risk'};
  if(remaining <= 2) return {status:'Yenileme', type:'warn'};
  if(member.status === 'Yeni') return {status:'Yeni', type:'warn'};
  return {status:'Aktif', type:'good'};
}

function normalizeMember(member){
  const normalized = {
    id: member.id || makeId(),
    name: member.name || 'İsimsiz Üye',
    initials: member.initials || initialsFromName(member.name || 'İsimsiz Üye'),
    trainer: member.trainer || 'Ece',
    last: member.last || 'Henüz gelmedi',
    sessions: member.sessions || '0 / 12',
    status: member.status || 'Aktif',
    type: member.type || 'good',
    phone: member.phone || ''
  };
  return {...normalized, ...statusFor(normalized)};
}

function saveMembers(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.members));
}

function metric(title, value, delta, icon, down=false){
  return `<article class="metric"><div class="metric-head"><span>${title}</span><span class="metric-icon">${icon}</span></div><strong>${value}</strong><span class="delta ${down?'down':''}">${delta} <em>geçen haftaya göre</em></span></article>`;
}

function escapeAttr(value=''){
  return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function memberRows(items=state.members){
  return items.map(m=>`<div class="member-row">
    <div class="member"><span class="avatar">${m.initials}</span><div><strong>${m.name}</strong><small>PT: ${m.trainer}${m.phone ? ` · ${m.phone}` : ''}</small></div></div>
    <span><small class="cell-label">Son ziyaret</small><br>${m.last}</span>
    <span><small class="cell-label">Seans</small><br>${m.sessions}</span>
    <span class="status ${m.type}">${m.status}</span>
    <div class="row-actions">
      <button class="mini-button" data-action="checkin-member" data-member-id="${m.id}">Geldi</button>
      <button class="mini-button" data-action="edit-member" data-member-id="${m.id}">Düzenle</button>
      <button class="mini-button danger" data-action="delete-member" data-member-id="${m.id}">Sil</button>
    </div>
  </div>`).join('');
}

function dashboard(){
  const riskyCount = state.members.filter(m=>m.type !== 'good').length;
  return `<div class="welcome"><div><span class="eyebrow">4–10 Temmuz · 28. Hafta</span><h1>Günaydın, Ömer 👋</h1><p>Stüdyon bu hafta iyi ilerliyor. İşte dikkat isteyen noktalar.</p></div><button class="primary" data-action="new-member">+ Yeni üye</button></div>
  <section class="metrics">
    ${metric('Aktif üye',String(state.members.length),'↑ canlı veri','♙')}
    ${metric('Haftalık gelir','₺42.850','↑ %12','₺')}
    ${metric('Tamamlanan seans','126','↑ %8','✓')}
    ${metric('Yenileme riski',String(riskyCount),'takip listesi','! ',true)}
  </section>
  <section class="dashboard-grid">
    <article class="card"><div class="card-title"><div><h2>Gelir ve gider</h2><p>Son 6 haftanın nakit hareketi</p></div><span class="badge">Net +₺27.600</span></div><div class="chart">
      ${[['H23',51,30],['H24',64,38],['H25',57,34],['H26',74,43],['H27',69,40],['H28',86,36]].map(x=>`<div class="bar-group"><i class="bar" style="height:${x[1]}%"></i><i class="bar expense" style="height:${x[2]}%"></i><small class="bar-label">${x[0]}</small></div>`).join('')}
    </div><div class="chart-legend"><span><i class="dot"></i>Gelir</span><span><i class="dot gray"></i>Gider</span></div></article>
    <article class="card ai-card"><span class="ai-label">✦ FORMA AI · HAFTALIK ÖZET</span><h2>Bu hafta büyüme var, ancak ${riskyCount || 1} üye dikkat istiyor.</h2><p>Gelirin %12 arttı. Seans katılımı güçlü; fakat riskli ve yenilemeye yaklaşan üyeler için bugün takip aksiyonu öneriyorum.</p>
      <div class="insight"><span>↗</span><div><strong>${Math.min(3, riskyCount || 3)} üyeye bugün ulaş</strong><small>Yenileme ihtimali yüksek · ₺9.600 potansiyel</small></div></div>
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

function memberPage(){
  return `<div class="welcome"><div><span class="eyebrow">ÜYE YÖNETİMİ</span><h1>Üyeler</h1><p>Tüm üyeleri, paketleri ve katılım durumlarını tek yerden izle.</p></div><button class="primary" data-action="new-member">+ Yeni üye</button></div>
  <article class="card page-card">
    <div class="page-toolbar">
      <input id="memberSearch" placeholder="İsim veya antrenör ara...">
      <button class="secondary" data-action="export-members">Yedek al</button>
      <button class="secondary" data-action="import-members">Yedek yükle</button>
      <input id="memberImport" type="file" accept="application/json" hidden>
    </div>
    <div id="memberResults">${memberRows()}</div>
  </article>`;
}

function genericPage(title, desc, icon){return `<div class="welcome"><div><span class="eyebrow">NORTHFIT STUDIO</span><h1>${title}</h1><p>${desc}</p></div><button class="primary">+ Yeni oluştur</button></div><article class="card page-card"><div class="empty-illustration"><div><b>${icon}</b><h2>${title} modülü hazırlanıyor</h2><p>İlk pilot kapsamındaki veri yapısı bu ekrana bağlanacak.</p></div></div></article>`}

function memberDashboard(){return `<div class="welcome"><div><span class="eyebrow">ÜYE ALANI</span><h1>Merhaba Selin, hazırsan başlayalım.</h1><p>Bu hafta 2 antrenmanı tamamladın. Hedefine bir adım daha yakınsın.</p></div><button class="primary" data-action="start-workout">Antrenmanı başlat</button></div>
  <section class="metrics">${metric('Bu haftaki antrenman','2 / 3','1 kaldı','✓')}${metric('Toplam seans','7 / 12','5 seans kaldı','◷')}${metric('Seri','3 hafta','Kişisel rekor','↗')}${metric('Son ölçüm','−1,8 kg','Son 30 gün','◎')}</section>
  <section class="dashboard-grid"><article class="card"><div class="card-title"><div><h2>Bugünkü program</h2><p>Alt vücut · 48 dakika</p></div><span class="badge">PT Ece</span></div>
  ${['Goblet squat · 4 × 10','Romanian deadlift · 3 × 12','Walking lunge · 3 × 10','Hip thrust · 4 × 12'].map((x,i)=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>${i+1}</span><div><strong>${x}</strong><small>Dinlenme 60–90 saniye</small></div></div>`).join('')}</article>
  <article class="card ai-card"><span class="ai-label">✦ FORMA AI</span><h2>İstikrarlı gidiyorsun.</h2><p>Son üç haftadır programına %89 uyum gösterdin. Bugün squat ağırlığını artırmadan formunu koruman daha iyi olabilir.</p><button class="primary ai-action" data-action="coach-tip">Koç notunu gör →</button></article></section>`}

const pages={programs:['Programlar','Antrenman şablonlarını oluştur ve üyelere ata.','▤'],calendar:['Takvim','PT seanslarını ve stüdyo kapasitesini planla.','□'],finance:['Finans','Gelir, gider ve tahsilat hareketlerini yönet.','₺'],reports:['Raporlar','Haftalık ve aylık performansı karşılaştır.','↗'],team:['Ekip','Antrenörleri, görevleri ve performansı izle.','♧']};

function render(){
  const count = document.querySelector('#memberCount');
  if(count) count.textContent = state.members.length;
  if(state.role==='member'){app.innerHTML=memberDashboard();return bind()}
  app.innerHTML=state.page==='dashboard'?dashboard():state.page==='members'?memberPage():genericPage(...pages[state.page]); bind();
}

function openMemberModal(member){
  memberForm.reset();
  memberForm.dataset.editingId = member?.id || '';
  memberModalEyebrow.textContent = member ? 'KAYIT DÜZENLE' : 'YENİ KAYIT';
  memberModalTitle.textContent = member ? 'Üye bilgilerini düzenle' : 'Yeni üye ekle';
  if(member){
    memberForm.elements.name.value = member.name;
    memberForm.elements.trainer.value = member.trainer;
    memberForm.elements.package.value = `${parseSessions(member.sessions).total} Seans`;
    memberForm.elements.phone.value = member.phone || '';
  }
  memberModal.showModal();
}

function checkInMember(id){
  const member = state.members.find(m=>m.id === id);
  if(!member) return;
  const {used,total} = parseSessions(member.sessions);
  member.sessions = `${Math.min(used + 1, total)} / ${total}`;
  member.last = 'Bugün';
  Object.assign(member, statusFor(member));
  saveMembers();
  render();
  showToast(`${member.name} için seans işlendi.`);
}

function deleteMember(id){
  const member = state.members.find(m=>m.id === id);
  if(!member) return;
  if(!confirm(`${member.name} kaydını silmek istiyor musun?`)) return;
  state.members = state.members.filter(m=>m.id !== id);
  saveMembers();
  render();
  showToast(`${member.name} silindi.`);
}

function exportMembers(){
  const payload = JSON.stringify({exportedAt:new Date().toISOString(), members:state.members}, null, 2);
  const blob = new Blob([payload], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `formera-uye-yedek-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Üye yedeği indirildi.');
}

function importMembers(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const data = JSON.parse(reader.result);
      const imported = Array.isArray(data) ? data : data.members;
      if(!Array.isArray(imported)) throw new Error('Geçersiz yedek');
      state.members = imported.map(normalizeMember);
      saveMembers();
      render();
      showToast(`${state.members.length} üye yedekten yüklendi.`);
    }catch(e){
      showToast('Yedek dosyası okunamadı.');
    }
  };
  reader.readAsText(file);
}

function bind(){
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{
    const action = b.dataset.action;
    if(action==='new-member') return openMemberModal();
    if(action==='edit-member') return openMemberModal(state.members.find(m=>m.id === b.dataset.memberId));
    if(action==='delete-member') return deleteMember(b.dataset.memberId);
    if(action==='checkin-member') return checkInMember(b.dataset.memberId);
    if(action==='export-members') return exportMembers();
    if(action==='import-members') return document.querySelector('#memberImport')?.click();
    showToast({
      'ai-plan':'Forma AI, 5 maddelik hafta planını hazırladı.',
      'start-workout':'Antrenman modu başlatıldı. Hadi bakalım! 💪',
      'coach-tip':'Ece’nin notu: Tempo kontrollü, form öncelikli.'
    }[action]);
  });
  document.querySelectorAll('[data-page-link]').forEach(b=>b.onclick=()=>navigate(b.dataset.pageLink));
  const input=document.querySelector('#memberSearch');
  if(input) input.oninput=e=>{
    const q=e.target.value.toLocaleLowerCase('tr');
    document.querySelector('#memberResults').innerHTML=memberRows(state.members.filter(m=>(m.name+m.trainer+m.phone).toLocaleLowerCase('tr').includes(q)));
    bind();
  };
  const importer = document.querySelector('#memberImport');
  if(importer) importer.onchange=e=>importMembers(e.target.files[0]);
}

function navigate(page){state.page=page;document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));render()}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}

document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.page));
document.querySelector('#roleSwitch').onclick=()=>{state.role=state.role==='owner'?'member':'owner';document.querySelector('#roleSwitch span').textContent=state.role==='owner'?'İşletmeci':'Üye';document.querySelector('#roleSwitch small').textContent=state.role==='owner'?'Üye görünümü':'İşletmeci görünümü';document.querySelector('.sidebar').style.display=state.role==='member'?'none':'';document.querySelector('main').style.gridColumn=state.role==='member'?'1 / -1':'';render()};
document.querySelector('.mobile-menu').onclick=()=>document.querySelector('.sidebar').classList.toggle('open');

memberForm.onsubmit=e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const name=data.get('name').trim();
  const total=parsePackageTotal(data.get('package'));
  const editingId = e.currentTarget.dataset.editingId;
  const current = editingId ? state.members.find(m=>m.id === editingId) : null;
  const sessions = current ? `${parseSessions(current.sessions).used} / ${total}` : `0 / ${total}`;
  const member = normalizeMember({
    ...(current || {}),
    id: current?.id || makeId(),
    name,
    initials: initialsFromName(name),
    trainer:data.get('trainer'),
    last: current?.last || 'Henüz gelmedi',
    sessions,
    status: current?.status || 'Yeni',
    type: current?.type || 'warn',
    phone:data.get('phone')
  });
  if(current){
    state.members = state.members.map(m=>m.id === editingId ? member : m);
  }else{
    state.members.unshift(member);
  }
  saveMembers();
  memberModal.close();
  e.currentTarget.reset();
  e.currentTarget.dataset.editingId = '';
  render();
  showToast(`${name} kaydı ${current ? 'güncellendi' : 'oluşturuldu'}.`);
};

render();
