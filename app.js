const STORAGE_KEY = 'formera_members';
const FINANCE_STORAGE_KEY = 'formera_finance_entries';
const PROGRAM_STORAGE_KEY = 'formera_programs';
const SESSION_STORAGE_KEY = 'formera_sessions';
const TEAM_STORAGE_KEY = 'formera_team';
const STUDIO_STORAGE_KEY = 'formera_studios';
const ACTIVE_STUDIO_STORAGE_KEY = 'formera_active_studio';
const SIGNATURE_STORAGE_KEY = 'formera_signatures';
const PROGRAM_SELECTION_STORAGE_KEY = 'formera_program_selections';
const TRAINER_TASK_STORAGE_KEY = 'formera_trainer_tasks';
const MEMBER_TASK_STORAGE_KEY = 'formera_member_tasks';
const PILOT_LEAD_STORAGE_KEY = 'formera_pilot_leads';
const SUPABASE_CONFIG_STORAGE_KEY = 'formera_supabase_config';
const ONBOARDING_STORAGE_KEY = 'formera_onboarding_complete';

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

const starterTeam = [
  {id:'t_1', name:'Ece', role:'Head Coach', specialty:'Kuvvet · postür', phone:'0532 100 10 10', commission:18},
  {id:'t_2', name:'Kerem', role:'PT Coach', specialty:'Fonksiyonel · kilo kontrol', phone:'0532 200 20 20', commission:16}
];

const starterTrainerTasks = [
  {id:'tt_1', trainer:'Ece', title:'Riskli üyeleri ara', note:'Selin ve Can için seans sonrası kısa geri bildirim notu ekle.', priority:'high', dueDate:'2026-07-16', status:'open'},
  {id:'tt_2', trainer:'Kerem', title:'Yenileme önerisi hazırla', note:'Paket bitimine yaklaşan üyeler için 8 seanslık yenileme önerisi çıkar.', priority:'medium', dueDate:'2026-07-17', status:'open'}
];

const starterMemberTasks = [
  {id:'mt_1', member:'Selin Aksoy', trainer:'Ece', type:'workout', title:'Kalça aktivasyon ödevi', note:'Seans olmayan günlerde band walk 3 × 15 ve glute bridge 3 × 12 uygula.', dueDate:'2026-07-18', status:'open'},
  {id:'mt_2', member:'Can Aydın', trainer:'Ece', type:'nutrition', title:'Protein takibi', note:'Bugün her ana öğüne bir protein kaynağı ekle ve su tüketimini 2 litreye tamamla.', dueDate:'2026-07-18', status:'open'},
  {id:'mt_3', member:'Mert Özkan', trainer:'Kerem', type:'followup', title:'Haftalık kilo notu', note:'Sabah aç karnına kilo ölçümünü ve kısa enerji durumunu antrenörüne ilet.', dueDate:'2026-07-19', status:'open'}
];

const starterStudios = [
  {id:'studio_1', name:'NorthFit Studio', initials:'NF', location:'Kadıköy · İstanbul', status:'Pilot aktif'},
  {id:'studio_2', name:'CoreLab PT', initials:'CL', location:'Ataşehir · İstanbul', status:'Kurulum'},
  {id:'studio_3', name:'Pulse Studio', initials:'PS', location:'Beşiktaş · İstanbul', status:'Demo'},
  {id:'studio_4', name:'Forma PT', initials:'FP', location:'Bakırköy · İstanbul', status:'Pilot aktif'}
];

const starterPilotLeads = [
  {id:'lead_1', name:'Ayhan Demir', studio:'CoreLab PT', city:'İstanbul', phone:'0532 400 40 40', members:'51–150', goal:'Antrenör takibini görünür yapmak', stage:'pilot', nextAction:'Gün 7 kullanım raporunu paylaş', value:1490},
  {id:'lead_2', name:'Ebru Kaan', studio:'Pulse Studio', city:'İstanbul', phone:'0532 500 50 50', members:'0–50', goal:'Üye program takibini artırmak', stage:'demo', nextAction:'Demo sonrası 3 üye eklet', value:990},
  {id:'lead_3', name:'Caner Soylu', studio:'Forma PT', city:'İstanbul', phone:'0532 600 60 60', members:'151–300', goal:'AI destekli pilot denemek', stage:'proposal', nextAction:'Studio AI teklifini gönder', value:2490}
];

function initialPageFromUrl(){
  const allowedPages = ['dashboard','members','programs','calendar','finance','reports','team','pilot'];
  const params = new URLSearchParams(window.location.search);
  const requestedPage = params.get('page') || window.location.hash.replace('#', '');
  return allowedPages.includes(requestedPage) ? requestedPage : 'dashboard';
}

