const PASSWORD_HASH = "483029d526219f816e8e8f6a9de07b422633dba180ffc26faac22862a017519f";

const fixedMeals = {
  breakfast: { name: "Πρωινό", time: "09:00", choices: [
    "Τοστ: 1 τοστ ολικής με κασέρι και γαλοπούλα.",
    "Τορτίγια: 1 τορτίγια με αυγό, κασέρι και ντομάτα.",
    "Κουλούρι: 1 κουλούρι με κασέρι.",
    "Γιαούρτι: 1 κεσεδάκι γιαούρτι με 2 κ.σ. γκρανόλα ή βρώμη, ½ φρούτο και 1 κ.γ. τσία.",
    "Γάλα με γκρανόλα: 1 κούπα γάλα με 5 κ.σ. γκρανόλα."
  ]},
  snack: { name: "Δεκατιανό", time: "12:00", choices: [
    "1 ποτήρι κεφίρ, 330 ml, και 2 κριτσίνια.",
    "1 φρούτο και 1 χούφτα ξηρούς καρπούς.",
    "1 γιαούρτι με 1 φρούτο."
  ]},
  afternoon: { name: "Απογευματινό", time: "18:00", choices: [
    "1 μπάρα δημητριακών, 50 γρ.",
    "1 φρούτο και 1 χούφτα ξηρούς καρπούς.",
    "1 γιαούρτι 2% και 1 φρούτο.",
    "1 φρούτο και 1 ποτήρι κεφίρ."
  ]}
};

