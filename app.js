const STORAGE_KEY = "votos-valores-v1";
const APP_VERSION = 6;
const COLORS = ["#52634b","#c7a75b","#b86e62","#6f8f87","#9a7b67","#879c78","#d09a72","#73839a","#a98698","#b7a65d","#54736d","#d1b77a","#9d6059","#718665","#846f8c","#b78368","#657b91","#9b8d70","#70958e","#c18482"];
const MONTHLY_WINDOW = 10;
let monthlyWindowStart = 0;
const DEFAULT_CATEGORIES = ["Espaço e recepção","Buffet e bebidas","Foto e vídeo","Decoração","Música","Trajes e beleza","Papelaria","Cerimonial","Lua de mel","Outros"];
const TODAY = () => new Date().toISOString().slice(0,10);
const uid = prefix => `${prefix}${Date.now()}${Math.random().toString(16).slice(2)}`;
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value)||0);
const dateBR = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR") : "—";
const esc = value => String(value ?? "").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
const normalize = value => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();

const sampleData = {
  version: APP_VERSION,
  settings: { budget: 180000, weddingDate: "2028-10-09", couple: "Luís Francisco & Maria Júlia", guestTarget: 180, sidebarCollapsed: false, viewMode:"couple", theme:"light", buffetBasis:"confirmed", buffetManualCount:180 },
  categories: [...DEFAULT_CATEGORIES],
  suppliers: [
    {id:"s1",name:"Villa Jardim Imperial",category:"Espaço e recepção",service:"Cerimônia e recepção",contact:"Juliana Prado",phone:"(11) 99911-2233",email:"eventos@villajardim.com.br",website:"@villajardimimperial",total:38000,status:"Contratado",hiredDate:"2026-01-12",contractSigned:true,priority:"Alta",rating:5,notes:"Acesso liberado às 10h."},
    {id:"s2",name:"Maison Gourmet",category:"Buffet e bebidas",service:"Buffet completo",contact:"Caio Mendes",phone:"(11) 98820-7766",email:"caio@maisongourmet.com.br",website:"@maisongourmet",total:54000,status:"Pago parcialmente",hiredDate:"2026-02-04",contractSigned:true,priority:"Alta",rating:4,notes:"Degustação concluída."},
    {id:"s3",name:"Luz & Afeto",category:"Foto e vídeo",service:"Fotografia e álbum",contact:"Amanda Luz",phone:"(11) 97744-5522",email:"contato@luzeafeto.com.br",website:"@luzeafeto",total:9200,status:"Pago parcialmente",hiredDate:"2026-03-08",contractSigned:true,priority:"Alta",rating:5,notes:"Ensaio marcado para agosto."},
    {id:"s4",name:"Botânica Nobre",category:"Decoração",service:"Flores e ambientação",contact:"Renata Alves",phone:"(11) 96655-1133",email:"renata@botanicanobre.com.br",website:"@botanicanobre",total:14500,status:"Em negociação",hiredDate:"",contractSigned:false,priority:"Alta",rating:4,notes:"Aguardando proposta revisada."},
    {id:"s5",name:"Prime Beats",category:"Música",service:"DJ, pista e iluminação",contact:"Lucas Martins",phone:"(11) 95544-8877",email:"lucas@primebeats.com.br",website:"@primebeats",total:8200,status:"Contratado",hiredDate:"2026-06-01",contractSigned:true,priority:"Média",rating:4,notes:"Playlist colaborativa."}
  ],
  payments: [
    {id:"p1",supplierId:"s1",category:"Espaço e recepção",description:"Reserva do espaço",dueDate:"2026-01-12",amount:8000,paid:true,paidDate:"2026-01-12",method:"PIX",expenseType:"Essencial",owner:"Casal",receipt:"Drive/Financeiro/Espaço",notes:""},
    {id:"p2",supplierId:"s1",category:"Espaço e recepção",description:"Reforço de contrato",dueDate:"2026-06-25",amount:12500,paid:false,paidDate:"",method:"Transferência",expenseType:"Essencial",owner:"Rafael",receipt:"",notes:"Valor negociado, sem parcela fixa"},
    {id:"p3",supplierId:"s1",category:"Espaço e recepção",description:"Saldo final",dueDate:"2026-10-30",amount:17500,paid:false,paidDate:"",method:"Transferência",expenseType:"Essencial",owner:"Casal",receipt:"",notes:""},
    {id:"p4",supplierId:"s2",category:"Buffet e bebidas",description:"Entrada",dueDate:"2026-02-04",amount:12000,paid:true,paidDate:"2026-02-04",method:"PIX",expenseType:"Essencial",owner:"Marina",receipt:"Drive/Financeiro/Buffet",notes:""},
    {id:"p5",supplierId:"s2",category:"Buffet e bebidas",description:"Degustação e ajuste",dueDate:"2026-04-10",amount:8750,paid:true,paidDate:"2026-04-10",method:"Boleto",expenseType:"Essencial",owner:"Rafael",receipt:"",notes:""},
    {id:"p6",supplierId:"s2",category:"Buffet e bebidas",description:"Reforço intermediário",dueDate:"2026-07-15",amount:14000,paid:false,paidDate:"",method:"Boleto",expenseType:"Essencial",owner:"Casal",receipt:"",notes:""},
    {id:"p7",supplierId:"s2",category:"Buffet e bebidas",description:"Saldo após confirmação",dueDate:"2026-11-05",amount:19250,paid:false,paidDate:"",method:"PIX",expenseType:"Essencial",owner:"Casal",receipt:"",notes:""},
    {id:"p8",supplierId:"s3",category:"Foto e vídeo",description:"Sinal",dueDate:"2026-03-08",amount:2500,paid:true,paidDate:"2026-03-08",method:"PIX",expenseType:"Desejável",owner:"Marina",receipt:"",notes:""},
    {id:"p9",supplierId:"s3",category:"Foto e vídeo",description:"Ensaio pré-casamento",dueDate:"2026-08-20",amount:2700,paid:false,paidDate:"",method:"PIX",expenseType:"Desejável",owner:"Marina",receipt:"",notes:""},
    {id:"p10",supplierId:"s5",category:"Música",description:"Entrada",dueDate:"2026-06-01",amount:2000,paid:true,paidDate:"2026-06-01",method:"PIX",expenseType:"Desejável",owner:"Rafael",receipt:"",notes:""}
  ],
  guests: [
    {id:"g1",name:"Ana e Paulo Ribeiro",group:"Família Ribeiro",side:"Noiva",type:"Adulto",phone:"(11) 99990-1122",email:"ana@email.com",address:"São Paulo - SP",inviteStatus:"Confirmado",confirmed:true,companions:1,diet:"Sem restrições",notes:"",table:"Mesa 3",gift:"Jogo de jantar"},
    {id:"g2",name:"Carlos Mendes",group:"Amigos da faculdade",side:"Noivo",type:"Adulto",phone:"(11) 98881-3344",email:"",address:"Campinas - SP",inviteStatus:"Enviado",confirmed:false,companions:0,diet:"Vegetariano",notes:"Aguardando resposta",table:"",gift:""},
    {id:"g3",name:"Sofia Almeida",group:"Família Almeida",side:"Ambos",type:"Criança",phone:"",email:"",address:"São Paulo - SP",inviteStatus:"Confirmado",confirmed:true,companions:0,diet:"Alergia a amendoim",notes:"",table:"Mesa 2",gift:""},
    {id:"g4",name:"Fernanda Rocha",group:"Trabalho Marina",side:"Noiva",type:"Adulto",phone:"(11) 97770-4455",email:"fer@email.com",address:"São Paulo - SP",inviteStatus:"Talvez",confirmed:false,companions:1,diet:"",notes:"Responder até setembro",table:"",gift:""}
  ],
  tasks: [
    {id:"t1",title:"Definir orçamento macro",description:"Validar contribuições e reserva",dueDate:"2026-01-15",owner:"Casal",status:"Concluída",priority:"Alta",category:"Financeiro",phase:"18 a 12 meses antes",supplierId:"",notes:""},
    {id:"t2",title:"Fechar decoração",description:"Aprovar proposta final e flores",dueDate:"2026-07-10",owner:"Marina",status:"Em andamento",priority:"Alta",category:"Decoração",phase:"6 a 3 meses antes",supplierId:"s4",notes:""},
    {id:"t3",title:"Enviar convites digitais",description:"Revisar lista antes do disparo",dueDate:"2026-08-15",owner:"Rafael",status:"Pendente",priority:"Alta",category:"Convidados",phase:"3 a 1 mês antes",supplierId:"",notes:""},
    {id:"t4",title:"Confirmar playlist",description:"Entrada, jantar e festa",dueDate:"2026-10-20",owner:"Casal",status:"Pendente",priority:"Média",category:"Música",phase:"3 a 1 mês antes",supplierId:"s5",notes:""}
  ],
  contracts: [
    {id:"c1",name:"Contrato Villa Jardim",supplierId:"s1",type:"Contrato",date:"2026-01-12",status:"Assinado",link:"Drive/Contratos/Villa Jardim",deadline:"2026-10-30",notes:""},
    {id:"c2",name:"Proposta Botânica Nobre",supplierId:"s4",type:"Proposta",date:"2026-06-05",status:"Pendente",link:"E-mail Renata",deadline:"2026-07-10",notes:"Aguardando ajustes"}
  ],
  timeline: [
    {id:"l1",scope:"Dia do casamento",time:"10:00",date:"2026-11-14",activity:"Início do making of da noiva",owner:"Marina",location:"Suíte da noiva",supplierId:"s3",status:"Planejado",notes:""},
    {id:"l2",scope:"Dia do casamento",time:"14:00",date:"2026-11-14",activity:"Chegada dos fornecedores",owner:"Cerimonial",location:"Villa Jardim",supplierId:"",status:"Planejado",notes:""},
    {id:"l3",scope:"Dia do casamento",time:"16:30",date:"2026-11-14",activity:"Cerimônia",owner:"Cerimonial",location:"Jardim",supplierId:"s1",status:"Planejado",notes:""},
    {id:"l4",scope:"Dia do casamento",time:"19:30",date:"2026-11-14",activity:"Jantar",owner:"Buffet",location:"Salão principal",supplierId:"s2",status:"Planejado",notes:""}
  ],
  buffet: [
    {id:"b1",item:"Menu empratado",kind:"Cardápio",estimated:180,purchased:180,unit:"pessoas",cost:54000,supplierId:"s2",status:"Contratado",notes:"Entrada, principal e sobremesa"},
    {id:"b2",item:"Espumante brut",kind:"Bebida",estimated:54,purchased:36,unit:"garrafas",cost:3600,supplierId:"",status:"Parcial",notes:"Comprar restante em setembro"},
    {id:"b3",item:"Água e refrigerantes",kind:"Bebida",estimated:360,purchased:0,unit:"unidades",cost:0,supplierId:"s2",status:"Incluído",notes:"Incluso no buffet"}
  ],
  decor: [
    {id:"d1",area:"Cerimônia",item:"Arco floral orgânico",palette:"Branco, verde e champagne",style:"Jardim clássico",supplierId:"s4",reference:"Pasta Pinterest / Cerimônia",status:"Em aprovação",notes:"Evitar rosas vermelhas"},
    {id:"d2",area:"Mesa do bolo",item:"Composição assimétrica",palette:"Off-white e dourado",style:"Editorial",supplierId:"s4",reference:"Moodboard 03",status:"Planejado",notes:"Velas em alturas variadas"},
    {id:"d3",area:"Papelaria",item:"Monograma M&R",palette:"Verde oliva e dourado",style:"Clássico contemporâneo",supplierId:"",reference:"Drive/Identidade",status:"Aprovado",notes:""}
  ],
  gifts: [
    {id:"r1",name:"Jogo de jantar",guest:"Ana e Paulo Ribeiro",received:true,date:"2026-05-20",thankYou:true,notes:""},
    {id:"r2",name:"Crédito lua de mel",guest:"Família Mendes",received:false,date:"",thankYou:false,notes:""}
  ],
  tables: [
    {id:"m1",name:"Mesa 1",capacity:8,notes:"Família da noiva",tags:["família"]},
    {id:"m2",name:"Mesa 2",capacity:8,notes:"Família de ambos",tags:["família"]},
    {id:"m3",name:"Mesa 3",capacity:10,notes:"Amigos próximos",tags:["amigos"]}
  ],
  history: [],
  plans: [
    {id:"x1",module:"Cerimônia",title:"Texto dos votos",status:"Em andamento",owner:"Casal",date:"2026-10-30",notes:"Escrever individualmente"},
    {id:"x2",module:"Festa",title:"Definir lembranças",status:"Pendente",owner:"Marina",date:"2026-09-10",notes:""},
  ]
};

const MODULES = [
  {id:"finance",section:"Gestão",icon:"R$",title:"Financeiro",description:"Orçamento, pagamentos livres, fluxo e alertas."},
  {id:"suppliers",section:"Gestão",icon:"◇",title:"Fornecedores",description:"Contatos, contratos, valores e avaliação."},
  {id:"guests",section:"Pessoas",icon:"P",title:"Convidados",description:"Lista, grupos, mesas, restrições e presentes."},
  {id:"rsvp",section:"Pessoas",icon:"✓",title:"RSVP",description:"Confirmações, recusas e taxa de resposta."},
  {id:"tables",section:"Pessoas",icon:"M",title:"Mesas",description:"Capacidade, convidados alocados e lugares livres."},
  {id:"checklist",section:"Planejamento",icon:"☷",title:"Checklist geral",description:"Tarefas por fase, prazo e responsável."},
  {id:"timeline",section:"Planejamento",icon:"⌚",title:"Cronograma",description:"Planejamento, semana e dia do casamento."},
  {id:"contracts",section:"Gestão",icon:"§",title:"Contratos e documentos",description:"Assinaturas, propostas, comprovantes e prazos."},
  {id:"decor",section:"Experiência",icon:"D",title:"Decoração e identidade",description:"Paleta, referências, áreas e decisões visuais."},
  {id:"gifts",section:"Pós-casamento",icon:"P",title:"Presentes",description:"Recebimentos e agradecimentos."},
  {id:"reports",section:"Executivo",icon:"↗",title:"Relatórios gerais",description:"Visão consolidada e pontos de atenção."}
];

let state = migrateState(loadRawState());
let currentView = "home";
let currentEntity = null;
let currentEditId = null;
let paymentFilter = "all";
let supplierMode = "table";
let contractMode = "table";
let contractSupplierFilter = "";
let contractTypeFilter = "";
let pendingImport = [];
let pendingImportType = "payments";
let pendingModuleImport = "";
let cloudSaveTimer = null;