const state = {
  role: 'owner',
  trainerName: 'Ece',
  page: initialPageFromUrl(),
  calendarDate: todayISO(),
  members: starterMembers.map(normalizeMember),
  finance: starterFinance.map(normalizeFinanceEntry),
  programs: starterPrograms.map(normalizeProgram),
  sessions: starterSessions.map(normalizeSession),
  team: starterTeam.map(normalizeTrainer),
  trainerTasks: starterTrainerTasks.map(normalizeTrainerTask),
  memberTasks: starterMemberTasks.map(normalizeMemberTask),
  pilotLeads: starterPilotLeads.map(normalizePilotLead),
  studios: starterStudios.map(normalizeStudio),
  activeStudioId: localStorage.getItem(ACTIVE_STUDIO_STORAGE_KEY) || 'studio_1',
  signatures: [],
  programSelections: {},
  backend: {
    configured: false,
    connected: false,
    loading: false,
    error: '',
    client: null,
    user: null,
    profile: null,
    studioId: null,
    brandingReady: false,
    accountsReady: false,
    trainerTasksReady: false,
    memberTasksReady: false
  }
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

const savedTeam = localStorage.getItem(TEAM_STORAGE_KEY);
if(savedTeam){
  try{ state.team = JSON.parse(savedTeam).map(normalizeTrainer); }
  catch(e){ console.warn('Kayıtlı ekip okunamadı.'); }
}

const savedTrainerTasks = localStorage.getItem(TRAINER_TASK_STORAGE_KEY);
if(savedTrainerTasks){
  try{ state.trainerTasks = JSON.parse(savedTrainerTasks).map(normalizeTrainerTask); }
  catch(e){ console.warn('Kayıtlı antrenör görevleri okunamadı.'); }
}

const savedMemberTasks = localStorage.getItem(MEMBER_TASK_STORAGE_KEY);
if(savedMemberTasks){
  try{ state.memberTasks = JSON.parse(savedMemberTasks).map(normalizeMemberTask); }
  catch(e){ console.warn('Kayıtlı üye aksiyonları okunamadı.'); }
}

const savedPilotLeads = localStorage.getItem(PILOT_LEAD_STORAGE_KEY);
if(savedPilotLeads){
  try{ state.pilotLeads = JSON.parse(savedPilotLeads).map(normalizePilotLead); }
  catch(e){ console.warn('Kayıtlı pilot leadleri okunamadı.'); }
}

const savedStudios = localStorage.getItem(STUDIO_STORAGE_KEY);
if(savedStudios){
  try{ state.studios = JSON.parse(savedStudios).map(normalizeStudio); }
  catch(e){ console.warn('Kayıtlı stüdyolar okunamadı.'); }
}

const savedSignatures = localStorage.getItem(SIGNATURE_STORAGE_KEY);
if(savedSignatures){
  try{ state.signatures = JSON.parse(savedSignatures).map(normalizeSignature); }
  catch(e){ console.warn('Kayıtlı imzalar okunamadı.'); }
}

const savedProgramSelections = localStorage.getItem(PROGRAM_SELECTION_STORAGE_KEY);
if(savedProgramSelections){
  try{ state.programSelections = JSON.parse(savedProgramSelections); }
  catch(e){ console.warn('Kayıtlı program seçimleri okunamadı.'); }
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
const trainerModal = document.querySelector('#trainerModal');
const trainerForm = document.querySelector('#trainerForm');
const trainerTaskModal = document.querySelector('#trainerTaskModal');
const trainerTaskForm = document.querySelector('#trainerTaskForm');
const memberTaskModal = document.querySelector('#memberTaskModal');
const memberTaskForm = document.querySelector('#memberTaskForm');
const pilotLeadModal = document.querySelector('#pilotLeadModal');
const pilotLeadForm = document.querySelector('#pilotLeadForm');
const signatureModal = document.querySelector('#signatureModal');
const signatureForm = document.querySelector('#signatureForm');
const signatureCanvas = document.querySelector('#signatureCanvas');
const studioBrandModal = document.querySelector('#studioBrandModal');
const studioBrandForm = document.querySelector('#studioBrandForm');
const onboardingModal = document.querySelector('#onboardingModal');
const onboardingForm = document.querySelector('#onboardingForm');
const aiAssistantModal = document.querySelector('#aiAssistantModal');
const aiAssistantBody = document.querySelector('#aiAssistantBody');
const supabaseModal = document.querySelector('#supabaseModal');
const supabaseConfigForm = document.querySelector('#supabaseConfigForm');
const supabaseAuthForm = document.querySelector('#supabaseAuthForm');
const accountSummary = document.querySelector('#accountSummary');
const accountAlert = document.querySelector('#accountAlert');
const signupSupabaseButton = document.querySelector('#signupSupabase');
const togglePasswordButton = document.querySelector('#togglePassword');
const loginRoleNote = document.querySelector('#loginRoleNote');
const loginEmailLabel = document.querySelector('#loginEmailLabel');
const loginRoleTabs = document.querySelectorAll('[data-login-role]');
let signaturePadReady = false;
let signatureDrawing = false;
let selectedLoginRole = localStorage.getItem('formera_login_role') || 'owner';
let onboardingStep = 0;

function makeId(){
  return crypto?.randomUUID ? crypto.randomUUID() : `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
    studioId: member.studioId || member.studio_id || null,
    profileId: member.profileId || member.profile_id || null,
    authUserId: member.authUserId || member.auth_user_id || null,
    trainerProfileId: member.trainerProfileId || member.trainer_profile_id || null,
    name: member.name || 'İsimsiz Üye',
    initials: member.initials || initialsFromName(member.name || 'İsimsiz Üye'),
    avatarDataUrl: member.avatarDataUrl || member.avatar_data_url || '',
    trainer: member.trainer || 'Ece',
    last: member.last || 'Henüz gelmedi',
    sessions: member.sessions || '0 / 12',
    status: member.status || 'Aktif',
    type: member.type || 'good',
    phone: member.phone || '',
    email: member.email || ''
  };
  return {...normalized, ...statusFor(normalized)};
}

function saveMembers(){
  ensureAccountProfileIds();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.members));
  syncMembersToSupabase();
}

function normalizeFinanceEntry(entry){
  return {
    id: entry.id || makeId(),
    studioId: entry.studioId || entry.studio_id || null,
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
  syncFinanceToSupabase();
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
    studioId: program.studioId || program.studio_id || null,
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
  syncProgramsToSupabase();
}

function todayISO(){
  return new Date().toISOString().slice(0,10);
}

function normalizeSession(session){
  return {
    id: session.id || makeId(),
    studioId: session.studioId || session.studio_id || null,
    memberId: session.memberId || session.member_id || null,
    trainerProfileId: session.trainerProfileId || session.trainer_profile_id || null,
    programId: session.programId || session.program_id || null,
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
  syncSessionsToSupabase();
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

function normalizeTrainer(trainer){
  return {
    id: trainer.id || makeId(),
    profileId: trainer.profileId || trainer.profile_id || trainer.id || null,
    authUserId: trainer.authUserId || trainer.auth_user_id || null,
    name: trainer.name || 'Yeni antrenör',
    role: trainer.role || 'PT Coach',
    specialty: trainer.specialty || 'Genel fitness',
    phone: trainer.phone || '',
    commission: Number(trainer.commission) || 15,
    avatarDataUrl: trainer.avatarDataUrl || trainer.avatar_data_url || '',
    email: trainer.email || ''
  };
}

function saveTeam(){
  ensureAccountProfileIds();
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(state.team));
  syncTeamToSupabase();
}

function normalizeTrainerTask(task){
  return {
    id: task.id || makeId(),
    studioId: task.studioId || task.studio_id || null,
    trainerProfileId: task.trainerProfileId || task.trainer_profile_id || null,
    trainer: task.trainer || 'Ece',
    title: task.title || 'Yeni görev',
    note: task.note || '',
    priority: ['low','medium','high'].includes(task.priority) ? task.priority : 'medium',
    dueDate: task.dueDate || task.due_date || todayISO(),
    status: ['open','done'].includes(task.status) ? task.status : 'open',
    createdAt: task.createdAt || task.created_at || new Date().toISOString(),
    completedAt: task.completedAt || task.completed_at || null
  };
}

function saveTrainerTasks(){
  localStorage.setItem(TRAINER_TASK_STORAGE_KEY, JSON.stringify(state.trainerTasks));
  syncTrainerTasksToSupabase();
}

function normalizeMemberTask(task){
  return {
    id: task.id || makeId(),
    studioId: task.studioId || task.studio_id || null,
    memberId: task.memberId || task.member_id || null,
    trainerProfileId: task.trainerProfileId || task.trainer_profile_id || null,
    member: task.member || 'Üye seçilmedi',
    trainer: task.trainer || 'Ece',
    type: ['workout','nutrition','followup'].includes(task.type) ? task.type : 'followup',
    title: task.title || 'Yeni aksiyon',
    note: task.note || '',
    dueDate: task.dueDate || task.due_date || todayISO(),
    status: ['open','done'].includes(task.status) ? task.status : 'open',
    createdAt: task.createdAt || task.created_at || new Date().toISOString(),
    completedAt: task.completedAt || task.completed_at || null
  };
}

function saveMemberTasks(){
  localStorage.setItem(MEMBER_TASK_STORAGE_KEY, JSON.stringify(state.memberTasks));
  syncMemberTasksToSupabase();
}

function normalizePilotLead(lead){
  return {
    id: lead.id || makeId(),
    name: lead.name || 'Yeni başvuru',
    studio: lead.studio || 'Stüdyo adı yok',
    city: lead.city || 'Şehir yok',
    phone: lead.phone || '',
    members: lead.members || '0–50',
    goal: lead.goal || 'Operasyonu toparlamak',
    stage: ['lead','demo','pilot','proposal','won','lost'].includes(lead.stage) ? lead.stage : 'lead',
    nextAction: lead.nextAction || lead.next_action || 'İlk görüşmeyi planla',
    value: Number(lead.value) || 990,
    createdAt: lead.createdAt || lead.created_at || new Date().toISOString()
  };
}

function savePilotLeads(){
  localStorage.setItem(PILOT_LEAD_STORAGE_KEY, JSON.stringify(state.pilotLeads));
}

function trainerStats(trainerName){
  const todaySessions = sessionsForDate().filter(session=>session.trainer === trainerName);
  const done = todaySessions.filter(session=>session.status === 'done').length;
  const scheduled = todaySessions.filter(session=>session.status === 'scheduled').length;
  const cancelled = todaySessions.filter(session=>session.status === 'cancelled').length;
  const trainerMembers = state.members.filter(member=>member.trainer === trainerName).map(member=>member.name);
  const revenue = state.finance
    .filter(entry=>entry.type === 'income' && trainerMembers.some(name=>entry.title.includes(name)))
    .reduce((sum,entry)=>sum + entry.amount, 0);
  const activeMembers = trainerMembers.length;
  return {todayTotal: todaySessions.length, done, scheduled, cancelled, revenue, activeMembers};
}

function teamSummary(){
  const stats = state.team.map(trainer=>trainerStats(trainer.name));
  return {
    trainers: state.team.length,
    todaySessions: stats.reduce((sum,item)=>sum + item.todayTotal, 0),
    completed: stats.reduce((sum,item)=>sum + item.done, 0),
    estimatedCommission: state.team.reduce((sum,trainer)=>sum + trainerStats(trainer.name).revenue * (trainer.commission / 100), 0)
  };
}

function normalizeStudio(studio){
  return {
    id: studio.id || makeId(),
    name: studio.name || 'Yeni stüdyo',
    initials: studio.initials || initialsFromName(studio.name || 'Yeni stüdyo'),
    location: studio.location || 'Konum eklenmedi',
    status: studio.status || 'Demo',
    logoDataUrl: studio.logoDataUrl || studio.logo_data_url || '',
    accentColor: studio.accentColor || studio.accent_color || '#d9ff64',
    address: studio.address || '',
    phone: studio.phone || '',
    whatsapp: studio.whatsapp || '',
    instagram: studio.instagram || '',
    website: studio.website || '',
    mapUrl: studio.mapUrl || studio.map_url || ''
  };
}

function activeStudio(){
  return state.studios.find(studio=>studio.id === state.activeStudioId) || state.studios[0] || normalizeStudio({});
}

function saveStudios(){
  localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(state.studios));
  syncStudiosToSupabase();
}

function saveActiveStudio(){
  localStorage.setItem(ACTIVE_STUDIO_STORAGE_KEY, state.activeStudioId);
}

function normalizeSignature(signature){
  return {
    id: signature.id || makeId(),
    studioId: signature.studioId || signature.studio_id || null,
    memberId: signature.memberId || signature.member_id || null,
    member: signature.member || 'Üye seçilmedi',
    type: signature.type || 'Aydınlatma ve üyelik onayı',
    signedAt: signature.signedAt || new Date().toISOString(),
    dataUrl: signature.dataUrl || ''
  };
}

function saveSignatures(){
  localStorage.setItem(SIGNATURE_STORAGE_KEY, JSON.stringify(state.signatures));
  syncSignaturesToSupabase();
}

function saveProgramSelections(){
  localStorage.setItem(PROGRAM_SELECTION_STORAGE_KEY, JSON.stringify(state.programSelections));
  syncProgramSelectionsToSupabase();
}

function ensureAccountProfileIds(){
  state.members.forEach(member=>{
    if(member.email && !member.profileId) member.profileId = makeId();
  });
  state.team.forEach(trainer=>{
    if(trainer.email && !trainer.profileId) trainer.profileId = trainer.id || makeId();
  });
}

function persistAllData(){
  ensureAccountProfileIds();
  saveMembers();
  saveFinance();
  savePrograms();
  saveSessions();
  saveTeam();
  saveTrainerTasks();
  saveMemberTasks();
  savePilotLeads();
  saveStudios();
  saveActiveStudio();
  saveSignatures();
  saveProgramSelections();
}

function backupPayload(){
  return {
    app:'Formera',
    version:1,
    exportedAt:new Date().toISOString(),
    activeStudioId:state.activeStudioId,
    members:state.members,
    finance:state.finance,
    programs:state.programs,
    sessions:state.sessions,
    team:state.team,
    trainerTasks:state.trainerTasks,
    memberTasks:state.memberTasks,
    pilotLeads:state.pilotLeads,
    studios:state.studios,
    signatures:state.signatures,
    programSelections:state.programSelections
  };
}

function applyBackupPayload(payload){
  if(!payload || payload.app !== 'Formera') throw new Error('Geçersiz Formera yedeği');
  state.members = (payload.members || []).map(normalizeMember);
  state.finance = (payload.finance || []).map(normalizeFinanceEntry);
  state.programs = (payload.programs || []).map(normalizeProgram);
  state.sessions = (payload.sessions || []).map(normalizeSession);
  state.team = (payload.team || []).map(normalizeTrainer);
  state.trainerTasks = (payload.trainerTasks || []).map(normalizeTrainerTask);
  state.memberTasks = (payload.memberTasks || []).map(normalizeMemberTask);
  state.pilotLeads = (payload.pilotLeads || []).map(normalizePilotLead);
  state.studios = (payload.studios || []).map(normalizeStudio);
  state.signatures = (payload.signatures || []).map(normalizeSignature);
  state.programSelections = payload.programSelections || {};
  state.activeStudioId = payload.activeStudioId || state.studios[0]?.id || 'studio_1';
  persistAllData();
}

function resetDemoData(){
  state.members = starterMembers.map(normalizeMember);
  state.finance = starterFinance.map(normalizeFinanceEntry);
  state.programs = starterPrograms.map(normalizeProgram);
  state.sessions = starterSessions.map(normalizeSession);
  state.team = starterTeam.map(normalizeTrainer);
  state.trainerTasks = starterTrainerTasks.map(normalizeTrainerTask);
  state.memberTasks = starterMemberTasks.map(normalizeMemberTask);
  state.pilotLeads = starterPilotLeads.map(normalizePilotLead);
  state.studios = starterStudios.map(normalizeStudio);
  state.signatures = [];
  state.programSelections = {};
  state.activeStudioId = 'studio_1';
  state.calendarDate = todayISO();
  persistAllData();
}

function readSupabaseConfig(){
  try{
    const saved = JSON.parse(localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY) || 'null');
    if(saved?.url && saved?.anonKey) return saved;
  }catch(e){
    console.warn('Supabase ayarı okunamadı.');
  }
  return window.FORMERA_SUPABASE?.url && window.FORMERA_SUPABASE?.anonKey ? window.FORMERA_SUPABASE : null;
}

function writeSupabaseConfig(config){
  localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify({
    url: String(config.url || '').trim(),
    anonKey: String(config.anonKey || '').trim()
  }));
}

function isUuid(value){
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function isSupabaseReady(){
  return Boolean(state.backend.connected && state.backend.client && state.backend.studioId);
}

function studioIdForRemote(){
  return state.backend.studioId || (isUuid(state.activeStudioId) ? state.activeStudioId : null);
}

function trainerProfileIdByName(name){
  return state.team.find(trainer=>trainer.name === name)?.profileId || null;
}

function memberIdByName(name){
  return state.members.find(member=>member.name === name)?.id || null;
}

function programIdByTitle(title){
  return state.programs.find(program=>program.title === title)?.id || null;
}

function memberNameById(id){
  return state.members.find(member=>member.id === id)?.name || 'Üye seçilmedi';
}

function programTitleById(id){
  return state.programs.find(program=>program.id === id)?.title || 'Genel PT';
}

function trainerNameById(id){
  return state.team.find(trainer=>trainer.profileId === id || trainer.id === id)?.name || 'Ece';
}

function remoteError(error, fallback='Canlı veri işleminde hata oluştu.'){
  if(!error) return;
  console.warn(error);
  state.backend.loading = false;
  state.backend.error = error.message || fallback;
  updateBackendShell();
  showAccountMessage(state.backend.error, 'error');
}

function isAccountModalOpen(){
  return Boolean(supabaseModal?.open);
}

function showAccountMessage(message, type='info'){
  if(!message || !accountAlert) return;
  accountAlert.textContent = message;
  accountAlert.className = `account-alert show ${type}`;
}

function clearAccountMessage(){
  if(!accountAlert) return;
  accountAlert.textContent = '';
  accountAlert.className = 'account-alert';
}

function notify(message, type='info'){
  if(isAccountModalOpen()){
    showAccountMessage(message, type);
    return;
  }
  showToast(message);
}

function readableAuthError(error, fallback){
  const message = String(error?.message || '').trim();
  if(!message) return fallback;
  if(message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already been registered')) return 'Bu e-posta ile zaten hesap var. Hesap oluşturmak yerine Giriş yap seçeneğini kullan.';
  if(message.toLowerCase().includes('password')) return 'Şifre kabul edilmedi. En az 6 karakterli daha güçlü bir şifre dene.';
  if(message.toLowerCase().includes('email')) return 'E-posta adresini kontrol et.';
  return `${fallback} (${message})`;
}

function setAccountBusy(isBusy, message=''){
  [signupSupabaseButton, supabaseAuthForm?.querySelector('button[type="submit"]')].forEach(button=>{
    if(button) button.disabled = isBusy;
  });
  if(isBusy && message) showAccountMessage(message, 'info');
}

function mapRemoteStudio(studio){
  return normalizeStudio({
    id: studio.id,
    name: studio.name,
    initials: studio.initials,
    location: studio.location,
    status: studio.status,
    logoDataUrl: studio.logo_data_url,
    accentColor: studio.accent_color,
    address: studio.address,
    phone: studio.phone,
    whatsapp: studio.whatsapp,
    instagram: studio.instagram,
    website: studio.website,
    mapUrl: studio.map_url
  });
}

function mapRemoteTrainer(profile){
  return normalizeTrainer({
    id: profile.id,
    profileId: profile.id,
    authUserId: profile.auth_user_id,
    name: profile.full_name,
    role: profile.role === 'owner' ? 'Owner' : 'PT Coach',
    specialty: profile.role === 'owner' ? 'İşletme yönetimi' : 'Genel fitness',
    phone: profile.phone || '',
    commission: 15,
    avatarDataUrl: profile.avatar_data_url,
    email: profile.email || ''
  });
}

function mapRemoteMember(member, profilesById){
  return normalizeMember({
    id: member.id,
    studioId: member.studio_id,
    profileId: member.profile_id,
    authUserId: profilesById[member.profile_id]?.auth_user_id || null,
    trainerProfileId: member.trainer_profile_id,
    name: member.full_name,
    initials: member.initials,
    trainer: profilesById[member.trainer_profile_id]?.full_name || 'Atanmadı',
    last: member.last_visit_label,
    sessions: `${member.sessions_used || 0} / ${member.sessions_total || 12}`,
    status: member.status,
    type: member.risk_type,
    phone: member.phone || '',
    avatarDataUrl: member.avatar_data_url,
    email: member.email || profilesById[member.profile_id]?.email || ''
  });
}

function mapRemoteProgram(program, selectionByProgramId){
  return normalizeProgram({
    id: program.id,
    studioId: program.studio_id,
    title: program.title,
    goal: program.goal,
    level: program.level,
    duration: program.duration_minutes,
    assigned: selectionByProgramId[program.id] || 'Atanmadı',
    exercises: Array.isArray(program.exercises) ? program.exercises : []
  });
}

function mapRemoteSession(session){
  return normalizeSession({
    id: session.id,
    studioId: session.studio_id,
    memberId: session.member_id,
    trainerProfileId: session.trainer_profile_id,
    programId: session.program_id,
    date: session.session_date,
    time: String(session.session_time || '09:00').slice(0,5),
    member: memberNameById(session.member_id),
    trainer: trainerNameById(session.trainer_profile_id),
    program: programTitleById(session.program_id),
    room: session.room,
    status: session.status
  });
}

function mapRemoteFinance(entry){
  return normalizeFinanceEntry({
    id: entry.id,
    studioId: entry.studio_id,
    type: entry.type,
    title: entry.title,
    category: entry.category,
    amount: Number(entry.amount),
    date: entry.entry_date,
    status: entry.status
  });
}

function mapRemoteSignature(signature){
  return normalizeSignature({
    id: signature.id,
    studioId: signature.studio_id,
    memberId: signature.member_id,
    member: memberNameById(signature.member_id),
    type: signature.type,
    signedAt: signature.signed_at,
    dataUrl: signature.image_data_url
  });
}

function mapRemoteTrainerTask(task){
  return normalizeTrainerTask({
    id: task.id,
    studioId: task.studio_id,
    trainerProfileId: task.trainer_profile_id,
    trainer: trainerNameById(task.trainer_profile_id),
    title: task.title,
    note: task.note,
    priority: task.priority,
    dueDate: task.due_date,
    status: task.status,
    createdAt: task.created_at,
    completedAt: task.completed_at
  });
}

function mapRemoteMemberTask(task){
  return normalizeMemberTask({
    id: task.id,
    studioId: task.studio_id,
    memberId: task.member_id,
    trainerProfileId: task.trainer_profile_id,
    member: memberNameById(task.member_id),
    trainer: trainerNameById(task.trainer_profile_id),
    type: task.type,
    title: task.title,
    note: task.note,
    dueDate: task.due_date,
    status: task.status,
    createdAt: task.created_at,
    completedAt: task.completed_at
  });
}

async function initSupabase(){
  const config = readSupabaseConfig();
  state.backend.configured = Boolean(config);
  updateBackendShell();
  if(!config) return;
  if(!window.supabase?.createClient){
    state.backend.error = 'Supabase kütüphanesi yüklenemedi.';
    updateBackendShell();
    return;
  }
  state.backend.client = window.supabase.createClient(config.url, config.anonKey);
  const {data, error} = await state.backend.client.auth.getSession();
  if(error) return remoteError(error, 'Oturum okunamadı.');
  state.backend.user = data.session?.user || null;
  if(state.backend.user) await loadRemoteData();
  updateBackendShell();
}

async function loadRemoteData(){
  if(!state.backend.client || !state.backend.user) return;
  state.backend.loading = true;
  updateBackendShell();
  const db = state.backend.client;
  let {data: profile, error: profileError} = await db
    .from('profiles')
    .select('*')
    .eq('auth_user_id', state.backend.user.id)
    .maybeSingle();
  if(profileError) return remoteError(profileError, 'Profil okunamadı.');
  if(!profile){
    const {data: claimedProfile, error: claimError} = await db.rpc('claim_profile_by_email');
    if(!claimError && claimedProfile) profile = Array.isArray(claimedProfile) ? claimedProfile[0] : claimedProfile;
  }
  if(!profile){
    state.backend.loading = false;
    state.backend.connected = false;
    state.backend.error = 'Bu e-postaya bağlı işletmeci/antrenör/üye profili bulunamadı.';
    updateBackendShell();
    return;
  }

  state.backend.profile = profile;
  state.backend.studioId = profile.studio_id;
  const studioId = profile.studio_id;

  const [
    studiosResult,
    profilesResult,
    membersResult,
    selectionsResult,
    programsResult,
    sessionsResult,
    financeResult,
    signaturesResult,
    trainerTasksResult,
    memberTasksResult
  ] = await Promise.all([
    db.from('studios').select('*').eq('id', studioId),
    db.from('profiles').select('*').eq('studio_id', studioId),
    db.from('members').select('*').eq('studio_id', studioId).order('created_at', {ascending:false}),
    db.from('member_program_selections').select('*'),
    db.from('programs').select('*').eq('studio_id', studioId).order('created_at', {ascending:false}),
    db.from('sessions').select('*').eq('studio_id', studioId).order('session_date', {ascending:true}).order('session_time', {ascending:true}),
    db.from('finance_entries').select('*').eq('studio_id', studioId).order('entry_date', {ascending:false}),
    db.from('signatures').select('*').eq('studio_id', studioId).order('signed_at', {ascending:false}),
    db.from('trainer_tasks').select('*').eq('studio_id', studioId).order('created_at', {ascending:false}),
    db.from('member_tasks').select('*').eq('studio_id', studioId).order('created_at', {ascending:false})
  ]);

  const taskTableMissing = Boolean(trainerTasksResult.error && (trainerTasksResult.error.code === '42P01' || String(trainerTasksResult.error.message || '').includes('trainer_tasks')));
  const memberTaskTableMissing = Boolean(memberTasksResult.error && (memberTasksResult.error.code === '42P01' || String(memberTasksResult.error.message || '').includes('member_tasks')));
  state.backend.trainerTasksReady = !taskTableMissing;
  state.backend.memberTasksReady = !memberTaskTableMissing;
  const failed = [studiosResult, profilesResult, membersResult, selectionsResult, programsResult, sessionsResult, financeResult, signaturesResult, taskTableMissing ? null : trainerTasksResult, memberTaskTableMissing ? null : memberTasksResult].filter(Boolean).find(result=>result.error);
  if(failed) return remoteError(failed.error);
  const firstStudio = studiosResult.data?.[0] || {};
  state.backend.brandingReady = 'logo_data_url' in firstStudio || 'accent_color' in firstStudio;
  state.backend.accountsReady = (profilesResult.data || []).some(item=>'email' in item) || (membersResult.data || []).some(item=>'profile_id' in item);

  const profilesById = Object.fromEntries((profilesResult.data || []).map(item=>[item.id, item]));
  const memberNamesById = Object.fromEntries((membersResult.data || []).map(item=>[item.id, item.full_name]));
  const selectionByProgramId = {};
  const programSelections = {};
  (selectionsResult.data || []).forEach(selection=>{
    const memberName = memberNamesById[selection.member_id];
    if(memberName){
      selectionByProgramId[selection.program_id] = memberName;
      programSelections[memberName] = selection.program_id;
    }
  });

  state.studios = (studiosResult.data || []).map(mapRemoteStudio);
  state.activeStudioId = studioId;
  state.team = (profilesResult.data || [])
    .filter(item=>item.role === 'trainer')
    .map(mapRemoteTrainer);
  if(!state.team.length){
    state.team = (profilesResult.data || []).filter(item=>item.role === 'owner').map(mapRemoteTrainer);
  }
  state.members = (membersResult.data || []).map(member=>mapRemoteMember(member, profilesById));
  state.programSelections = programSelections;
  state.programs = (programsResult.data || []).map(program=>mapRemoteProgram(program, selectionByProgramId));
  state.sessions = (sessionsResult.data || []).map(mapRemoteSession);
  state.finance = (financeResult.data || []).map(mapRemoteFinance);
  state.signatures = (signaturesResult.data || []).map(mapRemoteSignature);
  state.trainerTasks = taskTableMissing ? state.trainerTasks : (trainerTasksResult.data || []).map(mapRemoteTrainerTask);
  state.memberTasks = memberTaskTableMissing ? state.memberTasks : (memberTasksResult.data || []).map(mapRemoteMemberTask);
  state.role = profile.role === 'trainer' ? 'trainer' : profile.role === 'member' ? 'member' : 'owner';
  if(profile.role === 'trainer') state.trainerName = profile.full_name;
  if(profile.role === 'member') state.page = 'dashboard';
  state.backend.connected = true;
  state.backend.loading = false;
  state.backend.error = '';
  persistAllData();
  render();
  const expectedRole = selectedLoginRole;
  if(expectedRole && expectedRole !== profile.role){
    showToast(`${loginRoleMeta(profile.role).label || roleLabel(profile.role)} hesabı açıldı. Rol, kayıtlı profile göre belirlenir.`);
  }else{
    showToast(`${loginRoleMeta(profile.role).label || roleLabel(profile.role)} hesabı açıldı.`);
  }
}

function updateBackendShell(){
  const button = document.querySelector('#backendStatus');
  if(!button) return;
  button.classList.toggle('connected', state.backend.connected);
  button.classList.toggle('warning', state.backend.configured && !state.backend.connected);
  if(state.backend.loading) button.textContent = 'Bağlanıyor...';
  else if(state.backend.connected) button.textContent = roleLabel(state.backend.profile?.role || state.role);
  else if(state.backend.configured) button.textContent = 'Giriş gerekli';
  else button.textContent = 'Demo mod';
  updateAccountSummary();
}

function openSupabaseModal(){
  clearAccountMessage();
  setLoginRole(selectedLoginRole);
  const config = readSupabaseConfig();
  if(config && supabaseConfigForm){
    supabaseConfigForm.elements.url.value = config.url || '';
    supabaseConfigForm.elements.anonKey.value = config.anonKey || '';
  }
  if(state.backend.user?.email && supabaseAuthForm){
    supabaseAuthForm.elements.email.value = state.backend.user.email;
    supabaseAuthForm.elements.password.value = '';
  }
  updateAccountSummary();
  supabaseModal?.showModal();
}

async function signInSupabase(email, password){
  if(!state.backend.client){
    await initSupabase();
  }
  if(!state.backend.client){
    notify('Önce Supabase URL ve anon key kaydet.', 'warning');
    return;
  }
  state.backend.loading = true;
  setAccountBusy(true, 'Giriş kontrol ediliyor...');
  updateBackendShell();
  const {data, error} = await state.backend.client.auth.signInWithPassword({email, password});
  if(error){
    state.backend.loading = false;
    setAccountBusy(false);
    const message = readableAuthError(error, 'Giriş başarısız. Email/şifreyi kontrol et.');
    remoteError(error, message);
    notify(message, 'error');
    return;
  }
  state.backend.user = data.user;
  await loadRemoteData();
  setAccountBusy(false);
  supabaseModal?.close();
}

async function signUpSupabase(email, password){
  if(!state.backend.client){
    await initSupabase();
  }
  if(!state.backend.client){
    notify('Önce Supabase URL ve anon key kaydet.', 'warning');
    return;
  }
  state.backend.loading = true;
  setAccountBusy(true, 'Hesap oluşturuluyor...');
  updateBackendShell();
  const {data, error} = await state.backend.client.auth.signUp({email, password});
  state.backend.loading = false;
  if(error){
    setAccountBusy(false);
    const message = readableAuthError(error, 'Hesap oluşturulamadı. Email/şifreyi kontrol et.');
    remoteError(error, message);
    notify(message, 'error');
    return;
  }
  if(data.session?.user){
    state.backend.user = data.session.user;
    await loadRemoteData();
    setAccountBusy(false);
    supabaseModal?.close();
    notify('Hesap oluşturuldu ve giriş yapıldı.', 'success');
    return;
  }
  setAccountBusy(false);
  updateBackendShell();
  notify('Hesap oluşturuldu. Email doğrulaması gerekiyorsa gelen kutunu kontrol et.', 'success');
}

async function signOutSupabase(){
  const client = state.backend.client;
  state.backend.connected = false;
  state.backend.user = null;
  state.backend.profile = null;
  state.backend.studioId = null;
  state.backend.accountsReady = false;
  state.backend.trainerTasksReady = false;
  state.backend.memberTasksReady = false;
  state.role = 'owner';
  state.page = 'dashboard';
  if(supabaseAuthForm) supabaseAuthForm.reset();
  supabaseModal?.close();
  updateBackendShell();
  render();
  showToast('Canlı veri oturumu kapatıldı.');
  if(client){
    const {error} = await client.auth.signOut();
    if(error) console.warn(error);
  }
}

async function switchSupabaseAccount(){
  const client = state.backend.client;
  state.backend.connected = false;
  state.backend.user = null;
  state.backend.profile = null;
  state.backend.studioId = null;
  state.backend.accountsReady = false;
  state.backend.trainerTasksReady = false;
  state.backend.memberTasksReady = false;
  state.role = 'owner';
  state.page = 'dashboard';
  if(supabaseAuthForm) supabaseAuthForm.reset();
  updateBackendShell();
  render();
  openSupabaseModal();
  showToast('Yeni hesapla giriş yapabilirsin.');
  if(client){
    const {error} = await client.auth.signOut();
    if(error) console.warn(error);
  }
}

async function syncRemote(table, rows){
  if(!isSupabaseReady()) return;
  const validRows = rows.filter(row=>row.id && isUuid(row.id));
  if(!validRows.length) return;
  const {error} = await state.backend.client.from(table).upsert(validRows, {onConflict:'id'});
  remoteError(error);
}

async function syncMembersToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId) return;
  if(state.backend.accountsReady){
    const profileRows = state.members
      .filter(member=>member.email || member.profileId)
      .map(member=>({
        id: member.profileId || makeId(),
        studio_id: studioId,
        full_name: member.name,
        role: 'member',
        phone: member.phone || null,
        email: member.email || null,
        avatar_data_url: member.avatarDataUrl || null
      }));
    await syncRemote('profiles', profileRows);
  }
  const rows = state.members.map(member=>{
    const parsed = parseSessions(member.sessions);
    const row = {
      id: member.id,
      studio_id: studioId,
      profile_id: state.backend.accountsReady ? member.profileId : null,
      trainer_profile_id: trainerProfileIdByName(member.trainer),
      full_name: member.name,
      initials: member.initials,
      phone: member.phone || null,
      last_visit_label: member.last,
      sessions_used: parsed.used,
      sessions_total: parsed.total,
      status: member.status,
      risk_type: member.type
    };
    if(state.backend.accountsReady){
      row.email = member.email || null;
      row.avatar_data_url = member.avatarDataUrl || null;
    }else if(state.backend.brandingReady) row.avatar_data_url = member.avatarDataUrl || null;
    return row;
  });
  await syncRemote('members', rows);
}

function syncStudiosToSupabase(){
  if(!isSupabaseReady()) return;
  const rows = state.studios
    .filter(studio=>isUuid(studio.id))
    .map(studio=>{
      const row = {
        id: studio.id,
        name: studio.name,
        initials: studio.initials,
        location: studio.location,
        status: studio.status
      };
      if(state.backend.brandingReady){
        row.logo_data_url = studio.logoDataUrl || null;
        row.accent_color = studio.accentColor || '#d9ff64';
        row.address = studio.address || null;
        row.phone = studio.phone || null;
        row.whatsapp = studio.whatsapp || null;
        row.instagram = studio.instagram || null;
        row.website = studio.website || null;
        row.map_url = studio.mapUrl || null;
      }
      return row;
    });
  syncRemote('studios', rows);
}

function syncFinanceToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId) return;
  syncRemote('finance_entries', state.finance.map(entry=>({
    id: entry.id,
    studio_id: studioId,
    type: entry.type,
    title: entry.title,
    category: entry.category,
    amount: entry.amount,
    entry_date: entry.date,
    status: entry.status
  })));
}

function syncProgramsToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId) return;
  syncRemote('programs', state.programs.map(program=>({
    id: program.id,
    studio_id: studioId,
    title: program.title,
    goal: program.goal,
    level: program.level,
    duration_minutes: program.duration,
    exercises: program.exercises
  })));
}

function syncSessionsToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId) return;
  syncRemote('sessions', state.sessions.map(session=>({
    id: session.id,
    studio_id: studioId,
    member_id: session.memberId || memberIdByName(session.member),
    trainer_profile_id: session.trainerProfileId || trainerProfileIdByName(session.trainer),
    program_id: session.programId || programIdByTitle(session.program),
    session_date: session.date,
    session_time: session.time,
    room: session.room,
    status: session.status
  })));
}

function syncTeamToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId) return;
  syncRemote('profiles', state.team.map(trainer=>{
    const row = {
      id: trainer.profileId || trainer.id,
      studio_id: studioId,
      full_name: trainer.name,
      role: 'trainer',
      phone: trainer.phone || null
    };
    if(state.backend.accountsReady){
      row.email = trainer.email || null;
      row.avatar_data_url = trainer.avatarDataUrl || null;
    }else if(state.backend.brandingReady) row.avatar_data_url = trainer.avatarDataUrl || null;
    return row;
  }));
}

function syncTrainerTasksToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId || (state.backend.connected && !state.backend.trainerTasksReady)) return;
  syncRemote('trainer_tasks', state.trainerTasks.map(task=>({
    id: task.id,
    studio_id: studioId,
    trainer_profile_id: task.trainerProfileId || trainerProfileIdByName(task.trainer),
    created_by_profile_id: state.backend.profile?.id || null,
    title: task.title,
    note: task.note,
    priority: task.priority,
    due_date: task.dueDate,
    status: task.status,
    completed_at: task.completedAt
  })));
}

function syncMemberTasksToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId || (state.backend.connected && !state.backend.memberTasksReady)) return;
  syncRemote('member_tasks', state.memberTasks.map(task=>({
    id: task.id,
    studio_id: studioId,
    member_id: task.memberId || memberIdByName(task.member),
    trainer_profile_id: task.trainerProfileId || trainerProfileIdByName(task.trainer),
    type: task.type,
    title: task.title,
    note: task.note,
    due_date: task.dueDate,
    status: task.status,
    completed_at: task.completedAt
  })));
}

function syncSignaturesToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId) return;
  syncRemote('signatures', state.signatures.map(signature=>({
    id: signature.id,
    studio_id: studioId,
    member_id: signature.memberId || memberIdByName(signature.member),
    type: signature.type,
    image_data_url: signature.dataUrl,
    signed_at: signature.signedAt
  })));
}

async function syncProgramSelectionsToSupabase(){
  if(!isSupabaseReady()) return;
  const rows = Object.entries(state.programSelections)
    .map(([memberName, programId])=>({member_id: memberIdByName(memberName), program_id: programId}))
    .filter(row=>isUuid(row.member_id) && isUuid(row.program_id));
  if(!rows.length) return;
  const {error} = await state.backend.client
    .from('member_program_selections')
    .upsert(rows, {onConflict:'member_id'});
  remoteError(error);
}

async function deleteRemoteRow(table, id){
  if(!isSupabaseReady() || !isUuid(id)) return;
  const {error} = await state.backend.client.from(table).delete().eq('id', id);
  remoteError(error);
}

function updateStudioShell(){
  const studio = activeStudio();
  const avatar = document.querySelector('#studioAvatar');
  const brandMark = document.querySelector('.brand-mark');
  const name = document.querySelector('#studioName');
  const location = document.querySelector('#studioLocation');
  setAvatarElement(avatar, studio.initials, studio.logoDataUrl);
  setAvatarElement(brandMark, 'F', studio.logoDataUrl);
  if(name) name.textContent = studio.name;
  if(location) location.textContent = studio.location;
  document.documentElement.style.setProperty('--acid', studio.accentColor || '#d9ff64');
}

function roleMeta(){
  if(state.role === 'trainer'){
    const trainer = trainerByName(state.trainerName);
    return {label:'Antrenör', next:'Üye görünümü', avatar:initialsFromName(state.trainerName), avatarImage:trainer?.avatarDataUrl || ''};
  }
  if(state.role === 'member'){
    const member = currentMember();
    return {label:'Üye', next:'İşletmeci görünümü', avatar:member?.initials || 'SA', avatarImage:member?.avatarDataUrl || ''};
  }
  const studio = activeStudio();
  return {label:'İşletmeci', next:'Antrenör görünümü', avatar:studio.initials || 'OY', avatarImage:studio.logoDataUrl || ''};
}

function roleLabel(role=state.role){
  return {owner:'İşletmeci', trainer:'Antrenör', member:'Üye'}[role] || 'Kullanıcı';
}

function loginRoleMeta(role=selectedLoginRole){
  return {
    owner: {
      label: 'İşletme',
      emailLabel: 'İşletme e-postası',
      placeholder: 'owner@email.com',
      note: 'İşletme hesabıyla tüm salon verilerini, ekibi, üyeleri ve finansı yönet.'
    },
    trainer: {
      label: 'Antrenör',
      emailLabel: 'Antrenör e-postası',
      placeholder: 'antrenor@email.com',
      note: 'Antrenör hesabıyla kendi danışanlarını, seanslarını ve üye aksiyonlarını yönet.'
    },
    member: {
      label: 'Üye',
      emailLabel: 'Üye e-postası',
      placeholder: 'uye@email.com',
      note: 'Üye hesabıyla kendi programını, seanslarını ve antrenör notlarını takip et.'
    }
  }[role] || {};
}

function setLoginRole(role){
  selectedLoginRole = ['owner','trainer','member'].includes(role) ? role : 'owner';
  localStorage.setItem('formera_login_role', selectedLoginRole);
  const meta = loginRoleMeta();
  loginRoleTabs.forEach(tab=>{
    const active = tab.dataset.loginRole === selectedLoginRole;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  if(loginRoleNote) loginRoleNote.textContent = meta.note;
  if(loginEmailLabel){
    const input = loginEmailLabel.querySelector('input');
    loginEmailLabel.childNodes[0].nodeValue = meta.emailLabel;
    if(input) input.placeholder = meta.placeholder;
  }
}

function accountMeta(){
  const profile = state.backend.profile;
  const email = state.backend.user?.email || profile?.email || '';
  if(state.backend.connected && profile){
    const image = profile.role === 'trainer'
      ? trainerByName(profile.full_name)?.avatarDataUrl
      : profile.role === 'member'
        ? currentMember()?.avatarDataUrl
        : activeStudio().logoDataUrl;
    return {
      title: profile.full_name || email || 'Canlı kullanıcı',
      detail: `${roleLabel(profile.role)}${email ? ` · ${email}` : ''}`,
      initials: initialsFromName(profile.full_name || email || 'Kullanıcı'),
      image: image || ''
    };
  }
  return {
    title: state.backend.configured ? 'Giriş bekleniyor' : 'Demo mod',
    detail: state.backend.configured ? 'İşletmeci, antrenör veya üye hesabıyla giriş yap.' : 'Canlı veri bağlantısı henüz ayarlanmadı.',
    initials: '?',
    image: ''
  };
}

function updateAccountSummary(){
  if(!accountSummary) return;
  const meta = accountMeta();
  accountSummary.innerHTML = `${avatarMarkup(meta.initials, meta.image)}<div><strong>${escapeAttr(meta.title)}</strong><small>${escapeAttr(meta.detail)}</small></div>`;
}

function updateRoleShell(){
  const meta = roleMeta();
  const roleButton = document.querySelector('#roleSwitch');
  const avatar = document.querySelector('.user-avatar');
  if(roleButton){
    roleButton.querySelector('span').textContent = meta.label;
    roleButton.querySelector('small').textContent = state.backend.connected ? 'Canlı rol' : meta.next;
    roleButton.classList.toggle('locked', state.backend.connected);
    roleButton.title = state.backend.connected ? 'Canlı modda rol giriş yapan hesaba göre belirlenir.' : 'Demo rolünü değiştir';
  }
  setAvatarElement(avatar, meta.avatar, meta.avatarImage);
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('main');
  if(sidebar) sidebar.style.display = state.role === 'owner' ? '' : 'none';
  if(main) main.style.gridColumn = state.role === 'owner' ? '' : '1 / -1';
}

function metric(title, value, delta, icon, down=false){
  return `<article class="metric"><div class="metric-head"><span>${title}</span><span class="metric-icon">${icon}</span></div><strong>${value}</strong><span class="delta ${down?'down':''}">${delta} <em>geçen haftaya göre</em></span></article>`;
}

function escapeAttr(value=''){
  return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

function avatarStyle(imageDataUrl){
  return imageDataUrl ? ` style="background-image:url('${escapeAttr(imageDataUrl)}')"` : '';
}

function avatarMarkup(initials, imageDataUrl='', className='avatar'){
  return `<span class="${className}${imageDataUrl ? ' has-image' : ''}"${avatarStyle(imageDataUrl)}>${imageDataUrl ? '' : escapeAttr(initials || 'F')}</span>`;
}

function setAvatarElement(element, initials, imageDataUrl=''){
  if(!element) return;
  element.classList.toggle('has-image', Boolean(imageDataUrl));
  element.style.backgroundImage = imageDataUrl ? `url('${imageDataUrl}')` : '';
  element.textContent = imageDataUrl ? '' : initials;
}

function imageFileToDataUrl(file, maxSize=420){
  return new Promise((resolve, reject)=>{
    if(!file) return resolve('');
    if(!file.type?.startsWith('image/')) return reject(new Error('Görsel dosyası seçilmedi.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Görsel okunamadı.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Görsel işlenemedi.'));
      image.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function memberByName(name){
  return state.members.find(member=>member.name === name);
}

function trainerByName(name){
  return state.team.find(trainer=>trainer.name === name);
}

function currentMember(){
  const profile = state.backend.profile;
  if(profile?.role === 'member'){
    return state.members.find(member=>member.profileId === profile.id)
      || state.members.find(member=>member.email && profile.email && member.email.toLocaleLowerCase('tr') === profile.email.toLocaleLowerCase('tr'))
      || state.members.find(member=>member.name === profile.full_name)
      || state.members[0];
  }
  return memberByName('Selin Aksoy') || state.members[0] || normalizeMember({});
}

function memberSignature(memberName){
  return state.signatures
    .filter(signature=>signature.member === memberName)
    .sort((a,b)=>b.signedAt.localeCompare(a.signedAt))[0];
}

function accountStatusMeta(person){
  if(person?.authUserId) return {label:'Hesap bağlı', className:'good', detail:'giriş yaptı'};
  if(person?.email) return {label:'Davet bekliyor', className:'warn', detail:person.email};
  return {label:'E-posta yok', className:'risk', detail:'giriş kapalı'};
}

function appAccessUrl(){
  if(location.protocol === 'file:') return 'https://tysonares.github.io/formera/';
  return `${location.origin}${location.pathname}`;
}

function inviteText(person, role){
  return [
    `Merhaba ${person.name},`,
    `${activeStudio().name} Formera hesabın hazırlandı.`,
    '',
    `Giriş linki: ${appAccessUrl()}`,
    `E-posta: ${person.email}`,
    '',
    'Adımlar:',
    '1. Linki aç.',
    '2. Sağ üstteki “Giriş gerekli / Demo mod” butonuna bas.',
    '3. Bu e-posta ile “Hesap oluştur” veya hesabın varsa “Giriş yap” seçeneğini kullan.',
    `4. Girişten sonra ${role} ekranın otomatik açılır.`
  ].join('\n');
}

async function copyInvite(kind, id){
  const person = kind === 'trainer'
    ? state.team.find(trainer=>trainer.id === id || trainer.profileId === id)
    : state.members.find(member=>member.id === id || member.profileId === id);
  if(!person) return;
  if(!person.email){
    showToast(`${person.name} için önce giriş e-postası ekle.`);
    return;
  }
  const text = inviteText(person, kind === 'trainer' ? 'antrenör' : 'üye');
  try{
    await navigator.clipboard?.writeText(text);
    showToast(`${person.name} için davet metni kopyalandı.`);
  }catch(e){
    showToast('Davet metni kopyalanamadı. Tarayıcı izin vermedi.');
  }
}

function memberRows(items=state.members){
  return items.map(m=>{
    const signature = memberSignature(m.name);
    const account = accountStatusMeta(m);
    return `<div class="member-row">
    <div class="member">${avatarMarkup(m.initials, m.avatarDataUrl)}<div><strong>${m.name}</strong><small>PT: ${m.trainer}${m.phone ? ` · ${m.phone}` : ''}</small><small>${escapeAttr(account.detail)}</small></div></div>
    <span><small class="cell-label">Son ziyaret</small><br>${m.last}</span>
    <span><small class="cell-label">Seans</small><br>${m.sessions}</span>
    <span class="status ${m.type}">${m.status}</span>
    <span class="status ${account.className}">${account.label}</span>
    <span class="status ${signature ? 'good' : 'warn'}">${signature ? 'İmzalı' : 'İmza yok'}</span>
    <div class="row-actions">
      <button class="mini-button" data-action="copy-member-invite" data-member-id="${m.id}">Davet</button>
      <button class="mini-button" data-action="checkin-member" data-member-id="${m.id}">Geldi</button>
      <button class="mini-button" data-action="sign-member" data-member-id="${m.id}">İmza al</button>
      <button class="mini-button" data-action="edit-member" data-member-id="${m.id}">Düzenle</button>
      <button class="mini-button danger" data-action="delete-member" data-member-id="${m.id}">Sil</button>
    </div>
  </div>`;
  }).join('');
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

function studioPilotRows(){
  return state.studios.map(studio=>`<button class="studio-pilot ${studio.id === state.activeStudioId ? 'active' : ''}" data-action="select-studio" data-studio-id="${studio.id}">
    ${avatarMarkup(studio.initials, studio.logoDataUrl, 'studio-avatar')}
    <div><strong>${studio.name}</strong><small>${studio.location} · ${studio.status}</small></div>
  </button>`).join('');
}

function dashboard(){
  const riskyCount = state.members.filter(m=>m.type !== 'good').length;
  const finance = financeSummary();
  const chartRows = weeklyChartData();
  const maxChartValue = Math.max(...chartRows.flatMap(row=>[row[1], row[2]]), 1);
  const sessions = sessionSummary();
  return `<div class="welcome"><div><span class="eyebrow">${activeStudio().name} · 28. Hafta</span><h1>Günaydın, Ömer 👋</h1><p>${activeStudio().location} pilot alanı iyi ilerliyor. İşte dikkat isteyen noktalar.</p></div><button class="primary" data-action="new-member">+ Yeni üye</button></div>
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
    <article class="card"><div class="card-title"><div><h2>4 salon pilotu</h2><p>Aktif demo stüdyosunu seç</p></div><span class="badge">${state.studios.length} stüdyo</span></div><div class="studio-pilot-list">${studioPilotRows()}</div></article>
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

function aiCreditUsage(){
  const used = Math.min(100, 22 + state.trainerTasks.length * 3 + state.memberTasks.length * 2 + state.programs.length);
  return {used, total:100, remaining:Math.max(0, 100 - used)};
}

function aiAssistantSuggestions(){
  const finance = financeSummary();
  const risky = state.members.filter(member=>member.type !== 'good');
  const sessions = sessionSummary();
  if(state.role === 'trainer'){
    const clients = state.members.filter(member=>member.trainer === state.trainerName);
    const riskyClients = clients.filter(member=>member.type !== 'good');
    const openActions = currentTrainerMemberTasks().filter(task=>task.status === 'open');
    return [
      `${riskyClients[0]?.name || clients[0]?.name || 'İlk danışanın'} için bugün kısa motivasyon ve program uyum notu gönder.`,
      `${openActions.length || 1} açık üye aksiyonunu gün sonunda tamamlandı / takipte olarak işaretle.`,
      'Beslenme notlarında tıbbi iddia yerine davranış odaklı net komut kullan: su, öğün düzeni, protein kaynağı gibi.'
    ];
  }
  if(state.role === 'member'){
    const member = currentMember();
    const program = selectedProgramForMember(member.name);
    return [
      `${program.title} programında bugün formu koru; ağırlık artırmak yerine tekrar kalitesine odaklan.`,
      'Antrenöründen gelen açık görevleri tamamladığında işaretle; haftalık uyum daha doğru hesaplanır.',
      'Beslenme notlarını genel takip olarak kullan; özel diyet/tıbbi karar için uzmanına danış.'
    ];
  }
  return [
    finance.pending > 0 ? `${formatCurrency(finance.pending)} bekleyen tahsilat için bugün kısa ödeme hatırlatma akışı başlat.` : 'Tahsilat temiz görünüyor; bugün yeni üye aktivasyonu ve seans doluluğuna odaklan.',
    risky.length ? `${risky.slice(0,3).map(member=>member.name).join(', ')} için yenileme riski takip listesi oluştur.` : 'Riskli üye düşük; memnun üyelerden referans istemek için iyi gün.',
    sessions.busiest ? `${sessions.busiest[0]}:00 yoğunluğunda kapasite sıkışıyor; bir antrenör bloğu daha açmayı test et.` : 'Bugünkü takvim dengeli; boş saatleri deneme dersi veya ölçüm randevusu için kullan.'
  ];
}

function aiAssistantCapabilities(){
  return [
    ['🎙️','Sesli asistan','İşletmeci ve antrenör isterse konuşarak öneri alır.'],
    ['✦','Haftalık özet','Gelir, seans, görev ve riskleri kısa aksiyon listesine dönüştürür.'],
    ['▤','Program taslağı','Antrenörün komutundan program veya beslenme notu taslağı çıkarır.']
  ];
}

function openAiAssistant(){
  if(!aiAssistantModal || !aiAssistantBody) return;
  const usage = aiCreditUsage();
  const meta = roleMeta();
  aiAssistantBody.innerHTML = `
    <div class="ai-package-hero">
      <div>
        <span class="ai-package-badge">Studio AI paket özelliği</span>
        <h3>${meta.label} için akıllı öneriler</h3>
        <p>Bu ekran şimdilik demo öneriler üretir. Canlı AI API bağlandığında sesli asistan, haftalık özet ve program taslakları kredi/limit ile çalışacak.</p>
      </div>
      <div class="ai-credit-ring" style="--usage:${usage.used}%"><strong>${usage.remaining}</strong><small>AI kredi kaldı</small></div>
    </div>
    <div class="ai-capability-grid">
      ${aiAssistantCapabilities().map(item=>`<div><b>${item[0]}</b><strong>${item[1]}</strong><small>${item[2]}</small></div>`).join('')}
    </div>
    <div class="ai-suggestion-list">
      <div class="card-title"><div><h2>Bugünkü öneriler</h2><p>Rol, görev, üye ve finans verilerine göre demo çıktılar</p></div><span class="badge">Demo AI</span></div>
      ${aiAssistantSuggestions().map((item,index)=>`<div class="insight ai-light"><span>${index+1}</span><div><strong>${item}</strong><small>Canlı AI paketinde sesli ve yazılı üretilecek</small></div></div>`).join('')}
    </div>
    <div class="ai-upgrade-note">
      <strong>Paket notu:</strong> Mikrofonla yazıya döküm Studio paketinde, gerçek sesli AI asistan ve otomatik öneriler Studio AI paketinde limitli krediyle sunulmalı.
    </div>
    <div class="modal-actions">
      <button type="button" class="secondary" data-action="voice-ai-demo">Sesli asistan demo</button>
      <button type="button" class="primary" data-action="ai-plan">Haftalık öneri üret</button>
    </div>`;
  aiAssistantModal.showModal();
  bind();
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
  return state.programs.map(program=>{
    const assignedMember = memberByName(program.assigned);
    return `<article class="program-card">
    <div class="card-title"><div><h2>${program.title}</h2><p>${program.goal} · ${program.duration} dk</p></div><span class="badge">${program.level}</span></div>
    <div class="program-assignee">${avatarMarkup(assignedMember?.initials || initialsFromName(program.assigned), assignedMember?.avatarDataUrl || '')}<div><strong>${program.assigned}</strong><small>Atanan üye</small></div></div>
    <div class="program-exercises">
      ${program.exercises.slice(0,4).map((exercise,index)=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>${index+1}</span><div><strong>${exercise}</strong><small>Setleri PT onayıyla güncelle</small></div></div>`).join('')}
    </div>
    <div class="program-actions"><button class="secondary" data-action="assign-program" data-program-id="${program.id}">Üyeye gönder</button><button class="mini-button danger" data-action="delete-program" data-program-id="${program.id}">Sil</button></div>
  </article>`;
  }).join('');
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

function teamCards(){
  return state.team.map(trainer=>{
    const stats = trainerStats(trainer.name);
    const estimatedCommission = stats.revenue * (trainer.commission / 100);
    const account = accountStatusMeta(trainer);
    return `<article class="team-card">
      <div class="team-head">
        ${avatarMarkup(initialsFromName(trainer.name), trainer.avatarDataUrl)}
        <div><h2>${trainer.name}</h2><p>${trainer.role} · ${trainer.specialty}</p><small class="account-line">${escapeAttr(account.detail)}</small></div>
        <div class="team-badges"><span class="badge">%${trainer.commission} prim</span><span class="status ${account.className}">${account.label}</span></div>
      </div>
      <div class="team-stats">
        <div><span>Bugünkü seans</span><strong>${stats.todayTotal}</strong></div>
        <div><span>Tamamlanan</span><strong>${stats.done}</strong></div>
        <div><span>Aktif üye</span><strong>${stats.activeMembers}</strong></div>
        <div><span>Gelir katkısı</span><strong>${formatCurrency(stats.revenue)}</strong></div>
      </div>
      <div class="team-footer"><small>${trainer.phone || 'Telefon eklenmedi'} · Tahmini prim ${formatCurrency(estimatedCommission)}</small><div class="row-actions"><button class="mini-button" data-action="copy-trainer-invite" data-trainer-id="${trainer.id}">Davet</button><button class="mini-button danger" data-action="delete-trainer" data-trainer-id="${trainer.id}">Sil</button></div></div>
    </article>`;
  }).join('');
}

function teamAiNotes(){
  const summary = teamSummary();
  const busiest = state.team
    .map(trainer=>({trainer, stats:trainerStats(trainer.name)}))
    .sort((a,b)=>b.stats.todayTotal-a.stats.todayTotal)[0];
  const notes = [];
  if(busiest?.stats.todayTotal >= 3) notes.push(`${busiest.trainer.name} bugün yoğun; seanslar arasında 10 dk tampon bırak.`);
  if(summary.completed < summary.todaySessions) notes.push(`${summary.todaySessions - summary.completed} seans hâlâ tamamlanmayı bekliyor; gün sonunda işaretle.`);
  notes.push(`Bugünkü tahmini ekip primi ${formatCurrency(summary.estimatedCommission)} seviyesinde.`);
  notes.push('Pilot salonlarda antrenör bazlı memnuniyet notu toplamaya başla.');
  return notes;
}

function taskPriorityLabel(priority){
  return {high:'Yüksek', medium:'Normal', low:'Düşük'}[priority] || 'Normal';
}

function taskPriorityClass(priority){
  return {high:'risk', medium:'warn', low:'good'}[priority] || 'warn';
}

function memberTaskTypeLabel(type){
  return {workout:'Antrenman', nutrition:'Beslenme', followup:'Takip'}[type] || 'Takip';
}

function memberTaskTypeIcon(type){
  return {workout:'▤', nutrition:'◒', followup:'✓'}[type] || '✓';
}

function memberTaskTypeStatus(type){
  return {workout:'good', nutrition:'warn', followup:'risk'}[type] || 'warn';
}

function trainerTaskSummary(){
  const open = state.trainerTasks.filter(task=>task.status === 'open').length;
  const done = state.trainerTasks.filter(task=>task.status === 'done').length;
  const high = state.trainerTasks.filter(task=>task.status === 'open' && task.priority === 'high').length;
  return {open, done, high, total: state.trainerTasks.length};
}

function trainerTaskRows(items=state.trainerTasks){
  return items
    .slice()
    .sort((a,b)=>Number(a.status === 'done') - Number(b.status === 'done') || a.dueDate.localeCompare(b.dueDate))
    .map(task=>`<div class="task-row ${task.status === 'done' ? 'done' : ''}">
      <div><strong>${task.title}</strong><small>${task.trainer} · ${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('tr-TR')} · ${task.note || 'Not yok'}</small></div>
      <span class="status ${task.status === 'done' ? 'good' : taskPriorityClass(task.priority)}">${task.status === 'done' ? 'Tamamlandı' : taskPriorityLabel(task.priority)}</span>
      <div class="row-actions">
        ${task.status === 'done' ? '' : `<button class="mini-button" data-action="complete-trainer-task" data-task-id="${task.id}">Tamamla</button>`}
        <button class="mini-button danger" data-action="delete-trainer-task" data-task-id="${task.id}">Sil</button>
      </div>
    </div>`).join('') || `<div class="empty-mini">Henüz görev veya öneri yok.</div>`;
}

function currentTrainerMemberTasks(){
  const trainerId = trainerProfileIdByName(state.trainerName);
  return state.memberTasks.filter(task=>task.trainer === state.trainerName || (trainerId && task.trainerProfileId === trainerId));
}

function memberTasksForMember(memberName){
  const member = memberByName(memberName);
  return state.memberTasks.filter(task=>task.member === memberName || (member?.id && task.memberId === member.id));
}

function memberTaskRows(items, {owner=false}={}){
  return items
    .slice()
    .sort((a,b)=>Number(a.status === 'done') - Number(b.status === 'done') || a.dueDate.localeCompare(b.dueDate))
    .map(task=>`<div class="task-row member-task ${task.status === 'done' ? 'done' : ''}">
      <span class="task-type ${task.type}">${memberTaskTypeIcon(task.type)}</span>
      <div><strong>${task.title}</strong><small>${memberTaskTypeLabel(task.type)} · ${task.member} · ${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('tr-TR')} · ${task.note || 'Not yok'}</small></div>
      <span class="status ${task.status === 'done' ? 'good' : memberTaskTypeStatus(task.type)}">${task.status === 'done' ? 'Tamamlandı' : memberTaskTypeLabel(task.type)}</span>
      <div class="row-actions">
        ${task.status === 'done' ? '' : `<button class="mini-button" data-action="complete-member-task" data-member-task-id="${task.id}">Tamamla</button>`}
        ${owner ? `<button class="mini-button danger" data-action="delete-member-task" data-member-task-id="${task.id}">Sil</button>` : ''}
      </div>
    </div>`).join('') || `<div class="empty-mini">Henüz üye aksiyonu yok.</div>`;
}

function teamPage(){
  const summary = teamSummary();
  const taskSummary = trainerTaskSummary();
  return `<div class="welcome"><div><span class="eyebrow">EKİP</span><h1>Antrenör performansı</h1><p>Seans yükü, aktif üye, gelir katkısı ve prim görünümünü takip et.</p></div><button class="primary" data-action="add-trainer">+ Antrenör ekle</button></div>
  <section class="metrics">
    ${metric('Antrenör',String(summary.trainers),'aktif ekip','♧')}
    ${metric('Bugünkü seans',String(summary.todaySessions),'ekip toplamı','□')}
    ${metric('Tamamlanan',String(summary.completed),'bugün','✓')}
    ${metric('Açık görev',String(taskSummary.open),`${taskSummary.high} yüksek öncelik`,'!',taskSummary.high > 0)}
  </section>
  <section class="dashboard-grid">
    <div class="team-grid">${teamCards()}</div>
    <article class="card ai-card">
      <span class="ai-label">✦ FORMA AI · EKİP KOÇU</span>
      <h2>Bugünkü ekip notları</h2>
      <p>Antrenör yükü, seans tamamlanma ve gelir katkısına göre kısa yönetim önerileri.</p>
      ${teamAiNotes().map((note,index)=>`<div class="insight"><span>${index+1}</span><div><strong>${note}</strong><small>Ekip aksiyonu</small></div></div>`).join('')}
    </article>
    <article class="card">
      <div class="card-title"><div><h2>Görevler ve öneriler</h2><p>İşletmeciden antrenörlere takip aksiyonları</p></div><button class="secondary" data-action="add-trainer-task">+ Görev ver</button></div>
      <div class="task-list">${trainerTaskRows()}</div>
    </article>
  </section>`;
}

function selectedProgramForMember(memberName){
  const selectedId = state.programSelections[memberName];
  return state.programs.find(program=>program.id === selectedId)
    || state.programs.find(program=>program.assigned === memberName)
    || state.programs[0]
    || normalizeProgram({});
}

function trainerSessionRows(){
  const sessions = sessionsForDate().filter(session=>session.trainer === state.trainerName);
  return sessions.map(session=>`<div class="session-row">
    <div class="session-time"><strong>${session.time}</strong><small>${session.room}</small></div>
    <div><strong>${session.member}</strong><small>${session.program} · ${sessionStatusLabel(session.status)}</small></div>
    <span class="status ${sessionStatusClass(session.status)}">${sessionStatusLabel(session.status)}</span>
    <div class="row-actions">
      <button class="mini-button" data-action="complete-session" data-session-id="${session.id}">Tamamla</button>
      <button class="mini-button" data-action="cancel-session" data-session-id="${session.id}">İptal</button>
    </div>
  </div>`).join('') || `<div class="empty-mini">Bugün sana atanmış seans yok.</div>`;
}

function trainerClientRows(){
  const clients = state.members.filter(member=>member.trainer === state.trainerName);
  return clients.map(member=>`<div class="member-row">
    <div class="member">${avatarMarkup(member.initials, member.avatarDataUrl)}<div><strong>${member.name}</strong><small>${member.phone || 'Telefon yok'}</small></div></div>
    <span><small class="cell-label">Son ziyaret</small><br>${member.last}</span>
    <span><small class="cell-label">Seans</small><br>${member.sessions}</span>
    <span class="status ${member.type}">${member.status}</span>
    <div class="row-actions"><button class="mini-button" data-action="add-member-task" data-member-name="${escapeAttr(member.name)}">Aksiyon</button><button class="mini-button" data-action="checkin-member" data-member-id="${member.id}">Geldi</button></div>
  </div>`).join('') || `<div class="empty-mini">Henüz atanmış danışan yok.</div>`;
}

function trainerProgramRows(){
  const programs = state.programs.filter(program=>program.assigned === 'Atanmadı' || state.members.some(member=>member.name === program.assigned && member.trainer === state.trainerName));
  return programs.slice(0,3).map(program=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8">
    <span>▤</span><div><strong>${program.title}</strong><small>${program.assigned} · ${program.duration} dk · ${program.level}</small></div>
  </div>`).join('') || `<div class="empty-mini">Program atanmadı.</div>`;
}

function currentTrainerTasks(){
  return state.trainerTasks.filter(task=>task.trainer === state.trainerName || task.trainerProfileId === trainerProfileIdByName(state.trainerName));
}

function trainerOwnTaskRows(){
  const tasks = currentTrainerTasks();
  return tasks
    .slice()
    .sort((a,b)=>Number(a.status === 'done') - Number(b.status === 'done') || a.dueDate.localeCompare(b.dueDate))
    .map(task=>`<div class="task-row ${task.status === 'done' ? 'done' : ''}">
      <div><strong>${task.title}</strong><small>${new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('tr-TR')} · ${task.note || 'Not yok'}</small></div>
      <span class="status ${task.status === 'done' ? 'good' : taskPriorityClass(task.priority)}">${task.status === 'done' ? 'Tamamlandı' : taskPriorityLabel(task.priority)}</span>
      ${task.status === 'done' ? '' : `<button class="mini-button" data-action="complete-trainer-task" data-task-id="${task.id}">Tamamla</button>`}
    </div>`).join('') || `<div class="empty-mini">İşletmeciden atanmış görev yok.</div>`;
}

function trainerDashboard(){
  const trainer = state.team.find(item=>item.name === state.trainerName) || state.team[0] || normalizeTrainer({name:'Ece'});
  state.trainerName = trainer.name;
  const stats = trainerStats(trainer.name);
  const clients = state.members.filter(member=>member.trainer === trainer.name);
  const riskyClients = clients.filter(member=>member.type !== 'good');
  const openTasks = currentTrainerTasks().filter(task=>task.status === 'open').length;
  const clientActions = currentTrainerMemberTasks();
  const openClientActions = clientActions.filter(task=>task.status === 'open').length;
  return `<div class="welcome"><div><span class="eyebrow">ANTRENÖR ALANI · ${activeStudio().name}</span><h1>Merhaba ${trainer.name}, bugünün akışı hazır.</h1><p>${trainer.specialty} uzmanlığı için atanmış danışan ve seanslarını buradan takip et.</p></div><div class="welcome-actions"><button class="secondary" data-action="add-member-task">+ Üye aksiyonu</button><button class="primary" data-action="add-session">+ Seans planla</button></div></div>
  <section class="metrics">
    ${metric('Bugünkü seans',String(stats.todayTotal),'sana atanmış','□')}
    ${metric('Tamamlanan',String(stats.done),'bugün','✓')}
    ${metric('Danışan',String(clients.length),'aktif','♙')}
    ${metric('Açık aksiyon',String(openClientActions),`${openTasks} işletmeci notu`,'! ',openClientActions + openTasks > 0)}
  </section>
  <section class="dashboard-grid">
    ${studioPublicCard('ANTRENÖR ALANI · İŞLETME')}
    <article class="card">
      <div class="card-title"><div><h2>Bugünkü seanslarım</h2><p>${formatDateTR(todayISO())}</p></div><span class="badge">${trainer.role}</span></div>
      <div class="session-list">${trainerSessionRows()}</div>
    </article>
    <article class="card ai-card">
      <span class="ai-label">✦ FORMA AI · ANTRENÖR KOÇU</span>
      <h2>${riskyClients.length ? 'Takip isteyen danışan var' : 'Akış sakin ve kontrollü'}</h2>
      <p>Seans, danışan riski ve program durumuna göre bugün için kısa antrenör notları.</p>
      <div class="insight"><span>1</span><div><strong>${stats.scheduled} planlı seansı gün sonunda tamamlandı işaretle.</strong><small>Paket ve raporlar otomatik güncellenir</small></div></div>
      <div class="insight"><span>2</span><div><strong>${riskyClients[0]?.name || 'Aktif danışanlar'} için kısa motivasyon mesajı gönder.</strong><small>Katılım ve yenileme riskini azaltır</small></div></div>
      <div class="insight"><span>3</span><div><strong>Program sonrası notları üye kartında güncelle.</strong><small>Pilot geri bildirimi için değerli</small></div></div>
    </article>
    <article class="card"><div class="card-title"><div><h2>Danışanlarım</h2><p>Antrenörüne atanmış üyeler</p></div><span class="badge">${clients.length} kişi</span></div><div class="member-list">${trainerClientRows()}</div></article>
    <article class="card"><div class="card-title"><div><h2>Programlarım</h2><p>Danışanlara atanmış şablonlar</p></div><button class="secondary" data-action="add-program">Program oluştur</button></div>${trainerProgramRows()}</article>
    <article class="card"><div class="card-title"><div><h2>Üye aksiyonları</h2><p>Antrenman görevi, beslenme notu ve takip komutu</p></div><button class="secondary" data-action="add-member-task">+ Üyeye gönder</button></div><div class="task-list">${memberTaskRows(clientActions, {owner:true})}</div></article>
    <article class="card"><div class="card-title"><div><h2>Görevlerim</h2><p>İşletmeciden gelen öneri ve aksiyonlar</p></div><span class="badge">${openTasks} açık</span></div><div class="task-list">${trainerOwnTaskRows()}</div></article>
  </section>`;
}

function pilotChecklist(){
  return [
    {title:'Her pilot öncesi yedek al', note:'Salon denemesinden önce tek JSON dosyasını indir.'},
    {title:'Deneme sonunda raporu kopyala', note:'Raporlar ekranındaki haftalık özeti salon sahibiyle paylaş.'},
    {title:'Veri bozulursa geri yükle', note:'Önceki JSON yedeğini yükleyerek aynı duruma dön.'},
    {title:'Demo verisini sıfırla', note:'Yeni salon demosuna temiz örnek veriyle başla.'}
  ].map((item,index)=>`<div class="insight"><span>${index+1}</span><div><strong>${item.title}</strong><small>${item.note}</small></div></div>`).join('');
}

function pilotActivationScore(){
  const hasTrainer = state.team.length > 0;
  const hasMembers = state.members.length >= 3;
  const hasProgram = state.programs.length > 0;
  const hasTasks = state.trainerTasks.length + state.memberTasks.length > 0;
  const hasBranding = Boolean(activeStudio().phone || activeStudio().instagram || activeStudio().logoDataUrl);
  const done = [hasTrainer, hasMembers, hasProgram, hasTasks, hasBranding].filter(Boolean).length;
  return Math.round((done / 5) * 100);
}

function pilotTimeline(){
  const steps = [
    ['Gün 0', 'Kurulum', 'İşletme bilgisi, ilk antrenör, ilk 3 üye ve ilk programı gir.'],
    ['Gün 1', 'Aktivasyon', 'Antrenöre 1 görev, üyeye 1 program/beslenme notu gönder.'],
    ['Gün 7', 'İlk ölçüm', 'Kaç görev, kaç seans, kaç program güncellendi raporla.'],
    ['Gün 14', 'Alışkanlık', 'Antrenörlerden gerçek kullanım yorumu al, eksikleri listele.'],
    ['Gün 30', 'Dönüşüm', 'Zaman kazancı, takip görünürlüğü ve fiyat teklifini konuş.']
  ];
  return steps.map(([day,title,note],index)=>`<div class="pilot-step">
    <span>${day}</span>
    <div><strong>${title}</strong><small>${note}</small></div>
    <b>${index+1}</b>
  </div>`).join('');
}

function pilotSuccessRows(){
  const score = pilotActivationScore();
  const openTasks = state.trainerTasks.filter(task=>task.status === 'open').length + state.memberTasks.filter(task=>task.status === 'open').length;
  const sessions = sessionSummary();
  const finance = financeSummary();
  return [
    ['Aktivasyon skoru', `%${score}`, score >= 70 ? 'Satış görüşmesine yakın' : 'Kurulum adımları tamamlanmalı'],
    ['Açık takip', String(openTasks), openTasks ? 'Gün sonunda kapatılacak aksiyon var' : 'Açık takip yok'],
    ['Bugünkü seans', String(sessions.total), `${sessions.done} tamamlandı, ${sessions.scheduled} planlı`],
    ['Bekleyen tahsilat', formatCurrency(finance.pending), finance.pending ? 'Satış değerini finans takibiyle göster' : 'Tahsilat riski düşük']
  ].map(row=>`<div><span>${row[0]}</span><strong>${row[1]}</strong><small>${row[2]}</small></div>`).join('');
}

function pilotStageLabel(stage){
  return {
    lead:'Başvuru',
    demo:'Demo',
    pilot:'Pilot',
    proposal:'Teklif',
    won:'Kazandı',
    lost:'Kaybedildi'
  }[stage] || 'Başvuru';
}

function pilotStageClass(stage){
  return {
    lead:'warn',
    demo:'warn',
    pilot:'good',
    proposal:'good',
    won:'good',
    lost:'risk'
  }[stage] || 'warn';
}

function nextPilotStage(stage){
  return {lead:'demo', demo:'pilot', pilot:'proposal', proposal:'won', won:'won', lost:'lost'}[stage] || 'demo';
}

function pilotFunnelSummary(){
  const active = state.pilotLeads.filter(lead=>!['won','lost'].includes(lead.stage)).length;
  const won = state.pilotLeads.filter(lead=>lead.stage === 'won').length;
  const lost = state.pilotLeads.filter(lead=>lead.stage === 'lost').length;
  const pipeline = state.pilotLeads
    .filter(lead=>!['lost'].includes(lead.stage))
    .reduce((sum,lead)=>sum + lead.value, 0);
  const proposal = state.pilotLeads
    .filter(lead=>lead.stage === 'proposal')
    .reduce((sum,lead)=>sum + lead.value, 0);
  const total = state.pilotLeads.length;
  const closed = won + lost;
  const conversion = closed ? Math.round((won / closed) * 100) : Math.round((won / Math.max(total, 1)) * 100);
  return {active, won, lost, pipeline, proposal, total, conversion};
}

function pilotStageWeight(stage){
  return {lead:12, demo:30, pilot:56, proposal:78, won:100, lost:0}[stage] || 12;
}

function pilotLeadHeat(lead){
  const memberBonus = lead.members === '300+' ? 8 : lead.members === '151–300' ? 6 : lead.members === '51–150' ? 4 : 2;
  const aiBonus = /ai|yapay|öneri|rapor/i.test(lead.goal || '') ? 5 : 0;
  const valueBonus = lead.value >= 2400 ? 6 : lead.value >= 1400 ? 4 : 2;
  return Math.min(100, pilotStageWeight(lead.stage) + memberBonus + aiBonus + valueBonus);
}

function pilotSuggestedPackage(lead){
  if(lead.value >= 2400 || lead.members === '151–300' || lead.members === '300+' || /ai|yapay|öneri|rapor/i.test(lead.goal || '')) return 'Studio AI';
  if(lead.value >= 1400 || lead.members === '51–150') return 'Studio';
  return 'Starter';
}

function pilotFunnelRows(){
  const stages = ['lead','demo','pilot','proposal','won'];
  const maxCount = Math.max(1, ...stages.map(stage=>state.pilotLeads.filter(lead=>lead.stage === stage).length));
  return stages.map(stage=>{
    const leads = state.pilotLeads.filter(lead=>lead.stage === stage);
    const value = leads.reduce((sum,lead)=>sum + lead.value, 0);
    const width = Math.max(10, Math.round((leads.length / maxCount) * 100));
    return `<div class="pilot-funnel-row">
      <div><strong>${pilotStageLabel(stage)}</strong><small>${leads.length} salon · ${formatCurrency(value)}</small></div>
      <span class="pilot-funnel-track"><i style="width:${width}%"></i></span>
    </div>`;
  }).join('');
}

function hotPilotLead(){
  return state.pilotLeads
    .filter(lead=>!['won','lost'].includes(lead.stage))
    .slice()
    .sort((a,b)=>pilotLeadHeat(b) - pilotLeadHeat(a) || b.value - a.value || new Date(b.createdAt) - new Date(a.createdAt))[0];
}

function pilotNextMoveCard(){
  const lead = hotPilotLead();
  if(!lead){
    return `<div class="pilot-next-empty"><strong>Aktif takip kalmadı.</strong><small>Yeni kurucu pilot başvurusu ekleyerek funnel’ı tekrar doldur.</small></div>`;
  }
  const heat = pilotLeadHeat(lead);
  return `<div class="pilot-next-lead">
    <div class="pilot-next-head">
      <div><span class="eyebrow">EN SICAK FIRSAT</span><h3>${escapeAttr(lead.studio)}</h3><p>${escapeAttr(lead.name)} · ${escapeAttr(lead.city)} · ${escapeAttr(lead.members)} üye</p></div>
      <strong>%${heat}</strong>
    </div>
    <div class="pilot-next-grid">
      <div><span>Aşama</span><strong>${pilotStageLabel(lead.stage)}</strong></div>
      <div><span>Paket</span><strong>${pilotSuggestedPackage(lead)}</strong></div>
      <div><span>Aylık değer</span><strong>${formatCurrency(lead.value)}</strong></div>
    </div>
    <p class="pilot-next-action">${escapeAttr(lead.nextAction)}</p>
    <div class="row-actions">
      <button class="mini-button" data-action="copy-pilot-offer" data-lead-id="${lead.id}">Teklifi kopyala</button>
      <button class="mini-button" data-action="advance-pilot-lead" data-lead-id="${lead.id}">Aşamayı ilerlet</button>
    </div>
  </div>`;
}

function pilotLeadStudioId(lead){
  const studioName = String(lead?.studio || '').toLocaleLowerCase('tr');
  const existingStudio = state.studios.find(studio => studio.name.toLocaleLowerCase('tr') === studioName);
  return existingStudio?.id || '';
}

function pilotLeadActionButtons(lead){
  const linkedStudioId = pilotLeadStudioId(lead);
  const stageActions = ['won','lost'].includes(lead.stage)
    ? ''
    : `<button class="mini-button" data-action="advance-pilot-lead" data-lead-id="${lead.id}">İlerle</button><button class="mini-button" data-action="mark-pilot-lost" data-lead-id="${lead.id}">Kaybet</button>`;
  const wonAction = lead.stage === 'won'
    ? linkedStudioId
      ? `<button class="mini-button" data-action="select-studio" data-studio-id="${linkedStudioId}">Stüdyoyu aç</button>`
      : `<button class="mini-button" data-action="convert-pilot-lead" data-lead-id="${lead.id}">Stüdyoya aktar</button>`
    : '';
  return `<button class="mini-button" data-action="copy-pilot-offer" data-lead-id="${lead.id}">Teklif</button>${stageActions}${wonAction}<button class="mini-button danger" data-action="delete-pilot-lead" data-lead-id="${lead.id}">Sil</button>`;
}

function pilotLeadRows(){
  return state.pilotLeads
    .slice()
    .sort((a,b)=>new Date(b.createdAt) - new Date(a.createdAt))
    .map(lead=>`<div class="pilot-lead-row">
      <div><strong>${escapeAttr(lead.studio)}</strong><small>${escapeAttr(lead.name)} · ${escapeAttr(lead.city)} · ${escapeAttr(lead.members)} üye</small></div>
      <span class="status ${pilotStageClass(lead.stage)}">${pilotStageLabel(lead.stage)}</span>
      <div><strong>${formatCurrency(lead.value)}</strong><small>${pilotSuggestedPackage(lead)} · ${escapeAttr(lead.goal)}</small></div>
      <div class="pilot-lead-score"><strong>%${pilotLeadHeat(lead)}</strong><small>Sıcaklık</small></div>
      <div><strong>Sonraki</strong><small>${escapeAttr(lead.nextAction)}</small></div>
      <div class="row-actions">
        ${pilotLeadActionButtons(lead)}
      </div>
    </div>`).join('') || `<div class="empty-mini">Henüz kurucu pilot lead’i yok.</div>`;
}

function studioContactRows(){
  const studio = activeStudio();
  const instagram = studio.instagram ? (studio.instagram.startsWith('@') ? studio.instagram : `@${studio.instagram}`) : '';
  const items = [
    ['Telefon', studio.phone || 'Eklenmedi'],
    ['WhatsApp', studio.whatsapp || 'Eklenmedi'],
    ['Adres', studio.address || 'Eklenmedi'],
    ['Instagram', instagram || 'Eklenmedi'],
    ['Web sitesi', studio.website || 'Eklenmedi'],
    ['Konum linki', studio.mapUrl ? 'Harita linki hazır' : 'Eklenmedi']
  ];
  return items.map(([label,value])=>`<div><span>${label}</span><strong>${escapeAttr(value)}</strong></div>`).join('');
}

function compactStudioInfoItems(){
  const studio = activeStudio();
  const instagram = studio.instagram ? (studio.instagram.startsWith('@') ? studio.instagram : `@${studio.instagram}`) : '';
  return [
    ['Konum', studio.address || studio.location || 'Adres eklenmedi'],
    ['Telefon', studio.phone || 'Telefon eklenmedi'],
    ['Instagram', instagram || 'Instagram eklenmedi'],
    ['Web', studio.website || 'Web sitesi eklenmedi']
  ];
}

function studioPublicCard(note='İşletme bilgileri'){
  const studio = activeStudio();
  return `<article class="card studio-public-card">
    <div class="studio-public-head">
      ${avatarMarkup(studio.initials, studio.logoDataUrl, 'studio-public-logo')}
      <div><span class="eyebrow">${escapeAttr(note)}</span><h2>${escapeAttr(studio.name)}</h2><p>${escapeAttr(studio.location || 'Konum eklenmedi')}</p></div>
    </div>
    <div class="studio-public-info">
      ${compactStudioInfoItems().map(([label,value])=>`<div><span>${label}</span><strong>${escapeAttr(value)}</strong></div>`).join('')}
    </div>
  </article>`;
}

function pilotPage(){
  const payload = backupPayload();
  const activationScore = pilotActivationScore();
  const funnel = pilotFunnelSummary();
  return `<div class="welcome"><div><span class="eyebrow">PİLOT SATIŞ ODASI</span><h1>Kurucu pilotları gelire çevir</h1><p>Başvuru, demo, pilot ve teklif aşamalarını tek ekranda takip et; en sıcak fırsata bir sonraki hamleyi uygula.</p></div><div class="welcome-actions"><button class="secondary" data-action="start-onboarding">İlk kurulum</button><button class="primary" data-action="customize-studio">Sayfayı özelleştir</button></div></div>
  <section class="metrics">
    ${metric('Üye',String(payload.members.length),'yedekte','♙')}
    ${metric('Aktif lead',String(funnel.active),`${funnel.won} kazandı`,'◌')}
    ${metric('Pipeline',formatCurrency(funnel.pipeline),'aylık potansiyel','₺')}
    ${metric('Dönüşüm',`%${funnel.conversion}`,`${funnel.proposal ? formatCurrency(funnel.proposal) : 'teklif bekliyor'}`,'↗',funnel.conversion < 30)}
  </section>
  <section class="pilot-command-grid">
    <article class="card pilot-funnel-card">
      <div class="card-title"><div><h2>Funnel görünümü</h2><p>Başvurudan kazanıma kadar aylık potansiyel</p></div><span class="badge">${funnel.total} lead</span></div>
      <div class="pilot-funnel-list">${pilotFunnelRows()}</div>
    </article>
    <article class="card pilot-next-card">
      <div class="card-title"><div><h2>Sıradaki satış hamlesi</h2><p>Önceliği en yüksek pilot fırsatı</p></div><span class="badge">%${activationScore} pilot skor</span></div>
      ${pilotNextMoveCard()}
    </article>
  </section>
  <section class="dashboard-grid">
    <article class="card pilot-crm-card">
      <div class="card-title"><div><h2>Kurucu pilot CRM</h2><p>Başvuru → demo → pilot → teklif akışını takip et</p></div><button class="secondary" data-action="add-pilot-lead">+ Lead ekle</button></div>
      <div class="pilot-lead-list">${pilotLeadRows()}</div>
    </article>
    <article class="card pilot-plan-card">
      <div class="card-title"><div><h2>30 günlük pilot planı</h2><p>Başvuru gelen salonu ödeme görüşmesine taşıyan takip akışı</p></div><span class="badge">${payload.studios.length} stüdyo</span></div>
      <div class="pilot-timeline">${pilotTimeline()}</div>
    </article>
    <article class="card">
      <div class="card-title"><div><h2>Pilot başarı kriterleri</h2><p>Satış konuşmasında kullanılacak kanıtlar</p></div><span class="badge">%${activationScore}</span></div>
      <div class="pilot-success-grid">${pilotSuccessRows()}</div>
    </article>
    <article class="card">
      <div class="card-title"><div><h2>Veri işlemleri</h2><p>Ücretsiz pilot için tarayıcı verisini güvenceye al</p></div><span class="badge">JSON</span></div>
      <div class="pilot-actions">
        <button class="primary" data-action="customize-studio">Logo / renk ayarla</button>
        <button class="primary" data-action="start-onboarding">İlk kurulum sihirbazı</button>
        <button class="primary" data-action="export-full-backup">Tüm veriyi indir</button>
        <button class="secondary" data-action="import-full-backup">Yedeği geri yükle</button>
        <button class="secondary danger-action" data-action="reset-demo-data">Demo verisini sıfırla</button>
      </div>
      <div class="report-list">
        <div><span>Son yedek zamanı</span><strong>${new Date(payload.exportedAt).toLocaleString('tr-TR')}</strong></div>
        <div><span>Aktif stüdyo</span><strong>${activeStudio().name}</strong></div>
        <div><span>Yedek formatı</span><strong>Formera v${payload.version}</strong></div>
      </div>
    </article>
    <article class="card ai-card">
      <span class="ai-label">✦ FORMA AI · PİLOT GÜVENLİĞİ</span>
      <h2>Denemeye çıkmadan önce</h2>
      <p>Bu paneli her salon demosundan önce ve sonra kullan. Veri kaybı riskini minimumda tutar.</p>
      ${pilotChecklist()}
    </article>
    <article class="card">
      <div class="card-title"><div><h2>Backend hazırlığı</h2><p>Çok cihazlı MVP için Supabase geçiş adımları</p></div><span class="badge">Hazır şema</span></div>
      <div class="report-list">
        <div><span>Veritabanı şeması</span><strong>supabase/schema.sql</strong></div>
        <div><span>Kurulum notu</span><strong>supabase/README.md</strong></div>
        <div><span>Bağlantı örneği</span><strong>config.example.js</strong></div>
      </div>
    </article>
    <article class="card">
      <div class="card-title"><div><h2>İşletme iletişim bilgileri</h2><p>Adres, telefon ve sosyal medya görünümü</p></div><button class="secondary" data-action="customize-studio">Düzenle</button></div>
      <div class="report-list">${studioContactRows()}</div>
    </article>
  </section>`;
}

function genericPage(title, desc, icon){return `<div class="welcome"><div><span class="eyebrow">NORTHFIT STUDIO</span><h1>${title}</h1><p>${desc}</p></div><button class="primary">+ Yeni oluştur</button></div><article class="card page-card"><div class="empty-illustration"><div><b>${icon}</b><h2>${title} modülü hazırlanıyor</h2><p>İlk pilot kapsamındaki veri yapısı bu ekrana bağlanacak.</p></div></div></article>`}

function memberDashboard(){
  const member = currentMember();
  const memberName = member.name;
  const program = selectedProgramForMember(memberName);
  const signature = memberSignature(memberName);
  const parsed = parseSessions(member.sessions);
  const remaining = Math.max(0, parsed.total - parsed.used);
  const memberSessions = state.sessions.filter(session=>session.member === memberName);
  const weeklyDone = memberSessions.filter(session=>session.status === 'done').length;
  const actions = memberTasksForMember(memberName);
  const openActions = actions.filter(task=>task.status === 'open').length;
  return `<div class="welcome"><div><span class="eyebrow">ÜYE ALANI</span><h1>Merhaba ${member.name.split(' ')[0] || member.name}, hazırsan başlayalım.</h1><p>${activeStudio().name} programın ve seans durumun burada.</p></div><button class="primary" data-action="start-workout">Antrenmanı başlat</button></div>
  <section class="metrics">${metric('Bu haftaki antrenman',`${weeklyDone} tamamlandı`,'canlı seans','✓')}${metric('Toplam seans',member.sessions,`${remaining} seans kaldı`,'◷')}${metric('Açık görev',String(openActions),'antrenör notu','!',openActions > 0)}${metric('Antrenör',member.trainer || 'Atanmadı','sorumlu PT','♧')}</section>
  <section class="dashboard-grid">${studioPublicCard('ÜYE ALANI · İŞLETME')}
  <article class="card"><div class="card-title"><div><h2>Bugünkü program</h2><p>${program.title} · ${program.duration} dakika</p></div><span class="badge">${program.level}</span></div>
  ${program.exercises.map((x,i)=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>${i+1}</span><div><strong>${x}</strong><small>Dinlenme 60–90 saniye</small></div></div>`).join('')}</article>
  <article class="card ai-card"><span class="ai-label">✦ FORMA AI</span><h2>İstikrarlı gidiyorsun.</h2><p>${program.goal} hedefi için son üç haftadır programına %89 uyum gösterdin. Bugün ağırlık artırmadan formu koruman daha iyi olabilir.</p><button class="primary ai-action" data-action="coach-tip">Koç notunu gör →</button></article>
  <article class="card"><div class="card-title"><div><h2>Antrenör notları</h2><p>Program, beslenme ve takip görevlerin</p></div><span class="badge">${openActions} açık</span></div><div class="task-list">${memberTaskRows(actions)}</div></article>
  <article class="card"><div class="card-title"><div><h2>Program seç</h2><p>Bugün takip etmek istediğin programı seç.</p></div><span class="badge">${state.programs.length} seçenek</span></div>
  <div class="choice-list">${state.programs.map(item=>`<button class="choice-card ${item.id === program.id ? 'active' : ''}" data-action="select-member-program" data-program-id="${item.id}" data-member-name="${memberName}"><strong>${item.title}</strong><small>${item.goal} · ${item.duration} dk</small></button>`).join('')}</div></article>
  <article class="card"><div class="card-title"><div><h2>Onaylarım</h2><p>Dijital imza ve sözleşme durumu</p></div><button class="secondary" data-action="sign-current-member">İmza at</button></div>
  <div class="report-list"><div><span>Son imza</span><strong>${signature ? new Date(signature.signedAt).toLocaleDateString('tr-TR') : 'Yok'}</strong></div><div><span>Onay tipi</span><strong>${signature?.type || 'Bekliyor'}</strong></div></div></article></section>`}

const pages={programs:['Programlar','Antrenman şablonlarını oluştur ve üyelere ata.','▤'],calendar:['Takvim','PT seanslarını ve stüdyo kapasitesini planla.','□'],finance:['Finans','Gelir, gider ve tahsilat hareketlerini yönet.','₺'],reports:['Raporlar','Haftalık ve aylık performansı karşılaştır.','↗'],team:['Ekip','Antrenörleri, görevleri ve performansı izle.','♧'],pilot:['Pilot araçları','Yedekleme, geri yükleme ve demo sıfırlama.','⚑']};

function syncNavState(){
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === state.page);
  });
}

function render(){
  const count = document.querySelector('#memberCount');
  if(count) count.textContent = state.members.length;
  syncNavState();
  updateStudioShell();
  updateRoleShell();
  updateBackendShell();
  updateAccountSummary();
  if(state.role==='trainer'){app.innerHTML=trainerDashboard();return bind()}
  if(state.role==='member'){app.innerHTML=memberDashboard();return bind()}
  app.innerHTML=state.page==='dashboard'?dashboard():state.page==='members'?memberPage():state.page==='programs'?programsPage():state.page==='calendar'?calendarPage():state.page==='finance'?financePage():state.page==='reports'?reportsPage():state.page==='team'?teamPage():state.page==='pilot'?pilotPage():genericPage(...pages[state.page]); bind();
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
    memberForm.elements.email.value = member.email || '';
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
  deleteRemoteRow('members', id);
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

function downloadJson(payload, filename){
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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
  deleteRemoteRow('finance_entries', id);
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
  deleteRemoteRow('programs', id);
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
  deleteRemoteRow('sessions', id);
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

function openTrainerModal(){
  trainerForm.reset();
  trainerModal.showModal();
}

function openTrainerTaskModal(){
  trainerTaskForm.reset();
  const select = trainerTaskForm.elements.trainer;
  select.innerHTML = state.team.map(trainer=>`<option value="${escapeAttr(trainer.name)}">${escapeAttr(trainer.name)}</option>`).join('');
  trainerTaskForm.elements.dueDate.value = todayISO();
  trainerTaskModal.showModal();
}

function openMemberTaskModal(memberName=''){
  memberTaskForm.reset();
  const trainerSelect = memberTaskForm.elements.trainer;
  const memberSelect = memberTaskForm.elements.member;
  const trainerName = state.role === 'trainer' ? state.trainerName : state.team[0]?.name || 'Ece';
  const visibleMembers = state.role === 'trainer'
    ? state.members.filter(member=>member.trainer === trainerName)
    : state.members;
  memberSelect.innerHTML = visibleMembers.map(member=>`<option value="${escapeAttr(member.name)}">${escapeAttr(member.name)}</option>`).join('');
  trainerSelect.innerHTML = state.team.map(trainer=>`<option value="${escapeAttr(trainer.name)}">${escapeAttr(trainer.name)}</option>`).join('');
  if(memberName && visibleMembers.some(member=>member.name === memberName)) memberSelect.value = memberName;
  trainerSelect.value = trainerName;
  memberTaskForm.elements.dueDate.value = todayISO();
  memberTaskModal.showModal();
}

function completeTrainerTask(id){
  const task = state.trainerTasks.find(item=>item.id === id);
  if(!task) return;
  task.status = 'done';
  task.completedAt = new Date().toISOString();
  saveTrainerTasks();
  render();
  showToast(`${task.title} tamamlandı işaretlendi.`);
}

function deleteTrainerTask(id){
  const task = state.trainerTasks.find(item=>item.id === id);
  if(!task) return;
  if(!confirm(`${task.title} görevini silmek istiyor musun?`)) return;
  deleteRemoteRow('trainer_tasks', id);
  state.trainerTasks = state.trainerTasks.filter(item=>item.id !== id);
  saveTrainerTasks();
  render();
  showToast('Görev silindi.');
}

function completeMemberTask(id){
  const task = state.memberTasks.find(item=>item.id === id);
  if(!task) return;
  task.status = 'done';
  task.completedAt = new Date().toISOString();
  saveMemberTasks();
  render();
  showToast(`${task.title} tamamlandı.`);
}

function deleteMemberTask(id){
  const task = state.memberTasks.find(item=>item.id === id);
  if(!task) return;
  if(!confirm(`${task.member} için "${task.title}" aksiyonu silinsin mi?`)) return;
  deleteRemoteRow('member_tasks', id);
  state.memberTasks = state.memberTasks.filter(item=>item.id !== id);
  saveMemberTasks();
  render();
  showToast('Üye aksiyonu silindi.');
}

function deleteTrainer(id){
  const trainer = state.team.find(x=>x.id === id);
  if(!trainer) return;
  if(!confirm(`${trainer.name} ekipten kaldırılsın mı?`)) return;
  deleteRemoteRow('profiles', trainer.profileId || id);
  state.team = state.team.filter(x=>x.id !== id);
  saveTeam();
  render();
  showToast(`${trainer.name} ekipten kaldırıldı.`);
}

function exportFullBackup(){
  downloadJson(backupPayload(), `formera-tam-yedek-${new Date().toISOString().slice(0,10)}.json`);
  showToast('Tüm Formera verisi indirildi.');
}

function importFullBackup(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try{
      applyBackupPayload(JSON.parse(reader.result));
      render();
      showToast('Formera yedeği başarıyla geri yüklendi.');
    }catch(e){
      showToast('Yedek dosyası geçersiz veya okunamadı.');
    }
  };
  reader.readAsText(file);
}

function confirmResetDemoData(){
  if(!confirm('Demo verisine sıfırlamak mevcut tarayıcı verisini değiştirecek. Önce yedek aldıysan devam edelim mi?')) return;
  resetDemoData();
  render();
  showToast('Demo verisi sıfırlandı.');
}

function updateOnboardingStep(){
  if(!onboardingModal) return;
  onboardingForm?.querySelectorAll('.onboarding-step').forEach((step,index)=>{
    step.classList.toggle('active', index === onboardingStep);
  });
  onboardingForm?.querySelectorAll('.onboarding-progress span').forEach((dot,index)=>{
    dot.classList.toggle('active', index <= onboardingStep);
  });
  const back = document.querySelector('#onboardingBack');
  const next = document.querySelector('#onboardingNext');
  const finish = document.querySelector('#onboardingFinish');
  const copy = document.querySelector('#onboardingCopyInvites');
  if(back) back.style.display = onboardingStep === 0 ? 'none' : '';
  if(next) next.style.display = onboardingStep >= 4 ? 'none' : '';
  if(finish) finish.style.display = onboardingStep >= 4 ? '' : 'none';
  if(copy) copy.style.display = onboardingStep >= 4 ? '' : 'none';
}

function prefillOnboarding(){
  if(!onboardingForm) return;
  const studio = activeStudio();
  const trainer = state.team[0] || {};
  const member = state.members[0] || {};
  const program = state.programs[0] || {};
  onboardingForm.elements.studioName.value = studio.name || '';
  onboardingForm.elements.studioLocation.value = studio.location || '';
  onboardingForm.elements.studioPhone.value = studio.phone || '';
  onboardingForm.elements.studioAddress.value = studio.address || '';
  onboardingForm.elements.studioInstagram.value = studio.instagram || '';
  onboardingForm.elements.trainerName.value = trainer.name || '';
  onboardingForm.elements.trainerEmail.value = trainer.email || '';
  onboardingForm.elements.trainerPhone.value = trainer.phone || '';
  onboardingForm.elements.trainerSpecialty.value = trainer.specialty || '';
  onboardingForm.elements.memberName.value = member.name || '';
  onboardingForm.elements.memberEmail.value = member.email || '';
  onboardingForm.elements.memberPhone.value = member.phone || '';
  onboardingForm.elements.memberPackage.value = `${parseSessions(member.sessions || '0 / 12').total} Seans`;
  onboardingForm.elements.programTitle.value = program.title || '';
  onboardingForm.elements.programGoal.value = program.goal || '';
  onboardingForm.elements.programDuration.value = program.duration || 45;
  onboardingForm.elements.programExercises.value = Array.isArray(program.exercises) ? program.exercises.join('\n') : '';
}

function openOnboardingModal({fresh=false}={}){
  if(!onboardingModal || !onboardingForm) return;
  if(fresh) onboardingForm.reset();
  else prefillOnboarding();
  onboardingStep = 0;
  updateOnboardingStep();
  onboardingModal.showModal();
}

async function copyOnboardingInvites(){
  if(!onboardingForm) return;
  const data = new FormData(onboardingForm);
  const trainerEmail = data.get('trainerEmail')?.trim();
  const memberEmail = data.get('memberEmail')?.trim();
  const studioName = data.get('studioName')?.trim() || activeStudio().name;
  const invites = [];
  if(trainerEmail){
    invites.push(inviteText({name:data.get('trainerName')?.trim() || 'Antrenör', email:trainerEmail}, 'antrenör').replace(activeStudio().name, studioName));
  }
  if(memberEmail){
    invites.push(inviteText({name:data.get('memberName')?.trim() || 'Üye', email:memberEmail}, 'üye').replace(activeStudio().name, studioName));
  }
  if(!invites.length){
    showToast('Davet kopyalamak için antrenör veya üye e-postası gir.');
    return;
  }
  try{
    await navigator.clipboard?.writeText(invites.join('\n\n---\n\n'));
    showToast('Antrenör/üye davet metinleri kopyalandı.');
  }catch(e){
    showToast('Davet metinleri kopyalanamadı. Tarayıcı izin vermedi.');
  }
}

async function completeOnboarding(form){
  const data = new FormData(form);
  const studio = activeStudio();
  const studioName = data.get('studioName').trim();
  const logoFile = data.get('studioLogo');
  const logoDataUrl = logoFile?.size ? await imageFileToDataUrl(logoFile, 520) : studio.logoDataUrl;
  const trainerName = data.get('trainerName').trim();
  const trainerEmail = data.get('trainerEmail').trim().toLocaleLowerCase('tr');
  const memberName = data.get('memberName').trim();
  const memberEmail = data.get('memberEmail').trim().toLocaleLowerCase('tr');
  const total = parsePackageTotal(data.get('memberPackage'));
  const programTitle = data.get('programTitle').trim();

  const updatedStudio = normalizeStudio({
    ...studio,
    name: studioName,
    initials: initialsFromName(studioName),
    location: data.get('studioLocation').trim() || 'Konum eklenmedi',
    phone: data.get('studioPhone').trim(),
    address: data.get('studioAddress').trim(),
    instagram: data.get('studioInstagram').trim(),
    logoDataUrl,
    status: 'Kurulum tamamlandı'
  });

  const trainer = normalizeTrainer({
    id: makeId(),
    profileId: makeId(),
    name: trainerName,
    role: 'PT Coach',
    specialty: data.get('trainerSpecialty').trim() || 'Genel fitness',
    phone: data.get('trainerPhone').trim(),
    commission: 15,
    email: trainerEmail
  });

  const member = normalizeMember({
    id: makeId(),
    profileId: memberEmail ? makeId() : null,
    name: memberName,
    initials: initialsFromName(memberName),
    trainer: trainer.name,
    trainerProfileId: trainer.profileId,
    phone: data.get('memberPhone').trim(),
    email: memberEmail,
    sessions: `0 / ${total}`,
    status: 'Yeni',
    type: 'warn',
    last: 'Henüz gelmedi'
  });

  const program = normalizeProgram({
    id: makeId(),
    title: programTitle,
    goal: data.get('programGoal').trim() || 'Genel fitness',
    duration: data.get('programDuration') || 45,
    level: 'Başlangıç',
    assigned: member.name,
    exercises: data.get('programExercises')
  });

  state.studios = state.studios.map(item=>item.id === studio.id ? updatedStudio : item);
  state.team = [trainer, ...state.team.filter(item=>item.name !== trainer.name)];
  state.members = [member, ...state.members.filter(item=>item.name !== member.name)];
  state.programs = [program, ...state.programs.filter(item=>item.title !== program.title)];
  state.programSelections[member.name] = program.id;
  state.page = 'dashboard';
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  persistAllData();
  onboardingModal.close();
  form.reset();
  render();
  showToast('İlk kurulum tamamlandı. Davetleri üye ve ekip kartlarından kopyalayabilirsin.');
}

function openStudioBrandModal(){
  const studio = activeStudio();
  studioBrandForm.reset();
  studioBrandForm.elements.name.value = studio.name;
  studioBrandForm.elements.location.value = studio.location;
  studioBrandForm.elements.address.value = studio.address || '';
  studioBrandForm.elements.phone.value = studio.phone || '';
  studioBrandForm.elements.whatsapp.value = studio.whatsapp || '';
  studioBrandForm.elements.instagram.value = studio.instagram || '';
  studioBrandForm.elements.website.value = studio.website || '';
  studioBrandForm.elements.mapUrl.value = studio.mapUrl || '';
  studioBrandForm.elements.initials.value = studio.initials;
  studioBrandForm.elements.accentColor.value = studio.accentColor || '#d9ff64';
  studioBrandModal.showModal();
}

function signaturePoint(event){
  const rect = signatureCanvas.getBoundingClientRect();
  const pointer = event.touches?.[0] || event;
  return {
    x: (pointer.clientX - rect.left) * (signatureCanvas.width / rect.width),
    y: (pointer.clientY - rect.top) * (signatureCanvas.height / rect.height)
  };
}

function clearSignatureCanvas(){
  if(!signatureCanvas) return;
  const context = signatureCanvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  context.strokeStyle = '#171914';
  context.lineWidth = 3;
  context.lineCap = 'round';
}

function setupSignaturePad(){
  if(signaturePadReady || !signatureCanvas) return;
  clearSignatureCanvas();
  const context = signatureCanvas.getContext('2d');
  const start = event => {
    event.preventDefault();
    signatureDrawing = true;
    const point = signaturePoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };
  const move = event => {
    if(!signatureDrawing) return;
    event.preventDefault();
    const point = signaturePoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };
  const stop = () => { signatureDrawing = false; };
  signatureCanvas.addEventListener('mousedown', start);
  signatureCanvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', stop);
  signatureCanvas.addEventListener('touchstart', start, {passive:false});
  signatureCanvas.addEventListener('touchmove', move, {passive:false});
  signatureCanvas.addEventListener('touchend', stop);
  signaturePadReady = true;
}

function openSignatureModal(member){
  signatureForm.reset();
  signatureForm.elements.member.value = member?.name || 'Selin Aksoy';
  setupSignaturePad();
  clearSignatureCanvas();
  signatureModal.showModal();
}

function saveSignature(form){
  const data = new FormData(form);
  const signature = normalizeSignature({
    id: makeId(),
    member: data.get('member').trim(),
    type: data.get('type'),
    signedAt: new Date().toISOString(),
    dataUrl: signatureCanvas.toDataURL('image/png')
  });
  state.signatures.unshift(signature);
  saveSignatures();
  signatureModal.close();
  render();
  showToast(`${signature.member} için imza kaydedildi.`);
}

function selectMemberProgram(memberName, programId){
  const program = state.programs.find(item=>item.id === programId);
  if(!program) return;
  state.programSelections[memberName] = programId;
  saveProgramSelections();
  render();
  showToast(`${memberName} için ${program.title} seçildi.`);
}

function selectStudio(id){
  state.activeStudioId = id;
  saveActiveStudio();
  updateStudioShell();
  render();
  showToast(`${activeStudio().name} pilot alanına geçildi.`);
}

function cycleStudio(){
  const index = state.studios.findIndex(studio=>studio.id === state.activeStudioId);
  const next = state.studios[(index + 1) % state.studios.length];
  if(next) selectStudio(next.id);
}

function openPilotLeadModal(){
  pilotLeadForm?.reset();
  pilotLeadModal?.showModal();
}

function advancePilotLead(id){
  const lead = state.pilotLeads.find(item=>item.id === id);
  if(!lead) return;
  lead.stage = nextPilotStage(lead.stage);
  lead.nextAction = lead.stage === 'demo' ? 'Demo tarihini netleştir'
    : lead.stage === 'pilot' ? 'Gün 7 kullanım raporunu paylaş'
    : lead.stage === 'proposal' ? 'Kurucu fiyat teklifini gönder'
    : lead.stage === 'won' ? 'Ödeme ve canlı kurulum adımını başlat'
    : lead.nextAction;
  savePilotLeads();
  render();
  showToast(`${lead.studio} aşaması ${pilotStageLabel(lead.stage)} olarak güncellendi.`);
}

function markPilotLeadLost(id){
  const lead = state.pilotLeads.find(item=>item.id === id);
  if(!lead) return;
  lead.stage = 'lost';
  lead.nextAction = 'Kayıp nedeni not edildi; 30 gün sonra tekrar temas et';
  savePilotLeads();
  render();
  showToast(`${lead.studio} kaybedildi olarak işaretlendi.`);
}

function convertPilotLeadToStudio(id){
  const lead = state.pilotLeads.find(item=>item.id === id);
  if(!lead) return;
  const existingStudioId = pilotLeadStudioId(lead);
  if(existingStudioId){
    selectStudio(existingStudioId);
    showToast(`${lead.studio} zaten pilot stüdyo listesinde.`);
    return;
  }
  const studio = normalizeStudio({
    id: makeId(),
    name: lead.studio,
    initials: initialsFromName(lead.studio),
    location: lead.city ? `${lead.city} · Türkiye` : 'Konum eklenmedi',
    status: 'Kurulum',
    phone: lead.phone,
    whatsapp: lead.phone
  });
  state.studios.unshift(studio);
  state.activeStudioId = studio.id;
  lead.nextAction = 'Stüdyo kurulumu başlatıldı; ilk antrenör ve üyeleri ekle';
  saveStudios();
  saveActiveStudio();
  savePilotLeads();
  render();
  showToast(`${lead.studio} pilot stüdyo listesine aktarıldı.`);
}

function deletePilotLead(id){
  const lead = state.pilotLeads.find(item=>item.id === id);
  if(!lead || !confirm(`${lead.studio} pilot lead'i silinsin mi?`)) return;
  state.pilotLeads = state.pilotLeads.filter(item=>item.id !== id);
  savePilotLeads();
  render();
  showToast(`${lead.studio} CRM listesinden silindi.`);
}