const programs = {
  1: [
    {day:"Παρασκευή",l:["Αρακάς με καλαμπόκι: 1 μερίδα, 1½ κουτάλα.\nΤυρί: 2 σπιρτόκουτα.\n10 ελιές."],d:["2 κοτοσουβλάκια.\nΣαλάτα εποχής."]},
    {day:"Σάββατο",l:["Ψάρι ψητό: 1 μερίδα, 500 γρ. ωμό.\nΣαλάτα εποχής.\n4–5 πατάτες φούρνου, κυδωνάτες."],d:["Γιαούρτι 2% + 1 κ.σ. βρώμη + 1 κ.γ. μέλι.","Αυγόπιτα, ποσότητα ίση με 2 παλάμες."]},
    {day:"Κυριακή",l:["Μπιφτέκια: 1 μερίδα, 3 τεμάχια.\nΣαλάτα εποχής.\nΤυρί: 2 σπιρτόκουτα."],d:["2 βραστά αυγά + 2 χαρουποδακάκια + 1 φέτα κασέρι.","Αυγόπιτα, ποσότητα ίση με 2 παλάμες."]},
    {day:"Δευτέρα",l:["Ντονέρ ψητό: 200 γρ.\nΓιαούρτι 2%.\nΣαλάτα εποχής.\n2 χαρουποδακάκια."],d:["2 κοτοσουβλάκια.\nΣαλάτα εποχής."]},
    {day:"Τρίτη",l:["Κοτόπουλο ψητό: 1 μερίδα.\nΣαλάτα εποχής.\nΤυρί: 2 σπιρτόκουτα."],d:["3 χαρουποδακάκια.\nΤυρί: 2 σπιρτόκουτα.\nΣαλάτα εποχής."]},
    {day:"Τετάρτη",l:["Φασολάκια: 1 μερίδα, 2 κουτάλες.\nΤυρί: 2 σπιρτόκουτα.\n1 φέτα ψωμί ολικής."],d:["Ομελέτα με 2 αυγά.\nΤυρί: 2 σπιρτόκουτα."]},
    {day:"Πέμπτη",l:["Χοιρινή μπριζόλα ψητή: 1 μερίδα.\nΣαλάτα εποχής.\nΤυρί: 2 σπιρτόκουτα."],d:["2 τοστ ολικής με κασέρι και γαλοπούλα.","Αυγόπιτα, ποσότητα ίση με 2 παλάμες."]},
    {day:"Παρασκευή",l:["Fried rice: 1 μερίδα, 1½ κουτάλα.\n3 αυγά.\nΛαχανικά."],d:["2 κοτοσουβλάκια.\nΣαλάτα εποχής."]},
    {day:"Σάββατο",l:["Βραστό: 1 μερίδα, 1 βαθύ πιάτο.\nΨωμί ολικής.\nΤυρί: 2 σπιρτόκουτα."],d:["2 τοστ ολικής με κασέρι και γαλοπούλα.","Αυγόπιτα, ποσότητα ίση με 2 παλάμες."]},
    {day:"Κυριακή",l:["Μοσχάρι κοκκινιστό: 1 μερίδα, περίπου ½ παλάμη.\nΠλιγούρι: 1 φλιτζάνι τσαγιού.\nΣαλάτα εποχής.\nΤυρί: 1 σπιρτόκουτο."],d:["2 βραστά αυγά.\n2 χαρουποδακάκια.\n1 φέτα κασέρι."]}
  ],
  2: [
    {day:"Δευτέρα",l:["Μακαρόνια: 1 βαθύ πιάτο.\nΣάλτσα κιμά: 5 κ.σ.\nΣαλάτα εποχής.\nΤυρί: 2 σπιρτόκουτα."],d:["1 φέτα ψωμί ολικής.\n2 βραστά αυγά.\n1 φέτα κασέρι."]},
    {day:"Τρίτη",l:["Κριθαρότο θαλασσινών: 1 μερίδα, 2 κουτάλες.","2 πίτες χωρίς λάδι με γύρο, απ’ όλα.","1 burger με πατάτες και σαλάτα."],d:["1 τοστ ολικής με κασέρι και γαλοπούλα."]},
    {day:"Τετάρτη",l:["Σπανακόρυζο: 2 κουτάλες.\n1 φέτα ψωμί ολικής.\nΤυρί: 2 σπιρτόκουτα.","Λαχανοντολμάδες: 4.\nΤυρί: 2 σπιρτόκουτα.\nΣαλάτα εποχής.","Γεμιστά: 4.\nΤυρί: 2 σπιρτόκουτα.\nΣαλάτα εποχής.","Κολοκυθάκια γεμιστά: 2.\nΤυρί: 2 σπιρτόκουτα.\nΣαλάτα εποχής."],d:["2 κοτοσουβλάκια.\nΣαλάτα εποχής."]},
    {day:"Πέμπτη",l:["Ομελέτα λαχανικών με 4 αυγά.\nΤυρί: 2 σπιρτόκουτα.\nΣαλάτα εποχής.\n1 φέτα κασέρι."],d:["Ψωμάκι με γύρο, ντομάτα και αλοιφή.","2 σπιτικές γλυκές κρέπες."]},
    {day:"Παρασκευή",l:["Όσπρια: 1 βαθύ πιάτο.\nΤυρί: 2 σπιρτόκουτα.\n1 φέτα ψωμί ολικής."],d:["2 τοστ ολικής με κασέρι και γαλοπούλα.","1½ μέτρια βραστή πατάτα + 1 αυγό + τυρί 2 σπιρτόκουτα + λαχανικά."]},
    {day:"Σάββατο",l:["Κοτόπουλο ψητό: 1 μερίδα.\nΣαλάτα εποχής.\nΤυρί: 2 σπιρτόκουτα.","Κοτόσουπα: 1 βαθύ πιάτο.\nΨωμί ολικής.\nΤυρί: 2 σπιρτόκουτα."],d:["½ μερίδα κοτόπουλο.\nΣαλάτα εποχής.","2 τοστ ολικής με κασέρι."]},
    {day:"Κυριακή",l:["Μοσχάρι κοκκινιστό: περίπου ½ παλάμη.\nΠλιγούρι: 1 φλιτζάνι τσαγιού.\nΣαλάτα εποχής.","Μοσχάρι με λάχανο: 2 κουτάλες.\nΨωμί ολικής.\nΤυρί: 2 σπιρτόκουτα."],d:["Σαλάτα εποχής + 1 μεγάλη μερίδα τόνο.","1 τοστ ολικής με κασέρι."]},
    {day:"Δευτέρα",l:["Αρακάς: 2 κουτάλες.\nΤυρί: 2 σπιρτόκουτα.\n1 φέτα ψωμί ολικής."],d:["4 κομμάτια πίτσα."]}
  ]
};

