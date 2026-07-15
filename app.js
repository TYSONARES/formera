const STORAGE_KEY = 'formera_members';
const FINANCE_STORAGE_KEY = 'formera_finance_entries';
const PROGRAM_STORAGE_KEY = 'formera_programs';
const SESSION_STORAGE_KEY = 'formera_sessions';

const starterMembers = [
  {name:'Selin Aksoy', initials:'SA', trainer:'Ece', last:'Bugün', sessions:'7 / 12', status:'Aktif', type:'good', phone:'0532 000 00 01'},
  {name:'Mert Özkan', initials:'MÖ', trainer:'Kerem', last:'9 gün önce', sessions:'2 / 12', status:'Riskli', type:'risk', phone:'0532 000 00 02'},
  {name:'Deniz Erdem', initials:'DE', trainer:'Ece', last:'3 gün önce', sessions:'9 / 12', status:'Aktif', type:'good', phone:'0532 000 00 03'},
  {name:'Buse Kılıç', initials:'BK', trainer:'Kerem', last:'6 gün önce', sessions:'11 / 12', status:'Yenileme', type:'warn', phone:'0532 000 00 04'},
  {name:'Can Aydın', initials:'CA', trainer:'Ece', last:'Dün', sessions:'5 / 8', status:'Aktif', type:'good', phone:'0532 000 00 05'}
];

const starterFinance = [
  {id:'f_1', type:'income', title:'Selin Aksoy · 12 seans paket', category:'Paket satışı', amount:9600, date:'2026-07-04', status:'paid'},
  {id:'f_2', type:'income', title:'Deniz Erdem · 8 seans paket', category:'Paket satışı', amount:6800, date:'2026-07-03', status:'paid'},
  {id:'f_3', type:'income', title:'Buse Kılıç · yenileme kaporası', category:'Tahsilat', amount:2500, date:'2026-07-02', status:'pending'},
  {id:'f_4', type:'expense', title:'Antrenör prim ödemesi', category:'Ekip', amount:7200, date:'2026-07-02', status:'paid'},
  {id:'f_5', type:'expense', title:'Kira ve stüdyo gideri', category:'Sabit gider', amount:12500, date:'2026-07-01', status:'paid'},
  {id:'f_6', type:'expense', title:'Ekipman bakım', category:'Operasyon', amount:1850, date:'2026-06-30', status:'paid'}
];

const starterPrograms = [
  {id:'p_1', title:'Alt vücut güç', goal:'Kuvvet ve form', level:'Orta', duration:48, assigned:'Selin Aksoy', exercises:['Goblet squat · 4 × 10','Romanian deadlift · 3 × 12','Walking lunge · 3 × 10','Hip thrust · 4 × 12']},
  {id:'p_2', title:'Fonksiyonel full body', goal:'Yağ yakımı ve kondisyon', level:'Başlangıç', duration:42, assigned:'Can Aydın', exercises:['Kettlebell deadlift · 3 × 12','TRX row · 3 × 10','Step-up · 3 × 12','Farmer carry · 4 tur']},
  {id:'p_3', title:'Mobilite + core', goal:'Duruş ve sakatlık önleme', level:'Herkes', duration:35, assigned:'Deniz Erdem', exercises:['Dead bug · 3 × 12','Side plank · 3 × 30 sn','World greatest stretch · 2 tur','Pallof press · 3 × 10']}
];

const starterSessions = [
  {id:'s_1', date:'2026-07-15', time:'09:30', member:'Selin Aksoy', trainer:'Ece', program:'Alt vücut güç', room:'Salon A', status:'scheduled'},
  {id:'s_2', date:'2026-07-15', time:'10:30', member:'Can Aydın', trainer:'Ece', program:'Fonksiyonel full body', room:'Salon B', status:'scheduled'},
  {id:'s_3', date:'2026-07-15', time:'11:00', member:'Buse Kılıç', trainer:'Kerem', program:'Full body yenileme', room:'Salon A', status:'scheduled'},
  {id:'s_4', date:'2026-07-15', time:'18:00', member:'Mert Özkan', trainer:'Kerem', program:'Mobilite + core', room:'Salon B', status:'scheduled'},
  {id:'s_5', date:'2026-07-14', time:'18:00', member:'Deniz Erdem', trainer:'Ece', program:'Mobilite + core', room:'Salon A', status:'done'}
];