function pilotOfferText(lead){
  const price = formatCurrency(lead.value);
  const packageName = lead.value >= 2400 ? 'Studio AI' : lead.value >= 1400 ? 'Studio' : 'Starter';
  return [
    `Merhaba ${lead.name},`,
    '',
    `${lead.studio} için Formera kurucu pilot teklifini özetliyorum:`,
    '',
    `• Paket önerisi: ${packageName}`,
    `• Kurucu pilot fiyatı: ${price} / ay`,
    '• Pilot süre: 30 gün',
    '• Kurulum: işletme profili, ilk antrenör, ilk üyeler ve ilk program akışı',
    '• Kapsam: işletmeci paneli, antrenör görevleri, üye program takibi, mikrofonla yazıya döküm ve pilot raporu',
    '• Hedef: 30 gün sonunda zaman kazancı, ekip görünürlüğü ve üye takip düzenini birlikte ölçmek',
    '',
    `Öncelik olarak not aldığım konu: ${lead.goal}.`,
    `Sonraki adım: ${lead.nextAction}.`,
    '',
    'Uygunsa kısa bir kurulum görüşmesi planlayalım.'
  ].join('\n');
}

async function copyPilotOffer(id){
  const lead = state.pilotLeads.find(item=>item.id === id);
  if(!lead) return;
  try{
    await navigator.clipboard?.writeText(pilotOfferText(lead));
    showToast(`${lead.studio} için teklif metni kopyalandı.`);
  }catch(error){
    showToast('Teklif metni kopyalanamadı. Tarayıcı izin vermedi.');
  }
}