const fruits = [
  ["Μήλο","1 μέτριο"],["Πορτοκάλι","1 μέτριο"],["Αχλάδι","1 μέτριο"],["Ροδάκινο ή νεκταρίνι","1 μικρό"],
  ["Μανταρίνια","2 μικρά"],["Μπανάνα","1 μικρή ή ½ μεγάλη"],["Σταφύλια","15 ρώγες"],["Πεπόνι","1 φέτα, περίπου 150 γρ."],
  ["Καρπούζι","1 φέτα, περίπου 200 γρ."],["Ακτινίδιο","1 μεγάλο ή 2 μικρά"],["Φράουλες","1 φλιτζάνι"],["Κεράσια","1 φλιτζάνι"],
  ["Μύρτιλα","½ φλιτζάνι"],["Βατόμουρα","½ φλιτζάνι"],["Ανανάς","1 φλιτζάνι, κομμένος"],["Μάνγκο","1 μικρό κομμάτι, περίπου 100 γρ."],["Ρόδι","½ φλιτζάνι"]
];
const dried = [["Σταφίδες","2 κ.σ."],["Αποξηραμένα δαμάσκηνα","3"],["Αποξηραμένα σύκα","2"],["Αποξηραμένα βερίκοκα","4"]];

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let selections = load("dietChoices", {});
let datePlans = load("dietDatePlans", {});
let plannerDate = localDateKey();
const mealPairs = Object.entries(programs).flatMap(([program,days])=>days.map((day,index)=>({id:`p${program}d${index}`,program,index,lunch:day.l,dinner:day.d})));

function load(key, fallback){ try{return JSON.parse(localStorage.getItem(key)) || fallback}catch{return fallback} }
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
async function hash(text){const data=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));return [...new Uint8Array(data)].map(v=>v.toString(16).padStart(2,"0")).join("")}

function unlock(){ sessionStorage.setItem("familyDietAccess","yes"); $("#gate").hidden=true; $("#app").hidden=false; renderAll(); }
$("#gate-form").addEventListener("submit",async e=>{e.preventDefault(); if(await hash($("#password").value)===PASSWORD_HASH){unlock()}else{$("#gate-error").textContent="The password is incorrect.";$("#password").select()}});
$("#lock-button").addEventListener("click",()=>{sessionStorage.removeItem("familyDietAccess");location.reload()});

function openTab(name){
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  $$(".panel").forEach(p=>{const show=p.id===`${name}-panel`;p.hidden=!show;p.classList.toggle("active",show)});
  if(name==="today")renderToday();
  scrollTo({top:0,behavior:"smooth"});
}
$$('.tab').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.tab)));
$$('[data-open-tab]').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.openTab)));