function loadRawState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||structuredClone(sampleData)}catch{return structuredClone(sampleData)}}
function migrateState(raw){
  const next = raw || {};
  const previousVersion = Number(next.version || 1);
  next.version = APP_VERSION;
  next.settings = {...sampleData.settings,...(next.settings||{}),budget:next.settings?.budget ?? next.budget ?? sampleData.settings.budget};
  if(previousVersion < 4){
    next.settings.weddingDate = "2028-10-09";
    next.settings.couple = "Luís Francisco & Maria Júlia";
  }
  next.settings.sidebarCollapsed = Boolean(next.settings.sidebarCollapsed);
  next.categories = Array.isArray(next.categories)?next.categories:[...DEFAULT_CATEGORIES];
  for(const key of ["suppliers","payments","guests","tasks","contracts","timeline","buffet","decor","gifts","plans","tables","history"]) if(!Array.isArray(next[key])) next[key]=structuredClone(sampleData[key]||[]);
  const enrich=(rows,defaults)=>rows.map(row=>({...defaults,...row,tags:Array.isArray(row.tags)?row.tags:parseTags(row.tags)}));
  next.suppliers = enrich(next.suppliers,{contact:"",phone:"",email:"",website:"",hiredDate:"",contractSigned:false,priority:"Média",rating:0,notes:"",attachment:""});
  next.payments = enrich(next.payments,{category:"Outros",expenseType:"Essencial",owner:"Casal",receipt:"",notes:"",priority:"Média",attachment:""}).map(p=>({...p,category:p.category||next.suppliers.find(s=>s.id===p.supplierId)?.category||"Outros"}));
  next.guests=enrich(next.guests,{priority:"Média",attachment:"",table:""});
  next.tasks=enrich(next.tasks,{priority:"Média",supplierId:"",attachment:""});
  next.contracts=enrich(next.contracts,{priority:"Média",attachment:"",documentPath:"",documentUrl:"",documentName:""});
  next.timeline=enrich(next.timeline,{priority:"Média",attachment:""});
  next.decor=enrich(next.decor,{priority:"Média",attachment:"",documentPath:"",documentUrl:"",documentName:""});
  next.tables=enrich(next.tables,{capacity:8,notes:""});
  next.settings.guestTarget ||= Math.max(next.guests.length,180);
  localStorage.setItem(STORAGE_KEY,JSON.stringify(next));
  return next;
}
function parseTags(value){return Array.isArray(value)?value:String(value||"").split(",").map(x=>x.trim()).filter(Boolean)}
function tagOptions(...collections){return [...new Set(collections.flatMap(key=>(state[key]||[]).flatMap(x=>parseTags(x.tags))))].sort((a,b)=>a.localeCompare(b,"pt-BR"))}
function documentHref(url){
  if(!url)return "";
  if(/^https?:\/\//i.test(url)||/^data:/i.test(url))return url;
  return new URL(url.replace(/^\/+/,""),"http://127.0.0.1:4173/").href;
}
function addHistory(module,action,description){state.history.unshift({id:uid("h"),date:new Date().toISOString(),module,action,description});state.history=state.history.slice(0,500)}
function scheduleCloudSave(){if(!window.CloudStore?.configured)return;clearTimeout(cloudSaveTimer);cloudSaveTimer=setTimeout(()=>window.CloudStore.save(state).catch(error=>toast(`Sincronização pendente: ${error.message}`)),700)}
function save(message,module="Sistema",action="Atualização"){if(message)addHistory(module,action,message);localStorage.setItem(STORAGE_KEY,JSON.stringify(state));scheduleCloudSave();render();if(message)toast(message)}
function supplier(id){return state.suppliers.find(item=>item.id===id)}
function daysUntil(date){return Math.ceil((new Date(`${date}T12:00:00`)-new Date())/86400000)}
function financialTotals(){
  const contracted=state.suppliers.filter(s=>!["Pesquisando","Orçado","Cancelado","Em negociação"].includes(s.status)).reduce((sum,s)=>sum+Number(s.total),0);
  const scheduled=state.payments.reduce((sum,p)=>sum+Number(p.amount),0);
  const paid=state.payments.filter(p=>p.paid).reduce((sum,p)=>sum+Number(p.amount),0);
  const overdue=state.payments.filter(p=>!p.paid&&p.dueDate<TODAY()).reduce((sum,p)=>sum+Number(p.amount),0);
  return {contracted,scheduled,paid,pending:scheduled-paid,overdue};
}
function taskProgress(){return state.tasks.length?Math.round(state.tasks.filter(t=>t.status==="Concluída").length/state.tasks.length*100):0}
function guestStats(){
  const confirmed=state.guests.filter(g=>g.confirmed||g.inviteStatus==="Confirmado").length;
  const declined=state.guests.filter(g=>g.inviteStatus==="Recusado").length;
  return {total:state.guests.length,confirmed,declined,pending:state.guests.length-confirmed-declined,children:state.guests.filter(g=>g.type!=="Adulto").length};
}
function overallProgress(){
  const f=financialTotals(),g=guestStats();
  const values=[taskProgress(),f.contracted?Math.min(100,f.paid/f.contracted*100):0,g.total?g.confirmed/g.total*100:0,state.suppliers.length?state.suppliers.filter(s=>s.contractSigned).length/state.suppliers.length*100:0];
  return Math.round(values.reduce((a,b)=>a+b,0)/values.length);
}
function attentionCounts(){
  return {
    finance:state.payments.filter(p=>!p.paid&&p.dueDate<TODAY()).length,
    suppliers:state.suppliers.filter(s=>!s.contractSigned&&["Contratado","Pago parcialmente","Pago"].includes(s.status)).length,
    guests:state.guests.filter(g=>g.inviteStatus==="Não enviado").length,
    rsvp:guestStats().pending,
    checklist:state.tasks.filter(t=>t.status!=="Concluída"&&t.dueDate<TODAY()).length,
    contracts:state.contracts.filter(c=>c.status!=="Assinado").length,
    decor:state.decor.filter(d=>!["Aprovado","Concluído"].includes(d.status)).length,
    tables:state.tables.filter(t=>tableGuests(t.name).length>Number(t.capacity)).length
  };
}
function moduleProgress(id){
  const f=financialTotals(),g=guestStats();
  const map={
    finance:f.contracted?Math.min(100,Math.round(f.paid/f.contracted*100)):0,
    suppliers:state.suppliers.length?Math.round(state.suppliers.filter(s=>["Contratado","Pago parcialmente","Pago"].includes(s.status)).length/state.suppliers.length*100):0,
    guests:Math.min(100,Math.round(state.guests.length/state.settings.guestTarget*100)),tables:state.tables.length?Math.round(state.guests.filter(g=>g.table).length/state.guests.length*100):0,
    rsvp:g.total?Math.round((g.confirmed+g.declined)/g.total*100):0,
    checklist:taskProgress(),
    timeline:state.timeline.length?Math.round(state.timeline.filter(x=>x.status==="Concluído").length/state.timeline.length*100):0,
    contracts:state.contracts.length?Math.round(state.contracts.filter(c=>c.status==="Assinado").length/state.contracts.length*100):0,
    buffet:state.buffet.length?Math.round(state.buffet.filter(b=>["Contratado","Incluído","Concluído"].includes(b.status)).length/state.buffet.length*100):0,
    decor:state.decor.length?Math.round(state.decor.filter(d=>d.status==="Aprovado").length/state.decor.length*100):0,
    music:genericProgress("Música"),
    gifts:state.gifts.length?Math.round(state.gifts.filter(g=>g.thankYou).length/state.gifts.length*100):0,reports:overallProgress()
  };return map[id]||0;
}
function genericProgress(module){const rows=state.plans.filter(p=>p.module===module);return rows.length?Math.round(rows.filter(p=>p.status==="Concluído").length/rows.length*100):0}

function renderNav(){
  const counts=attentionCounts();let section="";
  $("#mainNav").innerHTML=`<button class="nav-item ${currentView==="home"?"active":""}" data-view="home"><span class="nav-icon">⌂</span><span class="nav-label">Central</span></button>`+MODULES.map(m=>{
    const heading=m.section!==section?`<div class="nav-section">${section=m.section}</div>`:"";
    const count=counts[m.id]||0;
    return `${heading}<button class="nav-item ${currentView===m.id?"active":""} ${count?"alert":""}" data-view="${m.id}"><span class="nav-icon">${m.icon}</span><span class="nav-label">${m.title}</span>${count?`<span class="nav-badge">${count}</span>`:""}</button>`;
  }).join("");
}
function setView(view){
  currentView=view;$("#quickPopover").classList.remove("open");$("#sidebar").classList.remove("open");
  if($("#searchDialog").open)$("#searchDialog").close();
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}
function render(){
  document.body.classList.toggle("dark",state.settings.theme==="dark");
  $(".app-shell").classList.toggle("sidebar-hidden",state.settings.sidebarCollapsed);
  $("#sidebarToggle").textContent=state.settings.sidebarCollapsed?"☰":"‹";
  $("#sidebarToggle").title=state.settings.sidebarCollapsed?"Mostrar barra lateral":"Ocultar barra lateral";
  $("#sidebarToggle").setAttribute("aria-label",$("#sidebarToggle").title);
  renderNav();
  const module=MODULES.find(m=>m.id===currentView);
  $("#crumbCurrent").textContent=currentView==="home"?"Visão geral":module?.title||"Módulo";
  $("#pageTitle").textContent=currentView==="home"?"Dashboard central de casamento":module?.title||"Dashboard";
  renderAlerts();
  const renderers={home:renderHome,finance:renderFinance,suppliers:renderSuppliers,guests:renderGuests,rsvp:renderRsvp,tables:renderTables,checklist:renderChecklist,timeline:renderTimeline,contracts:renderContracts,decor:renderDecor,gifts:renderGifts,reports:renderReports};
  const content=(renderers[currentView]||renderHome)();
  $("#viewRoot").innerHTML=`${moduleTransferBar(currentView)}${content}`;
  hydrateCharts();
  hydrateDecorMedia();
}
const MODULE_TRANSFERS={
  finance:{entity:"payment",collection:"payments",title:"Financeiro",natural:x=>`${x.supplierId}|${x.dueDate}|${x.amount}|${normalize(x.description)}`},
  suppliers:{entity:"supplier",collection:"suppliers",title:"Fornecedores",natural:x=>normalize(x.name)},
  guests:{entity:"guest",collection:"guests",title:"Convidados",natural:x=>`${normalize(x.name)}|${normalize(x.group)}`},
  rsvp:{entity:"guest",collection:"guests",title:"RSVP",natural:x=>`${normalize(x.name)}|${normalize(x.group)}`},
  tables:{entity:"table",collection:"tables",title:"Mesas",natural:x=>normalize(x.name)},
  checklist:{entity:"task",collection:"tasks",title:"Checklist",natural:x=>`${normalize(x.title)}|${x.dueDate}`},
  timeline:{entity:"timeline",collection:"timeline",title:"Cronograma",natural:x=>`${x.date}|${x.time}|${normalize(x.activity)}`},
  contracts:{entity:"contract",collection:"contracts",title:"Contratos",natural:x=>normalize(x.name)},
  buffet:{entity:"buffet",collection:"buffet",title:"Buffet",natural:x=>normalize(x.item)},
  decor:{entity:"decor",collection:"decor",title:"Decoração",natural:x=>`${normalize(x.area)}|${normalize(x.item)}`},
  music:{entity:"plan",collection:"plans",title:"Música",filter:x=>x.module==="Música",defaults:{module:"Música"},natural:x=>normalize(x.title)},
  gifts:{entity:"gift",collection:"gifts",title:"Presentes",natural:x=>`${normalize(x.name)}|${normalize(x.guest)}`}
};
function moduleTransferBar(view){
  if(view==="reports")return `<div class="module-transfer-bar"><button class="button secondary" id="reportImportBackup">Importar backup</button><button class="button secondary" data-action="print-current">Exportar relatório em PDF</button></div>`;
  if(["finance","suppliers","guests","rsvp","tables","checklist","timeline","contracts","decor","gifts"].includes(view))return "";
  if(!MODULE_TRANSFERS[view])return "";
  return `<div class="module-transfer-bar"><button class="button secondary" data-module-template="${view}">Modelo CSV</button><button class="button secondary" data-module-import="${view}">Importar</button><button class="button secondary" data-module-export="${view}">Exportar CSV</button></div>`;
}
function renderAlerts(){
  const today=TODAY(),soon=new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  const alerts=[
    {level:"red",view:"finance",count:state.payments.filter(p=>!p.paid&&p.dueDate<today).length,text:"pagamentos vencidos"},
    {level:"red",view:"checklist",count:state.tasks.filter(t=>t.status!=="Concluída"&&t.dueDate<today).length,text:"tarefas atrasadas"},
    {level:"red",view:"contracts",count:state.contracts.filter(c=>c.status==="Vencido"||(c.deadline&&c.deadline<today&&c.status!=="Assinado")).length,text:"contratos vencidos/revisar"},
    {level:"red",view:"timeline",count:state.timeline.filter(x=>normalize(x.priority)==="critica"&&!x.owner&&x.status!=="Concluído").length,text:"itens críticos do cronograma sem responsável"},
    {level:"yellow",view:"finance",count:state.payments.filter(p=>!p.paid&&p.dueDate>=today&&p.dueDate<=soon).length,text:"pagamentos vencendo em 7 dias"},
    {level:"yellow",view:"contracts",count:state.suppliers.filter(s=>["Contratado","Pago parcialmente","Pago"].includes(s.status)&&!supplierContractStatus(s.id).signed).length,text:"fornecedores sem contrato assinado"},
    {level:"yellow",view:"contracts",count:state.contracts.filter(c=>!c.documentUrl&&!c.link).length,text:"contratos sem link ou anexo"},
    {level:"yellow",view:"rsvp",count:guestStats().pending,text:"convidados sem resposta"},
    {level:"yellow",view:"suppliers",count:state.suppliers.filter(s=>!s.contact&&!s.phone).length,text:"fornecedores sem contato"},
    {level:"yellow",view:"checklist",count:state.tasks.filter(t=>t.status!=="Concluída"&&!t.owner).length,text:"tarefas sem responsável"},
    {level:"blue",view:"timeline",count:state.timeline.filter(x=>x.date>=today&&x.date<=soon).length,text:"eventos nos próximos 7 dias"}
  ].filter(a=>a.count);
  const strip=$("#alertStrip");strip.classList.add("show");
  strip.innerHTML=`<div class="alert-ruler">${alerts.length?alerts.slice(0,5).map(a=>`<button class="alert-line ${a.level}" data-view="${a.view}"><span><strong>${a.count}</strong> ${a.text}</span><span>Ver →</span></button>`).join(""):`<button class="alert-line green" data-view="reports"><span>Tudo em dia. Nenhum alerta crítico.</span><span>Resumo →</span></button>`}</div>`;
}
function metric(label,value,sub="",cls=""){return `<article class="metric ${cls}"><div class="metric-label"><span>${label}</span><span>◇</span></div><strong class="metric-value">${value}</strong><div class="metric-sub">${sub}</div></article>`}
function status(value){const n=normalize(value);const cls=n.includes("venc")||n.includes("atras")||n.includes("cancel")||n.includes("recus")?"overdue":n.includes("pend")||n.includes("andamento")||n.includes("negocia")||n.includes("parcial")||n.includes("talvez")?"pending":n.includes("nao")||n.includes("pesquis")||n.includes("planejado")?"neutral":"";return `<span class="status ${cls}">${esc(value)}</span>`}
function empty(title,text){return `<div class="empty-state"><strong>${title}</strong>${text}</div>`}

function renderHome(){
  const f=financialTotals(),g=guestStats(),counts=attentionCounts();
  const days=Math.max(0,daysUntil(state.settings.weddingDate));
  const mode=state.settings.viewMode||"couple",priority={couple:["reports","finance","checklist","rsvp","guests"],planner:["timeline","suppliers","checklist","contracts","guests"],finance:["finance","contracts","suppliers","reports"]}[mode];
  const ordered=[...MODULES].sort((a,b)=>(priority.includes(a.id)?priority.indexOf(a.id):99)-(priority.includes(b.id)?priority.indexOf(b.id):99));
  const modeLabels={couple:"Visão do casal",planner:"Cerimonialista",finance:"Financeiro"};
  return `<div class="hero"><article class="hero-main"><span class="eyebrow">Planejamento integrado</span><h2>${esc(state.settings.couple)}, tudo do casamento em um só lugar.</h2><p>Acompanhe decisões, pessoas, contratos, tarefas e finanças sem perder a ligação entre cada parte do evento.</p><div class="mode-switch">${Object.entries(modeLabels).map(([key,label])=>`<button class="${mode===key?"active":""}" data-view-mode="${key}">${label}</button>`).join("")}</div><div class="hero-actions"><button class="button primary" data-view="reports">Ver resumo executivo</button><button class="button secondary" data-action="new-task">Adicionar tarefa</button></div></article><aside class="hero-side"><div class="event-date"><span class="eyebrow">Data do casamento</span><strong>${dateBR(state.settings.weddingDate)}</strong><span>${days} dias até a celebração</span></div><div class="hero-stats"><div class="hero-stat"><span>Orçamento</span><strong>${money(state.settings.budget)}</strong></div><div class="hero-stat"><span>Confirmados</span><strong>${g.confirmed}</strong></div><div class="hero-stat"><span>Pago</span><strong>${money(f.paid)}</strong></div><div class="hero-stat"><span>Fornecedores</span><strong>${state.suppliers.length}</strong></div></div></aside></div>
  <div class="module-grid">${ordered.map(m=>{const a=counts[m.id]||0;return `<button class="module-card" data-view="${m.id}"><div class="module-top"><span class="module-icon">${m.icon}</span>${a?`<span class="module-alert">${a} pendência${a===1?"":"s"}</span>`:""}</div><h3>${m.title}</h3><p>${m.description}</p><div class="module-footer"><span>${priority.includes(m.id)?"Prioridade desta visão":"Acessar módulo"}</span><strong>→</strong></div></button>`}).join("")}</div>`;
}
function financeRows(filtered=true){
  let rows=[...state.payments];if(!filtered)return rows;
  const q=normalize($("#financeSearch")?.value||""),month=$("#financeMonth")?.value||"",category=$("#financeCategory")?.value||"",sup=$("#financeSupplier")?.value||"",method=$("#financeMethod")?.value||"",tag=$("#financeTag")?.value||"";
  return rows.filter(p=>(!q||normalize(`${supplier(p.supplierId)?.name} ${p.description} ${p.owner}`).includes(q))&&(!month||p.dueDate.slice(0,7)===month)&&(!category||p.category===category)&&(!sup||p.supplierId===sup)&&(!method||p.method===method)&&(!tag||parseTags(p.tags).includes(tag))&&(paymentFilter==="all"||paymentState(p)===paymentFilter));
}
function renderFinance(){
  const t=financialTotals(),ratio=state.settings.budget?t.contracted/state.settings.budget:0;
  const rows=financeRows().sort((a,b)=>a.dueDate.localeCompare(b.dueDate));
  return `<div class="metric-grid">${metric("Orçamento",money(state.settings.budget),"Planejado","gold")}${metric("Contratado",money(t.contracted),`${(ratio*100).toFixed(1)}% comprometido`,ratio>1?"rose":"")}${metric("Já pago",money(t.paid),`${t.contracted?(t.paid/t.contracted*100).toFixed(1):0}% dos contratos`)}${metric("Em aberto",money(t.pending),"Pagamentos lançados","gold")}${metric("Vencido",money(t.overdue),"Requer atenção",t.overdue?"rose":"")}</div>
  <div class="content-grid finance-charts"><article class="panel"><div class="panel-heading"><div><span class="eyebrow">Evolução</span><h2>Previsto e pago por mês</h2></div></div><div class="chart" data-chart="monthly"></div><div class="month-navigator"><button type="button" data-month-step="-1" aria-label="Meses anteriores">‹</button><input id="monthlyRange" type="range" min="0" value="0" aria-label="Período exibido no gráfico"><button type="button" data-month-step="1" aria-label="Próximos meses">›</button><span id="monthlyRangeLabel"></span></div></article><article class="panel"><div class="panel-heading"><div><span class="eyebrow">Status</span><h2>Composição dos pagamentos</h2></div></div><div class="donut-layout"><div class="chart" data-chart="payment-status"></div><div class="legend" data-legend="payment-status"></div></div></article><article class="panel"><div class="panel-heading"><div><span class="eyebrow">Categorias</span><h2>Valor contratado</h2></div></div><div class="donut-layout"><div class="chart" data-chart="finance-categories"></div><div class="legend" data-legend="finance-categories"></div></div></article><article class="panel"><div class="panel-heading"><div><span class="eyebrow">Meios de pagamento</span><h2>Distribuição programada</h2></div></div><div class="chart" data-chart="payment-methods"></div></article></div>
  <div class="toolbar" style="margin-top:14px"><div class="segmented">${["all","pending","overdue","paid"].map((x,i)=>`<button class="${paymentFilter===x?"active":""}" data-payment-filter="${x}">${["Todos","Pendentes","Vencidos","Pagos"][i]}</button>`).join("")}</div><div class="search-wrap"><span>⌕</span><input id="financeSearch" placeholder="Buscar lançamento"></div><input type="month" id="financeMonth"><select id="financeCategory"><option value="">Categorias</option>${state.categories.map(x=>`<option>${esc(x)}</option>`).join("")}</select><select id="financeSupplier"><option value="">Fornecedores</option>${state.suppliers.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select><select id="financeMethod"><option value="">Formas</option>${["PIX","Boleto","Transferência","Cartão","Dinheiro","Outro"].map(x=>`<option>${x}</option>`).join("")}</select><select id="financeTag"><option value="">Tags</option>${tagOptions("payments").map(x=>`<option>${esc(x)}</option>`).join("")}</select><button class="button secondary" data-action="manage-categories">Categorias</button><button class="button secondary" data-action="download-template">Modelo</button><button class="button secondary" data-action="import-payments">Importar</button><button class="button secondary" data-action="export-finance">Exportar</button><button class="button primary" data-action="new-payment">+ Pagamento</button></div>
  <div class="table-card"><table><thead><tr><th>Vencimento</th><th>Fornecedor</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Tipo</th><th>Responsável</th><th>Forma</th><th>Status</th><th>Tags</th><th>Comprovante</th><th></th></tr></thead><tbody id="financeRows">${paymentTableRows(rows)}</tbody></table></div>`;
}
function paymentState(p){if(p.paid)return"paid";if(p.dueDate<TODAY())return"overdue";return"pending"}
function paymentTableRows(rows){return rows.map(p=>`<tr><td>${dateBR(p.dueDate)}</td><td><strong>${esc(supplier(p.supplierId)?.name||"Fornecedor removido")}</strong></td><td>${esc(p.category)}</td><td>${esc(p.description)}</td><td class="money">${money(p.amount)}</td><td>${esc(p.expenseType)}</td><td>${esc(p.owner)}</td><td>${esc(p.method)}</td><td>${status(paymentState(p)==="paid"?"Pago":paymentState(p)==="overdue"?"Vencido":"Pendente")}</td><td>${tagsHtml(p.tags)}</td><td>${p.receipt?`<a class="document-link" href="${esc(p.receipt)}" target="_blank" rel="noopener">Abrir</a>`:"—"}</td><td><div class="row-actions">${!p.paid?`<button class="mini-button" data-mark-paid="${p.id}">Pagar</button>`:""}<button class="mini-button" data-edit="payment:${p.id}">Editar</button><button class="mini-button" data-delete="payment:${p.id}">Excluir</button></div></td></tr>`).join("")||`<tr><td colspan="12">${empty("Nenhum pagamento","Ajuste os filtros ou adicione um lançamento.")}</td></tr>`}
function renderSuppliers(){
  return `<div class="toolbar"><div class="segmented"><button class="${supplierMode==="table"?"active":""}" data-supplier-mode="table">Tabela</button><button class="${supplierMode==="cards"?"active":""}" data-supplier-mode="cards">Cards</button></div><div class="search-wrap"><span>⌕</span><input id="supplierSearch" placeholder="Buscar fornecedor"></div><select id="supplierCategory"><option value="">Categorias</option>${state.categories.map(x=>`<option>${esc(x)}</option>`).join("")}</select><select id="supplierStatus"><option value="">Todos os status</option>${["Pesquisando","Orçado","Em negociação","Contratado","Pago parcialmente","Pago","Cancelado"].map(x=>`<option>${x}</option>`).join("")}</select><select id="supplierContract"><option value="">Contrato</option><option value="yes">Assinado</option><option value="no">Sem assinatura</option></select><select id="supplierTag"><option value="">Tags</option>${tagOptions("suppliers").map(x=>`<option>${esc(x)}</option>`).join("")}</select><input id="supplierMin" type="number" min="0" placeholder="Valor mínimo" style="width:115px;padding:9px;border:1px solid var(--line);background:var(--paper)"><span class="result-count">${state.suppliers.length} fornecedores</span><button class="button secondary" data-action="supplier-template">Modelo</button><button class="button secondary" data-action="import-suppliers">Importar</button><button class="button secondary" data-action="export-suppliers">Exportar</button><button class="button primary" data-action="new-supplier">+ Fornecedor</button></div><div id="supplierContent">${supplierContent()}</div>`;
}
function supplierContent(){
  const q=normalize($("#supplierSearch")?.value||""),cat=$("#supplierCategory")?.value||"",st=$("#supplierStatus")?.value||"",contract=$("#supplierContract")?.value||"",tag=$("#supplierTag")?.value||"",min=Number($("#supplierMin")?.value||0);
  const rows=state.suppliers.filter(s=>(!q||normalize(`${s.name} ${s.service} ${s.contact}`).includes(q))&&(!cat||s.category===cat)&&(!st||s.status===st)&&(!contract||(contract==="yes")===Boolean(s.contractSigned))&&(!tag||parseTags(s.tags).includes(tag))&&Number(s.total)>=min);
  if(supplierMode==="cards")return `<div class="cards-list">${rows.map(s=>{const p=state.payments.filter(x=>x.supplierId===s.id),paid=p.filter(x=>x.paid).reduce((a,b)=>a+Number(b.amount),0);return `<article class="record-card supplier-card"><div class="record-card-top"><h3>${esc(s.name)}</h3>${status(s.status)}</div><p>${esc(s.service)} · ${esc(s.category)}</p><div class="record-meta"><div><span>Contrato</span><strong>${money(s.total)}</strong></div><div><span>Pago</span><strong>${money(paid)}</strong></div><div><span>Contato</span><strong>${esc(s.contact||"—")}</strong></div><div><span>Assinado</span><strong>${s.contractSigned?"Sim":"Não"}</strong></div></div><div class="row-actions"><button class="mini-button" data-supplier-toggle="${s.id}">Ficha</button><button class="mini-button" data-action="new-payment" data-supplier="${s.id}">+ cobrança</button><button class="mini-button" data-edit="supplier:${s.id}">Editar</button><button class="mini-button" data-delete="supplier:${s.id}">Excluir</button></div><div class="supplier-card-detail" data-supplier-detail="${s.id}" hidden>${supplierProfile(s)}</div></article>`}).join("")}</div>`;
  return `<div class="table-card"><table><thead><tr><th>Fornecedor</th><th>Categoria</th><th>Contato</th><th>Telefone</th><th>Contrato</th><th>Valor</th><th>Status</th><th>Prioridade</th><th>Tags</th><th></th></tr></thead><tbody>${rows.map(s=>supplierTableRow(s)).join("")}</tbody></table></div>`;
}
function supplierContractStatus(id){const docs=state.contracts.filter(c=>c.supplierId===id),signed=docs.some(c=>c.status==="Assinado"),expired=docs.some(c=>c.status==="Vencido"||(c.deadline&&c.deadline<TODAY()&&c.status!=="Assinado")),pending=docs.some(c=>c.status!=="Assinado");return {docs,signed,expired,pending,label:!docs.length?"Sem contrato":expired?"Vencido / revisar":signed?"Assinado":pending?"Pendente":"Atenção"}}
function supplierProfile(s){const contract=supplierContractStatus(s.id),payments=state.payments.filter(p=>p.supplierId===s.id),paid=payments.filter(p=>p.paid).reduce((a,b)=>a+Number(b.amount),0),open=payments.filter(p=>!p.paid).reduce((a,b)=>a+Number(b.amount),0),overdue=payments.filter(p=>!p.paid&&p.dueDate<TODAY()),tasks=state.tasks.filter(t=>t.supplierId===s.id),lateTasks=tasks.filter(t=>t.status!=="Concluída"&&t.dueDate<TODAY()),events=state.timeline.filter(x=>x.supplierId===s.id),next=payments.filter(p=>!p.paid&&p.dueDate>=TODAY()).sort((a,b)=>a.dueDate.localeCompare(b.dueDate))[0];return `<div class="supplier-profile"><div class="supplier-profile-metrics"><div><span>Contratado</span><strong>${money(s.total)}</strong></div><div><span>Pago</span><strong>${money(paid)}</strong></div><div><span>Em aberto</span><strong>${money(open)}</strong></div><div><span>Vencidos</span><strong>${overdue.length}</strong></div><div><span>Próximo</span><strong>${next?dateBR(next.dueDate):"—"}</strong></div><div><span>Contrato</span><strong>${contract.label}</strong></div></div><div class="related-grid"><div class="related-box"><h4>Pagamentos</h4>${payments.slice(0,6).map(p=>`<p>${dateBR(p.dueDate)} · ${esc(p.description)} · ${money(p.amount)} · ${p.paid?"Pago":"Pendente"}</p>`).join("")||"<p>Nenhum pagamento.</p>"}</div><div class="related-box"><h4>Tarefas ${lateTasks.length?`· ${lateTasks.length} atrasadas`:""}</h4>${tasks.slice(0,6).map(t=>`<p>${dateBR(t.dueDate)} · ${esc(t.title)} · ${esc(t.status)}</p>`).join("")||"<p>Nenhuma tarefa.</p>"}</div><div class="related-box"><h4>Cronograma</h4>${events.slice(0,6).map(e=>`<p>${dateBR(e.date)} ${e.time} · ${esc(e.activity)}</p>`).join("")||"<p>Nenhum evento.</p>"}</div></div></div>`}
function supplierTableRow(s){const contract=supplierContractStatus(s.id);return `<tr><td><strong>${esc(s.name)}</strong><br><small>${esc(s.service)}</small></td><td>${esc(s.category)}</td><td>${esc(s.contact||"—")}</td><td>${esc(s.phone||"—")}</td><td>${status(contract.label)}</td><td class="money">${money(s.total)}</td><td>${status(s.status)}</td><td class="${normalize(s.priority)==="critica"?"priority-critical":normalize(s.priority)==="alta"?"priority-high":""}">${esc(s.priority)}</td><td>${tagsHtml(s.tags)}</td><td><div class="row-actions"><button class="mini-button" data-supplier-toggle="${s.id}">Ficha</button><button class="mini-button" data-action="new-payment" data-supplier="${s.id}">+ cobrança</button><button class="mini-button" data-edit="supplier:${s.id}">Editar</button><button class="mini-button" data-delete="supplier:${s.id}">Excluir</button></div></td></tr><tr class="supplier-detail-row" data-supplier-detail="${s.id}" hidden><td colspan="10">${supplierProfile(s)}</td></tr>`}
function tagsHtml(tags){return `<span class="tag-list">${parseTags(tags).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</span>`}
function renderGuests(){
  const g=guestStats(),cost=g.confirmed?financialTotals().contracted/g.confirmed:0;
  return `<div class="metric-grid">${metric("Lista total",g.total,"Pessoas cadastradas")}${metric("Confirmados",g.confirmed,`${g.total?Math.round(g.confirmed/g.total*100):0}% da lista`)}${metric("Pendentes",g.pending,"Aguardando resposta","gold")}${metric("Recusados",g.declined,"Respostas negativas","rose")}${metric("Custo estimado",money(cost),"Por confirmado")}</div><div class="toolbar"><div class="search-wrap"><span>⌕</span><input id="guestSearch" placeholder="Buscar convidado"></div><select id="guestSide"><option value="">Todos os lados</option><option>Noiva</option><option>Noivo</option><option>Ambos</option></select><select id="guestStatus"><option value="">Todos os status</option>${["Não enviado","Enviado","Confirmado","Recusado","Talvez"].map(x=>`<option>${x}</option>`).join("")}</select><select id="guestType"><option value="">Todos os tipos</option><option>Adulto</option><option>Criança</option><option>Bebê</option></select><select id="guestTag"><option value="">Tags</option>${tagOptions("guests").map(x=>`<option>${esc(x)}</option>`).join("")}</select><button class="button secondary" data-action="guest-template">Modelo</button><button class="button secondary" data-action="import-guests">Importar</button><button class="button secondary" data-action="export-guests">Exportar</button><button class="button secondary" data-action="print-guests">Imprimir</button><button class="button primary" data-action="new-guest">+ Convidado</button></div><div id="guestContent">${guestTable()}</div>`;
}
function guestTable(){
  const q=normalize($("#guestSearch")?.value||""),side=$("#guestSide")?.value||"",st=$("#guestStatus")?.value||"",type=$("#guestType")?.value||"",tag=$("#guestTag")?.value||"";
  const rows=state.guests.filter(g=>(!q||normalize(`${g.name} ${g.group} ${g.phone}`).includes(q))&&(!side||g.side===side)&&(!st||g.inviteStatus===st)&&(!type||g.type===type)&&(!tag||parseTags(g.tags).includes(tag)));
  return `<div class="table-card"><table><thead><tr><th>Nome</th><th>Grupo</th><th>Lado</th><th>Tipo</th><th>Contato</th><th>Convite</th><th>Acompanhantes</th><th>Restrição</th><th>Mesa</th><th>Tags</th><th></th></tr></thead><tbody>${rows.map(g=>`<tr><td><strong>${esc(g.name)}</strong></td><td>${esc(g.group)}</td><td>${esc(g.side)}</td><td>${esc(g.type)}</td><td>${esc(g.phone||"—")}</td><td>${status(g.inviteStatus)}</td><td>${g.companions||0}</td><td>${esc(g.diet||"—")}</td><td>${esc(g.table||"—")}</td><td>${tagsHtml(g.tags)}</td><td><div class="row-actions"><button class="mini-button" data-edit="guest:${g.id}">Editar</button><button class="mini-button" data-delete="guest:${g.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;
}
function printGuestList(){
  document.querySelector(".guest-print-sheet")?.remove();
  const sheet=document.createElement("section");
  sheet.className="guest-print-sheet";
  sheet.innerHTML=`<header><span>Dashboard central de casamento</span><h1>Lista de convidados</h1><p>${esc(state.settings.couple)} · ${dateBR(state.settings.weddingDate)} · ${state.guests.length} registros</p></header><table><thead><tr><th>Nome</th><th>Contato</th><th>Acompanhantes</th><th>Mesa</th></tr></thead><tbody>${[...state.guests].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR")).map(g=>`<tr><td>${esc(g.name)}</td><td>${esc(g.phone||g.email||"—")}</td><td>${Number(g.companions)||0}</td><td>${esc(g.table||"—")}</td></tr>`).join("")}</tbody></table>`;
  document.body.append(sheet);document.body.classList.add("print-guests");
  const cleanup=()=>{document.body.classList.remove("print-guests");sheet.remove()};
  window.addEventListener("afterprint",cleanup,{once:true});window.print();
}
function tableGuests(name){return state.guests.filter(g=>g.table===name)}
function renderTables(){const totalCapacity=state.tables.reduce((a,b)=>a+Number(b.capacity),0),allocated=state.guests.filter(g=>g.table).length;return `<div class="metric-grid">${metric("Mesas",state.tables.length,"Cadastradas")}${metric("Capacidade",totalCapacity,"Lugares disponíveis")}${metric("Alocados",allocated,"Convidados com mesa")}${metric("Sem mesa",state.guests.length-allocated,"Precisam de atribuição","gold")}${metric("Mesas lotadas",state.tables.filter(t=>tableGuests(t.name).length>Number(t.capacity)).length,"Acima da capacidade","rose")}</div><div class="toolbar"><button class="button secondary" data-module-template="tables">Modelo</button><button class="button secondary" data-module-import="tables">Importar</button><button class="button secondary" data-module-export="tables">Exportar</button><button class="button secondary" data-action="print-current">Imprimir</button><button class="button primary" data-action="new-table">+ Mesa</button></div><div class="cards-list">${state.tables.map(t=>{const guests=tableGuests(t.name),free=Number(t.capacity)-guests.length;return `<article class="record-card"><div class="record-card-top"><h3>${esc(t.name)}</h3>${status(free<0?"Lotada":free===0?"Completa":"Disponível")}</div><div class="record-meta"><div><span>Capacidade</span><strong>${t.capacity}</strong></div><div><span>Alocados</span><strong>${guests.length}</strong></div><div><span>Lugares livres</span><strong>${free}</strong></div><div><span>Tags</span><strong>${tagsHtml(t.tags)}</strong></div></div>${guests.map(g=>`<p>${esc(g.name)} · ${esc(g.group)}</p>`).join("")||"<p>Nenhum convidado alocado.</p>"}<div class="row-actions"><button class="mini-button" data-edit="table:${t.id}">Editar</button><button class="mini-button" data-delete="table:${t.id}">Excluir</button></div></article>`}).join("")}</div>`}
function renderRsvp(){
  const g=guestStats(),response=g.total?Math.round((g.confirmed+g.declined)/g.total*100):0;
  const groups=["Confirmado","Enviado","Talvez","Recusado","Não enviado"];
  return `<div class="metric-grid">${metric("Taxa de resposta",`${response}%`,"Confirmados + recusados")}${metric("Confirmados",g.confirmed,"Presença garantida")}${metric("Pendentes",g.pending,"Exigem contato","gold")}${metric("Recusados",g.declined,"Não comparecerão","rose")}${metric("Acompanhantes",state.guests.reduce((a,b)=>a+Number(b.companions||0),0),"Pessoas adicionais")}</div><div class="toolbar"><button class="button secondary" data-action="rsvp-template">Modelo</button><button class="button secondary" data-action="import-rsvp">Importar</button><button class="button secondary" data-action="export-rsvp">Exportar</button><button class="button primary" data-action="new-guest">+ Convidado</button></div><div class="content-grid">${groups.map(group=>`<article class="panel"><div class="panel-heading"><div><span class="eyebrow">RSVP</span><h2>${group}</h2></div><strong>${state.guests.filter(g=>g.inviteStatus===group).length}</strong></div><div class="activity-list">${state.guests.filter(g=>g.inviteStatus===group).map(g=>`<div class="activity-item"><div><strong>${esc(g.name)}</strong><span>${esc(g.group)} · ${g.companions||0} acompanhantes</span></div><div class="row-actions">${group!=="Confirmado"?`<button class="mini-button" data-rsvp="${g.id}:Confirmado">Confirmar</button>`:""}${group!=="Recusado"?`<button class="mini-button" data-rsvp="${g.id}:Recusado">Recusar</button>`:""}<button class="mini-button" data-edit="guest:${g.id}">Editar</button></div></div>`).join("")||empty("Sem convidados","Nenhum registro neste status.")}</div></article>`).join("")}</div>`;
}
function renderChecklist(){
  const phases=["18 a 12 meses antes","12 a 9 meses antes","9 a 6 meses antes","6 a 3 meses antes","3 a 1 mês antes","Semana do casamento","Dia do casamento","Pós-casamento"];
  return `<div class="metric-grid">${metric("Progresso geral",`${taskProgress()}%`,`${state.tasks.filter(t=>t.status==="Concluída").length} de ${state.tasks.length} tarefas`)}${metric("Pendentes",state.tasks.filter(t=>t.status==="Pendente").length,"Ainda não iniciadas","gold")}${metric("Em andamento",state.tasks.filter(t=>t.status==="Em andamento").length,"Execução atual")}${metric("Atrasadas",state.tasks.filter(t=>t.status!=="Concluída"&&t.dueDate<TODAY()).length,"Prazo vencido","rose")}${metric("Alta prioridade",state.tasks.filter(t=>t.priority==="Alta"&&t.status!=="Concluída").length,"Pontos críticos")}</div><div class="toolbar"><button class="button secondary" data-module-template="checklist">Modelo</button><button class="button secondary" data-module-import="checklist">Importar</button><button class="button secondary" data-module-export="checklist">Exportar</button><button class="button primary" data-action="new-task">+ Nova Tarefa</button></div>${phases.map(phase=>{const rows=state.tasks.filter(t=>t.phase===phase),done=rows.filter(t=>t.status==="Concluída").length;return `<section class="phase-block"><div class="phase-heading"><h3>${phase}</h3><span>${done}/${rows.length}</span></div>${rows.map(t=>`<div class="task-row ${t.status==="Concluída"?"done":""}"><input class="task-check" type="checkbox" data-task-toggle="${t.id}" ${t.status==="Concluída"?"checked":""}><div class="task-copy"><strong class="task-title">${esc(t.title)}</strong><span>-</span><span>${dateBR(t.dueDate)}</span><span>-</span><span>${esc(t.owner||"Sem responsável")}</span><span>-</span><span>${esc(t.category||"Sem categoria")}</span></div>${status(t.status)}<div class="row-actions"><button class="mini-button" data-edit="task:${t.id}">Editar</button><button class="mini-button" data-delete="task:${t.id}">Excluir</button></div></div>`).join("")||`<div class="task-row"><span></span><span>Sem tarefas nesta fase.</span></div>`}</section>`}).join("")}`;
}
function renderTimeline(){
  const scopes=["Planejamento","Semana do casamento","Dia do casamento"];
  return `<div class="toolbar"><select id="timelineOwner"><option value="">Responsáveis</option>${[...new Set(state.timeline.map(x=>x.owner).filter(Boolean))].map(x=>`<option>${esc(x)}</option>`).join("")}</select><select id="timelineSupplier"><option value="">Fornecedores</option>${state.suppliers.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("")}</select><select id="timelineStatus"><option value="">Status</option>${["Planejado","Confirmado","Concluído","Cancelado"].map(x=>`<option>${x}</option>`).join("")}</select><button class="button secondary" data-action="print-current">Imprimir / PDF</button><button class="button primary" data-action="new-timeline">+ Evento</button></div><div id="timelineContent">${timelineContent(scopes)}</div>`;
}
function timelineContent(scopes=["Planejamento","Semana do casamento","Dia do casamento"]){const owner=$("#timelineOwner")?.value||"",sup=$("#timelineSupplier")?.value||"",st=$("#timelineStatus")?.value||"",rows=state.timeline.filter(x=>(!owner||x.owner===owner)&&(!sup||x.supplierId===sup)&&(!st||x.status===st));return `<div class="content-grid">${scopes.map(scope=>`<article class="panel ${scope==="Dia do casamento"?"full":""}"><div class="panel-heading"><div><span class="eyebrow">Cronograma</span><h2>${scope}</h2></div></div><div class="timeline">${rows.filter(x=>x.scope===scope).sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(x=>`<div class="timeline-item"><span class="timeline-time">${dateBR(x.date)} · ${x.time}</span><h3>${esc(x.activity)}</h3><p>${esc(x.location)} · ${esc(x.owner||"Sem responsável")} ${x.supplierId?`· ${esc(supplier(x.supplierId)?.name)} (${esc(supplier(x.supplierId)?.phone||"sem contato")})`:""}</p><p>${esc(x.notes||"")}</p>${tagsHtml(x.tags)}<div class="row-actions" style="margin-top:6px;justify-content:flex-start"><button class="mini-button" data-edit="timeline:${x.id}">Editar</button><button class="mini-button" data-delete="timeline:${x.id}">Excluir</button></div></div>`).join("")||empty("Sem eventos","Adicione marcos para este cronograma.")}</div></article>`).join("")}</div>`}
function renderContracts(){
  const unsigned=state.contracts.filter(c=>c.status!=="Assinado").length;
  return `<div class="metric-grid">${metric("Documentos",state.contracts.length,"Itens cadastrados")}${metric("Assinados",state.contracts.filter(c=>c.status==="Assinado").length,"Concluídos")}${metric("Pendentes",unsigned,"Exigem acompanhamento",unsigned?"rose":"")}${metric("Fornecedores sem contrato",state.suppliers.filter(s=>!s.contractSigned&&["Contratado","Pago parcialmente","Pago"].includes(s.status)).length,"Verificar documentação","gold")}${metric("Com arquivo",state.contracts.filter(c=>c.documentPath||c.documentUrl).length,"Documentos anexados")}</div><div class="toolbar"><div class="segmented"><button class="${contractMode==="table"?"active":""}" data-contract-mode="table">Tabela</button><button class="${contractMode==="cards"?"active":""}" data-contract-mode="cards">Cards</button></div><select id="contractSupplier"><option value="">Todos os fornecedores</option>${state.suppliers.map(s=>`<option value="${s.id}" ${contractSupplierFilter===s.id?"selected":""}>${esc(s.name)}</option>`).join("")}</select><select id="contractType"><option value="">Todos os tipos</option>${[...new Set(state.contracts.map(c=>c.type).filter(Boolean))].map(type=>`<option ${contractTypeFilter===type?"selected":""}>${esc(type)}</option>`).join("")}</select><button class="button secondary" data-module-template="contracts">Modelo</button><button class="button secondary" data-module-import="contracts">Importar</button><button class="button secondary" data-module-export="contracts">Exportar</button><button class="button primary" data-action="new-contract">+ Documento</button></div><div id="contractContent">${contractContent()}</div>`;
}
function contractDetails(c){const hasFile=c.documentPath||c.documentUrl;return `<div class="contract-detail"><div class="contract-detail-block"><span>Documento</span><strong>${esc(c.documentName||"Nenhum arquivo anexado")}</strong>${hasFile?`<button class="document-link" data-open-document="${c.id}">Abrir documento ↗</button>`:""}</div><div class="contract-detail-block"><span>Referência externa</span><strong>${esc(c.link||"Não informada")}</strong></div><div class="contract-detail-block"><span>Prazo importante</span><strong>${dateBR(c.deadline)}</strong></div><div class="contract-detail-block"><span>Observações</span><p>${esc(c.notes||"Sem observações")}</p></div></div>`}
function contractContent(){const rows=state.contracts.filter(c=>(!contractSupplierFilter||c.supplierId===contractSupplierFilter)&&(!contractTypeFilter||c.type===contractTypeFilter));if(contractMode==="cards")return `<div class="cards-list">${rows.map(c=>{const hasFile=c.documentPath||c.documentUrl;return `<article class="record-card contract-card"><div class="record-card-top"><h3>${esc(c.name)}</h3>${status(c.status)}</div><p>${esc(supplier(c.supplierId)?.name||"Sem fornecedor")} · ${esc(c.type||"Documento")}</p><div class="record-meta"><div><span>Data</span><strong>${dateBR(c.date)}</strong></div><div><span>Prazo</span><strong>${dateBR(c.deadline)}</strong></div><div><span>Arquivo</span><strong>${hasFile?"Anexado":"Não anexado"}</strong></div><div><span>Prioridade</span><strong>${esc(c.priority||"Média")}</strong></div></div><p>${esc(c.notes||"Sem observações")}</p><div class="row-actions"><button class="mini-button" data-contract-toggle="${c.id}">Detalhes</button>${hasFile?`<button class="mini-button" data-contract-preview="${c.id}">Visualização</button>`:""}<button class="mini-button" data-edit="contract:${c.id}">Editar</button><button class="mini-button" data-delete="contract:${c.id}">Excluir</button></div><div class="contract-card-detail" data-contract-detail="${c.id}" hidden>${contractDetails(c)}</div></article>`}).join("")||empty("Nenhum documento","Ajuste os filtros ou cadastre um documento.")}</div>`;return `<div class="table-card"><table><thead><tr><th>Documento</th><th>Fornecedor</th><th>Tipo</th><th>Data</th><th>Status</th><th>Prazo</th><th>Arquivo / referência</th><th></th></tr></thead><tbody>${rows.map(c=>{const hasFile=c.documentPath||c.documentUrl;return `<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(supplier(c.supplierId)?.name||"—")}</td><td>${esc(c.type)}</td><td>${dateBR(c.date)}</td><td>${status(c.status)}</td><td>${dateBR(c.deadline)}</td><td>${hasFile?"Arquivo anexado":esc(c.link||"—")}</td><td><div class="row-actions"><button class="mini-button" data-contract-toggle="${c.id}">Detalhes</button>${hasFile?`<button class="mini-button" data-contract-preview="${c.id}">Visualização</button>`:""}<button class="mini-button" data-edit="contract:${c.id}">Editar</button><button class="mini-button" data-delete="contract:${c.id}">Excluir</button></div></td></tr><tr class="contract-detail-row" data-contract-detail="${c.id}" hidden><td colspan="8">${contractDetails(c)}</td></tr>`}).join("")||`<tr><td colspan="8">${empty("Nenhum documento","Ajuste os filtros ou cadastre um documento.")}</td></tr>`}</tbody></table></div>`}
function renderBuffet(){
  const stats=guestStats(),confirmedAdults=state.guests.filter(g=>g.confirmed&&g.type==="Adulto").length,confirmedChildren=state.guests.filter(g=>g.confirmed&&g.type!=="Adulto").length,basis=state.settings.buffetBasis||"confirmed",guests=basis==="total"?stats.total:basis==="manual"?Number(state.settings.buffetManualCount):stats.confirmed;
  const relatedSuppliers=state.suppliers.filter(s=>/buffet|bebida|aliment/i.test(`${s.category} ${s.service}`)),contracted=relatedSuppliers.reduce((a,b)=>a+Number(b.total),0),relatedIds=new Set(relatedSuppliers.map(s=>s.id)),paid=state.payments.filter(p=>relatedIds.has(p.supplierId)&&p.paid).reduce((a,b)=>a+Number(b.amount),0),open=state.payments.filter(p=>relatedIds.has(p.supplierId)&&!p.paid).reduce((a,b)=>a+Number(b.amount),0),planned=state.buffet.reduce((a,b)=>a+Number(b.cost),0),under=state.buffet.some(b=>Number(b.estimated)&&Number(b.estimated)<stats.confirmed);
  return `${under?`<div class="alert-line red"><span>Quantidade contratada menor que os ${stats.confirmed} convidados confirmados.</span><span>Revisar</span></div>`:""}<div class="metric-grid">${metric("Convidados base",guests,basis==="confirmed"?"Confirmados":basis==="total"?"Lista total":"Número manual")}${metric("Adultos confirmados",confirmedAdults,"Base RSVP")}${metric("Crianças confirmadas",confirmedChildren,"Base RSVP")}${metric("Pendentes RSVP",stats.pending,"Aguardando resposta","gold")}${metric("Custo contratado",money(contracted),`Pago ${money(paid)} · aberto ${money(open)}`)}</div><div class="toolbar"><select id="buffetBasis"><option value="confirmed" ${basis==="confirmed"?"selected":""}>Calcular por confirmados</option><option value="total" ${basis==="total"?"selected":""}>Calcular por convidados totais</option><option value="manual" ${basis==="manual"?"selected":""}>Número manual</option></select><input id="buffetManual" type="number" min="0" value="${state.settings.buffetManualCount}" style="width:110px;padding:9px;border:1px solid var(--line)"><span>Custo por pessoa: <strong>${money(contracted/Math.max(guests,1))}</strong></span><span>Previsto x contratado: <strong>${money(planned-contracted)}</strong></span><button class="button primary" data-action="new-buffet">+ Item</button></div><div class="table-card"><table><thead><tr><th>Item</th><th>Tipo</th><th>Estimado</th><th>Comprado</th><th>Unidade</th><th>Custo</th><th>Fornecedor</th><th>Status</th><th></th></tr></thead><tbody>${state.buffet.map(b=>`<tr><td><strong>${esc(b.item)}</strong></td><td>${esc(b.kind)}</td><td>${b.estimated}</td><td>${b.purchased}</td><td>${esc(b.unit)}</td><td class="money">${money(b.cost)}</td><td>${esc(supplier(b.supplierId)?.name||"—")}</td><td>${status(b.status)}</td><td><div class="row-actions"><button class="mini-button" data-edit="buffet:${b.id}">Editar</button><button class="mini-button" data-delete="buffet:${b.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;
}
function renderDecor(){
  const musicArea="Música e atrações",musicPlans=state.plans.filter(p=>p.module==="Música");
  const areas=[...new Set(["Cerimônia","Mesa dos convidados","Mesa do bolo","Lounge","Entrada","Papelaria","Convite","Identidade visual",musicArea,...state.decor.map(d=>d.area).filter(Boolean)])];
  return `<div class="toolbar"><button class="button secondary" data-module-template="decor">Modelo</button><button class="button secondary" data-module-import="decor">Importar</button><button class="button secondary" data-module-export="decor">Exportar</button><button class="button primary" data-action="new-decor">+ Decisão Visual</button></div><div class="cards-list decor-area-grid">${areas.map(area=>{const rows=state.decor.filter(d=>d.area===area),legacy=area===musicArea?musicPlans:[];return `<article class="record-card decor-area-card"><div class="record-card-top"><h3>${area}</h3><span>${rows.length+legacy.length}</span></div><div class="decor-row-list">${rows.map(d=>decorRow(d)).join("")}${legacy.map(p=>musicDecorRow(p)).join("")||(!rows.length?`<p class="decor-empty">Nenhuma decisão registrada.</p>`:"")}</div><button class="mini-button decor-add" data-action="new-decor" data-area="${area}">+ adicionar</button></article>`}).join("")}</div>`;
}
function isImageFile(item){return /\.(png|jpe?g|webp|gif|avif)$/i.test(item.documentName||item.documentPath||item.documentUrl||"")}
function decorRow(d){return `<div class="decor-list-row"><div class="decor-row-copy"><strong>${esc(d.item)}</strong><span>${esc(d.palette||"Paleta não informada")} · ${esc(d.style||"Estilo não informado")}</span></div>${status(d.status)}<div class="row-actions"><button class="mini-button" data-decor-preview="${d.id}">Visualização</button><button class="mini-button" data-edit="decor:${d.id}">Editar</button><button class="mini-button" data-delete="decor:${d.id}">Excluir</button></div></div>`}
function musicDecorRow(item){return `<div class="decor-list-row"><div class="decor-row-copy"><strong>${esc(item.title)}</strong><span>${dateBR(item.date)} · ${esc(item.owner||"Sem responsável")}</span></div>${status(item.status)}<div class="row-actions"><button class="mini-button" data-edit="plan:${item.id}">Editar</button><button class="mini-button" data-delete="plan:${item.id}">Excluir</button></div></div>`}
async function storedFileUrl(item){return item.documentPath?window.CloudStore.signedUrl(item.documentPath):documentHref(item.documentUrl)}
async function hydrateDecorMedia(){for(const image of $$("[data-decor-image]")){const item=state.decor.find(d=>d.id===image.dataset.decorImage);if(!item)continue;try{image.src=await storedFileUrl(item)}catch{image.closest(".decor-item-media").innerHTML='<span class="media-error">Imagem indisponível</span>'}}}
async function openDecorPreview(id){
  const item=state.decor.find(d=>d.id===id);if(!item)return;
  const hasFile=item.documentPath||item.documentUrl,link=item.attachment||item.reference||"",hasLink=/^https?:\/\//i.test(link),image=hasFile&&isImageFile(item);
  $("#decorPreviewContent").innerHTML=`<article class="decor-preview-card"><div class="decor-preview-copy"><span class="eyebrow">${esc(item.area||"Decoração")}</span><h2>${esc(item.item)}</h2>${status(item.status)}<dl><div><dt>Paleta</dt><dd>${esc(item.palette||"Não informada")}</dd></div><div><dt>Estilo</dt><dd>${esc(item.style||"Não informado")}</dd></div><div><dt>Fornecedor</dt><dd>${esc(supplier(item.supplierId)?.name||"Não vinculado")}</dd></div><div><dt>Prioridade</dt><dd>${esc(item.priority||"Média")}</dd></div></dl><p>${esc(item.notes||"Sem observações")}</p><div class="decor-preview-actions">${hasFile?`<button class="button secondary" data-open-decor="${item.id}">Abrir anexo</button>`:""}${hasLink?`<a class="button secondary" href="${esc(link)}" target="_blank" rel="noopener">Abrir referência</a>`:""}</div></div><div class="decor-preview-media">${image?`<div class="preview-loading">Carregando imagem...</div>`:hasFile?`<button class="decor-preview-file" data-open-decor="${item.id}"><span>Arquivo anexado</span><strong>${esc(item.documentName||"Abrir documento")}</strong></button>`:`<div class="decor-preview-empty"><span>Sem imagem anexada</span></div>`}</div></article>`;
  $("#decorPreviewDialog").showModal();
  if(image)try{const url=await storedFileUrl(item),media=$(".decor-preview-media");if(media)media.innerHTML=`<img src="${esc(url)}" alt="${esc(item.item)}">`}catch{const media=$(".decor-preview-media");if(media)media.innerHTML='<div class="decor-preview-empty"><span>Imagem indisponível</span></div>'}
}
async function openContractPreview(id){
  const item=state.contracts.find(c=>c.id===id);if(!item)return;
  const hasFile=item.documentPath||item.documentUrl,content=$("#contractPreviewContent");
  content.innerHTML=`<article class="contract-preview-card"><div class="contract-preview-copy"><span class="eyebrow">${esc(item.type||"Documento")}</span><h2>${esc(item.name)}</h2>${status(item.status)}<dl><div><dt>Fornecedor</dt><dd>${esc(supplier(item.supplierId)?.name||"Não vinculado")}</dd></div><div><dt>Data</dt><dd>${dateBR(item.date)}</dd></div><div><dt>Prazo</dt><dd>${dateBR(item.deadline)}</dd></div><div><dt>Prioridade</dt><dd>${esc(item.priority||"Média")}</dd></div></dl><p>${esc(item.notes||"Sem observações")}</p><div class="contract-preview-actions">${hasFile?`<button class="button secondary" data-open-document="${item.id}">Abrir documento</button>`:""}${item.link?`<a class="button secondary" href="${esc(item.link)}" target="_blank" rel="noopener">Abrir referência</a>`:""}</div></div><div class="contract-preview-viewer"><div class="preview-loading">Carregando documento...</div></div></article>`;
  $("#contractPreviewDialog").showModal();
  if(!hasFile){$(".contract-preview-viewer").innerHTML='<div class="contract-preview-empty"><span>Nenhum PDF anexado</span></div>';return}
  try{const url=await storedFileUrl(item),viewer=$(".contract-preview-viewer");if(viewer)viewer.innerHTML=`<iframe src="${esc(url)}#toolbar=1&navpanes=1&scrollbar=1&view=FitH" title="${esc(item.name)}"></iframe>`}catch{const viewer=$(".contract-preview-viewer");if(viewer)viewer.innerHTML='<div class="contract-preview-empty"><span>Documento indisponível</span></div>'}
}
function renderGifts(){
  return `<div class="metric-grid">${metric("Presentes",state.gifts.length,"Registros")}${metric("Recebidos",state.gifts.filter(g=>g.received).length,"Entregues")}${metric("Agradecidos",state.gifts.filter(g=>g.thankYou).length,"Mensagens enviadas")}${metric("Pendentes",state.gifts.filter(g=>g.received&&!g.thankYou).length,"Agradecer","gold")}${metric("Lista de convidados",state.guests.length,"Integração ativa")}</div><div class="toolbar"><button class="button secondary" data-module-template="gifts">Modelo</button><button class="button secondary" data-module-import="gifts">Importar</button><button class="button secondary" data-module-export="gifts">Exportar</button><button class="button primary" data-action="new-gift">+ Presente</button></div><div class="table-card"><table><thead><tr><th>Presente</th><th>Convidado</th><th>Recebido</th><th>Data</th><th>Agradecimento</th><th>Observações</th><th></th></tr></thead><tbody>${state.gifts.map(g=>`<tr><td><strong>${esc(g.name)}</strong></td><td>${esc(g.guest)}</td><td>${g.received?"Sim":"Não"}</td><td>${dateBR(g.date)}</td><td>${g.thankYou?"Enviado":"Pendente"}</td><td>${esc(g.notes||"—")}</td><td><div class="row-actions"><button class="mini-button" data-edit="gift:${g.id}">Editar</button><button class="mini-button" data-delete="gift:${g.id}">Excluir</button></div></td></tr>`).join("")}</tbody></table></div>`;
}
function renderGeneric(module){
  const rows=state.plans.filter(p=>p.module===module);
  return `<div class="metric-grid">${metric("Itens",rows.length,`Planejamento de ${module.toLowerCase()}`)}${metric("Concluídos",rows.filter(x=>x.status==="Concluído").length,"Decisões finalizadas")}${metric("Em andamento",rows.filter(x=>x.status==="Em andamento").length,"Execução atual")}${metric("Pendentes",rows.filter(x=>x.status==="Pendente").length,"A iniciar","gold")}${metric("Progresso",`${genericProgress(module)}%`,"Módulo")}</div><div class="toolbar"><button class="button primary" data-action="new-plan" data-module="${module}">+ Item</button></div><div class="cards-list">${rows.map(p=>`<article class="record-card"><div class="record-card-top"><h3>${esc(p.title)}</h3>${status(p.status)}</div><p>${dateBR(p.date)} · ${esc(p.owner)}</p><p>${esc(p.notes||"Sem observações")}</p><div class="row-actions"><button class="mini-button" data-edit="plan:${p.id}">Editar</button><button class="mini-button" data-delete="plan:${p.id}">Excluir</button></div></article>`).join("")||empty("Módulo pronto para uso","Adicione a primeira decisão ou pendência.")}</div>`;
}
function renderReports(){
  const f=financialTotals(),g=guestStats(),counts=attentionCounts(),nextTasks=state.tasks.filter(t=>t.status!=="Concluída").sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,5),nextPay=state.payments.filter(p=>!p.paid).sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).slice(0,5);
  return `<div class="metric-grid">${metric("Financeiro pago",money(f.paid),`${f.contracted?(f.paid/f.contracted*100).toFixed(1):0}% contratado`)}${metric("Confirmados",g.confirmed,`${g.total?Math.round(g.confirmed/g.total*100):0}% da lista`)}${metric("Tarefas atrasadas",counts.checklist,"Requer atenção",counts.checklist?"rose":"")}${metric("Contratos pendentes",counts.contracts,"Documentos","gold")}</div><div class="content-grid reports-grid"><article class="panel"><div class="panel-heading"><div><span class="eyebrow">Atenção</span><h2>Pontos prioritários</h2></div></div><div class="attention-list">${Object.entries(counts).filter(([,v])=>v).map(([k,v])=>`<button class="attention-item" data-view="${k}"><div class="attention-copy"><strong>${MODULES.find(m=>m.id===k)?.title||k}</strong><span>${v} pendência${v===1?"":"s"}</span></div><span class="attention-arrow">→</span></button>`).join("")||empty("Tudo em ordem","Nenhuma pendência crítica agora.")}</div></article><article class="panel"><div class="panel-heading"><div><span class="eyebrow">Próximas tarefas</span><h2>Agenda do casal</h2></div></div><div class="activity-list">${nextTasks.map(t=>`<div class="activity-item"><div><strong>${esc(t.title)}</strong><span>${dateBR(t.dueDate)} · ${esc(t.owner)}</span></div>${status(t.status)}</div>`).join("")}</div></article><article class="panel full"><div class="panel-heading"><div><span class="eyebrow">Próximos vencimentos</span><h2>Agenda financeira</h2></div></div><div class="activity-list">${nextPay.map(p=>`<div class="activity-item"><div><strong>${esc(supplier(p.supplierId)?.name)}</strong><span>${dateBR(p.dueDate)} · ${esc(p.description)}</span></div><strong>${money(p.amount)}</strong></div>`).join("")}</div></article></div>`;
}

