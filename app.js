const STORAGE_KEY = 'formera_members';
const FINANCE_STORAGE_KEY = 'formera_finance_entries';
const PROGRAM_STORAGE_KEY = 'formera_programs';
const SESSION_STORAGE_KEY = 'formera_sessions';
const TEAM_STORAGE_KEY = 'formera_team';
const STUDIO_STORAGE_KEY = 'formera_studios';
const ACTIVE_STUDIO_STORAGE_KEY = 'formera_active_studio';
const SIGNATURE_STORAGE_KEY = 'formera_signatures';
const PROGRAM_SELECTION_STORAGE_KEY = 'formera_program_selections';
const SUPABASE_CONFIG_STORAGE_KEY = 'formera_supabase_config';

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

const starterStudios = [
  {id:'studio_1', name:'NorthFit Studio', initials:'NF', location:'Kadıköy · İstanbul', status:'Pilot aktif'},
  {id:'studio_2', name:'CoreLab PT', initials:'CL', location:'Ataşehir · İstanbul', status:'Kurulum'},
  {id:'studio_3', name:'Pulse Studio', initials:'PS', location:'Beşiktaş · İstanbul', status:'Demo'},
  {id:'studio_4', name:'Forma PT', initials:'FP', location:'Bakırköy · İstanbul', status:'Pilot aktif'}
];

const state = {
  role: 'owner',
  trainerName: 'Ece',
  page: 'dashboard',
  calendarDate: todayISO(),
  members: starterMembers.map(normalizeMember),
  finance: starterFinance.map(normalizeFinanceEntry),
  programs: starterPrograms.map(normalizeProgram),
  sessions: starterSessions.map(normalizeSession),
  team: starterTeam.map(normalizeTrainer),
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
    studioId: null
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
const signatureModal = document.querySelector('#signatureModal');
const signatureForm = document.querySelector('#signatureForm');
const signatureCanvas = document.querySelector('#signatureCanvas');
const supabaseModal = document.querySelector('#supabaseModal');
const supabaseConfigForm = document.querySelector('#supabaseConfigForm');
const supabaseAuthForm = document.querySelector('#supabaseAuthForm');
let signaturePadReady = false;
let signatureDrawing = false;

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
    trainerProfileId: member.trainerProfileId || member.trainer_profile_id || null,
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
    name: trainer.name || 'Yeni antrenör',
    role: trainer.role || 'PT Coach',
    specialty: trainer.specialty || 'Genel fitness',
    phone: trainer.phone || '',
    commission: Number(trainer.commission) || 15
  };
}

function saveTeam(){
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(state.team));
  syncTeamToSupabase();
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
    status: studio.status || 'Demo'
  };
}

function activeStudio(){
  return state.studios.find(studio=>studio.id === state.activeStudioId) || state.studios[0] || normalizeStudio({});
}