function bind(){
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{
    const action = b.dataset.action;
    if(action==='new-member') return openMemberModal();
    if(action==='edit-member') return openMemberModal(state.members.find(m=>m.id === b.dataset.memberId));
    if(action==='delete-member') return deleteMember(b.dataset.memberId);
    if(action==='copy-member-invite') return copyInvite('member', b.dataset.memberId);
    if(action==='checkin-member') return checkInMember(b.dataset.memberId);
    if(action==='export-members') return exportMembers();
    if(action==='import-members') return document.querySelector('#memberImport')?.click();
    if(action==='add-finance') return openFinanceModal();
    if(action==='delete-finance') return deleteFinanceEntry(b.dataset.financeId);
    if(action==='ai-plan') return showAiPlan();
    if(action==='ai-assistant') return openAiAssistant();
    if(action==='voice-ai-demo') return showToast('Sesli AI asistan Studio AI paketinde canlı API ile aktif edilecek.');
    if(action==='add-program') return openProgramModal();
    if(action==='delete-program') return deleteProgram(b.dataset.programId);
    if(action==='assign-program') return assignProgram(b.dataset.programId);
    if(action==='add-session') return openSessionModal();
    if(action==='complete-session') return completeSession(b.dataset.sessionId);
    if(action==='cancel-session') return cancelSession(b.dataset.sessionId);
    if(action==='delete-session') return deleteSession(b.dataset.sessionId);
    if(action==='copy-report') return copyReport();
    if(action==='add-trainer') return openTrainerModal();
    if(action==='delete-trainer') return deleteTrainer(b.dataset.trainerId);
    if(action==='copy-trainer-invite') return copyInvite('trainer', b.dataset.trainerId);
    if(action==='add-trainer-task') return openTrainerTaskModal();
    if(action==='complete-trainer-task') return completeTrainerTask(b.dataset.taskId);
    if(action==='delete-trainer-task') return deleteTrainerTask(b.dataset.taskId);
    if(action==='add-member-task') return openMemberTaskModal(b.dataset.memberName || '');
    if(action==='complete-member-task') return completeMemberTask(b.dataset.memberTaskId);
    if(action==='delete-member-task') return deleteMemberTask(b.dataset.memberTaskId);
    if(action==='select-studio') return selectStudio(b.dataset.studioId);
    if(action==='add-pilot-lead') return openPilotLeadModal();
    if(action==='advance-pilot-lead') return advancePilotLead(b.dataset.leadId);
    if(action==='mark-pilot-lost') return markPilotLeadLost(b.dataset.leadId);
    if(action==='convert-pilot-lead') return convertPilotLeadToStudio(b.dataset.leadId);
    if(action==='copy-pilot-offer') return copyPilotOffer(b.dataset.leadId);
    if(action==='delete-pilot-lead') return deletePilotLead(b.dataset.leadId);
    if(action==='cycle-studio') return cycleStudio();
    if(action==='customize-studio') return openStudioBrandModal();
    if(action==='start-onboarding') return openOnboardingModal();
    if(action==='export-full-backup') return exportFullBackup();
    if(action==='import-full-backup') return document.querySelector('#fullBackupImport')?.click();
    if(action==='reset-demo-data') return confirmResetDemoData();
    if(action==='sign-member') return openSignatureModal(state.members.find(m=>m.id === b.dataset.memberId));
    if(action==='sign-current-member') return openSignatureModal(currentMember());
    if(action==='clear-signature') return clearSignatureCanvas();
    if(action==='select-member-program') return selectMemberProgram(b.dataset.memberName, b.dataset.programId);
    showToast({
      'start-workout':'Antrenman modu başlatıldı. Hadi bakalım! 💪',
      'coach-tip':'Ece’nin notu: Tempo kontrollü, form öncelikli.'
    }[action]);
  });
  document.querySelectorAll('[data-page-link]').forEach(b=>b.onclick=()=>navigate(b.dataset.pageLink));
  const input=document.querySelector('#memberSearch');
  if(input) input.oninput=e=>{
    const q=e.target.value.toLocaleLowerCase('tr');
    document.querySelector('#memberResults').innerHTML=memberRows(state.members.filter(m=>(m.name+m.trainer+m.phone+m.email).toLocaleLowerCase('tr').includes(q)));
    bind();
  };
  const importer = document.querySelector('#memberImport');
  if(importer) importer.onchange=e=>importMembers(e.target.files[0]);
  const calendarDate = document.querySelector('#calendarDate');
  if(calendarDate) calendarDate.onchange=e=>{state.calendarDate = e.target.value; render();};
  const fullBackupImport = document.querySelector('#fullBackupImport');
  if(fullBackupImport) fullBackupImport.onchange=e=>importFullBackup(e.target.files[0]);
}