function monthData(){
  const keys=state.payments.map(p=>String(p.dueDate||"").slice(0,7)).filter(key=>/^\d{4}-\d{2}$/.test(key)).sort();
  if(!keys.length)return[];
  const [startYear,startMonth]=keys[0].split("-").map(Number),[endYear,endMonth]=keys.at(-1).split("-").map(Number),months=[];
  for(let year=startYear,month=startMonth;year<endYear||year===endYear&&month<=endMonth;month++){if(month===13){month=1;year++}const key=`${year}-${String(month).padStart(2,"0")}`,rows=state.payments.filter(p=>String(p.dueDate||"").startsWith(key)),name=new Date(Date.UTC(year,month-1,1)).toLocaleDateString("pt-BR",{month:"short",timeZone:"UTC"}).replace(".","");months.push({key,label:`${name}/${String(year).slice(-2)}`,planned:rows.reduce((a,b)=>a+Number(b.amount),0),paid:rows.filter(p=>p.paid).reduce((a,b)=>a+Number(b.amount),0)})}
  return months;
}
function renderMonthlyChart(){
  const all=monthData(),maxStart=Math.max(0,all.length-MONTHLY_WINDOW);
  monthlyWindowStart=Math.min(Math.max(0,monthlyWindowStart),maxStart);
  const visible=all.slice(monthlyWindowStart,monthlyWindowStart+MONTHLY_WINDOW),chart=$('[data-chart="monthly"]'),range=$("#monthlyRange"),label=$("#monthlyRangeLabel");
  if(chart)drawBars(chart,visible);
  if(range){range.max=String(maxStart);range.value=String(monthlyWindowStart);range.disabled=maxStart===0}
  if(label)label.textContent=visible.length?`${visible[0].label} — ${visible.at(-1).label}`:"Sem pagamentos";
}
function hydrateCharts(){
  $$("[data-chart]").forEach(el=>{
    if(el.dataset.chart==="monthly")renderMonthlyChart();
    if(el.dataset.chart==="payment-status"){const data=[{label:"Pago",value:financialTotals().paid,color:COLORS[0]},{label:"Pendente",value:financialTotals().pending,color:COLORS[1]},{label:"Vencido",value:financialTotals().overdue,color:COLORS[2]}].filter(x=>x.value);drawDonut(el,data);const legend=$('[data-legend="payment-status"]');if(legend)legend.innerHTML=legendHtml(data)}
    if(el.dataset.chart==="finance-categories"){const data=state.categories.map((category,i)=>({label:category,value:state.suppliers.filter(s=>s.category===category&&!["Pesquisando","Orçado","Cancelado","Em negociação"].includes(s.status)).reduce((a,b)=>a+Number(b.total),0),color:COLORS[i%COLORS.length]})).filter(x=>x.value);drawDonut(el,data);const legend=$('[data-legend="finance-categories"]');if(legend)legend.innerHTML=legendHtml(data)}
    if(el.dataset.chart==="payment-methods"){const methods=["PIX","Boleto","Transferência","Cartão","Dinheiro","Outro"],data=methods.map(method=>({label:method,value:state.payments.filter(p=>p.method===method).reduce((a,b)=>a+Number(b.amount),0)})).filter(x=>x.value),max=Math.max(...data.map(d=>d.value),1);drawModuleBars(el,data.map(x=>({label:x.label,value:Math.round(x.value/max*100),rawValue:x.value})))}
    if(el.dataset.chart==="modules")drawModuleBars(el,MODULES.filter(m=>!["reports"].includes(m.id)).slice(0,10).map(m=>({label:m.title.split(" ")[0],value:moduleProgress(m.id)})));
  });
}
function drawDonut(el,data){if(!data.length){el.innerHTML=empty("Sem dados","Adicione registros.");return}const total=data.reduce((a,b)=>a+b.value,0),r=65,c=2*Math.PI*r;let off=0;const seg=data.map(x=>{const d=x.value/total*c,tip=`${x.label}: ${money(x.value)} (${(x.value/total*100).toFixed(1)}%)`,s=`<circle data-chart-tip="${esc(tip)}" cx="100" cy="100" r="${r}" fill="none" stroke="${x.color}" stroke-width="24" stroke-dasharray="${d} ${c-d}" stroke-dashoffset="${-off}" transform="rotate(-90 100 100)"><title>${esc(tip)}</title></circle>`;off+=d;return s}).join("");el.innerHTML=`<svg viewBox="0 0 200 200">${seg}<circle cx="100" cy="100" r="48" fill="#fffdf8"/><text x="100" y="96" text-anchor="middle" font-size="9" fill="#72776f">TOTAL</text><text x="100" y="116" text-anchor="middle" font-size="14" font-weight="700">${money(total).replace(",00","")}</text></svg>`}
function legendHtml(data){return data.map(x=>`<div class="legend-row"><i class="legend-dot" style="background:${x.color}"></i><span>${x.label}</span><span class="legend-value">${money(x.value)}</span></div>`).join("")}
function drawBars(el,data){if(!data.length){el.innerHTML=empty("Sem pagamentos","Cadastre vencimentos para visualizar a evolução.");return}const max=Math.max(...data.flatMap(x=>[x.planned,x.paid]),1),base=220,plotHeight=178,plotStart=48,plotWidth=650,group=plotWidth/Math.max(data.length,1),barWidth=Math.min(18,group*.28);const grid=[0,.25,.5,.75,1].map(r=>{const y=base-r*plotHeight;return `<line x1="42" y1="${y}" x2="712" y2="${y}" stroke="#e9e5dc"/><text x="36" y="${y+3}" text-anchor="end" font-size="8" fill="#8b8f87">${r?Math.round(max*r/1000)+"k":"0"}</text>`}).join("");const bars=data.map((x,i)=>{const center=plotStart+i*group+group/2,h1=x.planned/max*plotHeight,h2=x.paid/max*plotHeight,left=center-barWidth-2;return `<rect x="${left}" y="${base-h1}" width="${barWidth}" height="${Math.max(h1,1)}" rx="2" fill="#c7a75b"/><rect x="${center+2}" y="${base-h2}" width="${barWidth}" height="${Math.max(h2,1)}" rx="2" fill="#52634b"/><rect data-chart-tip="${esc(x.label)}" data-tip-kind="monthly" data-tip-label="${esc(x.label)}" data-tip-planned="${esc(money(x.planned))}" data-tip-paid="${esc(money(x.paid))}" x="${center-group/2}" y="30" width="${group}" height="${base-30}" fill="transparent" pointer-events="all"><title>${esc(x.label)}</title></rect><text x="${center}" y="243" text-anchor="middle" font-size="8" fill="#72776f">${x.label}</text>`}).join("");el.innerHTML=`<svg viewBox="0 0 730 255" preserveAspectRatio="xMidYMid meet">${grid}${bars}</svg>`}
function drawModuleBars(el,data){const max=Math.max(...data.map(x=>x.value),1),rowHeight=Math.min(43,240/Math.max(data.length,1));el.innerHTML=`<svg viewBox="0 0 700 260" preserveAspectRatio="xMidYMid meet">${data.map((x,i)=>{const y=18+i*rowHeight,w=x.value/max*500,display=x.rawValue!=null?money(x.rawValue):`${x.value}%`,tip=`${x.label}: ${display}`;return `<text x="8" y="${y+12}" font-size="10" fill="#5d625b">${x.label}</text><rect x="125" y="${y}" width="500" height="16" rx="3" fill="#ece8df"/><rect data-chart-tip="${esc(tip)}" x="125" y="${y}" width="${Math.max(w,1)}" height="16" rx="3" fill="#92a386"><title>${esc(tip)}</title></rect><text x="640" y="${y+12}" font-size="9" fill="#52634b">${display}</text>`}).join("")}</svg>`}