const state = {
  role: 'owner',
  page: 'dashboard',
  calendarDate: todayISO(),
  members: starterMembers.map(normalizeMember),
  finance: starterFinance.map(normalizeFinanceEntry),
  programs: starterPrograms.map(normalizeProgram),
  sessions: starterSessions.map(normalizeSession)
};

const savedMembers = localStorage.getItem(STORAGE_KEY);
if(savedMembers){
  try{ state.members = JSON.parse(savedMembers).map(normalizeMember); }
  catch(e){ console.warn('Kayıtlı üyeler okunamadı.'); }
}

const savedFinance = localStorage.getItem(FINANCE_STORAGE_KEY);
if(savedFinance){
  try{ state.finance = JSON.parse(savedFinance).map(normalizeFinanceEntry); }
  catch(e){ console.warn('Kayıtlı finans hareketleri okunamadı.'); }
}

const savedPrograms = localStorage.getItem(PROGRAM_STORAGE_KEY);
if(savedPrograms){
  try{ state.programs = JSON.parse(savedPrograms).map(normalizeProgram); }
  catch(e){ console.warn('Kayıtlı programlar okunamadı.'); }
}

const savedSessions = localStorage.getItem(SESSION_STORAGE_KEY);
if(savedSessions){
  try{ state.sessions = JSON.parse(savedSessions).map(normalizeSession); }
  catch(e){ console.warn('Kayıtlı seanslar okunamadı.'); }
}

const money = new Intl.NumberFormat('tr-TR');
const app = document.querySelector('#appContent');
const toast = document.querySelector('#toast');
const memberModal = document.querySelector('#memberModal');
const memberForm = document.querySelector('#memberForm');
const memberModalTitle = document.querySelector('#memberModalTitle');
const memberModalEyebrow = document.querySelector('#memberModalEyebrow');
const financeModal = document.querySelector('#financeModal');
const financeForm = document.querySelector('#financeForm');
const programModal = document.querySelector('#programModal');
const programForm = document.querySelector('#programForm');
const sessionModal = document.querySelector('#sessionModal');
const sessionForm = document.querySelector('#sessionForm');

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

function normalizeFinanceEntry(entry){
  return {
    id: entry.id || makeId(),
    type: entry.type === 'expense' ? 'expense' : 'income',
    title: entry.title || 'İsimsiz işlem',
    category: entry.category || (entry.type === 'expense' ? 'Gider' : 'Gelir'),
    amount: Number(entry.amount) || 0,
    date: entry.date || new Date().toISOString().slice(0,10),
    status: entry.status === 'pending' ? 'pending' : 'paid'
  };
}

function saveFinance(){
  localStorage.setItem(FINANCE_STORAGE_KEY, JSON.stringify(state.finance));
}

function formatCurrency(value){
  return `₺${money.format(Math.round(value || 0))}`;
}

function financeSummary(){
  const income = state.finance.filter(x=>x.type === 'income').reduce((sum,x)=>sum + x.amount, 0);
  const expense = state.finance.filter(x=>x.type === 'expense').reduce((sum,x)=>sum + x.amount, 0);
  const pending = state.finance.filter(x=>x.type === 'income' && x.status === 'pending').reduce((sum,x)=>sum + x.amount, 0);
  const paidIncome = income - pending;
  const collectionRate = income ? Math.round((paidIncome / income) * 100) : 0;
  return {income, expense, net: income - expense, pending, paidIncome, collectionRate};
}

function weeklyChartData(){
  const base = [
    ['H23', 28000, 14200],
    ['H24', 33500, 16600],
    ['H25', 30200, 15100],
    ['H26', 41000, 19200],
    ['H27', 38600, 17400]
  ];
  const current = financeSummary();
  return [...base, ['H28', current.income, current.expense]];
}

function normalizeProgram(program){
  const exercises = Array.isArray(program.exercises)
    ? program.exercises
    : String(program.exercises || '').split('\n').map(x=>x.trim()).filter(Boolean);
  return {
    id: program.id || makeId(),
    title: program.title || 'Yeni program',
    goal: program.goal || 'Genel fitness',
    level: program.level || 'Başlangıç',
    duration: Number(program.duration) || 40,
    assigned: program.assigned || 'Atanmadı',
    exercises: exercises.length ? exercises : ['Isınma · 8 dk','Ana çalışma · 25 dk','Soğuma · 7 dk']
  };
}

function savePrograms(){
  localStorage.setItem(PROGRAM_STORAGE_KEY, JSON.stringify(state.programs));
}