function navigate(page){state.page=page;document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.page===page));if(isMobileSidebar()) closeSidebar();render()}
function showToast(message){toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}

const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeDictation = null;

function isVoiceFieldCandidate(field){
  if(!field || field.dataset.voiceReady === 'true') return false;
  if(field.closest('#supabaseModal') || field.closest('.password-field')) return false;
  if(field.matches('[readonly], [disabled], [type="file"], [type="email"], [type="password"], [type="date"], [type="time"], [type="color"], [type="hidden"], [type="url"]')) return false;
  if(field.tagName === 'TEXTAREA') return true;
  if(field.tagName !== 'INPUT') return false;
  const type = (field.getAttribute('type') || 'text').toLowerCase();
  const inputMode = (field.getAttribute('inputmode') || '').toLowerCase();
  if(['numeric','decimal','tel'].includes(inputMode)) return false;
  return ['text','search'].includes(type);
}

function setFieldValueFromVoice(field, baseValue, transcript){
  const cleanTranscript = String(transcript || '').replace(/\s+/g, ' ').trim();
  const cleanBase = String(baseValue || '');
  const separator = cleanBase && !/[\s\n]$/.test(cleanBase) ? (field.tagName === 'TEXTAREA' ? '\n' : ' ') : '';
  field.value = `${cleanBase}${separator}${cleanTranscript}`;
  field.dispatchEvent(new Event('input', {bubbles:true}));
}