function localDateKey(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");return `${y}-${m}-${d}`}
function pairById(id){return mealPairs.find(pair=>pair.id===id)}
function optionMarkup(choices,key){
  return `<div class="options">${choices.map((text,i)=>`<button class="option ${selections[key]===i?'selected':''}" data-choice-key="${key}" data-choice="${i}" type="button"><span class="option-number">OPTION ${i+1}</span><span class="option-text">${escapeHtml(text)}</span></button>`).join("")}</div>`;
}
function renderToday(){
  const now=new Date(), dateKey=localDateKey(now), plan=datePlans[dateKey], pair=plan&&pairById(plan.pairId);
  $("#today-weekday").textContent=now.toLocaleDateString("en-GB",{weekday:"long"});
  $("#today-date").textContent=now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  $("#setup-note").hidden=Boolean(pair);
  const lunch=pair?pair.lunch[plan.lunchIndex||0]:"No lunch selected yet.";
  const dinner=pair?pair.dinner[plan.dinnerIndex||0]:"No dinner selected yet.";
  const meals=[fixedMeals.breakfast,fixedMeals.snack,{name:"Μεσημεριανό",time:"15:00",chosen:lunch},fixedMeals.afternoon,{name:"Βραδινό",time:"21:00",chosen:dinner}];
  const minutes=now.getHours()*60+now.getMinutes(), next=meals.findIndex(m=>{const [h,min]=m.time.split(':').map(Number);return h*60+min>minutes});
  $("#today-meals").innerHTML=meals.map((meal,i)=>{
    const key=`${dateKey}-${meal.name}`;
    const linked=meal.name==="Μεσημεριανό"||meal.name==="Βραδινό";
    const body=linked?`<div class="chosen-meal ${pair?'':'empty-choice'}">${escapeHtml(meal.chosen)}</div>`:optionMarkup(meal.choices,key);
    return `<article class="meal-card ${i===next?'next':''} ${linked?'linked-meal':''}"><div class="meal-time">${meal.time}${i===next?'<span class="next-label">NEXT MEAL</span>':''}</div><div class="meal-content"><div class="meal-title-row"><h3>${meal.name}</h3>${linked?'<span class="linked-label">LINKED DAILY PLAN</span>':''}</div>${body}</div></article>`;
  }).join("");
  $$('[data-choice-key]').forEach(b=>b.addEventListener('click',()=>{selections[b.dataset.choiceKey]=Number(b.dataset.choice);save("dietChoices",selections);renderToday()}));
}

function renderProgram(){
  const plan=datePlans[plannerDate], pair=plan&&pairById(plan.pairId);
  $("#meal-date").value=plannerDate;
  $("#lunch-picker").innerHTML='<option value="">Choose any lunch…</option>'+mealPairs.flatMap(p=>p.lunch.map((meal,i)=>`<option value="${p.id}|${i}">${escapeHtml(meal.replace(/\n/g," · "))}</option>`)).join("");
  $("#dinner-picker").innerHTML='<option value="">Choose any dinner…</option>'+mealPairs.flatMap(p=>p.dinner.map((meal,i)=>`<option value="${p.id}|${i}">${escapeHtml(meal.replace(/\n/g," · "))}</option>`)).join("");
  if(pair){
    $("#lunch-picker").value=`${pair.id}|${plan.lunchIndex||0}`;
    $("#dinner-picker").value=`${pair.id}|${plan.dinnerIndex||0}`;
    $("#linked-selection").innerHTML=`<div class="pair-heading"><span>LINKED MEAL PAIR</span><strong>${formatPlannerDate(plannerDate)}</strong></div><div class="linked-pair-grid"><section><h3>Μεσημεριανό</h3>${pair.lunch.map((meal,i)=>choiceButton("lunch",meal,i,(plan.lunchIndex||0)===i)).join("")}</section><div class="pair-line">↔</div><section><h3>Βραδινό</h3>${pair.dinner.map((meal,i)=>choiceButton("dinner",meal,i,(plan.dinnerIndex||0)===i)).join("")}</section></div>`;
  }else{
    $("#lunch-picker").value=""; $("#dinner-picker").value="";
    $("#linked-selection").innerHTML='<div class="planner-empty">Choose either a lunch or a dinner. Its linked meal will appear here automatically.</div>';
  }
  $("#clear-plan").hidden=!pair;
  $("#saved-date-list").innerHTML=Object.keys(datePlans).sort().map(date=>`<button type="button" data-saved-date="${date}"><span>${formatPlannerDate(date)}</span><b>View pair →</b></button>`).join("")||'<p class="planner-empty">No dates saved yet.</p>';
  $$('[data-pair-side]').forEach(button=>button.addEventListener('click',()=>{datePlans[plannerDate][`${button.dataset.pairSide}Index`]=Number(button.dataset.pairIndex);save("dietDatePlans",datePlans);renderProgram();renderToday()}));
  $$('[data-saved-date]').forEach(button=>button.addEventListener('click',()=>{plannerDate=button.dataset.savedDate;renderProgram()}));
}
function choiceButton(side,meal,index,selected){return `<button class="linked-choice ${selected?'selected':''}" type="button" data-pair-side="${side}" data-pair-index="${index}"><span>OPTION ${index+1}</span>${escapeHtml(meal)}</button>`}
function formatPlannerDate(value){const [year,month,day]=value.split("-").map(Number);return new Date(year,month-1,day).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
function choosePair(side,value){
  if(!value)return;
  const [pairId,indexText]=value.split("|"), existing=datePlans[plannerDate], samePair=existing&&existing.pairId===pairId;
  datePlans[plannerDate]={pairId,lunchIndex:samePair?existing.lunchIndex||0:0,dinnerIndex:samePair?existing.dinnerIndex||0:0};
  datePlans[plannerDate][`${side}Index`]=Number(indexText);
  save("dietDatePlans",datePlans);renderProgram();renderToday();
}
function renderFixed(){
  $("#fixed-choices").innerHTML=Object.values(fixedMeals).map(meal=>`<section class="choice-section"><header><p class="eyebrow">${meal.time}</p><h3>${meal.name}</h3></header><ol>${meal.choices.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></section>`).join('')+`<section class="choice-section"><header><p class="eyebrow">EVERY DAY</p><h3>Καφές</h3></header><ol><li>Μέχρι 2 καφέδες την ημέρα.</li></ol></section>`;
}
function fruitGrid(items){return `<div class="fruit-grid">${items.map(([name,amount])=>`<div class="fruit"><b>${name}</b><span>${amount}</span></div>`).join('')}</div>`}
function renderPortions(){
  $("#portions-content").innerHTML=`<div class="portion-layout"><section class="portion-card"><h3>Fresh fruit</h3>${fruitGrid(fruits)}<p>When breakfast lists ½ fruit, use half of the stated portion. One fruit portion contains approximately 15 g of carbohydrates.</p></section><div><section class="portion-card"><h3>Dried fruit</h3>${fruitGrid(dried)}</section><section class="portion-card" style="margin-top:18px"><h3>Measurements</h3><div class="measure-list"><div class="measure"><b>Σπιρτόκουτο</b>A piece of cheese approximately the size of a matchbox.</div><div class="measure"><b>Παλάμη</b>The palm-sized measurement given in the original meal plan.</div><div class="measure"><b>κ.σ.</b>Tablespoon.</div><div class="measure"><b>κ.γ.</b>Teaspoon.</div></div></section></div></div>`;
}
function renderAll(){
  renderToday();renderProgram();renderFixed();renderPortions();
}
$("#meal-date").addEventListener("change",e=>{plannerDate=e.target.value||localDateKey();renderProgram()});
$("#lunch-picker").addEventListener("change",e=>choosePair("lunch",e.target.value));
$("#dinner-picker").addEventListener("change",e=>choosePair("dinner",e.target.value));
$("#clear-plan").addEventListener("click",()=>{delete datePlans[plannerDate];save("dietDatePlans",datePlans);renderProgram();renderToday()});

const previewTab=new URLSearchParams(location.search).get("preview");
if(sessionStorage.getItem("familyDietAccess")==="yes" || (location.protocol==="file:" && previewTab)){
  if(location.protocol==="file:" && previewTab==="pair")datePlans[plannerDate]={pairId:"p1d1",lunchIndex:0,dinnerIndex:1};
  unlock();
  if(previewTab==="program"||previewTab==="pair")openTab("program");
}