function todayISO(){
  return new Date().toISOString().slice(0,10);
}

function normalizeSession(session){
  return {
    id: session.id || makeId(),
    date: session.date || todayISO(),
    time: session.time || '09:00',
    member: session.member || state?.members?.[0]?.name || 'Üye seçilmedi',
    trainer: session.trainer || 'Ece',
    program: session.program || state?.programs?.[0]?.title || 'Genel PT',
    room: session.room || 'Salon A',
    status: ['scheduled','done','cancelled'].includes(session.status) ? session.status : 'scheduled'
  };
}

function saveSessions(){
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state.sessions));
}

function formatDateTR(date){
  return new Date(`${date}T12:00:00`).toLocaleDateString('tr-TR', {day:'numeric', month:'long', weekday:'long'});
}

function sessionsForDate(date=todayISO()){
  return state.sessions
    .filter(session=>session.date === date)
    .sort((a,b)=>a.time.localeCompare(b.time));
}

function sessionSummary(date=todayISO()){
  const all = sessionsForDate(date);
  const done = all.filter(x=>x.status === 'done').length;
  const cancelled = all.filter(x=>x.status === 'cancelled').length;
  const scheduled = all.filter(x=>x.status === 'scheduled').length;
  const peakHour = all.reduce((acc,session)=>{
    const hour = session.time.slice(0,2);
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const busiest = Object.entries(peakHour).sort((a,b)=>b[1]-a[1])[0];
  return {total: all.length, done, cancelled, scheduled, busiest};
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

function sessionStatusLabel(status){
  return {scheduled:'Planlı', done:'Tamamlandı', cancelled:'İptal'}[status] || 'Planlı';
}

function sessionStatusClass(status){
  return {scheduled:'warn', done:'good', cancelled:'risk'}[status] || 'warn';
}

function compactSessionRows(items=sessionsForDate()){
  return items.slice(0,4).map(session=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8">
    <span>${session.time}</span>
    <div><strong>${session.member} · ${session.program}</strong><small>${session.trainer} ile · ${session.room} · ${sessionStatusLabel(session.status)}</small></div>
  </div>`).join('') || `<div class="empty-mini">Bugün için seans yok. İlk seansı takvimden ekle.</div>`;
}

function dashboard(){
  const riskyCount = state.members.filter(m=>m.type !== 'good').length;
  const finance = financeSummary();
  const chartRows = weeklyChartData();
  const maxChartValue = Math.max(...chartRows.flatMap(row=>[row[1], row[2]]), 1);
  const sessions = sessionSummary();
  return `<div class="welcome"><div><span class="eyebrow">4–10 Temmuz · 28. Hafta</span><h1>Günaydın, Ömer 👋</h1><p>Stüdyon bu hafta iyi ilerliyor. İşte dikkat isteyen noktalar.</p></div><button class="primary" data-action="new-member">+ Yeni üye</button></div>
  <section class="metrics">
    ${metric('Aktif üye',String(state.members.length),'↑ canlı veri','♙')}
    ${metric('Haftalık gelir',formatCurrency(finance.income),'canlı kayıt','₺')}
    ${metric('Bugünkü seans',String(sessions.total),`${sessions.done} tamamlandı`,'✓')}
    ${metric('Yenileme riski',String(riskyCount),'takip listesi','! ',true)}
  </section>
  <section class="dashboard-grid">
    <article class="card"><div class="card-title"><div><h2>Gelir ve gider</h2><p>Son 6 haftanın nakit hareketi</p></div><span class="badge">Net ${formatCurrency(finance.net)}</span></div><div class="chart">
      ${chartRows.map(x=>`<div class="bar-group"><i class="bar" style="height:${Math.max(8,Math.round((x[1]/maxChartValue)*92))}%"></i><i class="bar expense" style="height:${Math.max(8,Math.round((x[2]/maxChartValue)*92))}%"></i><small class="bar-label">${x[0]}</small></div>`).join('')}
    </div><div class="chart-legend"><span><i class="dot"></i>Gelir</span><span><i class="dot gray"></i>Gider</span></div></article>
    <article class="card ai-card"><span class="ai-label">✦ FORMA AI · HAFTALIK ÖZET</span><h2>${finance.net >= 0 ? 'Kârlı gidiyorsun' : 'Gider baskısı var'}, ${riskyCount || 1} üye dikkat istiyor.</h2><p>Bu haftanın neti ${formatCurrency(finance.net)}. Tahsilat oranı %${finance.collectionRate}; riskli ve yenilemeye yaklaşan üyeler için bugün takip aksiyonu öneriyorum.</p>
      <div class="insight"><span>↗</span><div><strong>${Math.min(3, riskyCount || 3)} üyeye bugün ulaş</strong><small>Bekleyen tahsilat: ${formatCurrency(finance.pending)}</small></div></div>
      <div class="insight"><span>◷</span><div><strong>${sessions.busiest ? `${sessions.busiest[0]}:00 yoğunluğu` : 'Kapasite uygun'}</strong><small>${sessions.busiest ? `${sessions.busiest[1]} seans aynı saate yakın` : 'Bugün rahat plan görünüyor'}</small></div></div>
      <button class="primary ai-action" data-action="ai-plan">Hafta planını hazırla →</button>
    </article>
    <article class="card"><div class="card-title"><div><h2>Dikkat isteyen üyeler</h2><p>Katılım ve paket durumuna göre</p></div><button class="secondary" data-page-link="members">Tümünü gör</button></div><div class="member-list">${memberRows(state.members.slice(0,4))}</div></article>
    <article class="card"><div class="card-title"><div><h2>Bugünün akışı</h2><p>${formatDateTR(todayISO())}</p></div><button class="secondary" data-page-link="calendar">${sessions.total} seans</button></div>${compactSessionRows()}</article>
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

function financeRows(items=state.finance){
  return items
    .slice()
    .sort((a,b)=>b.date.localeCompare(a.date))
    .map(entry=>`<div class="finance-row">
      <div><strong>${entry.title}</strong><small>${entry.category} · ${new Date(entry.date).toLocaleDateString('tr-TR')}</small></div>
      <span class="status ${entry.status === 'pending' ? 'warn' : 'good'}">${entry.status === 'pending' ? 'Bekliyor' : 'Ödendi'}</span>
      <strong class="${entry.type === 'expense' ? 'money-out' : 'money-in'}">${entry.type === 'expense' ? '−' : '+'}${formatCurrency(entry.amount)}</strong>
      <button class="mini-button danger" data-action="delete-finance" data-finance-id="${entry.id}">Sil</button>
    </div>`).join('');
}

function aiPlanItems(){
  const finance = financeSummary();
  const risky = state.members.filter(m=>m.type !== 'good').slice(0,3);
  const topExpense = state.finance.filter(x=>x.type === 'expense').sort((a,b)=>b.amount-a.amount)[0];
  const items = [];
  if(finance.pending > 0) items.push(`Bekleyen ${formatCurrency(finance.pending)} tahsilat için bugün ödeme hatırlatma mesajı gönder.`);
  if(risky.length) items.push(`${risky.map(m=>m.name).join(', ')} için yenileme/geri kazanım araması planla.`);
  if(topExpense) items.push(`${topExpense.category} giderini kontrol et; bu hafta en büyük gider kalemi ${formatCurrency(topExpense.amount)}.`);
  items.push('Yoğun saatlerde PT kapasitesini 1 ek blokla test et.');
  items.push('Hafta sonunda üye yedeğini indir ve pilot salon notlarını tek dosyada topla.');
  return items;
}

function financePage(){
  const finance = financeSummary();
  return `<div class="welcome"><div><span class="eyebrow">FİNANS</span><h1>Gelir & gider</h1><p>Tahsilatları, giderleri ve haftalık net kârı hızlıca takip et.</p></div><button class="primary" data-action="add-finance">+ İşlem ekle</button></div>
  <section class="metrics">
    ${metric('Toplam gelir',formatCurrency(finance.income),`%${finance.collectionRate} tahsil edildi`,'₺')}
    ${metric('Toplam gider',formatCurrency(finance.expense),'haftalık toplam','◒',true)}
    ${metric('Net kâr',formatCurrency(finance.net),finance.net >= 0 ? 'pozitif' : 'eksiye düştü','↗',finance.net < 0)}
    ${metric('Bekleyen tahsilat',formatCurrency(finance.pending),'takip gerekli','! ',finance.pending > 0)}
  </section>
  <section class="dashboard-grid">
    <article class="card">
      <div class="card-title"><div><h2>Finans hareketleri</h2><p>Gelir, gider ve bekleyen tahsilatlar</p></div><button class="secondary" data-action="add-finance">Yeni işlem</button></div>
      <div class="finance-list">${financeRows()}</div>
    </article>
    <article class="card ai-card">
      <span class="ai-label">✦ FORMA AI · KÂRLILIK PLANI</span>
      <h2>Bu hafta için 5 aksiyon</h2>
      <p>Üye riski, bekleyen tahsilat ve gider dağılımına göre kısa uygulanabilir plan.</p>
      ${aiPlanItems().map((item,index)=>`<div class="insight"><span>${index+1}</span><div><strong>${item}</strong><small>Bugünkü operasyon listesine ekle</small></div></div>`).join('')}
    </article>
  </section>`;
}

function programCards(){
  return state.programs.map(program=>`<article class="program-card">
    <div class="card-title"><div><h2>${program.title}</h2><p>${program.goal} · ${program.duration} dk</p></div><span class="badge">${program.level}</span></div>
    <div class="program-assignee"><span class="avatar">${initialsFromName(program.assigned)}</span><div><strong>${program.assigned}</strong><small>Atanan üye</small></div></div>
    <div class="program-exercises">
      ${program.exercises.slice(0,4).map((exercise,index)=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>${index+1}</span><div><strong>${exercise}</strong><small>Setleri PT onayıyla güncelle</small></div></div>`).join('')}
    </div>
    <div class="program-actions"><button class="secondary" data-action="assign-program" data-program-id="${program.id}">Üyeye gönder</button><button class="mini-button danger" data-action="delete-program" data-program-id="${program.id}">Sil</button></div>
  </article>`).join('');
}

function programsPage(){
  return `<div class="welcome"><div><span class="eyebrow">PROGRAMLAR</span><h1>Antrenman şablonları</h1><p>PT programlarını oluştur, üyeye ata ve üye arayüzünde takip ettir.</p></div><button class="primary" data-action="add-program">+ Program oluştur</button></div>
  <section class="program-grid">${programCards()}</section>`;
}

function sessionRows(items=sessionsForDate()){
  return items.map(session=>`<div class="session-row">
    <div class="session-time"><strong>${session.time}</strong><small>${session.room}</small></div>
    <div><strong>${session.member}</strong><small>${session.program} · PT ${session.trainer}</small></div>
    <span class="status ${sessionStatusClass(session.status)}">${sessionStatusLabel(session.status)}</span>
    <div class="row-actions">
      <button class="mini-button" data-action="complete-session" data-session-id="${session.id}">Tamamla</button>
      <button class="mini-button" data-action="cancel-session" data-session-id="${session.id}">İptal</button>
      <button class="mini-button danger" data-action="delete-session" data-session-id="${session.id}">Sil</button>
    </div>
  </div>`).join('') || `<div class="empty-illustration"><div><b>□</b><h2>Bu güne seans eklenmemiş</h2><p>Yeni seans oluşturarak takvimi doldur.</p></div></div>`;
}

function calendarAiNotes(date=todayISO()){
  const summary = sessionSummary(date);
  const notes = [];
  if(summary.busiest && summary.busiest[1] >= 2) notes.push(`${summary.busiest[0]}:00 çevresinde yoğunluk var; salon/ekipman çakışmasını kontrol et.`);
  if(summary.cancelled > 0) notes.push(`${summary.cancelled} iptal var; boşalan saatlere riskli üyelerden birini çağır.`);
  if(summary.scheduled > 3) notes.push('Bugün 3+ planlı seans var; PT aralarına 10 dk tampon bırak.');
  notes.push('Gün sonunda tamamlanan seansları işaretleyip üye paketlerini güncel tut.');
  return notes;
}

function calendarPage(){
  const selectedDate = state.calendarDate || todayISO();
  const summary = sessionSummary(selectedDate);
  return `<div class="welcome"><div><span class="eyebrow">TAKVİM</span><h1>Seans planlama</h1><p>Üye, PT, program ve salon eşleşmesini tek ekrandan yönet.</p></div><button class="primary" data-action="add-session">+ Seans ekle</button></div>
  <section class="metrics">
    ${metric('Toplam seans',String(summary.total),'seçili gün','□')}
    ${metric('Planlı',String(summary.scheduled),'bekleyen','◷')}
    ${metric('Tamamlanan',String(summary.done),'pakete işler','✓')}
    ${metric('İptal',String(summary.cancelled),'geri kazan','! ',summary.cancelled > 0)}
  </section>
  <section class="dashboard-grid">
    <article class="card">
      <div class="card-title"><div><h2>${formatDateTR(selectedDate)}</h2><p>Günlük akış ve durumlar</p></div><input class="date-input" id="calendarDate" type="date" value="${selectedDate}"></div>
      <div class="session-list">${sessionRows(sessionsForDate(selectedDate))}</div>
    </article>
    <article class="card ai-card">
      <span class="ai-label">✦ FORMA AI · KAPASİTE KOÇU</span>
      <h2>Günün operasyon notları</h2>
      <p>Seans yoğunluğu, iptal ve tamamlanma durumuna göre kısa aksiyon listesi.</p>
      ${calendarAiNotes(selectedDate).map((note,index)=>`<div class="insight"><span>${index+1}</span><div><strong>${note}</strong><small>Takvim aksiyonu</small></div></div>`).join('')}
    </article>
  </section>`;
}

function reportsPage(){
  const finance = financeSummary();
  const today = sessionSummary();
  const risky = state.members.filter(m=>m.type !== 'good');
  const completionRate = today.total ? Math.round((today.done / today.total) * 100) : 0;
  const avgSessionValue = today.total ? Math.round(finance.income / Math.max(today.total, 1)) : finance.income;
  const reportItems = [
    {label:'Gelir', value:formatCurrency(finance.income), note:`Net ${formatCurrency(finance.net)}`},
    {label:'Tahsilat', value:`%${finance.collectionRate}`, note:`Bekleyen ${formatCurrency(finance.pending)}`},
    {label:'Seans tamamlama', value:`%${completionRate}`, note:`${today.done}/${today.total} bugün`},
    {label:'Riskli üye', value:String(risky.length), note:'yenileme / katılım takibi'}
  ];
  const aiNotes = [
    finance.pending > 0 ? `Öncelik: ${formatCurrency(finance.pending)} bekleyen tahsilatı kapat.` : 'Tahsilat tarafı temiz görünüyor.',
    risky.length ? `${risky.slice(0,3).map(m=>m.name).join(', ')} için birebir takip listesi oluştur.` : 'Riskli üye görünmüyor; yeni satışa odaklan.',
    today.total >= 4 ? 'Seans yoğunluğu pilot için yeterli; iptal/gelmeme oranını ayrıca ölçmeye başla.' : 'Takvime daha fazla seans girilirse rapor kalitesi artar.',
    `Seans başı yaklaşık gelir göstergesi: ${formatCurrency(avgSessionValue)}.`
  ];
  return `<div class="welcome"><div><span class="eyebrow">RAPORLAR</span><h1>Haftalık performans</h1><p>Salonun gelir, tahsilat, seans ve üye risk özetini tek ekranda oku.</p></div><button class="primary" data-action="copy-report">Raporu kopyala</button></div>
  <section class="metrics">${reportItems.map(item=>metric(item.label,item.value,item.note,'↗',item.value.includes('-'))).join('')}</section>
  <section class="dashboard-grid">
    <article class="card">
      <div class="card-title"><div><h2>Operasyon özeti</h2><p>Pilot haftası için hızlı okunabilir tablo</p></div><span class="badge">${state.members.length} üye</span></div>
      <div class="report-list">
        <div><span>Aktif kayıt</span><strong>${state.members.length}</strong></div>
        <div><span>Toplam program</span><strong>${state.programs.length}</strong></div>
        <div><span>Bugünkü seans</span><strong>${today.total}</strong></div>
        <div><span>Finans hareketi</span><strong>${state.finance.length}</strong></div>
        <div><span>Net kâr</span><strong>${formatCurrency(finance.net)}</strong></div>
      </div>
    </article>
    <article class="card ai-card">
      <span class="ai-label">✦ FORMA AI · HAFTALIK RAPOR</span>
      <h2>Bu haftanın net yorumu</h2>
      <p>Mevcut pilot verisine göre uygulanabilir kısa yönetici özeti.</p>
      ${aiNotes.map((note,index)=>`<div class="insight"><span>${index+1}</span><div><strong>${note}</strong><small>Haftalık rapor maddesi</small></div></div>`).join('')}
    </article>
  </section>`;
}

function genericPage(title, desc, icon){return `<div class="welcome"><div><span class="eyebrow">NORTHFIT STUDIO</span><h1>${title}</h1><p>${desc}</p></div><button class="primary">+ Yeni oluştur</button></div><article class="card page-card"><div class="empty-illustration"><div><b>${icon}</b><h2>${title} modülü hazırlanıyor</h2><p>İlk pilot kapsamındaki veri yapısı bu ekrana bağlanacak.</p></div></div></article>`}

function memberDashboard(){
  const program = state.programs[0] || normalizeProgram({});
  return `<div class="welcome"><div><span class="eyebrow">ÜYE ALANI</span><h1>Merhaba Selin, hazırsan başlayalım.</h1><p>Bu hafta 2 antrenmanı tamamladın. Hedefine bir adım daha yakınsın.</p></div><button class="primary" data-action="start-workout">Antrenmanı başlat</button></div>
  <section class="metrics">${metric('Bu haftaki antrenman','2 / 3','1 kaldı','✓')}${metric('Toplam seans','7 / 12','5 seans kaldı','◷')}${metric('Seri','3 hafta','Kişisel rekor','↗')}${metric('Son ölçüm','−1,8 kg','Son 30 gün','◎')}</section>
  <section class="dashboard-grid"><article class="card"><div class="card-title"><div><h2>Bugünkü program</h2><p>${program.title} · ${program.duration} dakika</p></div><span class="badge">${program.level}</span></div>
  ${program.exercises.map((x,i)=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>${i+1}</span><div><strong>${x}</strong><small>Dinlenme 60–90 saniye</small></div></div>`).join('')}</article>
  <article class="card ai-card"><span class="ai-label">✦ FORMA AI</span><h2>İstikrarlı gidiyorsun.</h2><p>${program.goal} hedefi için son üç haftadır programına %89 uyum gösterdin. Bugün ağırlık artırmadan formu koruman daha iyi olabilir.</p><button class="primary ai-action" data-action="coach-tip">Koç notunu gör →</button></article></section>`}

const pages={programs:['Programlar','Antrenman şablonlarını oluştur ve üyelere ata.','▤'],calendar:['Takvim','PT seanslarını ve stüdyo kapasitesini planla.','□'],finance:['Finans','Gelir, gider ve tahsilat hareketlerini yönet.','₺'],reports:['Raporlar','Haftalık ve aylık performansı karşılaştır.','↗'],team:['Ekip','Antrenörleri, görevleri ve performansı izle.','♧']};

function render(){
  const count = document.querySelector('#memberCount');
  if(count) count.textContent = state.members.length;
  if(state.role==='member'){app.innerHTML=memberDashboard();return bind()}
  app.innerHTML=state.page==='dashboard'?dashboard():state.page==='members'?memberPage():state.page==='programs'?programsPage():state.page==='calendar'?calendarPage():state.page==='finance'?financePage():state.page==='reports'?reportsPage():genericPage(...pages[state.page]); bind();
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

function openFinanceModal(){
  financeForm.reset();
  financeForm.elements.date.value = new Date().toISOString().slice(0,10);
  financeModal.showModal();
}

function deleteFinanceEntry(id){
  const entry = state.finance.find(x=>x.id === id);
  if(!entry) return;
  if(!confirm(`${entry.title} işlemini silmek istiyor musun?`)) return;
  state.finance = state.finance.filter(x=>x.id !== id);
  saveFinance();
  render();
  showToast('Finans işlemi silindi.');
}

function showAiPlan(){
  showToast(`Forma AI planı hazır: ${aiPlanItems()[0]}`);
  if(state.page !== 'finance') navigate('finance');
}

function openProgramModal(){
  programForm.reset();
  programModal.showModal();
}

function deleteProgram(id){
  const program = state.programs.find(x=>x.id === id);
  if(!program) return;
  if(!confirm(`${program.title} programını silmek istiyor musun?`)) return;
  state.programs = state.programs.filter(x=>x.id !== id);
  savePrograms();
  render();
  showToast('Program silindi.');
}

function assignProgram(id){
  const program = state.programs.find(x=>x.id === id);
  if(!program) return;
  showToast(`${program.title}, ${program.assigned} üye ekranına gönderildi.`);
}

function openSessionModal(){
  sessionForm.reset();
  sessionForm.elements.date.value = state.calendarDate || todayISO();
  sessionForm.elements.time.value = '09:00';
  sessionForm.elements.member.value = state.members[0]?.name || '';
  sessionForm.elements.program.value = state.programs[0]?.title || '';
  sessionModal.showModal();
}

function completeSession(id){
  const session = state.sessions.find(x=>x.id === id);
  if(!session) return;
  if(session.status !== 'done'){
    session.status = 'done';
    const member = state.members.find(m=>m.name === session.member);
    if(member){
      const {used,total} = parseSessions(member.sessions);
      member.sessions = `${Math.min(used + 1, total)} / ${total}`;
      member.last = 'Bugün';
      Object.assign(member, statusFor(member));
      saveMembers();
    }
  }
  saveSessions();
  render();
  showToast(`${session.member} seansı tamamlandı.`);
}

function cancelSession(id){
  const session = state.sessions.find(x=>x.id === id);
  if(!session) return;
  session.status = 'cancelled';
  saveSessions();
  render();
  showToast(`${session.member} seansı iptal edildi.`);
}

function deleteSession(id){
  const session = state.sessions.find(x=>x.id === id);
  if(!session) return;
  if(!confirm(`${session.member} ${session.time} seansını silmek istiyor musun?`)) return;
  state.sessions = state.sessions.filter(x=>x.id !== id);
  saveSessions();
  render();
  showToast('Seans silindi.');
}

function copyReport(){
  const finance = financeSummary();
  const today = sessionSummary();
  const risky = state.members.filter(m=>m.type !== 'good');
  const text = [
    'Formera Haftalık Rapor',
    `Üye: ${state.members.length}`,
    `Gelir: ${formatCurrency(finance.income)}`,
    `Gider: ${formatCurrency(finance.expense)}`,
    `Net: ${formatCurrency(finance.net)}`,
    `Bekleyen tahsilat: ${formatCurrency(finance.pending)}`,
    `Bugünkü seans: ${today.total}`,
    `Riskli üye: ${risky.map(m=>m.name).join(', ') || 'Yok'}`
  ].join('\n');
  navigator.clipboard?.writeText(text);
  showToast('Haftalık rapor panoya kopyalandı.');
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
    if(action==='add-finance') return openFinanceModal();
    if(action==='delete-finance') return deleteFinanceEntry(b.dataset.financeId);
    if(action==='ai-plan') return showAiPlan();
    if(action==='add-program') return openProgramModal();
    if(action==='delete-program') return deleteProgram(b.dataset.programId);
    if(action==='assign-program') return assignProgram(b.dataset.programId);
    if(action==='add-session') return openSessionModal();
    if(action==='complete-session') return completeSession(b.dataset.sessionId);
    if(action==='cancel-session') return cancelSession(b.dataset.sessionId);
    if(action==='delete-session') return deleteSession(b.dataset.sessionId);
    if(action==='copy-report') return copyReport();
    showToast({
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
  const calendarDate = document.querySelector('#calendarDate');
  if(calendarDate) calendarDate.onchange=e=>{state.calendarDate = e.target.value; render();};
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

financeForm.onsubmit=e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const amount = Number(String(data.get('amount')).replaceAll('.','').replace(',','.'));
  const entry = normalizeFinanceEntry({
    id: makeId(),
    title: data.get('title').trim(),
    type: data.get('type'),
    amount,
    category: data.get('category').trim() || (data.get('type') === 'expense' ? 'Gider' : 'Gelir'),
    date: data.get('date') || new Date().toISOString().slice(0,10),
    status: data.get('status')
  });
  state.finance.unshift(entry);
  saveFinance();
  financeModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${entry.type === 'expense' ? 'Gider' : 'Gelir'} kaydedildi: ${formatCurrency(entry.amount)}`);
};

programForm.onsubmit=e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const program = normalizeProgram({
    id: makeId(),
    title: data.get('title').trim(),
    goal: data.get('goal').trim(),
    level: data.get('level'),
    duration: data.get('duration'),
    assigned: data.get('assigned').trim() || 'Atanmadı',
    exercises: data.get('exercises')
  });
  state.programs.unshift(program);
  savePrograms();
  programModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${program.title} programı oluşturuldu.`);
};

sessionForm.onsubmit=e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const session = normalizeSession({
    id: makeId(),
    date: data.get('date'),
    time: data.get('time'),
    member: data.get('member').trim(),
    trainer: data.get('trainer'),
    program: data.get('program').trim() || 'Genel PT',
    room: data.get('room'),
    status: 'scheduled'
  });
  state.sessions.push(session);
  state.calendarDate = session.date;
  saveSessions();
  sessionModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${session.member} için ${session.time} seansı eklendi.`);
};

render();