function stopDictation(){
  if(!activeDictation) return;
  activeDictation.button.classList.remove('recording');
  activeDictation.button.textContent = '🎙';
  activeDictation.button.setAttribute('aria-label', 'Mikrofonla yaz');
  try{ activeDictation.recognition.stop(); }catch(error){}
  activeDictation = null;
}

function startDictation(field, button){
  if(!SpeechRecognitionApi){
    showToast('Bu tarayıcı mikrofonla yazıya dökümü desteklemiyor. Chrome veya Edge ile deneyebilirsin.');
    return;
  }
  if(activeDictation?.button === button){
    stopDictation();
    return;
  }
  stopDictation();
  const recognition = new SpeechRecognitionApi();
  const baseValue = field.value;
  recognition.lang = 'tr-TR';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;
  activeDictation = {recognition, button, field, baseValue};
  button.classList.add('recording');
  button.textContent = '●';
  button.setAttribute('aria-label', 'Dinlemeyi durdur');
  recognition.onresult = event=>{
    const transcript = [...event.results].map(result=>result[0]?.transcript || '').join(' ');
    setFieldValueFromVoice(field, baseValue, transcript);
  };
  recognition.onerror = event=>{
    const messages = {
      'not-allowed':'Mikrofon izni verilmedi. Tarayıcı adres çubuğundan mikrofon iznini açabilirsin.',
      'no-speech':'Ses algılanmadı. Tekrar deneyebilirsin.',
      'audio-capture':'Mikrofon bulunamadı veya kullanılamıyor.',
      network:'Ses tanıma servisine ulaşılamadı.'
    };
    showToast(messages[event.error] || 'Mikrofonla yazıya döküm başlatılamadı.');
  };
  recognition.onend = ()=>{
    if(activeDictation?.recognition === recognition){
      button.classList.remove('recording');
      button.textContent = '🎙';
      button.setAttribute('aria-label', 'Mikrofonla yaz');
      activeDictation = null;
    }
  };
  try{
    field.focus();
    recognition.start();
    showToast('Dinliyorum... Konuşman yazıya dönüşecek.');
  }catch(error){
    stopDictation();
    showToast('Mikrofon başlatılamadı. Tarayıcı izinlerini kontrol et.');
  }
}