const FORMS = {
  supplier:{title:"Fornecedor",note:"O fornecedor fica disponível no financeiro, contratos, cronograma e checklist.",fields:[
    ["name","Fornecedor","text",true],["category","Categoria","categories",true],["service","Serviço contratado","text",true,"span-2"],["contact","Pessoa de contato","text"],["phone","Telefone / WhatsApp","text"],["email","E-mail","email"],["website","Instagram / site","text"],["total","Valor contratado","number",true],["status","Status","options",true,["Pesquisando","Orçado","Em negociação","Contratado","Pago parcialmente","Pago","Cancelado"]],["hiredDate","Data de contratação","date"],["contractSigned","Contrato assinado","boolean"],["priority","Prioridade","priority"],["rating","Avaliação de 1 a 5","number"],["tags","Tags (separadas por vírgula)","tags",false,"span-2"],["attachment","Link / anexo","text",false,"span-2"],["notes","Observações","textarea",false,"span-2"]]},
  payment:{title:"Pagamento",note:"Cada lançamento mantém valor e vencimento próprios. Não há divisão automática.",fields:[
    ["supplierId","Fornecedor","suppliers",true,"span-2"],["category","Categoria","categories",true],["description","Descrição","text",true],["dueDate","Vencimento","date",true],["amount","Valor","number",true],["paid","Status","options",true,[["false","Pendente"],["true","Pago"]]],["paidDate","Data do pagamento","date"],["method","Forma de pagamento","options",false,["PIX","Boleto","Transferência","Cartão","Dinheiro","Outro"]],["expenseType","Tipo de despesa","options",false,["Essencial","Desejável","Extra"]],["owner","Responsável pelo pagamento","text"],["priority","Prioridade","priority"],["tags","Tags","tags"],["receipt","Link / referência do comprovante","text","", "span-2"],["notes","Observações","textarea",false,"span-2"]]},
  guest:{title:"Convidado",note:"Os dados alimentam automaticamente RSVP, buffet e relatórios.",fields:[
    ["name","Nome","text",true],["group","Grupo / família","text"],["side","Lado","options",false,["Noiva","Noivo","Ambos"]],["type","Tipo","options",false,["Adulto","Criança","Bebê"]],["phone","Telefone","text"],["email","E-mail","email"],["address","Endereço","text","", "span-2"],["inviteStatus","Status do convite","options",false,["Não enviado","Enviado","Confirmado","Recusado","Talvez","Sem resposta"]],["companions","Acompanhantes","number"],["diet","Restrições alimentares","text"],["table","Mesa","tables"],["priority","Prioridade","priority"],["tags","Tags","tags"],["attachment","Link / anexo","text"],["gift","Presente recebido","text"],["notes","Observações","textarea",false,"span-2"]]},
  task:{title:"Tarefa",note:"A tarefa pode ser vinculada a um fornecedor e aparece no relatório executivo.",fields:[
    ["title","Título","text",true,"span-2"],["description","Descrição","textarea",false,"span-2"],["dueDate","Prazo","date",true],["owner","Responsável","text"],["status","Status","options",false,["Pendente","Em andamento","Concluída","Atrasada"]],["priority","Prioridade","priority"],["category","Categoria","text"],["phase","Fase","options",false,["18 a 12 meses antes","12 a 9 meses antes","9 a 6 meses antes","6 a 3 meses antes","3 a 1 mês antes","Semana do casamento","Dia do casamento","Pós-casamento"]],["supplierId","Fornecedor vinculado","suppliers"],["tags","Tags","tags"],["attachment","Link / anexo","text"],["notes","Observações","textarea",false,"span-2"]]},
  contract:{title:"Documento",note:"Preencha as informações da linha e, se desejar, anexe o arquivo para abri-lo diretamente no registro.",fields:[
    ["name","Nome do documento","text",true,"span-2"],["supplierId","Fornecedor relacionado","suppliers"],["type","Tipo","options",false,["Contrato","Proposta","Comprovante","Orçamento","Identidade visual","Nota fiscal","Recibo"]],["date","Data","date"],["status","Status","options",false,["Pendente","Em revisão","Assinado","Vencido"]],["priority","Prioridade","priority"],["tags","Tags","tags"],["documentFile","Importar documento","file",false,"span-2"],["link","Link ou referência externa","text","", "span-2"],["deadline","Validade / prazo","date"],["notes","Observações","textarea",false,"span-2"]]},
  timeline:{title:"Evento do cronograma",note:"Fornecedores vinculados permanecem integrados ao planejamento.",fields:[
    ["scope","Cronograma","options",false,["Planejamento","Semana do casamento","Dia do casamento"]],["date","Data","date",true],["time","Horário","time"],["activity","Atividade","text",true,"span-2"],["owner","Responsável","text"],["location","Local","text"],["supplierId","Fornecedor envolvido","suppliers"],["status","Status","options",false,["Planejado","Confirmado","Concluído","Cancelado"]],["priority","Prioridade","priority"],["tags","Tags","tags"],["attachment","Link / anexo","text"],["notes","Observações","textarea",false,"span-2"]]},
  buffet:{title:"Item de buffet ou bebida",note:"Quantidades e custos são usados nos indicadores por convidado.",fields:[
    ["item","Item","text",true],["kind","Tipo","options",false,["Cardápio","Bebida","Bolo","Doce","Serviço"]],["estimated","Quantidade estimada","number"],["purchased","Quantidade comprada","number"],["unit","Unidade","text"],["cost","Custo total","number"],["supplierId","Fornecedor","suppliers"],["status","Status","options",false,["Pendente","Parcial","Contratado","Comprado","Incluído","Concluído"]],["notes","Observações","textarea",false,"span-2"]]},
  decor:{title:"Decisão visual",note:"Organize referências e aprovações por área do casamento.",fields:[
    ["area","Área","options",false,["Cerimônia","Mesa dos convidados","Mesa do bolo","Lounge","Entrada","Papelaria","Convite","Identidade visual"]],["item","Item / decisão","text",true],["palette","Paleta de cores","text"],["style","Estilo","text"],["supplierId","Fornecedor","suppliers"],["reference","Referência visual","text"],["status","Status","options",false,["Planejado","Em aprovação","Aprovado","Pendente","Concluído"]],["priority","Prioridade","priority"],["tags","Tags","tags"],["documentFile","Anexar imagem ou arquivo","file",false,"span-2"],["attachment","Link / anexo","text"],["notes","Observações","textarea",false,"span-2"]]},
  gift:{title:"Presente",note:"Controle recebimentos e agradecimentos enviados.",fields:[
    ["name","Presente","text",true],["guest","Convidado / família","text"],["received","Recebido","boolean"],["date","Data","date"],["thankYou","Agradecimento enviado","boolean"],["notes","Observações","textarea",false,"span-2"]]},
  plan:{title:"Item do módulo",note:"Este item integra o progresso geral do casamento.",fields:[
    ["module","Módulo","text",true],["title","Título","text",true],["status","Status","options",false,["Pendente","Em andamento","Concluído","Cancelado"]],["owner","Responsável","text"],["date","Prazo","date"],["notes","Observações","textarea",false,"span-2"]]},
  table:{title:"Mesa",note:"A mesa ficará disponível para atribuição na ficha de convidados.",fields:[
    ["name","Nome / número da mesa","text",true],["capacity","Capacidade","number",true],["tags","Tags","tags"],["notes","Observações","textarea",false,"span-2"]]}
};
const COLLECTIONS={supplier:"suppliers",payment:"payments",guest:"guests",task:"tasks",contract:"contracts",timeline:"timeline",buffet:"buffet",decor:"decor",gift:"gifts",plan:"plans",table:"tables"};
function fieldHtml(field,value){
  const [name,label,type,required,extra]=field,req=required?"required":"",cls=typeof extra==="string"?extra:"",v=value??"";
  let control="";
  if(type==="textarea")control=`<textarea name="${name}" ${req}>${esc(v)}</textarea>`;
  else if(type==="options"){const opts=Array.isArray(extra)?extra:[];control=`<select name="${name}" ${req}>${opts.map(o=>{const val=Array.isArray(o)?o[0]:o,text=Array.isArray(o)?o[1]:o;return `<option value="${esc(val)}" ${String(v)===String(val)?"selected":""}>${esc(text)}</option>`}).join("")}</select>`}
  else if(type==="categories")control=`<select name="${name}" ${req}>${state.categories.map(o=>`<option ${v===o?"selected":""}>${esc(o)}</option>`).join("")}</select>`;
  else if(type==="suppliers")control=`<select name="${name}" ${req}><option value="">Nenhum</option>${state.suppliers.map(o=>`<option value="${o.id}" ${v===o.id?"selected":""}>${esc(o.name)}</option>`).join("")}</select>`;
  else if(type==="tables")control=`<select name="${name}"><option value="">Sem mesa</option>${state.tables.map(o=>`<option value="${esc(o.name)}" ${v===o.name?"selected":""}>${esc(o.name)}</option>`).join("")}</select>`;
  else if(type==="priority")control=`<select name="${name}">${["Baixa","Média","Alta","Crítica"].map(o=>`<option ${v===o?"selected":""}>${o}</option>`).join("")}</select>`;
  else if(type==="tags")control=`<input name="${name}" type="text" value="${esc(parseTags(v).join(", "))}" placeholder="urgente, revisar, confirmado">`;
  else if(type==="boolean")control=`<select name="${name}"><option value="false" ${!v?"selected":""}>Não</option><option value="true" ${v?"selected":""}>Sim</option></select>`;
  else if(type==="file")control=`<input name="${name}" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp">`;
  else control=`<input name="${name}" type="${type}" value="${esc(v)}" ${type==="number"?'step="0.01" min="0"':""} ${req}>`;
  return `<label class="${cls}"><span>${label}</span>${control}</label>`;
}
function openForm(entity,id="",prefill={}){
  const config=FORMS[entity],collection=COLLECTIONS[entity],item=id?state[collection].find(x=>x.id===id):null;
  currentEntity=entity;currentEditId=id;
  $("#dialogEyebrow").textContent=item?"Edição":"Novo cadastro";$("#dialogTitle").textContent=`${item?"Editar":"Novo"} ${config.title.toLowerCase()}`;$("#formNote").textContent=config.note;
  const values={...(item||{}),...prefill};$("#formFields").innerHTML=config.fields.map(f=>fieldHtml(f,values[f[0]])).join("");
  $("#entityDialog").showModal();
}
async function uploadDocument(file){
  const cloudSession=await window.CloudStore?.session?.();
  if(cloudSession){
    const uploaded=await window.CloudStore.upload(file);
    return {path:uploaded.path,name:uploaded.name,url:""};
  }
  if(location.hostname!=="127.0.0.1"&&location.hostname!=="localhost"&&location.protocol!=="file:")throw new Error("Entre na sua conta para salvar documentos online.");
  const endpoint=location.protocol==="http:"||location.protocol==="https:"?"/api/upload-document":"http://127.0.0.1:4173/api/upload-document";
  let response;
  try{
    response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/octet-stream","X-Filename":encodeURIComponent(file.name)},body:await file.arrayBuffer()});
  }catch{
    throw new Error("Não foi possível conectar ao servidor de documentos. Abra o dashboard em http://127.0.0.1:4173 e tente novamente.");
  }
  const payload=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(payload.error||"Não foi possível enviar o documento.");
  payload.url=documentHref(payload.url);
  return payload;
}
async function submitEntity(form){
  const formData=new FormData(form),file=formData.get("documentFile"),data=Object.fromEntries(formData),config=FORMS[currentEntity],collection=COLLECTIONS[currentEntity];
  delete data.documentFile;
  for(const [name,,type] of config.fields){if(type==="number")data[name]=Number(data[name]||0);if(type==="boolean")data[name]=data[name]==="true";if(type==="tags")data[name]=parseTags(data[name])}
  if(currentEntity==="payment"){data.paid=data.paid==="true"||data.paid===true;if(data.paid&&!data.paidDate)data.paidDate=TODAY();if(!data.paid)data.paidDate="";if(!data.category)data.category=supplier(data.supplierId)?.category||"Outros"}
  if(currentEntity==="guest")data.confirmed=data.inviteStatus==="Confirmado";
  if(["contract","decor"].includes(currentEntity)&&typeof File!=="undefined"&&file instanceof File&&file.size){
    const previous=currentEditId?state[collection].find(record=>record.id===currentEditId):null,uploaded=await uploadDocument(file);
    data.documentUrl=uploaded.url||"";data.documentPath=uploaded.path||"";data.documentName=uploaded.name;
    if(previous?.documentPath&&previous.documentPath!==data.documentPath)window.CloudStore.deleteDocument(previous.documentPath).catch(()=>{});
  }
  if(currentEditId){const index=state[collection].findIndex(x=>x.id===currentEditId);state[collection][index]={...state[collection][index],...data}}
  else state[collection].push({id:uid(currentEntity[0]),...data});
  $("#entityDialog").close();save(`${config.title} salvo.`);
}
function renderCategories(){const usage=cat=>state.suppliers.filter(s=>s.category===cat).length+state.payments.filter(p=>p.category===cat).length;$("#categoryList").innerHTML=state.categories.map(cat=>`<div class="category-row"><span>${esc(cat)}</span><small>${usage(cat)} usos</small><button class="mini-button" data-delete-category="${esc(cat)}" ${usage(cat)?"disabled":""}>Excluir</button></div>`).join("")}

