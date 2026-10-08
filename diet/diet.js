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
let settings = load("dietSettings", {activeProgram:"1",start1:"",start2:""});
let selections = load("dietChoices", {});
let viewedProgram = "1";

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
function cycleDay(program){
  const start=settings[`start${program}`];
  if(!start)return 0;
  const [y,m,d]=start.split("-").map(Number), startDate=new Date(y,m-1,d), today=new Date();
  today.setHours(0,0,0,0); startDate.setHours(0,0,0,0);
  const delta=Math.floor((today-startDate)/86400000), length=programs[program].length;
  return ((delta%length)+length)%length;
}
function optionMarkup(choices,key){
  return `<div class="options">${choices.map((text,i)=>`<button class="option ${selections[key]===i?'selected':''}" data-choice-key="${key}" data-choice="${i}" type="button"><span class="option-number">OPTION ${i+1}</span><span class="option-text">${escapeHtml(text)}</span></button>`).join("")}</div>`;
}
function renderToday(){
  const now=new Date(), program=settings.activeProgram||"1", index=cycleDay(program), day=programs[program][index], dateKey=localDateKey(now);
  $("#today-weekday").textContent=now.toLocaleDateString("en-GB",{weekday:"long"});
  $("#today-date").textContent=now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  $("#today-cycle").textContent=`Plan ${program} · Day ${index+1}`;
  $("#setup-note").hidden=Boolean(settings[`start${program}`]);
  const meals=[fixedMeals.breakfast,fixedMeals.snack,{name:"Μεσημεριανό",time:"15:00",choices:day.l},fixedMeals.afternoon,{name:"Βραδινό",time:"21:00",choices:day.d}];
  const minutes=now.getHours()*60+now.getMinutes(), next=meals.findIndex(m=>{const [h,min]=m.time.split(':').map(Number);return h*60+min>minutes});
  $("#today-meals").innerHTML=meals.map((meal,i)=>{
    const key=`${dateKey}-${meal.name}`;
    const linked=meal.name==="Μεσημεριανό"||meal.name==="Βραδινό";
    return `<article class="meal-card ${i===next?'next':''} ${linked?'linked-meal':''}"><div class="meal-time">${meal.time}${i===next?'<span class="next-label">NEXT MEAL</span>':''}</div><div class="meal-content"><div class="meal-title-row"><h3>${meal.name}</h3>${linked?'<span class="linked-label">LINKED DAILY PLAN</span>':''}</div>${optionMarkup(meal.choices,key)}</div></article>`;
  }).join("");
  $$('[data-choice-key]').forEach(b=>b.addEventListener('click',()=>{selections[b.dataset.choiceKey]=Number(b.dataset.choice);save("dietChoices",selections);renderToday()}));
}

function renderProgram(){
  const list=programs[viewedProgram];
  const weekdays={"Δευτέρα":"Monday","Τρίτη":"Tuesday","Τετάρτη":"Wednesday","Πέμπτη":"Thursday","Παρασκευή":"Friday","Σάββατο":"Saturday","Κυριακή":"Sunday"};
  $("#program-days").innerHTML=list.map((day,i)=>`<article class="day-card"><header class="day-head"><span class="day-number">${i+1}</span><div><span class="paired-caption">LINKED LUNCH &amp; DINNER</span><h3>${weekdays[day.day]||day.day}</h3></div></header><div class="day-meals"><div class="day-meal"><h4>Main meal · Μεσημεριανό · 15:00</h4>${day.l.map((x,j)=>`<p>${day.l.length>1?`<b>Option ${j+1}</b><br>`:''}${escapeHtml(x)}</p>`).join('')}</div><div class="day-meal"><h4>Dinner · Βραδινό · 21:00</h4>${day.d.map((x,j)=>`<p>${day.d.length>1?`<b>Option ${j+1}</b><br>`:''}${escapeHtml(x)}</p>`).join('')}</div></div></article>`).join('');
  $$('[data-program]').forEach(b=>b.classList.toggle('active',b.dataset.program===viewedProgram));
}
function renderFixed(){
  $("#fixed-choices").innerHTML=Object.values(fixedMeals).map(meal=>`<section class="choice-section"><header><p class="eyebrow">${meal.time}</p><h3>${meal.name}</h3></header><ol>${meal.choices.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol></section>`).join('')+`<section class="choice-section"><header><p class="eyebrow">EVERY DAY</p><h3>Καφές</h3></header><ol><li>Μέχρι 2 καφέδες την ημέρα.</li></ol></section>`;
}
function fruitGrid(items){return `<div class="fruit-grid">${items.map(([name,amount])=>`<div class="fruit"><b>${name}</b><span>${amount}</span></div>`).join('')}</div>`}
function renderPortions(){
  $("#portions-content").innerHTML=`<div class="portion-layout"><section class="portion-card"><h3>Fresh fruit</h3>${fruitGrid(fruits)}<p>When breakfast lists ½ fruit, use half of the stated portion. One fruit portion contains approximately 15 g of carbohydrates.</p></section><div><section class="portion-card"><h3>Dried fruit</h3>${fruitGrid(dried)}</section><section class="portion-card" style="margin-top:18px"><h3>Measurements</h3><div class="measure-list"><div class="measure"><b>Σπιρτόκουτο</b>A piece of cheese approximately the size of a matchbox.</div><div class="measure"><b>Παλάμη</b>The palm-sized measurement given in the original meal plan.</div><div class="measure"><b>κ.σ.</b>Tablespoon.</div><div class="measure"><b>κ.γ.</b>Teaspoon.</div></div></section></div></div>`;
}
function renderAll(){
  $("#active-program").value=settings.activeProgram; $("#start-1").value=settings.start1; $("#start-2").value=settings.start2;
  renderToday();renderProgram();renderFixed();renderPortions();
}
$("#active-program").addEventListener("change",e=>{settings.activeProgram=e.target.value;save("dietSettings",settings);renderToday()});
[$("#start-1"),$("#start-2")].forEach((input,i)=>input.addEventListener("change",e=>{settings[`start${i+1}`]=e.target.value;save("dietSettings",settings);renderToday()}));
$$('[data-program]').forEach(b=>b.addEventListener('click',()=>{viewedProgram=b.dataset.program;renderProgram()}));

if(sessionStorage.getItem("familyDietAccess")==="yes" || (location.protocol==="file:" && new URLSearchParams(location.search).has("preview")))unlock();