function enhanceVoiceFields(){
  const fields = [...document.querySelectorAll('.modal form input, .modal form textarea')].filter(isVoiceFieldCandidate);
  fields.forEach(field=>{
    const shell = document.createElement('span');
    shell.className = `voice-field ${field.tagName === 'TEXTAREA' ? 'voice-field-textarea' : ''}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'voice-button';
    button.textContent = '🎙';
    button.setAttribute('aria-label', 'Mikrofonla yaz');
    button.title = 'Mikrofonla yaz';
    field.parentNode.insertBefore(shell, field);
    shell.appendChild(field);
    shell.appendChild(button);
    field.dataset.voiceReady = 'true';
    button.addEventListener('click', event=>{
      event.preventDefault();
      startDictation(field, button);
    });
  });
}

const appShell = document.querySelector('.app-shell');
const sidebar = document.querySelector('.sidebar');
const sidebarBackdrop = document.querySelector('.sidebar-backdrop');

function isMobileSidebar(){
  return window.matchMedia('(max-width: 760px)').matches;
}

function openSidebar(){
  if(isMobileSidebar()){
    sidebar?.classList.add('open');
    sidebarBackdrop?.classList.add('show');
    return;
  }
  appShell?.classList.add('sidebar-expanded');
}

function closeSidebar(){
  sidebar?.classList.remove('open');
  sidebarBackdrop?.classList.remove('show');
  appShell?.classList.remove('sidebar-expanded');
}

function toggleSidebar(){
  if(isMobileSidebar()){
    if(sidebar?.classList.contains('open')) closeSidebar();
    else openSidebar();
    return;
  }
  openSidebar();
}

document.addEventListener('click', event=>{
  const trigger = event.target?.closest?.('[data-action="toggle-sidebar"]');
  if(!trigger) return;
  event.preventDefault();
  event.stopPropagation();
  toggleSidebar();
}, true);

document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.page));
document.querySelector('#roleSwitch').onclick=()=>{
  if(state.backend.connected){
    showToast('Canlı modda rol, giriş yapan hesaba göre otomatik belirlenir.');
    return;
  }
  state.role = state.role === 'owner' ? 'trainer' : state.role === 'trainer' ? 'member' : 'owner';
  render();
};
document.querySelector('.sidebar-close')?.addEventListener('click', closeSidebar);
sidebar?.addEventListener('mouseenter', ()=>{
  if(!isMobileSidebar()) openSidebar();
});
sidebar?.addEventListener('mouseleave', ()=>{
  if(!isMobileSidebar()) closeSidebar();
});
document.querySelector('main')?.addEventListener('mouseenter', ()=>{
  if(!isMobileSidebar()) closeSidebar();
});
sidebarBackdrop?.addEventListener('click', closeSidebar);
window.addEventListener('resize', ()=>{
  closeSidebar();
});

memberForm.onsubmit=async e=>{
  e.preventDefault();
  const data=new FormData(e.currentTarget);
  const name=data.get('name').trim();
  const total=parsePackageTotal(data.get('package'));
  const editingId = e.currentTarget.dataset.editingId;
  const current = editingId ? state.members.find(m=>m.id === editingId) : null;
  const sessions = current ? `${parseSessions(current.sessions).used} / ${total}` : `0 / ${total}`;
  let avatarDataUrl = current?.avatarDataUrl || '';
  const avatarFile = data.get('avatar');
  if(avatarFile?.size) avatarDataUrl = await imageFileToDataUrl(avatarFile, 420);
  const email = data.get('email').trim().toLocaleLowerCase('tr');
  const member = normalizeMember({
    ...(current || {}),
    id: current?.id || makeId(),
    profileId: current?.profileId || (email ? makeId() : null),
    authUserId: current?.authUserId || null,
    name,
    initials: initialsFromName(name),
    avatarDataUrl,
    trainer:data.get('trainer'),
    last: current?.last || 'Henüz gelmedi',
    sessions,
    status: current?.status || 'Yeni',
    type: current?.type || 'warn',
    phone:data.get('phone'),
    email
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
  showToast(email ? `${name} kaydedildi. Davet metnini üye listesinden kopyalayabilirsin.` : `${name} kaydı ${current ? 'güncellendi' : 'oluşturuldu'}.`);
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

trainerForm.onsubmit=async e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const avatarFile = data.get('avatar');
  const avatarDataUrl = avatarFile?.size ? await imageFileToDataUrl(avatarFile, 420) : '';
  const email = data.get('email').trim().toLocaleLowerCase('tr');
  const trainer = normalizeTrainer({
    id: makeId(),
    profileId: makeId(),
    name: data.get('name').trim(),
    role: data.get('role').trim(),
    specialty: data.get('specialty').trim(),
    phone: data.get('phone').trim(),
    commission: data.get('commission'),
    avatarDataUrl,
    email
  });
  state.team.push(trainer);
  saveTeam();
  trainerModal.close();
  e.currentTarget.reset();
  render();
  showToast(email ? `${trainer.name} ekibe eklendi. Davet metnini ekip kartından kopyalayabilirsin.` : `${trainer.name} ekibe eklendi.`);
};

trainerTaskForm.onsubmit=e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const trainerName = data.get('trainer');
  const task = normalizeTrainerTask({
    id: makeId(),
    studioId: studioIdForRemote(),
    trainerProfileId: trainerProfileIdByName(trainerName),
    trainer: trainerName,
    title: data.get('title').trim(),
    note: data.get('note').trim(),
    priority: data.get('priority'),
    dueDate: data.get('dueDate') || todayISO(),
    status: 'open',
    createdAt: new Date().toISOString()
  });
  state.trainerTasks.unshift(task);
  saveTrainerTasks();
  trainerTaskModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${task.trainer} için görev gönderildi.`);
};

memberTaskForm.onsubmit=e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const memberName = data.get('member');
  const trainerName = data.get('trainer');
  const task = normalizeMemberTask({
    id: makeId(),
    studioId: studioIdForRemote(),
    memberId: memberIdByName(memberName),
    trainerProfileId: trainerProfileIdByName(trainerName),
    member: memberName,
    trainer: trainerName,
    type: data.get('type'),
    title: data.get('title').trim(),
    note: data.get('note').trim(),
    dueDate: data.get('dueDate') || todayISO(),
    status: 'open',
    createdAt: new Date().toISOString()
  });
  state.memberTasks.unshift(task);
  saveMemberTasks();
  memberTaskModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${task.member} için ${memberTaskTypeLabel(task.type).toLocaleLowerCase('tr')} aksiyonu gönderildi.`);
};

pilotLeadForm.onsubmit=e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const lead = normalizePilotLead({
    id: makeId(),
    name: data.get('name').trim(),
    studio: data.get('studio').trim(),
    city: data.get('city').trim(),
    phone: data.get('phone').trim(),
    members: data.get('members'),
    goal: data.get('goal').trim(),
    stage: data.get('stage'),
    nextAction: data.get('nextAction').trim() || 'İlk görüşmeyi planla',
    value: Number(String(data.get('value')).replaceAll('.','').replace(',','.')) || 990
  });
  state.pilotLeads.unshift(lead);
  savePilotLeads();
  pilotLeadModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${lead.studio} pilot CRM listesine eklendi.`);
};