function parseDateValue(v){if(typeof v==="number"){const d=new Date(Date.UTC(1899,11,30)+v*86400000);return d.toISOString().slice(0,10)}const s=String(v??"").trim();if(/^\d{4}-\d{2}-\d{2}/.test(s))return s.slice(0,10);const m=s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);return m?`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`:""}
function parseMoney(v){if(typeof v==="number")return v;const s=String(v??"").replace(/\s/g,"").replace(/^R\$/i,"");return Number(s.includes(",")?s.replace(/\./g,"").replace(",","."):s)||0}
function rowValue(row,aliases){for(const [k,v] of Object.entries(row))if(aliases.includes(normalize(k).replace(/[^a-z0-9]/g,"")))return v;return""}
function normalizePaymentImport(rows){return rows.map((r,i)=>{const supplierName=String(rowValue(r,["fornecedor"])||"").trim(),description=String(rowValue(r,["descricao","parcela","servico"])||"").trim(),dueDate=parseDateValue(rowValue(r,["vencimento","datadevencimento"])),amount=parseMoney(rowValue(r,["valor","valordaparcela","valorpagamento"])),paid=["sim","pago","true","1"].includes(normalize(rowValue(r,["status","pago"]))),category=String(rowValue(r,["categoria"])||"Outros").trim();return {row:i+2,supplierName,description,dueDate,amount,paid,paidDate:paid?parseDateValue(rowValue(r,["datadopagamento","pagamento"])):"",method:String(rowValue(r,["formadepagamento","forma","metodo"])||"Outro"),notes:String(rowValue(r,["observacoes","observacao"])||""),category,valid:Boolean(supplierName&&description&&dueDate&&amount>0)}})}
function normalizeSupplierImport(rows){return rows.map((r,i)=>{const name=String(rowValue(r,["fornecedor","nome","nomedofornecedor"])||"").trim(),category=String(rowValue(r,["categoria"])||"Outros").trim(),service=String(rowValue(r,["servico","servicocontratado","descricao"])||"").trim(),contractSigned=["sim","true","1","assinado"].includes(normalize(rowValue(r,["contratoassinado","contrato"])));return {row:i+2,name,category,service,contact:String(rowValue(r,["contato","pessoadecontato"])||""),phone:String(rowValue(r,["telefone","whatsapp","telefonewhatsapp"])||""),email:String(rowValue(r,["email"])||""),website:String(rowValue(r,["instagram","site","instagramsite"])||""),total:parseMoney(rowValue(r,["valor","valorcontratado","valortotal"])),status:String(rowValue(r,["status","statusdanegociacao"])||"Pesquisando"),hiredDate:parseDateValue(rowValue(r,["datadecontratacao","contratacao"])),contractSigned,priority:String(rowValue(r,["prioridade"])||"Média"),rating:Number(rowValue(r,["avaliacao","avaliacaointerna"])||0),notes:String(rowValue(r,["observacoes","observacao"])||""),valid:Boolean(name&&category&&service)}})}
function normalizeGuestImport(rows){return rows.map((r,i)=>{const name=String(rowValue(r,["nome","convidado"])||"").trim(),inviteStatus=String(rowValue(r,["status","statusdoconvite","convite"])||"Não enviado"),confirmed=["sim","true","1","confirmado"].includes(normalize(rowValue(r,["presencaconfirmada","confirmado"])))||normalize(inviteStatus)==="confirmado";return {row:i+2,name,group:String(rowValue(r,["grupo","familia","grupofamilia"])||""),side:String(rowValue(r,["lado"])||"Ambos"),type:String(rowValue(r,["tipo"])||"Adulto"),phone:String(rowValue(r,["telefone","whatsapp"])||""),email:String(rowValue(r,["email"])||""),address:String(rowValue(r,["endereco"])||""),inviteStatus:confirmed?"Confirmado":inviteStatus,confirmed,companions:Number(rowValue(r,["acompanhantes","quantidadedeacompanhantes"])||0),diet:String(rowValue(r,["restricoesalimentares","restricaoalimentar"])||""),notes:String(rowValue(r,["observacoes","observacao"])||""),table:String(rowValue(r,["mesa","mesaatribuida"])||""),gift:String(rowValue(r,["presente","presenterecebido"])||""),valid:Boolean(name)}})}
function normalizeRsvpImport(rows){return rows.map((r,i)=>{const name=String(rowValue(r,["nome","convidado"])||"").trim(),group=String(rowValue(r,["grupo","familia","grupofamilia"])||""),inviteStatus=String(rowValue(r,["status","statusdaresposta","resposta"])||"Enviado"),confirmed=normalize(inviteStatus)==="confirmado";return {row:i+2,name,group,inviteStatus,confirmed,companions:Number(rowValue(r,["acompanhantes","quantidadedeacompanhantes"])||0),diet:String(rowValue(r,["restricoesalimentares","restricaoalimentar"])||""),notes:String(rowValue(r,["observacoes","observacaodaresposta"])||""),phone:String(rowValue(r,["telefone","whatsapp"])||""),email:String(rowValue(r,["email"])||""),side:String(rowValue(r,["lado"])||"Ambos"),type:String(rowValue(r,["tipo"])||"Adulto"),address:"",table:"",gift:"",valid:Boolean(name)}})}
function parseCsv(text){const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean),sep=(lines[0].match(/;/g)||[]).length>(lines[0].match(/,/g)||[]).length?";":",";const parse=line=>{const out=[];let val="",quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'&&line[i+1]==='"'){val+='"';i++}else if(c==='"')quoted=!quoted;else if(c===sep&&!quoted){out.push(val);val=""}else val+=c}out.push(val);return out};const headers=parse(lines.shift());return lines.map(line=>Object.fromEntries(headers.map((h,i)=>[h,parse(line)[i]||""])))}
async function readImport(file){
  if(file.name.toLowerCase().endsWith(".csv"))return parseCsv(await file.text());
  if(window.XLSX){const book=XLSX.read(await file.arrayBuffer(),{type:"array"}),sheet=book.Sheets[book.SheetNames[0]];return XLSX.utils.sheet_to_json(sheet,{defval:""})}
  const response=await fetch("/api/import-xlsx",{method:"POST",headers:{"Content-Type":"application/octet-stream"},body:await file.arrayBuffer()}),payload=await response.json();if(!response.ok)throw new Error(payload.error||"Falha ao ler Excel");return payload.rows
}
function showImport(rows){const normalizers={payments:normalizePaymentImport,suppliers:normalizeSupplierImport,guests:normalizeGuestImport,rsvp:normalizeRsvpImport},titles={payments:"Importar pagamentos",suppliers:"Importar fornecedores",guests:"Importar convidados",rsvp:"Importar respostas RSVP"},labels={payments:"lançamentos",suppliers:"fornecedores",guests:"convidados",rsvp:"respostas"};pendingImport=normalizers[pendingImportType](rows);const good=pendingImport.filter(r=>r.valid);$("#importTitle").textContent=titles[pendingImportType];$("#confirmImport").textContent=`Importar ${labels[pendingImportType]}`;$("#importSummary").innerHTML=`<strong>${good.length} ${labels[pendingImportType]} prontos.</strong> ${pendingImport.length-good.length} linhas incompletas serão ignoradas.`;if(pendingImportType==="payments"){ $("#importPreviewHead").innerHTML="<tr><th>Linha</th><th>Vencimento</th><th>Fornecedor</th><th>Descrição</th><th>Valor</th><th>Categoria</th></tr>";$("#importPreviewBody").innerHTML=pendingImport.slice(0,50).map(r=>`<tr><td>${r.row}</td><td>${dateBR(r.dueDate)}</td><td>${esc(r.supplierName)}</td><td>${esc(r.description)}</td><td>${money(r.amount)}</td><td>${esc(r.category)}</td></tr>`).join("")}if(pendingImportType==="suppliers"){ $("#importPreviewHead").innerHTML="<tr><th>Linha</th><th>Fornecedor</th><th>Categoria</th><th>Serviço</th><th>Valor</th><th>Status</th></tr>";$("#importPreviewBody").innerHTML=pendingImport.slice(0,50).map(r=>`<tr><td>${r.row}</td><td>${esc(r.name)}</td><td>${esc(r.category)}</td><td>${esc(r.service)}</td><td>${money(r.total)}</td><td>${esc(r.status)}</td></tr>`).join("")}if(pendingImportType==="guests"||pendingImportType==="rsvp"){ $("#importPreviewHead").innerHTML="<tr><th>Linha</th><th>Nome</th><th>Grupo</th><th>Lado</th><th>Tipo</th><th>Status</th></tr>";$("#importPreviewBody").innerHTML=pendingImport.slice(0,50).map(r=>`<tr><td>${r.row}</td><td>${esc(r.name)}</td><td>${esc(r.group)}</td><td>${esc(r.side)}</td><td>${esc(r.type)}</td><td>${esc(r.inviteStatus)}</td></tr>`).join("")}$("#confirmImport").disabled=!good.length;$("#importDialog").showModal()}
function commitImport(){if(pendingImportType==="payments")commitPaymentImport();if(pendingImportType==="suppliers")commitSupplierImport();if(pendingImportType==="guests")commitGuestImport();if(pendingImportType==="rsvp")commitRsvpImport()}
function finishImport(message){$("#importDialog").close();pendingImport=[];save(message)}
function commitPaymentImport(){const existing=new Set(state.payments.map(p=>`${p.supplierId}|${p.dueDate}|${p.amount}|${normalize(p.description)}`));let added=0,created=0;for(const row of pendingImport.filter(r=>r.valid)){let s=state.suppliers.find(x=>normalize(x.name)===normalize(row.supplierName));if(!s){if(!state.categories.some(c=>normalize(c)===normalize(row.category)))state.categories.push(row.category);s={id:uid("s"),name:row.supplierName,category:row.category,service:"Importado do Excel",total:row.amount,status:"Contratado",contact:"",phone:"",email:"",website:"",hiredDate:"",contractSigned:false,priority:"Média",rating:0,notes:""};state.suppliers.push(s);created++}const key=`${s.id}|${row.dueDate}|${row.amount}|${normalize(row.description)}`;if(existing.has(key))continue;state.payments.push({id:uid("p"),supplierId:s.id,category:row.category,description:row.description,dueDate:row.dueDate,amount:row.amount,paid:row.paid,paidDate:row.paidDate,method:row.method,expenseType:"Essencial",owner:"Casal",receipt:"",notes:row.notes});existing.add(key);added++}finishImport(`${added} pagamentos importados e ${created} fornecedores criados.`)}
function commitSupplierImport(){const existing=new Set(state.suppliers.map(s=>normalize(s.name)));let added=0,skipped=0;for(const row of pendingImport.filter(r=>r.valid)){if(existing.has(normalize(row.name))){skipped++;continue}if(!state.categories.some(c=>normalize(c)===normalize(row.category)))state.categories.push(row.category);state.suppliers.push({id:uid("s"),...row});delete state.suppliers.at(-1).row;delete state.suppliers.at(-1).valid;existing.add(normalize(row.name));added++}finishImport(`${added} fornecedores importados${skipped?` e ${skipped} duplicados ignorados`:""}.`)}
function commitGuestImport(){const existing=new Set(state.guests.map(g=>`${normalize(g.name)}|${normalize(g.group)}`));let added=0,skipped=0;for(const row of pendingImport.filter(r=>r.valid)){const key=`${normalize(row.name)}|${normalize(row.group)}`;if(existing.has(key)){skipped++;continue}state.guests.push({id:uid("g"),...row});delete state.guests.at(-1).row;delete state.guests.at(-1).valid;existing.add(key);added++}finishImport(`${added} convidados importados${skipped?` e ${skipped} duplicados ignorados`:""}.`)}
function commitRsvpImport(){let updated=0,added=0;for(const row of pendingImport.filter(r=>r.valid)){let guest=state.guests.find(g=>normalize(g.name)===normalize(row.name)&&(normalize(g.group)===normalize(row.group)||!row.group));if(guest){guest.inviteStatus=row.inviteStatus;guest.confirmed=row.confirmed;guest.companions=row.companions;guest.diet=row.diet||guest.diet;guest.notes=row.notes||guest.notes;if(row.phone)guest.phone=row.phone;if(row.email)guest.email=row.email;updated++}else{state.guests.push({id:uid("g"),...row});delete state.guests.at(-1).row;delete state.guests.at(-1).valid;added++}}finishImport(`${updated} respostas atualizadas e ${added} convidados adicionados.`)}
function downloadTemplate(type="payments"){const templates={payments:[["Vencimento","Fornecedor","Descrição","Valor","Status","Data do Pagamento","Forma de Pagamento","Observações","Categoria"],["30/06/2028","Fornecedor Exemplo","Entrada","3500,00","Pendente","","PIX","Exemplo","Outros"]],suppliers:[["Fornecedor","Categoria","Serviço Contratado","Pessoa de Contato","Telefone/WhatsApp","E-mail","Instagram/Site","Valor Contratado","Status","Data de Contratação","Contrato Assinado","Prioridade","Avaliação","Observações"],["Fornecedor Exemplo","Decoração","Flores e ambientação","Maria Silva","(11) 99999-9999","contato@exemplo.com","@fornecedorexemplo","12500,00","Em negociação","","Não","Alta","4","Linha de exemplo"]],guests:[["Nome","Grupo/Família","Lado","Tipo","Telefone","E-mail","Endereço","Status do Convite","Presença Confirmada","Acompanhantes","Restrições Alimentares","Observações","Mesa Atribuída","Presente Recebido"],["Convidado Exemplo","Família Exemplo","Ambos","Adulto","(11) 99999-9999","convidado@email.com","São Paulo - SP","Enviado","Não","1","Sem restrições","","",""]],rsvp:[["Nome","Grupo/Família","Status da Resposta","Acompanhantes","Restrições Alimentares","Observação da Resposta","Telefone","E-mail","Lado","Tipo"],["Convidado Exemplo","Família Exemplo","Confirmado","1","Sem restrições","Resposta recebida por WhatsApp","(11) 99999-9999","convidado@email.com","Ambos","Adulto"]]};const names={payments:"modelo_importacao_pagamentos.csv",suppliers:"modelo_importacao_fornecedores.csv",guests:"modelo_importacao_convidados.csv",rsvp:"modelo_importacao_rsvp.csv"},csv=templates[type].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\r\n");downloadBlob("\uFEFF"+csv,names[type],"text/csv;charset=utf-8")}
function exportCsv(rows,name){if(!rows.length){toast("Não há dados para exportar.");return}const headers=Object.keys(rows[0]),csv=[headers,...rows.map(row=>headers.map(key=>row[key]??""))].map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\r\n");downloadBlob("\uFEFF"+csv,name,"text/csv;charset=utf-8")}
function transferRows(view){
  const config=MODULE_TRANSFERS[view];if(!config)return[];
  const rows=state[config.collection].filter(config.filter||(()=>true)),fields=FORMS[config.entity].fields.filter(f=>f[2]!=="file");
  return rows.map(item=>Object.fromEntries(fields.map(([key,label,type])=>[label,type==="tags"?parseTags(item[key]).join(", "):type==="boolean"?(item[key]?"Sim":"Não"):type==="suppliers"?(supplier(item[key])?.name||""):item[key]??""])));
}
function downloadModuleTemplate(view){
  const config=MODULE_TRANSFERS[view];if(!config)return;
  const fields=FORMS[config.entity].fields.filter(f=>f[2]!=="file"),sample=Object.fromEntries(fields.map(([,label,type,required])=>[label,required?(type==="number"?"0":`Preencher ${label.toLowerCase()}`):""]));
  exportCsv([sample],`modelo-${normalize(config.title).replace(/\s+/g,"-")}.csv`);
}
function exportModule(view){const config=MODULE_TRANSFERS[view];if(config)exportCsv(transferRows(view),`${normalize(config.title).replace(/\s+/g,"-")}-${TODAY()}.csv`)}
function importValue(value,type){
  if(type==="number")return parseMoney(value);
  if(type==="boolean")return ["sim","true","1","pago","confirmado"].includes(normalize(value));
  if(type==="tags")return parseTags(value);
  if(type==="date")return parseDateValue(value);
  return String(value??"").trim();
}
function genericImportRows(view,rows){
  const config=MODULE_TRANSFERS[view],form=FORMS[config.entity],fields=form.fields.filter(f=>f[2]!=="file"),existing=state[config.collection],knownIds=new Set(existing.map(x=>x.id)),knownNatural=new Set(existing.filter(config.filter||(()=>true)).map(config.natural));
  let added=0,updated=0,ignored=0;
  for(const row of rows){
    const item={...(config.defaults||{})};
    for(const [key,label,type] of fields){
      const raw=Object.entries(row).find(([header])=>normalize(header).replace(/[^a-z0-9]/g,"")===normalize(label).replace(/[^a-z0-9]/g,"")||normalize(header)===normalize(key))?.[1];
      if(raw!==undefined&&raw!=="")item[key]=importValue(raw,type);
      if(type==="suppliers"&&item[key])item[key]=state.suppliers.find(s=>normalize(s.name)===normalize(item[key]))?.id||item[key];
    }
    const required=fields.filter(f=>f[3]).every(([key])=>item[key]!==undefined&&item[key]!=="");
    if(!required){ignored++;continue}
    const sourceId=String(row.id||row.ID||"").trim(),natural=config.natural(item);
    const index=sourceId?existing.findIndex(x=>x.id===sourceId):-1;
    if(index>=0){existing[index]={...existing[index],...item};updated++;continue}
    if(knownNatural.has(natural)){ignored++;continue}
    const id=sourceId&&!knownIds.has(sourceId)?sourceId:uid(config.entity[0]);existing.push({id,...item});knownIds.add(id);knownNatural.add(natural);added++;
  }
  save(`${added} registros importados, ${updated} atualizados e ${ignored} ignorados.`,config.title,"Importação");
}
function downloadBlob(content,name,type){const a=document.createElement("a"),blob=new Blob([content],{type});a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
function downloadBackup(){downloadBlob(JSON.stringify(state,null,2),`dashboard-casamento-backup-${TODAY()}.json`,"application/json")}
function mergeBackup(raw){
  const incoming=migrateState(structuredClone(raw)),arrayKeys=["suppliers","payments","guests","tasks","contracts","timeline","buffet","decor","gifts","plans","tables","history"];
  for(const key of arrayKeys){
    const current=state[key]||[],known=new Set(current.map(x=>x.id));
    state[key]=[...current,...incoming[key].filter(x=>!known.has(x.id))];
  }
  state.categories=[...new Set([...state.categories,...incoming.categories])];
  state.version=APP_VERSION;
}
function toast(text){const el=$("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1900)}

document.addEventListener("click",async event=>{
  const view=event.target.closest("[data-view]");if(view){setView(view.dataset.view);return}
  const close=event.target.closest("[data-close-dialog]");if(close){const dialog=document.getElementById(close.dataset.closeDialog);dialog.close();if(dialog.id==="contractPreviewDialog")$("#contractPreviewContent").innerHTML="";return}
  const moduleTemplate=event.target.closest("[data-module-template]");if(moduleTemplate){downloadModuleTemplate(moduleTemplate.dataset.moduleTemplate);return}
  const moduleExport=event.target.closest("[data-module-export]");if(moduleExport){exportModule(moduleExport.dataset.moduleExport);return}
  const moduleImport=event.target.closest("[data-module-import]");if(moduleImport){pendingModuleImport=moduleImport.dataset.moduleImport;$("#moduleImportFile").click();return}
  const openDocument=event.target.closest("[data-open-document]");if(openDocument){const contract=state.contracts.find(c=>c.id===openDocument.dataset.openDocument);if(!contract)return;const tab=window.open("about:blank","_blank");try{const url=contract.documentPath?await window.CloudStore.signedUrl(contract.documentPath):documentHref(contract.documentUrl);if(tab)tab.location.href=url;else window.location.href=url}catch(error){tab?.close();toast(error.message||"Não foi possível abrir o documento.")}return}
  const openDecor=event.target.closest("[data-open-decor]");if(openDecor){const item=state.decor.find(d=>d.id===openDecor.dataset.openDecor);if(!item)return;const tab=window.open("about:blank","_blank");try{const url=await storedFileUrl(item);if(tab)tab.location.href=url;else window.location.href=url}catch(error){tab?.close();toast(error.message||"Não foi possível abrir o anexo.")}return}
  const decorPreview=event.target.closest("[data-decor-preview]");if(decorPreview){await openDecorPreview(decorPreview.dataset.decorPreview);return}
  const contractPreview=event.target.closest("[data-contract-preview]");if(contractPreview){await openContractPreview(contractPreview.dataset.contractPreview);return}
  if(event.target.closest("#quickAdd")){$("#quickPopover").classList.toggle("open");return}
  const action=event.target.closest("[data-action]");if(action){const a=action.dataset.action,prefill={};if(action.dataset.supplier)prefill.supplierId=action.dataset.supplier;if(action.dataset.area)prefill.area=action.dataset.area;if(action.dataset.module)prefill.module=action.dataset.module;const map={"new-payment":"payment","new-supplier":"supplier","new-guest":"guest","new-task":"task","new-timeline":"timeline","new-contract":"contract","new-decor":"decor","new-gift":"gift","new-plan":"plan","new-table":"table"};if(map[a])openForm(map[a],"",prefill);if(a==="manage-categories"){renderCategories();$("#categoryDialog").showModal()}if(a==="import-payments"){pendingImportType="payments";$("#importFile").click()}if(a==="import-suppliers"){pendingImportType="suppliers";$("#importFile").click()}if(a==="import-guests"){pendingImportType="guests";$("#importFile").click()}if(a==="import-rsvp"){pendingImportType="rsvp";$("#importFile").click()}if(a==="download-template")downloadTemplate("payments");if(a==="supplier-template")downloadTemplate("suppliers");if(a==="guest-template")downloadTemplate("guests");if(a==="rsvp-template")downloadTemplate("rsvp");if(a==="print-current")window.print();if(a==="print-guests")printGuestList();if(a==="export-backup")downloadBackup();if(a==="export-summary-pdf"){if($("#exportDialog").open)$("#exportDialog").close();setView("reports");setTimeout(()=>window.print(),180)}if(a==="export-timeline-pdf"){if($("#exportDialog").open)$("#exportDialog").close();setView("timeline");setTimeout(()=>window.print(),180)}if(a==="merge-example"){mergeBackup(sampleData);$("#restoreDialog").close();save("Exemplo mesclado sem apagar seus registros.","Backup","Mesclagem")}if(a==="replace-example"&&confirm("Substituir todos os dados atuais pelo exemplo completo? Esta ação não pode ser desfeita.")){state=migrateState(structuredClone(sampleData));$("#restoreDialog").close();save("Exemplo completo restaurado.","Backup","Restauração")}if(a==="export-finance")exportCsv(state.payments.map(p=>({Vencimento:dateBR(p.dueDate),Fornecedor:supplier(p.supplierId)?.name||"",Categoria:p.category,Descrição:p.description,Valor:p.amount,Status:p.paid?"Pago":"Pendente","Data do pagamento":dateBR(p.paidDate),"Forma de pagamento":p.method,Responsável:p.owner,Comprovante:p.receipt,Observações:p.notes})),"financeiro-casamento.csv");if(a==="export-suppliers")exportCsv(state.suppliers.map(s=>({Fornecedor:s.name,Categoria:s.category,"Serviço Contratado":s.service,"Pessoa de Contato":s.contact,"Telefone/WhatsApp":s.phone,"E-mail":s.email,"Instagram/Site":s.website,"Valor Contratado":s.total,Status:s.status,"Data de Contratação":dateBR(s.hiredDate),"Contrato Assinado":s.contractSigned?"Sim":"Não",Prioridade:s.priority,Avaliação:s.rating,Observações:s.notes})),"fornecedores-casamento.csv");if(a==="export-guests")exportCsv(state.guests.map(g=>({Nome:g.name,"Grupo/Família":g.group,Lado:g.side,Tipo:g.type,Telefone:g.phone,"E-mail":g.email,Endereço:g.address,"Status do Convite":g.inviteStatus,"Presença Confirmada":g.confirmed?"Sim":"Não",Acompanhantes:g.companions,"Restrições Alimentares":g.diet,Observações:g.notes,"Mesa Atribuída":g.table,"Presente Recebido":g.gift})),"convidados-casamento.csv");if(a==="export-rsvp")exportCsv(state.guests.map(g=>({Nome:g.name,Grupo:g.group,Lado:g.side,Tipo:g.type,Telefone:g.phone,Email:g.email,Status:g.inviteStatus,Acompanhantes:g.companions,Restrições:g.diet,Mesa:g.table,Observações:g.notes})),"rsvp-final.csv");return}
  const contractToggle=event.target.closest("[data-contract-toggle]");if(contractToggle){const row=document.querySelector(`[data-contract-detail="${contractToggle.dataset.contractToggle}"]`);if(row){row.hidden=!row.hidden;contractToggle.textContent=row.hidden?"Detalhes":"Fechar"}return}
  const supplierToggle=event.target.closest("[data-supplier-toggle]");if(supplierToggle){const row=document.querySelector(`[data-supplier-detail="${supplierToggle.dataset.supplierToggle}"]`);if(row){row.hidden=!row.hidden;supplierToggle.textContent=row.hidden?"Ficha":"Fechar"}return}
  const viewMode=event.target.closest("[data-view-mode]");if(viewMode){state.settings.viewMode=viewMode.dataset.viewMode;save("Modo de visualização atualizado.","Central","Preferência");return}
  const edit=event.target.closest("[data-edit]");if(edit){const [type,id]=edit.dataset.edit.split(":");openForm(type,id);return}
  const del=event.target.closest("[data-delete]");if(del){const [type,id]=del.dataset.delete.split(":"),collection=COLLECTIONS[type];if(confirm("Excluir este registro?")){if(type==="supplier"&&state.payments.some(p=>p.supplierId===id)){toast("Fornecedor possui pagamentos e não pode ser excluído.");return}if(["contract","decor"].includes(type)){const record=state[collection].find(x=>x.id===id);if(record?.documentPath)try{await window.CloudStore.deleteDocument(record.documentPath)}catch(error){toast(`Não foi possível excluir o arquivo: ${error.message}`);return}}state[collection]=state[collection].filter(x=>x.id!==id);save("Registro excluído.")}return}
  const mark=event.target.closest("[data-mark-paid]");if(mark){const p=state.payments.find(x=>x.id===mark.dataset.markPaid);p.paid=true;p.paidDate=TODAY();save("Pagamento marcado como pago.");return}
  const rsvp=event.target.closest("[data-rsvp]");if(rsvp){const [id,value]=rsvp.dataset.rsvp.split(":"),g=state.guests.find(x=>x.id===id);g.inviteStatus=value;g.confirmed=value==="Confirmado";save("RSVP atualizado.");return}
  const toggle=event.target.closest("[data-task-toggle]");if(toggle){const t=state.tasks.find(x=>x.id===toggle.dataset.taskToggle);t.status=toggle.checked?"Concluída":"Pendente";save("Tarefa atualizada.");return}
  const pf=event.target.closest("[data-payment-filter]");if(pf){paymentFilter=pf.dataset.paymentFilter;render();return}
  const sm=event.target.closest("[data-supplier-mode]");if(sm){supplierMode=sm.dataset.supplierMode;render();return}
  const cm=event.target.closest("[data-contract-mode]");if(cm){contractMode=cm.dataset.contractMode;render();return}
  const dc=event.target.closest("[data-delete-category]");if(dc&&!dc.disabled){state.categories=state.categories.filter(x=>x!==dc.dataset.deleteCategory);save("Categoria removida.");renderCategories()}
});
document.addEventListener("input",event=>{
  if(event.target.id==="monthlyRange"){monthlyWindowStart=Number(event.target.value)||0;renderMonthlyChart()}
  if(["financeSearch","financeMonth","financeCategory","financeSupplier","financeMethod","financeTag"].includes(event.target.id)){const body=$("#financeRows");if(body)body.innerHTML=paymentTableRows(financeRows())}
  if(["supplierSearch","supplierCategory","supplierStatus","supplierContract","supplierMin","supplierTag"].includes(event.target.id)){const target=$("#supplierContent");if(target)target.innerHTML=supplierContent()}
  if(["guestSearch","guestSide","guestStatus","guestType","guestTag"].includes(event.target.id)){const target=$("#guestContent");if(target)target.innerHTML=guestTable()}
  if(["timelineOwner","timelineSupplier","timelineStatus"].includes(event.target.id)){const target=$("#timelineContent");if(target)target.innerHTML=timelineContent()}
});
document.addEventListener("change",event=>{
  if(event.target.id==="buffetBasis"){state.settings.buffetBasis=event.target.value;save("Base de cálculo do buffet atualizada.","Buffet","Preferência")}
  if(event.target.id==="buffetManual"){state.settings.buffetManualCount=Math.max(0,Number(event.target.value)||0);save("Quantidade manual do buffet atualizada.","Buffet","Preferência")}
  if(event.target.id==="contractSupplier"){contractSupplierFilter=event.target.value;const target=$("#contractContent");if(target)target.innerHTML=contractContent()}
  if(event.target.id==="contractType"){contractTypeFilter=event.target.value;const target=$("#contractContent");if(target)target.innerHTML=contractContent()}
});
document.addEventListener("mouseover",event=>{
  const target=event.target.closest?.("[data-chart-tip]");
  if(!target)return;
  const tooltip=$("#chartTooltip");
  if(target.dataset.tipKind==="monthly"){
    tooltip.classList.add("monthly-tooltip");
    tooltip.innerHTML=`<strong>${esc(target.dataset.tipLabel)}</strong><span><i style="background:#c7a75b"></i><b>Previsto</b><em>${esc(target.dataset.tipPlanned)}</em></span><span><i style="background:#52634b"></i><b>Pago</b><em>${esc(target.dataset.tipPaid)}</em></span>`;
  }else{
    tooltip.classList.remove("monthly-tooltip");
    tooltip.textContent=target.dataset.chartTip;
  }
  tooltip.classList.add("show");
});
document.addEventListener("mousemove",event=>{
  const tooltip=$("#chartTooltip");
  if(!tooltip.classList.contains("show"))return;
  const width=tooltip.offsetWidth||170,left=Math.min(window.innerWidth-width/2-10,Math.max(width/2+10,event.clientX)),above=event.clientY>tooltip.offsetHeight+24;
  tooltip.style.left=`${left}px`;
  tooltip.style.top=`${above?event.clientY-12:event.clientY+12}px`;
  tooltip.classList.toggle("below",!above);
});
document.addEventListener("mouseout",event=>{
  if(!event.target.closest?.("[data-chart-tip]"))return;
  $("#chartTooltip").classList.remove("show");
});
document.addEventListener("click",event=>{
  const step=event.target.closest("[data-month-step]");if(!step)return;
  const maxStart=Math.max(0,monthData().length-MONTHLY_WINDOW);
  monthlyWindowStart=Math.min(maxStart,Math.max(0,monthlyWindowStart+Number(step.dataset.monthStep)));
  renderMonthlyChart();
});
$("#entityForm").addEventListener("submit",async event=>{event.preventDefault();try{await submitEntity(event.currentTarget)}catch(error){toast(error.message||"Não foi possível salvar o registro.")}});
$("#categoryForm").addEventListener("submit",event=>{event.preventDefault();const value=event.currentTarget.elements.category.value.trim();if(!value)return;if(state.categories.some(x=>normalize(x)===normalize(value))){toast("Categoria já existe.");return}state.categories.push(value);event.currentTarget.reset();save("Categoria adicionada.");renderCategories()});
$("#confirmImport").addEventListener("click",commitImport);
$("#importFile").addEventListener("change",async event=>{const file=event.target.files[0];event.target.value="";if(!file)return;try{toast("Lendo arquivo...");showImport(await readImport(file))}catch(error){toast(error.message)}});
$("#moduleImportFile").addEventListener("change",async event=>{const file=event.target.files[0];event.target.value="";if(!file||!pendingModuleImport)return;try{const rows=file.name.toLowerCase().endsWith(".json")?JSON.parse(await file.text()):await readImport(file);if(!Array.isArray(rows))throw new Error("O arquivo precisa conter uma tabela de registros.");if(confirm(`Importar ${rows.length} linhas para ${MODULE_TRANSFERS[pendingModuleImport].title}? Registros existentes serão preservados.`))genericImportRows(pendingModuleImport,rows)}catch(error){toast(error.message||"Não foi possível importar o arquivo.")}});
$("#globalSearch").addEventListener("keydown",event=>{if(event.key!=="Enter")return;const q=normalize(event.target.value);if(!q)return;const results=[
  ...state.suppliers.map(x=>({type:"Fornecedor",title:x.name,detail:`${x.service} ${x.category} ${x.status} ${(x.tags||[]).join(" ")}`,view:"suppliers"})),
  ...state.guests.map(x=>({type:"Convidado",title:x.name,detail:`${x.group} ${x.inviteStatus} ${x.table||""} ${(x.tags||[]).join(" ")}`,view:"guests"})),
  ...state.tasks.map(x=>({type:"Tarefa",title:x.title,detail:`${x.owner} ${x.status} ${(x.tags||[]).join(" ")}`,view:"checklist"})),
  ...state.contracts.map(x=>({type:"Documento",title:x.name,detail:`${x.status} ${x.type} ${(x.tags||[]).join(" ")}`,view:"contracts"})),
  ...state.payments.map(x=>({type:"Pagamento",title:supplier(x.supplierId)?.name||x.description,detail:`${x.description} ${x.category} ${x.paid?"Pago":"Pendente"} ${money(x.amount)} ${(x.tags||[]).join(" ")}`,view:"finance"})),
  ...state.timeline.map(x=>({type:"Cronograma",title:x.activity,detail:`${x.location} ${x.owner} ${x.status} ${(x.tags||[]).join(" ")}`,view:"timeline"})),
  ...state.decor.map(x=>({type:"Decoração",title:x.item,detail:`${x.area} ${x.palette} ${x.style} ${(x.tags||[]).join(" ")}`,view:"decor"})),
  ...state.gifts.map(x=>({type:"Presente",title:x.name,detail:`${x.guest} ${x.received?"Recebido":"Pendente"}`,view:"gifts"})),
  ...state.tables.map(x=>({type:"Mesa",title:x.name,detail:`${x.location} ${x.notes||""} ${(x.tags||[]).join(" ")}`,view:"tables"}))
].filter(x=>normalize(`${x.title} ${x.detail}`).includes(q)).slice(0,80);$("#searchResults").innerHTML=results.map(x=>`<button class="search-result" data-view="${x.view}"><span class="search-result-type">${x.type}</span><div><strong>${esc(x.title)}</strong><p>${esc(x.detail)}</p></div><span>→</span></button>`).join("")||empty("Nenhum resultado","Tente outro termo.");$("#searchDialog").showModal()});
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#sidebarToggle").addEventListener("click",()=>{state.settings.sidebarCollapsed=!state.settings.sidebarCollapsed;save(state.settings.sidebarCollapsed?"Barra lateral ocultada.":"Barra lateral exibida.")});
$("#themeToggle").addEventListener("click",()=>{state.settings.theme=state.settings.theme==="dark"?"light":"dark";save(`Tema ${state.settings.theme==="dark"?"escuro":"claro"} ativado.`,"Central","Preferência")});
$("#exportAll").addEventListener("click",()=>$("#exportDialog").showModal());
$("#importBackup").addEventListener("click",()=>$("#backupFile").click());
$("#backupFile").addEventListener("change",async event=>{
  const file=event.target.files[0];event.target.value="";if(!file)return;
  try{
    const raw=JSON.parse(await file.text());
    if(!raw||typeof raw!=="object"||!Array.isArray(raw.suppliers)||!Array.isArray(raw.payments))throw new Error("Arquivo incompatível com o Dashboard Central de Casamento.");
    if(confirm("Mesclar este backup com os dados atuais?\n\nOK: mesclar sem apagar registros atuais.\nCancelar: escolher uma substituição completa.")){
      mergeBackup(raw);save("Backup mesclado com sucesso.","Backup","Importação");
    }else if(confirm("Substituir completamente os dados atuais pelos dados deste backup? Esta ação não pode ser desfeita.")){
      state=migrateState(raw);save("Backup restaurado com sucesso.","Backup","Restauração");
    }
  }catch(error){toast(error.message||"Não foi possível importar o backup.")}
});
$("#restoreExample").addEventListener("click",()=>$("#restoreDialog").showModal());
document.addEventListener("click",event=>{if(event.target.closest("#reportImportBackup"))$("#backupFile").click()});

function updateAccount(session){
  const button=$("#accountButton"),label=$("#accountLabel");
  button.classList.toggle("online",Boolean(session));
  label.textContent=session?"Online compartilhado":"Conectando...";
}
async function initializeCloud(){
  if(!window.CloudStore?.configured){updateAccount(null);return}
  try{
    const session=await window.CloudStore.ensureSession();updateAccount(session);
    const remote=await window.CloudStore.load();
    if(remote){mergeBackup(remote);localStorage.setItem(STORAGE_KEY,JSON.stringify(state));render()}
    await window.CloudStore.save(state);
    window.CloudStore.subscribe(remoteState=>{if(!remoteState)return;state=migrateState(remoteState);localStorage.setItem(STORAGE_KEY,JSON.stringify(state));render()});
  }catch(error){toast(`Nuvem indisponível: ${error.message}`)}
}
$("#authForm").addEventListener("submit",async event=>{event.preventDefault();const data=new FormData(event.currentTarget),message=$("#authMessage");try{message.hidden=true;await window.CloudStore.signIn(data.get("email"),data.get("password"));$("#authDialog").close();event.currentTarget.reset();toast("Login realizado. Sincronizando dados...")}catch(error){message.textContent=error.message;message.hidden=false}});
$("#signUpButton").addEventListener("click",async()=>{const form=$("#authForm"),data=new FormData(form),message=$("#authMessage");try{if(!data.get("email")||!data.get("password"))throw new Error("Informe e-mail e senha para criar a conta.");await window.CloudStore.signUp(data.get("email"),data.get("password"));message.textContent="Conta criada. Verifique seu e-mail para confirmar o acesso.";message.hidden=false}catch(error){message.textContent=error.message;message.hidden=false}});

render();
initializeCloud();
