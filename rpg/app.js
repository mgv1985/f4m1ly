const setupView=document.querySelector('#setupView');
const playView=document.querySelector('#playView');
const setupCanvas=document.querySelector('#setupCanvas');
const playCanvas=document.querySelector('#playCanvas');
const setupContext=setupCanvas.getContext('2d');
const playContext=playCanvas.getContext('2d');
const fogCanvas=document.createElement('canvas');
const fogContext=fogCanvas.getContext('2d');
const mapImage=new Image();
const tokens=[];
let mapReady=false,selectedToken=null,draggingToken=null,mode='setup';
const colors={hero:'#e5bf49',monster:'#c74b3e','monster-xl':'#77281f',npc:'#5a9b7b'};

function readFile(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});}
function loadImage(source){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=source;});}
function resizeForMap(){
 const scale=Math.min(1,2200/mapImage.naturalWidth,1600/mapImage.naturalHeight);
 const width=Math.max(1,Math.round(mapImage.naturalWidth*scale));
 const height=Math.max(1,Math.round(mapImage.naturalHeight*scale));
 for(const canvas of [setupCanvas,playCanvas,fogCanvas]){canvas.width=width;canvas.height=height;}
 fogContext.fillStyle='#000';fogContext.fillRect(0,0,width,height);
}
function pointFromEvent(canvas,event){const rect=canvas.getBoundingClientRect();return{x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};}
function tokenRadius(token){
 const base=Math.max(10,Math.min(setupCanvas.width,setupCanvas.height)*(Number(document.querySelector('#tokenSize').value)/200));
 return token?.type==='monster-xl'?base*2:base;
}
function visionRadius(){return Math.min(playCanvas.width,playCanvas.height)*(Number(document.querySelector('#visionRadius').value)/100);}
function drawToken(context,token,dim=false){
 const radius=tokenRadius(token);context.save();context.globalAlpha=dim ? .55 : 1;
 context.beginPath();context.arc(token.x,token.y,radius,0,Math.PI*2);context.clip();
 context.drawImage(token.image,token.x-radius,token.y-radius,radius*2,radius*2);context.restore();
 context.beginPath();context.arc(token.x,token.y,radius+2,0,Math.PI*2);context.strokeStyle=colors[token.type];context.lineWidth=Math.max(3,radius*.13);context.stroke();
}
function drawSetup(){
 setupContext.clearRect(0,0,setupCanvas.width,setupCanvas.height);
 if(!mapReady)return;
 setupContext.drawImage(mapImage,0,0,setupCanvas.width,setupCanvas.height);
 for(const token of tokens.filter(item=>item.placed))drawToken(setupContext,token);
}
function revealAt(token){
 if(token.type!=='hero')return;
 fogContext.save();fogContext.globalCompositeOperation='destination-out';
 const gradient=fogContext.createRadialGradient(token.x,token.y,visionRadius()*.68,token.x,token.y,visionRadius());
 gradient.addColorStop(0,'rgba(0,0,0,1)');gradient.addColorStop(1,'rgba(0,0,0,0)');
 fogContext.fillStyle=gradient;fogContext.beginPath();fogContext.arc(token.x,token.y,visionRadius(),0,Math.PI*2);fogContext.fill();fogContext.restore();
}
function tokenIsRevealed(token){
 if(token.type==='hero')return true;
 const x=Math.max(0,Math.min(fogCanvas.width-1,Math.round(token.x))),y=Math.max(0,Math.min(fogCanvas.height-1,Math.round(token.y)));
 return fogContext.getImageData(x,y,1,1).data[3]<110;
}
function drawPlay(){
 playContext.clearRect(0,0,playCanvas.width,playCanvas.height);
 playContext.drawImage(mapImage,0,0,playCanvas.width,playCanvas.height);
 playContext.drawImage(fogCanvas,0,0);
 for(const token of tokens.filter(item=>item.placed&&tokenIsRevealed(item)))drawToken(playContext,token);
}
function hitToken(point){return [...tokens].reverse().find(token=>token.placed&&Math.hypot(token.x-point.x,token.y-point.y)<=tokenRadius(token)*1.25);}
function renderLibrary(){
 const library=document.querySelector('#tokenLibrary');library.replaceChildren();
 if(!tokens.length){library.innerHTML='<p class="empty-library">Your tokens will appear here.</p>';return;}
 for(const token of tokens){
  const button=document.createElement('button');button.type='button';button.className=`token-entry${selectedToken===token.id?' active':''}${token.placed?' placed':''}`;
  button.innerHTML='<img alt=""><span></span><small></small>';button.querySelector('img').src=token.source;button.querySelector('img').alt='';button.querySelector('span').textContent=token.name;button.querySelector('small').textContent=token.placed?'Placed':token.type;
  button.onclick=()=>{selectedToken=token.id;renderLibrary();};library.append(button);
 }
}
function updateReady(){
 const ready=mapReady&&tokens.some(token=>token.type==='hero'&&token.placed);
 document.querySelector('#readyButton').disabled=!ready;
 document.querySelector('#readyMessage').textContent=ready?'Your table is ready.':'Add a map and place at least one hero.';
}
document.querySelector('#mapInput').addEventListener('change',async event=>{
 const file=event.target.files[0];if(!file)return;
 try{mapImage.src=await readFile(file);await mapImage.decode();mapReady=true;tokens.forEach(token=>token.placed=false);resizeForMap();drawSetup();document.querySelector('#canvasPlaceholder').hidden=true;document.querySelector('#mapStatus').textContent=file.name;renderLibrary();updateReady();}catch{document.querySelector('#mapStatus').textContent='This image could not be opened';}
});
document.querySelectorAll('[data-token-input]').forEach(input=>input.addEventListener('change',async event=>{
 for(const file of event.target.files){
  try{const source=await readFile(file),image=await loadImage(source);tokens.push({id:crypto.randomUUID(),type:input.dataset.tokenInput,name:file.name.replace(/\.[^.]+$/,''),source,image,x:0,y:0,placed:false});}catch{}
 }
 event.target.value='';renderLibrary();updateReady();
}));
function pointerDown(canvas,event){
 if(!mapReady)return;event.preventDefault();const point=pointFromEvent(canvas,event),hit=hitToken(point);
 if(hit){draggingToken=hit;canvas.setPointerCapture(event.pointerId);return;}
 if(mode==='setup'&&selectedToken){const token=tokens.find(item=>item.id===selectedToken);if(token){token.x=point.x;token.y=point.y;token.placed=true;selectedToken=null;drawSetup();renderLibrary();updateReady();}}
}
function pointerMove(canvas,event){
 if(!draggingToken)return;event.preventDefault();const point=pointFromEvent(canvas,event),radius=tokenRadius(draggingToken);
 draggingToken.x=Math.max(radius,Math.min(canvas.width-radius,point.x));draggingToken.y=Math.max(radius,Math.min(canvas.height-radius,point.y));
 if(mode==='play'){revealAt(draggingToken);drawPlay();}else drawSetup();
}
function pointerUp(canvas,event){if(!draggingToken)return;pointerMove(canvas,event);draggingToken=null;try{canvas.releasePointerCapture(event.pointerId);}catch{}updateReady();}
for(const canvas of [setupCanvas,playCanvas]){canvas.addEventListener('pointerdown',event=>pointerDown(canvas,event));canvas.addEventListener('pointermove',event=>pointerMove(canvas,event));canvas.addEventListener('pointerup',event=>pointerUp(canvas,event));canvas.addEventListener('pointercancel',()=>draggingToken=null);}
document.querySelector('#visionRadius').addEventListener('input',event=>{document.querySelector('#visionValue').textContent=`${event.target.value}%`;});
document.querySelector('#tokenSize').addEventListener('input',event=>{document.querySelector('#tokenSizeValue').textContent=`${event.target.value}%`;if(mode==='play')drawPlay();else drawSetup();});
document.querySelector('#readyButton').addEventListener('click',()=>{
 if(!mapReady||!tokens.some(token=>token.type==='hero'&&token.placed))return;
 mode='play';setupView.hidden=true;playView.hidden=false;document.body.classList.add('playing');
 fogContext.globalCompositeOperation='source-over';fogContext.fillStyle='#000';fogContext.fillRect(0,0,fogCanvas.width,fogCanvas.height);
 tokens.filter(token=>token.placed&&token.type==='hero').forEach(revealAt);drawPlay();window.scrollTo(0,0);
});
document.querySelector('#resetFogButton').addEventListener('click',()=>{fogContext.globalCompositeOperation='source-over';fogContext.fillStyle='#000';fogContext.fillRect(0,0,fogCanvas.width,fogCanvas.height);tokens.filter(token=>token.placed&&token.type==='hero').forEach(revealAt);drawPlay();});
document.querySelector('#returnButton').addEventListener('click',()=>{mode='setup';playView.hidden=true;setupView.hidden=false;document.body.classList.remove('playing');drawSetup();window.scrollTo(0,0);});
document.querySelector('#fullscreenButton').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await document.querySelector('#playCanvasWrap').requestFullscreen();else await document.exitFullscreen();}catch{}});
document.documentElement.dataset.rpgReady='true';