studioBrandForm.onsubmit=async e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const studio = activeStudio();
  const logoFile = data.get('logo');
  const logoDataUrl = logoFile?.size ? await imageFileToDataUrl(logoFile, 520) : studio.logoDataUrl;
  const name = data.get('name').trim();
  const updated = normalizeStudio({
    ...studio,
    name,
    location: data.get('location').trim() || 'Konum eklenmedi',
    address: data.get('address').trim(),
    phone: data.get('phone').trim(),
    whatsapp: data.get('whatsapp').trim(),
    instagram: data.get('instagram').trim(),
    website: data.get('website').trim(),
    mapUrl: data.get('mapUrl').trim(),
    initials: data.get('initials').trim().toLocaleUpperCase('tr') || initialsFromName(name),
    accentColor: data.get('accentColor') || '#d9ff64',
    logoDataUrl
  });
  state.studios = state.studios.map(item=>item.id === studio.id ? updated : item);
  saveStudios();
  studioBrandModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${updated.name} marka ayarları güncellendi.`);
};

signatureForm.onsubmit=e=>{
  e.preventDefault();
  saveSignature(e.currentTarget);
};

document.querySelector('#backendStatus')?.addEventListener('click', openSupabaseModal);
document.querySelector('#closeSupabaseModal')?.addEventListener('click', ()=>supabaseModal?.close());
document.querySelectorAll('.modal').forEach(modal=>{
  modal.addEventListener('click', event=>{
    if(event.target === modal) modal.close();
  });
  modal.querySelectorAll('.modal-close, button[value="cancel"]').forEach(button=>{
    button.addEventListener('click', event=>{
      event.preventDefault();
      modal.close();
    });
  });
});
document.querySelector('#clearSupabaseConfig')?.addEventListener('click', async event=>{
  event.preventDefault();
  localStorage.removeItem(SUPABASE_CONFIG_STORAGE_KEY);
  await signOutSupabase();
  state.backend.configured = false;
  state.backend.client = null;
  updateBackendShell();
  updateAccountSummary();
  notify('Supabase bağlantı ayarı temizlendi.', 'success');
});
document.querySelector('#logoutSupabase')?.addEventListener('click', event=>{
  event.preventDefault();
  signOutSupabase();
});
document.querySelector('#switchSupabaseAccount')?.addEventListener('click', event=>{
  event.preventDefault();
  switchSupabaseAccount();
});
document.querySelector('#onboardingSkip')?.addEventListener('click', event=>{
  event.preventDefault();
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  onboardingModal?.close();
  showToast('İlk kurulum daha sonra Pilot araçlarından açılabilir.');
});
document.querySelector('#onboardingBack')?.addEventListener('click', event=>{
  event.preventDefault();
  onboardingStep = Math.max(0, onboardingStep - 1);
  updateOnboardingStep();
});
document.querySelector('#onboardingNext')?.addEventListener('click', event=>{
  event.preventDefault();
  const currentStep = onboardingForm?.querySelector(`.onboarding-step[data-step="${onboardingStep}"]`);
  const requiredFields = [...(currentStep?.querySelectorAll('[required]') || [])];
  const invalid = requiredFields.find(field=>!field.checkValidity());
  if(invalid){
    invalid.reportValidity();
    return;
  }
  onboardingStep = Math.min(4, onboardingStep + 1);
  updateOnboardingStep();
});
document.querySelector('#onboardingCopyInvites')?.addEventListener('click', event=>{
  event.preventDefault();
  copyOnboardingInvites();
});
togglePasswordButton?.addEventListener('click', event=>{
  event.preventDefault();
  const input = supabaseAuthForm?.elements.password;
  if(!input) return;
  const visible = input.type === 'text';
  input.type = visible ? 'password' : 'text';
  togglePasswordButton.textContent = visible ? '👁' : '🙈';
  togglePasswordButton.setAttribute('aria-label', visible ? 'Şifreyi göster' : 'Şifreyi gizle');
});
loginRoleTabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    setLoginRole(tab.dataset.loginRole);
    clearAccountMessage();
  });
});
document.querySelector('#signupSupabase')?.addEventListener('click', async ()=>{
  if(!supabaseAuthForm) return;
  if(!supabaseAuthForm.reportValidity()) return;
  const data = new FormData(supabaseAuthForm);
  await signUpSupabase(data.get('email'), data.get('password'));
});

supabaseConfigForm?.addEventListener('submit', async event=>{
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  writeSupabaseConfig({url:data.get('url'), anonKey:data.get('anonKey')});
  state.backend.client = null;
  state.backend.connected = false;
  await initSupabase();
  notify('Supabase ayarları kaydedildi.', 'success');
});

supabaseAuthForm?.addEventListener('submit', async event=>{
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  await signInSupabase(data.get('email'), data.get('password'));
});

onboardingForm?.addEventListener('submit', async event=>{
  event.preventDefault();
  if(!onboardingForm.reportValidity()) return;
  await completeOnboarding(onboardingForm);
});

enhanceVoiceFields();
setLoginRole(selectedLoginRole);
render();
initSupabase();
if(!localStorage.getItem(ONBOARDING_STORAGE_KEY) && !readSupabaseConfig()){
  setTimeout(()=>openOnboardingModal(), 450);
}
