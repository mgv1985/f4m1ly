const PASSWORD_HASH = "483029d526219f816e8e8f6a9de07b422633dba180ffc26faac22862a017519f";
const SUPABASE_URL = "https://owceeowarwqjsxpylnoo.supabase.co";
const SUPABASE_KEY = "sb_publishable_DxH30XOgchm8PifrXNKn-w_9fRNFoQg";
const cloudHeaders = {apikey:SUPABASE_KEY,Authorization:`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"};
let dietPassword = "";

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
let drafts = load("dietDraftChoices", {});
let history = load("dietHistory", {});
const mealPairs = Object.values(programs).flat();
const linkedOptions = mealPairs.flatMap(pair=>pair.l.flatMap(lunch=>pair.d.map(dinner=>({lunch,dinner}))));

function load(key, fallback){ try{return JSON.parse(localStorage.getItem(key)) || fallback}catch{return fallback} }
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
async function hash(text){const data=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));return [...new Uint8Array(data)].map(v=>v.toString(16).padStart(2,"0")).join("")}
async function cloudRpc(name,body){const response=await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`,{method:"POST",headers:cloudHeaders,body:JSON.stringify(body)});if(!response.ok)throw Error("Cloud history is not ready.");return response.json()}

function unlock(password){dietPassword=password;sessionStorage.setItem("familyDietAccess","yes");sessionStorage.setItem("familyDietPassword",password);$("#gate").hidden=true;$("#app").hidden=false;renderAll();loadCloudHistory();}
$("#gate-form").addEventListener("submit",async e=>{e.preventDefault(); if(await hash($("#password").value)===PASSWORD_HASH){unlock($("#password").value)}else{$("#gate-error").textContent="The password is incorrect.";$("#password").select()}});
$("#lock-button").addEventListener("click",()=>{sessionStorage.removeItem("familyDietAccess");sessionStorage.removeItem("familyDietPassword");location.reload()});

function openTab(name){
  $$(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===name));
  $$(".panel").forEach(p=>{const show=p.id===`${name}-panel`;p.hidden=!show;p.classList.toggle("active",show)});
  if(name==="today")renderToday();
  if(name==="history")renderHistory();
  scrollTo({top:0,behavior:"smooth"});
}
$$('.tab').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.tab)));