function saveStudios(){
  localStorage.setItem(STUDIO_STORAGE_KEY, JSON.stringify(state.studios));
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

function persistAllData(){
  saveMembers();
  saveFinance();
  savePrograms();
  saveSessions();
  saveTeam();
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
}

function mapRemoteStudio(studio){
  return normalizeStudio({
    id: studio.id,
    name: studio.name,
    initials: studio.initials,
    location: studio.location,
    status: studio.status
  });
}

function mapRemoteTrainer(profile){
  return normalizeTrainer({
    id: profile.id,
    profileId: profile.id,
    name: profile.full_name,
    role: profile.role === 'owner' ? 'Owner' : 'PT Coach',
    specialty: profile.role === 'owner' ? 'İşletme yönetimi' : 'Genel fitness',
    phone: profile.phone || '',
    commission: 15
  });
}

function mapRemoteMember(member, profilesById){
  return normalizeMember({
    id: member.id,
    studioId: member.studio_id,
    trainerProfileId: member.trainer_profile_id,
    name: member.full_name,
    initials: member.initials,
    trainer: profilesById[member.trainer_profile_id]?.full_name || 'Atanmadı',
    last: member.last_visit_label,
    sessions: `${member.sessions_used || 0} / ${member.sessions_total || 12}`,
    status: member.status,
    type: member.risk_type,
    phone: member.phone || ''
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
  const {data: profile, error: profileError} = await db
    .from('profiles')
    .select('*')
    .eq('auth_user_id', state.backend.user.id)
    .maybeSingle();
  if(profileError) return remoteError(profileError, 'Profil okunamadı.');
  if(!profile){
    state.backend.loading = false;
    state.backend.connected = false;
    state.backend.error = 'Bu Auth kullanıcısına bağlı owner profili bulunamadı.';
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
    signaturesResult
  ] = await Promise.all([
    db.from('studios').select('*').eq('id', studioId),
    db.from('profiles').select('*').eq('studio_id', studioId),
    db.from('members').select('*').eq('studio_id', studioId).order('created_at', {ascending:false}),
    db.from('member_program_selections').select('*'),
    db.from('programs').select('*').eq('studio_id', studioId).order('created_at', {ascending:false}),
    db.from('sessions').select('*').eq('studio_id', studioId).order('session_date', {ascending:true}).order('session_time', {ascending:true}),
    db.from('finance_entries').select('*').eq('studio_id', studioId).order('entry_date', {ascending:false}),
    db.from('signatures').select('*').eq('studio_id', studioId).order('signed_at', {ascending:false})
  ]);

  const failed = [studiosResult, profilesResult, membersResult, selectionsResult, programsResult, sessionsResult, financeResult, signaturesResult].find(result=>result.error);
  if(failed) return remoteError(failed.error);

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
  state.role = profile.role === 'trainer' ? 'trainer' : profile.role === 'member' ? 'member' : 'owner';
  if(profile.role === 'trainer') state.trainerName = profile.full_name;
  state.backend.connected = true;
  state.backend.loading = false;
  state.backend.error = '';
  persistAllData();
  render();
  showToast('Supabase canlı verisi yüklendi.');
}

function updateBackendShell(){
  const button = document.querySelector('#backendStatus');
  if(!button) return;
  button.classList.toggle('connected', state.backend.connected);
  button.classList.toggle('warning', state.backend.configured && !state.backend.connected);
  if(state.backend.loading) button.textContent = 'Bağlanıyor...';
  else if(state.backend.connected) button.textContent = 'Canlı veri';
  else if(state.backend.configured) button.textContent = 'Giriş gerekli';
  else button.textContent = 'Demo mod';
}

function openSupabaseModal(){
  const config = readSupabaseConfig();
  if(config && supabaseConfigForm){
    supabaseConfigForm.elements.url.value = config.url || '';
    supabaseConfigForm.elements.anonKey.value = config.anonKey || '';
  }
  supabaseModal?.showModal();
}

async function signInSupabase(email, password){
  if(!state.backend.client){
    await initSupabase();
  }
  if(!state.backend.client){
    showToast('Önce Supabase URL ve anon key kaydet.');
    return;
  }
  state.backend.loading = true;
  updateBackendShell();
  const {data, error} = await state.backend.client.auth.signInWithPassword({email, password});
  if(error){
    state.backend.loading = false;
    remoteError(error, 'Giriş başarısız.');
    showToast('Giriş başarısız. Email/şifreyi kontrol et.');
    return;
  }
  state.backend.user = data.user;
  await loadRemoteData();
  supabaseModal?.close();
}

async function signOutSupabase(){
  if(state.backend.client) await state.backend.client.auth.signOut();
  state.backend.connected = false;
  state.backend.user = null;
  state.backend.profile = null;
  state.backend.studioId = null;
  updateBackendShell();
  showToast('Canlı veri oturumu kapatıldı.');
}

async function syncRemote(table, rows){
  if(!isSupabaseReady()) return;
  const validRows = rows.filter(row=>row.id && isUuid(row.id));
  if(!validRows.length) return;
  const {error} = await state.backend.client.from(table).upsert(validRows, {onConflict:'id'});
  remoteError(error);
}

function syncMembersToSupabase(){
  const studioId = studioIdForRemote();
  if(!studioId) return;
  const rows = state.members.map(member=>{
    const parsed = parseSessions(member.sessions);
    return {
      id: member.id,
      studio_id: studioId,
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
  });
  syncRemote('members', rows);
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
  syncRemote('profiles', state.team.map(trainer=>({
    id: trainer.profileId || trainer.id,
    studio_id: studioId,
    full_name: trainer.name,
    role: 'trainer',
    phone: trainer.phone || null
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
  const name = document.querySelector('#studioName');
  const location = document.querySelector('#studioLocation');
  if(avatar) avatar.textContent = studio.initials;
  if(name) name.textContent = studio.name;
  if(location) location.textContent = studio.location;
}

function roleMeta(){
  if(state.role === 'trainer') return {label:'Antrenör', next:'Üye görünümü', avatar:initialsFromName(state.trainerName)};
  if(state.role === 'member') return {label:'Üye', next:'İşletmeci görünümü', avatar:'SA'};
  return {label:'İşletmeci', next:'Antrenör görünümü', avatar:'OY'};
}

function updateRoleShell(){
  const meta = roleMeta();
  const roleButton = document.querySelector('#roleSwitch');
  const avatar = document.querySelector('.user-avatar');
  if(roleButton){
    roleButton.querySelector('span').textContent = meta.label;
    roleButton.querySelector('small').textContent = meta.next;
  }
  if(avatar) avatar.textContent = meta.avatar;
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

function memberSignature(memberName){
  return state.signatures
    .filter(signature=>signature.member === memberName)
    .sort((a,b)=>b.signedAt.localeCompare(a.signedAt))[0];
}

function memberRows(items=state.members){
  return items.map(m=>{
    const signature = memberSignature(m.name);
    return `<div class="member-row">
    <div class="member"><span class="avatar">${m.initials}</span><div><strong>${m.name}</strong><small>PT: ${m.trainer}${m.phone ? ` · ${m.phone}` : ''}</small></div></div>
    <span><small class="cell-label">Son ziyaret</small><br>${m.last}</span>
    <span><small class="cell-label">Seans</small><br>${m.sessions}</span>
    <span class="status ${m.type}">${m.status}</span>
    <span class="status ${signature ? 'good' : 'warn'}">${signature ? 'İmzalı' : 'İmza yok'}</span>
    <div class="row-actions">
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
    <span class="studio-avatar">${studio.initials}</span>
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

function teamCards(){
  return state.team.map(trainer=>{
    const stats = trainerStats(trainer.name);
    const estimatedCommission = stats.revenue * (trainer.commission / 100);
    return `<article class="team-card">
      <div class="team-head">
        <span class="avatar">${initialsFromName(trainer.name)}</span>
        <div><h2>${trainer.name}</h2><p>${trainer.role} · ${trainer.specialty}</p></div>
        <span class="badge">%${trainer.commission} prim</span>
      </div>
      <div class="team-stats">
        <div><span>Bugünkü seans</span><strong>${stats.todayTotal}</strong></div>
        <div><span>Tamamlanan</span><strong>${stats.done}</strong></div>
        <div><span>Aktif üye</span><strong>${stats.activeMembers}</strong></div>
        <div><span>Gelir katkısı</span><strong>${formatCurrency(stats.revenue)}</strong></div>
      </div>
      <div class="team-footer"><small>${trainer.phone || 'Telefon eklenmedi'} · Tahmini prim ${formatCurrency(estimatedCommission)}</small><button class="mini-button danger" data-action="delete-trainer" data-trainer-id="${trainer.id}">Sil</button></div>
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

function teamPage(){
  const summary = teamSummary();
  return `<div class="welcome"><div><span class="eyebrow">EKİP</span><h1>Antrenör performansı</h1><p>Seans yükü, aktif üye, gelir katkısı ve prim görünümünü takip et.</p></div><button class="primary" data-action="add-trainer">+ Antrenör ekle</button></div>
  <section class="metrics">
    ${metric('Antrenör',String(summary.trainers),'aktif ekip','♧')}
    ${metric('Bugünkü seans',String(summary.todaySessions),'ekip toplamı','□')}
    ${metric('Tamamlanan',String(summary.completed),'bugün','✓')}
    ${metric('Tahmini prim',formatCurrency(summary.estimatedCommission),'gelire göre','₺')}
  </section>
  <section class="dashboard-grid">
    <div class="team-grid">${teamCards()}</div>
    <article class="card ai-card">
      <span class="ai-label">✦ FORMA AI · EKİP KOÇU</span>
      <h2>Bugünkü ekip notları</h2>
      <p>Antrenör yükü, seans tamamlanma ve gelir katkısına göre kısa yönetim önerileri.</p>
      ${teamAiNotes().map((note,index)=>`<div class="insight"><span>${index+1}</span><div><strong>${note}</strong><small>Ekip aksiyonu</small></div></div>`).join('')}
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
    <div class="member"><span class="avatar">${member.initials}</span><div><strong>${member.name}</strong><small>${member.phone || 'Telefon yok'}</small></div></div>
    <span><small class="cell-label">Son ziyaret</small><br>${member.last}</span>
    <span><small class="cell-label">Seans</small><br>${member.sessions}</span>
    <span class="status ${member.type}">${member.status}</span>
    <div class="row-actions"><button class="mini-button" data-action="checkin-member" data-member-id="${member.id}">Geldi</button></div>
  </div>`).join('') || `<div class="empty-mini">Henüz atanmış danışan yok.</div>`;
}

function trainerProgramRows(){
  const programs = state.programs.filter(program=>program.assigned === 'Atanmadı' || state.members.some(member=>member.name === program.assigned && member.trainer === state.trainerName));
  return programs.slice(0,3).map(program=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8">
    <span>▤</span><div><strong>${program.title}</strong><small>${program.assigned} · ${program.duration} dk · ${program.level}</small></div>
  </div>`).join('') || `<div class="empty-mini">Program atanmadı.</div>`;
}

function trainerDashboard(){
  const trainer = state.team.find(item=>item.name === state.trainerName) || state.team[0] || normalizeTrainer({name:'Ece'});
  state.trainerName = trainer.name;
  const stats = trainerStats(trainer.name);
  const clients = state.members.filter(member=>member.trainer === trainer.name);
  const riskyClients = clients.filter(member=>member.type !== 'good');
  return `<div class="welcome"><div><span class="eyebrow">ANTRENÖR ALANI · ${activeStudio().name}</span><h1>Merhaba ${trainer.name}, bugünün akışı hazır.</h1><p>${trainer.specialty} uzmanlığı için atanmış danışan ve seanslarını buradan takip et.</p></div><button class="primary" data-action="add-session">+ Seans planla</button></div>
  <section class="metrics">
    ${metric('Bugünkü seans',String(stats.todayTotal),'sana atanmış','□')}
    ${metric('Tamamlanan',String(stats.done),'bugün','✓')}
    ${metric('Danışan',String(clients.length),'aktif','♙')}
    ${metric('Riskli danışan',String(riskyClients.length),'takip et','! ',riskyClients.length > 0)}
  </section>
  <section class="dashboard-grid">
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

function pilotPage(){
  const payload = backupPayload();
  return `<div class="welcome"><div><span class="eyebrow">PİLOT ARAÇLARI</span><h1>Yedekleme & demo kontrolü</h1><p>4 salon pilotunda veriyi güvenli taşı, geri yükle ve demo ortamını sıfırla.</p></div><button class="primary" data-action="export-full-backup">Tüm veriyi yedekle</button></div>
  <section class="metrics">
    ${metric('Üye',String(payload.members.length),'yedekte','♙')}
    ${metric('Seans',String(payload.sessions.length),'takvim','□')}
    ${metric('Finans kaydı',String(payload.finance.length),'gelir/gider','₺')}
    ${metric('Stüdyo',String(payload.studios.length),'pilot alanı','⚑')}
  </section>
  <section class="dashboard-grid">
    <article class="card">
      <div class="card-title"><div><h2>Veri işlemleri</h2><p>Ücretsiz pilot için tarayıcı verisini güvenceye al</p></div><span class="badge">JSON</span></div>
      <div class="pilot-actions">
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
  </section>`;
}

function genericPage(title, desc, icon){return `<div class="welcome"><div><span class="eyebrow">NORTHFIT STUDIO</span><h1>${title}</h1><p>${desc}</p></div><button class="primary">+ Yeni oluştur</button></div><article class="card page-card"><div class="empty-illustration"><div><b>${icon}</b><h2>${title} modülü hazırlanıyor</h2><p>İlk pilot kapsamındaki veri yapısı bu ekrana bağlanacak.</p></div></div></article>`}

function memberDashboard(){
  const memberName = 'Selin Aksoy';
  const program = selectedProgramForMember(memberName);
  const signature = memberSignature(memberName);
  return `<div class="welcome"><div><span class="eyebrow">ÜYE ALANI</span><h1>Merhaba Selin, hazırsan başlayalım.</h1><p>Bu hafta 2 antrenmanı tamamladın. Hedefine bir adım daha yakınsın.</p></div><button class="primary" data-action="start-workout">Antrenmanı başlat</button></div>
  <section class="metrics">${metric('Bu haftaki antrenman','2 / 3','1 kaldı','✓')}${metric('Toplam seans','7 / 12','5 seans kaldı','◷')}${metric('İmza durumu',signature ? 'Tamam' : 'Eksik',signature ? 'onay kayıtlı' : 'onay bekliyor','✍',!signature)}${metric('Son ölçüm','−1,8 kg','Son 30 gün','◎')}</section>
  <section class="dashboard-grid"><article class="card"><div class="card-title"><div><h2>Bugünkü program</h2><p>${program.title} · ${program.duration} dakika</p></div><span class="badge">${program.level}</span></div>
  ${program.exercises.map((x,i)=>`<div class="insight" style="background:#f8f9f4;border-color:#eef0e8"><span>${i+1}</span><div><strong>${x}</strong><small>Dinlenme 60–90 saniye</small></div></div>`).join('')}</article>
  <article class="card ai-card"><span class="ai-label">✦ FORMA AI</span><h2>İstikrarlı gidiyorsun.</h2><p>${program.goal} hedefi için son üç haftadır programına %89 uyum gösterdin. Bugün ağırlık artırmadan formu koruman daha iyi olabilir.</p><button class="primary ai-action" data-action="coach-tip">Koç notunu gör →</button></article>
  <article class="card"><div class="card-title"><div><h2>Program seç</h2><p>Bugün takip etmek istediğin programı seç.</p></div><span class="badge">${state.programs.length} seçenek</span></div>
  <div class="choice-list">${state.programs.map(item=>`<button class="choice-card ${item.id === program.id ? 'active' : ''}" data-action="select-member-program" data-program-id="${item.id}" data-member-name="${memberName}"><strong>${item.title}</strong><small>${item.goal} · ${item.duration} dk</small></button>`).join('')}</div></article>
  <article class="card"><div class="card-title"><div><h2>Onaylarım</h2><p>Dijital imza ve sözleşme durumu</p></div><button class="secondary" data-action="sign-current-member">İmza at</button></div>
  <div class="report-list"><div><span>Son imza</span><strong>${signature ? new Date(signature.signedAt).toLocaleDateString('tr-TR') : 'Yok'}</strong></div><div><span>Onay tipi</span><strong>${signature?.type || 'Bekliyor'}</strong></div></div></article></section>`}

const pages={programs:['Programlar','Antrenman şablonlarını oluştur ve üyelere ata.','▤'],calendar:['Takvim','PT seanslarını ve stüdyo kapasitesini planla.','□'],finance:['Finans','Gelir, gider ve tahsilat hareketlerini yönet.','₺'],reports:['Raporlar','Haftalık ve aylık performansı karşılaştır.','↗'],team:['Ekip','Antrenörleri, görevleri ve performansı izle.','♧'],pilot:['Pilot araçları','Yedekleme, geri yükleme ve demo sıfırlama.','⚑']};

function render(){
  const count = document.querySelector('#memberCount');
  if(count) count.textContent = state.members.length;
  updateStudioShell();
  updateRoleShell();
  updateBackendShell();
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
    if(action==='add-trainer') return openTrainerModal();
    if(action==='delete-trainer') return deleteTrainer(b.dataset.trainerId);
    if(action==='select-studio') return selectStudio(b.dataset.studioId);
    if(action==='cycle-studio') return cycleStudio();
    if(action==='export-full-backup') return exportFullBackup();
    if(action==='import-full-backup') return document.querySelector('#fullBackupImport')?.click();
    if(action==='reset-demo-data') return confirmResetDemoData();
    if(action==='sign-member') return openSignatureModal(state.members.find(m=>m.id === b.dataset.memberId));
    if(action==='sign-current-member') return openSignatureModal(state.members.find(m=>m.name === 'Selin Aksoy'));
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
    document.querySelector('#memberResults').innerHTML=memberRows(state.members.filter(m=>(m.name+m.trainer+m.phone).toLocaleLowerCase('tr').includes(q)));
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

const appShell = document.querySelector('.app-shell');
const sidebar = document.querySelector('.sidebar');
const sidebarBackdrop = document.querySelector('.sidebar-backdrop');

function isMobileSidebar(){
  return window.matchMedia('(max-width: 760px)').matches;
}

function openSidebar(){
  sidebar?.classList.add('open');
  sidebarBackdrop?.classList.add('show');
}

function closeSidebar(){
  sidebar?.classList.remove('open');
  sidebarBackdrop?.classList.remove('show');
}

function toggleSidebar(){
  if(isMobileSidebar()){
    if(sidebar?.classList.contains('open')) closeSidebar();
    else openSidebar();
    return;
  }
  appShell?.classList.toggle('sidebar-collapsed');
}

document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>navigate(b.dataset.page));
document.querySelector('#roleSwitch').onclick=()=>{
  state.role = state.role === 'owner' ? 'trainer' : state.role === 'trainer' ? 'member' : 'owner';
  render();
};
document.querySelector('.mobile-menu').onclick=toggleSidebar;
document.querySelector('.sidebar-close')?.addEventListener('click', toggleSidebar);
sidebarBackdrop?.addEventListener('click', closeSidebar);
window.addEventListener('resize', ()=>{
  if(!isMobileSidebar()) closeSidebar();
});

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

trainerForm.onsubmit=e=>{
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const trainer = normalizeTrainer({
    id: makeId(),
    name: data.get('name').trim(),
    role: data.get('role').trim(),
    specialty: data.get('specialty').trim(),
    phone: data.get('phone').trim(),
    commission: data.get('commission')
  });
  state.team.push(trainer);
  saveTeam();
  trainerModal.close();
  e.currentTarget.reset();
  render();
  showToast(`${trainer.name} ekibe eklendi.`);
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
document.querySelector('#clearSupabaseConfig')?.addEventListener('click', async ()=>{
  localStorage.removeItem(SUPABASE_CONFIG_STORAGE_KEY);
  await signOutSupabase();
  state.backend.configured = false;
  state.backend.client = null;
  updateBackendShell();
  showToast('Supabase bağlantı ayarı temizlendi.');
});
document.querySelector('#logoutSupabase')?.addEventListener('click', signOutSupabase);

supabaseConfigForm?.addEventListener('submit', async event=>{
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  writeSupabaseConfig({url:data.get('url'), anonKey:data.get('anonKey')});
  state.backend.client = null;
  state.backend.connected = false;
  await initSupabase();
  showToast('Supabase ayarları kaydedildi.');
});

supabaseAuthForm?.addEventListener('submit', async event=>{
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  await signInSupabase(data.get('email'), data.get('password'));
});

render();
initSupabase();