function localDateKey(date=new Date()){const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");return `${y}-${m}-${d}`}
function optionMarkup(choices,mealId,draft){
  return `<div class="options">${choices.map((text,i)=>`<button class="option ${draft[mealId]===i?'selected':''}" data-meal="${mealId}" data-choice="${i}" type="button"><span class="option-number">OPTION ${i+1}</span><span class="option-text">${escapeHtml(text)}</span></button>`).join("")}</div>`;
}
function renderToday(){
  const now=new Date(), dateKey=localDateKey(now), draft=drafts[dateKey]||{};
  $("#today-weekday").textContent=now.toLocaleDateString("en-GB",{weekday:"long"});
  $("#today-date").textContent=now.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
  const meals=[
    {id:"breakfast",...fixedMeals.breakfast},
    {id:"snack",...fixedMeals.snack},
    {id:"lunch",name:"Μεσημεριανό",time:"15:00",choices:linkedOptions.map(option=>option.lunch)},
    {id:"afternoon",...fixedMeals.afternoon},
    {id:"dinner",name:"Βραδινό",time:"21:00",choices:linkedOptions.map(option=>option.dinner)}
  ];
  const minutes=now.getHours()*60+now.getMinutes(), next=meals.findIndex(m=>{const [h,min]=m.time.split(':').map(Number);return h*60+min>minutes});
  $("#today-meals").innerHTML=meals.map((meal,i)=>{
    const linked=meal.name==="Μεσημεριανό"||meal.name==="Βραδινό";
    return `<article class="meal-card ${i===next?'next':''} ${linked?'linked-meal':''}"><div class="meal-time">${meal.time}${i===next?'<span class="next-label">NEXT MEAL</span>':''}</div><div class="meal-content"><div class="meal-title-row"><h3>${meal.name}</h3>${linked?'<span class="linked-label">LINKED OPTIONS</span>':''}</div>${optionMarkup(meal.choices,meal.id,draft)}</div></article>`;
  }).join("");
  $$('[data-meal]').forEach(button=>button.addEventListener('click',()=>selectMeal(dateKey,button.dataset.meal,Number(button.dataset.choice))));
  const saved=history[dateKey];
  $("#save-status").textContent=saved?"This date is saved. Change any option and press OK to update it.":"Select one option for every meal, then save your day.";
}

function selectMeal(dateKey,mealId,index){
  const draft=drafts[dateKey]||{};
  draft[mealId]=index;
  if(mealId==="lunch")draft.dinner=index;
  if(mealId==="dinner")draft.lunch=index;
  drafts[dateKey]=draft;
  save("dietDraftChoices",drafts);
  renderToday();
}
async function saveToday(){
  const dateKey=localDateKey(), draft=drafts[dateKey]||{}, required=["breakfast","snack","lunch","afternoon","dinner"];
  const missing=required.filter(key=>!Number.isInteger(draft[key]));
  if(missing.length){$("#save-status").textContent=`Please choose ${missing.length===1?"the remaining meal":`all ${missing.length} remaining meals`} before saving.`;return}
  history[dateKey]={...draft,savedAt:new Date().toISOString()};
  save("dietHistory",history);
  $("#save-day").disabled=true;
  try{
    const saved=await cloudRpc("save_diet_history",{access_password:dietPassword,selected_date:dateKey,selected_choices:history[dateKey]});
    if(saved!==true)throw Error();
    $("#save-status").textContent="Saved online. Today’s choices are available on your other browsers.";
  }catch{$("#save-status").textContent="Saved on this browser only. Run diet/supabase-schema.sql to enable online history."}
  $("#save-day").disabled=false;
}
async function loadCloudHistory(){
  $("#history-status").textContent="Loading online history…";
  try{
    const rows=await cloudRpc("list_diet_history",{access_password:dietPassword}), local={...history}, merged={};
    for(const row of rows)merged[row.meal_date]={...row.choices,savedAt:row.choices.savedAt||row.updated_at};
    for(const [date,entry] of Object.entries(local)){
      const remote=rows.find(row=>row.meal_date===date);
      if(!remote||new Date(entry.savedAt||0)>new Date(remote.updated_at)){
        merged[date]=entry;
        await cloudRpc("save_diet_history",{access_password:dietPassword,selected_date:date,selected_choices:entry});
      }
    }
    history=merged;save("dietHistory",history);renderHistory();renderToday();
    $("#history-status").textContent="Online history is up to date.";
  }catch{$("#history-status").textContent="Showing history from this browser. Run diet/supabase-schema.sql to enable online history."}
}
function renderHistory(){
  const dates=Object.keys(history).sort().reverse();
  $("#history-list").innerHTML=dates.map(date=>historyCard(date,history[date])).join("")||'<div class="history-empty">No saved days yet. Make your choices under Today and press OK.</div>';
  $$('[data-delete-history]').forEach(button=>button.addEventListener('click',async()=>{
    const date=button.dataset.deleteHistory;button.disabled=true;
    try{const removed=await cloudRpc("delete_diet_history",{access_password:dietPassword,selected_date:date});if(removed!==true)throw Error();delete history[date];save("dietHistory",history);renderHistory();$("#history-status").textContent="The saved day was deleted online."}
    catch{button.disabled=false;$("#history-status").textContent="The saved day could not be deleted online. Please run the latest Diet database script."}
  }));
}
function historyCard(date,entry){
  const items=[
    ["Πρωινό",fixedMeals.breakfast.choices[entry.breakfast],entry.breakfast],
    ["Δεκατιανό",fixedMeals.snack.choices[entry.snack],entry.snack],
    ["Μεσημεριανό",linkedOptions[entry.lunch]?.lunch,entry.lunch],
    ["Απογευματινό",fixedMeals.afternoon.choices[entry.afternoon],entry.afternoon],
    ["Βραδινό",linkedOptions[entry.dinner]?.dinner,entry.dinner]
  ];
  return `<article class="history-card"><header><div><p class="eyebrow">SAVED DAY</p><h3>${formatDate(date)}</h3></div><button type="button" data-delete-history="${date}">Delete</button></header><div>${items.map(([name,text,index])=>`<section><span>${name} · Option ${Number(index)+1}</span><p>${escapeHtml(text||"")}</p></section>`).join("")}</div></article>`;
}
function formatDate(value){const [year,month,day]=value.split("-").map(Number);return new Date(year,month-1,day).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function fruitGrid(items){return `<div class="fruit-grid">${items.map(([name,amount])=>`<div class="fruit"><b>${name}</b><span>${amount}</span></div>`).join('')}</div>`}
function renderPortions(){
  $("#portions-content").innerHTML=`<div class="portion-layout"><section class="portion-card"><h3>Fresh fruit</h3>${fruitGrid(fruits)}<p>When breakfast lists ½ fruit, use half of the stated portion. One fruit portion contains approximately 15 g of carbohydrates.</p></section><div><section class="portion-card"><h3>Dried fruit</h3>${fruitGrid(dried)}</section><section class="portion-card" style="margin-top:18px"><h3>Measurements</h3><div class="measure-list"><div class="measure"><b>Σπιρτόκουτο</b>A piece of cheese approximately the size of a matchbox.</div><div class="measure"><b>Παλάμη</b>The palm-sized measurement given in the original meal plan.</div><div class="measure"><b>κ.σ.</b>Tablespoon.</div><div class="measure"><b>κ.γ.</b>Teaspoon.</div></div></section></div></div>`;
}
function renderAll(){
  renderToday();renderHistory();renderPortions();
}
$("#save-day").addEventListener("click",saveToday);

const previewTab=new URLSearchParams(location.search).get("preview");
const storedPassword=sessionStorage.getItem("familyDietPassword")||"";
if((sessionStorage.getItem("familyDietAccess")==="yes"&&storedPassword) || (location.protocol==="file:" && previewTab)){
  if(location.protocol==="file:" && (previewTab==="selected"||previewTab==="history")){
    drafts[localDateKey()]={breakfast:0,snack:1,lunch:7,dinner:7,afternoon:3};
    if(previewTab==="history")history[localDateKey()]={...drafts[localDateKey()],savedAt:new Date().toISOString()};
  }
  unlock(storedPassword||"2004");
  if(previewTab==="history")openTab("history");
}
